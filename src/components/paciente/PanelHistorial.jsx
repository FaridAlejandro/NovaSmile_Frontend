/**
 * Nova Smile - Panel de Historial del paciente
 * Integración: Cloudinary (subir imágenes de radiografías y tratamientos)
 */
import React, { useState, useRef } from 'react';

const TIPO_CONFIG = {
  comp: { bg: '#dcfce7', color: '#15803d', icon: '✅', label: 'Completado' },
  prog: { bg: '#fef3c7', color: '#92400e', icon: '⏳', label: 'En progreso' },
  pend: { bg: '#dbeafe', color: '#1e40af', icon: '📋', label: 'Pendiente'  },
};

// ─── Cloudinary: sube imagen al historial clínico ────────────────────────────
async function subirImagenCloudinary(archivo) {
  const formData = new FormData();
  formData.append('file', archivo);
  formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'novasmile_historial');
  formData.append('folder', 'novasmile/historial');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) throw new Error('Error al subir imagen a Cloudinary');
  return await res.json(); // retorna { secure_url, public_id, ... }
}

export default function PanelHistorial({ historial }) {
  const [filtro,    setFiltro]    = useState('todos');
  const [busqueda,  setBusqueda]  = useState('');
  const [subiendo,  setSubiendo]  = useState(null); // id del historial donde se sube
  const [imagenes,  setImagenes]  = useState({});   // { historialId: [url, ...] }
  const [notif,     setNotif]     = useState(null);
  const fileRef = useRef();
  const [historialActivo, setHistorialActivo] = useState(null);

  const filtered = historial.filter((h) => {
    const matchFiltro   = filtro === 'todos' || h.tipo === filtro;
    const matchBusqueda = h.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                          h.desc.toLowerCase().includes(busqueda.toLowerCase());
    return matchFiltro && matchBusqueda;
  });

  const mostrarNotif = (msg, tipo = 'success') => {
    setNotif({ msg, tipo });
    setTimeout(() => setNotif(null), 4000);
  };

  const handleSeleccionarImagen = (historialId) => {
    setHistorialActivo(historialId);
    fileRef.current.click();
  };

  const handleArchivoSeleccionado = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    // Validar tipo
    if (!archivo.type.startsWith('image/')) {
      mostrarNotif('❌ Solo se permiten imágenes (JPG, PNG, etc.)', 'danger');
      return;
    }
    // Validar tamaño (máx 5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      mostrarNotif('❌ La imagen no puede superar 5MB', 'danger');
      return;
    }

    setSubiendo(historialActivo);
    mostrarNotif('⬆️ Subiendo imagen a Cloudinary...', 'info');

    try {
      const resultado = await subirImagenCloudinary(archivo);
      setImagenes(prev => ({
        ...prev,
        [historialActivo]: [...(prev[historialActivo] || []), resultado.secure_url],
      }));
      mostrarNotif('✅ Imagen subida exitosamente al historial clínico.');
    } catch (err) {
      console.error('Cloudinary error:', err);
      mostrarNotif('⚠️ No se pudo subir la imagen. Verifica el upload_preset en Cloudinary.', 'warning');
    } finally {
      setSubiendo(null);
      e.target.value = '';
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,.06)', padding: 22 }}>
      <h5 style={{ fontWeight: 700, color: '#111827', marginBottom: 16 }}>
        <i className="bi bi-clock-history me-2 text-info" />
        Historial de Tratamientos
      </h5>

      {/* Input file oculto para Cloudinary */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleArchivoSeleccionado}
      />

      {/* Notificación */}
      {notif && (
        <div className={`alert alert-${notif.tipo} py-2 px-3`} style={{ fontSize: '.82rem' }}>
          {notif.msg}
        </div>
      )}

      {/* Búsqueda y filtros */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Buscar tratamiento..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ maxWidth: 220 }}
        />
        {['todos', 'comp', 'prog', 'pend'].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filtro === f ? 'btn-info' : 'btn-outline-secondary'}`}
            onClick={() => setFiltro(f)}
          >
            {f === 'todos' ? 'Todos' : TIPO_CONFIG[f].label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="text-center text-muted py-4">
          <i className="bi bi-inbox fs-2 d-block mb-2" />
          No hay registros para mostrar.
        </div>
      ) : (
        filtered.map((h, idx) => {
          const cfg = TIPO_CONFIG[h.tipo] || TIPO_CONFIG.pend;
          const imgs = imagenes[h.id] || [];
          return (
            <div key={h.id} style={{ display: 'flex', gap: 13, paddingBottom: 18, position: 'relative' }}>
              {idx < filtered.length - 1 && (
                <div style={{ position: 'absolute', left: 17, top: 34, width: 2, height: 'calc(100% - 18px)', background: '#e2e8f0' }} />
              )}
              <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.95rem', background: cfg.bg }}>
                {cfg.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '.7rem', color: '#6c757d' }}>{h.fecha}</div>
                <div style={{ fontSize: '.88rem', fontWeight: 700, color: '#111827' }}>{h.titulo}</div>
                <div style={{ fontSize: '.76rem', color: '#6c757d', marginTop: 1 }}>{h.desc}</div>
                <span style={{ display: 'inline-block', marginTop: 4, fontSize: '.68rem', fontWeight: 600, padding: '2px 9px', borderRadius: 999, background: cfg.bg, color: cfg.color }}>
                  {cfg.label}
                </span>

                {/* Botón subir imagen Cloudinary */}
                <div className="mt-2">
                  <button
                    className="btn btn-sm btn-outline-info"
                    style={{ fontSize: '.72rem' }}
                    disabled={subiendo === h.id}
                    onClick={() => handleSeleccionarImagen(h.id)}
                  >
                    {subiendo === h.id ? (
                      <><span className="spinner-border spinner-border-sm me-1" />Subiendo...</>
                    ) : (
                      <><i className="bi bi-cloud-upload me-1" />Subir imagen (Cloudinary)</>
                    )}
                  </button>
                </div>

                {/* Imágenes subidas */}
                {imgs.length > 0 && (
                  <div className="d-flex gap-2 flex-wrap mt-2">
                    {imgs.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer">
                        <img
                          src={url}
                          alt={`Imagen ${i + 1}`}
                          style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, border: '2px solid #e2e8f0' }}
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}

      <p className="text-muted mt-2" style={{ fontSize: '.72rem' }}>
        <i className="bi bi-cloud me-1 text-info" />
        Las imágenes se almacenan de forma segura en <strong>Cloudinary</strong>. Formatos: JPG, PNG. Máx: 5MB.
      </p>
    </div>
  );
}
