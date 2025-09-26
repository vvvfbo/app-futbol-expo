import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';
import Colors from '@/constants/colors';
import { COLORES_EQUIPO, CATEGORIAS, CIUDADES, TIPOS_FUTBOL } from '@/constants/categories';
import { validateEquipo, getFieldError } from '@/utils/validation';
import { ValidationError, Categoria, TipoFutbol } from '@/types';
import { Users, MapPin, Trophy, Camera, Upload, ArrowLeft } from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function EditarEquipoScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { equipos, actualizarEquipo } = useData();
  const [nombre, setNombre] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('Senior');
  const [tipoFutbol, setTipoFutbol] = useState<TipoFutbol>('F11');
  const [colorPrincipal, setColorPrincipal] = useState(COLORES_EQUIPO[0].valor);
  const [colorSecundario, setColorSecundario] = useState(COLORES_EQUIPO[1].valor);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCiudades, setShowCiudades] = useState(false);
  const [showCategorias, setShowCategorias] = useState(false);
  const [showTiposFutbol, setShowTiposFutbol] = useState(false);
  const [escudoUrl, setEscudoUrl] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const equipo = equipos.find(e => e.id === id);

  useEffect(() => {
    if (equipo) {
      setNombre(equipo.nombre);
      setCiudad(equipo.ciudad);
      setCategoria(equipo.categoria || 'Alevin');
      setTipoFutbol(equipo.tipoFutbol || 'F11');
      setColorPrincipal(equipo.colores.principal);
      setColorSecundario(equipo.colores.secundario);
      setEscudoUrl(equipo.escudo || '');
    }
  }, [equipo]);

  // Validación en tiempo real
  useEffect(() => {
    if (nombre || ciudad || categoria) {
      const equipoData = {
        nombre,
        ciudad,
        categoria,
        tipoFutbol,
        colores: { principal: colorPrincipal, secundario: colorSecundario },
        entrenadorId: user?.id || ''
      };
      const validationErrors = validateEquipo(equipoData);
      setErrors(validationErrors);
    }
  }, [nombre, ciudad, categoria, tipoFutbol, colorPrincipal, colorSecundario, user]);

  const handleSelectImage = async () => {
    try {
      setUploadingImage(true);
      
      // Simulamos la selección de una imagen desde una URL
      const imageUrls = [
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&h=200&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=200&h=200&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=200&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1614632537190-23e4b2e69c88?w=200&h=200&fit=crop&crop=center'
      ];
      
      const randomImage = imageUrls[Math.floor(Math.random() * imageUrls.length)];
      
      // Simulamos un delay de carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEscudoUrl(randomImage);
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'No se pudo cargar la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleActualizar = async () => {
    if (!equipo) return;

    const equipoData = {
      nombre,
      ciudad,
      categoria,
      tipoFutbol,
      colores: { principal: colorPrincipal, secundario: colorSecundario },
      entrenadorId: user?.id || ''
    };

    const validationErrors = validateEquipo(equipoData);
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      Alert.alert('Error', 'Por favor corrige los errores en el formulario');
      return;
    }

    if (colorPrincipal === colorSecundario) {
      Alert.alert('Error', 'Los colores principal y secundario deben ser diferentes');
      return;
    }

    setIsLoading(true);
    try {
      await actualizarEquipo(equipo.id, {
        ...equipoData,
        escudo: escudoUrl || undefined
      });
      
      Alert.alert(
        'Éxito',
        'Equipo actualizado correctamente.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error updating team:', error);
      Alert.alert('Error', 'No se pudo actualizar el equipo. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!equipo) {
    return (
      <View style={styles.container}>
        <Text>Equipo no encontrado</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Editar Equipo',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          )
        }} 
      />
      <ScrollView style={styles.container}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre del Equipo *</Text>
            <View style={[
              styles.inputContainer,
              getFieldError(errors, 'nombre') && styles.inputError
            ]}>
              <Users size={20} color={Colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ej: Real Madrid CF"
                placeholderTextColor={Colors.textLight}
                value={nombre}
                onChangeText={setNombre}
                testID="nombre-equipo-input"
              />
            </View>
            {getFieldError(errors, 'nombre') && (
              <Text style={styles.errorText}>{getFieldError(errors, 'nombre')}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ciudad *</Text>
            <TouchableOpacity 
              style={[
                styles.inputContainer,
                getFieldError(errors, 'ciudad') && styles.inputError
              ]}
              onPress={() => setShowCiudades(!showCiudades)}
            >
              <MapPin size={20} color={Colors.textLight} style={styles.inputIcon} />
              <Text style={styles.inputText}>{ciudad}</Text>
            </TouchableOpacity>
            {getFieldError(errors, 'ciudad') && (
              <Text style={styles.errorText}>{getFieldError(errors, 'ciudad')}</Text>
            )}
            {showCiudades && (
              <ScrollView style={styles.dropdown} nestedScrollEnabled>
                {CIUDADES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCiudad(c);
                      setShowCiudades(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoría *</Text>
            <TouchableOpacity 
              style={[
                styles.inputContainer,
                getFieldError(errors, 'categoria') && styles.inputError
              ]}
              onPress={() => setShowCategorias(!showCategorias)}
            >
              <Trophy size={20} color={Colors.textLight} style={styles.inputIcon} />
              <Text style={styles.inputText}>{categoria}</Text>
            </TouchableOpacity>
            {getFieldError(errors, 'categoria') && (
              <Text style={styles.errorText}>{getFieldError(errors, 'categoria')}</Text>
            )}
            {showCategorias && (
              <View style={styles.dropdown}>
                {CATEGORIAS.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCategoria(cat);
                      setShowCategorias(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Fútbol *</Text>
            <TouchableOpacity 
              style={[
                styles.inputContainer,
                getFieldError(errors, 'tipoFutbol') && styles.inputError
              ]}
              onPress={() => setShowTiposFutbol(!showTiposFutbol)}
            >
              <Users size={20} color={Colors.textLight} style={styles.inputIcon} />
              <Text style={styles.inputText}>{TIPOS_FUTBOL.find(t => t.value === tipoFutbol)?.label}</Text>
            </TouchableOpacity>
            {getFieldError(errors, 'tipoFutbol') && (
              <Text style={styles.errorText}>{getFieldError(errors, 'tipoFutbol')}</Text>
            )}
            {showTiposFutbol && (
              <View style={styles.dropdown}>
                {TIPOS_FUTBOL.map((tipo) => (
                  <TouchableOpacity
                    key={tipo.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setTipoFutbol(tipo.value);
                      setShowTiposFutbol(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{tipo.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Color Principal</Text>
            <View style={styles.colorGrid}>
              {COLORES_EQUIPO.map(color => (
                <TouchableOpacity
                  key={color.valor}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color.valor },
                    colorPrincipal === color.valor && styles.colorSelected
                  ]}
                  onPress={() => setColorPrincipal(color.valor)}
                >
                  {color.valor === '#FFFFFF' && (
                    <View style={styles.whiteColorBorder} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Color Secundario</Text>
            <View style={styles.colorGrid}>
              {COLORES_EQUIPO.map(color => (
                <TouchableOpacity
                  key={color.valor}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color.valor },
                    colorSecundario === color.valor && styles.colorSelected
                  ]}
                  onPress={() => setColorSecundario(color.valor)}
                >
                  {color.valor === '#FFFFFF' && (
                    <View style={styles.whiteColorBorder} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Escudo del Equipo (Opcional)</Text>
            <View style={styles.escudoSection}>
              {escudoUrl ? (
                <View style={styles.escudoPreview}>
                  <Image source={{ uri: escudoUrl }} style={styles.escudoImage} />
                  <TouchableOpacity 
                    style={styles.removeEscudoButton}
                    onPress={() => setEscudoUrl('')}
                  >
                    <Text style={styles.removeEscudoText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.escudoPlaceholder}>
                  <Camera size={32} color={Colors.textLight} />
                  <Text style={styles.escudoPlaceholderText}>Sin escudo</Text>
                </View>
              )}
              <View style={styles.escudoButtons}>
                <TouchableOpacity 
                  style={styles.escudoButton}
                  onPress={handleSelectImage}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Upload size={16} color={Colors.primary} />
                  )}
                  <Text style={styles.escudoButtonText}>
                    {uploadingImage ? 'Subiendo...' : 'Cambiar Imagen'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.preview}>
            <Text style={styles.previewLabel}>Vista Previa</Text>
            <View style={styles.previewColors}>
              <View style={[styles.previewColor, { backgroundColor: colorPrincipal }]} />
              <View style={[styles.previewColor, { backgroundColor: colorSecundario }]} />
            </View>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.updateButton]}
              onPress={handleActualizar}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.updateButtonText}>Actualizar Equipo</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: Colors.primary,
  },
  preview: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 12,
  },
  previewColors: {
    flexDirection: 'row',
    gap: 16,
  },
  previewColor: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    backgroundColor: Colors.primary,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputText: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.text,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  dropdown: {
    maxHeight: 200,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  whiteColorBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  escudoSection: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  escudoPreview: {
    position: 'relative',
    marginBottom: 16,
  },
  escudoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  removeEscudoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeEscudoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  escudoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  escudoPlaceholderText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  escudoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  escudoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
  },
  escudoButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
});