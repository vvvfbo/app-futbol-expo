import { Platform } from 'react-native';

// Mock Firebase implementation for development to avoid JSON parsing errors
interface MockUser {
  uid: string;
  email: string | null;
}

interface MockUserCredential {
  user: MockUser;
}

// Simple in-memory storage for development
const mockUsers = new Map<string, any>();
const mockUserData = new Map<string, any>();
let currentUser: MockUser | null = null;
let authStateListeners: ((user: MockUser | null) => void)[] = [];

// Usuario maestro para pruebas
const MASTER_USER = {
  email: 'admin@futbolapp.com',
  password: 'admin123',
  uid: 'master-admin-uid',
  userData: {
    id: 'master-admin-uid',
    nombre: 'Admin',
    apellidos: 'Master',
    email: 'admin@futbolapp.com',
    telefono: '+34 600 000 000',
    fechaNacimiento: '1990-01-01',
    rol: 'entrenador' as const,
    ciudad: 'Madrid',
    torneosSubscritos: [],
    equiposCreados: [],
    torneosCreados: [],
    configuracion: {
      notificaciones: true,
      modoOscuro: false,
      idioma: 'es' as const
    },
    estadisticas: {
      torneosGanados: 5,
      partidosJugados: 50,
      golesAnotados: 25
    },
    fechaRegistro: '2024-01-01T00:00:00.000Z',
    ultimaActividad: new Date().toISOString()
  }
};

// Inicializar usuario maestro
mockUsers.set(MASTER_USER.email, { 
  password: MASTER_USER.password, 
  uid: MASTER_USER.uid 
});
mockUserData.set(`users/${MASTER_USER.uid}`, MASTER_USER.userData);

// Usuario de prueba adicional
const TEST_USER = {
  email: 'test@futbolapp.com',
  password: 'test123',
  uid: 'test-user-uid',
  userData: {
    id: 'test-user-uid',
    nombre: 'Usuario',
    apellidos: 'Prueba',
    email: 'test@futbolapp.com',
    telefono: '+34 600 111 222',
    fechaNacimiento: '1995-05-15',
    rol: 'espectador' as const,
    ciudad: 'Barcelona',
    torneosSubscritos: [],
    configuracion: {
      notificaciones: true,
      modoOscuro: false,
      idioma: 'es' as const
    },
    estadisticas: {
      torneosGanados: 0,
      partidosJugados: 0,
      golesAnotados: 0
    },
    fechaRegistro: '2024-01-15T00:00:00.000Z',
    ultimaActividad: new Date().toISOString()
  }
};

// Inicializar usuario de prueba
mockUsers.set(TEST_USER.email, { 
  password: TEST_USER.password, 
  uid: TEST_USER.uid 
});
mockUserData.set(`users/${TEST_USER.uid}`, TEST_USER.userData);

// Crear usuario de prueba en AsyncStorage para acceso inmediato
const createTestUser = async () => {
  try {
    const testUser = {
      id: 'master-admin-uid',
      nombre: 'Admin',
      apellidos: 'Master',
      email: 'admin@futbolapp.com',
      telefono: '+34 600 000 000',
      fechaNacimiento: '1990-01-01',
      rol: 'entrenador' as const,
      ciudad: 'Madrid',
      torneosSubscritos: [],
      equiposCreados: [],
      torneosCreados: [],
      configuracion: {
        notificaciones: true,
        modoOscuro: false,
        idioma: 'es' as const
      },
      estadisticas: {
        torneosGanados: 5,
        partidosJugados: 50,
        golesAnotados: 25
      },
      fechaRegistro: '2024-01-01T00:00:00.000Z',
      ultimaActividad: new Date().toISOString()
    };
    
    // Solo crear si no existe
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const existingUser = await AsyncStorage.getItem('currentUser');
    if (!existingUser) {
      await AsyncStorage.setItem('currentUser', JSON.stringify(testUser));
      console.log('✅ Usuario de prueba creado en AsyncStorage');
    }
  } catch (error) {
    console.log('ℹ️ No se pudo crear usuario de prueba:', error);
  }
};

// Crear usuario de prueba con delay para evitar problemas de inicialización
setTimeout(() => {
  createTestUser();
}, 1000);

