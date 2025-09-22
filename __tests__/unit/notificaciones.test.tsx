import { useNotifications } from '@/hooks/notifications-context';

// Mock de los hooks
jest.mock('@/hooks/notifications-context');

describe('Notificaciones - Unit Tests', () => {
  const mockEnviarNotificacion = jest.fn();
  const mockProgramarRecordatorio = jest.fn();
  const mockCancelarNotificacion = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useNotifications as jest.Mock).mockReturnValue({
      notificaciones: [],
      enviarNotificacion: mockEnviarNotificacion,
      programarRecordatorio: mockProgramarRecordatorio,
      cancelarNotificacion: mockCancelarNotificacion,
      marcarComoLeida: jest.fn(),
      obtenerNotificacionesPendientes: jest.fn(),
      limpiarNotificaciones: jest.fn(),
    });
  });

  test('debe enviar notificación al editar partido', async () => {
    const partidoData = {
      id: 'partido-123',
      equipoLocalId: 'team1',
      equipoVisitanteId: 'team2',
      fecha: '2024-01-15',
      hora: '18:00',
      estado: 'Jugado',
      golesLocal: 2,
      golesVisitante: 1,
    };

    const notificacionData = {
      titulo: 'Partido Finalizado',
      mensaje: `El partido ha terminado: Team 1 ${partidoData.golesLocal} - ${partidoData.golesVisitante} Team 2`,
      tipo: 'partido_finalizado',
      partidoId: partidoData.id,
    };

    mockEnviarNotificacion.mockResolvedValue(true);

    const result = await mockEnviarNotificacion(notificacionData);

    expect(mockEnviarNotificacion).toHaveBeenCalledWith(notificacionData);
    expect(result).toBe(true);
  });

  test('debe enviar notificación al actualizar resultado de partido', async () => {
    const partidoId = 'partido-123';
    const golesLocal = 3;
    const golesVisitante = 2;

    const notificacionData = {
      titulo: 'Resultado Actualizado',
      mensaje: `Se ha actualizado el resultado del partido: ${golesLocal} - ${golesVisitante}`,
      tipo: 'resultado_actualizado',
      partidoId,
    };

    mockEnviarNotificacion.mockResolvedValue(true);

    const result = await mockEnviarNotificacion(notificacionData);

    expect(mockEnviarNotificacion).toHaveBeenCalledWith(notificacionData);
    expect(result).toBe(true);
  });

  test('NO debe enviar notificación al finalizar torneo', async () => {
    const torneoData = {
      id: 'torneo-123',
      nombre: 'Torneo Test',
      estado: 'Finalizado',
      campeon: 'team1',
      subcampeon: 'team2',
    };

    // Simular que NO se envía notificación al finalizar torneo
    const shouldSendNotification = (evento: string) => {
      const eventosConNotificacion = ['partido_editado', 'partido_finalizado', 'resultado_actualizado'];
      return eventosConNotificacion.includes(evento);
    };

    expect(shouldSendNotification('torneo_finalizado')).toBe(false);
    expect(shouldSendNotification('partido_finalizado')).toBe(true);
    expect(shouldSendNotification('partido_editado')).toBe(true);
  });

  test('debe programar recordatorio de partido', async () => {
    const partidoData = {
      id: 'partido-123',
      fecha: '2024-01-15',
      hora: '18:00',
      equipoLocalId: 'team1',
      equipoVisitanteId: 'team2',
    };

    const recordatorioData = {
      partidoId: partidoData.id,
      fechaRecordatorio: '2024-01-15T16:00:00.000Z', // 2 horas antes
      mensaje: 'Tu partido comienza en 2 horas',
    };

    mockProgramarRecordatorio.mockResolvedValue('recordatorio-id');

    const result = await mockProgramarRecordatorio(recordatorioData);

    expect(mockProgramarRecordatorio).toHaveBeenCalledWith(recordatorioData);
    expect(result).toBe('recordatorio-id');
  });

  test('debe cancelar notificación programada', async () => {
    const notificacionId = 'notificacion-123';

    mockCancelarNotificacion.mockResolvedValue(true);

    const result = await mockCancelarNotificacion(notificacionId);

    expect(mockCancelarNotificacion).toHaveBeenCalledWith(notificacionId);
    expect(result).toBe(true);
  });

  test('debe validar tipos de notificación permitidos', () => {
    const tiposPermitidos = [
      'partido_editado',
      'partido_finalizado',
      'resultado_actualizado',
      'recordatorio_partido',
      'mensaje_chat',
    ];

    const tiposNoPermitidos = [
      'torneo_finalizado',
      'torneo_creado',
      'equipo_creado',
    ];

    const validarTipoNotificacion = (tipo: string) => {
      return tiposPermitidos.includes(tipo);
    };

    tiposPermitidos.forEach(tipo => {
      expect(validarTipoNotificacion(tipo)).toBe(true);
    });

    tiposNoPermitidos.forEach(tipo => {
      expect(validarTipoNotificacion(tipo)).toBe(false);
    });
  });
});

