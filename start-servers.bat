@echo off
echo Iniciando BusTrack SV...
echo.

echo Iniciando Backend Server...
start "Backend Server" cmd /k "cd backend && node server.js"

echo Esperando 3 segundos para que el backend se inicie...
timeout /t 3 /nobreak > nul

echo Iniciando Frontend Server...
start "Frontend Server" cmd /k "cd frontend/bustrack-frontend && npm start"

echo.
echo Ambos servidores se han iniciado:
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:3000
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul
