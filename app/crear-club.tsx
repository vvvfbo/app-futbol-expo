import LocationPicker from '@/components/LocationPicker';
import Colors from '@/constants/colors';
import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';
import { Categoria, Club } from '@/types';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, Save } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORIAS_DISPONIBLES: Categoria[] = ['Benjamin', 'Alevin', 'Infantil', 'Cadete', 'Juvenil', 'Senior'];

export default function CrearClubScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { crearClub } = useData();

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    coordenadas: undefined as { latitud: number; longitud: number } | undefined,
  });

  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<Set<Categoria>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const toggleCategoria = (categoria: Categoria) => {
    const nuevasCategorias = new Set(categoriasSeleccionadas);
    if (nuevasCategorias.has(categoria)) {
      nuevasCategorias.delete(categoria);
    } else {
      nuevasCategorias.add(categoria);
    }
    setCategoriasSeleccionadas(nuevasCategorias);
  };

  const handleLocationSelect = (location: { address: string; coordinates?: { latitude: number; longitude: number } }) => {
    setFormData(prev => ({
      ...prev,
      direccion: location.address,
      coordenadas: location.coordinates ? {
        latitud: location.coordinates.latitude,
        longitud: location.coordinates.longitude
      } : undefined
    }));
    setShowLocationPicker(false);
  };

  const handleCrear = async () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre del club es obligatorio');
      return;
    }

    if (!formData.ciudad.trim()) {
      Alert.alert('Error', 'La ciudad es obligatoria');
      return;
    }

    if (categoriasSeleccionadas.size === 0) {
      Alert.alert('Error', 'Selecciona al menos una categoría');
      return;
    }

    setIsLoading(true);

    try {
      const categorias: Club['categorias'] = {};
      categoriasSeleccionadas.forEach(categoria => {
        categorias[categoria] = {
          nombre: categoria,
          equipos: []
        };
      });

      const nuevoClub: Omit<Club, 'id' | 'fechaCreacion'> = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        telefono: formData.telefono.trim() || undefined,
        email: formData.email.trim() || undefined,
        ubicacion: {
          direccion: formData.direccion.trim(),
          ciudad: formData.ciudad.trim(),
          coordenadas: formData.coordenadas
        },
        entrenadorId: user?.id || '',
        categorias,
        estadisticas: {
          totalEquipos: 0,
          torneosParticipados: 0,
          amistososJugados: 0
        }
      };

      await crearClub(nuevoClub);

      Alert.alert(
        'Éxito',
        'Club creado exitosamente',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error creating club:', error);
      Alert.alert('Error', 'No se pudo crear el club. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Club</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información Básica</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre del Club *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nombre}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, nombre: text }))}
                  placeholder="Ej: Club Deportivo Los Leones"
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.descripcion}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, descripcion: text }))}
                  placeholder="Describe tu club, historia, valores..."
                  placeholderTextColor={Colors.textLight}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contacto</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  value={formData.telefono}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, telefono: text }))}
                  placeholder="Ej: +34 600 123 456"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  placeholder="contacto@club.com"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ubicación</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ciudad *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.ciudad}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, ciudad: text }))}
                  placeholder="Ej: Madrid"
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Dirección</Text>
                <View style={styles.locationInputContainer}>
                  <TextInput
                    style={[styles.input, styles.locationInput]}
                    value={formData.direccion}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, direccion: text }))}
                    placeholder="Dirección del club"
                    placeholderTextColor={Colors.textLight}
                  />
                  <TouchableOpacity
                    style={styles.mapButton}
                    onPress={() => setShowLocationPicker(true)}
                  >
                    <MapPin size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categorías *</Text>
              <Text style={styles.sectionSubtitle}>
                Selecciona las categorías que tendrá tu club
              </Text>

              <View style={styles.optionsContainer}>
                {CATEGORIAS_DISPONIBLES.map((categoria) => (
                  <TouchableOpacity
                    key={categoria}
                    style={[
                      styles.optionChip,
                      categoriasSeleccionadas.has(categoria) && styles.optionChipActive
                    ]}
                    onPress={() => toggleCategoria(categoria)}
                  >
                    <Text style={[
                      styles.optionChipText,
                      categoriasSeleccionadas.has(categoria) && styles.optionChipTextActive
                    ]}>
                      {categoria}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.createButton, isLoading && styles.createButtonDisabled]}
            onPress={handleCrear}
            disabled={isLoading}
          >
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.createButtonText}>
              {isLoading ? 'Creando...' : 'Crear Club'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {showLocationPicker && (
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowLocationPicker(false)}
          initialLocation={formData.direccion}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationInput: {
    flex: 1,
  },
  mapButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  optionChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionChipText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  optionChipTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  createButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  createButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});