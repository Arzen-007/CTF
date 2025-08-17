-- SQLite-compatible Enhanced Admin Panel Schema for Green Eco CTF Platform

-- --------------------------------------------------------

-- Table structure for table `admin_users`
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `username` TEXT NOT NULL UNIQUE,
  `email` TEXT NOT NULL UNIQUE,
  `password` TEXT NOT NULL,
  `role` TEXT DEFAULT 'admin' CHECK(role IN ('super_admin','admin','moderator')),
  `enabled` INTEGER DEFAULT 1,
  `last_login` DATETIME DEFAULT NULL,
  `login_attempts` INTEGER DEFAULT 0,
  `locked_until` DATETIME DEFAULT NULL,
  `two_factor_secret` TEXT DEFAULT NULL,
  `two_factor_enabled` INTEGER DEFAULT 0,
  `ip_whitelist` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT OR IGNORE INTO `admin_users` (`username`, `email`, `password`, `role`) VALUES
('admin', 'admin@greenctf.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin');

-- --------------------------------------------------------

-- Table structure for table `admin_sessions`
CREATE TABLE IF NOT EXISTS `admin_sessions` (
  `id` TEXT PRIMARY KEY,
  `admin_id` INTEGER NOT NULL,
  `ip_address` TEXT DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `payload` TEXT NOT NULL,
  `last_activity` INTEGER NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`admin_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE
);

-- --------------------------------------------------------

-- Table structure for table `admin_activity_log`
CREATE TABLE IF NOT EXISTS `admin_activity_log` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `admin_id` INTEGER NOT NULL,
  `action` TEXT NOT NULL,
  `description` TEXT NOT NULL,
  `target_type` TEXT DEFAULT NULL,
  `target_id` INTEGER DEFAULT NULL,
  `old_values` TEXT DEFAULT NULL,
  `new_values` TEXT DEFAULT NULL,
  `ip_address` TEXT DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`admin_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE
);

-- --------------------------------------------------------

-- Enhanced challenges table with additional fields
-- First check if challenges table exists, if not create it
CREATE TABLE IF NOT EXISTS `challenges` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `title` TEXT NOT NULL,
  `description` TEXT NOT NULL,
  `flag` TEXT NOT NULL,
  `points` INTEGER NOT NULL DEFAULT 100,
  `category_id` INTEGER NOT NULL,
  `enabled` INTEGER DEFAULT 1,
  `visible` INTEGER DEFAULT 1,
  `file_name` TEXT DEFAULT NULL,
  `file_path` TEXT DEFAULT NULL,
  `file_size` INTEGER DEFAULT NULL,
  `file_hash` TEXT DEFAULT NULL,
  `author` TEXT DEFAULT NULL,
  `difficulty` TEXT DEFAULT 'medium' CHECK(difficulty IN ('easy','medium','hard','expert')),
  `tags` TEXT DEFAULT NULL,
  `max_attempts` INTEGER DEFAULT NULL,
  `time_limit` INTEGER DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_by` INTEGER DEFAULT NULL,
  `challenge_type` TEXT DEFAULT 'static' CHECK(challenge_type IN ('static','file','web','docker','dynamic')),
  `target_url` TEXT DEFAULT NULL,
  `docker_image` TEXT DEFAULT NULL,
  `port_mapping` TEXT DEFAULT NULL,
  `instance_template` TEXT DEFAULT NULL,
  `prerequisites` TEXT DEFAULT NULL,
  `solution_notes` TEXT DEFAULT NULL,
  `first_blood_bonus` INTEGER DEFAULT 0,
  `decay_minimum` INTEGER DEFAULT NULL,
  `decay_function` TEXT DEFAULT 'linear' CHECK(decay_function IN ('linear','logarithmic','exponential'))
);

-- --------------------------------------------------------

-- Table structure for table `categories`
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `title` TEXT NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `icon` TEXT DEFAULT NULL,
  `color` TEXT DEFAULT '#00ff88',
  `enabled` INTEGER DEFAULT 1,
  `sort_order` INTEGER DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------

-- Table structure for table `challenge_files`
CREATE TABLE IF NOT EXISTS `challenge_files` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `challenge_id` INTEGER NOT NULL,
  `filename` TEXT NOT NULL,
  `original_filename` TEXT NOT NULL,
  `file_path` TEXT NOT NULL,
  `file_size` INTEGER NOT NULL,
  `file_hash` TEXT NOT NULL,
  `mime_type` TEXT DEFAULT NULL,
  `download_count` INTEGER DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`challenge_id`) REFERENCES `challenges` (`id`) ON DELETE CASCADE
);

-- --------------------------------------------------------

-- Table structure for table `challenge_instances`
CREATE TABLE IF NOT EXISTS `challenge_instances` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `challenge_id` INTEGER NOT NULL,
  `user_id` INTEGER NOT NULL,
  `container_id` TEXT DEFAULT NULL,
  `port` INTEGER DEFAULT NULL,
  `status` TEXT DEFAULT 'starting' CHECK(status IN ('starting','running','stopped','error')),
  `expires_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`challenge_id`) REFERENCES `challenges` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  UNIQUE(`challenge_id`, `user_id`)
);

