import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save, MapPin, Trophy, Users } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useData } from '@/hooks/data-context';
import { useAuth } from '@/hooks/auth-context';
import Colors from '@/constants/colors';
import { useState, useEffect } from 'react';
import { CIUDADES, CATEGORIAS, TIPOS_FUTBOL } from '@/constants/categories';
import { Categoria, TipoFutbol } from '@/types';

export default function EditarTorneoScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { torneos, actualizarTorneo } = useData();
  const [isLoading, setIsLoading] = useState(false);
  
  const torneo = torneos.find(t => t.id === id);
  
  const [formData, setFormData] = useState({
    nombre: '',
    ciudad: '',
    categoria: '' as Categoria | '',
    tipoFutbol: '' as TipoFutbol | '',
    fechaInicio: '',
    maxEquipos: 8,
    descripcion: ''
  });

  useEffect(() => {
    if (torneo) {
      setFormData({
        nombre: torneo.nombre,
        ciudad: torneo.ciudad,
        categoria: torneo.categoria,
        tipoFutbol: torneo.tipoFutbol || 'F11' as TipoFutbol,
        fechaInicio: torneo.fechaInicio,
        maxEquipos: torneo.maxEquipos,
        descripcion: torneo.descripcion || ''
      });
    }
  }, [torneo]);

  if (!torneo) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Torneo no encontrado</Text>
      </SafeAreaView>
    );
  }

  if (user?.id !== torneo.creadorId) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>No tienes permisos para editar este torneo</Text>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre del torneo es obligatorio');
      return;
    }

    setIsLoading(true);
    try {
      await actualizarTorneo(torneo.id, {
        nombre: formData.nombre.trim(),
        ciudad: formData.ciudad,
        categoria: formData.categoria || undefined,
        tipoFutbol: formData.tipoFutbol || undefined,
        fechaInicio: formData.fechaInicio,
        maxEquipos: formData.maxEquipos,
        descripcion: formData.descripcion.trim()
      });
      
      Alert.alert('Éxito', 'Torneo actualizado correctamente', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el torneo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Torneo</Text>
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Save size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre del Torneo</Text>
            <TextInput
              style={styles.input}
              value={formData.nombre}
              onChangeText={(text) => setFormData(prev => ({ ...prev, nombre: text }))}
              placeholder="Ej: Copa de Verano 2024"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.descripcion}
              onChangeText={(text) => setFormData(prev => ({ ...prev, descripcion: text }))}
              placeholder="Descripción del torneo (opcional)"
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación y Categoría</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ciudad</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
              {CIUDADES.map(ciudad => (
                <TouchableOpacity
                  key={ciudad}
                  style={[
                    styles.chip,
                    formData.ciudad === ciudad && styles.chipActive
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, ciudad }))}
                >
                  <MapPin size={14} color={formData.ciudad === ciudad ? 'white' : Colors.textLight} />
                  <Text style={[
                    styles.chipText,
                    formData.ciudad === ciudad && styles.chipTextActive
                  ]}>
                    {ciudad}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoría</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
              {CATEGORIAS.map(categoria => (
                <TouchableOpacity
                  key={categoria}
                  style={[
                    styles.chip,
                    formData.categoria === categoria && styles.chipActive
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, categoria }))}
                >
                  <Trophy size={14} color={formData.categoria === categoria ? 'white' : Colors.textLight} />
                  <Text style={[
                    styles.chipText,
                    formData.categoria === categoria && styles.chipTextActive
                  ]}>
                    {categoria}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Fútbol</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
              {TIPOS_FUTBOL.map(tipo => (
                <TouchableOpacity
                  key={tipo.value}
                  style={[
                    styles.chip,
                    formData.tipoFutbol === tipo.value && styles.chipActive
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, tipoFutbol: tipo.value }))}
                >
                  <Users size={14} color={formData.tipoFutbol === tipo.value ? 'white' : Colors.textLight} />
                  <Text style={[
                    styles.chipText,
                    formData.tipoFutbol === tipo.value && styles.chipTextActive
                  ]}>
                    {tipo.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha de Inicio</Text>
            <TextInput
              style={styles.input}
              value={formData.fechaInicio}
              onChangeText={(text) => setFormData(prev => ({ ...prev, fechaInicio: text }))}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Máximo de Equipos</Text>
            <View style={styles.numberInputContainer}>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => setFormData(prev => ({ 
                  ...prev, 
                  maxEquipos: Math.max(4, prev.maxEquipos - 2) 
                }))}
              >
                <Text style={styles.numberButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.numberValue}>{formData.maxEquipos}</Text>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => setFormData(prev => ({ 
                  ...prev, 
                  maxEquipos: Math.min(32, prev.maxEquipos + 2) 
                }))}
              >
                <Text style={styles.numberButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.warningText}>
            Nota: Algunos cambios pueden afectar la estructura del torneo si ya hay partidos programados.
          </Text>
        </View>
      </ScrollView>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  warningText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
});