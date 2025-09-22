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

// Usuario de prueba sin credenciales (solo para desarrollo)
const TEST_USER_TEMPLATE = {
  uid: 'dev-user-template',
  userData: {
    id: 'dev-user-template',
    nombre: 'Usuario',
    apellidos: 'Prueba',
    email: 'test@example.com',
    telefono: '+00 000 000 000',
    fechaNacimiento: '1990-01-01',
    rol: 'entrenador' as const,
    ciudad: 'Ciudad',
    torneosSubscritos: [],
    equiposCreados: [],
    torneosCreados: [],
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
    fechaRegistro: '2024-01-01T00:00:00.000Z',
    ultimaActividad: new Date().toISOString()
  }
};

// Los usuarios de prueba se crean dinámicamente sin credenciales hardcodeadas

// Plantilla para usuarios de desarrollo (sin credenciales)

// Usuarios se registran dinámicamente por seguridad

// Mock Firebase Auth (sin credenciales hardcodeadas)
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
  // User registration attempt (email not logged for security)

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
  // Login attempt (email not logged for security)

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
  // Password reset request (email not logged for security)

  if (!mockUsers.has(email)) {
    throw { code: 'auth/user-not-found', message: 'User not found' };
  }

  // Password reset email sent (details not logged for security)
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

