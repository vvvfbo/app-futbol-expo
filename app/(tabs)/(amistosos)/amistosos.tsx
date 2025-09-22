import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Plus, Search, Calendar, MapPin, Clock, Users } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { GlobalStyles, createButtonStyle, createButtonTextStyle } from '@/constants/styles';
import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';
import { PartidoAmistoso, Equipo } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AmistososScreen() {
  const { user } = useAuth();
  const { 
    amistosos, 
    equipos, 
    obtenerEquiposPorEntrenador, 
    obtenerAmistososPorEquipo,
    aceptarAmistoso,
    rechazarAmistoso,
    finalizarAmistoso,
    recargarDatos
  } = useData();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'disponibles' | 'propuestos' | 'confirmados' | 'finalizados'>('todos');

  const misEquipos = useMemo(() => {
    if (!user) return [];
    return obtenerEquiposPorEntrenador(user.id);
  }, [user, obtenerEquiposPorEntrenador]);

  const misAmistosos = useMemo(() => {
    console.log('🏗️ === MIS AMISTOSOS DEBUG ===');
    console.log('🏗️ User ID:', user?.id);
    console.log('🏗️ Mis equipos:', misEquipos.map(e => ({ id: e.id, nombre: e.nombre, entrenadorId: e.entrenadorId })));
    console.log('🏗️ Total amistosos en sistema:', amistosos.length);
    console.log('🏗️ Todos los amistosos:', amistosos.map(a => ({
      id: a.id,
      estado: a.estado,
      esDisponibilidad: a.esDisponibilidad,
      equipoLocalId: a.equipoLocalId,
      equipoVisitanteId: a.equipoVisitanteId,
      fecha: a.fecha,
      fechaCreacion: a.fechaCreacion
    })));
    
    // Obtener todos los amistosos donde participo (como local o visitante)
    const todosAmistosos = amistosos.filter(amistoso => {
      const esLocal = misEquipos.some(equipo => equipo.id === amistoso.equipoLocalId);
      const esVisitante = amistoso.equipoVisitanteId && misEquipos.some(equipo => equipo.id === amistoso.equipoVisitanteId);
      const resultado = esLocal || esVisitante;
      
      if (resultado) {
        console.log('✅ Amistoso incluido:', {
          id: amistoso.id,
          equipoLocal: equipos.find(e => e.id === amistoso.equipoLocalId)?.nombre,
          equipoVisitante: amistoso.equipoVisitanteId ? equipos.find(e => e.id === amistoso.equipoVisitanteId)?.nombre : 'Sin oponente',
          esLocal,
          esVisitante,
          estado: amistoso.estado,
          esDisponibilidad: amistoso.esDisponibilidad
        });
      }
      
      return resultado;
    });
    
    console.log('🏗️ Total mis amistosos (antes de filtros):', todosAmistosos.length);
    console.log('🏗️ Filtro activo:', filtroActivo);
    
    // Filtrar según el filtro activo
    const amistososFiltrados = todosAmistosos.filter(amistoso => {
      switch (filtroActivo) {
        case 'disponibles':
          return amistoso.estado === 'Disponible' && amistoso.esDisponibilidad;
        case 'propuestos':
          return amistoso.estado === 'Propuesto';
        case 'confirmados':
          return amistoso.estado === 'Confirmado';
        case 'finalizados':
          return amistoso.estado === 'Finalizado';
        default:
          return true;
      }
    }).sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
    
    console.log('🏗️ Amistosos después de filtros:', amistososFiltrados.length);
    console.log('🏗️ Amistosos filtrados detalle:', amistososFiltrados.map(a => ({
      id: a.id,
      estado: a.estado,
      esDisponibilidad: a.esDisponibilidad,
      equipoLocal: equipos.find(e => e.id === a.equipoLocalId)?.nombre,
      fecha: a.fecha
    })));
    console.log('🏗️ === FIN DEBUG ===');
    
    return amistososFiltrados;
  }, [misEquipos, amistosos, filtroActivo, equipos, user?.id]);

  const propuestasRecibidas = useMemo(() => {
    if (!user) return [];
    return amistosos.filter(amistoso => 
      amistoso.propuestaA === user.id && amistoso.estado === 'Propuesto'
    );
  }, [amistosos, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await recargarDatos();
    setRefreshing(false);
  };

  const crearDatosPrueba = async () => {
    try {
      console.log('🧪 Creando datos de prueba de amistosos...');
      
      // Crear equipos de prueba
      const equipos = [
        {
          id: 'equipo-amistoso-1',
          nombre: 'FC Barcelona Juvenil',
          categoria: 'Juvenil',
          tipoFutbol: 'F11',
          entrenadorId: 'user-amistoso-1',
          jugadores: [],
          fechaCreacion: new Date().toISOString(),
          ciudad: 'Barcelona',
          colores: { principal: '#004D98', secundario: '#A50044' },
          escudo: 'https://logos-world.net/wp-content/uploads/2020/06/Barcelona-Logo.png'
        },
        {
          id: 'equipo-amistoso-2',
          nombre: 'Real Madrid Cadete',
          categoria: 'Cadete',
          tipoFutbol: 'F11',
          entrenadorId: 'user-amistoso-2',
          jugadores: [],
          fechaCreacion: new Date().toISOString(),
          ciudad: 'Madrid',
          colores: { principal: '#FFFFFF', secundario: '#000000' },
          escudo: 'https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png'
        },
        {
          id: 'equipo-amistoso-3',
          nombre: 'Atlético Madrid Infantil',
          categoria: 'Infantil',
          tipoFutbol: 'F7',
          entrenadorId: 'user-amistoso-3',
          jugadores: [],
          fechaCreacion: new Date().toISOString(),
          ciudad: 'Madrid',
          colores: { principal: '#CE3524', secundario: '#FFFFFF' },
          escudo: 'https://logos-world.net/wp-content/uploads/2020/06/Atletico-Madrid-Logo.png'
        },
        {
          id: 'equipo-amistoso-4',
          nombre: 'Valencia CF Senior',
          categoria: 'Senior',
          tipoFutbol: 'F11',
          entrenadorId: 'user-amistoso-4',
          jugadores: [],
          fechaCreacion: new Date().toISOString(),
          ciudad: 'Valencia',
          colores: { principal: '#FF6600', secundario: '#000000' },
          escudo: 'https://logos-world.net/wp-content/uploads/2020/06/Valencia-Logo.png'
        },
        {
          id: 'equipo-amistoso-5',
          nombre: 'Sevilla FC Alevin',
          categoria: 'Alevin',
          tipoFutbol: 'F7',
          entrenadorId: 'user-amistoso-5',
          jugadores: [],
          fechaCreacion: new Date().toISOString(),
          ciudad: 'Sevilla',
          colores: { principal: '#D50000', secundario: '#FFFFFF' },
          escudo: 'https://logos-world.net/wp-content/uploads/2020/06/Sevilla-Logo.png'
        },
        {
          id: 'equipo-amistoso-6',
          nombre: 'Athletic Bilbao Benjamin',
          categoria: 'Benjamin',
          tipoFutbol: 'F7',
          entrenadorId: 'user-amistoso-6',
          jugadores: [],
          fechaCreacion: new Date().toISOString(),
          ciudad: 'Bilbao',
          colores: { principal: '#EE2523', secundario: '#FFFFFF' },
          escudo: 'https://logos-world.net/wp-content/uploads/2020/06/Athletic-Bilbao-Logo.png'
        }
      ];
      
      // Crear disponibilidades de amistosos
      const hoy = new Date();
      const amistosos = [
        {
          id: 'amistoso-disp-1',
          equipoLocalId: 'equipo-amistoso-2',
          equipoVisitanteId: null,
          fecha: new Date(hoy.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          hora: '10:00',
          franjaHoraria: 'mañana',
          ubicacion: {
            direccion: 'Campo Municipal de Valdebebas, Madrid',
            coordenadas: {
              latitud: 40.4637,
              longitud: -3.6123
            }
          },
          categoria: 'Cadete',
          tipoFutbol: 'F11',
          estado: 'Disponible',
          esDisponibilidad: true,
          rangoKm: 50,
          observaciones: 'Buscamos equipo para amistoso de preparación',
          fechaCreacion: new Date().toISOString()
        },
        {
          id: 'amistoso-disp-2',
          equipoLocalId: 'equipo-amistoso-3',
          equipoVisitanteId: null,
          fecha: new Date(hoy.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          hora: '16:30',
          franjaHoraria: 'tarde',
          ubicacion: {
            direccion: 'Ciudad Deportiva Wanda, Majadahonda',
            coordenadas: {
              latitud: 40.4521,
              longitud: -3.8654
            }
          },
          categoria: 'Infantil',
          tipoFutbol: 'F7',
          estado: 'Disponible',
          esDisponibilidad: true,
          rangoKm: 30,
          observaciones: 'Partido amistoso para categoría infantil',
          fechaCreacion: new Date().toISOString()
        },
        {
          id: 'amistoso-disp-3',
          equipoLocalId: 'equipo-amistoso-4',
          equipoVisitanteId: null,
          fecha: new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          hora: '18:00',
          franjaHoraria: 'tarde',
          ubicacion: {
            direccion: 'Ciudad Deportiva de Paterna, Valencia',
            coordenadas: {
              latitud: 39.5021,
              longitud: -0.4123
            }
          },
          categoria: 'Senior',
          tipoFutbol: 'F11',
          estado: 'Disponible',
          esDisponibilidad: true,
          rangoKm: 100,
          observaciones: 'Amistoso de preparación para la temporada',
          fechaCreacion: new Date().toISOString()
        },
        {
          id: 'amistoso-disp-4',
          equipoLocalId: 'equipo-amistoso-5',
          equipoVisitanteId: null,
          fecha: new Date(hoy.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          hora: '11:00',
          franjaHoraria: 'mañana',
          ubicacion: {
            direccion: 'Ciudad Deportiva José Ramón Cisneros, Sevilla',
            coordenadas: {
              latitud: 37.3891,
              longitud: -5.9845
            }
          },
          categoria: 'Alevin',
          tipoFutbol: 'F7',
          estado: 'Disponible',
          esDisponibilidad: true,
          rangoKm: 75,
          observaciones: 'Buscamos rival para categoría alevín',
          fechaCreacion: new Date().toISOString()
        },
        {
          id: 'amistoso-disp-5',
          equipoLocalId: 'equipo-amistoso-1',
          equipoVisitanteId: null,
          fecha: new Date(hoy.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          hora: '19:30',
          franjaHoraria: 'noche',
          ubicacion: {
            direccion: 'Ciudad Deportiva Joan Gamper, Barcelona',
            coordenadas: {
              latitud: 41.3851,
              longitud: 2.1734
            }
          },
          categoria: 'Juvenil',
          tipoFutbol: 'F11',
          estado: 'Disponible',
          esDisponibilidad: true,
          rangoKm: 200,
          observaciones: 'Amistoso de alto nivel para juveniles',
          fechaCreacion: new Date().toISOString()
        },
        {
          id: 'amistoso-disp-6',
          equipoLocalId: 'equipo-amistoso-6',
          equipoVisitanteId: null,
          fecha: new Date(hoy.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          hora: '09:30',
          franjaHoraria: 'mañana',
          ubicacion: {
            direccion: 'Lezama, Bilbao',
            coordenadas: {
              latitud: 43.2627,
              longitud: -2.9253
            }
          },
          categoria: 'Benjamin',
          tipoFutbol: 'F7',
          estado: 'Disponible',
          esDisponibilidad: true,
          rangoKm: 40,
          observaciones: 'Amistoso para los más pequeños',
          fechaCreacion: new Date().toISOString()
        }
      ];
      
      // Obtener datos existentes
      const equiposExistentes = await AsyncStorage.getItem('equipos');
      const amistososExistentes = await AsyncStorage.getItem('amistosos');
      
      let equiposFinales = equipos;
      let amistososFinales = amistosos;
      
      if (equiposExistentes) {
        try {
          const equiposParsed = JSON.parse(equiposExistentes);
          if (Array.isArray(equiposParsed)) {
            // Filtrar equipos que ya existen para evitar duplicados
            const equiposNuevos = equipos.filter(equipo => 
              !equiposParsed.some(existente => existente.id === equipo.id)
            );
            equiposFinales = [...equiposParsed, ...equiposNuevos];
          }
        } catch (error) {
          console.warn('Error parseando equipos existentes, usando solo nuevos equipos');
        }
      }
      
      if (amistososExistentes) {
        try {
          const amistososParsed = JSON.parse(amistososExistentes);
          if (Array.isArray(amistososParsed)) {
            // Filtrar amistosos que ya existen para evitar duplicados
            const amistososNuevos = amistosos.filter(amistoso => 
              !amistososParsed.some(existente => existente.id === amistoso.id)
            );
            amistososFinales = [...amistososParsed, ...amistososNuevos];
          }
        } catch (error) {
          console.warn('Error parseando amistosos existentes, usando solo nuevos amistosos');
        }
      }
      
      // Guardar datos
      await AsyncStorage.setItem('equipos', JSON.stringify(equiposFinales));
      await AsyncStorage.setItem('amistosos', JSON.stringify(amistososFinales));
      
      console.log('✅ Datos de prueba creados:', {
        equipos: equipos.length,
        amistosos: amistosos.length
      });
      
      // Recargar datos en la app
      await recargarDatos();
      
      Alert.alert(
        'Datos de Prueba Creados',
        `Se crearon ${equipos.length} equipos y ${amistosos.length} amistosos de prueba.\n\nAhora puedes ir a "Buscar Amistosos" para verlos.`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('❌ Error creando datos de prueba:', error);
      Alert.alert('Error', 'No se pudieron crear los datos de prueba');
    }
  };

  const handleAceptarPropuesta = async (amistosoId: string) => {
    try {
      await aceptarAmistoso(amistosoId);
      Alert.alert('Éxito', 'Amistoso confirmado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo confirmar el amistoso');
    }
  };

  const handleRechazarPropuesta = async (amistosoId: string) => {
    Alert.alert(
      'Rechazar Propuesta',
      '¿Estás seguro de que quieres rechazar esta propuesta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            try {
              await rechazarAmistoso(amistosoId);
              Alert.alert('Propuesta rechazada');
            } catch (error) {
              Alert.alert('Error', 'No se pudo rechazar la propuesta');
            }
          }
        }
      ]
    );
  };

  const getEquipoNombre = (equipoId: string): string => {
    const equipo = equipos.find(e => e.id === equipoId);
    return equipo?.nombre || 'Equipo desconocido';
  };

  const renderAmistoso = (amistoso: PartidoAmistoso) => {
    const equipoLocal = equipos.find(e => e.id === amistoso.equipoLocalId);
    const equipoVisitante = amistoso.equipoVisitanteId ? 
      equipos.find(e => e.id === amistoso.equipoVisitanteId) : null;

    const esDisponibilidad = amistoso.esDisponibilidad;
    const esPropuestaRecibida = propuestasRecibidas.some(p => p.id === amistoso.id);

    return (
      <TouchableOpacity
        key={amistoso.id}
        style={[
          styles.amistosoCard,
          esPropuestaRecibida && styles.propuestaCard
        ]}
        onPress={() => router.push(`/(tabs)/(amistosos)/${amistoso.id}`)}
      >
        <View style={styles.amistosoHeader}>
          <View style={styles.equiposContainer}>
            {esDisponibilidad ? (
              <Text style={styles.equipoNombre}>{equipoLocal?.nombre} - Disponible</Text>
            ) : (
              <Text style={styles.equipoNombre}>
                {equipoLocal?.nombre} vs {equipoVisitante?.nombre || 'Por confirmar'}
              </Text>
            )}
          </View>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(amistoso.estado) }]}>
            <Text style={styles.estadoText}>{amistoso.estado}</Text>
          </View>
        </View>

        <View style={styles.amistosoInfo}>
          <View style={styles.infoRow}>
            <Calendar size={16} color={Colors.textLight} />
            <Text style={styles.infoText}>{amistoso.fecha}</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={16} color={Colors.textLight} />
            <Text style={styles.infoText}>{amistoso.hora}</Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={16} color={Colors.textLight} />
            <Text style={styles.infoText} numberOfLines={1}>
              {amistoso.ubicacion.direccion}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Users size={16} color={Colors.textLight} />
            <Text style={styles.infoText}>
              {amistoso.categoria} - {amistoso.tipoFutbol}
            </Text>
          </View>
        </View>

        {amistoso.estado === 'Finalizado' && (
          <View style={styles.resultadoContainer}>
            <Text style={styles.resultadoText}>
              {amistoso.golesLocal} - {amistoso.golesVisitante}
            </Text>
          </View>
        )}

        {esPropuestaRecibida && (
          <View style={styles.accionesContainer}>
            <TouchableOpacity
              style={[styles.accionBtn, styles.aceptarBtn]}
              onPress={() => handleAceptarPropuesta(amistoso.id)}
            >
              <Text style={styles.accionBtnText}>Aceptar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.accionBtn, styles.rechazarBtn]}
              onPress={() => handleRechazarPropuesta(amistoso.id)}
            >
              <Text style={styles.accionBtnText}>Rechazar</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Disponible': return Colors.primary;
      case 'Propuesto': return Colors.warning;
      case 'Confirmado': return Colors.secondary;
      case 'Finalizado': return Colors.success;
      case 'Cancelado': return Colors.error;
      default: return Colors.textLight;
    }
  };

  const filtros = [
    { key: 'todos', label: 'Todos' },
    { key: 'disponibles', label: 'Disponibles' },
    { key: 'propuestos', label: 'Propuestos' },
    { key: 'confirmados', label: 'Confirmados' },
    { key: 'finalizados', label: 'Finalizados' },
  ] as const;

  if (misEquipos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Users size={64} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No tienes equipos</Text>
          <Text style={styles.emptyText}>
            Necesitas crear al menos un equipo para poder gestionar amistosos
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/crear-club')}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Crear Club</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Propuestas recibidas */}
        {propuestasRecibidas.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Propuestas Recibidas ({propuestasRecibidas.length})
            </Text>
            {propuestasRecibidas.map(renderAmistoso)}
          </View>
        )}

        {/* Botones de acción */}
        <View style={GlobalStyles.buttonRow}>
          <TouchableOpacity
            style={[...createButtonStyle('medium', 'primary'), GlobalStyles.buttonWithIcon, { flex: 1 }]}
            onPress={() => router.push('/(tabs)/(amistosos)/buscar')}
          >
            <Search size={18} color="#FFFFFF" />
            <Text style={createButtonTextStyle('primary')}>Buscar Amistosos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[...createButtonStyle('medium', 'secondary'), GlobalStyles.buttonWithIcon, { flex: 1 }]}
            onPress={() => router.push('/(tabs)/(amistosos)/crear-disponibilidad')}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={createButtonTextStyle('secondary')}>Ofrecer Amistoso</Text>
          </TouchableOpacity>
        </View>
        
        {/* Botón para crear amistoso directo */}
        {misEquipos.length >= 2 && (
          <View style={GlobalStyles.section}>
            <TouchableOpacity
              style={[...createButtonStyle('medium', 'outline'), GlobalStyles.buttonWithIcon]}
              onPress={() => router.push('/(tabs)/(amistosos)/crear-amistoso-directo')}
            >
              <Users size={18} color={Colors.primary} />
              <Text style={createButtonTextStyle('outline')}>Amistoso Entre Mis Equipos</Text>
            </TouchableOpacity>
            <Text style={styles.directMatchSubtext}>
              Organiza un amistoso directo entre tus equipos
            </Text>
          </View>
        )}
        
        {/* Información y botón de datos de prueba (solo en desarrollo) */}
        {__DEV__ && (
          <View style={styles.testContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>🧪 Modo Desarrollo</Text>
              <Text style={styles.infoCardText}>
                Para probar la funcionalidad de amistosos, puedes crear datos de prueba que incluyen:
              </Text>
              <Text style={styles.infoList}>• 6 equipos de diferentes categorías</Text>
              <Text style={styles.infoList}>• 6 disponibilidades de amistosos</Text>
              <Text style={styles.infoList}>• Datos realistas con ubicaciones</Text>
            </View>
            <TouchableOpacity
              style={[...createButtonStyle('medium', 'secondary'), GlobalStyles.buttonWithIcon]}
              onPress={crearDatosPrueba}
            >
              <Text style={createButtonTextStyle('secondary')}>🧪 Crear Datos de Prueba</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Filtros */}
        <View style={styles.filtrosContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filtros.map((filtro) => (
              <TouchableOpacity
                key={filtro.key}
                style={[
                  GlobalStyles.chip,
                  filtroActivo === filtro.key && GlobalStyles.chipActive,
                  { marginRight: 8 }
                ]}
                onPress={() => setFiltroActivo(filtro.key)}
              >
                <Text style={[
                  GlobalStyles.chipText,
                  filtroActivo === filtro.key && GlobalStyles.chipTextActive
                ]}>
                  {filtro.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Lista de amistosos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Mis Amistosos ({misAmistosos.length})
          </Text>
          
          {misAmistosos.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>
                No tienes amistosos en esta categoría
              </Text>
              {__DEV__ && (
                <View style={styles.debugInfo}>
                  <Text style={styles.debugText}>Debug Info:</Text>
                  <Text style={styles.debugText}>Mis equipos: {misEquipos.length}</Text>
                  <Text style={styles.debugText}>Total amistosos: {amistosos.length}</Text>
                  <Text style={styles.debugText}>Filtro: {filtroActivo}</Text>
                  {amistosos.length > 0 && (
                    <Text style={styles.debugText}>Estados: {amistosos.map(a => `${a.id}(${a.estado})`).join(', ')}</Text>
                  )}
                </View>
              )}
            </View>
          ) : (
            misAmistosos.map(renderAmistoso)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  filtrosContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filtroBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filtroActivo: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filtroText: {
    fontSize: 14,
    color: Colors.text,
  },
  filtroTextoActivo: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  emptySection: {
    padding: 20,
    alignItems: 'center',
  },
  amistosoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  propuestaCard: {
    borderColor: Colors.warning,
    borderWidth: 2,
  },
  amistosoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  equiposContainer: {
    flex: 1,
  },
  equipoNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  amistosoInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textLight,
    flex: 1,
  },
  resultadoContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: Colors.success,
    borderRadius: 8,
    alignItems: 'center',
  },
  resultadoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  accionesContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  accionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  aceptarBtn: {
    backgroundColor: Colors.success,
  },
  rechazarBtn: {
    backgroundColor: Colors.error,
  },
  accionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  debugInfo: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  debugText: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  testContainer: {
    padding: 16,
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
    lineHeight: 20,
  },
  infoList: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 8,
    marginBottom: 4,
  },
  testButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  directMatchContainer: {
    padding: 16,
    alignItems: 'center',
  },
  directMatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  directMatchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  directMatchSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
});