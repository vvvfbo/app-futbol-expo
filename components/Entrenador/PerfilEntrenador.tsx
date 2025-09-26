import React from 'react';
import type { Entrenador } from '@/types/entrenador';

interface Props {
  entrenador: Entrenador;
}

export default function PerfilEntrenador({ entrenador }: Props) {
  return (
    <div>
      <h2>Perfil de Entrenador</h2>
      <p><b>Nombre:</b> {entrenador.nombre}</p>
      <p><b>Equipos dirigidos:</b> {entrenador.equiposDirigidos.length}</p>
      <p><b>Experiencia:</b> {entrenador.experiencia}</p>
      <h3>Estadísticas personales</h3>
      <ul>
        <li>Partidos: {entrenador.estadisticas.partidos}</li>
        <li>Victorias: {entrenador.estadisticas.victorias}</li>
        <li>Empates: {entrenador.estadisticas.empates}</li>
        <li>Derrotas: {entrenador.estadisticas.derrotas}</li>
        <li>Torneos ganados: {entrenador.estadisticas.torneosGanados}</li>
        <li>% Victorias: {entrenador.estadisticas.porcentajeVictorias.toFixed(1)}%</li>
      </ul>
      <h3>Reputación</h3>
      <p>Promedio: {entrenador.reputacion.promedio.toFixed(2)} / 5</p>
      <ul>
        {entrenador.reputacion.valoraciones.map((v, i) => (
          <li key={i}>
            <b>Puntuación:</b> {v.puntuacion} - <i>{v.comentario}</i> <span>({v.fecha})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
