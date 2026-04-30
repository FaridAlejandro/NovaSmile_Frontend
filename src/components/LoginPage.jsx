/**
 * Nova Smile - Página de Login
 * Contenedor principal que alterna entre Login y Registro
 */
import React, { useState } from 'react';
import LoginForm from './LoginForm.jsx';
import RegisterForm from './RegisterForm.jsx';
import Toast from './Toast.jsx';
import Spinner from './Spinner.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { validarLogin, guardarSesion, registrarPaciente } from '../utils/auth';

export default function LoginPage({ onLoginSuccess }) {
  const [view, setView] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  /* ── Manejo de login ── */
  // async porque validarLogin ahora llama a la API PHP (fetch es asíncrono)
  const handleLogin = async ({ usuario, password, recordar }) => {
    setLoading(true);
    const result = await validarLogin(usuario, password);
    setLoading(false);

    if (!result.ok) {
      showToast(result.mensaje, 'danger');
      return;
    }

    guardarSesion(result.user, recordar);
    onLoginSuccess(result.user);
  };

  /* ── Manejo de registro ── */
  // async porque registrarPaciente ahora llama a la API PHP (fetch es asíncrono)
  const handleRegister = async (datos) => {
    setLoading(true);
    const result = await registrarPaciente(datos);
    setLoading(false);

    if (!result.ok) {
      showToast(result.mensaje, 'danger');
      return;
    }

    showToast('¡Cuenta creada! Ya puedes iniciar sesión.', 'success');
    setTimeout(() => setView('login'), 1800);
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)' }}
    >
      {/* Spinner de carga */}
      <Spinner visible={loading} />

      {/* Toast de mensajes */}
      <Toast toast={toast} onHide={hideToast} />

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div
              className="card p-4"
              style={{
                border: 'none',
                borderRadius: '1.5rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              }}
            >
              {/* Logo y título */}
              <div className="text-center mb-4">
                <i
                  className="bi bi-shield-plus text-primary"
                  style={{ fontSize: '3rem' }}
                />
                <h2 className="fw-bold mt-1">NOVA SMILE</h2>
                <p className="text-muted small">
                  {view === 'login'
                    ? 'Inicie sesión para continuar'
                    : 'Registro de nuevo paciente'}
                </p>
              </div>

              {/* Vista dinámica: login o registro */}
              {view === 'login' ? (
                <LoginForm
                  onLogin={handleLogin}
                  onGoToRegister={() => setView('register')}
                />
              ) : (
                <RegisterForm
                  onRegister={handleRegister}
                  onGoToLogin={() => setView('login')}
                />
              )}

              {/* Footer */}
              <div className="text-center mt-3">
                <small className="text-muted">v3.0 — © 2026 Nova Smile</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
