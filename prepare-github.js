#!/usr/bin/env node

/**
 * 🚀 PREPARACIÓN FINAL PARA GITHUB
 * Script para preparar el proyecto y subirlo a GitHub
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log("🚀 === PREPARACIÓN FINAL PARA GITHUB ===\n");

function ejecutarComando(comando, descripcion) {
    try {
        console.log(`⚡ ${descripcion}...`);
        const resultado = execSync(comando, { encoding: 'utf8', stdio: 'pipe' });
        console.log(`✅ ${descripcion} completado`);
        return resultado;
    } catch (error) {
        console.log(`❌ Error en ${descripcion}: ${error.message}`);
        return null;
    }
}

function verificarGit() {
    console.log("🔍 Verificando estado de Git...\n");

    try {
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        if (status.trim()) {
            console.log("📋 Archivos modificados:");
            console.log(status);
            return true;
        } else {
            console.log("✅ No hay cambios pendientes");
            return false;
        }
    } catch (error) {
        console.log("❌ Error verificando Git:", error.message);
        return false;
    }
}

function actualizarGitignore() {
    console.log("\n📝 Actualizando .gitignore...");

    const gitignoreContent = `# Dependencias
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Expo
.expo/
dist/
web-build/

# Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.apk
*.ipa

# Metro
.metro-health-check*

# Debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# Local env files
.env*.local
.env

# Typescript
*.tsbuildinfo

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Temporary folders
temp/
tmp/

# OS generated files
Thumbs.db
ehthumbs.db
Desktop.ini

# Recycle Bin used on file shares
$RECYCLE.BIN/

# Windows Installer files
*.cab
*.msi
*.msm
*.msp

# Windows shortcuts
*.lnk

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Optimization backups
.optimization-backups/
.rorkai/

# Build artifacts
build/
dist/

# Testing
coverage/
*.lcov

# Scripts de limpieza temporales
cleanup-project.js
`;

    fs.writeFileSync('.gitignore', gitignoreContent);
    console.log("✅ .gitignore actualizado");
}

function crearArchivoLicense() {
    console.log("\n📄 Creando archivo LICENSE...");

    const licenseContent = `MIT License

Copyright (c) 2025 App Fútbol Expo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

    fs.writeFileSync('LICENSE', licenseContent);
    console.log("✅ LICENSE creado");
}

function crearArchivoContributing() {
    console.log("\n🤝 Creando CONTRIBUTING.md...");

    const contributingContent = `# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a App Fútbol Expo! Esta guía te ayudará a empezar.

## 🚀 Primeros Pasos

### Prerrequisitos
- Node.js (v18 o superior)
- npm o yarn
- Expo CLI
- Git

### Configuración del Entorno
1. Fork el repositorio
2. Clona tu fork localmente
3. Instala las dependencias:
   \`\`\`bash
   npm install
   \`\`\`
4. Ejecuta la aplicación:
   \`\`\`bash
   npx expo start
   \`\`\`

## 🧪 Testing

Antes de enviar un PR, asegúrate de que todo funcione:

\`\`\`bash
# Tests unitarios
npm test

# Validación completa del sistema
node scripts/simulador-robusto-final.js

# Suite de tests completa
node scripts/super-tester.js
\`\`\`

## 📝 Proceso de Contribución

1. **Crear una rama** para tu feature:
   \`\`\`bash
   git checkout -b feature/descripcion-del-cambio
   \`\`\`

2. **Realizar cambios** siguiendo las convenciones del proyecto

3. **Escribir tests** para tu código nuevo

4. **Ejecutar tests** para asegurar que todo funciona

5. **Commit con mensaje descriptivo**:
   \`\`\`bash
   git commit -m "feat: agregar nueva funcionalidad X"
   \`\`\`

6. **Push a tu fork**:
   \`\`\`bash
   git push origin feature/descripcion-del-cambio
   \`\`\`

7. **Crear Pull Request** con descripción detallada

## 📋 Estándares de Código

### Convenciones de Nombres
- **Archivos**: kebab-case (\`mi-componente.tsx\`)
- **Componentes**: PascalCase (\`MiComponente\`)
- **Variables/funciones**: camelCase (\`miFuncion\`)
- **Constantes**: UPPER_SNAKE_CASE (\`MI_CONSTANTE\`)

### TypeScript
- Usar tipado estricto
- Definir interfaces para objetos complejos
- Evitar \`any\`, usar tipos específicos

### Estructura de Componentes
\`\`\`typescript
// Imports
import React from 'react';
import { View, Text } from 'react-native';

// Types
interface MiComponenteProps {
  titulo: string;
  onPress?: () => void;
}

// Component
export default function MiComponente({ titulo, onPress }: MiComponenteProps) {
  // Hooks
  // Functions
  // Render
  return (
    <View>
      <Text>{titulo}</Text>
    </View>
  );
}
\`\`\`

## 🐛 Reportar Bugs

Usa las GitHub Issues con:
- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si aplica
- Versión del sistema/dispositivo

## 💡 Sugerir Features

Para nuevas funcionalidades:
- Descripción detallada de la feature
- Caso de uso y beneficio
- Mockups o wireframes si es posible
- Consideraciones técnicas

## 📚 Áreas de Contribución

### 🎯 Funcionalidades Priorizadas
- Nuevos tipos de torneos (eliminatoria simple, todos vs todos)
- Mejoras en la UI/UX
- Optimización de rendimiento
- Features de estadísticas avanzadas

### 🔧 Áreas Técnicas
- Testing (aumentar cobertura)
- Documentación
- Accesibilidad
- Internacionalización (i18n)

## ❓ ¿Necesitas Ayuda?

- Revisa la documentación en \`docs/\`
- Ejecuta \`node scripts/super-tester.js\` para validar
- Abre una GitHub Issue con la etiqueta "question"

## 🎉 Reconocimientos

Todos los contribuidores serán reconocidos en el README y releases.

¡Gracias por hacer que App Fútbol Expo sea mejor para toda la comunidad! ⚽
`;

    fs.writeFileSync('CONTRIBUTING.md', contributingContent);
    console.log("✅ CONTRIBUTING.md creado");
}

function prepararPackageJson() {
    console.log("\n📦 Actualizando package.json...");

    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

        // Agregar scripts útiles
        packageJson.scripts = {
            ...packageJson.scripts,
            "dev": "npx expo start",
            "web": "npx expo start --web",
            "test": "jest",
            "test:watch": "jest --watch",
            "lint": "eslint .",
            "lint:fix": "eslint . --fix",
            "populate-players": "node scripts/agregar-jugadores.js",
            "test-system": "node scripts/simulador-robusto-final.js",
            "validate": "node scripts/super-tester.js"
        };

        // Agregar información del repositorio
        packageJson.repository = {
            type: "git",
            url: "git+https://github.com/vvvfbo/app-futbol-expo.git"
        };

        packageJson.bugs = {
            url: "https://github.com/vvvfbo/app-futbol-expo/issues"
        };

        packageJson.homepage = "https://github.com/vvvfbo/app-futbol-expo#readme";

        packageJson.keywords = [
            "react-native",
            "expo",
            "futbol",
            "torneos",
            "deportes",
            "mobile-app",
            "typescript"
        ];

        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        console.log("✅ package.json actualizado");
    } catch (error) {
        console.log("❌ Error actualizando package.json:", error.message);
    }
}

function mostrarComandosGit() {
    console.log("\n📋 Comandos sugeridos para subir a GitHub:");
    console.log("\n# 1. Agregar todos los cambios:");
    console.log("git add .");
    console.log("\n# 2. Hacer commit:");
    console.log('git commit -m "feat: proyecto limpio y organizado para GitHub"');
    console.log("\n# 3. Configurar repositorio remoto (si es necesario):");
    console.log("git remote add origin https://github.com/tu-usuario/app-futbol-expo.git");
    console.log("\n# 4. Subir a GitHub:");
    console.log("git push -u origin main");
    console.log("\n# 5. Para futuras actualizaciones:");
    console.log("git push origin main");
}

function ejecutarPreparacion() {
    console.log("🎯 Iniciando preparación final...\n");

    // Actualizar archivos del proyecto
    actualizarGitignore();
    crearArchivoLicense();
    crearArchivoContributing();
    prepararPackageJson();

    // Verificar estado de Git
    const hayCambios = verificarGit();

    console.log("\n🎉 ¡Preparación completada!");
    console.log("📁 El proyecto está listo para GitHub");

    if (hayCambios) {
        mostrarComandosGit();
    } else {
        console.log("\n✅ No hay cambios pendientes para commit");
    }

    console.log("\n📊 Resumen final:");
    console.log("   ✅ Proyecto limpio y organizado");
    console.log("   ✅ README.md actualizado");
    console.log("   ✅ .gitignore configurado");
    console.log("   ✅ LICENSE añadido");
    console.log("   ✅ CONTRIBUTING.md creado");
    console.log("   ✅ package.json optimizado");
    console.log("   ✅ Scripts de desarrollo organizados");
    console.log("   ✅ Documentación completa");
}

ejecutarPreparacion();