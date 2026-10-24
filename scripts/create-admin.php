<?php
declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';

use App\Models\UserModel;

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Este script solo se ejecuta desde la terminal.\n");
    exit(1);
}
$email = trim((string)readline('Correo del administrador: '));
$name = trim((string)readline('Nombre completo: '));
$password = (string)readline('Contraseña (mínimo 8, mayúscula, número y símbolo): ');
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($name) < 3 ||
    !preg_match('/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/', $password)) {
    fwrite(STDERR, "Datos inválidos. No se creó la cuenta.\n");
    exit(1);
}
$users = new UserModel();
if ($users->findByEmail($email)) {
    fwrite(STDERR, "Ya existe una cuenta con ese correo.\n");
    exit(1);
}
$users->createAdmin($name, $email, $password);
fwrite(STDOUT, "Administrador creado correctamente.\n");
