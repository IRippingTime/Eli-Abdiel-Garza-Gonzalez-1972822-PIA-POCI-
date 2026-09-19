# Integrantes del equipo:
- Nombre: Elí Abdiel Garza González 
- Matricula: 1972822

# EduCursos - Portal de Cursos en Linea | Primer Avance (PIA POCI)

## Como abrir el prototipo

Opcion 1 (simple): abre `index.html` en el navegador.

Opcion 2 (recomendada, para evidenciar servidor):
```
cd "PIA POCI"
php -S localhost:8000 -t .
```
O doble clic en `iniciar-servidor.bat`.
Luego abre `http://localhost:8000/index.html` y la ruta base `http://localhost:8000/api/index.php` (debe responder JSON con `ok: true` y version de PHP). Evidencia completa en `docs/word/Documentacion-Completa.docx`, Parte 4 (PHP 8.3.33, status 200, MIME application/json).

## Mapa de pantallas (navegacion funcional, todo en `html/`)

- Publica: `html/index.html`, `html/cursos.html` (buscador por categoria, titulo parcial, instructor, rango de fechas), `html/curso-detalle.html?id=101`
- Autenticacion: `html/login.html` (demo password Demo*123, bloqueo simulado a los 3 intentos), `html/registro.html` (valida password 8 + mayuscula + numero + especial)
- Estudiante: `html/estudiante/dashboard.html`, `html/estudiante/kardex.html` (filtros fecha, categoria, terminados, activos)
- Instructor: `html/instructor/dashboard.html`, `html/instructor/crear-curso.html` (video obligatorio por nivel), `html/instructor/ventas.html` (2 vistas + formato moneda y fecha)
- Admin: `html/admin/dashboard.html`, `html/admin/categorias.html`, `html/admin/usuarios.html` (bloqueo/desbloqueo), `html/admin/reportes.html` (instructor y estudiante, solo activos)
- Comunes: `html/mensajes.html` (fecha/hora, avatar), `html/perfil.html` (editable sin cambiar ID), `html/diploma.html` (maqueta con fecha, alumno, curso y quien certifica)
- Diagrama: `docs/arquitectura-tres-capas.svg` (se abre directo en el navegador)
- Entrada: `index.html` (redirige a `html/index.html`)

## Separacion de archivos por tipo

- HTML: `html/` + `html/estudiante/`, `html/instructor/`, `html/admin/`
- CSS: `css/styles.css` 
- JS: `js/data.js` (mock), `js/app.js` (listados y filtros), `js/validaciones.js` (login, registro, perfil, curso)
- PHP ruta base: `api/index.php`
- Documentos Word para entregar: `docs/word/Documentacion-Completa.docx` (todo en uno, por partes)

## Documentos de entrega (Word)

- `docs/word/Documentacion-Completa.docx` con las 4 partes:
  1. Contrato de la API propia
  2. Arquitectura MVC + diagrama `docs/arquitectura-tres-capas.svg`
  3. API de terceros
  4. Servidor PHP

## Credenciales demo

- Login demo acepta cualquier correo valido + password `Demo*123`. Elige rol para redirigir al panel correspondiente.
- Registro valida todos los campos en JS antes de aceptar.
