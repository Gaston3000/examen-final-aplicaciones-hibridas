# World Cup 26 · Sedes Oficiales

Trabajo final de **Aplicaciones Híbridas** — Tecnicatura Superior en Diseño y Programación Web,
Escuela Da Vinci. Alumno: **Gastón Costabella**.

Aplicación full stack para **consultar y administrar las sedes del Mundial 2026**.
Tiene una parte pública (FrontOffice) donde cualquiera puede ver los estadios y su ficha,
y un panel de administración (BackOffice) protegido con JWT y roles, donde un administrador
gestiona estadios, categorías y usuarios.

---

## Tecnologías

**Backend**
- Node.js + Express (API REST)
- MongoDB + Mongoose
- JSON Web Token (JWT) para autenticación
- bcryptjs para encriptar contraseñas
- dotenv para variables de entorno
- cors configurado por variable de entorno

**Frontend**
- React 19 (solo componentes funcionales y hooks)
- React Router (incluye `PrivateRoute`)
- Context API para la sesión
- Vite como bundler
- CSS propio (sin frameworks de UI)

---

## Arquitectura

El proyecto está separado en dos aplicaciones independientes:

```
.
├── backend/     API REST (Express + MongoDB + JWT)
└── frontend/    Aplicación React (FrontOffice + BackOffice)
```

El frontend nunca habla con la base de datos: siempre pasa por la API.
Toda la comunicación HTTP está aislada en `frontend/src/services/`, separada de las vistas.

---

## Entidades

Son tres, relacionadas entre sí:

| Entidad | Descripción | Campos principales |
|---------|-------------|--------------------|
| **Usuario** | Entidad de autenticación | `nombre`, `email` (único), `password` (bcrypt), `rol` (`usuario` \| `admin`), `createdAt`, `updatedAt` |
| **Estadio** | Cada sede del Mundial | `nombre`, `ciudad`, `estado`, `descripcion`, `precio`, `capacidad`, `imagen`, `categoria` (ref), `activo`, timestamps |
| **Categoría** | Agrupa los estadios | `nombre` (único), `descripcion`, `activo`, timestamps |

**Relación:** `Estadio.categoria` es un `ObjectId` con `ref: "Categoria"`, no un texto.
En las consultas se usa `.populate("categoria")` para que el frontend pueda mostrar el nombre.

Una categoría **no se puede eliminar** si tiene estadios asociados: el backend responde `409`
con un mensaje claro y el panel lo muestra en pantalla.

---

## Funcionalidades

### Públicas (FrontOffice)
- Home con hero, categorías y el listado de sedes (el contador sale de `estadios.length`, no está escrito a mano).
- Listado completo de sedes con filtro por categoría (el filtro queda en la URL).
- Ficha de detalle de cada sede (`/estadios/:id`).
- Registro de usuarios e inicio de sesión.
- Perfil del usuario logueado.
- Página 404 y página de acceso denegado.
- Estados de carga, error y "sin datos" en todas las pantallas.

### Administrativas (BackOffice, en `/admin`)
Solo para usuarios con rol `admin`:
- Dashboard con la cantidad real de estadios, categorías y usuarios.
- **CRUD completo de Estadios**: listar, crear, editar, eliminar (con confirmación).
- **CRUD completo de Categorías**: listar, crear, editar, eliminar.
- **CRUD completo de Usuarios**: listar, crear, editar (nombre, email, rol y contraseña opcional), eliminar.
- Menú lateral, botón para volver al sitio público y cierre de sesión.

Protecciones incluidas:
- La contraseña nunca se muestra ni se devuelve desde la API.
- No se puede eliminar la propia cuenta.
- Siempre tiene que quedar al menos un administrador.

---

## Instalación local

Requisitos: **Node.js 20 o superior**. No hace falta instalar MongoDB ni
configurar nada: son tres comandos y anda.

```bash
git clone https://github.com/Gaston3000/examen-final-aplicaciones-hibridas.git
```

```bash
cd examen-final-aplicaciones-hibridas
```

```bash
npm run setup
```

```bash
npm start
```

Después abrir **http://localhost:5173** en el navegador.

- Frontend: http://localhost:5173
- Backend (API): http://localhost:3000

> **Sobre los archivos `.env`:** no vienen en el repositorio (están en `.gitignore`,
> como corresponde). No hacen falta para probar el proyecto en local: sin ellos el
> backend levanta una base MongoDB **en memoria**, carga las sedes de ejemplo y crea
> el administrador de demo, avisándolo por consola. Los datos se pierden al reiniciar
> el servidor, que es justamente lo que se espera de una base en memoria.
>
> Si querés usar una base propia o cambiar las credenciales, copiá los ejemplos:
>
> ```bash
> cp backend/.env.example backend/.env
> cp frontend/.env.example frontend/.env
> ```
>
> En producción `MONGO_URI` y `JWT_SECRET` son obligatorias: sin ellas el servidor
> no arranca, para no trabajar con datos que se borran ni firmar tokens con una
> clave conocida.

