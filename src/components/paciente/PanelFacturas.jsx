/**
 * Nova Smile - Panel de Facturas del paciente
 * Integración: MercadoPago (pago de facturas pendientes)
 */
import React, { useState } from 'react';

// ─── MercadoPago: genera preferencia de pago y redirige al checkout ──────────
async function pagarConMercadoPago(factura) {
  try {
    // En producción esto llamaría al backend PHP para crear la preferencia.
    // En modo demo/pruebas usamos el Checkout Pro con la public key.
    const mp = new window.MercadoPago(process.env.REACT_APP_MP_PUBLIC_KEY, { locale: 'es-CO' });

    // Simulamos una preferencia demo (en producción el backend retorna el preference_id)
    const demoPreferenceId = 'DEMO_' + factura.id + '_' + Date.now();

    // Abrir el checkout de MercadoPago
    mp.checkout({
      preference: { id: demoPreferenceId },
      autoOpen: true,
    });
  } catch (err) {
    console.error('MercadoPago error:', err);
    // Fallback: abrir link de pago directo
    window.open(
      `https://www.mercadopago.com.co/checkout/v1/redirect?preference-id=TEST`,
      '_blank'
    );
  }
}

export default function PanelFacturas({ facturas }) {
  const [pagando, setPagando] = useState(null);
  const [notif,   setNotif]   = useState(null);

  const total    = facturas.reduce((acc, f) => acc + f.monto, 0);
  const pagado   = facturas.filter((f) => f.pagado).reduce((acc, f) => acc + f.monto, 0);
  const pendiente = total - pagado;

  const mostrarNotif = (msg, tipo = 'success') => {
    setNotif({ msg, tipo });
    setTimeout(() => setNotif(null), 4000);
  };

  const handlePagar = async (factura) => {
    setPagando(factura.id);
    mostrarNotif(`🔄 Iniciando pago con MercadoPago para: ${factura.servicio}...`, 'info');

    // Cargar SDK de MercadoPago dinámicamente si no está cargado
    if (!window.MercadoPago) {
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = async () => {
        await pagarConMercadoPago(factura);
        setPagando(null);
      };
      document.head.appendChild(script);
    } else {
      await pagarConMercadoPago(factura);
      setPagando(null);
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,.06)', padding: 22 }}>
      <h5 style={{ fontWeight: 700, color: '#111827', marginBottom: 16 }}>
        <i className="bi bi-receipt me-2 text-info" />
        Mis Facturas
      </h5>

      {/* Notificación */}
      {notif && (
        <div className={`alert alert-${notif.tipo} py-2 px-3`} style={{ fontSize: '.82rem' }}>
          {notif.msg}
        </div>
      )}

      {/* Resumen financiero */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        {[
          { label: 'Total facturado', val: total,     color: '#1e40af', bg: '#dbeafe' },
          { label: 'Pagado',          val: pagado,    color: '#15803d', bg: '#dcfce7' },
          { label: 'Pendiente',       val: pendiente, color: '#b91c1c', bg: '#fee2e2' },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, minWidth: 100, padding: '12px 16px', borderRadius: 10, background: s.bg }}>
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
            background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 7,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '.84rem', fontWeight: 600 }}>{f.servicio}</div>
            <div style={{ fontSize: '.7rem', color: '#6c757d' }}>{f.fecha}</div>
          </div>
          <div style={{ fontSize: '.93rem', fontWeight: 700, whiteSpace: 'nowrap', color: f.pagado ? '#15803d' : '#b91c1c' }}>
            ${f.monto.toLocaleString('es-CO')}
          </div>
          <span style={{
            fontSize: '.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: 999,
            background: f.pagado ? '#dcfce7' : '#fee2e2',
            color: f.pagado ? '#15803d' : '#b91c1c',
          }}>
            {f.pagado ? '✓ Pagado' : 'Pendiente'}
          </span>

          {/* Botón pagar con MercadoPago */}
          {!f.pagado && (
            <button
              className="btn btn-sm btn-warning fw-bold"
              style={{ fontSize: '.72rem', whiteSpace: 'nowrap' }}
              disabled={pagando === f.id}
              onClick={() => handlePagar(f)}
            >
              {pagando === f.id ? (
                <><span className="spinner-border spinner-border-sm me-1" />Procesando...</>
              ) : (
                <><i className="bi bi-credit-card me-1" />Pagar con MP</>
              )}
            </button>
          )}
        </div>
      ))}

      {/* Nota informativa */}
      <p className="text-muted mt-3" style={{ fontSize: '.72rem' }}>
        <i className="bi bi-shield-check me-1 text-success" />
        Los pagos son procesados de forma segura a través de <strong>MercadoPago</strong>.
        En modo de prueba use la tarjeta: <code>4075 5957 1648 3764</code>
      </p>
    </div>
  );
}
