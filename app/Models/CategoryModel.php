<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class CategoryModel
{
    public function all(): array
    {
        return Database::connection()->query('SELECT c.id, c.name, c.description, c.created_at, c.created_by, u.full_name AS created_by_name FROM categories c LEFT JOIN users u ON u.id = c.created_by ORDER BY c.name')->fetchAll();
    }

    public function create(string $name, ?string $description, int $creatorId): int
    {
        $stmt = Database::connection()->prepare('INSERT INTO categories (name, description, created_by) VALUES (:name,:description,:created_by)');
        $stmt->execute(['name' => $name, 'description' => $description, 'created_by' => $creatorId]);
        return (int)Database::connection()->lastInsertId();
    }

    public function exists(int $id): bool
    {
        $stmt = Database::connection()->prepare('SELECT 1 FROM categories WHERE id = :id');
        $stmt->execute(['id' => $id]);
        return (bool)$stmt->fetchColumn();
    }
}

