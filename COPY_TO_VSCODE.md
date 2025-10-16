# 📦 Complete Files Package for VS Code

## 🗂️ **Folder Structure to Create in VS Code**

```
IA-Temp/
├── src/
│   └── cycle3/                    # ← Your full-stack application
│       ├── index.html             ✅ (already exists - copy from Replit)
│       ├── browse.html            ✅ (already exists - copy from Replit)
│       ├── art-detail.html        ✅ (already exists - copy from Replit)
│       ├── login.html             ✅ (already exists - copy from Replit)
│       ├── register.html          ✅ (already exists - copy from Replit)
│       ├── dashboard.html         ✅ (already exists - copy from Replit)
│       ├── submit-art.html        ✅ (already exists - copy from Replit)
│       ├── admin.html             ✅ (already exists - copy from Replit)
│       ├── about.html             ✅ (already exists - copy from Replit)
│       ├── contact.html           ✅ (already exists - copy from Replit)
│       ├── ethics.html            ✅ (already exists - copy from Replit)
│       ├── guidelines.html        ✅ (already exists - copy from Replit)
│       │
│       ├── css/
│       │   └── style.css          ✅ (already exists - copy from Replit)
│       │
│       ├── js/
│       │   ├── main.js            ✅ (already exists - copy from Replit)
│       │   ├── map.js             ✅ (already exists - copy from Replit)
│       │   ├── auth.js            ✅ (UPDATED - copy from Replit)
│       │   └── admin.js           ✅ (already exists - copy from Replit)
│       │
│       ├── php/                   ⭐ NEW - Copy from Replit
│       │   ├── config.php
│       │   ├── auth.php
│       │   ├── artworks.php
│       │   ├── admin.php
│       │   └── upload.php
│       │
│       └── uploads/               ⭐ CREATE THIS - Empty folder
│           └── .gitkeep
│
├── database_schema.sql            ⭐ NEW - For MySQL (Docker)
├── database_schema_postgresql.sql ⭐ NEW - For PostgreSQL (Alternative)
└── README_SETUP.md                ⭐ NEW - Complete setup guide
```

---

## 📋 **Step-by-Step Copy Instructions**

### **Step 1: Copy Existing HTML/CSS/JS Files**
From Replit, copy these folders to VS Code `src/cycle3/`:
- `*.html` (all 12 HTML files)
- `css/` folder
- `js/` folder

### **Step 2: Copy NEW Backend Files**
From Replit, copy these to VS Code `src/cycle3/php/`:
- `php/config.php`
- `php/auth.php`
- `php/artworks.php`
- `php/admin.php`
- `php/upload.php`

### **Step 3: Copy Database Files**
From Replit root, copy to VS Code root:
- `database_schema.sql` (for MySQL/Docker)
- `database_schema_postgresql.sql` (for PostgreSQL)

### **Step 4: Create Empty Uploads Folder**
In VS Code: `src/cycle3/uploads/`

---

## 🗄️ **Database Setup in Docker**

1. Connect to your Docker MySQL:
```bash
docker exec -it <your-mysql-container> mysql -u root -p
```

2. Create and populate database:
```sql
CREATE DATABASE indigenous_art_atlas;
USE indigenous_art_atlas;
SOURCE /path/to/database_schema.sql;
```

3. Verify:
```sql
SHOW TABLES;  -- Should show 8 tables
SELECT * FROM users WHERE role='admin';  -- Should show admin user
```

---

## ⚙️ **Update PHP Config for Docker**

Edit `src/cycle3/php/config.php` and update database credentials:

```php
// For MySQL/Docker
define('DB_HOST', 'localhost');  // or your Docker host IP
define('DB_USER', 'root');
define('DB_PASS', 'your_mysql_password');
define('DB_NAME', 'indigenous_art_atlas');

// Use mysqli for MySQL
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
```

---

## 🚀 **Running in VS Code**

Option 1 - PHP Built-in Server:
```bash
cd src/cycle3
php -S localhost:8000
```

Option 2 - Python Server (if PHP not available):
```bash
cd src/cycle3
python -m http.server 8000
```

Then open: `http://localhost:8000/index.html`

---

## 🔐 **Test Admin Login**

1. Go to: `http://localhost:8000/login.html`
2. Login with:
   - **Username:** admin
   - **Email:** admin@indigenousartatlas.com
   - **Password:** admin123
3. Should redirect to `admin.html`

---

## 📊 **Database Summary**

**Tables Created (8):**
1. ✅ users - User accounts & auth
2. ✅ art_types - 10 art categories
3. ✅ art_periods - 4 time periods
4. ✅ regions - 8 geographic regions
5. ✅ artworks - Main content with approval workflow
6. ✅ artwork_images - Multiple images per artwork
7. ✅ approval_log - Admin action audit trail
8. ✅ comments - User feedback (optional)

**Views (3):**
- pending_artworks_view
- public_artworks_view
- admin_stats_view

**Functions (2):**
- approve_artwork()
- reject_artwork()

---

## ✅ **Testing Checklist**

- [ ] Database tables created
- [ ] Admin login works
- [ ] User registration works
- [ ] Art submission works
- [ ] Admin can see pending artworks
- [ ] Admin can approve/reject
- [ ] Approved art shows on map
- [ ] Image upload works

---

## 📁 **File Locations in Replit**

Copy these files from Replit:

**Backend PHP:**
- `php/config.php`
- `php/auth.php`
- `php/artworks.php`
- `php/admin.php`
- `php/upload.php`

**Database:**
- `database_schema.sql`
- `database_schema_postgresql.sql`

**Frontend (existing):**
- All HTML files (root)
- `css/style.css`
- `js/main.js`, `js/map.js`, `js/auth.js`, `js/admin.js`

**Documentation:**
- `FLOW_DIAGRAM.md`
- `PHP_BACKEND_FILES.md`
- `SETUP_GUIDE.md`
- `COMPLETE_SUMMARY.md`

---

## 🎯 **Quick Start Commands**

```bash
# 1. Create folders
mkdir -p src/cycle3/php
mkdir -p src/cycle3/uploads
chmod 777 src/cycle3/uploads

# 2. Setup database
mysql -u root -p < database_schema.sql

# 3. Update config.php with Docker credentials

# 4. Start server
cd src/cycle3
php -S localhost:8000

# 5. Open browser
http://localhost:8000/index.html
```

---

## 🆘 **Troubleshooting**

**Database won't connect?**
- Check Docker MySQL is running
- Verify credentials in config.php
- Test: `mysql -u root -p -h localhost`

**Images won't upload?**
- Check folder permissions: `chmod 777 uploads`
- Verify folder exists

**Admin functions not working?**
- Check session is active
- Verify user role = 'admin' in database

---

**Everything is ready to copy! 🎨✨**
