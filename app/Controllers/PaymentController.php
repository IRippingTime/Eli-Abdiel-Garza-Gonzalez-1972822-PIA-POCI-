<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiResponse;
use App\Middleware\AuthMiddleware;
use App\Models\PaymentModel;

final class PaymentController
{
    public function purchase(int $courseId): never
    {
        $user = (new AuthMiddleware())->requireRole(['estudiante']);
        $data = json_decode(file_get_contents('php://input'), true);
        $method = is_array($data) ? (string)($data['payment_method'] ?? '') : '';
        try {
            $id = (new PaymentModel())->requestPurchase((int)$user['id'], $courseId, $method);
            ApiResponse::send(['ok' => true, 'message' => 'Solicitud guardada; queda pendiente de validación del administrador.', 'data' => ['payment_id' => $id, 'status' => 'pendiente']], 201);
        } catch (\DomainException $e) { ApiResponse::error($e->getMessage(), 400); }
    }

    public function sales(string $view): never
    {
        $user = (new AuthMiddleware())->requireRole(['instructor']);
        if (!in_array($view, ['summary', 'detail'], true)) ApiResponse::error('view debe ser summary o detail.', 400);
        $from = trim((string)($_GET['from'] ?? ''));
        $to = trim((string)($_GET['to'] ?? ''));
        foreach (['from' => $from, 'to' => $to] as $key => $value) {
            if ($value !== '' && (!preg_match('/^\\d{4}-\\d{2}-\\d{2}$/', $value) || !strtotime($value))) ApiResponse::error("$key debe usar AAAA-MM-DD.", 400);
        }
        if ($from && $to && $from > $to) ApiResponse::error('La fecha inicial no puede ser posterior a la final.', 400);
        $category = trim((string)($_GET['category'] ?? ''));
        $active = trim((string)($_GET['active'] ?? ''));
        if ($category !== '' && !ctype_digit($category)) ApiResponse::error('category debe ser entero.', 400);
        if ($active !== '' && !in_array($active, ['0','1'], true)) ApiResponse::error('active debe ser 0 o 1.', 400);
        $data = (new PaymentModel())->sales((int)$user['id'], $view, compact('from','to','category','active'));
        ApiResponse::send(['ok' => true, 'total' => count($data), 'data' => $data]);
    }

    public function pending(): never
    {
        (new AuthMiddleware())->requireRole(['administrador']);
        ApiResponse::send(['ok' => true, 'data' => (new PaymentModel())->pending()]);
    }

    public function confirm(int $id): never
    {
        (new AuthMiddleware())->requireRole(['administrador']);
        if (!(new PaymentModel())->confirm($id)) ApiResponse::error('No existe una solicitud pendiente con ese ID.', 404);
        ApiResponse::send(['ok' => true, 'message' => 'Pago confirmado; la inscripción quedó activa.']);
    }
}

