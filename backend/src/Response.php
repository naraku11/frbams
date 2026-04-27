<?php

declare(strict_types=1);

function json_out(mixed $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function error_out(string $message, int $status = 400): never
{
    json_out(['error' => $message], $status);
}

/** Verify Bearer token and return payload. Calls error_out(401) on failure. */
function require_auth(): array
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!str_starts_with($header, 'Bearer ')) {
        error_out('Unauthorized', 401);
    }
    $token = substr($header, 7);
    try {
        return JWT::decode($token, env('JWT_SECRET'));
    } catch (RuntimeException $e) {
        error_out($e->getMessage(), 401);
    }
}

/** Same as require_auth but asserts caller is a staff user (not a student). */
function require_admin(): array
{
    $payload = require_auth();
    $allowed = ['super_admin', 'admin', 'vice_principal', 'teacher', 'staff'];
    if (!in_array($payload['role'] ?? '', $allowed, true)) {
        error_out('Forbidden', 403);
    }
    return $payload;
}

function body(): array
{
    static $parsed = null;
    if ($parsed === null) {
        $raw    = file_get_contents('php://input');
        $parsed = json_decode($raw ?: '{}', true) ?? [];
    }
    return $parsed;
}

function required_field(array $data, string $key): mixed
{
    if (!array_key_exists($key, $data) || $data[$key] === '' || $data[$key] === null) {
        error_out("Missing required field: {$key}");
    }
    return $data[$key];
}
