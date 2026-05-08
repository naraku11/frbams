<?php

declare(strict_types=1);

class AuthController
{
    /** POST /auth/student/login */
    public static function studentLogin(): void
    {
        $body     = body();
        $email    = trim((string) required_field($body, 'email'));
        $password = (string) required_field($body, 'password');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            error_out('Invalid email or password', 401);
        }

        self::checkLoginAttempts($email, 'student');

        $pdo  = db();
        $stmt = $pdo->prepare(
            'SELECT s.id, s.school_id, s.student_code, s.first_name, s.last_name, s.email,
                    s.photo_url, s.password_hash,
                    g.label AS grade_label
             FROM   students s
             JOIN   grades   g ON g.id = s.grade_id
             WHERE  s.email = ? AND s.is_active = 1
             LIMIT  1'
        );
        $stmt->execute([$email]);
        $row = $stmt->fetch();

        if (!$row || !password_verify($password, $row['password_hash'])) {
            self::recordLoginAttempt($email, 'student');
            error_out('Invalid email or password', 401);
        }

        self::clearLoginAttempts($email, 'student');

        // Fetch school timezone for use in mobile check-in/out date calculations
        $tzStmt = $pdo->prepare('SELECT timezone FROM schools WHERE id = ? LIMIT 1');
        $tzStmt->execute([$row['school_id']]);
        $tzRow           = $tzStmt->fetch();
        $schoolTimezone  = ($tzRow && $tzRow['timezone']) ? $tzRow['timezone'] : 'UTC';

        $token = JWT::encode([
            'sub'             => $row['id'],
            'role'            => 'student',
            'school_id'       => $row['school_id'],
            'school_timezone' => $schoolTimezone,
        ], env('JWT_SECRET'), (int) env('JWT_TTL', '86400'));

        json_out([
            'token'   => $token,
            'student' => [
                'id'          => $row['id'],
                'studentCode' => $row['student_code'],
                'firstName'   => $row['first_name'],
                'lastName'    => $row['last_name'],
                'email'       => $row['email'],
                'gradeLabel'  => $row['grade_label'],
                'photoUrl'    => $row['photo_url'],
            ],
        ]);
    }

    /** POST /auth/admin/login */
    public static function adminLogin(): void
    {
        $body     = body();
        $email    = trim((string) required_field($body, 'email'));
        $password = (string) required_field($body, 'password');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            error_out('Invalid email or password', 401);
        }

        self::checkLoginAttempts($email, 'admin');

        $pdo  = db();
        $stmt = $pdo->prepare(
            'SELECT id, school_id, first_name, last_name, role, email, password_hash
             FROM   users WHERE email = ? AND is_active = 1 LIMIT 1'
        );
        $stmt->execute([$email]);
        $row = $stmt->fetch();

        if (!$row || !password_verify($password, $row['password_hash'])) {
            self::recordLoginAttempt($email, 'admin');
            error_out('Invalid email or password', 401);
        }
        if (!in_array($row['role'], ['super_admin','admin','vice_principal','teacher','staff'], true)) {
            error_out('Forbidden', 403);
        }

        self::clearLoginAttempts($email, 'admin');

        // Update last login timestamp
        $pdo->prepare('UPDATE users SET last_login_at = NOW() WHERE id = ?')->execute([$row['id']]);

        // Fetch school timezone for the JWT so all time-sensitive operations use the correct zone
        $tzStmt = $pdo->prepare('SELECT timezone FROM schools WHERE id = ? LIMIT 1');
        $tzStmt->execute([$row['school_id']]);
        $tzRow          = $tzStmt->fetch();
        $schoolTimezone = ($tzRow && $tzRow['timezone']) ? $tzRow['timezone'] : 'UTC';

        $name  = trim($row['first_name'] . ' ' . $row['last_name']);

        $token = JWT::encode([
            'sub'             => $row['id'],
            'role'            => $row['role'],
            'name'            => $name,
            'school_id'       => $row['school_id'],
            'school_timezone' => $schoolTimezone,
        ], env('JWT_SECRET'), (int) env('JWT_TTL', '86400'));

        json_out([
            'token' => $token,
            'user'  => [
                'id'    => $row['id'],
                'name'  => $name,
                'role'  => $row['role'],
                'email' => $row['email'],
            ],
        ]);
    }

    /** POST /auth/logout — stateless JWT; client discards token */
    public static function logout(): void
    {
        json_out(['ok' => true]);
    }

    // ── Rate limiting helpers ─────────────────────────────────────────────────

    private static function checkLoginAttempts(string $email, string $type): void
    {
        $key = hash('sha256', strtolower($email) . ':' . $type);
        $ip  = $_SERVER['REMOTE_ADDR'] ?? '';
        try {
            $stmt = db()->prepare(
                "SELECT COUNT(*) FROM login_attempts
                 WHERE (identifier = ? OR ip_address = ?)
                   AND attempted_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)"
            );
            $stmt->execute([$key, $ip]);
            if ((int) $stmt->fetchColumn() >= 10) {
                header('Retry-After: 900');
                error_out('Too many login attempts. Try again in 15 minutes.', 429);
            }
        } catch (\PDOException) {
            // login_attempts table may not exist yet on first deploy; skip check
        }
    }

    private static function recordLoginAttempt(string $email, string $type): void
    {
        $key = hash('sha256', strtolower($email) . ':' . $type);
        $ip  = $_SERVER['REMOTE_ADDR'] ?? '';
        try {
            db()->prepare(
                'INSERT INTO login_attempts (identifier, ip_address) VALUES (?, ?)'
            )->execute([$key, $ip]);
        } catch (\PDOException) {
            // fail silently
        }
    }

    private static function clearLoginAttempts(string $email, string $type): void
    {
        $key = hash('sha256', strtolower($email) . ':' . $type);
        try {
            db()->prepare('DELETE FROM login_attempts WHERE identifier = ?')->execute([$key]);
        } catch (\PDOException) {
            // fail silently
        }
    }
}
