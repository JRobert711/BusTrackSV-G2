@echo off
echo Iniciando BusTrack SV...
echo.

echo Iniciando Firebase Emulator...
start "Firebase Emulator" cmd /k "cd backend && firebase emulators:start --only firestore"

echo Esperando 5 segundos para que el emulador se inicie...
timeout /t 5 /nobreak > nul

echo Iniciando Backend Server...
::No da errores pero node server.js solo ejecuta el backend con lo que ya tiene, si se quiere 
::que el backend se este reiniciando con los cambios que se hagan en ejecucion se debe usar npm run dev
::Codigo original: start "Backend Server" cmd /k "cd backend && node server.js"
start "Backend Server" cmd /k "cd backend && npm run dev"

echo Esperando 3 segundos para que el backend se inicie...
timeout /t 3 /nobreak > nul

echo Iniciando Frontend Server...
::Error de URL no encuentra la ruta por que ya no existe xd, ademas el npm start no funciona
::Codigo original: start "Frontend Server" cmd /k "cd frontend/bustrack-frontend && npm start"
start "Frontend Server" cmd /k "cd frontend/web && npm run dev"

echo.
echo Todos los servidores se han iniciado:
echo - Firebase Emulator: http://localhost:8080
echo - Emulator UI: http://localhost:4000
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:3000
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul
