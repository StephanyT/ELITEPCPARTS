# Elite PC Parts

Tienda en línea de componentes para PC. Backend en **NestJS**, base de datos **PostgreSQL** y frontend servido con **Nginx**. Todo el proyecto se ejecuta mediante **Docker Compose**.

---

# Arquitectura

El proyecto está compuesto por tres contenedores Docker:

| Contenedor | Tecnología | Puerto | Descripción |
|------------|------------|--------|-------------|
| **frontend** | Nginx | 80 | Sirve la aplicación web. |
| **backend** | NestJS (Node.js) | 3000 | API REST y lógica de negocio. |
| **db** | PostgreSQL 15 | Interno | Base de datos del sistema. |

El frontend consume el backend mediante:

```text
http://localhost:3000
```

La base de datos **no expone un puerto público** y solo es accesible desde la red interna de Docker.

---

# Requisitos

Antes de ejecutar el proyecto solo necesitas instalar:

- Docker Desktop

> **No es necesario instalar Node.js ni PostgreSQL.**

---

# Cómo ejecutar el proyecto

Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/ELITEPCPARTS-main.git
```

Ingresa al proyecto:

```bash
cd ELITEPCPARTS-main
```

Levanta todos los servicios:

```bash
docker compose up
```

---

# Acceso al proyecto

Una vez iniciados los contenedores podrás acceder a:

| Servicio | URL |
|----------|-----|
| Sitio web | http://localhost |
| Swagger API | http://localhost:3000/api |

---

# Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/login` | Iniciar sesión |
| POST | `/usuarios` | Registrar usuario |
| GET | `/usuarios` | Listar usuarios |
| GET | `/components` | Listar componentes |
| POST | `/orders` | Crear orden |
| GET | `/cart` | Ver carrito |
| GET | `/reviews` | Ver reseñas |

---

# Tecnologías utilizadas

## Backend

- NestJS
- TypeORM
- PostgreSQL
- Swagger
- class-validator

## Frontend

- HTML
- CSS
- JavaScript (Vanilla)
- Nginx

## Infraestructura

- Docker
- Docker Compose

---

# Variables de entorno

Las variables están definidas en el archivo **docker-compose.yml**.

```env
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=elitepcparts
```

---

# Estructura del proyecto

```text
ELITEPCPARTS-main/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── usuarios/
│   │   ├── components/
│   │   ├── orders/
│   │   ├── cart/
│   │   ├── reviews/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   └── logger.middleware.ts
│   └── Dockerfile
├── src/
│   ├── pages/
│   └── js/
│       └── auth.js
└── docker-compose.yml
```

---

# Cambios realizados (Evidencia 3)

- Migración de Firebase a **NestJS + PostgreSQL**.
- El inicio de sesión y registro ahora utilizan un backend propio.
- La información se almacena en PostgreSQL mediante TypeORM.
- Se implementó un middleware de **Logger** para registrar todas las peticiones HTTP.
- Todo el sistema fue dockerizado utilizando **Docker Compose** para facilitar su despliegue.

---

# Flujo de la aplicación

```text
Usuario
   │
   ▼
Frontend (Nginx)
   │
   ▼
Backend (NestJS)
   │
   ▼
PostgreSQL
```

---

# Autor

Proyecto desarrollado para la Evidencia 3 del curso de Desarrollo y Soporte de Aplicaciones Multiplataforma.
