# Contrato de API - Segundo avance

Base local: http://localhost:8000/api/v1. Todas las respuestas son JSON UTF-8. Las rutas autenticadas usan la cookie educursos_session; Postman conserva la cookie después de iniciar sesión.

## Autenticación

POST /auth/register crea estudiante o instructor. Ejemplo:
    {"full_name":"Ana López","gender":"Femenino","birth_date":"2001-04-20","email":"ana@example.com","password":"Curso*2026","role":"estudiante"}
Responde 201. Campos inválidos o correo duplicado: 400.

POST /auth/login recibe email y password. Responde 200 y establece la cookie. Credenciales incorrectas: 401. Al tercer fallo consecutivo, la cuenta queda deshabilitada y el contador se guarda en MySQL.

POST /auth/logout cierra la sesión. GET /auth/me informa el usuario de la sesión activa; sin sesión responde 401.

## Cursos

GET /courses admite filtros category (id), q (título parcial), instructor (nombre parcial), from y to (AAAA-MM-DD). Solo incluye cursos activos.
Ejemplo: GET /courses?q=php&from=2026-08-01

GET /courses/{id} devuelve detalle y niveles, incluido video_url. Responde 404 si el curso no existe o está inactivo.

GET /student/enrollments requiere rol estudiante. Devuelve solo las inscripciones de la sesión actual, con curso, categoría, avance y fechas; sin sesión o con otro rol responde 401/403.

GET /instructor/courses requiere sesión con rol instructor o administrador. Devuelve únicamente los cursos asociados a la cuenta autenticada, con categoría, precio, estado y número de niveles. Sin sesión responde 401; con rol insuficiente, 403.

POST /courses requiere rol instructor o administrador. Ejemplo:
    {"title":"PHP desde cero","description":"Curso introductorio de PHP con prácticas y proyecto final.","category_id":1,"price":0,"image_url":"https://res.cloudinary.com/demo/image/upload/example.jpg","levels":[{"title":"Primeros pasos","description":"Instalación y sintaxis","video_url":"https://www.youtube.com/watch?v=ysz5S6PUM-U"}]}
Cada nivel requiere título y URL HTTPS de video. Responde 201.

## Categorías

GET /categories lista categorías.
POST /categories requiere administrador. Body: {"name":"Desarrollo","description":"Desarrollo de software."}. Responde 201.

## Perfil y Cloudinary

GET /profile requiere sesión. PUT /profile admite full_name, gender, birth_date y avatar_url; no permite cambiar ID, correo o rol.

POST /uploads/image requiere sesión. Envía multipart/form-data con campo image (JPG, PNG o WebP, máximo 5 MB). Sube a Cloudinary y responde con secure_url. Requiere las credenciales de config/.env.

## Administración

GET /admin/users lista cuentas y estado; solo administrador.
GET /admin/reports/users?role=instructor|estudiante requiere administrador y devuelve solo cuentas activas del tipo solicitado, con conteos calculables desde MySQL.
POST /admin/users/{id}/unlock solo permite administrador. Reactiva cuenta y pone el contador de fallos en cero.

## Códigos de estado

200 consulta, login, actualización o cierre correctos.
201 cuenta, curso, categoría o imagen creada.
400 JSON o campos inválidos.
401 sesión ausente o credenciales incorrectas.
403 rol insuficiente u origen CORS no permitido.
404 ruta, curso o cuenta inexistente.
500 error interno; el servidor registra detalles, la respuesta no expone SQL ni rutas.
502/503 fallo de Cloudinary o falta de configuración.
OPTIONS responde 204. Un método no permitido en una ruta conocida responde 405; una ruta inexistente responde 404.

