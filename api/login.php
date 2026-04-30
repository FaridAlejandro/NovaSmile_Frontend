<?php
/**
 * Nova Smile API - Endpoint de Inicio de Sesión (Login)
 * 
 * URL:    POST /api/login.php
 * 
 * Cuerpo esperado (JSON):
 * {
 *   "usuario":  "jperez",
 *   "password": "miClave123"
 * }
 * 
 * Respuesta de AUTENTICACIÓN SATISFACTORIA (200 OK):
 * {
 *   "ok": true,
 *   "mensaje": "Autenticación satisfactoria.",
 *   "data": {
 *     "usuario": "jperez",
 *     "nombre":  "Juan",
 *     "rol":     "Paciente"
 *   }
 * }
 * 
 * Respuesta de ERROR en la autenticación (401 Unauthorized):
 * {
 *   "ok": false,
 *   "mensaje": "Error en la autenticación: usuario o contraseña incorrectos."
 * }
 * 
 * @author  NovaSmile Dev
 * @version 1.0
 */

// ─── Carga de dependencias ────────────────────────────────────────────────────
require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/helpers/respuesta.php';

// ─── Configurar cabeceras HTTP ────────────────────────────────────────────────
configurarCabeceras();

// ─── Solo aceptar método POST ─────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respuestaError('Método no permitido. Use POST.', 405);
}

// ─── Leer y sanitizar datos de entrada ───────────────────────────────────────
$datos = obtenerCuerpoJson();

// Sanitizar el usuario, pero NO la contraseña (para preservar caracteres especiales)
$usuario  = sanitizar($datos['usuario']  ?? '');
$password = $datos['password']           ?? '';

// ─── Validación básica de presencia de campos ────────────────────────────────
if (empty($usuario)) {
    respuestaError('Por favor ingresa tu usuario.', 400);
}

if (empty($password)) {
    respuestaError('Por favor ingresa tu contraseña.', 400);
}

// ─── Consulta a la base de datos ─────────────────────────────────────────────
try {
    $pdo = obtenerConexion();

    // Buscar el usuario por su nombre de usuario (sin importar mayúsculas)
    // Solo recuperar usuarios activos (activo = 1)
    $stmt = $pdo->prepare(
        'SELECT id, usuario, password_hash, nombre, apellido, correo, rol
         FROM usuarios
         WHERE usuario = :usuario
           AND activo = 1
         LIMIT 1'
    );
    $stmt->execute([':usuario' => strtolower($usuario)]);

    $usuarioEncontrado = $stmt->fetch();

    // ─── Verificación de credenciales ─────────────────────────────────────────
    // IMPORTANTE: No distinguir entre "usuario no existe" y "contraseña incorrecta"
    // en el mensaje de error. Esto previene la enumeración de usuarios.

    if (!$usuarioEncontrado) {
        // El usuario no existe → error de autenticación genérico
        respuestaError('Error en la autenticación: usuario o contraseña incorrectos.', 401);
    }

    // password_verify compara la contraseña ingresada con el hash almacenado
    // Esto es seguro porque bcrypt incluye el salt dentro del hash
    $passwordCorrecta = password_verify($password, $usuarioEncontrado['password_hash']);

    if (!$passwordCorrecta) {
        // Contraseña incorrecta → mismo mensaje genérico para no revelar cuál falló
        respuestaError('Error en la autenticación: usuario o contraseña incorrectos.', 401);
    }

    // ─── Autenticación exitosa ────────────────────────────────────────────────

    // Actualizar la fecha del último inicio de sesión
    $stmtUpdate = $pdo->prepare(
        'UPDATE usuarios SET ultimo_login = NOW() WHERE id = :id'
    );
    $stmtUpdate->execute([':id' => $usuarioEncontrado['id']]);

    // Retornar los datos públicos del usuario (sin contraseña ni datos sensibles)
    respuestaExito(
        'Autenticación satisfactoria.',
        [
            'usuario'  => $usuarioEncontrado['usuario'],
            'nombre'   => $usuarioEncontrado['nombre'],
            'apellido' => $usuarioEncontrado['apellido'],
            'correo'   => $usuarioEncontrado['correo'],
            'rol'      => $usuarioEncontrado['rol'],
        ]
    );

} catch (PDOException $e) {
    // Registrar el error técnico en el log del servidor
    error_log('[NovaSmile] Error en login: ' . $e->getMessage());

    // Responder con un mensaje genérico para no exponer detalles internos
    respuestaError('Error interno del servidor. Intenta de nuevo más tarde.', 500);
}
