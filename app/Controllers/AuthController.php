<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiResponse;
use App\Models\UserModel;

final class AuthController
{
    private function input(): array
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) ApiResponse::error('El cuerpo debe ser JSON válido.', 400);
        return $data;
    }

    public function register(): never
    {
        $data = $this->input();
        $name = trim((string)($data['full_name'] ?? ''));
        $email = trim((string)($data['email'] ?? ''));
        $password = (string)($data['password'] ?? '');
        $role = (string)($data['role'] ?? 'estudiante');
        $gender = trim((string)($data['gender'] ?? ''));
        $birthDate = (string)($data['birth_date'] ?? '');
        $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $birthDate);
        if (strlen($name) < 3 || strlen($name) > 160 || !filter_var($email, FILTER_VALIDATE_EMAIL) ||
            strlen($email) > 190 || !preg_match('/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/', $password) ||
            !in_array($role, ['estudiante', 'instructor'], true) || !in_array($gender, ['Femenino','Masculino','Otro'], true) ||
            !$date || $date->format('Y-m-d') !== $birthDate) {
            ApiResponse::error('Revisa nombre, correo, rol, género, fecha y contraseña (8 caracteres, mayúscula, número y símbolo).', 400);
        }
        $users = new UserModel();
        if ($users->findByEmail($email)) ApiResponse::error('Ya existe una cuenta con ese correo.', 400);
        $id = $users->create([
            'full_name' => $name, 'email' => $email, 'password' => $password,
            'role' => $role, 'gender' => $gender, 'birth_date' => $birthDate,
            'avatar_url' => null,
        ]);
        ApiResponse::send(['ok' => true, 'message' => 'Cuenta creada. Ya puedes iniciar sesión.', 'data' => ['id' => $id]], 201);
    }

    public function login(): never
    {
        $data = $this->input();
        $email = trim((string)($data['email'] ?? ''));
        $password = (string)($data['password'] ?? '');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') ApiResponse::error('Ingresa un correo válido y tu contraseña.', 400);
        $result = (new UserModel())->authenticate($email, $password);
        if (!$result['ok']) {
            if ($result['reason'] === 'disabled' || $result['reason'] === 'disabled_now') {
                ApiResponse::error('La cuenta está deshabilitada por tres intentos fallidos. Solicita al administrador que la reactive.', 401);
            }
            ApiResponse::error('Correo o contraseña incorrectos. Intento ' . (int)$result['attempts'] . ' de 3.', 401);
        }
        session_regenerate_id(true);
        $_SESSION['user'] = [
            'id' => (int)$result['user']['id'],
            'full_name' => $result['user']['full_name'],
            'email' => $result['user']['email'],
            'role' => $result['user']['role'],
            'avatar_url' => $result['user']['avatar_url'],
        ];
        session_write_close();
        ApiResponse::send(['ok' => true, 'message' => 'Sesión iniciada.', 'data' => ['user' => $_SESSION['user']]]);
    }

    public function logout(): never
    {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', (bool)$params['secure'], (bool)$params['httponly']);
        }
        session_destroy();
        ApiResponse::send(['ok' => true, 'message' => 'Sesión cerrada.']);
    }

    public function me(): never
    {
        $user = $_SESSION['user'] ?? null;
        if (!$user) ApiResponse::error('No hay una sesión activa.', 401);
        ApiResponse::send(['ok' => true, 'data' => ['user' => $user]]);
    }
}
