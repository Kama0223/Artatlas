# Indigenous Art Atlas - Complete Setup Guide for VS Code

## 📋 **Table of Contents**
1. [Folder Structure](#folder-structure)
2. [Database Setup](#database-setup)
3. [PHP Configuration](#php-configuration)
4. [JavaScript Updates](#javascript-updates)
5. [Testing the Application](#testing)
6. [Troubleshooting](#troubleshooting)

---

## 📁 **1. Folder Structure**

Your VS Code project should be organized like this:

```
IA-Temp/                           # Your project root
│
├── .devcontainer/                 # Docker configuration (already set up)
│
├── src/
│   ├── cycle3/                    # ← Your full-stack application
│   │   │
│   │   ├── index.html
│   │   ├── browse.html
│   │   ├── art-detail.html
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── dashboard.html
│   │   ├── submit-art.html
│   │   ├── admin.html
│   │   ├── about.html
│   │   ├── contact.html
│   │   ├── ethics.html
│   │   └── guidelines.html
│   │   │
│   │   ├── css/
│   │   │   └── style.css
│   │   │
│   │   ├── js/
│   │   │   ├── main.js
│   │   │   ├── map.js
│   │   │   ├── auth.js
│   │   │   └── admin.js
│   │   │
│   │   ├── php/                   # ← CREATE THIS FOLDER
│   │   │   ├── config.php
│   │   │   ├── auth.php
│   │   │   ├── artworks.php
│   │   │   ├── admin.php
│   │   │   └── upload.php
│   │   │
│   │   └── uploads/               # ← CREATE THIS FOLDER
│   │       └── .gitkeep           # Keep folder in git
│   │
│   ├── inc/                       # Shared includes
│   │   └── db_connection.php      # Alternative DB config location
│   │
│   └── sql-exports/               # Database exports
│       └── latest_dump.sql
│
├── c1-c4/                         # Assignment deliverables
│   ├── cycle1/
│   ├── cycle2/
│   ├── cycle3/
│   └── cycle4/
│
├── project-docs/                  # Documentation
│
├── db.sql                         # Your database script (REPLACE WITH database_schema.sql)
├── dbmodify.sql
└── README.md
```

---

## 🗄️ **2. Database Setup**

### **Step 1: Replace Your Database Script**

1. Replace your current `db.sql` with the new `database_schema.sql` file
2. Or create a new file called `database_schema.sql` in your project root

### **Step 2: Run the Database Script**

In VS Code terminal, connect to your Docker MySQL:

```bash
# Connect to your MySQL Docker container
docker exec -it <your-mysql-container-name> mysql -u root -p

# Or if you have mysql client installed locally:
mysql -h localhost -u root -p indigenous_art_atlas
```

Then run:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS indigenous_art_atlas;
USE indigenous_art_atlas;

-- Run the schema script
SOURCE /path/to/database_schema.sql;
```

### **Step 3: Verify Tables Created**

```sql
SHOW TABLES;
```

You should see **8 tables**:
1. `users`
2. `art_types`
3. `art_periods`
4. `regions`
5. `artworks`
6. `artwork_images`
7. `approval_log`
8. `comments`

### **Step 4: Check Default Admin User**

```sql
SELECT * FROM users WHERE role = 'admin';
```

You should see the admin user with:
- **Username:** `admin`
- **Password:** `admin123` (hash stored)

---

## ⚙️ **3. PHP Configuration**

### **Step 1: Create PHP Folder**

```bash
mkdir -p src/cycle3/php
mkdir -p src/cycle3/uploads
```

### **Step 2: Create PHP Files**

Copy the PHP code from `PHP_BACKEND_FILES.md` into these files:

1. **src/cycle3/php/config.php** - Database connection
2. **src/cycle3/php/auth.php** - Authentication
3. **src/cycle3/php/artworks.php** - Artwork operations
4. **src/cycle3/php/admin.php** - Admin portal
5. **src/cycle3/php/upload.php** - Image upload

### **Step 3: Update Database Credentials**

Edit `src/cycle3/php/config.php`:

```php
define('DB_HOST', 'localhost');     // or your Docker host
define('DB_USER', 'root');          // your MySQL user
define('DB_PASS', 'your_password'); // your MySQL password
define('DB_NAME', 'indigenous_art_atlas');
```

### **Step 4: Set Folder Permissions**

```bash
chmod 755 src/cycle3/php
chmod 777 src/cycle3/uploads
```

---

## 🔧 **4. JavaScript Updates**

You need to update your JavaScript files to connect to the PHP backend.

### **Update auth.js**

Find the functions that currently use `localStorage` and update them to use `fetch()` to call PHP:

```javascript
// Example: Login function
async function login(username, password) {
    const formData = new FormData();
    formData.append('action', 'login');
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await fetch('php/auth.php', {
        method: 'POST',
        body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
        // Store user session
        localStorage.setItem('userSession', JSON.stringify({
            user: data.user,
            timestamp: new Date().getTime()
        }));
        // Redirect or update UI
    }
    
    return data;
}
```

### **Update main.js**

Update artwork loading:

```javascript
async function loadArtworks(filters = {}) {
    const params = new URLSearchParams({
        action: 'list',
        status: 'approved',
        ...filters
    });
    
    const response = await fetch(`php/artworks.php?${params}`);
    const data = await response.json();
    
    if (data.success) {
        displayArtworks(data.artworks);
    }
}
```

### **Update admin.js**

Update admin functions:

```javascript
async function loadPendingArtworks() {
    const response = await fetch('php/admin.php?action=pending');
    const data = await response.json();
    
    if (data.success) {
        displayPendingArtworks(data.artworks);
    }
}

async function approveArtwork(artworkId, notes) {
    const formData = new FormData();
    formData.append('action', 'approve');
    formData.append('artwork_id', artworkId);
    formData.append('notes', notes);
    
    const response = await fetch('php/admin.php', {
        method: 'POST',
        body: formData
    });
    
    const data = await response.json();
    return data;
}
```

---

## ✅ **5. Testing the Application**

### **Step 1: Start Your Local Server**

Option A - Using VS Code Live Server:
1. Install "Live Server" extension
2. Right-click on `src/cycle3/index.html`
3. Select "Open with Live Server"

Option B - Using PHP Built-in Server:
```bash
cd src/cycle3
php -S localhost:8000
```

Option C - Using Python:
```bash
cd src/cycle3
python -m http.server 8000
```

### **Step 2: Test Admin Login**

1. Navigate to `http://localhost:8000/login.html`
2. Login with:
   - **Username:** `admin`
   - **Password:** `admin123`
3. You should be redirected to the admin panel

### **Step 3: Test Admin Functions**

1. Go to Admin Panel (`admin.html`)
2. View pending artworks (should be empty initially)
3. Check admin statistics
4. View activity log

### **Step 4: Test User Registration**

1. Go to `register.html`
2. Create a new user account
3. Login with the new account
4. Try submitting an artwork

### **Step 5: Test Approval Workflow**

1. Login as regular user → Submit artwork
2. Logout → Login as admin
3. Go to Admin Panel → View pending artwork
4. Approve or reject the artwork
5. Logout → Login as regular user
6. Check dashboard to see status

---

## 🐛 **6. Troubleshooting**

### **Common Issues**

#### **Database Connection Fails**
```
Error: Database connection failed
```
**Solution:**
- Check Docker MySQL is running: `docker ps`
- Verify credentials in `config.php`
- Check database exists: `SHOW DATABASES;`

#### **CORS Errors**
```
Access to fetch blocked by CORS policy
```
**Solution:**
- Ensure `config.php` has CORS headers
- Run from same domain/port

#### **File Upload Fails**
```
Failed to move uploaded file
```
**Solution:**
```bash
chmod 777 src/cycle3/uploads
chown www-data:www-data src/cycle3/uploads  # Linux
```

#### **Session Not Working**
```
User not staying logged in
```
**Solution:**
- Check PHP session is started in `config.php`
- Clear browser cookies/cache
- Check `session.cookie_secure` in php.ini

#### **Admin Functions Not Working**
```
Unauthorized access
```
**Solution:**
- Check user role in database: `SELECT * FROM users WHERE username='admin';`
- Ensure session contains `role = 'admin'`

---

## 📊 **Database Summary**

**Total Tables:** 8

1. **users** - User accounts and authentication
2. **art_types** - Art categories (10 types)
3. **art_periods** - Time periods (4 periods)
4. **regions** - Geographic regions (8 regions)
5. **artworks** - Main artwork data with approval status
6. **artwork_images** - Multiple images per artwork
7. **approval_log** - Audit trail for all approvals/rejections
8. **comments** - User feedback (optional)

**Total Views:** 3
- `pending_artworks_view` - For admin review
- `public_artworks_view` - For public display
- `admin_stats_view` - Dashboard statistics

**Stored Procedures:** 2
- `approve_artwork()` - Approve with logging
- `reject_artwork()` - Reject with logging

---

## 🚀 **Quick Start Commands**

```bash
# 1. Create folders
mkdir -p src/cycle3/php src/cycle3/uploads

# 2. Set permissions
chmod 755 src/cycle3/php
chmod 777 src/cycle3/uploads

# 3. Create database
mysql -u root -p < database_schema.sql

# 4. Start server
cd src/cycle3 && php -S localhost:8000
```

---

## 📝 **Next Steps**

1. ✅ Copy your current HTML/CSS/JS files to `src/cycle3/`
2. ✅ Create PHP files from the provided templates
3. ✅ Run the database schema script
4. ✅ Update JavaScript to use fetch() calls to PHP
5. ✅ Test the full workflow
6. ✅ Change admin password!
7. ✅ Add sample data for demonstration
8. ✅ Export database before submission

---

## 🔒 **Security Checklist**

- [ ] Change default admin password
- [ ] Use prepared statements (already done)
- [ ] Validate all inputs
- [ ] Sanitize file uploads
- [ ] Use HTTPS in production
- [ ] Set proper folder permissions
- [ ] Enable error logging (not display)
- [ ] Add rate limiting for login attempts

---

## 📤 **Before Submission**

1. Export your database:
```bash
mysqldump -u root -p indigenous_art_atlas > src/sql-exports/cycle3_dump.sql
```

2. Create git log:
```bash
git log --pretty=format:'%h,%an,%ar,%s' > c1-c4/cycle3/c3-log.csv
```

3. Test all functionality one final time
4. Update your documentation

---

**Your application is now full stack with PHP and MySQL!** 🎉
