<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

// Check admin authentication
if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

try {
    $db = new PDO("sqlite:" . __DIR__ . "/../database.db");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    switch ($method) {
        case 'GET':
            getConfig($db);
            break;
            
        case 'POST':
            updateConfig($db, $input);
            break;
            
        case 'PUT':
            if (isset($_GET['action']) && $_GET['action'] === 'upload_logo') {
                uploadLogo($db, $input);
            } elseif (isset($_GET['action']) && $_GET['action'] === 'upload_background') {
                uploadBackground($db, $input);
            } elseif (isset($_GET['action']) && $_GET['action'] === 'upload_favicon') {
                uploadFavicon($db, $input);
            } else {
                updateConfig($db, $input);
            }
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

function getConfig($db) {
    // Get all configuration settings
    $stmt = $db->query("SELECT key, value, type FROM config ORDER BY key");
    $configs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $configData = [];
    foreach ($configs as $config) {
        $value = $config['value'];
        
        // Convert value based on type
        switch ($config['type']) {
            case 'boolean':
                $value = (bool)$value;
                break;
            case 'integer':
                $value = (int)$value;
                break;
            case 'json':
                $value = json_decode($value, true);
                break;
        }
        
        $configData[$config['key']] = $value;
    }
    
    echo json_encode([
        'success' => true,
        'config' => $configData
    ]);
}

function updateConfig($db, $input) {
    if (!isset($input['configs']) || !is_array($input['configs'])) {
        throw new Exception('Invalid configuration data');
    }
    
    $updatedConfigs = [];
    
    foreach ($input['configs'] as $key => $value) {
        // Determine type
        $type = 'string';
        if (is_bool($value)) {
            $type = 'boolean';
            $value = $value ? '1' : '0';
        } elseif (is_int($value)) {
            $type = 'integer';
            $value = (string)$value;
        } elseif (is_array($value)) {
            $type = 'json';
            $value = json_encode($value);
        }
        
        // Update or insert configuration
        $stmt = $db->prepare("INSERT OR REPLACE INTO config (key, value, type, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)");
        $stmt->execute([$key, $value, $type]);
        
        $updatedConfigs[$key] = $input['configs'][$key];
    }
    
    // Log admin activity
    logAdminActivity($db, $_SESSION['admin_id'], 'config_update', "Updated platform configuration", 'config', null, null, $updatedConfigs);
    
    echo json_encode([
        'success' => true,
        'message' => 'Configuration updated successfully',
        'updated_configs' => $updatedConfigs
    ]);
}

function uploadLogo($db, $input) {
    if (!isset($input['logo_data']) || !isset($input['filename'])) {
        throw new Exception('Logo data and filename required');
    }
    
    $logoData = $input['logo_data'];
    $filename = $input['filename'];
    
    // Validate file type
    $allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];
    $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_buffer($fileInfo, base64_decode($logoData));
    finfo_close($fileInfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception('Invalid file type. Only PNG, JPG, GIF, and SVG files are allowed.');
    }
    
    // Create uploads directory if it doesn't exist
    $uploadDir = __DIR__ . '/../uploads/logos/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Generate unique filename
    $extension = pathinfo($filename, PATHINFO_EXTENSION);
    $newFilename = 'logo_' . time() . '.' . $extension;
    $filePath = $uploadDir . $newFilename;
    
    // Save file
    if (file_put_contents($filePath, base64_decode($logoData)) === false) {
        throw new Exception('Failed to save logo file');
    }
    
    // Update configuration
    $logoUrl = '/uploads/logos/' . $newFilename;
    $stmt = $db->prepare("INSERT OR REPLACE INTO config (key, value, type, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)");
    $stmt->execute(['platform_logo', $logoUrl, 'string']);
    
    // Log admin activity
    logAdminActivity($db, $_SESSION['admin_id'], 'logo_upload', "Uploaded new platform logo: $newFilename", 'config', null, null, ['logo_url' => $logoUrl]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Logo uploaded successfully',
        'logo_url' => $logoUrl
    ]);
}

