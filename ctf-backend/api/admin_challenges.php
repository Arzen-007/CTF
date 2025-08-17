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
            if (isset($_GET['id'])) {
                getChallenge($db, $_GET['id']);
            } else {
                getChallenges($db);
            }
            break;
            
        case 'POST':
            createChallenge($db, $input);
            break;
            
        case 'PUT':
            if (isset($_GET['id'])) {
                updateChallenge($db, $_GET['id'], $input);
            } else {
                throw new Exception('Challenge ID required for update');
            }
            break;
            
        case 'DELETE':
            if (isset($_GET['id'])) {
                deleteChallenge($db, $_GET['id']);
            } else {
                throw new Exception('Challenge ID required for deletion');
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

function getChallenges($db) {
    $sql = "SELECT c.*, cat.title as category_name, cat.icon as category_icon, cat.color as category_color,
                   COUNT(DISTINCT s.user_id) as solve_count,
                   COUNT(s.id) as total_attempts,
                   MIN(CASE WHEN s.correct = 1 THEN s.created_at END) as first_solve
            FROM challenges c
            LEFT JOIN categories cat ON c.category_id = cat.id
            LEFT JOIN submissions s ON c.id = s.challenge_id
            GROUP BY c.id
            ORDER BY c.created_at DESC";
    
    $stmt = $db->query($sql);
    $challenges = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get file count for each challenge
    foreach ($challenges as &$challenge) {
        $stmt = $db->prepare("SELECT COUNT(*) as file_count FROM challenge_files WHERE challenge_id = ?");
        $stmt->execute([$challenge['id']]);
        $fileData = $stmt->fetch(PDO::FETCH_ASSOC);
        $challenge['file_count'] = $fileData['file_count'];
        
        // Calculate solve rate
        if ($challenge['total_attempts'] > 0) {
            $challenge['solve_rate'] = round(($challenge['solve_count'] / $challenge['total_attempts']) * 100, 2);
        } else {
            $challenge['solve_rate'] = 0;
        }
    }
    
    echo json_encode([
        'success' => true,
        'challenges' => $challenges
    ]);
}

function getChallenge($db, $id) {
    $stmt = $db->prepare("SELECT c.*, cat.title as category_name FROM challenges c LEFT JOIN categories cat ON c.category_id = cat.id WHERE c.id = ?");
    $stmt->execute([$id]);
    $challenge = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$challenge) {
        throw new Exception('Challenge not found');
    }
    
    // Get challenge files
    $stmt = $db->prepare("SELECT * FROM challenge_files WHERE challenge_id = ?");
    $stmt->execute([$id]);
    $challenge['files'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get challenge statistics
    $stmt = $db->prepare("SELECT 
                            COUNT(DISTINCT s.user_id) as solve_count,
                            COUNT(s.id) as total_attempts,
                            MIN(CASE WHEN s.correct = 1 THEN s.created_at END) as first_solve,
                            MAX(CASE WHEN s.correct = 1 THEN s.created_at END) as last_solve
                          FROM submissions s WHERE s.challenge_id = ?");
    $stmt->execute([$id]);
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);
    $challenge['statistics'] = $stats;
    
    echo json_encode([
        'success' => true,
        'challenge' => $challenge
    ]);
}

function createChallenge($db, $input) {
    // Validate required fields
    $required = ['title', 'description', 'flag', 'points', 'category_id'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            throw new Exception("Field '$field' is required");
        }
    }
    
    // Validate category exists
    $stmt = $db->prepare("SELECT id FROM categories WHERE id = ?");
    $stmt->execute([$input['category_id']]);
    if (!$stmt->fetch()) {
        throw new Exception('Invalid category');
    }
    
    // Validate points
    if (!is_numeric($input['points']) || $input['points'] < 1) {
        throw new Exception('Points must be a positive number');
    }
    
    // Validate challenge type
    $validTypes = ['static', 'file', 'web', 'docker', 'dynamic'];
    $challengeType = $input['challenge_type'] ?? 'static';
    if (!in_array($challengeType, $validTypes)) {
        throw new Exception('Invalid challenge type');
    }
    
    // Validate difficulty
    $validDifficulties = ['easy', 'medium', 'hard', 'expert'];
    $difficulty = $input['difficulty'] ?? 'medium';
    if (!in_array($difficulty, $validDifficulties)) {
        throw new Exception('Invalid difficulty level');
    }
    
    // Prepare challenge data
    $challengeData = [
        'title' => trim($input['title']),
        'description' => trim($input['description']),
        'flag' => trim($input['flag']),
        'points' => (int)$input['points'],
        'category_id' => (int)$input['category_id'],
        'challenge_type' => $challengeType,
        'difficulty' => $difficulty,
        'author' => $input['author'] ?? 'Admin',
        'tags' => $input['tags'] ?? '',
        'enabled' => isset($input['enabled']) ? (int)$input['enabled'] : 1,
        'visible' => isset($input['visible']) ? (int)$input['visible'] : 1,
        'max_attempts' => isset($input['max_attempts']) ? (int)$input['max_attempts'] : null,
        'time_limit' => isset($input['time_limit']) ? (int)$input['time_limit'] : null,
        'target_url' => $input['target_url'] ?? null,
        'docker_image' => $input['docker_image'] ?? null,
        'port_mapping' => $input['port_mapping'] ?? null,
        'prerequisites' => $input['prerequisites'] ?? null,
        'solution_notes' => $input['solution_notes'] ?? null,
        'first_blood_bonus' => isset($input['first_blood_bonus']) ? (int)$input['first_blood_bonus'] : 0,
        'created_by' => $_SESSION['admin_id']
    ];
    
    // Insert challenge
    $sql = "INSERT INTO challenges (" . implode(', ', array_keys($challengeData)) . ") VALUES (" . str_repeat('?,', count($challengeData) - 1) . "?)";
    $stmt = $db->prepare($sql);
    $stmt->execute(array_values($challengeData));
    
    $challengeId = $db->lastInsertId();
    
    // Handle file uploads if present
    if (isset($input['files']) && is_array($input['files'])) {
        foreach ($input['files'] as $file) {
            if (isset($file['name']) && isset($file['content'])) {
                saveChallengFile($db, $challengeId, $file);
            }
        }
    }
    
    // Log admin activity
    logAdminActivity($db, $_SESSION['admin_id'], 'challenge_create', "Created challenge: {$challengeData['title']}", 'challenges', $challengeId, null, $challengeData);
    
    echo json_encode([
        'success' => true,
        'message' => 'Challenge created successfully',
        'challenge_id' => $challengeId
    ]);
}

