import { Stack } from 'expo-router';

export default function PerfilLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="perfil" 
        options={{ 
          title: "Mi Perfil",
          headerLargeTitle: true,
        }} 
      />
    </Stack>
  );
}