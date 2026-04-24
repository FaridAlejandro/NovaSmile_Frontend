/**
 * Nova Smile - Panel de Historial del paciente
 */
import React, { useState } from 'react';

const TIPO_CONFIG = {
  comp: { bg: '#dcfce7', color: '#15803d', icon: '✅', label: 'Completado' },
  prog: { bg: '#fef3c7', color: '#92400e', icon: '⏳', label: 'En progreso' },
  pend: { bg: '#dbeafe', color: '#1e40af', icon: '📋', label: 'Pendiente' },
};

export default function PanelHistorial({ historial }) {
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const filtered = historial.filter((h) => {
    const matchFiltro = filtro === 'todos' || h.tipo === filtro;
    const matchBusqueda =
      h.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      h.desc.toLowerCase().includes(busqueda.toLowerCase());
    return matchFiltro && matchBusqueda;
  });

  return (
    <div
      style={{
        background: 'white', borderRadius: 14,
        boxShadow: '0 2px 8px rgba(0,0,0,.06)', padding: 22,
      }}
    >
      <h5 style={{ fontWeight: 700, color: '#111827', marginBottom: 16 }}>
        <i className="bi bi-clock-history me-2 text-info" />
        Historial de Tratamientos
      </h5>

      {/* Búsqueda y filtros */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Buscar tratamiento..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ maxWidth: 220 }}
        />
        {['todos', 'comp', 'prog', 'pend'].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filtro === f ? 'btn-info' : 'btn-outline-secondary'}`}
            onClick={() => setFiltro(f)}
          >
            {f === 'todos' ? 'Todos' : TIPO_CONFIG[f].label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="text-center text-muted py-4">
          <i className="bi bi-inbox fs-2 d-block mb-2" />
          No hay registros para mostrar.
        </div>
      ) : (
        filtered.map((h, idx) => {
          const cfg = TIPO_CONFIG[h.tipo] || TIPO_CONFIG.pend;
          return (
            <div
              key={h.id}
              style={{
                display: 'flex', gap: 13,
                paddingBottom: 18, position: 'relative',
              }}
            >
              {/* Línea vertical */}
              {idx < filtered.length - 1 && (
                <div
                  style={{
                    position: 'absolute', left: 17, top: 34,
                    width: 2, height: 'calc(100% - 18px)',
                    background: '#e2e8f0',
                  }}
                />
              )}
              {/* Ícono */}
              <div
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  flexShrink: 0, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '.95rem',
                  background: cfg.bg,
                }}
              >
                {cfg.icon}
              </div>
              {/* Contenido */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '.7rem', color: '#6c757d' }}>{h.fecha}</div>
                <div style={{ fontSize: '.88rem', fontWeight: 700, color: '#111827' }}>
                  {h.titulo}
                </div>
                <div style={{ fontSize: '.76rem', color: '#6c757d', marginTop: 1 }}>
                  {h.desc}
                </div>
                <span
                  style={{
                    display: 'inline-block', marginTop: 4,
                    fontSize: '.68rem', fontWeight: 600,
                    padding: '2px 9px', borderRadius: 999,
                    background: cfg.bg, color: cfg.color,
                  }}
                >
                  {cfg.label}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
