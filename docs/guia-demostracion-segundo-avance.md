# Guía de demostración - Segundo avance

## Preparación

1. Inicia MySQL e importa db/schema.sql. Debe quedar disponible la base educursos.
2. Copia config/.env.example como config/.env y coloca la conexión real de MySQL.
3. Si aún no tienes cuenta Cloudinary, abre PowerShell y ejecuta `Set-Location "C:\Users\eliab\OneDrive\Escritorio\PIA POCI\config"` y después `npx.cmd @cloudinary/cloud`. El proyecto lee CLOUDINARY_URL desde config/.env. Reclama el cloud desde el enlace de salida en menos de 24 horas.
4. En una terminal, crea el administrador con php scripts/create-admin.php.
5. Inicia el servidor con iniciar-servidor.bat. La opción de PHP carga OpenSSL para las solicitudes HTTPS de Cloudinary.

## Recorrido para la revisión presencial

1. Registra una cuenta de instructor y una de estudiante desde Registro. La contraseña debe tener 8 caracteres, mayúscula, número y símbolo.
2. Inicia sesión como instructor. La aplicación establece una sesión PHP y abre el panel del rol.
3. Abre Crear curso. Las categorías se cargan desde MySQL. Captura datos, agrega un video HTTPS por nivel y sube la portada a Cloudinary.
4. Abre Cursos desde el catálogo. El navegador usa fetch contra GET /api/v1/courses; las búsquedas filtran los datos de MySQL.
5. Inicia sesión como administrador y prueba categorías y cuentas. Para comprobar el bloqueo, falla tres veces el acceso de una cuenta; después reactívala desde el panel.
6. En Postman importa postman/EduCursos-Segundo-Avance.postman_collection.json. Inicia sesión primero en la colección, conserva la cookie, y prueba rutas públicas y protegidas.
7. Prueba CORS enviando Origin https://sitio-no-autorizado.example. La respuesta esperada es 403.

## Middleware

CORS se ejecuta antes de seleccionar la ruta y responde el preflight OPTIONS. Para rutas protegidas, AuthMiddleware valida que exista una sesión y comprueba el rol antes de entrar al controlador. El controlador valida los datos y delega el acceso a MySQL en un modelo PDO.

## Evidencias que se deben capturar durante la demostración

- Respuesta JSON de la API propia en Postman, incluyendo una consulta correcta y una respuesta de error.
- Rechazo de una ruta protegida sin sesión.
- Bloqueo de una cuenta en el tercer intento y reactivación desde el rol administrador.
- Configuración CORS: origen permitido y rechazo de uno ajeno.
- Subida de imagen a Cloudinary con una respuesta que contenga secure_url.
- Estructura MVC y esquema MySQL en db/schema.sql.

