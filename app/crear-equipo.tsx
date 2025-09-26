import EscudoSelector from '@/components/EscudoSelector';
import { CIUDADES, COLORES_EQUIPO, TIPOS_FUTBOL } from '@/constants/categories';
import Colors from '@/constants/colors';
import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';
import { Categoria, TipoFutbol, ValidationError } from '@/types';
import { getFieldError, validateEquipo } from '@/utils/validation';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Camera, MapPin, Upload, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORIAS_LETRAS = ['A', 'B', 'C', 'D', 'E', 'F'];

function CrearEquipoContent({ clubId, categoria }: { clubId: string; categoria: string }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { crearEquipo, clubes, agregarEquipoAClub } = useData();

  const club = clubes.find(c => c.id === clubId);

  const [nombre, setNombre] = useState('');
  const [ciudad, setCiudad] = useState(club?.ubicacion.ciudad || user?.ciudad || CIUDADES[0]);
  const [categoriaSeleccionada] = useState<Categoria>(categoria as Categoria || 'Senior');
  const [tipoFutbol, setTipoFutbol] = useState<TipoFutbol>('F11');
  const [categoriaLetra, setCategoriaLetra] = useState<string>('A');
  const [colorPrincipal, setColorPrincipal] = useState(COLORES_EQUIPO[0].valor);
  const [colorSecundario, setColorSecundario] = useState(COLORES_EQUIPO[1].valor);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [escudoUrl, setEscudoUrl] = useState<string>('');
  const [showEscudoSelector, setShowEscudoSelector] = useState(false);

  // Generar nombre automático si es para un club
  useEffect(() => {
    if (club && !nombre) {
      const nombreBase = `${club.nombre} ${categoriaSeleccionada}`;
      setNombre(nombreBase);
    }
  }, [club, categoriaSeleccionada, nombre]);

  // Validación en tiempo real
  useEffect(() => {
    if (nombre || ciudad) {
      const equipoData = {
        nombre,
        ciudad,
        colores: { principal: colorPrincipal, secundario: colorSecundario },
        entrenadorId: user?.id || ''
      };
      const validationErrors = validateEquipo(equipoData);
      setErrors(validationErrors);
    }
  }, [nombre, ciudad, colorPrincipal, colorSecundario, user]);

  const handleSelectEscudo = (escudo: string) => {
    setEscudoUrl(escudo);
    Alert.alert('Éxito', 'Escudo seleccionado correctamente');
  };

  const handleCrear = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    // Generar nombre final con letra de categoría
    const nombreFinal = `${nombre} ${categoriaLetra}`;

    const equipoData = {
      nombre: nombreFinal,
      ciudad,
      categoria: categoriaSeleccionada,
      tipoFutbol,
      colores: { principal: colorPrincipal, secundario: colorSecundario },
      entrenadorId: user.id,
      clubId: clubId
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
      console.log('🏗️ === CREANDO EQUIPO ===');
      console.log('🏗️ Datos del equipo:', equipoData);
      console.log('🏗️ Es para club:', !!club);
      console.log('🏗️ Club ID:', club?.id);
      console.log('🏗️ Usuario ID:', user.id);

      const equipoCompleto = {
        ...equipoData,
        jugadores: [],
        escudo: escudoUrl || undefined,
        escudoLocal: escudoUrl || undefined
      };

      console.log('🏗️ Equipo completo a crear:', equipoCompleto);


      // Crear equipo y agregarlo al club usando el objeto recién creado para evitar problemas de sincronización
      const equipoId = await crearEquipo(equipoCompleto);
      console.log('✅ Equipo creado con ID:', equipoId);
      if (equipoId) {
        console.log('🔗 Agregando equipo al club...');
        try {
          await agregarEquipoAClub(clubId, equipoId, categoriaSeleccionada, { ...equipoCompleto, id: equipoId, fechaCreacion: new Date().toISOString(), jugadores: equipoCompleto.jugadores || [] });
          console.log('✅ Equipo agregado al club exitosamente');
        } catch (clubError) {
          console.error('❌ Error agregando equipo al club:', clubError);
          Alert.alert('Advertencia', 'El equipo se creó pero hubo un problema al agregarlo al club. Puedes intentar agregarlo manualmente.');
        }
      }

      console.log('🏗️ === PROCESO COMPLETADO ===');

      Alert.alert(
        'Éxito',
        'Equipo agregado al club correctamente.',
        [
          {
            text: 'Ver Equipo',
            onPress: () => {
              router.back();
              router.push(`/(tabs)/(equipos)/${equipoId}`);
            }
          },
          {
            text: 'Crear Otro',
            onPress: () => {
              // Resetear para crear otro equipo en el mismo club
              const nombreBase = `${club?.nombre || 'Equipo'} ${categoriaSeleccionada}`;
              setNombre(nombreBase);
              setCategoriaLetra('A');
              setColorPrincipal(COLORES_EQUIPO[0].valor);
              setColorSecundario(COLORES_EQUIPO[1].valor);
              setErrors([]);
              setEscudoUrl('');
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error creating team:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      Alert.alert('Error', `No se pudo crear el equipo: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Crear Equipo - {club?.nombre || 'Club'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          {/* Información del Club */}
          <View style={styles.clubInfo}>
            <Text style={styles.clubInfoTitle}>Club: {club?.nombre || 'Cargando...'}</Text>
            <Text style={styles.clubInfoSubtitle}>Categoría: {categoriaSeleccionada}</Text>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre del Equipo *</Text>
            <View style={[
              styles.inputContainer,
              getFieldError(errors, 'nombre') && styles.inputError
            ]}>
              <Users size={20} color={Colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={club ? `${club.nombre} ${categoriaSeleccionada}` : "Ej: Real Madrid CF"}
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

          {/* Letra de Categoría */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Letra del Equipo *</Text>
            <Text style={styles.helperText}>Selecciona la letra para diferenciar equipos de la misma categoría</Text>
            <View style={styles.lettersGrid}>
              {CATEGORIAS_LETRAS.map((letra) => (
                <TouchableOpacity
                  key={letra}
                  style={[
                    styles.letterButton,
                    categoriaLetra === letra && styles.letterButtonSelected
                  ]}
                  onPress={() => setCategoriaLetra(letra)}
                >
                  <Text style={[
                    styles.letterButtonText,
                    categoriaLetra === letra && styles.letterButtonTextSelected
                  ]}>
                    {letra}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tipo de Fútbol */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Fútbol *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
              {TIPOS_FUTBOL.map((tipo) => (
                <TouchableOpacity
                  key={tipo.value}
                  style={[styles.optionChip, tipoFutbol === tipo.value && styles.optionChipActive]}
                  onPress={() => setTipoFutbol(tipo.value)}
                >
                  <Users size={14} color={tipoFutbol === tipo.value ? 'white' : Colors.textLight} />
                  <Text style={[styles.optionChipText, tipoFutbol === tipo.value && styles.optionChipTextActive]}>
                    {tipo.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ubicación *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
              {CIUDADES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.optionChip, ciudad === c && styles.optionChipActive]}
                  onPress={() => setCiudad(c)}
                >
                  <MapPin size={14} color={ciudad === c ? 'white' : Colors.textLight} />
                  <Text style={[styles.optionChipText, ciudad === c && styles.optionChipTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {getFieldError(errors, 'ciudad') && (
              <Text style={styles.errorText}>{getFieldError(errors, 'ciudad')}</Text>
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
                  onPress={() => setShowEscudoSelector(true)}
                >
                  <Upload size={16} color={Colors.primary} />
                  <Text style={styles.escudoButtonText}>
                    Seleccionar Escudo
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
              style={[styles.button, styles.createButton]}
              onPress={handleCrear}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.createButtonText}>
                  Agregar al Club
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <EscudoSelector
        visible={showEscudoSelector}
        onClose={() => setShowEscudoSelector(false)}
        onEscudoSelect={handleSelectEscudo}
        currentEscudo={escudoUrl}
      />
    </View>
  );
}

export default function CrearEquipoScreen() {
  const { clubId, categoria } = useLocalSearchParams();

  // Redirigir si no hay clubId - solo se puede crear equipos desde clubes
  if (!clubId) {
    router.replace('/(tabs)/(clubes)/clubes');
    return null;
  }

  return (
    <CrearEquipoContent
      clubId={clubId as string}
      categoria={categoria as string}
    />
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
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  clubInfo: {
    backgroundColor: Colors.primary + '10',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  clubInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  clubInfoSubtitle: {
    fontSize: 14,
    color: Colors.primary,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 12,
  },
  lettersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  letterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  letterButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  letterButtonTextSelected: {
    color: '#FFFFFF',
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
  createButton: {
    backgroundColor: Colors.primary,
  },
  createButtonText: {
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
  optionsScroll: {
    maxHeight: 40,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  optionChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionChipText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  optionChipTextActive: {
    color: 'white',
  },
});