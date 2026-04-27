<?php

declare(strict_types=1);

class StudentController
{
    /** GET /student/me */
    public static function me(): void
    {
        $payload = require_auth();
        $id      = (int) $payload['sub'];

        $stmt = db()->prepare(
            'SELECT s.id, s.student_code, s.first_name, s.last_name, s.email,
                    s.photo_url, g.label AS grade_label
             FROM   students s
             JOIN   grades   g ON g.id = s.grade_id
             WHERE  s.id = ?'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) {
            error_out('Student not found', 404);
        }

        json_out([
            'id'          => $row['id'],
            'studentCode' => $row['student_code'],
            'firstName'   => $row['first_name'],
            'lastName'    => $row['last_name'],
            'email'       => $row['email'],
            'gradeLabel'  => $row['grade_label'],
            'photoUrl'    => $row['photo_url'],
        ]);
    }

    /** GET /student/me/attendance?month=2026-04 */
    public static function attendance(): void
    {
        $payload = require_auth();
        $id      = (int) $payload['sub'];
        $month   = $_GET['month'] ?? date('Y-m');

        // Validate month format
        if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
            error_out('Invalid month format. Use YYYY-MM.');
        }

        $stmt = db()->prepare(
            "SELECT ar.id,
                    ar.record_date                          AS recordDate,
                    TIME_FORMAT(ar.check_in_time, '%H:%i') AS checkInTime,
                    TIME_FORMAT(ar.check_out_time,'%H:%i') AS checkOutTime,
                    ar.status,
                    ar.method,
                    ar.confidence,
                    gz.name                                 AS locationLabel,
                    c.name                                  AS courseName
             FROM   attendance_records ar
             LEFT JOIN geofence_zones gz ON gz.id = ar.geofence_id
             LEFT JOIN course_sessions cs ON cs.id = ar.session_id
             LEFT JOIN courses          c  ON c.id  = cs.course_id
             WHERE  ar.student_id = ?
               AND  DATE_FORMAT(ar.record_date, '%Y-%m') = ?
             ORDER  BY ar.record_date DESC, ar.check_in_time DESC"
        );
        $stmt->execute([$id, $month]);

