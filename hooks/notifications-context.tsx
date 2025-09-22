import createContextHook from '@nkzw/create-context-hook';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './auth-context';
import { useData } from './data-context';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationPreferences {
  partidosProximos: boolean;
  resultadosPartidos: boolean;
  nuevosEquiposEnTorneo: boolean;
  cambiosEnTorneo: boolean;
  recordatoriosPartidos: boolean;
  mensajesChat: boolean;
  propuestasAmistosos: boolean;
  confirmacionAmistosos: boolean;
}

interface ScheduledNotification {
  id: string;
  type: 'partido_proximo' | 'resultado_partido' | 'nuevo_equipo' | 'cambio_torneo' | 'recordatorio' | 'chat_message' | 'amistoso_propuesta' | 'amistoso_confirmado';
  title: string;
  body: string;
  data: any;
  scheduledTime: string;
  notificationId?: string;
}

interface NotificationsState {
  isEnabled: boolean;
  preferences: NotificationPreferences;
  scheduledNotifications: ScheduledNotification[];
  
  // Configuración
  requestPermissions: () => Promise<boolean>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  
  // Notificaciones inmediatas
  sendLocalNotification: (title: string, body: string, data?: any) => Promise<void>;
  
  // Notificaciones programadas
  schedulePartidoNotification: (partidoId: string, equipoLocal: string, equipoVisitante: string, fecha: string, hora: string) => Promise<void>;
  scheduleResultadoNotification: (partidoId: string, equipoLocal: string, equipoVisitante: string, golesLocal: number, golesVisitante: number, torneoId?: string, torneoEstado?: string) => Promise<void>;
  scheduleNuevoEquipoNotification: (torneoNombre: string, equipoNombre: string) => Promise<void>;
  scheduleCambioTorneoNotification: (torneoNombre: string, cambio: string) => Promise<void>;
  
  // Gestión de notificaciones
  cancelNotification: (notificationId: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  getScheduledNotifications: () => Promise<ScheduledNotification[]>;
  
  // Utilidades
  clearBadge: () => Promise<void>;
  scheduleTorneoFinalizadoNotification: (torneoNombre: string, campeon?: string, subcampeon?: string) => Promise<void>;
  
  // Verificar si ya se envió notificación para un partido
  hasNotificationBeenSent: (partidoId: string, type: string) => boolean;
  markNotificationAsSent: (partidoId: string, type: string) => Promise<void>;
  
  // Notificaciones de chat
  sendChatNotification: (senderName: string, message: string, chatId: string) => Promise<void>;
  
  // Notificaciones de amistosos
  sendAmistosoNotification: (type: 'propuesta' | 'confirmado' | 'cancelado', equipoLocal: string, equipoVisitante: string, fecha: string, hora: string) => Promise<void>;
  
  // Recordatorios automáticos
  scheduleMatchReminders: (partidoId: string, equipoLocal: string, equipoVisitante: string, fecha: string, hora: string, ubicacion?: string) => Promise<void>;
  cancelMatchReminders: (partidoId: string) => Promise<void>;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  partidosProximos: true,
  resultadosPartidos: true,
  nuevosEquiposEnTorneo: true,
  cambiosEnTorneo: true,
  recordatoriosPartidos: true,
  mensajesChat: true,
  propuestasAmistosos: true,
  confirmacionAmistosos: true,
};

export const [NotificationsProvider, useNotifications] = createContextHook<NotificationsState>(() => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [notificationsSent, setNotificationsSent] = useState<{[key: string]: boolean}>({});
  const { user } = useAuth();
  const { partidos } = useData();

  const initializeNotifications = useCallback(async () => {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
      setIsEnabled(false);
      return;
    }

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Notification initialization timeout')), 3000);
      });
      
      const permissionPromise = (async () => {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        return finalStatus;
      })();
      
      const finalStatus = await Promise.race([permissionPromise, timeoutPromise]) as string;
      
      setIsEnabled(finalStatus === 'granted');
      
