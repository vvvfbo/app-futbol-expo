export type UserRole = 'entrenador' | 'espectador' | 'arbitro';
export type TipoTorneo = 'grupos' | 'eliminatorias' | 'grupos-eliminatorias';
export type FaseTorneo = 'grupos' | 'octavos' | 'cuartos' | 'semifinal' | 'final';
export type EstadoPartido = 'Pendiente' | 'En curso' | 'Jugado' | 'Suspendido' | 'Cancelado';
export type EstadoTorneo = 'Próximo' | 'En curso' | 'Finalizado' | 'Cancelado';
export type EstadoAmistoso = 'Disponible' | 'Propuesto' | 'Confirmado' | 'Finalizado' | 'Cancelado';
export type FranjaHoraria = 'mañana' | 'tarde' | 'noche';

export interface ValidationError {
  field: string;
  message: string;
}

export interface RegisterFormData {
  nombreCompleto: string;
  email: string;
  password: string;
  confirmPassword: string;
  rol: UserRole;
  ciudad?: string;
  telefono?: string;
  fechaNacimiento?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface User {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  rol: UserRole;
  ciudad: string;
  equipoFavorito?: string;
  experiencia?: string; // Solo para entrenadores
  licencia?: string; // Solo para entrenadores
  torneosSubscritos?: string[]; // Solo para espectadores
  equiposCreados?: string[]; // Solo para entrenadores
  torneosCreados?: string[]; // Solo para entrenadores
  partidosArbitrados?: string[]; // Solo para árbitros
  configuracion?: {
    notificaciones: boolean;
    modoOscuro: boolean;
    idioma: string;
  };
  estadisticas?: {
    torneosGanados: number;
    partidosJugados: number;
    golesAnotados: number;
  };
  fechaRegistro: string;
  ultimaActividad: string;
}

export interface Equipo {
  id: string;
  nombre: string;
  escudo?: string; // URL de la imagen del escudo
  escudoLocal?: string; // Base64 o URL local del escudo
  colores: {
    principal: string;
    secundario: string;
  };
  entrenadorId: string;
  jugadores: Jugador[];
  fechaCreacion: string;
  ciudad: string;
  categoria?: Categoria;
  tipoFutbol?: TipoFutbol;
  clubId?: string; // ID del club al que pertenece (opcional para equipos independientes)
  estadisticas?: {
    partidosJugados: number;
    partidosGanados: number;
    partidosEmpatados: number;
    partidosPerdidos: number;
    golesFavor: number;
    golesContra: number;
    torneosParticipados: number;
    torneosGanados: number;
    amistososJugados: number;
    amistososGanados: number;
  };
}

export interface Jugador {
  id: string;
  nombre: string;
  numero: number;
  posicion: 'Portero' | 'Defensa' | 'Mediocampista' | 'Delantero';
  equipoId: string;
  edad?: number;
  altura?: number;
  peso?: number;
  piePredominante?: 'Derecho' | 'Izquierdo' | 'Ambidiestro';
  estadisticas?: {
    partidosJugados: number;
    goles: number;
    asistencias: number;
    tarjetasAmarillas: number;
    tarjetasRojas: number;
    porteriasCero: number; // Solo para porteros
  };
  fechaRegistro: string;
}

export type Categoria = 'Benjamin' | 'Alevin' | 'Infantil' | 'Cadete' | 'Juvenil' | 'Senior';
export type TipoFutbol = 'F11' | 'F7' | 'Sala';

export interface Club {
  id: string;
  nombre: string;
  escudo?: string;
  ubicacion: {
    direccion: string;
    ciudad: string;
    coordenadas?: {
      latitud: number;
      longitud: number;
    };
  };
  entrenadorId: string; // Propietario del club
  fechaCreacion: string;
  descripcion?: string;
  telefono?: string;
  email?: string;
  categorias: {
    [categoria: string]: {
      nombre: Categoria;
      equipos: string[]; // IDs de equipos
    };
  };
  estadisticas?: {
    totalEquipos: number;
    torneosParticipados: number;
    amistososJugados: number;
  };
}

export interface CampoFutbol {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  tipo: TipoFutbol;
  capacidad?: number;
  superficie: 'Césped natural' | 'Césped artificial' | 'Tierra' | 'Cemento';
  iluminacion: boolean;
  vestuarios: boolean;
  coordenadas?: {
    latitude: number;
    longitude: number;
  };
  contacto?: {
    telefono?: string;
    email?: string;
  };
  precio?: number;
  disponibilidad?: {
    lunes: boolean;
    martes: boolean;
    miercoles: boolean;
    jueves: boolean;
    viernes: boolean;
    sabado: boolean;
    domingo: boolean;
  };
}

export interface Torneo {
  id: string;
  nombre: string;
  descripcion?: string;
  ciudad: string;
  categoria: Categoria;
  tipoFutbol: TipoFutbol;
  fechaInicio: string;
  fechaFin?: string;
  equiposIds: string[];
  maxEquipos: number;
  minEquipos: number;
  estado: EstadoTorneo;
  tipo: TipoTorneo;
  creadorId: string;
  arbitroId?: string;
  campoId?: string;
  configuracion: {
    puntosVictoria: number;
    puntosEmpate: number;
    puntosDerrota: number;
    tiempoPartido: number; // en minutos
    descanso: number; // en minutos
    permitirEmpates: boolean;
    equiposPorGrupo?: number; // Para torneos con grupos
    clasificadosPorGrupo?: number; // Cuántos equipos clasifican por grupo
  };
  grupos?: {
    [grupoId: string]: {
      nombre: string; // A, B, C, etc.
      equiposIds: string[];
    };
  };
  faseActual?: FaseTorneo;
  premios?: {
    primero?: string;
    segundo?: string;
    tercero?: string;
  };
  fechaCreacion: string;
  fechaLimiteInscripcion?: string;
  ubicacion?: {
    direccion: string;
    coordenadas?: {
      latitud: number;
      longitud: number;
    };
  };
  resultadoFinal?: {
    campeon?: string; // equipoId
    subcampeon?: string; // equipoId
    tercerPuesto?: string; // equipoId
    fechaFinalizacion: string;
  };
  cuadroEliminatorias?: {
    [fase: string]: {
      partidos: {
        id: string;
        equipoLocalId?: string;
        equipoVisitanteId?: string;
        ganadorId?: string;
        fecha?: string;
        hora?: string;
        posicion: number; // Posición en el cuadro
      }[];
    };
  };
  notificacionesEnviadas?: {
    [partidoId: string]: boolean; // Para evitar notificaciones duplicadas
  };
  equiposSeleccionadosManualmente?: boolean; // Indica si los equipos fueron seleccionados manualmente
}

export interface Partido {
  id: string;
  torneoId: string;
  equipoLocalId: string;
  equipoVisitanteId: string;
  fecha: string;
  hora: string;
  golesLocal?: number;
  golesVisitante?: number;
  estado: EstadoPartido;
  jornada: number;
  fase?: string; // 'grupos', 'octavos', 'cuartos', 'semifinal', 'final'
  grupo?: string; // A, B, C, etc.
  arbitroId?: string;
  campoId?: string;
  ubicacion?: string;
  observaciones?: string;
  eventos?: EventoPartido[];
  goleadores?: {
    equipoId: string;
    jugadorId: string;
    minuto: number;
  }[];
  estadisticas?: {
    posesion?: {
      local: number;
      visitante: number;
    };
    tiros?: {
      local: number;
      visitante: number;
    };
    tirosAPuerta?: {
      local: number;
      visitante: number;
    };
    corners?: {
      local: number;
      visitante: number;
    };
    faltas?: {
      local: number;
      visitante: number;
    };
  };
}

export interface EventoPartido {
  id: string;
  partidoId: string;
  tipo: 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'sustitucion' | 'inicio' | 'fin' | 'descanso';
  minuto: number;
  jugadorId?: string;
  equipoId: string;
  descripcion?: string;
  jugadorSaleId?: string; // Para sustituciones
  jugadorEntraId?: string; // Para sustituciones
}

export interface Clasificacion {
  equipoId: string;
  torneoId: string;
  partidosJugados: number;
  partidosGanados: number;
  partidosEmpatados: number;
  partidosPerdidos: number;
  golesFavor: number;
  golesContra: number;
  diferenciaGoles: number;
  puntos: number;
  posicion: number;
  grupo?: string;
  forma?: ('V' | 'E' | 'D')[]; // Últimos 5 resultados
}

export interface Estadistica {
  id: string;
  torneoId: string;
  tipo: 'goleador' | 'asistente' | 'portero_valla_cero' | 'tarjetas';
  jugadorId: string;
  equipoId: string;
  valor: number;
  descripcion?: string;
}

export interface Logro {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  tipo: 'equipo' | 'jugador' | 'entrenador' | 'espectador';
  condicion: string;
  puntos: number;
}

export interface LogroUsuario {
  id: string;
  usuarioId: string;
  logroId: string;
  fechaObtenido: string;
  torneoId?: string;
  equipoId?: string;
}

export interface Notificacion {
  id: string;
  usuarioId: string;
  titulo: string;
  mensaje: string;
  tipo: 'partido' | 'resultado' | 'torneo' | 'equipo' | 'logro';
  leida: boolean;
  fechaCreacion: string;
  datos?: any; // Datos adicionales específicos del tipo
}

export interface FiltroTorneos {
  ciudad?: string;
  categoria?: Categoria;
  tipoFutbol?: TipoFutbol;
  estado?: EstadoTorneo;
  fechaDesde?: string;
  fechaHasta?: string;
  nombre?: string;
  tipo?: TipoTorneo;
}

export interface FiltroEquipos {
  ciudad?: string;
  categoria?: Categoria;
  tipoFutbol?: TipoFutbol;
  nombre?: string;
  entrenador?: string;
}

export interface PartidoAmistoso {
  id: string;
  equipoLocalId: string;
  equipoVisitanteId?: string; // Puede estar vacío si es una disponibilidad
  fecha: string;
  hora: string;
  ubicacion: {
    direccion: string;
    coordenadas?: {
      latitud: number;
      longitud: number;
    };
  };
  estado: EstadoAmistoso;
  tipoFutbol: TipoFutbol;
  categoria: Categoria;
  esDisponibilidad: boolean; // true si es solo disponibilidad, false si es partido confirmado
  propuestaPor?: string; // ID del entrenador que propuso el amistoso
  propuestaA?: string; // ID del entrenador que recibió la propuesta
  golesLocal?: number;
  golesVisitante?: number;
  observaciones?: string;
  fechaCreacion: string;
  fechaConfirmacion?: string;
  fechaFinalizacion?: string;
  goleadores?: {
    equipoId: string;
    jugadorId: string;
    minuto: number;
  }[];
  rangoKm?: number; // Para búsquedas por proximidad
  franjaHoraria?: FranjaHoraria;
}

export interface FiltroAmistosos {
  ciudad?: string;
  categoria?: Categoria;
  tipoFutbol?: TipoFutbol;
  fecha?: string;
  franjaHoraria?: FranjaHoraria;
  rangoKm?: number;
  ubicacion?: {
    latitud: number;
    longitud: number;
  };
}

export interface ConfiguracionApp {
  version: string;
  modoMantenimiento: boolean;
  mensajeMantenimiento?: string;
  configuracionNotificaciones: {
    partidosProximos: boolean;
    resultados: boolean;
    nuevosLogros: boolean;
    actualizacionesTorneo: boolean;
    propuestasAmistosos: boolean;
    confirmacionAmistosos: boolean;
  };
}

// Tipos para el sistema de chat
export interface Chat {
  id: string;
  participants: string[]; // UIDs de los entrenadores
  participantsData: {
    [uid: string]: {
      nombre: string;
      apellidos: string;
      email: string;
      avatar?: string;
    };
  };
  lastMessage?: string;
  lastMessageSenderId?: string;
  lastTimestamp?: string;
  unreadCount: {
    [uid: string]: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  readBy: string[]; // UIDs que han leído el mensaje
  type: 'text' | 'system'; // Para mensajes del sistema
  metadata?: {
    partidoId?: string;
    torneoId?: string;
    equipoId?: string;
  };
}

// Tipos para notificaciones push mejoradas
export interface PushNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data: {
    type: 'partido' | 'resultado' | 'torneo' | 'chat' | 'amistoso' | 'recordatorio';
    partidoId?: string;
    torneoId?: string;
    chatId?: string;
    senderId?: string;
    [key: string]: any;
  };
  scheduledFor?: string; // Para notificaciones programadas
  sentAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface NotificationSubscription {
  userId: string;
  token: string; // FCM token
  platform: 'ios' | 'android' | 'web';
  topics: string[]; // Topics suscritos (team_id, tournament_id, etc.)
  createdAt: string;
  updatedAt: string;
  active: boolean;
}