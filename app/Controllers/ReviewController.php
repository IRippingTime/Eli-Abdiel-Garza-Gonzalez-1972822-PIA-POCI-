<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiResponse;
use App\Middleware\AuthMiddleware;
use App\Models\ReviewModel;

final class ReviewController
{
    public function index(int $courseId): never
    {
        $rows = (new ReviewModel())->listForCourse($courseId);
        $active = array_values(array_filter($rows, fn($row) => $row['deleted_at'] === null));
        $average = count($active) ? round(array_sum(array_column($active, 'rating')) / count($active), 2) : null;
        ApiResponse::send(['ok' => true, 'average_rating' => $average, 'total' => count($active), 'data' => $rows]);
    }

    public function create(): never
    {
        $user = (new AuthMiddleware())->requireRole(['estudiante']);
        $data = json_decode(file_get_contents('php://input'), true);
        $enrollment = is_array($data) ? filter_var($data['enrollment_id'] ?? null, FILTER_VALIDATE_INT) : false;
        $rating = is_array($data) ? filter_var($data['rating'] ?? null, FILTER_VALIDATE_INT) : false;
        $comment = is_array($data) ? trim((string)($data['comment'] ?? '')) : '';
        if (!$enrollment || !$rating || $rating < 1 || $rating > 5 || $comment === '' || strlen($comment) > 2000) ApiResponse::error('enrollment_id, una calificación de 1 a 5 y un comentario de hasta 2000 caracteres son obligatorios.', 400);
        try {
            $id = (new ReviewModel())->create((int)$user['id'], (int)$enrollment, (int)$rating, $comment);
            ApiResponse::send(['ok' => true, 'message' => 'Comentario registrado.', 'data' => ['id' => $id]], 201);
        } catch (\DomainException $e) { ApiResponse::error($e->getMessage(), 403); }
    }
}

