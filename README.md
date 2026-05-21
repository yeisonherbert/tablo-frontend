# Guía de Despliegue en AWS para Proyecto Vue + Vite (Usando AWS CLI)

Esta guía describe los pasos necesarios para desplegar esta aplicación de Vue en Amazon Web Services (**AWS**) apuntando todo desde la consola y la interfaz de línea de comandos de AWS (**AWS CLI**).

## Requisitos Previos
Debes tener instalado [AWS CLI](https://aws.amazon.com/es/cli/) en tu computadora y estar logueado con tus credenciales. Para configurarlo, corre en tu terminal:
```bash
aws configure
```

## Pasos para el Despliegue

### 1. Construir la Aplicación
Genera los archivos estáticos listos para producción. Esto creará la carpeta `dist`.
```bash
npm run build
```

### 2. Crear Política de Bucket
Crea un archivo local en tu proyecto llamado `bucket-policy.json` y configúralo temporalmente para permitir lecturas públicas (reemplaza `tablo-frontend-vue-app`):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::tablo-frontend-vue-app/*"
        }
    ]
}
```

### 3. Crear y Configurar tu servidor/Bucket en S3
Ejecuta los siguientes comandos en tu terminal, recordando siempre cambiar `tablo-frontend-vue-app` por el nombre exclusivo que elegiste:

**1. Crear el bucket:**
```bash
aws s3 mb s3://tablo-frontend-vue-app
```

**2. Desactivar el bloqueo de acceso público:**
```bash
aws s3api put-public-access-block \
    --bucket tablo-frontend-vue-app \
    --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

**3. Aplicar la política de acceso público a tu bucket usando el archivo que creamos en el Paso 2:**
```bash
aws s3api put-bucket-policy --bucket tablo-frontend-vue-app --policy file://bucket-policy.json
```

**4. Activar el alojamiento de sitios web estáticos:**
*Usamos `index.html` también como error-document para soportar correctamente que Vue Router maneje las rutas faltantes (modos historia).*
```bash
aws s3 website s3://tablo-frontend-vue-app/ --index-document index.html --error-document index.html
```

### 4. Sincronizar / Subir tus archivos a S3
Usa de nuevo el CLI para subir tus archivos de compilación de forma masiva:
```bash
aws s3 sync dist/ s3://tablo-frontend-vue-app/ --delete
```
El parámetro `--delete` eliminará del bucket cualquier archivo obsoleto que ya no esté en tu carpeta `dist/` localmente.

### 5. Configurar Amazon CloudFront (Para HTTPS - Opcional)
Si optas por servir esto bajo una red de la misma terminal o consola a CloudFront tendrías qué instanciar la distribución:
```bash
aws cloudfront create-distribution --origin-domain-name tablo-frontend-vue-app.s3.amazonaws.com --default-root-object index.html
```

*(Cuando subas nuevos cambios con el `sync` de arriba, recuerda invalidar la caché así)*:
```bash
aws cloudfront create-invalidation --distribution-id TU_ID_DE_DISTRIBUCION --paths "/*"
```

### 6. Desplegar Actualizaciones
Cuando hagas un cambio en tu código y quieras subir esa actualización a tu sitio, solo debes correr estos 2 comandos. Puedes agregarlos como un script en tu `package.json` para mayor comodidad.

**Comandos rápidos de actualización:**
```bash
npm run build
aws s3 sync dist/ s3://tablo-frontend-vue-app/ --delete
```
