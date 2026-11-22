# Elite PC Parts

Tienda de comercio electrónico especializada en componentes de PC. Desarrollada con **NestJS**, **PostgreSQL** y frontend en **HTML/CSS/JavaScript** servido por **nginx**. Todo contenerizado con **Docker Compose**.

> Empezó como el proyecto grupal de la Evidencia 4 del curso Desarrollo y Soporte de Aplicaciones Multiplataforma (CERTUS, Grupo 1). Esta versión fue reestructurada por Stephany Tasayco: autenticación con JWT, validación estricta, pedidos con precios del servidor, cierre de XSS, tests unitarios y CI. El proyecto se está renombrando a **Socket Society**.

---

## Servicios

| Servicio | Tecnología | Puerto |
|----------|-----------|--------|
| frontend | nginx:alpine | 80 |
| backend | NestJS (Node.js 22) | 3000 |
| db | PostgreSQL 15 | 5432 |
| pgadmin | pgAdmin 4 | 5050 (solo local) |
| seeder | node:22-alpine | — |

---

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop) 24.0+
- Git
- Node.js 22 (solo para correr los tests o generar el `JWT_SECRET`; la app corre en Docker)

---

## Instalación

```bash
git clone https://github.com/StephanyTasayco/socket-society.git
cd socket-society
```

Crear el archivo `.env` a partir del ejemplo y completar los valores:

```bash
cp .env.example .env
```

Los valores obligatorios son `JWT_SECRET`, `ADMIN_EMAIL` y `ADMIN_PASSWORD`: sin ellos el backend no arranca. Para generar un `JWT_SECRET` seguro:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

La cuenta admin se crea sola al arrancar, con el correo y la contraseña del `.env`. Es la única forma de tener un admin: nadie puede darse ese rol desde la API. El seeder la usa para cargar los productos.

Levantar todos los servicios:

```bash
docker compose up -d --build
```

Sin `MAIL_USER` y `MAIL_PASS` la app funciona, pero no envía correos. Para verificar una cuenta en local se puede leer el token desde la base:

```bash
docker compose exec db psql -U admin -d elitepcparts -c "SELECT * FROM email_verifications ORDER BY id DESC;"
```

y abrir `http://localhost:3000/auth/verificar?token=<token>`.

---

## Acceso

| Recurso | URL |
|---------|-----|
| Tienda web | http://localhost |
| API REST (Swagger, solo en desarrollo) | http://localhost:3000/api |
| pgAdmin (solo desde tu máquina) | http://localhost:5050 |

**pgAdmin:** Email: `admin@admin.com` / Contraseña: `admin` / Contraseña del servidor: `secret`

---

## Funcionalidades

- Catálogo de productos con filtros por categoría y búsqueda
- Carrito de compras sincronizado con la base de datos
- Proceso de pago con **Niubiz Botón de Pago** (sandbox)
- Registro y login con verificación de email y contraseñas hasheadas con **bcrypt**
- PC Builder para armar una PC paso a paso
- Historial de pedidos, lista de deseos y reseñas de productos
- Formulario de contacto

### Tarjeta de prueba (Niubiz Sandbox)

| Campo | Valor |
|-------|-------|
| Número | 4474 1183 5563 2240 |
| Vencimiento | 03/28 |
| CVV | 111 |

---

## Endpoints principales

Las rutas protegidas piden el header `Authorization: Bearer <token>`. El token se obtiene en `/auth/login`.

| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| POST | `/auth/login` | Público | Iniciar sesión (devuelve el token) |
| GET | `/auth/verificar?token=` | Público | Verificar el correo |
| POST | `/auth/reenviar-verificacion` | Público | Reenviar el correo de verificación |
| POST | `/usuarios` | Público | Registrar usuario |
| GET | `/usuarios/me` | Usuario | Mi perfil |
| GET | `/components` | Público | Listar productos |
| POST / DELETE | `/components` | Admin | Crear o borrar productos |
| GET / POST / PATCH / DELETE | `/cart` | Usuario | Mi carrito |
| POST | `/orders` | Usuario | Crear pedido (el total lo calcula el servidor) |
| GET | `/orders/mine` | Usuario | Mis pedidos |
| GET | `/orders/:id` | Dueño o admin | Ver un pedido |
| GET | `/orders` | Admin | Todos los pedidos |
| GET | `/reviews/component/:id` | Público | Reseñas de un producto |
| POST | `/reviews` | Usuario | Crear reseña (1 por producto) |
| GET / POST / DELETE | `/wishlist` | Usuario | Mi lista de deseos |
| POST | `/contacto` | Público | Enviar mensaje de contacto |
| GET | `/contacto` | Admin | Leer mensajes |