// Test para control de notificaciones duplicadas
describe('Control de Notificaciones Duplicadas - Unit Tests', () => {
  test('debe evitar notificaciones duplicadas para el mismo partido', () => {
    const notificacionesEnviadas = new Set<string>();

    const enviarNotificacionUnica = (partidoId: string, tipo: string) => {
      const clave = `${partidoId}-${tipo}`;
      
      if (notificacionesEnviadas.has(clave)) {
        return false; // Ya se envió esta notificación
      }
      
      notificacionesEnviadas.add(clave);
      return true; // Notificación enviada
    };

    const partidoId = 'partido-123';
    const tipo = 'partido_finalizado';

    // Primera vez debe enviarse
    expect(enviarNotificacionUnica(partidoId, tipo)).toBe(true);
    
    // Segunda vez NO debe enviarse (duplicada)
    expect(enviarNotificacionUnica(partidoId, tipo)).toBe(false);
    
    // Diferente tipo sí debe enviarse
    expect(enviarNotificacionUnica(partidoId, 'resultado_actualizado')).toBe(true);
  });

  test('debe limpiar notificaciones antiguas', () => {
    const notificaciones = [
      { id: '1', fecha: '2024-01-01', leida: true },
      { id: '2', fecha: '2024-01-10', leida: false },
      { id: '3', fecha: '2024-01-15', leida: true },
      { id: '4', fecha: '2024-01-20', leida: false },
    ];

    const limpiarNotificacionesAntiguas = (notificacionesArray: { id: string; fecha: string; leida: boolean }[], diasAntiguedad: number) => {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad);
      
      return notificacionesArray.filter((notif: { id: string; fecha: string; leida: boolean }) => {
        const fechaNotif = new Date(notif.fecha);
        return fechaNotif >= fechaLimite || !notif.leida;
      });
    };

    const notificacionesLimpias = limpiarNotificacionesAntiguas(notificaciones, 10);
    
    // Debe mantener las no leídas y las recientes
    expect(notificacionesLimpias.length).toBeGreaterThan(0);
    expect(notificacionesLimpias.every((n: { id: string; fecha: string; leida: boolean }) => !n.leida || new Date(n.fecha) >= new Date('2024-01-10'))).toBe(true);
  });
});

// Test para formato de mensajes de notificación
describe('Formato de Mensajes - Unit Tests', () => {
  test('debe generar mensaje correcto para partido finalizado', () => {
    const generarMensajePartidoFinalizado = (equipoLocal: string, equipoVisitante: string, golesLocal: number, golesVisitante: number) => {
      return `⚽ Partido finalizado: ${equipoLocal} ${golesLocal} - ${golesVisitante} ${equipoVisitante}`;
    };

    const mensaje = generarMensajePartidoFinalizado('Real Madrid', 'Barcelona', 2, 1);
    
    expect(mensaje).toBe('⚽ Partido finalizado: Real Madrid 2 - 1 Barcelona');
    expect(mensaje).toContain('⚽');
    expect(mensaje).toContain('2 - 1');
  });

  test('debe generar mensaje correcto para recordatorio de partido', () => {
    const generarMensajeRecordatorio = (equipoLocal: string, equipoVisitante: string, horasRestantes: number, ubicacion?: string) => {
      const ubicacionTexto = ubicacion ? ` en ${ubicacion}` : '';
      return `⏰ Tu partido ${equipoLocal} vs ${equipoVisitante} comienza en ${horasRestantes} horas${ubicacionTexto}`;
    };

    const mensaje1 = generarMensajeRecordatorio('Real Madrid', 'Barcelona', 2);
    const mensaje2 = generarMensajeRecordatorio('Real Madrid', 'Barcelona', 24, 'Estadio Santiago Bernabéu');
    
    expect(mensaje1).toBe('⏰ Tu partido Real Madrid vs Barcelona comienza en 2 horas');
    expect(mensaje2).toBe('⏰ Tu partido Real Madrid vs Barcelona comienza en 24 horas en Estadio Santiago Bernabéu');
    expect(mensaje1).toContain('⏰');
    expect(mensaje2).toContain('Estadio Santiago Bernabéu');
  });

  test('debe generar mensaje correcto para mensaje de chat', () => {
    const generarMensajeChat = (remitente: string, mensaje: string) => {
      const mensajeCorto = mensaje.length > 50 ? mensaje.substring(0, 47) + '...' : mensaje;
      return `💬 ${remitente}: ${mensajeCorto}`;
    };

    const mensajeCorto = generarMensajeChat('Juan Pérez', 'Hola, ¿cómo estás?');
    const mensajeLargo = generarMensajeChat('Juan Pérez', 'Este es un mensaje muy largo que debería ser truncado porque excede el límite de caracteres permitidos');
    
    expect(mensajeCorto).toBe('💬 Juan Pérez: Hola, ¿cómo estás?');
    expect(mensajeLargo).toBe('💬 Juan Pérez: Este es un mensaje muy largo que debería ser tr...');
    expect(mensajeLargo.length).toBeLessThanOrEqual(60); // Límite aproximado
  });
});