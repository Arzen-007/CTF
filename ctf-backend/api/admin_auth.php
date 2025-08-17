<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../includes/functions.php';

session_start();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

try {
    $db = new PDO("sqlite:" . __DIR__ . "/../database.db");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    switch ($method) {
        case 'POST':
            if (isset($input['action'])) {
                switch ($input['action']) {
                    case 'login':
                        handleAdminLogin($db, $input);
                        break;
                    case 'logout':
                        handleAdminLogout();
                        break;
                    case 'check_session':
                        checkAdminSession($db);
                        break;
                    case 'change_credentials':
                        handleChangeCredentials($db, $input);
                        break;
                    default:
                        throw new Exception('Invalid action');
                }
            } else {
                throw new Exception('Action not specified');
            }
            break;
        
        case 'GET':
            checkAdminSession($db);
            break;
            
        default:
            throw new Exception('Method not allowed');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

function handleAdminLogin($db, $input) {
    if (!isset($input['username']) || !isset($input['password'])) {
        throw new Exception('Username and password required');
    }
    
    $username = trim($input['username']);
    $password = $input['password'];
    
    // Check rate limiting
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    checkRateLimit($db, $ip, 'admin_login', 5, 300); // 5 attempts per 5 minutes
    
    // Get admin user
    $stmt = $db->prepare("SELECT * FROM admin_users WHERE username = ? AND enabled = 1");
    $stmt->execute([$username]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$admin) {
        logSecurityEvent($db, 'admin_login_failed', 'medium', $ip, null, null, "Failed login attempt for username: $username");
        throw new Exception('Invalid credentials');
    }
    
    // Check if account is locked
    if ($admin['locked_until'] && strtotime($admin['locked_until']) > time()) {
        logSecurityEvent($db, 'admin_login_locked', 'high', $ip, null, $admin['id'], "Login attempt on locked account: $username");
        throw new Exception('Account is temporarily locked');
    }
    
    // Verify password
    if (!password_verify($password, $admin['password'])) {
        // Increment login attempts
        $attempts = $admin['login_attempts'] + 1;
        $lockUntil = null;
        
        if ($attempts >= 5) {
            $lockUntil = date('Y-m-d H:i:s', time() + 1800); // Lock for 30 minutes
        }
        
        $stmt = $db->prepare("UPDATE admin_users SET login_attempts = ?, locked_until = ? WHERE id = ?");
        $stmt->execute([$attempts, $lockUntil, $admin['id']]);
        
        logSecurityEvent($db, 'admin_login_failed', 'medium', $ip, null, $admin['id'], "Failed password for username: $username (attempt $attempts)");
        throw new Exception('Invalid credentials');
    }
    
    // Reset login attempts on successful login
    $stmt = $db->prepare("UPDATE admin_users SET login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE id = ?");
    $stmt->execute([$admin['id']]);
    
    // Create admin session
    $sessionId = bin2hex(random_bytes(32));
    $sessionData = json_encode([
        'admin_id' => $admin['id'],
        'username' => $admin['username'],
        'role' => $admin['role'],
        'login_time' => time()
    ]);
    
    $stmt = $db->prepare("INSERT INTO admin_sessions (id, admin_id, ip_address, user_agent, payload, last_activity) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $sessionId,
        $admin['id'],
        $ip,
        $_SERVER['HTTP_USER_AGENT'] ?? '',
        $sessionData,
        time()
    ]);
    
    // Set session cookie
    $_SESSION['admin_session_id'] = $sessionId;
    $_SESSION['admin_id'] = $admin['id'];
    $_SESSION['admin_username'] = $admin['username'];
    $_SESSION['admin_role'] = $admin['role'];
    
    // Log successful login
    logAdminActivity($db, $admin['id'], 'login', "Admin logged in successfully", null, null, null, null, $ip);
    
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'admin' => [
            'id' => $admin['id'],
            'username' => $admin['username'],
            'email' => $admin['email'],
            'role' => $admin['role']
        ]
    ]);
}

