# 📁 Estructura del Proyecto

## 🚀 Aplicación Principal
```
app/                    # Pantallas de la aplicación (React Native/Expo)
components/             # Componentes reutilizables
hooks/                  # Custom hooks para estado y lógica
utils/                  # Utilidades y funciones helper
types/                  # Definiciones TypeScript
constants/              # Constantes y configuraciones
config/                 # Configuración (Firebase, etc.)
assets/                 # Imágenes y recursos estáticos
```

## 🧪 Testing y Desarrollo
```
__tests__/             # Tests unitarios
scripts/               # Scripts de desarrollo y testing
  ├── agregar-jugadores.js          # Script para poblar equipos con jugadores
  ├── simulador-torneos-completos.js # Simulador básico de torneos
  ├── simulador-robusto-final.js    # Simulador avanzado con múltiples configuraciones
  ├── validador-app-real.js         # Validador de integración con AsyncStorage
  ├── generate-test-data.js         # Generador de datos de prueba
  └── super-tester.js               # Suite de tests completa
```

## 📚 Documentación
```
docs/                  # Documentación del proyecto
  ├── REPORTE_FINAL_SIMULACIONES.md    # Reporte de validaciones completas
  ├── FINAL_INTERFACE_COMPLETION_REPORT.md
  ├── INTERFACE_SUPERCHARGE_REPORT.md
  └── TESTING.md                        # Guía de testing
```

## ⚙️ Configuración
```
package.json           # Dependencias y scripts npm
app.json              # Configuración de Expo
babel.config.js       # Configuración de Babel
tsconfig.json         # Configuración de TypeScript
eslint.config.js      # Configuración de ESLint
jest.config.js        # Configuración de Jest
.gitignore            # Archivos ignorados por Git
```

## 🎯 Características Principales

### ✅ Gestión de Torneos
- Creación y configuración de torneos
- Inscripción de equipos
- Sorteo automático de grupos
- Generación de calendario de partidos

### ✅ Sistema de Partidos
- Simulación de partidos
- Registro de resultados
- Cálculo automático de clasificaciones
- Generación de eliminatorias

### ✅ Gestión de Equipos y Jugadores
- CRUD completo de equipos
- Gestión de plantillas de jugadores
- Estadísticas individuales y de equipo
- Integración con clubes

### ✅ Tecnologías
- **Frontend**: React Native con Expo
- **Navegación**: Expo Router
- **Estado**: Context API + AsyncStorage
- **Tipado**: TypeScript
- **Testing**: Jest + Scripts de validación
- **Backend**: Firebase (configurado)

### ✅ Validación Completa
- **9 torneos** simulados exitosamente
- **111 partidos** con resultados realistas  
- **571+ jugadores** generados
- **Todas las funcionalidades** validadas

## 🚀 Comandos Principales

```bash
# Iniciar aplicación
npm start
npx expo start

# Ejecutar tests
npm test

# Scripts de desarrollo
node scripts/agregar-jugadores.js          # Poblar con jugadores
node scripts/simulador-robusto-final.js    # Validar sistema completo
node scripts/super-tester.js               # Suite de tests
```
