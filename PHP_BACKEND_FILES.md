# PHP Backend Files for Indigenous Art Atlas

## Required PHP Files Structure

Place these files in: `src/cycle3/php/`

---

## 1. config.php - Database Connection

```php
<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'your_password');
define('DB_NAME', 'indigenous_art_atlas');

// Create database connection
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
?>
```

---

## 2. auth.php - Authentication Endpoints

```php
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
    
    // Validate input
    if (empty($username) || empty($email) || empty($password) || empty($full_name)) {
        echo json_encode(['success' => false, 'message' => 'All required fields must be filled']);
        exit;
    }
    
    // Check if username or email already exists
    $stmt = $conn->prepare("SELECT user_id FROM users WHERE username = ? OR email = ?");
    $stmt->bind_param("ss", $username, $email);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Username or email already exists']);
        exit;
    }
    
    // Hash password
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
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
    
    // Get user from database
    $stmt = $conn->prepare("SELECT user_id, username, email, password_hash, full_name, role, is_active FROM users WHERE username = ? OR email = ?");
    $stmt->bind_param("ss", $username, $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
        exit;
    }
    
    $user = $result->fetch_assoc();
    
    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
        exit;
    }
    
    // Check if account is active
    if (!$user['is_active']) {
        echo json_encode(['success' => false, 'message' => 'Account is deactivated']);
        exit;
    }
    
    // Update last login
    $update_stmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE user_id = ?");
    $update_stmt->bind_param("i", $user['user_id']);
    $update_stmt->execute();
    
    // Set session
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role'] = $user['role'];
    
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'user_id' => $user['user_id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'full_name' => $user['full_name'],
            'role' => $user['role']
        ]
    ]);
}

function logout() {
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
}

function checkAuth() {
    if (isset($_SESSION['user_id'])) {
        global $conn;
        $user_id = $_SESSION['user_id'];
        
        $stmt = $conn->prepare("SELECT user_id, username, email, full_name, role FROM users WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
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
```

---

## 3. artworks.php - Artwork CRUD Operations

```php
<?php
require_once 'config.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch($action) {
    case 'list':
        listArtworks();
        break;
    case 'get':
        getArtwork();
        break;
    case 'submit':
        submitArtwork();
        break;
    case 'update':
        updateArtwork();
        break;
    case 'delete':
        deleteArtwork();
        break;
    case 'stats':
        getStats();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function listArtworks() {
    global $conn;
    
    $status = $_GET['status'] ?? 'approved';
    $art_type = $_GET['art_type'] ?? '';
    $region = $_GET['region'] ?? '';
    $period = $_GET['period'] ?? '';
    $search = $_GET['search'] ?? '';
    
    $sql = "SELECT a.*, 
            at.type_name AS art_type_name,
            ap.period_name AS period_name,
            r.region_name AS region_name,
            (SELECT image_path FROM artwork_images WHERE artwork_id = a.artwork_id AND is_primary = TRUE LIMIT 1) AS primary_image,
            u.username AS submitted_by_username
            FROM artworks a
            LEFT JOIN art_types at ON a.art_type_id = at.type_id
            LEFT JOIN art_periods ap ON a.art_period_id = ap.period_id
            LEFT JOIN regions r ON a.region_id = r.region_id
            LEFT JOIN users u ON a.submitted_by = u.user_id
            WHERE a.status = ?";
    
    $params = [$status];
    $types = "s";
    
    if (!empty($art_type)) {
        $sql .= " AND at.type_code = ?";
        $params[] = $art_type;
        $types .= "s";
    }
    
    if (!empty($region)) {
        $sql .= " AND r.region_code = ?";
        $params[] = $region;
        $types .= "s";
    }
    
    if (!empty($period)) {
        $sql .= " AND ap.period_code = ?";
        $params[] = $period;
        $types .= "s";
    }
    
    if (!empty($search)) {
        $sql .= " AND (a.title LIKE ? OR a.description LIKE ? OR a.artist_name LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= "sss";
    }
    
    $sql .= " ORDER BY a.submission_date DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $artworks = [];
    while ($row = $result->fetch_assoc()) {
        $artworks[] = $row;
    }
    
    echo json_encode(['success' => true, 'artworks' => $artworks]);
}

function getArtwork() {
    global $conn;
    
    $artwork_id = $_GET['id'] ?? 0;
    
    if (!$artwork_id) {
        echo json_encode(['success' => false, 'message' => 'Artwork ID is required']);
        exit;
    }
    
    $stmt = $conn->prepare("SELECT a.*, 
            at.type_name AS art_type_name,
            ap.period_name AS period_name,
            r.region_name AS region_name,
            u.username AS submitted_by_username,
            u.full_name AS submitter_name
            FROM artworks a
            LEFT JOIN art_types at ON a.art_type_id = at.type_id
            LEFT JOIN art_periods ap ON a.art_period_id = ap.period_id
            LEFT JOIN regions r ON a.region_id = r.region_id
            LEFT JOIN users u ON a.submitted_by = u.user_id
            WHERE a.artwork_id = ?");
    
    $stmt->bind_param("i", $artwork_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Artwork not found']);
        exit;
    }
    
    $artwork = $result->fetch_assoc();
    
    // Get images
    $img_stmt = $conn->prepare("SELECT * FROM artwork_images WHERE artwork_id = ? ORDER BY is_primary DESC, display_order ASC");
    $img_stmt->bind_param("i", $artwork_id);
    $img_stmt->execute();
    $img_result = $img_stmt->get_result();
    
    $images = [];
    while ($img = $img_result->fetch_assoc()) {
        $images[] = $img;
    }
    
    $artwork['images'] = $images;
    
    // Increment view count
    $update_stmt = $conn->prepare("UPDATE artworks SET view_count = view_count + 1 WHERE artwork_id = ?");
    $update_stmt->bind_param("i", $artwork_id);
    $update_stmt->execute();
    
    echo json_encode(['success' => true, 'artwork' => $artwork]);
}

function submitArtwork() {
    global $conn;
    
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'You must be logged in']);
        exit;
    }
    
    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';
    $artist_name = $_POST['artist_name'] ?? '';
    $indigenous_community = $_POST['indigenous_community'] ?? '';
    $art_type_id = $_POST['art_type_id'] ?? null;
    $art_period_id = $_POST['art_period_id'] ?? null;
    $region_id = $_POST['region_id'] ?? null;
    $latitude = $_POST['latitude'] ?? null;
    $longitude = $_POST['longitude'] ?? null;
    $location_name = $_POST['location_name'] ?? '';
    $country = $_POST['country'] ?? '';
    $is_sensitive_location = isset($_POST['is_sensitive_location']) ? 1 : 0;
    $cultural_significance = $_POST['cultural_significance'] ?? '';
    $creation_technique = $_POST['creation_technique'] ?? '';
    $materials_used = $_POST['materials_used'] ?? '';
    
    if (empty($title) || empty($description)) {
        echo json_encode(['success' => false, 'message' => 'Title and description are required']);
        exit;
    }
    
    $stmt = $conn->prepare("INSERT INTO artworks (title, description, artist_name, indigenous_community, art_type_id, art_period_id, region_id, latitude, longitude, location_name, country, is_sensitive_location, cultural_significance, creation_technique, materials_used, submitted_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')");
    
    $user_id = $_SESSION['user_id'];
    $stmt->bind_param("ssssiiddssisssi", $title, $description, $artist_name, $indigenous_community, $art_type_id, $art_period_id, $region_id, $latitude, $longitude, $location_name, $country, $is_sensitive_location, $cultural_significance, $creation_technique, $materials_used, $user_id);
    
    if ($stmt->execute()) {
        $artwork_id = $conn->insert_id;
        
        // Log submission
        $log_stmt = $conn->prepare("INSERT INTO approval_log (artwork_id, action, performed_by, notes, new_status) VALUES (?, 'submitted', ?, 'Initial submission', 'pending')");
        $log_stmt->bind_param("ii", $artwork_id, $user_id);
        $log_stmt->execute();
        
        echo json_encode(['success' => true, 'message' => 'Artwork submitted successfully', 'artwork_id' => $artwork_id]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to submit artwork']);
    }
}

function getStats() {
    global $conn;
    
    $result = $conn->query("SELECT * FROM admin_stats_view");
    $stats = $result->fetch_assoc();
    
    echo json_encode(['success' => true, 'stats' => $stats]);
}
?>
```

