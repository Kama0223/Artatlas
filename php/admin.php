<?php
require_once 'config.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch($action) {
    case 'pending':
        getPendingArtworks();
        break;
    case 'approve':
        approveArtwork();
        break;
    case 'reject':
        rejectArtwork();
        break;
    case 'users':
        getUsers();
        break;
    case 'stats':
        getAdminStats();
        break;
    case 'activity':
        getActivityLog();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function getPendingArtworks() {
    global $conn;
    
    $result = $conn->query("SELECT * FROM pending_artworks_view");
    
    $artworks = [];
    while ($row = $result->fetch_assoc()) {
        $artworks[] = $row;
    }
    
    echo json_encode(['success' => true, 'artworks' => $artworks]);
}

function approveArtwork() {
    global $conn;
    
    $artwork_id = $_POST['artwork_id'] ?? 0;
    $notes = $_POST['notes'] ?? '';
    $admin_id = $_SESSION['user_id'];
    
    if (!$artwork_id) {
        echo json_encode(['success' => false, 'message' => 'Artwork ID is required']);
        exit;
    }
    
    $stmt = $conn->prepare("CALL approve_artwork(?, ?, ?)");
    $stmt->bind_param("iis", $artwork_id, $admin_id, $notes);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Artwork approved successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to approve artwork']);
    }
}

function rejectArtwork() {
    global $conn;
    
    $artwork_id = $_POST['artwork_id'] ?? 0;
    $notes = $_POST['notes'] ?? '';
    $admin_id = $_SESSION['user_id'];
    
    if (!$artwork_id) {
        echo json_encode(['success' => false, 'message' => 'Artwork ID is required']);
        exit;
    }
    
    $stmt = $conn->prepare("CALL reject_artwork(?, ?, ?)");
    $stmt->bind_param("iis", $artwork_id, $admin_id, $notes);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Artwork rejected successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to reject artwork']);
    }
}

function getUsers() {
    global $conn;
    
    $result = $conn->query("SELECT user_id, username, email, full_name, user_type, role, created_at, last_login, is_active FROM users ORDER BY created_at DESC");
    
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    
    echo json_encode(['success' => true, 'users' => $users]);
}

function getAdminStats() {
    global $conn;
    
    $result = $conn->query("SELECT * FROM admin_stats_view");
    $stats = $result->fetch_assoc();
    
    echo json_encode(['success' => true, 'stats' => $stats]);
}

function getActivityLog() {
    global $conn;
    
    $limit = $_GET['limit'] ?? 50;
    
    $stmt = $conn->prepare("SELECT al.*, a.title AS artwork_title, u.username 
            FROM approval_log al
            JOIN artworks a ON al.artwork_id = a.artwork_id
            JOIN users u ON al.performed_by = u.user_id
            ORDER BY al.action_date DESC
            LIMIT ?");
    $stmt->bind_param("i", $limit);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $logs = [];
    while ($row = $result->fetch_assoc()) {
        $logs[] = $row;
    }
    
    echo json_encode(['success' => true, 'logs' => $logs]);
}
?>
