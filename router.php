<?php
declare(strict_types=1);

// CSS, JavaScript, imágenes y documentación son recursos estáticos. Las páginas
// HTML y las rutas API pasan por el front controller para llegar a sus controladores.
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
if (preg_match('#^/(css|js|img|docs)/#', $path)) {
    $candidate = realpath(__DIR__ . $path);
    $base = realpath(__DIR__);
    if ($candidate && $base && str_starts_with($candidate, $base . DIRECTORY_SEPARATOR) && is_file($candidate)) {
        return false;
    }
}
$router = require __DIR__ . '/app/bootstrap.php';
$router->dispatch();