-- --------------------------------------------------------

-- Table structure for table `announcements`
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `title` TEXT NOT NULL,
  `content` TEXT NOT NULL,
  `type` TEXT DEFAULT 'info' CHECK(type IN ('info','warning','success','error')),
  `priority` TEXT DEFAULT 'normal' CHECK(priority IN ('low','normal','high','urgent')),
  `target_audience` TEXT DEFAULT 'all' CHECK(target_audience IN ('all','users','teams','admins')),
  `enabled` INTEGER DEFAULT 1,
  `dismissible` INTEGER DEFAULT 1,
  `auto_dismiss` INTEGER DEFAULT NULL,
  `scheduled_at` DATETIME DEFAULT NULL,
  `expires_at` DATETIME DEFAULT NULL,
  `created_by` INTEGER NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE
);

-- --------------------------------------------------------

-- Table structure for table `users`
CREATE TABLE IF NOT EXISTS `users` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `email` TEXT NOT NULL UNIQUE,
  `password` TEXT NOT NULL,
  `team_name` TEXT NOT NULL UNIQUE,
  `country_id` INTEGER DEFAULT NULL,
  `enabled` INTEGER DEFAULT 1,
  `competing` INTEGER DEFAULT 1,
  `user_type` TEXT DEFAULT 'user' CHECK(user_type IN ('user','moderator','admin')),
  `points` INTEGER DEFAULT 0,
  `last_active` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `email_verified` INTEGER DEFAULT 0,
  `email_verification_token` TEXT DEFAULT NULL,
  `password_reset_token` TEXT DEFAULT NULL,
  `password_reset_expires` DATETIME DEFAULT NULL,
  `two_factor_secret` TEXT DEFAULT NULL,
  `two_factor_enabled` INTEGER DEFAULT 0,
  `login_attempts` INTEGER DEFAULT 0,
  `locked_until` DATETIME DEFAULT NULL
);

-- --------------------------------------------------------

-- Table structure for table `submissions`
CREATE TABLE IF NOT EXISTS `submissions` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `user_id` INTEGER NOT NULL,
  `challenge_id` INTEGER NOT NULL,
  `flag` TEXT NOT NULL,
  `correct` INTEGER NOT NULL DEFAULT 0,
  `points_awarded` INTEGER DEFAULT 0,
  `ip_address` TEXT DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`challenge_id`) REFERENCES `challenges` (`id`) ON DELETE CASCADE
);

-- --------------------------------------------------------

-- Table structure for table `teams`
CREATE TABLE IF NOT EXISTS `teams` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` TEXT NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `captain_id` INTEGER NOT NULL,
  `invite_code` TEXT DEFAULT NULL UNIQUE,
  `max_members` INTEGER DEFAULT 4,
  `country_id` INTEGER DEFAULT NULL,
  `website` TEXT DEFAULT NULL,
  `affiliation` TEXT DEFAULT NULL,
  `enabled` INTEGER DEFAULT 1,
  `competing` INTEGER DEFAULT 1,
  `points` INTEGER DEFAULT 0,
  `last_solve` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`captain_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- --------------------------------------------------------

-- Table structure for table `team_members`
CREATE TABLE IF NOT EXISTS `team_members` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `team_id` INTEGER NOT NULL,
  `user_id` INTEGER NOT NULL UNIQUE,
  `role` TEXT DEFAULT 'member' CHECK(role IN ('member','captain')),
  `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- --------------------------------------------------------

-- Table structure for table `security_events`
CREATE TABLE IF NOT EXISTS `security_events` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `event_type` TEXT NOT NULL,
  `severity` TEXT DEFAULT 'medium' CHECK(severity IN ('low','medium','high','critical')),
  `source_ip` TEXT DEFAULT NULL,
  `user_id` INTEGER DEFAULT NULL,
  `admin_id` INTEGER DEFAULT NULL,
  `description` TEXT NOT NULL,
  `metadata` TEXT DEFAULT NULL,
  `resolved` INTEGER DEFAULT 0,
  `resolved_by` INTEGER DEFAULT NULL,
  `resolved_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`admin_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`resolved_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
);

-- --------------------------------------------------------

-- Table structure for table `config`
CREATE TABLE IF NOT EXISTS `config` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `key` TEXT NOT NULL UNIQUE,
  `value` TEXT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `type` TEXT DEFAULT 'string' CHECK(type IN ('string','integer','boolean','json')),
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------

