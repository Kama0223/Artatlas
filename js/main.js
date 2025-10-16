/**
 * Indigenous Art Atlas - Main Application Logic
 * Handles core functionality, utilities, form validation, and page interactions
 */

// Global application state
window.IndigenousArtAtlas = {
    currentUser: null,
    artworks: [],
    users: [],
    categories: {
        artTypes: [
            { id: 'cave-art', name: 'Cave Art', description: 'Ancient cave paintings and engravings' },
            { id: 'rock-art', name: 'Rock Art', description: 'Petroglyphs and pictographs on rock surfaces' },
            { id: 'mural', name: 'Mural', description: 'Wall paintings and large-scale artworks' },
            { id: 'sculpture', name: 'Sculpture', description: 'Three-dimensional carved or molded artworks' },
            { id: 'textile', name: 'Textile', description: 'Woven fabrics, clothing, and fiber arts' },
            { id: 'pottery', name: 'Pottery', description: 'Ceramic vessels and decorative objects' },
            { id: 'carving', name: 'Carving', description: 'Carved wood, bone, and stone objects' },
            { id: 'painting', name: 'Painting', description: 'Traditional and contemporary paintings' },
            { id: 'installation', name: 'Installation', description: 'Large-scale contemporary art installations' },
            { id: 'other', name: 'Other', description: 'Other forms of indigenous art' }
        ],
        artPeriods: [
            { id: 'ancient', name: 'Ancient', description: 'Pre-1500 CE' },
            { id: 'historical', name: 'Historical', description: '1500-1900 CE' },
            { id: 'modern', name: 'Modern', description: '1900-1980 CE' },
            { id: 'contemporary', name: 'Contemporary', description: '1980-Present' }
        ],
        regions: [
            { id: 'australia', name: 'Australia' },
            { id: 'north-america', name: 'North America' },
            { id: 'south-america', name: 'South America' },
            { id: 'africa', name: 'Africa' },
            { id: 'asia', name: 'Asia' },
            { id: 'europe', name: 'Europe' }
        ]
    },
    currentPage: 'home',
    isLoading: false
};

