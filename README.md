# ⚽ App Fútbol Expo - Sistema de Gestión de Torneos

Una aplicación completa para la gestión de torneos de fútbol desarrollada con React Native y Expo.

## 🎯 Características Principales

- ✅ **Gestión completa de torneos** (Fútbol 7 y Fútbol 11)
- ✅ **Sistema de sorteo inteligente** con algoritmo Fisher-Yates
- ✅ **Clasificaciones automáticas** con criterios oficiales
- ✅ **Generación automática de eliminatorias**
- ✅ **Gestión de equipos y jugadores** con estadísticas
- ✅ **Interfaz optimizada** para dispositivos móviles
- ✅ **Sistema completamente validado** (9 torneos, 111 partidos simulados)

## 🚀 Tecnologías

- **React Native** con **Expo**
- **TypeScript** para tipado estático
- **Expo Router** para navegación
- **Context API** para gestión de estado
- **AsyncStorage** para persistencia
- **Firebase** para backend (configurado)
- **Jest** para testing

## 📱 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Iniciar aplicación
npx expo start

# Para web
npx expo start --web

# Poblar con datos de prueba
node scripts/agregar-jugadores.js
```

## 🧪 Testing y Validación

```bash
# Ejecutar tests unitarios
npm test

# Validar sistema completo
node scripts/simulador-robusto-final.js

# Suite de tests completa
node scripts/super-tester.js
```

## 📊 Sistema Validado

El sistema ha sido exhaustivamente probado:

- **9 torneos** diferentes simulados
- **111 partidos** con resultados realistas
- **571+ jugadores** con datos completos
- **Múltiples formatos**: Liga, Copa, Eliminatoria
- **Diferentes modalidades**: F7 y F11

## 📁 Estructura del Proyecto

```
app/                    # Pantallas React Native
components/             # Componentes reutilizables
hooks/                  # Custom hooks
utils/                  # Utilidades
scripts/                # Scripts de desarrollo
docs/                   # Documentación
__tests__/             # Tests unitarios
```

## 🎮 Funcionalidades

### Gestión de Torneos
- Crear torneos con múltiples formatos
- Configurar grupos y eliminatorias
- Sorteo automático de equipos

### Sistema de Partidos
- Generar calendario automáticamente
- Registrar resultados en tiempo real
- Calcular clasificaciones automáticamente

### Equipos y Jugadores
- Gestión completa de plantillas
- Estadísticas individuales
- Inscripción/desinscripción flexible

## 🌐 Deployment

### Para Web (Estático)
```bash
# Generar build web
npm run build:web

# El output estará en dist/ listo para cualquier hosting estático
```

### Opciones de Hosting
- **Vercel**: `npx vercel --prod` (después del build)
- **GitHub Pages**: Subir contenido de `dist/` 
- **Firebase Hosting**: `firebase deploy`
- **Cualquier hosting estático**: Subir carpeta `dist/`

### Para Móvil
```bash
# Development
npx expo start

# Build para stores
expo build:android
expo build:ios
```

## 📚 Documentación

Ver la carpeta `docs/` para documentación detallada:
- Reportes de validación
- Guías de testing  
- Estructura del proyecto

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🎯 Estado del Proyecto

✅ **COMPLETAMENTE FUNCIONAL** - Listo para producción  
📊 **TOTALMENTE VALIDADO** - Sistema probado exhaustivamente  
🚀 **OPTIMIZADO** - Rendimiento y UX optimizados  

---

*Desarrollado con ❤️ para la comunidad del fútbol*
