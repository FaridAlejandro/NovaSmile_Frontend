/**
 * Nova Smile - Tarjeta de perfil del paciente (sidebar)
 */
import React from 'react';

export default function PerfilCard({ perfil }) {
  const iniciales = perfil.nombre
    ? perfil.nombre.charAt(0).toUpperCase()
    : '?';

  return (
    <div
      className="perfil-card mb-3"
      style={{
        background: 'linear-gradient(160deg,#0dcaf0,#0369a1)',
        borderRadius: 14,
        padding: 22,
        color: 'white',
      }}
    >
      <div
        style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(255,255,255,.22)',
          border: '3px solid rgba(255,255,255,.45)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.6rem',
          fontWeight: 700, margin: '0 auto 10px',
        }}
      >
        {iniciales}
      </div>
      <p className="fw-bold mb-0 text-center" style={{ fontSize: '.95rem' }}>
        {perfil.nombre}
      </p>
      <p className="text-center mb-1" style={{ fontSize: '.72rem', opacity: 0.85 }}>
        Doc: {perfil.doc || 'N/A'}
      </p>
      {perfil.alergias && (
        <span
          className="d-block text-center"
          style={{
            background: 'rgba(255,255,255,.2)', borderRadius: 20,
            padding: '2px 10px', fontSize: '.68rem',
          }}
        >
          {perfil.alergias}
        </span>
      )}
    </div>
  );
}
