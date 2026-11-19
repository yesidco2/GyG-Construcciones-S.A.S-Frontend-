# Auditoría del frontend de G&G Construcciones

## Compatibilidad revisada

Se contrastó el frontend con los controladores, DTO, servicios, filtros y configuración de CORS del repositorio local de Spring Boot. Las pruebas de React usan respuestas controladas para reproducir el contrato. El backend configurado localmente rechazó la conexión durante la comprobación.

| Área | Contrato verificado | Resultado en React |
| --- | --- | --- |
| Servicios, portafolio, labores, riesgos y política ambiental | Catálogos y componentes locales de React | Se conservan contenido y diseño. No se encontraron llamadas a las tablas antiguas. El portafolio es independiente del panel. |
| Contacto | `POST /api/contacto` registra en `solicitudes_contacto` y recibe `X-Captcha-Token` con acción `contacto`. El DTO exige correo o teléfono y consentimiento. | Validación alineada, bloqueo de doble envío y del campo trampa, manejo de 400, 429 y 503, y éxito solo con el comprobante JSON esperado. Se retiró el registro de datos personales en consola. |
| Obras | `GET/POST /api/panel/obras`, `PATCH/DELETE /api/panel/obras/{id}`, `PATCH /api/panel/obras/{id}/progreso`, `GET /api/panel/obras/clientes` y `GET /api/panel/obras/estados` | Los cambios se identifican por `id`, las categorías usan `CIVIL` o `SST` y el propietario se envía como `clienteId` al asignarlo. El formulario de edición envía los campos modificados. |
| Hitos | `ObraResponse.hitos`, `ObraUpdateRequest.hitos` y `SeguimientoObraDTO.hitos` | El editor envía `hitos` únicamente si se editaron. Spring Boot reemplaza la lista completa cuando recibe el campo. El seguimiento muestra el avance, los hitos y su fecha objetivo. |
| Código de seguimiento | `POST /api/obras/seguimiento` recibe `codigo`. Spring Boot genera el valor al crear la obra o llamar a `POST /api/panel/obras/{id}/codigo-seguimiento`. | El código creado se muestra en el modal y la tarjeta durante la sesión del panel, sin almacenamiento del navegador ni URL. El listado del servidor omite los códigos y conserva únicamente su hash. ADMIN puede regenerarlo previa confirmación de que el código anterior dejará de funcionar. El seguimiento envía el código en el cuerpo del POST. |
| Roles | `ADMIN` crea obras, consulta clientes, reasigna cliente y rota códigos. `INGENIERO` opera obras asignadas. El historial del chat exige `ADMIN`. `CLIENTE` carece de acceso al panel. | Se alinearon controles y peticiones con esos permisos. La API sigue comprobando los roles y las asignaciones por obra. |
| Firebase y Turnstile | `POST /api/auth/captcha/verify` verifica la acción `login` y devuelve un ticket. `POST /api/auth/session` recibe el ticket y el Bearer de Firebase. `GET /api/auth/me` devuelve el perfil. | Se exige confirmación positiva de sesión, se evita el envío simultáneo y se conserva el token Firebase recién actualizado al reenviar verificación. La recuperación por `POST /api/auth/password-reset` sigue pasando por el flujo SMTP existente. |
| Boletín y chat | `POST /api/newsletter`, `POST /api/chat` y `GET /api/admin/consultas-chat?page=…` | Se mantiene el CAPTCHA del boletín con acción `newsletter`. El historial usa la paginación del DTO de Spring Boot. |

## Actualización de fotografías administrativas

El formulario de creación y la galería administrativa usan el almacenamiento de PostgreSQL de la migración V15. Se admiten hasta 20 fotografías JPEG, PNG o WebP por obra, de hasta 5 MB y 4 megapíxeles cada una. Las rutas autenticadas son `GET/POST /api/panel/obras/{id}/fotos` y `GET /api/panel/obras/{id}/fotos/{fotoId}`. Se aplican los permisos y asignaciones de la obra. El archivo se envía como `archivo` en multipart y el servidor deduplica por su contenido. El backend también expone una ruta de lectura para seguimiento público. El formulario y la galería administrativa usan las rutas autenticadas.

## Estado de las rutas fotográficas durante la auditoría inicial

- `POST /api/panel/obras/{id}/fotos`.
- `GET /api/panel/obras/{id}/fotos/{fotoId}`.
- La función sin consumidores para `DELETE /api/panel/obras/{id}/fotos/{fotoId}`.
- `POST /api/obras/seguimiento/fotos/{fotoId}`.

No hay controladores para esas rutas ni campos de fotos en `ObraResponse` y `SeguimientoObraDTO`. React conserva el acceso a la galería administrativa y el bloque público con un aviso de indisponibilidad. La creación de una obra ya no puede quedar registrada en Spring Boot mientras el frontend muestra un fallo por una subida posterior inexistente.

## Cambios y verificaciones pendientes en Spring Boot o despliegue

