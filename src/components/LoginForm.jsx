/**
 * Nova Smile - Componente LoginForm
 * Formulario de inicio de sesión del sistema
 */
import React, { useState, useEffect } from 'react';

export default function LoginForm({ onLogin, onGoToRegister }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('12345');
  const [showPass, setShowPass] = useState(false);
  const [recordar, setRecordar] = useState(false);

  // Recuperar usuario guardado
  useEffect(() => {
    const saved = localStorage.getItem('ns_remember_user');
    if (saved) {
      setUsuario(saved);
      setRecordar(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ usuario, password, recordar });
  };

  const setUser = (u) => {
    setUsuario(u);
  };

  return (
    <>
      <form id="loginForm" onSubmit={handleSubmit} noValidate>
        {/* Usuario */}
        <div className="mb-3">
          <label className="form-label small fw-bold text-muted text-uppercase">
            Usuario
          </label>
          <div className="input-group">
            <span className="input-group-text border-end-0" style={{ background: '#f8f9fa' }}>
              <i className="bi bi-person text-primary" />
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0"
              placeholder="admin, doc, recepcion, paciente"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
        </div>

        {/* Contraseña */}
        <div className="mb-4">
          <label className="form-label small fw-bold text-muted text-uppercase">
            Contraseña
          </label>
          <div className="input-group">
            <span className="input-group-text border-end-0" style={{ background: '#f8f9fa' }}>
              <i className="bi bi-lock text-primary" />
            </span>
            <input
              type={showPass ? 'text' : 'password'}
              className="form-control bg-light border-start-0"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              className="btn btn-outline-secondary border-start-0"
              type="button"
              onClick={() => setShowPass(!showPass)}
              tabIndex={-1}
            >
              <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`} />
            </button>
          </div>
        </div>

        {/* Recordar */}
        <div className="d-flex align-items-center mb-3">
          <input
            className="form-check-input me-2"
            type="checkbox"
            id="rememberMe"
            checked={recordar}
            onChange={(e) => setRecordar(e.target.checked)}
          />
          <label className="form-check-label small text-muted" htmlFor="rememberMe">
            Recordar usuario
          </label>
        </div>

        {/* Botón de login */}
        <button
          type="submit"
          className="btn btn-primary w-100 shadow-sm text-uppercase fw-bold"
          style={{
            background: '#0d6efd',
            border: 'none',
            padding: '0.8rem',
            letterSpacing: '.05em',
          }}
        >
          <i className="bi bi-box-arrow-in-right me-1" />
          Entrar al sistema
        </button>
      </form>

      {/* Enlace de registro */}
      <div className="text-center mt-3">
        <span className="text-muted small">¿Eres paciente nuevo? </span>
        <button
          className="btn btn-link btn-sm p-0 text-primary fw-bold"
          onClick={onGoToRegister}
        >
          Crear cuenta
        </button>
      </div>

      {/* Usuarios de prueba */}
      <div className="mt-3 p-2 rounded bg-light">
        <p className="text-muted small mb-1 fw-bold">
          <i className="bi bi-info-circle me-1" />
          Usuarios de prueba:
        </p>
        <div className="d-flex flex-wrap gap-1">
          {[
            { name: 'admin', color: 'bg-primary' },
            { name: 'doc', color: 'bg-success' },
            { name: 'recepcion', color: 'bg-warning text-dark' },
            { name: 'paciente', color: 'bg-info text-dark' },
          ].map(({ name, color }) => (
            <span
              key={name}
              className={`badge ${color}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setUser(name)}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