---

## 4. admin.php - Admin Portal Operations

```php
<?php
require_once 'config.php';

// Check if user is admin
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
    
    // Call stored procedure
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
    
    // Call stored procedure
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
```

---

## 5. upload.php - Image Upload Handler

```php
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

// Check for errors
if ($file_error !== 0) {
    echo json_encode(['success' => false, 'message' => 'File upload error']);
    exit;
}

// Validate file type
$allowed = ['jpg', 'jpeg', 'png', 'gif'];
$file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

if (!in_array($file_ext, $allowed)) {
    echo json_encode(['success' => false, 'message' => 'Invalid file type. Only JPG, PNG, and GIF are allowed']);
    exit;
}

// Generate unique filename
$new_file_name = uniqid('art_', true) . '.' . $file_ext;
$file_destination = $upload_dir . $new_file_name;

// Move uploaded file
if (move_uploaded_file($file_tmp, $file_destination)) {
    $image_path = 'uploads/' . $new_file_name;
    
    // Save to database
    $stmt = $conn->prepare("INSERT INTO artwork_images (artwork_id, image_path, image_caption, is_primary, file_size) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("issii", $artwork_id, $image_path, $caption, $is_primary, $file_size);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Image uploaded successfully', 'image_path' => $image_path]);
    } else {
        unlink($file_destination);
        echo json_encode(['success' => false, 'message' => 'Database error']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file']);
}
?>
```

---

## Setup Instructions

1. **Database Setup:**
   - Run the `database_schema.sql` script in your MySQL database
   - Update database credentials in `config.php`

2. **File Structure:**
   ```
   src/cycle3/
   ├── php/
   │   ├── config.php
   │   ├── auth.php
   │   ├── artworks.php
   │   ├── admin.php
   │   └── upload.php
   └── uploads/  (create this folder with write permissions)
   ```

3. **Update JavaScript:**
   - Update API endpoints in your JS files to point to PHP files
   - Example: `fetch('php/auth.php?action=login', {...})`

4. **Test Admin Login:**
   - Username: `admin`
   - Password: `admin123`
   - **IMPORTANT: Change this immediately after first login!**

5. **Folder Permissions:**
   ```bash
   chmod 755 src/cycle3/php
   chmod 777 src/cycle3/uploads
   ```
