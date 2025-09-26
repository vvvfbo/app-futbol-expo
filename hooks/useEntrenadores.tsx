import { useState } from 'react';
import type { Entrenador, ValoracionEntrenador, PartidoDirigido } from '@/types/entrenador';

export function useEntrenadores() {
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([]);

  function crearPerfil(entrenador: Entrenador) {
    setEntrenadores(prev => [...prev, entrenador]);
  }

  function agregarPartido(entrenadorId: string, partido: PartidoDirigido) {
    setEntrenadores(prev => prev.map(e =>
      e.id === entrenadorId
        ? { ...e, historialPartidos: [...e.historialPartidos, partido] }
        : e
    ));
  }

  function agregarValoracion(entrenadorId: string, valoracion: ValoracionEntrenador) {
    setEntrenadores(prev => prev.map(e => {
      if (e.id !== entrenadorId) return e;
      const valoraciones = [...e.reputacion.valoraciones, valoracion];
      const promedio = valoraciones.reduce((acc, v) => acc + v.puntuacion, 0) / valoraciones.length;
      return {
        ...e,
        reputacion: {
          valoraciones,
          promedio,
        },
      };
    }));
  }

  return {
    entrenadores,
    crearPerfil,
    agregarPartido,
    agregarValoracion,
  };
}
