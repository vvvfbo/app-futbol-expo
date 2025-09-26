import React, { memo, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Colors from '@/constants/colors';
import { Check, Map, MapPin, Navigation, Search, Target, X } from 'lucide-react-native';

interface LocationPickerProps {
  onClose: () => void;
  onLocationSelect: (location: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  }) => void;
  initialLocation?: string;
}

type NominatimPlace = {
  display_name: string;
  lat: string;
  lon: string;
};

export default memo(function LocationPicker({
  onClose,
  onLocationSelect,
  initialLocation = ''
}: LocationPickerProps) {
  const [searchText, setSearchText] = useState(initialLocation);
  const [searchResults, setSearchResults] = useState<NominatimPlace[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const searchPlaces = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching places:', error);
      Alert.alert('Error', 'No se pudo buscar la ubicación. Verifique su conexión a internet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPlaces(searchText);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const handlePlaceSelect = (place: NominatimPlace) => {
    const coordinates = {
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon)
    };
    setSelectedLocation(coordinates);
    setSearchText(place.display_name);
    setSearchResults([]);
  };

  const handleConfirm = () => {
    if (searchText.trim()) {
      onLocationSelect({
        address: searchText,
        coordinates: selectedLocation || undefined
      });
      onClose();
    }
  };

  const openInMaps = () => {
    if (selectedLocation) {
      const { latitude, longitude } = selectedLocation;
      const url = Platform.select({
        ios: `http://maps.apple.com/?ll=${latitude},${longitude}`,
        android: `geo:${latitude},${longitude}`,
        default: `https://www.google.com/maps?q=${latitude},${longitude}`
      });
      
      if (url) {
        Linking.openURL(url).catch(() => {
          Alert.alert('Error', 'No se pudo abrir la aplicación de mapas');
        });
      }
    }
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Seleccionar Ubicación</Text>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !searchText.trim() && styles.confirmButtonDisabled
            ]}
            onPress={handleConfirm}
            disabled={!searchText.trim()}
          >
            <Check size={20} color={searchText.trim() ? Colors.primary : Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Búsqueda de direcciones */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar dirección o lugar..."
                placeholderTextColor={Colors.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
              />
              {loading && <Text style={styles.loadingText}>Buscando...</Text>}
            </View>

            {searchResults.length > 0 && (
              <View style={styles.resultsContainer}>
                {searchResults.map((place, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.resultItem}
                    onPress={() => handlePlaceSelect(place)}
                  >
                    <MapPin size={16} color={Colors.primary} />
                    <Text style={styles.resultText} numberOfLines={2}>
                      {place.display_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Placeholder del mapa para web */}
          {Platform.OS === 'web' ? (
            <View style={styles.webMapPlaceholder}>
              <MapPin size={48} color={Colors.textSecondary} />
              <Text style={styles.webMapText}>
                Vista de mapa no disponible en web
              </Text>
              <Text style={styles.webMapSubtext}>
                Use la búsqueda de direcciones arriba para encontrar ubicaciones
              </Text>
            </View>
          ) : (
            <View style={styles.nativeMapPlaceholder}>
              <Map size={48} color={Colors.textSecondary} />
              <Text style={styles.webMapText}>
                Mapa interactivo
              </Text>
              <Text style={styles.webMapSubtext}>
                Disponible solo en dispositivos móviles
              </Text>
            </View>
          )}

          {/* Información de la ubicación seleccionada */}
          {selectedLocation && (
            <View style={styles.selectedLocationInfo}>
              <View style={styles.locationHeader}>
                <Target size={20} color={Colors.success} />
                <Text style={styles.locationSelectedText}>Ubicación seleccionada</Text>
              </View>
              
              <Text style={styles.locationAddress} numberOfLines={3}>
                {searchText}
              </Text>
              
              <Text style={styles.coordinatesText}>
                Coordenadas: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </Text>

              <TouchableOpacity
                style={styles.openMapsButton}
                onPress={openInMaps}
              >
                <Navigation size={16} color={Colors.primary} />
                <Text style={styles.openMapsButtonText}>Abrir en Mapas</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Ubicación manual */}
          <TouchableOpacity
            style={styles.manualLocationButton}
            onPress={() => {
              const address = searchText || 'Ubicación personalizada';
              onLocationSelect({ address });
              onClose();
            }}
          >
            <MapPin size={20} color={Colors.secondary} />
            <Text style={styles.manualLocationButtonText}>
              Usar ubicación escrita manualmente
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
    marginLeft: -8,
  },
  confirmButton: {
    padding: 8,
    marginRight: -8,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    padding: 0,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  resultsContainer: {
    marginTop: 8,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 200,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  resultText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    borderStyle: 'dashed',
    marginBottom: 20,
    minHeight: 200,
  },
  nativeMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginBottom: 20,
    minHeight: 200,
  },
  webMapText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  webMapSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  selectedLocationInfo: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  locationSelectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
  },
  locationAddress: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 22,
  },
  coordinatesText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  openMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '10',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
  },
  openMapsButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  manualLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary + '10',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.secondary,
    gap: 8,
    marginTop: 8,
  },
  manualLocationButtonText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '500',
  },
});