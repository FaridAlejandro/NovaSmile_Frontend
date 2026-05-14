# 🦷 Nova Smile API — Servicio Web PHP
**GA7-220501096-AA5-EV01 · Diseño y desarrollo de servicios web**

API REST desarrollada en PHP para gestionar el **registro** e **inicio de sesión** de usuarios del sistema Nova Smile.

---

## 📁 Estructura del proyecto

```
novasmile_api/
├── login.php                  ← Endpoint de inicio de sesión
├── registro.php               ← Endpoint de registro de usuarios
│
├── src/
│   ├── config/
│   │   └── database.php       ← Configuración de la conexión PDO a MySQL
│   └── helpers/
│       └── respuesta.php      ← Funciones auxiliares: respuestas JSON, validación, CORS
│
└── docs/
    └── schema.sql             ← Script SQL para crear la base de datos y tabla
```

---

## 🚀 Instalación

### 1. Requisitos
- PHP 7.4 o superior
- MySQL 5.7 o superior (o MariaDB equivalente)
- Servidor web (Apache o Nginx) con PHP habilitado

### 2. Configurar la base de datos
```bash
# Ejecutar el script SQL en tu servidor MySQL
mysql -u root -p < docs/schema.sql
```

### 3. Ajustar credenciales de BD
Editar `src/config/database.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'novasmile_db');
define('DB_USER', 'root');
define('DB_PASS', 'tu_contraseña');
```

### 4. Colocar en el servidor web
Copiar la carpeta `novasmile_api/` dentro del directorio raíz del servidor:
- **Apache/XAMPP:** `htdocs/novasmile_api/`
- **Nginx:** `/var/www/html/novasmile_api/`

---

## 📡 Endpoints

### `POST /novasmile_api/registro.php` — Registro de usuario

**Cuerpo de la petición (JSON):**
```json
{
  "usuario":  "jperez",
  "password": "miClave123",
  "nombre":   "Juan",
  "apellido": "Pérez",
  "correo":   "juan@correo.com",
  "telefono": "3001234567"
}
```

**Respuesta exitosa `201 Created`:**
```json
{
  "ok": true,
  "mensaje": "Cuenta creada exitosamente. Ya puedes iniciar sesión.",
  "data": {
    "usuario": "jperez",
    "nombre": "Juan",
    "rol": "Paciente"
  }
}
```

**Respuesta de error `400`:**
```json
{
  "ok": false,
  "mensaje": "Datos inválidos. Por favor revisa los campos.",
  "errores": ["El campo correo es obligatorio."]
}
```

---

### `POST /novasmile_api/login.php` — Inicio de sesión

**Cuerpo de la petición (JSON):**
```json
{
  "usuario":  "jperez",
  "password": "miClave123"
}
```

**Respuesta de autenticación satisfactoria `200 OK`:**
```json
{
  "ok": true,
  "mensaje": "Autenticación satisfactoria.",
  "data": {
    "usuario": "jperez",
    "nombre":  "Juan",
    "apellido": "Pérez",
    "correo":  "juan@correo.com",
    "rol":     "Paciente"
  }
}
```

**Respuesta de error en la autenticación `401 Unauthorized`:**
```json
{
  "ok": false,
  "mensaje": "Error en la autenticación: usuario o contraseña incorrectos."
}
```

---

## 🧪 Pruebas con cURL

```bash
# Registro
curl -X POST http://localhost/novasmile_api/registro.php \
  -H "Content-Type: application/json" \
  -d '{"usuario":"jperez","password":"1234","nombre":"Juan","apellido":"Pérez","correo":"juan@correo.com","telefono":"300123"}'

# Login exitoso
curl -X POST http://localhost/novasmile_api/login.php \
  -H "Content-Type: application/json" \
  -d '{"usuario":"jperez","password":"1234"}'

# Login fallido
curl -X POST http://localhost/novasmile_api/login.php \
  -H "Content-Type: application/json" \
  -d '{"usuario":"jperez","password":"incorrecta"}'
```

---

## 🔐 Seguridad implementada

| Medida | Descripción |
|--------|-------------|
| **bcrypt** | Las contraseñas se guardan como hash, nunca en texto plano |
| **Sentencias preparadas** | Previenen inyección SQL en todas las consultas |
| **Sanitización** | Los datos de entrada se limpian antes de procesarse |
| **Mensaje genérico** | El login no distingue entre usuario inexistente y contraseña incorrecta (evita enumeración) |
| **CORS configurado** | Permite peticiones desde el frontend React |

---

## 🔧 Versionamiento (Git)

Este proyecto usa Git para el control de versiones:

```bash
git init
git add .
git commit -m "feat: implementación inicial del servicio web de autenticación"
```

---

**Nova Smile Pro** · GA7-220501096-AA5-EV01 · © 2026
