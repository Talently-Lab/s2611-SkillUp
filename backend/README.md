# ⚙️ Backend API REST (Node.js + Express)

Servidor backend encargado de la lógica de negocio, persistencia de datos, autenticación y seguridad para **SkillUp Campus**.

## Requisitos

- Node.js 24 LTS y npm.
- PostgreSQL 17, local o remoto.
- Acceso a una base de datos con el esquema de SkillUp ya creado.

> El repositorio no incluye scripts de migración ni de creación del esquema. Antes de iniciar la API, configura `DATABASE_URL` para una base de datos que ya tenga las tablas requeridas.

## Setup local

1. Desde la raíz del repositorio, entra al backend e instala sus dependencias:

   ```powershell
   cd backend
   npm install
   ```

2. Crea el archivo local de variables de entorno a partir del ejemplo:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Edita `backend/.env` y configura los valores correspondientes:

   ```env
   PORT=4000
   DATABASE_URL=<URL_de_conexion_de_PostgreSQL>
   JWT_SECRET=una_clave_local_larga_y_aleatoria
   JWT_EXPIRES_IN=24h
   FRONTEND_URL=http://localhost:5173
   ```

   Crea previamente la base `skillup_db` en PostgreSQL o reemplaza la URL por la de tu instancia. No compartas ni subas el archivo `.env`.

4. Inicia el servidor en modo desarrollo:

   ```powershell
   npm run dev
   ```

   Para iniciarlo sin reinicio automático, usa `npm start`.

5. Comprueba que la API responde en [http://localhost:4000/api/health](http://localhost:4000/api/health). El endpoint `/api/salud-db` permite comprobar además la conexión con PostgreSQL.

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto HTTP de la API (por defecto, `4000`). |
| `DATABASE_URL` | URL de conexión de PostgreSQL. |
| `JWT_SECRET` | Clave para firmar y verificar los tokens JWT. |
| `JWT_EXPIRES_IN` | Vigencia de los tokens (por defecto, `24h`). |
| `FRONTEND_URL` | Origen del frontend permitido por CORS (en local, `http://localhost:5173`). |

## Responsabilidades

- Gestión de usuarios y sesiones (alumnos y administradores).
- CRUD de cursos y publicación del catálogo.
- Gestión de inscripciones a cursos.