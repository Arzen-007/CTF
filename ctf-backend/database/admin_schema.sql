-- Enhanced Admin Panel Schema for Green Eco CTF Platform
-- Additional tables and modifications for comprehensive admin functionality

-- --------------------------------------------------------

-- Table structure for table `admin_users`
CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin','admin','moderator') DEFAULT 'admin',
  `enabled` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `login_attempts` int(11) DEFAULT 0,
  `locked_until` timestamp NULL DEFAULT NULL,
  `two_factor_secret` varchar(255) DEFAULT NULL,
  `two_factor_enabled` tinyint(1) DEFAULT 0,
  `ip_whitelist` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user
INSERT INTO `admin_users` (`username`, `email`, `password`, `role`) VALUES
('admin', 'admin@greenctf.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin');
-- Password: admin123

-- --------------------------------------------------------

-- Table structure for table `admin_sessions`
CREATE TABLE `admin_sessions` (
  `id` varchar(128) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  KEY `last_activity` (`last_activity`),
  CONSTRAINT `admin_sessions_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `admin_activity_log`
CREATE TABLE `admin_activity_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `target_type` varchar(50) DEFAULT NULL,
  `target_id` int(11) DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  KEY `action` (`action`),
  KEY `target_type` (`target_type`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `admin_activity_log_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Enhanced challenges table with additional fields
ALTER TABLE `challenges` ADD COLUMN `challenge_type` enum('static','file','web','docker','dynamic') DEFAULT 'static';
ALTER TABLE `challenges` ADD COLUMN `target_url` varchar(500) DEFAULT NULL;
ALTER TABLE `challenges` ADD COLUMN `docker_image` varchar(255) DEFAULT NULL;
ALTER TABLE `challenges` ADD COLUMN `port_mapping` varchar(100) DEFAULT NULL;
ALTER TABLE `challenges` ADD COLUMN `instance_template` text DEFAULT NULL;
ALTER TABLE `challenges` ADD COLUMN `prerequisites` text DEFAULT NULL;
ALTER TABLE `challenges` ADD COLUMN `solution_notes` text DEFAULT NULL;
ALTER TABLE `challenges` ADD COLUMN `first_blood_bonus` int(11) DEFAULT 0;
ALTER TABLE `challenges` ADD COLUMN `decay_minimum` int(11) DEFAULT NULL;
ALTER TABLE `challenges` ADD COLUMN `decay_function` enum('linear','logarithmic','exponential') DEFAULT 'linear';

-- --------------------------------------------------------

-- Table structure for table `challenge_files`
CREATE TABLE `challenge_files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `challenge_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_hash` varchar(64) NOT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `download_count` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `challenge_id` (`challenge_id`),
  CONSTRAINT `challenge_files_ibfk_1` FOREIGN KEY (`challenge_id`) REFERENCES `challenges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `challenge_instances`
CREATE TABLE `challenge_instances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `challenge_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `container_id` varchar(255) DEFAULT NULL,
  `port` int(11) DEFAULT NULL,
  `status` enum('starting','running','stopped','error') DEFAULT 'starting',
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `challenge_user` (`challenge_id`, `user_id`),
  KEY `user_id` (`user_id`),
  KEY `status` (`status`),
  KEY `expires_at` (`expires_at`),
  CONSTRAINT `challenge_instances_ibfk_1` FOREIGN KEY (`challenge_id`) REFERENCES `challenges` (`id`) ON DELETE CASCADE,
  CONSTRAINT `challenge_instances_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `announcements`
CREATE TABLE `announcements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `type` enum('info','warning','success','error') DEFAULT 'info',
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `target_audience` enum('all','users','teams','admins') DEFAULT 'all',
  `enabled` tinyint(1) DEFAULT 1,
  `dismissible` tinyint(1) DEFAULT 1,
  `auto_dismiss` int(11) DEFAULT NULL,
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `enabled` (`enabled`),
  KEY `scheduled_at` (`scheduled_at`),
  KEY `expires_at` (`expires_at`),
  CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `teams`
CREATE TABLE `teams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `captain_id` int(11) NOT NULL,
  `invite_code` varchar(32) DEFAULT NULL,
  `max_members` int(11) DEFAULT 4,
  `country_id` int(11) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `affiliation` varchar(255) DEFAULT NULL,
  `enabled` tinyint(1) DEFAULT 1,
  `competing` tinyint(1) DEFAULT 1,
  `points` int(11) DEFAULT 0,
  `last_solve` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `invite_code` (`invite_code`),
  KEY `captain_id` (`captain_id`),
  KEY `country_id` (`country_id`),
  KEY `enabled` (`enabled`),
  KEY `competing` (`competing`),
  KEY `points` (`points`),
  CONSTRAINT `teams_ibfk_1` FOREIGN KEY (`captain_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teams_ibfk_2` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `team_members`
CREATE TABLE `team_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `team_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('member','captain') DEFAULT 'member',
  `joined_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `team_id` (`team_id`),
  CONSTRAINT `team_members_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `team_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `scoreboard_freeze`
CREATE TABLE `scoreboard_freeze` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `freeze_time` timestamp NOT NULL,
  `unfreeze_time` timestamp NULL DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `scoreboard_freeze_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `platform_statistics`
CREATE TABLE `platform_statistics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `metric_name` varchar(100) NOT NULL,
  `metric_value` bigint(20) NOT NULL,
  `metric_type` enum('counter','gauge','histogram') DEFAULT 'gauge',
  `tags` json DEFAULT NULL,
  `recorded_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `metric_name` (`metric_name`),
  KEY `recorded_at` (`recorded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `backup_logs`
CREATE TABLE `backup_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `backup_type` enum('full','incremental','challenges','users') NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `checksum` varchar(64) DEFAULT NULL,
  `status` enum('started','completed','failed') DEFAULT 'started',
  `error_message` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `backup_type` (`backup_type`),
  KEY `status` (`status`),
  KEY `created_by` (`created_by`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `backup_logs_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Table structure for table `security_events`
CREATE TABLE `security_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_type` varchar(100) NOT NULL,
  `severity` enum('low','medium','high','critical') DEFAULT 'medium',
  `source_ip` varchar(45) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `description` text NOT NULL,
  `metadata` json DEFAULT NULL,
  `resolved` tinyint(1) DEFAULT 0,
  `resolved_by` int(11) DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `event_type` (`event_type`),
  KEY `severity` (`severity`),
  KEY `source_ip` (`source_ip`),
  KEY `user_id` (`user_id`),
  KEY `admin_id` (`admin_id`),
  KEY `resolved` (`resolved`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `security_events_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `security_events_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `security_events_ibfk_3` FOREIGN KEY (`resolved_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Enhanced config table with admin-specific settings
INSERT INTO `config` (`key`, `value`, `description`, `type`) VALUES
('admin_session_timeout', '3600', 'Admin session timeout in seconds', 'integer'),
('admin_2fa_required', '0', 'Require 2FA for admin accounts', 'boolean'),
('admin_ip_whitelist_enabled', '0', 'Enable IP whitelist for admin access', 'boolean'),
('challenge_auto_backup', '1', 'Automatically backup challenges', 'boolean'),
('max_file_upload_size', '10485760', 'Maximum file upload size in bytes (10MB)', 'integer'),
('allowed_file_types', 'zip,tar,gz,txt,pdf,png,jpg,jpeg,gif,py,c,cpp,java,js,html,css,php,rb,go,rs', 'Allowed file extensions for uploads', 'string'),
('docker_enabled', '0', 'Enable Docker challenge instances', 'boolean'),
('docker_registry', 'registry.hub.docker.com', 'Docker registry URL', 'string'),
('instance_timeout', '3600', 'Challenge instance timeout in seconds', 'integer'),
('max_instances_per_user', '3', 'Maximum concurrent instances per user', 'integer'),
('scoreboard_freeze_enabled', '0', 'Enable scoreboard freezing', 'boolean'),
('first_blood_multiplier', '1.5', 'First blood point multiplier', 'string'),
('dynamic_scoring_enabled', '0', 'Enable dynamic scoring based on solves', 'boolean'),
('min_challenge_points', '50', 'Minimum points for any challenge', 'integer'),
('max_challenge_points', '1000', 'Maximum points for any challenge', 'integer'),
('announcement_auto_refresh', '30', 'Announcement refresh interval in seconds', 'integer'),
('security_log_retention', '90', 'Security log retention period in days', 'integer'),
('backup_retention', '30', 'Backup retention period in days', 'integer'),
('rate_limit_submissions', '10', 'Max submissions per minute per user', 'integer'),
('rate_limit_downloads', '20', 'Max file downloads per minute per user', 'integer');

-- Create additional indexes for performance
CREATE INDEX idx_admin_activity_log_admin_action ON admin_activity_log (admin_id, action);
CREATE INDEX idx_admin_activity_log_target ON admin_activity_log (target_type, target_id);
CREATE INDEX idx_challenge_files_challenge ON challenge_files (challenge_id);
CREATE INDEX idx_challenge_instances_user_status ON challenge_instances (user_id, status);
CREATE INDEX idx_teams_points_desc ON teams (points DESC);
CREATE INDEX idx_team_members_team ON team_members (team_id);
CREATE INDEX idx_announcements_enabled_scheduled ON announcements (enabled, scheduled_at);
CREATE INDEX idx_security_events_severity_resolved ON security_events (severity, resolved);
CREATE INDEX idx_platform_statistics_name_time ON platform_statistics (metric_name, recorded_at);

-- Create views for common admin queries
CREATE VIEW `admin_dashboard_stats` AS
SELECT 
  (SELECT COUNT(*) FROM users WHERE enabled = 1) as total_users,
  (SELECT COUNT(*) FROM teams WHERE enabled = 1) as total_teams,
  (SELECT COUNT(*) FROM challenges WHERE enabled = 1) as total_challenges,
  (SELECT COUNT(*) FROM submissions WHERE correct = 1) as total_solves,
  (SELECT COUNT(*) FROM submissions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as solves_24h,
  (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as new_users_24h,
  (SELECT COUNT(*) FROM security_events WHERE resolved = 0) as unresolved_security_events;

CREATE VIEW `challenge_statistics` AS
SELECT 
  c.id,
  c.title,
  c.points,
  cat.title as category,
  c.difficulty,
  COUNT(DISTINCT s.user_id) as solve_count,
  COUNT(s.id) as total_attempts,
  ROUND(COUNT(DISTINCT CASE WHEN s.correct = 1 THEN s.user_id END) * 100.0 / COUNT(DISTINCT s.user_id), 2) as solve_rate,
  MIN(CASE WHEN s.correct = 1 THEN s.created_at END) as first_solve,
  MAX(CASE WHEN s.correct = 1 THEN s.created_at END) as last_solve
FROM challenges c
LEFT JOIN categories cat ON c.category_id = cat.id
LEFT JOIN submissions s ON c.id = s.challenge_id
WHERE c.enabled = 1
GROUP BY c.id, c.title, c.points, cat.title, c.difficulty;

CREATE VIEW `user_activity_summary` AS
SELECT 
  u.id,
  u.email,
  u.team_name,
  u.points,
  u.created_at as registered_at,
  u.last_active,
  COUNT(DISTINCT s.challenge_id) as challenges_solved,
  COUNT(s.id) as total_submissions,
  ROUND(COUNT(CASE WHEN s.correct = 1 THEN 1 END) * 100.0 / COUNT(s.id), 2) as success_rate
FROM users u
LEFT JOIN submissions s ON u.id = s.user_id
WHERE u.enabled = 1
GROUP BY u.id, u.email, u.team_name, u.points, u.created_at, u.last_active;

COMMIT;

