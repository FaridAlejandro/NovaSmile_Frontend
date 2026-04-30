-- =============================================================================
-- Nova Smile API - Esquema de Base de Datos
-- GA7-220501096-AA5-EV01
--
-- Ejecutar este script en MySQL/MariaDB antes de usar la API.
-- Crea la base de datos y la tabla de usuarios con los campos requeridos.
-- =============================================================================

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS novasmile_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Seleccionar la base de datos
USE novasmile_db;

-- -----------------------------------------------------------------------------
-- Tabla: usuarios
-- Almacena las credenciales y datos de todos los usuarios del sistema.
-- El campo 'password_hash' guarda la contraseña cifrada con bcrypt,
-- NUNCA la contraseña en texto plano.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    usuario       VARCHAR(50)     NOT NULL,           -- Nombre de usuario único
    password_hash VARCHAR(255)    NOT NULL,           -- Contraseña cifrada (bcrypt)
    nombre        VARCHAR(100)    NOT NULL,           -- Nombre real del usuario
    apellido      VARCHAR(100)    NOT NULL,           -- Apellido del usuario
    correo        VARCHAR(150)    NOT NULL,           -- Correo electrónico único
    telefono      VARCHAR(20)     NOT NULL DEFAULT '',-- Teléfono de contacto
    rol           ENUM('Paciente','Administrador','Odontólogo','Recepcionista')
                                  NOT NULL DEFAULT 'Paciente',
    activo        TINYINT(1)      NOT NULL DEFAULT 1, -- 1 = activo, 0 = desactivado
    fecha_registro DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultimo_login  DATETIME                 DEFAULT NULL,

    PRIMARY KEY (id),

    -- Índices únicos para evitar duplicados
    UNIQUE KEY uq_usuario (usuario),
    UNIQUE KEY uq_correo  (correo)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Tabla de usuarios registrados en Nova Smile';

-- -----------------------------------------------------------------------------
-- Datos de prueba: usuarios del sistema (contraseña: 12345)
-- El hash corresponde a password_hash('12345', PASSWORD_BCRYPT)
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO usuarios (usuario, password_hash, nombre, apellido, correo, rol) VALUES
('admin',     '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carlos',  'Gómez',    'admin@novasmile.com',    'Administrador'),
('doc',       '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'María',   'Pérez',    'doc@novasmile.com',      'Odontólogo'),
('recepcion', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Laura',   'Martínez', 'recep@novasmile.com',    'Recepcionista');
-- Nota: el hash '$2y$10$92IXU...' es el hash bcrypt de la cadena 'password'
-- Para producción, cambiar las contraseñas y regenerar los hashes.
