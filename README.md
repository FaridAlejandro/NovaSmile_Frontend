# 🦷 Nova Smile — React v3.0

Sistema de gestión odontológica migrado a **Create React App** con componentes `.js` separados.

---

## 🚀 Instalación y ejecución

```bash
# 1. Entra a la carpeta del proyecto
cd novasmile-react

# 2. Instala las dependencias
npm install

# 3. Inicia el servidor de desarrollo
npm start
```

La app abrirá en **http://localhost:3000**

---

## 📁 Estructura de componentes

```
src/
├── App.js                          ← Enrutador principal por rol
├── index.js                        ← Punto de entrada React
├── index.css                       ← Estilos globales
│
├── utils/
│   └── auth.js                     ← Lógica de login, registro y sesión
│
├── hooks/
│   └── useToast.js                 ← Hook de notificaciones toast
│
└── components/
    ├── LoginPage.js                ← Contenedor login/registro
    ├── LoginForm.js                ← Formulario de inicio de sesión
    ├── RegisterForm.js             ← Formulario de registro de pacientes ⭐ NUEVO
    ├── Toast.js                    ← Notificaciones flotantes
    ├── Spinner.js                  ← Spinner de carga
    │
    ├── layouts/
    │   ├── NavbarPaciente.js       ← Navbar del módulo paciente
    │   └── NavbarAdmin.js          ← Navbar de admin/doctor/recepción
    │
    ├── paciente/
    │   ├── PerfilCard.js           ← Tarjeta de perfil (sidebar)
    │   ├── MenuLateral.js          ← Menú de navegación lateral
    │   ├── PanelInicio.js          ← Dashboard del paciente
    │   ├── PanelHistorial.js       ← Historial de tratamientos
    │   ├── PanelCitas.js           ← Mis citas + reagendamiento
    │   ├── PanelFacturas.js        ← Mis facturas y saldos
    │   └── PanelPerfil.js          ← Edición de perfil personal
    │
    └── pages/
        ├── PacientePage.js         ← Página completa del paciente
        ├── AdminPage.js            ← Panel administrativo
        ├── OdontologoPage.js       ← Panel del odontólogo
        └── RecepcionPage.js        ← Panel de recepción
```

---

## 👥 Usuarios de prueba

| Usuario     | Contraseña | Rol           |
|-------------|-----------|---------------|
| `admin`     | `12345`   | Administrador |
| `doc`       | `12345`   | Odontólogo    |
| `recepcion` | `12345`   | Recepcionista |
| `paciente`  | `12345`   | Paciente demo |

> ⭐ **Registro de pacientes:** Los pacientes nuevos pueden crear su cuenta desde el login con **"Crear cuenta"**. Sus credenciales se guardan en `localStorage` y pueden iniciar sesión normalmente.

---

## ✨ Novedades v3.0 React

- ✅ Proyecto **Create React App** con componentes `.js` separados
- ✅ **Registro de pacientes** desde el login (sin cambiar diseño)
- ✅ Sesión persistente entre recargas (localStorage)
- ✅ Enrutamiento por rol sin React Router (estado puro)
- ✅ Mismo diseño visual que la versión HTML original

---

## 🔧 Scripts disponibles

```bash
npm start    # Servidor de desarrollo
npm build    # Build de producción
npm test     # Pruebas
```

---

**Nova Smile Pro** · GA7-220501096-AA3-EV02 · © 2026
