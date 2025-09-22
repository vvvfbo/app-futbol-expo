import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/hooks/auth-context';
import { DataProvider, useData } from '@/hooks/data-context';

// Mock de AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock de Firebase
const mockFirebase = {
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
};

// Componente de prueba para flujo de autenticación
const AuthTestComponent = () => {
  const { user, login, register, logout, isLoading } = useAuth();
  
  return (
    <>
      {isLoading && <div data-testid="loading">Cargando...</div>}
      {user ? (
        <div data-testid="authenticated">
          <div data-testid="user-email">{user.email}</div>
          <button data-testid="logout-button" onClick={logout}>Cerrar Sesión</button>
        </div>
      ) : (
        <div data-testid="unauthenticated">
          <button 
            data-testid="login-button" 
            onClick={() => login({ email: 'test@example.com', password: 'password123', rememberMe: false })}
          >
            Iniciar Sesión
          </button>
          <button 
            data-testid="register-button" 
            onClick={() => register({ 
              email: 'test@example.com', 
              password: 'password123', 
              confirmPassword: 'password123',
              nombreCompleto: 'Test User',
              rol: 'entrenador' as const,
              telefono: '123456789'
            })}
          >
            Registrarse
          </button>
        </div>
      )}
    </>
  );
};

// Componente de prueba para gestión de datos
const DataTestComponent = () => {
  const { equipos, torneos, crearEquipo, crearTorneo, isLoading } = useData();
  
  return (
    <>
      {isLoading && <div data-testid="data-loading">Cargando datos...</div>}
      <div data-testid="equipos-count">{equipos.length}</div>
      <div data-testid="torneos-count">{torneos.length}</div>
      <button 
        data-testid="crear-equipo-button"
        onClick={() => crearEquipo({
          nombre: 'Nuevo Equipo',
          colores: { principal: '#FF0000', secundario: '#FFFFFF' },
          entrenadorId: 'test-user-id',
          jugadores: [],
          ciudad: 'Madrid'
        })}
      >
        Crear Equipo
      </button>
      <button 
        data-testid="crear-torneo-button"
        onClick={() => crearTorneo({
          nombre: 'Nuevo Torneo',
          tipo: 'grupos',
          ciudad: 'Madrid',
          categoria: 'Senior',
          tipoFutbol: 'F11',
          equiposIds: [],
          creadorId: 'test-user-id',
          fechaInicio: '2024-01-01',
          fechaFin: '2024-01-31',
          estado: 'Próximo',
          maxEquipos: 16,
          minEquipos: 4,
          configuracion: {
            puntosVictoria: 3,
            puntosEmpate: 1,
            puntosDerrota: 0,
            tiempoPartido: 90,
            descanso: 15,
            permitirEmpates: true
          }
        })}
      >
        Crear Torneo
      </button>
    </>
  );
};

describe('Authentication Flow - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockFirebase.signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'test-uid', email: 'test@example.com' }
    });
  });

  test('debe mostrar pantalla de login inicialmente', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('unauthenticated')).toBeTruthy();
      expect(getByTestId('login-button')).toBeTruthy();
      expect(getByTestId('register-button')).toBeTruthy();
    });
  });

  test('debe realizar login correctamente', async () => {
    mockFirebase.signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'test-uid', email: 'test@example.com' }
    });

    const { getByTestId } = render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    const loginButton = getByTestId('login-button');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockFirebase.signInWithEmailAndPassword).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });
  });

  test('debe realizar registro correctamente', async () => {
    mockFirebase.createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'test-uid', email: 'test@example.com' }
    });

    const { getByTestId } = render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    const registerButton = getByTestId('register-button');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(mockFirebase.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });
  });

  test('debe cerrar sesión correctamente', async () => {
    // Simular usuario autenticado
    const { getByTestId, rerender } = render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    // Simular que el usuario está autenticado
    mockFirebase.onAuthStateChanged.mockImplementation((callback) => {
      callback({ uid: 'test-uid', email: 'test@example.com' });
    });

    rerender(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      const logoutButton = getByTestId('logout-button');
      fireEvent.press(logoutButton);
    });

    expect(mockFirebase.signOut).toHaveBeenCalled();
  });
});

