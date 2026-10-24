<?php
declare(strict_types=1);

namespace App\Core;

use App\Controllers\AdminController;
use App\Controllers\AuthController;
use App\Controllers\CategoryController;
use App\Controllers\CourseController;
use App\Controllers\PageController;
use App\Controllers\ProfileController;
use App\Controllers\StudentController;
use App\Controllers\UploadController;
use App\Middleware\AuthMiddleware;
use App\Middleware\CorsMiddleware;
use Throwable;

final class Router
{
    public function dispatch(): never
    {
        (new CorsMiddleware())->handle();
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $path = rawurldecode($path);
        $path = rtrim($path, '/') ?: '/';

        try {
            if (($path === '/' || $path === '/index.html' || str_starts_with($path, '/html/')) && $method === 'GET') {
                (new PageController())->show($path);
            }
            if ($path === '/api' || $path === '/api/v1' || $path === '/api/index.php') {
                ApiResponse::send(['ok' => true, 'name' => 'EduCursos API', 'version' => '1.0', 'docs' => '/docs/api-segundo-avance.md']);
            }
            if ($path === '/api/v1/auth/register' && $method === 'POST') (new AuthController())->register();
            if ($path === '/api/v1/auth/login' && $method === 'POST') (new AuthController())->login();
            if ($path === '/api/v1/auth/logout' && $method === 'POST') {
                (new AuthMiddleware())->requireRole(['estudiante', 'instructor', 'administrador']);
                (new AuthController())->logout();
            }
            if ($path === '/api/v1/auth/me' && $method === 'GET') {
                (new AuthMiddleware())->requireRole(['estudiante', 'instructor', 'administrador']);
                (new AuthController())->me();
            }

            if ($path === '/api/v1/profile' && $method === 'GET') {
                (new AuthMiddleware())->requireRole(['estudiante', 'instructor', 'administrador']);
                (new ProfileController())->show();
            }
            if ($path === '/api/v1/profile' && $method === 'PUT') {
                (new AuthMiddleware())->requireRole(['estudiante', 'instructor', 'administrador']);
                (new ProfileController())->update();
            }

            if ($path === '/api/v1/student/enrollments' && $method === 'GET') {
                $user = (new AuthMiddleware())->requireRole(['estudiante']);
                (new StudentController())->enrollments((int)$user['id']);
            }
            if ($path === '/api/v1/courses' && $method === 'GET') (new CourseController())->index();
            if ($path === '/api/v1/instructor/courses' && $method === 'GET') (new CourseController())->mine();
            if ($path === '/api/v1/courses' && $method === 'POST') {
                (new AuthMiddleware())->requireRole(['instructor', 'administrador']);
                (new CourseController())->create();
            }
            if (preg_match('#^/api/v1/courses/(\\d+)$#', $path, $match) && $method === 'GET') {
                (new CourseController())->show((int)$match[1]);
            }

            if ($path === '/api/v1/categories' && $method === 'GET') (new CategoryController())->index();
            if ($path === '/api/v1/categories' && $method === 'POST') {
                (new AuthMiddleware())->requireRole(['administrador']);
                (new CategoryController())->create();
            }
            if ($path === '/api/v1/admin/reports/users' && $method === 'GET') {
                (new AuthMiddleware())->requireRole(['administrador']);
                (new AdminController())->report((string)($_GET['role'] ?? ''));
            }
            if ($path === '/api/v1/admin/users' && $method === 'GET') {
                (new AuthMiddleware())->requireRole(['administrador']);
                (new AdminController())->users();
            }
            if (preg_match('#^/api/v1/admin/users/(\\d+)/unlock$#', $path, $match) && $method === 'POST') {
                (new AuthMiddleware())->requireRole(['administrador']);
                (new AdminController())->unlock((int)$match[1]);
            }
            if ($path === '/api/v1/uploads/image' && $method === 'POST') {
                (new AuthMiddleware())->requireRole(['estudiante', 'instructor', 'administrador']);
                (new UploadController())->image();
            }

            $knownPath = in_array($path, [
                '/api/v1/auth/register', '/api/v1/auth/login', '/api/v1/auth/logout', '/api/v1/auth/me',
                '/api/v1/profile', '/api/v1/student/enrollments', '/api/v1/courses', '/api/v1/categories', '/api/v1/instructor/courses',
                '/api/v1/admin/users', '/api/v1/admin/reports/users', '/api/v1/uploads/image',
            ], true) || preg_match('#^/api/v1/(courses/\\d+|admin/users/\\d+/unlock)$#', $path);
            if ($knownPath) ApiResponse::error('Método HTTP no permitido para esta ruta.', 405);
            ApiResponse::error('Ruta no encontrada.', 404);
        } catch (Throwable $e) {
            error_log((string)$e);
            if ($e->getCode() === 503) ApiResponse::error($e->getMessage(), 503);
            ApiResponse::error($e->getMessage() === 'No fue posible conectar con la base de datos. Revisa config/.env y ejecuta db/schema.sql.'
                ? $e->getMessage() : 'Ocurrió un error interno. Intenta de nuevo más tarde.', 500);
        }
    }
}
