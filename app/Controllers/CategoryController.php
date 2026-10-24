<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiResponse;
use App\Middleware\AuthMiddleware;
use App\Models\CategoryModel;

final class CategoryController
{
    public function index(): never
    {
        ApiResponse::send(['ok' => true, 'data' => (new CategoryModel())->all()]);
    }

    public function create(): never
    {
        $user = (new AuthMiddleware())->requireRole(['administrador']);
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) ApiResponse::error('El cuerpo debe ser JSON válido.', 400);
        $name = trim((string)($data['name'] ?? ''));
        $description = trim((string)($data['description'] ?? ''));
        if (strlen($name) < 2 || strlen($name) > 100) ApiResponse::error('El nombre debe tener entre 2 y 100 caracteres.', 400);
        try {
            $id = (new CategoryModel())->create($name, $description ?: null, (int)$user['id']);
            ApiResponse::send(['ok' => true, 'message' => 'Categoría creada.', 'data' => ['id' => $id]], 201);
        } catch (\Throwable $e) {
            error_log((string)$e);
            ApiResponse::error('No se pudo crear la categoría; verifica si ya existe.', 400);
        }
    }
}

