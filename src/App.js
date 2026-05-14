/**
 * Nova Smile - App.js
 * Enrutador principal de la aplicación React
 * Maneja el flujo: Login → Dashboard por rol
 */
import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage.jsx';
import PacientePage from './components/pages/PacientePage.jsx';
import AdminPage from './components/pages/AdminPage.jsx';
import OdontologoPage from './components/pages/OdontologoPage.jsx';
import RecepcionPage from './components/pages/RecepcionPage.jsx';
import { getSesionActiva, cerrarSesion } from './utils/auth';

/**
 * Componente raíz de Nova Smile
 * Gestiona la sesión y renderiza el módulo correspondiente al rol
 */
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    const sesion = getSesionActiva();
    if (sesion) {
      setSession(sesion);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (user) => {
    setSession(user);
  };

  const handleLogout = () => {
    cerrarSesion();
    setSession(null);
  };

  // Pantalla de carga inicial
  if (loading) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)' }}
      >
        <div className="text-center text-white">
          <i className="bi bi-shield-plus" style={{ fontSize: '3rem' }} />
          <div className="mt-3">
            <div className="spinner-border text-white" role="status" />
          </div>
          <p className="mt-2 fw-bold">NOVA SMILE</p>
        </div>
      </div>
    );
  }

  // Sin sesión → Login
  if (!session) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Router por rol
  const pagina = session.pagina || session.rol?.toLowerCase();

  switch (pagina) {
    case 'paciente':
      return <PacientePage session={session} onLogout={handleLogout} />;
    case 'admin':
      return <AdminPage session={session} onLogout={handleLogout} />;
    case 'odontologo':
      return <OdontologoPage session={session} onLogout={handleLogout} />;
    case 'recepcionista':
      return <RecepcionPage session={session} onLogout={handleLogout} />;
    default:
      // Fallback: cerrar sesión si el rol no es reconocido
      cerrarSesion();
      return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }
}
