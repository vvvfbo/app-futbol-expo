import { useCallback } from 'react';
import { useNotifications } from './notifications-context';
import { useData } from './data-context';
import { useAuth } from './auth-context';

export function useNotificationIntegration() {
  const { 
    schedulePartidoNotification,
    scheduleResultadoNotification,
    scheduleNuevoEquipoNotification,
    scheduleCambioTorneoNotification,
  } = useNotifications();
  
  const { equipos, torneos } = useData();
  const { user } = useAuth();

  // Programar notificación cuando se crea un partido
  const notifyPartidoCreado = useCallback(async (
    partidoId: string,
    equipoLocalId: string,
    equipoVisitanteId: string,
    fecha: string,
    hora: string
  ) => {
    const equipoLocal = equipos.find(e => e.id === equipoLocalId);
    const equipoVisitante = equipos.find(e => e.id === equipoVisitanteId);
    
    if (equipoLocal && equipoVisitante) {
      await schedulePartidoNotification(
        partidoId,
        equipoLocal.nombre,
        equipoVisitante.nombre,
        fecha,
        hora
      );
    }
  }, [equipos, schedulePartidoNotification]);

  // Notificar cuando se actualiza un resultado
  const notifyResultadoActualizado = useCallback(async (
    partidoId: string,
    equipoLocalId: string,
    equipoVisitanteId: string,
    golesLocal: number,
    golesVisitante: number
  ) => {
    const equipoLocal = equipos.find(e => e.id === equipoLocalId);
    const equipoVisitante = equipos.find(e => e.id === equipoVisitanteId);
    
    if (equipoLocal && equipoVisitante) {
      await scheduleResultadoNotification(
        partidoId,
        equipoLocal.nombre,
        equipoVisitante.nombre,
        golesLocal,
        golesVisitante
      );
    }
  }, [equipos, scheduleResultadoNotification]);

  // Notificar cuando un equipo se inscribe en un torneo
  const notifyEquipoInscrito = useCallback(async (
    torneoId: string,
    equipoId: string
  ) => {
    const torneo = torneos.find(t => t.id === torneoId);
    const equipo = equipos.find(e => e.id === equipoId);
    
    if (torneo && equipo) {
      await scheduleNuevoEquipoNotification(torneo.nombre, equipo.nombre);
    }
  }, [torneos, equipos, scheduleNuevoEquipoNotification]);

  // Notificar cambios en torneos
  const notifyCambioTorneo = useCallback(async (
    torneoId: string,
    cambio: string
  ) => {
    const torneo = torneos.find(t => t.id === torneoId);
    
    if (torneo) {
      await scheduleCambioTorneoNotification(torneo.nombre, cambio);
    }
  }, [torneos, scheduleCambioTorneoNotification]);

  // Verificar si el usuario debe recibir notificaciones para un torneo específico
  const shouldNotifyForTorneo = useCallback((torneoId: string): boolean => {
    if (!user) return false;
    
    // Los entrenadores reciben notificaciones de sus propios torneos
    if (user.rol === 'entrenador') {
      const torneo = torneos.find(t => t.id === torneoId);
      return torneo?.creadorId === user.id;
    }
    
    // Los espectadores reciben notificaciones de torneos a los que están suscritos
    if (user.rol === 'espectador') {
      return user.torneosSubscritos?.includes(torneoId) || false;
    }
    
    return false;
  }, [user, torneos]);

  // Verificar si el usuario debe recibir notificaciones para un equipo específico
  const shouldNotifyForEquipo = useCallback((equipoId: string): boolean => {
    if (!user) return false;
    
    // Los entrenadores reciben notificaciones de sus propios equipos
    if (user.rol === 'entrenador') {
      const equipo = equipos.find(e => e.id === equipoId);
      return equipo?.entrenadorId === user.id;
    }
    
    return false;
  }, [user, equipos]);

  return {
    notifyPartidoCreado,
    notifyResultadoActualizado,
    notifyEquipoInscrito,
    notifyCambioTorneo,
    shouldNotifyForTorneo,
    shouldNotifyForEquipo,
  };
}