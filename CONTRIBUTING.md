# 🤝 Guía de Contribución

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
   ```bash
   npm install
   ```
4. Ejecuta la aplicación:
   ```bash
   npx expo start
   ```

## 🧪 Testing

Antes de enviar un PR, asegúrate de que todo funcione:

```bash
# Tests unitarios
npm test

# Validación completa del sistema
node scripts/simulador-robusto-final.js

# Suite de tests completa
node scripts/super-tester.js
```

## 📝 Proceso de Contribución

1. **Crear una rama** para tu feature:
   ```bash
   git checkout -b feature/descripcion-del-cambio
   ```

2. **Realizar cambios** siguiendo las convenciones del proyecto

3. **Escribir tests** para tu código nuevo

4. **Ejecutar tests** para asegurar que todo funciona

5. **Commit con mensaje descriptivo**:
   ```bash
   git commit -m "feat: agregar nueva funcionalidad X"
   ```

6. **Push a tu fork**:
   ```bash
   git push origin feature/descripcion-del-cambio
   ```

7. **Crear Pull Request** con descripción detallada

## 📋 Estándares de Código

### Convenciones de Nombres
- **Archivos**: kebab-case (`mi-componente.tsx`)
- **Componentes**: PascalCase (`MiComponente`)
- **Variables/funciones**: camelCase (`miFuncion`)
- **Constantes**: UPPER_SNAKE_CASE (`MI_CONSTANTE`)

### TypeScript
- Usar tipado estricto
- Definir interfaces para objetos complejos
- Evitar `any`, usar tipos específicos

### Estructura de Componentes
```typescript
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
```

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

- Revisa la documentación en `docs/`
- Ejecuta `node scripts/super-tester.js` para validar
- Abre una GitHub Issue con la etiqueta "question"

## 🎉 Reconocimientos

Todos los contribuidores serán reconocidos en el README y releases.

¡Gracias por hacer que App Fútbol Expo sea mejor para toda la comunidad! ⚽
