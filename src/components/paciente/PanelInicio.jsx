/**
 * Nova Smile - Panel de Inicio del paciente
 */
import React from 'react';

export default function PanelInicio({ citas, facturas, onNavigate }) {
  const proximaCita = citas.find((c) => c.estado === 'Confirmada');
  const pendiente = facturas
    .filter((f) => !f.pagado)
    .reduce((acc, f) => acc + f.monto, 0);

  const stats = [
    { val: citas.filter((c) => c.estado === 'Confirmada').length, label: 'Próximas', color: '' },
    { val: citas.filter((c) => c.estado === 'Completada').length, label: 'Completadas', color: 'g' },
    { val: facturas.filter((f) => !f.pagado).length, label: 'Facturas pend.', color: 'y' },
    {
      val: `$${pendiente.toLocaleString('es-CO')}`,
      label: 'Saldo pend.',
      color: pendiente > 0 ? 'r' : 'g',
    },
  ];

  const colorMap = {
    '': { border: '#0dcaf0', text: '#0369a1' },
    g: { border: '#22c55e', text: '#15803d' },
    y: { border: '#f59e0b', text: '#92400e' },
    r: { border: '#ef4444', text: '#b91c1c' },
  };

  return (
    <div>
      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,minmax(0,1fr))',
          gap: 8, marginBottom: 18,
        }}
      >
        {stats.map((s, i) => {
          const c = colorMap[s.color];
          return (
            <div
              key={i}
              style={{
                background: '#f8fafc', borderRadius: 10,
                padding: '12px 14px',
                borderLeft: `4px solid ${c.border}`,
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: c.text }}>
                {s.val}
              </div>
              <div style={{ fontSize: '.68rem', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Próxima cita */}
      {proximaCita && (
        <div
          style={{
            background: 'white', borderRadius: 14,
            borderLeft: '5px solid #0dcaf0',
            padding: 15, marginBottom: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,.06)',
          }}
        >
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <p className="fw-bold mb-0" style={{ fontSize: '.88rem' }}>
                🦷 Próxima cita
              </p>
              <p className="text-muted mb-1" style={{ fontSize: '.8rem' }}>
                {proximaCita.servicio}
              </p>
              <p className="text-muted mb-0" style={{ fontSize: '.75rem' }}>
                <i className="bi bi-person-fill me-1" />
                {proximaCita.doctor}
              </p>
            </div>
            <div>
              <span
                style={{
                  background: '#e0f7fc', color: '#0369a1',
                  borderRadius: 8, padding: '5px 11px',
                  fontSize: '.76rem', fontWeight: 700,
                  display: 'block', textAlign: 'center',
                }}
              >
                {proximaCita.fecha}
              </span>
              <span
                style={{
                  display: 'block', textAlign: 'center',
                  fontSize: '.7rem', color: '#6c757d', marginTop: 3,
                }}
              >
                {proximaCita.hora}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <div
        style={{
          background: 'white', borderRadius: 14,
          boxShadow: '0 2px 8px rgba(0,0,0,.06)', padding: 22,
        }}
      >
        <h5 style={{ fontWeight: 700, color: '#111827', marginBottom: 16 }}>
          Accesos rápidos
        </h5>
        <div className="d-flex flex-wrap gap-2">
          {[
            { icon: 'bi-calendar-plus', label: 'Ver citas', panel: 'citas' },
            { icon: 'bi-clock-history', label: 'Historial', panel: 'historial' },
            { icon: 'bi-receipt', label: 'Facturas', panel: 'facturas' },
            { icon: 'bi-person-fill', label: 'Mi perfil', panel: 'perfil' },
          ].map((a) => (
            <button
              key={a.panel}
              className="btn btn-sm btn-outline-info"
              onClick={() => onNavigate(a.panel)}
            >
              <i className={`bi ${a.icon} me-1`} />
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
