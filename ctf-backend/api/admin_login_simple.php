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
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';
        
        // Simple hardcoded check for demo
        if ($username === 'admin' && $password === 'admin123') {
            $_SESSION['admin_id'] = 1;
            $_SESSION['admin_username'] = 'admin';
            $_SESSION['admin_role'] = 'super_admin';
            $_SESSION['admin_authenticated'] = true;
            $_SESSION['admin_login_time'] = time();
            
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'admin' => [
                    'id' => 1,
                    'username' => 'admin',
                    'email' => 'admin@greenctf.com',
                    'role' => 'super_admin'
                ]
            ]);
        } else {
            throw new Exception('Invalid credentials');
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

