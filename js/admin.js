/**
 * Indigenous Art Atlas - Admin Panel Functionality
 * Handles all administrative features including content moderation, user management, and analytics
 */

window.AdminManager = {
    currentSection: 'dashboard',
    submissionsData: [],
    usersData: [],
    reportsData: [],
    analyticsData: {},

    // Initialize admin panel
    initialize: () => {
        // Check admin access
        if (!window.AuthManager.isAdmin()) {
            window.location.href = 'login.html';
            return;
        }

        AdminManager.loadAdminData();
        AdminManager.initializeSidebar();
        AdminManager.initializeForms();
        AdminManager.showSection('dashboard');
        AdminManager.updateLastUpdated();
    },

    // Load admin data
    loadAdminData: () => {
        // Load artworks (including pending submissions)
        AdminManager.submissionsData = window.IndigenousArtAtlas.artworks || [];
        
        // Load users
        AdminManager.usersData = window.IndigenousArtAtlas.users || [];
        
        // Load reports
        AdminManager.reportsData = JSON.parse(localStorage.getItem('reports') || '[]');
        
        // Calculate analytics
        AdminManager.calculateAnalytics();
    },

    // Initialize sidebar navigation
    initializeSidebar: () => {
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
                if (section) {
                    AdminManager.showSection(section);
                }
            });
        });
    },

    // Initialize forms
    initializeForms: () => {
        // User management form
        const userManagementForm = document.getElementById('user-management-form');
        if (userManagementForm) {
            userManagementForm.addEventListener('submit', AdminManager.handleUserUpdate);
        }

        // Category form
        const categoryForm = document.getElementById('category-form');
        if (categoryForm) {
            categoryForm.addEventListener('submit', AdminManager.handleCategoryUpdate);
        }

        // Submission status filter
        const submissionFilter = document.getElementById('submission-status-filter');
        if (submissionFilter) {
            submissionFilter.addEventListener('change', AdminManager.loadSubmissions);
        }

        // User search and filter
        const userSearch = document.getElementById('user-search');
        if (userSearch) {
            userSearch.addEventListener('input', window.Utils.debounce(AdminManager.loadUsers, 300));
        }

        const userTypeFilter = document.getElementById('user-type-filter');
        if (userTypeFilter) {
            userTypeFilter.addEventListener('change', AdminManager.loadUsers);
        }

        // Report status filter
        const reportFilter = document.getElementById('report-status-filter');
        if (reportFilter) {
            reportFilter.addEventListener('change', AdminManager.loadReports);
        }
    },

    // Show admin section
    showSection: (sectionName) => {
        // Update sidebar active state
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`.sidebar-item[onclick*="${sectionName}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(`admin-${sectionName}`);
        if (targetSection) {
            targetSection.classList.add('active');
            AdminManager.currentSection = sectionName;
            
            // Load section-specific data
            AdminManager.loadSectionData(sectionName);
        }
    },

    // Load section-specific data
    loadSectionData: (sectionName) => {
        switch (sectionName) {
            case 'dashboard':
                AdminManager.loadDashboard();
                break;
            case 'submissions':
                AdminManager.loadSubmissions();
                break;
            case 'users':
                AdminManager.loadUsers();
                break;
            case 'categories':
                AdminManager.loadCategories();
                break;
            case 'reports':
                AdminManager.loadReports();
                break;
            case 'analytics':
                AdminManager.loadAnalytics();
                break;
        }
    },

    // Load dashboard
    loadDashboard: () => {
        // Update statistics
        const pendingSubmissions = AdminManager.submissionsData.filter(s => s.status === 'pending').length;
        const totalArtworks = AdminManager.submissionsData.filter(s => s.status === 'approved').length;
        const totalUsers = AdminManager.usersData.length;
        const openReports = AdminManager.reportsData.filter(r => r.status === 'open').length;

        document.getElementById('pending-submissions-count').textContent = pendingSubmissions;
        document.getElementById('total-artworks-count').textContent = totalArtworks;
        document.getElementById('total-users-count').textContent = totalUsers;
        document.getElementById('open-reports-count').textContent = openReports;

        // Update badges
        document.getElementById('pending-badge').textContent = pendingSubmissions;
        document.getElementById('reports-badge').textContent = openReports;

        // Load recent activity
        AdminManager.loadRecentActivity();
    },

    // Load recent activity
    loadRecentActivity: () => {
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) return;

        const activities = [];

        // Add recent submissions
        AdminManager.submissionsData
            .sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate))
            .slice(0, 5)
            .forEach(submission => {
                activities.push({
                    type: 'submission',
                    title: `New submission: ${submission.title}`,
                    time: submission.submittedDate,
                    icon: 'fas fa-plus-circle',
                    color: 'info'
                });
            });

        // Add recent reports
        AdminManager.reportsData
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 3)
            .forEach(report => {
                activities.push({
                    type: 'report',
                    title: `Content reported: ${report.reason}`,
                    time: report.timestamp,
                    icon: 'fas fa-flag',
                    color: 'warning'
                });
            });

        // Sort activities by time
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));

        activityContainer.innerHTML = activities.slice(0, 8).map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.color}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.title}</p>
                    <small>${window.Utils.timeAgo(activity.time)}</small>
                </div>
            </div>
        `).join('');
    },

    // Load submissions
    loadSubmissions: () => {
        const container = document.getElementById('admin-submissions-list');
        const emptyState = document.getElementById('submissions-empty');
        const filter = document.getElementById('submission-status-filter')?.value || 'pending';
        
        if (!container) return;

        let submissions = AdminManager.submissionsData;

        // Filter submissions
        if (filter !== 'all') {
            submissions = submissions.filter(s => s.status === filter);
        }

        if (submissions.length === 0) {
            container.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        container.style.display = 'block';

        container.innerHTML = submissions.map(submission => `
            <div class="submission-item">
                <div class="submission-info">
                    <h4>${submission.title}</h4>
                    <p>${window.Utils.truncateText(submission.description, 100)}</p>
                    <div class="submission-meta">
                        <span class="meta-tag">${submission.artType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <span class="meta-tag">${submission.period.charAt(0).toUpperCase() + submission.period.slice(1)}</span>
                        <span class="meta-tag status-${submission.status}">${submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}</span>
                    </div>
                    <div class="submission-details">
                        <small>Submitted by: ${submission.submittedBy} | ${window.Utils.timeAgo(submission.submittedDate)}</small>
                    </div>
                </div>
                <div class="submission-actions">
                    <button class="btn btn-outline btn-small" onclick="AdminManager.reviewSubmission('${submission.id}')">
                        <i class="fas fa-eye"></i> Review
                    </button>
                    ${submission.status === 'pending' ? `
                        <button class="btn btn-success btn-small" onclick="AdminManager.approveSubmission('${submission.id}')">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn btn-danger btn-small" onclick="AdminManager.rejectSubmission('${submission.id}')">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    ` : ''}
                    <button class="btn btn-danger btn-small" onclick="AdminManager.deleteSubmission('${submission.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Load users
    loadUsers: () => {
        const tableBody = document.getElementById('users-table-body');
        const searchTerm = document.getElementById('user-search')?.value.toLowerCase() || '';
        const typeFilter = document.getElementById('user-type-filter')?.value || 'all';
        
        if (!tableBody) return;

        let users = AdminManager.usersData;

        // Filter users
        if (searchTerm) {
            users = users.filter(user => 
                user.username.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm)
            );
        }

        if (typeFilter !== 'all') {
            users = users.filter(user => user.userType === typeFilter);
        }

        tableBody.innerHTML = users.map(user => {
            const userSubmissions = AdminManager.submissionsData.filter(s => s.submittedBy === user.id).length;
            
            return `
                <tr>
                    <td>
                        <div class="user-info">
                            <strong>${user.firstName} ${user.lastName}</strong>
                            <br>
                            <small>@${user.username}</small>
                        </div>
                    </td>
                    <td>${user.email}</td>
                    <td>
                        <span class="user-type-badge ${user.userType}">${user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}</span>
                    </td>
                    <td>${window.Utils.formatDate(user.joinDate)}</td>
                    <td>${userSubmissions}</td>
                    <td>
                        <span class="status-badge ${user.status}">${user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span>
                    </td>
                    <td>
                        <button class="btn btn-outline btn-small" onclick="AdminManager.editUser('${user.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    // Load categories
    loadCategories: () => {
        const artTypesContainer = document.getElementById('art-types-list');
        const artPeriodsContainer = document.getElementById('art-periods-list');
        
        if (artTypesContainer) {
            artTypesContainer.innerHTML = window.IndigenousArtAtlas.categories.artTypes.map(type => `
                <div class="category-item">
                    <div class="category-info">
                        <h5>${type.name}</h5>
                        <p>${type.description}</p>
                    </div>
                    <div class="category-actions">
                        <button class="btn btn-outline btn-small" onclick="AdminManager.editCategory('art-type', '${type.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-small" onclick="AdminManager.deleteCategory('art-type', '${type.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        if (artPeriodsContainer) {
            artPeriodsContainer.innerHTML = window.IndigenousArtAtlas.categories.artPeriods.map(period => `
                <div class="category-item">
                    <div class="category-info">
                        <h5>${period.name}</h5>
                        <p>${period.description}</p>
                    </div>
                    <div class="category-actions">
                        <button class="btn btn-outline btn-small" onclick="AdminManager.editCategory('art-period', '${period.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-small" onclick="AdminManager.deleteCategory('art-period', '${period.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }
    },

    // Load reports
    loadReports: () => {
        const container = document.getElementById('admin-reports-list');
        const filter = document.getElementById('report-status-filter')?.value || 'open';
        
        if (!container) return;

        let reports = AdminManager.reportsData;

        // Filter reports
        if (filter !== 'all') {
            reports = reports.filter(r => r.status === filter);
        }

        if (reports.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No reports found.</p></div>';
            return;
        }

        container.innerHTML = reports.map(report => {
            const artwork = AdminManager.submissionsData.find(s => s.id === report.artworkId);
            const reporter = AdminManager.usersData.find(u => u.id === report.reportedBy);
            
            return `
                <div class="report-item">
                    <div class="report-info">
                        <h4>Report: ${report.reason.charAt(0).toUpperCase() + report.reason.slice(1)}</h4>
                        <p><strong>Artwork:</strong> ${artwork ? artwork.title : 'Unknown'}</p>
                        <p><strong>Reported by:</strong> ${reporter ? reporter.username : 'Anonymous'}</p>
                        ${report.details ? `<p><strong>Details:</strong> ${report.details}</p>` : ''}
                        <div class="report-meta">
                            <span class="meta-tag status-${report.status}">${report.status.charAt(0).toUpperCase() + report.status.slice(1)}</span>
                            <small>Reported: ${window.Utils.timeAgo(report.timestamp)}</small>
                        </div>
                    </div>
                    <div class="report-actions">
                        ${artwork ? `
                            <button class="btn btn-outline btn-small" onclick="window.open('art-detail.html?id=${artwork.id}', '_blank')">
                                <i class="fas fa-external-link-alt"></i> View Artwork
                            </button>
                        ` : ''}
                        ${report.status === 'open' ? `
                            <button class="btn btn-success btn-small" onclick="AdminManager.resolveReport('${report.id}')">
                                <i class="fas fa-check"></i> Resolve
                            </button>
                        ` : ''}
                        <button class="btn btn-danger btn-small" onclick="AdminManager.deleteReport('${report.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Load analytics
    loadAnalytics: () => {
        // Set default date range (last 30 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);
        
        const startDateInput = document.getElementById('analytics-start-date');
        const endDateInput = document.getElementById('analytics-end-date');
        
        if (startDateInput) startDateInput.value = startDate.toISOString().split('T')[0];
        if (endDateInput) endDateInput.value = endDate.toISOString().split('T')[0];
        
        // Display analytics placeholders
        const analyticsCards = document.querySelectorAll('.analytics-card .chart-placeholder');
        analyticsCards.forEach(card => {
            card.innerHTML = `
                <i class="${card.querySelector('i').className}"></i>
                <p>Analytics data would be displayed here</p>
                <small>Date range: ${window.Utils.formatDate(startDate)} - ${window.Utils.formatDate(endDate)}</small>
            `;
        });
    },

    // Calculate analytics
    calculateAnalytics: () => {
        AdminManager.analyticsData = {
            totalSubmissions: AdminManager.submissionsData.length,
            approvedSubmissions: AdminManager.submissionsData.filter(s => s.status === 'approved').length,
            pendingSubmissions: AdminManager.submissionsData.filter(s => s.status === 'pending').length,
            rejectedSubmissions: AdminManager.submissionsData.filter(s => s.status === 'rejected').length,
            totalUsers: AdminManager.usersData.length,
            activeUsers: AdminManager.usersData.filter(u => u.status === 'active').length,
            artists: AdminManager.usersData.filter(u => u.userType === 'artist').length,
            openReports: AdminManager.reportsData.filter(r => r.status === 'open').length
        };
    },

    // Review submission
    reviewSubmission: (submissionId) => {
        const submission = AdminManager.submissionsData.find(s => s.id === submissionId);
        if (!submission) return;

        const modal = document.getElementById('submission-review-modal');
        const content = document.getElementById('submission-review-content');
        
        if (!modal || !content) return;

        content.innerHTML = `
            <div class="review-details">
                <h3>${submission.title}</h3>
                <div class="review-meta">
                    <span class="meta-tag">${submission.artType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <span class="meta-tag">${submission.period.charAt(0).toUpperCase() + submission.period.slice(1)}</span>
                    <span class="meta-tag">${submission.region.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <span class="meta-tag status-${submission.status}">${submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}</span>
                </div>
                
                <div class="review-section">
                    <h4>Description</h4>
                    <p>${submission.description}</p>
                </div>
                
                <div class="review-section">
                    <h4>Artist Information</h4>
                    <p><strong>Artist:</strong> ${submission.artist || 'Unknown'}</p>
                </div>
                
                <div class="review-section">
                    <h4>Location</h4>
                    <p><strong>Description:</strong> ${submission.location.description}</p>
                    <p><strong>Coordinates:</strong> ${submission.location.coordinates ? submission.location.coordinates.join(', ') : 'Not provided'}</p>
                    <p><strong>Sensitive Location:</strong> ${submission.location.sensitive ? 'Yes' : 'No'}</p>
                </div>
                
                <div class="review-section">
                    <h4>Condition</h4>
                    <p>${submission.condition || 'Not specified'}</p>
                </div>
                
                <div class="review-section">
                    <h4>Submission Details</h4>
                    <p><strong>Submitted by:</strong> ${submission.submittedBy}</p>
                    <p><strong>Submitted on:</strong> ${window.Utils.formatDate(submission.submittedDate)}</p>
                    ${submission.approvedDate ? `<p><strong>Approved on:</strong> ${window.Utils.formatDate(submission.approvedDate)}</p>` : ''}
                </div>
                
                <div class="review-section">
                    <h4>Images</h4>
                    <div class="review-images">
                        ${submission.images && submission.images.length > 0 ? 
                            submission.images.map(image => `
                                <div class="review-image-placeholder">
                                    <i class="fas fa-image"></i>
                                    <p>${image}</p>
                                </div>
                            `).join('') : 
                            '<p>No images provided</p>'
                        }
                    </div>
                </div>
            </div>
        `;

        // Store current submission ID for actions
        modal.dataset.submissionId = submissionId;
        modal.classList.add('show');
    },

    // Approve submission
    approveSubmission: (submissionId) => {
        const submission = AdminManager.submissionsData.find(s => s.id === submissionId);
        if (!submission) return;

        submission.status = 'approved';
        submission.approvedDate = new Date().toISOString();
        
        window.DataManager.updateArtwork(submissionId, {
            status: 'approved',
            approvedDate: submission.approvedDate
        });

        window.Utils.showNotification('Submission approved successfully', 'success');
        AdminManager.loadSubmissions();
        AdminManager.loadDashboard();
        
        // Close modal if open
        const modal = document.getElementById('submission-review-modal');
        if (modal.classList.contains('show')) {
            modal.classList.remove('show');
        }
    },

    // Reject submission
    rejectSubmission: (submissionId) => {
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;

        const submission = AdminManager.submissionsData.find(s => s.id === submissionId);
        if (!submission) return;

        submission.status = 'rejected';
        submission.rejectionReason = reason;
        submission.rejectedDate = new Date().toISOString();
        
        window.DataManager.updateArtwork(submissionId, {
            status: 'rejected',
            rejectionReason: reason,
            rejectedDate: submission.rejectedDate
        });

        window.Utils.showNotification('Submission rejected', 'warning');
        AdminManager.loadSubmissions();
        AdminManager.loadDashboard();
        
        // Close modal if open
        const modal = document.getElementById('submission-review-modal');
        if (modal.classList.contains('show')) {
            modal.classList.remove('show');
        }
    },

    // Delete submission
    deleteSubmission: (submissionId) => {
        if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
            return;
        }

        window.DataManager.deleteArtwork(submissionId);
        AdminManager.submissionsData = AdminManager.submissionsData.filter(s => s.id !== submissionId);

        window.Utils.showNotification('Submission deleted', 'info');
        AdminManager.loadSubmissions();
        AdminManager.loadDashboard();
    },

    // Edit user
    editUser: (userId) => {
        const user = AdminManager.usersData.find(u => u.id === userId);
        if (!user) return;

        const modal = document.getElementById('user-management-modal');
        if (!modal) return;

        // Populate form
        document.getElementById('user-role').value = user.userType;
        document.getElementById('user-status').value = user.status;

        // Store user ID for update
        modal.dataset.userId = userId;
        modal.classList.add('show');
    },

    // Handle user update
    handleUserUpdate: async (e) => {
        e.preventDefault();
        const form = e.target;
        const modal = document.getElementById('user-management-modal');
        const userId = modal.dataset.userId;
        
        if (!userId) return;

        const updates = {
            userType: form['user-role'].value,
            status: form['user-status'].value
        };

        // Update user in data
        const userIndex = AdminManager.usersData.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            AdminManager.usersData[userIndex] = { ...AdminManager.usersData[userIndex], ...updates };
            
            // Save to storage
            localStorage.setItem('users', JSON.stringify(AdminManager.usersData));
            window.IndigenousArtAtlas.users = AdminManager.usersData;

            window.Utils.showNotification('User updated successfully', 'success');
            AdminManager.loadUsers();
            AdminManager.closeUserModal();
        }
    },

    // Delete user
    deleteUser: () => {
        const modal = document.getElementById('user-management-modal');
        const userId = modal.dataset.userId;
        
        if (!userId) return;

        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        // Remove user from data
        AdminManager.usersData = AdminManager.usersData.filter(u => u.id !== userId);
        
        // Save to storage
        localStorage.setItem('users', JSON.stringify(AdminManager.usersData));
        window.IndigenousArtAtlas.users = AdminManager.usersData;

        window.Utils.showNotification('User deleted', 'info');
        AdminManager.loadUsers();
        AdminManager.closeUserModal();
    },

    // Resolve report
    resolveReport: (reportId) => {
        const report = AdminManager.reportsData.find(r => r.id === reportId);
        if (!report) return;

        report.status = 'resolved';
        report.resolvedDate = new Date().toISOString();
        
        // Save to storage
        localStorage.setItem('reports', JSON.stringify(AdminManager.reportsData));

        window.Utils.showNotification('Report resolved', 'success');
        AdminManager.loadReports();
        AdminManager.loadDashboard();
    },

    // Delete report
    deleteReport: (reportId) => {
        if (!confirm('Are you sure you want to delete this report?')) {
            return;
        }

        AdminManager.reportsData = AdminManager.reportsData.filter(r => r.id !== reportId);
        
        // Save to storage
        localStorage.setItem('reports', JSON.stringify(AdminManager.reportsData));

        window.Utils.showNotification('Report deleted', 'info');
        AdminManager.loadReports();
        AdminManager.loadDashboard();
    },

    // Update last updated timestamp
    updateLastUpdated: () => {
        const lastUpdatedElement = document.getElementById('last-updated');
        if (lastUpdatedElement) {
            lastUpdatedElement.textContent = new Date().toLocaleString();
        }
    },

    // Close submission modal
    closeSubmissionModal: () => {
        const modal = document.getElementById('submission-review-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    },

    // Close user modal
    closeUserModal: () => {
        const modal = document.getElementById('user-management-modal');
        if (modal) {
            modal.classList.remove('show');
            modal.removeAttribute('data-user-id');
        }
    },

    // Add category
    addCategory: () => {
        const modal = document.getElementById('category-modal');
        const form = document.getElementById('category-form');
        
        if (modal && form) {
            form.reset();
            document.getElementById('category-modal-title').textContent = 'Add Category';
            modal.removeAttribute('data-category-id');
            modal.classList.add('show');
        }
    },

    // Edit category
    editCategory: (type, categoryId) => {
        const categories = type === 'art-type' ? 
            window.IndigenousArtAtlas.categories.artTypes : 
            window.IndigenousArtAtlas.categories.artPeriods;
        
        const category = categories.find(c => c.id === categoryId);
        if (!category) return;

        const modal = document.getElementById('category-modal');
        const form = document.getElementById('category-form');
        
        if (modal && form) {
            document.getElementById('category-modal-title').textContent = 'Edit Category';
            document.getElementById('category-type').value = type;
            document.getElementById('category-name').value = category.name;
            document.getElementById('category-description').value = category.description;
            
            modal.dataset.categoryId = categoryId;
            modal.dataset.categoryType = type;
            modal.classList.add('show');
        }
    },

    // Handle category update
    handleCategoryUpdate: (e) => {
        e.preventDefault();
        // Category management would be implemented here
        window.Utils.showNotification('Category management not fully implemented in this demo', 'info');
        AdminManager.closeCategoryModal();
    },

    // Delete category
    deleteCategory: (type, categoryId) => {
        if (!confirm('Are you sure you want to delete this category?')) {
            return;
        }
        
        window.Utils.showNotification('Category management not fully implemented in this demo', 'info');
    },

    // Close category modal
    closeCategoryModal: () => {
        const modal = document.getElementById('category-modal');
        if (modal) {
            modal.classList.remove('show');
            modal.removeAttribute('data-category-id');
            modal.removeAttribute('data-category-type');
        }
    },

    // Update analytics
    updateAnalytics: () => {
        AdminManager.loadAnalytics();
        window.Utils.showNotification('Analytics updated', 'info');
    }
};

// Global functions for admin panel
window.showAdminSection = (sectionName) => {
    AdminManager.showSection(sectionName);
};

window.AdminManager = AdminManager;

window.approveSubmission = (id) => AdminManager.approveSubmission(id);
window.rejectSubmission = (id) => AdminManager.rejectSubmission(id);
window.editSubmission = () => window.Utils.showNotification('Edit functionality not implemented in this demo', 'info');
window.closeSubmissionModal = () => AdminManager.closeSubmissionModal();

window.closeUserModal = () => AdminManager.closeUserModal();
window.deleteUser = () => AdminManager.deleteUser();

window.addCategory = () => AdminManager.addCategory();
window.closeCategoryModal = () => AdminManager.closeCategoryModal();

window.updateAnalytics = () => AdminManager.updateAnalytics();

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin.html')) {
        AdminManager.initialize();
    }
});
