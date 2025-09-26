import React from 'react';
import type { Equipo, Partido } from '@/types';

interface TablaPosicionesProps {
  equipos: Equipo[];
  partidos: Partido[];
  grupos?: Record<string, Equipo[]>;
  formato: string;
}

// Calcula la tabla de posiciones para liga, grupos o triangular
function calcularTabla(equipos: Equipo[], partidos: Partido[]) {
  const tabla = equipos.map(eq => {
    let pts = 0, gf = 0, gc = 0, jugados = 0, ganados = 0, empatados = 0, perdidos = 0;
    partidos.forEach(p => {
      if (p.estado !== 'Jugado') return;
      if (p.equipoLocalId === eq.id || p.equipoVisitanteId === eq.id) {
        jugados++;
        const esLocal = p.equipoLocalId === eq.id;
        const golesFavor = esLocal ? p.golesLocal ?? 0 : p.golesVisitante ?? 0;
        const golesContra = esLocal ? p.golesVisitante ?? 0 : p.golesLocal ?? 0;
        gf += golesFavor;
        gc += golesContra;
        if (golesFavor > golesContra) ganados++, pts += 3;
        else if (golesFavor === golesContra) empatados++, pts += 1;
        else perdidos++;
      }
    });
    return { equipo: eq.nombre, pts, jugados, ganados, empatados, perdidos, gf, gc, dg: gf - gc };
  });
  return tabla.sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
}

export default function TablaPosiciones({ equipos, partidos, grupos, formato }: TablaPosicionesProps) {
  if (formato === 'grupos' && grupos) {
    return (
      <>
        {Object.entries(grupos).map(([grupo, eqs]) => (
          <div key={grupo}>
            <h4>Grupo {grupo}</h4>
            <TablaPosiciones equipos={eqs} partidos={partidos.filter(p => p.grupo === grupo)} formato="liga" />
          </div>
        ))}
      </>
    );
  }
  const tabla = calcularTabla(equipos, partidos);
  return (
    <table>
      <thead>
        <tr>
          <th>Equipo</th><th>Pts</th><th>J</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th>
        </tr>
      </thead>
      <tbody>
        {tabla.map(row => (
          <tr key={row.equipo}>
            <td>{row.equipo}</td>
            <td>{row.pts}</td>
            <td>{row.jugados}</td>
            <td>{row.ganados}</td>
            <td>{row.empatados}</td>
            <td>{row.perdidos}</td>
            <td>{row.gf}</td>
            <td>{row.gc}</td>
            <td>{row.dg}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
