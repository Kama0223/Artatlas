-- ============================================
-- Indigenous Art Atlas - PostgreSQL Database Schema
-- Full Stack Implementation with Admin Portal
-- ============================================

-- Drop existing tables if they exist (for clean install)
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS artwork_images CASCADE;
DROP TABLE IF EXISTS artworks CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS art_types CASCADE;
DROP TABLE IF EXISTS art_periods CASCADE;
DROP TABLE IF EXISTS regions CASCADE;
DROP TABLE IF EXISTS approval_log CASCADE;

-- Drop custom types if they exist
DROP TYPE IF EXISTS user_type_enum CASCADE;
DROP TYPE IF EXISTS role_enum CASCADE;
DROP TYPE IF EXISTS status_enum CASCADE;
DROP TYPE IF EXISTS action_enum CASCADE;

-- Create custom types for PostgreSQL
CREATE TYPE user_type_enum AS ENUM ('visitor', 'artist', 'researcher', 'admin');
CREATE TYPE role_enum AS ENUM ('user', 'admin');
CREATE TYPE status_enum AS ENUM ('pending', 'approved', 'rejected', 'under_review');
CREATE TYPE action_enum AS ENUM ('submitted', 'under_review', 'approved', 'rejected', 'resubmitted');

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    user_type user_type_enum DEFAULT 'visitor',
    role role_enum DEFAULT 'user',
    bio TEXT,
    affiliation VARCHAR(100),
    indigenous_community VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    profile_image VARCHAR(255)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- 2. ART TYPES TABLE
