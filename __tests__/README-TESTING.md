# 🧪 Sistema de Testing Completo - Torneos de Fútbol

Este sistema de testing completo está diseñado para validar todas las funcionalidades de tu aplicación React Native de torneos de fútbol.

## 📋 Estructura de Tests

```
__tests__/
├── unit/                    # Tests unitarios
│   ├── equipos.test.tsx     # Creación, edición, borrado de equipos
│   ├── torneos.test.tsx     # Torneos, emparejamientos, clasificaciones
│   └── notificaciones.test.tsx # Control de notificaciones
├── components/              # Tests de componentes (Widget Tests)
│   └── ui-components.test.tsx # Botones, menús, responsive design
├── integration/             # Tests de integración
│   └── user-flows.test.tsx  # Flujos completos de usuario
└── e2e/                     # Tests end-to-end
    └── complete-flows.test.tsx # Flujos completos de aplicación
```

## 🚀 Cómo Ejecutar los Tests

### Opción 1: Ejecutar todos los tests (Recomendado)
```bash
node run-tests-simple.js
```

### Opción 2: Ejecutar por categorías
```bash
# Unit Tests
npx jest __tests__/unit/ --verbose

# Widget Tests
npx jest __tests__/components/ --verbose

# Integration Tests
npx jest __tests__/integration/ --verbose

# E2E Tests
npx jest __tests__/e2e/ --verbose
```

### Opción 3: Ejecutar tests específicos
```bash
# Solo equipos
npx jest __tests__/unit/equipos.test.tsx

# Solo torneos
npx jest __tests__/unit/torneos.test.tsx

# Solo notificaciones
npx jest __tests__/unit/notificaciones.test.tsx
```

### Opción 4: Con cobertura
```bash
npx jest --coverage
```

## 📊 Cobertura de Testing

### ✅ Unit Tests
- **Equipos**: Creación, edición, borrado con escudos
- **Torneos**: Grupos, eliminatorias, mixto
- **Emparejamientos**: Aleatorios y editables
- **Clasificaciones**: Puntos, diferencia de goles, ordenamiento
- **Notificaciones**: Solo al editar/terminar partidos (NO al finalizar torneo)
- **Validación**: Datos de entrada, colores, posiciones

### ✅ Widget Tests
- **Botones**: Texto completo sin cortarse
- **Menús**: Distribución sin espacios innecesarios
- **Tabs**: Partidos, Equipos, Goles, Eliminatorias
- **Títulos**: Fases redimensionadas apropiadamente
- **Mapa**: Icono funcional que abre Google Maps
- **Responsive**: Adaptación a diferentes pantallas

### ✅ Integration Tests
- **Autenticación**: Registro e inicio de sesión
- **Navegación**: Home → Torneos → Crear → Editar
- **Flujos**: Creación completa de equipos y torneos
- **Errores**: Manejo apropiado de errores
- **Performance**: Carga de datos grandes

### ✅ E2E Tests
- **Flujo completo**: Registro → Equipo → Torneo → Finalizar
- **Amistosos**: Búsqueda por localización (Móstoles 10km)
- **Chat**: Mensajes con notificaciones push
- **Exportación**: PDF y compartir por WhatsApp
- **Navegación**: Sin cuelgues ni rutas erróneas
- **Scroll**: Listas largas sin problemas

## 🎯 Funcionalidades Validadas

### ⚽ Gestión de Equipos
- ✅ Crear equipo con escudo personalizado
- ✅ Editar colores y jugadores
- ✅ Eliminar equipos
- ✅ Validación de datos (nombre, colores hex)

### 🏆 Gestión de Torneos
- ✅ Crear torneo modo grupos
- ✅ Crear torneo modo eliminatorias
- ✅ Crear torneo modo mixto (grupos + eliminatorias)
- ✅ Emparejamientos aleatorios editables
- ✅ Clasificaciones automáticas
- ✅ Finalizar torneo con podium

### 📱 Notificaciones
- ✅ Notificación al editar partido
- ✅ Notificación al terminar partido
- ❌ NO notificación al finalizar torneo (correcto)
- ✅ Control de duplicadas
- ✅ Formato de mensajes

### 🤝 Amistosos
- ✅ Buscar por localización y radio
- ✅ Proponer y aceptar amistosos
- ✅ Finalizar con resultados
- ✅ Exportar resultados

### 💬 Chat
- ✅ Enviar mensajes entre entrenadores
- ✅ Notificaciones push en tiempo real
- ✅ Historial de conversaciones

### 📄 Exportación
- ✅ Generar PDF de partidos
- ✅ Compartir por WhatsApp
- ✅ Formato profesional

## 🔧 Configuración

### Jest Configuration
- **Framework**: Jest + React Native Testing Library
- **Timeout**: 30s (unit), 60s (integration), 120s (e2e)
- **Coverage**: Mínimo 75%
- **Environment**: jsdom para compatibilidad web

### Mocks Incluidos
- ✅ Firebase (Auth, Firestore)
- ✅ AsyncStorage
- ✅ Expo modules (Location, Notifications, Haptics)
- ✅ React Navigation / Expo Router
- ✅ Lucide Icons

## 📈 Métricas de Calidad

### Cobertura Objetivo
- **Branches**: 75%
- **Functions**: 75%
- **Lines**: 75%
- **Statements**: 75%

### Performance
- **Carga inicial**: < 2 segundos
- **Navegación**: < 500ms entre pantallas
- **Scroll**: Fluido en listas de 500+ elementos
- **Torneos grandes**: 64 equipos, 200 partidos sin problemas

## 🐛 Debugging

### Si los tests fallan:
1. Verificar que todas las dependencias estén instaladas
2. Limpiar cache: `npx jest --clearCache`
3. Verificar mocks en `__tests__/setup.js`
4. Revisar logs detallados con `--verbose`

### Logs útiles:
```bash
# Ver output detallado
npx jest --verbose

# Solo errores
npx jest --silent

# Watch mode para desarrollo
npx jest --watch
```

## 📝 Agregar Nuevos Tests

### Para Unit Tests:
```typescript
// __tests__/unit/nueva-funcionalidad.test.tsx
import { useData } from '@/hooks/data-context';

jest.mock('@/hooks/data-context');

describe('Nueva Funcionalidad - Unit Tests', () => {
  test('debe hacer algo específico', () => {
    // Tu test aquí
  });
});
```

### Para Widget Tests:
```typescript
// __tests__/components/nuevo-componente.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import NuevoComponente from '@/components/NuevoComponente';

describe('Nuevo Componente - Widget Tests', () => {
  test('debe renderizar correctamente', () => {
    const { getByTestId } = render(<NuevoComponente />);
    expect(getByTestId('nuevo-componente')).toBeTruthy();
  });
});
```

## 🎉 ¡Listo para Producción!

Si todos los tests pasan, tu aplicación está lista para:
- ✅ Subir a App Store / Google Play
- ✅ Uso en producción
- ✅ Escalabilidad
- ✅ Mantenimiento a largo plazo

---

**¡Ejecuta `node run-tests-simple.js` y verifica que todo funcione perfectamente!** 🚀