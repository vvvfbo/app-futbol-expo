import { TIPOS_FUTBOL } from '@/constants/categories';
import { useTheme } from '@/hooks/theme-context';
import { CampoFutbol, TipoFutbol } from '@/types';
import { MapPin, Save, Users, X } from 'lucide-react-native';
import React, { memo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import LocationPicker from './LocationPicker';

interface CampoFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (campo: Omit<CampoFutbol, 'id'>) => void;
  campo?: CampoFutbol;
  ciudad: string;
}

export default function CampoFormModal({
  visible,
  onClose,
  onSave,
  campo,
  ciudad
}: CampoFormModalProps) {
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    nombre: campo?.nombre || '',
    direccion: campo?.direccion || '',
    tipo: campo?.tipo || 'F11' as TipoFutbol,
    capacidad: campo?.capacidad || 100,
    superficie: campo?.superficie || 'Césped artificial' as const,
    iluminacion: campo?.iluminacion || false,
    vestuarios: campo?.vestuarios || false,
    precio: campo?.precio || 0,
    telefono: campo?.contacto?.telefono || '',
    email: campo?.contacto?.email || '',
    coordenadas: campo?.coordenadas || null
  });

  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleSave = () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre del campo es obligatorio');
      return;
    }

    if (!formData.direccion.trim()) {
      Alert.alert('Error', 'La dirección del campo es obligatoria');
      return;
    }

    const campoData: Omit<CampoFutbol, 'id'> = {
      nombre: formData.nombre.trim(),
      direccion: formData.direccion.trim(),
      ciudad,
      tipo: formData.tipo,
      capacidad: formData.capacidad,
      superficie: formData.superficie,
      iluminacion: formData.iluminacion,
      vestuarios: formData.vestuarios,
      coordenadas: formData.coordenadas || undefined,
      contacto: {
        telefono: formData.telefono.trim() || undefined,
        email: formData.email.trim() || undefined,
      },
      precio: formData.precio > 0 ? formData.precio : undefined,
      disponibilidad: {
        lunes: true,
        martes: true,
        miercoles: true,
        jueves: true,
        viernes: true,
        sabado: true,
        domingo: true,
      }
    };

    onSave(campoData);
    onClose();
  };

  const handleLocationSelect = (location: {
    address: string;
    coordinates?: { latitude: number; longitude: number };
  }) => {
    setFormData(prev => ({
      ...prev,
      direccion: location.address,
      coordenadas: location.coordinates || null
    }));
  };

  if (!visible) return null;

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={false}
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {campo ? 'Editar Campo' : 'Nuevo Campo'}
            </Text>
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: colors.primary }]} 
              onPress={handleSave}
            >
              <Save size={20} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información Básica</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre del Campo</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nombre}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, nombre: text }))}
                  placeholder="Ej: Campo Municipal Norte"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Dirección</Text>
                <View style={styles.locationInputContainer}>
                  <TextInput
                    style={[styles.input, styles.locationInput]}
                    value={formData.direccion}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, direccion: text }))}
                    placeholder="Dirección del campo"
                    placeholderTextColor={colors.textSecondary}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.mapButton}
                    onPress={() => setShowLocationPicker(true)}
                  >
                    <MapPin size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                {formData.coordenadas && (
                  <Text style={styles.coordinatesText}>
                    📍 {formData.coordenadas.latitude.toFixed(4)}, {formData.coordenadas.longitude.toFixed(4)}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo de Fútbol</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                  {TIPOS_FUTBOL.map(tipo => (
                    <TouchableOpacity
                      key={tipo.value}
                      style={[
                        styles.chip,
                        formData.tipo === tipo.value && styles.chipActive
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, tipo: tipo.value }))}
                    >
                      <Users size={14} color={formData.tipo === tipo.value ? 'white' : colors.textSecondary} />
                      <Text style={[
                        styles.chipText,
                        formData.tipo === tipo.value && styles.chipTextActive
                      ]}>
                        {tipo.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Características</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Superficie</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                  {['Césped natural', 'Césped artificial', 'Tierra', 'Cemento'].map(superficie => (
                    <TouchableOpacity
                      key={superficie}
                      style={[
                        styles.chip,
                        formData.superficie === superficie && styles.chipActive
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, superficie: superficie as any }))}
                    >
                      <Text style={[
                        styles.chipText,
                        formData.superficie === superficie && styles.chipTextActive
                      ]}>
                        {superficie}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Capacidad</Text>
                <View style={styles.numberInputContainer}>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => setFormData(prev => ({
                      ...prev,
                      capacidad: Math.max(10, prev.capacidad - 10)
                    }))}
                  >
                    <Text style={styles.numberButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.numberValue}>{formData.capacidad}</Text>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => setFormData(prev => ({
                      ...prev,
                      capacidad: Math.min(1000, prev.capacidad + 10)
                    }))}
                  >
                    <Text style={styles.numberButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Iluminación</Text>
                <Switch
                  value={formData.iluminacion}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, iluminacion: value }))}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="white"
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Vestuarios</Text>
                <Switch
                  value={formData.vestuarios}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, vestuarios: value }))}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="white"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contacto y Precio</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.telefono}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, telefono: text }))}
                  placeholder="Ej: +34 123 456 789"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  placeholder="Ej: campo@ejemplo.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Precio por partido (€)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.precio.toString()}
                  onChangeText={(text) => {
                    const precio = parseInt(text) || 0;
                    setFormData(prev => ({ ...prev, precio }));
                  }}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>
          
          {/* Footer con botón de guardar */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.saveButtonLarge, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Save size={20} color="white" />
              <Text style={styles.saveButtonText}>
                {campo ? 'Actualizar Campo' : 'Crear Campo'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showLocationPicker && (
        <LocationPicker
          onClose={() => setShowLocationPicker(false)}
          onLocationSelect={handleLocationSelect}
          initialLocation={formData.direccion}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set inline using theme
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    // backgroundColor will be set inline using theme
    borderBottomWidth: 1,
    // borderBottomColor will be set inline using theme
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    // color will be set inline using theme
  },
  saveButton: {
    // backgroundColor will be set inline using theme
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    // color will be set inline using theme
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    // color will be set inline using theme
    marginBottom: 8,
  },
  input: {
    // backgroundColor, color, borderColor will be set inline using theme
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  locationInput: {
    flex: 1,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  mapButton: {
    // backgroundColor, borderColor will be set inline using theme
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coordinatesText: {
    fontSize: 12,
    // color will be set inline using theme
    marginTop: 4,
  },
  chipContainer: {
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor, borderColor will be set inline using theme
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
  },
  chipActive: {
    // backgroundColor, borderColor will be set inline using theme
  },
  chipText: {
    fontSize: 14,
    // color will be set inline using theme
  },
  chipTextActive: {
    color: 'white',
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor, borderColor will be set inline using theme
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  numberButton: {
    width: 40,
    height: 40,
    // backgroundColor will be set inline using theme
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  numberValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    // color will be set inline using theme
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    // color will be set inline using theme
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  saveButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    minHeight: 50,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});