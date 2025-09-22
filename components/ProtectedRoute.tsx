import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/auth-context';
import Colors from '@/constants/colors';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !user) {
        // Usuario no autenticado intentando acceder a ruta protegida
        router.replace('/auth');
      } else if (!requireAuth && user) {
        // Usuario autenticado intentando acceder a ruta de auth
        router.replace('/(tabs)');
      }
    }
  }, [user, isLoading, requireAuth]);

  if (isLoading) {
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

  // Mostrar contenido solo si las condiciones de autenticación se cumplen
  if (requireAuth && !user) {
    return null; // Se redirigirá en useEffect
  }

  if (!requireAuth && user) {
    return null; // Se redirigirá en useEffect
  }

  return <>{children}</>;
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