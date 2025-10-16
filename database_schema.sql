-- ============================================
-- Indigenous Art Atlas - Complete Database Schema
-- Full Stack Implementation with Admin Portal
-- ============================================

-- Drop existing tables if they exist (for clean install)
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS artwork_images;
DROP TABLE IF EXISTS artworks;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS art_types;
DROP TABLE IF EXISTS art_periods;
DROP TABLE IF EXISTS regions;
DROP TABLE IF EXISTS approval_log;

-- ============================================
-- 1. USERS TABLE
-- Stores all user accounts (public, registered, admin)
-- ============================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    user_type ENUM('visitor', 'artist', 'researcher', 'admin') DEFAULT 'visitor',
    role ENUM('user', 'admin') DEFAULT 'user',
    bio TEXT,
    affiliation VARCHAR(100),
    indigenous_community VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    profile_image VARCHAR(255),
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. ART TYPES TABLE (Reference/Lookup)
-- Predefined categories of indigenous art
-- ============================================
CREATE TABLE art_types (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_code VARCHAR(50) UNIQUE NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert predefined art types
INSERT INTO art_types (type_code, type_name, description) VALUES
('cave-art', 'Cave Art', 'Ancient cave paintings and engravings'),
('rock-art', 'Rock Art', 'Petroglyphs and pictographs on rock surfaces'),
('mural', 'Mural', 'Wall paintings and large-scale artworks'),
('sculpture', 'Sculpture', 'Three-dimensional carved or molded artworks'),
('textile', 'Textile', 'Woven fabrics, clothing, and fiber arts'),
('pottery', 'Pottery', 'Ceramic vessels and decorative objects'),
('carving', 'Carving', 'Carved wood, bone, and stone objects'),
('painting', 'Painting', 'Traditional and contemporary paintings'),
('installation', 'Installation', 'Large-scale contemporary art installations'),
('other', 'Other', 'Other forms of indigenous art');

-- ============================================
-- 3. ART PERIODS TABLE (Reference/Lookup)
-- Predefined time periods for art classification
-- ============================================
CREATE TABLE art_periods (
    period_id INT AUTO_INCREMENT PRIMARY KEY,
    period_code VARCHAR(50) UNIQUE NOT NULL,
    period_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert predefined periods
INSERT INTO art_periods (period_code, period_name, description) VALUES
('ancient', 'Ancient', 'Pre-1500 CE'),
('historical', 'Historical', '1500-1900 CE'),
('modern', 'Modern', '1900-1980 CE'),
('contemporary', 'Contemporary', '1980-Present');

-- ============================================
-- 4. REGIONS TABLE (Reference/Lookup)
-- Geographic regions for art classification
-- ============================================
CREATE TABLE regions (
    region_id INT AUTO_INCREMENT PRIMARY KEY,
    region_code VARCHAR(50) UNIQUE NOT NULL,
    region_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert predefined regions
INSERT INTO regions (region_code, region_name) VALUES
('australia', 'Australia'),
('north-america', 'North America'),
('south-america', 'South America'),
('africa', 'Africa'),
('asia', 'Asia'),
('europe', 'Europe'),
('oceania', 'Oceania'),
('pacific', 'Pacific Islands');

-- ============================================
-- 5. ARTWORKS TABLE (Main Content)
-- Stores all artwork submissions with approval workflow
-- ============================================
CREATE TABLE artworks (
    artwork_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    artist_name VARCHAR(100),
    indigenous_community VARCHAR(100),
    art_type_id INT,
    art_period_id INT,
    region_id INT,
    
    -- Location data
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_name VARCHAR(200),
    country VARCHAR(100),
    is_sensitive_location BOOLEAN DEFAULT FALSE,
    
    -- Dates
    estimated_date VARCHAR(100),
    date_range_start VARCHAR(50),
    date_range_end VARCHAR(50),
    
    -- Cultural information
    cultural_significance TEXT,
    creation_technique TEXT,
    materials_used TEXT,
    
    -- Submission tracking
    submitted_by INT NOT NULL,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Approval workflow
    status ENUM('pending', 'approved', 'rejected', 'under_review') DEFAULT 'pending',
    reviewed_by INT NULL,
    review_date TIMESTAMP NULL,
    review_notes TEXT,
    
    -- Additional metadata
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (art_type_id) REFERENCES art_types(type_id) ON DELETE SET NULL,
    FOREIGN KEY (art_period_id) REFERENCES art_periods(period_id) ON DELETE SET NULL,
    FOREIGN KEY (region_id) REFERENCES regions(region_id) ON DELETE SET NULL,
    FOREIGN KEY (submitted_by) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL,
    
    INDEX idx_status (status),
    INDEX idx_submitted_by (submitted_by),
    INDEX idx_art_type (art_type_id),
    INDEX idx_region (region_id),
    INDEX idx_submission_date (submission_date),
    INDEX idx_featured (is_featured),
    FULLTEXT idx_search (title, description, artist_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. ARTWORK IMAGES TABLE
-- Stores multiple images per artwork
-- ============================================
CREATE TABLE artwork_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    artwork_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    image_caption TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_size INT,
    
    FOREIGN KEY (artwork_id) REFERENCES artworks(artwork_id) ON DELETE CASCADE,
    INDEX idx_artwork (artwork_id),
    INDEX idx_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. APPROVAL LOG TABLE
-- Tracks all approval/rejection actions for audit
-- ============================================
CREATE TABLE approval_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    artwork_id INT NOT NULL,
    action ENUM('submitted', 'under_review', 'approved', 'rejected', 'resubmitted') NOT NULL,
    performed_by INT NOT NULL,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    
    FOREIGN KEY (artwork_id) REFERENCES artworks(artwork_id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_artwork (artwork_id),
    INDEX idx_action_date (action_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. COMMENTS TABLE (Optional - for future)
-- Stores user comments and feedback on artworks
-- ============================================
CREATE TABLE comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    artwork_id INT NOT NULL,
    user_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_approved BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (artwork_id) REFERENCES artworks(artwork_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_artwork (artwork_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CREATE DEFAULT ADMIN USER
-- Username: admin / Password: admin123 (CHANGE THIS!)
-- ============================================
INSERT INTO users (username, email, password_hash, full_name, user_type, role, is_active) 
VALUES ('admin', 'admin@indigenousartatlas.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
        'System Administrator', 'admin', 'admin', TRUE);

-- ============================================
-- SAMPLE DATA FOR TESTING (Optional)
-- ============================================

-- Create a test regular user
INSERT INTO users (username, email, password_hash, full_name, user_type, role) 
VALUES ('testuser', 'test@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
        'Test User', 'artist', 'user');

-- Create a sample artwork (pending approval)
INSERT INTO artworks (title, description, artist_name, indigenous_community, art_type_id, 
                      art_period_id, region_id, latitude, longitude, location_name, country, 
                      status, submitted_by, is_sensitive_location, cultural_significance)
VALUES ('Uluru Rock Art', 'Ancient rock paintings depicting traditional Dreamtime stories', 
        'Unknown', 'Anangu People', 2, 1, 1, -25.3444, 131.0369, 'Uluru', 'Australia', 
        'pending', 2, TRUE, 'Sacred site with deep spiritual significance to the Anangu people');

-- Add an image for the sample artwork
INSERT INTO artwork_images (artwork_id, image_path, is_primary, display_order)
VALUES (1, 'uploads/sample_uluru.jpg', TRUE, 1);

-- Create approval log entry
INSERT INTO approval_log (artwork_id, action, performed_by, notes, previous_status, new_status)
VALUES (1, 'submitted', 2, 'Initial submission', NULL, 'pending');

-- ============================================
-- USEFUL VIEWS FOR ADMIN DASHBOARD
-- ============================================

-- View: Pending artworks for admin review
CREATE VIEW pending_artworks_view AS
SELECT 
    a.artwork_id,
    a.title,
    a.description,
    a.artist_name,
    u.username AS submitted_by_user,
    u.email AS submitter_email,
    a.submission_date,
    at.type_name AS art_type,
    r.region_name AS region,
    (SELECT COUNT(*) FROM artwork_images WHERE artwork_id = a.artwork_id) AS image_count
FROM artworks a
JOIN users u ON a.submitted_by = u.user_id
LEFT JOIN art_types at ON a.art_type_id = at.type_id
LEFT JOIN regions r ON a.region_id = r.region_id
WHERE a.status = 'pending'
ORDER BY a.submission_date DESC;

-- View: Approved artworks for public display
CREATE VIEW public_artworks_view AS
SELECT 
    a.artwork_id,
    a.title,
    a.description,
    a.artist_name,
    a.indigenous_community,
    at.type_name AS art_type,
    ap.period_name AS art_period,
    r.region_name AS region,
    a.latitude,
    a.longitude,
    a.location_name,
    a.country,
    a.is_sensitive_location,
    a.cultural_significance,
    a.view_count,
    (SELECT image_path FROM artwork_images WHERE artwork_id = a.artwork_id AND is_primary = TRUE LIMIT 1) AS primary_image
FROM artworks a
LEFT JOIN art_types at ON a.art_type_id = at.type_id
LEFT JOIN art_periods ap ON a.art_period_id = ap.period_id
LEFT JOIN regions r ON a.region_id = r.region_id
WHERE a.status = 'approved'
ORDER BY a.submission_date DESC;

-- View: Admin statistics
CREATE VIEW admin_stats_view AS
SELECT 
    (SELECT COUNT(*) FROM artworks WHERE status = 'pending') AS pending_count,
    (SELECT COUNT(*) FROM artworks WHERE status = 'approved') AS approved_count,
    (SELECT COUNT(*) FROM artworks WHERE status = 'rejected') AS rejected_count,
    (SELECT COUNT(*) FROM artworks WHERE status = 'under_review') AS under_review_count,
    (SELECT COUNT(*) FROM users WHERE role = 'user') AS total_users,
    (SELECT COUNT(*) FROM artworks WHERE submission_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS submissions_this_week,
    (SELECT COUNT(*) FROM artworks WHERE submission_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS submissions_this_month;

-- ============================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- ============================================

-- Procedure: Approve artwork
DELIMITER //
CREATE PROCEDURE approve_artwork(
    IN p_artwork_id INT,
    IN p_admin_id INT,
    IN p_notes TEXT
)
BEGIN
    DECLARE v_previous_status VARCHAR(50);
    
    -- Get current status
    SELECT status INTO v_previous_status FROM artworks WHERE artwork_id = p_artwork_id;
    
    -- Update artwork status
    UPDATE artworks 
    SET status = 'approved', 
        reviewed_by = p_admin_id, 
        review_date = NOW(),
        review_notes = p_notes
    WHERE artwork_id = p_artwork_id;
    
    -- Log the action
    INSERT INTO approval_log (artwork_id, action, performed_by, notes, previous_status, new_status)
    VALUES (p_artwork_id, 'approved', p_admin_id, p_notes, v_previous_status, 'approved');
END //
DELIMITER ;

-- Procedure: Reject artwork
DELIMITER //
CREATE PROCEDURE reject_artwork(
    IN p_artwork_id INT,
    IN p_admin_id INT,
    IN p_notes TEXT
)
BEGIN
    DECLARE v_previous_status VARCHAR(50);
    
    -- Get current status
    SELECT status INTO v_previous_status FROM artworks WHERE artwork_id = p_artwork_id;
    
    -- Update artwork status
    UPDATE artworks 
    SET status = 'rejected', 
        reviewed_by = p_admin_id, 
        review_date = NOW(),
        review_notes = p_notes
    WHERE artwork_id = p_artwork_id;
    
    -- Log the action
    INSERT INTO approval_log (artwork_id, action, performed_by, notes, previous_status, new_status)
    VALUES (p_artwork_id, 'rejected', p_admin_id, p_notes, v_previous_status, 'rejected');
END //
DELIMITER ;

-- ============================================
-- TRIGGERS FOR AUTOMATIC ACTIONS
-- ============================================

-- Trigger: Increment view count
DELIMITER //
CREATE TRIGGER increment_view_count
AFTER INSERT ON artwork_images
FOR EACH ROW
BEGIN
    -- Automatically mark first uploaded image as primary
    IF NOT EXISTS (SELECT 1 FROM artwork_images WHERE artwork_id = NEW.artwork_id AND image_id != NEW.image_id AND is_primary = TRUE) THEN
        UPDATE artwork_images SET is_primary = TRUE WHERE image_id = NEW.image_id;
    END IF;
END //
DELIMITER ;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
-- Already included in table definitions above

-- ============================================
-- DATABASE SETUP COMPLETE
-- ============================================

SELECT 'Database schema created successfully!' AS Status;
SELECT 'Total Tables: 8' AS Info;
SELECT 'Total Views: 3' AS Info;
SELECT 'Total Stored Procedures: 2' AS Info;
SELECT 'Default admin user created: admin/admin123' AS Warning;
SELECT 'Please change the admin password immediately!' AS Important;
