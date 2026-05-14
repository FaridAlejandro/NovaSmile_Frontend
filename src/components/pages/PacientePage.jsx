/**
 * Nova Smile - Módulo del Paciente (página completa)
 */
import React, { useState } from 'react';
import NavbarPaciente from '../layouts/NavbarPaciente.jsx';
import PerfilCard from '../paciente/PerfilCard.jsx';
import MenuLateral from '../paciente/MenuLateral.jsx';
import PanelInicio from '../paciente/PanelInicio.jsx';
import PanelHistorial from '../paciente/PanelHistorial.jsx';
import PanelCitas from '../paciente/PanelCitas.jsx';
import PanelFacturas from '../paciente/PanelFacturas.jsx';
import PanelPerfil from '../paciente/PanelPerfil.jsx';

// ── Datos demo ──────────────────────────────────────────────────────────────
const CITAS_DEMO = [
  { id: 1, fecha: '2026-07-15', hora: '10:30', servicio: 'Control Endodoncia', doctor: 'Dr. Farid Torres', estado: 'Confirmada' },
  { id: 2, fecha: '2026-06-10', hora: '09:00', servicio: 'Limpieza dental', doctor: 'Dra. Elena Gelves', estado: 'Completada' },
  { id: 3, fecha: '2026-05-20', hora: '14:00', servicio: 'Radiografía panorámica', doctor: 'Dr. Farid Torres', estado: 'Completada' },
];
const HISTORIAL_DEMO = [
  { id: 1, fecha: '10/06/2026', titulo: 'Limpieza dental', desc: 'Detartraje supragingival completo. Sin complicaciones.', tipo: 'comp' },
  { id: 2, fecha: '20/05/2026', titulo: 'Radiografía panorámica', desc: 'Imagen digital obtenida. Resultado adjunto en sistema.', tipo: 'comp' },
  { id: 3, fecha: '15/04/2026', titulo: 'Evaluación de ortodoncia', desc: 'Estudio de modelos en curso. Pendiente diagnóstico final.', tipo: 'prog' },
  { id: 4, fecha: '01/03/2026', titulo: 'Control de caries pieza 16', desc: 'Pendiente obturación con resina. Requiere próxima sesión.', tipo: 'pend' },
];
const FACTURAS_DEMO = [
  { id: 1, servicio: 'Limpieza dental', fecha: '10/06/2026', monto: 60000, pagado: true },
  { id: 2, servicio: 'Radiografía panorámica', fecha: '20/05/2026', monto: 90000, pagado: true },
  { id: 3, servicio: 'Control Endodoncia', fecha: '15/07/2026', monto: 80000, pagado: false },
  { id: 4, servicio: 'Evaluación ortodoncia', fecha: '15/04/2026', monto: 50000, pagado: false },
];
const NOTIF_DEMO = [
  { id: 1, ico: '✅', txt: 'Su cita del 15 Jul ha sido validada.', hora: 'Hace 2h', leida: false },
  { id: 2, ico: '💰', txt: 'Tiene $130.000 por cancelar.', hora: 'Ayer', leida: false },
  { id: 3, ico: '🦷', txt: 'Traiga su carnet de salud el lunes.', hora: 'Hace 3 días', leida: true },
];

export default function PacientePage({ session, onLogout }) {
  const [panel, setPanel] = useState('inicio');
  const [citas, setCitas] = useState(CITAS_DEMO);
  const [historial] = useState(HISTORIAL_DEMO);
  const [facturas] = useState(FACTURAS_DEMO);
  const [notificaciones, setNotificaciones] = useState(NOTIF_DEMO);
  const [showNotif, setShowNotif] = useState(false);

  // Perfil inicial: si el usuario es un paciente registrado, usar sus datos
  const [perfil, setPerfil] = useState({
    nombre: session.nombre
      ? `${session.nombre} ${session.apellido || ''}`.trim()
      : 'Carlos Ruiz',
    doc: session.doc || '80543221',
    tel: session.telefono || '3104567890',
    email: session.correo || 'paciente@email.com',
    nac: '1992-05-14',
    alergias: 'Ninguna',
  });

  const notifNoLeidas = notificaciones.filter((n) => !n.leida).length;

  const handleReagendar = (id, fecha, hora) => {
    setCitas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, fecha, hora, estado: 'Confirmada' } : c))
    );
  };

  const handleSavePerfil = (datos) => {
    setPerfil(datos);
  };

  const handleNotif = () => {
    setShowNotif(!showNotif);
    if (!showNotif) {
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    }
  };

  const panels = {
    inicio: <PanelInicio citas={citas} facturas={facturas} onNavigate={setPanel} />,
    historial: <PanelHistorial historial={historial} />,
    citas: <PanelCitas citas={citas} onReagendar={handleReagendar} />,
    facturas: <PanelFacturas facturas={facturas} />,
    perfil: <PanelPerfil perfil={perfil} onSave={handleSavePerfil} />,
  };

  return (
    <div style={{ background: '#f0f6f9', minHeight: '100vh' }}>
      <NavbarPaciente
        usuario={session.usuario}
        notifCount={notifNoLeidas}
        onNotif={handleNotif}
        onLogout={onLogout}
      />

      <div className="container-fluid py-3">
        <div className="row g-3">
          {/* Sidebar */}
          <div className="col-lg-3 col-md-4">
            <PerfilCard perfil={perfil} />
            <MenuLateral activePanel={panel} onNavigate={setPanel} />

            {/* Panel de notificaciones */}
            {showNotif && (
              <div
                className="mt-3 p-3"
                style={{
                  background: 'white', borderRadius: 14,
                  boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                }}
              >
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-bell-fill text-info me-1" />
                  Notificaciones
                </h6>
                {notificaciones.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      display: 'flex', gap: 10, padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0',
                      opacity: n.leida ? 0.6 : 1,
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{n.ico}</span>
                    <div>
                      <p className="mb-0" style={{ fontSize: '.78rem' }}>{n.txt}</p>
                      <span style={{ fontSize: '.65rem', color: '#9ca3af' }}>{n.hora}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panel principal */}
          <div className="col-lg-9 col-md-8">
            {panels[panel]}
          </div>
        </div>
      </div>
    </div>
  );
}
