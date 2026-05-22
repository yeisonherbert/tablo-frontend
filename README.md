# Tablo — Frontend

Interfaz web de **Tablo**, un clon de Trello. Tablero Kanban con drag-and-drop,
autenticación por correo Gmail (login simulado con JWT) y consumo de una API REST.

## Stack

- **Vue 3** (Composition API + `<script setup>`)
- **Vite** (dev server y build)
- **TailwindCSS v4** (estilos, vía plugin oficial de Vite)
- **Pinia** (estado global: sesión + tablero, JWT persistido en `localStorage`)
- **Vue Router 4** (rutas protegidas)
- **Axios** (cliente HTTP con interceptor que inyecta `Authorization: Bearer <token>`)
- **vuedraggable** (drag-and-drop de tarjetas entre columnas)

## Estructura del proyecto

```
src/
├── main.js                  # Bootstrap: Pinia + Router
├── App.vue                  # <RouterView />
├── style.css                # @import "tailwindcss"
├── router/index.js          # Rutas + guard de autenticación
├── services/
│   ├── http.js              # Instancia Axios + interceptores (JWT / 401)
│   └── api.js               # Wrappers de los endpoints REST
├── stores/
│   ├── auth.js              # Sesión: login, logout, JWT en localStorage
│   └── board.js             # Proyectos, columnas y tareas (Kanban)
├── views/
│   ├── LoginView.vue        # Formulario de login (solo email @gmail.com)
│   └── BoardView.vue        # Tablero: 4 columnas + alta de tareas
└── components/
    ├── BoardColumn.vue      # Columna con zona draggable
    └── TaskCard.vue         # Tarjeta de tarea
```

## Variables de entorno

Crea un archivo `.env` (puedes copiar `.env.example`):

```env
VITE_API_BASE_URL=https://api-tablo.antana.com.pe
```

> Vite "hornea" las variables `VITE_*` en el bundle **en tiempo de build**.
> Si cambias la URL de la API, hay que reconstruir.

---

## Requisitos previos

- **Node.js 20 o superior** (recomendado 22 LTS) y **npm**.
- Verifica con: `node -v` y `npm -v`.

---

## Cómo iniciar el proyecto

Los comandos de npm son **los mismos en todos los sistemas operativos**. Lo único
que cambia es cómo abres la terminal y cómo se definen variables de entorno puntuales.

### macOS

```bash
# 1. Clonar e instalar
git clone <URL_DEL_REPO> tablo-frontend
cd tablo-frontend
npm install

# 2. Configurar entorno
cp .env.example .env

# 3. Levantar en modo desarrollo (http://localhost:5173)
npm run dev

# 4. Build de producción + previsualización
npm run build
npm run preview
```

### Linux

```bash
# 1. Clonar e instalar
git clone <URL_DEL_REPO> tablo-frontend
cd tablo-frontend
npm install

# 2. Configurar entorno
cp .env.example .env

# 3. Desarrollo
npm run dev

# 4. Producción
npm run build
npm run preview
```