console.log('👑 Usuario maestro creado:');
console.log('📧 Email: admin@futbolapp.com');
console.log('🔐 Password: admin123');
console.log('👤 Rol: entrenador (puede crear equipos y torneos)');
console.log('');
console.log('🧪 Usuario de prueba creado:');
console.log('📧 Email: test@futbolapp.com');
console.log('🔐 Password: test123');
console.log('👤 Rol: espectador (puede suscribirse a torneos)');

// Mock Firebase Auth
const mockAuth = {
  currentUser: currentUser as MockUser | null,
  app: {
    options: {
      projectId: 'futbolapp-torneos-mock'
    }
  }
};

// Mock Firebase functions
export const createUserWithEmailAndPassword = async (auth: any, email: string, password: string): Promise<MockUserCredential> => {
  console.log('🔥 Mock createUserWithEmailAndPassword:', email);
  
  if (mockUsers.has(email)) {
    throw { code: 'auth/email-already-in-use', message: 'Email already in use' };
  }
  
  const uid = `mock-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const user: MockUser = { uid, email };
  
  mockUsers.set(email, { password, uid });
  currentUser = user;
  (mockAuth as any).currentUser = user;
  
  // Notify auth state listeners
  authStateListeners.forEach(listener => listener(user));
  
  return { user };
};

export const signInWithEmailAndPassword = async (auth: any, email: string, password: string): Promise<MockUserCredential> => {
  console.log('🔥 Mock signInWithEmailAndPassword:', email);
  
  const userData = mockUsers.get(email);
  if (!userData) {
    throw { code: 'auth/user-not-found', message: 'User not found' };
  }
  
  if (userData.password !== password) {
    throw { code: 'auth/wrong-password', message: 'Wrong password' };
  }
  
  const user: MockUser = { uid: userData.uid, email };
  currentUser = user;
  (mockAuth as any).currentUser = user;
  
  // Notify auth state listeners
  authStateListeners.forEach(listener => listener(user));
  
  return { user };
};

export const signOut = async (auth: any): Promise<void> => {
  console.log('🔥 Mock signOut');
  currentUser = null;
  (mockAuth as any).currentUser = null;
  
  // Notify auth state listeners
  authStateListeners.forEach(listener => listener(null));
};

export const onAuthStateChanged = (auth: any, callback: (user: MockUser | null) => void) => {
  console.log('🔥 Mock onAuthStateChanged');
  authStateListeners.push(callback);
  
  // Call immediately with current state
  setTimeout(() => callback(currentUser), 0);
  
  // Return unsubscribe function
  return () => {
    const index = authStateListeners.indexOf(callback);
    if (index > -1) {
      authStateListeners.splice(index, 1);
    }
  };
};

export const sendPasswordResetEmail = async (auth: any, email: string): Promise<void> => {
  console.log('🔥 Mock sendPasswordResetEmail:', email);
  
  if (!mockUsers.has(email)) {
    throw { code: 'auth/user-not-found', message: 'User not found' };
  }
  
  // Simulate email sent
  console.log('📧 Password reset email sent to:', email);
};

// Mock Firestore
export const doc = (db: any, collection: string, id: string) => {
  return { collection, id };
};

export const setDoc = async (docRef: any, data: any): Promise<void> => {
  console.log('🔥 Mock setDoc:', docRef.collection, docRef.id);
  mockUserData.set(`${docRef.collection}/${docRef.id}`, data);
};

export const getDoc = async (docRef: any) => {
  console.log('🔥 Mock getDoc:', docRef.collection, docRef.id);
  const data = mockUserData.get(`${docRef.collection}/${docRef.id}`);
  
  return {
    exists: () => !!data,
    data: () => data
  };
};

export const updateDoc = async (docRef: any, data: any): Promise<void> => {
  console.log('🔥 Mock updateDoc:', docRef.collection, docRef.id);
  const existing = mockUserData.get(`${docRef.collection}/${docRef.id}`) || {};
  mockUserData.set(`${docRef.collection}/${docRef.id}`, { ...existing, ...data });
};

// Export mock instances
export const auth = mockAuth;
export const db = { name: 'mock-firestore' };

console.log('🔥 Mock Firebase initialized for development');
console.log('📱 Platform:', Platform.OS);
console.log('🛠️ Using mock Firebase to avoid JSON parsing errors');

const app = { options: { projectId: 'futbolapp-torneos-mock' } };
export default app;

