# G&G Construcciones — Frontend

Frontend corporativo de G&G Construcciones, desarrollado con React 18, Vite 5 y Tailwind CSS. Las rutas principales se manejan mediante hash en `src/App.jsx`.

## Requisitos

- Node.js y npm
- Backend REST Spring Boot disponible para las funciones que consumen datos

## Instalación y ejecución

```bash
npm install
```

Crea tu archivo local de variables de entorno a partir del ejemplo:

```bash
Copy-Item .env.example .env
```

En desarrollo, el backend debe estar corriendo en `http://localhost:8080`, o `VITE_API_URL` debe apuntar a la URL donde esté disponible.
Para producción, configura un archivo local `.env.production` a partir de `.env.production.example` y reemplaza la URL de ejemplo por el dominio HTTPS real de la API. El build de producción rechaza HTTP fuera de localhost.

```bash
npm run dev
npm run build
npm run preview
```

El comando `npm run deploy` publica `dist/` en GitHub Pages mediante `gh-pages`; ejecuta `npm run build` previamente o deja que `predeploy` lo haga automáticamente.

## Validación local

```bash
npm run lint
npm test
npm audit --omit=dev
npm run build
```

## Variables de entorno

- `VITE_API_URL` (requerida): URL base de la API Spring Boot, por ejemplo `http://localhost:8080`.
- `VITE_CAPTCHA_SITE_KEY` (requerida para formularios protegidos): clave pública del widget CAPTCHA configurado en el backend.
- `VITE_PRIVACY_POLICY_URL` (opcional; predeterminada `#politica-datos`): enlace interno a la política.
- `VITE_PRIVACY_POLICY_VERSION` (opcional; predeterminada `1.0-borrador`): versión enviada en el consentimiento.

No incluyas secretos en variables `VITE_*`: se incorporan al bundle público del navegador.
La página de tratamiento de datos está marcada como borrador y debe ser revisada y aprobada por G&G antes de su uso legal.

## Secciones conectadas a la API

El frontend utiliza `src/services/api.js` para las solicitudes al backend:

- Servicios: `GET /api/servicios`
- Proyectos: `GET /api/proyectos` y `GET /api/proyectos?categoria=CIVIL|SST`
- Explorador de riesgos: `GET /api/riesgos/labores` y `GET /api/riesgos/{id}`
- Formulario de contacto: `POST /api/contacto`
- Asistente IA: `POST /api/chat`
- Consulta de proyecto: `POST /api/obras/seguimiento` con `{ "codigo": "..." }`
- Panel de obras (requiere autenticación): `/api/panel/obras` para listar, crear, editar, actualizar progreso, eliminar y subir fotos en `multipart/form-data` (`archivo`, `descripcion`)
- Consultas administrativas del chat: `GET /api/admin/consultas-chat`

El panel y la consulta de seguimiento no utilizan datos locales de respaldo; el backend debe estar ejecutándose para usarlos.

## Seguridad del navegador

`public/_headers` define CSP y encabezados para plataformas que admiten archivos `_headers`, como Netlify y Cloudflare Pages. El build sustituye `__API_ORIGIN__` por el origen de `VITE_API_URL`. La etiqueta meta CSP generada en `dist/index.html` sirve como respaldo, pero no sustituye los encabezados HTTP.

GitHub Pages no permite configurar encabezados HTTP personalizados; en ese alojamiento solo se aplica la política meta. Las imágenes entregadas por el backend se muestran únicamente si son del mismo origen o usan HTTPS; las vistas previas locales usan URLs `blob:` del propio navegador.

En Google Cloud Console, restringe la API key pública de Firebase mediante restricciones de aplicación por sitios web (dominios de producción autorizados y los dominios locales necesarios) y restricciones de API a las APIs de Firebase que realmente use la aplicación. La API key de Firebase identifica el proyecto; no la trates como secreto ni publiques claves privadas en variables `VITE_*`.

La recuperación de contraseña llama a `POST /api/auth/password-reset` con `X-Captcha-Token`. El backend debe configurar `FIREBASE_WEB_API_KEY`; si `VITE_FIREBASE_API_KEY` tiene restricción de HTTP referrer, utiliza para el backend una clave API separada, restringida a Identity Toolkit API pero sin restricción de aplicación por referrer. El reenvío del correo de verificación usa Firebase Auth directamente desde el navegador y `VITE_FIREBASE_API_KEY`, por lo que requiere que el proveedor Email/Password esté habilitado y que el dominio del frontend esté autorizado en Firebase Authentication.

Si Turnstile muestra un error `300*` (por ejemplo, `300010`), Cloudflare lo clasifica como un fallo genérico temporal del desafío; no significa por sí solo que la clave secreta del backend sea incorrecta. Usa **Reintentar CAPTCHA**. Si persiste, prueba sin extensiones o VPN, en otro navegador o red, y confirma que el dominio esté autorizado en el widget de Turnstile. En recuperación, la API permite más tiempo porque verifica el CAPTCHA y luego solicita el correo a Firebase.
