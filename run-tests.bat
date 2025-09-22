@echo off
echo Ejecutando tests unitarios simples...
echo Intentando encontrar Node.js...

REM Intentar diferentes ubicaciones de Node.js
if exist "C:\Program Files\nodejs\node.exe" (
    echo Encontrado Node.js en Program Files
    "C:\Program Files\nodejs\node.exe" simple-test-runner.js
) else if exist "C:\Users\victor.vega\Downloads\node-v20.18.0-win-x64\node-v20.18.0-win-x64\node.exe" (
    echo Encontrado Node.js en Downloads
    "C:\Users\victor.vega\Downloads\node-v20.18.0-win-x64\node-v20.18.0-win-x64\node.exe" simple-test-runner.js
) else (
    echo Node.js no encontrado. Intentando usar 'node' del PATH...
    node simple-test-runner.js
)

echo.
echo Tests completados.
pause