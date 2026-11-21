# Integrantes del equipo:

Nombre: Elí Abdiel Garza González
Matricula: 1972822

# EduCursos

Portal web de cursos en línea desarrollado para el Proyecto Integrador de Aprendizaje de Programación Web Capa Intermedia.

## Tecnologías

- PHP 8.1 o posterior, con PDO, `pdo_mysql` y OpenSSL.
- MySQL 8.
- HTML, CSS y JavaScript; el cliente consume la API propia con `fetch`.
- Cloudinary para guardar imágenes de cursos y perfiles.

## Estructura del proyecto

```text
api/                 Entrada de la API
app/                 Router, controladores, modelos, middleware y servicios
config/              Plantilla de configuración; .env local no se comparte
css/                 Estilos del portal
db/                  Esquema MySQL y consultas de lectura
docs/                 Manuales, contrato de API y estado de entrega
evidencias/           Evidencias del segundo avance
html/                Páginas organizadas por rol
img/                 Recursos gráficos del catálogo
js/                  Cliente API y lógica de interfaz
postman/             Colección de peticiones
scripts/             Creación de administrador y datos de demostración
router.php            Servidor local y front controller
iniciar-servidor.bat  Inicio rápido en Windows
```

## Instalación local

1. Instala PHP 8.1+, MySQL 8 y habilita `PDO`, `pdo_mysql` y OpenSSL.
2. Ejecuta `db/schema.sql` en MySQL. Para una base existente, respalda los datos y aplica los cambios de esquema antes de usar las funciones nuevas.
3. Copia `config/.env.example` como `config/.env` y configura las variables de MySQL y Cloudinary. El archivo `.env` contiene secretos y está excluido de Git.
4. Crea un administrador ejecutando `php scripts/create-admin.php` desde la raíz.
5. Opcionalmente, carga datos de demostración con `php scripts/seed-demo.php`. El script de actualización de videos es `php scripts/update-demo-videos.php`.
6. Inicia con `iniciar-servidor.bat` o ejecuta `php -S localhost:8000 router.php` desde la raíz.
7. Abre `http://localhost:8000/html/index.html`. La base de la API es `http://localhost:8000/api/v1`.

No agregues `config/.env`, `importante.txt` ni contraseñas al ZIP de entrega o al repositorio. Comparte solo `config/.env.example`.

## Funciones incluidas

- Catálogo de cursos y categorías, registro e inicio de sesión por rol.
- Creación y baja lógica de cursos; inscripciones gratuitas y avance por nivel.
- Solicitudes de compra de curso completo por transferencia o tarjeta demostrativa. No se realizan cargos: el administrador valida el pago fuera del portal y confirma la solicitud.
- Kardex del estudiante, reportes de ventas y de usuarios, opiniones con moderación administrativa y mensajes entre usuarios con cursos compartidos.
- Diploma al completar el curso. Cada diploma tiene un botón para imprimirlo o guardarlo como PDF desde el diálogo de impresión del navegador.
- Carga de imágenes mediante Cloudinary desde el servidor; el video se enlaza con una URL HTTPS.

## Documentación y herramientas

- `docs/word/Documentacion-Completa.docx`: manual de implementación y operación.
- `docs/api-segundo-avance.md`: contrato de API y ejemplos de endpoints.
- `docs/estado-entrega-final.md`: alcance implementado y límites conocidos.
- `postman/EduCursos-Segundo-Avance.postman_collection.json`: colección de peticiones; hay que ejecutarla contra la instancia final para registrar sus resultados.
- `docs/checklist-segundo-avance.md`, `docs/guia-demostracion-segundo-avance.md` y `evidencias/segundo-avance/`: material histórico del segundo avance.

La arquitectura usa `router.php` como entrada, `app/Core/Router.php` para despachar rutas, controladores para validar y coordinar, modelos PDO para la base de datos y respuestas JSON. El diagrama actualizado es `docs/arquitectura-mvc-actual.svg`; el diagrama anterior `docs/arquitectura-tres-capas.svg` se conserva como antecedente.




