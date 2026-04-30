/**
 * Nova Smile - Panel de Perfil del paciente
 */
import React, { useState } from 'react';

export default function PanelPerfil({ perfil, onSave }) {
  const [form, setForm] = useState({ ...perfil });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const field = (name, label, type = 'text') => (
    <div className="mb-3">
      <label className="form-label small fw-bold" style={{ color: '#475569' }}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        className="form-control"
        value={form[name] || ''}
        onChange={handleChange}
      />
    </div>
  );

  return (
    <div
      style={{
        background: 'white', borderRadius: 14,
        boxShadow: '0 2px 8px rgba(0,0,0,.06)', padding: 22,
      }}
    >
      <h5 style={{ fontWeight: 700, color: '#111827', marginBottom: 16 }}>
        <i className="bi bi-person-fill me-2 text-info" />
        Mi Perfil
      </h5>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">{field('nombre', 'Nombre completo')}</div>
          <div className="col-md-6">{field('doc', 'N° Documento')}</div>
          <div className="col-md-6">{field('tel', 'Teléfono', 'tel')}</div>
          <div className="col-md-6">{field('email', 'Correo electrónico', 'email')}</div>
          <div className="col-md-6">{field('nac', 'Fecha de nacimiento', 'date')}</div>
          <div className="col-md-6">{field('alergias', 'Alergias / Condiciones')}</div>
        </div>

        <div className="d-flex gap-2 mt-2">
          <button
            type="submit"
            className="btn btn-info text-white fw-bold"
          >
            <i className="bi bi-save me-1" />
            Guardar cambios
          </button>
          {saved && (
            <span className="text-success align-self-center fw-bold" style={{ fontSize: '.85rem' }}>
              <i className="bi bi-check-circle me-1" />
              ¡Guardado correctamente!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