-- ============================================
CREATE TABLE art_types (
    type_id SERIAL PRIMARY KEY,
    type_code VARCHAR(50) UNIQUE NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
-- 3. ART PERIODS TABLE
-- ============================================
CREATE TABLE art_periods (
    period_id SERIAL PRIMARY KEY,
    period_code VARCHAR(50) UNIQUE NOT NULL,
    period_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO art_periods (period_code, period_name, description) VALUES
('ancient', 'Ancient', 'Pre-1500 CE'),
('historical', 'Historical', '1500-1900 CE'),
('modern', 'Modern', '1900-1980 CE'),
('contemporary', 'Contemporary', '1980-Present');

-- ============================================
-- 4. REGIONS TABLE
-- ============================================
CREATE TABLE regions (
    region_id SERIAL PRIMARY KEY,
    region_code VARCHAR(50) UNIQUE NOT NULL,
    region_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
-- 5. ARTWORKS TABLE
-- ============================================
CREATE TABLE artworks (
    artwork_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    artist_name VARCHAR(100),
    indigenous_community VARCHAR(100),
    art_type_id INTEGER REFERENCES art_types(type_id) ON DELETE SET NULL,
    art_period_id INTEGER REFERENCES art_periods(period_id) ON DELETE SET NULL,
    region_id INTEGER REFERENCES regions(region_id) ON DELETE SET NULL,
    
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_name VARCHAR(200),
    country VARCHAR(100),
    is_sensitive_location BOOLEAN DEFAULT FALSE,
    
    estimated_date VARCHAR(100),
    date_range_start VARCHAR(50),
    date_range_end VARCHAR(50),
    
    cultural_significance TEXT,
    creation_technique TEXT,
    materials_used TEXT,
    
    submitted_by INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    status status_enum DEFAULT 'pending',
    reviewed_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    review_date TIMESTAMP NULL,
    review_notes TEXT,
    
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_artworks_status ON artworks(status);
CREATE INDEX idx_artworks_submitted_by ON artworks(submitted_by);
CREATE INDEX idx_artworks_art_type ON artworks(art_type_id);
CREATE INDEX idx_artworks_region ON artworks(region_id);
CREATE INDEX idx_artworks_submission_date ON artworks(submission_date);
CREATE INDEX idx_artworks_featured ON artworks(is_featured);

-- ============================================
-- 6. ARTWORK IMAGES TABLE
-- ============================================
CREATE TABLE artwork_images (
    image_id SERIAL PRIMARY KEY,
    artwork_id INTEGER NOT NULL REFERENCES artworks(artwork_id) ON DELETE CASCADE,
    image_path VARCHAR(255) NOT NULL,
    image_caption TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_size INTEGER
);

CREATE INDEX idx_artwork_images_artwork ON artwork_images(artwork_id);
CREATE INDEX idx_artwork_images_primary ON artwork_images(is_primary);

-- ============================================
-- 7. APPROVAL LOG TABLE
-- ============================================
CREATE TABLE approval_log (
    log_id SERIAL PRIMARY KEY,
    artwork_id INTEGER NOT NULL REFERENCES artworks(artwork_id) ON DELETE CASCADE,
    action action_enum NOT NULL,
    performed_by INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    previous_status VARCHAR(50),
    new_status VARCHAR(50)
);

CREATE INDEX idx_approval_log_artwork ON approval_log(artwork_id);
CREATE INDEX idx_approval_log_action_date ON approval_log(action_date);

-- ============================================
-- 8. COMMENTS TABLE
-- ============================================
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    artwork_id INTEGER NOT NULL REFERENCES artworks(artwork_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_approved BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_comments_artwork ON comments(artwork_id);
CREATE INDEX idx_comments_user ON comments(user_id);

-- ============================================
-- CREATE DEFAULT ADMIN USER
-- Password: admin123 (bcrypt hash)
-- ============================================
INSERT INTO users (username, email, password_hash, full_name, user_type, role, is_active) 
VALUES ('admin', 'admin@indigenousartatlas.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
        'System Administrator', 'admin', 'admin', TRUE);

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

INSERT INTO users (username, email, password_hash, full_name, user_type, role) 
VALUES ('testuser', 'test@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
        'Test User', 'artist', 'user');

INSERT INTO artworks (title, description, artist_name, indigenous_community, art_type_id, 
                      art_period_id, region_id, latitude, longitude, location_name, country, 
                      status, submitted_by, is_sensitive_location, cultural_significance)
VALUES ('Uluru Rock Art', 'Ancient rock paintings depicting traditional Dreamtime stories', 
        'Unknown', 'Anangu People', 2, 1, 1, -25.3444, 131.0369, 'Uluru', 'Australia', 
        'pending', 2, TRUE, 'Sacred site with deep spiritual significance to the Anangu people');

INSERT INTO artwork_images (artwork_id, image_path, is_primary, display_order)
VALUES (1, 'uploads/sample_uluru.jpg', TRUE, 1);

INSERT INTO approval_log (artwork_id, action, performed_by, notes, previous_status, new_status)
VALUES (1, 'submitted', 2, 'Initial submission', NULL, 'pending');

-- ============================================
-- VIEWS FOR EASY QUERIES
-- ============================================

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

CREATE VIEW admin_stats_view AS
SELECT 
    (SELECT COUNT(*) FROM artworks WHERE status = 'pending') AS pending_count,
    (SELECT COUNT(*) FROM artworks WHERE status = 'approved') AS approved_count,
    (SELECT COUNT(*) FROM artworks WHERE status = 'rejected') AS rejected_count,
    (SELECT COUNT(*) FROM artworks WHERE status = 'under_review') AS under_review_count,
    (SELECT COUNT(*) FROM users WHERE role = 'user') AS total_users,
    (SELECT COUNT(*) FROM artworks WHERE submission_date >= CURRENT_DATE - INTERVAL '7 days') AS submissions_this_week,
    (SELECT COUNT(*) FROM artworks WHERE submission_date >= CURRENT_DATE - INTERVAL '30 days') AS submissions_this_month;

-- ============================================
-- FUNCTIONS FOR APPROVAL WORKFLOW
-- ============================================

CREATE OR REPLACE FUNCTION approve_artwork(
    p_artwork_id INTEGER,
    p_admin_id INTEGER,
    p_notes TEXT
)
RETURNS VOID AS $$
DECLARE
    v_previous_status VARCHAR(50);
BEGIN
    SELECT status::TEXT INTO v_previous_status FROM artworks WHERE artwork_id = p_artwork_id;
    
    UPDATE artworks 
    SET status = 'approved', 
        reviewed_by = p_admin_id, 
        review_date = NOW(),
        review_notes = p_notes
    WHERE artwork_id = p_artwork_id;
    
    INSERT INTO approval_log (artwork_id, action, performed_by, notes, previous_status, new_status)
    VALUES (p_artwork_id, 'approved', p_admin_id, p_notes, v_previous_status, 'approved');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reject_artwork(
    p_artwork_id INTEGER,
    p_admin_id INTEGER,
    p_notes TEXT
)
RETURNS VOID AS $$
DECLARE
    v_previous_status VARCHAR(50);
BEGIN
    SELECT status::TEXT INTO v_previous_status FROM artworks WHERE artwork_id = p_artwork_id;
    
    UPDATE artworks 
    SET status = 'rejected', 
        reviewed_by = p_admin_id, 
        review_date = NOW(),
        review_notes = p_notes
    WHERE artwork_id = p_artwork_id;
    
    INSERT INTO approval_log (artwork_id, action, performed_by, notes, previous_status, new_status)
    VALUES (p_artwork_id, 'rejected', p_admin_id, p_notes, v_previous_status, 'rejected');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER FOR AUTO-PRIMARY IMAGE
-- ============================================

CREATE OR REPLACE FUNCTION set_first_image_as_primary()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM artwork_images 
        WHERE artwork_id = NEW.artwork_id 
        AND image_id != NEW.image_id 
        AND is_primary = TRUE
    ) THEN
        UPDATE artwork_images SET is_primary = TRUE WHERE image_id = NEW.image_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_primary_image
AFTER INSERT ON artwork_images
FOR EACH ROW
EXECUTE FUNCTION set_first_image_as_primary();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
    RAISE NOTICE 'Total Tables: 8';
    RAISE NOTICE 'Total Views: 3';
    RAISE NOTICE 'Total Functions: 2';
    RAISE NOTICE 'Default admin user: admin/admin123';
    RAISE NOTICE 'IMPORTANT: Change admin password immediately!';
END $$;
