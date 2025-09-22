import { useAuth } from '@/hooks/auth-context';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function IndexScreen() {
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
    <LinearGradient
      colors={[Colors.gradient.start, Colors.gradient.end]}
      style={styles.container}
    >
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});