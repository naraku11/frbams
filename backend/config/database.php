<?php

declare(strict_types=1);

/**
 * Loads .env from the backend root and returns a PDO singleton.
 */
function loadEnv(string $path): void
{
    if (!is_file($path)) {
        return;
    }
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        $eqPos = strpos($line, '=');
        if ($eqPos === false) {
            continue; // malformed line — skip silently
        }
        $key   = trim(substr($line, 0, $eqPos));
        $value = trim(substr($line, $eqPos + 1));

        // Strip surrounding quotes (single or double)
        if (strlen($value) >= 2
            && (($value[0] === '"' && $value[-1] === '"')
             || ($value[0] === "'" && $value[-1] === "'"))) {
            $value = substr($value, 1, -1);
        }

        // Only alphanumeric+underscore keys are valid env var names
        if (!preg_match('/^[A-Z][A-Z0-9_]*$/i', $key)) {
            continue;
        }

        if (!array_key_exists($key, $_ENV)) {
            $_ENV[$key]  = $value;
            putenv("{$key}={$value}");
        }
    }
}

function env(string $key, string $default = ''): string
{
    return $_ENV[$key] ?? getenv($key) ?: $default;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=%s',
        env('DB_HOST', 'localhost'),
        env('DB_PORT', '3306'),
        env('DB_NAME'),
        env('DB_CHARSET', 'utf8mb4'),
    );

    $pdo = new PDO($dsn, env('DB_USER'), env('DB_PASS'), [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::MYSQL_ATTR_FOUND_ROWS   => true,
    ]);

    return $pdo;
}