> En Debian/Ubuntu, si no tienes Node 20+: usa [nvm](https://github.com/nvm-sh/nvm)
> (`nvm install 22 && nvm use 22`) o NodeSource.

### Windows

**PowerShell** (recomendado):

```powershell
# 1. Clonar e instalar
git clone <URL_DEL_REPO> tablo-frontend
cd tablo-frontend
npm install

# 2. Configurar entorno
Copy-Item .env.example .env

# 3. Desarrollo
npm run dev

# 4. Producción
npm run build
npm run preview
```

**CMD (símbolo del sistema):**

```cmd
git clone <URL_DEL_REPO> tablo-frontend
cd tablo-frontend
npm install
copy .env.example .env
npm run dev
```

> Si usas **WSL2**, sigue las instrucciones de **Linux** dentro de la distro.

### Docker

Hay un `Dockerfile` multi-stage (build con Node → sirve con Nginx) y un
`docker-compose.yml`.

**Con docker compose (lo más simple):**

```bash
# Construye y levanta en http://localhost:8080
docker compose up --build

# En segundo plano
docker compose up --build -d

# Detener
docker compose down
```

**Con Docker "a mano":**

```bash
# Build (puedes inyectar la URL de la API)
docker build \
  --build-arg VITE_API_BASE_URL=https://api-tablo.antana.com.pe \
  -t tablo-frontend:latest .

# Run -> http://localhost:8080
docker run --rm -p 8080:80 tablo-frontend:latest
```

---

## Funcionamiento

1. **Login** (`/login`): el usuario escribe su correo `@gmail.com`. Se hace
   `POST /auth/login` con `{ email }`; el backend devuelve un JWT que se guarda
   en Pinia y en `localStorage`.
2. **Interceptor**: cada petición Axios añade automáticamente
   `Authorization: Bearer <token>`. Un `401` cierra sesión y redirige al login.
3. **Tablero** (`/`): se cargan los proyectos (`GET /projects`) y el detalle del
   primero (`GET /projects/{id}`). Las tareas se reparten en 4 columnas:
   **Backlog · To Do · In Progress · Completed**.
4. **Drag-and-drop**: al soltar una tarjeta en otra columna, la UI se actualiza
   al instante (vuedraggable) y se dispara `PATCH /tasks/{id}` con el nuevo
   `status` de forma asíncrona. Si el PATCH falla, se recarga el proyecto para
   re-sincronizar.

### Endpoints consumidos

| Método | Ruta                          | Uso                                  |
|--------|-------------------------------|--------------------------------------|
| POST   | `/auth/login`                 | Login simulado, devuelve JWT         |
| GET    | `/projects`                   | Lista proyectos del usuario          |
| POST   | `/projects`                   | Crear proyecto                       |
| GET    | `/projects/{id}`              | Detalle + participantes + tareas     |
| POST   | `/projects/{id}/members`      | Añadir participante por email        |
| POST   | `/projects/{id}/tasks`        | Crear tarea (nace en `backlog`)      |
| PATCH  | `/tasks/{id}`                 | Actualizar `status` de la tarea      |
| PUT    | `/tasks/{id}/details`         | Editar título y descripción          |
| DELETE | `/tasks/{id}`                 | Eliminar la tarea                    |

---

## Despliegue en AWS (Vue 3 / SPA)

El proyecto compila a archivos estáticos (`dist/`). Tienes tres caminos:

- **Opción A — S3 público (website hosting):** rápido, ideal para pruebas/demos. Solo HTTP.
- **Opción B — S3 + CloudFront:** recomendado para producción. HTTPS + CDN + bucket privado.
- **Opción C — Contenedor Docker:** si prefieres servir desde Nginx.

### Opción A — S3 público con website hosting (rápido, para pruebas)

Sirve el `dist/` directamente desde un bucket S3 público. Es el camino más
rápido para validar el sitio en internet (⚠️ solo **HTTP**, sin HTTPS).

**1. Compilar el sitio**

```bash
npm install
npm run build      # genera la carpeta dist/
```

**2. Crear el bucket (una sola vez)**

```bash
aws s3 mb s3://tablo-frontend-prod --region us-east-1
```

**3. Hacer el bucket público (una sola vez)**

```bash
# Desactivar el bloqueo de acceso público
aws s3api put-public-access-block \
  --bucket tablo-frontend-prod \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Aplicar política de lectura pública (usa bucket-policy-public.json del repo)
aws s3api put-bucket-policy \
  --bucket tablo-frontend-prod \
  --policy file://bucket-policy-public.json

# Habilitar website hosting con fallback a index.html (SPA routing)
aws s3 website s3://tablo-frontend-prod \
  --index-document index.html \
  --error-document index.html
```

> Contenido de `bucket-policy-public.json`:
>
> ```json
> {
>   "Version": "2012-10-17",
>   "Statement": [
>     {
>       "Sid": "PublicReadGetObject",
>       "Effect": "Allow",
>       "Principal": "*",
>       "Action": "s3:GetObject",
>       "Resource": "arn:aws:s3:::tablo-frontend-prod/*"
>     }
>   ]
> }
> ```

**4. Subir el contenido**

```bash
# Assets con hash -> cache largo
aws s3 sync dist/ s3://tablo-frontend-prod \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html"

# index.html -> sin cache (para que siempre tome la última versión)
aws s3 cp dist/index.html s3://tablo-frontend-prod/index.html \
  --cache-control "no-cache"
```

**5. Abrir el sitio**

- App (SPA, endpoint de website): `http://tablo-frontend-prod.s3-website-us-east-1.amazonaws.com`
- Archivo directo (HTTPS): `https://tablo-frontend-prod.s3.us-east-1.amazonaws.com/index.html`

**Desplegar una actualización** (tras hacer cambios):

```bash
npm run build && \
aws s3 sync dist/ s3://tablo-frontend-prod --delete \
  --cache-control "public, max-age=31536000, immutable" --exclude "index.html" && \
aws s3 cp dist/index.html s3://tablo-frontend-prod/index.html --cache-control "no-cache"
```

> Los pasos 2 y 3 son de una sola vez. Para actualizar, basta `npm run build`
> + las dos líneas de subida (el comando de arriba ya las combina).

### Opción B — S3 + CloudFront (estático, recomendado)

Sirve el `dist/` desde un bucket S3 detrás de CloudFront (HTTPS + CDN global).

**1. Compilar el sitio**

```bash
npm install
npm run build      # genera la carpeta dist/
```

**2. Crear el bucket S3**

```bash
aws s3 mb s3://tablo-frontend-prod --region us-east-1
```

**3. Subir el contenido**

```bash
# Assets con hash -> cache largo
aws s3 sync dist/ s3://tablo-frontend-prod \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html"

# index.html -> sin cache (para que siempre tome la última versión)
aws s3 cp dist/index.html s3://tablo-frontend-prod/index.html \
  --cache-control "no-cache"
```

**4. Crear la distribución de CloudFront**

- Origen: el bucket S3 (usa **Origin Access Control / OAC** para mantener el
  bucket privado; CloudFront accede, el público no entra directo a S3).
- Viewer protocol policy: **Redirect HTTP to HTTPS**.
- Default root object: `index.html`.
- **SPA routing**: en *Error pages*, mapea **403** y **404** → response code
  **200** → response page `/index.html`. Así las rutas de vue-router
  (history mode) funcionan al recargar.

**5. Invalidar caché de CloudFront en cada deploy**

```bash
aws cloudfront create-invalidation \
  --distribution-id <TU_DISTRIBUTION_ID> \
  --paths "/index.html" "/"
```

**6. Dominio + HTTPS (opcional)**

- Solicita un certificado en **AWS Certificate Manager** (región `us-east-1`,
  requisito de CloudFront).
- Asócialo a la distribución y agrega tu dominio como *Alternate domain name (CNAME)*.
- Crea el registro **Alias** en **Route 53** apuntando a CloudFront.

> **CORS**: la API en `https://api-tablo.antana.com.pe` debe permitir el origen
> del frontend (tu dominio de CloudFront/Route 53).

**Script de deploy de referencia** (`deploy.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail
BUCKET="tablo-frontend-prod"
DIST_ID="XXXXXXXXXXXXX"

npm run build
aws s3 sync dist/ "s3://$BUCKET" --delete \
  --cache-control "public, max-age=31536000, immutable" --exclude "index.html"
aws s3 cp dist/index.html "s3://$BUCKET/index.html" --cache-control "no-cache"
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/" "/index.html"
```

### Opción C — Contenedor Docker en AWS (ECS Fargate / App Runner)

Usa el `Dockerfile` (Nginx) si prefieres servir desde un contenedor.

**1. Construir y subir la imagen a ECR**

```bash
AWS_ACCOUNT_ID=<TU_ACCOUNT_ID>
REGION=us-east-1
REPO=tablo-frontend

# Crear repositorio (una sola vez)
aws ecr create-repository --repository-name $REPO --region $REGION

# Login de Docker contra ECR
aws ecr get-login-password --region $REGION \
  | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Build, tag y push
docker build -t $REPO:latest .
docker tag $REPO:latest $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO:latest
```

**2. Desplegar**

- **AWS App Runner** (lo más simple): crea un servicio apuntando a la imagen de
  ECR, puerto **80**. Te da una URL HTTPS automáticamente.
- **ECS Fargate** (más control): define una *Task Definition* con la imagen ECR
  (puerto 80), un *Service* y un **Application Load Balancer** delante. Añade el
  certificado ACM al listener 443 para HTTPS.

> Recuerda: la `VITE_API_BASE_URL` se fija al construir la imagen
> (`--build-arg`), no en tiempo de ejecución.

---

## Scripts disponibles

| Comando           | Descripción                                  |
|-------------------|----------------------------------------------|
| `npm run dev`     | Servidor de desarrollo (HMR) en `:5173`      |
| `npm run build`   | Compila a `dist/` para producción            |
| `npm run preview` | Sirve localmente el build de `dist/`         |
