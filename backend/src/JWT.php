<?php

declare(strict_types=1);

/**
 * Minimal HS256 JWT — no external dependencies.
 */
class JWT
{
    private static function b64(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function unb64(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    public static function encode(array $payload, string $secret, int $ttl = 86400): string
    {
        $header  = self::b64(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload['iat'] = time();
        $payload['exp'] = time() + $ttl;
        $body    = self::b64(json_encode($payload));
        $sig     = self::b64(hash_hmac('sha256', "{$header}.{$body}", $secret, true));
        return "{$header}.{$body}.{$sig}";
    }

    /** @throws RuntimeException on invalid/expired token */
    public static function decode(string $token, string $secret): array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new RuntimeException('Malformed token');
        }
        [$header, $body, $sig] = $parts;

        $expected = self::b64(hash_hmac('sha256', "{$header}.{$body}", $secret, true));
        if (!hash_equals($expected, $sig)) {
            throw new RuntimeException('Invalid signature');
        }

        $payload = json_decode(self::unb64($body), true);
        if (!is_array($payload)) {
            throw new RuntimeException('Malformed payload');
        }
        // exp is mandatory — tokens without an expiry are rejected
        if (!isset($payload['exp']) || !is_int($payload['exp'])) {
            throw new RuntimeException('Token missing expiry');
        }
        if ($payload['exp'] < time()) {
            throw new RuntimeException('Token expired');
        }
        // Reject tokens issued more than 1 minute in the future (clock skew guard)
        if (isset($payload['iat']) && is_int($payload['iat']) && $payload['iat'] > time() + 60) {
            throw new RuntimeException('Token issued in the future');
        }

        return $payload;
    }
}
