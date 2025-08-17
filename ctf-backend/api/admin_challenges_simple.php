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
if (!isset($_SESSION['admin_authenticated']) || $_SESSION['admin_authenticated'] !== true) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Admin authentication required'
    ]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

try {
    // Mock challenges data for demo
    $mockChallenges = [
        [
            'id' => 1,
            'title' => 'Web Security Basics',
            'description' => 'Learn the fundamentals of web security',
            'category_id' => 1,
            'category_name' => 'Web Security',
            'challenge_type' => 'static',
            'points' => 100,
            'difficulty' => 'easy',
            'enabled' => true,
            'visible' => true,
            'solve_count' => 25,
            'solve_rate' => 75.5,
            'flag' => 'eco{web_security_basics_2024}',
            'created_at' => '2024-01-15 10:00:00',
            'updated_at' => '2024-01-15 10:00:00'
        ],
        [
            'id' => 2,
            'title' => 'Crypto Challenge',
            'description' => 'Decrypt the hidden message',
            'category_id' => 2,
            'category_name' => 'Cryptography',
            'challenge_type' => 'static',
            'points' => 200,
            'difficulty' => 'medium',
            'enabled' => true,
            'visible' => true,
            'solve_count' => 15,
            'solve_rate' => 45.2,
            'flag' => 'eco{crypto_master_2024}',
            'created_at' => '2024-01-16 14:30:00',
            'updated_at' => '2024-01-16 14:30:00'
        ],
        [
            'id' => 3,
            'title' => 'Forensics Investigation',
            'description' => 'Analyze the evidence and find the flag',
            'category_id' => 3,
            'category_name' => 'Forensics',
            'challenge_type' => 'file',
            'points' => 300,
            'difficulty' => 'hard',
            'enabled' => false,
            'visible' => false,
            'solve_count' => 5,
            'solve_rate' => 15.8,
            'flag' => 'eco{forensics_detective_2024}',
            'created_at' => '2024-01-17 09:15:00',
            'updated_at' => '2024-01-17 09:15:00'
        ],
        [
            'id' => 4,
            'title' => 'Reverse Engineering',
            'description' => 'Reverse engineer the binary to find the flag',
            'category_id' => 4,
            'category_name' => 'Reverse Engineering',
            'challenge_type' => 'file',
            'points' => 400,
            'difficulty' => 'expert',
            'enabled' => true,
            'visible' => true,
            'solve_count' => 3,
            'solve_rate' => 9.1,
            'flag' => 'eco{reverse_engineer_pro_2024}',
            'created_at' => '2024-01-18 16:45:00',
            'updated_at' => '2024-01-18 16:45:00'
        ],
        [
            'id' => 5,
            'title' => 'Web Exploitation',
            'description' => 'Find and exploit the vulnerability',
            'category_id' => 1,
            'category_name' => 'Web Security',
            'challenge_type' => 'web',
            'points' => 250,
            'difficulty' => 'medium',
            'enabled' => true,
            'visible' => true,
            'solve_count' => 12,
            'solve_rate' => 36.4,
            'flag' => 'eco{web_exploit_master_2024}',
            'target_url' => 'https://challenge.example.com',
            'created_at' => '2024-01-19 11:20:00',
            'updated_at' => '2024-01-19 11:20:00'
        ]
    ];

    if ($method === 'GET') {
        echo json_encode([
            'success' => true,
            'challenges' => $mockChallenges,
            'total' => count($mockChallenges)
        ]);
    } else if ($method === 'POST') {
        // Create new challenge
        $newChallenge = [
            'id' => count($mockChallenges) + 1,
            'title' => $input['title'] ?? 'New Challenge',
            'description' => $input['description'] ?? '',
            'category_id' => $input['category_id'] ?? 1,
            'category_name' => 'Web Security',
            'challenge_type' => $input['challenge_type'] ?? 'static',
            'points' => $input['points'] ?? 100,
            'difficulty' => $input['difficulty'] ?? 'easy',
            'enabled' => $input['enabled'] ?? true,
            'visible' => $input['visible'] ?? true,
            'solve_count' => 0,
            'solve_rate' => 0,
            'flag' => $input['flag'] ?? 'eco{new_challenge}',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        echo json_encode([
            'success' => true,
            'message' => 'Challenge created successfully',
            'challenge' => $newChallenge
        ]);
    } else if ($method === 'PUT') {
        // Update challenge
        $challengeId = $_GET['id'] ?? null;
        if (!$challengeId) {
            throw new Exception('Challenge ID required');
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Challenge updated successfully'
        ]);
    } else if ($method === 'DELETE') {
        // Delete challenge
        $challengeId = $_GET['id'] ?? null;
        if (!$challengeId) {
            throw new Exception('Challenge ID required');
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Challenge deleted successfully'
        ]);
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

