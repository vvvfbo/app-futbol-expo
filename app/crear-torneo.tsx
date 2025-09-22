import CampoFormModal from '@/components/CampoFormModal';
import DatePicker from '@/components/DatePicker';
import LocationPicker from '@/components/LocationPicker';
import { CATEGORIAS, CIUDADES, CONFIGURACION_POR_TIPO, TIPOS_FUTBOL } from '@/constants/categories';
import Colors from '@/constants/colors';
import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';
import { Categoria, TipoFutbol, TipoTorneo } from '@/types';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, Plus, Tag, Target, Trophy, Users } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function CrearTorneoScreen() {
  const { user } = useAuth();
  const { equipos, crearTorneo, crearPartidos, campos, crearCampo } = useData();
  const [nombre, setNombre] = useState('');
  const [ciudad, setCiudad] = useState(CIUDADES[0]);
  const [ciudadPersonalizada, setCiudadPersonalizada] = useState('');
  const [usandoCiudadPersonalizada, setUsandoCiudadPersonalizada] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [categoria, setCategoria] = useState<Categoria>('Alevin');
  const [tipoFutbol, setTipoFutbol] = useState<TipoFutbol>('F11');
  const [tipoTorneo, setTipoTorneo] = useState<TipoTorneo>('grupos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [equiposSeleccionados, setEquiposSeleccionados] = useState<string[]>([]);
  const [campoSeleccionado, setCampoSeleccionado] = useState('');
  const [showCampoModal, setShowCampoModal] = useState(false);

  const toggleEquipo = (equipoId: string) => {
    setEquiposSeleccionados(prev =>
      prev.includes(equipoId)
        ? prev.filter(id => id !== equipoId)
        : [...prev, equipoId]
    );
  };

  const mezclarEquipos = (equipos: string[]): string[] => {
    const equiposMezclados = [...equipos];
    for (let i = equiposMezclados.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [equiposMezclados[i], equiposMezclados[j]] = [equiposMezclados[j], equiposMezclados[i]];
    }
    return equiposMezclados;
  };

  const generarCalendario = (equiposIds: string[], torneoId: string) => {
    const partidos = [];
    let jornada = 1;

    // Sorteo aleatorio de equipos
    const equiposSorteados = mezclarEquipos(equiposIds);

    if (tipoTorneo === 'grupos' || tipoTorneo === 'grupos-eliminatorias') {
      // Generar grupos automáticamente con equipos sorteados
      const equiposPorGrupo = Math.ceil(equiposSorteados.length / Math.ceil(equiposSorteados.length / 4)); // Máximo 4 equipos por grupo
      const grupos = [];

      for (let i = 0; i < equiposSorteados.length; i += equiposPorGrupo) {
        grupos.push(equiposSorteados.slice(i, i + equiposPorGrupo));
      }

      // Generar partidos para cada grupo
      grupos.forEach((grupo, grupoIndex) => {
        const nombreGrupo = String.fromCharCode(65 + grupoIndex); // A, B, C, etc.

        // Round-robin dentro del grupo
        for (let i = 0; i < grupo.length; i++) {
          for (let j = i + 1; j < grupo.length; j++) {
            const fecha = new Date();
            fecha.setDate(fecha.getDate() + (jornada - 1) * 7);

            partidos.push({
              torneoId,
              equipoLocalId: grupo[i],
              equipoVisitanteId: grupo[j],
              fecha: fecha.toISOString().split('T')[0],
              hora: '16:00',
              estado: 'Pendiente' as const,
              jornada,
              fase: 'grupos',
              grupo: nombreGrupo,
              campoId: campoSeleccionado
            });

            jornada++;
          }
        }
      });
    } else if (tipoTorneo === 'eliminatorias') {
      // Generar eliminatorias directas con equipos ya sorteados
      let equiposRestantes = [...equiposSorteados];
      let ronda = 1;

      while (equiposRestantes.length > 1) {
        const partidosRonda = [];
        const faseName = equiposRestantes.length <= 2 ? 'final' :
          equiposRestantes.length <= 4 ? 'semifinal' :
            equiposRestantes.length <= 8 ? 'cuartos' : 'octavos';

        for (let i = 0; i < equiposRestantes.length; i += 2) {
          if (i + 1 < equiposRestantes.length) {
            const fecha = new Date();
            fecha.setDate(fecha.getDate() + (ronda - 1) * 7);

            partidosRonda.push({
              torneoId,
              equipoLocalId: equiposRestantes[i],
              equipoVisitanteId: equiposRestantes[i + 1],
              fecha: fecha.toISOString().split('T')[0],
              hora: '16:00',
              estado: 'Pendiente' as const,
              jornada: ronda,
              fase: faseName,
              campoId: campoSeleccionado
            });
          }
        }

        partidos.push(...partidosRonda);
        equiposRestantes = equiposRestantes.filter((_, index) => index % 2 === 0);
        ronda++;
      }
    }

    return partidos;
  };

  const handleCrear = async () => {
    if (!nombre) {
      Alert.alert('Error', 'Por favor ingresa el nombre del torneo');
      return;
    }

    if (equiposSeleccionados.length < 2) {
      Alert.alert('Error', 'Selecciona al menos 2 equipos');
      return;
    }

    if (tipoTorneo === 'grupos' && equiposSeleccionados.length < 4) {
      Alert.alert('Error', 'Para torneos de grupos necesitas al menos 4 equipos');
      return;
    }

    if (tipoTorneo === 'grupos-eliminatorias' && equiposSeleccionados.length < 8) {
      Alert.alert('Error', 'Para torneos de grupos + eliminatorias necesitas al menos 8 equipos');
      return;
    }

    const configuracion = {
      ...CONFIGURACION_POR_TIPO[tipoFutbol],
      equiposPorGrupo: 4,
      clasificadosPorGrupo: 2
    };

    // Convertir fecha DD/MM/YYYY a YYYY-MM-DD para guardar
    const convertirFecha = (fechaDDMMYYYY: string): string => {
      const [day, month, year] = fechaDDMMYYYY.split('/');
      return `${year}-${month}-${day}`;
    };

    const torneoId = await crearTorneo({
      nombre,
      ciudad,
      categoria,
      tipoFutbol,
      fechaInicio: convertirFecha(fechaInicio),
      equiposIds: equiposSeleccionados,
      estado: 'En curso',
      tipo: tipoTorneo,
      maxEquipos: 16,
      minEquipos: 2,
      campoId: campoSeleccionado,
      configuracion,
      faseActual: tipoTorneo === 'eliminatorias' ? 'octavos' : 'grupos',
      creadorId: user?.id || ''
    });

    // Generar calendario automáticamente
    const calendario = generarCalendario(equiposSeleccionados, torneoId);
    await crearPartidos(calendario);

    Alert.alert(
      '🏆 Torneo Creado',
      `"${nombre}" ha sido creado exitosamente con ${equiposSeleccionados.length} equipos.\n\n¡El calendario de partidos ya está listo!`,
      [
        {
          text: 'Ver Torneo',
          onPress: () => {
            router.back();
            router.push(`/(tabs)/(torneos)/${torneoId}`);
          }
        },
        {
          text: 'Crear Otro',
          onPress: () => {
            // Resetear formulario para crear otro torneo
            setNombre('');
            setEquiposSeleccionados([]);
            setCampoSeleccionado('');
          }
        }
      ]
    );
  };

  const equiposFiltrados = equipos.filter(e => e.categoria === categoria && e.tipoFutbol === tipoFutbol);
  const camposFiltrados = campos.filter(c => c.ciudad === ciudad && c.tipo === tipoFutbol);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Torneo</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <Text style={styles.label}>Nombre del Torneo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Copa Primavera 2024"
            placeholderTextColor={Colors.textLight}
            value={nombre}
            onChangeText={setNombre}
          />

          <Text style={styles.label}>Ciudad</Text>

          {/* Ciudades Predefinidas */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
            {CIUDADES.map(c => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.optionChip,
                  !usandoCiudadPersonalizada && ciudad === c && styles.optionChipActive
                ]}
                onPress={() => {
                  setUsandoCiudadPersonalizada(false);
                  setCiudad(c);
                  setCiudadPersonalizada('');
                }}
              >
                <MapPin size={14} color={!usandoCiudadPersonalizada && ciudad === c ? 'white' : Colors.textLight} />
                <Text style={[
                  styles.optionChipText,
                  !usandoCiudadPersonalizada && ciudad === c && styles.optionChipTextActive
                ]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Separador */}
          <View style={styles.separadorCiudad}>
            <View style={styles.lineaSeparador} />
            <Text style={styles.textoSeparador}>o personalizada</Text>
            <View style={styles.lineaSeparador} />
          </View>

          {/* Ciudad Personalizada */}
          <View style={styles.ciudadPersonalizadaContainer}>
            <View style={styles.inputConBoton}>
              <TextInput
                style={[
                  styles.inputPersonalizado,
                  usandoCiudadPersonalizada && styles.inputPersonalizadoActivo
                ]}
                placeholder="Escribe tu ciudad..."
                placeholderTextColor={Colors.textLight}
                value={ciudadPersonalizada}
                onChangeText={(text) => {
                  setCiudadPersonalizada(text);
                  if (text.length > 0) {
                    setUsandoCiudadPersonalizada(true);
                    setCiudad(text);
                  } else {
                    setUsandoCiudadPersonalizada(false);
                    setCiudad('');
                  }
                }}
                onFocus={() => {
                  if (ciudadPersonalizada.length > 0) {
                    setUsandoCiudadPersonalizada(true);
                    setCiudad(ciudadPersonalizada);
                  }
                }}
              />
              <TouchableOpacity
                style={styles.botonMaps}
                onPress={() => setShowLocationPicker(true)}
              >
                <MapPin size={20} color={Colors.primary} />
                <Text style={styles.textoBotonMaps}>Maps</Text>
              </TouchableOpacity>
            </View>

            {usandoCiudadPersonalizada && ciudadPersonalizada && (
              <View style={styles.chipCiudadPersonalizada}>
                <MapPin size={14} color="white" />
                <Text style={styles.textoCiudadPersonalizada}>{ciudadPersonalizada}</Text>
                <TouchableOpacity
                  style={styles.botonLimpiar}
                  onPress={() => {
                    setCiudadPersonalizada('');
                    setUsandoCiudadPersonalizada(false);
                    setCiudad('');
                  }}
                >
                  <Text style={styles.textoBotonLimpiar}>×</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Text style={styles.label}>Categoría</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
            {CATEGORIAS.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.optionChip, categoria === c && styles.optionChipActive]}
                onPress={() => setCategoria(c)}
              >
                <Tag size={14} color={categoria === c ? 'white' : Colors.textLight} />
                <Text style={[styles.optionChipText, categoria === c && styles.optionChipTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Tipo de Fútbol</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
            {TIPOS_FUTBOL.map(tipo => (
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

          <Text style={styles.label}>Tipo de Torneo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
            <TouchableOpacity
              style={[styles.optionChip, tipoTorneo === 'grupos' && styles.optionChipActive]}
              onPress={() => setTipoTorneo('grupos')}
            >
              <Users size={14} color={tipoTorneo === 'grupos' ? 'white' : Colors.textLight} />
              <Text style={[styles.optionChipText, tipoTorneo === 'grupos' && styles.optionChipTextActive]}>
                Fase de Grupos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionChip, tipoTorneo === 'eliminatorias' && styles.optionChipActive]}
              onPress={() => setTipoTorneo('eliminatorias')}
            >
              <Target size={14} color={tipoTorneo === 'eliminatorias' ? 'white' : Colors.textLight} />
              <Text style={[styles.optionChipText, tipoTorneo === 'eliminatorias' && styles.optionChipTextActive]}>
                Eliminatorias Directas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionChip, tipoTorneo === 'grupos-eliminatorias' && styles.optionChipActive]}
              onPress={() => setTipoTorneo('grupos-eliminatorias')}
            >
              <Trophy size={14} color={tipoTorneo === 'grupos-eliminatorias' ? 'white' : Colors.textLight} />
              <Text style={[styles.optionChipText, tipoTorneo === 'grupos-eliminatorias' && styles.optionChipTextActive]}>
                Grupos + Eliminatorias
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <DatePicker
            label="Fecha de Inicio"
            value={fechaInicio}
            onDateChange={setFechaInicio}
            placeholder="Seleccionar fecha de inicio"
            minimumDate={new Date()}
          />

          <View style={styles.campoSection}>
            <View style={styles.campoHeader}>
              <Text style={styles.label}>Campo de Juego</Text>
              <TouchableOpacity
                style={styles.addCampoButton}
                onPress={() => setShowCampoModal(true)}
              >
                <Plus size={16} color={Colors.primary} />
                <Text style={styles.addCampoText}>Nuevo Campo</Text>
              </TouchableOpacity>
            </View>

            {camposFiltrados.length > 0 ? (
              <ScrollView style={styles.camposContainer}>
                {camposFiltrados.map(campo => (
                  <TouchableOpacity
                    key={campo.id}
                    style={[
                      styles.campoItem,
                      campoSeleccionado === campo.id && styles.campoItemSelected
                    ]}
                    onPress={() => setCampoSeleccionado(campo.id)}
                  >
                    <View style={styles.campoInfo}>
                      <Text style={styles.campoNombre}>{campo.nombre}</Text>
                      <Text style={styles.campoDireccion}>{campo.direccion}</Text>
                      {campo.coordenadas && (
                        <Text style={styles.campoCoordinates}>
                          📍 {campo.coordenadas.latitude.toFixed(4)}, {campo.coordenadas.longitude.toFixed(4)}
                        </Text>
                      )}
                      <View style={styles.campoDetails}>
                        <Text style={styles.campoSuperficie}>{campo.superficie}</Text>
                        {campo.precio && (
                          <Text style={styles.campoPrecio}>€{campo.precio}/partido</Text>
                        )}
                      </View>
                    </View>
                    {campoSeleccionado === campo.id && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noCamposContainer}>
                <Text style={styles.noEquiposText}>
                  No hay campos disponibles para {tipoFutbol} en {ciudad}
                </Text>
                <TouchableOpacity
                  style={styles.createFirstCampoButton}
                  onPress={() => setShowCampoModal(true)}
                >
                  <Plus size={20} color="white" />
                  <Text style={styles.createFirstCampoText}>Crear Primer Campo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Text style={styles.label}>Equipos Participantes</Text>
          {equiposFiltrados.length > 0 ? (
            <View style={styles.equiposList}>
              {equiposFiltrados.map(equipo => (
                <TouchableOpacity
                  key={equipo.id}
                  style={[
                    styles.equipoItem,
                    equiposSeleccionados.includes(equipo.id) && styles.equipoItemSelected
                  ]}
                  onPress={() => toggleEquipo(equipo.id)}
                >
                  <View style={styles.equipoInfo}>
                    <Text style={styles.equipoName}>{equipo.nombre}</Text>
                    <View style={styles.equipoColors}>
                      <View style={[styles.colorDot, { backgroundColor: equipo.colores.principal }]} />
                      <View style={[styles.colorDot, { backgroundColor: equipo.colores.secundario }]} />
                    </View>
                  </View>
                  {equiposSeleccionados.includes(equipo.id) && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noEquiposText}>
              No hay equipos disponibles para {categoria} - {tipoFutbol}. Crea equipos primero.
            </Text>
          )}

          <View style={styles.selectedCount}>
            <Users size={20} color={Colors.primary} />
            <Text style={styles.selectedCountText}>
              {equiposSeleccionados.length} equipos seleccionados
            </Text>
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
            >
              <Text style={styles.createButtonText}>Crear Torneo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <CampoFormModal
          visible={showCampoModal}
          onClose={() => setShowCampoModal(false)}
          onSave={async (campoData) => {
            try {
              const campoId = await crearCampo(campoData);
              setCampoSeleccionado(campoId);
              Alert.alert('Éxito', 'Campo creado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo crear el campo');
            }
          }}
          ciudad={ciudad}
        />

        {showLocationPicker && (
          <LocationPicker
            onLocationSelect={(locationData) => {
              if (locationData.address) {
                // Extraer solo la ciudad de la dirección completa
                const ciudad = locationData.address.split(',')[0].trim();
                setCiudadPersonalizada(ciudad);
                setUsandoCiudadPersonalizada(true);
                setCiudad(ciudad);
              }
              setShowLocationPicker(false);
            }}
            onClose={() => setShowLocationPicker(false)}
          />
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
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
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
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  camposContainer: {
    maxHeight: 200,
    marginBottom: 16,
  },
  campoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  campoItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  campoInfo: {
    flex: 1,
  },
  campoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  campoDireccion: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  campoCoordinates: {
    fontSize: 12,
    color: Colors.primary,
    marginBottom: 4,
  },
  campoSection: {
    marginBottom: 16,
  },
  campoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addCampoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 4,
  },
  addCampoText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  noCamposContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  createFirstCampoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  createFirstCampoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  campoDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  campoSuperficie: {
    fontSize: 12,
    color: Colors.textLight,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  campoPrecio: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  equiposList: {
    gap: 8,
  },
  equipoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  equipoItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  equipoInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  equipoName: {
    fontSize: 14,
    color: Colors.text,
  },
  equipoColors: {
    flexDirection: 'row',
    gap: 4,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkmarkText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noEquiposText: {
    textAlign: 'center',
    color: Colors.textLight,
    fontSize: 14,
    paddingVertical: 20,
  },
  selectedCount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
  },
  selectedCountText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
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
  // Estilos para ciudad personalizada
  separadorCiudad: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  lineaSeparador: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  textoSeparador: {
    fontSize: 12,
    color: Colors.textLight,
    paddingHorizontal: 8,
  },
  ciudadPersonalizadaContainer: {
    marginBottom: 8,
  },
  inputConBoton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputPersonalizado: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputPersonalizadoActivo: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  botonMaps: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 4,
  },
  textoBotonMaps: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  chipCiudadPersonalizada: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  textoCiudadPersonalizada: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  botonLimpiar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  textoBotonLimpiar: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 16,
  },
});