- **CORS.** En `SecurityConfig.corsConfigurationSource`, añadir `configuration.setExposedHeaders(List.of("Retry-After"))`, o incorporar ese encabezado a la lista existente. `GlobalExceptionHandler` ya lo envía en respuestas 429. Configurar el origen exacto del portal en `APP_CORS_ALLOWED_ORIGINS` y probar el preflight con `Authorization`, `Content-Type` y `X-Captcha-Token`.
- **Fotografías en seguimiento público.** La API actual dispone de una ruta que valida el código en el cuerpo de la solicitud. La interfaz pública solicita cada PNG bajo demanda con el código en memoria.
- **Turnstile en producción.** Confirmar en Cloudflare el dominio del portal y el par de claves. El build usa `VITE_CAPTCHA_SITE_KEY` como clave pública y `APP_CAPTCHA_EXPECTED_HOSTNAMES` se configura en Spring Boot. La comprobación local confirmó que la variable existe, pero no validó la pareja de claves ni un desafío real. Verificar que la CSP efectiva del hosting permite `challenges.cloudflare.com` en `script-src` y `frame-src`.
- **Firebase y SMTP.** Probar en un entorno con credenciales de prueba el inicio y cierre de sesión, la caducidad de sesión verificada, la recepción de los correos y el retorno desde la página personalizada. Para activar la página de verificación personalizada, el enlace de verificación debe apuntar al portal con `mode=verifyEmail` y `oobCode`. Mantener por separado el destino de recuperación SMTP y Firebase. Spring Boot no expone un endpoint de cierre de sesión verificada. El cierre actual es local a Firebase y la sesión del backend vence por su política de expiración.
- **Contacto.** El controlador devuelve `{"id":0}` tanto tras un registro válido como para el campo trampa. El frontend bloquea el campo trampa y acepta el comprobante actual. Si se necesita una referencia para atención al cliente, el backend debe retornar el ID persistido solo tras guardar la solicitud.
- **Contenido.** El enlace vacío de términos fue retirado. Hace falta una URL o un documento aprobado para restaurarlo. Las imágenes remotas del portal dependen de sus proveedores y requieren comprobación desde el dominio desplegado.

## Mantenimiento

- Añadir pruebas de contrato en CI para detectar cambios de DTO, permisos, acciones Turnstile y códigos de error entre los dos repositorios.
- Automatizar pruebas en un entorno de integración con cuentas por rol, SMTP de prueba y los mecanismos oficiales de prueba de Turnstile.
- Dar seguimiento al tamaño del bundle inicial y a los avisos de lint. Mantener `.env` fuera de Git y limitar `VITE_*` a valores públicos.

## Archivos modificados

- Navegación y contenido interactivo: `src/App.jsx`, `src/components/Header.jsx`, `src/components/Footer.jsx`, `src/components/Contact.jsx` y `src/pages/AdminFaqPage.jsx`.
- Obras y seguimiento: `src/components/dashboard/EngineerDashboard.jsx`, `src/services/projectService.js` y `src/pages/ConsultProjectPage.jsx`.
- Autenticación y CAPTCHA: `src/pages/LoginPage.jsx`, `src/pages/VerifyEmailPage.jsx`, `src/components/auth/CaptchaWidget.jsx`, `src/config/captcha.js` y `src/services/{api,authService,captchaService}.js`.
- Configuración: `.env.example`, `.env.production.example`, `public/_headers`, `vite.config.js` y `.gitignore`. Se retiró el archivo generado `vite.config.js.timestamp-1792166307473-6588af18b9ca68.mjs`, que referenciaba rutas absolutas ajenas al proyecto.
- Pruebas: `src/test/{api,authService,projectService}.test.js` y `src/test/{ConsultProjectPage,EngineerDashboard,Navigation,Privacy}.test.jsx`.
- Documentación: `README.md` y este informe.

## Resultado de las comprobaciones

- `npm run build` finalizó correctamente. Vite mantiene un aviso de tamaño para el bundle principal, de aproximadamente 609 kB minificados.
- `npm run lint` finalizó con 0 errores y 3 avisos. Dos corresponden a accesos a catálogos locales en `RiskExplorer.jsx` y uno a la ruta de salida de Vite al generar `_headers`.
- `npm test` ejecutó 68 pruebas en 17 archivos, todas aprobadas. Incluye regresiones de navegación, roles, avance independiente, hitos, CAPTCHA, contacto y sesión Firebase.
- La vista previa local sirvió HTML y JavaScript con HTTP 200. Se comprobó la presencia del origen Turnstile en las directivas CSP de script e iframe y la sustitución del origen de la API.
- El navegador headless no produjo un DOM en este entorno. Queda pendiente una comprobación visual en escritorio y móvil y el flujo integrado con Spring Boot, Firebase, SMTP y un desafío real.

## Verificación de la integración actual de obras

| Ruta probada con la API local configurada | Solicitud | Resultado observado |
| --- | --- | --- |
| `GET /api/institucional` | Sin sesión, con el origen del Vite local | HTTP 200 |
| `GET /api/panel/obras/clientes` | Sin sesión verificada | HTTP 403, `CAPTCHA_REQUIRED` |
| `POST /api/obras/seguimiento` | JSON `{}`, sin código | HTTP 400 |
| `POST /api/obras/seguimiento/fotos/1` | JSON `{}`, sin código | HTTP 400 |

Para que React lea `Retry-After` tras un HTTP 429 entre orígenes, Spring Boot debe exponer ese encabezado en `SecurityConfig.corsConfigurationSource`. Las respuestas locales observadas no incluían `Access-Control-Expose-Headers` y el código de Spring confirma que falta la configuración. La vista espera 60 segundos de respaldo y requiere una acción manual. Las pruebas usan respuestas controladas para las acciones con sesión ADMIN y la consulta con un código válido.
