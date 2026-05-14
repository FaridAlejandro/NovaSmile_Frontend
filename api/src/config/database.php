<?php
/**
 * Nova Smile API - Configuración de Base de Datos
 * 
 * Este archivo centraliza los parámetros de conexión a MySQL.
 * En producción, estos valores deben leerse desde variables de entorno.
 * 
 * @author  NovaSmile Dev
 * @version 1.0
 */

// ─── Parámetros de conexión ───────────────────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_NAME', 'novasmile_db');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

/**
 * Crea y retorna una conexión PDO a la base de datos.
 * 
 * PDO (PHP Data Objects) es la forma recomendada de conectarse a MySQL
 * porque permite usar sentencias preparadas, previniendo inyección SQL.
 * 
 * @return PDO  Instancia de conexión lista para usar
 * @throws PDOException Si la conexión falla
 */
function obtenerConexion(): PDO
{
    // DSN (Data Source Name): cadena que describe la fuente de datos
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        DB_HOST,
        DB_NAME,
        DB_CHARSET
    );

    // Opciones de PDO para mayor seguridad y comodidad
    $opciones = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Lanzar excepciones en errores
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Retornar arrays asociativos
        PDO::ATTR_EMULATE_PREPARES   => false,                  // Usar sentencias preparadas reales
    ];

    return new PDO($dsn, DB_USER, DB_PASS, $opciones);
}
