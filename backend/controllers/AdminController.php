<?php

declare(strict_types=1);

class AdminController
{
    /** GET /admin/dashboard */
    public static function dashboard(): void
    {
        $user  = require_admin();
        $sid   = (int) ($user['school_id'] ?? 1);
        $today = date('Y-m-d');

        $pdo = db();

        $totalStmt = $pdo->prepare('SELECT COUNT(*) FROM students WHERE is_active = 1 AND school_id = ?');
        $totalStmt->execute([$sid]);
        $total = (int) $totalStmt->fetchColumn();

        $presentStmt = $pdo->prepare(
            "SELECT COUNT(DISTINCT student_id) AS n FROM attendance_records
             WHERE record_date = ? AND status IN ('present','late') AND school_id = ?"
        );
        $presentStmt->execute([$today, $sid]);
        $present = (int) $presentStmt->fetchColumn();

        $lateStmt = $pdo->prepare(
            "SELECT COUNT(*) AS n FROM attendance_records WHERE record_date = ? AND status = 'late' AND school_id = ?"
        );
        $lateStmt->execute([$today, $sid]);
        $late = (int) $lateStmt->fetchColumn();

        $absentStmt = $pdo->prepare(
            "SELECT COUNT(*) AS n FROM attendance_records WHERE record_date = ? AND status = 'absent' AND school_id = ?"
        );
        $absentStmt->execute([$today, $sid]);
        $absent = (int) $absentStmt->fetchColumn();

        // Recent check-ins
        $recentStmt = $pdo->prepare(
            "SELECT ar.id, CONCAT(s.first_name,' ',s.last_name) AS name,
                    s.student_code AS studentCode, g.label AS grade,
                    TIME_FORMAT(ar.check_in_time,'%H:%i') AS time,
                    ar.status, ar.method, ar.confidence AS conf,
                    c.name AS course
             FROM   attendance_records ar
             JOIN   students s ON s.id = ar.student_id
             JOIN   grades   g ON g.id = s.grade_id
             LEFT JOIN course_sessions cs ON cs.id = ar.session_id
             LEFT JOIN courses          c  ON c.id  = cs.course_id
             WHERE  ar.record_date = ? AND ar.school_id = ?
             ORDER  BY ar.check_in_time DESC
             LIMIT  20"
        );
        $recentStmt->execute([$today, $sid]);
        $recent = $recentStmt->fetchAll();

        // 7-day attendance bars
        $barStmt = $pdo->prepare(
            "SELECT record_date AS d,
                    ROUND(COUNT(DISTINCT CASE WHEN status IN ('present','late') THEN student_id END)
                          / NULLIF((SELECT COUNT(*) FROM students WHERE is_active = 1 AND school_id = ?), 0) * 100) AS v
             FROM   attendance_records
             WHERE  record_date BETWEEN DATE_SUB(?, INTERVAL 6 DAY) AND ?
               AND  school_id = ?
             GROUP  BY record_date
             ORDER  BY record_date"
        );
        $barStmt->execute([$sid, $today, $today, $sid]);
        $barMap = [];
        foreach ($barStmt->fetchAll() as $b) {
            $barMap[$b['d']] = (int) $b['v'];
        }
        $weekBars = [];
        for ($i = 6; $i >= 0; $i--) {
            $d   = date('Y-m-d', strtotime("-{$i} days", strtotime($today)));
            $dow = date('D', strtotime($d));
            $weekBars[] = ['d' => $dow, 'v' => $barMap[$d] ?? 0, 'off' => !isset($barMap[$d])];
        }

        // Per-grade current-day breakdown
        $gradeStmt = $pdo->prepare(
            "SELECT g.label AS grade,
                    COUNT(DISTINCT s.id) AS total,
                    COUNT(DISTINCT CASE WHEN ar.status IN ('present','late') THEN ar.student_id END) AS present
             FROM   grades g
             JOIN   students s ON s.grade_id = g.id AND s.is_active = 1
             LEFT JOIN attendance_records ar ON ar.student_id = s.id AND ar.record_date = ?
             GROUP  BY g.id, g.label
             ORDER  BY g.label"
        );
        $gradeStmt->execute([$today]);
        $byGrade = $gradeStmt->fetchAll();

        json_out([
            'date'     => $today,
            'stats'    => [
                'total'   => $total,
                'present' => $present,
                'late'    => $late,
                'absent'  => $absent,
                'rate'    => $total > 0 ? round($present / $total * 100, 1) : 0,
            ],
            'recent'   => $recent,
            'weekBars' => $weekBars,
            'byGrade'  => $byGrade,
        ]);
    }

