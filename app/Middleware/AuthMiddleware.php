<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Core\ApiResponse;

final class AuthMiddleware
{
    public function requireRole(array $roles): array
    {
        $user = $_SESSION['user'] ?? null;
        if (!is_array($user)) ApiResponse::error('Inicia sesión para realizar esta operación.', 401);
        if ($roles && !in_array($user['role'], $roles, true)) ApiResponse::error('Tu rol no tiene permiso para esta operación.', 403);
        return $user;
    }
}

