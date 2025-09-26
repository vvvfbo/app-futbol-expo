import type { Equipo, Partido, EstadoPartido } from '@/types';

// --- ELIMINACIÓN DIRECTA ---
export function generarBracketEliminacion(equipos: Equipo[]): { rondas: string[][] } {
  // Algoritmo para bracket knockout con byes
  const total = equipos.length;
  const nextPow2 = Math.pow(2, Math.ceil(Math.log2(total)));
  const byes = nextPow2 - total;
  const primeraRonda: string[] = [];
  let idx = 0;
  while (idx < total) {
    if (byes > 0 && idx >= total - byes) {
      primeraRonda.push(equipos[idx].nombre + ' (BYE)');
    } else {
      primeraRonda.push(equipos[idx].nombre);
    }
    idx++;
  }
  return { rondas: [primeraRonda] };
}

export function generarPartidosEliminacion(equipos: Equipo[], torneoId: string): Omit<Partido, 'id'>[] {
  // Empareja equipos para la primera ronda, asignando byes si es necesario
  const total = equipos.length;
  const nextPow2 = Math.pow(2, Math.ceil(Math.log2(total)));
  const byes = nextPow2 - total;
  const partidos: Omit<Partido, 'id'>[] = [];
  let idx = 0;
  let jornada = 1;
  while (idx < total - byes) {
    partidos.push({
      torneoId,
      equipoLocalId: equipos[idx].id,
      equipoVisitanteId: equipos[idx + 1].id,
      fecha: '',
      hora: '',
      estado: 'Pendiente' as EstadoPartido,
      jornada,
    });
    idx += 2;
    jornada++;
  }
  // Los equipos con bye avanzan automáticamente
  return partidos;
}

// --- LIGA COMPLETA ---
export function generarPartidosLiga(equipos: Equipo[], torneoId: string): Omit<Partido, 'id'>[] {
  const partidos: Omit<Partido, 'id'>[] = [];
  let jornada = 1;
  for (let i = 0; i < equipos.length; i++) {
    for (let j = i + 1; j < equipos.length; j++) {
      partidos.push({
        torneoId,
        equipoLocalId: equipos[i].id,
        equipoVisitanteId: equipos[j].id,
        fecha: '',
        hora: '',
        estado: 'Pendiente' as EstadoPartido,
        jornada,
      });
      jornada++;
    }
  }
  return partidos;
}

// --- TRIANGULAR ---
export function generarPartidosTriangular(equipos: Equipo[], torneoId: string): Omit<Partido, 'id'>[] {
  if (equipos.length !== 3) throw new Error('Triangular requiere exactamente 3 equipos');
  return [
    { torneoId, equipoLocalId: equipos[0].id, equipoVisitanteId: equipos[1].id, fecha: '', hora: '', estado: 'Pendiente' as EstadoPartido, jornada: 1 },
    { torneoId, equipoLocalId: equipos[1].id, equipoVisitanteId: equipos[2].id, fecha: '', hora: '', estado: 'Pendiente' as EstadoPartido, jornada: 2 },
    { torneoId, equipoLocalId: equipos[2].id, equipoVisitanteId: equipos[0].id, fecha: '', hora: '', estado: 'Pendiente' as EstadoPartido, jornada: 3 },
  ];
}

// --- FASE DE GRUPOS ---
export function dividirEnGrupos(equipos: Equipo[], numGrupos: number): Record<string, Equipo[]> {
  const grupos: Record<string, Equipo[]> = {};
  for (let i = 0; i < numGrupos; i++) grupos[String.fromCharCode(65 + i)] = [];
  equipos.forEach((eq, idx) => {
    const grupo = String.fromCharCode(65 + (idx % numGrupos));
    grupos[grupo].push(eq);
  });
  return grupos;
}

export function generarPartidosGrupos(grupos: Record<string, Equipo[]>, torneoId: string): Omit<Partido, 'id'>[] {
  const partidos: Omit<Partido, 'id'>[] = [];
  Object.entries(grupos).forEach(([grupo, eqs]) => {
    for (let i = 0; i < eqs.length; i++) {
      for (let j = i + 1; j < eqs.length; j++) {
        partidos.push({
          torneoId,
          equipoLocalId: eqs[i].id,
          equipoVisitanteId: eqs[j].id,
          fecha: '',
          hora: '',
          estado: 'Pendiente' as EstadoPartido,
          jornada: 1,
          grupo,
        });
      }
    }
  });
  return partidos;
}
