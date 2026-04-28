# FRBAMS — Face Recognition-Based Attendance Management System

A school attendance system for **University of the Visayas** that uses face recognition for automated student check-in. Consists of a React admin dashboard, a PHP REST API, and an Expo mobile app for students.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Admin frontend | React 18 + Vite + React Router 7 |
| Backend API | PHP 8 (no framework), PDO, JWT (HS256) |
| Mobile app | Expo 52 / React Native 0.76 + TypeScript |
| Database | MySQL 8 (hosted on Hostinger) |
| Hosting | Hostinger Business shared hosting |

---

## Project Structure

```
frbams/
├── frontend/          # React admin dashboard (Vite)
│   └── src/
│       ├── api.js               # API client (fetch wrapper)
│       ├── App.jsx              # Router + auth guard
│       ├── admin-dashboard.jsx  # Dashboard with live stats
│       ├── admin-log.jsx        # Attendance log with filters
│       ├── admin-misc.jsx       # Reports + leave requests
│       ├── students.jsx         # Student roster
│       └── login.jsx            # Admin login
├── backend/           # PHP REST API
│   ├── index.php                # Entry point + route table
│   ├── .env                     # Credentials (never commit)
│   ├── .env.example             # Template for new installs
│   ├── .htaccess                # Apache rewrite rules
│   ├── config/database.php      # PDO singleton + env loader
│   ├── src/
│   │   ├── JWT.php              # HS256 encode/decode
│   │   ├── Response.php         # json_out, error_out, require_auth
│   │   └── Router.php           # Lightweight URL matcher
│   └── controllers/
│       ├── AuthController.php       # Login / logout
│       ├── StudentController.php    # Student self-service
│       ├── AttendanceController.php # Check-in / check-out / sync
│       └── AdminController.php      # Admin dashboard + reports
├── mobile/            # Expo student app (git-ignored)
├── database/          # schema.sql + seed (git-ignored)
└── DEPLOY.md          # Hostinger deployment checklist
```

---

## Local Development

### Prerequisites

- **Node.js** 20+
- **PHP** 8.1+
- **MySQL** 8 running locally (or use the Hostinger remote DB)

### 1. Install frontend dependencies

```bash
cd frontend
npm install
```

### 2. Configure the backend

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials and JWT secret
```

### 3. Import the database schema

```bash
mysql -u root -p frbams < database/schema.sql
```

Or use phpMyAdmin: select your database → Import → choose `database/schema.sql`.

### 4. Start both servers

**Terminal 1 — PHP backend (port 8000):**
```bash
php -S localhost:8000 -t backend backend/index.php
```

**Terminal 2 — Vite dev server (port 5173):**
```bash
cd frontend
npm run dev
```

Vite automatically proxies `/api/*` → `http://localhost:8000`, so CORS is not an issue in development.

Open `http://localhost:5173` in your browser.

### Default admin credentials

| Field | Value |
|-------|-------|
| Email | `admin@uv.edu.ph` |
| Password | `Admin@1234` |

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in the values:

```env
# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=u12345678_frbams
DB_USER=u12345678_frbams_app
DB_PASS=your_strong_password_here
DB_CHARSET=utf8mb4

# JWT
JWT_SECRET=change_this_to_64_random_chars_minimum
JWT_TTL=86400          # Token lifetime in seconds (default: 24 h)

# App
APP_ENV=development    # Use "production" on Hostinger
APP_URL=https://yourdomain.com/api
API_PREFIX=/api
FRONTEND_URL=https://yourdomain.com
```

Generate a secure JWT secret:
```bash
openssl rand -hex 48
```

---

## API Reference

All protected endpoints require `Authorization: Bearer <token>` header. Tokens are issued at login and expire after `JWT_TTL` seconds.

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/admin/login` | — | Admin / staff login |
| POST | `/auth/student/login` | — | Student login (mobile) |
| POST | `/auth/logout` | Bearer | Stateless logout (client drops token) |

### Admin (requires admin / staff token)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/dashboard` | Today's stats, 7-day trend, per-grade breakdown, recent check-ins |
| GET | `/admin/students` | Student roster — params: `search`, `grade`, `page` |
| GET | `/admin/attendance` | Attendance log — params: `date`, `grade`, `status` |
| GET | `/admin/leave-requests` | Leave inbox — param: `status` (pending / approved / declined) |
| POST | `/admin/leave-requests/:id/approve` | Approve a leave request |
| POST | `/admin/leave-requests/:id/decline` | Decline a leave request |
| GET | `/admin/reports` | Monthly report — param: `month` (YYYY-MM) |

### Student (requires student token — used by mobile app)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/student/me` | Own profile |
| GET | `/student/me/attendance` | Monthly attendance — param: `month` |
| GET | `/student/me/schedule` | Day schedule — param: `date` |
| GET | `/student/me/term-rate` | YTD attendance percentage |
| GET | `/student/me/leave-requests` | Own leave history |
| POST | `/student/me/leave-requests` | Submit leave request |

### Attendance (student token)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/attendance/check-in` | Record check-in (face or PIN) |
| POST | `/attendance/check-out` | Record check-out |
| POST | `/attendance/sync` | Bulk sync offline queue |

### Health

```
GET /health  →  { "status": "ok", "ts": 1234567890 }
```

---

## Deployment (Hostinger)

See [`DEPLOY.md`](DEPLOY.md) for the full step-by-step checklist. Summary:

```
public_html/
├── .htaccess      ← SPA fallback rules
├── index.html     ← built frontend
├── assets/        ← built frontend assets
└── api/
    ├── .htaccess  ← PHP router rules
    ├── .env       ← real credentials
    ├── index.php
    ├── config/
    ├── src/
    └── controllers/
```

1. `cd frontend && npm run build` — outputs to `frontend/dist/`
2. Upload `frontend/dist/*` → `public_html/`
3. Upload `backend/*` → `public_html/api/`
4. Import `database/schema.sql` via phpMyAdmin
5. Verify: `https://yourdomain.com/api/health`

---

## Key Design Decisions

- **No PHP framework** — keeps the deployment simple on shared hosting (no Composer, no vendor directory)
- **Stateless JWT** — no session storage needed; tokens carry role and school ID
- **Multi-tenant schema** — every table has `school_id` for future multi-school support
- **Offline-first mobile** — attendance can be captured without internet and synced later via `/attendance/sync`
- **Face templates as references** — raw images are never stored; only encrypted vector references
