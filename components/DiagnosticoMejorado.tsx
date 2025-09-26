
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useData } from '../hooks/data-context';
import Colors from '../constants/colors';

export default function DiagnosticoMejorado() {
  const [logs, setLogs] = useState<string[]>([]);
  const { equipos, torneos, crearTorneo, crearPartidos } = useData();
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const probarCreacionCompleta = async () => {
    setLogs([]);
    addLog('🚀 Iniciando prueba completa de creación...');
    
    try {
      // 1. Verificar estado inicial
      addLog(`📊 Estado inicial: ${equipos.length} equipos, ${torneos.length} torneos`);
      
      if (equipos.length < 2) {
        addLog('❌ ERROR: Necesitas al menos 2 equipos para la prueba');
        return;
      }
      
      // 2. Datos de prueba
      const datosTest = {
        nombre: `Test Torneo ${Date.now()}`,
        ciudad: 'Madrid',
        categoria: 'Alevin' as const,
        tipoFutbol: 'F11' as const,
        fechaInicio: '2024-01-15',
        estado: 'En curso' as const,
        maxEquipos: 16,
        minEquipos: 2,
        faseActual: 'grupos' as const,
        creadorId: 'test-user'
      };
      
      addLog(`📋 Datos de prueba: ${datosTest.nombre}`);
      
      // 3. Crear torneo
      addLog('🏆 Creando torneo...');
      const torneoId = await crearTorneo(datosTest);
      addLog(`✅ Torneo creado con ID: ${torneoId}`);
      
      // 4. Verificar en AsyncStorage
      const torneosGuardados = await AsyncStorage.getItem('torneos');
      addLog(`💾 Torneos en AsyncStorage: ${torneosGuardados ? JSON.parse(torneosGuardados).length : 0}`);
      
      // 5. Crear partidos de prueba
      const partidosPrueba = [{
        torneoId,
        equipoLocalId: equipos[0].id,
        equipoVisitanteId: equipos[1].id,
        fecha: '2024-01-15',
        hora: '16:00',
        estado: 'Pendiente' as const,
        jornada: 1,
        fase: 'grupos',
        campoId: 'test-campo',
        goleadores: [],
        eventos: []
      }];
      
      addLog('⚽ Creando partidos...');
      await crearPartidos(partidosPrueba);
      addLog('✅ Partidos creados exitosamente');
      
      addLog('🎉 ¡PRUEBA COMPLETADA EXITOSAMENTE!');
      
    } catch (error: any) {
      addLog(`❌ ERROR: ${error.message}`);
      console.error('Error en prueba:', error);
    }
  };

  const limpiarAsyncStorage = async () => {
    try {
      await AsyncStorage.multiRemove(['torneos', 'partidos', 'equipos', 'campos', 'clubes']);
      addLog('🧹 AsyncStorage limpiado');
      Alert.alert('Éxito', 'AsyncStorage limpiado. Reinicia la app.');
    } catch (error: any) {
      addLog(`❌ Error limpiando: ${error.message}`);
    }
  };

  const verificarAsyncStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      addLog(`🔑 Keys en AsyncStorage: ${keys.join(', ')}`);
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        const size = value ? value.length : 0;
        addLog(`📦 ${key}: ${size} caracteres`);
      }
    } catch (error: any) {
      addLog(`❌ Error verificando: ${error.message}`);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: 'white' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
        🔍 Diagnóstico Mejorado
      </Text>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <TouchableOpacity 
          onPress={probarCreacionCompleta}
          style={{ backgroundColor: Colors.primary, padding: 15, borderRadius: 8 }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>🚀 Prueba Completa</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={verificarAsyncStorage}
          style={{ backgroundColor: Colors.secondary, padding: 15, borderRadius: 8 }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>🔍 Ver Storage</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={limpiarAsyncStorage}
          style={{ backgroundColor: 'red', padding: 15, borderRadius: 8 }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>🧹 Limpiar</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 10, borderRadius: 8 }}>
        {logs.map((log, index) => (
          <Text key={index} style={{ fontFamily: 'monospace', fontSize: 12, marginBottom: 2 }}>
            {log}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}
