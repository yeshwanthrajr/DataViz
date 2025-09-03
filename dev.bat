@echo off
echo ========================================
echo Starting FileFlowPro Development Server
echo ========================================
echo.
echo This script will start the development server.
echo Make sure you have:
echo 1. Installed all dependencies (npm install)
echo 2. Set up the database (run setup.bat first)
echo.
echo Press any key to continue...
pause >nul
echo.
echo Starting development server...
echo.
call npm run dev
echo.
echo Development server stopped.
echo.
pause