/**
 * Indigenous Art Atlas - Authentication Management
 * Handles user registration, login, logout, and session management
 */

window.AuthManager = {
    currentUser: null,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds

    // Initialize authentication system
    initialize: () => {
        AuthManager.checkAuthState();
        AuthManager.initializeForms();
    },

    // Check current authentication state
    checkAuthState: async () => {
        try {
            const response = await fetch('php/auth.php?action=check');
            const data = await response.json();
            
            if (data.success && data.authenticated) {
                AuthManager.currentUser = data.user;
                window.IndigenousArtAtlas.currentUser = data.user;
                AuthManager.updateAuthUI();
            } else {
                AuthManager.currentUser = null;
                window.IndigenousArtAtlas.currentUser = null;
                AuthManager.updateAuthUI();
            }
        } catch (error) {
            console.error('Auth check error:', error);
            AuthManager.updateAuthUI();
        }
    },

    // Initialize authentication forms
    initializeForms: () => {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', AuthManager.handleLogin);
        }

        // Registration form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', AuthManager.handleRegistration);
            
            // User type change handler
            const userTypeSelect = document.getElementById('user-type');
            const artistInfo = document.getElementById('artist-info');
            if (userTypeSelect && artistInfo) {
                userTypeSelect.addEventListener('change', (e) => {
                    artistInfo.style.display = e.target.value === 'artist' ? 'block' : 'none';
                });
            }
        }

        // Admin login form
        const adminLoginForm = document.getElementById('admin-login-form');
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', AuthManager.handleAdminLogin);
        }

        // Report form
        const reportForm = document.getElementById('report-form');
        if (reportForm) {
            reportForm.addEventListener('submit', AuthManager.handleReportSubmission);
        }
    },

    // Handle user login
    handleLogin: async (e) => {
        e.preventDefault();
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Clear previous errors
        window.FormValidator.clearFormErrors(form);
        
        // Get form data
        const email = form.email.value.trim();
        const password = form.password.value;
        const rememberMe = form['remember-me']?.checked || false;
        
        // Validate inputs
        const errors = {};
        
        if (!email) {
            errors.email = 'Email is required';
        } else if (!window.Utils.isValidEmail(email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        if (!password) {
            errors.password = 'Password is required';
        }
        
        // Show errors if any
        if (Object.keys(errors).length > 0) {
            Object.entries(errors).forEach(([field, message]) => {
                window.FormValidator.showFieldError(field, message);
            });
            return;
        }
        
        // Show loading state
        window.Utils.setLoading(true, submitButton);
        
        try {
            const formData = new FormData();
            formData.append('action', 'login');
            formData.append('username', email);
            formData.append('password', password);
            
            const response = await fetch('php/auth.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                AuthManager.currentUser = data.user;
                window.IndigenousArtAtlas.currentUser = data.user;
                
                window.Utils.showNotification('Login successful! Welcome back.', 'success');
                
                setTimeout(() => {
                    if (window.location.pathname.includes('login.html')) {
                        window.location.href = data.user.role === 'admin' ? 'admin.html' : 'dashboard.html';
                    } else {
                        window.location.reload();
                    }
                }, 1000);
            } else {
                window.FormValidator.showFieldError('email', data.message || 'Login failed');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            window.Utils.showNotification('Login failed. Please try again.', 'error');
        } finally {
            window.Utils.setLoading(false, submitButton);
        }
    },

    // Handle user registration
    handleRegistration: async (e) => {
        e.preventDefault();
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Clear previous errors
        window.FormValidator.clearFormErrors(form);
        
        // Get form data
        const formData = {
            firstName: form['first-name'].value.trim(),
            lastName: form['last-name'].value.trim(),
            username: form.username.value.trim(),
            email: form.email.value.trim(),
            password: form.password.value,
            confirmPassword: form['confirm-password'].value,
            userType: form['user-type'].value,
            artistBio: form['artist-bio']?.value.trim() || '',
            termsAgreed: form['terms-agreement'].checked,
            culturalSensitivity: form['cultural-sensitivity']?.checked || false
        };
        
        // Validate inputs
        const errors = AuthManager.validateRegistrationData(formData);
        
        // Show errors if any
        if (Object.keys(errors).length > 0) {
            Object.entries(errors).forEach(([field, message]) => {
                window.FormValidator.showFieldError(field, message);
            });
            return;
        }
        
        // Show loading state
        window.Utils.setLoading(true, submitButton);
        
        try {
            const postData = new FormData();
            postData.append('action', 'register');
            postData.append('username', formData.username);
            postData.append('email', formData.email);
            postData.append('password', formData.password);
            postData.append('full_name', `${formData.firstName} ${formData.lastName}`);
            postData.append('user_type', formData.userType);
            postData.append('bio', formData.artistBio);
            
            const response = await fetch('php/auth.php', {
                method: 'POST',
                body: postData
            });
            
            const data = await response.json();
            
            if (data.success) {
                AuthManager.currentUser = data.user;
                window.IndigenousArtAtlas.currentUser = data.user;
                
                window.Utils.showNotification('Account created successfully! Welcome to Indigenous Art Atlas.', 'success');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            } else {
                window.Utils.showNotification(data.message || 'Registration failed', 'error');
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            window.Utils.showNotification('Registration failed. Please try again.', 'error');
        } finally {
            window.Utils.setLoading(false, submitButton);
        }
    },

    // Handle admin login
    handleAdminLogin: async (e) => {
        e.preventDefault();
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Get form data
        const username = form['admin-username'].value.trim();
        const password = form['admin-password'].value;
        
        // Validate inputs
        if (!username || !password) {
            window.Utils.showNotification('Please enter both username and password', 'error');
            return;
        }
        
        // Show loading state
        window.Utils.setLoading(true, submitButton);
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check admin credentials (demo credentials)
            if (username === 'admin' && password === 'admin123') {
                // Create admin user
                const adminUser = {
                    id: 'admin-1',
                    username: 'admin',
                    email: 'admin@indigenousartatlas.org',
                    firstName: 'System',
                    lastName: 'Administrator',
                    userType: 'admin',
                    joinDate: new Date().toISOString(),
                    status: 'active'
                };
                
                // Create session
                const sessionData = {
                    user: adminUser,
                    timestamp: new Date().getTime(),
                    rememberMe: false
                };
                
                localStorage.setItem('userSession', JSON.stringify(sessionData));
                AuthManager.currentUser = adminUser;
                window.IndigenousArtAtlas.currentUser = adminUser;
                
                // Show success and redirect
                window.Utils.showNotification('Admin login successful', 'success');
                window.closeAdminLogin();
                
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
                
            } else {
                window.Utils.showNotification('Invalid admin credentials', 'error');
            }
            
        } catch (error) {
            console.error('Admin login error:', error);
            window.Utils.showNotification('Login failed. Please try again.', 'error');
        } finally {
            window.Utils.setLoading(false, submitButton);
        }
    },

    // Handle report submission
    handleReportSubmission: async (e) => {
        e.preventDefault();
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Get form data
        const reason = form['report-reason'].value;
        const details = form['report-details'].value.trim();
        
        if (!reason) {
            window.Utils.showNotification('Please select a reason for reporting', 'error');
            return;
        }
        
        // Show loading state
        window.Utils.setLoading(true, submitButton);
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // In a real app, this would submit to the backend
            const reportData = {
                id: window.Utils.generateId(),
                artworkId: new URLSearchParams(window.location.search).get('id'),
                reportedBy: AuthManager.currentUser?.id || 'anonymous',
                reason: reason,
                details: details,
                timestamp: new Date().toISOString(),
                status: 'open'
            };
            
            // Store report (in a real app, this would go to the backend)
            const reports = JSON.parse(localStorage.getItem('reports') || '[]');
            reports.push(reportData);
            localStorage.setItem('reports', JSON.stringify(reports));
            
            // Show success message
            window.Utils.showNotification('Report submitted successfully. Thank you for helping maintain our community standards.', 'success');
            
            // Close modal and reset form
            window.closeReportModal();
            form.reset();
            
        } catch (error) {
            console.error('Report submission error:', error);
            window.Utils.showNotification('Failed to submit report. Please try again.', 'error');
        } finally {
            window.Utils.setLoading(false, submitButton);
        }
    },

    // Validate registration data
    validateRegistrationData: (data) => {
        const errors = {};
        
        // Required fields
        if (!data.firstName) errors['first-name'] = 'First name is required';
        if (!data.lastName) errors['last-name'] = 'Last name is required';
        if (!data.username) errors.username = 'Username is required';
        if (!data.email) errors.email = 'Email is required';
        if (!data.password) errors.password = 'Password is required';
        if (!data.confirmPassword) errors['confirm-password'] = 'Please confirm your password';
        if (!data.userType) errors['user-type'] = 'Please select an account type';
        if (!data.termsAgreed) errors.terms = 'You must agree to the terms and conditions';
        
        // Email validation
        if (data.email && !window.Utils.isValidEmail(data.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        // Username validation
        if (data.username) {
            if (data.username.length < 3) {
                errors.username = 'Username must be at least 3 characters long';
            } else if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
                errors.username = 'Username can only contain letters, numbers, hyphens, and underscores';
            }
        }
        
        // Password validation
        if (data.password) {
            const passwordErrors = window.Utils.validatePassword(data.password);
            if (passwordErrors.length > 0) {
                errors.password = passwordErrors[0];
            }
        }
        
        // Password confirmation
        if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
            errors['confirm-password'] = 'Passwords do not match';
        }
        
        return errors;
    },

    // Update authentication UI
    updateAuthUI: () => {
        const authElements = document.querySelectorAll('.nav-auth');
        const userElements = document.querySelectorAll('.nav-user');
        const adminLinks = document.querySelectorAll('.admin-link');
        const artistOnlyElements = document.querySelectorAll('.artist-only');
        const loggedInActions = document.querySelectorAll('.logged-in-actions');
        
        if (AuthManager.currentUser) {
            // Hide auth buttons, show user menu
            authElements.forEach(el => el.style.display = 'none');
            userElements.forEach(el => el.style.display = 'block');
            loggedInActions.forEach(el => el.style.display = 'block');
            
            // Update username display
            document.querySelectorAll('.username').forEach(el => {
                el.textContent = AuthManager.currentUser.username;
            });
            
            document.querySelectorAll('.admin-username').forEach(el => {
                el.textContent = AuthManager.currentUser.username;
            });
            
            // Show admin links for admin users
            if (AuthManager.currentUser.userType === 'admin') {
                adminLinks.forEach(el => el.style.display = 'block');
            }
            
            // Show artist-only elements for artists
            if (AuthManager.currentUser.userType === 'artist') {
                artistOnlyElements.forEach(el => el.style.display = 'block');
            }
            
        } else {
            // Show auth buttons, hide user menu
            authElements.forEach(el => el.style.display = 'flex');
            userElements.forEach(el => el.style.display = 'none');
            adminLinks.forEach(el => el.style.display = 'none');
            artistOnlyElements.forEach(el => el.style.display = 'none');
            loggedInActions.forEach(el => el.style.display = 'none');
        }
    },

    // Refresh session timestamp
    refreshSession: () => {
        const sessionData = localStorage.getItem('userSession');
        if (sessionData && AuthManager.currentUser) {
            try {
                const session = JSON.parse(sessionData);
                session.timestamp = new Date().getTime();
                localStorage.setItem('userSession', JSON.stringify(session));
            } catch (error) {
                console.error('Error refreshing session:', error);
            }
        }
    },

    // Logout user
    logout: async () => {
        try {
            await fetch('php/auth.php?action=logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        AuthManager.currentUser = null;
        window.IndigenousArtAtlas.currentUser = null;
        
        // Update UI
        AuthManager.updateAuthUI();
        
        // Show notification
        window.Utils.showNotification('You have been logged out', 'info');
        
        // Redirect if on protected page
        const protectedPages = ['dashboard.html', 'submit-art.html', 'admin.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage)) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    },

    // Check if user is logged in
    isLoggedIn: () => {
        return AuthManager.currentUser !== null;
    },

    // Check if user is admin
    isAdmin: () => {
        return AuthManager.currentUser && AuthManager.currentUser.userType === 'admin';
    },

    // Check if user is artist
    isArtist: () => {
        return AuthManager.currentUser && AuthManager.currentUser.userType === 'artist';
    },

    // Get current user
    getCurrentUser: () => {
        return AuthManager.currentUser;
    },

    // Update user profile
    updateUserProfile: async (updates) => {
        if (!AuthManager.currentUser) return false;
        
        try {
            // Update user in storage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === AuthManager.currentUser.id);
            
            if (userIndex !== -1) {
                users[userIndex] = { ...users[userIndex], ...updates };
                localStorage.setItem('users', JSON.stringify(users));
                window.IndigenousArtAtlas.users = users;
                
                // Update current user
                AuthManager.currentUser = users[userIndex];
                window.IndigenousArtAtlas.currentUser = users[userIndex];
                
                // Update session
                const sessionData = JSON.parse(localStorage.getItem('userSession'));
                sessionData.user = users[userIndex];
                localStorage.setItem('userSession', JSON.stringify(sessionData));
                
                return true;
            }
            
        } catch (error) {
            console.error('Error updating user profile:', error);
        }
        
        return false;
    }
};

// Global logout function
window.logout = () => {
    AuthManager.logout();
};

// Global functions for modals
window.showAdminLogin = () => {
    const modal = document.getElementById('admin-login-modal');
    if (modal) {
        modal.classList.add('show');
    }
};

window.closeAdminLogin = () => {
    const modal = document.getElementById('admin-login-modal');
    if (modal) {
        modal.classList.remove('show');
        // Reset form
        const form = document.getElementById('admin-login-form');
        if (form) form.reset();
    }
};

// Protected page check
const checkPageAccess = () => {
    const currentPage = window.location.pathname.split('/').pop();
    const protectedPages = ['dashboard.html', 'submit-art.html'];
    const adminPages = ['admin.html'];
    
    if (adminPages.includes(currentPage)) {
        if (!AuthManager.isAdmin()) {
            window.Utils.showNotification('Access denied. Admin privileges required.', 'error');
            window.location.href = 'login.html';
            return;
        }
    } else if (protectedPages.includes(currentPage)) {
        if (!AuthManager.isLoggedIn()) {
            window.Utils.showNotification('Please log in to access this page.', 'warning');
            window.location.href = 'login.html';
            return;
        }
    }
};

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    AuthManager.initialize();
    checkPageAccess();
    
    // Set up session refresh interval
    setInterval(() => {
        if (AuthManager.isLoggedIn()) {
            AuthManager.refreshSession();
        }
    }, 5 * 60 * 1000); // Refresh every 5 minutes
});

// Export AuthManager
window.AuthManager = AuthManager;
