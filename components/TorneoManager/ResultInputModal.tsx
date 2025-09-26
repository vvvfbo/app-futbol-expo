import React, { useState } from 'react';
import type { Partido, Equipo } from '@/types';

interface ResultInputModalProps {
  partido: Partido;
  equipos: Equipo[];
  onSubmit: (golesLocal: number, golesVisitante: number) => void;
  onClose: () => void;
}

export default function ResultInputModal({ partido, equipos, onSubmit, onClose }: ResultInputModalProps) {
  const [golesLocal, setGolesLocal] = useState<number>(0);
  const [golesVisitante, setGolesVisitante] = useState<number>(0);
  const local = equipos.find(e => e.id === partido.equipoLocalId)?.nombre || 'Local';
  const visitante = equipos.find(e => e.id === partido.equipoVisitanteId)?.nombre || 'Visitante';
  return (
    <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
      <h4>Resultado</h4>
      <div>{local} vs {visitante}</div>
      <input type="number" value={golesLocal} onChange={e => setGolesLocal(Number(e.target.value))} />
      <span> - </span>
      <input type="number" value={golesVisitante} onChange={e => setGolesVisitante(Number(e.target.value))} />
      <button onClick={() => onSubmit(golesLocal, golesVisitante)}>Guardar</button>
      <button onClick={onClose}>Cancelar</button>
    </div>
  );
}