// Utility Functions
const Utils = {
    // Generate unique IDs
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Format dates
    formatDate: (date) => {
        if (!date) return 'Unknown';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Format time ago
    timeAgo: (date) => {
        if (!date) return 'Unknown';
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 30) return `${diffDays} days ago`;
        return Utils.formatDate(date);
    },

    // Truncate text
    truncateText: (text, maxLength = 100) => {
        if (!text || text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    },

    // Validate email
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate password strength
    validatePassword: (password) => {
        const errors = [];
        if (password.length < 8) errors.push('Password must be at least 8 characters long');
        if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
        if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
        if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
        return errors;
    },

    // Show notification
    showNotification: (message, type = 'info', duration = 5000) => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-hide notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    // Show loading state
    setLoading: (isLoading, element = null) => {
        window.IndigenousArtAtlas.isLoading = isLoading;
        
        if (element) {
            if (isLoading) {
                element.classList.add('loading');
                const btnText = element.querySelector('.btn-text');
                const btnLoading = element.querySelector('.btn-loading');
                if (btnText) btnText.style.display = 'none';
                if (btnLoading) btnLoading.style.display = 'inline-flex';
            } else {
                element.classList.remove('loading');
                const btnText = element.querySelector('.btn-text');
                const btnLoading = element.querySelector('.btn-loading');
                if (btnText) btnText.style.display = 'inline';
                if (btnLoading) btnLoading.style.display = 'none';
            }
        }
        
        // Update global loading indicators
        const loadingIndicators = document.querySelectorAll('#loading');
        loadingIndicators.forEach(indicator => {
            indicator.style.display = isLoading ? 'flex' : 'none';
        });
    },

    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Data Management
const DataManager = {
    // Initialize sample data for demonstration
    initializeSampleData: () => {
        // Only initialize if no data exists
        if (!localStorage.getItem('artworks')) {
            const sampleArtworks = [
                {
                    id: 'artwork-1',
                    title: 'Ancient Cave Paintings',
                    description: 'Prehistoric cave paintings depicting hunting scenes and daily life, estimated to be over 10,000 years old.',
                    artType: 'cave-art',
                    period: 'ancient',
                    region: 'australia',
                    artist: 'Unknown',
                    condition: 'Well preserved despite age, some fading visible',
                    location: {
                        description: 'Remote cave system in central Australia',
                        coordinates: [-25.2744, 133.7751],
                        sensitive: true
                    },
                    images: ['placeholder-cave-art.jpg'],
                    submittedBy: 'user-1',
                    submittedDate: '2024-12-15',
                    status: 'approved',
                    approvedDate: '2024-12-16'
                },
                {
                    id: 'artwork-2',
                    title: 'Contemporary Textile Art',
                    description: 'Modern interpretation of traditional weaving patterns, incorporating contemporary materials and techniques.',
                    artType: 'textile',
                    period: 'contemporary',
                    region: 'north-america',
                    artist: 'Maria Strongeagle',
                    condition: 'Excellent condition, recently completed',
                    location: {
                        description: 'Cultural Center Gallery, Santa Fe',
                        coordinates: [35.6870, -105.9378],
                        sensitive: false
                    },
                    images: ['placeholder-textile.jpg'],
                    submittedBy: 'user-2',
                    submittedDate: '2024-12-10',
                    status: 'approved',
                    approvedDate: '2024-12-11'
                },
                {
                    id: 'artwork-3',
                    title: 'Traditional Pottery Collection',
                    description: 'Collection of traditional ceramic vessels showcasing regional pottery techniques passed down through generations.',
                    artType: 'pottery',
                    period: 'historical',
                    region: 'south-america',
                    artist: 'Various artisans',
                    condition: 'Good condition with minor restoration work',
                    location: {
                        description: 'Museum of Indigenous Arts, Lima',
                        coordinates: [-12.0464, -77.0428],
                        sensitive: false
                    },
                    images: ['placeholder-pottery.jpg'],
                    submittedBy: 'user-3',
                    submittedDate: '2024-12-08',
                    status: 'approved',
                    approvedDate: '2024-12-09'
                }
            ];

            localStorage.setItem('artworks', JSON.stringify(sampleArtworks));
        }

        // Initialize users
        if (!localStorage.getItem('users')) {
            const sampleUsers = [
                {
                    id: 'user-1',
                    username: 'culturalexplorer',
                    email: 'explorer@example.com',
                    firstName: 'Sarah',
                    lastName: 'Johnson',
                    userType: 'general',
                    joinDate: '2024-10-15',
                    status: 'active'
                },
                {
                    id: 'user-2',
                    username: 'mariastrongeagle',
                    email: 'maria@example.com',
                    firstName: 'Maria',
                    lastName: 'Strongeagle',
                    userType: 'artist',
                    joinDate: '2024-09-22',
                    status: 'active',
                    artistBio: 'Traditional and contemporary indigenous artist specializing in textile arts.'
                },
                {
                    id: 'user-3',
                    username: 'museumcurator',
                    email: 'curator@example.com',
                    firstName: 'David',
                    lastName: 'Martinez',
                    userType: 'general',
                    joinDate: '2024-11-01',
                    status: 'active'
                }
            ];

            localStorage.setItem('users', JSON.stringify(sampleUsers));
        }

        // Load data into memory
        window.IndigenousArtAtlas.artworks = JSON.parse(localStorage.getItem('artworks') || '[]');
        window.IndigenousArtAtlas.users = JSON.parse(localStorage.getItem('users') || '[]');
    },

    // Save data to localStorage
    saveArtworks: () => {
        localStorage.setItem('artworks', JSON.stringify(window.IndigenousArtAtlas.artworks));
    },

    saveUsers: () => {
        localStorage.setItem('users', JSON.stringify(window.IndigenousArtAtlas.users));
    },

    // Get artworks with filtering
    getArtworks: (filters = {}) => {
        let artworks = window.IndigenousArtAtlas.artworks.filter(artwork => artwork.status === 'approved');

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            artworks = artworks.filter(artwork => 
                artwork.title.toLowerCase().includes(searchTerm) ||
                artwork.description.toLowerCase().includes(searchTerm) ||
                artwork.artist.toLowerCase().includes(searchTerm)
            );
        }

        if (filters.artType) {
            artworks = artworks.filter(artwork => artwork.artType === filters.artType);
        }

        if (filters.period) {
            artworks = artworks.filter(artwork => artwork.period === filters.period);
        }

        if (filters.region) {
            artworks = artworks.filter(artwork => artwork.region === filters.region);
        }

        // Sort artworks
        if (filters.sort) {
            artworks.sort((a, b) => {
                switch (filters.sort) {
                    case 'date-desc':
                        return new Date(b.submittedDate) - new Date(a.submittedDate);
                    case 'date-asc':
                        return new Date(a.submittedDate) - new Date(b.submittedDate);
                    case 'title-asc':
                        return a.title.localeCompare(b.title);
                    case 'title-desc':
                        return b.title.localeCompare(a.title);
                    default:
                        return 0;
                }
            });
        }

        return artworks;
    },

    // Get artwork by ID
    getArtworkById: (id) => {
        return window.IndigenousArtAtlas.artworks.find(artwork => artwork.id === id);
    },

    // Get user submissions
    getUserSubmissions: (userId) => {
        return window.IndigenousArtAtlas.artworks.filter(artwork => artwork.submittedBy === userId);
    },

    // Add new artwork
    addArtwork: (artworkData) => {
        const artwork = {
            id: Utils.generateId(),
            ...artworkData,
            submittedDate: new Date().toISOString(),
            status: 'pending'
        };
        
        window.IndigenousArtAtlas.artworks.push(artwork);
        DataManager.saveArtworks();
        return artwork;
    },

    // Update artwork
    updateArtwork: (id, updates) => {
        const index = window.IndigenousArtAtlas.artworks.findIndex(artwork => artwork.id === id);
        if (index !== -1) {
            window.IndigenousArtAtlas.artworks[index] = {
                ...window.IndigenousArtAtlas.artworks[index],
                ...updates
            };
            DataManager.saveArtworks();
            return window.IndigenousArtAtlas.artworks[index];
        }
        return null;
    },

    // Delete artwork
    deleteArtwork: (id) => {
        const index = window.IndigenousArtAtlas.artworks.findIndex(artwork => artwork.id === id);
        if (index !== -1) {
            window.IndigenousArtAtlas.artworks.splice(index, 1);
            DataManager.saveArtworks();
            return true;
        }
        return false;
    }
};

// Form Validation
const FormValidator = {
    // Validate required fields
    validateRequired: (form, fieldNames) => {
        const errors = {};
        fieldNames.forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (!field || !field.value.trim()) {
                errors[fieldName] = 'This field is required';
            }
        });
        return errors;
    },

    // Validate email field
    validateEmail: (email) => {
        if (!Utils.isValidEmail(email)) {
            return 'Please enter a valid email address';
        }
        return null;
    },

    // Validate password
    validatePassword: (password) => {
        const errors = Utils.validatePassword(password);
        return errors.length > 0 ? errors[0] : null;
    },

    // Validate password confirmation
    validatePasswordConfirmation: (password, confirmPassword) => {
        if (password !== confirmPassword) {
            return 'Passwords do not match';
        }
        return null;
    },

    // Show field error
    showFieldError: (fieldName, message) => {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    },

    // Clear field error
    clearFieldError: (fieldName) => {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.classList.remove('show');
            errorElement.textContent = '';
        }
    },

    // Clear all form errors
    clearFormErrors: (form) => {
        const errorElements = form.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.classList.remove('show');
            element.textContent = '';
        });
    }
};

