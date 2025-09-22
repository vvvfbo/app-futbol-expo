import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, Building2, Users, Trophy, MapPin, Calendar, RefreshCw } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';
import { Club } from '@/types';

export default function ClubesScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { clubes, obtenerClubesPorEntrenador, equipos, torneos, amistosos, isLoading, crearClub, limpiarTodosLosDatos, recargarDatos } = useData();

  console.log('🏢 === CLUBES DEBUG INFO ===');
  console.log('- User ID:', user?.id);
  console.log('- User rol:', user?.rol);
  console.log('- Total clubes en sistema:', clubes.length);
  console.log('- isLoading:', isLoading);
  console.log('- Todos los clubes:', clubes.map(c => ({ 
    id: c.id, 
    nombre: c.nombre, 
    entrenadorId: c.entrenadorId,
    totalEquipos: c.estadisticas?.totalEquipos || 0
  })));

  const misClubesTotales = obtenerClubesPorEntrenador(user?.id || '');
  console.log('- Mis clubes filtrados:', misClubesTotales.length);
  console.log('- Clubes que coinciden con user ID:', clubes.filter(c => c.entrenadorId === user?.id).map(c => ({ 
    id: c.id, 
    nombre: c.nombre, 
    entrenadorId: c.entrenadorId 
  })));
  console.log('🏢 === FIN DEBUG INFO ===');



  const crearNuevoClub = () => {
    router.push('/crear-club');
  };

  const crearClubDePrueba = async () => {
    if (!user?.id) return;
    
    try {
      const clubPrueba = {
        nombre: 'Club de Prueba',
        descripcion: 'Club creado para pruebas',
        ubicacion: {
          direccion: 'Calle Falsa 123',
          ciudad: 'Madrid'
        },
        entrenadorId: user.id,
        categorias: {
          'Senior': {
            nombre: 'Senior' as const,
            equipos: []
          }
        },
        estadisticas: {
          totalEquipos: 0,
          torneosParticipados: 0,
          amistososJugados: 0
        }
      };
      
      const clubId = await crearClub(clubPrueba);
      console.log('✅ Club de prueba creado con ID:', clubId);
    } catch (error) {
      console.error('❌ Error creando club de prueba:', error);
    }
  };

  const limpiarDatos = async () => {
    try {
      await limpiarTodosLosDatos();
      console.log('✅ Todos los datos han sido eliminados');
    } catch (error) {
      console.error('❌ Error limpiando datos:', error);
    }
  };

  const verDetalleClub = (clubId: string) => {
    console.log('🔍 ClubesScreen - Navegando a club ID:', clubId);
    router.push(`/(tabs)/(clubes)/${clubId}`);
  };

  const obtenerEstadisticasClub = (club: Club) => {
    const equiposDelClub = equipos.filter(e => e.clubId === club.id);
    const torneosDelClub = torneos.filter(t => 
      equiposDelClub.some(e => t.equiposIds.includes(e.id))
    );
    const amistososDelClub = amistosos.filter(a => 
      equiposDelClub.some(e => e.id === a.equipoLocalId || e.id === a.equipoVisitanteId)
    );

    return {
      totalEquipos: equiposDelClub.length,
      torneosActivos: torneosDelClub.filter(t => t.estado === 'En curso').length,
      amistososPendientes: amistososDelClub.filter(a => a.estado === 'Confirmado').length,
    };
  };

  if (misClubesTotales.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
        >
          <Building2 size={80} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No tienes clubes creados</Text>
          <Text style={styles.emptySubtitle}>
            Crea tu primer club para organizar equipos por categorías
          </Text>
          
          {/* Debug info para desarrollo */}
          {__DEV__ && (
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>Debug Info:</Text>
              <Text style={styles.debugText}>User ID: {user?.id || 'null'}</Text>
              <Text style={styles.debugText}>Total clubes: {clubes.length}</Text>
              <Text style={styles.debugText}>Mis clubes: {misClubesTotales.length}</Text>
              {clubes.length > 0 && (
                <Text style={styles.debugText}>Clubes en sistema: {clubes.map(c => c.nombre).join(', ')}</Text>
              )}
            </View>
          )}
          <TouchableOpacity style={styles.createButton} onPress={crearNuevoClub}>
            <Plus size={24} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Crear Mi Primer Club</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.createButton, { backgroundColor: Colors.secondary, marginTop: 16 }]} onPress={crearClubDePrueba}>
            <Plus size={24} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Crear Club de Prueba</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.createButton, { backgroundColor: Colors.error, marginTop: 16 }]} onPress={limpiarDatos}>
            <Text style={styles.createButtonText}>Limpiar Todos los Datos</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Mis Clubes</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.refreshButton} onPress={recargarDatos}>
              <RefreshCw size={18} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={crearNuevoClub}>
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.clubesList}>
          {misClubesTotales.map((club) => {
            const stats = obtenerEstadisticasClub(club);
            return (
              <TouchableOpacity
                key={club.id}
                style={styles.clubCard}
                onPress={() => verDetalleClub(club.id)}
              >
                <View style={styles.clubHeader}>
                  <View style={styles.clubInfo}>
                    <Text style={styles.clubName}>{club.nombre}</Text>
                    <View style={styles.locationContainer}>
                      <MapPin size={14} color={Colors.textLight} />
                      <Text style={styles.clubLocation}>{club.ubicacion.ciudad}</Text>
                    </View>
                  </View>
                  {club.escudo && (
                    <View style={styles.escudoContainer}>
                      <Text style={styles.escudoPlaceholder}>🏛️</Text>
                    </View>
                  )}
                </View>

                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Users size={16} color={Colors.primary} />
                    <Text style={styles.statNumber}>{stats.totalEquipos}</Text>
                    <Text style={styles.statLabel}>Equipos</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Trophy size={16} color={Colors.secondary} />
                    <Text style={styles.statNumber}>{stats.torneosActivos}</Text>
                    <Text style={styles.statLabel}>Torneos</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Calendar size={16} color={Colors.warning} />
                    <Text style={styles.statNumber}>{stats.amistososPendientes}</Text>
                    <Text style={styles.statLabel}>Amistosos</Text>
                  </View>
                </View>

                {club.descripcion && (
                  <Text style={styles.clubDescription} numberOfLines={2}>
                    {club.descripcion}
                  </Text>
                )}

                <View style={styles.categoriesPreview}>
                  <Text style={styles.categoriesTitle}>Categorías:</Text>
                  <View style={styles.categoriesList}>
                    {Object.keys(club.categorias).slice(0, 3).map((categoria) => (
                      <View key={categoria} style={styles.categoryTag}>
                        <Text style={styles.categoryText}>{categoria}</Text>
                      </View>
                    ))}
                    {Object.keys(club.categorias).length > 3 && (
                      <View style={styles.categoryTag}>
                        <Text style={styles.categoryText}>
                          +{Object.keys(club.categorias).length - 3}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
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
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 32,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 17,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 26,
  },
  createButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 40,
    gap: 10,
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  clubesList: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  clubCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: Colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  clubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clubLocation: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  escudoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  escudoPlaceholder: {
    fontSize: 28,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statItem: {
    alignItems: 'center',
    gap: 6,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  clubDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  categoriesPreview: {
    marginTop: 12,
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  debugInfo: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  debugText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshButton: {
    backgroundColor: Colors.surface,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
});