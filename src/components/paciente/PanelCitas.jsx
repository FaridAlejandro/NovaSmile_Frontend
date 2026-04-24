/**
 * Nova Smile - Panel de Citas del paciente
 */
import React, { useState } from 'react';

const ESTADO_COLORS = {
  Confirmada: { bg: '#dcfce7', color: '#15803d' },
  Completada: { bg: '#dbeafe', color: '#1e40af' },
  Cancelada: { bg: '#fee2e2', color: '#b91c1c' },
  Pendiente: { bg: '#fef3c7', color: '#92400e' },
};

const HORAS_DISP = [
  '08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','14:00','14:30','15:00','15:30','16:00',
];
const OCUPADAS_DEMO = ['09:00','11:00','14:30'];

export default function PanelCitas({ citas, onReagendar }) {
  const [reagendarId, setReagendarId] = useState(null);
  const [slotSel, setSlotSel] = useState(null);
  const [fechaSel, setFechaSel] = useState('');

  const hoy = new Date().toISOString().split('T')[0];

  const handleReagendar = () => {
    if (!fechaSel || !slotSel) return;
    onReagendar(reagendarId, fechaSel, slotSel);
    setReagendarId(null);
    setSlotSel(null);
    setFechaSel('');
  };

  return (
    <div
      style={{
        background: 'white', borderRadius: 14,
        boxShadow: '0 2px 8px rgba(0,0,0,.06)', padding: 22,
      }}
    >
      <h5 style={{ fontWeight: 700, color: '#111827', marginBottom: 16 }}>
        <i className="bi bi-calendar-check-fill me-2 text-info" />
        Mis Citas
      </h5>

      {citas.length === 0 ? (
        <div className="text-center text-muted py-4">
          <i className="bi bi-calendar-x fs-2 d-block mb-2" />
          No tienes citas registradas.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle" style={{ fontSize: '.82rem' }}>
            <thead style={{ fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.05em', color: '#6c757d', background: '#f8fafc' }}>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Servicio</th>
                <th>Doctor</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {citas.map((c) => {
                const ec = ESTADO_COLORS[c.estado] || { bg: '#f3f4f6', color: '#374151' };
                return (
                  <React.Fragment key={c.id}>
                    <tr>
                      <td>{c.fecha}</td>
                      <td>{c.hora}</td>
                      <td className="fw-semibold">{c.servicio}</td>
                      <td>{c.doctor}</td>
                      <td>
                        <span style={{
                          background: ec.bg, color: ec.color,
                          borderRadius: 999, padding: '2px 10px',
                          fontSize: '.72rem', fontWeight: 600,
                        }}>
                          {c.estado}
                        </span>
                      </td>
                      <td>
                        {c.estado === 'Confirmada' && (
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => setReagendarId(reagendarId === c.id ? null : c.id)}
                          >
                            <i className="bi bi-calendar-event me-1" />
                            Reagendar
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Panel de reagendado */}
                    {reagendarId === c.id && (
                      <tr>
                        <td colSpan={6}>
                          <div style={{
                            background: '#f8fafc', border: '1px solid #e2e8f0',
                            borderRadius: 12, padding: 16,
                          }}>
                            <p className="fw-bold mb-2" style={{ fontSize: '.82rem' }}>
                              Selecciona nueva fecha y hora:
                            </p>
                            <div className="d-flex gap-3 align-items-start flex-wrap">
                              <div>
                                <label className="form-label small fw-bold text-muted">Fecha</label>
                                <input
                                  type="date"
                                  className="form-control form-control-sm"
                                  min={hoy}
                                  value={fechaSel}
                                  onChange={(e) => { setFechaSel(e.target.value); setSlotSel(null); }}
                                />
                              </div>
                              {fechaSel && (
                                <div>
                                  <label className="form-label small fw-bold text-muted">Hora disponible</label>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                                    {HORAS_DISP.map((h) => {
                                      const busy = OCUPADAS_DEMO.includes(h);
                                      return (
                                        <button
                                          key={h}
                                          disabled={busy}
                                          onClick={() => !busy && setSlotSel(h)}
                                          style={{
                                            padding: '7px 4px', textAlign: 'center',
                                            fontSize: '.75rem', fontWeight: 600,
                                            border: `1.5px solid ${slotSel === h ? '#0dcaf0' : '#e2e8f0'}`,
                                            borderRadius: 8, cursor: busy ? 'not-allowed' : 'pointer',
                                            background: slotSel === h ? '#0dcaf0' : busy ? '#f1f5f9' : 'white',
                                            color: slotSel === h ? 'white' : busy ? '#9ca3af' : '#374151',
                                            textDecoration: busy ? 'line-through' : 'none',
                                          }}
                                        >
                                          {h}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="d-flex gap-2 mt-3">
                              <button
                                className="btn btn-sm btn-info text-white"
                                disabled={!fechaSel || !slotSel}
                                onClick={handleReagendar}
                              >
                                <i className="bi bi-check-circle me-1" />
                                Confirmar reagendo
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => { setReagendarId(null); setSlotSel(null); setFechaSel(''); }}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
