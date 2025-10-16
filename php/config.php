<?php
// MySQL Database configuration for Docker
// UPDATE THESE WITH YOUR DOCKER CREDENTIALS
define('DB_HOST', 'db');
define('DB_USER', 'root');
define('DB_PASS', 'password');
define('DB_NAME', 'web_dev_db');

// Create MySQL connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]));
}

// Set charset to utf8mb4
$conn->set_charset("utf8mb4");

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// CORS headers for development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Helper function to execute prepared queries
function db_query($query, $params = [], $types = '') {
    global $conn;
    
    if (empty($params)) {
        $result = $conn->query($query);
        if (!$result) {
            error_log("Database error: " . $conn->error);
            return false;
        }
        return $result;
    }
    
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        error_log("Prepare error: " . $conn->error);
        return false;
    }
    
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    
    $result = $stmt->get_result();
    return $result;
}
?>