function handleAdminLogout() {
    if (isset($_SESSION['admin_session_id'])) {
        // Remove session from database
        try {
            $db = new PDO("sqlite:" . __DIR__ . "/../database.db");
            $stmt = $db->prepare("DELETE FROM admin_sessions WHERE id = ?");
            $stmt->execute([$_SESSION['admin_session_id']]);
            
            if (isset($_SESSION['admin_id'])) {
                logAdminActivity($db, $_SESSION['admin_id'], 'logout', "Admin logged out", null, null, null, null, $_SERVER['REMOTE_ADDR'] ?? 'unknown');
            }
        } catch (Exception $e) {
            // Continue with logout even if DB operation fails
        }
    }
    
    // Clear session
    session_unset();
    session_destroy();
    
    echo json_encode([
        'success' => true,
        'message' => 'Logout successful'
    ]);
}

function checkAdminSession($db) {
    if (!isset($_SESSION['admin_session_id']) || !isset($_SESSION['admin_id'])) {
        throw new Exception('Not authenticated');
    }
    
    $sessionId = $_SESSION['admin_session_id'];
    $adminId = $_SESSION['admin_id'];
    
    // Verify session in database
    $stmt = $db->prepare("SELECT s.*, a.enabled, a.role FROM admin_sessions s JOIN admin_users a ON s.admin_id = a.id WHERE s.id = ? AND s.admin_id = ?");
    $stmt->execute([$sessionId, $adminId]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$session) {
        session_unset();
        session_destroy();
        throw new Exception('Invalid session');
    }
    
    if (!$session['enabled']) {
        session_unset();
        session_destroy();
        throw new Exception('Account disabled');
    }
    
    // Check session timeout (default 1 hour)
    $timeout = 3600; // Get from config
    if (time() - $session['last_activity'] > $timeout) {
        $stmt = $db->prepare("DELETE FROM admin_sessions WHERE id = ?");
        $stmt->execute([$sessionId]);
        session_unset();
        session_destroy();
        throw new Exception('Session expired');
    }
    
    // Update last activity
    $stmt = $db->prepare("UPDATE admin_sessions SET last_activity = ? WHERE id = ?");
    $stmt->execute([time(), $sessionId]);
    
    echo json_encode([
        'success' => true,
        'admin' => [
            'id' => $adminId,
            'username' => $_SESSION['admin_username'],
            'role' => $_SESSION['admin_role']
        ]
    ]);
}

function handleChangeCredentials($db, $input) {
    // Check admin session first
    if (!isset($_SESSION['admin_id'])) {
        throw new Exception('Not authenticated');
    }
    
    $adminId = $_SESSION['admin_id'];
    
    // Get current admin data
    $stmt = $db->prepare("SELECT * FROM admin_users WHERE id = ?");
    $stmt->execute([$adminId]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$admin) {
        throw new Exception('Admin not found');
    }
    
    // Verify current password
    if (!isset($input['current_password']) || !password_verify($input['current_password'], $admin['password'])) {
        logSecurityEvent($db, 'admin_credential_change_failed', 'medium', $_SERVER['REMOTE_ADDR'] ?? 'unknown', null, $adminId, "Failed credential change attempt - invalid current password");
        throw new Exception('Current password is incorrect');
    }
    
    $updates = [];
    $params = [];
    $oldValues = [];
    $newValues = [];
    
    // Update username if provided
    if (isset($input['new_username']) && $input['new_username'] !== $admin['username']) {
        $newUsername = trim($input['new_username']);
        if (empty($newUsername)) {
            throw new Exception('Username cannot be empty');
        }
        
        // Check if username already exists
        $stmt = $db->prepare("SELECT id FROM admin_users WHERE username = ? AND id != ?");
        $stmt->execute([$newUsername, $adminId]);
        if ($stmt->fetch()) {
            throw new Exception('Username already exists');
        }
        
        $updates[] = "username = ?";
        $params[] = $newUsername;
        $oldValues['username'] = $admin['username'];
        $newValues['username'] = $newUsername;
        $_SESSION['admin_username'] = $newUsername;
    }
    
    // Update email if provided
    if (isset($input['new_email']) && $input['new_email'] !== $admin['email']) {
        $newEmail = trim($input['new_email']);
        if (empty($newEmail) || !filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email address');
        }
        
        // Check if email already exists
        $stmt = $db->prepare("SELECT id FROM admin_users WHERE email = ? AND id != ?");
        $stmt->execute([$newEmail, $adminId]);
        if ($stmt->fetch()) {
            throw new Exception('Email already exists');
        }
        
        $updates[] = "email = ?";
        $params[] = $newEmail;
        $oldValues['email'] = $admin['email'];
        $newValues['email'] = $newEmail;
    }
    
    // Update password if provided
    if (isset($input['new_password']) && !empty($input['new_password'])) {
        if (strlen($input['new_password']) < 8) {
            throw new Exception('Password must be at least 8 characters long');
        }
        
        $hashedPassword = password_hash($input['new_password'], PASSWORD_DEFAULT);
        $updates[] = "password = ?";
        $params[] = $hashedPassword;
        $oldValues['password'] = '[HIDDEN]';
        $newValues['password'] = '[HIDDEN]';
    }
    
    if (empty($updates)) {
        throw new Exception('No changes to update');
    }
    
    // Add updated timestamp
    $updates[] = "updated_at = CURRENT_TIMESTAMP";
    $params[] = $adminId;
    
    // Update admin user
    $sql = "UPDATE admin_users SET " . implode(", ", $updates) . " WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    // Log the credential change
    logAdminActivity($db, $adminId, 'credential_change', "Admin credentials updated", 'admin_users', $adminId, $oldValues, $newValues, $_SERVER['REMOTE_ADDR'] ?? 'unknown');
    
    // Invalidate all other sessions for this admin
    $stmt = $db->prepare("DELETE FROM admin_sessions WHERE admin_id = ? AND id != ?");
    $stmt->execute([$adminId, $_SESSION['admin_session_id']]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Credentials updated successfully'
    ]);
}

