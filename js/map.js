/**
 * Indigenous Art Atlas - Map Functionality
 * Handles all map-related features using Leaflet.js
 */

window.MapManager = {
    // Map instances
    mainMap: null,
    browseMap: null,
    detailMap: null,
    locationPickerMap: null,
    
    // Map configurations
    defaultCenter: [0, 0],
    defaultZoom: 2,
    
    // Custom markers
    markers: {
        ancient: {
            color: '#8B4513',
            icon: 'fas fa-mountain'
        },
        contemporary: {
            color: '#DAA520',
            icon: 'fas fa-palette'
        },
        sensitive: {
            color: '#FF8C00',
            icon: 'fas fa-shield-alt'
        }
    },

    // Initialize main homepage map
    initializeMainMap: () => {
        const mapContainer = document.getElementById('main-map');
        if (!mapContainer) return;

        // Create map
        MapManager.mainMap = L.map('main-map').setView([-25, 135], 3);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(MapManager.mainMap);

        // Load and display artwork markers
        MapManager.loadArtworkMarkers(MapManager.mainMap);

        // Add map controls
        MapManager.addMapControls(MapManager.mainMap);
    },

    // Initialize browse page map
    initializeBrowseMap: () => {
        const mapContainer = document.getElementById('browse-map');
        if (!mapContainer) return;

        // Create map
        MapManager.browseMap = L.map('browse-map').setView([0, 0], 2);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(MapManager.browseMap);

        // Load and display artwork markers with current filters
        MapManager.loadFilteredArtworkMarkers(MapManager.browseMap);

        // Add layer control for filtering
        MapManager.addLayerControl(MapManager.browseMap);
    },

    // Initialize artwork detail map
    initializeDetailMap: (location) => {
        const mapContainer = document.getElementById('detail-map');
        if (!mapContainer || !location) return;

        let center, zoom;
        
        if (location.sensitive) {
            // Show general region for sensitive locations
            center = MapManager.getGeneralRegionCenter(location.coordinates);
            zoom = 5;
        } else {
            // Show exact location for non-sensitive artworks
            center = location.coordinates;
            zoom = 12;
        }

        // Create map
        MapManager.detailMap = L.map('detail-map').setView(center, zoom);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(MapManager.detailMap);

        // Add marker
        if (location.sensitive) {
            // Add circle for sensitive locations
            L.circle(center, {
                color: '#FF8C00',
                fillColor: '#FF8C00',
                fillOpacity: 0.2,
                radius: 50000 // 50km radius
            }).addTo(MapManager.detailMap);
        } else {
            // Add exact marker for non-sensitive locations
            const marker = MapManager.createCustomMarker(center, {
                type: 'exact',
                title: 'Artwork Location'
            });
            marker.addTo(MapManager.detailMap);
        }

        // Disable zoom if sensitive
        if (location.sensitive) {
            MapManager.detailMap.options.minZoom = zoom;
            MapManager.detailMap.options.maxZoom = zoom + 2;
        }
    },

    // Initialize location picker map for submissions
    initializeLocationPickerMap: () => {
        const mapContainer = document.getElementById('location-map');
        if (!mapContainer) return;

        // Create map
        MapManager.locationPickerMap = L.map('location-map').setView([0, 0], 2);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(MapManager.locationPickerMap);

        let selectedMarker = null;
        const coordinatesDisplay = document.getElementById('selected-coordinates');

        // Handle map clicks
        MapManager.locationPickerMap.on('click', (e) => {
            const { lat, lng } = e.latlng;
            
            // Remove existing marker
            if (selectedMarker) {
                MapManager.locationPickerMap.removeLayer(selectedMarker);
            }

            // Add new marker
            selectedMarker = L.marker([lat, lng], {
                draggable: true
            }).addTo(MapManager.locationPickerMap);

            // Update coordinates display
            MapManager.updateCoordinatesDisplay(lat, lng);

            // Handle marker drag
            selectedMarker.on('dragend', (event) => {
                const position = event.target.getLatLng();
                MapManager.updateCoordinatesDisplay(position.lat, position.lng);
            });
        });

        // Try to get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                MapManager.locationPickerMap.setView([latitude, longitude], 10);
            }, (error) => {
                console.log('Geolocation not available:', error);
            });
        }
    },

    // Update coordinates display
    updateCoordinatesDisplay: (lat, lng) => {
        const coordinatesDisplay = document.getElementById('selected-coordinates');
        if (coordinatesDisplay) {
            coordinatesDisplay.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }

        // Store coordinates in form data
        if (window.SubmitArtManager) {
            window.SubmitArtManager.setSelectedLocation(lat, lng);
        }
    },

    // Load artwork markers on map
    loadArtworkMarkers: (map) => {
        if (!window.DataManager) return;

        const artworks = window.DataManager.getArtworks();
        const markerGroups = {
            ancient: L.layerGroup(),
            contemporary: L.layerGroup(),
            sensitive: L.layerGroup()
        };

        artworks.forEach(artwork => {
            if (!artwork.location || !artwork.location.coordinates) return;

            let coordinates = artwork.location.coordinates;
            let markerType = 'contemporary';

            // Determine marker type
            if (artwork.location.sensitive) {
                markerType = 'sensitive';
                // Use general region for sensitive locations
                coordinates = MapManager.getGeneralRegionCenter(coordinates);
            } else if (artwork.period === 'ancient') {
                markerType = 'ancient';
            }

            // Create marker
            const marker = MapManager.createCustomMarker(coordinates, {
                type: markerType,
                artwork: artwork
            });

            // Add popup
            marker.bindPopup(`
                <div class="map-popup">
                    <h4>${artwork.title}</h4>
                    <p>${window.Utils.truncateText(artwork.description, 60)}</p>
                    <div class="popup-meta">
                        <span class="meta-tag">${artwork.artType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <span class="meta-tag">${artwork.period.charAt(0).toUpperCase() + artwork.period.slice(1)}</span>
                    </div>
                    <a href="art-detail.html?id=${artwork.id}" class="btn btn-primary btn-small">View Details</a>
                </div>
            `);

            // Add to appropriate group
            marker.addTo(markerGroups[markerType]);
        });

        // Add all groups to map
        Object.values(markerGroups).forEach(group => group.addTo(map));

        // Store groups for layer control
        map.markerGroups = markerGroups;
    },

    // Load filtered artwork markers
    loadFilteredArtworkMarkers: (map) => {
        // Clear existing markers
        if (map.markerGroups) {
            Object.values(map.markerGroups).forEach(group => {
                map.removeLayer(group);
            });
        }

        // Get current filters from browse page
        const filters = {
            search: document.getElementById('search-input')?.value || '',
            artType: document.getElementById('art-type-filter')?.value || '',
            period: document.getElementById('period-filter')?.value || '',
            region: document.getElementById('region-filter')?.value || ''
        };

        const artworks = window.DataManager.getArtworks(filters);
        const markerGroups = {
            ancient: L.layerGroup(),
            contemporary: L.layerGroup(),
            sensitive: L.layerGroup()
        };

        artworks.forEach(artwork => {
            if (!artwork.location || !artwork.location.coordinates) return;

            let coordinates = artwork.location.coordinates;
            let markerType = 'contemporary';

            // Determine marker type
            if (artwork.location.sensitive) {
                markerType = 'sensitive';
                coordinates = MapManager.getGeneralRegionCenter(coordinates);
            } else if (artwork.period === 'ancient') {
                markerType = 'ancient';
            }

            // Create marker
            const marker = MapManager.createCustomMarker(coordinates, {
                type: markerType,
                artwork: artwork
            });

            // Add popup
            marker.bindPopup(`
                <div class="map-popup">
                    <h4>${artwork.title}</h4>
                    <p>${window.Utils.truncateText(artwork.description, 60)}</p>
                    <div class="popup-meta">
                        <span class="meta-tag">${artwork.artType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <span class="meta-tag">${artwork.period.charAt(0).toUpperCase() + artwork.period.slice(1)}</span>
                    </div>
                    <a href="art-detail.html?id=${artwork.id}" class="btn btn-primary btn-small">View Details</a>
                </div>
            `);

            // Add to appropriate group
            marker.addTo(markerGroups[markerType]);
        });

        // Add all groups to map
        Object.values(markerGroups).forEach(group => group.addTo(map));

        // Store groups for layer control
        map.markerGroups = markerGroups;

        // Fit map to markers if any exist
        const allMarkers = [];
        Object.values(markerGroups).forEach(group => {
            group.eachLayer(marker => allMarkers.push(marker));
        });

        if (allMarkers.length > 0) {
            const group = new L.featureGroup(allMarkers);
            map.fitBounds(group.getBounds().pad(0.1));
        }
    },

    // Create custom marker
    createCustomMarker: (coordinates, options = {}) => {
        const { type = 'contemporary', artwork = null } = options;
        
        // Create custom icon
        const markerConfig = MapManager.markers[type] || MapManager.markers.contemporary;
        
        const iconHtml = `
            <div class="custom-marker ${type}">
                <i class="${markerConfig.icon}"></i>
            </div>
        `;

        const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-marker-container',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });

        const marker = L.marker(coordinates, { icon: customIcon });

        // Store artwork data
        if (artwork) {
            marker.artworkData = artwork;
        }

        return marker;
    },

    // Add map controls
    addMapControls: (map) => {
        // Add zoom control
        L.control.zoom({
            position: 'topright'
        }).addTo(map);

        // Add scale control
        L.control.scale({
            position: 'bottomleft'
        }).addTo(map);
    },

    // Add layer control for filtering
    addLayerControl: (map) => {
        if (!map.markerGroups) return;

        const overlayMaps = {
            "Ancient Art": map.markerGroups.ancient,
            "Contemporary Art": map.markerGroups.contemporary,
            "Sensitive Locations": map.markerGroups.sensitive
        };

        L.control.layers(null, overlayMaps, {
            position: 'topright',
            collapsed: false
        }).addTo(map);
    },

    // Get general region center for sensitive locations
    getGeneralRegionCenter: (coordinates) => {
        const [lat, lng] = coordinates;
        
        // Offset coordinates by ±0.5 degrees to show general area
        const offsetLat = lat + (Math.random() - 0.5) * 1;
        const offsetLng = lng + (Math.random() - 0.5) * 1;
        
        return [offsetLat, offsetLng];
    },

    // Update browse map when filters change
    updateBrowseMap: () => {
        if (MapManager.browseMap) {
            MapManager.loadFilteredArtworkMarkers(MapManager.browseMap);
        }
    },

    // Get selected location from picker
    getSelectedLocation: () => {
        if (!MapManager.locationPickerMap) return null;
        
        const coordinatesText = document.getElementById('selected-coordinates')?.textContent;
        if (!coordinatesText || coordinatesText === 'Click on map to select location') {
            return null;
        }
        
        const [lat, lng] = coordinatesText.split(', ').map(coord => parseFloat(coord));
        return { lat, lng };
    },

    // Validate location selection
    validateLocationSelection: () => {
        const location = MapManager.getSelectedLocation();
        if (!location) {
            window.FormValidator.showFieldError('location', 'Please select a location on the map');
            return false;
        }
        
        window.FormValidator.clearFieldError('location');
        return true;
    },

    // Initialize maps based on page
    initializeMapsForPage: () => {
        const currentPage = window.IndigenousArtAtlas.currentPage;
        
        switch (currentPage) {
            case 'index':
                MapManager.initializeMainMap();
                break;
            case 'browse':
                // Browse map is initialized when map view is selected
                break;
            case 'art-detail':
                // Detail map is initialized when artwork is loaded
                break;
            case 'submit-art':
                MapManager.initializeLocationPickerMap();
                break;
        }
    },

    // Cleanup maps
    cleanup: () => {
        if (MapManager.mainMap) {
            MapManager.mainMap.remove();
            MapManager.mainMap = null;
        }
        if (MapManager.browseMap) {
            MapManager.browseMap.remove();
            MapManager.browseMap = null;
        }
        if (MapManager.detailMap) {
            MapManager.detailMap.remove();
            MapManager.detailMap = null;
        }
        if (MapManager.locationPickerMap) {
            MapManager.locationPickerMap.remove();
            MapManager.locationPickerMap = null;
        }
    }
};

