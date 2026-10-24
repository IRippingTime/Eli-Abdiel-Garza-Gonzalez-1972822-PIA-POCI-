# Integrantes del equipo:
- Nombre: Elí Abdiel Garza González
- Matricula: 1972822

# EduCursos - Segundo avance

## Preparar el entorno

1. Instala PHP 8.1 o posterior con PDO, pdo_mysql y OpenSSL habilitado, y MySQL 8.
2. Ejecuta db/schema.sql en MySQL. Crea las tablas, relaciones y categorías iniciales.
3. Copia config/.env.example a config/.env y configura MySQL. Para Cloudinary, desde PowerShell ejecuta `Set-Location "C:\Users\eliab\OneDrive\Escritorio\PIA POCI\config"` y luego `npx.cmd @cloudinary/cloud`; el proyecto lee `CLOUDINARY_URL` automáticamente. Reclama el cloud desde el enlace que genera en menos de 24 horas.
4. Crea la primera cuenta administradora con php scripts/create-admin.php. Para una base de demostración con cuentas y cursos de ejemplo, puedes ejecutar php scripts/seed-demo.php; las contraseñas temporales se muestran solo si el script crea cuentas nuevas.
   Si los cursos de demostración ya existen, actualiza sus videos con php scripts/update-demo-videos.php; las ligas fuente están en scripts/demo-videos.php.
5. Inicia el servidor con iniciar-servidor.bat o php -d extension=php_openssl.dll -S localhost:8000 router.php.
6. Abre http://localhost:8000/html/index.html. La API está en http://localhost:8000/api/v1.

## Requisitos implementados

- PHP puro, POO, MVC y enrutamiento frontal.
- PDO/MySQL accedido únicamente desde los modelos.
- API REST en JSON para cursos, categorías, autenticación y perfil.
- Registro, inicio/cierre de sesión y consulta de sesión; contraseñas con password_hash.
- Bloqueo al tercer intento consecutivo; ruta administrativa para reactivar.
- Middleware CORS explícito y middleware de sesión/rol antes de operaciones protegidas.
- Consumo de la API desde el cliente mediante fetch, sin recarga, con errores visibles.
- Integración de Cloudinary para cargar imágenes desde PHP. Las claves quedan en config/.env.
- Colección Postman en postman/EduCursos-Segundo-Avance.postman_collection.json.

## Cuentas y seguridad

Cloudinary fue aprobado para la integración, según la documentación del curso. No se incluyen contraseñas predeterminadas ni claves de servicio. Registra estudiantes e instructores en el portal. Crea el administrador mediante el script indicado. No subas config/.env; comparte únicamente .env.example.

La ruta POST /api/v1/admin/users/{id}/unlock reactiva una cuenta y restablece los intentos.

## Rutas principales

| Método | Ruta | Acceso | Uso |
|---|---|---|---|
| GET | /api/v1/courses | Público | Cursos activos; admite category, q, instructor, from, to |
| GET | /api/v1/courses/{id} | Público | Detalle, niveles y URL de video |
| POST | /api/v1/courses | Instructor/administrador | Crea curso y niveles |
| GET | /api/v1/categories | Público | Lista categorías |
| POST | /api/v1/categories | Administrador | Crea categoría |
| POST | /api/v1/auth/register | Público | Crea estudiante o instructor |
| POST | /api/v1/auth/login | Público | Inicia sesión |
| POST | /api/v1/auth/logout | Sesión | Cierra sesión |
| GET | /api/v1/auth/me | Sesión | Consulta la sesión |
| GET/PUT | /api/v1/profile | Sesión | Consulta y actualiza el perfil |
| POST | /api/v1/uploads/image | Sesión | Sube JPG/PNG/WebP de hasta 5 MB a Cloudinary |
| POST | /api/v1/admin/users/{id}/unlock | Administrador | Reactiva cuenta |

Contrato detallado y códigos: docs/api-segundo-avance.md.

## Middleware y MVC

router.php sirve archivos estáticos y reenvía las demás rutas a api/index.php. Orden: CORS, router/recurso, middleware de sesión y rol, controlador, modelo PDO y respuesta JSON. CORS responde OPTIONS antes del enrutamiento.

## Integración Cloudinary

La carga usa una firma generada en servidor. Acepta CLOUDINARY_URL (formato oficial `cloudinary://...`) o las tres variables CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET. Mantén las credenciales en config/.env; no las compartas ni las incluyas en Git.


