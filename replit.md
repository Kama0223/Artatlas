# Indigenous Art Atlas

## Overview

The Indigenous Art Atlas is a community-driven web application designed to serve as a comprehensive database for tracking, sharing, and preserving indigenous art across various real-world settings. The platform encompasses everything from ancient cave art to contemporary installations, providing both public access for art discovery and secure portals for registered users to contribute content.

The application features an interactive map-based interface using Leaflet.js for geographic visualization, comprehensive art browsing capabilities, user authentication systems, and administrative tools for content moderation. The platform emphasizes cultural sensitivity and ethical considerations in the documentation and sharing of indigenous artworks.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend follows a multi-page application (MPA) architecture built with vanilla HTML, CSS, and JavaScript. The design uses semantic HTML markup with responsive CSS layouts and extensive JavaScript for dynamic functionality. Key architectural decisions include:

- **Component-based CSS**: Uses CSS custom properties (variables) for consistent theming with earth-tone colors inspired by cultural heritage
- **Modular JavaScript**: Organized into separate modules (auth.js, map.js, admin.js, main.js) with namespace pattern to avoid global conflicts
- **Responsive Design**: Mobile-first approach using flexbox and grid layouts
- **Interactive Maps**: Leaflet.js integration for geographic visualization of art locations with custom markers and sensitivity controls

### Backend Architecture
The backend is designed to use PHP with MySQL for server-side processing, though the current implementation shows a frontend-heavy approach with local storage simulation. The planned architecture includes:

- **MVC Pattern**: Separation of concerns with models for data access, views for presentation, and controllers for business logic  
- **RESTful API Design**: Clean URL structure for art entries, user management, and administrative functions
- **Session Management**: Secure user authentication with role-based access control (public, registered users, admins)
- **Database Normalization**: Relational database design with proper foreign key relationships

### Authentication & Authorization
The authentication system implements a role-based access control pattern:

- **Public Access**: Browse art, view details, search and filter functionality
- **Registered Users**: Art submission, personal dashboard, profile management
- **Administrator**: Content moderation, user management, system analytics
- **Session Management**: 24-hour session timeout with automatic refresh and localStorage persistence

### Data Management
The application uses a structured approach to data organization:

- **Art Categorization**: Predefined taxonomies for art types (cave art, murals, sculptures), periods (ancient, historical, modern, contemporary), and regions
- **Location Sensitivity**: Configurable privacy controls for sensitive cultural sites with general region display options
- **Content Moderation**: Admin approval workflow for submitted artworks
- **Image Handling**: Multiple image support with gallery/carousel functionality

## External Dependencies

### Core Libraries
- **Leaflet.js**: Lightweight JavaScript library for interactive maps and geographic visualization
- **OpenStreetMap**: Map tile provider for base geographic layers
- **Font Awesome**: Icon library for consistent iconography throughout the interface
- **http-server**: Development server for local testing (Node.js package)

### Planned Backend Stack
- **PHP**: Server-side scripting language for business logic and API endpoints
- **MySQL**: Relational database management system for persistent data storage
- **OpenStreetMap API**: Geographic data source for map tiles and location services

### Browser APIs
- **Local Storage**: Client-side data persistence for user sessions and temporary data
- **File API**: Image upload handling for artwork submissions
- **Geolocation API**: Optional location detection for art submission workflows

The architecture prioritizes cultural sensitivity, security, and scalability while maintaining simplicity in the technology stack. The separation of concerns between frontend and backend allows for independent development and future enhancements while preserving the core mission of respectfully documenting and sharing indigenous artistic heritage.