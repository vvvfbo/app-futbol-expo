import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  SafeAreaView,
  Linking,
  Alert
} from 'react-native';

import { MapPin, Search, X, Check, Navigation, Map, Target } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface LocationPickerProps {
  onClose: () => void;
  onLocationSelect: (location: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  }) => void;
  initialAddress?: string;
}



export default function LocationPicker({
  onClose,
  onLocationSelect,
  initialAddress
}: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [address, setAddress] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (initialAddress) {
      setAddress(initialAddress);
    }
  }, [initialAddress]);

  const handleCoordinateInput = (lat: string, lng: string) => {
    if (!lat.trim() || !lng.trim()) return;
    if (lat.length > 20 || lng.length > 20) return;
    
    const sanitizedLat = lat.trim();
    const sanitizedLng = lng.trim();
    
    const latitude = parseFloat(sanitizedLat);
    const longitude = parseFloat(sanitizedLng);
    
    if (!isNaN(latitude) && !isNaN(longitude)) {
      setSelectedLocation({ latitude, longitude });
      const simpleAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      setAddress(simpleAddress);
    }
  };

  const searchLocation = async () => {
    if (!searchText.trim()) {
      Alert.alert('Error', 'Por favor introduce una ciudad para buscar');
      return;
    }
    
    console.log('🔍 Búsqueda de ubicación:', searchText);
    
    try {
      // Simulamos búsqueda con ubicaciones conocidas de España
      const ubicacionesConocidas = {
        'madrid': { lat: 40.4168, lng: -3.7038, name: 'Madrid, España' },
        'barcelona': { lat: 41.3851, lng: 2.1734, name: 'Barcelona, España' },
        'valencia': { lat: 39.4699, lng: -0.3763, name: 'Valencia, España' },
        'sevilla': { lat: 37.3891, lng: -5.9845, name: 'Sevilla, España' },
        'bilbao': { lat: 43.2627, lng: -2.9253, name: 'Bilbao, España' },
        'malaga': { lat: 36.7213, lng: -4.4214, name: 'Málaga, España' },
        'zaragoza': { lat: 41.6488, lng: -0.8891, name: 'Zaragoza, España' },
        'alicante': { lat: 38.3452, lng: -0.4810, name: 'Alicante, España' },
        'murcia': { lat: 37.9922, lng: -1.1307, name: 'Murcia, España' },
        'palma': { lat: 39.5696, lng: 2.6502, name: 'Palma de Mallorca, España' },
        'las palmas': { lat: 28.1248, lng: -15.4300, name: 'Las Palmas, España' },
        'vigo': { lat: 42.2406, lng: -8.7207, name: 'Vigo, España' },
        'gijon': { lat: 43.5322, lng: -5.6611, name: 'Gijón, España' },
        'hospitalet': { lat: 41.3598, lng: 2.1074, name: 'L\'Hospitalet, España' },
        'cordoba': { lat: 37.8882, lng: -4.7794, name: 'Córdoba, España' },
        'valladolid': { lat: 41.6523, lng: -4.7245, name: 'Valladolid, España' },
        'santander': { lat: 43.4623, lng: -3.8099, name: 'Santander, España' },
        'pamplona': { lat: 42.8169, lng: -1.6432, name: 'Pamplona, España' },
        'vitoria': { lat: 42.8467, lng: -2.6716, name: 'Vitoria-Gasteiz, España' },
        'oviedo': { lat: 43.3614, lng: -5.8593, name: 'Oviedo, España' }
      };
      
      const searchLower = searchText.toLowerCase().trim();
      const ubicacion = ubicacionesConocidas[searchLower as keyof typeof ubicacionesConocidas];
      
      if (ubicacion) {
        setSelectedLocation({ latitude: ubicacion.lat, longitude: ubicacion.lng });
        setAddress(`${ubicacion.name}`);
        setLatInput(ubicacion.lat.toString());
        setLngInput(ubicacion.lng.toString());
        console.log(`✅ Ubicación encontrada: ${ubicacion.name}`);
        
        // Auto-confirmar la ubicación encontrada
        const locationData = {
          address: ubicacion.name,
          coordinates: {
            latitude: ubicacion.lat,
            longitude: ubicacion.lng
          }
        };
        
        Alert.alert(
          'Ubicación encontrada', 
          `Se ha seleccionado: ${ubicacion.name}. ¿Deseas usar esta ubicación?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Usar ubicación',
              onPress: () => {
                onLocationSelect(locationData);
                onClose();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Ubicación no encontrada', 
          'Prueba con ciudades españolas como: Madrid, Barcelona, Valencia, Sevilla, Bilbao, Málaga, Zaragoza, Santander, Pamplona, etc.'
        );
      }
    } catch (error) {
      console.error('❌ Error en búsqueda de ubicación:', error);
      Alert.alert('Error', 'Error al buscar la ubicación');
    }
  };

  const handleConfirm = () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Por favor selecciona una ubicación primero');
      return;
    }

    try {
      const locationData = {
        address: address || `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`,
        coordinates: {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude
        }
      };
      console.log('📍 Confirmando ubicación:', locationData);
      
      // Llamar directamente a onLocationSelect sin mostrar alert
      onLocationSelect(locationData);
      console.log('✅ Ubicación enviada al componente padre');
      
      // Cerrar el modal
      onClose();
    } catch (error) {
      console.error('❌ Error al confirmar ubicación:', error);
      Alert.alert('Error', 'Error al confirmar la ubicación');
    }
  };

  const getCurrentLocation = async () => {
    console.log('Obteniendo ubicación actual...');
    
    try {
      if (Platform.OS === 'web') {
        if (navigator.geolocation) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
              });
            });
            
            console.log('Ubicación obtenida:', position.coords);
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setSelectedLocation({ latitude: lat, longitude: lng });
            setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            setLatInput(lat.toString());
            setLngInput(lng.toString());
          } catch (error: any) {
            console.log('Error al obtener ubicación:', error.message);
            console.log('No se pudo obtener la ubicación actual. Usando ubicación por defecto.');
            // Usar Madrid como ubicación por defecto
            const madridLat = 40.4168;
            const madridLng = -3.7038;
            setSelectedLocation({ latitude: madridLat, longitude: madridLng });
            setAddress(`Madrid - ${madridLat.toFixed(4)}, ${madridLng.toFixed(4)}`);
            setLatInput(madridLat.toString());
            setLngInput(madridLng.toString());
          }
        } else {
          console.log('Geolocalización no disponible');
          // Usar Madrid como ubicación por defecto
          const madridLat = 40.4168;
          const madridLng = -3.7038;
          setSelectedLocation({ latitude: madridLat, longitude: madridLng });
          setAddress(`Madrid - ${madridLat.toFixed(4)}, ${madridLng.toFixed(4)}`);
          setLatInput(madridLat.toString());
          setLngInput(madridLng.toString());
        }
      } else {
        // Para móvil, usar expo-location si está disponible
        // Simular obtención de ubicación en móvil
        const madridLat = 40.4168;
        const madridLng = -3.7038;
        setSelectedLocation({ latitude: madridLat, longitude: madridLng });
        setAddress(`Madrid - ${madridLat.toFixed(4)}, ${madridLng.toFixed(4)}`);
        setLatInput(madridLat.toString());
        setLngInput(madridLng.toString());
        console.log('Ubicación de ejemplo establecida (Madrid). Puedes modificar las coordenadas manualmente.');
      }
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      // Fallback a Madrid
      const madridLat = 40.4168;
      const madridLng = -3.7038;
      setSelectedLocation({ latitude: madridLat, longitude: madridLng });
      setAddress(`Madrid - ${madridLat.toFixed(4)}, ${madridLng.toFixed(4)}`);
      setLatInput(madridLat.toString());
      setLngInput(madridLng.toString());
    }
  };

  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');

  const handleUseCoordinates = () => {
    try {
      if (latInput && lngInput) {
        const lat = parseFloat(latInput);
        const lng = parseFloat(lngInput);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          setSelectedLocation({ latitude: lat, longitude: lng });
          setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          console.log('✅ Coordenadas establecidas:', { lat, lng });
        } else {
          console.log('Error: Coordenadas inválidas');
        }
      } else {
        console.log('Error: Por favor introduce latitud y longitud válidas');
      }
    } catch (error) {
      console.error('Error al usar coordenadas:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Seleccionar Ubicación</Text>
          <TouchableOpacity 
            style={[
              styles.confirmButton,
              !selectedLocation && styles.confirmButtonDisabled
            ]} 
            onPress={handleConfirm}
            disabled={!selectedLocation}
          >
            <Check size={24} color={selectedLocation ? 'white' : Colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInput}>
            <Search size={20} color={Colors.textLight} />
            <TextInput
              style={styles.searchText}
              placeholder="Buscar dirección..."
              placeholderTextColor={Colors.textLight}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={searchLocation}
            />
          </View>
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={getCurrentLocation}
          >
            <Navigation size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {address ? (
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Ubicación seleccionada:</Text>
            <Text style={styles.addressText}>{address}</Text>
          </View>
        ) : null}

        <View style={styles.coordinatesContainer}>
          <View style={styles.coordinatesHeader}>
            <Target size={24} color={Colors.primary} />
            <Text style={styles.coordinatesTitle}>Coordenadas del Campo</Text>
          </View>
          
          <View style={styles.coordinatesInputs}>
            <View style={styles.coordinateInput}>
              <Text style={styles.coordinateLabel}>Latitud</Text>
              <TextInput
                style={styles.coordinateTextInput}
                placeholder="40.4168 (Madrid)"
                placeholderTextColor={Colors.textLight}
                value={latInput}
                onChangeText={setLatInput}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.coordinateInput}>
              <Text style={styles.coordinateLabel}>Longitud</Text>
              <TextInput
                style={styles.coordinateTextInput}
                placeholder="-3.7038 (Madrid)"
                placeholderTextColor={Colors.textLight}
                value={lngInput}
                onChangeText={setLngInput}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.useCoordinatesButton}
            onPress={handleUseCoordinates}
          >
            <Target size={16} color="white" />
            <Text style={styles.useCoordinatesButtonText}>Usar Coordenadas</Text>
          </TouchableOpacity>
          
          {selectedLocation && (
            <View style={styles.selectedLocationInfo}>
              <View style={styles.markerIndicator}>
                <MapPin size={20} color={Colors.primary} />
                <Text style={styles.selectedLocationTitle}>Ubicación Marcada:</Text>
              </View>
              <Text style={styles.selectedLocationText}>
                📍 Lat: {selectedLocation.latitude.toFixed(6)}
              </Text>
              <Text style={styles.selectedLocationText}>
                📍 Lng: {selectedLocation.longitude.toFixed(6)}
              </Text>
              <View style={styles.locationActions}>
                <TouchableOpacity 
                  style={styles.previewButton}
                  onPress={() => {
                    const url = `https://www.google.com/maps?q=${selectedLocation.latitude},${selectedLocation.longitude}&z=15`;
                    if (Platform.OS === 'web') {
                      window.open(url, '_blank');
                    } else {
                      Linking.openURL(url);
                    }
                  }}
                >
                  <Map size={16} color={Colors.secondary} />
                  <Text style={styles.previewButtonText}>Vista Previa</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            Introduce las coordenadas del campo de fútbol, busca por ciudad o usa el botón de navegación para obtener tu ubicación
          </Text>
          {selectedLocation && (
            <TouchableOpacity 
              style={styles.openMapsButton}
              onPress={() => {
                const url = Platform.select({
                  ios: `maps:0,0?q=${selectedLocation.latitude},${selectedLocation.longitude}`,
                  android: `geo:0,0?q=${selectedLocation.latitude},${selectedLocation.longitude}`,
                  web: `https://www.google.com/maps?q=${selectedLocation.latitude},${selectedLocation.longitude}`
                });
                if (url) {
                  if (Platform.OS === 'web') {
                    window.open(url, '_blank');
                  } else {
                    Linking.openURL(url).catch(err => {
                      console.error('Error abriendo mapas:', err);
                      // Fallback a Google Maps web
                      const webUrl = `https://www.google.com/maps?q=${selectedLocation.latitude},${selectedLocation.longitude}`;
                      Linking.openURL(webUrl).catch(() => {
                        alert('No se pudo abrir Google Maps');
                      });
                    });
                  }
                }
              }}
            >
              <MapPin size={16} color={Colors.primary} />
              <Text style={styles.openMapsButtonText}>Ver en Google Maps</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.manualLocationButton}
            onPress={() => {
              Alert.alert(
                'Abrir Google Maps',
                'Se abrirá Google Maps donde podrás buscar la ubicación exacta. Luego copia las coordenadas y pégalas aquí.',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Abrir Maps',
                    onPress: () => {
                      const url = Platform.select({
                        ios: 'maps:',
                        android: 'geo:',
                        web: 'https://www.google.com/maps'
                      });
                      if (url) {
                        if (Platform.OS === 'web') {
                          window.open(url, '_blank');
                        } else {
                          Linking.openURL(url).catch(() => {
                            const webUrl = 'https://www.google.com/maps';
                            Linking.openURL(webUrl).catch(() => {
                              Alert.alert('Error', 'No se pudo abrir Google Maps');
                            });
                          });
                        }
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Map size={16} color={Colors.secondary} />
            <Text style={styles.manualLocationButtonText}>Abrir Google Maps para seleccionar</Text>
          </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
}

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
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  locationButton: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  addressLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  coordinatesContainer: {
    flex: 1,
    margin: 16,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  coordinatesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  coordinatesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  coordinatesInputs: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  coordinateInput: {
    flex: 1,
  },
  coordinateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  coordinateTextInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.text,
  },
  useCoordinatesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  useCoordinatesButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedLocationInfo: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
  },
  markerIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  selectedLocationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  selectedLocationText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  locationActions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary + '20',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.secondary,
    gap: 6,
  },
  previewButtonText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '500',
  },
  instructions: {
    padding: 16,
    backgroundColor: Colors.surface,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
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