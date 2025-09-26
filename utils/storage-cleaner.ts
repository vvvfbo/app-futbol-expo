
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function limpiarTodoStorage() {
  try {
    console.log('🗑️ Limpiando AsyncStorage...');
    
    const keys = await AsyncStorage.getAllKeys();
    console.log('📋 Claves encontradas:', keys);
    
    await AsyncStorage.multiRemove(keys);
    
    console.log('✅ AsyncStorage limpiado completamente');
    
    // Verificar que está limpio
    const keysAfter = await AsyncStorage.getAllKeys();
    console.log('📋 Claves después de limpieza:', keysAfter);
    
    return { success: true, keysRemoved: keys.length };
  } catch (error) {
    console.error('❌ Error limpiando AsyncStorage:', error);
    return { success: false, error: error.message };
  }
}