    /** GET /admin/students?grade=&search=&page= */
    public static function students(): void
    {
        $user     = require_admin();
        $schoolId = (int) ($user['school_id'] ?? 1);
        $grade    = $_GET['grade']  ?? '';
        $search   = $_GET['search'] ?? '';
        $page     = max(1, (int) ($_GET['page'] ?? 1));
        $limit    = 50;
        $offset   = ($page - 1) * $limit;

        $where  = ['s.is_active = 1', 's.school_id = ?'];
        $params = [$schoolId];

        if ($grade !== '') {
            $where[]  = 'g.label = ?';
            $params[] = $grade;
        }
        if ($search !== '') {
            $where[]  = "(CONCAT(s.first_name,' ',s.last_name) LIKE ? OR s.student_code LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        $whereStr = implode(' AND ', $where);

        $countStmt = db()->prepare(
            "SELECT COUNT(*) FROM students s JOIN grades g ON g.id = s.grade_id WHERE {$whereStr}"
        );
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $stmt = db()->prepare(
            "SELECT s.id, s.student_code AS studentCode,
                    s.first_name AS firstName, s.last_name AS lastName,
                    CONCAT(s.first_name,' ',s.last_name) AS name,
                    g.label AS grade, s.email,
                    COALESCE(v.rate, 0) AS attendanceRate
             FROM   students s
             JOIN   grades g ON g.id = s.grade_id
             LEFT JOIN v_student_attendance_rate v ON v.student_id = s.id
             WHERE  {$whereStr}
             ORDER  BY s.last_name, s.first_name
             LIMIT  {$limit} OFFSET {$offset}"
        );
        $stmt->execute($params);

        json_out([
            'data'  => $stmt->fetchAll(),
            'total' => $total,
            'page'  => $page,
            'pages' => (int) ceil($total / $limit),
        ]);
    }

    /** GET /admin/students/:id */
    public static function studentDetail(string $id): void
    {
        $user     = require_admin();
        $schoolId = (int) ($user['school_id'] ?? 1);
        $sid      = (int) $id;
        $pdo      = db();

        $stmt = $pdo->prepare(
            "SELECT s.id, s.student_code AS studentCode,
                    s.first_name AS firstName, s.last_name AS lastName,
                    CONCAT(s.first_name,' ',s.last_name) AS name,
                    g.label AS grade, s.email,
                    s.enrolled_at AS enrolledAt,
                    COALESCE(v.rate, 0) AS attendanceRate
             FROM   students s
             JOIN   grades g ON g.id = s.grade_id
             LEFT JOIN v_student_attendance_rate v ON v.student_id = s.id
             WHERE  s.id = ? AND s.school_id = ? AND s.is_active = 1"
        );
        $stmt->execute([$sid, $schoolId]);
        $student = $stmt->fetch();
        if (!$student) error_out('Student not found', 404);

        $recStmt = $pdo->prepare(
            "SELECT ar.record_date AS date,
                    TIME_FORMAT(ar.check_in_time, '%H:%i') AS time,
                    ar.status, ar.method, ar.confidence AS conf
             FROM   attendance_records ar
             WHERE  ar.student_id = ?
             ORDER  BY ar.record_date DESC, ar.check_in_time DESC
             LIMIT  20"
        );
        $recStmt->execute([$sid]);

        json_out(['student' => $student, 'records' => $recStmt->fetchAll()]);
    }

    /** GET /admin/attendance?date=&grade=&status= */
    public static function attendance(): void
    {
        $user   = require_admin();
        $sid    = (int) ($user['school_id'] ?? 1);
        $date   = $_GET['date']   ?? date('Y-m-d');
        $grade  = $_GET['grade']  ?? '';
        $status = $_GET['status'] ?? '';

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            error_out('Invalid date format. Use YYYY-MM-DD.');
        }
        if ($status !== '' && !in_array($status, ['present', 'late', 'absent', 'excused'], true)) {
            error_out('Invalid status.');
        }

        $where  = ['ar.record_date = ?', 'ar.school_id = ?'];
        $params = [$date, $sid];

        if ($grade !== '') {
            $where[]  = 'g.label = ?';
            $params[] = $grade;
        }
        if ($status !== '') {
            $where[]  = 'ar.status = ?';
            $params[] = $status;
        }

        $whereStr = implode(' AND ', $where);

        $stmt = db()->prepare(
            "SELECT ar.id,
                    CONCAT(s.first_name,' ',s.last_name)     AS name,
                    s.first_name                             AS firstName,
                    s.last_name                              AS lastName,
                    s.student_code                           AS studentCode,
                    g.label                                  AS grade,
                    TIME_FORMAT(ar.check_in_time,  '%H:%i')  AS time,
                    TIME_FORMAT(ar.check_out_time, '%H:%i')  AS checkOut,
                    ar.status, ar.method,
                    ar.confidence                            AS conf,
                    gz.name                                  AS location,
                    cam.label                                AS camera
             FROM   attendance_records ar
             JOIN   students    s   ON s.id  = ar.student_id
             JOIN   grades      g   ON g.id  = s.grade_id
             LEFT JOIN geofence_zones gz  ON gz.id  = ar.geofence_id
             LEFT JOIN cameras       cam ON cam.id  = ar.camera_id
             WHERE  {$whereStr}
             ORDER  BY ar.check_in_time DESC
             LIMIT  500"
        );
        $stmt->execute($params);
        json_out($stmt->fetchAll());
    }

    /** GET /admin/leave-requests?status= */
    public static function leaveRequests(): void
    {
        $user   = require_admin();
        $sid    = (int) ($user['school_id'] ?? 1);
        $status = $_GET['status'] ?? 'pending';

        if (!in_array($status, ['pending', 'approved', 'declined'], true)) {
            error_out('Invalid status. Must be pending, approved, or declined.');
        }

        $stmt = db()->prepare(
            "SELECT lr.id,
                    CONCAT(s.first_name,' ',s.last_name) AS studentName,
                    s.student_code                       AS studentCode,
                    g.label                              AS grade,
                    lr.date_from AS dateFrom,
                    lr.date_to   AS dateTo,
                    lr.reason, lr.type, lr.status,
                    lr.submitted_at AS submittedAt
             FROM   leave_requests lr
             JOIN   students s ON s.id = lr.student_id
             JOIN   grades   g ON g.id = s.grade_id
             WHERE  lr.status = ? AND lr.school_id = ?
             ORDER  BY lr.submitted_at DESC
             LIMIT  100"
        );
        $stmt->execute([$status, $sid]);
        json_out($stmt->fetchAll());
    }

    /** POST /admin/leave-requests/:id/approve */
    public static function approveLeave(string $id): void
    {
        $user = require_admin();
        $sid  = (int) ($user['school_id'] ?? 1);
        self::updateLeave((int) $id, 'approved', (int) $user['sub'], $sid);
    }

    /** POST /admin/leave-requests/:id/decline */
    public static function declineLeave(string $id): void
    {
        $user = require_admin();
        $sid  = (int) ($user['school_id'] ?? 1);
        self::updateLeave((int) $id, 'declined', (int) $user['sub'], $sid);
    }

