<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Default configuration for demo
    $configData = [
        'platform_name' => 'Green Eco CTF',
        'platform_subtitle' => 'Hack for a Greener Tomorrow',
        'platform_logo' => '/tree-icon.svg',
        'favicon_url' => '/favicon.ico',
        'background_image' => '/heromap.jpg',
        'background_opacity' => '0.2',
        'background_overlay' => '0.6',
        'chat_enabled' => true,
        'music_enabled' => true,
        'environment_globe_enabled' => true,
        'platform_theme' => 'eco',
        'primary_color' => '#00ff88',
        'secondary_color' => '#00cc66'
    ];
    
    echo json_encode([
        'success' => true,
        'config' => $configData
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to load configuration'
    ]);
}
?>

