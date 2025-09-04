# DataViz

DataViz is a comprehensive data visualization platform that enables users to upload, analyze, and generate interactive charts from various file formats including Excel (.xlsx, .xls) and CSV files. The application features robust user authentication, role-based access control (user, admin, super-admin), and a modern, responsive React-based interface.

## Features

- **File Upload & Analysis**: Support for Excel (.xlsx, .xls) and CSV file formats with automatic data parsing
- **Interactive Charts**: Generate and customize various chart types using Recharts library
- **User Management**: Secure authentication with JWT tokens and role-based permissions
- **Database Storage**: PostgreSQL with Drizzle ORM for persistent data storage
- **File Approval System**: Admin approval workflow for uploaded files
- **Real-time Updates**: WebSocket support for live data updates
- **Responsive UI**: Built with React 18, TypeScript, Tailwind CSS, and Radix UI components
- **Multi-role Dashboard**: Different dashboards for users, admins, and super-admins
- **Admin Request System**: Users can request admin privileges with super-admin approval

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI, TanStack Query
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT (jsonwebtoken) with bcryptjs for password hashing
- **Charts**: Recharts for interactive data visualization
- **File Processing**: XLSX library for Excel file parsing, custom CSV parser
- **File Upload**: Multer for handling multipart/form-data
- **Development**: Vite, TypeScript, ESLint

## Installation

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **PostgreSQL** database (v12 or higher) - local installation or cloud service
- **Git** for cloning the repository

### Quick Start

1. **Clone the repository**
    ```bash
    git clone https://github.com/yeshwanthrajr/DataViz.git
    cd DataViz
    ```

2. **Install dependencies**
    ```bash
    npm install
    ```

3. **Environment Configuration**
    Create a `.env` file in the root directory:
    ```env
    # Database Configuration
    DATABASE_URL="postgresql://username:password@localhost:5432/dataviz"

    # JWT Secret (generate a secure random string)
    JWT_SECRET="your-super-secure-jwt-secret-key-here"

    # Server Configuration
    NODE_ENV="development"
    PORT=5000

    # Optional: For production deployment
    # SESSION_SECRET="another-secure-secret"
    ```

4. **Database Setup**
    ```bash
    # Option 1: Automated setup (recommended)
    npm run db:setup

    # Option 2: Manual setup
    # 1. Create PostgreSQL database
    # 2. Run migrations
    npm run db:push
    npm run db:migrate
    ```

5. **Start Development Server**
    ```bash
    npm run dev
    ```
    This will start both the backend server (port 5000) and frontend development server.

### Alternative Setup Methods

#### Using Docker (if available)
```bash
# Build and run with Docker
docker-compose up --build
```

#### Manual PostgreSQL Setup
```sql
-- Create database
CREATE DATABASE dataviz;

-- Create user (optional)
CREATE USER dataviz_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE dataviz TO dataviz_user;
```

## Usage

### Development Workflow

1. **Start Development Server**
    ```bash
    npm run dev
    ```
    - Backend server runs on `http://localhost:5000`
    - Frontend development server runs on `http://localhost:5173` (Vite)
    - Hot reload enabled for both frontend and backend

2. **Database Operations**
    ```bash
    npm run db:push      # Push schema changes to database
    npm run db:generate  # Generate migration files
    npm run db:migrate   # Run pending migrations
    npm run db:setup     # Complete database setup
    ```

3. **Code Quality**
    ```bash
    npm run check        # TypeScript type checking
    npm run build        # Production build
    ```

### Production Deployment

1. **Build the Application**
    ```bash
    npm run build
    ```

2. **Environment Configuration**
    Ensure your production `.env` file has:
    ```env
    NODE_ENV="production"
    DATABASE_URL="your-production-database-url"
    JWT_SECRET="secure-production-jwt-secret"
    ```

3. **Start Production Server**
    ```bash
    npm start
    ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (frontend + backend) |
| `npm run build` | Build frontend for production |
| `npm start` | Start production server |
| `npm run check` | TypeScript type checking |
| `npm run db:push` | Push database schema changes |
| `npm run db:generate` | Generate database migration files |
| `npm run db:migrate` | Run database migrations |
| `npm run db:setup` | Complete database setup (new installations) |

## Project Structure

```
DataViz/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components (dashboard, login, etc.)
│   │   ├── contexts/      # React contexts for state management
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions and configurations
├── server/                 # Node.js backend application
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Data storage abstraction layer
│   ├── index.ts           # Server entry point
│   └── db.ts              # Database connection and schema
├── shared/                 # Shared types and schemas
├── migrations/            # Database migration files
├── uploads/               # Uploaded file storage directory
└── API.md                 # Comprehensive API documentation
```

## Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User accounts, authentication, and role management
- **files**: Uploaded file metadata, status, and parsed data storage
- **charts**: Chart configurations, metadata, and visualization settings
- **admin_requests**: Admin privilege request management

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### File Management
- `POST /api/files/upload` - Upload a new file (Excel/CSV)
- `GET /api/files` - List user's files (role-based access)
- `GET /api/files/pending` - List pending files (admin/super-admin only)
- `GET /api/files/:id` - Get specific file details
- `PATCH /api/files/:id/approve` - Approve file (admin/super-admin only)
- `PATCH /api/files/:id/reject` - Reject file (admin/super-admin only)

### Chart Management
- `POST /api/charts` - Create a new chart from approved file
- `GET /api/charts` - List user's charts (role-based access)
- `GET /api/charts/file/:fileId` - List charts for specific file

### Admin Management
- `POST /api/admin-requests` - Request admin privileges
- `GET /api/admin-requests/pending` - List pending admin requests (super-admin only)
- `PATCH /api/admin-requests/:id/approve` - Approve admin request (super-admin only)
- `PATCH /api/admin-requests/:id/deny` - Deny admin request (super-admin only)

### User Management (Super Admin)
- `GET /api/users` - List all users (admin/super-admin only)
- `PATCH /api/users/:id/role` - Update user role (super-admin only)

### Statistics
- `GET /api/stats/dashboard` - User dashboard statistics
- `GET /api/stats/admin` - Admin dashboard statistics
- `GET /api/stats/superadmin` - Super-admin dashboard statistics

For detailed API documentation including request/response examples, authentication details, and error handling, see [API.md](API.md).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the [Database Setup Guide](DATABASE_SETUP.md)
2. Review server logs for error messages

3. Ensure your DATABASE_URL is correctly configured