### Levantar cada parte por separado

```bash
npm install --prefix backend
npm start --prefix backend
```

```bash
npm install --prefix frontend
npm run dev --prefix frontend
```

---

## Variables de entorno

### `backend/.env`

| Variable | Para qué sirve |
|----------|----------------|
| `PORT` | Puerto de la API (por defecto 3000) |
| `NODE_ENV` | `development` o `production` |
| `MONGO_URI` | Conexión a MongoDB. Obligatoria en producción |
| `JWT_SECRET` | Clave para firmar los tokens. Obligatoria en producción |
| `JWT_EXPIRES_IN` | Duración del token (por ejemplo `4h`) |
| `FRONTEND_URL` | URL(s) del frontend habilitadas para CORS, separadas por coma |
| `ADMIN_NAME` | Nombre del administrador inicial |
| `ADMIN_EMAIL` | Email del administrador inicial |
| `ADMIN_PASSWORD` | Contraseña del administrador inicial |

### `frontend/.env`

| Variable | Para qué sirve |
|----------|----------------|
| `VITE_API_URL` | URL del backend (local o desplegado) |

Los archivos `.env` reales **no se suben** al repositorio (están en `.gitignore`).
En su lugar se incluyen los `.env.example`.

---

## Credenciales de prueba

El seed crea un administrador la primera vez, usando las variables de entorno.
Con el `.env.example` incluido, las credenciales de prueba son:

```
Email:      admin@worldcup26.com
Contraseña: admin123456
```

> Son credenciales **de ejemplo, solo para desarrollo y para la corrección**.
> Antes de desplegar hay que cambiar `ADMIN_PASSWORD` por una contraseña propia.

Para probar el rol `usuario` alcanza con registrarse desde `/registro`:
el registro público siempre crea cuentas con rol `usuario`.

---

## Endpoints principales

Base: `/api`

### Usuarios
| Método | Ruta | Acceso |
|--------|------|--------|
| POST | `/api/usuarios/registro` | Público |
| POST | `/api/usuarios/login` | Público |
| GET | `/api/usuarios/perfil` | Token |
| GET | `/api/usuarios` | Admin |
| POST | `/api/usuarios` | Admin |
| GET | `/api/usuarios/:id` | Admin |
| PUT | `/api/usuarios/:id` | Admin |
| DELETE | `/api/usuarios/:id` | Admin |

### Estadios
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/api/estadios` | Público |
| GET | `/api/estadios/:id` | Público |
| POST | `/api/estadios` | Admin |
| PUT | `/api/estadios/:id` | Admin |
| DELETE | `/api/estadios/:id` | Admin |

### Categorías
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/api/categorias` | Público |
| GET | `/api/categorias/:id` | Público |
| POST | `/api/categorias` | Admin |
| PUT | `/api/categorias/:id` | Admin |
| DELETE | `/api/categorias/:id` | Admin |

Códigos usados: `200`, `201`, `400`, `401`, `403`, `404`, `409`, `500`.

---

## Cómo funciona la autenticación (JWT)

1. El usuario se registra o inicia sesión. La contraseña se guarda hasheada con **bcrypt**
   y nunca se devuelve (el campo tiene `select: false` en el modelo).
2. Si las credenciales son correctas, el backend firma un **JWT** con `{ id, email, rol }`
   usando `JWT_SECRET`, con vencimiento.
3. El frontend guarda el token y el usuario en `localStorage` y actualiza el **AuthContext**,
   que es el estado global de la sesión.
4. En cada pedido protegido, el servicio central agrega el header
   `Authorization: Bearer <token>`.
5. En el backend, el middleware `verificarToken` valida el token y deja los datos en
   `req.usuario`. El middleware `soloAdmin` además exige `rol === "admin"`.
6. Si el token vence o es inválido, la API responde `401`, el frontend cierra la sesión
   automáticamente y redirige al login con un mensaje.

### Qué hace `PrivateRoute`

`PrivateRoute` es un componente que envuelve a las páginas que necesitan sesión:

- Mientras se comprueba el token guardado, muestra "Verificando sesión".
- Si no hay sesión, redirige a `/login` (y recuerda a dónde se quería entrar).
- Con la prop `soloAdministradores` (que usa `AdminRoute`), si el usuario no es admin
  lo manda a `/acceso-denegado`.

**Importante:** esto protege la interfaz. La seguridad real está en el backend, que valida
el token y el rol en cada endpoint. Aunque alguien fuerce la ruta en el navegador,
la API responde `401` o `403`.

