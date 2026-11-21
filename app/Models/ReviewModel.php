<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class ReviewModel
{
    public function listForCourse(int $courseId): array
    {
        $stmt = Database::connection()->prepare("SELECT r.id, r.rating, CASE WHEN r.deleted_at IS NULL THEN r.comment ELSE NULL END AS comment, r.created_at, r.deleted_at, u.full_name, u.avatar_url FROM course_reviews r JOIN enrollments e ON e.id=r.enrollment_id JOIN users u ON u.id=e.student_id WHERE e.course_id=:course ORDER BY r.created_at DESC");
        $stmt->execute(['course' => $courseId]);
        return $stmt->fetchAll();
    }

    public function create(int $studentId, int $enrollmentId, int $rating, string $comment): int
    {
        $pdo = Database::connection();
        $check = $pdo->prepare('SELECT id FROM enrollments WHERE id=:id AND student_id=:student AND completed_at IS NOT NULL');
        $check->execute(['id' => $enrollmentId, 'student' => $studentId]);
        if (!$check->fetchColumn()) throw new \DomainException('Solo puedes opinar sobre cursos que hayas terminado.');
        $existing = $pdo->prepare('SELECT 1 FROM course_reviews WHERE enrollment_id=:id');
        $existing->execute(['id' => $enrollmentId]);
        if ($existing->fetchColumn()) throw new \DomainException('Ya existe una opinión para esta inscripción.');
        $stmt = $pdo->prepare('INSERT INTO course_reviews (enrollment_id,rating,comment) VALUES (:enrollment,:rating,:comment)');
        $stmt->execute(['enrollment' => $enrollmentId, 'rating' => $rating, 'comment' => $comment]);
        return (int)$pdo->lastInsertId();
    }

    public function moderate(int $id, string $reason): bool
    {
        $stmt = Database::connection()->prepare('UPDATE course_reviews SET deleted_at=NOW(), deletion_reason=:reason WHERE id=:id AND deleted_at IS NULL');
        $stmt->execute(['id' => $id, 'reason' => $reason]);
        return $stmt->rowCount() > 0;
    }

    public function moderationQueue(): array
    {
        return Database::connection()->query('SELECT r.id, r.rating, r.comment, r.created_at, u.full_name, c.title AS course_title FROM course_reviews r JOIN enrollments e ON e.id=r.enrollment_id JOIN users u ON u.id=e.student_id JOIN courses c ON c.id=e.course_id ORDER BY r.created_at DESC')->fetchAll();
    }
}