-- Insert default categories
INSERT OR IGNORE INTO `categories` (`title`, `description`, `icon`, `color`) VALUES
('Web Security', 'Web application security challenges including SQL injection, XSS, and authentication bypasses', '⚡', '#00ff88'),
('Cryptography', 'Encryption, decryption, and cryptographic protocol challenges', '🌱', '#00cc66'),
('Forensics', 'Digital forensics, steganography, and data recovery challenges', '♻️', '#00aa44'),
('Reverse Engineering', 'Binary analysis, malware reverse engineering, and code analysis', '🌿', '#008833'),
('Static Analysis', 'Source code review, configuration analysis, and vulnerability assessment', '🍃', '#006622'),
('Pwn', 'Binary exploitation and buffer overflow challenges', '💥', '#ff6b35'),
('Misc', 'Miscellaneous challenges that don\'t fit other categories', '🔧', '#4ecdc4');

-- Insert default configuration
INSERT OR IGNORE INTO `config` (`key`, `value`, `description`, `type`) VALUES
('site_name', 'Green Eco CTF Platform', 'Name of the CTF platform', 'string'),
('site_description', 'Hack for a Greener Tomorrow', 'Description of the CTF platform', 'string'),
('registration_enabled', '1', 'Allow new user registrations', 'boolean'),
('competition_start', '2025-01-01 00:00:00', 'Competition start time', 'string'),
('competition_end', '2025-12-31 23:59:59', 'Competition end time', 'string'),
('scoreboard_visible', '1', 'Show scoreboard to users', 'boolean'),
('challenges_visible', '1', 'Show challenges to users', 'boolean'),
('max_team_size', '4', 'Maximum number of members per team', 'integer'),
('admin_session_timeout', '3600', 'Admin session timeout in seconds', 'integer'),
('admin_2fa_required', '0', 'Require 2FA for admin accounts', 'boolean'),
('max_file_upload_size', '10485760', 'Maximum file upload size in bytes (10MB)', 'integer'),
('allowed_file_types', 'zip,tar,gz,txt,pdf,png,jpg,jpeg,gif,py,c,cpp,java,js,html,css,php,rb,go,rs', 'Allowed file extensions for uploads', 'string'),
('rate_limit_submissions', '10', 'Max submissions per minute per user', 'integer'),
('first_blood_multiplier', '1.5', 'First blood point multiplier', 'string'),
('dynamic_scoring_enabled', '0', 'Enable dynamic scoring based on solves', 'boolean');

-- Insert sample challenges for demonstration
INSERT OR IGNORE INTO `challenges` (`title`, `description`, `flag`, `points`, `category_id`, `author`, `difficulty`, `tags`, `challenge_type`) VALUES
('Carbon Credit Portal', 'A fake carbon credit trading portal has been discovered. Find the hidden admin panel and extract sensitive information.', 'flag{green_admin_panel_discovered}', 100, 1, 'EcoSec Team', 'easy', 'web,sql,admin', 'web'),
('Solar Panel Telemetry', 'Analyze the solar panel monitoring system and find the flag hidden in the energy readings.', 'flag{solar_energy_data_leaked}', 150, 1, 'EcoSec Team', 'medium', 'web,api,energy', 'web'),
('Encrypted Waste Data', 'The waste management system uses a custom encryption algorithm. Decrypt the data to find the flag.', 'flag{waste_not_want_not}', 200, 2, 'EcoSec Team', 'medium', 'crypto,custom,environment', 'static'),
('Forest Satellite Images', 'Satellite images show illegal logging activity. Use forensic techniques to uncover the hidden message.', 'flag{save_the_forests}', 175, 3, 'EcoSec Team', 'medium', 'forensics,steganography,satellite', 'file'),
('Smart Thermostat Firmware', 'Reverse engineer the smart thermostat firmware to find the backdoor access code.', 'flag{smart_home_compromised}', 250, 4, 'EcoSec Team', 'hard', 'reverse,firmware,iot', 'file'),
('Green Energy Config', 'Review the configuration files of a green energy management system for security vulnerabilities.', 'flag{config_review_complete}', 125, 5, 'EcoSec Team', 'easy', 'static,config,review', 'static');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_action ON admin_activity_log (admin_id, action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_target ON admin_activity_log (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_challenge_files_challenge ON challenge_files (challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_instances_user_status ON challenge_instances (user_id, status);
CREATE INDEX IF NOT EXISTS idx_announcements_enabled_scheduled ON announcements (enabled, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_security_events_severity_resolved ON security_events (severity, resolved);
CREATE INDEX IF NOT EXISTS idx_challenges_category_points ON challenges (category_id, points);
CREATE INDEX IF NOT EXISTS idx_submissions_user_challenge ON submissions (user_id, challenge_id);
CREATE INDEX IF NOT EXISTS idx_users_points_desc ON users (points DESC);

