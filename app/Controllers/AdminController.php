<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiResponse;
use App\Models\UserModel;

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
}