// Page-specific functionality
const PageManager = {
    // Initialize page-specific functionality
    initializePage: () => {
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
        window.IndigenousArtAtlas.currentPage = currentPage;

        switch (currentPage) {
            case 'index':
                PageManager.initializeHomePage();
                break;
            case 'browse':
                PageManager.initializeBrowsePage();
                break;
            case 'art-detail':
                PageManager.initializeArtDetailPage();
                break;
            case 'submit-art':
                PageManager.initializeSubmitArtPage();
                break;
            case 'dashboard':
                PageManager.initializeDashboardPage();
                break;
            case 'contact':
                PageManager.initializeContactPage();
                break;
        }
    },

    // Initialize home page
    initializeHomePage: () => {
        // Update statistics
        const artworks = DataManager.getArtworks();
        const users = window.IndigenousArtAtlas.users;
        const locations = new Set(artworks.map(artwork => artwork.region)).size;

        document.getElementById('total-artworks').textContent = artworks.length;
        document.getElementById('total-artists').textContent = users.filter(user => user.userType === 'artist').length;
        document.getElementById('total-locations').textContent = locations;

        // Animate counters
        PageManager.animateCounters();

        // Load featured artworks
        PageManager.loadFeaturedArtworks();
    },

    // Initialize browse page
    initializeBrowsePage: () => {
        // Initialize filters
        PageManager.initializeFilters();
        
        // Load initial results
        PageManager.loadBrowseResults();

        // Initialize view toggle
        PageManager.initializeViewToggle();
    },

    // Initialize art detail page
    initializeArtDetailPage: () => {
        const urlParams = new URLSearchParams(window.location.search);
        const artworkId = urlParams.get('id');
        
        if (artworkId) {
            const artwork = DataManager.getArtworkById(artworkId);
            if (artwork) {
                PageManager.displayArtworkDetails(artwork);
            } else {
                Utils.showNotification('Artwork not found', 'error');
                window.location.href = 'browse.html';
            }
        } else {
            window.location.href = 'browse.html';
        }
    },

    // Initialize submit art page
    initializeSubmitArtPage: () => {
        PageManager.initializeSubmitForm();
    },

    // Initialize dashboard page
    initializeDashboardPage: () => {
        if (!window.IndigenousArtAtlas.currentUser) {
            window.location.href = 'login.html';
            return;
        }

        PageManager.loadDashboardData();
        PageManager.initializeDashboardTabs();
    },

    // Initialize contact page
    initializeContactPage: () => {
        PageManager.initializeContactForm();
        PageManager.initializeFAQ();
    },

    // Animate counters
    animateCounters: () => {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            const target = parseInt(counter.textContent);
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, 50);
        });
    },

    // Load featured artworks
    loadFeaturedArtworks: () => {
        const container = document.getElementById('featured-artworks');
        if (!container) return;

        const artworks = DataManager.getArtworks({ sort: 'date-desc' }).slice(0, 3);
        
        container.innerHTML = artworks.map(artwork => `
            <div class="featured-card">
                <div class="card-image">
                    <i class="fas fa-image"></i>
                    <p>Image: ${artwork.title}</p>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${artwork.title}</h3>
                    <p class="card-description">${Utils.truncateText(artwork.description)}</p>
                    <div class="card-meta">
                        <span class="meta-tag">${artwork.artType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <span class="meta-tag">${artwork.period.charAt(0).toUpperCase() + artwork.period.slice(1)}</span>
                    </div>
                    <a href="art-detail.html?id=${artwork.id}" class="btn btn-outline">View Details</a>
                </div>
            </div>
        `).join('');
    },

    // Initialize filters for browse page
    initializeFilters: () => {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        const clearFiltersBtn = document.getElementById('clear-filters');

        if (searchInput && searchBtn) {
            const debouncedSearch = Utils.debounce(() => {
                PageManager.loadBrowseResults();
            }, 500);

            searchInput.addEventListener('input', debouncedSearch);
            searchBtn.addEventListener('click', () => PageManager.loadBrowseResults());
        }

        // Filter dropdowns
        ['art-type-filter', 'period-filter', 'region-filter', 'sort-filter'].forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', () => PageManager.loadBrowseResults());
            }
        });

        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                document.getElementById('search-input').value = '';
                document.getElementById('art-type-filter').value = '';
                document.getElementById('period-filter').value = '';
                document.getElementById('region-filter').value = '';
                document.getElementById('sort-filter').value = 'date-desc';
                PageManager.loadBrowseResults();
            });
        }
    },

    // Load browse results
    loadBrowseResults: () => {
        Utils.setLoading(true);

        setTimeout(() => {
            const filters = {
                search: document.getElementById('search-input')?.value || '',
                artType: document.getElementById('art-type-filter')?.value || '',
                period: document.getElementById('period-filter')?.value || '',
                region: document.getElementById('region-filter')?.value || '',
                sort: document.getElementById('sort-filter')?.value || 'date-desc'
            };

            const artworks = DataManager.getArtworks(filters);
            
            // Update results count
            const resultsCount = document.getElementById('results-count');
            if (resultsCount) {
                resultsCount.textContent = artworks.length;
            }

            // Display results
            PageManager.displayBrowseResults(artworks);
            
            Utils.setLoading(false);
        }, 500);
    },

    // Display browse results
    displayBrowseResults: (artworks) => {
        const container = document.getElementById('grid-container');
        const emptyState = document.getElementById('empty-state');
        
        if (!container) return;

        if (artworks.length === 0) {
            container.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        container.style.display = 'grid';

        container.innerHTML = artworks.map(artwork => `
            <div class="art-card">
                <div class="card-image">
                    <i class="fas fa-image"></i>
                    <p>Image: ${artwork.title}</p>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${artwork.title}</h3>
                    <p class="card-description">${Utils.truncateText(artwork.description)}</p>
                    <div class="card-meta">
                        <span class="meta-tag">${artwork.artType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <span class="meta-tag">${artwork.period.charAt(0).toUpperCase() + artwork.period.slice(1)}</span>
                        <span class="meta-tag">${artwork.region.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                    <div class="card-actions">
                        <a href="art-detail.html?id=${artwork.id}" class="btn btn-primary">View Details</a>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Initialize view toggle
    initializeViewToggle: () => {
        const gridViewBtn = document.getElementById('grid-view');
        const listViewBtn = document.getElementById('list-view');
        const mapViewBtn = document.getElementById('map-view');
        const gridContainer = document.getElementById('grid-container');
        const mapContainer = document.getElementById('map-container');

        if (gridViewBtn && listViewBtn && mapViewBtn) {
            gridViewBtn.addEventListener('click', () => {
                PageManager.setActiveView('grid');
            });

            listViewBtn.addEventListener('click', () => {
                PageManager.setActiveView('list');
            });

            mapViewBtn.addEventListener('click', () => {
                PageManager.setActiveView('map');
            });
        }
    },

    // Set active view
    setActiveView: (view) => {
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${view}-view`).classList.add('active');

        // Show/hide containers
        const gridContainer = document.getElementById('grid-container');
        const mapContainer = document.getElementById('map-container');

        if (view === 'map') {
            if (gridContainer) gridContainer.style.display = 'none';
            if (mapContainer) {
                mapContainer.style.display = 'block';
                // Initialize browse map if not already done
                if (window.MapManager && !window.MapManager.browseMap) {
                    window.MapManager.initializeBrowseMap();
                }
            }
        } else {
            if (mapContainer) mapContainer.style.display = 'none';
            if (gridContainer) {
                gridContainer.style.display = 'grid';
                if (view === 'list') {
                    gridContainer.className = 'results-list';
                } else {
                    gridContainer.className = 'results-grid';
                }
            }
        }
    },

    // Display artwork details
    displayArtworkDetails: (artwork) => {
        // Update page title and breadcrumb
        document.title = `${artwork.title} - Indigenous Art Atlas`;
        const breadcrumb = document.getElementById('art-title-breadcrumb');
        if (breadcrumb) breadcrumb.textContent = artwork.title;

        // Update content
        document.getElementById('art-title').textContent = artwork.title;
        document.getElementById('art-type').textContent = artwork.artType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        document.getElementById('art-period').textContent = artwork.period.charAt(0).toUpperCase() + artwork.period.slice(1);
        document.getElementById('art-description').textContent = artwork.description;
        document.getElementById('art-artist').textContent = artwork.artist || 'Unknown';
        document.getElementById('art-condition').textContent = artwork.condition || 'Not specified';
        document.getElementById('art-submitter').textContent = artwork.submittedBy || 'Anonymous';
        document.getElementById('art-date').textContent = Utils.formatDate(artwork.submittedDate);
        document.getElementById('location-description').textContent = artwork.location.description;

        // Handle location sensitivity
        const sensitivityElement = document.getElementById('location-sensitivity');
        if (artwork.location.sensitive && sensitivityElement) {
            sensitivityElement.style.display = 'block';
        }

        // Initialize image gallery
        PageManager.initializeImageGallery(artwork.images || []);

        // Initialize detail map
        if (window.MapManager) {
            window.MapManager.initializeDetailMap(artwork.location);
        }

        // Load related artworks
        PageManager.loadRelatedArtworks(artwork);
    },

    // Initialize image gallery
    initializeImageGallery: (images) => {
        const mainImage = document.getElementById('main-art-image');
        const thumbnailGallery = document.getElementById('thumbnail-gallery');
        const currentImageSpan = document.getElementById('current-image');
        const totalImagesSpan = document.getElementById('total-images');
        const prevBtn = document.getElementById('prev-image');
        const nextBtn = document.getElementById('next-image');

        let currentIndex = 0;

        // Set total images
        if (totalImagesSpan) totalImagesSpan.textContent = images.length || 1;

        // If no images, show placeholder
        if (!images || images.length === 0) {
            if (mainImage) {
                mainImage.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f5f5dc"/><text x="200" y="150" text-anchor="middle" fill="%23696969" font-family="Arial" font-size="16">No Image Available</text></svg>';
                mainImage.alt = 'No image available';
            }
            return;
        }

        // Update current image
        const updateImage = (index) => {
            currentIndex = index;
            if (mainImage) {
                mainImage.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f5f5dc"/><text x="200" y="140" text-anchor="middle" fill="%23696969" font-family="Arial" font-size="14">Image: ${images[index]}</text><text x="200" y="160" text-anchor="middle" fill="%23696969" font-family="Arial" font-size="12">(Placeholder)</text></svg>`;
                mainImage.alt = images[index];
            }
            if (currentImageSpan) currentImageSpan.textContent = index + 1;

            // Update thumbnail states
            document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
                thumb.classList.toggle('active', i === index);
            });
        };

        // Create thumbnails
        if (thumbnailGallery && images.length > 1) {
            thumbnailGallery.innerHTML = images.map((image, index) => `
                <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="updateImage(${index})">
                    <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><rect width='80' height='80' fill='%23f5f5dc'/><text x='40' y='40' text-anchor='middle' fill='%23696969' font-family='Arial' font-size='10'>${index + 1}</text></svg>" alt="Thumbnail ${index + 1}">
                </div>
            `).join('');
        }

        // Navigation buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
                updateImage(newIndex);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
                updateImage(newIndex);
            });
        }

        // Make updateImage globally accessible for thumbnail clicks
        window.updateImage = updateImage;

        // Initialize first image
        updateImage(0);
    },

    // Load related artworks
    loadRelatedArtworks: (artwork) => {
        const container = document.getElementById('related-artworks');
        if (!container) return;

        // Get related artworks (same type or region)
        const related = DataManager.getArtworks()
            .filter(a => a.id !== artwork.id && (a.artType === artwork.artType || a.region === artwork.region))
            .slice(0, 3);

        if (related.length === 0) {
            container.innerHTML = '<p>No related artworks found.</p>';
            return;
        }

        container.innerHTML = related.map(relatedArtwork => `
            <div class="art-card">
                <div class="card-image">
                    <i class="fas fa-image"></i>
                    <p>Image: ${relatedArtwork.title}</p>
                </div>
                <div class="card-content">
                    <h4 class="card-title">${relatedArtwork.title}</h4>
                    <p class="card-description">${Utils.truncateText(relatedArtwork.description, 60)}</p>
                    <a href="art-detail.html?id=${relatedArtwork.id}" class="btn btn-outline btn-small">View Details</a>
                </div>
            </div>
        `).join('');
    }
};

