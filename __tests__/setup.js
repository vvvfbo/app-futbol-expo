import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  Stack: {
    Screen: ({ children }) => children,
  },
  Tabs: {
    Screen: ({ children }) => children,
  },
}));

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
  })),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
}));

// Mock expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

// Mock react-native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: View,
    Marker: View,
    Callout: View,
  };
});

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return new Proxy({}, {
    get: () => View,
  });
});

// Mock @tanstack/react-query
jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  })),
  QueryClientProvider: ({ children }) => children,
  useQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    error: null,
  })),
}));

// Global test utilities
global.mockFirebaseUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
};

global.mockTorneo = {
  id: 'test-torneo-id',
  nombre: 'Test Tournament',
  tipo: 'grupos',
  estado: 'En curso',
  ciudad: 'Madrid',
  categoria: 'Senior',
  tipoFutbol: '11vs11',
  equiposIds: ['team1', 'team2', 'team3', 'team4'],
  creadorId: 'test-user-id',
  fechaInicio: '2024-01-01',
  fechaFin: '2024-01-31',
};

global.mockEquipo = {
  id: 'test-equipo-id',
  nombre: 'Test Team',
  colores: {
    principal: '#FF0000',
    secundario: '#FFFFFF',
  },
  jugadores: [
    { id: '1', nombre: 'Player 1', posicion: 'Delantero' },
    { id: '2', nombre: 'Player 2', posicion: 'Defensa' },
  ],
  entrenadorId: 'test-user-id',
};

global.mockPartido = {
  id: 'test-partido-id',
  equipoLocalId: 'team1',
  equipoVisitanteId: 'team2',
  torneoId: 'test-torneo-id',
  fecha: '2024-01-15',
  hora: '18:00',
  estado: 'Programado',
  golesLocal: 0,
  golesVisitante: 0,
  jornada: 1,
};

// Mock console methods to reduce noise in tests
const originalConsole = global.console;
global.console = {
  ...console,
  log: process.env.NODE_ENV === 'test' ? jest.fn() : originalConsole.log,
  debug: process.env.NODE_ENV === 'test' ? jest.fn() : originalConsole.debug,
  info: process.env.NODE_ENV === 'test' ? jest.fn() : originalConsole.info,
  warn: process.env.NODE_ENV === 'test' ? jest.fn() : originalConsole.warn,
  error: process.env.NODE_ENV === 'test' ? jest.fn() : originalConsole.error,
};

// Setup test timeout
jest.setTimeout(30000);

// Mock timers
jest.useFakeTimers();

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});