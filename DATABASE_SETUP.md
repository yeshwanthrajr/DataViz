# Database Setup Guide for FileFlowPro

This guide will help you set up a PostgreSQL database for the FileFlowPro application.

## 🚀 Quick Setup (Recommended)

### Option 1: Neon Database (Free & Easy)

1. **Create a Neon Account**
   - Go to [https://neon.tech](https://neon.tech)
   - Sign up for a free account
   - Create a new project

2. **Get Your Connection String**
   - In your Neon dashboard, go to "Connection Details"
   - Copy the connection string (it looks like: `postgresql://username:password@hostname/database`)

3. **Update Environment Variables**
   - Open the `.env` file in your project root
   - Replace the `DATABASE_URL` with your Neon connection string:
   ```env
   DATABASE_URL="postgresql://your-actual-connection-string-here"
   ```

4. **Run Database Setup**
   ```bash
   node setup-db.js
   ```

### Option 2: Local PostgreSQL

If you prefer to run PostgreSQL locally:

1. **Install PostgreSQL**
   - Download from [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
   - Or use a package manager:
     - macOS: `brew install postgresql`
     - Ubuntu: `sudo apt install postgresql postgresql-contrib`
     - Windows: Use the installer from the website

2. **Create Database**
   ```sql
   CREATE DATABASE fileflowpro;
   CREATE USER fileflow_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE fileflowpro TO fileflow_user;
   ```

3. **Update .env File**
   ```env
   DATABASE_URL="postgresql://fileflow_user:your_password@localhost:5432/fileflowpro"
   ```

4. **Run Database Setup**
   ```bash
   node setup-db.js
   ```

### Option 3: Docker PostgreSQL

If you have Docker installed:

```bash
# Run PostgreSQL in Docker
docker run --name fileflow-postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=fileflowpro \
  -e POSTGRES_USER=fileflow_user \
  -p 5432:5432 \
  -d postgres:15

# Update .env file
DATABASE_URL="postgresql://fileflow_user:your_password@localhost:5432/fileflowpro"

# Run setup
node setup-db.js
```

## 📋 What Gets Created

The database setup will create the following tables:

- **`users`** - User accounts and authentication
- **`files`** - Uploaded file metadata and data
- **`charts`** - Chart configurations and metadata
- **`admin_requests`** - Admin role requests

## 🔧 Manual Migration (Alternative)

If you prefer to run migrations manually:

```bash
# Generate migration files
npx drizzle-kit generate

# Push to database
npx drizzle-kit push
```

## ✅ Verification

After setup, you should see:
- ✅ "Using database storage" in the server logs
- ✅ No more "Using in-memory storage" messages
- ✅ Data persists between server restarts

## 🚨 Troubleshooting

### Connection Issues
- Verify your DATABASE_URL is correct
- Check if your database server is running
- Ensure firewall allows connections to PostgreSQL port (5432)

### Migration Errors
- Make sure the database exists
- Check user permissions
- Verify DATABASE_URL format

### Fallback Behavior
If database connection fails, the app will automatically fall back to in-memory storage with a warning message.

## 🎯 Next Steps

Once your database is set up:

1. Start the development server: `npm run dev`
2. The app will automatically use the database for all operations
3. Your data will persist between server restarts
4. Multiple users can share the same data

## 📞 Support

If you encounter issues:
1. Check the server logs for error messages
2. Verify your DATABASE_URL format
3. Ensure your database server is accessible
4. Try the fallback in-memory storage first to isolate issues