/**
 * Nova Smile - Panel de Facturas del paciente
 */
import React from 'react';

export default function PanelFacturas({ facturas }) {
  const total = facturas.reduce((acc, f) => acc + f.monto, 0);
  const pagado = facturas.filter((f) => f.pagado).reduce((acc, f) => acc + f.monto, 0);
  const pendiente = total - pagado;

  return (
    <div
      style={{
        background: 'white', borderRadius: 14,
        boxShadow: '0 2px 8px rgba(0,0,0,.06)', padding: 22,
      }}
    >
      <h5 style={{ fontWeight: 700, color: '#111827', marginBottom: 16 }}>
        <i className="bi bi-receipt me-2 text-info" />
        Mis Facturas
      </h5>

      {/* Resumen financiero */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        {[
          { label: 'Total facturado', val: total, color: '#1e40af', bg: '#dbeafe' },
          { label: 'Pagado', val: pagado, color: '#15803d', bg: '#dcfce7' },
          { label: 'Pendiente', val: pendiente, color: '#b91c1c', bg: '#fee2e2' },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              flex: 1, minWidth: 100, padding: '12px 16px',
              borderRadius: 10, background: s.bg,
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color }}>
              ${s.val.toLocaleString('es-CO')}
            </div>
            <div style={{ fontSize: '.7rem', color: '#6c757d', textTransform: 'uppercase' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Lista de facturas */}
      {facturas.map((f) => (
        <div
          key={f.id}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 13px', borderRadius: 10,
            background: '#f8fafc', border: '1px solid #e2e8f0',
            marginBottom: 7,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '.84rem', fontWeight: 600 }}>{f.servicio}</div>
            <div style={{ fontSize: '.7rem', color: '#6c757d' }}>{f.fecha}</div>
          </div>
          <div style={{
            fontSize: '.93rem', fontWeight: 700, whiteSpace: 'nowrap',
            color: f.pagado ? '#15803d' : '#b91c1c',
          }}>
            ${f.monto.toLocaleString('es-CO')}
          </div>
          <span style={{
            fontSize: '.7rem', fontWeight: 600, padding: '3px 10px',
            borderRadius: 999,
            background: f.pagado ? '#dcfce7' : '#fee2e2',
            color: f.pagado ? '#15803d' : '#b91c1c',
          }}>
            {f.pagado ? '✓ Pagado' : 'Pendiente'}
          </span>
        </div>
      ))}
    </div>
  );
}
