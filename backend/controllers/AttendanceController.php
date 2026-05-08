<?php

declare(strict_types=1);

class AttendanceController
{
    /** POST /attendance/check-in */
    public static function checkIn(): void
    {
        $payload  = require_student();
        $sid      = (int) $payload['sub'];
        $schoolId = (int) $payload['school_id'];
        $body     = body();

        $method      = (string) required_field($body, 'method');
        $deviceUuid  = (string) required_field($body, 'deviceUuid');
        $capturedAt  = (string) required_field($body, 'capturedAt');

        if (!in_array($method, ['face', 'pin'], true)) {
            error_out('method must be "face" or "pin"');
        }
        if (!preg_match('/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/', $capturedAt)) {
            error_out('Invalid capturedAt format. Use YYYY-MM-DDTHH:MM:SS.');
        }

        $deviceUuid = substr(preg_replace('/[^a-zA-Z0-9\-]/', '', $deviceUuid), 0, 64);
        if ($deviceUuid === '') {
            error_out('Invalid deviceUuid');
        }

        $capturedTs = strtotime($capturedAt);
        if ($capturedTs === false || $capturedTs > time() + 900 || $capturedTs < time() - 86400) {
            error_out('capturedAt timestamp is out of acceptable range.');
        }

        $confidence   = isset($body['confidence'])        ? (float) $body['confidence']        : null;
        $lat          = isset($body['locationLat'])        ? (float) $body['locationLat']        : null;
        $lng          = isset($body['locationLng'])        ? (float) $body['locationLng']        : null;
        $geofenceId   = isset($body['geofenceId'])         ? (int)   $body['geofenceId']         : null;
        $distanceM    = isset($body['distanceM'])          ? (float) $body['distanceM']          : null;

        if ($confidence !== null) {
            $confidence = max(0.0, min(1.0, $confidence));
        }

        $pdo = db();

        // Use the school's configured timezone so "today" is correct regardless of server location
        $tz    = new \DateTimeZone($payload['school_timezone'] ?? 'UTC');
        $today = (new \DateTime('now', $tz))->format('Y-m-d');

        $sessionStmt = $pdo->prepare(
            "SELECT cs.id
             FROM   course_sessions    cs
             JOIN   course_enrollments ce ON ce.course_id = cs.course_id AND ce.student_id = ?
             WHERE  cs.session_date = ?
               AND  cs.start_time  <= TIME(NOW())
               AND  cs.end_time    >= TIME(NOW())
             LIMIT  1"
        );
        $sessionStmt->execute([$sid, $today]);
        $session   = $sessionStmt->fetch();
        $sessionId = $session ? (int) $session['id'] : null;

        $dupStmt = $pdo->prepare(
            'SELECT id FROM attendance_records
             WHERE student_id = ? AND record_date = ?
               AND (session_id = ? OR session_id IS NULL)
             LIMIT 1'
        );
        $dupStmt->execute([$sid, $today, $sessionId]);
        if ($dupStmt->fetch()) {
            error_out('Already checked in for this session', 409);
        }

        $devStmt = $pdo->prepare('SELECT id FROM devices WHERE device_uuid = ? LIMIT 1');
        $devStmt->execute([$deviceUuid]);
        $device   = $devStmt->fetch();
        $deviceId = $device ? (int) $device['id'] : null;

        $status = 'present';
        if ($sessionId) {
            $lateStmt = $pdo->prepare(
                "SELECT TIMESTAMPDIFF(MINUTE, CONCAT(session_date,' ',start_time), ?) > 15 AS is_late
                 FROM course_sessions WHERE id = ?"
            );
            $lateStmt->execute([$capturedAt, $sessionId]);
            $lateRow = $lateStmt->fetch();
            if ($lateRow && $lateRow['is_late']) {
                $status = 'late';
            }
        }

        $insert = $pdo->prepare(
            'INSERT INTO attendance_records
               (school_id, student_id, session_id, record_date, check_in_time, status, method,
                confidence, location_lat, location_lng, geofence_id, distance_m,
                device_id, synced_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())'
        );
        $insert->execute([
            $schoolId, $sid, $sessionId, $today, $capturedAt,
            $status, $method, $confidence, $lat, $lng,
            $geofenceId, $distanceM, $deviceId,
        ]);

        json_out(['recordId' => (int) $pdo->lastInsertId(), 'status' => $status], 201);
    }

