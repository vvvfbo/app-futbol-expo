import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default class AuthErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('=== AUTH ERROR BOUNDARY ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error Info:', JSON.stringify(errorInfo, null, 2));
    
    // Log additional debugging information
    console.error('Error name:', error.name);
    console.error('Error cause:', error.cause);
    console.error('Full error object:', error);
    
    // Check for specific error types that might cause crashes
    if (error.message.includes('JSON Parse error') || 
        error.message.includes('Unexpected character') ||
        error.message.includes('Hydration timeout') ||
        error.message.includes('AsyncStorage timeout') ||
        error.message.includes('Network request failed') ||
        error.message.includes('Firebase') ||
        error.message.includes('Auth')) {
      console.error('🚨 CRITICAL ERROR DETECTED - This might cause app crashes');
      console.error('🔧 Recommended action: Clear app data and restart');
      
      // Try to clear potentially corrupted data
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        AsyncStorage.multiRemove(['currentUser', 'equipos', 'torneos', 'partidos', 'clubes', 'amistosos']);
        console.log('🧹 Cleared potentially corrupted data');
      } catch (clearError) {
        console.error('❌ Error clearing data:', clearError);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <LinearGradient
          colors={[Colors.gradient.start, Colors.gradient.end]}
          style={styles.container}
        >
          <View style={styles.errorContainer}>
            <AlertTriangle size={60} color="white" />
            <Text style={styles.errorTitle}>Error de Autenticación</Text>
            <Text style={styles.errorMessage}>
              {this.state.error?.message?.includes('JSON Parse error') || 
               this.state.error?.message?.includes('Hydration timeout') ?
                'Error de inicialización. Intenta cerrar y abrir la aplicación nuevamente.' :
                'Ha ocurrido un error inesperado. Por favor, reinicia la aplicación.'}
            </Text>
            {this.state.error && (
              <Text style={styles.errorDetails}>
                Error: {this.state.error.message}
              </Text>
            )}
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => this.setState({ hasError: false, error: undefined })}
            >
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorDetails: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    fontFamily: 'monospace',
  },
});