    private static function updateLeave(int $id, string $status, int $reviewedBy, int $schoolId): void
    {
        $stmt = db()->prepare(
            'UPDATE leave_requests SET status = ?, reviewed_by = ?, reviewed_at = NOW()
             WHERE id = ? AND school_id = ?'
        );
        $stmt->execute([$status, $reviewedBy, $id, $schoolId]);
        if ($stmt->rowCount() === 0) {
            error_out('Leave request not found', 404);
        }
        json_out(['id' => $id, 'status' => $status]);
    }

    /** GET /admin/notifications?limit=50&type= */
    public static function notifications(): void
    {
        $user  = require_admin();
        $sid   = (int) ($user['school_id'] ?? 1);
        $limit = min(100, max(1, (int) ($_GET['limit'] ?? 50)));
        $type  = $_GET['type'] ?? '';

        $pdo   = db();
        $today = date('Y-m-d');

        $absentStmt = $pdo->prepare(
            "SELECT 'absent' AS type,
                    CONCAT(s.first_name,' ',s.last_name) AS who,
                    'marked absent today' AS text,
                    s.student_code AS studentCode,
                    ar.created_at AS ts
             FROM   attendance_records ar
             JOIN   students s ON s.id = ar.student_id
             WHERE  ar.status = 'absent' AND ar.record_date = ? AND ar.school_id = ?
             ORDER  BY ar.created_at DESC LIMIT 20"
        );
        $absentStmt->execute([$today, $sid]);

        $lateStmt = $pdo->prepare(
            "SELECT 'late' AS type,
                    CONCAT(s.first_name,' ',s.last_name) AS who,
                    CONCAT('arrived ',TIME_FORMAT(ar.check_in_time,'%H:%i'),' late') AS text,
                    s.student_code AS studentCode,
                    ar.check_in_time AS ts
             FROM   attendance_records ar
             JOIN   students s ON s.id = ar.student_id
             WHERE  ar.status = 'late' AND ar.record_date = ? AND ar.school_id = ?
             ORDER  BY ar.check_in_time DESC LIMIT 20"
        );
        $lateStmt->execute([$today, $sid]);

        $leaveStmt = $pdo->prepare(
            "SELECT 'leave' AS type,
                    CONCAT(s.first_name,' ',s.last_name) AS who,
                    CONCAT('submitted leave for ',DATE_FORMAT(lr.date_from,'%b %d')) AS text,
                    s.student_code AS studentCode,
                    lr.submitted_at AS ts
             FROM   leave_requests lr
             JOIN   students s ON s.id = lr.student_id
             WHERE  lr.status = 'pending' AND lr.school_id = ?
             ORDER  BY lr.submitted_at DESC LIMIT 20"
        );
        $leaveStmt->execute([$sid]);

        $camStmt = $pdo->prepare(
            "SELECT 'system' AS type,
                    CONCAT('Camera: ',label) AS who,
                    CONCAT(status,' detected') AS text,
                    NULL AS studentCode,
                    last_seen_at AS ts
             FROM   cameras
             WHERE  status != 'online' AND school_id = ?
             ORDER  BY last_seen_at DESC LIMIT 5"
        );
        $camStmt->execute([$sid]);

        $all = array_merge(
            $absentStmt->fetchAll(),
            $lateStmt->fetchAll(),
            $leaveStmt->fetchAll(),
            $camStmt->fetchAll()
        );

        usort($all, fn($a, $b) => strcmp((string) ($b['ts'] ?? ''), (string) ($a['ts'] ?? '')));

        if ($type !== '') {
            $all = array_values(array_filter($all, fn($n) => $n['type'] === $type));
        }

        json_out(array_slice($all, 0, $limit));
    }

    /** GET /admin/cameras */
    public static function cameras(): void
    {
        $user = require_admin();
        $sid  = (int) ($user['school_id'] ?? 1);
        $stmt = db()->prepare(
            "SELECT c.id, c.code, c.label, c.location, c.status,
                    c.quality_score AS quality, c.last_seen_at AS lastSeen,
                    r.name AS room
             FROM   cameras c
             LEFT JOIN rooms r ON r.id = c.room_id
             WHERE  c.school_id = ?
             ORDER  BY c.label"
        );
        $stmt->execute([$sid]);
        json_out($stmt->fetchAll());
    }

    /** GET /admin/grades */
    public static function grades(): void
    {
        $user = require_admin();
        $sid  = (int) ($user['school_id'] ?? 1);
        $stmt = db()->prepare(
            'SELECT id, label FROM grades WHERE is_active = 1 AND school_id = ? ORDER BY label'
        );
        $stmt->execute([$sid]);
        json_out($stmt->fetchAll());
    }

    /** POST /admin/students — enroll a new student */
    public static function enrollStudent(): void
    {
        $user     = require_admin();
        $schoolId = (int) ($user['school_id'] ?? 1);
        $body     = body();

        $firstName   = trim((string) required_field($body, 'firstName'));
        $lastName    = trim((string) required_field($body, 'lastName'));
        $studentCode = trim((string) required_field($body, 'studentCode'));
        $gradeLabel  = trim((string) required_field($body, 'gradeLabel'));
        $email       = trim((string) ($body['email'] ?? ''));

        $gStmt = db()->prepare(
            'SELECT id FROM grades WHERE label = ? AND school_id = ? LIMIT 1'
        );
        $gStmt->execute([$gradeLabel, $schoolId]);
        $grade = $gStmt->fetch();
        if (!$grade) {
            error_out('Grade not found', 404);
        }

        $dupStmt = db()->prepare(
            'SELECT id FROM students WHERE student_code = ? LIMIT 1'
        );
        $dupStmt->execute([$studentCode]);
        if ($dupStmt->fetch()) {
            error_out('Student code already exists', 409);
        }

        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            error_out('Invalid email address', 422);
        }

