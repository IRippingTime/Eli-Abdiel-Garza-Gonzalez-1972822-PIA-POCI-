<?php
declare(strict_types=1);

use App\Core\Env;

define('APP_ROOT', dirname(__DIR__));
spl_autoload_register(static function (string $class): void {
    $prefix = 'App\\';
    if (!str_starts_with($class, $prefix)) return;
    $relative = str_replace('\\', DIRECTORY_SEPARATOR, substr($class, strlen($prefix)));
    $file = APP_ROOT . DIRECTORY_SEPARATOR . 'app' . DIRECTORY_SEPARATOR . $relative . '.php';
    if (is_file($file)) require $file;
});

Env::load(APP_ROOT . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . '.env');
date_default_timezone_set(Env::get('APP_TIMEZONE', 'America/Monterrey') ?? 'America/Monterrey');
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_name('educursos_session');
    session_set_cookie_params([
        'httponly' => true,
        'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        'samesite' => 'Lax',
        'path' => '/',
    ]);
    session_start();
}

return new App\Core\Router();

