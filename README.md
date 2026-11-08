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

```bash
npm run dev
npm run build
npm run preview
```

El comando `npm run deploy` publica `dist/` en GitHub Pages mediante `gh-pages`; ejecuta `npm run build` previamente o deja que `predeploy` lo haga automáticamente.

## Variables de entorno

- `VITE_API_URL` (requerida): URL base de la API Spring Boot, por ejemplo `http://localhost:8080`.
- `VITE_NEWSLETTER_ENDPOINT` (opcional): endpoint público para la suscripción al boletín.

No incluyas secretos en variables `VITE_*`: se incorporan al bundle público del navegador.

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
