@echo off
REM Inicia el servidor local y habilita OpenSSL para conectar con Cloudinary.
cd /d "%~dp0"
php -d extension=php_openssl.dll -d extension=php_fileinfo.dll -S localhost:8000 router.php
pause