// Global functions for event handlers
window.togglePassword = (fieldId) => {
    const field = document.getElementById(fieldId);
    const toggle = field.nextElementSibling;
    
    if (field.type === 'password') {
        field.type = 'text';
        toggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        field.type = 'password';
        toggle.innerHTML = '<i class="fas fa-eye"></i>';
    }
};

window.clearAllFilters = () => {
    document.getElementById('search-input').value = '';
    document.getElementById('art-type-filter').value = '';
    document.getElementById('period-filter').value = '';
    document.getElementById('region-filter').value = '';
    document.getElementById('sort-filter').value = 'date-desc';
    PageManager.loadBrowseResults();
};

window.addToCollection = () => {
    if (!window.IndigenousArtAtlas.currentUser) {
        Utils.showNotification('Please log in to add items to collections', 'warning');
        return;
    }
    Utils.showNotification('Added to collection', 'success');
};

window.shareArt = () => {
    if (navigator.share) {
        navigator.share({
            title: document.getElementById('art-title').textContent,
            text: document.getElementById('art-description').textContent,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        Utils.showNotification('Link copied to clipboard', 'success');
    }
};

window.reportContent = () => {
    const modal = document.getElementById('report-modal');
    if (modal) {
        modal.classList.add('show');
    }
};

window.closeReportModal = () => {
    const modal = document.getElementById('report-modal');
    if (modal) {
        modal.classList.remove('show');
    }
};

window.toggleFAQ = (button) => {
    const answer = button.nextElementSibling;
    const isOpen = answer.classList.contains('show');
    
    // Close all FAQs
    document.querySelectorAll('.faq-answer').forEach(ans => ans.classList.remove('show'));
    document.querySelectorAll('.faq-question').forEach(q => q.classList.remove('active'));
    
    // Open clicked FAQ if it wasn't already open
    if (!isOpen) {
        answer.classList.add('show');
        button.classList.add('active');
    }
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize data
    DataManager.initializeSampleData();
    
    // Initialize authentication
    if (window.AuthManager) {
        window.AuthManager.checkAuthState();
    }
    
    // Initialize page-specific functionality
    PageManager.initializePage();
    
    // Initialize navigation dropdown
    const userButton = document.querySelector('.user-button');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (userButton && dropdownMenu) {
        userButton.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('show');
        });
    }
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });
    
    // Close modals with close button
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').classList.remove('show');
        });
    });
});

// Export for use in other modules
window.Utils = Utils;
window.DataManager = DataManager;
window.FormValidator = FormValidator;
window.PageManager = PageManager;
