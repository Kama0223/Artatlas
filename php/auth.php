<?php
require_once 'config.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch($action) {
    case 'register':
        register();
        break;
    case 'login':
        login();
        break;
    case 'logout':
        logout();
        break;
    case 'check':
        checkAuth();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function register() {
    global $conn;
    
    $username = $_POST['username'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $full_name = $_POST['full_name'] ?? '';
    $user_type = $_POST['user_type'] ?? 'visitor';
    $bio = $_POST['bio'] ?? '';
    $affiliation = $_POST['affiliation'] ?? '';
    $indigenous_community = $_POST['indigenous_community'] ?? '';
    
    if (empty($username) || empty($email) || empty($password) || empty($full_name)) {
        echo json_encode(['success' => false, 'message' => 'All required fields must be filled']);
        exit;
    }
    
    $stmt = $conn->prepare("SELECT user_id FROM users WHERE username = ? OR email = ?");
    $stmt->bind_param("ss", $username, $email);
    $stmt->execute();
    
    if ($stmt->get_result()->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Username or email already exists']);
        exit;
    }
    
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $conn->prepare("INSERT INTO users (username, email, password_hash, full_name, user_type, bio, affiliation, indigenous_community) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssss", $username, $email, $password_hash, $full_name, $user_type, $bio, $affiliation, $indigenous_community);
    
    if ($stmt->execute()) {
        $user_id = $conn->insert_id;
        $_SESSION['user_id'] = $user_id;
        $_SESSION['username'] = $username;
        $_SESSION['role'] = 'user';
        
        echo json_encode([
            'success' => true, 
            'message' => 'Registration successful',
            'user' => [
                'user_id' => $user_id,
                'username' => $username,
                'email' => $email,
                'full_name' => $full_name,
                'role' => 'user'
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Registration failed']);
    }
}

function login() {
    global $conn;
    
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Username and password are required']);
        exit;
    }
    
    $stmt = $conn->prepare("SELECT user_id, username, email, password_hash, full_name, role, is_active FROM users WHERE username = ? OR email = ?");
    $stmt->bind_param("ss", $username, $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
        exit;
    }
    
    $user = $result->fetch_assoc();
    
    if (!password_verify($password, $user['password_hash'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
        exit;
    }
    
    if (!$user['is_active']) {
        echo json_encode(['success' => false, 'message' => 'Account is deactivated']);
        exit;
    }
    
    $update_stmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE user_id = ?");
    $update_stmt->bind_param("i", $user['user_id']);
    $update_stmt->execute();
    
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role'] = $user['role'];
    
    unset($user['password_hash']);
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => $user
    ]);
}

function logout() {
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
}

function checkAuth() {
    if (isset($_SESSION['user_id'])) {
        global $conn;
        $stmt = $conn->prepare("SELECT user_id, username, email, full_name, role FROM users WHERE user_id = ?");
        $stmt->bind_param("i", $_SESSION['user_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            echo json_encode([
                'success' => true,
                'authenticated' => true,
                'user' => $user
            ]);
        } else {
            echo json_encode(['success' => true, 'authenticated' => false]);
        }
    } else {
        echo json_encode(['success' => true, 'authenticated' => false]);
    }
}
?>
