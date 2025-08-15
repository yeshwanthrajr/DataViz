# DataViz Pro

## Overview

DataViz Pro is a full-stack web application that enables users to upload Excel files and generate interactive charts from their data. The application features a role-based system with three user levels: regular users, admins, and super admins. Built with a modern tech stack including React, Express.js, and PostgreSQL, the platform provides secure file management, data visualization capabilities, and comprehensive administrative controls.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built using React with TypeScript and follows a component-based architecture. The application uses Vite as the build tool and development server, providing fast hot module replacement and optimized builds. The UI is constructed with shadcn/ui components built on top of Radix UI primitives, ensuring accessibility and consistent design patterns.

**Key Frontend Components:**
- **Authentication System**: Context-based authentication with JWT token management
- **Role-based Routing**: Different dashboard interfaces for users, admins, and super admins
- **File Upload Component**: Drag-and-drop interface with Excel file validation
- **Chart Generator**: Interactive chart creation with multiple visualization types
- **Responsive Design**: Mobile-first approach using Tailwind CSS

### Backend Architecture
The server follows a RESTful API design pattern using Express.js with TypeScript. The architecture separates concerns through distinct modules for routing, storage, and authentication middleware.

**Core Backend Features:**
- **JWT Authentication**: Secure token-based authentication with role verification
- **File Processing**: Excel file parsing using XLSX library with data validation
- **Storage Abstraction**: Interface-based storage pattern allowing for easy database switching
- **Role-based Authorization**: Middleware for protecting endpoints based on user roles
- **Error Handling**: Centralized error handling with appropriate HTTP status codes

### Database Design
The application uses PostgreSQL with Drizzle ORM for type-safe database operations. The schema supports a comprehensive role-based system with file management and audit trails.

**Database Tables:**
- **Users**: Stores user credentials, roles, and profile information
- **Files**: Manages uploaded Excel files with approval workflow
- **Charts**: Stores chart configurations and metadata
- **Admin Requests**: Handles user requests for admin privileges

### Authentication and Authorization
The system implements a three-tier role hierarchy:
- **Users**: Can upload files and create charts from approved data
- **Admins**: Can approve/reject file uploads and view system analytics
- **Super Admins**: Have full system control including user management and admin privilege grants

Authentication uses JWT tokens with automatic refresh and secure storage. Authorization is enforced at both route and component levels.

### State Management
The application uses TanStack Query (React Query) for server state management, providing:
- Automatic caching and background updates
- Optimistic updates for better user experience
- Error handling and retry logic
- Invalidation strategies for data consistency

## External Dependencies

### Database and ORM
- **PostgreSQL**: Primary database for data persistence
- **Neon Database**: Serverless PostgreSQL hosting platform
- **Drizzle ORM**: Type-safe database toolkit with migration support
- **Drizzle Kit**: CLI tools for database schema management

### UI and Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component library with customizable design system

### Development and Build Tools
- **Vite**: Fast build tool and development server with HMR
- **TypeScript**: Static typing for enhanced development experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind integration

### Data Processing and Visualization
- **XLSX**: Excel file parsing and data extraction
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form validation and submission handling
- **Zod**: Runtime type validation and schema parsing

### Authentication and Security
- **JWT (jsonwebtoken)**: Token-based authentication
- **bcryptjs**: Password hashing and verification
- **Multer**: File upload middleware with validation

### Development Environment
- **Replit**: Cloud-based development environment
- **TSX**: TypeScript execution for development server
- **Wouter**: Lightweight client-side routing library