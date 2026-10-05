# TaskFlow API

API REST de gestión de tareas en equipo, construida con **Node.js, Express y MongoDB (Mongoose)** y conectada a **MongoDB Atlas**. Administra tres recursos: **Usuarios, Equipos y Tareas**, con la misma estructura de datos que usa el frontend TaskFlow del curso de React.

## Arquitectura

El proyecto está organizado en capas:

```
taskflow-api/
├── server.js               # Punto de entrada: conecta MongoDB y levanta Express
├── app.js                  # Configura Express, rutas y middleware de errores
├── config/
│   └── db.js               # Conexión única a MongoDB (dbName, maxPoolSize)
├── models/                 # Esquemas de Mongoose (validaciones + relaciones ref)
│   ├── Team.js
│   ├── User.js
│   └── Task.js
├── controllers/            # Lógica de negocio, una función por endpoint
│   ├── teamController.js
│   ├── userController.js
│   └── taskController.js
├── routes/                 # Definen endpoints y método HTTP de cada uno
│   ├── teamRoutes.js
│   ├── userRoutes.js
│   └── taskRoutes.js
├── middleware/
│   ├── errorMiddleware.js  # Manejo de errores centralizado (formato consistente)
│   └── catchAsync.js       # Envuelve controladores async y envía errores a next()
├── scripts/
│   └── seed.js             # Datos de ejemplo (npm run seed)
├── requests.http           # Colección de pruebas (Thunder Client / REST Client)
├── .env.example            # Plantilla de variables de entorno (sin credenciales)
└── .gitignore              # Ignora .env y node_modules
```

**Recorrido de una petición:** `routes/` (define el endpoint) → `controllers/` (lógica) → `models/` (esquema Mongoose) → **MongoDB Atlas**.

## Instalación y ejecución

Requisitos: Node.js 18+ y una base de datos en MongoDB Atlas (o local).

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/taskflow-api.git
cd taskflow-api

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env y coloca MONGO_URI real de Atlas

# 4. (Opcional) Cargar datos de ejemplo
npm run seed

# 5. Levantar el servidor
npm run dev
```

La API queda disponible en `http://localhost:3000/api`.

## Variables de entorno

Crear un archivo `.env` en la raíz (está en `.gitignore`, **nunca se sube a GitHub**):

| Variable      | Descripción                                   | Ejemplo |
|---------------|-----------------------------------------------|---------|
| `PORT`        | Puerto del servidor                           | `3000`  |
| `MONGO_URI`   | Cadena de conexión de MongoDB Atlas           | `mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/` |
| `MONGO_DB_NAME` | Nombre de la base de datos                  | `taskflow_api` |

La conexión se realiza **una sola vez** al iniciar el servidor, con `dbName` y un pool de conexiones (`maxPoolSize: 10`).

## Endpoints

Todos los recursos comparten el mismo formato de respuesta: `{ success, message?, data? }` y los mismos códigos de error (ver sección de errores).

### Equipos — `/api/teams`

| Método | Ruta | Descripción | Código éxito |
|---|---|---|---|
| GET | `/api/teams` | Listar equipos | 200 |
| GET | `/api/teams/:id` | Obtener un equipo (con miembros) | 200 |
| POST | `/api/teams` | Crear equipo | 201 |
| PUT | `/api/teams/:id` | Actualizar equipo | 200 |
| DELETE | `/api/teams/:id` | Eliminar equipo | 200 |
| GET | `/api/teams/:id/stats` | **Agregación**: tareas por estado | 200 |

### Usuarios — `/api/users`

| Método | Ruta | Descripción | Código éxito |
|---|---|---|---|
| GET | `/api/users` | Listar usuarios (con su equipo) | 200 |
| GET | `/api/users/:id` | Obtener un usuario | 200 |
| POST | `/api/users` | Crear usuario | 201 |
| PUT | `/api/users/:id` | Actualizar usuario | 200 |
| DELETE | `/api/users/:id` | Eliminar usuario | 200 |

Body de ejemplo:

```json
{
  "name": "Carlos Pérez",
  "email": "carlos@taskflow.com",
  "role": "developer",
  "teamId": "ID_DEL_EQUIPO"
}
```

### Tareas — `/api/tasks`

| Método | Ruta | Descripción | Código éxito |
|---|---|---|---|
| GET | `/api/tasks` | Listar con filtros, orden y paginación | 200 |
| GET | `/api/tasks/:id` | Obtener una tarea | 200 |
| POST | `/api/tasks` | Crear tarea | 201 |
| PUT | `/api/tasks/:id` | Actualizar tarea | 200 |
| DELETE | `/api/tasks/:id` | Eliminar tarea | 200 |

Body de ejemplo:

```json
{
  "title": "Implementar autenticación JWT",
  "status": "in-progress",
  "priority": 5,
  "teamId": "ID_DEL_EQUIPO",
  "assignedTo": "ID_DEL_USUARIO"
}
```

**Consulta avanzada (filtros + orden + paginación):**

```
GET /api/tasks?status=todo&priority=5&sort=-priority&page=1&limit=10
```

- Filtros: `status`, `priority`, `teamId`, `assignedTo`
- Orden: `sort=-priority` (descendente) o `sort=createdAt` (ascendente)
- Paginación: `page` y `limit` (la respuesta incluye objeto `pagination` con total, página y totalPages)

**Agregación (Pipeline):**

```
GET /api/teams/:id/stats
```

Devuelve la cantidad de tareas agrupadas por estado del equipo (`$match` → `$group` → `$sort` → `$project`).

## Manejo de errores

Middleware centralizado (`middleware/errorMiddleware.js`) que responde siempre con el formato:

```json
{ "success": false, "message": "...", "errors": ["..."] }
```

| Código | Cuándo |
|---|---|
| 400 | Datos inválidos (validación de esquema, enum, min/max, match) o id de Mongo inválido |
| 404 | Recurso no existe o ruta no encontrada |
| 409 | Registro duplicado (email repetido, nombre de equipo repetido → `E11000`) |
| 500 | Errores inesperados del servidor |

## Pruebas

El archivo `requests.http` contiene un ejemplo por endpoint (éxitos y errores). Ábrelo con la extensión **Thunder Client** (VS Code) o **REST Client**.

Flujo mínimo para el video/demo:

1. `POST /api/teams` → crear equipo
2. `POST /api/users` → crear usuario en ese equipo (reusar el `teamId`)
3. `POST /api/tasks` → crear 2–3 tareas
4. `GET /api/tasks?status=todo&sort=-priority&page=1&limit=10` → consulta avanzada
5. `GET /api/teams/:id/stats` → agregación
6. `PUT /api/tasks/:id` con `{"status":"done"}` → marca tarea terminada (llena `completedAt`)
7. `DELETE /api/tasks/:id` → eliminar una tarea
8. Provocar un 400 (estado inválido) y un 409 (email duplicado)
