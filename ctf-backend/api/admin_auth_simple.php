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

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

try {
    if ($method === 'POST') {
        $action = $input['action'] ?? '';
        
        switch ($action) {
            case 'check_session':
                if (isset($_SESSION['admin_authenticated']) && $_SESSION['admin_authenticated'] === true) {
                    // Check session timeout (1 hour)
                    if (isset($_SESSION['admin_login_time']) && (time() - $_SESSION['admin_login_time']) > 3600) {
                        session_unset();
                        session_destroy();
                        throw new Exception('Session expired');
                    }
                    
                    echo json_encode([
                        'success' => true,
                        'admin' => [
                            'id' => $_SESSION['admin_id'] ?? 1,
                            'username' => $_SESSION['admin_username'] ?? 'admin',
                            'role' => $_SESSION['admin_role'] ?? 'super_admin'
                        ]
                    ]);
                } else {
                    throw new Exception('Not authenticated');
                }
                break;
                
            case 'logout':
                session_unset();
                session_destroy();
                echo json_encode([
                    'success' => true,
                    'message' => 'Logout successful'
                ]);
                break;
                
            default:
                throw new Exception('Invalid action');
        }
    } else {
        throw new Exception('Method not allowed');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>

