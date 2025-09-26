import {
  auth,
  createUserWithEmailAndPassword,
  db,
  doc,
  getDoc,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setDoc,
  signInWithEmailAndPassword,
  signOut,
  updateDoc
} from '@/config/firebase';
import { LoginFormData, RegisterFormData, User } from '@/types';
import createContextHook from '@nkzw/create-context-hook';
import { OptimizedStorage } from '../utils/supercomputer-optimization';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

// Mock Firebase User type for development
interface FirebaseUser {
  uid: string;
  email: string | null;
}

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  suscribirseATorneo: (torneoId: string) => Promise<void>;
  desuscribirseATorneo: (torneoId: string) => Promise<void>;
  actualizarUsuario: (userData: Partial<User>) => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook<AuthState>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = useCallback(async (uid: string) => {
    if (!uid?.trim()) {
      console.log('❌ loadUserData: UID is empty or invalid');
      return;
    }

    try {
      console.log('🔍 Loading user data for UID:', uid);

      // Primero intentar cargar desde AsyncStorage (datos de prueba)
      try {
        const currentUserData = await OptimizedStorage.getItem('currentUser');
        if (currentUserData) {
          const userData = JSON.parse(currentUserData);
          if (userData && userData.id === uid) {
            console.log('✅ User data loaded from AsyncStorage (test data):', userData.email);
            setUser(userData as User);
            return;
          }
        }
      } catch (asyncError) {
        console.log('ℹ️ No test user data found in AsyncStorage, trying Firebase...');
      }

      // Si no hay datos de prueba, usar Firebase
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Validate user data structure
        if (userData && typeof userData === 'object' && userData.email && userData.id) {
          setUser(userData as User);
          console.log('✅ User data loaded from Firebase:');
          console.log('  - Email:', userData.email);
          console.log('  - Nombre:', userData.nombre, userData.apellidos);
          console.log('  - Rol:', userData.rol);
          console.log('  - Ciudad:', userData.ciudad);
        } else {
          console.warn('⚠️ Invalid user data structure:', userData);
          setUser(null);
        }
      } else {
        console.log('⚠️ User document does not exist for UID:', uid);
        setUser(null);
      }
    } catch (error: any) {
      console.error('❌ Error loading user data:', error);

      // Handle JSON parsing errors specifically
      if (error?.message && (error.message.includes('JSON Parse error') || error.message.includes('Unexpected character'))) {
        console.error('🚨 JSON Parse error in loadUserData - clearing user state');
      }

      setUser(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Función para cargar usuario de prueba si existe
    const loadTestUser = async () => {
      try {
        const currentUserData = await OptimizedStorage.getItem('currentUser');
        if (currentUserData && isMounted) {
          const userData = JSON.parse(currentUserData);
          console.log('🧪 Test user found in AsyncStorage:', userData.email);
          setUser(userData as User);
          setFirebaseUser({ uid: userData.id, email: userData.email });
          setIsLoading(false);
          return true;
        }
      } catch (error) {
        console.log('ℹ️ No test user data found, using Firebase auth...');
      }
      return false;
    };

    // Set a timeout to prevent hydration timeout
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.log('⏰ Auth loading timeout - setting loading to false');
        setIsLoading(false);
      }
    }, 3000); // 3 second timeout for faster loading

    // Primero intentar cargar usuario de prueba
    loadTestUser().then((hasTestUser) => {
      if (!isMounted) return;

      if (hasTestUser) {
        clearTimeout(timeoutId);
        return; // Ya cargamos el usuario de prueba
      }

      // Si no hay usuario de prueba, usar Firebase
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!isMounted) return;

        try {
          console.log('🔄 Auth state changed:', firebaseUser?.uid || 'null');
          setFirebaseUser(firebaseUser);

          if (firebaseUser && firebaseUser.uid) {
            await loadUserData(firebaseUser.uid);
          } else {
            setUser(null);
          }
        } catch (error: any) {
          console.error('❌ Error in auth state change handler:', error);

          // Handle JSON parsing errors
          if (error?.message && (error.message.includes('JSON Parse error') || error.message.includes('Unexpected character'))) {
            console.error('🚨 JSON Parse error in auth state change - resetting auth state');
          }

          setFirebaseUser(null);
          setUser(null);
        } finally {
          if (isMounted) {
            setIsLoading(false);
            clearTimeout(timeoutId);
          }
        }
      });

      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
        if (unsubscribe) unsubscribe();
      };
    }).catch((error) => {
      console.error('❌ Error in loadTestUser:', error);
      if (isMounted) {
        setIsLoading(false);
        clearTimeout(timeoutId);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [loadUserData]);

  const login = useCallback(async (data: LoginFormData) => {
    try {
      console.log('🔐 Attempting login for:', data.email);

      // Verificar si es el usuario de prueba
      if ((data.email === 'test@example.com' && data.password === 'test123') ||
        (data.email === 'admin@futbolapp.com' && data.password === 'admin123') ||
        (data.email === 'test@futbolapp.com' && data.password === 'test123')) {
        console.log('🧪 Using test user login');
        const currentUserData = await OptimizedStorage.getItem('currentUser');
        if (currentUserData) {
          const userData = JSON.parse(currentUserData);
          setUser(userData as User);
          setFirebaseUser({ uid: userData.id, email: userData.email });
          console.log('✅ Test login successful:', userData.email);
          return;
        }
      }

      // Si no es usuario de prueba, usar Firebase
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      console.log('✅ Firebase login successful:', userCredential.user.uid);

      // El usuario se cargará automáticamente por onAuthStateChanged
    } catch (error: any) {
      console.error('❌ Login error:', error);

      let errorMessage = 'Error al iniciar sesión';

      // Handle JSON parsing errors
      if (error?.message && (error.message.includes('JSON Parse error') || error.message.includes('Unexpected character'))) {
        console.error('🚨 JSON Parse error in login');
        errorMessage = 'Error de conexión. Intenta cerrar y abrir la aplicación nuevamente.';
      } else {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'Usuario no encontrado. Por favor, regístrate primero.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Contraseña incorrecta';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Email inválido';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Demasiados intentos fallidos. Intenta más tarde.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Error de conexión. Verifica tu internet.';
            break;
        }
      }

      throw new Error(errorMessage);
    }
  }, []);

  const register = useCallback(async (data: RegisterFormData) => {
    try {
      console.log('🚀 === INICIANDO PROCESO DE REGISTRO ===');
      console.log('📧 Email:', data.email);
      console.log('👤 Rol:', data.rol);
      console.log('🏙️ Ciudad:', data.ciudad);
      console.log('📝 Nombre completo:', data.nombreCompleto);
      // Password validation logs removed for security

      // Validaciones básicas
      const email = data.email?.trim();
      const password = data.password?.trim();
      const nombreCompleto = data.nombreCompleto?.trim();

      if (!email || !password || !nombreCompleto) {
        const missing = [];
        if (!email) missing.push('email');
        if (!password) missing.push('contraseña');
        if (!nombreCompleto) missing.push('nombre completo');
        throw new Error(`Faltan datos obligatorios: ${missing.join(', ')}`);
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      if (password !== data.confirmPassword?.trim()) {
        throw new Error('Las contraseñas no coinciden');
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('El formato del email no es válido');
      }

      console.log('✅ Validaciones pasadas, creando usuario en Firebase Auth...');
      console.log('🌐 Platform:', Platform.OS);
      console.log('🔥 Firebase Auth instance:', !!auth);
      console.log('💾 Firestore instance:', !!db);

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      console.log('🎉 Firebase user created successfully!');
      console.log('🆔 User ID:', firebaseUser.uid);
      console.log('📧 User email:', firebaseUser.email);

      // Preparar datos del usuario para Firestore
      const nombreParts = nombreCompleto.split(' ').filter(part => part.length > 0);
      const newUser: User = {
        id: firebaseUser.uid,
        nombre: nombreParts[0] || '',
        apellidos: nombreParts.slice(1).join(' ') || '',
        email: email.toLowerCase(),
        telefono: data.telefono?.trim() || '',
        fechaNacimiento: data.fechaNacimiento?.trim() || '',
        rol: data.rol || 'espectador',
        ciudad: data.ciudad || 'Madrid',
        torneosSubscritos: data.rol === 'espectador' ? [] : undefined,
        equiposCreados: data.rol === 'entrenador' ? [] : undefined,
        torneosCreados: data.rol === 'entrenador' ? [] : undefined,
        partidosArbitrados: data.rol === 'arbitro' ? [] : undefined,
        configuracion: {
          notificaciones: true,
          modoOscuro: false,
          idioma: 'es'
        },
        estadisticas: {
          torneosGanados: 0,
          partidosJugados: 0,
          golesAnotados: 0
        },
        fechaRegistro: new Date().toISOString(),
        ultimaActividad: new Date().toISOString()
      };

      console.log('💾 Guardando usuario en Firestore...');
      console.log('📄 User document data:');
      console.log('  - ID:', newUser.id);
      console.log('  - Nombre:', newUser.nombre);
      console.log('  - Apellidos:', newUser.apellidos);
      console.log('  - Email:', newUser.email);
      console.log('  - Rol:', newUser.rol);
      console.log('  - Ciudad:', newUser.ciudad);

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      console.log('✅ User document created in Firestore successfully!');

      console.log('🎯 === REGISTRO COMPLETADO EXITOSAMENTE ===');

      // El usuario se cargará automáticamente por onAuthStateChanged
    } catch (error: any) {
      console.error('❌ === ERROR EN REGISTRO ===');
      console.error('🔍 Error type:', typeof error);
      console.error('📋 Error code:', error?.code || 'No code');
      console.error('💬 Error message:', error?.message || 'No message');
      console.error('🔧 Error name:', error?.name || 'No name');

      if (error?.code) {
        console.error('🔥 Firebase error details:');
        console.error('  - Code:', error.code);
        console.error('  - Message:', error.message);
      }

      // Log completo del error para debugging
      console.error('📊 Full error object:', error);

      let errorMessage = 'Error desconocido al registrarse';

      // Manejar errores de parsing JSON y conexión
      if (error?.message && (error.message.includes('JSON Parse error') || error.message.includes('Unexpected character'))) {
        console.error('🚨 JSON Parse error detected - Firebase connection issue');
        console.error('🔧 This might be due to corrupted data or network issues');
        errorMessage = 'Error de conexión. Intenta cerrar y abrir la aplicación nuevamente.';
      }
      // Manejar errores de red y timeout
      else if (error?.message && (error.message.includes('network') || error.message.includes('timeout') || error.message.includes('fetch'))) {
        console.error('🌐 Network error detected');
        errorMessage = 'Error de conexión a internet. Verifica tu conexión y vuelve a intentar.';
      }
      // Manejar errores específicos de Firebase Auth
      else if (error?.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Ya existe una cuenta con este email. Intenta iniciar sesión.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'El formato del email no es válido';
            break;
          case 'auth/weak-password':
            errorMessage = 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'El registro con email/contraseña no está habilitado';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Demasiados intentos fallidos. Intenta más tarde.';
            break;
          default:
            errorMessage = `Error de Firebase: ${error.message}`;
        }
      } else if (error?.message) {
        // Errores personalizados (validaciones)
        errorMessage = error.message;
      }

      console.error('🚨 Final error message:', errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      console.log('User logged out');
      // El estado se limpiará automáticamente por onAuthStateChanged
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Error al cerrar sesión');
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!email?.trim()) {
      throw new Error('Email es requerido');
    }

    try {
      const sanitizedEmail = email.trim();
      await sendPasswordResetEmail(auth, sanitizedEmail);
      console.log('Password reset email sent to:', sanitizedEmail);
    } catch (error: any) {
      console.error('Password reset error:', error);

      let errorMessage = 'Error al enviar email de recuperación';

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No existe un usuario con este email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Verifica tu internet.';
          break;
      }

      throw new Error(errorMessage);
    }
  }, []);

  const actualizarUsuario = useCallback(async (userData: Partial<User>) => {
    if (!user || !firebaseUser || !userData) return;

    try {
      const updatedUser = { ...user, ...userData };

      // Actualizar en Firestore
      await updateDoc(doc(db, 'users', firebaseUser.uid), userData);

      // Actualizar estado local
      setUser(updatedUser);

      console.log('✅ User updated:', updatedUser.email);
    } catch (error: any) {
      console.error('❌ Error updating user:', error);

      let errorMessage = 'Error al actualizar usuario';

      // Handle JSON parsing errors
      if (error?.message && (error.message.includes('JSON Parse error') || error.message.includes('Unexpected character'))) {
        console.error('🚨 JSON Parse error in actualizarUsuario');
        errorMessage = 'Error de conexión. Intenta nuevamente.';
      }

      throw new Error(errorMessage);
    }
  }, [user, firebaseUser]);

  const suscribirseATorneo = useCallback(async (torneoId: string) => {
    if (!user || user.rol !== 'espectador') return;

    try {
      const torneosSubscritos = user.torneosSubscritos || [];
      if (torneosSubscritos.includes(torneoId)) return;

      const updatedData = {
        torneosSubscritos: [...torneosSubscritos, torneoId]
      };

      await actualizarUsuario(updatedData);
      console.log('✅ Suscrito al torneo:', torneoId);
    } catch (error) {
      console.error('❌ Error suscribiéndose al torneo:', error);
      throw error;
    }
  }, [user, actualizarUsuario]);

  const desuscribirseATorneo = useCallback(async (torneoId: string) => {
    if (!user || user.rol !== 'espectador') return;

    try {
      const torneosSubscritos = user.torneosSubscritos || [];
      const updatedData = {
        torneosSubscritos: torneosSubscritos.filter(id => id !== torneoId)
      };

      await actualizarUsuario(updatedData);
      console.log('✅ Desuscrito del torneo:', torneoId);
    } catch (error) {
      console.error('❌ Error desuscribiéndose del torneo:', error);
      throw error;
    }
  }, [user, actualizarUsuario]);

  return useMemo(() => ({
    user,
    firebaseUser,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
    suscribirseATorneo,
    desuscribirseATorneo,
    actualizarUsuario
  }), [user, firebaseUser, isLoading, login, register, logout, resetPassword, suscribirseATorneo, desuscribirseATorneo, actualizarUsuario]);
});