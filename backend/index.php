<?php

declare(strict_types=1);

// ── Bootstrap ────────────────────────────────────────────────────────────────

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/src/JWT.php';
require_once __DIR__ . '/src/Response.php';
require_once __DIR__ . '/src/Router.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/StudentController.php';
require_once __DIR__ . '/controllers/AttendanceController.php';
require_once __DIR__ . '/controllers/AdminController.php';

// Load .env
loadEnv(__DIR__ . '/.env');

// ── CORS ─────────────────────────────────────────────────────────────────────

$origin  = preg_replace('/[\r\n]/', '', rtrim($_SERVER['HTTP_ORIGIN'] ?? '', '/'));
$allowed = array_filter(array_map(
    fn($u) => rtrim((string) $u, '/'),
    [
        env('FRONTEND_URL'),
        env('APP_URL'),
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:8081',  // Expo dev
    ]
));

if (in_array($origin, $allowed, true) || env('APP_ENV') === 'development') {
    header("Access-Control-Allow-Origin: {$origin}");
} else {
    header('Access-Control-Allow-Origin: ' . (rtrim(env('FRONTEND_URL'), '/') ?: '*'));
}

header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Routes ───────────────────────────────────────────────────────────────────

// Auth
Router::add('POST', '/auth/student/login', [AuthController::class, 'studentLogin']);
Router::add('POST', '/auth/admin/login',   [AuthController::class, 'adminLogin']);
Router::add('POST', '/auth/logout',        [AuthController::class, 'logout']);

// Student (mobile + web self-service)
Router::add('GET',  '/student/me',                       [StudentController::class, 'me']);
Router::add('GET',  '/student/me/attendance',            [StudentController::class, 'attendance']);
Router::add('GET',  '/student/me/schedule',              [StudentController::class, 'schedule']);
Router::add('GET',  '/student/me/term-rate',             [StudentController::class, 'termRate']);
Router::add('GET',  '/student/me/leave-requests',        [StudentController::class, 'leaveRequests']);
Router::add('POST', '/student/me/leave-requests',        [StudentController::class, 'submitLeave']);

// Attendance (check-in / sync)
Router::add('POST', '/attendance/check-in',  [AttendanceController::class, 'checkIn']);
Router::add('POST', '/attendance/check-out', [AttendanceController::class, 'checkOut']);
Router::add('POST', '/attendance/sync',      [AttendanceController::class, 'sync']);

// Admin
Router::add('GET',  '/admin/dashboard',                     [AdminController::class, 'dashboard']);
Router::add('GET',  '/admin/students',                      [AdminController::class, 'students']);
Router::add('GET',  '/admin/students/:id',                  [AdminController::class, 'studentDetail']);
Router::add('POST', '/admin/students',                      [AdminController::class, 'enrollStudent']);
Router::add('GET',  '/admin/attendance',                    [AdminController::class, 'attendance']);
Router::add('GET',  '/admin/leave-requests',                [AdminController::class, 'leaveRequests']);
Router::add('POST', '/admin/leave-requests/:id/approve',    [AdminController::class, 'approveLeave']);
Router::add('POST', '/admin/leave-requests/:id/decline',    [AdminController::class, 'declineLeave']);
Router::add('GET',  '/admin/reports',                       [AdminController::class, 'reports']);
Router::add('GET',  '/admin/notifications',                 [AdminController::class, 'notifications']);
Router::add('GET',  '/admin/cameras',                       [AdminController::class, 'cameras']);
Router::add('GET',  '/admin/grades',                        [AdminController::class, 'grades']);
Router::add('GET',  '/admin/settings/recognition',          [AdminController::class, 'recognitionSettings']);
Router::add('PATCH','/admin/settings/recognition',          [AdminController::class, 'saveRecognitionSettings']);
Router::add('GET',  '/admin/badge-counts',                  [AdminController::class, 'badgeCounts']);
Router::add('GET',  '/admin/teachers',                      [AdminController::class, 'teachers']);
Router::add('GET',  '/admin/departments',                   [AdminController::class, 'departments']);
Router::add('GET',  '/admin/rooms',                         [AdminController::class, 'rooms']);
Router::add('GET',  '/admin/courses',                       [AdminController::class, 'courses']);
Router::add('POST', '/admin/courses',                       [AdminController::class, 'createCourse']);
Router::add('GET',  '/admin/offline-queue',                 [AdminController::class, 'offlineQueue']);
Router::add('GET',  '/admin/notification-rules',            [AdminController::class, 'notificationRules']);
Router::add('PATCH', '/admin/notification-rules/:id',       [AdminController::class, 'updateNotificationRule']);
Router::add('PATCH', '/admin/attendance/:id',               [AdminController::class, 'updateAttendance']);
Router::add('GET',   '/admin/programs',                     [AdminController::class, 'programs']);
Router::add('POST',  '/admin/programs',                     [AdminController::class, 'createProgram']);
Router::add('PATCH', '/admin/programs/:id',                 [AdminController::class, 'updateProgram']);
Router::add('DELETE','/admin/programs/:id',                 [AdminController::class, 'deleteProgram']);
Router::add('GET',   '/admin/curricula',                    [AdminController::class, 'curricula']);
Router::add('POST',  '/admin/curricula',                    [AdminController::class, 'createCurriculum']);
Router::add('PATCH', '/admin/curricula/:id',                [AdminController::class, 'updateCurriculum']);
Router::add('DELETE','/admin/curricula/:id',                [AdminController::class, 'deleteCurriculum']);
Router::add('GET',   '/admin/sections',                     [AdminController::class, 'sections']);
Router::add('POST',  '/admin/sections',                     [AdminController::class, 'createSection']);
Router::add('PATCH', '/admin/sections/:id',                 [AdminController::class, 'updateSection']);
Router::add('DELETE','/admin/sections/:id',                 [AdminController::class, 'deleteSection']);
Router::add('GET',   '/admin/school-info',                  [AdminController::class, 'schoolInfo']);
Router::add('PATCH', '/admin/school-info',                  [AdminController::class, 'updateSchoolInfo']);
Router::add('POST',  '/admin/upload-asset',                 [AdminController::class, 'uploadAsset']);

// Health check
Router::add('GET', '/health', fn() => json_out(['status' => 'ok', 'ts' => time()]));

// ── Dispatch ─────────────────────────────────────────────────────────────────

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

// Auto-detect the base prefix from the script's location (e.g. /api/index.php → /api).
// Falls back to API_PREFIX env var, then to no prefix in dev.
$scriptDir = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? ''), '/');
$prefix    = rtrim(env('API_PREFIX', $scriptDir), '/');
if ($prefix !== '' && str_starts_with($uri, $prefix)) {
    $uri = substr($uri, strlen($prefix)) ?: '/';
}

try {
    Router::dispatch($_SERVER['REQUEST_METHOD'], $uri);
} catch (PDOException $e) {
    $msg = env('APP_ENV') === 'development' ? $e->getMessage() : 'Database error';
    error_out($msg, 500);
} catch (Throwable $e) {
    $msg = env('APP_ENV') === 'development' ? $e->getMessage() : 'Internal server error';
    error_out($msg, 500);
}
