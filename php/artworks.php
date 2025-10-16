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
    
    $query = "SELECT a.*, 
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
        $query .= " AND at.type_code = ?";
        $params[] = $art_type;
        $types .= "s";
    }
    
    if (!empty($region)) {
        $query .= " AND r.region_code = ?";
        $params[] = $region;
        $types .= "s";
    }
    
    if (!empty($period)) {
        $query .= " AND ap.period_code = ?";
        $params[] = $period;
        $types .= "s";
    }
    
    if (!empty($search)) {
        $query .= " AND (a.title LIKE ? OR a.description LIKE ? OR a.artist_name LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $types .= "sss";
    }
    
    $query .= " ORDER BY a.submission_date DESC";
    
    $stmt = $conn->prepare($query);
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
    
    $img_stmt = $conn->prepare("SELECT * FROM artwork_images WHERE artwork_id = ? ORDER BY is_primary DESC, display_order ASC");
    $img_stmt->bind_param("i", $artwork_id);
    $img_stmt->execute();
    $img_result = $img_stmt->get_result();
    
    $images = [];
    while ($img = $img_result->fetch_assoc()) {
        $images[] = $img;
    }
    
    $artwork['images'] = $images;
    
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
    
    $user_id = $_SESSION['user_id'];
    
    $stmt = $conn->prepare("INSERT INTO artworks (title, description, artist_name, indigenous_community, art_type_id, art_period_id, region_id, latitude, longitude, location_name, country, is_sensitive_location, cultural_significance, creation_technique, materials_used, submitted_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')");
    
    $stmt->bind_param("ssssiiddssisssi", $title, $description, $artist_name, $indigenous_community, $art_type_id, $art_period_id, $region_id, $latitude, $longitude, $location_name, $country, $is_sensitive_location, $cultural_significance, $creation_technique, $materials_used, $user_id);
    
    if ($stmt->execute()) {
        $artwork_id = $conn->insert_id;
        
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