---

## Seguridad

- **Autenticación con JWT**: el usuario sale del token firmado, nunca de un id que mande el navegador.
- **Roles** `cliente` y `admin`: las rutas de administración están protegidas con `@Roles('admin')`. Las rutas son privadas por defecto; las públicas se marcan con `@Public()`.
- **Validación estricta**: `ValidationPipe` con `whitelist` y `forbidNonWhitelisted`; todos los endpoints usan DTOs.
- **Precios en el servidor**: el total del pedido se calcula con los precios de la base de datos, dentro de una transacción.
- **Login**: exige correo verificado, no revela qué correos están registrados y tiene límite de 5 intentos por minuto.
- **Verificación de correo**: enlaces de un solo uso que vencen a las 24 horas.
- **Salida segura**: el hash de la contraseña nunca se devuelve; el frontend y los correos escapan el contenido de los usuarios (sin XSS).
- **Configuración**: secretos en `.env`, `helmet`, CORS restringido y Swagger apagado en producción.

### Limitaciones conocidas

- El pago con Niubiz se confirma en el navegador: el pedido se crea al volver a `pago-resultado.html` con `actionCode=000`, sin verificación del backend. Se corrige en la rama `fix/pagos`.
- El PC Builder no valida compatibilidad real (las specs no se guardan en la base). Se corrige en `fix/pc-builder`.

---

## Tests

Tests unitarios con **Jest** de los guards, el login, los pedidos, el registro y la verificación de correo:

```bash
cd backend
npm install
npm test
```

El CI de GitHub Actions corre en cada push y PR a `main`: compila el frontend (job `build`) y compila el backend y corre los tests (job `backend`).

---

## Problemas comunes en Windows

| Problema | Solución |
|----------|----------|
| PowerShell: `npm.ps1 cannot be loaded because running scripts is disabled` | `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` (solo para tu usuario). Alternativa: usar `npm.cmd` |
| El backend se cae en Docker con `bcrypt_lib.node: Exec format error` | Ya está resuelto con `backend/.dockerignore`, que evita copiar el `node_modules` de Windows al contenedor Linux. Si vuelve a pasar, revisa que ese archivo exista |
| `curl` en PowerShell da error rojo con respuestas 400 | En PowerShell `curl` es un alias de `Invoke-WebRequest`. Usa `curl.exe` |
| Una consulta `psql` con `\"` falla con "unterminated quoted identifier" | `\"` es de Bash, no de PowerShell. Usa consultas sin comillas internas o entra a `psql` en modo interactivo (`docker compose exec db psql -U admin -d elitepcparts`) |
| El navegador sigue usando el JavaScript viejo | Recarga con **Ctrl + F5** o marca "Disable cache" en DevTools (F12 → Network) |

---

## Estructura del proyecto

```
socket-society/
├── frontend/
│   ├── index.html
│   └── src/
│       ├── pages/
│       ├── css/
│       └── js/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── usuarios/
│   │   ├── components/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── order_items/
│   │   ├── reviews/
│   │   ├── wishlist/
│   │   ├── contacto/
│   │   ├── email_verifications/
│   │   └── mail/
│   ├── .dockerignore
│   └── Dockerfile
├── .github/workflows/ci.yml
├── infra/
│   └── cloudformation.yml
├── scripts/
├── pgadmin/
├── docker-compose.yml
├── .env.example
└── .env              (no se sube a GitHub)
```

---

## Tecnologías

**Frontend:** HTML5 / CSS3 / JavaScript ES6+ / nginx  
**Backend:** NestJS 11 / TypeORM / Node.js 22 / JWT / class-validator / Nodemailer / Swagger  
**Base de datos:** PostgreSQL 15 / pgAdmin 4  
**Tests y CI:** Jest / GitHub Actions  
**Infraestructura:** Docker / Docker Compose  
**Pagos:** Niubiz Botón de Pago (sandbox)