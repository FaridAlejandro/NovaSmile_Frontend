/**
 * Nova Smile - Navbar del módulo Administrador / Odontólogo / Recepcionista
 */
import React from 'react';

export default function NavbarAdmin({ usuario, rol, onLogout }) {
  const rolColors = {
    Administrador: '#6f42c1',
    Odontólogo: '#198754',
    Recepcionista: '#fd7e14',
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow-sm sticky-top">
      <div className="container-fluid">
        <span className="navbar-brand fw-bold">
          <i className="bi bi-shield-plus text-primary me-2" />
          NOVA SMILE
        </span>
        <div className="ms-auto d-flex align-items-center gap-3">
          <span
            className="badge"
            style={{
              background: rolColors[rol] || '#0d6efd',
              fontSize: '.75rem',
            }}
          >
            {rol}
          </span>
          <span className="text-white small">
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
