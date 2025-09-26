import React from 'react';
import type { Partido, Equipo } from '@/types';

interface BracketViewProps {
  partidos: Partido[];
  equipos: Equipo[];
  estado_equipo: Record<string, string>;
}

export default function BracketView({ partidos, equipos, estado_equipo }: BracketViewProps) {
  // Agrupa partidos por ronda (jornada)
  const rondas: Record<number, Partido[]> = {};
  partidos.forEach(p => {
    if (!rondas[p.jornada]) rondas[p.jornada] = [];
    rondas[p.jornada].push(p);
  });
  const getNombre = (id: string) => equipos.find(e => e.id === id)?.nombre || 'TBD';
  return (
    <div>
      {Object.entries(rondas).map(([jornada, ps]) => (
        <div key={jornada} style={{ marginBottom: 16 }}>
          <strong>Ronda {jornada}</strong>
          <table>
            <tbody>
              {ps.map(p => (
                <tr key={p.id}>
                  <td>{getNombre(p.equipoLocalId)}</td>
                  <td>{p.golesLocal ?? '-'}</td>
                  <td>vs</td>
                  <td>{p.golesVisitante ?? '-'}</td>
                  <td>{getNombre(p.equipoVisitanteId)}</td>
                  <td>{p.estado === 'Jugado' ? '✔️' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
