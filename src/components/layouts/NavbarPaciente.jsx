/**
 * Nova Smile - Navbar del módulo Paciente
 */
import React from 'react';

export default function NavbarPaciente({ usuario, notifCount, onNotif, onLogout }) {
  return (
    <nav
      className="navbar navbar-expand-lg px-4 shadow-sm sticky-top"
      style={{ background: 'linear-gradient(135deg,#0dcaf0,#0369a1)' }}
    >
      <div className="container-fluid">
        <span className="navbar-brand fw-bold text-white">
          <i className="bi bi-heart-pulse-fill me-2" />
          Mi Salud · Nova Smile
        </span>
        <div className="ms-auto d-flex align-items-center gap-3">
          <div
            className="position-relative"
            style={{ cursor: 'pointer' }}
            onClick={onNotif}
          >
            <i className="bi bi-bell-fill text-white fs-5" />
            {notifCount > 0 && (
              <span
                style={{
                  position: 'absolute', top: -4, right: -6,
                  width: 9, height: 9, background: '#ef4444',
                  borderRadius: '50%', border: '2px solid white',
                  display: 'block',
                }}
              />
            )}
          </div>
          <span className="text-white small fw-bold">
            <i className="bi bi-person-circle me-1" />
            {usuario}
          </span>
          <button
            className="btn btn-sm btn-outline-light"
            onClick={onLogout}
          >
            <i className="bi bi-box-arrow-right me-1" />
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