---

## Estructura de carpetas

```
.
├── package.json                 scripts para levantar todo junto
├── README.md
├── docs/
│   ├── CHECKLIST-FINAL.md       dónde se cumple cada punto de la consigna
│   └── DEPLOY.md                pasos para publicar el sitio
│
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── public/index.html        página informativa de la API (ruta /)
│   ├── scripts/
│   │   └── test-api.js          pruebas automáticas de la API
│   └── src/
│       ├── index.js             servidor, CORS y middlewares
│       ├── seed.js              datos iniciales (categorías, estadios y admin)
│       ├── config/
│       │   └── db.js            conexión a MongoDB
│       ├── models/              esquemas de Mongoose
│       │   ├── usuarioModel.js
│       │   ├── estadioModel.js
│       │   └── categoriaModel.js
│       ├── controllers/         lógica de cada recurso
│       │   ├── usuarioController.js
│       │   ├── estadioController.js
│       │   └── categoriaController.js
│       ├── middlewares/
│       │   ├── auth.js          verificarToken y soloAdmin
│       │   └── errorHandler.js  manejo central de errores + 404
│       └── routes/              definición de las URI
│           ├── usuarioRoutes.js
│           ├── estadioRoutes.js
│           └── categoriaRoutes.js
│
└── frontend/
    ├── .env.example
    ├── vercel.json              redirección para que funcionen las rutas de React
    ├── public/estadios/         fotos de las sedes
    └── src/
        ├── main.jsx             monta la app dentro del AuthProvider
        ├── App.jsx              todas las rutas
        ├── index.css            variables de color y tipografías
        ├── App.css              estilos del sitio público
        ├── admin.css            estilos del BackOffice
        ├── context/
        │   ├── AuthContext.js
        │   └── AuthProvider.jsx estado global de la sesión
        ├── hooks/
        │   ├── useAuth.js
        │   └── useCargarDatos.js
        ├── services/            toda la comunicación con la API
        │   ├── api.js           función central request()
        │   ├── authService.js
        │   ├── estadioService.js
        │   ├── categoriaService.js
        │   └── usuarioService.js
        ├── utils/formato.js
        ├── components/
        │   ├── Navbar.jsx  Footer.jsx  Input.jsx  TarjetaEstadio.jsx
        │   ├── PrivateRoute.jsx  AdminRoute.jsx  LayoutPublico.jsx
        │   ├── Loading.jsx  ErrorMessage.jsx  EmptyState.jsx  ConfirmDialog.jsx
        │   └── admin/
        │       ├── AdminLayout.jsx  AdminTable.jsx
        │       └── FormularioEstadio.jsx  FormularioCategoria.jsx  FormularioUsuario.jsx
        └── pages/
            ├── Home.jsx  Estadios.jsx  Detail.jsx
            ├── Login.jsx  Register.jsx  Perfil.jsx
            ├── NotFound.jsx  AccesoDenegado.jsx
            └── admin/
                ├── Dashboard.jsx
                ├── AdminEstadios.jsx  AdminEstadioForm.jsx
                ├── AdminCategorias.jsx  AdminCategoriaForm.jsx
                └── AdminUsuarios.jsx  AdminUsuarioForm.jsx
```

---

## Pruebas

### Backend

Con el servidor corriendo en una terminal:

```bash
npm run test:api --prefix backend
```

Recorre 58 verificaciones: registro, login correcto e incorrecto, token ausente,
token inválido, un usuario común intentando administrar, el admin en rutas protegidas,
el CRUD de las tres entidades, IDs inválidos, validaciones, recursos inexistentes
y la categoría con estadios asociados.

### Frontend

```bash
npm run lint --prefix frontend
npm run build --prefix frontend
```

---

## Deploy

Los pasos completos están en [docs/DEPLOY.md](docs/DEPLOY.md).

Resumen: **MongoDB Atlas** para la base, **Render** para el backend y **Vercel** para el frontend.
El proyecto ya está preparado: el servidor escucha en `process.env.PORT`, el CORS se configura
por variable de entorno, la URL de la API sale de `VITE_API_URL` y `vercel.json` hace que las
rutas de React funcionen al recargar la página.

**URLs desplegadas:** _pendientes de publicar_ (ver `docs/DEPLOY.md`).

---

## Aclaraciones sobre la entrega

- **No se incluye `node_modules`**. Hay que correr `npm run setup` (o `npm install` en cada carpeta).
- **No se incluyen archivos `.env`** ni ningún secreto. Se incluyen los `.env.example`.
- **No se incluye la carpeta `dist`**: se genera con `npm run build`.
- Las fotos de los estadios son de Wikimedia Commons con licencias libres
  (ver `frontend/public/estadios/CREDITS.txt`), usadas con fines académicos.
