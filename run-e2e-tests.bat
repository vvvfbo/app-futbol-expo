@echo off
echo 🚀 EJECUTANDO TESTS E2E...
echo.

REM Usar el node.js del proyecto
set NODE_PATH=C:\Users\victor.vega\OneDrive - Verisure\Documents\Workspace\Personal proyects\app-futbol-expo-main\node-v20.18.0-win-x64

REM Si no existe en el proyecto, usar el descargado
if not exist "%NODE_PATH%\node.exe" (
    set NODE_PATH=C:\Users\victor.vega\Downloads\node-v20.18.0-win-x64\node-v20.18.0-win-x64
)

echo 📍 Usando Node.js desde: %NODE_PATH%
echo.

REM Ejecutar los tests E2E
"%NODE_PATH%\node.exe" run-e2e-tests.js

echo.
echo ✅ Tests E2E completados
pause