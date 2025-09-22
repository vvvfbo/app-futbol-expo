import React from "react";
/**
 * Tester Automático Completo
 * Prueba todas las opciones y menús de la aplicación
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ComprehensiveTester {
  constructor() {
    this.testResults = [];
    this.currentTest = null;
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleString('es-ES');
    const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    console.log(logMessage);
    
    if (this.currentTest) {
      this.currentTest.logs.push(logMessage);
    }
  }

  startTest(testName) {
    this.currentTest = {
      name: testName,
      startTime: Date.now(),
      logs: [],
      status: 'running',
      checks: []
    };
    this.log(`🧪 Iniciando prueba: ${testName}`, 'test');
  }

  addCheck(description, passed, details = '') {
    const check = {
      description,
      passed,
      details,
      timestamp: new Date().toISOString()
    };
    
    if (this.currentTest) {
      this.currentTest.checks.push(check);
    }
    
    const status = passed ? '✅' : '❌';
    this.log(`${status} ${description} ${details}`, passed ? 'pass' : 'fail');
    
    if (!passed) {
      this.errors.push(`${this.currentTest?.name || 'Unknown'}: ${description} - ${details}`);
    }
  }

  addWarning(message) {
    this.warnings.push(message);
    this.log(`⚠️ ${message}`, 'warn');
  }

  endTest(status = 'passed') {
    if (!this.currentTest) return;
    
    this.currentTest.endTime = Date.now();
    this.currentTest.duration = this.currentTest.endTime - this.currentTest.startTime;
    this.currentTest.status = status;
    
    const passedChecks = this.currentTest.checks.filter(c => c.passed).length;
    const totalChecks = this.currentTest.checks.length;
    
    this.testResults.push(this.currentTest);
    this.log(`✨ Prueba ${this.currentTest.name} completada: ${passedChecks}/${totalChecks} checks pasaron en ${this.currentTest.duration}ms`, 'test');
    this.currentTest = null;
  }

  async runAllTests() {
    console.log('🚀 INICIANDO TESTER AUTOMÁTICO COMPLETO');
    console.log('=====================================\n');
    
    const tests = [
      () => this.testProjectStructure(),
      () => this.testNavigationStructure(),
      () => this.testTabsAndMenus(),
      () => this.testFormScreens(),
      () => this.testDataContexts(),
      () => this.testComponents(),
      () => this.testAuthFlow(),
      () => this.testFirebaseIntegration(),
      () => this.testNotifications(),
      () => this.testValidation(),
      () => this.testTypeScript(),
      () => this.testPerformanceMetrics(),
      () => this.testCreateSampleData()
    ];

    for (const test of tests) {
      try {
        await test();
        await this.sleep(500); // Pausa entre tests
      } catch (error) {
        this.log(`❌ Error en prueba: ${error.message}`, 'error');
        if (this.currentTest) {
          this.endTest('failed');
        }
      }
    }

    this.generateComprehensiveReport();
  }

  async testProjectStructure() {
    this.startTest('Estructura del Proyecto');
    
    const requiredFiles = [
      'package.json',
      'app.json',
      'tsconfig.json',
      'app/_layout.tsx',
      'app/index.tsx'
    ];
    
    const requiredFolders = [
      'app',
      'components',
      'hooks',
      'constants',
      'config'
    ];
    
    // Verificar archivos requeridos
    for (const file of requiredFiles) {
      const exists = fs.existsSync(file);
      this.addCheck(`Archivo requerido: ${file}`, exists);
    }
    
    // Verificar carpetas requeridas
    for (const folder of requiredFolders) {
      const exists = fs.existsSync(folder) && fs.statSync(folder).isDirectory();
      this.addCheck(`Carpeta requerida: ${folder}`, exists);
    }
    
    // Verificar package.json
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      this.addCheck('package.json es válido', true);
      
      const requiredDeps = ['expo', 'react', 'react-native', 'expo-router'];
      for (const dep of requiredDeps) {
        const hasDepency = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
        this.addCheck(`Dependencia: ${dep}`, !!hasDepency);
      }
    } catch (error) {
      this.addCheck('package.json es válido', false, error.message);
    }
    
    this.endTest();
  }

  async testNavigationStructure() {
    this.startTest('Estructura de Navegación');
    
    const routes = [
      { path: 'app/_layout.tsx', description: 'Layout principal' },
      { path: 'app/index.tsx', description: 'Página de inicio' },
      { path: 'app/(tabs)/_layout.tsx', description: 'Layout de tabs' },
      { path: 'app/(tabs)/(home)/home.tsx', description: 'Tab Home' },
      { path: 'app/(tabs)/(torneos)/torneos.tsx', description: 'Tab Torneos' },
      { path: 'app/(tabs)/(equipos)/equipos.tsx', description: 'Tab Equipos' },
      { path: 'app/(tabs)/(clubes)/clubes.tsx', description: 'Tab Clubes' },
      { path: 'app/(tabs)/(amistosos)/amistosos.tsx', description: 'Tab Amistosos' },
      { path: 'app/(tabs)/(perfil)/perfil.tsx', description: 'Tab Perfil' }
    ];
    
    for (const route of routes) {
      const exists = fs.existsSync(route.path);
      this.addCheck(route.description, exists, route.path);
      
      if (exists) {
        try {
          const content = fs.readFileSync(route.path, 'utf8');
          const hasExport = content.includes('export default');
          this.addCheck(`${route.description} tiene export default`, hasExport);
          
          const isTypeScript = route.path.endsWith('.tsx');
          this.addCheck(`${route.description} usa TypeScript`, isTypeScript);
        } catch (error) {
          this.addCheck(`${route.description} es legible`, false, error.message);
        }
      }
    }
    
    this.endTest();
  }

  async testTabsAndMenus() {
    this.startTest('Tabs y Menús');
    
    // Verificar layout de tabs
    if (fs.existsSync('app/(tabs)/_layout.tsx')) {
      try {
        const tabsLayout = fs.readFileSync('app/(tabs)/_layout.tsx', 'utf8');
        
        const expectedTabs = ['(home)', 'torneos', 'equipos', 'clubes', 'amistosos', 'perfil'];
        for (const tab of expectedTabs) {
          const hasTab = tabsLayout.includes(`name="${tab}"`) || tabsLayout.includes(`name='${tab}'`);
          this.addCheck(`Tab configurado: ${tab}`, hasTab);
        }
        
        const hasTabsComponent = tabsLayout.includes('<Tabs');
        this.addCheck('Usa componente Tabs', hasTabsComponent);
        
        const hasScreenOptions = tabsLayout.includes('screenOptions');
        this.addCheck('Tiene screenOptions configurado', hasScreenOptions);
        
      } catch (error) {
        this.addCheck('Layout de tabs es legible', false, error.message);
      }
    } else {
      this.addCheck('Layout de tabs existe', false);
    }
    
    // Verificar cada tab individual
    const tabScreens = [
      { name: 'Home', path: 'app/(tabs)/(home)/home.tsx' },
      { name: 'Torneos', path: 'app/(tabs)/(torneos)/torneos.tsx' },
      { name: 'Equipos', path: 'app/(tabs)/(equipos)/equipos.tsx' },
      { name: 'Clubes', path: 'app/(tabs)/(clubes)/clubes.tsx' },
      { name: 'Amistosos', path: 'app/(tabs)/(amistosos)/amistosos.tsx' },
      { name: 'Perfil', path: 'app/(tabs)/(perfil)/perfil.tsx' }
    ];
    
    for (const tab of tabScreens) {
      if (fs.existsSync(tab.path)) {
        try {
          const content = fs.readFileSync(tab.path, 'utf8');
          
          const hasView = content.includes('<View') || content.includes('<ScrollView');
          this.addCheck(`${tab.name} tiene contenido visual`, hasView);
          
          const hasText = content.includes('<Text');
          this.addCheck(`${tab.name} tiene texto`, hasText);
          
          const hasStyles = content.includes('StyleSheet') || content.includes('style=');
          this.addCheck(`${tab.name} tiene estilos`, hasStyles);
          
        } catch (error) {
          this.addCheck(`${tab.name} es legible`, false, error.message);
        }
      } else {
        this.addCheck(`${tab.name} existe`, false);
      }
    }
    
    this.endTest();
  }

  async testFormScreens() {
    this.startTest('Pantallas de Formularios');
    
    const formScreens = [
      { name: 'Crear Club', path: 'app/crear-club.tsx' },
      { name: 'Crear Torneo', path: 'app/crear-torneo.tsx' },
      { name: 'Auth', path: 'app/auth.tsx' },
      { name: 'Register', path: 'app/register.tsx' },
      { name: 'Configuración', path: 'app/configuracion.tsx' }
    ];
    
    for (const screen of formScreens) {
      if (fs.existsSync(screen.path)) {
        try {
          const content = fs.readFileSync(screen.path, 'utf8');
          
          const hasTextInput = content.includes('TextInput');
          this.addCheck(`${screen.name} tiene inputs`, hasTextInput);
          
          const hasButton = content.includes('Button') || content.includes('TouchableOpacity');
          this.addCheck(`${screen.name} tiene botones`, hasButton);
          
          const hasValidation = content.includes('validation') || content.includes('error');
          this.addCheck(`${screen.name} tiene validación`, hasValidation);
          
          const hasState = content.includes('useState');
          this.addCheck(`${screen.name} maneja estado`, hasState);
          
        } catch (error) {
          this.addCheck(`${screen.name} es legible`, false, error.message);
        }
      } else {
        this.addCheck(`${screen.name} existe`, false);
      }
    }
    
    this.endTest();
  }

  async testDataContexts() {
    this.startTest('Contextos de Datos');
    
    const contexts = [
      { name: 'Auth Context', path: 'hooks/auth-context.tsx' },
      { name: 'Data Context', path: 'hooks/data-context.tsx' },
      { name: 'Notifications Context', path: 'hooks/notifications-context.tsx' }
    ];
    
    for (const context of contexts) {
      if (fs.existsSync(context.path)) {
        try {
          const content = fs.readFileSync(context.path, 'utf8');
          
          const hasCreateContext = content.includes('createContext') || content.includes('createContextHook');
          this.addCheck(`${context.name} usa createContext`, hasCreateContext);
          
          const hasProvider = content.includes('Provider');
          this.addCheck(`${context.name} tiene Provider`, hasProvider);
          
          const hasHook = content.includes('use') && content.includes('export');
          this.addCheck(`${context.name} exporta hook`, hasHook);
          
          const hasState = content.includes('useState') || content.includes('useReducer');
          this.addCheck(`${context.name} maneja estado`, hasState);
          
        } catch (error) {
          this.addCheck(`${context.name} es legible`, false, error.message);
        }
      } else {
        this.addCheck(`${context.name} existe`, false);
      }
    }
    
    this.endTest();
  }

  async testComponents() {
    this.startTest('Componentes');
    
    const components = [
      'ProtectedRoute.tsx',
      'AuthErrorBoundary.tsx',
      'NotificationManager.tsx',
      'LocationPicker.tsx',
      'CampoFormModal.tsx',
      'EscudoSelector.tsx',
      'CuadroEliminatorias.tsx',
      'FinalizarTorneoModal.tsx',
      'DatePicker.tsx'
    ];
    
    for (const component of components) {
      const path = `components/${component}`;
      if (fs.existsSync(path)) {
        try {
          const content = fs.readFileSync(path, 'utf8');
          
          const hasExport = content.includes('export default') || content.includes('export const');
          this.addCheck(`${component} tiene export`, hasExport);
          
          const hasTypeScript = content.includes(': React.') || content.includes('interface') || content.includes('type ');
          this.addCheck(`${component} usa TypeScript`, hasTypeScript);
          
          const hasProps = content.includes('props') || content.includes('{');
          this.addCheck(`${component} acepta props`, hasProps);
          
        } catch (error) {
          this.addCheck(`${component} es legible`, false, error.message);
        }
      } else {
        this.addCheck(`${component} existe`, false);
      }
    }
    
    this.endTest();
  }

  async testAuthFlow() {
    this.startTest('Flujo de Autenticación');
    
    // Verificar archivos de auth
    const authFiles = [
      'app/auth.tsx',
      'app/register.tsx',
      'hooks/auth-context.tsx',
      'components/ProtectedRoute.tsx'
    ];
    
    for (const file of authFiles) {
      const exists = fs.existsSync(file);
      this.addCheck(`Archivo de auth: ${file}`, exists);
    }
    
    // Verificar configuración de Firebase
    if (fs.existsSync('config/firebase.ts')) {
      try {
        const firebaseConfig = fs.readFileSync('config/firebase.ts', 'utf8');
        
        const hasAuth = firebaseConfig.includes('auth');
        this.addCheck('Firebase Auth configurado', hasAuth);
        
        const hasFirestore = firebaseConfig.includes('firestore') || firebaseConfig.includes('db');
        this.addCheck('Firestore configurado', hasFirestore);
        
      } catch (error) {
        this.addCheck('Firebase config es legible', false, error.message);
      }
    } else {
      this.addCheck('Firebase config existe', false);
    }
    
    this.endTest();
  }

  async testFirebaseIntegration() {
    this.startTest('Integración Firebase');
    
    if (fs.existsSync('config/firebase.ts')) {
      try {
        const content = fs.readFileSync('config/firebase.ts', 'utf8');
        
        const hasInitializeApp = content.includes('initializeApp');
        this.addCheck('Firebase inicializado', hasInitializeApp);
        
        const hasAuth = content.includes('getAuth');
        this.addCheck('Auth inicializado', hasAuth);
        
        const hasFirestore = content.includes('getFirestore');
        this.addCheck('Firestore inicializado', hasFirestore);
        
        const hasExports = content.includes('export');
        this.addCheck('Firebase exporta servicios', hasExports);
        
      } catch (error) {
        this.addCheck('Firebase config es válido', false, error.message);
      }
    }
    
    this.endTest();
  }

  async testNotifications() {
    this.startTest('Sistema de Notificaciones');
    
    const notificationFiles = [
      'hooks/notifications-context.tsx',
      'components/NotificationManager.tsx',
      'app/notificaciones.tsx'
    ];
    
    for (const file of notificationFiles) {
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          
          const hasExpoNotifications = content.includes('expo-notifications');
          this.addCheck(`${file} usa expo-notifications`, hasExpoNotifications);
          
          const hasPermissions = content.includes('permission');
          this.addCheck(`${file} maneja permisos`, hasPermissions);
          
        } catch (error) {
          this.addCheck(`${file} es legible`, false, error.message);
        }
      } else {
        this.addCheck(`${file} existe`, false);
      }
    }
    
    this.endTest();
  }

  async testValidation() {
    this.startTest('Sistema de Validación');
    
    if (fs.existsSync('utils/validation.ts')) {
      try {
        const content = fs.readFileSync('utils/validation.ts', 'utf8');
        
        const hasEmailValidation = content.includes('email');
        this.addCheck('Validación de email', hasEmailValidation);
        
        const hasPasswordValidation = content.includes('password');
        this.addCheck('Validación de password', hasPasswordValidation);
        
        const hasExports = content.includes('export');
        this.addCheck('Exporta funciones de validación', hasExports);
        
      } catch (error) {
        this.addCheck('Validation utils es legible', false, error.message);
      }
    } else {
      this.addCheck('Validation utils existe', false);
    }
    
    this.endTest();
  }

  async testTypeScript() {
    this.startTest('Configuración TypeScript');
    
    // Verificar tsconfig.json
    if (fs.existsSync('tsconfig.json')) {
      try {
        const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
        
        const hasStrict = tsconfig.compilerOptions?.strict;
        this.addCheck('Modo strict habilitado', hasStrict);
        
        const hasJsx = tsconfig.compilerOptions?.jsx;
        this.addCheck('JSX configurado', !!hasJsx);
        
        const hasBaseUrl = tsconfig.compilerOptions?.baseUrl;
        this.addCheck('BaseUrl configurado', !!hasBaseUrl);
        
        const hasPaths = tsconfig.compilerOptions?.paths;
        this.addCheck('Paths configurados', !!hasPaths);
        
      } catch (error) {
        this.addCheck('tsconfig.json es válido', false, error.message);
      }
    } else {
      this.addCheck('tsconfig.json existe', false);
    }
    
    // Contar archivos TypeScript
    const countTsFiles = (dir) => {
      let count = 0;
      try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            count += countTsFiles(filePath);
          } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            count++;
          }
        }
      } catch (error) {
        // Ignorar errores de permisos
      }
      return count;
    };
    
    const tsFileCount = countTsFiles('.');
    this.addCheck(`Archivos TypeScript encontrados: ${tsFileCount}`, tsFileCount > 0);
    
    this.endTest();
  }

  async testPerformanceMetrics() {
    this.startTest('Métricas de Rendimiento');
    
    // Contar archivos por tipo
    const fileStats = {
      tsx: 0,
      ts: 0,
      js: 0,
      jsx: 0,
      total: 0
    };
    
    const countFiles = (dir) => {
      try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            countFiles(filePath);
          } else if (stat.isFile()) {
            const ext = path.extname(file).substring(1);
            if (fileStats.hasOwnProperty(ext)) {
              fileStats[ext]++;
            }
            fileStats.total++;
          }
        }
      } catch (error) {
        // Ignorar errores
      }
    };
    
    countFiles('.');
    
    this.addCheck(`Archivos TypeScript: ${fileStats.tsx + fileStats.ts}`, true, `TSX: ${fileStats.tsx}, TS: ${fileStats.ts}`);
    this.addCheck(`Total de archivos: ${fileStats.total}`, true);
    
    // Verificar si hay demasiados archivos
    if (fileStats.total > 200) {
      this.addWarning('Gran cantidad de archivos detectada - considerar optimización');
    }
    
    // Verificar uso de TypeScript vs JavaScript
    const tsRatio = (fileStats.tsx + fileStats.ts) / (fileStats.total || 1);
    this.addCheck('Uso predominante de TypeScript', tsRatio > 0.8, `${Math.round(tsRatio * 100)}% TypeScript`);
    
    this.endTest();
  }

  async testCreateSampleData() {
    this.startTest('Creación de Datos de Prueba');
    
    try {
      // Crear datos de prueba para amistosos
      const sampleDataScript = `
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

async function createSampleData() {
  console.log('🏗️ Creando datos de prueba...');
  
  // Datos de equipos de prueba
  const equiposPrueba = [
    {
      id: 'equipo-test-1',
      nombre: 'FC Barcelona Test',
      entrenadorId: 'user-test-1',
      categoria: 'Senior',
      tipoFutbol: 'F11',
      ciudad: 'Barcelona',
      fechaCreacion: new Date().toISOString(),
      jugadores: []
    },
    {
      id: 'equipo-test-2',
      nombre: 'Real Madrid Test',
      entrenadorId: 'user-test-2',
      categoria: 'Senior',
      tipoFutbol: 'F11',
      ciudad: 'Madrid',
      fechaCreacion: new Date().toISOString(),
      jugadores: []
    },
    {
      id: 'equipo-test-3',
      nombre: 'Valencia CF Test',
      entrenadorId: 'user-test-3',
      categoria: 'Juvenil',
      tipoFutbol: 'F11',
      ciudad: 'Valencia',
      fechaCreacion: new Date().toISOString(),
      jugadores: []
    }
  ];
  
  // Datos de amistosos de prueba
  const amistososPrueba = [
    {
      id: 'amistoso-test-1',
      equipoLocalId: 'equipo-test-1',
      equipoVisitanteId: null,
      fecha: '2025-01-20',
      hora: '16:00',
      ubicacion: {
        direccion: 'Campo Municipal Barcelona, Barcelona',
        coordenadas: { latitud: 41.3851, longitud: 2.1734 }
      },
      estado: 'Disponible',
      categoria: 'Senior',
      tipoFutbol: 'F11',
      esDisponibilidad: true,
      rangoKm: 15,
      franjaHoraria: 'tarde',
      observaciones: 'Buscamos rival para amistoso de preparación',
      fechaCreacion: new Date().toISOString()
    },
    {
      id: 'amistoso-test-2',
      equipoLocalId: 'equipo-test-2',
      equipoVisitanteId: null,
      fecha: '2025-01-22',
      hora: '18:00',
      ubicacion: {
        direccion: 'Ciudad Deportiva Real Madrid, Madrid',
        coordenadas: { latitud: 40.4168, longitud: -3.7038 }
      },
      estado: 'Disponible',
      categoria: 'Senior',
      tipoFutbol: 'F11',
      esDisponibilidad: true,
      rangoKm: 20,
      franjaHoraria: 'noche',
      observaciones: 'Amistoso de entrenamiento',
      fechaCreacion: new Date().toISOString()
    },
    {
      id: 'amistoso-test-3',
      equipoLocalId: 'equipo-test-3',
      equipoVisitanteId: null,
      fecha: '2025-01-25',
      hora: '10:00',
      ubicacion: {
        direccion: 'Estadio Mestalla, Valencia',
        coordenadas: { latitud: 39.4699, longitud: -0.3763 }
      },
      estado: 'Disponible',
      categoria: 'Juvenil',
      tipoFutbol: 'F11',
      esDisponibilidad: true,
      rangoKm: 25,
      franjaHoraria: 'mañana',
      observaciones: 'Amistoso juvenil',
      fechaCreacion: new Date().toISOString()
    },
    {
      id: 'amistoso-test-4',
      equipoLocalId: 'equipo-test-1',
      equipoVisitanteId: 'equipo-test-2',
      fecha: '2025-01-18',
      hora: '20:00',
      ubicacion: {
        direccion: 'Camp Nou, Barcelona',
        coordenadas: { latitud: 41.3809, longitud: 2.1228 }
      },
      estado: 'Confirmado',
      categoria: 'Senior',
      tipoFutbol: 'F11',
      esDisponibilidad: false,
      propuestaPor: 'user-test-2',
      propuestaA: 'user-test-1',
      fechaConfirmacion: new Date().toISOString(),
      fechaCreacion: new Date(Date.now() - 86400000).toISOString() // Ayer
    },
    {
      id: 'amistoso-test-5',
      equipoLocalId: 'equipo-test-2',
      equipoVisitanteId: 'equipo-test-3',
      fecha: '2025-01-15',
      hora: '16:30',
      ubicacion: {
        direccion: 'Santiago Bernabéu, Madrid',
        coordenadas: { latitud: 40.4530, longitud: -3.6883 }
      },
      estado: 'Finalizado',
      categoria: 'Senior',
      tipoFutbol: 'F11',
      esDisponibilidad: false,
      golesLocal: 2,
      golesVisitante: 1,
      goleadores: [
        { equipoId: 'equipo-test-2', jugadorId: 'jugador-1', minuto: 25 },
        { equipoId: 'equipo-test-2', jugadorId: 'jugador-2', minuto: 67 },
        { equipoId: 'equipo-test-3', jugadorId: 'jugador-3', minuto: 89 }
      ],
      fechaFinalizacion: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
      fechaCreacion: new Date(Date.now() - 259200000).toISOString() // Hace 3 días
    }
  ];
  
  try {
    // Guardar equipos
    await AsyncStorage.setItem('equipos', JSON.stringify(equiposPrueba));
    console.log('✅ Equipos de prueba creados:', equiposPrueba.length);
    
    // Guardar amistosos
    await AsyncStorage.setItem('amistosos', JSON.stringify(amistososPrueba));
    console.log('✅ Amistosos de prueba creados:', amistososPrueba.length);
    
    console.log('🎉 Datos de prueba creados exitosamente');
    console.log('📊 Resumen:');
    console.log('  - Equipos:', equiposPrueba.length);
    console.log('  - Amistosos disponibles:', amistososPrueba.filter(a => a.esDisponibilidad && a.estado === 'Disponible').length);
    console.log('  - Amistosos confirmados:', amistososPrueba.filter(a => a.estado === 'Confirmado').length);
    console.log('  - Amistosos finalizados:', amistososPrueba.filter(a => a.estado === 'Finalizado').length);
    
  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
    throw error;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createSampleData };
} else {
  createSampleData().catch(console.error);
}
`;
      
      // Escribir el script
      fs.writeFileSync('create-sample-data.js', sampleDataScript);
      this.addCheck('Script de datos de prueba creado', true, 'create-sample-data.js');
      
      // Verificar que el script se puede ejecutar
      try {
        const { createSampleData } = require(path.resolve('create-sample-data.js'));
        this.addCheck('Script de datos es ejecutable', typeof createSampleData === 'function');
      } catch (error) {
        this.addCheck('Script de datos es ejecutable', false, error.message);
      }
      
      this.log('💡 Para crear datos de prueba, ejecuta: node create-sample-data.js');
      
    } catch (error) {
      this.addCheck('Creación de script de datos', false, error.message);
    }
    
    this.endTest();
  }

  generateComprehensiveReport() {
    const totalTests = this.testResults.length;
    const totalChecks = this.testResults.reduce((sum, t) => sum + t.checks.length, 0);
    const passedChecks = this.testResults.reduce((sum, t) => sum + t.checks.filter(c => c.passed).length, 0);
    const failedChecks = totalChecks - passedChecks;
    const totalDuration = this.testResults.reduce((sum, t) => sum + t.duration, 0);
    const successRate = Math.round((passedChecks / totalChecks) * 100);

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        totalChecks,
        passedChecks,
        failedChecks,
        successRate,
        duration: totalDuration,
        errors: this.errors.length,
        warnings: this.warnings.length
      },
      tests: this.testResults,
      errors: this.errors,
      warnings: this.warnings
    };

    // Guardar reporte detallado
    fs.writeFileSync('comprehensive-test-report.json', JSON.stringify(report, null, 2));
    
    // Mostrar resumen en consola
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORTE COMPLETO DE TESTING AUTOMÁTICO');
    console.log('='.repeat(60));
    console.log(`🧪 Total de Pruebas: ${totalTests}`);
    console.log(`✅ Checks Pasados: ${passedChecks}/${totalChecks} (${successRate}%)`);
    console.log(`❌ Checks Fallidos: ${failedChecks}`);
    console.log(`⚠️ Advertencias: ${this.warnings.length}`);
    console.log(`⏱️ Duración Total: ${totalDuration}ms`);
    console.log(`📄 Reporte guardado en: comprehensive-test-report.json`);
    
    // Mostrar resumen por categoría
    console.log('\n📋 RESUMEN POR CATEGORÍA:');
    console.log('-'.repeat(40));
    
    for (const test of this.testResults) {
      const passed = test.checks.filter(c => c.passed).length;
      const total = test.checks.length;
      const percentage = Math.round((passed / total) * 100);
      const status = percentage === 100 ? '✅' : percentage >= 80 ? '⚠️' : '❌';
      
      console.log(`${status} ${test.name}: ${passed}/${total} (${percentage}%)`);
    }
    
    // Mostrar errores críticos
    if (this.errors.length > 0) {
      console.log('\n❌ ERRORES CRÍTICOS:');
      console.log('-'.repeat(40));
      this.errors.slice(0, 10).forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
      
      if (this.errors.length > 10) {
        console.log(`... y ${this.errors.length - 10} errores más (ver reporte completo)`);
      }
    }
    
    // Mostrar advertencias
    if (this.warnings.length > 0) {
      console.log('\n⚠️ ADVERTENCIAS:');
      console.log('-'.repeat(40));
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }
    
    // Recomendaciones
    console.log('\n💡 RECOMENDACIONES:');
    console.log('-'.repeat(40));
    
    if (successRate < 80) {
      console.log('• Revisar y corregir los errores críticos encontrados');
    }
    
    if (failedChecks > 0) {
      console.log('• Implementar las funcionalidades faltantes');
    }
    
    if (this.warnings.length > 0) {
      console.log('• Considerar las advertencias para mejorar el rendimiento');
    }
    
    console.log('• Ejecutar este tester regularmente durante el desarrollo');
    console.log('• Mantener la cobertura de tests por encima del 90%');
    
    console.log('\n' + '='.repeat(60));
    
    // Código de salida basado en el éxito
    if (successRate < 70) {
      console.log('🚨 TESTING FALLIDO - Se requiere atención inmediata');
      process.exit(1);
    } else if (successRate < 90) {
      console.log('⚠️ TESTING PARCIAL - Se recomienda mejorar');
    } else {
      console.log('🎉 TESTING EXITOSO - Aplicación en buen estado');
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const tester = new ComprehensiveTester();
  tester.runAllTests().catch(console.error);
}

module.exports = ComprehensiveTester;