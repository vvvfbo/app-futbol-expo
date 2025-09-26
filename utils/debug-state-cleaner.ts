
// Script de limpieza de estado para debugging
// Ejecutar en el dispositivo/simulador

import AsyncStorage from '@react-native-async-storage/async-storage';

export const limpiarEstadoCompleto = async () => {
  try {
    console.log('🧹 Limpiando todo el estado...');
    await AsyncStorage.multiRemove([
      'torneos', 'equipos', 'partidos', 'campos', 
      'clubes', 'amistosos', 'usuarios'
    ]);
    console.log('✅ Estado limpiado completamente');
    // Recargar la app después de esto
  } catch (error) {
    console.error('❌ Error limpiando estado:', error);
  }
};

export const diagnosticarAsyncStorage = async () => {
  try {
    console.log('📊 Diagnóstico de AsyncStorage:');
    const keys = await AsyncStorage.getAllKeys();
    console.log('🔑 Keys disponibles:', keys);
    
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`📦 ${key}: ${value ? value.length : 'null'} caracteres`);
    }
  } catch (error) {
    console.error('❌ Error diagnosticando AsyncStorage:', error);
  }
};
