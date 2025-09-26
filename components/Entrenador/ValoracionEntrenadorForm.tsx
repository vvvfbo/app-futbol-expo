import React, { useState } from 'react';
import type { ValoracionEntrenador } from '@/types/entrenador';

interface Props {
  onSubmit: (valoracion: ValoracionEntrenador) => void;
  deEntrenadorId: string;
}

export default function ValoracionEntrenadorForm({ onSubmit, deEntrenadorId }: Props) {
  const [puntuacion, setPuntuacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [enviado, setEnviado] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      deEntrenadorId,
      puntuacion,
      comentario,
      fecha: new Date().toISOString(),
    });
    setPuntuacion(5);
    setComentario('');
    setEnviado(true);
    setTimeout(() => setEnviado(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {[1,2,3,4,5].map(n => (
          <span
            key={n}
            style={{
              cursor: 'pointer',
              color: n <= puntuacion ? '#FFD700' : '#CCC',
              fontSize: 28,
              transition: 'color 0.2s',
            }}
            onClick={() => setPuntuacion(n)}
            data-testid={`estrella-${n}`}
          >
            ★
          </span>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        <input
          type="text"
          placeholder="Comentario (opcional)"
          value={comentario}
          onChange={e => setComentario(e.target.value)}
          style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #CCC' }}
        />
      </div>
      <button type="submit" style={{ marginTop: 10, padding: '8px 18px', borderRadius: 8, background: '#1976d2', color: 'white', border: 'none', fontWeight: 600 }}>
        Valorar
      </button>
      {enviado && <span style={{ color: 'green', marginLeft: 12 }}>¡Valoración enviada!</span>}
    </form>
  );
}
