<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiResponse;
use App\Middleware\AuthMiddleware;
use App\Models\UserModel;

final class ProfileController
{
    public function show(): never
    {
        $user = (new AuthMiddleware())->requireRole(['estudiante', 'instructor', 'administrador']);
        $profile = (new UserModel())->findPublicById((int)$user['id']);
        ApiResponse::send(['ok' => true, 'data' => $profile]);
    }

    public function update(): never
    {
        $user = (new AuthMiddleware())->requireRole(['estudiante', 'instructor', 'administrador']);
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) ApiResponse::error('El cuerpo debe ser JSON válido.', 400);
        $name = trim((string)($data['full_name'] ?? ''));
        $gender = (string)($data['gender'] ?? '');
        $birthDate = (string)($data['birth_date'] ?? '');
        $avatar = trim((string)($data['avatar_url'] ?? ''));
        $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $birthDate);
        if (strlen($name) < 3 || !in_array($gender, ['Femenino','Masculino','Otro'], true) ||
            !$date || $date->format('Y-m-d') !== $birthDate) {
            ApiResponse::error('Nombre, género y fecha de nacimiento son obligatorios y deben ser válidos.', 400);
        }
        if ($avatar !== '' && (!filter_var($avatar, FILTER_VALIDATE_URL) || !preg_match('#^https://#i', $avatar))) {
            ApiResponse::error('avatar_url debe ser una dirección HTTPS válida.', 400);
        }
        (new UserModel())->updateProfile((int)$user['id'], [
            'full_name' => $name, 'gender' => $gender, 'birth_date' => $birthDate, 'avatar_url' => $avatar ?: null,
        ]);
        $_SESSION['user']['full_name'] = $name;
        $_SESSION['user']['avatar_url'] = $avatar ?: null;
        ApiResponse::send(['ok' => true, 'message' => 'Perfil actualizado.', 'data' => $_SESSION['user']]);
    }
}
