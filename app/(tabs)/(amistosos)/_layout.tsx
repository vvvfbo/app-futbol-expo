import { Stack } from 'expo-router';
import React from 'react';
import Colors from '@/constants/colors';

export default function AmistososLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="amistosos"
        options={{
          title: "Amistosos",
        }}
      />
      <Stack.Screen
        name="buscar"
        options={{
          title: "Buscar Amistosos",
        }}
      />
      <Stack.Screen
        name="crear-disponibilidad"
        options={{
          title: "Crear Disponibilidad",
        }}
      />
      <Stack.Screen
        name="crear-amistoso-directo"
        options={{
          title: "Crear Amistoso Directo",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Detalle Amistoso",
        }}
      />
    </Stack>
  );
}