/**
 * Setup para tests de Jest en la App de Fútbol
 * Configuraciones globales y mocks necesarios para testing
 */

// Mock de AsyncStorage para testing
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock de Expo Router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: jest.fn(() => true),
  },
  useLocalSearchParams: jest.fn(() => ({})),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  })),
}));

// Mock de componentes nativos
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
    Share: {
      share: jest.fn(),
    },
    Platform: {
      OS: 'web',
      select: jest.fn(obj => obj.web || obj.default),
    },
  };
});

// Mock de safe area context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

// Mock de Lucide React Native
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const createMockIcon = (name) => {
    return React.forwardRef((props, ref) => 
      React.createElement(View, { ...props, ref, testID: `icon-${name}` })
    );
  };

  return new Proxy({}, {
    get: (target, prop) => {
      if (typeof prop === 'string') {
        return createMockIcon(prop);
      }
      return target[prop];
    }
  });
});

// Configuración global de timeouts
jest.setTimeout(10000);

// Suprimir warnings de testing no críticos
console.warn = jest.fn();
console.error = jest.fn();

// Setup global para todos los tests
beforeEach(() => {
  jest.clearAllMocks();
});

global.console = {
  ...console,
  // Mantener solo los logs que queremos ver en tests
  log: console.log,
  warn: jest.fn(),
  error: jest.fn(),
};