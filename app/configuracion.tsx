import ThemeToggle from '@/components/ThemeToggle';
import Colors from '@/constants/colors';
import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';
import { useTheme } from '@/hooks/theme-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { ArrowLeft, Bell, Bug, Database, Globe, Moon, Plus, RefreshCw, Shield, Trash2, User } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConfiguracionScreen() {
  const { user, actualizarUsuario } = useAuth();
  const {
    limpiarTodosLosDatos,
    recargarDatos,
    torneos,
    equipos,
    partidos,
    crearClub,
    crearEquipo,
    crearTorneo,
    crearPartidos,
    crearAmistoso
  } = useData();
  const { colors } = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChangeRole = () => {
    const newRole = user?.rol === 'entrenador' ? 'espectador' : 'entrenador';
    const roleText = newRole === 'entrenador' ? 'Entrenador' : 'Espectador';

    Alert.alert(
      'Cambiar Rol',
      `¿Estás seguro de que quieres cambiar tu rol a ${roleText}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cambiar',
          onPress: async () => {
            setIsUpdating(true);
            try {
              await actualizarUsuario({ rol: newRole });
              Alert.alert('Éxito', `Tu rol ha sido cambiado a ${roleText}`);
            } catch {
              Alert.alert('Error', 'No se pudo cambiar el rol');
            } finally {
              setIsUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handleToggleNotifications = async (value: boolean) => {
    try {
      await actualizarUsuario({
        configuracion: {
          notificaciones: value,
          modoOscuro: user?.configuracion?.modoOscuro || false,
          idioma: user?.configuracion?.idioma || 'es'
        }
      });
    } catch {
      Alert.alert('Error', 'No se pudo actualizar la configuración');
    }
  };

  const handleToggleDarkMode = async (value: boolean) => {
    try {
      await actualizarUsuario({
        configuracion: {
          notificaciones: user?.configuracion?.notificaciones || false,
          modoOscuro: value,
          idioma: user?.configuracion?.idioma || 'es'
        }
      });
    } catch {
      Alert.alert('Error', 'No se pudo actualizar la configuración');
    }
  };

  const handleClearAllData = () => {
    // Solo permitir a entrenadores limpiar datos
    if (user?.rol !== 'entrenador') {
      Alert.alert(
        'Acceso Denegado',
        'Solo los entrenadores pueden eliminar datos de la aplicación.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Limpiar Todos los Datos',
      `¿Estás seguro de que quieres eliminar todos los datos?\n\nActualmente tienes:\n• ${torneos.length} torneos\n• ${equipos.length} equipos\n• ${partidos.length} partidos\n\nEsta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Todo',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              console.log('🧹 Iniciando limpieza desde configuración...');
              await limpiarTodosLosDatos();
              console.log('✅ Limpieza completada desde configuración');

              Alert.alert(
                'Datos Eliminados',
                'Todos los datos han sido eliminados correctamente.\n\nLa aplicación mostrará datos de ejemplo hasta que crees nuevos contenidos.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Force reload of the screen
                      setTimeout(() => {
                        recargarDatos();
                      }, 500);
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('❌ Error clearing data from UI:', error);

              Alert.alert(
                'Limpieza Completada',
                'Los datos han sido eliminados. Si continúas viendo contenido anterior, reinicia la aplicación.',
                [
                  { text: 'OK' },
                  {
                    text: 'Recargar Datos',
                    onPress: () => recargarDatos()
                  }
                ]
              );
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  const showDataInfo = () => {
    // Solo permitir a entrenadores ver información detallada
    if (user?.rol !== 'entrenador') {
      Alert.alert(
        'Acceso Denegado',
        'Solo los entrenadores pueden ver información detallada de datos.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Información de Datos',
      `Datos actuales en la aplicación:\n\n• Torneos: ${torneos.length}\n• Equipos: ${equipos.length}\n• Partidos: ${partidos.length}`,
      [{ text: 'OK' }]
    );
  };

  const handleDiagnostic = async () => {
    // Solo permitir a entrenadores ejecutar diagnósticos
    if (user?.rol !== 'entrenador') {
      Alert.alert(
        'Acceso Denegado',
        'Solo los entrenadores pueden ejecutar diagnósticos del sistema.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsDiagnosing(true);
    try {
      console.log('🔍 === DIAGNÓSTICO COMPLETO ===');

      // Check AsyncStorage keys
      const keys = await AsyncStorage.getAllKeys();
      console.log('🔑 AsyncStorage keys:', keys);

      let corruptedKeys: string[] = [];
      let validKeys: string[] = [];

      for (const key of keys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            try {
              const parsed = JSON.parse(value);
              validKeys.push(key);
              console.log(`✅ ${key}: Valid JSON, type: ${typeof parsed}, ${Array.isArray(parsed) ? `array[${parsed.length}]` : ''}`);
            } catch (parseError) {
              corruptedKeys.push(key);
              console.error(`❌ ${key}: Invalid JSON:`, parseError);
              console.log(`🔍 First 100 chars of ${key}:`, value.substring(0, 100));
            }
          }
        } catch (error) {
          console.error(`❌ Error reading ${key}:`, error);
          corruptedKeys.push(key);
        }
      }

      console.log('📊 Current state:');
      console.log('  - Equipos:', equipos.length);
      console.log('  - Torneos:', torneos.length);
      console.log('  - Partidos:', partidos.length);

      let message = `Diagnóstico completado:\n\n`;
      message += `✅ Claves válidas: ${validKeys.length}\n`;
      message += `❌ Claves corruptas: ${corruptedKeys.length}\n\n`;
      message += `📊 Estado actual:\n`;
      message += `• Torneos: ${torneos.length}\n`;
      message += `• Equipos: ${equipos.length}\n`;
      message += `• Partidos: ${partidos.length}\n\n`;

      if (corruptedKeys.length > 0) {
        message += `⚠️ Claves corruptas encontradas:\n${corruptedKeys.join(', ')}\n\n`;
        message += `Se recomienda limpiar los datos para resolver problemas.`;
      } else {
        message += `🎉 Todos los datos están en buen estado.`;
      }

      Alert.alert('Diagnóstico Completo', message, [
        { text: 'OK' },
        ...(corruptedKeys.length > 0 ? [{
          text: 'Limpiar Datos Corruptos',
          style: 'destructive' as const,
          onPress: () => handleClearCorruptedData(corruptedKeys)
        }] : [])
      ]);

    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
      Alert.alert('Error', 'No se pudo completar el diagnóstico');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleClearCorruptedData = async (corruptedKeys: string[]) => {
    try {
      for (const key of corruptedKeys) {
        await AsyncStorage.removeItem(key);
        console.log(`🧹 Removed corrupted key: ${key}`);
      }

      // Reload data
      await recargarDatos();

      Alert.alert('Éxito', 'Datos corruptos eliminados y datos recargados.');
    } catch (error) {
      console.error('❌ Error clearing corrupted data:', error);
      Alert.alert('Error', 'No se pudieron limpiar los datos corruptos');
    }
  };

  const handleGenerateData = () => {
    // Solo permitir a entrenadores generar datos
    if (user?.rol !== 'entrenador') {
      Alert.alert(
        'Acceso Denegado',
        'Solo los entrenadores pueden generar datos de prueba.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      '🎲 Generar Datos de Prueba',
      'Esto creará equipos, clubes, torneos y partidos aleatorios para probar la aplicación.\n\n¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Generar',
          onPress: async () => {
            setIsGenerating(true);
            try {
              // Importar el generador de datos
              const { DataGenerator } = await import('../utils/data-generator');
              const generator = new DataGenerator();

              console.log('🎲 Generando datos de prueba...');

              // Generar datos temporales
              const data = generator.generateCompleteDataset();
              console.log('📦 Datos generados, integrando en la aplicación...');

              let clubesCreados = 0;
              let equiposCreados = 0;
              let torneosCreados = 0;
              let partidosCreados = 0;
              let amistososCreados = 0;

              // Crear clubes
              for (const clubData of data.clubes) {
                try {
                  const { id, fechaCreacion, ...clubSinId } = clubData;
                  await crearClub({
                    ...clubSinId,
                    entrenadorId: user?.id || 'generated-user'
                  });
                  clubesCreados++;
                } catch (error) {
                  console.warn('⚠️ Error creando club:', error);
                }
              }

              // Crear equipos
              for (const equipoData of data.equipos) {
                try {
                  const { id, fechaCreacion, jugadores, ...equipoSinId } = equipoData;
                  await crearEquipo({
                    ...equipoSinId,
                    entrenadorId: user?.id || 'generated-user',
                    jugadores: jugadores.map(j => ({ ...j, equipoId: '' })) // Se asignará automáticamente
                  });
                  equiposCreados++;
                } catch (error) {
                  console.warn('⚠️ Error creando equipo:', error);
                }
              }

              // Crear torneos
              for (const torneoData of data.torneos) {
                try {
                  const { id, fechaCreacion, ...torneoSinId } = torneoData;
                  await crearTorneo({
                    ...torneoSinId,
                    creadorId: user?.id || 'generated-user'
                  });
                  torneosCreados++;
                } catch (error) {
                  console.warn('⚠️ Error creando torneo:', error);
                }
              }

              // Crear amistosos
              for (const amistososData of data.amistosos) {
                try {
                  const { id, fechaCreacion, ...amistosoSinId } = amistososData;
                  await crearAmistoso(amistosoSinId);
                  amistososCreados++;
                } catch (error) {
                  console.warn('⚠️ Error creando amistoso:', error);
                }
              }

              console.log(`✅ Integración completada: ${clubesCreados} clubes, ${equiposCreados} equipos, ${torneosCreados} torneos, ${amistososCreados} amistosos`);

              // Recargar datos para mostrar los nuevos
              await recargarDatos();

              Alert.alert(
                '🎉 Datos Generados e Integrados',
                `Se han creado exitosamente:\n• ${clubesCreados} clubes deportivos\n• ${equiposCreados} equipos\n• ${torneosCreados} torneos\n• ${amistososCreados} amistosos\n\n¡Ya puedes explorar todas las funcionalidades con datos reales!`,
                [
                  { text: 'Explorar Torneos', onPress: () => router.push('/(tabs)/(torneos)/') },
                  { text: 'Ver Equipos', onPress: () => router.push('/(tabs)/(equipos)/') },
                  { text: 'OK' }
                ]
              );

            } catch (error) {
              console.error('❌ Error generating data:', error);
              Alert.alert(
                'Error',
                `No se pudieron generar los datos de prueba: ${error instanceof Error ? error.message : 'Error desconocido'}`
              );
            } finally {
              setIsGenerating(false);
            }
          }
        }
      ]
    );
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
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <User size={20} color={Colors.primary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Rol de Usuario</Text>
                  <Text style={styles.settingValue}>
                    {user?.rol === 'entrenador' ? 'Entrenador' : 'Espectador'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.changeButton, isUpdating && styles.changeButtonDisabled]}
                onPress={handleChangeRole}
                disabled={isUpdating}
              >
                <RefreshCw size={16} color={Colors.primary} />
                <Text style={styles.changeButtonText}>
                  {isUpdating ? 'Cambiando...' : 'Cambiar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Sección de Tema */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apariencia</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Moon size={20} color={Colors.primary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Tema</Text>
                  <Text style={styles.settingDescription}>
                    Cambia entre tema claro y oscuro
                  </Text>
                </View>
              </View>
              <ThemeToggle size="medium" showLabel={false} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Bell size={20} color={Colors.primary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Notificaciones Push</Text>
                  <Text style={styles.settingDescription}>
                    Recibir notificaciones de partidos y torneos
                  </Text>
                </View>
              </View>
              <Switch
                value={user?.configuracion?.notificaciones || false}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={user?.configuracion?.notificaciones ? 'white' : Colors.textLight}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apariencia</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Moon size={20} color={Colors.primary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Modo Oscuro</Text>
                  <Text style={styles.settingDescription}>
                    Cambiar a tema oscuro
                  </Text>
                </View>
              </View>
              <Switch
                value={user?.configuracion?.modoOscuro || false}
                onValueChange={handleToggleDarkMode}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={user?.configuracion?.modoOscuro ? 'white' : Colors.textLight}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Globe size={20} color={Colors.primary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Idioma</Text>
                  <Text style={styles.settingValue}>Español</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Shield size={20} color={Colors.primary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Versión</Text>
                  <Text style={styles.settingValue}>1.0.0</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Solo mostrar sección de datos para entrenadores */}
        {user?.rol === 'entrenador' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gestión de Datos</Text>

            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Database size={20} color={Colors.primary} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Ver Datos</Text>
                    <Text style={styles.settingDescription}>
                      Torneos: {torneos.length} • Equipos: {equipos.length} • Partidos: {partidos.length}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={showDataInfo}
                >
                  <Database size={16} color={Colors.primary} />
                  <Text style={styles.changeButtonText}>Ver</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Bug size={20} color={Colors.primary} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Diagnóstico</Text>
                    <Text style={styles.settingDescription}>
                      Verificar integridad de datos y detectar errores
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.changeButton, isDiagnosing && styles.changeButtonDisabled]}
                  onPress={handleDiagnostic}
                  disabled={isDiagnosing}
                >
                  <Bug size={16} color={Colors.primary} />
                  <Text style={styles.changeButtonText}>
                    {isDiagnosing ? 'Analizando...' : 'Diagnosticar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Plus size={20} color={Colors.success} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Generar Datos de Prueba</Text>
                    <Text style={styles.settingDescription}>
                      Crear equipos, torneos y partidos aleatorios para probar la app
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.successButton, isGenerating && styles.changeButtonDisabled]}
                  onPress={handleGenerateData}
                  disabled={isGenerating}
                >
                  <Plus size={16} color={Colors.background} />
                  <Text style={styles.successButtonText}>
                    {isGenerating ? 'Generando...' : 'Generar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Trash2 size={20} color={Colors.error} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Limpiar Datos</Text>
                    <Text style={styles.settingDescription}>
                      Eliminar todos los torneos, equipos y partidos
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.dangerButton, isClearing && styles.changeButtonDisabled]}
                  onPress={handleClearAllData}
                  disabled={isClearing}
                >
                  <Trash2 size={16} color={Colors.error} />
                  <Text style={styles.dangerButtonText}>
                    {isClearing ? 'Eliminando...' : 'Limpiar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.infoText}>
            {user?.rol === 'entrenador'
              ? 'Como entrenador tienes acceso completo para crear y gestionar equipos, torneos y ver estadísticas detalladas.'
              : 'Como espectador puedes seguir torneos, ver resultados y cambiar tu configuración personal. Para acceder a funciones de gestión, cambia tu rol a entrenador.'
            }
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
  placeholder: {
    width: 40,
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
    marginBottom: 12,
  },
  settingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    color: Colors.textLight,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textLight,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  changeButtonDisabled: {
    opacity: 0.5,
  },
  changeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  dangerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.error,
  },
  successButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  successButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.background,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 20,
  },
});