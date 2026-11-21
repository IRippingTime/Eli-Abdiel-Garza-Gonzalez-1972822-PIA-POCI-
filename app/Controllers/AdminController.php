<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiResponse;
use App\Models\UserModel;
use App\Models\ReviewModel;

final class AdminController
{
    public function users(): never
    {
        ApiResponse::send(['ok' => true, 'data' => (new UserModel())->listForAdmin()]);
    }

    public function report(string $role): never
    {
        if (!in_array($role, ['instructor', 'estudiante'], true)) {
            ApiResponse::error('role debe ser instructor o estudiante.', 400);
        }
        $rows = (new UserModel())->activeReportByRole($role);
        ApiResponse::send(['ok' => true, 'total' => count($rows), 'data' => $rows]);
    }
    public function unlock(int $id): never
    {
        if (!(new UserModel())->unlock($id)) ApiResponse::error('No se encontró la cuenta.', 404);
        ApiResponse::send(['ok' => true, 'message' => 'Cuenta reactivada y contador de intentos restablecido.']);
    }

    public function reviews(): never
    {
        ApiResponse::send(['ok' => true, 'data' => (new ReviewModel())->moderationQueue()]);
    }

    public function deleteReview(int $id): never
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $reason = is_array($data) ? trim((string)($data['reason'] ?? '')) : '';
        if (strlen($reason) < 3 || strlen($reason) > 500) ApiResponse::error('Indica la causa de eliminación (3 a 500 caracteres).', 400);
        if (!(new ReviewModel())->moderate($id, $reason)) ApiResponse::error('No se encontró un comentario activo.', 404);
        ApiResponse::send(['ok' => true, 'message' => 'Comentario eliminado y causa registrada.']);
    }
}
