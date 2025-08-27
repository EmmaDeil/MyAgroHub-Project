@echo off
title AgriTech Full Stack Startup
color 0A

echo.
echo ========================================
echo    🌾 AgriTech Full Stack Startup
echo ========================================
echo.

echo 🔍 Testing MongoDB Connection...
cd backend
node test-mongodb.js
cd ..
echo.

echo 🚀 Starting Both Servers with ONE COMMAND...
echo 🔧 Backend (Node.js): http://localhost:5001
echo 🎨 Frontend (Vite): http://localhost:5175
echo.

npm run dev

echo.
echo ✅ Servers stopped!
echo.
echo Press any key to continue...
pause >nul
