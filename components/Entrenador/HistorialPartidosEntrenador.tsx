import React from 'react';
import type { PartidoDirigido } from '@/types/entrenador';

interface Props {
  historial: PartidoDirigido[];
}

export default function HistorialPartidosEntrenador({ historial }: Props) {
  return (
    <div>
      <h3>Historial de Partidos Dirigidos</h3>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Equipo</th>
            <th>Rival</th>
            <th>Resultado</th>
            <th>Goles F/C</th>
            <th>Torneo</th>
          </tr>
        </thead>
        <tbody>
          {historial.map(p => (
            <tr key={p.id}>
              <td>{new Date(p.fecha).toLocaleDateString()}</td>
              <td>{p.equipoId}</td>
              <td>{p.rivalId}</td>
              <td>{p.resultado}</td>
              <td>{p.golesFavor} / {p.golesContra}</td>
              <td>{p.torneoId || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
