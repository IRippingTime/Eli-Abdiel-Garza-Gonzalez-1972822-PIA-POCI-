# Revisión del segundo avance

Contraste con la rúbrica del segundo avance del PDF POCI y con el estado del proyecto y las pruebas registradas.

## Rúbrica de 100 puntos

| Criterio | Estado | Evidencia / observación |
|---|---|---|
| API propia funcional, JSON, códigos correctos y manejo de errores (22) | Cubierto en las pruebas registradas | `GET /courses` y categorías; `400`, `401`, `403`, `404`; respuesta JSON. Rutas y códigos documentados en `docs/api-segundo-avance.md`. |
| PHP puro, POO y MVC (16) | Cubierto por inspección del código | Carpetas `app/Models`, `app/Controllers`, `app/Middleware`, `app/Core`; `router.php` dirige las solicitudes. No se observó framework PHP. |
| Registro, acceso, perfil por rol, contraseña cifrada y bloqueo al tercer intento (12) | Cubierto en las pruebas registradas | `password_hash`/`password_verify`; bloqueo y desbloqueo administrativo registrados en checklist previo; perfil y sesión funcionan. |
| Middleware de sesión/rol antes del controlador (10) | Cubierto y con evidencia | API sin sesión responde 401; sesión de instructor en endpoint administrativo responde 403. Ver capturas 01 y 17. |
| API de terceros integrada y en operación (10) | Cubierto y con evidencia | Carga de avatar a Cloudinary comprobada. Credenciales residen en `config/.env` y no deben compartirse. Ver captura 11. |
| Clase PDO/MySQL con datos aislados en modelos (10) | Cubierto por inspección + MySQL | Conexión centralizada en `app/Core/Database.php`; consultas en modelos; `db/schema.sql` contiene PK/FK. Ver captura 13. |
| Cliente consume API con fetch/promesas, sin recarga y muestra errores (8) | Cubierto por código y flujo comprobado | `js/api-client.js` usa fetch; catálogo/paneles reflejan datos guardados; formularios manejan respuestas visibles. |
| Middleware CORS explícito que permite y rechaza orígenes (6) | Cubierto y con evidencia | `CorsMiddleware` atiende preflight y restringe orígenes. La prueba limpia muestra 204 para el origen permitido y 403 para el ajeno; ver captura 18. |
| Colección Postman/documentación sincronizada con API (6) | Cubierto | Colección JSON contiene 17 solicitudes y contrato escrito en `docs/api-segundo-avance.md`. Se probaron endpoints desde el navegador y CORS desde PowerShell. La rúbrica acepta Postman o herramienta equivalente; no exige una corrida conjunta. |

**Resultado de auditoría:** los nueve criterios del segundo avance y los entregables técnicos revisados están cubiertos. No se ejecutaron juntas las 17 solicitudes, pero se probaron rutas representativas por HTTP en el navegador y PowerShell; la colección y el contrato están incluidos para la revisión.

## Entregables de la segunda entrega

- `db/schema.sql`: crea la base, las tablas, las relaciones y las categorías iniciales; `scripts/seed-demo.php` prepara cuentas/cursos de demostración.
- Proyecto PHP/HTML/JS/CSS con arquitectura MVC.
- API propia y colección Postman.
- Evidencia de Cloudinary y middleware: carpeta `evidencias/segundo-avance/`.
- Videos: los niveles incluyen URL HTTPS y se comprobó que el video abre.

Antes de subir ZIP/RAR, excluye `config/.env` y `importante.txt`; este último es local y contiene credenciales de demostración en texto plano. No incluyas secretos en capturas ni en Git.

## Pendientes de la entrega final, no del segundo avance

El PDF reserva para el tercer avance la operación completa del portal: progreso real, Kardex y filtros completos, ventas con filtros/desglose de pago, comentarios/calificaciones/moderación, mensajes privados, compras/pagos, diplomas automáticos, bajas lógicas e inyección de dependencias. El proyecto todavía no cubre esas funciones completas; algunas pantallas las señalan como no disponibles. No las presento como faltantes de la rúbrica del segundo avance.


