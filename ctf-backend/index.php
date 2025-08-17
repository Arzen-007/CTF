<?php
// Set CORS headers for all requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Simple routing
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove leading slash and split path
$path = ltrim($path, '/');
$segments = explode('/', $path);

// Route API requests
if ($segments[0] === 'api') {
    $endpoint = $segments[1] ?? '';
    
    switch ($endpoint) {
        case 'admin_login_simple.php':
            include __DIR__ . '/api/admin_login_simple.php';
            break;
        case 'admin_auth_simple.php':
            include __DIR__ . '/api/admin_auth_simple.php';
            break;
        case 'admin_challenges_simple.php':
            include __DIR__ . '/api/admin_challenges_simple.php';
            break;
        case 'public_config.php':
            include __DIR__ . '/api/public_config_simple.php';
            break;
        case 'health':
            echo json_encode(['status' => 'healthy', 'service' => 'eco-ctf-backend']);
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
            break;
    }
} else {
    // Serve static files or default response
    echo json_encode([
        'message' => 'Eco CTF Backend API',
        'version' => '1.0.0',
        'status' => 'running'
    ]);
}
?>
