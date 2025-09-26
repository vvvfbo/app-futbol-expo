import { useAuth } from '@/hooks/auth-context';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OptimizedErrorBoundary } from '@/components/OptimizedComponents';
import { SuperLayoutStyles } from '@/constants/super-styles';

export default function IndexScreen() {
  return (
    <OptimizedErrorBoundary>
      <IndexScreenContent />
    </OptimizedErrorBoundary>
  );
}

function IndexScreenContent() {
  const { user, isLoading } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Crear usuario de prueba si no existe
    const setupTestUser = async () => {
      try {
        const existingUser = await AsyncStorage.getItem('currentUser');
        if (!existingUser) {
          const testUser = {
            id: 'test-user-123',
            nombre: 'Admin',
            apellidos: 'Test',
            email: 'admin@futbolapp.com',
            telefono: '+34 600 000 000',
            fechaNacimiento: '1990-01-01',
            rol: 'entrenador',
            ciudad: 'Madrid',
            equiposCreados: [],
            torneosCreados: [],
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
          await AsyncStorage.setItem('currentUser', JSON.stringify(testUser));
          console.log('✅ Usuario de prueba creado');
        }
      } catch (error) {
        console.error('❌ Error creando usuario de prueba:', error);
      }
    };
    
    setupTestUser();
    
    // Add a delay to prevent hydration timeout and ensure proper initialization
    const timeoutId = setTimeout(() => {
      try {
        if (!isLoading && !isNavigating) {
          setIsNavigating(true);
          if (user) {
            // Navigate to tabs with home as default
            router.replace('/(tabs)/(home)/home');
          } else {
            router.replace('/auth');
          }
        }
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback navigation
        try {
          router.replace('/auth');
        } catch (fallbackError) {
          console.error('Fallback navigation error:', fallbackError);
        }
      }
    }, 1500); // Reduced delay for faster loading

    return () => clearTimeout(timeoutId);
  }, [user, isLoading, isNavigating]);

  return (
    <View style={SuperLayoutStyles.screenContainer}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        <View style={SuperLayoutStyles.centeredContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>⚽</Text>
            <Text style={styles.appName}>FutbolApp</Text>
          </View>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>
            Cargando tu experiencia deportiva...
          </Text>
          <Text style={styles.subText}>
            Preparando el mejor fútbol digital
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoText: {
    fontSize: 64,
    marginBottom: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 24,
  },
  subText: {
    fontSize: 14,
    color: '#FFFFFF90',
    textAlign: 'center',
    marginTop: 8,
  },
});