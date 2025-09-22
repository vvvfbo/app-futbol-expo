# ⚽ App Fútbol - Gestión de Torneos

Aplicación completa para gestionar torneos de fútbol con cronómetro contextual integrado.

## 🎯 Características Principales

- ⚽ **Cronómetro Contextual**: Se auto-inicia según horarios programados de partidos
- 🏆 **Gestión de Torneos**: Creación y administración completa de competiciones
- 👥 **Gestión de Equipos**: Registro de equipos y jugadores
- 🤝 **Partidos Amistosos**: Organización de encuentros no competitivos
- 📊 **Seguimiento en Tiempo Real**: Marcadores, eventos y estadísticas
- 🎨 **Tema Adaptable**: Modo oscuro y claro
- 📱 **PWA Optimizada**: Instalable como app nativa en dispositivos móviles

## 🚀 Tecnologías

- **Frontend**: Expo React Native + TypeScript
- **Estado**: Context API + AsyncStorage
- **Navegación**: Expo Router
- **Estilos**: React Native StyleSheet + Linear Gradients
- **Iconos**: Lucide React Native + Expo Vector Icons

## 📱 Instalación para Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo web local
npm run start-web-local

# Desarrollo móvil (Expo Go)
npm run start-local

# Build para producción web
npm run build-web
```

## 🌐 Despliegue en Netlify

Este proyecto está configurado para despliegue automático:

- **Build Command**: `npm run build-web`
- **Publish Directory**: `dist`
- **Node Version**: 20

## 📱 Instalación en iPhone

1. Ve a la URL desplegada en Netlify
2. Abre Safari en tu iPhone
3. Toca "Compartir" → "Añadir a pantalla de inicio"
4. ¡Ya tienes tu app nativa con cronómetro contextual!

---

**Desarrollado con ❤️ usando Expo React Native**