import { TIPOS_FUTBOL } from '@/constants/categories';
import Colors from '@/constants/colors';
import { CampoFutbol, TipoFutbol } from '@/types';
import { MapPin, Save, Users, X } from 'lucide-react-native';
import React, { useState } from 'react';
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
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {campo ? 'Editar Campo' : 'Nuevo Campo'}
            </Text>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
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
                    placeholder="Dirección del campo"
                    placeholderTextColor={Colors.textLight}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.mapButton}
                    onPress={() => setShowLocationPicker(true)}
                  >
                    <MapPin size={20} color={Colors.primary} />
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
                      <Users size={14} color={formData.tipo === tipo.value ? 'white' : Colors.textLight} />
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
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor="white"
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Vestuarios</Text>
                <Switch
                  value={formData.vestuarios}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, vestuarios: value }))}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
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
                  placeholderTextColor={Colors.textLight}
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
                  placeholderTextColor={Colors.textLight}
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
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {showLocationPicker && (
        <LocationPicker
          onClose={() => setShowLocationPicker(false)}
          onLocationSelect={handleLocationSelect}
          initialAddress={formData.direccion}
        />
      )}
    </>
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
  saveButton: {
    backgroundColor: Colors.primary,
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
    color: Colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coordinatesText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  chipContainer: {
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  chipTextActive: {
    color: 'white',
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  numberButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary,
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
    color: Colors.text,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: Colors.text,
  },
});