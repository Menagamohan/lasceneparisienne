@echo off
title La Scene Admin Server
color 0A
echo.
echo  ==========================================
echo   La Scene Parisienne - Admin Server
echo  ==========================================
echo.

:: Check if node_modules exists, if not run npm install
if not exist "node_modules" (
    echo  Installing dependencies...
    npm config set strict-ssl false
    npm install
    npm config set strict-ssl true
    echo.
)

echo  Starting server...
echo  Open: http://localhost:3000/admin.html
echo.
node server.js
pause
