@echo off
echo Ejecutando Tests de Integración de Persistencia...
echo.

set NODE_PATH=C:\Users\victor.vega\OneDrive - Verisure\Documents\Workspace\Personal proyects\app-futbol-expo-main\node-v20.18.0-win-x64\node.exe

if exist "%NODE_PATH%" (
    echo Usando Node.js: %NODE_PATH%
    echo.
    echo === EJECUTANDO TESTS DE INTEGRACIÓN ===
    "%NODE_PATH%" run-integration-tests.js
    echo.
    if %ERRORLEVEL% EQU 0 (
        echo TODOS LOS TESTS DE INTEGRACIÓN PASARON
    ) else (
        echo ALGUNOS TESTS DE INTEGRACIÓN FALLARON
    )
) else (
    echo ERROR: No se pudo encontrar Node.js
    pause
    exit /b 1
)

echo.
echo Tests completados
pause