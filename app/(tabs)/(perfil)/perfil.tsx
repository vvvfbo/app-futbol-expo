import Colors from '@/constants/colors';
import { useAuth } from '@/hooks/auth-context';
import { useChat } from '@/hooks/chat-context';
import { useData } from '@/hooks/data-context';
import { useTestDataGenerator } from '@/hooks/use-test-data-generator';
import { router } from 'expo-router';
import { Bell, Database, LogOut, MessageCircle, Settings, Trophy, User, Users } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { equipos, torneos } = useData();
  const { getTotalUnreadCount } = useChat();
  const { generarDatosPrueba, limpiarDatosPrueba, pruebaSimple, verificarDatos } = useTestDataGenerator();
  const [loading, setLoading] = useState(false);

  const misEquipos = user?.rol === 'entrenador' ? equipos.filter(e => e.entrenadorId === user?.id) : [];
  const misTorneos = user?.rol === 'entrenador' ? torneos.filter(t =>
    t.equiposIds.some(equipoId => misEquipos.some(e => e.id === equipoId))
  ) : [];

  const totalUnreadChats = getTotalUnreadCount();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/auth');
          }
        }
      ]
    );
  };

  const handleOpenChats = () => {
    router.push('/chats');
  };

  const handleGenerateTestData = () => {
    console.log('🎯 Botón presionado, usuario:', user?.nombre, 'rol:', user?.rol);
    Alert.alert(
      '🚀 Generar Datos de Prueba',
      `¡Hola ${user?.nombre}! ¿Quieres crear datos de prueba completos?\n\n✅ 1 Club con ubicación\n⚽ 6 Equipos españoles\n👥 90 Jugadores (15 por equipo)\n🏆 1 Torneo con partidos\n\nEsto te permitirá probar todas las funciones de la app.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: '🎯 ¡CREAR!',
          onPress: async () => {
            console.log('🚀 Iniciando proceso de generación...');
            try {
              setLoading(true);
              const result = await generarDatosPrueba();
              console.log('📊 Resultado del generador:', result);

              if (result.success) {
                Alert.alert(
                  '🎉 ¡Éxito Total!',
                  `¡Datos creados correctamente!\n\n✅ Club: Club Deportivo Prueba\n⚽ Equipos: ${result.data?.equiposIds?.length || 6}\n🏆 Torneo: Copa de Prueba 2024\n📅 Partidos: ${result.data?.partidosCreados || 15}\n\n¡Ve a explorar tus nuevos datos!`
                );
              } else {
                Alert.alert('❌ Error', `No se pudieron generar los datos:\n\n${result.error || 'Error desconocido'}\n\n¿Intentar de nuevo?`);
              }
            } catch (error) {
              console.error('💥 Error capturado:', error);
              Alert.alert('💥 Error Inesperado', `Algo salió mal:\n\n${error instanceof Error ? error.message : 'Error desconocido'}\n\n¿Intentar de nuevo?`);
            } finally {
              setLoading(false);
              console.log('✅ Proceso completado, loading = false');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <User size={32} color="white" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.nombre}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {user?.rol === 'entrenador' ? 'Entrenador' : 'Espectador'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ciudad:</Text>
              <Text style={styles.infoValue}>{user?.ciudad}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rol:</Text>
              <Text style={styles.infoValue}>
                {user?.rol === 'entrenador' ? 'Entrenador' : 'Espectador'}
              </Text>
            </View>
          </View>
        </View>

        {user?.rol === 'entrenador' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estadísticas</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Users size={24} color={Colors.primary} />
                <Text style={styles.statNumber}>{misEquipos.length}</Text>
                <Text style={styles.statLabel}>Equipos</Text>
              </View>
              <View style={styles.statCard}>
                <Trophy size={24} color={Colors.primary} />
                <Text style={styles.statNumber}>{misTorneos.length}</Text>
                <Text style={styles.statLabel}>Torneos</Text>
              </View>
              <View style={styles.statCard}>
                <User size={24} color={Colors.primary} />
                <Text style={styles.statNumber}>
                  {misEquipos.reduce((total, equipo) => total + (equipo.jugadores?.length || 0), 0)}
                </Text>
                <Text style={styles.statLabel}>Jugadores</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/notificaciones')}
          >
            <Bell size={20} color={Colors.textLight} />
            <Text style={styles.actionButtonText}>Notificaciones</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleOpenChats}
          >
            <View style={styles.chatIconContainer}>
              <MessageCircle size={20} color={Colors.textLight} />
              {totalUnreadChats > 0 && (
                <View style={styles.chatBadge}>
                  <Text style={styles.chatBadgeText}>
                    {totalUnreadChats > 99 ? '99+' : totalUnreadChats}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.actionButtonText}>Chats</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/configuracion')}
          >
            <Settings size={20} color={Colors.textLight} />
            <Text style={styles.actionButtonText}>Configuración</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Trophy size={20} color={Colors.textLight} />
            <Text style={styles.actionButtonText}>Historial de Torneos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, loading && styles.disabledButton, { backgroundColor: Colors.primary }]}
            onPress={handleGenerateTestData}
            disabled={loading}
          >
            <Database size={20} color="white" />
            <Text style={[styles.actionButtonText, { color: 'white', fontWeight: 'bold' }]}>
              {loading ? 'Generando Datos...' : '🚀 GENERAR DATOS DE PRUEBA'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#ff9500', marginTop: 10 }]}
            onPress={async () => {
              console.log('🧪 Botón prueba simple presionado');
              try {
                setLoading(true);
                const result = await pruebaSimple();
                console.log('🧪 Resultado prueba simple:', result);

                if (result.success) {
                  Alert.alert('✅ Prueba Simple', 'Club de prueba creado correctamente!');
                } else {
                  Alert.alert('❌ Error Prueba', result.error || 'Error en prueba simple');
                }
              } catch (error) {
                console.error('💥 Error prueba simple:', error);
                Alert.alert('💥 Error', 'Error inesperado en prueba simple');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            <Database size={20} color="white" />
            <Text style={[styles.actionButtonText, { color: 'white' }]}>
              🧪 PRUEBA SIMPLE (Solo Club)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botón de verificación de datos */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.info }]}
            onPress={async () => {
              console.log('🔥 BOTÓN VERIFICAR PRESIONADO!');
              console.log('🔧 Función verificarDatos:', typeof verificarDatos);

              try {
                console.log('🔍 Verificando datos guardados...');

                if (!verificarDatos) {
                  console.error('❌ verificarDatos no está disponible!');
                  Alert.alert('❌ Error', 'Función verificarDatos no disponible');
                  return;
                }

                const result = await verificarDatos();
                console.log('📊 Resultado verificación:', result);

                Alert.alert(
                  '🔍 Verificación de Datos',
                  result.success
                    ? '✅ Verificación completada. Revisa la consola para detalles.'
                    : `❌ Error: ${result.error}`
                );
              } catch (error) {
                console.error('💥 Error verificación:', error);
                Alert.alert('💥 Error', 'Error inesperado en verificación');
              }
            }}
          >
            <Database size={20} color="white" />
            <Text style={[styles.actionButtonText, { color: 'white' }]}>
              🔍 VERIFICAR DATOS GUARDADOS
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="white" />
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: Colors.surface,
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleBadgeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 10,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    gap: 16,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  actionButtonText: {
    fontSize: 17,
    color: Colors.text,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    padding: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  chatIconContainer: {
    position: 'relative',
  },
  chatBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  chatBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    color: Colors.textSecondary,
  },
});