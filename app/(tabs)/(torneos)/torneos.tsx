import LocationPicker from '@/components/LocationPicker';
import { CATEGORIAS, CIUDADES } from '@/constants/categories';
import Colors from '@/constants/colors';
import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Bell, BellOff, MapPin, Navigation, Search, Sliders, Trophy } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Función para calcular distancia entre dos puntos (Haversine)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en km
};

export default function TorneosScreen() {
  const { torneos } = useData();
  const { user, suscribirseATorneo, desuscribirseATorneo } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [selectedCiudad, setSelectedCiudad] = useState<string>('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [showAllTournaments, setShowAllTournaments] = useState(false);

  // Estados para búsqueda avanzada
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(10); // km por defecto
  const [useLocationFilter, setUseLocationFilter] = useState(false);
  const [ciudadPersonalizada, setCiudadPersonalizada] = useState('');
  const [usandoCiudadPersonalizada, setUsandoCiudadPersonalizada] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Efecto para obtener ubicación del usuario
  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        // En web usar geolocation API
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
            },
            (error) => console.log('Error obteniendo ubicación:', error),
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
          );
        }
      } else {
        // En mobile usar expo-location
        try {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            let location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced
            });
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            });
          }
        } catch (error) {
          console.log('Error obteniendo ubicación:', error);
        }
      }
    })();
  }, []);

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

    // Filtro por ciudad (predefinida o personalizada)
    let matchesCiudad = true;
    if (usandoCiudadPersonalizada && ciudadPersonalizada) {
      matchesCiudad = torneo.ciudad.toLowerCase().includes(ciudadPersonalizada.toLowerCase());
    } else if (selectedCiudad) {
      matchesCiudad = torneo.ciudad === selectedCiudad;
    }

    const matchesCategoria = !selectedCategoria || torneo.categoria === selectedCategoria;

    // Filtro por distancia
    let matchesLocation = true;
    if (useLocationFilter && userLocation && torneo.ubicacion?.coordenadas) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        torneo.ubicacion.coordenadas.latitud,
        torneo.ubicacion.coordenadas.longitud
      );
      matchesLocation = distance <= searchRadius;
    }

    return matchesSearch && matchesCiudad && matchesCategoria && matchesLocation;
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
        <TouchableOpacity
          style={[styles.advancedFilterButton, showAdvancedFilters && styles.advancedFilterButtonActive]}
          onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          <Sliders size={20} color={showAdvancedFilters ? 'white' : Colors.primary} />
        </TouchableOpacity>
      </View>

      {showAdvancedFilters && (
        <View style={styles.advancedFiltersContainer}>
          {/* Filtro por Ubicación */}
          {userLocation && (
            <View style={styles.locationFilterContainer}>
              <View style={styles.filterHeader}>
                <TouchableOpacity
                  style={[styles.locationToggle, useLocationFilter && styles.locationToggleActive]}
                  onPress={() => setUseLocationFilter(!useLocationFilter)}
                >
                  <Navigation size={16} color={useLocationFilter ? 'white' : Colors.primary} />
                  <Text style={[styles.locationToggleText, useLocationFilter && styles.locationToggleTextActive]}>
                    Cerca de mí
                  </Text>
                </TouchableOpacity>
              </View>

              {useLocationFilter && (
                <View style={styles.radiusContainer}>
                  <Text style={styles.radiusLabel}>Radio: {searchRadius} km</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.radiusOptions}>
                    {[5, 10, 20, 50].map(radius => (
                      <TouchableOpacity
                        key={radius}
                        style={[styles.radiusChip, searchRadius === radius && styles.radiusChipActive]}
                        onPress={() => setSearchRadius(radius)}
                      >
                        <Text style={[styles.radiusChipText, searchRadius === radius && styles.radiusChipTextActive]}>
                          {radius} km
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* Filtro por Ciudad */}
          <View style={styles.cityFilterContainer}>
            <Text style={styles.filterSectionTitle}>Ciudad</Text>

            {/* Ciudades Predefinidas */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
              <TouchableOpacity
                style={[styles.filterChip, !selectedCiudad && !usandoCiudadPersonalizada && styles.filterChipActive]}
                onPress={() => {
                  setSelectedCiudad('');
                  setUsandoCiudadPersonalizada(false);
                  setCiudadPersonalizada('');
                }}
              >
                <Text style={[styles.filterChipText, !selectedCiudad && !usandoCiudadPersonalizada && styles.filterChipTextActive]}>
                  Todas
                </Text>
              </TouchableOpacity>
              {CIUDADES.map(ciudad => (
                <TouchableOpacity
                  key={ciudad}
                  style={[styles.filterChip, !usandoCiudadPersonalizada && selectedCiudad === ciudad && styles.filterChipActive]}
                  onPress={() => {
                    setSelectedCiudad(ciudad);
                    setUsandoCiudadPersonalizada(false);
                    setCiudadPersonalizada('');
                  }}
                >
                  <MapPin size={14} color={!usandoCiudadPersonalizada && selectedCiudad === ciudad ? 'white' : Colors.textLight} />
                  <Text style={[styles.filterChipText, !usandoCiudadPersonalizada && selectedCiudad === ciudad && styles.filterChipTextActive]}>
                    {ciudad}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Ciudad Personalizada */}
            <View style={styles.customCityContainer}>
              <View style={styles.customCityInputContainer}>
                <TextInput
                  style={[styles.customCityInput, usandoCiudadPersonalizada && styles.customCityInputActive]}
                  placeholder="Buscar otra ciudad..."
                  placeholderTextColor={Colors.textLight}
                  value={ciudadPersonalizada}
                  onChangeText={(text) => {
                    setCiudadPersonalizada(text);
                    if (text.length > 0) {
                      setUsandoCiudadPersonalizada(true);
                      setSelectedCiudad('');
                    } else {
                      setUsandoCiudadPersonalizada(false);
                    }
                  }}
                />
                <TouchableOpacity
                  style={styles.locationPickerButton}
                  onPress={() => setShowLocationPicker(true)}
                >
                  <MapPin size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Filtro por Categoría */}
          <View style={styles.categoryFilterContainer}>
            <Text style={styles.filterSectionTitle}>Categoría</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
              <TouchableOpacity
                style={[styles.filterChip, !selectedCategoria && styles.filterChipActive]}
                onPress={() => setSelectedCategoria('')}
              >
                <Text style={[styles.filterChipText, !selectedCategoria && styles.filterChipTextActive]}>
                  Todas
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
          </View>
        </View>
      )}

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

      {showLocationPicker && (
        <LocationPicker
          onLocationSelect={(locationData) => {
            if (locationData.address) {
              const ciudad = locationData.address.split(',')[0].trim();
              setCiudadPersonalizada(ciudad);
              setUsandoCiudadPersonalizada(true);
              setSelectedCiudad('');
            }
            setShowLocationPicker(false);
          }}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
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
  // Estilos para búsqueda avanzada
  advancedFilterButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  advancedFilterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  advancedFiltersContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    padding: 16,
  },
  locationFilterContainer: {
    marginBottom: 16,
  },
  filterHeader: {
    marginBottom: 8,
  },
  locationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'flex-start',
    gap: 6,
  },
  locationToggleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  locationToggleText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  locationToggleTextActive: {
    color: 'white',
  },
  radiusContainer: {
    marginTop: 12,
  },
  radiusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  radiusOptions: {
    maxHeight: 40,
  },
  radiusChip: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  radiusChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  radiusChipText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  radiusChipTextActive: {
    color: 'white',
  },
  cityFilterContainer: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  customCityContainer: {
    marginTop: 8,
  },
  customCityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customCityInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  customCityInputActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  locationPickerButton: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  categoryFilterContainer: {
    marginBottom: 8,
  },
});