function uploadBackground($db, $input) {
    if (!isset($input['background_data']) || !isset($input['filename'])) {
        throw new Exception('Background image data and filename required');
    }
    
    $backgroundData = $input['background_data'];
    $filename = $input['filename'];
    
    // Validate file type
    $allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_buffer($fileInfo, base64_decode($backgroundData));
    finfo_close($fileInfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception('Invalid file type. Only PNG, JPG, GIF, and WebP files are allowed.');
    }
    
    // Create uploads directory if it doesn't exist
    $uploadDir = __DIR__ . '/../uploads/backgrounds/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Generate unique filename
    $extension = pathinfo($filename, PATHINFO_EXTENSION);
    $newFilename = 'background_' . time() . '.' . $extension;
    $filePath = $uploadDir . $newFilename;
    
    // Save file
    if (file_put_contents($filePath, base64_decode($backgroundData)) === false) {
        throw new Exception('Failed to save background image file');
    }
    
    // Update configuration
    $backgroundUrl = '/uploads/backgrounds/' . $newFilename;
    $stmt = $db->prepare("INSERT OR REPLACE INTO config (key, value, type, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)");
    $stmt->execute(['background_image', $backgroundUrl, 'string']);
    
    // Log admin activity
    logAdminActivity($db, $_SESSION['admin_id'], 'background_upload', "Uploaded new platform background: $newFilename", 'config', null, null, ['background_url' => $backgroundUrl]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Background image uploaded successfully',
        'background_url' => $backgroundUrl
    ]);
}

function uploadFavicon($db, $input) {
    if (!isset($input['favicon_data']) || !isset($input['filename'])) {
        throw new Exception('Favicon data and filename required');
    }
    
    $faviconData = $input['favicon_data'];
    $filename = $input['filename'];
    
    // Validate file type
    $allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon'];
    $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_buffer($fileInfo, base64_decode($faviconData));
    finfo_close($fileInfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception('Invalid file type. Only PNG, JPG, GIF, and ICO files are allowed for favicon.');
    }
    
    // Create uploads directory if it doesn't exist
    $uploadDir = __DIR__ . '/../uploads/favicons/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Generate unique filename
    $extension = pathinfo($filename, PATHINFO_EXTENSION);
    if (empty($extension)) {
        $extension = 'ico'; // Default to ico if no extension
    }
    $newFilename = 'favicon_' . time() . '.' . $extension;
    $filePath = $uploadDir . $newFilename;
    
    // Save file
    if (file_put_contents($filePath, base64_decode($faviconData)) === false) {
        throw new Exception('Failed to save favicon file');
    }
    
    // Update configuration
    $faviconUrl = '/uploads/favicons/' . $newFilename;
    $stmt = $db->prepare("INSERT OR REPLACE INTO config (key, value, type, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)");
    $stmt->execute(['favicon_url', $faviconUrl, 'string']);
    
    // Log admin activity
    logAdminActivity($db, $_SESSION['admin_id'], 'favicon_upload', "Uploaded new platform favicon: $newFilename", 'config', null, null, ['favicon_url' => $faviconUrl]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Favicon uploaded successfully',
        'favicon_url' => $faviconUrl
    ]);
}

function logAdminActivity($db, $adminId, $action, $description, $targetType = null, $targetId = null, $oldValues = null, $newValues = null) {
    $stmt = $db->prepare("INSERT INTO admin_activity_log (admin_id, action, description, target_type, target_id, old_values, new_values, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $adminId,
        $action,
        $description,
        $targetType,
        $targetId,
        $oldValues ? json_encode($oldValues) : null,
        $newValues ? json_encode($newValues) : null,
        $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        $_SERVER['HTTP_USER_AGENT'] ?? ''
    ]);
}
?>

