@echo off
echo ========================================
echo FileFlowPro Database Setup
echo ========================================
echo.
echo This script will set up the database for FileFlowPro.
echo Make sure you have:
echo 1. Configured DATABASE_URL in .env file
echo 2. Installed all dependencies (npm install)
echo.
echo Press any key to continue...
pause >nul
echo.
echo Running database setup...
echo.
call npm run db:setup
echo.
if %errorlevel% equ 0 (
    echo ========================================
    echo ✅ Database setup completed successfully!
    echo ========================================
    echo.
    echo You can now run the application with:
    echo npm run dev
    echo.
) else (
    echo ========================================
    echo ❌ Database setup failed!
    echo ========================================
    echo.
    echo Please check the error messages above and ensure:
    echo - DATABASE_URL is correctly set in .env
    echo - Database server is running and accessible
    echo - All dependencies are installed
    echo.
)
echo Press any key to exit...
pause >nul