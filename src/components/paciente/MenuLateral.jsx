/**
 * Nova Smile - Menú lateral del paciente
 */
import React from 'react';

const MENU_ITEMS = [
  { id: 'inicio', icon: 'bi-house-fill', label: 'Inicio' },
  { id: 'historial', icon: 'bi-clock-history', label: 'Mi Historial' },
  { id: 'citas', icon: 'bi-calendar-check-fill', label: 'Mis Citas' },
  { id: 'facturas', icon: 'bi-receipt', label: 'Mis Facturas' },
  { id: 'perfil', icon: 'bi-person-fill', label: 'Mi Perfil' },
];

export default function MenuLateral({ activePanel, onNavigate }) {
  return (
    <div className="menu-lateral">
      {MENU_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '10px 13px', borderRadius: 10,
            border: 'none', width: '100%', textAlign: 'left',
            marginBottom: 5, fontSize: '.83rem', fontWeight: 500,
            cursor: 'pointer', transition: 'all .2s',
            background: activePanel === item.id ? 'var(--ns-pac, #0dcaf0)' : 'white',
            color: activePanel === item.id ? 'white' : '#374151',
            boxShadow: activePanel === item.id
              ? '0 4px 12px rgba(13,202,240,.4)'
              : '0 1px 4px rgba(0,0,0,.06)',
          }}
        >
          <i className={`bi ${item.icon}`} />
          {item.label}
        </button>
      ))}
    </div>
  );
}
