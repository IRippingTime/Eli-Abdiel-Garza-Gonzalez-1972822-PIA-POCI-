<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class EnrollmentModel
{
    public function listForStudent(int $studentId): array
    {
        $stmt = Database::connection()->prepare(
            'SELECT e.id, e.enrolled_at, e.last_accessed_at, e.completed_at, e.progress_percent,
                    c.id AS course_id, c.title AS course_title, c.is_active AS course_is_active,
                    cat.name AS category,
                    (SELECT COUNT(*) FROM course_levels l WHERE l.course_id = c.id) AS level_count
             FROM enrollments e
             JOIN courses c ON c.id = e.course_id
             JOIN categories cat ON cat.id = c.category_id
             WHERE e.student_id = :student_id
             ORDER BY e.enrolled_at DESC, e.id DESC'
        );
        $stmt->execute(['student_id' => $studentId]);
        return $stmt->fetchAll();
    }
}
