# FaceMark — Hostinger Database Setup

## 1  Create the database

1. Log in to **hPanel** → **Databases → MySQL Databases**
2. Click **Create a new database**
   - Name: `frbams`  → Hostinger prefixes it automatically → `u12345678_frbams`
3. Under **MySQL Users**, create a new user
   - Username: `frbams_app`  → becomes `u12345678_frbams_app`
   - Password: generate a strong password (16+ chars, mixed case + digits + symbols)
4. Under **Add User to Database**, assign the new user to the new database with **All Privileges**

Note down:
```
DB_HOST=localhost          # always localhost on Hostinger shared hosting
DB_PORT=3306
DB_NAME=u12345678_frbams   # your exact prefixed name
DB_USER=u12345678_frbams_app
DB_PASS=<your password>
```

---

## 2  Import the schema

1. Still in hPanel, click **phpMyAdmin** next to your database
2. In phpMyAdmin, select your database in the left sidebar
3. Click the **Import** tab
4. Click **Choose File** → select `database/schema.sql` from this project
5. Scroll down, click **Go**
6. Confirm: you should see **25 tables** created successfully

---

## 3  Verify

Run this query in phpMyAdmin → SQL tab:

```sql
SELECT table_name, table_rows
FROM information_schema.tables
WHERE table_schema = DATABASE()
ORDER BY table_name;
```

Expected 25 tables:

| Table | Purpose |
|---|---|
| `attendance_records` | Core check-in/check-out log |
| `biometric_consents` | GDPR/FERPA consent trail |
| `cameras` | Camera devices |
| `course_enrollments` | Student ↔ course roster |
| `course_schedules` | Weekly recurring schedule |
| `course_sessions` | Individual class instances |
| `courses` | Course definitions |
| `departments` | Academic departments |
| `devices` | Kiosk + mobile devices |
| `face_templates` | Encrypted template metadata |
| `geofence_zones` | Campus GPS boundaries |
| `grades` | Class sections (10A, 11B …) |
| `guardians` | Parent / guardian contacts |
| `leave_requests` | Leave / absence requests |
| `notification_rules` | Alert trigger configuration |
| `notifications` | Generated alerts inbox |
| `offline_queue` | Offline check-ins awaiting sync |
| `password_resets` | Password reset tokens |
| `recognition_settings` | Per-school recognition config |
| `rooms` | Physical rooms |
| `schools` | School tenant record |
| `student_guardians` | Student ↔ guardian links |
| `students` | Student records |
| `sync_logs` | Device sync history |
| `users` | Admin / teacher accounts |

And 3 views: `v_today_summary`, `v_student_attendance_rate`, `v_offline_queue_summary`

---

## 4  Update the default admin password

The seed data creates one admin account for immediate access:

| Field | Value |
|---|---|
| Email | `admin@ridgeview.edu` |
| Password | `Admin@1234` |

**Change this immediately** after first login. In phpMyAdmin:

```sql
UPDATE users
SET password_hash = '<new bcrypt hash>'
WHERE email = 'admin@ridgeview.edu';
```

Generate a fresh bcrypt hash with `password_hash('YourNewPassword', PASSWORD_BCRYPT, ['cost' => 12])` in PHP, or use your backend's auth library.

---

## 5  Environment variables

Create a `.env` file at the project root (never commit this):

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=u12345678_frbams
DB_USER=u12345678_frbams_app
DB_PASS=your_strong_password_here
DB_CHARSET=utf8mb4
```

---

## 6  Connection limits

Hostinger Business hosting allows **~100 simultaneous MySQL connections**.  
Configure your backend connection pool accordingly (max 20–30 connections is safe).

---

## 7  Face template storage

`face_templates.template_ref` stores a **reference key only** — the encrypted vector itself must live in external object storage (e.g. Cloudflare R2, AWS S3, or Backblaze B2).  
**Never** store raw biometric data in the shared MySQL database.
