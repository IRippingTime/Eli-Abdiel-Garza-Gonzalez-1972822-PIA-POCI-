@echo off
REM EduCursos - Iniciar servidor PHP para revision del Primer Avance
REM Uso: doble clic y abrir http://localhost:8000/index.html y http://localhost:8000/api/index.php
cd /d "%~dp0"
php -S localhost:8000 -t .
pause