      if (finalStatus === 'granted') {
        console.log('Notification permissions granted');
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
      setIsEnabled(false);
    }
  }, []);

  const loadPreferences = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const stored = await AsyncStorage.getItem(`notification_preferences_${user.id}`);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }, [user?.id]);

  const loadScheduledNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const stored = await AsyncStorage.getItem(`scheduled_notifications_${user.id}`);
      if (stored) {
        setScheduledNotifications(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
    }
  }, [user?.id]);

  const savePreferences = useCallback(async (newPreferences: NotificationPreferences) => {
    if (!user?.id) return;
    
    try {
      await AsyncStorage.setItem(
        `notification_preferences_${user.id}`,
        JSON.stringify(newPreferences)
      );
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }, [user?.id]);

  const saveScheduledNotifications = useCallback(async (notifications: ScheduledNotification[]) => {
    if (!user?.id || !Array.isArray(notifications)) {
      console.error('Invalid user or notifications array provided');
      return;
    }
    
    try {
      await AsyncStorage.setItem(
        `scheduled_notifications_${user.id}`,
        JSON.stringify(notifications)
      );
      setScheduledNotifications(notifications);
    } catch (error) {
      console.error('Error saving scheduled notifications:', error);
    }
  }, [user?.id]);

  const checkForNewResults = useCallback(async () => {
    // Esta función se ejecuta cuando cambian los partidos
    // Aquí podrías implementar lógica para detectar nuevos resultados
    // y enviar notificaciones automáticamente
  }, []);

  useEffect(() => {
    // Add delay to prevent hydration timeout
    const timeoutId = setTimeout(() => {
      initializeNotifications();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [initializeNotifications]);

  useEffect(() => {
    if (user) {
      // Add delay to prevent hydration timeout
      const timeoutId = setTimeout(() => {
        loadPreferences();
        loadScheduledNotifications();
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [user, loadPreferences, loadScheduledNotifications]);

  // Escuchar cambios en partidos para notificaciones automáticas
  useEffect(() => {
    if (isEnabled && user) {
      checkForNewResults();
    }
  }, [partidos, isEnabled, user, checkForNewResults]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      setIsEnabled(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }, []);

  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    if (!newPreferences || typeof newPreferences !== 'object') {
      console.error('Invalid preferences provided');
      return;
    }
    
    const updated = { ...preferences, ...newPreferences };
    await savePreferences(updated);
  }, [preferences, savePreferences]);

  const sendLocalNotification = useCallback(async (title: string, body: string, data?: any) => {
    if (!isEnabled || Platform.OS === 'web') {
      console.log('Notifications disabled or not supported');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
        },
        trigger: null, // Inmediata
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }, [isEnabled]);

  const schedulePartidoNotification = useCallback(async (
    partidoId: string,
    equipoLocal: string,
    equipoVisitante: string,
    fecha: string,
    hora: string
  ) => {
    if (!isEnabled || !preferences.partidosProximos || Platform.OS === 'web') {
      return;
    }

    try {
      const fechaPartido = new Date(`${fecha}T${hora}`);
      const notificationTime = new Date(fechaPartido.getTime() - 30 * 60 * 1000); // 30 minutos antes
      
      if (notificationTime <= new Date()) {
        return; // No programar si ya pasó el tiempo
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚽ Partido próximo',
          body: `${equipoLocal} vs ${equipoVisitante} en 30 minutos`,
          data: { partidoId, type: 'partido_proximo' },
          sound: true,
        },
        trigger: {
          type: 'date',
          date: notificationTime,
        } as Notifications.DateTriggerInput,
      });

      const scheduledNotification: ScheduledNotification = {
        id: `partido_${partidoId}`,
        type: 'partido_proximo',
        title: '⚽ Partido próximo',
        body: `${equipoLocal} vs ${equipoVisitante} en 30 minutos`,
        data: { partidoId },
        scheduledTime: notificationTime.toISOString(),
        notificationId,
      };

      const updated = [...scheduledNotifications, scheduledNotification];
      await saveScheduledNotifications(updated);
    } catch (error) {
      console.error('Error scheduling partido notification:', error);
    }
  }, [isEnabled, preferences.partidosProximos, scheduledNotifications, saveScheduledNotifications]);

  const scheduleResultadoNotification = useCallback(async (
    partidoId: string,
    equipoLocal: string,
    equipoVisitante: string,
    golesLocal: number,
    golesVisitante: number,
    torneoId?: string,
    torneoEstado?: string
  ) => {
    if (!isEnabled || !preferences.resultadosPartidos) {
      return;
    }

    // No enviar notificaciones si el torneo está finalizado
    if (torneoEstado === 'Finalizado') {
      console.log('No se envía notificación: torneo finalizado');
      return;
    }

    // Verificar si ya se envió notificación para este partido
    if (hasNotificationBeenSent(partidoId, 'resultado_partido')) {
      console.log('Notificación ya enviada para este partido');
      return;
    }

    const resultado = golesLocal > golesVisitante 
      ? `Ganó ${equipoLocal}` 
      : golesLocal < golesVisitante 
      ? `Ganó ${equipoVisitante}` 
      : 'Empate';

    await sendLocalNotification(
      '🏆 Resultado del partido',
      `${equipoLocal} ${golesLocal} - ${golesVisitante} ${equipoVisitante}\n${resultado}`,
      { partidoId, torneoId, type: 'resultado_partido' }
    );

    // Marcar como enviada
    await markNotificationAsSent(partidoId, 'resultado_partido');
  }, [isEnabled, preferences.resultadosPartidos, sendLocalNotification]);

  const scheduleNuevoEquipoNotification = useCallback(async (
    torneoNombre: string,
    equipoNombre: string
  ) => {
    if (!isEnabled || !preferences.nuevosEquiposEnTorneo) {
      return;
    }

    await sendLocalNotification(
      '👥 Nuevo equipo inscrito',
      `${equipoNombre} se ha inscrito en ${torneoNombre}`,
      { type: 'nuevo_equipo' }
    );
  }, [isEnabled, preferences.nuevosEquiposEnTorneo, sendLocalNotification]);

  const scheduleCambioTorneoNotification = useCallback(async (
    torneoNombre: string,
    cambio: string
  ) => {
    if (!isEnabled || !preferences.cambiosEnTorneo) {
      return;
    }

    await sendLocalNotification(
      '📅 Cambio en torneo',
      `${torneoNombre}: ${cambio}`,
      { type: 'cambio_torneo' }
    );
  }, [isEnabled, preferences.cambiosEnTorneo, sendLocalNotification]);

  const cancelNotification = useCallback(async (notificationId: string) => {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      const updated = scheduledNotifications.filter(n => n.notificationId !== notificationId);
      await saveScheduledNotifications(updated);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }, [scheduledNotifications, saveScheduledNotifications]);

  const cancelAllNotifications = useCallback(async () => {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await saveScheduledNotifications([]);
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }, [saveScheduledNotifications]);

  const getScheduledNotifications = useCallback(async (): Promise<ScheduledNotification[]> => {
    return scheduledNotifications;
  }, [scheduledNotifications]);

  const clearBadge = useCallback(async () => {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Error clearing badge:', error);
    }
  }, []);

  const scheduleTorneoFinalizadoNotification = useCallback(async (
    torneoNombre: string,
    campeon?: string,
    subcampeon?: string
  ) => {
    if (!isEnabled || !preferences.cambiosEnTorneo) {
      return;
    }

    let mensaje = `El torneo ${torneoNombre} ha finalizado.`;
    if (campeon) {
      mensaje += ` 🏆 Campeón: ${campeon}`;
    }
    if (subcampeon) {
      mensaje += ` 🥈 Subcampeón: ${subcampeon}`;
    }

    await sendLocalNotification(
      '🏁 Torneo Finalizado',
      mensaje,
      { type: 'torneo_finalizado' }
    );
  }, [isEnabled, preferences.cambiosEnTorneo, sendLocalNotification]);

  const hasNotificationBeenSent = useCallback((partidoId: string, type: string): boolean => {
    const key = `${partidoId}_${type}`;
    return notificationsSent[key] || false;
  }, [notificationsSent]);

  const markNotificationAsSent = useCallback(async (partidoId: string, type: string) => {
    const key = `${partidoId}_${type}`;
    const updated = { ...notificationsSent, [key]: true };
    setNotificationsSent(updated);
    
    if (user?.id) {
      try {
        await AsyncStorage.setItem(
          `notifications_sent_${user.id}`,
          JSON.stringify(updated)
        );
      } catch (error) {
        console.error('Error saving notification state:', error);
      }
    }
  }, [notificationsSent, user?.id]);

  // Cargar estado de notificaciones enviadas
  useEffect(() => {
    const loadNotificationsSent = async () => {
      if (!user?.id) return;
      
      try {
        const stored = await AsyncStorage.getItem(`notifications_sent_${user.id}`);
        if (stored) {
          setNotificationsSent(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading notifications sent state:', error);
      }
    };
    
    loadNotificationsSent();
  }, [user?.id]);

  // Notificaciones de chat
  const sendChatNotification = useCallback(async (senderName: string, message: string, chatId: string) => {
    if (!isEnabled || !preferences.mensajesChat) {
      return;
    }

    const truncatedMessage = message.length > 50 ? `${message.substring(0, 50)}...` : message;
    
    await sendLocalNotification(
      `💬 ${senderName}`,
      truncatedMessage,
      { type: 'chat_message', chatId, senderId: senderName }
    );
  }, [isEnabled, preferences.mensajesChat, sendLocalNotification]);

  // Notificaciones de amistosos
  const sendAmistosoNotification = useCallback(async (
    type: 'propuesta' | 'confirmado' | 'cancelado',
    equipoLocal: string,
    equipoVisitante: string,
    fecha: string,
    hora: string
  ) => {
    if (!isEnabled) return;
    
    let shouldSend = false;
    let title = '';
    let body = '';
    let emoji = '';
    
    switch (type) {
      case 'propuesta':
        shouldSend = preferences.propuestasAmistosos;
        emoji = '⚽';
        title = 'Nueva propuesta de amistoso';
        body = `${equipoLocal} vs ${equipoVisitante} el ${fecha} a las ${hora}`;
        break;
      case 'confirmado':
        shouldSend = preferences.confirmacionAmistosos;
        emoji = '✅';
        title = 'Amistoso confirmado';
        body = `${equipoLocal} vs ${equipoVisitante} el ${fecha} a las ${hora}`;
        break;
      case 'cancelado':
        shouldSend = preferences.confirmacionAmistosos;
        emoji = '❌';
        title = 'Amistoso cancelado';
        body = `${equipoLocal} vs ${equipoVisitante} programado para el ${fecha}`;
        break;
    }
    
    if (shouldSend) {
      await sendLocalNotification(
        `${emoji} ${title}`,
        body,
        { type: 'amistoso', subType: type }
      );
    }
  }, [isEnabled, preferences.propuestasAmistosos, preferences.confirmacionAmistosos, sendLocalNotification]);

  // Programar recordatorios automáticos de partidos
  const scheduleMatchReminders = useCallback(async (
    partidoId: string,
    equipoLocal: string,
    equipoVisitante: string,
    fecha: string,
    hora: string,
    ubicacion?: string
  ) => {
    if (!isEnabled || !preferences.recordatoriosPartidos || Platform.OS === 'web') {
      return;
    }

    try {
      const matchDate = new Date(`${fecha}T${hora}`);
      const now = new Date();
      
      // Recordatorio 24 horas antes
      const reminder24h = new Date(matchDate.getTime() - 24 * 60 * 60 * 1000);
      if (reminder24h > now) {
        const notification24hId = await Notifications.scheduleNotificationAsync({
          content: {
            title: '⚽ Partido mañana',
            body: `${equipoLocal} vs ${equipoVisitante} mañana a las ${hora}${ubicacion ? ` en ${ubicacion}` : ''}`,
            data: { partidoId, type: 'recordatorio_24h' },
            sound: true,
          },
          trigger: {
            type: 'date',
            date: reminder24h,
          } as Notifications.DateTriggerInput,
        });
        
        const scheduledNotification24h: ScheduledNotification = {
          id: `recordatorio_24h_${partidoId}`,
          type: 'recordatorio',
          title: '⚽ Partido mañana',
          body: `${equipoLocal} vs ${equipoVisitante} mañana a las ${hora}`,
          data: { partidoId },
          scheduledTime: reminder24h.toISOString(),
          notificationId: notification24hId,
        };
        
        const updated24h = [...scheduledNotifications, scheduledNotification24h];
        await saveScheduledNotifications(updated24h);
      }
      
      // Recordatorio 2 horas antes
      const reminder2h = new Date(matchDate.getTime() - 2 * 60 * 60 * 1000);
      if (reminder2h > now) {
        const notification2hId = await Notifications.scheduleNotificationAsync({
          content: {
            title: '⚽ Partido en 2 horas',
            body: `${equipoLocal} vs ${equipoVisitante} a las ${hora}${ubicacion ? ` en ${ubicacion}` : ''}`,
            data: { partidoId, type: 'recordatorio_2h' },
            sound: true,
          },
          trigger: {
            type: 'date',
            date: reminder2h,
          } as Notifications.DateTriggerInput,
        });
        
        const scheduledNotification2h: ScheduledNotification = {
          id: `recordatorio_2h_${partidoId}`,
          type: 'recordatorio',
          title: '⚽ Partido en 2 horas',
          body: `${equipoLocal} vs ${equipoVisitante} a las ${hora}`,
          data: { partidoId },
          scheduledTime: reminder2h.toISOString(),
          notificationId: notification2hId,
        };
        
        const updated2h = [...scheduledNotifications, scheduledNotification2h];
        await saveScheduledNotifications(updated2h);
      }
      
      console.log('✅ Recordatorios programados para partido:', partidoId);
    } catch (error) {
      console.error('❌ Error scheduling match reminders:', error);
    }
  }, [isEnabled, preferences.recordatoriosPartidos, scheduledNotifications, saveScheduledNotifications]);

  // Cancelar recordatorios de un partido
  const cancelMatchReminders = useCallback(async (partidoId: string) => {
    if (Platform.OS === 'web') return;
    
    try {
      const remindersToCancel = scheduledNotifications.filter(notification => 
        notification.data?.partidoId === partidoId && notification.type === 'recordatorio'
      );
      
      for (const reminder of remindersToCancel) {
        if (reminder.notificationId) {
          await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
        }
      }
      
      const updatedNotifications = scheduledNotifications.filter(notification => 
        !(notification.data?.partidoId === partidoId && notification.type === 'recordatorio')
      );
      
      await saveScheduledNotifications(updatedNotifications);
      console.log('✅ Recordatorios cancelados para partido:', partidoId);
    } catch (error) {
      console.error('❌ Error canceling match reminders:', error);
    }
  }, [scheduledNotifications, saveScheduledNotifications]);

  return useMemo(() => ({
    isEnabled,
    preferences,
    scheduledNotifications,
    requestPermissions,
    updatePreferences,
    sendLocalNotification,
    schedulePartidoNotification,
    scheduleResultadoNotification,
    scheduleNuevoEquipoNotification,
    scheduleCambioTorneoNotification,
    cancelNotification,
    cancelAllNotifications,
    getScheduledNotifications,
    clearBadge,
    scheduleTorneoFinalizadoNotification,
    hasNotificationBeenSent,
    markNotificationAsSent,
    sendChatNotification,
    sendAmistosoNotification,
    scheduleMatchReminders,
    cancelMatchReminders,
  }), [
    isEnabled,
    preferences,
    scheduledNotifications,
    requestPermissions,
    updatePreferences,
    sendLocalNotification,
    schedulePartidoNotification,
    scheduleResultadoNotification,
    scheduleNuevoEquipoNotification,
    scheduleCambioTorneoNotification,
    cancelNotification,
    cancelAllNotifications,
    getScheduledNotifications,
    clearBadge,
    scheduleTorneoFinalizadoNotification,
    hasNotificationBeenSent,
    markNotificationAsSent,
    sendChatNotification,
    sendAmistosoNotification,
    scheduleMatchReminders,
    cancelMatchReminders,
  ]);
});