export interface Entrenador {
  id: string;
  nombre: string;
  equiposDirigidos: string[]; // ids de equipos
  experiencia: string;
  historialPartidos: PartidoDirigido[];
  estadisticas: EstadisticasEntrenador;
  reputacion: ReputacionEntrenador;
}

export interface PartidoDirigido {
  id: string;
  equipoId: string;
  rivalId: string;
  fecha: string;
  resultado: 'victoria' | 'empate' | 'derrota';
  golesFavor: number;
  golesContra: number;
  torneoId?: string;
}

export interface EstadisticasEntrenador {
  partidos: number;
  victorias: number;
  empates: number;
  derrotas: number;
  torneosGanados: number;
  porcentajeVictorias: number;
}

export interface ReputacionEntrenador {
  valoraciones: ValoracionEntrenador[];
  promedio: number;
}

export interface ValoracionEntrenador {
  deEntrenadorId: string;
  puntuacion: number; // 1-5
  comentario?: string;
  fecha: string;
}
