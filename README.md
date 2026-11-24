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
- `VITE_CAPTCHA_SITE_KEY` (requerida en desarrollo y producción): clave pública real del widget Turnstile que debe corresponder al secreto configurado en el backend.
- `VITE_PRIVACY_POLICY_URL` (opcional; predeterminada `#politica-datos`): enlace interno a la política.
- `VITE_PRIVACY_POLICY_VERSION` (opcional; predeterminada `1.0-borrador`): versión enviada en el consentimiento.

No incluyas secretos en variables `VITE_*`: se incorporan al bundle público del navegador.
La página de tratamiento de datos está marcada como borrador y debe ser revisada y aprobada por G&G antes de su uso legal.

## Secciones conectadas a la API

El frontend utiliza `src/services/api.js` para las solicitudes al backend:

- Formulario de contacto: `POST /api/contacto`
- Asistente: `GET /api/chat/config` y `POST /api/chat`; si Gemini está activo, exige consentimiento explícito antes de enviar cada pregunta.
- Consulta de proyecto: `POST /api/obras/seguimiento` con `{ "codigo": "..." }`
- Panel de obras (requiere autenticación): `/api/panel/obras` para listar, crear, editar, actualizar avances e hitos, eliminar y renovar códigos según el rol
- Consultas administrativas del chat: `GET /api/admin/consultas-chat`

El panel y la consulta de seguimiento no utilizan datos locales de respaldo; el backend debe estar ejecutándose para usarlos.

Las secciones de servicios, proyectos emblemáticos, EPP, riesgos y política ambiental se mantienen en React y no consultan la API.
El explorador de labores y riesgos también usa su catálogo local en `src/components/RiskExplorer.jsx`, sin consultar la API.

## Seguridad del navegador

`public/_headers` define CSP y encabezados para plataformas que admiten archivos `_headers`, como Netlify y Cloudflare Pages. El build sustituye `__API_ORIGIN__` por el origen de `VITE_API_URL`. La etiqueta meta CSP generada en `dist/index.html` sirve como respaldo, pero no sustituye los encabezados HTTP.

GitHub Pages no permite configurar encabezados HTTP personalizados; en ese alojamiento solo se aplica la política meta. El formulario y la galería administrativa permiten cargar fotos JPEG, PNG o WebP de hasta 5 MB. Requieren la migración V15 y las rutas de fotos en Spring Boot. El seguimiento público carga cada imagen bajo demanda con el código de la consulta. El [informe de auditoría](docs/auditoria-frontend.md) detalla el contrato y sus dependencias.

Configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` para habilitar Supabase Auth. La CSP permite el origen definido en `VITE_SUPABASE_URL`.

### Confirmación de correo y recuperación de contraseña

Configura **Site URL** en Supabase con la URL completa del frontend, incluida la ruta `/GG-WEB/`. Las plantillas de confirmación y recuperación deben usar estos destinos:

```text
{{ .SiteURL }}?token_hash={{ .TokenHash }}#verify-email
{{ .SiteURL }}?token_hash={{ .TokenHash }}#reset-password
```

Spring Boot solicita el correo de recuperación a Supabase Auth mediante `POST /api/auth/password-reset`. El frontend reenvía la confirmación mediante Supabase Auth.

Si Turnstile muestra un error `300*` (por ejemplo, `300010`), Cloudflare lo clasifica como un fallo genérico temporal del desafío; no significa por sí solo que la clave secreta del backend sea incorrecta. Usa **Reintentar CAPTCHA**. Si persiste, prueba sin extensiones o VPN, en otro navegador o red, y confirma que el dominio esté autorizado en el widget de Turnstile.
