/**
 * Nova Smile - Componente RegisterForm
 * Formulario de registro para nuevos pacientes
 */
import React, { useState } from 'react';

const INITIAL_STATE = {
  nombre: '',
  apellido: '',
  doc: '',
  correo: '',
  telefono: '',
  usuario: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterForm({ onRegister, onGoToLogin }) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpiar error al editar
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es requerido.';
    if (!form.apellido.trim()) newErrors.apellido = 'El apellido es requerido.';
    if (!form.doc.trim()) newErrors.doc = 'El documento es requerido.';
    if (!form.correo.trim()) {
      newErrors.correo = 'El correo es requerido.';
    } else if (!/\S+@\S+\.\S+/.test(form.correo)) {
      newErrors.correo = 'Correo inválido.';
    }
    if (!form.telefono.trim()) newErrors.telefono = 'El teléfono es requerido.';
    if (!form.usuario.trim()) {
      newErrors.usuario = 'El usuario es requerido.';
    } else if (form.usuario.trim().length < 3) {
      newErrors.usuario = 'Mínimo 3 caracteres.';
    } else if (/\s/.test(form.usuario)) {
      newErrors.usuario = 'El usuario no puede tener espacios.';
    }
    if (!form.password) {
      newErrors.password = 'La contraseña es requerida.';
    } else if (form.password.length < 4) {
      newErrors.password = 'Mínimo 4 caracteres.';
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onRegister({
      nombre: form.nombre,
      apellido: form.apellido,
      doc: form.doc,
      correo: form.correo,
      telefono: form.telefono,
      usuario: form.usuario,
      password: form.password,
    });
  };

  const field = (name, label, type = 'text', placeholder = '') => (
    <div className="mb-2">
      <label className="form-label small fw-bold text-muted text-uppercase mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        className={`form-control form-control-sm bg-light ${errors[name] ? 'border-danger' : ''}`}
        placeholder={placeholder}
        value={form[name]}
        onChange={handleChange}
        autoComplete="off"
      />
      {errors[name] && (
        <div className="text-danger" style={{ fontSize: '.73rem', marginTop: 2 }}>
          {errors[name]}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Header del formulario */}
      <div className="d-flex align-items-center mb-3">
        <button
          className="btn btn-link btn-sm p-0 text-muted me-2"
          onClick={onGoToLogin}
          title="Volver al login"
        >
          <i className="bi bi-arrow-left fs-5" />
        </button>
        <div>
          <h6 className="mb-0 fw-bold text-dark">Crear cuenta de paciente</h6>
          <p className="text-muted mb-0" style={{ fontSize: '.75rem' }}>
            Complete sus datos para registrarse
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Datos personales */}
        <div className="p-2 rounded mb-2" style={{ background: '#f0f7ff', border: '1px solid #dbeafe' }}>
          <p className="text-primary small fw-bold mb-2">
            <i className="bi bi-person-vcard me-1" />
            Datos personales
          </p>
          <div className="row g-2">
            <div className="col-6">{field('nombre', 'Nombre', 'text', 'Ej: Carlos')}</div>
            <div className="col-6">{field('apellido', 'Apellido', 'text', 'Ej: Ruiz')}</div>
          </div>
          {field('doc', 'N° Documento', 'text', 'Cédula o pasaporte')}
          <div className="row g-2">
            <div className="col-7">{field('correo', 'Correo', 'email', 'correo@ejemplo.com')}</div>
            <div className="col-5">{field('telefono', 'Teléfono', 'tel', '310...')}</div>
          </div>
        </div>

        {/* Credenciales */}
        <div className="p-2 rounded mb-3" style={{ background: '#f0fdf4', border: '1px solid #dcfce7' }}>
          <p className="text-success small fw-bold mb-2">
            <i className="bi bi-shield-lock me-1" />
            Credenciales de acceso
          </p>
          {field('usuario', 'Usuario', 'text', 'Elige un usuario único')}

          {/* Contraseña con toggle */}
          <div className="mb-2">
            <label className="form-label small fw-bold text-muted text-uppercase mb-1">
              Contraseña
            </label>
            <div className="input-group input-group-sm">
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                className={`form-control bg-light ${errors.password ? 'border-danger' : ''}`}
                placeholder="Mínimo 4 caracteres"
                value={form.password}
                onChange={handleChange}
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
            {errors.password && (
              <div className="text-danger" style={{ fontSize: '.73rem', marginTop: 2 }}>
                {errors.password}
              </div>
            )}
          </div>

          <div className="mb-1">
            <label className="form-label small fw-bold text-muted text-uppercase mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              className={`form-control form-control-sm bg-light ${errors.confirmPassword ? 'border-danger' : ''}`}
              placeholder="Repita la contraseña"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <div className="text-danger" style={{ fontSize: '.73rem', marginTop: 2 }}>
                {errors.confirmPassword}
              </div>
            )}
          </div>
        </div>

        {/* Botón registrar */}
        <button
          type="submit"
          className="btn btn-success w-100 shadow-sm text-uppercase fw-bold"
          style={{ padding: '0.75rem', letterSpacing: '.05em' }}
        >
          <i className="bi bi-person-plus-fill me-1" />
          Crear mi cuenta
        </button>
      </form>

      {/* Volver al login */}
      <div className="text-center mt-3">
        <span className="text-muted small">¿Ya tienes cuenta? </span>
        <button
          className="btn btn-link btn-sm p-0 text-primary fw-bold"
          onClick={onGoToLogin}
        >
          Iniciar sesión
        </button>
      </div>
    </>
  );
}
