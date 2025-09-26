
import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useData } from '@/hooks/data-context';
import { DebugTorneoRuntime } from '@/utils/debug-torneo-runtime';
import { limpiarTodoStorage } from '@/utils/storage-cleaner';
import { useRouter } from 'expo-router';

export default function CrearTorneoDebugScreen() {
  const { equipos, crearTorneo, crearPartidos } = useData();
  const [debugInfo, setDebugInfo] = useState<string>('');
  const router = useRouter();

  const probarCreacionBasica = async () => {
    try {
      console.log('🧪 PRUEBA: Creación básica de torneo...');
      
      // Debug pre-creación
      const debugAntes = await DebugTorneoRuntime.debugCrearTorneo({
        equipos: equipos.length,
        accion: 'creacion_basica'
      });
      
      setDebugInfo(`Pre-creación: ${JSON.stringify(debugAntes, null, 2)}`);
      
      // Datos mínimos para torneo
      const torneoBasico = {
        nombre: `Torneo Test ${Date.now()}`,
        ciudad: 'Test City',
        categoria: 'Senior' as const,
        tipoFutbol: 'F11' as const,
        fechaInicio: new Date().toISOString().split('T')[0],
        equiposIds: equipos.slice(0, 4).map(e => e.id),
        tipo: 'grupos' as const,
        estado: 'En curso' as const,
        maxEquipos: 16,
        minEquipos: 2,
        faseActual: 'grupos' as const,
        creadorId: 'test-user'
      };
      
      console.log('📝 Creando torneo con datos:', torneoBasico);
      
      // Crear el torneo
      const torneoId = await crearTorneo(torneoBasico);
      
      console.log('✅ Torneo creado con ID:', torneoId);
      
      // Debug post-creación
      const debugDespues = await DebugTorneoRuntime.debugPostCreacion(torneoId);
      
      setDebugInfo(prev => prev + `

Post-creación: ${JSON.stringify(debugDespues, null, 2)}`);
      
      DebugTorneoRuntime.mostrarAlerta('Torneo creado exitosamente', {
        torneoId,
        equipos: torneoBasico.equiposIds.length,
        debug: debugDespues
      });
      
    } catch (error) {
      console.error('❌ Error en prueba:', error);
      Alert.alert('Error de Prueba', error.message);
      setDebugInfo(`ERROR: ${error.message}`);
    }
  };

  const limpiarTodo = async () => {
    try {
      const resultado = await limpiarTodoStorage();
      DebugTorneoRuntime.mostrarAlerta('Storage limpiado', resultado);
      setDebugInfo('Storage limpiado completamente');
    } catch (error) {
      Alert.alert('Error Limpieza', error.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: 'white' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        🐛 Debug Torneos
      </Text>
      
      <TouchableOpacity
        onPress={probarCreacionBasica}
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 10,
          marginBottom: 10
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
          🧪 Probar Creación Básica
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={limpiarTodo}
        style={{
          backgroundColor: '#FF3B30',
          padding: 15,
          borderRadius: 10,
          marginBottom: 10
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
          🧹 Limpiar Todo el Storage
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          backgroundColor: '#8E8E93',
          padding: 15,
          borderRadius: 10,
          marginBottom: 20
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
          ← Volver
        </Text>
      </TouchableOpacity>
      
      {debugInfo ? (
        <View style={{
          backgroundColor: '#f5f5f5',
          padding: 10,
          borderRadius: 5,
          maxHeight: 300
        }}>
          <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>
            {debugInfo}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
