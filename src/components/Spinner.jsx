/**
 * Nova Smile - Componente Spinner de carga
 */
import React from 'react';

export default function Spinner({ visible }) {
  return (
    <div className={`spinner-overlay ${visible ? 'show' : ''}`}>
      <div
        className="spinner-border text-primary"
        role="status"
        style={{ width: '3rem', height: '3rem' }}
      >
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );
}
