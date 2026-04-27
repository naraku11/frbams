<?php

declare(strict_types=1);

class AdminController
{
    /** GET /admin/dashboard */
    public static function dashboard(): void
    {
        require_admin();
        $today = date('Y-m-d');

        $pdo = db();

        $total    = (int) $pdo->query('SELECT COUNT(*) FROM students WHERE is_active = 1')->fetchColumn();

        $presentStmt = $pdo->prepare(
            "SELECT COUNT(DISTINCT student_id) AS n FROM attendance_records
             WHERE record_date = ? AND status IN ('present','late')"
        );
        $presentStmt->execute([$today]);
        $present = (int) $presentStmt->fetchColumn();

        $lateStmt = $pdo->prepare(
            "SELECT COUNT(*) AS n FROM attendance_records WHERE record_date = ? AND status = 'late'"
        );
        $lateStmt->execute([$today]);
        $late = (int) $lateStmt->fetchColumn();

        $absentStmt = $pdo->prepare(
            "SELECT COUNT(*) AS n FROM attendance_records WHERE record_date = ? AND status = 'absent'"
        );
        $absentStmt->execute([$today]);
        $absent = (int) $absentStmt->fetchColumn();

        // Recent check-ins
        $recentStmt = $pdo->prepare(
            "SELECT ar.id, CONCAT(s.first_name,' ',s.last_name) AS name,
                    s.student_code AS studentCode, g.label AS grade,
                    TIME_FORMAT(ar.check_in_time,'%H:%i') AS time,
                    ar.status, ar.method, ar.confidence,
                    c.name AS course
             FROM   attendance_records ar
             JOIN   students s ON s.id = ar.student_id
             JOIN   grades   g ON g.id = s.grade_id
             LEFT JOIN course_sessions cs ON cs.id = ar.session_id
             LEFT JOIN courses          c  ON c.id  = cs.course_id
             WHERE  ar.record_date = ?
             ORDER  BY ar.check_in_time DESC
             LIMIT  20"
        );
        $recentStmt->execute([$today]);
        $recent = $recentStmt->fetchAll();

        json_out([
            'date'    => $today,
            'stats'   => [
                'total'   => $total,
                'present' => $present,
                'late'    => $late,
                'absent'  => $absent,
                'rate'    => $total > 0 ? round($present / $total * 100, 1) : 0,
            ],
            'recent'  => $recent,
        ]);
    }

    /** GET /admin/students?grade=&search=&page= */
    public static function students(): void
    {
        require_admin();
        $grade  = $_GET['grade']  ?? '';
        $search = $_GET['search'] ?? '';
        $page   = max(1, (int) ($_GET['page'] ?? 1));
        $limit  = 50;
        $offset = ($page - 1) * $limit;

        $where  = ['s.is_active = 1'];
        $params = [];

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

    /** GET /admin/attendance?date=&grade=&status= */
    public static function attendance(): void
    {
        require_admin();
        $date   = $_GET['date']   ?? date('Y-m-d');
        $grade  = $_GET['grade']  ?? '';
        $status = $_GET['status'] ?? '';

        $where  = ['ar.record_date = ?'];
        $params = [$date];

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
                    s.student_code                           AS studentCode,
                    g.label                                  AS grade,
                    TIME_FORMAT(ar.check_in_time,  '%H:%i')  AS checkIn,
                    TIME_FORMAT(ar.check_out_time, '%H:%i')  AS checkOut,
                    ar.status, ar.method,
                    ar.confidence,
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
        require_admin();
        $status = $_GET['status'] ?? 'pending';

        $stmt = db()->prepare(
            "SELECT lr.id,
                    CONCAT(s.first_name,' ',s.last_name) AS studentName,
                    s.student_code                       AS studentCode,
                    g.label                              AS grade,
                    lr.date_from AS dateFrom,
                    lr.date_to   AS dateTo,
                    lr.reason, lr.type, lr.status,
                    lr.created_at AS submittedAt
             FROM   leave_requests lr
             JOIN   students s ON s.id = lr.student_id
             JOIN   grades   g ON g.id = s.grade_id
             WHERE  lr.status = ?
             ORDER  BY lr.created_at DESC
             LIMIT  100"
        );
        $stmt->execute([$status]);
        json_out($stmt->fetchAll());
    }

    /** POST /admin/leave-requests/:id/approve */
    public static function approveLeave(string $id): void
    {
        $user = require_admin();
        self::updateLeave((int) $id, 'approved', (int) $user['sub']);
    }

    /** POST /admin/leave-requests/:id/decline */
    public static function declineLeave(string $id): void
    {
        $user = require_admin();
        self::updateLeave((int) $id, 'declined', (int) $user['sub']);
    }

    private static function updateLeave(int $id, string $status, int $reviewedBy): void
    {
        $stmt = db()->prepare(
            'UPDATE leave_requests SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?'
        );
        $stmt->execute([$status, $reviewedBy, $id]);
        if ($stmt->rowCount() === 0) {
            error_out('Leave request not found', 404);
        }
        json_out(['id' => $id, 'status' => $status]);
    }

    /** GET /admin/reports?month=2026-04 */
    public static function reports(): void
    {
        require_admin();
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
                    (SELECT COUNT(*) FROM students WHERE is_active = 1)            AS enrolled
             FROM   attendance_records ar
             WHERE  DATE_FORMAT(ar.record_date, '%Y-%m') = ?
               AND  ar.status IN ('present','late')
             GROUP  BY ar.record_date
             ORDER  BY ar.record_date"
        );
        $dailyStmt->execute([$month]);
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
}
