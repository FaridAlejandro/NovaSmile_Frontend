/**
 * Nova Smile - Utilidades de Autenticación
 *
 * ACTUALIZADO: Ahora se comunica con la API PHP (servicio web REST)
 * en lugar de autenticar localmente con localStorage.
 *
 * Flujo:
 *  1. El usuario ingresa usuario y contraseña en el formulario
 *  2. React hace una petición POST a la API PHP (login.php o registro.php)
 *  3. La API consulta la base de datos MySQL y responde con JSON
 *  4. React muestra el resultado y guarda la sesión si el login fue exitoso
 */

// ─── URL base de la API PHP ───────────────────────────────────────────────────
// Ajusta esta ruta según donde tengas XAMPP corriendo
const API_BASE = 'http://localhost/novasmile_api';

/**
 * Mapea el rol que devuelve la API PHP al nombre de página
 * que usa el enrutador de App.js para decidir qué módulo mostrar.
 *
 * @param {string} rol  Rol recibido desde la API ("Administrador", "Paciente", etc.)
 * @returns {string}    Nombre de página interno del router
 */
function rolAPagina(rol) {
  const mapa = {
    'Administrador': 'admin',
    'Odontólogo':    'odontologo',
    'Recepcionista': 'recepcionista',
    'Paciente':      'paciente',
  };
  return mapa[rol] || 'paciente';
}

/**
 * Llama al endpoint de LOGIN de la API PHP.
 *
 * Envía usuario y contraseña como JSON via POST y retorna
 * el resultado estandarizado para que LoginPage lo procese.
 *
 * @param {string} usuario   Nombre de usuario
 * @param {string} password  Contraseña en texto plano
 * @returns {Promise<{ ok: boolean, user?: object, mensaje?: string }>}
 */
export async function validarLogin(usuario, password) {
  // Validación básica antes de llamar a la API
  if (!usuario.trim()) return { ok: false, mensaje: 'Por favor ingresa tu usuario.' };
  if (!password)       return { ok: false, mensaje: 'Por favor ingresa tu contraseña.' };

  try {
    // Petición POST a la API PHP con las credenciales en JSON
    const respuesta = await fetch(`${API_BASE}/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password }),
    });

    const datos = await respuesta.json();

    // Si la API responde con error (401, 400, 500...)
    if (!datos.ok) {
      return { ok: false, mensaje: datos.mensaje };
    }

    // Construir el objeto de usuario con la estructura que espera App.js
    const user = {
      usuario:  datos.data.usuario,
      nombre:   datos.data.nombre,
      apellido: datos.data.apellido,
      correo:   datos.data.correo,
      rol:      datos.data.rol,
      pagina:   rolAPagina(datos.data.rol),
    };

    return { ok: true, user };

  } catch (error) {
    // Error de red: la API no responde (XAMPP apagado, URL incorrecta, etc.)
    console.error('[NovaSmile] Error de conexión con la API:', error);
    return {
      ok: false,
      mensaje: 'No se pudo conectar con el servidor. Verifica que XAMPP esté corriendo.',
    };
  }
}

/**
 * Llama al endpoint de REGISTRO de la API PHP.
 *
 * Envía los datos del nuevo paciente y retorna el resultado.
 *
 * @param {object} datos  { usuario, password, nombre, apellido, correo, telefono }
 * @returns {Promise<{ ok: boolean, mensaje: string }>}
 */
export async function registrarPaciente(datos) {
  try {
    // Petición POST a la API PHP con los datos del nuevo paciente
    const respuesta = await fetch(`${API_BASE}/registro.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });

    const resultado = await respuesta.json();

    return {
      ok:      resultado.ok,
      mensaje: resultado.mensaje,
    };

  } catch (error) {
    // Error de red
    console.error('[NovaSmile] Error de conexión con la API:', error);
    return {
      ok: false,
      mensaje: 'No se pudo conectar con el servidor. Verifica que XAMPP esté corriendo.',
    };
  }
}

/**
 * Guarda la sesión activa en localStorage para que persista
 * entre recargas de página. Solo guarda datos no sensibles.
 *
 * @param {object}  user     Objeto de usuario retornado por validarLogin
 * @param {boolean} recordar Si true, guarda el nombre de usuario para prellenar el form
 */
export function guardarSesion(user, recordar) {
  localStorage.setItem('ns_session_user',   user.usuario);
  localStorage.setItem('ns_session_rol',    user.rol);
  localStorage.setItem('ns_session_pagina', user.pagina);
  localStorage.setItem('ns_session_nombre', user.nombre || '');

  if (recordar) {
    localStorage.setItem('ns_remember_user', user.usuario);
  } else {
    localStorage.removeItem('ns_remember_user');
  }
}

/**
 * Cierra la sesión activa eliminando los datos de localStorage.
 */
export function cerrarSesion() {
  localStorage.removeItem('ns_session_user');
  localStorage.removeItem('ns_session_rol');
  localStorage.removeItem('ns_session_pagina');
  localStorage.removeItem('ns_session_nombre');
}

/**
 * Lee la sesión activa desde localStorage.
 * Retorna null si no hay sesión guardada.
 *
 * @returns {{ usuario, rol, pagina, nombre } | null}
 */
export function getSesionActiva() {
  const usuario = localStorage.getItem('ns_session_user');
  const rol     = localStorage.getItem('ns_session_rol');
  const pagina  = localStorage.getItem('ns_session_pagina');
  const nombre  = localStorage.getItem('ns_session_nombre');

  if (!usuario) return null;
  return { usuario, rol, pagina, nombre };
}
