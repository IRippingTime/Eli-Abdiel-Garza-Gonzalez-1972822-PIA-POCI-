<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Core\ApiResponse;
use App\Core\Env;

final class CorsMiddleware
{
    public function handle(): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowed = array_filter(array_map('trim', explode(',', Env::get('CORS_ALLOWED_ORIGINS', 'http://localhost:8000,http://127.0.0.1:8000') ?? '')));
        if ($origin !== '' && !in_array($origin, $allowed, true)) {
            ApiResponse::error('Origen no autorizado por CORS.', 403);
        }
        if ($origin !== '') {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Vary: Origin');
            header('Access-Control-Allow-Credentials: true');
        }
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With');
        header('Access-Control-Max-Age: 600');
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}

