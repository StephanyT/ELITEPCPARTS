**Elite PC Parts **

Tienda en línea de componentes para PC. Proyecto desarrollado con frontend estático, backend en NestJS y base de datos PostgreSQL, todo dockerizado.


**Arquitectura**

El proyecto corre en 3 contenedores Docker:

ContenedorTecnologíaPuertofrontendnginxpuerto 80 (localhost)backendNestJS (Node.js)puerto 3000dbPostgreSQL 15interno

El frontend consume el backend por http://localhost:3000. La base de datos no tiene puerto público — solo el backend puede acceder a ella.


**Requisitos**


Docker Desktop


No necesitas instalar Node.js ni PostgreSQL — Docker se encarga de todo.


**Cómo correr el proyecto**

bashgit clone https://github.com/tu-usuario/ELITEPCPARTS-main.git
cd ELITEPCPARTS-main
docker compose up

Eso levanta los 3 contenedores automáticamente.

URLDescripciónhttp://localhostSitio web (frontend)http://localhost:3000/apiDocumentación Swagger de la API


**Documentación de la API**

La API está documentada con Swagger en http://localhost:3000/api.

Endpoints principales:


POST /auth/login — Iniciar sesión
POST /usuarios — Registrar usuario
GET /usuarios — Listar usuarios
GET /components — Listar componentes
POST /orders — Crear orden
GET /cart — Ver carrito
GET /reviews — Ver reseñas



**Tecnologías**

Backend


NestJS — framework de Node.js
TypeORM — ORM para conectar con PostgreSQL sin escribir SQL
PostgreSQL — base de datos relacional
Swagger — documentación automática de la API
class-validator — validación de datos en los DTOs


**Frontend**


HTML, CSS, JavaScript vanilla
nginx — servidor web dentro del contenedor


**Infraestructura**


Docker + Docker Compose — contenedores para backend, BD y frontend



**Estructura del proyecto**

ELITEPCPARTS-main/
├── backend/
│   ├── src/
│   │   ├── auth/           # Módulo de autenticación
│   │   ├── usuarios/       # Módulo de usuarios
│   │   ├── components/     # Módulo de componentes
│   │   ├── orders/         # Módulo de órdenes
│   │   ├── cart/           # Módulo de carrito
│   │   ├── reviews/        # Módulo de reseñas
│   │   ├── app.module.ts   # Configuración principal y conexión a PostgreSQL
│   │   ├── main.ts         # Punto de entrada del servidor
│   │   └── logger.middleware.ts  # Middleware que loguea cada petición
│   └── Dockerfile
├── src/
│   ├── pages/              # Páginas HTML
│   └── js/
│       └── auth.js         # Lógica de login y registro (conecta con el backend)
└── docker-compose.yml      # Orquestación de los 3 contenedores


**Variables de entorno**

Definidas en docker-compose.yml:

DB_HOST=db

DB_PORT=5432

DB_USER=postgres

DB_PASS=postgres

DB_NAME=elitepcparts


**Evidencia 3 — Cambios principales**


Migración de Firebase a NestJS + PostgreSQL
Login y registro ahora van al backend propio en vez de Firebase Authentication
Los datos se guardan en PostgreSQL en vez de Firebase Firestore
Se agregó middleware de logger para registrar cada petición en consola
Todo dockerizado con docker-compose
