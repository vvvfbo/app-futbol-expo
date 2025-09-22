import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Trophy, Search, MapPin, Bell, BellOff } from 'lucide-react-native';
import { useData } from '@/hooks/data-context';
import { useAuth } from '@/hooks/auth-context';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { useState } from 'react';
import { CIUDADES, CATEGORIAS } from '@/constants/categories';

export default function TorneosScreen() {
  const { torneos } = useData();
  const { user, suscribirseATorneo, desuscribirseATorneo } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [selectedCiudad, setSelectedCiudad] = useState<string>('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [showAllTournaments, setShowAllTournaments] = useState(false);

  // Filtrar torneos según el rol del usuario
  const getVisibleTorneos = () => {
    if (user?.rol === 'entrenador') {
      // Los entrenadores ven todos los torneos
      return torneos;
    } else if (user?.rol === 'espectador') {
      if (showAllTournaments) {
        // Mostrar todos los torneos para suscribirse
        return torneos;
      } else {
        // Solo mostrar torneos suscritos
        const torneosSubscritos = user.torneosSubscritos || [];
        return torneos.filter(torneo => torneosSubscritos.includes(torneo.id));
      }
    }
    return torneos;
  };

  const filteredTorneos = getVisibleTorneos().filter(torneo => {
    const matchesSearch = torneo.nombre.toLowerCase().includes(searchText.toLowerCase());
    const matchesCiudad = !selectedCiudad || torneo.ciudad === selectedCiudad;
    const matchesCategoria = !selectedCategoria || torneo.categoria === selectedCategoria;
    return matchesSearch && matchesCiudad && matchesCategoria;
  });

  const handleSuscripcion = async (torneoId: string) => {
    if (!user || user.rol !== 'espectador') return;
    
    const isSubscribed = user.torneosSubscritos?.includes(torneoId) || false;
    
    try {
      if (isSubscribed) {
        await desuscribirseATorneo(torneoId);
        Alert.alert('Éxito', 'Te has desuscrito del torneo');
      } else {
        await suscribirseATorneo(torneoId);
        Alert.alert('Éxito', 'Te has suscrito al torneo');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la suscripción');
    }
  };

  const isSubscribed = (torneoId: string) => {
    return user?.torneosSubscritos?.includes(torneoId) || false;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar torneos..."
            placeholderTextColor={Colors.textLight}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterChip, !selectedCiudad && styles.filterChipActive]}
          onPress={() => setSelectedCiudad('')}
        >
          <Text style={[styles.filterChipText, !selectedCiudad && styles.filterChipTextActive]}>
            Todas las ciudades
          </Text>
        </TouchableOpacity>
        {CIUDADES.map(ciudad => (
          <TouchableOpacity
            key={ciudad}
            style={[styles.filterChip, selectedCiudad === ciudad && styles.filterChipActive]}
            onPress={() => setSelectedCiudad(ciudad)}
          >
            <MapPin size={14} color={selectedCiudad === ciudad ? 'white' : Colors.textLight} />
            <Text style={[styles.filterChipText, selectedCiudad === ciudad && styles.filterChipTextActive]}>
              {ciudad}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterChip, !selectedCategoria && styles.filterChipActive]}
          onPress={() => setSelectedCategoria('')}
        >
          <Text style={[styles.filterChipText, !selectedCategoria && styles.filterChipTextActive]}>
            Todas las categorías
          </Text>
        </TouchableOpacity>
        {CATEGORIAS.map(categoria => (
          <TouchableOpacity
            key={categoria}
            style={[styles.filterChip, selectedCategoria === categoria && styles.filterChipActive]}
            onPress={() => setSelectedCategoria(categoria)}
          >
            <Trophy size={14} color={selectedCategoria === categoria ? 'white' : Colors.textLight} />
            <Text style={[styles.filterChipText, selectedCategoria === categoria && styles.filterChipTextActive]}>
              {categoria}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {user?.rol === 'espectador' && (
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, !showAllTournaments && styles.toggleButtonActive]}
            onPress={() => setShowAllTournaments(false)}
          >
            <Text style={[styles.toggleButtonText, !showAllTournaments && styles.toggleButtonTextActive]}>
              Mis Torneos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, showAllTournaments && styles.toggleButtonActive]}
            onPress={() => setShowAllTournaments(true)}
          >
            <Text style={[styles.toggleButtonText, showAllTournaments && styles.toggleButtonTextActive]}>
              Explorar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.torneosContainer} showsVerticalScrollIndicator={false}>
        {filteredTorneos.length > 0 ? (
          filteredTorneos.map(torneo => (
            <View key={torneo.id} style={styles.torneoCard}>
              <TouchableOpacity
                style={styles.torneoContent}
                onPress={() => {
                  // Permitir acceso a todos los torneos para ver información básica
                  // Solo restringir funciones específicas dentro del torneo
                  router.push(`/(tabs)/(torneos)/${torneo.id}`);
                }}
              >
                <View style={styles.torneoHeader}>
                  <Text style={styles.torneoName}>{torneo.nombre}</Text>
                  <View style={[styles.estadoBadge, { backgroundColor: torneo.estado === 'En curso' ? Colors.primary : Colors.textLight }]}>
                    <Text style={styles.estadoBadgeText}>{torneo.estado}</Text>
                  </View>
                </View>
                <Text style={styles.torneoInfo}>
                  {torneo.ciudad} • {torneo.categoria}
                </Text>
                <Text style={styles.torneoDate}>
                  Inicio: {torneo.fechaInicio}
                </Text>
                <Text style={styles.torneoTeams}>
                  {torneo.equiposIds.length} equipos participantes
                </Text>
              </TouchableOpacity>
              
              {user?.rol === 'espectador' && (
                <TouchableOpacity
                  style={[styles.subscribeButton, isSubscribed(torneo.id) && styles.subscribeButtonActive]}
                  onPress={() => handleSuscripcion(torneo.id)}
                >
                  {isSubscribed(torneo.id) ? (
                    <BellOff size={20} color="white" />
                  ) : (
                    <Bell size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Trophy size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>
              {user?.rol === 'espectador' && !showAllTournaments 
                ? 'No tienes torneos suscritos' 
                : 'No se encontraron torneos'
              }
            </Text>
            <Text style={styles.emptySubtext}>
              {user?.rol === 'espectador' && !showAllTournaments 
                ? 'Ve a "Explorar" para suscribirte a torneos' 
                : 'Prueba ajustando los filtros de búsqueda'
              }
            </Text>
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
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    marginRight: 8,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  filterChipTextActive: {
    color: 'white',
  },
  torneosContainer: {
    flex: 1,
    padding: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
  toggleButtonTextActive: {
    color: 'white',
  },
  torneoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  torneoContent: {
    flex: 1,
    padding: 16,
  },
  subscribeButton: {
    padding: 12,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  subscribeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  torneoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  torneoName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  estadoBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  torneoInfo: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  torneoDate: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  torneoTeams: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
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
});