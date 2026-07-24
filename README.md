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

Crear archivo `.env` en la raíz:

```env
MAIL_USER=tucorreo@gmail.com
MAIL_PASS=contraseña_de_aplicacion_gmail
MAIL_TO=tucorreo@gmail.com
```

Levantar todos los servicios:

```bash
docker compose up -d --build
```

---

## Acceso

| Recurso | URL |
|---------|-----|
| Tienda web | http://localhost |
| API REST (Swagger) | http://localhost:3000/api |
| pgAdmin | http://localhost:5050 |

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

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Iniciar sesión |
| POST | `/usuarios` | Registrar usuario |
| GET | `/components` | Listar productos |
| GET | `/cart` | Ver carrito (header: usuario-id) |
| POST | `/cart` | Agregar al carrito |
| POST | `/orders` | Crear pedido |
| GET | `/orders/usuario/:id` | Historial de pedidos |
| POST | `/reviews` | Crear reseña |
| GET | `/wishlist/usuario/:id` | Lista de deseos |
| POST | `/contacto` | Enviar mensaje de contacto |

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
