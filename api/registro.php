<?php
/**
 * Nova Smile API - Endpoint de Registro de Usuario
 * 
 * URL:    POST /api/registro.php
 * 
 * Cuerpo esperado (JSON):
 * {
 *   "usuario":   "jperez",
 *   "password":  "miClave123",
 *   "nombre":    "Juan",
 *   "apellido":  "Pérez",
 *   "correo":    "juan@correo.com",
 *   "telefono":  "3001234567"
 * }
 * 
 * Respuesta exitosa (201 Created):
 * {
 *   "ok": true,
 *   "mensaje": "Cuenta creada exitosamente.",
 *   "data": { "usuario": "jperez", "rol": "Paciente" }
 * }
 * 
 * Respuesta de error (400 / 409):
 * {
 *   "ok": false,
 *   "mensaje": "...",
 *   "errores": [ ... ]
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

$usuario  = sanitizar($datos['usuario']  ?? '');
$password = $datos['password']           ?? '';  // La contraseña NO se sanitiza para no alterar caracteres
$nombre   = sanitizar($datos['nombre']   ?? '');
$apellido = sanitizar($datos['apellido'] ?? '');
$correo   = sanitizar($datos['correo']   ?? '');
$telefono = sanitizar($datos['telefono'] ?? '');

// ─── Validación de campos requeridos ─────────────────────────────────────────
$errores = [];

// Validar usuario
if (empty($usuario)) {
    $errores[] = 'El campo usuario es obligatorio.';
} elseif (strlen($usuario) < 3 || strlen($usuario) > 50) {
    $errores[] = 'El usuario debe tener entre 3 y 50 caracteres.';
} elseif (preg_match('/\s/', $usuario)) {
    $errores[] = 'El usuario no puede contener espacios.';
}

// Validar contraseña (mínimo 4 caracteres para coincidir con el frontend)
if (empty($password)) {
    $errores[] = 'El campo contraseña es obligatorio.';
} elseif (strlen($password) < 4) {
    $errores[] = 'La contraseña debe tener mínimo 4 caracteres.';
}

// Validar nombre y apellido
if (empty($nombre))   $errores[] = 'El campo nombre es obligatorio.';
if (empty($apellido)) $errores[] = 'El campo apellido es obligatorio.';

// Validar correo electrónico
if (empty($correo)) {
    $errores[] = 'El campo correo es obligatorio.';
} elseif (!esCorreoValido($correo)) {
    $errores[] = 'El correo electrónico no tiene un formato válido.';
}

// Validar teléfono
if (empty($telefono)) $errores[] = 'El campo teléfono es obligatorio.';

// Si hay errores de validación, retornar respuesta 400
if (!empty($errores)) {
    respuestaError('Datos inválidos. Por favor revisa los campos.', 400, $errores);
}

// ─── Interacción con la base de datos ────────────────────────────────────────
try {
    $pdo = obtenerConexion();

    // Verificar si el nombre de usuario ya existe
    // Se usa una sentencia preparada para evitar inyección SQL
    $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE usuario = :usuario LIMIT 1');
    $stmt->execute([':usuario' => strtolower($usuario)]);

    if ($stmt->fetch()) {
        respuestaError('Ese nombre de usuario ya está registrado.', 409);
    }

    // Verificar si el correo ya está registrado
    $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE correo = :correo LIMIT 1');
    $stmt->execute([':correo' => strtolower($correo)]);

    if ($stmt->fetch()) {
        respuestaError('Ese correo electrónico ya está registrado.', 409);
    }

    // Cifrar la contraseña con bcrypt (algoritmo PASSWORD_BCRYPT)
    // NUNCA guardar contraseñas en texto plano en la base de datos
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    // Insertar el nuevo usuario
    $stmt = $pdo->prepare(
        'INSERT INTO usuarios (usuario, password_hash, nombre, apellido, correo, telefono, rol)
         VALUES (:usuario, :password_hash, :nombre, :apellido, :correo, :telefono, :rol)'
    );

    $stmt->execute([
        ':usuario'       => strtolower($usuario),
        ':password_hash' => $passwordHash,
        ':nombre'        => $nombre,
        ':apellido'      => $apellido,
        ':correo'        => strtolower($correo),
        ':telefono'      => $telefono,
        ':rol'           => 'Paciente',  // Todo usuario registrado es Paciente
    ]);

    // Retornar respuesta exitosa con código 201 Created
    respuestaExito(
        'Cuenta creada exitosamente. Ya puedes iniciar sesión.',
        [
            'usuario' => strtolower($usuario),
            'nombre'  => $nombre,
            'rol'     => 'Paciente',
        ],
        201
    );

} catch (PDOException $e) {
    // Registrar el error técnico en el log del servidor (no exponer al cliente)
    error_log('[NovaSmile] Error en registro: ' . $e->getMessage());

    // Responder con un mensaje genérico para no exponer detalles internos
    respuestaError('Error interno del servidor. Intenta de nuevo más tarde.', 500);
}