function updateChallenge($db, $id, $input) {
    // Check if challenge exists
    $stmt = $db->prepare("SELECT * FROM challenges WHERE id = ?");
    $stmt->execute([$id]);
    $existingChallenge = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$existingChallenge) {
        throw new Exception('Challenge not found');
    }
    
    $updates = [];
    $params = [];
    $oldValues = [];
    $newValues = [];
    
    // Fields that can be updated
    $updateableFields = [
        'title', 'description', 'flag', 'points', 'category_id', 'challenge_type',
        'difficulty', 'author', 'tags', 'enabled', 'visible', 'max_attempts',
        'time_limit', 'target_url', 'docker_image', 'port_mapping', 'prerequisites',
        'solution_notes', 'first_blood_bonus'
    ];
    
    foreach ($updateableFields as $field) {
        if (isset($input[$field]) && $input[$field] !== $existingChallenge[$field]) {
            $updates[] = "$field = ?";
            $params[] = $input[$field];
            $oldValues[$field] = $existingChallenge[$field];
            $newValues[$field] = $input[$field];
        }
    }
    
    if (empty($updates)) {
        throw new Exception('No changes to update');
    }
    
    // Add updated timestamp
    $updates[] = "updated_at = CURRENT_TIMESTAMP";
    $params[] = $id;
    
    // Update challenge
    $sql = "UPDATE challenges SET " . implode(", ", $updates) . " WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    // Handle file operations
    if (isset($input['files_to_delete']) && is_array($input['files_to_delete'])) {
        foreach ($input['files_to_delete'] as $fileId) {
            deleteChallengFile($db, $fileId);
        }
    }
    
    if (isset($input['new_files']) && is_array($input['new_files'])) {
        foreach ($input['new_files'] as $file) {
            if (isset($file['name']) && isset($file['content'])) {
                saveChallengFile($db, $id, $file);
            }
        }
    }
    
    // Log admin activity
    logAdminActivity($db, $_SESSION['admin_id'], 'challenge_update', "Updated challenge: {$existingChallenge['title']}", 'challenges', $id, $oldValues, $newValues);
    
    echo json_encode([
        'success' => true,
        'message' => 'Challenge updated successfully'
    ]);
}

function deleteChallenge($db, $id) {
    // Check if challenge exists
    $stmt = $db->prepare("SELECT title FROM challenges WHERE id = ?");
    $stmt->execute([$id]);
    $challenge = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$challenge) {
        throw new Exception('Challenge not found');
    }
    
    // Delete associated files from filesystem
    $stmt = $db->prepare("SELECT file_path FROM challenge_files WHERE challenge_id = ?");
    $stmt->execute([$id]);
    $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($files as $file) {
        if (file_exists($file['file_path'])) {
            unlink($file['file_path']);
        }
    }
    
    // Delete challenge (cascade will handle related records)
    $stmt = $db->prepare("DELETE FROM challenges WHERE id = ?");
    $stmt->execute([$id]);
    
    // Log admin activity
    logAdminActivity($db, $_SESSION['admin_id'], 'challenge_delete', "Deleted challenge: {$challenge['title']}", 'challenges', $id);
    
    echo json_encode([
        'success' => true,
        'message' => 'Challenge deleted successfully'
    ]);
}

function saveChallengFile($db, $challengeId, $fileData) {
    $uploadDir = __DIR__ . '/../uploads/challenges/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $originalName = $fileData['name'];
    $fileContent = base64_decode($fileData['content']);
    $fileSize = strlen($fileContent);
    $fileHash = hash('sha256', $fileContent);
    
    // Generate unique filename
    $extension = pathinfo($originalName, PATHINFO_EXTENSION);
    $filename = $challengeId . '_' . uniqid() . '.' . $extension;
    $filePath = $uploadDir . $filename;
    
    // Save file
    if (file_put_contents($filePath, $fileContent) === false) {
        throw new Exception('Failed to save file');
    }
    
    // Save file record
    $stmt = $db->prepare("INSERT INTO challenge_files (challenge_id, filename, original_filename, file_path, file_size, file_hash, mime_type) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $challengeId,
        $filename,
        $originalName,
        $filePath,
        $fileSize,
        $fileHash,
        $fileData['type'] ?? 'application/octet-stream'
    ]);
}

function deleteChallengFile($db, $fileId) {
    $stmt = $db->prepare("SELECT file_path FROM challenge_files WHERE id = ?");
    $stmt->execute([$fileId]);
    $file = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($file && file_exists($file['file_path'])) {
        unlink($file['file_path']);
    }
    
    $stmt = $db->prepare("DELETE FROM challenge_files WHERE id = ?");
    $stmt->execute([$fileId]);
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

