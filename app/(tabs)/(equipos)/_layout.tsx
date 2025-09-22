import { Stack } from 'expo-router';

export default function EquiposLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="equipos" 
        options={{ 
          title: "Mis Equipos",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: "Detalles del Equipo",
        }} 
      />
    </Stack>
  );
}