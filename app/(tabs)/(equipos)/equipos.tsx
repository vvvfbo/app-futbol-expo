import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, RefreshCw } from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';
import Colors from '@/constants/colors';
import { router } from 'expo-router';

export default function EquiposScreen() {
  const { user } = useAuth();
  const { equipos, recargarDatos } = useData();
  const insets = useSafeAreaInsets();
  
  const isEntrenador = user?.rol === 'entrenador';
  const equiposToShow = isEntrenador 
    ? equipos.filter(e => e.entrenadorId === user?.id)
    : equipos;
    
  console.log('🏆 === EQUIPOS SCREEN DEBUG ===');
  console.log('🏆 User:', { id: user?.id, rol: user?.rol });
  console.log('🏆 Is entrenador:', isEntrenador);
  console.log('🏆 Total equipos en sistema:', equipos.length);
  console.log('🏆 Equipos a mostrar:', equiposToShow.length);
  console.log('🏆 Todos los equipos:', equipos.map(e => ({ 
    id: e.id, 
    nombre: e.nombre, 
    entrenadorId: e.entrenadorId,
    clubId: e.clubId 
  })));
  console.log('🏆 Equipos filtrados:', equiposToShow.map(e => ({ 
    id: e.id, 
    nombre: e.nombre, 
    entrenadorId: e.entrenadorId 
  })));
  console.log('🏆 === FIN DEBUG ===');

  console.log('🏆 === EQUIPOS DEBUG INFO ===');
  console.log('- User ID:', user?.id);
  console.log('- User rol:', user?.rol);
  console.log('- Is entrenador:', isEntrenador);
  console.log('- Total equipos en sistema:', equipos.length);
  console.log('- Equipos filtrados para mostrar:', equiposToShow.length);
  console.log('- Todos los equipos:', equipos.map(e => ({ 
    id: e.id, 
    nombre: e.nombre, 
    entrenadorId: e.entrenadorId,
    clubId: e.clubId,
    ciudad: e.ciudad 
  })));
  console.log('- Equipos que coinciden con user ID:', equipos.filter(e => e.entrenadorId === user?.id).map(e => ({ 
    id: e.id, 
    nombre: e.nombre, 
    entrenadorId: e.entrenadorId 
  })));
  console.log('🏆 === FIN DEBUG INFO ===');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEntrenador ? 'Mis Equipos' : 'Todos los Equipos'}
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={recargarDatos}
          >
            <RefreshCw size={18} color={Colors.primary} />
          </TouchableOpacity>

        </View>
      </View>

      <ScrollView style={styles.equiposContainer} showsVerticalScrollIndicator={false}>
        {equiposToShow.length > 0 ? (
          equiposToShow.map(equipo => (
            <TouchableOpacity
              key={equipo.id}
              style={styles.equipoCard}
              onPress={() => router.push(`/(tabs)/(equipos)/${equipo.id}`)}
            >
              <View style={styles.equipoHeader}>
                {equipo.escudo && (
                  <Image source={{ uri: equipo.escudo }} style={styles.escudoImage} />
                )}
                <View style={styles.equipoInfo}>
                  <Text style={styles.equipoName}>{equipo.nombre}</Text>
                  <Text style={styles.equipoDetails}>
                    {equipo.ciudad} • {equipo.categoria} • {equipo.tipoFutbol}
                  </Text>
                  <Text style={styles.equipoPlayers}>
                    {equipo.jugadores?.length || 0} jugadores
                  </Text>
                  {!isEntrenador && (
                    <Text style={styles.equipoCoach}>
                      Entrenador: {equipo.entrenadorId}
                    </Text>
                  )}
                </View>
                <View style={styles.colorIndicator}>
                  <View 
                    style={[
                      styles.colorDot, 
                      { backgroundColor: equipo.colores.principal }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.colorDot, 
                      { backgroundColor: equipo.colores.secundario }
                    ]} 
                  />
                </View>
              </View>
              
              {equipo.jugadores && equipo.jugadores.length > 0 && (
                <View style={styles.playersPreview}>
                  <Text style={styles.playersPreviewTitle}>Últimos jugadores:</Text>
                  {equipo.jugadores.slice(0, 3).map(jugador => (
                    <Text key={jugador.numero} style={styles.playerPreviewItem}>
                      #{jugador.numero} {jugador.nombre} ({jugador.posicion})
                    </Text>
                  ))}
                  {equipo.jugadores.length > 3 && (
                    <Text style={styles.morePlayersText}>
                      y {equipo.jugadores.length - 3} más...
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Users size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>
              {isEntrenador ? 'No tienes equipos creados' : 'No hay equipos disponibles'}
            </Text>
            <Text style={styles.emptySubtext}>
              {isEntrenador 
                ? 'Crea un club y agrega equipos desde allí'
                : 'Los entrenadores pueden crear equipos desde sus clubes'
              }
            </Text>
            
            {/* Debug info para desarrollo */}
            {__DEV__ && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugText}>Debug Info:</Text>
                <Text style={styles.debugText}>User ID: {user?.id || 'null'}</Text>
                <Text style={styles.debugText}>User rol: {user?.rol || 'null'}</Text>
                <Text style={styles.debugText}>Total equipos: {equipos.length}</Text>
                <Text style={styles.debugText}>Es entrenador: {isEntrenador ? 'Sí' : 'No'}</Text>
                <Text style={styles.debugText}>Equipos a mostrar: {equiposToShow.length}</Text>
                {equipos.length > 0 && (
                  <Text style={styles.debugText}>Equipos en sistema: {equipos.map(e => `${e.nombre}(${e.entrenadorId})`).join(', ')}</Text>
                )}
                {equiposToShow.length > 0 && (
                  <Text style={styles.debugText}>Equipos filtrados: {equiposToShow.map(e => e.nombre).join(', ')}</Text>
                )}
              </View>
            )}
            

          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  equiposContainer: {
    flex: 1,
    padding: 16,
  },
  equipoCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  equipoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  escudoImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  equipoInfo: {
    flex: 1,
  },
  equipoName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  equipoDetails: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  equipoPlayers: {
    fontSize: 14,
    color: Colors.textLight,
  },
  equipoCoach: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
    fontStyle: 'italic',
  },
  colorIndicator: {
    flexDirection: 'row',
    gap: 6,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  playersPreview: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  playersPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  playerPreviewItem: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 2,
  },
  morePlayersText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textLight,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  debugInfo: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  debugText: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshButton: {
    backgroundColor: Colors.surface,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
});