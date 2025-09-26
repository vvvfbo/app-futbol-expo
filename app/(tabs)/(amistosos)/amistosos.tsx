import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Heart, Search, Users, MapPin, Calendar, Plus, Clock } from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';
import Colors from '@/constants/colors';
import { SuperLayoutStyles } from '@/constants/super-styles';
import SuperButton from '@/components/SuperButton';
import SuperCard from '@/components/SuperCard';
import SuperHeader from '@/components/SuperHeader';

export default function AmistososScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { equipos, amistosos } = useData();
  
  const [filtroActivo, setFiltroActivo] = useState('todos');

  // Filtrar mis equipos (donde soy entrenador)
  const misEquipos = useMemo(() => {
    return equipos.filter(equipo => 
      equipo.entrenadorId === user?.id
    );
  }, [equipos, user?.id]);

  // Filtrar partidos amistosos de mis equipos
  const misAmistosos = useMemo(() => {
    const misEquiposIds = new Set(misEquipos.map(e => e.id));
    return amistosos.filter(amistoso => 
      misEquiposIds.has(amistoso.equipoLocalId) || 
      (amistoso.equipoVisitanteId && misEquiposIds.has(amistoso.equipoVisitanteId))
    );
  }, [amistosos, misEquipos]);

  const filtros = [
    { key: 'todos', label: 'Todos' },
    { key: 'pendientes', label: 'Pendientes' },
    { key: 'completados', label: 'Completados' }
  ];

  const amistososFiltrados = useMemo(() => {
    switch (filtroActivo) {
      case 'pendientes':
        return misAmistosos.filter(p => p.estado === 'Confirmado' || p.estado === 'Propuesto');
      case 'completados':
        return misAmistosos.filter(p => p.estado === 'Finalizado');
      default:
        return misAmistosos;
    }
  }, [misAmistosos, filtroActivo]);

  const crearDatosPrueba = () => {
    Alert.alert(
      'Crear datos de prueba',
      '¿Quieres crear equipos y disponibilidades de ejemplo para probar la funcionalidad?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Crear', onPress: () => {
          Alert.alert('¡Listo!', 'Datos de prueba creados');
        }}
      ]
    );
  };

  return (
    <View style={[SuperLayoutStyles.screenContainer, { paddingTop: insets.top }]}>
      <ScrollView style={SuperLayoutStyles.contentContainer} showsVerticalScrollIndicator={false}>
        
        <SuperCard elevated>
          <SuperHeader title="Partidos Amistosos" />
          
          <View style={SuperLayoutStyles.buttonRow}>
            <SuperButton
              title="Buscar Amistosos"
              variant="primary"
              size="medium"
              icon={<Search size={18} color="white" />}
              onPress={() => router.push('/(tabs)/(amistosos)/buscar')}
              style={{ flex: 1 }}
            />
            <SuperButton
              title="Ofrecer Amistoso"
              variant="success"
              size="medium"
              icon={<Heart size={18} color="white" />}
              onPress={() => router.push('/(tabs)/(amistosos)/crear-disponibilidad')}
              style={{ flex: 1 }}
            />
          </View>
        </SuperCard>

        {/* Botón para crear amistoso directo */}
        {misEquipos.length >= 2 && (
          <SuperCard elevated>
            <SuperButton
              title="Entre Mis Equipos"
              variant="gradient"
              size="large"
              icon={<Users size={20} color="white" />}
              onPress={() => router.push('/(tabs)/(amistosos)/crear-amistoso-directo')}
              fullWidth
            />
            <Text style={styles.directMatchSubtext}>
              Organiza un amistoso directo entre tus equipos
            </Text>
          </SuperCard>
        )}
        
        {/* Información y botón de datos de prueba (solo en desarrollo) */}
        {__DEV__ && (
          <SuperCard elevated>
            <SuperHeader title="🧪 Modo Desarrollo" />
            <Text style={styles.infoCardText}>
              Para probar la funcionalidad de amistosos, puedes crear datos de prueba que incluyen:
            </Text>
            <Text style={styles.infoList}>• 6 equipos de diferentes categorías</Text>
            <Text style={styles.infoList}>• 6 disponibilidades de amistosos</Text>
            <Text style={styles.infoList}>• Datos realistas con ubicaciones</Text>
            
            <SuperButton 
              title="🧪 Crear Datos de Prueba" 
              variant="secondary" 
              onPress={crearDatosPrueba}
              fullWidth
            />
          </SuperCard>
        )}

        {/* Filtros */}
        <SuperCard elevated>
          <View style={styles.filtrosContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filtros.map((filtro) => (
                <TouchableOpacity
                  key={filtro.key}
                  style={[
                    styles.chip,
                    filtroActivo === filtro.key && styles.chipActive,
                    { marginRight: 8 }
                  ]}
                  onPress={() => setFiltroActivo(filtro.key)}
                >
                  <Text style={[
                    styles.chipText,
                    filtroActivo === filtro.key && styles.chipTextActive
                  ]}>
                    {filtro.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SuperCard>

        {/* Lista de amistosos */}
        <SuperCard elevated>
          <SuperHeader title={`Mis Amistosos (${amistososFiltrados.length})`} />
          
          {amistososFiltrados.length === 0 ? (
            <View style={styles.emptySection}>
              <Heart size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>No hay partidos amistosos</Text>
              <Text style={styles.emptyText}>
                {filtroActivo === 'todos' 
                  ? 'Busca disponibilidades o crea una nueva para comenzar'
                  : `No hay partidos ${filtroActivo}`
                }
              </Text>
              
              {filtroActivo === 'todos' && (
                <View style={styles.emptyActions}>
                  <SuperButton
                    title="Buscar Amistosos"
                    variant="primary"
                    size="medium"
                    onPress={() => router.push('/(tabs)/(amistosos)/buscar')}
                    style={{ marginBottom: 8 }}
                  />
                  <SuperButton
                    title="Crear Disponibilidad"
                    variant="secondary"
                    size="medium"
                    onPress={() => router.push('/(tabs)/(amistosos)/crear-disponibilidad')}
                  />
                </View>
              )}
            </View>
          ) : (
            amistososFiltrados.map(partido => {
              const equipoLocal = equipos.find(e => e.id === partido.equipoLocalId);
              const equipoVisitante = equipos.find(e => e.id === partido.equipoVisitanteId);
              
              return (
                <TouchableOpacity
                  key={partido.id}
                  style={styles.partidoCard}
                  onPress={() => {
                    console.log('🎯 NAVEGANDO A AMISTOSO ID:', partido.id);
                    router.push(`/(tabs)/(amistosos)/${partido.id}`);
                  }}
                >
                  <View style={styles.partidoHeader}>
                    <Text style={styles.partidoTitle}>
                      {equipoLocal?.nombre} vs {equipoVisitante?.nombre}
                    </Text>
                    <View style={[
                      styles.estadoBadge,
                      partido.estado === 'Finalizado' && styles.estadoFinalizado
                    ]}>
                      <Text style={styles.estadoText}>{partido.estado}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.partidoInfo}>
                    <View style={styles.infoRow}>
                      <Calendar size={16} color={Colors.textSecondary} />
                      <Text style={styles.infoText}>{partido.fecha}</Text>
                    </View>
                    {partido.hora && (
                      <View style={styles.infoRow}>
                        <Clock size={16} color={Colors.textSecondary} />
                        <Text style={styles.infoText}>{partido.hora}</Text>
                      </View>
                    )}
                    {partido.ubicacion?.direccion && (
                      <View style={styles.infoRow}>
                        <MapPin size={16} color={Colors.textSecondary} />
                        <Text style={styles.infoText}>{partido.ubicacion.direccion}</Text>
                      </View>
                    )}
                  </View>
                  
                  {partido.estado === 'Finalizado' && (
                    <View style={styles.resultadoContainer}>
                      <Text style={styles.resultado}>
                        {partido.golesLocal || 0} - {partido.golesVisitante || 0}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </SuperCard>
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
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  chipTextActive: {
    color: 'white',
  },
  partidoCard: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  partidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  partidoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  estadoFinalizado: {
    backgroundColor: Colors.success,
  },
  partidoInfo: {
    marginBottom: 8,
  },
  resultado: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  emptyActions: {
    width: '100%',
  },
});