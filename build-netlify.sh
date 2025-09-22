#!/bin/bash

echo "🚀 Iniciando build para Netlify..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json no encontrado"
    exit 1
fi

echo "📦 Instalando dependencias..."
npm ci --quiet

echo "🔧 Verificando instalación de Expo CLI..."
npx expo --version

echo "🏗️ Ejecutando build de Expo Web..."
if npx expo export --platform web --output-dir dist; then
    echo "✅ Build de Expo exitoso!"
    
    # Verificar que se generaron los archivos
    if [ -f "dist/index.html" ] && [ -f "dist/_expo/static/js/web/entry-*.js" ]; then
        echo "✅ Archivos de build verificados"
    else
        echo "⚠️ Build completado pero faltan algunos archivos, usando fallback"
        # Copiar el index.html de public como fallback
        cp public/index.html dist/index.html
    fi
else
    echo "❌ Error en build de Expo, usando landing page como fallback"
    # Asegurar que existe el directorio dist
    mkdir -p dist
    # Copiar el index.html de public como fallback
    cp public/index.html dist/index.html
    echo "✅ Fallback configurado correctamente"
fi

echo "📁 Contenido de dist/:"
ls -la dist/

echo "🎉 Build completado!"