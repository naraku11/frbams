<?php

declare(strict_types=1);

/**
 * Minimal router — supports :param segments and wildcard *.
 *
 * Usage:
 *   Router::add('GET',  '/student/me',          fn() => ...);
 *   Router::add('POST', '/student/:id/leave',    fn(string $id) => ...);
 *   Router::dispatch($_SERVER['REQUEST_METHOD'], parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
 */
class Router
{
    /** @var array<array{method:string, pattern:string, handler:callable}> */
    private static array $routes = [];

    public static function add(string $method, string $pattern, callable $handler): void
    {
        self::$routes[] = ['method' => strtoupper($method), 'pattern' => $pattern, 'handler' => $handler];
    }

    public static function dispatch(string $method, string $uri): void
    {
        // Strip query string and leading /api prefix if present
        $uri    = strtok($uri, '?');
        $method = strtoupper($method);

        foreach (self::$routes as $route) {
            if ($route['method'] !== $method && $route['method'] !== 'ANY') {
                continue;
            }
            $params = self::match($route['pattern'], $uri);
            if ($params !== null) {
                ($route['handler'])(...$params);
                return;
            }
        }

        error_out('Not found', 404);
    }

    /** Returns null on no-match, or an array of capture values. */
    private static function match(string $pattern, string $uri): ?array
    {
        $parts   = explode('/', trim($pattern, '/'));
        $uriParts = explode('/', trim($uri, '/'));

        if (count($parts) !== count($uriParts) && !in_array('*', $parts, true)) {
            return null;
        }

        $params = [];
        foreach ($parts as $i => $seg) {
            if ($seg === '*') {
                break;
            }
            $actual = $uriParts[$i] ?? null;
            if ($actual === null) {
                return null;
            }
            if (str_starts_with($seg, ':')) {
                $params[] = urldecode($actual);
            } elseif ($seg !== $actual) {
                return null;
            }
        }

        return $params;
    }
}
