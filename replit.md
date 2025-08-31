# Overview

This is a Korean car rental web application called "V0렌트카🚀" designed for Ho Chi Minh City, Vietnam. The application provides premium car rental services with hourly pricing (2, 4, and 8-hour rentals) and includes both a public-facing website and an administrative dashboard. The website features a dreamy, modern design aesthetic and serves Korean-speaking customers in Vietnam.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Template Engine**: Jinja2 with Flask for server-side rendering
- **CSS Framework**: Bootstrap 5.3.0 for responsive design
- **JavaScript Libraries**: FullCalendar for admin reservation calendar, custom JavaScript for animations and interactions
- **Design Pattern**: Base template inheritance with separate layouts for public and admin sections
- **Styling**: Custom CSS with gradient backgrounds, glassmorphism effects, and Korean font support (Noto Sans KR)

## Backend Architecture
- **Web Framework**: Flask with SQLAlchemy ORM for database operations
- **Database Pattern**: SQLAlchemy with DeclarativeBase for model definitions
- **Authentication**: Session-based authentication for admin users with password hashing
- **File Upload**: Werkzeug secure filename handling for car image uploads
- **Route Organization**: Separated route definitions with both public and admin endpoints

## Data Storage Solutions
- **Primary Database**: SQLite with file-based storage (car_rental.db)
- **Connection Pooling**: SQLAlchemy engine with pool recycling and pre-ping enabled
- **File Storage**: Local filesystem storage for uploaded car images in static/uploads directory
- **Data Models**: Three main entities - Car, Reservation, and Admin with proper relationships

## Authentication and Authorization
- **Admin Authentication**: Username/password authentication with hashed passwords using Werkzeug
- **Session Management**: Flask session-based authentication for admin panel access
- **Access Control**: Route-level protection for admin endpoints
- **Default Credentials**: Pre-configured admin user (fjwz90/Rundev90!) created on application startup

## Key Features
- **Multi-language Support**: Korean interface with Vietnamese pricing display
- **Image Management**: Multiple image upload and carousel display for vehicles
- **Pricing Structure**: Three-tier hourly pricing system (2h, 4h, 8h) in Vietnamese Dong
- **Reservation System**: Calendar-based reservation management with customer details
- **Responsive Design**: Mobile-friendly interface with Bootstrap components
- **Phone Integration**: Direct calling functionality with Vietnamese phone numbers

# External Dependencies

## Frontend Libraries
- **Bootstrap 5.3.0**: UI framework via CDN for responsive design and components
- **Font Awesome 6.4.0**: Icon library via CDN for UI icons
- **Google Fonts**: Noto Sans KR font family for Korean text rendering
- **FullCalendar 6.1.8**: Calendar component for admin reservation management

## Backend Dependencies
- **Flask**: Web application framework
- **Flask-SQLAlchemy**: Database ORM integration
- **Werkzeug**: WSGI utilities for password hashing and file uploads
- **SQLAlchemy**: Database abstraction layer with DeclarativeBase

## Database
- **SQLite**: Embedded database for development and small-scale deployment
- **File-based Storage**: Local filesystem for car image storage

## Communication Services
- **Phone Integration**: Direct telephone links using tel: protocol for Vietnamese numbers (+84708000002)
- **Email Contact**: Contact email (fjwz90@icloud.com) for customer inquiries

## Development Tools
- **Logging**: Python logging module configured for debugging
- **File Uploads**: 16MB file size limit with secure filename validation
- **Static Assets**: Flask static file serving for CSS, JavaScript, and uploaded images