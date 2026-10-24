<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiResponse;

final class PageController
{
    public function show(string $path): never
    {
        if ($path === '/') $path = '/index.html';
        if (!preg_match('#^/(?:index\\.html|html/(?:[A-Za-z0-9_-]+/)*[A-Za-z0-9_-]+\\.html)$#', $path)) {
            ApiResponse::error('Página no encontrada.', 404);
        }
        $view = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . ltrim(str_replace('/', DIRECTORY_SEPARATOR, $path), DIRECTORY_SEPARATOR);
        if (!is_file($view)) ApiResponse::error('Página no encontrada.', 404);
        http_response_code(200);
        header('Content-Type: text/html; charset=utf-8');
        readfile($view);
        exit;
    }
}
