-- =============================================================================
-- FaceMark — MySQL Schema
-- Hostinger Business Web Hosting
-- =============================================================================
-- HOW TO IMPORT ON HOSTINGER:
--   1. Log in to hPanel → Databases → MySQL Databases
--   2. Create database:  e.g.  u12345678_frbams
--   3. Create user and assign ALL PRIVILEGES on that database
--   4. Open phpMyAdmin, select the database, click Import, upload this file
--
-- Replace every occurrence of `frbams` below to match your Hostinger prefix,
-- e.g.  u12345678_frbams  (hPanel shows the exact name after creation).
-- =============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- =============================================================================
-- SECTION 1 · SCHOOL & STAFF
-- =============================================================================

CREATE TABLE IF NOT EXISTS `schools` (
  `id`            SMALLINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(120)       NOT NULL,
  `subdomain`     VARCHAR(40)        NOT NULL UNIQUE,
  `address`       VARCHAR(255)       DEFAULT NULL,
  `timezone`      VARCHAR(60)        NOT NULL DEFAULT 'UTC',
  `logo_url`      VARCHAR(512)       DEFAULT NULL,
  `created_at`    TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Staff / admin users (teachers, vice principals, admins)
CREATE TABLE IF NOT EXISTS `users` (
  `id`            INT UNSIGNED       NOT NULL AUTO_INCREMENT,
  `school_id`     SMALLINT UNSIGNED  NOT NULL,
  `employee_code` VARCHAR(20)        DEFAULT NULL,
  `first_name`    VARCHAR(60)        NOT NULL,
  `last_name`     VARCHAR(60)        NOT NULL,
  `email`         VARCHAR(120)       NOT NULL,
  `password_hash` VARCHAR(255)       NOT NULL,
  `role`          ENUM('super_admin','admin','vice_principal','teacher','staff')
                                     NOT NULL DEFAULT 'teacher',
  `department`    VARCHAR(80)        DEFAULT NULL,
  `avatar_url`    VARCHAR(512)       DEFAULT NULL,
  `is_active`     TINYINT(1)         NOT NULL DEFAULT 1,
  `last_login_at` TIMESTAMP          DEFAULT NULL,
  `created_at`    TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_school` (`school_id`),
  KEY `idx_users_role` (`school_id`, `role`),
  CONSTRAINT `fk_users_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password reset tokens
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id`            INT UNSIGNED       NOT NULL AUTO_INCREMENT,
  `user_id`       INT UNSIGNED       NOT NULL,
  `token_hash`    VARCHAR(255)       NOT NULL,
  `expires_at`    TIMESTAMP          NOT NULL,
  `used_at`       TIMESTAMP          DEFAULT NULL,
  `created_at`    TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reset_user` (`user_id`),
  KEY `idx_reset_token` (`token_hash`),
  CONSTRAINT `fk_resets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SECTION 2 · STUDENTS & GUARDIANS
-- =============================================================================

-- Class sections / grade groups (10A, 10B, 11A …)
CREATE TABLE IF NOT EXISTS `grades` (
  `id`            SMALLINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `school_id`     SMALLINT UNSIGNED  NOT NULL,
  `label`         VARCHAR(20)        NOT NULL,         -- "10A", "11B"
  `year_level`    TINYINT UNSIGNED   NOT NULL,         -- 10, 11, 12
  `homeroom_user_id` INT UNSIGNED    DEFAULT NULL,     -- homeroom teacher
  `is_active`     TINYINT(1)         NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_grade_label` (`school_id`, `label`),
  KEY `idx_grade_school` (`school_id`),
  CONSTRAINT `fk_grades_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_grades_teacher` FOREIGN KEY (`homeroom_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `students` (
  `id`            INT UNSIGNED       NOT NULL AUTO_INCREMENT,
  `school_id`     SMALLINT UNSIGNED  NOT NULL,
  `student_code`  VARCHAR(20)        NOT NULL,         -- "S2400"
  `first_name`    VARCHAR(60)        NOT NULL,
  `last_name`     VARCHAR(60)        NOT NULL,
  `email`         VARCHAR(120)       DEFAULT NULL,
  `date_of_birth` DATE               DEFAULT NULL,
  `grade_id`      SMALLINT UNSIGNED  DEFAULT NULL,
  `photo_url`     VARCHAR(512)       DEFAULT NULL,
  `password_hash` VARCHAR(255)       DEFAULT NULL,     -- mobile app login (bcrypt)
  `pin_hash`      VARCHAR(255)       DEFAULT NULL,     -- fallback PIN (bcrypt)
  `is_active`     TINYINT(1)         NOT NULL DEFAULT 1,
  `enrolled_at`   DATE               NOT NULL,
  `created_at`    TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_student_code` (`school_id`, `student_code`),
  KEY `idx_student_grade` (`grade_id`),
  KEY `idx_student_school` (`school_id`),
  KEY `idx_student_name` (`school_id`, `last_name`, `first_name`),
  CONSTRAINT `fk_students_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_students_grade` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `guardians` (
  `id`            INT UNSIGNED       NOT NULL AUTO_INCREMENT,
  `school_id`     SMALLINT UNSIGNED  NOT NULL,
  `first_name`    VARCHAR(60)        NOT NULL,
  `last_name`     VARCHAR(60)        NOT NULL,
  `email`         VARCHAR(120)       DEFAULT NULL,
  `phone`         VARCHAR(30)        DEFAULT NULL,
  `relationship`  ENUM('mother','father','grandparent','sibling','legal_guardian','other')
                                     NOT NULL DEFAULT 'legal_guardian',
  `created_at`    TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_guardian_school` (`school_id`),
  CONSTRAINT `fk_guardian_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student ↔ Guardian (many-to-many; a student can have multiple guardians)
CREATE TABLE IF NOT EXISTS `student_guardians` (
  `student_id`    INT UNSIGNED       NOT NULL,
  `guardian_id`   INT UNSIGNED       NOT NULL,
  `is_primary`    TINYINT(1)         NOT NULL DEFAULT 0,
  `receives_alerts` TINYINT(1)       NOT NULL DEFAULT 1,
  PRIMARY KEY (`student_id`, `guardian_id`),
  KEY `idx_sg_guardian` (`guardian_id`),
  CONSTRAINT `fk_sg_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sg_guardian` FOREIGN KEY (`guardian_id`) REFERENCES `guardians` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SECTION 3 · BIOMETRICS & FACE TEMPLATES
-- =============================================================================

-- Consent form records — stored separately for privacy audit trail
CREATE TABLE IF NOT EXISTS `biometric_consents` (
  `id`            INT UNSIGNED       NOT NULL AUTO_INCREMENT,
  `student_id`    INT UNSIGNED       NOT NULL,
  `guardian_id`   INT UNSIGNED       DEFAULT NULL,    -- who signed
  `consent_form_version` VARCHAR(20) NOT NULL DEFAULT 'v3.2',
  `signed_at`     TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `signed_by_name` VARCHAR(120)      DEFAULT NULL,
  `ip_address`    VARCHAR(45)        DEFAULT NULL,    -- IPv4/IPv6
  `is_active`     TINYINT(1)         NOT NULL DEFAULT 1,
  `revoked_at`    TIMESTAMP          DEFAULT NULL,
  `revoked_reason` VARCHAR(255)      DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_consent_student` (`student_id`),
  CONSTRAINT `fk_consent_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_consent_guardian` FOREIGN KEY (`guardian_id`) REFERENCES `guardians` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Face template metadata — actual vector stored in encrypted external storage
-- (never store raw biometric blobs in MySQL on shared hosting)
CREATE TABLE IF NOT EXISTS `face_templates` (
  `id`            INT UNSIGNED       NOT NULL AUTO_INCREMENT,
  `student_id`    INT UNSIGNED       NOT NULL,
  `consent_id`    INT UNSIGNED       NOT NULL,
  `enrolled_by`   INT UNSIGNED       DEFAULT NULL,   -- user who enrolled
  `template_ref`  VARCHAR(255)       NOT NULL,       -- encrypted storage key / S3 object key
  `angles_captured` TINYINT UNSIGNED NOT NULL DEFAULT 5,
  `quality_score` DECIMAL(4,3)       DEFAULT NULL,   -- 0.000 – 1.000
  `model_version` VARCHAR(40)        NOT NULL DEFAULT '1.0',
  `is_active`     TINYINT(1)         NOT NULL DEFAULT 1,
  `enrolled_at`   TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated`  TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deactivated_at` TIMESTAMP         DEFAULT NULL,
  `deactivated_reason` VARCHAR(255)  DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_template_student` (`student_id`),
  KEY `idx_template_active` (`student_id`, `is_active`),
  CONSTRAINT `fk_template_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_template_consent` FOREIGN KEY (`consent_id`) REFERENCES `biometric_consents` (`id`),
  CONSTRAINT `fk_template_enrolledby` FOREIGN KEY (`enrolled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SECTION 4 · FACILITIES: ROOMS, CAMERAS, GEOFENCES
-- =============================================================================

CREATE TABLE IF NOT EXISTS `rooms` (
  `id`            SMALLINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `school_id`     SMALLINT UNSIGNED  NOT NULL,
  `code`          VARCHAR(30)        NOT NULL,        -- "204", "Lab 4", "Studio A"
  `name`          VARCHAR(80)        DEFAULT NULL,
  `building`      VARCHAR(60)        DEFAULT NULL,    -- "Main Wing"
  `floor`         TINYINT            DEFAULT NULL,
  `capacity`      SMALLINT UNSIGNED  DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_room_code` (`school_id`, `code`),
  KEY `idx_room_school` (`school_id`),
  CONSTRAINT `fk_room_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cameras` (
  `id`            SMALLINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `school_id`     SMALLINT UNSIGNED  NOT NULL,
  `code`          VARCHAR(20)        NOT NULL,        -- "A1", "B2"
  `label`         VARCHAR(80)        NOT NULL,        -- "Main · A1"
  `location`      VARCHAR(120)       DEFAULT NULL,    -- "Main Entrance"
  `room_id`       SMALLINT UNSIGNED  DEFAULT NULL,
  `ip_address`    VARCHAR(45)        DEFAULT NULL,
  `model`         VARCHAR(80)        DEFAULT NULL,
  `firmware`      VARCHAR(40)        DEFAULT NULL,
  `status`        ENUM('online','offline','recalibrating','maintenance')
                                     NOT NULL DEFAULT 'online',
  `quality_score` DECIMAL(4,3)       DEFAULT NULL,   -- last measured quality
  `last_seen_at`  TIMESTAMP          DEFAULT NULL,
  `created_at`    TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_camera_code` (`school_id`, `code`),
  KEY `idx_camera_school` (`school_id`),
  KEY `idx_camera_room` (`room_id`),
  CONSTRAINT `fk_camera_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_camera_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Campus geofence zones used for mobile location verification
CREATE TABLE IF NOT EXISTS `geofence_zones` (
  `id`            SMALLINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `school_id`     SMALLINT UNSIGNED  NOT NULL,
  `name`          VARCHAR(80)        NOT NULL,        -- "Main Campus", "Sports Block"
  `latitude`      DECIMAL(10,7)      NOT NULL,
  `longitude`     DECIMAL(10,7)      NOT NULL,
  `radius_meters` SMALLINT UNSIGNED  NOT NULL DEFAULT 150,
  `is_active`     TINYINT(1)         NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_geofence_school` (`school_id`),
  CONSTRAINT `fk_geofence_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SECTION 5 · ACADEMIC: DEPARTMENTS, COURSES, SCHEDULES, SESSIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS `departments` (
  `id`            SMALLINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `school_id`     SMALLINT UNSIGNED  NOT NULL,
  `name`          VARCHAR(80)        NOT NULL,        -- "Mathematics", "Science"
  `head_user_id`  INT UNSIGNED       DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_dept_name` (`school_id`, `name`),
  CONSTRAINT `fk_dept_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dept_head` FOREIGN KEY (`head_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `courses` (
  `id`            SMALLINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `school_id`     SMALLINT UNSIGNED  NOT NULL,
  `code`          VARCHAR(20)        NOT NULL,        -- "MATH 201"
  `name`          VARCHAR(120)       NOT NULL,        -- "Calculus II"
  `description`   TEXT               DEFAULT NULL,
  `department_id` SMALLINT UNSIGNED  DEFAULT NULL,
  `teacher_id`    INT UNSIGNED       DEFAULT NULL,    -- primary teacher
  `room_id`       SMALLINT UNSIGNED  DEFAULT NULL,    -- default room
  `camera_id`     SMALLINT UNSIGNED  DEFAULT NULL,    -- default camera
  `term`          VARCHAR(20)        NOT NULL DEFAULT 'Spring 2026',
  `color_hue`     SMALLINT UNSIGNED  DEFAULT 125,     -- UI accent colour
  `is_active`     TINYINT(1)         NOT NULL DEFAULT 1,
  `created_at`    TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_course_code` (`school_id`, `code`, `term`),
  KEY `idx_course_school` (`school_id`),
  KEY `idx_course_teacher` (`teacher_id`),
  CONSTRAINT `fk_course_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_course_dept` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_course_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_course_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_course_camera` FOREIGN KEY (`camera_id`) REFERENCES `cameras` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student ↔ Course roster
CREATE TABLE IF NOT EXISTS `course_enrollments` (
  `id`            INT UNSIGNED       NOT NULL AUTO_INCREMENT,
  `course_id`     SMALLINT UNSIGNED  NOT NULL,
  `student_id`    INT UNSIGNED       NOT NULL,
  `enrolled_at`   TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dropped_at`    TIMESTAMP          DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_enrollment` (`course_id`, `student_id`),
  KEY `idx_enroll_student` (`student_id`),
  CONSTRAINT `fk_enroll_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enroll_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Weekly recurring schedule for a course (Mon 09:30–10:20, Wed 09:30–10:20 …)
CREATE TABLE IF NOT EXISTS `course_schedules` (
  `id`            SMALLINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `course_id`     SMALLINT UNSIGNED  NOT NULL,
  `day_of_week`   TINYINT UNSIGNED   NOT NULL,        -- 1=Mon … 7=Sun (ISO)
  `start_time`    TIME               NOT NULL,
  `end_time`      TIME               NOT NULL,
  `late_threshold_minutes` TINYINT UNSIGNED NOT NULL DEFAULT 8,
  `absent_threshold_minutes` TINYINT UNSIGNED NOT NULL DEFAULT 30,
  PRIMARY KEY (`id`),
  KEY `idx_sched_course` (`course_id`),
  KEY `idx_sched_day` (`course_id`, `day_of_week`),
  CONSTRAINT `fk_sched_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Individual class instances (one row per session, generated from schedule)
CREATE TABLE IF NOT EXISTS `course_sessions` (
  `id`            INT UNSIGNED       NOT NULL AUTO_INCREMENT,
  `course_id`     SMALLINT UNSIGNED  NOT NULL,
  `schedule_id`   SMALLINT UNSIGNED  DEFAULT NULL,
  `session_date`  DATE               NOT NULL,
  `start_time`    TIME               NOT NULL,
  `end_time`      TIME               NOT NULL,
  `room_id`       SMALLINT UNSIGNED  DEFAULT NULL,    -- may differ from course default
  `camera_id`     SMALLINT UNSIGNED  DEFAULT NULL,
  `is_cancelled`  TINYINT(1)         NOT NULL DEFAULT 0,
  `notes`         VARCHAR(255)       DEFAULT NULL,
  `created_at`    TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_session` (`course_id`, `session_date`, `start_time`),
  KEY `idx_session_date` (`session_date`),
  KEY `idx_session_course_date` (`course_id`, `session_date`),
  CONSTRAINT `fk_session_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_session_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `course_schedules` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_session_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_session_camera` FOREIGN KEY (`camera_id`) REFERENCES `cameras` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SECTION 6 · ATTENDANCE RECORDS
-- =============================================================================

CREATE TABLE IF NOT EXISTS `attendance_records` (
  `id`            BIGINT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `school_id`     SMALLINT UNSIGNED  NOT NULL,
  `student_id`    INT UNSIGNED       NOT NULL,
  `session_id`    INT UNSIGNED       DEFAULT NULL,   -- NULL = general check-in (no specific class)
  `course_id`     SMALLINT UNSIGNED  DEFAULT NULL,   -- denormalised for fast reporting
  `record_date`   DATE               NOT NULL,
  `check_in_time` DATETIME           DEFAULT NULL,
  `check_out_time` DATETIME          DEFAULT NULL,
  `status`        ENUM('present','late','absent','excused')
                                     NOT NULL DEFAULT 'absent',
  `method`        ENUM('face','pin','manual','imported')
                                     NOT NULL DEFAULT 'face',
  -- Face recognition metadata
  `confidence`    DECIMAL(5,4)       DEFAULT NULL,   -- 0.0000 – 1.0000
  `template_id`   INT UNSIGNED       DEFAULT NULL,   -- which template matched
  `camera_id`     SMALLINT UNSIGNED  DEFAULT NULL,
  -- Location metadata (mobile check-in)
  `location_lat`  DECIMAL(10,7)      DEFAULT NULL,
  `location_lng`  DECIMAL(10,7)      DEFAULT NULL,
  `location_accuracy_m` SMALLINT UNSIGNED DEFAULT NULL,
  `geofence_id`   SMALLINT UNSIGNED  DEFAULT NULL,
  `distance_m`    SMALLINT UNSIGNED  DEFAULT NULL,   -- distance from geofence centre
  `location_label` VARCHAR(80)       DEFAULT NULL,   -- "Main Gate A"
  -- Sync metadata
  `device_id`     INT UNSIGNED       DEFAULT NULL,
  `synced_at`     TIMESTAMP          DEFAULT NULL,   -- NULL = captured offline, not yet synced
  `is_offline_capture` TINYINT(1)    NOT NULL DEFAULT 0,
  -- Audit
  `reviewed_by`   INT UNSIGNED       DEFAULT NULL,   -- user who manually changed this
  `reviewed_at`   TIMESTAMP          DEFAULT NULL,
  `notes`         VARCHAR(255)       DEFAULT NULL,
  `created_at`    TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  -- Most critical index: daily log per school
  KEY `idx_att_school_date` (`school_id`, `record_date`),
  -- Student history
  KEY `idx_att_student_date` (`student_id`, `record_date`),
  -- Session-level attendance (for per-class reports)
  KEY `idx_att_session` (`session_id`),
  -- Course-level reports
  KEY `idx_att_course_date` (`course_id`, `record_date`),
  -- Offline sync queue check
  KEY `idx_att_synced` (`synced_at`, `is_offline_capture`),
  CONSTRAINT `fk_att_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  CONSTRAINT `fk_att_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `fk_att_session` FOREIGN KEY (`session_id`) REFERENCES `course_sessions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_att_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_att_template` FOREIGN KEY (`template_id`) REFERENCES `face_templates` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_att_camera` FOREIGN KEY (`camera_id`) REFERENCES `cameras` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_att_geofence` FOREIGN KEY (`geofence_id`) REFERENCES `geofence_zones` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_att_device` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_att_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SECTION 7 · LEAVE REQUESTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS `leave_requests` (
  `id`            INT UNSIGNED       NOT NULL AUTO_INCREMENT,
  `school_id`     SMALLINT UNSIGNED  NOT NULL,
  `student_id`    INT UNSIGNED       NOT NULL,
  `requested_by`  INT UNSIGNED       DEFAULT NULL,   -- user (admin/guardian) or NULL = student self
  `date_from`     DATE               NOT NULL,
  `date_to`       DATE               NOT NULL,
  `reason`        VARCHAR(500)       NOT NULL,
  `type`          ENUM('medical','family','school_event','personal','other')
                                     NOT NULL DEFAULT 'personal',
  `status`        ENUM('pending','approved','declined','cancelled')
                                     NOT NULL DEFAULT 'pending',
  `reviewed_by`   INT UNSIGNED       DEFAULT NULL,
  `reviewed_at`   TIMESTAMP          DEFAULT NULL,
  `review_notes`  VARCHAR(255)       DEFAULT NULL,
  `submitted_at`  TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_leave_school` (`school_id`, `status`),
  KEY `idx_leave_student` (`student_id`),
  KEY `idx_leave_dates` (`date_from`, `date_to`),
  CONSTRAINT `fk_leave_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  CONSTRAINT `fk_leave_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_leave_requestedby` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_leave_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SECTION 8 · NOTIFICATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS `notification_rules` (
  `id`            SMALLINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `school_id`     SMALLINT UNSIGNED  NOT NULL,
  `event_type`    ENUM('absent','late','consecutive_absent','leave_submitted',
                       'leave_reviewed','camera_offline','recognition_low',
                       'sync_complete','system')
                                     NOT NULL,
  `threshold`     TINYINT UNSIGNED   DEFAULT NULL,   -- e.g. 3 for consecutive absences
  `notify_admin`  TINYINT(1)         NOT NULL DEFAULT 1,
  `notify_teacher` TINYINT(1)        NOT NULL DEFAULT 1,
  `notify_guardian_email` TINYINT(1) NOT NULL DEFAULT 1,
  `notify_guardian_sms`  TINYINT(1)  NOT NULL DEFAULT 0,
  `is_active`     TINYINT(1)         NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_rule_school` (`school_id`),
  CONSTRAINT `fk_rule_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notifications` (
  `id`            BIGINT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `school_id`     SMALLINT UNSIGNED  NOT NULL,
  `type`          ENUM('absent','late','leave','system','ok','camera','sync')
                                     NOT NULL,
  `title`         VARCHAR(120)       NOT NULL,
  `body`          VARCHAR(500)       DEFAULT NULL,
  `student_id`    INT UNSIGNED       DEFAULT NULL,
  `user_id`       INT UNSIGNED       DEFAULT NULL,   -- target recipient (admin/teacher)
  `is_read`       TINYINT(1)         NOT NULL DEFAULT 0,
  `read_at`       TIMESTAMP          DEFAULT NULL,
  `created_at`    TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notif_user` (`user_id`, `is_read`),
  KEY `idx_notif_school` (`school_id`, `created_at`),
  KEY `idx_notif_student` (`student_id`),
  CONSTRAINT `fk_notif_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notif_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SECTION 9 · DEVICES & OFFLINE SYNC
-- =============================================================================

CREATE TABLE IF NOT EXISTS `devices` (
  `id`            INT UNSIGNED       NOT NULL AUTO_INCREMENT,
  `school_id`     SMALLINT UNSIGNED  NOT NULL,
  `device_uuid`   VARCHAR(36)        NOT NULL,        -- UUID v4
  `type`          ENUM('kiosk','mobile_ios','mobile_android','web')
                                     NOT NULL DEFAULT 'kiosk',
  `label`         VARCHAR(80)        DEFAULT NULL,    -- "Kiosk · Main A1"
  `camera_id`     SMALLINT UNSIGNED  DEFAULT NULL,   -- kiosk's assigned camera
  `os_version`    VARCHAR(40)        DEFAULT NULL,
  `app_version`   VARCHAR(20)        DEFAULT NULL,
  `is_active`     TINYINT(1)         NOT NULL DEFAULT 1,
  `last_online_at` TIMESTAMP         DEFAULT NULL,
  `last_sync_at`  TIMESTAMP          DEFAULT NULL,
  `created_at`    TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_device_uuid` (`device_uuid`),
  KEY `idx_device_school` (`school_id`),
  CONSTRAINT `fk_device_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_device_camera` FOREIGN KEY (`camera_id`) REFERENCES `cameras` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Offline-captured check-ins waiting to be synced to attendance_records
CREATE TABLE IF NOT EXISTS `offline_queue` (
  `id`            BIGINT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `school_id`     SMALLINT UNSIGNED  NOT NULL,
  `device_id`     INT UNSIGNED       NOT NULL,
  `student_id`    INT UNSIGNED       NOT NULL,
  `captured_at`   DATETIME           NOT NULL,       -- timestamp on the device when captured
  `confidence`    DECIMAL(5,4)       DEFAULT NULL,
  `method`        ENUM('face','pin') NOT NULL DEFAULT 'face',
  `location_lat`  DECIMAL(10,7)      DEFAULT NULL,
  `location_lng`  DECIMAL(10,7)      DEFAULT NULL,
  `raw_payload`   JSON               DEFAULT NULL,   -- full device payload for audit
  `status`        ENUM('queued','synced','conflict','rejected')
                                     NOT NULL DEFAULT 'queued',
  `attendance_record_id` BIGINT UNSIGNED DEFAULT NULL,  -- set after sync
  `synced_at`     TIMESTAMP          DEFAULT NULL,
  `conflict_reason` VARCHAR(255)     DEFAULT NULL,
  `created_at`    TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_queue_device` (`device_id`, `status`),
  KEY `idx_queue_student` (`student_id`),
  KEY `idx_queue_school` (`school_id`, `status`),
  CONSTRAINT `fk_queue_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  CONSTRAINT `fk_queue_device` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`),
  CONSTRAINT `fk_queue_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sync operation log (one row per device sync attempt)
CREATE TABLE IF NOT EXISTS `sync_logs` (
  `id`            INT UNSIGNED       NOT NULL AUTO_INCREMENT,
  `device_id`     INT UNSIGNED       NOT NULL,
  `started_at`    TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at`  TIMESTAMP          DEFAULT NULL,
  `events_total`  SMALLINT UNSIGNED  NOT NULL DEFAULT 0,
  `events_synced` SMALLINT UNSIGNED  NOT NULL DEFAULT 0,
  `events_conflict` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `status`        ENUM('in_progress','complete','failed') NOT NULL DEFAULT 'in_progress',
  `error_message` VARCHAR(255)       DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_synclog_device` (`device_id`),
  CONSTRAINT `fk_synclog_device` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SECTION 10 · RECOGNITION SETTINGS
-- =============================================================================

-- One row per school; upsert on change
CREATE TABLE IF NOT EXISTS `recognition_settings` (
  `school_id`     SMALLINT UNSIGNED  NOT NULL,
  `confidence_threshold` DECIMAL(4,3) NOT NULL DEFAULT 0.960,
  `liveness_detection`   TINYINT(1)  NOT NULL DEFAULT 1,
  `mask_tolerance`        TINYINT(1) NOT NULL DEFAULT 1,
  `multi_angle_template`  TINYINT(1) NOT NULL DEFAULT 1,
  `auto_retrain`          TINYINT(1) NOT NULL DEFAULT 0,
  `retrain_interval_days` TINYINT UNSIGNED NOT NULL DEFAULT 30,
  `anonymous_metrics`     TINYINT(1) NOT NULL DEFAULT 0,
  `offline_cache_weeks`   TINYINT UNSIGNED NOT NULL DEFAULT 4,
  `pin_fallback_digits`   TINYINT UNSIGNED NOT NULL DEFAULT 4,
  `auto_retry_sync_seconds` SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  `updated_at`    TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`school_id`),
  CONSTRAINT `fk_recog_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET foreign_key_checks = 1;

-- =============================================================================
-- SECTION 11 · VIEWS (reporting shortcuts)
-- =============================================================================

-- Today's attendance summary per school
CREATE OR REPLACE VIEW `v_today_summary` AS
SELECT
  ar.school_id,
  ar.record_date,
  COUNT(*)                                                  AS total_records,
  SUM(ar.status = 'present')                                AS present_count,
  SUM(ar.status = 'late')                                   AS late_count,
  SUM(ar.status = 'absent')                                 AS absent_count,
  SUM(ar.status = 'excused')                                AS excused_count,
  ROUND(SUM(ar.status IN ('present','late')) / COUNT(*) * 100, 1) AS attendance_pct
FROM `attendance_records` ar
WHERE ar.record_date = CURDATE()
GROUP BY ar.school_id, ar.record_date;

-- Per-student attendance rate for the current term
CREATE OR REPLACE VIEW `v_student_attendance_rate` AS
SELECT
  ar.school_id,
  ar.student_id,
  s.first_name,
  s.last_name,
  s.student_code,
  g.label                                                    AS grade,
  COUNT(*)                                                   AS total_sessions,
  SUM(ar.status IN ('present','late'))                       AS attended,
  ROUND(SUM(ar.status IN ('present','late')) / COUNT(*) * 100, 1) AS attendance_pct
FROM `attendance_records` ar
JOIN `students` s ON s.id = ar.student_id
LEFT JOIN `grades` g ON g.id = s.grade_id
GROUP BY ar.school_id, ar.student_id, s.first_name, s.last_name, s.student_code, g.label;

-- Devices with unsynced events
CREATE OR REPLACE VIEW `v_offline_queue_summary` AS
SELECT
  d.school_id,
  d.id      AS device_id,
  d.label   AS device_label,
  d.type    AS device_type,
  COUNT(oq.id)                          AS queued_count,
  MIN(oq.captured_at)                   AS oldest_event,
  d.last_sync_at
FROM `devices` d
LEFT JOIN `offline_queue` oq ON oq.device_id = d.id AND oq.status = 'queued'
GROUP BY d.school_id, d.id, d.label, d.type, d.last_sync_at;

-- =============================================================================
-- SECTION 12 · SEED DATA (demo school + admin)
-- =============================================================================

INSERT IGNORE INTO `schools` (`id`, `name`, `subdomain`, `timezone`) VALUES
  (1, 'University of the Visayas', 'uv', 'Asia/Manila');

-- Default recognition settings for the demo school
INSERT IGNORE INTO `recognition_settings` (`school_id`) VALUES (1);

-- Default admin user  (password: Admin@1234  — change immediately after first login)
-- Hash is bcrypt cost-12 of "Admin@1234" ($2b$ == $2y$ in PHP password_verify)
INSERT IGNORE INTO `users`
  (`school_id`, `employee_code`, `first_name`, `last_name`, `email`, `password_hash`, `role`)
VALUES
  (1, 'ADM001', 'UV', 'Admin', 'admin@uv.edu.ph',
   '$2b$12$FxYSv8ip9umxUET2rSxTtesB69Q0JI3SeaWS6M2sUyCaeeE0kCak.',
   'admin');

-- Grade sections
INSERT IGNORE INTO `grades` (`school_id`, `label`, `year_level`) VALUES
  (1,'10A',10),(1,'10B',10),(1,'11A',11),(1,'11B',11),(1,'12A',12),(1,'12B',12);

-- Campus geofence
INSERT IGNORE INTO `geofence_zones`
  (`school_id`, `name`, `latitude`, `longitude`, `radius_meters`)
VALUES
  (1, 'UV Main Campus', 10.3157000, 123.8854000, 150);

-- Camera network
INSERT IGNORE INTO `cameras` (`school_id`, `code`, `label`, `location`, `status`) VALUES
  (1,'A1','Main · A1',  'Main Entrance',  'online'),
  (1,'B2','North · B2', 'North Wing',     'online'),
  (1,'C1','East · C1',  'East Courtyard', 'recalibrating'),
  (1,'D2','Library · D2','Library',       'online');

-- Notification rules (all on by default)
INSERT IGNORE INTO `notification_rules`
  (`school_id`, `event_type`, `threshold`, `notify_admin`, `notify_teacher`, `notify_guardian_email`)
VALUES
  (1, 'absent',             NULL, 1, 1, 1),
  (1, 'late',               NULL, 1, 1, 0),
  (1, 'consecutive_absent',    3, 1, 1, 1),
  (1, 'leave_submitted',    NULL, 1, 0, 0),
  (1, 'camera_offline',     NULL, 1, 0, 0),
  (1, 'sync_complete',      NULL, 1, 0, 0);
