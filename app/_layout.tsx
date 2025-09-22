import AuthErrorBoundary from "@/components/AuthErrorBoundary";
import NotificationManager from "@/components/NotificationManager";
import Colors from "@/constants/colors";
import { AuthProvider } from "@/hooks/auth-context";
import { ChatProvider } from "@/hooks/chat-context";
import { DataProvider } from "@/hooks/data-context";
import { NotificationsProvider } from "@/hooks/notifications-context";
import { ThemeProvider } from "@/hooks/theme-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { Suspense, useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BundleInspector } from '../.rorkai/inspector';
import { RorkErrorBoundary } from '../.rorkai/rork-error-boundary';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Atrás" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      <Stack.Screen
        name="crear-torneo"
        options={{
          title: "Crear Torneo",
          presentation: "modal"
        }}
      />
      <Stack.Screen
        name="partido/[id]"
        options={{
          title: "Detalles del Partido",
          presentation: "modal"
        }}
      />
      <Stack.Screen
        name="notificaciones"
        options={{
          title: "Notificaciones",
          presentation: "modal"
        }}
      />
      <Stack.Screen
        name="crear-club"
        options={{
          title: "Crear Club",
          presentation: "modal"
        }}
      />
      <Stack.Screen
        name="editar-torneo/[id]"
        options={{
          title: "Editar Torneo",
          presentation: "modal"
        }}
      />
      <Stack.Screen
        name="editar-equipo/[id]"
        options={{
          title: "Editar Equipo",
          presentation: "modal"
        }}
      />
      <Stack.Screen
        name="configuracion"
        options={{
          title: "Configuración",
          presentation: "modal"
        }}
      />
      <Stack.Screen
        name="chats"
        options={{
          title: "Chats",
          presentation: "modal"
        }}
      />
      <Stack.Screen
        name="chat/[id]"
        options={{
          title: "Chat",
          presentation: "modal"
        }}
      />
    </Stack>
  );
}

function LoadingFallback() {
  return (
    <LinearGradient
      colors={[Colors.gradient.start, Colors.gradient.end]}
      style={styles.gestureHandler}
    >
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
      </View>
    </LinearGradient>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Delay splash screen hiding to prevent hydration timeout
    const timeoutId = setTimeout(() => {
      try {
        SplashScreen.hideAsync();
      } catch (error) {
        console.warn('Error hiding splash screen:', error);
      }
    }, 1500); // Increased delay to ensure proper initialization

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <AuthErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<LoadingFallback />}>
          <ThemeProvider>
            <AuthProvider>
              <DataProvider>
                <NotificationsProvider>
                  <ChatProvider>
                    <NotificationManager />
                    <GestureHandlerRootView style={styles.gestureHandler}>
                      <BundleInspector><RorkErrorBoundary><RootLayoutNav /></RorkErrorBoundary></BundleInspector>
                    </GestureHandlerRootView>
                  </ChatProvider>
                </NotificationsProvider>
              </DataProvider>
            </AuthProvider>
          </ThemeProvider>
        </Suspense>
      </QueryClientProvider>
    </AuthErrorBoundary>
  );
}

const styles = StyleSheet.create({
  gestureHandler: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});