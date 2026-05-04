---
name: FRBAMS Code Patterns & Pitfalls
description: Recurring architecture patterns, fixed bugs, and security norms found in FRBAMS during the 2026-05-04 exhaustive review
type: project
---

## Architecture
- PHP no-framework REST API (backend/), React+Vite admin (frontend/), Expo mobile (mobile/)
- All DB access via PDO singleton `db()`, prepared statements throughout — no raw SQL injection risk
- Custom HS256 JWT in `src/JWT.php` — no external library dependency
- Deployed on Hostinger shared hosting: Apache + PHP + MySQL

## Security Issues Fixed (2026-05-04)
- **IDOR**: `updateAttendance`, `studentDetail`, `leaveRequests` admin endpoints lacked `school_id` scope — fixed with `AND school_id = ?`
- **Role confusion**: All `StudentController` and `AttendanceController` routes used `require_auth()` instead of `require_student()` — a staff JWT could call student endpoints. Fixed by adding `require_student()` helper and applying it.
- **MIME spoofing**: `uploadAsset` trusted client-supplied MIME type — fixed to use `finfo` for real MIME detection. SVG explicitly excluded (JS-in-SVG risk).
- **Credential leak**: Login page showed default `admin@uv.edu.ph / Admin@1234` in plain text. Removed. Pre-filled email also removed.
- **Default password**: `enrollStudent` hardcoded `Student@1234` for all new students. Fixed to generate a cryptographically random 12-char temp password, returned once to admin.
- **CORS wildcard**: Fallback used `Access-Control-Allow-Origin: *`; changed to 403 for unknown origins.
- **JWT exp**: `decode()` accepted tokens without `exp` field. Now rejected. Clock-skew guard added for future-dated `iat`.
- **school_id missing from admin JWT**: `adminLogin` didn't include `school_id` in token payload — all admin scoping defaulted to `school_id = 1`. Fixed.
- **Time manipulation**: `checkIn` accepted user-supplied `capturedAt` with no server-side bounds check. Now rejects > 15 min future or > 24 h past.
- **Sync DoS**: `AttendanceController::sync` had no event count limit. Now capped at 500 events per call.
- **Confidence clamping**: Face confidence values from mobile not bounded [0,1]; now clamped server-side.

## Correctness Issues Fixed
- `check-out.tsx` was a stub with hardcoded "08:42" check-in time — never called the real API. Now calls `api.attendance.checkOut()` and `api.student.attendance()` for real data.
- `AttendanceLog` used a hardcoded `['10A','10B',...]` grade list instead of fetching from API.
- `useOfflineQueue` auto-sync had no concurrency guard — concurrent syncs could duplicate records. Fixed with `isSyncing` ref.
- `row key` in attendance log used `r.id + r.time` (string concat, fragile). Fixed to `r.recId`.
- `SettingsRecognition` fired a PATCH on every slider drag event. Debounced to 400ms.
- `api.js` called `localStorage.getItem` twice per request. Consolidated. Also added auto-logout on 401 response.
- `Guard` component checked `frbams_authed` flag only, not token presence. Now checks both.

## Conventions Observed
- School-scoped data: always add `AND school_id = ?` to multi-tenant queries
- Admin controllers: always call `require_admin()` and extract `$sid = (int) ($user['school_id'] ?? 1)`
- Student controllers: always call `require_student()` 
- Row-not-found checks: use `$stmt->rowCount() === 0` after UPDATE for 404 responses
- Error responses: always use `error_out(message, code)` — never echo directly

## Tech Stack Details
- PHP 8.1+ (uses `never` return type, `str_starts_with`, arrow functions, `declare(strict_types=1)`)
- React 18 with react-router-dom v6 (all hooks-based, no class components)
- Expo SDK (expo-router file-based routing)
- MySQL with utf8mb4_unicode_ci collation
- No Composer/npm package management for backend (zero-dependency PHP)
