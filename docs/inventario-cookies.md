# Inventario de cookies y almacenamiento del navegador

Este inventario refleja integraciones encontradas en el código del frontend. La presencia y duración exactas de cookies instaladas por terceros deben confirmarse en sus documentaciones o mediante una inspección de red en el sitio desplegado. No se declaran cookies de analítica ni de marketing activas en el código revisado.

| Nombre | Proveedor | Finalidad | Duración | Categoría | Dónde se usa en el código |
|---|---|---|---|---|---|
| `gg_cookie_consent` | G&G Construcciones | Recordar la versión y decisión de consentimiento de analítica del sitio. | 365 días | necesaria | `src/utils/cookieConsent.js` |
| Firebase Auth (almacenamiento de sesión; nombre exacto de claves [VERIFICAR]) | Google Firebase | Mantener la sesión y autenticar usuarios administradores e ingenieros. | [VERIFICAR] | necesaria | `src/services/firebase.js`, `src/services/authService.js` |
| Historial de chat `gg-chat-history` (sessionStorage; no es cookie) | G&G Construcciones | Mantener el historial del chat durante la sesión de la pestaña. | Hasta cerrar la pestaña | necesaria | `src/components/FloatingIA.jsx` |
| [VERIFICAR: cookies y almacenamiento del widget] | Cloudflare Turnstile | Mostrar y validar el desafío anti-bot para login, contacto y newsletter. | [VERIFICAR] | necesaria | `src/components/auth/CaptchaWidget.jsx` |
| [VERIFICAR: cookies y almacenamiento de reCAPTCHA, si se configura] | Google reCAPTCHA | Proveedor alternativo anti-bot; no es el proveedor activo por defecto. | [VERIFICAR] | necesaria | `src/components/auth/CaptchaWidget.jsx` |
| [VERIFICAR: cookies que pudieran establecerse al cargar la imagen] | Googleusercontent (imágenes externas) | Entregar imágenes ilustrativas de páginas y secciones. | [VERIFICAR] | necesaria | `src/components/Hero.jsx`, `src/components/Commitment.jsx`, `src/pages/GestionSSTPage.jsx` |
| [VERIFICAR: cookies que pudieran establecerse al cargar la imagen] | Unsplash (imagen externa) | Entregar una imagen ilustrativa de Gestión SST. | [VERIFICAR] | necesaria | `src/pages/GestionSSTPage.jsx` |
| No aplica (enlace externo; no se inserta un iframe) | WhatsApp | Permitir que el usuario inicie una conversación mediante un enlace externo. | No aplica al sitio; cookies del proveedor [VERIFICAR] | necesaria | `src/components/FloatingWhatsApp.jsx` |
| No aplica (fuentes autoalojadas) | G&G Construcciones / Fontsource | Mostrar las familias tipográficas locales del sitio sin solicitar fuentes a Google Fonts. | No aplica | necesaria | `src/main.jsx`, `src/index.css` |

## Almacenamientos auditados

- `localStorage`: no se encontró acceso directo en el código de aplicación revisado.
- `sessionStorage`: el chat usa `gg-chat-history`; Firebase Auth puede usar persistencia de navegador como alternativa configurada.
- IndexedDB: Firebase Auth configura persistencia local en IndexedDB, con persistencias de navegador como alternativas.
- `document.cookie`: no se encontró uso previo directo; el sitio añadirá únicamente `gg_cookie_consent`.
- Scripts de terceros: Turnstile se carga desde el widget CAPTCHA; el código también contiene soporte alternativo para reCAPTCHA.
- Google Fonts: los enlaces remotos del `index.html` se sustituirán por fuentes autoalojadas.
- Iframes: no hay iframes escritos directamente en la aplicación; el proveedor CAPTCHA puede crear su propio contenido/iframe.
- Imágenes externas: las imágenes de Googleusercontent y Unsplash anteriores permanecen como recursos remotos; el nombre y la duración de posibles cookies requieren verificación.
- Analítica y marketing: no se encontraron scripts de analítica ni de marketing. No se debe incorporar ni cargar contenido de esas categorías antes de obtener consentimiento.

Este inventario es informativo y no sustituye la verificación de cookies y solicitudes reales en cada entorno de despliegue.