describe('Data Management Flow - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
  });

  test('debe cargar datos iniciales', async () => {
    const { getByTestId } = render(
      <DataProvider>
        <DataTestComponent />
      </DataProvider>
    );

    await waitFor(() => {
      expect(getByTestId('equipos-count')).toBeTruthy();
      expect(getByTestId('torneos-count')).toBeTruthy();
    });
  });

  test('debe crear equipo correctamente', async () => {
    const { getByTestId } = render(
      <DataProvider>
        <DataTestComponent />
      </DataProvider>
    );

    const crearEquipoButton = getByTestId('crear-equipo-button');
    fireEvent.press(crearEquipoButton);

    await waitFor(() => {
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  test('debe crear torneo correctamente', async () => {
    const { getByTestId } = render(
      <DataProvider>
        <DataTestComponent />
      </DataProvider>
    );

    const crearTorneoButton = getByTestId('crear-torneo-button');
    fireEvent.press(crearTorneoButton);

    await waitFor(() => {
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });
  });
});

describe('Complete User Flow - Integration Tests', () => {
  test('debe completar flujo completo: registro -> crear equipo -> crear torneo', async () => {
    // Simular registro exitoso
    mockFirebase.createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'test-uid', email: 'test@example.com' }
    });

    // Componente que combina auth y data
    const CompleteFlowComponent = () => {
      const { user, register } = useAuth();
      const { crearEquipo, crearTorneo, equipos, torneos } = useData();

      const handleCompleteFlow = async () => {
        // 1. Registrar usuario
        await register({
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          nombreCompleto: 'Test User',
          rol: 'entrenador' as const,
          telefono: '123456789'
        });

        // 2. Crear equipo
        const equipoId = await crearEquipo({
          nombre: 'Mi Equipo',
          colores: { principal: '#FF0000', secundario: '#FFFFFF' },
          entrenadorId: 'test-uid',
          jugadores: [],
          ciudad: 'Madrid'
        });

        // 3. Crear torneo
        await crearTorneo({
          nombre: 'Mi Torneo',
          tipo: 'grupos',
          ciudad: 'Madrid',
          categoria: 'Senior',
          tipoFutbol: 'F11',
          equiposIds: [equipoId],
          creadorId: 'test-uid',
          fechaInicio: '2024-01-01',
          fechaFin: '2024-01-31',
          estado: 'Próximo',
          maxEquipos: 16,
          minEquipos: 4,
          configuracion: {
            puntosVictoria: 3,
            puntosEmpate: 1,
            puntosDerrota: 0,
            tiempoPartido: 90,
            descanso: 15,
            permitirEmpates: true
          }
        });
      };

      return (
        <>
          <div data-testid="user-status">{user ? 'authenticated' : 'unauthenticated'}</div>
          <div data-testid="equipos-count">{equipos.length}</div>
          <div data-testid="torneos-count">{torneos.length}</div>
          <button data-testid="complete-flow-button" onClick={handleCompleteFlow}>
            Flujo Completo
          </button>
        </>
      );
    };

    const { getByTestId } = render(
      <AuthProvider>
        <DataProvider>
          <CompleteFlowComponent />
        </DataProvider>
      </AuthProvider>
    );

    const completeFlowButton = getByTestId('complete-flow-button');
    fireEvent.press(completeFlowButton);

    await waitFor(() => {
      expect(mockFirebase.createUserWithEmailAndPassword).toHaveBeenCalled();
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    }, { timeout: 5000 });
  });
});

describe('Error Handling - Integration Tests', () => {
  test('debe manejar errores de autenticación', async () => {
    mockFirebase.signInWithEmailAndPassword.mockRejectedValue(
      new Error('Invalid credentials')
    );

    const ErrorHandlingComponent = () => {
      const { login } = useAuth();
      const [error, setError] = React.useState<string | null>(null);

      const handleLogin = async () => {
        try {
          await login({ email: 'invalid@example.com', password: 'wrong', rememberMe: false });
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
        }
      };

      return (
        <>
          {error && <div data-testid="error-message">{error}</div>}
          <button data-testid="login-with-error" onClick={handleLogin}>
            Login con Error
          </button>
        </>
      );
    };

    const { getByTestId } = render(
      <AuthProvider>
        <ErrorHandlingComponent />
      </AuthProvider>
    );

    const loginButton = getByTestId('login-with-error');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByTestId('error-message')).toBeTruthy();
    });
  });

  test('debe manejar errores de creación de datos', async () => {
    mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

    const DataErrorComponent = () => {
      const { crearEquipo } = useData();
      const [error, setError] = React.useState<string | null>(null);

      const handleCreateTeam = async () => {
        try {
          await crearEquipo({
            nombre: 'Equipo Error',
            colores: { principal: '#FF0000', secundario: '#FFFFFF' },
            entrenadorId: 'test-uid',
            jugadores: [],
            ciudad: 'Madrid'
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
        }
      };

      return (
        <>
          {error && <div data-testid="data-error-message">{error}</div>}
          <button data-testid="create-team-with-error" onClick={handleCreateTeam}>
            Crear Equipo con Error
          </button>
        </>
      );
    };

    const { getByTestId } = render(
      <DataProvider>
        <DataErrorComponent />
      </DataProvider>
    );

    const createButton = getByTestId('create-team-with-error');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(getByTestId('data-error-message')).toBeTruthy();
    });
  });
});

describe('Performance Tests - Integration Tests', () => {
  test('debe cargar datos grandes sin problemas de rendimiento', async () => {
    // Simular datos grandes
    const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
      id: `team-${i}`,
      nombre: `Equipo ${i}`,
      colores: { principal: '#FF0000', secundario: '#FFFFFF' },
      entrenadorId: 'test-uid',
      jugadores: []
    }));

    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(largeDataSet));

    const PerformanceTestComponent = () => {
      const { equipos, isLoading } = useData();
      
      return (
        <>
          {isLoading && <div data-testid="performance-loading">Cargando...</div>}
          <div data-testid="large-data-count">{equipos.length}</div>
        </>
      );
    };

    const startTime = Date.now();
    
    const { getByTestId } = render(
      <DataProvider>
        <PerformanceTestComponent />
      </DataProvider>
    );

    await waitFor(() => {
      expect(getByTestId('large-data-count')).toBeTruthy();
    });

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Verificar que la carga no tome más de 2 segundos
    expect(loadTime).toBeLessThan(2000);
  });
});