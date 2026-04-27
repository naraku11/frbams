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

        $pdo  = db();
        $stmt = $pdo->prepare(
            'SELECT s.id, s.student_code, s.first_name, s.last_name, s.email,
                    s.photo_url, s.password_hash,
                    g.label AS grade_label
             FROM   students s
             JOIN   grades   g ON g.id = s.grade_id
             WHERE  s.email = ?
             LIMIT  1'
        );
        $stmt->execute([$email]);
        $row = $stmt->fetch();

        if (!$row || !password_verify($password, $row['password_hash'])) {
            error_out('Invalid email or password', 401);
        }

        $token = JWT::encode([
            'sub'  => $row['id'],
            'role' => 'student',
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

        $stmt = db()->prepare(
            'SELECT id, first_name, last_name, role, email, password_hash
             FROM   users WHERE email = ? AND is_active = 1 LIMIT 1'
        );
        $stmt->execute([$email]);
        $row = $stmt->fetch();

        if (!$row || !password_verify($password, $row['password_hash'])) {
            error_out('Invalid email or password', 401);
        }
        if (!in_array($row['role'], ['super_admin','admin','vice_principal','teacher','staff'], true)) {
            error_out('Forbidden', 403);
        }

        $name  = trim($row['first_name'] . ' ' . $row['last_name']);

        $token = JWT::encode([
            'sub'  => $row['id'],
            'role' => $row['role'],
            'name' => $name,
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
}
