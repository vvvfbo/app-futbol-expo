
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class DebugTorneoRuntime {
  static async debugCrearTorneo(datos: any) {
    console.log('🐛 DEBUG: Iniciando creación de torneo...', datos);
    
    try {
      // 1. Verificar estado antes
      const torneosAntes = await AsyncStorage.getItem('torneos');
      console.log('📊 Torneos antes:', torneosAntes ? JSON.parse(torneosAntes).length : 0);
      
      // 2. Verificar equipos
      const equipos = await AsyncStorage.getItem('equipos');
      console.log('👥 Equipos disponibles:', equipos ? JSON.parse(equipos).length : 0);
      
      // 3. Verificar campos
      const campos = await AsyncStorage.getItem('campos');
      console.log('🏟️ Campos disponibles:', campos ? JSON.parse(campos).length : 0);
      
      return {
        torneosAntes: torneosAntes ? JSON.parse(torneosAntes).length : 0,
        equiposDisponibles: equipos ? JSON.parse(equipos).length : 0,
        camposDisponibles: campos ? JSON.parse(campos).length : 0
      };
      
    } catch (error) {
      console.error('❌ Error en debug:', error);
      Alert.alert('Debug Error', error.message);
      return { error: error.message };
    }
  }
  
  static async debugPostCreacion(torneoId: string) {
    console.log('🐛 DEBUG: Post-creación torneo...', torneoId);
    
    try {
      // Verificar que el torneo se guardó
      const torneos = await AsyncStorage.getItem('torneos');
      const torneosArray = torneos ? JSON.parse(torneos) : [];
      const torneoCreado = torneosArray.find((t: any) => t.id === torneoId);
      
      console.log('✅ Torneo encontrado:', !!torneoCreado);
      if (torneoCreado) {
        console.log('📄 Datos del torneo:', {
          id: torneoCreado.id,
          nombre: torneoCreado.nombre,
          equipos: torneoCreado.equiposIds?.length || 0,
          tipo: torneoCreado.tipo
        });
      }
      
      // Verificar partidos
      const partidos = await AsyncStorage.getItem('partidos');
      const partidosArray = partidos ? JSON.parse(partidos) : [];
      const partidosTorneo = partidosArray.filter((p: any) => p.torneoId === torneoId);
      
      console.log('⚽ Partidos creados:', partidosTorneo.length);
      
      return {
        torneoCreado: !!torneoCreado,
        partidosCreados: partidosTorneo.length,
        torneoData: torneoCreado
      };
      
    } catch (error) {
      console.error('❌ Error en post-debug:', error);
      return { error: error.message };
    }
  }
  
  static mostrarAlerta(mensaje: string, datos?: any) {
    console.log('🚨 ALERTA DEBUG:', mensaje, datos);
    Alert.alert('🐛 Debug Torneo', `${mensaje}

Datos: ${JSON.stringify(datos, null, 2)}`);
  }
}
