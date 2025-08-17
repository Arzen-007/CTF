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
    $db = new PDO("sqlite:" . __DIR__ . "/../database.db");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get public configuration settings
    $publicKeys = [
        'platform_name',
        'platform_subtitle', 
        'platform_logo',
        'favicon_url',
        'background_image',
        'background_opacity',
        'background_overlay',
        'chat_enabled',
        'music_enabled',
        'environment_globe_enabled',
        'platform_theme',
        'primary_color',
        'secondary_color'
    ];
    
    $stmt = $db->prepare("SELECT key, value, type FROM config WHERE key IN (" . str_repeat('?,', count($publicKeys) - 1) . "?)");
    $stmt->execute($publicKeys);
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
    
    // Set defaults if not found
    $defaults = [
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
    
    foreach ($defaults as $key => $defaultValue) {
        if (!isset($configData[$key])) {
            $configData[$key] = $defaultValue;
        }
    }
    
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