        json_out(array_map(fn($r) => [
            'id'            => (int) $r['id'],
            'recordDate'    => $r['recordDate'],
            'checkInTime'   => $r['checkInTime'],
            'checkOutTime'  => $r['checkOutTime'],
            'status'        => $r['status'],
            'method'        => $r['method'],
            'confidence'    => $r['confidence'] !== null ? (float) $r['confidence'] : null,
            'locationLabel' => $r['locationLabel'],
            'courseName'    => $r['courseName'],
        ], $stmt->fetchAll()));
    }

    /** GET /student/me/schedule?date=2026-04-26 */
    public static function schedule(): void
    {
        $payload = require_auth();
        $id      = (int) $payload['sub'];
        $date    = $_GET['date'] ?? date('Y-m-d');

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            error_out('Invalid date format. Use YYYY-MM-DD.');
        }

        $stmt = db()->prepare(
            "SELECT cs.id,
                    c.code                                   AS courseCode,
                    c.name                                   AS courseName,
                    CONCAT(u.first_name,' ',u.last_name)     AS teacher,
                    r.name                                   AS room,
                    TIME_FORMAT(cs.start_time, '%H:%i')      AS startTime,
                    TIME_FORMAT(cs.end_time,   '%H:%i')      AS endTime,
                    cs.session_date                          AS date,
                    CASE
                      WHEN cs.start_time < CURTIME() AND cs.end_time > CURTIME() THEN 'next'
                      WHEN cs.end_time   < CURTIME()                              THEN 'done'
                      ELSE 'upcoming'
                    END                                      AS sessionStatus,
                    ar.status                                AS attendanceStatus
             FROM   course_sessions  cs
             JOIN   course_enrollments ce ON ce.course_id = cs.course_id AND ce.student_id = ?
             JOIN   courses           c  ON c.id  = cs.course_id
             LEFT JOIN users          u  ON u.id  = c.teacher_id
             LEFT JOIN rooms          r  ON r.id  = cs.room_id
             LEFT JOIN attendance_records ar
                    ON ar.session_id = cs.id AND ar.student_id = ?
             WHERE  cs.session_date = ?
             ORDER  BY cs.start_time"
        );
        $stmt->execute([$id, $id, $date]);

        json_out(array_map(fn($r) => [
            'id'               => (int) $r['id'],
            'courseCode'       => $r['courseCode'],
            'courseName'       => $r['courseName'],
            'teacher'          => $r['teacher'],
            'room'             => $r['room'],
            'startTime'        => $r['startTime'],
            'endTime'          => $r['endTime'],
            'date'             => $r['date'],
            'sessionStatus'    => $r['sessionStatus'],
            'attendanceStatus' => $r['attendanceStatus'],
        ], $stmt->fetchAll()));
    }

    /** GET /student/me/term-rate */
    public static function termRate(): void
    {
        $payload = require_auth();
        $id      = (int) $payload['sub'];

        // Count school days with sessions for this student
        $stmt = db()->prepare(
            "SELECT
                COUNT(DISTINCT cs.session_date)                    AS total,
                COUNT(DISTINCT CASE WHEN ar.status IN ('present','late') THEN cs.session_date END) AS attended
             FROM   course_sessions    cs
             JOIN   course_enrollments ce ON ce.course_id = cs.course_id AND ce.student_id = ?
             LEFT JOIN attendance_records ar ON ar.session_id = cs.id AND ar.student_id = ?
             WHERE  cs.session_date <= CURDATE()
               AND  cs.session_date >= DATE_FORMAT(CURDATE(), '%Y-01-01')"
        );
        $stmt->execute([$id, $id]);
        $row = $stmt->fetch();

        $total    = (int) ($row['total']    ?? 0);
        $attended = (int) ($row['attended'] ?? 0);
        $rate     = $total > 0 ? round($attended / $total * 100) : 0;

        json_out(['rate' => $rate, 'attended' => $attended, 'total' => $total]);
    }

    /** GET /student/me/leave-requests */
    public static function leaveRequests(): void
    {
        $payload = require_auth();
        $id      = (int) $payload['sub'];

        $stmt = db()->prepare(
            'SELECT id, date_from AS dateFrom, date_to AS dateTo,
                    reason, type, status, submitted_at AS submittedAt
             FROM   leave_requests
             WHERE  student_id = ?
             ORDER  BY submitted_at DESC
             LIMIT  50'
        );
        $stmt->execute([$id]);

        json_out(array_map(fn($r) => [
            'id'          => (int) $r['id'],
            'dateFrom'    => $r['dateFrom'],
            'dateTo'      => $r['dateTo'],
            'reason'      => $r['reason'],
            'type'        => $r['type'],
            'status'      => $r['status'],
            'submittedAt' => $r['submittedAt'],
        ], $stmt->fetchAll()));
    }

    /** POST /student/me/leave-requests */
    public static function submitLeave(): void
    {
        $payload  = require_auth();
        $id       = (int) $payload['sub'];
        $schoolId = (int) $payload['school_id'];
        $body     = body();
        $dateFrom = (string) required_field($body, 'dateFrom');
        $dateTo   = (string) required_field($body, 'dateTo');
        $reason   = (string) required_field($body, 'reason');

        // Normalise type to match ENUM ('medical','family','school_event','personal','other')
        $typeMap  = ['medical' => 'medical', 'family' => 'family', 'school_event' => 'school_event',
                     'personal' => 'personal', 'other' => 'other'];
        $typeRaw  = strtolower(str_replace(' ', '_', (string) ($body['type'] ?? 'personal')));
        $type     = $typeMap[$typeRaw] ?? 'other';

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateFrom) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateTo)) {
            error_out('Invalid date format. Use YYYY-MM-DD.');
        }

        $pdo  = db();
        $stmt = $pdo->prepare(
            'INSERT INTO leave_requests (school_id, student_id, date_from, date_to, reason, type, status)
             VALUES (?, ?, ?, ?, ?, ?, "pending")'
        );
        $stmt->execute([$schoolId, $id, $dateFrom, $dateTo, $reason, $type]);
        $newId = (int) $pdo->lastInsertId();

        json_out([
            'id'          => $newId,
            'dateFrom'    => $dateFrom,
            'dateTo'      => $dateTo,
            'reason'      => $reason,
            'type'        => $type,
            'status'      => 'pending',
            'submittedAt' => date('Y-m-d H:i:s'),
        ], 201);
    }
}
