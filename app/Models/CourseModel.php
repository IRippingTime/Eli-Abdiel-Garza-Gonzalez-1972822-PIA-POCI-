<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use PDO;

final class CourseModel
{
    public function list(array $filters = []): array
    {
        $sql = 'SELECT c.id, c.title, c.description, c.price, c.image_url, c.published_at,
                       cat.id AS category_id, cat.name AS category, u.full_name AS instructor,
                       (SELECT COUNT(*) FROM course_levels l WHERE l.course_id = c.id) AS level_count
                FROM courses c JOIN categories cat ON cat.id = c.category_id
                JOIN users u ON u.id = c.instructor_id
                WHERE c.is_active = 1';
        $params = [];
        if (!empty($filters['category'])) { $sql .= ' AND c.category_id = :category'; $params['category'] = (int)$filters['category']; }
        if (!empty($filters['q'])) { $sql .= ' AND c.title LIKE :q'; $params['q'] = '%' . $filters['q'] . '%'; }
        if (!empty($filters['instructor'])) { $sql .= ' AND u.full_name LIKE :instructor'; $params['instructor'] = '%' . $filters['instructor'] . '%'; }
        if (!empty($filters['from'])) { $sql .= ' AND DATE(c.published_at) >= :from_date'; $params['from_date'] = $filters['from']; }
        if (!empty($filters['to'])) { $sql .= ' AND DATE(c.published_at) <= :to_date'; $params['to_date'] = $filters['to']; }
        $sql .= ' ORDER BY c.published_at DESC, c.id DESC';
        $stmt = Database::connection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = Database::connection()->prepare(
            'SELECT c.id, c.title, c.description, c.price, c.image_url, c.published_at, c.instructor_id,
                    cat.id AS category_id, cat.name AS category, u.full_name AS instructor
             FROM courses c JOIN categories cat ON cat.id = c.category_id
             JOIN users u ON u.id = c.instructor_id WHERE c.id = :id AND c.is_active = 1'
        );
        $stmt->execute(['id' => $id]);
        $course = $stmt->fetch();
        if (!$course) return null;
        $levels = Database::connection()->prepare('SELECT id, title, description, video_url, price FROM course_levels WHERE course_id = :course_id ORDER BY position');
        $levels->execute(['course_id' => $id]);
        $course['levels'] = $levels->fetchAll();
        $course['level_count'] = count($course['levels']);
        return $course;
    }

    public function idByTitle(string $title): ?int
    {
        $stmt = Database::connection()->prepare('SELECT id FROM courses WHERE title = :title LIMIT 1');
        $stmt->execute(['title' => $title]);
        $id = $stmt->fetchColumn();
        return $id === false ? null : (int)$id;
    }
    public function listByInstructor(int $instructorId): array
    {
        $stmt = Database::connection()->prepare(
            'SELECT c.id, c.title, c.price, c.is_active, c.published_at,
                    cat.name AS category,
                    (SELECT COUNT(*) FROM course_levels l WHERE l.course_id = c.id) AS level_count
             FROM courses c JOIN categories cat ON cat.id = c.category_id
             WHERE c.instructor_id = :instructor_id
             ORDER BY c.published_at DESC, c.id DESC'
        );
        $stmt->execute(['instructor_id' => $instructorId]);
        return $stmt->fetchAll();
    }
    public function create(array $data, int $instructorId): int
    {
        $pdo = Database::connection();
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare('INSERT INTO courses (title, description, category_id, instructor_id, price, image_url) VALUES (:title,:description,:category_id,:instructor_id,:price,:image_url)');
            $stmt->execute([
                'title' => $data['title'], 'description' => $data['description'],
                'category_id' => $data['category_id'], 'instructor_id' => $instructorId,
                'price' => $data['price'], 'image_url' => $data['image_url'] ?? null,
            ]);
            $courseId = (int)$pdo->lastInsertId();
            $level = $pdo->prepare('INSERT INTO course_levels (course_id, position, title, description, video_url, price) VALUES (:course_id,:position,:title,:description,:video_url,:price)');
            foreach ($data['levels'] as $i => $item) {
                $level->execute([
                    'course_id' => $courseId, 'position' => $i + 1, 'title' => $item['title'],
                    'description' => $item['description'] ?? '', 'video_url' => $item['video_url'],
                    'price' => $item['price'] ?? null,
                ]);
            }
            $pdo->commit();
            return $courseId;
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            throw $e;
        }
    }
}

