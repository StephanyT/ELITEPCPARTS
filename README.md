# Elite PC Parts

Tienda de comercio electrónico especializada en componentes de PC. Desarrollada con **NestJS**, **PostgreSQL** y frontend en **HTML/CSS/JavaScript** servido por **nginx**. Todo contenerizado con **Docker Compose**.

---

## Servicios

| Servicio | Tecnología | Puerto |
|----------|-----------|--------|
| frontend | nginx:alpine | 80 |
| backend | NestJS (Node.js 18) | 3000 |
| db | PostgreSQL 15 | 5432 |
| pgadmin | pgAdmin 4 | 5050 |
| seeder | node:alpine | — |

---

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop) 24.0+
- Git

> No se necesita instalar Node.js ni PostgreSQL.

---

## Instalación

```bash
git clone https://github.com/[usuario]/elitepcparts.git
cd elitepcparts
```

Crear el archivo `.env` a partir del ejemplo y completar los valores:

```bash
cp .env.example .env
```

Los valores obligatorios son `JWT_SECRET`, `ADMIN_EMAIL` y `ADMIN_PASSWORD`: sin ellos el backend no arranca. Para generar un `JWT_SECRET` seguro:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

La cuenta admin se crea sola al arrancar, con el correo y la contraseña del `.env`. El seeder la usa para cargar los productos.

Levantar todos los servicios:

```bash
docker compose up -d --build
```

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
| POST | `/auth/reenviar-verificacion` | Público | Reenviar el correo de verificación |
| POST | `/usuarios` | Público | Registrar usuario |
| GET | `/usuarios/me` | Usuario | Mi perfil |
| GET | `/components` | Público | Listar productos |
| POST / DELETE | `/components` | Admin | Crear o borrar productos |
| GET / POST / PATCH / DELETE | `/cart` | Usuario | Mi carrito |
| POST | `/orders` | Usuario | Crear pedido (el total lo calcula el servidor) |
| GET | `/orders/mine` | Usuario | Mis pedidos |
| GET | `/orders` | Admin | Todos los pedidos |
| GET | `/reviews/component/:id` | Público | Reseñas de un producto |
| POST | `/reviews` | Usuario | Crear reseña (1 por producto) |
| GET / POST / DELETE | `/wishlist` | Usuario | Mi lista de deseos |
| POST | `/contacto` | Público | Enviar mensaje de contacto |
| GET | `/contacto` | Admin | Leer mensajes |

---

## Seguridad

- **Autenticación con JWT**: el usuario sale del token firmado, nunca de un id que mande el navegador.
- **Roles** `cliente` y `admin`: las rutas de administración están protegidas con `@Roles('admin')`.
- **Validación estricta**: `ValidationPipe` con `whitelist` y `forbidNonWhitelisted`; todos los endpoints usan DTOs.
- **Precios en el servidor**: el total del pedido se calcula con los precios de la base de datos, dentro de una transacción.
- **Login**: exige correo verificado y tiene límite de 5 intentos por minuto.
- **Salida segura**: el hash de la contraseña nunca se devuelve y el frontend escapa el contenido de los usuarios (sin XSS).
- **Configuración**: secretos en `.env`, `helmet`, CORS restringido y Swagger apagado en producción.

---

## Estructura del proyecto

```
ELITEPCPARTS/
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
│   └── Dockerfile
├── infra/
│   └── cloudformation.yml
├── scripts/
├── pgadmin/
├── docker-compose.yml
└── .env
```

---

## Tecnologías

**Frontend:** HTML5 / CSS3 / JavaScript ES6+ / nginx  
**Backend:** NestJS / TypeORM / Node.js 18 / Nodemailer / Swagger  
**Base de datos:** PostgreSQL 15 / pgAdmin 4  
**Infraestructura:** Docker / Docker Compose / AWS S3 + CloudFront / GitHub Actions  
**Pagos:** Niubiz Botón de Pago  

---

Proyecto desarrollado para la Evidencia 4 — Curso Desarrollo y Soporte de Aplicaciones Multiplataforma · Grupo 1
