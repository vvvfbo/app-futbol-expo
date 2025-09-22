import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trophy, Calendar, Users, Plus, Search, Heart, Building2, MessageCircle, Bell } from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';
import Colors from '@/constants/colors';
import { GlobalStyles, createButtonStyle, createButtonTextStyle } from '@/constants/styles';
import { router } from 'expo-router';
import { useMemo } from 'react';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { 
    torneos, 
    equipos, 
    partidos,
    amistosos,
    obtenerEquiposPorEntrenador,
    obtenerTorneosPorCreador,
    obtenerClubesPorEntrenador
  } = useData();
  
  const isEntrenador = user?.rol === 'entrenador';
  const isEspectador = user?.rol === 'espectador';



  const torneosRelevantes = useMemo(() => {
    if (isEntrenador && user) {
      return obtenerTorneosPorCreador(user.id).filter(t => t.estado !== 'Finalizado').slice(0, 3);
    } else if (isEspectador && user) {
      const torneosSubscritos = user.torneosSubscritos || [];
      return torneos.filter(t => torneosSubscritos.includes(t.id) && t.estado !== 'Finalizado').slice(0, 3);
    }
    return torneos.filter(t => t.estado === 'En curso').slice(0, 3);
  }, [user, torneos, isEntrenador, isEspectador, obtenerTorneosPorCreador]);

  const proximosPartidos = useMemo(() => {
    if (isEntrenador && user) {
      const misEquipos = obtenerEquiposPorEntrenador(user.id);
      return partidos
        .filter(p => 
          p.estado === 'Pendiente' && 
          misEquipos.some(e => e.id === p.equipoLocalId || e.id === p.equipoVisitanteId)
        )
        .slice(0, 5);
    } else if (isEspectador && user) {
      const torneosSubscritos = user.torneosSubscritos || [];
      return partidos
        .filter(p => p.estado === 'Pendiente' && torneosSubscritos.includes(p.torneoId))
        .slice(0, 5);
    }
    return partidos.filter(p => p.estado === 'Pendiente').slice(0, 5);
  }, [user, partidos, isEntrenador, isEspectador, obtenerEquiposPorEntrenador]);

  const misEquipos = useMemo(() => {
    return isEntrenador && user ? obtenerEquiposPorEntrenador(user.id) : [];
  }, [isEntrenador, user, obtenerEquiposPorEntrenador]);

  const misClubes = useMemo(() => {
    return isEntrenador && user ? obtenerClubesPorEntrenador(user.id) : [];
  }, [isEntrenador, user, obtenerClubesPorEntrenador]);

  const disponibilidadesAmistosos = useMemo(() => {
    if (!isEntrenador || !user) return 0;
    const misEquiposIds = obtenerEquiposPorEntrenador(user.id).map(e => e.id);
    return amistosos.filter(a => 
      a.esDisponibilidad && 
      a.estado === 'Disponible' && 
      !misEquiposIds.includes(a.equipoLocalId)
    ).length;
  }, [isEntrenador, user, amistosos, obtenerEquiposPorEntrenador]);

  // Obtener propuestas de amistosos pendientes
  const propuestasPendientes = useMemo(() => {
    if (!user) return 0;
    
    return amistosos.filter(amistoso => {
      return amistoso.estado === 'Propuesto' && amistoso.propuestaA === user.id;
    }).length;
  }, [amistosos, user]);

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top }}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>¡Hola, {user?.nombre}!</Text>
          <Text style={styles.role}>
            {isEntrenador ? 'Entrenador' : 'Espectador'}
          </Text>
        </View>

        {/* Notificaciones importantes */}
        {propuestasPendientes > 0 && (
          <View style={styles.notificationSection}>
            <TouchableOpacity 
              style={styles.notificationBanner}
              onPress={() => router.push('/notificaciones')}
            >
              <View style={styles.notificationContent}>
                <MessageCircle size={24} color="#FFFFFF" />
                <View style={styles.notificationText}>
                  <Text style={styles.notificationTitle}>
                    {propuestasPendientes} propuesta{propuestasPendientes > 1 ? 's' : ''} de amistoso{propuestasPendientes > 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.notificationSubtitle}>
                    Toca para revisar y responder
                  </Text>
                </View>
              </View>
              <Bell size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {isEntrenador && (
          <View style={GlobalStyles.section}>
            <Text style={GlobalStyles.sectionTitle}>Acciones Rápidas</Text>
            <View style={GlobalStyles.buttonRow}>
              <TouchableOpacity 
                style={[...createButtonStyle('medium', 'primary'), GlobalStyles.buttonWithIcon, { flex: 1 }]}
                onPress={() => router.push('/crear-club')}
              >
                <Building2 size={18} color="white" />
                <Text style={createButtonTextStyle('primary')}>Crear Club</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[...createButtonStyle('medium', 'secondary'), GlobalStyles.buttonWithIcon, { flex: 1 }]}
                onPress={() => router.push('/crear-torneo')}
              >
                <Plus size={18} color="white" />
                <Text style={createButtonTextStyle('secondary')}>Crear Torneo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isEntrenador && (
          <View style={styles.amistososSection}>
            <View style={styles.amistososHeader}>
              <Heart size={20} color={Colors.primary} />
              <Text style={styles.amistososTitle}>Partidos Amistosos</Text>
            </View>
            {disponibilidadesAmistosos > 0 && (
              <View style={styles.disponibilidadesInfo}>
                <Text style={styles.disponibilidadesText}>
                  {disponibilidadesAmistosos} disponibilidades encontradas
                </Text>
              </View>
            )}
            <View style={GlobalStyles.buttonRow}>
              <TouchableOpacity 
                style={[...createButtonStyle('compact', 'outline'), GlobalStyles.buttonWithIcon, { flex: 1 }]}
                onPress={() => router.push('/(tabs)/(amistosos)/buscar')}
              >
                <Search size={16} color={Colors.primary} />
                <Text style={createButtonTextStyle('outline')}>Buscar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[...createButtonStyle('compact', 'ghost'), GlobalStyles.buttonWithIcon, { flex: 1 }]}
                onPress={() => router.push('/(tabs)/(amistosos)/crear-disponibilidad')}
              >
                <Heart size={16} color={Colors.primary} />
                <Text style={createButtonTextStyle('ghost')}>Ofrecer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Trophy size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>
              {isEntrenador ? 'Mis Torneos' : 'Torneos Relevantes'}
            </Text>
          </View>
          {torneosRelevantes.length > 0 ? (
            torneosRelevantes.map((torneo) => (
              <TouchableOpacity 
                key={torneo.id} 
                style={styles.card}
                onPress={() => router.push(`/(tabs)/(torneos)/${torneo.id}`)}
              >
                <Text style={styles.cardTitle}>{torneo.nombre}</Text>
                <Text style={styles.cardSubtitle}>
                  {torneo.ciudad} • {torneo.categoria}
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{torneo.estado}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>
              {isEntrenador ? 'No tienes torneos creados' : 'No hay torneos disponibles'}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Próximos Partidos</Text>
          </View>
          {proximosPartidos.length > 0 ? (
            proximosPartidos.map(partido => {
              const equipoLocal = equipos.find(e => e.id === partido.equipoLocalId);
              const equipoVisitante = equipos.find(e => e.id === partido.equipoVisitanteId);
              return (
                <TouchableOpacity 
                  key={partido.id} 
                  style={styles.card}
                  onPress={() => router.push(`/partido/${partido.id}`)}
                >
                  <Text style={styles.cardTitle}>
                    {equipoLocal?.nombre} vs {equipoVisitante?.nombre}
                  </Text>
                  <Text style={styles.cardSubtitle}>
                    {partido.fecha} • {partido.hora}
                  </Text>
                  <Text style={styles.cardDetail}>Jornada {partido.jornada}</Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No hay partidos programados</Text>
          )}
        </View>

        {isEntrenador && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Building2 size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Mis Clubes</Text>
            </View>
            {misClubes.length > 0 ? (
              misClubes.map(club => {
                const equiposDelClub = equipos.filter(e => e.clubId === club.id);
                return (
                  <TouchableOpacity 
                    key={club.id} 
                    style={styles.card}
                    onPress={() => router.push(`/(tabs)/(clubes)/${club.id}`)}
                  >
                    <Text style={styles.cardTitle}>{club.nombre}</Text>
                    <Text style={styles.cardSubtitle}>
                      {club.ubicacion.ciudad} • {equiposDelClub.length} equipos
                    </Text>
                    <Text style={styles.cardDetail}>
                      {Object.keys(club.categorias).join(', ')}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No tienes clubes creados</Text>
            )}
          </View>
        )}

        {isEntrenador && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Users size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Mis Equipos</Text>
            </View>
            {misEquipos.length > 0 ? (
              misEquipos.map(equipo => (
                <TouchableOpacity 
                  key={equipo.id} 
                  style={styles.card}
                  onPress={() => router.push(`/(tabs)/(equipos)/${equipo.id}`)}
                >
                  <Text style={styles.cardTitle}>{equipo.nombre}</Text>
                  <Text style={styles.cardSubtitle}>
                    {equipo.ciudad} • {equipo.categoria || 'Sin categoría'} • {equipo.tipoFutbol || 'F11'}
                  </Text>
                  <Text style={styles.cardDetail}>
                    {equipo.jugadores?.length || 0} jugadores
                    {equipo.clubId && ' • Pertenece a un club'}
                  </Text>
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
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No tienes equipos creados</Text>
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
    padding: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  role: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 6,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 6,
  },
  badge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  colorIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 4,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 24,
    fontWeight: '500',
  },
  amistososSection: {
    backgroundColor: Colors.surface,
    marginHorizontal: 24,
    marginTop: 12,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  amistososHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  amistososTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  amistososActions: {
    flexDirection: 'row',
    gap: 16,
  },
  amistososButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    gap: 8,
  },
  amistososButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  disponibilidadesInfo: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  disponibilidadesText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  notificationBanner: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationText: {
    marginLeft: 12,
    flex: 1,
  },
  notificationTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  notificationSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  notificationSection: {
    marginBottom: 8,
  },
  quickActionsSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
});