
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useData } from '@/hooks/data-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function DiagnosticoEnVivo() {
  const [logs, setLogs] = useState<string[]>([]);
  const { equipos, crearTorneo } = useData();

  const agregarLog = (mensaje: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${mensaje}`, ...prev].slice(0, 50));
  };

  const probarCreacionSimple = async () => {
    try {
      agregarLog('🧪 Iniciando prueba de creación simple...');
      
      if (equipos.length < 2) {
        agregarLog('❌ Insuficientes equipos para prueba');
        Alert.alert('Error', 'Necesitas al menos 2 equipos para crear un torneo');
        return;
      }

      const datosBasicos = {
        nombre: `Torneo Prueba ${Date.now()}`,
        ciudad: 'Ciudad Prueba',
        categoria: 'Senior' as const,
        tipoFutbol: 'F11' as const,
        fechaInicio: new Date().toISOString().split('T')[0],
        equiposIds: equipos.slice(0, 2).map(e => e.id),
        tipo: 'grupos' as const,
        estado: 'En curso' as const,
        maxEquipos: 16,
        minEquipos: 2,
        faseActual: 'grupos' as const,
        creadorId: 'test-user'
      };

      agregarLog(`📝 Datos del torneo: ${JSON.stringify(datosBasicos, null, 2)}`);
      
      const torneoId = await crearTorneo(datosBasicos);
      
      agregarLog(`✅ Torneo creado con ID: ${torneoId}`);
      
      Alert.alert('Éxito', `Torneo creado exitosamente!
ID: ${torneoId}`);
      
    } catch (error) {
      agregarLog(`❌ Error: ${error.message}`);
      Alert.alert('Error', error.message);
    }
  };

  const limpiarStorage = async () => {
    try {
      agregarLog('🧹 Limpiando AsyncStorage...');
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
      agregarLog(`✅ ${keys.length} claves eliminadas`);
      Alert.alert('Limpieza Completa', 'AsyncStorage limpiado');
    } catch (error) {
      agregarLog(`❌ Error limpiando: ${error.message}`);
    }
  };

  const verificarStorage = async () => {
    try {
      agregarLog('🔍 Verificando storage...');
      const keys = await AsyncStorage.getAllKeys();
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        const data = value ? JSON.parse(value) : null;
        const count = Array.isArray(data) ? data.length : (data ? 1 : 0);
        agregarLog(`📦 ${key}: ${count} elementos`);
      }
      
    } catch (error) {
      agregarLog(`❌ Error verificando storage: ${error.message}`);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: 'white' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
        🔍 Diagnóstico en Vivo
      </Text>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
        <TouchableOpacity 
          onPress={probarCreacionSimple}
          style={{ backgroundColor: '#007AFF', padding: 10, margin: 5, borderRadius: 5 }}
        >
          <Text style={{ color: 'white' }}>🧪 Probar Creación</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={verificarStorage}
          style={{ backgroundColor: '#34C759', padding: 10, margin: 5, borderRadius: 5 }}
        >
          <Text style={{ color: 'white' }}>🔍 Ver Storage</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={limpiarStorage}
          style={{ backgroundColor: '#FF3B30', padding: 10, margin: 5, borderRadius: 5 }}
        >
          <Text style={{ color: 'white' }}>🧹 Limpiar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setLogs([])}
          style={{ backgroundColor: '#8E8E93', padding: 10, margin: 5, borderRadius: 5 }}
        >
          <Text style={{ color: 'white' }}>🗑️ Limpiar Logs</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        📋 Logs del Sistema:
      </Text>
      
      <ScrollView 
        style={{ 
          flex: 1, 
          backgroundColor: '#f5f5f5', 
          padding: 10, 
          borderRadius: 5 
        }}
      >
        {logs.map((log, index) => (
          <Text 
            key={index} 
            style={{ 
              fontSize: 12, 
              marginBottom: 5, 
              fontFamily: 'monospace',
              color: log.includes('❌') ? 'red' : 
                     log.includes('✅') ? 'green' : 
                     log.includes('⚠️') ? 'orange' : 'black'
            }}
          >
            {log}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

export default DiagnosticoEnVivo;
