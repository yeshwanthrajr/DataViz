# DataViz API Documentation

## Overview

DataViz provides a RESTful API for managing file uploads, data visualization, user authentication, and administrative functions. All API endpoints require authentication except for user registration and login.

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header as a Bearer token:

```
Authorization: Bearer <your-jwt-token>
```

## Base URL

```
http://localhost:5000/api
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### GET /api/auth/me
Get current authenticated user information.

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### File Management Endpoints

#### POST /api/files/upload
Upload a new file (Excel or CSV format).

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: The file to upload (Excel .xlsx/.xls or .csv)

**Supported File Types:**
- Excel files: `.xlsx`, `.xls`
- CSV files: `.csv`
- Maximum file size: 10MB

**Response:**
```json
{
  "id": "file-id",
  "userId": "user-id",
  "filename": "uploaded-file.xlsx",
  "originalName": "original-filename.xlsx",
  "path": "/uploads/filename",
  "status": "pending",
  "data": [...], // Parsed data array
  "uploadedAt": "2025-01-01T00:00:00.000Z"
}
```

#### GET /api/files
List files accessible to the current user.

**Role-based Access:**
- **User**: Own files only
- **Admin/Super-admin**: All files

**Response:**
```json
[
  {
    "id": "file-id",
    "userId": "user-id",
    "filename": "file.xlsx",
    "originalName": "original.xlsx",
    "status": "approved",
    "uploadedAt": "2025-01-01T00:00:00.000Z",
    "approvedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### GET /api/files/pending
List all pending files requiring approval. (Admin/Super-admin only)

**Response:**
```json
[
  {
    "id": "file-id",
    "userId": "user-id",
    "filename": "pending-file.xlsx",
    "originalName": "original.xlsx",
    "status": "pending",
    "uploadedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### GET /api/files/:id
Get detailed information about a specific file.

**Parameters:**
- `id`: File ID

**Response:**
```json
{
  "id": "file-id",
  "userId": "user-id",
  "filename": "file.xlsx",
  "originalName": "original.xlsx",
  "path": "/uploads/filename",
  "status": "approved",
  "data": [...], // Full parsed data
  "uploadedAt": "2025-01-01T00:00:00.000Z",
  "approvedAt": "2025-01-01T00:00:00.000Z"
}
```

#### PATCH /api/files/:id/approve
Approve a pending file. (Admin/Super-admin only)

**Parameters:**
- `id`: File ID

**Response:**
```json
{
  "id": "file-id",
  "status": "approved",
  "approvedBy": "admin-id",
  "approvedAt": "2025-01-01T00:00:00.000Z"
}
```

#### PATCH /api/files/:id/reject
Reject a pending file. (Admin/Super-admin only)

**Parameters:**
- `id`: File ID

**Response:**
```json
{
  "id": "file-id",
  "status": "rejected",
  "approvedBy": "admin-id",
  "approvedAt": "2025-01-01T00:00:00.000Z"
}
```

### Chart Management Endpoints

#### POST /api/charts
Create a new chart from an approved file.

**Request Body:**
```json
{
  "fileId": "file-id",
  "name": "Sales Chart",
  "type": "bar",
  "config": {
    "xAxis": "month",
    "yAxis": "sales",
    "title": "Monthly Sales"
  }
}
```

**Response:**
```json
{
  "id": "chart-id",
  "userId": "user-id",
  "fileId": "file-id",
  "name": "Sales Chart",
  "type": "bar",
  "config": {...},
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

#### GET /api/charts
List charts accessible to the current user.

**Role-based Access:**
- **User**: Own charts only
- **Admin/Super-admin**: All charts

**Response:**
```json
[
  {
    "id": "chart-id",
    "userId": "user-id",
    "fileId": "file-id",
    "name": "Sales Chart",
    "type": "bar",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### GET /api/charts/file/:fileId
List all charts created from a specific file.

**Parameters:**
- `fileId`: File ID

**Response:**
```json
[
  {
    "id": "chart-id",
    "userId": "user-id",
    "fileId": "file-id",
    "name": "Chart Name",
    "type": "line",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Admin Management Endpoints

#### POST /api/admin-requests
Request admin privileges. (Regular users only)

**Request Body:**
```json
{
  "reason": "I need admin access to manage team files"
}
```

**Response:**
```json
{
  "id": "request-id",
  "userId": "user-id",
  "reason": "I need admin access to manage team files",
  "status": "pending",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

#### GET /api/admin-requests/pending
List pending admin privilege requests. (Super-admin only)

**Response:**
```json
[
  {
    "id": "request-id",
    "userId": "user-id",
    "reason": "Request reason",
    "status": "pending",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### PATCH /api/admin-requests/:id/approve
Approve an admin privilege request. (Super-admin only)

**Parameters:**
- `id`: Request ID

**Response:**
```json
{
  "message": "User promoted to admin successfully"
}
```

#### PATCH /api/admin-requests/:id/deny
Deny an admin privilege request. (Super-admin only)

**Parameters:**
- `id`: Request ID

**Response:**
```json
{
  "id": "request-id",
  "status": "denied",
  "reviewedBy": "super-admin-id",
  "reviewedAt": "2025-01-01T00:00:00.000Z"
}
```

### User Management Endpoints (Super Admin)

#### GET /api/users
List all users in the system. (Admin/Super-admin only)

**Response:**
```json
[
  {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### PATCH /api/users/:id/role
Update a user's role. (Super-admin only)

**Parameters:**
- `id`: User ID

**Request Body:**
```json
{
  "role": "admin"
}
```

**Valid Roles:**
- `user`
- `admin`

**Response:**
```json
{
  "message": "User role updated successfully"
}
```

### Statistics Endpoints

#### GET /api/stats/dashboard
Get dashboard statistics for the current user.

**Response:**
```json
{
  "totalUploads": 5,
  "approved": 4,
  "pending": 1,
  "charts": 12
}
```

#### GET /api/stats/admin
Get admin dashboard statistics. (Admin/Super-admin only)

**Response:**
```json
{
  "activeUsers": 25,
  "monthlyFiles": 45,
  "chartsGenerated": 120,
  "storageUsed": "2.4GB",
  "pendingApprovals": 3
}
```

#### GET /api/stats/superadmin
Get super-admin dashboard statistics. (Super-admin only)

**Response:**
```json
{
  "totalUsers": 50,
  "pendingApprovals": 5,
  "filesProcessed": 200,
  "adminRequests": 3
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Invalid input",
  "errors": [...] // Validation errors
}
```

### 401 Unauthorized
```json
{
  "message": "Access token required"
}
```

### 403 Forbidden
```json
{
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error"
}
```

## Rate Limiting

- File uploads are limited to 10MB per file
- Authentication endpoints have rate limiting to prevent abuse
- All endpoints require proper authentication

## Data Formats

### File Data Structure
Uploaded files are parsed into the following JSON structure:
```json
[
  {
    "column1": "value1",
    "column2": "value2",
    "column3": "value3"
  },
  {
    "column1": "value4",
    "column2": "value5",
    "column3": "value6"
  }
]
```

### Chart Configuration
Chart configurations follow this structure:
```json
{
  "type": "bar|line|pie|area",
  "xAxis": "column_name",
  "yAxis": "column_name",
  "title": "Chart Title",
  "colors": ["#color1", "#color2"],
  "filters": {...}
}
```

## WebSocket Support

The application supports real-time updates via WebSocket for:
- File approval status changes
- New chart creations
- Admin request updates

Connect to `/ws` endpoint with authentication token.