<?php
declare(strict_types=1);

namespace App\Models;

use App\Core\Database;

final class PaymentModel
{
    public function requestPurchase(int $studentId, int $courseId, string $method): int
    {
        if (!in_array($method, ['transferencia', 'tarjeta'], true)) throw new \DomainException('Elige transferencia o tarjeta.');
        $pdo = Database::connection();
        $course = $pdo->prepare('SELECT price FROM courses WHERE id=:id AND is_active=1');
        $course->execute(['id' => $courseId]);
        $price = $course->fetchColumn();
        if ($price === false) throw new \DomainException('Curso no encontrado o inactivo.');
        if ((float)$price <= 0) throw new \DomainException('Este curso es gratuito; inscríbete desde el catálogo.');
        $pdo->beginTransaction();
        try {
            $find = $pdo->prepare('SELECT id FROM enrollments WHERE student_id=:student AND course_id=:course');
            $find->execute(['student' => $studentId, 'course' => $courseId]);
            $enrollmentId = $find->fetchColumn();
            if (!$enrollmentId) {
                $insert = $pdo->prepare('INSERT INTO enrollments (student_id,course_id) VALUES (:student,:course)');
                $insert->execute(['student' => $studentId, 'course' => $courseId]);
                $enrollmentId = $pdo->lastInsertId();
            }
            $paid = $pdo->prepare("SELECT id FROM payments WHERE enrollment_id=:enrollment AND status='pagado'");
            $paid->execute(['enrollment' => $enrollmentId]);
            if ($paid->fetchColumn()) throw new \DomainException('Este curso ya está pagado en tu cuenta.');
            $pending = $pdo->prepare("SELECT id FROM payments WHERE enrollment_id=:enrollment AND status='pendiente'");
            $pending->execute(['enrollment' => $enrollmentId]);
            if ($pending->fetchColumn()) throw new \DomainException('Ya tienes una solicitud de pago pendiente para este curso.');
            $pay = $pdo->prepare("INSERT INTO payments (enrollment_id,amount,payment_method,status) VALUES (:enrollment,:amount,:method,'pendiente')");
            $pay->execute(['enrollment' => $enrollmentId, 'amount' => $price, 'method' => $method]);
            $id = (int)$pdo->lastInsertId();
            $pdo->commit();
            return $id;
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            throw $e;
        }
    }

    public function pending(): array
    {
        return Database::connection()->query("SELECT p.id,p.amount,p.payment_method,p.created_at,u.full_name,c.title AS course_title FROM payments p JOIN enrollments e ON e.id=p.enrollment_id JOIN users u ON u.id=e.student_id JOIN courses c ON c.id=e.course_id WHERE p.status='pendiente' ORDER BY p.created_at")->fetchAll();
    }

    public function confirm(int $id): bool
    {
        $stmt = Database::connection()->prepare("UPDATE payments SET status='pagado',confirmed_at=NOW() WHERE id=:id AND status='pendiente'");
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;
    }

    public function sales(int $instructorId, string $view, array $filters): array
    {
        $params = ['instructor' => $instructorId];
        $where = "c.instructor_id=:instructor AND p.status='pagado'";
        if ($filters['from'] !== '') { $where .= ' AND DATE(c.published_at)>=:from_date'; $params['from_date'] = $filters['from']; }
        if ($filters['to'] !== '') { $where .= ' AND DATE(c.published_at)<=:to_date'; $params['to_date'] = $filters['to']; }
        if ($filters['category'] !== '') { $where .= ' AND c.category_id=:category'; $params['category'] = (int)$filters['category']; }
        if ($filters['active'] !== '') { $where .= ' AND c.is_active=:active'; $params['active'] = (int)$filters['active']; }
        if ($view === 'detail') {
            $sql = "SELECT c.id AS course_id,c.title AS course_title,u.full_name AS student_name,e.enrolled_at,e.progress_percent,p.amount,p.payment_method,p.confirmed_at AS paid_at FROM payments p JOIN enrollments e ON e.id=p.enrollment_id JOIN courses c ON c.id=e.course_id JOIN users u ON u.id=e.student_id WHERE $where ORDER BY c.title,u.full_name";
        } else {
            $sql = "SELECT c.id AS course_id,c.title AS course_title,COUNT(DISTINCT e.student_id) AS student_count,AVG(e.progress_percent) AS average_progress,SUM(p.amount) AS revenue,SUM(CASE WHEN p.payment_method='transferencia' THEN p.amount ELSE 0 END) AS transfer_income,SUM(CASE WHEN p.payment_method='tarjeta' THEN p.amount ELSE 0 END) AS card_income FROM payments p JOIN enrollments e ON e.id=p.enrollment_id JOIN courses c ON c.id=e.course_id WHERE $where GROUP BY c.id,c.title ORDER BY c.title";
        }
        $stmt = Database::connection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}


