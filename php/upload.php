<?php
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'You must be logged in']);
    exit;
}

if (!isset($_FILES['image']) || !isset($_POST['artwork_id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required parameters']);
    exit;
}

$artwork_id = $_POST['artwork_id'];
$caption = $_POST['caption'] ?? '';
$is_primary = isset($_POST['is_primary']) ? 1 : 0;

$upload_dir = '../uploads/';
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$file = $_FILES['image'];
$file_name = $file['name'];
$file_tmp = $file['tmp_name'];
$file_size = $file['size'];
$file_error = $file['error'];

if ($file_error !== 0) {
    echo json_encode(['success' => false, 'message' => 'File upload error']);
    exit;
}

$allowed = ['jpg', 'jpeg', 'png', 'gif'];
$file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

if (!in_array($file_ext, $allowed)) {
    echo json_encode(['success' => false, 'message' => 'Invalid file type. Only JPG, PNG, and GIF are allowed']);
    exit;
}

$new_file_name = uniqid('art_', true) . '.' . $file_ext;
$file_destination = $upload_dir . $new_file_name;

if (move_uploaded_file($file_tmp, $file_destination)) {
    global $conn;
    $image_path = 'uploads/' . $new_file_name;
    
    $stmt = $conn->prepare("INSERT INTO artwork_images (artwork_id, image_path, image_caption, is_primary, file_size) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("issii", $artwork_id, $image_path, $caption, $is_primary, $file_size);
    
    if ($stmt->execute()) {
        $image_id = $conn->insert_id;
        echo json_encode(['success' => true, 'message' => 'Image uploaded successfully', 'image_path' => $image_path, 'image_id' => $image_id]);
    } else {
        unlink($file_destination);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file']);
}
?>
