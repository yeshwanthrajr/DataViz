# Storage Options for FileFlowPro

FileFlowPro supports multiple storage backends. Choose the one that best fits your needs!

## 🚀 Quick Setup

### Option 1: JSON File Storage (Recommended for Development)

**Best for:** Development, testing, small deployments
**Pros:** No external dependencies, easy setup, data persistence
**Cons:** Not suitable for high concurrency, single file bottleneck

```bash
# Set in .env file
STORAGE_TYPE="json"

# That's it! No additional setup required.
# Data will be stored in ./data.json
```

### Option 2: MySQL Database

**Best for:** Production deployments, high performance
**Pros:** ACID transactions, concurrent access, scalable
**Cons:** Requires MySQL server setup

```bash
# Install MySQL (choose one):
# - Windows: Download from https://dev.mysql.com/downloads/mysql/
# - macOS: brew install mysql
# - Ubuntu: sudo apt install mysql-server

# Create database
mysql -u root -p
CREATE DATABASE fileflowpro;
GRANT ALL PRIVILEGES ON fileflowpro.* TO 'fileflow_user'@'localhost' IDENTIFIED BY 'your_password';

# Set in .env file
STORAGE_TYPE="mysql"
DB_HOST="localhost"
DB_USER="fileflow_user"
DB_PASSWORD="your_password"
DB_NAME="fileflowpro"
```

### Option 3: PostgreSQL Database

**Best for:** Production deployments, complex queries
**Pros:** Advanced features, JSON support, ACID compliance
**Cons:** Requires PostgreSQL server setup

```bash
# Option A: Local PostgreSQL
# Install PostgreSQL from https://www.postgresql.org/download/

# Create database
psql -U postgres
CREATE DATABASE fileflowpro;
CREATE USER fileflow_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE fileflowpro TO fileflow_user;

# Set in .env file
STORAGE_TYPE="postgres"
DATABASE_URL="postgresql://fileflow_user:your_password@localhost:5432/fileflowpro"

# Option B: Neon Database (Free & Easy)
# 1. Go to https://neon.tech
# 2. Create free account
# 3. Create project
# 4. Copy connection string
STORAGE_TYPE="postgres"
DATABASE_URL="postgresql://your-neon-connection-string"
```

### Option 4: In-Memory Storage (Default)

**Best for:** Testing, demos, development
**Pros:** Fastest, no setup required
**Cons:** Data lost on restart

```bash
# Set in .env file (or don't set STORAGE_TYPE)
STORAGE_TYPE="memory"
```

## 📋 Storage Comparison

| Feature | JSON | MySQL | PostgreSQL | Memory |
|---------|------|-------|------------|--------|
| **Setup Complexity** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Performance** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Data Persistence** | ✅ | ✅ | ✅ | ❌ |
| **Concurrent Access** | ❌ | ✅ | ✅ | ✅ |
| **ACID Transactions** | ❌ | ✅ | ✅ | ❌ |
| **External Dependencies** | ❌ | ✅ | ✅ | ❌ |
| **Scalability** | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Backup/Restore** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ |

## 🔧 Configuration

### Environment Variables

```env
# Storage type selection
STORAGE_TYPE="json"  # memory, json, mysql, postgres

# MySQL settings (only needed for MySQL)
DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD=""
DB_NAME="fileflowpro"

# PostgreSQL settings (only needed for PostgreSQL)
DATABASE_URL="postgresql://user:pass@localhost:5432/fileflowpro"

# JWT and other settings
JWT_SECRET="your-secret-key"
NODE_ENV="development"
PORT=5000
```

### Default Users

All storage options come with these default users:
- **Super Admin**: `superadmin@datavizpro.com` / `admin123`
- **Admin**: `admin@datavizpro.com` / `admin123`
- **User**: `user@datavizpro.com` / `admin123`

## 🚀 Getting Started

1. **Choose your storage type** and update `.env`
2. **Set up external dependencies** (if using MySQL/PostgreSQL)
3. **Start the application**:
   ```bash
   npm run dev
   ```
4. **Check the console** for storage confirmation:
   - `✅ Using JSON file storage`
   - `✅ Using MySQL database storage`
   - `✅ Using PostgreSQL database storage`
   - `✅ Using in-memory storage`

## 📁 Data Storage Locations

- **JSON**: `./data.json` (created automatically)
- **MySQL**: Your MySQL database
- **PostgreSQL**: Your PostgreSQL database
- **Memory**: RAM only (lost on restart)

## 🔄 Switching Storage Types

You can switch between storage types at any time:

1. Update `STORAGE_TYPE` in `.env`
2. Set up the new storage system (if needed)
3. Restart the application
4. **Note:** Data won't migrate automatically between storage types

## 🛠 Troubleshooting

### JSON Storage Issues
- Check file permissions for `./data.json`
- Ensure write access to the project directory

### MySQL Connection Issues
- Verify MySQL server is running
- Check credentials in `.env`
- Ensure database exists: `CREATE DATABASE fileflowpro;`

### PostgreSQL Connection Issues
- Verify PostgreSQL server is running
- Check `DATABASE_URL` format
- Ensure database and user exist

### General Issues
- Check server logs for error messages
- Verify `.env` file exists and is properly formatted
- Try `STORAGE_TYPE="memory"` as fallback

## 📊 Performance Tips

### JSON Storage
- Good for development and small applications
- Monitor file size - consider MySQL/PostgreSQL for large datasets

### MySQL/PostgreSQL
- Use connection pooling for high traffic
- Create indexes on frequently queried columns
- Monitor query performance with EXPLAIN

### Memory Storage
- Fastest for development/testing
- Perfect for demos and presentations
- Use only when data persistence isn't needed

## 🔐 Security Considerations

- **Never commit `.env` files** to version control
- **Use strong passwords** for database users
- **Restrict database access** to necessary IPs only
- **Regular backups** for production databases
- **Monitor database logs** for suspicious activity

## 🎯 Recommendations

- **Development**: Use JSON or Memory storage
- **Small Production**: Start with MySQL
- **Large Scale**: Use PostgreSQL with connection pooling
- **Testing/CI**: Use Memory storage
- **Demos**: Use Memory storage (fast and clean)

---

**Need help?** Check the server logs for detailed error messages and refer to the specific database documentation for your chosen storage type.