        // Generate a random 12-char temporary password; the student must change it on first login.
        $tempPassword = bin2hex(random_bytes(6)); // 12 hex chars
        $hash         = password_hash($tempPassword, PASSWORD_BCRYPT);

        db()->prepare(
            'INSERT INTO students
               (school_id, student_code, first_name, last_name, email,
                grade_id, password_hash, is_active, enrolled_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())'
        )->execute([
            $schoolId, $studentCode, $firstName, $lastName,
            $email !== '' ? $email : null,
            (int) $grade['id'], $hash,
        ]);

        json_out([
            'studentCode'     => $studentCode,
            'name'            => "{$firstName} {$lastName}",
            'grade'           => $gradeLabel,
            'tempPassword'    => $tempPassword, // shown once — student should change on first login
        ], 201);
    }

    /** GET /admin/settings/recognition */
    public static function recognitionSettings(): void
    {
        $user     = require_admin();
        $schoolId = (int) ($user['school_id'] ?? 1);

        $stmt = db()->prepare(
            'SELECT * FROM recognition_settings WHERE school_id = ? LIMIT 1'
        );
        $stmt->execute([$schoolId]);
        $row = $stmt->fetch();

        if (!$row) {
            json_out([
                'confidenceThreshold' => 96.0,
                'livenessDetection'   => true,
                'maskTolerance'       => true,
                'multiAngleTemplate'  => true,
                'autoRetrain'         => false,
                'anonymousMetrics'    => false,
            ]);
            return;
        }

        json_out([
            'confidenceThreshold' => (float) $row['confidence_threshold'],
            'livenessDetection'   => (bool)  $row['liveness_detection'],
            'maskTolerance'       => (bool)  $row['mask_tolerance'],
            'multiAngleTemplate'  => (bool)  $row['multi_angle_template'],
            'autoRetrain'         => (bool)  $row['auto_retrain'],
            'anonymousMetrics'    => (bool)  $row['anonymous_metrics'],
        ]);
    }

    /** PATCH /admin/settings/recognition */
    public static function saveRecognitionSettings(): void
    {
        $user     = require_admin();
        $schoolId = (int) ($user['school_id'] ?? 1);
        $body     = body();

        db()->prepare(
            'INSERT INTO recognition_settings
               (school_id, confidence_threshold, liveness_detection, mask_tolerance,
                multi_angle_template, auto_retrain, anonymous_metrics, updated_at)
             VALUES (?,?,?,?,?,?,?, NOW())
             ON DUPLICATE KEY UPDATE
               confidence_threshold = VALUES(confidence_threshold),
               liveness_detection   = VALUES(liveness_detection),
               mask_tolerance       = VALUES(mask_tolerance),
               multi_angle_template = VALUES(multi_angle_template),
               auto_retrain         = VALUES(auto_retrain),
               anonymous_metrics    = VALUES(anonymous_metrics),
               updated_at           = NOW()'
        )->execute([
            $schoolId,
            (float) ($body['confidenceThreshold'] ?? 96.0),
            (int)   ($body['livenessDetection']   ?? 1),
            (int)   ($body['maskTolerance']        ?? 1),
            (int)   ($body['multiAngleTemplate']   ?? 1),
            (int)   ($body['autoRetrain']          ?? 0),
            (int)   ($body['anonymousMetrics']     ?? 0),
        ]);

        json_out(['ok' => true]);
    }

    /** GET /admin/reports?month=2026-04 */
    public static function reports(): void
    {
        $user  = require_admin();
        $sid   = (int) ($user['school_id'] ?? 1);
        $month = $_GET['month'] ?? date('Y-m');

        if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
            error_out('Invalid month format. Use YYYY-MM.');
        }

        $pdo = db();

        // Daily trend
        $dailyStmt = $pdo->prepare(
            "SELECT ar.record_date AS date,
                    COUNT(DISTINCT ar.student_id)                                  AS present,
                    COUNT(DISTINCT CASE WHEN ar.status='late' THEN ar.student_id END) AS late,
                    (SELECT COUNT(*) FROM students WHERE is_active = 1 AND school_id = ?) AS enrolled
             FROM   attendance_records ar
             WHERE  DATE_FORMAT(ar.record_date, '%Y-%m') = ?
               AND  ar.status IN ('present','late')
               AND  ar.school_id = ?
             GROUP  BY ar.record_date
             ORDER  BY ar.record_date"
        );
        $dailyStmt->execute([$sid, $month, $sid]);
        $daily = $dailyStmt->fetchAll();

        // By course
        $courseStmt = $pdo->prepare(
            "SELECT c.name AS course, COUNT(DISTINCT ce.student_id) AS enrolled,
                    COUNT(DISTINCT CASE WHEN ar.status IN ('present','late') THEN ar.student_id END) AS attended,
                    COUNT(DISTINCT CASE WHEN ar.status = 'late'   THEN ar.id END) AS late,
                    COUNT(DISTINCT CASE WHEN ar.status = 'absent' THEN ar.id END) AS absent
             FROM   courses c
             JOIN   course_enrollments ce ON ce.course_id = c.id
             JOIN   course_sessions    cs ON cs.course_id = c.id
                    AND DATE_FORMAT(cs.session_date, '%Y-%m') = ?
             LEFT JOIN attendance_records ar ON ar.session_id = cs.id
             GROUP  BY c.id, c.name
             ORDER  BY c.name"
        );
        $courseStmt->execute([$month]);
        $courses = $courseStmt->fetchAll();

        json_out(['month' => $month, 'daily' => $daily, 'courses' => $courses]);
    }

    /** GET /admin/badge-counts */
    public static function badgeCounts(): void
    {
        $user  = require_admin();
        $sid   = (int) ($user['school_id'] ?? 1);
        $pdo   = db();
        $today = date('Y-m-d');

        $ciStmt = $pdo->prepare(
            "SELECT COUNT(DISTINCT student_id) FROM attendance_records
             WHERE record_date = ? AND status IN ('present','late') AND school_id = ?"
        );
        $ciStmt->execute([$today, $sid]);

        $lvStmt = $pdo->prepare(
            "SELECT COUNT(*) FROM leave_requests WHERE status = 'pending' AND school_id = ?"
        );
        $lvStmt->execute([$sid]);

        $totalStmt = $pdo->prepare("SELECT COUNT(*) FROM students WHERE is_active = 1 AND school_id = ?");
        $totalStmt->execute([$sid]);

        json_out([
            'todayCheckins' => (int) $ciStmt->fetchColumn(),
            'totalStudents' => (int) $totalStmt->fetchColumn(),
            'pendingLeave'  => (int) $lvStmt->fetchColumn(),
        ]);
    }

    /** GET /admin/teachers */
    public static function teachers(): void
    {
        $user = require_admin();
        $sid  = (int) ($user['school_id'] ?? 1);
        $stmt = db()->prepare(
            "SELECT id, CONCAT(first_name,' ',last_name) AS name, email
             FROM users WHERE school_id = ? AND role IN ('teacher','vice_principal','admin')
             AND is_active = 1 ORDER BY last_name, first_name"
        );
        $stmt->execute([$sid]);
        json_out($stmt->fetchAll());
    }

    /** GET /admin/departments */
    public static function departments(): void
    {
        $user = require_admin();
        $sid  = (int) ($user['school_id'] ?? 1);
        $stmt = db()->prepare(
            "SELECT d.id, d.name,
                    CONCAT(u.first_name,' ',u.last_name) AS head
             FROM departments d LEFT JOIN users u ON u.id = d.head_user_id
             WHERE d.school_id = ? ORDER BY d.name"
        );
        $stmt->execute([$sid]);
        json_out($stmt->fetchAll());
    }

    /** GET /admin/rooms */
    public static function rooms(): void
    {
        $user = require_admin();
        $sid  = (int) ($user['school_id'] ?? 1);
        $stmt = db()->prepare(
            "SELECT id, code, name, building, capacity
             FROM rooms WHERE school_id = ? ORDER BY name"
        );
        $stmt->execute([$sid]);
        json_out($stmt->fetchAll());
    }

    /** GET /admin/courses */
    public static function courses(): void
    {
        $user = require_admin();
        $sid  = (int) ($user['school_id'] ?? 1);
        $stmt = db()->prepare(
            "SELECT c.id, c.code, c.name, c.term, c.color_hue AS colorHue,
                    d.name AS department,
                    CONCAT(u.first_name,' ',u.last_name) AS teacher,
                    r.name AS room,
                    (SELECT COUNT(*) FROM course_enrollments ce
                     WHERE ce.course_id = c.id AND ce.dropped_at IS NULL) AS enrolled
             FROM courses c
             LEFT JOIN departments d ON d.id = c.department_id
             LEFT JOIN users u ON u.id = c.teacher_id
             LEFT JOIN rooms r ON r.id = c.room_id
             WHERE c.school_id = ? AND c.is_active = 1
             ORDER BY c.name"
        );
        $stmt->execute([$sid]);
        json_out($stmt->fetchAll());
    }

    /** POST /admin/courses */
    public static function createCourse(): void
    {
        $user  = require_admin();
        $sid   = (int) ($user['school_id'] ?? 1);
        $body  = body();

        $code      = trim((string) required_field($body, 'code'));
        $name      = trim((string) required_field($body, 'name'));
        $term      = trim((string) ($body['term']         ?? 'Current'));
        $deptId    = !empty($body['departmentId'])  ? (int) $body['departmentId']  : null;
        $teacherId = !empty($body['teacherId'])     ? (int) $body['teacherId']     : null;
        $roomId    = !empty($body['roomId'])        ? (int) $body['roomId']        : null;
        $colorHue  = isset($body['colorHue'])       ? (int) $body['colorHue']      : rand(0, 360);

        $dup = db()->prepare('SELECT id FROM courses WHERE code = ? AND school_id = ? LIMIT 1');
        $dup->execute([$code, $sid]);
        if ($dup->fetch()) error_out('Course code already exists', 409);

        db()->prepare(
            'INSERT INTO courses (school_id, code, name, department_id, teacher_id,
                                  room_id, term, color_hue, is_active)
             VALUES (?,?,?,?,?,?,?,?,1)'
        )->execute([$sid, $code, $name, $deptId, $teacherId, $roomId, $term, $colorHue]);

        json_out(['id' => (int) db()->lastInsertId(), 'code' => $code, 'name' => $name], 201);
    }

    /** GET /admin/offline-queue */
    public static function offlineQueue(): void
    {
        $user = require_admin();
        $sid  = (int) ($user['school_id'] ?? 1);
        $pdo  = db();

        $devStmt = $pdo->prepare(
            "SELECT device_label AS label, device_type AS type,
                    queued_count AS queued, oldest_event AS oldestEvent,
                    last_sync_at AS lastSync
             FROM v_offline_queue_summary WHERE school_id = ? ORDER BY queued_count DESC"
        );
        $devStmt->execute([$sid]);

        $qStmt = $pdo->prepare(
            "SELECT COUNT(*) FROM offline_queue WHERE school_id = ? AND status = 'queued'"
        );
        $qStmt->execute([$sid]);

        $onStmt = $pdo->prepare(
            "SELECT COUNT(*) FROM devices
             WHERE school_id = ? AND is_active = 1
               AND last_online_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)"
        );
        $onStmt->execute([$sid]);

        $logStmt = $pdo->prepare(
            "SELECT sl.id, d.label AS device, d.type AS deviceType,
                    sl.started_at AS startedAt, sl.completed_at AS completedAt,
                    sl.events_synced AS synced, sl.events_conflict AS conflicts, sl.status
             FROM sync_logs sl
             JOIN devices d ON d.id = sl.device_id
             WHERE d.school_id = ? ORDER BY sl.started_at DESC LIMIT 20"
        );
        $logStmt->execute([$sid]);

        json_out([
            'totalQueued'   => (int) $qStmt->fetchColumn(),
            'devicesOnline' => (int) $onStmt->fetchColumn(),
            'devices'       => $devStmt->fetchAll(),
            'recentSyncs'   => $logStmt->fetchAll(),
        ]);
    }

    /** GET /admin/notification-rules */
    public static function notificationRules(): void
    {
        $user = require_admin();
        $sid  = (int) ($user['school_id'] ?? 1);
        $stmt = db()->prepare(
            "SELECT id, event_type AS eventType, threshold,
                    notify_admin AS notifyAdmin,
                    notify_teacher AS notifyTeacher,
                    notify_guardian_email AS notifyGuardianEmail,
                    notify_guardian_sms AS notifyGuardianSms,
                    is_active AS isActive
             FROM notification_rules WHERE school_id = ? ORDER BY event_type"
        );
        $stmt->execute([$sid]);
        json_out($stmt->fetchAll());
    }

    /** PATCH /admin/notification-rules/:id */
    public static function updateNotificationRule(string $id): void
    {
        $user   = require_admin();
        $sid    = (int) ($user['school_id'] ?? 1);
        $body   = body();
        $ruleId = (int) $id;

        $map = [
            'notifyAdmin'         => 'notify_admin',
            'notifyTeacher'       => 'notify_teacher',
            'notifyGuardianEmail' => 'notify_guardian_email',
            'notifyGuardianSms'   => 'notify_guardian_sms',
            'isActive'            => 'is_active',
        ];
        $sets   = [];
        $params = [];

        foreach ($map as $jsKey => $dbCol) {
            if (array_key_exists($jsKey, $body)) {
                $sets[]   = "{$dbCol} = ?";
                $params[] = (int) (bool) $body[$jsKey];
            }
        }
        if (isset($body['threshold'])) {
            $sets[]   = 'threshold = ?';
            $params[] = (int) $body['threshold'];
        }
        if (empty($sets)) error_out('Nothing to update');

        $params[] = $ruleId;
        $params[] = $sid;
        db()->prepare(
            "UPDATE notification_rules SET " . implode(', ', $sets) .
            " WHERE id = ? AND school_id = ?"
        )->execute($params);

        json_out(['ok' => true]);
    }

    /** PATCH /admin/attendance/:id */
    public static function updateAttendance(string $id): void
    {
        $user     = require_admin();
        $sid      = (int) ($user['school_id'] ?? 1);
        $recId    = (int) $id;
        $body     = body();
        $status   = trim((string) ($body['status'] ?? ''));
        $notes    = trim((string) ($body['notes']  ?? ''));

        if (!in_array($status, ['present', 'late', 'absent', 'excused'], true)) {
            error_out('Invalid status. Must be present, late, absent, or excused.');
        }

        $stmt = db()->prepare(
            "UPDATE attendance_records
             SET status = ?, reviewed_by = ?, reviewed_at = NOW(), notes = ?
             WHERE id = ? AND school_id = ?"
        );
        $stmt->execute([$status, (int) $user['sub'], $notes ?: null, $recId, $sid]);

        if ($stmt->rowCount() === 0) {
            error_out('Attendance record not found', 404);
        }

        json_out(['id' => $recId, 'status' => $status]);
    }

    // ── Programs ─────────────────────────────────────────────────────────────

    /** GET /admin/programs */
    public static function programs(): void
    {
        $user = require_admin();
        $sid  = (int) ($user['school_id'] ?? 1);
        $stmt = db()->prepare(
            "SELECT p.id, p.code, p.name, p.description,
                    p.department_id AS departmentId, d.name AS department
             FROM programs p
             LEFT JOIN departments d ON d.id = p.department_id
             WHERE p.school_id = ? AND p.is_active = 1
             ORDER BY p.name"
        );
        $stmt->execute([$sid]);
        json_out($stmt->fetchAll());
    }

    /** POST /admin/programs */
    public static function createProgram(): void
    {
        $user  = require_admin();
        $sid   = (int) ($user['school_id'] ?? 1);
        $body  = body();

        $code  = trim((string) required_field($body, 'code'));
        $name  = trim((string) required_field($body, 'name'));
        $deptId = !empty($body['departmentId']) ? (int) $body['departmentId'] : null;
        $desc  = trim((string) ($body['description'] ?? ''));

        $dup = db()->prepare('SELECT id FROM programs WHERE code = ? AND school_id = ? LIMIT 1');
        $dup->execute([$code, $sid]);
        if ($dup->fetch()) error_out('Program code already exists', 409);

        db()->prepare(
            'INSERT INTO programs (school_id, code, name, department_id, description, is_active)
             VALUES (?, ?, ?, ?, ?, 1)'
        )->execute([$sid, $code, $name, $deptId, $desc ?: null]);

        json_out(['id' => (int) db()->lastInsertId(), 'code' => $code, 'name' => $name], 201);
    }

    /** PATCH /admin/programs/:id */
    public static function updateProgram(string $id): void
    {
        $user   = require_admin();
        $sid    = (int) ($user['school_id'] ?? 1);
        $progId = (int) $id;
        $body   = body();

        $sets = []; $params = [];
        if (isset($body['code']))  { $sets[] = 'code = ?';  $params[] = trim($body['code']); }
        if (isset($body['name']))  { $sets[] = 'name = ?';  $params[] = trim($body['name']); }
        if (array_key_exists('departmentId', $body)) {
            $sets[] = 'department_id = ?';
            $params[] = $body['departmentId'] ? (int) $body['departmentId'] : null;
        }
        if (array_key_exists('description', $body)) {
            $sets[] = 'description = ?';
            $params[] = trim($body['description']) ?: null;
        }
        if (empty($sets)) error_out('Nothing to update');

        $params[] = $progId; $params[] = $sid;
        db()->prepare("UPDATE programs SET " . implode(', ', $sets) . " WHERE id = ? AND school_id = ?")->execute($params);
        json_out(['ok' => true]);
    }

    /** DELETE /admin/programs/:id */
    public static function deleteProgram(string $id): void
    {
        $user   = require_admin();
        $sid    = (int) ($user['school_id'] ?? 1);
        db()->prepare("UPDATE programs SET is_active = 0 WHERE id = ? AND school_id = ?")->execute([(int) $id, $sid]);
        json_out(['ok' => true]);
    }

    // ── Curricula ─────────────────────────────────────────────────────────────

    /** GET /admin/curricula */
    public static function curricula(): void
    {
        $user = require_admin();
        $sid  = (int) ($user['school_id'] ?? 1);
        $stmt = db()->prepare(
            "SELECT c.id, c.code, c.name, c.year_implemented AS yearImplemented,
                    c.description, c.program_id AS programId, p.name AS program
             FROM curricula c
             LEFT JOIN programs p ON p.id = c.program_id
             WHERE c.school_id = ? AND c.is_active = 1
             ORDER BY c.name"
        );
        $stmt->execute([$sid]);
        json_out($stmt->fetchAll());
    }

    /** POST /admin/curricula */
    public static function createCurriculum(): void
    {
        $user = require_admin();
        $sid  = (int) ($user['school_id'] ?? 1);
        $body = body();

        $name   = trim((string) required_field($body, 'name'));
        $code   = trim((string) ($body['code'] ?? ''));
        $progId = !empty($body['programId'])      ? (int) $body['programId'] : null;
        $year   = trim((string) ($body['yearImplemented'] ?? ''));
        $desc   = trim((string) ($body['description'] ?? ''));

        db()->prepare(
            'INSERT INTO curricula (school_id, program_id, code, name, year_implemented, description, is_active)
             VALUES (?, ?, ?, ?, ?, ?, 1)'
        )->execute([$sid, $progId, $code ?: null, $name, $year ?: null, $desc ?: null]);

        json_out(['id' => (int) db()->lastInsertId(), 'name' => $name], 201);
    }

    /** PATCH /admin/curricula/:id */
    public static function updateCurriculum(string $id): void
    {
        $user   = require_admin();
        $sid    = (int) ($user['school_id'] ?? 1);
        $currId = (int) $id;
        $body   = body();

        $sets = []; $params = [];
        if (isset($body['name'])) { $sets[] = 'name = ?'; $params[] = trim($body['name']); }
        if (isset($body['code'])) { $sets[] = 'code = ?'; $params[] = trim($body['code']) ?: null; }
        if (array_key_exists('programId', $body)) {
            $sets[] = 'program_id = ?';
            $params[] = $body['programId'] ? (int) $body['programId'] : null;
        }
        if (array_key_exists('yearImplemented', $body)) {
            $sets[] = 'year_implemented = ?';
            $params[] = trim($body['yearImplemented']) ?: null;
        }
        if (array_key_exists('description', $body)) {
            $sets[] = 'description = ?';
            $params[] = trim($body['description']) ?: null;
        }
        if (empty($sets)) error_out('Nothing to update');

        $params[] = $currId; $params[] = $sid;
        db()->prepare("UPDATE curricula SET " . implode(', ', $sets) . " WHERE id = ? AND school_id = ?")->execute($params);
        json_out(['ok' => true]);
    }

    /** DELETE /admin/curricula/:id */
    public static function deleteCurriculum(string $id): void
    {
        $user = require_admin();
        $sid  = (int) ($user['school_id'] ?? 1);
        db()->prepare("UPDATE curricula SET is_active = 0 WHERE id = ? AND school_id = ?")->execute([(int) $id, $sid]);
        json_out(['ok' => true]);
    }

    // ── Sections ──────────────────────────────────────────────────────────────

    /** GET /admin/sections */
    public static function sections(): void
    {
        $user = require_admin();
        $sid  = (int) ($user['school_id'] ?? 1);
        $stmt = db()->prepare(
            "SELECT s.id, s.name, s.year_level AS yearLevel,
                    s.academic_year AS academicYear, s.max_students AS maxStudents,
                    s.curriculum_id AS curriculumId, s.adviser_id AS adviserId, s.room_id AS roomId,
                    cu.name AS curriculum,
                    CONCAT(u.first_name, ' ', u.last_name) AS adviser,
                    r.name AS room
             FROM sections s
             LEFT JOIN curricula cu ON cu.id = s.curriculum_id
             LEFT JOIN users u ON u.id = s.adviser_id
             LEFT JOIN rooms r ON r.id = s.room_id
             WHERE s.school_id = ? AND s.is_active = 1
             ORDER BY s.name"
        );
        $stmt->execute([$sid]);
        json_out($stmt->fetchAll());
    }

    /** POST /admin/sections */
    public static function createSection(): void
    {
        $user = require_admin();
        $sid  = (int) ($user['school_id'] ?? 1);
        $body = body();

        $name       = trim((string) required_field($body, 'name'));
        $currId     = !empty($body['curriculumId'])  ? (int) $body['curriculumId']  : null;
        $yearLevel  = !empty($body['yearLevel'])     ? (int) $body['yearLevel']     : null;
        $adviserId  = !empty($body['adviserId'])     ? (int) $body['adviserId']     : null;
        $roomId     = !empty($body['roomId'])        ? (int) $body['roomId']        : null;
        $maxStudents = !empty($body['maxStudents'])  ? (int) $body['maxStudents']   : null;
        $acYear     = trim((string) ($body['academicYear'] ?? ''));

        db()->prepare(
            'INSERT INTO sections (school_id, curriculum_id, name, year_level, adviser_id, room_id, max_students, academic_year, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)'
        )->execute([$sid, $currId, $name, $yearLevel, $adviserId, $roomId, $maxStudents, $acYear ?: null]);

        json_out(['id' => (int) db()->lastInsertId(), 'name' => $name], 201);
    }

    /** PATCH /admin/sections/:id */
    public static function updateSection(string $id): void
    {
        $user   = require_admin();
        $sid    = (int) ($user['school_id'] ?? 1);
        $sectId = (int) $id;
        $body   = body();

        $sets = []; $params = [];
        if (isset($body['name'])) { $sets[] = 'name = ?'; $params[] = trim($body['name']); }
        if (array_key_exists('curriculumId', $body))  { $sets[] = 'curriculum_id = ?'; $params[] = $body['curriculumId'] ? (int) $body['curriculumId'] : null; }
        if (array_key_exists('yearLevel', $body))     { $sets[] = 'year_level = ?';    $params[] = $body['yearLevel'] ? (int) $body['yearLevel'] : null; }
        if (array_key_exists('adviserId', $body))     { $sets[] = 'adviser_id = ?';    $params[] = $body['adviserId'] ? (int) $body['adviserId'] : null; }
        if (array_key_exists('roomId', $body))        { $sets[] = 'room_id = ?';       $params[] = $body['roomId'] ? (int) $body['roomId'] : null; }
        if (array_key_exists('maxStudents', $body))   { $sets[] = 'max_students = ?';  $params[] = $body['maxStudents'] ? (int) $body['maxStudents'] : null; }
        if (array_key_exists('academicYear', $body))  { $sets[] = 'academic_year = ?'; $params[] = trim($body['academicYear']) ?: null; }
        if (empty($sets)) error_out('Nothing to update');

        $params[] = $sectId; $params[] = $sid;
        db()->prepare("UPDATE sections SET " . implode(', ', $sets) . " WHERE id = ? AND school_id = ?")->execute($params);
        json_out(['ok' => true]);
    }

    /** DELETE /admin/sections/:id */
    public static function deleteSection(string $id): void
    {
        $user = require_admin();
        $sid  = (int) ($user['school_id'] ?? 1);
        db()->prepare("UPDATE sections SET is_active = 0 WHERE id = ? AND school_id = ?")->execute([(int) $id, $sid]);
        json_out(['ok' => true]);
    }

    // ── School Branding ───────────────────────────────────────────────────────

    /** GET /admin/school-info */
    public static function schoolInfo(): void
    {
        $user = require_admin();
        $sid  = (int) ($user['school_id'] ?? 1);
        $stmt = db()->prepare(
            "SELECT id, name,
                    COALESCE(short_name, '') AS shortName,
                    COALESCE(logo_url, '')   AS logoUrl,
                    COALESCE(favicon_url,'') AS faviconUrl,
                    COALESCE(address, '')    AS address,
                    timezone
             FROM schools WHERE id = ? LIMIT 1"
        );
        $stmt->execute([$sid]);
        json_out($stmt->fetch() ?: new \stdClass());
    }

    /** PATCH /admin/school-info */
    public static function updateSchoolInfo(): void
    {
        $user = require_admin();
        $sid  = (int) ($user['school_id'] ?? 1);
        $body = body();

        $map = [
            'name'       => 'name',
            'shortName'  => 'short_name',
            'logoUrl'    => 'logo_url',
            'faviconUrl' => 'favicon_url',
            'address'    => 'address',
            'timezone'   => 'timezone',
        ];
        $sets = []; $params = [];
        foreach ($map as $js => $col) {
            if (array_key_exists($js, $body)) {
                $sets[]   = "`{$col}` = ?";
                $params[] = trim((string) $body[$js]) ?: null;
            }
        }
        if (empty($sets)) error_out('Nothing to update');

        $params[] = $sid;
        db()->prepare("UPDATE schools SET " . implode(', ', $sets) . " WHERE id = ?")->execute($params);
        json_out(['ok' => true]);
    }

    /** POST /admin/upload-asset */
    public static function uploadAsset(): void
    {
        require_admin();

        if (empty($_FILES['file'])) error_out('No file provided', 400);

        $file = $_FILES['file'];

        if ($file['error'] !== UPLOAD_ERR_OK) error_out('Upload error', 400);
        if ($file['size'] > 2097152)          error_out('Max file size is 2 MB', 413);

        // Use finfo to detect the REAL MIME type — never trust the client-supplied value.
        $finfo    = new finfo(FILEINFO_MIME_TYPE);
        $realMime = $finfo->file($file['tmp_name']);

        $allowed = [
            'image/png'               => 'png',
            'image/jpeg'              => 'jpg',
            'image/gif'               => 'gif',
            'image/webp'              => 'webp',
            'image/x-icon'            => 'ico',
            'image/vnd.microsoft.icon'=> 'ico',
            // SVG is intentionally excluded — SVGs can embed JavaScript and are
            // dangerous to serve from the same origin. If needed, serve from a CDN.
        ];

        if (!isset($allowed[$realMime])) error_out('File type not allowed', 415);

        $uploadDir = __DIR__ . '/../uploads/';
        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0750, true)) {
                error_out('Could not create upload directory', 500);
            }
        }

        $filename = bin2hex(random_bytes(16)) . '.' . $allowed[$realMime];
        if (!move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
            error_out('Could not save file', 500);
        }

        $base = rtrim(env('APP_URL', ''), '/');
        json_out(['url' => "{$base}/uploads/{$filename}"], 201);
    }
}
