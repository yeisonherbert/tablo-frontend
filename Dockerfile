# ---- Etapa 1: build ----
FROM node:22-alpine AS build
WORKDIR /app

# Instala dependencias (capa cacheable)
COPY package*.json ./
RUN npm ci

# Copia el código y compila
COPY . .
# La URL de la API se inyecta en tiempo de build (Vite la "hornea" en el bundle)
ARG VITE_API_BASE_URL=https://api-tablo.antana.com.pe
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ---- Etapa 2: servir con Nginx ----
FROM nginx:1.27-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
