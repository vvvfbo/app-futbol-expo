import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  Users, 
  Trophy, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Plus,
  Edit3,
  Share2,
  Handshake
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';
import { Categoria } from '@/types';

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams();

  const { 
    clubes, 
    equipos, 
    torneos, 
    obtenerAmistososPorEquipo,
    exportarResultadoAmistoso,
    isLoading 
  } = useData();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  console.log('🔍 ClubDetailScreen - ID recibido:', id);
  console.log('🔍 ClubDetailScreen - Clubes disponibles:', clubes.length);
  console.log('🔍 ClubDetailScreen - IDs de clubes:', clubes.map(c => c.id));
  console.log('🔍 ClubDetailScreen - isLoading:', isLoading);

  const club = clubes.find(c => c.id === id);
  console.log('🔍 ClubDetailScreen - Club encontrado:', club ? 'Sí' : 'No');

  const equiposDelClub = useMemo(() => {
    if (!club) return [];
    
    console.log('🔍 === DEBUGGING EQUIPOS DEL CLUB ===');
    console.log('🔍 Club ID buscado:', club.id);
    console.log('🔍 Equipos totales:', equipos.length);
    console.log('🔍 Todos los equipos:', equipos.map(e => ({ 
      id: e.id, 
      nombre: e.nombre, 
      clubId: e.clubId, 
      categoria: e.categoria 
    })));
    
    const equiposConClubId = equipos.filter(e => e.clubId);
    console.log('🔍 Equipos con clubId:', equiposConClubId.length);
    console.log('🔍 Equipos con clubId detalle:', equiposConClubId.map(e => ({ 
      id: e.id, 
      nombre: e.nombre, 
      clubId: e.clubId 
    })));
    
    const equiposFiltrados = equipos.filter(e => {
      const coincide = e.clubId === club.id;
      console.log(`🔍 Equipo ${e.nombre}: clubId=${e.clubId}, buscado=${club.id}, coincide=${coincide}`);
      return coincide;
    });
    
    console.log('🔍 RESULTADO: Equipos filtrados para el club:', equiposFiltrados.length);
    console.log('🔍 RESULTADO: Equipos filtrados detalle:', equiposFiltrados.map(e => ({ 
      id: e.id, 
      nombre: e.nombre, 
      categoria: e.categoria 
    })));
    console.log('🔍 === FIN DEBUGGING ===');
    
    return equiposFiltrados;
  }, [equipos, club?.id, isLoading]);

  const torneosDelClub = useMemo(() => {
    return torneos.filter(t => 
      equiposDelClub.some(e => t.equiposIds.includes(e.id))
    );
  }, [torneos, equiposDelClub]);

  const amistososDelClub = useMemo(() => {
    const todosLosAmistosos: any[] = [];
    equiposDelClub.forEach(equipo => {
      const amistososEquipo = obtenerAmistososPorEquipo(equipo.id);
      amistososEquipo.forEach(amistoso => {
        todosLosAmistosos.push({
          ...amistoso,
          equipoNombre: equipo.nombre
        });
      });
    });
    return todosLosAmistosos;
  }, [equiposDelClub, obtenerAmistososPorEquipo]);

  const equiposPorCategoria = useMemo(() => {
    if (!club) return {};
    const resultado: { [categoria: string]: any[] } = {};
    
    Object.keys(club.categorias).forEach(categoria => {
      resultado[categoria] = equiposDelClub.filter(e => e.categoria === categoria);
    });
    
    return resultado;
  }, [club, equiposDelClub]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando club...</Text>
        </View>
      </View>
    );
  }

  if (!club) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Club no encontrado</Text>
          <Text style={styles.errorSubtext}>ID buscado: {id}</Text>
          <Text style={styles.errorSubtext}>Clubes disponibles: {clubes.length}</Text>
          <Text style={styles.errorSubtext}>IDs disponibles: {clubes.map(c => c.id).join(', ')}</Text>
          <TouchableOpacity 
            style={styles.backToListButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backToListButtonText}>Volver a la lista</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const crearEquipoEnCategoria = (categoria: Categoria) => {
    router.push({
      pathname: '/crear-equipo',
      params: { clubId: club.id, categoria }
    });
  };

  const verEquipo = (equipoId: string) => {
    router.push(`/(tabs)/(equipos)/${equipoId}`);
  };

  const buscarAmistosos = () => {
    router.push('/buscar-amistosos');
  };

  const compartirClub = async () => {
    try {
      const mensaje = `🏛️ ${club.nombre}\n\n📍 ${club.ubicacion.ciudad}\n👥 ${equiposDelClub.length} equipos\n🏆 ${torneosDelClub.length} torneos\n🤝 ${amistososDelClub.length} amistosos\n\n${club.descripcion || ''}\n\n#FutbolApp #Club`;
      
      await Share.share({
        message: mensaje,
        title: `Club ${club.nombre}`,
      });
    } catch (error) {
      console.error('Error sharing club:', error);
    }
  };

  const exportarAmistoso = async (amistosoId: string) => {
    try {
      const resultado = await exportarResultadoAmistoso(amistosoId);
      await Share.share({
        message: resultado,
        title: 'Resultado del Amistoso',
      });
    } catch (error) {
      console.error('Error exporting amistoso:', error);
      Alert.alert('Error', 'No se pudo exportar el resultado del amistoso');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header del Club */}
        <View style={styles.clubHeader}>
          <View style={styles.clubInfo}>
            <Text style={styles.clubName}>{club.nombre}</Text>
            <View style={styles.locationContainer}>
              <MapPin size={16} color={Colors.textLight} />
              <Text style={styles.clubLocation}>{club.ubicacion.ciudad}</Text>
            </View>
            {club.descripcion && (
              <Text style={styles.clubDescription}>{club.descripcion}</Text>
            )}
          </View>
          
          <View style={styles.clubActions}>
            <TouchableOpacity style={styles.actionButton} onPress={compartirClub}>
              <Share2 size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Edit3 size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Estadísticas del Club */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Users size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{equiposDelClub.length}</Text>
            <Text style={styles.statLabel}>Equipos</Text>
          </View>
          <View style={styles.statCard}>
            <Trophy size={24} color={Colors.secondary} />
            <Text style={styles.statNumber}>{torneosDelClub.length}</Text>
            <Text style={styles.statLabel}>Torneos</Text>
          </View>
          <View style={styles.statCard}>
            <Calendar size={24} color={Colors.warning} />
            <Text style={styles.statNumber}>{amistososDelClub.length}</Text>
            <Text style={styles.statLabel}>Amistosos</Text>
          </View>
        </View>

        {/* Información de Contacto */}
        {(club.telefono || club.email) && (
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Contacto</Text>
            {club.telefono && (
              <View style={styles.contactItem}>
                <Phone size={16} color={Colors.textLight} />
                <Text style={styles.contactText}>{club.telefono}</Text>
              </View>
            )}
            {club.email && (
              <View style={styles.contactItem}>
                <Mail size={16} color={Colors.textLight} />
                <Text style={styles.contactText}>{club.email}</Text>
              </View>
            )}
          </View>
        )}

        {/* Navegación por Categorías */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <TouchableOpacity
              style={[
                styles.categoryTab,
                selectedCategory === null && styles.categoryTabActive
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[
                styles.categoryTabText,
                selectedCategory === null && styles.categoryTabTextActive
              ]}>
                Todas
              </Text>
            </TouchableOpacity>
            {Object.keys(club.categorias).map((categoria) => (
              <TouchableOpacity
                key={categoria}
                style={[
                  styles.categoryTab,
                  selectedCategory === categoria && styles.categoryTabActive
                ]}
                onPress={() => setSelectedCategory(categoria)}
              >
                <Text style={[
                  styles.categoryTabText,
                  selectedCategory === categoria && styles.categoryTabTextActive
                ]}>
                  {categoria}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Equipos por Categoría */}
        <View style={styles.teamsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory ? `Equipos - ${selectedCategory}` : 'Todos los Equipos'}
            </Text>
            <TouchableOpacity 
              style={[styles.addTeamButton, !selectedCategory && styles.addTeamButtonDisabled]}
              onPress={() => selectedCategory && crearEquipoEnCategoria(selectedCategory as Categoria)}
              disabled={!selectedCategory}
            >
              <Plus size={16} color={selectedCategory ? '#FFFFFF' : Colors.textLight} />
            </TouchableOpacity>
          </View>

          {selectedCategory ? (
            equiposPorCategoria[selectedCategory]?.length > 0 ? (
              equiposPorCategoria[selectedCategory].map((equipo) => (
                <TouchableOpacity
                  key={equipo.id}
                  style={styles.teamCard}
                  onPress={() => verEquipo(equipo.id)}
                >
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName}>{equipo.nombre}</Text>
                    <Text style={styles.teamCategory}>{equipo.categoria} • {equipo.tipoFutbol}</Text>
                    <Text style={styles.teamStats}>
                      {equipo.jugadores?.length || 0} jugadores
                    </Text>
                  </View>
                  <View style={styles.teamEscudo}>
                    <Text style={styles.escudoPlaceholder}>⚽</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyCategory}>
                <Users size={40} color={Colors.textLight} />
                <Text style={styles.emptyCategoryText}>
                  No hay equipos en {selectedCategory}
                </Text>
                <TouchableOpacity
                  style={styles.createTeamButton}
                  onPress={() => crearEquipoEnCategoria(selectedCategory as Categoria)}
                >
                  <Plus size={16} color="#FFFFFF" />
                  <Text style={styles.createTeamButtonText}>Crear Equipo</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            equiposDelClub.map((equipo) => (
              <TouchableOpacity
                key={equipo.id}
                style={styles.teamCard}
                onPress={() => verEquipo(equipo.id)}
              >
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{equipo.nombre}</Text>
                  <Text style={styles.teamCategory}>{equipo.categoria} • {equipo.tipoFutbol}</Text>
                  <Text style={styles.teamStats}>
                    {equipo.jugadores?.length || 0} jugadores
                  </Text>
                </View>
                <View style={styles.teamEscudo}>
                  <Text style={styles.escudoPlaceholder}>⚽</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Sección de Amistosos */}
        <View style={styles.amistososSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Amistosos Recientes</Text>
            <TouchableOpacity style={styles.searchFriendlyButton} onPress={buscarAmistosos}>
              <Handshake size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {amistososDelClub.slice(0, 3).map((amistoso) => {
            const equipoLocal = equipos.find(e => e.id === amistoso.equipoLocalId);
            const equipoVisitante = equipos.find(e => e.id === amistoso.equipoVisitanteId);
            
            return (
              <View key={amistoso.id} style={styles.amistosoCard}>
                <View style={styles.amistosoHeader}>
                  <Text style={styles.amistosoDate}>{amistoso.fecha}</Text>
                  <View style={[
                    styles.amistosoStatus,
                    { backgroundColor: getStatusColor(amistoso.estado) }
                  ]}>
                    <Text style={styles.amistosoStatusText}>{amistoso.estado}</Text>
                  </View>
                </View>
                
                <View style={styles.amistosoTeams}>
                  <Text style={styles.amistosoTeam}>{equipoLocal?.nombre || 'Equipo Local'}</Text>
                  {amistoso.estado === 'Finalizado' && amistoso.golesLocal !== undefined && amistoso.golesVisitante !== undefined ? (
                    <Text style={styles.amistosoScore}>
                      {amistoso.golesLocal} - {amistoso.golesVisitante}
                    </Text>
                  ) : (
                    <Text style={styles.amistosoVs}>vs</Text>
                  )}
                  <Text style={styles.amistosoTeam}>{equipoVisitante?.nombre || 'Por confirmar'}</Text>
                </View>

                <View style={styles.amistosoLocation}>
                  <MapPin size={12} color={Colors.textLight} />
                  <Text style={styles.amistosoLocationText}>{amistoso.ubicacion.direccion}</Text>
                </View>

                {amistoso.estado === 'Finalizado' && (
                  <TouchableOpacity
                    style={styles.exportButton}
                    onPress={() => exportarAmistoso(amistoso.id)}
                  >
                    <Share2 size={14} color={Colors.primary} />
                    <Text style={styles.exportButtonText}>Compartir Resultado</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          {amistososDelClub.length === 0 && (
            <View style={styles.emptyAmistosos}>
              <Handshake size={40} color={Colors.textLight} />
              <Text style={styles.emptyAmistososText}>No hay amistosos programados</Text>
              <TouchableOpacity style={styles.searchFriendlyButtonLarge} onPress={buscarAmistosos}>
                <Handshake size={16} color="#FFFFFF" />
                <Text style={styles.searchFriendlyButtonText}>Buscar Amistosos</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function getStatusColor(estado: string): string {
  switch (estado) {
    case 'Disponible': return Colors.success + '20';
    case 'Propuesto': return Colors.warning + '20';
    case 'Confirmado': return Colors.secondary + '20';
    case 'Finalizado': return Colors.textLight + '20';
    case 'Cancelado': return Colors.error + '20';
    default: return Colors.textLight + '20';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  errorSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 4,
  },
  backToListButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  backToListButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  clubHeader: {
    backgroundColor: Colors.surface,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  clubLocation: {
    fontSize: 14,
    color: Colors.textLight,
  },
  clubDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  clubActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  contactSection: {
    backgroundColor: Colors.surface,
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: Colors.text,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoriesScroll: {
    marginTop: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  categoryTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryTabText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },
  teamsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addTeamButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addTeamButtonDisabled: {
    backgroundColor: Colors.background,
  },
  teamCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  teamCategory: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 2,
  },
  teamStats: {
    fontSize: 12,
    color: Colors.textLight,
  },
  teamEscudo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  escudoPlaceholder: {
    fontSize: 20,
  },
  emptyCategory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCategoryText: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 12,
    marginBottom: 16,
  },
  createTeamButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  createTeamButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  amistososSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchFriendlyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amistosoCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  amistosoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amistosoDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  amistosoStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  amistosoStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text,
  },
  amistosoTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amistosoTeam: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  amistosoScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginHorizontal: 16,
  },
  amistosoVs: {
    fontSize: 12,
    color: Colors.textLight,
    marginHorizontal: 16,
  },
  amistosoLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  amistosoLocationText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  exportButtonText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyAmistosos: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyAmistososText: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 12,
    marginBottom: 16,
  },
  searchFriendlyButtonLarge: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  searchFriendlyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});