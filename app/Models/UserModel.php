<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;

final class UserModel
{
    public function create(array $data): int
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare('INSERT INTO users (full_name, gender, birth_date, email, password_hash, role, avatar_url, is_active) VALUES (:full_name,:gender,:birth_date,:email,:password_hash,:role,:avatar_url,1)');
        $stmt->execute([
            'full_name' => $data['full_name'], 'gender' => $data['gender'], 'birth_date' => $data['birth_date'],
            'email' => strtolower($data['email']), 'password_hash' => password_hash($data['password'], PASSWORD_DEFAULT),
            'role' => $data['role'], 'avatar_url' => $data['avatar_url'] ?? null,
        ]);
        return (int)$pdo->lastInsertId();
    }

    public function createAdmin(string $name, string $email, string $password): int
    {
        return $this->create([
            'full_name' => $name, 'gender' => 'Otro', 'birth_date' => '2000-01-01',
            'email' => $email, 'password' => $password, 'role' => 'administrador', 'avatar_url' => null,
        ]);
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = Database::connection()->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => strtolower($email)]);
        return $stmt->fetch() ?: null;
    }

    public function authenticate(string $email, string $password): array
    {
        $pdo = Database::connection();
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email FOR UPDATE');
            $stmt->execute(['email' => strtolower($email)]);
            $user = $stmt->fetch();
            if (!$user) {
                $pdo->commit();
                return ['ok' => false, 'reason' => 'invalid', 'attempts' => 1];
            }
            if (!(bool)$user['is_active']) {
                $pdo->commit();
                return ['ok' => false, 'reason' => 'disabled', 'attempts' => (int)$user['failed_attempts']];
            }
            if (!password_verify($password, $user['password_hash'])) {
                $attempts = (int)$user['failed_attempts'] + 1;
                $disabled = $attempts >= 3;
                $update = $pdo->prepare('UPDATE users SET failed_attempts = :attempts, is_active = :active WHERE id = :id');
                $update->execute(['attempts' => $attempts, 'active' => $disabled ? 0 : 1, 'id' => $user['id']]);
                $pdo->commit();
                return ['ok' => false, 'reason' => $disabled ? 'disabled_now' : 'invalid', 'attempts' => $attempts];
            }
            $update = $pdo->prepare('UPDATE users SET failed_attempts = 0, last_login_at = NOW() WHERE id = :id');
            $update->execute(['id' => $user['id']]);
            $pdo->commit();
            unset($user['password_hash'], $user['failed_attempts']);
            $user['is_active'] = (bool)$user['is_active'];
            return ['ok' => true, 'user' => $user];
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            throw $e;
        }
    }

    public function findPublicById(int $id): ?array
    {
        $stmt = Database::connection()->prepare('SELECT id, full_name, gender, birth_date, email, role, avatar_url, created_at, updated_at FROM users WHERE id = :id');
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function updateProfile(int $id, array $data): void
    {
        $stmt = Database::connection()->prepare('UPDATE users SET full_name=:full_name, gender=:gender, birth_date=:birth_date, avatar_url=:avatar_url WHERE id=:id');
        $stmt->execute([
            'full_name' => $data['full_name'], 'gender' => $data['gender'], 'birth_date' => $data['birth_date'],
            'avatar_url' => $data['avatar_url'] ?? null, 'id' => $id,
        ]);
    }

    public function listForAdmin(): array
    {
        return Database::connection()->query('SELECT id, full_name, email, role, is_active, failed_attempts, created_at FROM users ORDER BY created_at DESC')->fetchAll();
    }

    public function activeReportByRole(string $role): array
    {
        if ($role === 'instructor') {
            $sql = 'SELECT u.id, u.full_name, u.email, u.created_at,
                           (SELECT COUNT(*) FROM courses c WHERE c.instructor_id = u.id) AS course_count
                    FROM users u WHERE u.role = :role AND u.is_active = 1 ORDER BY u.created_at DESC';
        } else {
            $sql = 'SELECT u.id, u.full_name, u.email, u.created_at,
                           (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = u.id) AS enrollment_count,
                           (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = u.id AND e.completed_at IS NOT NULL) AS completed_count
                    FROM users u WHERE u.role = :role AND u.is_active = 1 ORDER BY u.created_at DESC';
        }
        $stmt = Database::connection()->prepare($sql);
        $stmt->execute(['role' => $role]);
        return $stmt->fetchAll();
    }
    public function unlock(int $id): bool
    {
        $stmt = Database::connection()->prepare('UPDATE users SET is_active=1, failed_attempts=0 WHERE id=:id');
        $stmt->execute(['id' => $id]);
        if ($stmt->rowCount() > 0) return true;
        $check = Database::connection()->prepare('SELECT 1 FROM users WHERE id=:id');
        $check->execute(['id' => $id]);
        return (bool)$check->fetchColumn();
    }
}
