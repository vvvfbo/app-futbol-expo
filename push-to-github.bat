@echo off
echo ========================================
echo   🚀 SUBIR A GITHUB
echo ========================================
echo.

echo ⚠️  Antes de ejecutar:
echo 1. Crea el repositorio en GitHub
echo 2. Copia la URL del repositorio
echo.

set /p repo_url="Pega aquí la URL de tu repositorio: "

if "%repo_url%"=="" (
    echo ❌ No se proporcionó URL
    pause
    exit /b 1
)

echo.
echo 📦 Preparando commit...
git add .
git commit -m "App Fútbol con cronómetro contextual - Lista para Netlify"
git branch -M main
git remote add origin %repo_url%

echo.
echo 🚀 Subiendo a GitHub...
git push -u origin main

echo.
echo ✅ ¡Código subido exitosamente!
echo 📝 Ahora conecta el repo en Netlify
echo.
pause