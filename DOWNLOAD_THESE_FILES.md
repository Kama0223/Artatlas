# 📥 DOWNLOAD THESE FILES FROM REPLIT

## ⭐ **Complete File List - Copy to VS Code**

---

## 📁 **1. DATABASE FILES** (Copy to project root)

### ✅ `database_schema.sql`
**Location in Replit:** Root folder  
**Location in VS Code:** Root folder  
**Purpose:** MySQL database schema for Docker  

### ✅ `database_schema_postgresql.sql`
**Location in Replit:** Root folder  
**Location in VS Code:** Root folder (backup/alternative)  
**Purpose:** PostgreSQL version (if needed)

---

## 📁 **2. PHP BACKEND FILES** (Create `src/cycle3/php/` folder first)

### ✅ `php/config.php`
**Location in Replit:** `php/config.php`  
**Location in VS Code:** `src/cycle3/php/config.php`  
**Purpose:** Database connection configuration  
**ACTION:** Update DB credentials after copying!

### ✅ `php/auth.php`
**Location in Replit:** `php/auth.php`  
**Location in VS Code:** `src/cycle3/php/auth.php`  
**Purpose:** User authentication (login, register, logout)

### ✅ `php/artworks.php`
**Location in Replit:** `php/artworks.php`  
**Location in VS Code:** `src/cycle3/php/artworks.php`  
**Purpose:** Artwork CRUD operations

### ✅ `php/admin.php`
**Location in Replit:** `php/admin.php`  
**Location in VS Code:** `src/cycle3/php/admin.php`  
**Purpose:** Admin portal & approval workflow

### ✅ `php/upload.php`
**Location in Replit:** `php/upload.php`  
**Location in VS Code:** `src/cycle3/php/upload.php`  
**Purpose:** Image upload handling

---

## 📁 **3. HTML FILES** (Copy to `src/cycle3/`)

### ✅ Frontend Pages (12 files):
**Location in Replit:** Root folder  
**Location in VS Code:** `src/cycle3/`

1. `index.html`
2. `browse.html`
3. `art-detail.html`
4. `login.html`
5. `register.html`
6. `dashboard.html`
7. `submit-art.html`
8. `admin.html`
9. `about.html`
10. `contact.html`
11. `ethics.html`
12. `guidelines.html`

---

## 📁 **4. CSS FILES** (Copy to `src/cycle3/css/`)

### ✅ `css/style.css`
**Location in Replit:** `css/style.css`  
**Location in VS Code:** `src/cycle3/css/style.css`  
**Purpose:** All styling

---

## 📁 **5. JAVASCRIPT FILES** (Copy to `src/cycle3/js/`)

### ✅ `js/auth.js` ⭐ UPDATED!
**Location in Replit:** `js/auth.js`  
**Location in VS Code:** `src/cycle3/js/auth.js`  
**Purpose:** Authentication (NOW connects to PHP backend)

### ✅ `js/main.js`
**Location in Replit:** `js/main.js`  
**Location in VS Code:** `src/cycle3/js/main.js`  
**Purpose:** Core app logic

### ✅ `js/map.js`
**Location in Replit:** `js/map.js`  
**Location in VS Code:** `src/cycle3/js/map.js`  
**Purpose:** Leaflet.js map functionality

### ✅ `js/admin.js`
**Location in Replit:** `js/admin.js`  
**Location in VS Code:** `src/cycle3/js/admin.js`  
**Purpose:** Admin panel functions

---

## 📁 **6. DOCUMENTATION FILES** (Optional but recommended)

### ✅ `FLOW_DIAGRAM.md`
**Purpose:** Visual workflow diagram with decision points

### ✅ `SETUP_GUIDE.md`
**Purpose:** Complete setup instructions

### ✅ `COMPLETE_SUMMARY.md`
**Purpose:** Project overview and summary

### ✅ `PHP_BACKEND_FILES.md`
**Purpose:** PHP code reference and examples

### ✅ `COPY_TO_VSCODE.md`
**Purpose:** This guide!

---

## 📁 **7. CREATE THESE FOLDERS** (Empty folders needed)

### ✅ `src/cycle3/uploads/`
**Purpose:** Store uploaded artwork images  
**Action:** Create folder and set permissions:
```bash
mkdir -p src/cycle3/uploads
chmod 777 src/cycle3/uploads
```

---

## 🔢 **FILE COUNT SUMMARY**

| Category | Files | Location |
|----------|-------|----------|
| Database | 2 | Root |
| PHP Backend | 5 | `src/cycle3/php/` |
| HTML Pages | 12 | `src/cycle3/` |
| CSS | 1 | `src/cycle3/css/` |
| JavaScript | 4 | `src/cycle3/js/` |
| Documentation | 5 | Root (optional) |
| **TOTAL** | **29 files** | - |

---

## 📋 **COPY CHECKLIST**

### Phase 1: Database
- [ ] Download `database_schema.sql`
- [ ] Download `database_schema_postgresql.sql` (backup)

### Phase 2: Backend
- [ ] Create folder: `src/cycle3/php/`
- [ ] Copy `php/config.php`
- [ ] Copy `php/auth.php`
- [ ] Copy `php/artworks.php`
- [ ] Copy `php/admin.php`
- [ ] Copy `php/upload.php`

### Phase 3: Frontend
- [ ] Create folder: `src/cycle3/`
- [ ] Copy all 12 HTML files
- [ ] Copy `css/` folder
- [ ] Copy `js/` folder (4 files)

### Phase 4: Setup
- [ ] Create `src/cycle3/uploads/` folder
- [ ] Run database schema in Docker MySQL
- [ ] Update `config.php` with Docker credentials
- [ ] Set folder permissions

### Phase 5: Test
- [ ] Start PHP server: `php -S localhost:8000`
- [ ] Test admin login (admin/admin123)
- [ ] Test user registration
- [ ] Test art submission
- [ ] Test admin approval

---

## 🚀 **QUICK DOWNLOAD COMMAND** (If using Replit CLI)

```bash
# Download all files at once
replit download php/
replit download css/
replit download js/
replit download *.html
replit download database_schema.sql
replit download *.md
```

---

## 💾 **ALTERNATIVE: Download as ZIP**

1. In Replit, go to the three-dot menu
2. Click "Download as ZIP"
3. Extract to your VS Code project
4. Reorganize into the structure above

---

## ⚙️ **AFTER COPYING - IMPORTANT!**

### 1. Update Database Config
Edit `src/cycle3/php/config.php`:
```php
// Change these lines:
$host = 'localhost';  // Your Docker MySQL host
$user = 'root';       // Your MySQL user
$password = 'YOUR_PASSWORD_HERE';
$dbname = 'indigenous_art_atlas';
```

### 2. Run Database Script
```bash
mysql -u root -p < database_schema.sql
```

### 3. Set Permissions
```bash
chmod 777 src/cycle3/uploads
```

### 4. Start Server
```bash
cd src/cycle3
php -S localhost:8000
```

---

## ✅ **VERIFICATION**

After copying everything, you should have:

```
IA-Temp/
├── database_schema.sql ✓
├── database_schema_postgresql.sql ✓
├── src/
│   └── cycle3/
│       ├── php/ (5 files) ✓
│       ├── css/ (1 file) ✓
│       ├── js/ (4 files) ✓
│       ├── uploads/ (empty) ✓
│       └── *.html (12 files) ✓
```

**Total: 29 files + folders ready!** 🎉