    /** POST /attendance/check-out */
    public static function checkOut(): void
    {
        $payload = require_student();
        $sid     = (int) $payload['sub'];
        $body    = body();

        $lat = isset($body['locationLat']) ? (float) $body['locationLat'] : null;
        $lng = isset($body['locationLng']) ? (float) $body['locationLng'] : null;

        $tz    = new \DateTimeZone($payload['school_timezone'] ?? 'UTC');
        $today = (new \DateTime('now', $tz))->format('Y-m-d');

        $stmt  = db()->prepare(
            'SELECT id FROM attendance_records
             WHERE student_id = ? AND record_date = ? AND check_out_time IS NULL
             ORDER  BY check_in_time DESC LIMIT 1'
        );
        $stmt->execute([$sid, $today]);
        $row = $stmt->fetch();

        if (!$row) {
            error_out('No open check-in found for today', 404);
        }

        db()->prepare(
            'UPDATE attendance_records
             SET check_out_time = NOW(),
                 location_lat   = COALESCE(?, location_lat),
                 location_lng   = COALESCE(?, location_lng)
             WHERE id = ?'
        )->execute([$lat, $lng, $row['id']]);

        json_out(['recordId' => (int) $row['id']]);
    }

    /** POST /attendance/sync — bulk offline queue sync from mobile */
    public static function sync(): void
    {
        $payload  = require_student();
        $sid      = (int) $payload['sub'];
        $schoolId = (int) $payload['school_id'];
        $body     = body();
        $events   = $body['events'] ?? [];

        if (!is_array($events)) {
            error_out('events must be an array');
        }

        $events = array_slice($events, 0, 500);

        $synced    = 0;
        $conflicts = 0;

        $pdo = db();
        $pdo->beginTransaction();

        try {
            $dupStmt = $pdo->prepare(
                'SELECT id FROM attendance_records WHERE student_id = ? AND record_date = ? LIMIT 1'
            );
            $insStmt = $pdo->prepare(
                'INSERT IGNORE INTO attendance_records
                   (school_id, student_id, record_date, check_in_time, status, method,
                    confidence, location_lat, location_lng, synced_at, is_offline_capture)
                 VALUES (?, ?, ?, ?, "present", ?, ?, ?, ?, NOW(), 1)'
            );

            foreach ($events as $ev) {
                $method     = $ev['method']      ?? 'face';
                $capturedAt = $ev['capturedAt']  ?? '';
                $confidence = isset($ev['confidence'])   ? (float) $ev['confidence']   : null;
                $lat        = isset($ev['locationLat'])  ? (float) $ev['locationLat']  : null;
                $lng        = isset($ev['locationLng'])  ? (float) $ev['locationLng']  : null;

                if (!$capturedAt
                    || !preg_match('/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/', $capturedAt)
                    || !in_array($method, ['face', 'pin'], true)
                ) {
                    $conflicts++;
                    continue;
                }

                if ($confidence !== null) {
                    $confidence = max(0.0, min(1.0, $confidence));
                }

                $date = substr($capturedAt, 0, 10);

                $dupStmt->execute([$sid, $date]);
                if ($dupStmt->fetch()) {
                    $synced++;
                    continue;
                }

                $insStmt->execute([$schoolId, $sid, $date, $capturedAt, $method, $confidence, $lat, $lng]);
                $synced++;
            }

            $pdo->commit();
        } catch (\Throwable) {
            $pdo->rollBack();
            error_out('Sync failed', 500);
        }

        json_out(['synced' => $synced, 'conflicts' => $conflicts]);
    }
}
