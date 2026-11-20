# Inventario de cookies y almacenamiento del navegador

Este inventario describe las tecnologías de almacenamiento propias identificadas en el sitio y los servicios externos que pueden intervenir durante su uso. Las cookies instaladas por terceros pueden variar según la configuración del servicio y del navegador.

| Tecnología o almacenamiento | Proveedor | Finalidad | Duración | Categoría |
|---|---|---|---|---|
| gg_cookie_consent | G&G Construcciones | Recordar la versión de la política y las preferencias de cookies del usuario. | 365 días | Necesaria |
| Persistencia de sesión de Firebase Authentication (IndexedDB, almacenamiento del navegador o sesión) | Google Firebase | Autenticar a usuarios autorizados y mantener su sesión según la opción de acceso seleccionada. | Mientras dure la sesión o según la persistencia configurada por el usuario | Necesaria para autenticación |
| `gg-chat-history` (sessionStorage; no es una cookie) | G&G Construcciones | Mantener el historial reciente del chat durante la sesión de la pestaña. | Hasta cerrar la pestaña | Funcional |
| Widget Cloudflare Turnstile (cookies o almacenamiento del proveedor, si se utilizan) | Cloudflare | Presentar y validar la verificación anti-bot en los formularios y accesos que la requieren. | Según la configuración y las reglas del proveedor | Seguridad |
| Imágenes solicitadas a Googleusercontent o Unsplash | Google / Unsplash | Mostrar recursos gráficos remotos en algunas páginas. La solicitud puede comunicar datos técnicos, como la dirección IP y el navegador. | No aplica al almacenamiento propio; las prácticas del proveedor dependen de sus políticas | Funcional |
| Enlace a WhatsApp (no se inserta en un marco dentro del sitio) | WhatsApp | Permitir que el usuario inicie una conversación fuera del sitio. | No aplica al sitio; las prácticas del proveedor dependen de sus políticas | Funcional |
| Fuentes autoalojadas | G&G Construcciones / Fontsource | Mostrar las familias tipográficas del sitio sin solicitar fuentes a Google Fonts. | No aplica | Funcional |

## Almacenamiento y servicios externos

- El sitio utiliza una cookie propia para recordar las preferencias de cookies. No se encontró uso directo de `localStorage` en el código de la aplicación.
- Firebase Authentication puede utilizar IndexedDB, almacenamiento del navegador o almacenamiento de sesión, según la persistencia configurada y la opción elegida al iniciar sesión.
- El chat guarda un historial limitado en `sessionStorage`, que se elimina al cerrar la pestaña.
- Cloudflare Turnstile se carga cuando se muestra un formulario que requiere verificación anti-bot. El proveedor puede utilizar mecanismos propios para prestar este servicio.
- Las imágenes remotas y los enlaces externos pueden comunicar datos al proveedor correspondiente. Si el usuario continúa en un servicio externo, su uso queda sujeto a las políticas de ese proveedor.
- No hay herramientas de analítica ni de publicidad configuradas actualmente. Por tanto, el sitio no carga cookies de esas categorías.
- Las fuentes tipográficas se sirven desde archivos incluidos en el sitio y no desde Google Fonts.

## Administración de preferencias

Las cookies necesarias para el funcionamiento y la seguridad del sitio permanecen activas. El usuario puede aceptar, rechazar o configurar las categorías opcionales desde el aviso inicial y volver a modificar su decisión mediante el enlace «Preferencias de cookies» del pie de página. La decisión se almacena durante un máximo de 365 días.

También es posible eliminar o bloquear cookies desde la configuración del navegador. La desactivación de tecnologías necesarias puede afectar el acceso a algunas funciones del sitio.