// CSS for custom markers
const markerStyles = `
    .custom-marker-container {
        background: none !important;
        border: none !important;
    }
    
    .custom-marker {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.2s ease;
    }
    
    .custom-marker:hover {
        transform: scale(1.1);
    }
    
    .custom-marker.ancient {
        background-color: #8B4513;
    }
    
    .custom-marker.contemporary {
        background-color: #DAA520;
    }
    
    .custom-marker.sensitive {
        background-color: #FF8C00;
    }
    
    .map-popup {
        min-width: 200px;
        padding: 10px;
    }
    
    .map-popup h4 {
        margin: 0 0 8px 0;
        color: #2F2F2F;
        font-size: 16px;
    }
    
    .map-popup p {
        margin: 0 0 10px 0;
        color: #696969;
        font-size: 14px;
        line-height: 1.4;
    }
    
    .popup-meta {
        display: flex;
        gap: 5px;
        margin-bottom: 10px;
        flex-wrap: wrap;
    }
    
    .popup-meta .meta-tag {
        padding: 2px 6px;
        background-color: #F5F5DC;
        color: #8B4513;
        border-radius: 3px;
        font-size: 11px;
        font-weight: 500;
    }
    
    .leaflet-popup-content-wrapper {
        border-radius: 8px;
    }
    
    .leaflet-popup-tip {
        background-color: white;
    }
`;

// Add marker styles to page
const styleSheet = document.createElement('style');
styleSheet.textContent = markerStyles;
document.head.appendChild(styleSheet);

// Initialize maps when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure page is fully loaded
    setTimeout(() => {
        MapManager.initializeMapsForPage();
    }, 100);
});

// Update browse map when filters change
if (window.PageManager) {
    const originalLoadBrowseResults = window.PageManager.loadBrowseResults;
    window.PageManager.loadBrowseResults = function() {
        originalLoadBrowseResults.call(this);
        // Update map after results are loaded
        setTimeout(() => {
            MapManager.updateBrowseMap();
        }, 600);
    };
}

// Export MapManager
window.MapManager = MapManager;
