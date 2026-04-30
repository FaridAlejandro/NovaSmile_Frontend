<?php
/**
 * Nova Smile API - Funciones Auxiliares
 * 
 * Contiene utilidades reutilizables para:
 *  - Enviar respuestas JSON estandarizadas
 *  - Configurar cabeceras CORS (para que React pueda llamar la API)
 *  - Validar campos de entrada
 * 
 * @author  NovaSmile Dev
 * @version 1.0
 */

/**
 * Configura las cabeceras HTTP necesarias para que la API funcione
 * correctamente con aplicaciones frontend (React, etc.).
 * 
 * CORS (Cross-Origin Resource Sharing) permite que un dominio diferente
 * pueda hacer peticiones HTTP a esta API.
 */
function configurarCabeceras(): void
{
    // Permitir peticiones desde cualquier origen (en producción especificar dominio)
    header('Access-Control-Allow-Origin: *');

    // Métodos HTTP permitidos
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

    // Cabeceras permitidas en las peticiones
    header('Access-Control-Allow-Headers: Content-Type, Authorization');

    // Toda respuesta será JSON
    header('Content-Type: application/json; charset=utf-8');

    // Si es una petición OPTIONS (preflight de CORS), terminar aquí
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

/**
 * Envía una respuesta JSON de ÉXITO al cliente y termina la ejecución.
 * 
 * Estructura estándar de respuesta exitosa:
 * {
 *   "ok": true,
 *   "mensaje": "...",
 *   "data": { ... }   ← opcional
 * }
 * 
 * @param string $mensaje  Mensaje descriptivo del resultado
 * @param array  $data     Datos adicionales a incluir (opcional)
 * @param int    $codigo   Código HTTP (200 OK por defecto)
 */
function respuestaExito(string $mensaje, array $data = [], int $codigo = 200): void
{
    http_response_code($codigo);

    $respuesta = [
        'ok'      => true,
        'mensaje' => $mensaje,
    ];

    // Solo incluir 'data' si hay contenido
    if (!empty($data)) {
        $respuesta['data'] = $data;
    }

    echo json_encode($respuesta, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Envía una respuesta JSON de ERROR al cliente y termina la ejecución.
 * 
 * Estructura estándar de respuesta de error:
 * {
 *   "ok": false,
 *   "mensaje": "...",
 *   "errores": [ ... ]   ← opcional
 * }
 * 
 * @param string $mensaje  Mensaje descriptivo del error
 * @param int    $codigo   Código HTTP (400 Bad Request por defecto)
 * @param array  $errores  Lista de errores de validación (opcional)
 */
function respuestaError(string $mensaje, int $codigo = 400, array $errores = []): void
{
    http_response_code($codigo);

    $respuesta = [
        'ok'      => false,
        'mensaje' => $mensaje,
    ];

    // Solo incluir 'errores' si hay contenido
    if (!empty($errores)) {
        $respuesta['errores'] = $errores;
    }

    echo json_encode($respuesta, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Lee y decodifica el cuerpo JSON de la petición HTTP entrante.
 * 
 * Los clientes REST envían datos en el cuerpo de la petición como JSON.
 * Esta función lo convierte a un array PHP asociativo.
 * 
 * @return array  Datos del cuerpo de la petición
 */
function obtenerCuerpoJson(): array
{
    // php://input lee el cuerpo crudo de la petición
    $cuerpoRaw = file_get_contents('php://input');

    if (empty($cuerpoRaw)) {
        return [];
    }

    $datos = json_decode($cuerpoRaw, true);

    // json_decode retorna null si el JSON es inválido
    if (json_last_error() !== JSON_ERROR_NONE) {
        respuestaError('El cuerpo de la petición no es JSON válido.', 400);
    }

    return $datos ?? [];
}

/**
 * Sanitiza una cadena de texto eliminando espacios al inicio/fin
 * y convirtiendo caracteres especiales HTML para prevenir XSS.
 * 
 * @param string $valor  Texto a limpiar
 * @return string        Texto sanitizado
 */
function sanitizar(string $valor): string
{
    return htmlspecialchars(trim($valor), ENT_QUOTES, 'UTF-8');
}

/**
 * Valida que una dirección de correo electrónico tenga formato válido.
 * 
 * @param string $correo  Correo a validar
 * @return bool           true si es válido, false si no
 */
function esCorreoValido(string $correo): bool
{
    return filter_var($correo, FILTER_VALIDATE_EMAIL) !== false;
}
