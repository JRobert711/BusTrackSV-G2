@echo off
echo Starting BusTrack SV - Integrated Frontend and Backend
echo.

echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
cd "frontend/New bustrack frontend"
start "Frontend Server" cmd /k "npm run dev"
cd ../..

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause > nul

