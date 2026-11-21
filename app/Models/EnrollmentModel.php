<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;
use App\Contracts\EnrollmentRepository;

final class EnrollmentModel implements EnrollmentRepository
{
    public function enroll(int $studentId, int $courseId): int
    {
        $pdo = Database::connection();
        $course = $pdo->prepare('SELECT id, price FROM courses WHERE id = :id AND is_active = 1');
        $course->execute(['id' => $courseId]);
        $row = $course->fetch();
        if (!$row) throw new \DomainException('Curso no encontrado o inactivo.');
        $existing = $pdo->prepare('SELECT id FROM enrollments WHERE student_id = :student AND course_id = :course');
        $existing->execute(['student' => $studentId, 'course' => $courseId]);
        if ($id = $existing->fetchColumn()) return (int)$id;
        if ((float)$row['price'] > 0) throw new \DomainException('Este curso tiene costo. Debes completar la compra antes de inscribirte.');
        $stmt = $pdo->prepare('INSERT INTO enrollments (student_id, course_id) VALUES (:student, :course)');
        $stmt->execute(['student' => $studentId, 'course' => $courseId]);
        return (int)$pdo->lastInsertId();
    }

    public function completeLevel(int $studentId, int $enrollmentId, int $levelId): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->prepare('SELECT e.id, e.course_id, l.id AS level_id, (SELECT COUNT(*) FROM course_levels WHERE course_id=e.course_id) AS total_levels FROM enrollments e JOIN course_levels l ON l.course_id=e.course_id AND l.id=:level WHERE e.id=:enrollment AND e.student_id=:student');
        $stmt->execute(['level' => $levelId, 'enrollment' => $enrollmentId, 'student' => $studentId]);
        $row = $stmt->fetch();
        if (!$row) throw new \DomainException('La inscripción o el nivel no existe para esta cuenta.');
        $access = $pdo->prepare("SELECT c.price, EXISTS(SELECT 1 FROM payments p WHERE p.enrollment_id=e.id AND p.status='pagado') AS paid FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.id=:id");
        $access->execute(['id' => $enrollmentId]);
        $payment = $access->fetch();
        if ((float)$payment['price'] > 0 && !(bool)$payment['paid']) throw new \DomainException('El pago del curso sigue pendiente de confirmación.');
        $save = $pdo->prepare('INSERT IGNORE INTO enrollment_levels (enrollment_id, level_id) VALUES (:enrollment, :level)');
        $save->execute(['enrollment' => $enrollmentId, 'level' => $levelId]);
        $count = $pdo->prepare('SELECT COUNT(*) FROM enrollment_levels WHERE enrollment_id=:id');
        $count->execute(['id' => $enrollmentId]);
        $done = (int)$count->fetchColumn();
        $total = (int)$row['total_levels'];
        $percent = $total ? min(100, round($done * 100 / $total, 2)) : 0;
        $update = $pdo->prepare('UPDATE enrollments SET progress_percent=:progress, last_accessed_at=NOW(), completed_at=IF(:is_complete=1,COALESCE(completed_at,NOW()),NULL) WHERE id=:id');
        $update->execute(['progress' => $percent, 'is_complete' => $percent >= 100 ? 1 : 0, 'id' => $enrollmentId]);
        return ['progress_percent' => $percent, 'completed_levels' => $done, 'total_levels' => $total, 'completed_at' => $percent >= 100];
    }

    public function listForStudent(int $studentId): array
    {
        $stmt = Database::connection()->prepare(
            'SELECT e.id, e.enrolled_at, e.last_accessed_at, e.completed_at, e.progress_percent,
                    (SELECT GROUP_CONCAT(el.level_id) FROM enrollment_levels el WHERE el.enrollment_id=e.id) AS completed_level_ids,
                    (SELECT r.id FROM course_reviews r WHERE r.enrollment_id=e.id) AS review_id,
                    c.id AS course_id, c.title AS course_title, c.is_active AS course_is_active,
                    CASE WHEN c.price=0 THEN 1 WHEN EXISTS(SELECT 1 FROM payments p WHERE p.enrollment_id=e.id AND p.status=\'pagado\') THEN 1 ELSE 0 END AS access_granted,
                    cat.name AS category, instructor.full_name AS instructor_name,
                    (SELECT COUNT(*) FROM course_levels l WHERE l.course_id = c.id) AS level_count
             FROM enrollments e
             JOIN courses c ON c.id = e.course_id
             JOIN categories cat ON cat.id = c.category_id
             JOIN users instructor ON instructor.id=c.instructor_id
             WHERE e.student_id = :student_id
             ORDER BY e.enrolled_at DESC, e.id DESC'
        );
        $stmt->execute(['student_id' => $studentId]);
        return $stmt->fetchAll();
    }
}




