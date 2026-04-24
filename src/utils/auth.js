/**
 * Nova Smile - Utilidades de Autenticación
 * Maneja usuarios, sesiones y registro de pacientes
 */


// Usuarios fijos del sistema (staff)
export const USUARIOS_SISTEMA = {
  admin: { rol: 'Administrador', pagina: 'admin' },
  doc: { rol: 'Odontólogo', pagina: 'odontologo' },
  recepcion: { rol: 'Recepcionista', pagina: 'recepcionista' },
};

// Contraseña por defecto del sistema
export const PASSWORD_SISTEMA = '12345';

/**
 * Obtiene todos los pacientes registrados desde localStorage
 */
export function getPacientesRegistrados() {
  return JSON.parse(localStorage.getItem('ns_pacientes_registrados') || '[]');
}

/**
 * Guarda la lista de pacientes registrados
 */
export function savePacientesRegistrados(lista) {
  localStorage.setItem('ns_pacientes_registrados', JSON.stringify(lista));
}

/**
 * Registra un nuevo paciente
 * @param {object} datos - { usuario, password, nombre, apellido, correo, telefono, doc }
 * @returns {{ ok: boolean, mensaje: string }}
 */
export function registrarPaciente(datos) {
  const lista = getPacientesRegistrados();

  // Validar que el usuario no exista
  const yaExiste = lista.find(
    (p) => p.usuario.toLowerCase() === datos.usuario.toLowerCase()
  );
  if (yaExiste) {
    return { ok: false, mensaje: 'Ese nombre de usuario ya está registrado.' };
  }

  // Validar que no coincida con usuario del sistema
  if (USUARIOS_SISTEMA[datos.usuario.toLowerCase()]) {
    return { ok: false, mensaje: 'Ese nombre de usuario no está disponible.' };
  }

  const nuevoPaciente = {
    id: Date.now().toString(),
    usuario: datos.usuario.toLowerCase().trim(),
    password: datos.password,
    nombre: datos.nombre.trim(),
    apellido: datos.apellido.trim(),
    correo: datos.correo.trim(),
    telefono: datos.telefono.trim(),
    doc: datos.doc.trim(),
    fechaRegistro: new Date().toISOString(),
    rol: 'Paciente',
    pagina: 'paciente',
  };

  lista.push(nuevoPaciente);
  savePacientesRegistrados(lista);

  return { ok: true, mensaje: 'Cuenta creada exitosamente.' };
}

/**
 * Valida credenciales de login
 * @param {string} usuario
 * @param {string} password
 * @returns {{ ok: boolean, user?: object, mensaje?: string }}
 */
export function validarLogin(usuario, password) {
  const u = usuario.toLowerCase().trim();

  if (!u) return { ok: false, mensaje: 'Por favor ingresa tu usuario.' };
  if (!password) return { ok: false, mensaje: 'Por favor ingresa tu contraseña.' };

  // Verificar usuarios del sistema (staff)
  if (USUARIOS_SISTEMA[u]) {
    if (password !== PASSWORD_SISTEMA) {
      return { ok: false, mensaje: 'Contraseña incorrecta. Hint: 12345' };
    }
    return { ok: true, user: { usuario: u, ...USUARIOS_SISTEMA[u] } };
  }

  // Verificar pacientes registrados
  const pacientes = getPacientesRegistrados();
  const paciente = pacientes.find((p) => p.usuario === u);

  if (!paciente) {
    return {
      ok: false,
      mensaje: 'Usuario no reconocido. Use: admin, doc, recepcion o regístrese como paciente.',
    };
  }

  if (paciente.password !== password) {
    return { ok: false, mensaje: 'Contraseña incorrecta.' };
  }

  return { ok: true, user: paciente };
}

/**
 * Guarda la sesión activa en localStorage
 */
export function guardarSesion(user, recordar) {
  localStorage.setItem('ns_session_user', user.usuario);
  localStorage.setItem('ns_session_rol', user.rol);
  localStorage.setItem('ns_session_pagina', user.pagina);

  if (recordar) {
    localStorage.setItem('ns_remember_user', user.usuario);
  } else {
    localStorage.removeItem('ns_remember_user');
  }

  // Log de acceso
  const logEntry = {
    usuario: user.usuario,
    rol: user.rol,
    hora: new Date().toISOString(),
  };
  const logs = JSON.parse(localStorage.getItem('ns_access_log') || '[]');
  logs.unshift(logEntry);
  localStorage.setItem('ns_access_log', JSON.stringify(logs.slice(0, 50)));
}

/**
 * Cierra la sesión activa
 */
export function cerrarSesion() {
  localStorage.removeItem('ns_session_user');
  localStorage.removeItem('ns_session_rol');
  localStorage.removeItem('ns_session_pagina');
}

/**
 * Obtiene la sesión activa
 */
export function getSesionActiva() {
  const usuario = localStorage.getItem('ns_session_user');
  const rol = localStorage.getItem('ns_session_rol');
  const pagina = localStorage.getItem('ns_session_pagina');
  if (!usuario) return null;
  return { usuario, rol, pagina };
}
