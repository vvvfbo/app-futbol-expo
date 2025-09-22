module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  testMatch: [
    '**/__tests__/unit/**/*.(test|spec).(js|jsx|ts|tsx)',
    '**/__tests__/integration/**/*.(test|spec).(js|jsx|ts|tsx)',
    '**/__tests__/e2e/**/*.(test|spec).(js|jsx|ts|tsx)',
    '**/__tests__/components/**/*.(test|spec).(js|jsx|ts|tsx)',
    '**/__tests__/screens/**/*.(test|spec).(js|jsx|ts|tsx)',
    '**/__tests__/hooks/**/*.(test|spec).(js|jsx|ts|tsx)',
    '**/__tests__/utils/**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/coverage/**'
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|@react-native-community|@react-navigation|expo|@expo|@unimodules|unimodules|sentry-expo|native-base|react-clone-referenced-element|lucide-react-native|@tanstack)'
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  testTimeout: 30000
};

// Configuración específica para diferentes tipos de tests
if (process.env.TEST_TYPE === 'unit') {
  module.exports.testMatch = ['**/__tests__/unit/**/*.(test|spec).(js|jsx|ts|tsx)'];
} else if (process.env.TEST_TYPE === 'integration') {
  module.exports.testMatch = ['**/__tests__/integration/**/*.(test|spec).(js|jsx|ts|tsx)'];
  module.exports.testTimeout = 60000;
} else if (process.env.TEST_TYPE === 'e2e') {
  module.exports.testMatch = ['**/__tests__/e2e/**/*.(test|spec).(js|jsx|ts|tsx)'];
  module.exports.testTimeout = 120000;
}