<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiResponse;
use App\Middleware\AuthMiddleware;
use App\Models\MessageModel;

final class MessageController
{
    public function contacts(): never
    {
        $user = (new AuthMiddleware())->requireRole(['estudiante', 'instructor']);
        ApiResponse::send(['ok' => true, 'data' => (new MessageModel())->contacts((int)$user['id'], (string)$user['role'])]);
    }

    public function conversation(int $otherId): never
    {
        $user = (new AuthMiddleware())->requireRole(['estudiante', 'instructor']);
        ApiResponse::send(['ok' => true, 'data' => (new MessageModel())->conversation((int)$user['id'], $otherId)]);
    }

    public function send(): never
    {
        $user = (new AuthMiddleware())->requireRole(['estudiante', 'instructor']);
        $data = json_decode(file_get_contents('php://input'), true);
        $recipient = is_array($data) ? filter_var($data['recipient_id'] ?? null, FILTER_VALIDATE_INT) : false;
        $body = is_array($data) ? trim((string)($data['body'] ?? '')) : '';
        $course = is_array($data) && isset($data['course_id']) ? filter_var($data['course_id'], FILTER_VALIDATE_INT) : null;
        if (!$recipient || $body === '' || strlen($body) > 4000 || ($course !== null && $course === false)) ApiResponse::error('Destinatario y mensaje (máximo 4000 caracteres) requeridos; course_id debe ser entero.', 400);
        try {
            $id = (new MessageModel())->send((int)$user['id'], (int)$recipient, $body, $course === null ? null : (int)$course);
            ApiResponse::send(['ok' => true, 'message' => 'Mensaje enviado.', 'data' => ['id' => $id]], 201);
        } catch (\DomainException $e) { ApiResponse::error($e->getMessage(), 400); }
    }
}