function checkRateLimit($db, $identifier, $action, $maxAttempts, $timeWindow) {
    $stmt = $db->prepare("SELECT attempts, reset_time FROM rate_limits WHERE identifier = ? AND action = ?");
    $stmt->execute([$identifier, $action]);
    $rateLimit = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $now = time();
    
    if ($rateLimit) {
        if ($now < strtotime($rateLimit['reset_time'])) {
            if ($rateLimit['attempts'] >= $maxAttempts) {
                throw new Exception('Rate limit exceeded. Please try again later.');
            }
            
            // Increment attempts
            $stmt = $db->prepare("UPDATE rate_limits SET attempts = attempts + 1 WHERE identifier = ? AND action = ?");
            $stmt->execute([$identifier, $action]);
        } else {
            // Reset counter
            $stmt = $db->prepare("UPDATE rate_limits SET attempts = 1, reset_time = ? WHERE identifier = ? AND action = ?");
            $stmt->execute([date('Y-m-d H:i:s', $now + $timeWindow), $identifier, $action]);
        }
    } else {
        // Create new rate limit entry
        $stmt = $db->prepare("INSERT INTO rate_limits (identifier, action, attempts, reset_time) VALUES (?, ?, 1, ?)");
        $stmt->execute([$identifier, $action, date('Y-m-d H:i:s', $now + $timeWindow)]);
    }
}

function logAdminActivity($db, $adminId, $action, $description, $targetType = null, $targetId = null, $oldValues = null, $newValues = null, $ipAddress = null) {
    $stmt = $db->prepare("INSERT INTO admin_activity_log (admin_id, action, description, target_type, target_id, old_values, new_values, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $adminId,
        $action,
        $description,
        $targetType,
        $targetId,
        $oldValues ? json_encode($oldValues) : null,
        $newValues ? json_encode($newValues) : null,
        $ipAddress,
        $_SERVER['HTTP_USER_AGENT'] ?? ''
    ]);
}

function logSecurityEvent($db, $eventType, $severity, $sourceIp, $userId = null, $adminId = null, $description = '', $metadata = null) {
    $stmt = $db->prepare("INSERT INTO security_events (event_type, severity, source_ip, user_id, admin_id, description, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $eventType,
        $severity,
        $sourceIp,
        $userId,
        $adminId,
        $description,
        $metadata ? json_encode($metadata) : null
    ]);
}
?>

