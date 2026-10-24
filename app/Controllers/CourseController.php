<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiResponse;
use App\Middleware\AuthMiddleware;
use App\Models\CourseModel;
use App\Models\CategoryModel;

final class CourseController
{
    public function index(): never
    {
        $from = trim((string)($_GET['from'] ?? ''));
        $to = trim((string)($_GET['to'] ?? ''));
        foreach (['from' => $from, 'to' => $to] as $key => $value) {
            if ($value !== '' && !$this->validDate($value)) ApiResponse::error("El filtro $key debe usar el formato AAAA-MM-DD.", 400);
        }
        if ($from && $to && $from > $to) ApiResponse::error('La fecha inicial no puede ser posterior a la fecha final.', 400);
        $filters = [
            'category' => trim((string)($_GET['category'] ?? '')),
            'q' => substr(trim((string)($_GET['q'] ?? '')), 0, 120),
            'instructor' => substr(trim((string)($_GET['instructor'] ?? '')), 0, 120),
            'from' => $from, 'to' => $to,
        ];
        if ($filters['category'] !== '' && !ctype_digit($filters['category'])) ApiResponse::error('category debe ser un número entero.', 400);
        ApiResponse::send(['ok' => true, 'total' => count($courses = (new CourseModel())->list($filters)), 'data' => $courses]);
    }

    public function show(int $id): never
    {
        $course = (new CourseModel())->find($id);
        if (!$course) ApiResponse::error('Curso no encontrado o inactivo.', 404);
        ApiResponse::send(['ok' => true, 'data' => $course]);
    }

    public function mine(): never
    {
        $user = (new AuthMiddleware())->requireRole(['instructor', 'administrador']);
        $courses = (new CourseModel())->listByInstructor((int)$user['id']);
        ApiResponse::send(['ok' => true, 'total' => count($courses), 'data' => $courses]);
    }

    public function create(): never
    {
        $user = (new AuthMiddleware())->requireRole(['instructor', 'administrador']);
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) ApiResponse::error('El cuerpo debe ser JSON válido.', 400);
        $title = trim((string)($data['title'] ?? ''));
        $description = trim((string)($data['description'] ?? ''));
        $categoryId = filter_var($data['category_id'] ?? null, FILTER_VALIDATE_INT);
        $price = filter_var($data['price'] ?? null, FILTER_VALIDATE_FLOAT);
        $levels = $data['levels'] ?? null;
        if (strlen($title) < 5 || strlen($title) > 180 || strlen($description) < 20 ||
            !$categoryId || !$price && $price !== 0.0 || $price < 0 || !is_array($levels) || count($levels) < 1) {
            ApiResponse::error('Título, descripción (mín. 20), categoría, precio y al menos un nivel son obligatorios.', 400);
        }
        if (!(new CategoryModel())->exists((int)$categoryId)) ApiResponse::error('La categoría indicada no existe.', 400);
        $imageUrl = trim((string)($data['image_url'] ?? ''));
        if ($imageUrl !== '' && (!filter_var($imageUrl, FILTER_VALIDATE_URL) || !preg_match('#^https://#i', $imageUrl))) {
            ApiResponse::error('image_url debe ser una dirección HTTPS válida.', 400);
        }
        $normalizedLevels = [];
        foreach ($levels as $index => $level) {
            if (!is_array($level)) ApiResponse::error('Cada nivel debe ser un objeto JSON.', 400);
            $levelTitle = trim((string)($level['title'] ?? ''));
            $video = trim((string)($level['video_url'] ?? ''));
            if ($levelTitle === '' || !filter_var($video, FILTER_VALIDATE_URL) || !preg_match('#^https://#i', $video)) {
                ApiResponse::error('Cada nivel requiere un título y una URL de video HTTPS válida. Nivel ' . ($index + 1) . '.', 400);
            }
            $levelPrice = isset($level['price']) ? filter_var($level['price'], FILTER_VALIDATE_FLOAT) : null;
            if (isset($level['price']) && ($levelPrice === false || $levelPrice < 0)) {
                ApiResponse::error('El costo de cada nivel debe ser un número igual o mayor que cero.', 400);
            }
            $normalizedLevels[] = [
                'title' => substr($levelTitle, 0, 180),
                'description' => substr(trim((string)($level['description'] ?? '')), 0, 3000),
                'video_url' => $video, 'price' => $levelPrice,
            ];
        }
        $id = (new CourseModel())->create([
            'title' => $title, 'description' => $description, 'category_id' => (int)$categoryId,
            'price' => (float)$price, 'image_url' => $imageUrl ?: null, 'levels' => $normalizedLevels,
        ], (int)$user['id']);
        ApiResponse::send(['ok' => true, 'message' => 'Curso creado.', 'data' => ['id' => $id]], 201);
    }

    private function validDate(string $date): bool
    {
        $d = \DateTimeImmutable::createFromFormat('!Y-m-d', $date);
        return $d !== false && $d->format('Y-m-d') === $date;
    }
}

