# Evidencias — Segundo avance PIA POCI

Estas capturas documentan pruebas realizadas durante la revisión del portal. Los endpoints API se probaron directamente por HTTP en el navegador, fuera de las vistas del portal. La colección Postman entregada está en `../../postman/EduCursos-Segundo-Avance.postman_collection.json`.

| Archivo | Qué muestra |
|---|---|
| `01-middleware-deniega-rol-instructor-403.png` | Sesión válida de instructor rechazada en endpoint administrativo: HTTP 403. |
| `02-sesion-admin-confirmada.png` | Endpoint de sesión confirma la cuenta de administrador autenticada. |
| `03-reporte-estudiantes-cinco-inscripciones.png` | Reporte administrativo: Estudiante Demo 1 aparece con cinco cursos inscritos. |
| `04-reporte-instructores-y-cursos.png` | Reporte real de instructores y cursos asociados. |
| `05-api-categorias-siete-registros.png` | `GET /api/v1/categories` devuelve las siete categorías actuales. |
| `06-api-filtro-cursos-categoria.png` | Filtro API por categoría devuelve el curso coincidente. |
| `07-api-detalle-curso-niveles-video.png` | Detalle API del curso con niveles y URL de video por nivel. |
| `08-catalogo-seis-cursos-y-nuevo-curso.png` | Catálogo actual con los cursos obtenidos de la aplicación. |
| `09-detalle-curso-creado.png` | Página de detalle del curso nuevo creado desde el portal. |
| `10-panel-instructor-cursos-propios.png` | Panel instructor lista sus cursos, incluido el creado por esa cuenta. |
| `11-cloudinary-carga-avatar-exitosa.png` | Actualización de perfil y carga de avatar a Cloudinary confirmadas. |
| `12-panel-estudiante-cinco-cursos.png` | Panel de estudiante con cinco inscripciones guardadas. |
| `13-esquema-mysql-cinco-tablas.png` | Tablas MySQL: users, categories, courses, course_levels y enrollments. |
| `14-video-youtube-abre.png` | Video de lección abre en YouTube. |
| `15-api-validacion-categoria-400.png` | API rechaza un filtro category no numérico con HTTP 400 y mensaje claro. |
| `16-api-curso-no-existente-404.png` | API responde HTTP 404 para curso inexistente. |
| `17-api-sesion-ausente-401.png` | API rechaza una petición protegida sin sesión con HTTP 401. |
| `18-prueba-cors-204-y-403.png` | CORS: el origen permitido responde 204; el origen ajeno es rechazado con 403. Captura sin cookie de sesión. |

## Para la demostración

- Empieza por mostrar el API 200, luego el 400/404 y finalmente 401/403.
- Muestra Cloudinary y el panel del estudiante/instructor para confirmar integración y datos de sesión.
- En la revisión, abre `db/schema.sql`, la carpeta MVC y la colección JSON.
- Las capturas no sustituyen la ejecución en vivo ni la colección Postman solicitada por el curso.

