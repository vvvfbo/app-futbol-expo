import React, { useEffect } from 'react';
import { useNotifications } from '@/hooks/notifications-context';
import { useNotificationIntegration } from '@/hooks/use-notification-integration';
import { useData } from '@/hooks/data-context';
import { useAuth } from '@/hooks/auth-context';

// Este componente maneja las notificaciones automáticas
export default function NotificationManager() {
  const { isEnabled } = useNotifications();
  const { 
    notifyPartidoCreado,
    notifyResultadoActualizado,
    notifyEquipoInscrito,
    notifyCambioTorneo,
    shouldNotifyForTorneo,
    shouldNotifyForEquipo,
  } = useNotificationIntegration();
  
  const { partidos, torneos, equipos } = useData();
  const { user } = useAuth();

  // Escuchar cambios en partidos para notificar resultados
  useEffect(() => {
    if (!isEnabled || !user) return;

    // Verificar si hay nuevos resultados
    const partidosConResultado = partidos.filter(p => 
      p.estado === 'Jugado' && 
      p.golesLocal !== undefined && 
      p.golesVisitante !== undefined
    );

    partidosConResultado.forEach(partido => {
      // Solo notificar si el usuario debe recibir notificaciones para este torneo
      if (shouldNotifyForTorneo(partido.torneoId)) {
        notifyResultadoActualizado(
          partido.id,
          partido.equipoLocalId,
          partido.equipoVisitanteId,
          partido.golesLocal!,
          partido.golesVisitante!
        );
      }
    });
  }, [partidos, isEnabled, user, notifyResultadoActualizado, shouldNotifyForTorneo]);

  // Escuchar cambios en torneos para notificar nuevos equipos
  useEffect(() => {
    if (!isEnabled || !user) return;

    torneos.forEach(torneo => {
      if (shouldNotifyForTorneo(torneo.id)) {
        // Aquí podrías implementar lógica para detectar nuevos equipos
        // Por simplicidad, omitimos esta funcionalidad por ahora
      }
    });
  }, [torneos, isEnabled, user, shouldNotifyForTorneo]);

  // Este componente no renderiza nada, solo maneja las notificaciones
  return null;
}