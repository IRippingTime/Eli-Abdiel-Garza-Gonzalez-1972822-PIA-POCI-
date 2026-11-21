<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiResponse;
use App\Models\EnrollmentModel;
use App\Contracts\EnrollmentRepository;

final class StudentController
{
    public function __construct(private readonly EnrollmentRepository $enrollments) {}

    public function enroll(int $studentId): never
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $courseId = is_array($data) ? filter_var($data['course_id'] ?? null, FILTER_VALIDATE_INT) : false;
        if (!$courseId || $courseId < 1) ApiResponse::error('course_id debe ser un entero positivo.', 400);
        try {
            $id = $this->enrollments->enroll($studentId, (int)$courseId);
            ApiResponse::send(['ok' => true, 'message' => 'Inscripción registrada.', 'data' => ['enrollment_id' => $id]], 201);
        } catch (\DomainException $e) { ApiResponse::error($e->getMessage(), 400); }
    }

    public function completeLevel(int $studentId, int $enrollmentId): never
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $levelId = is_array($data) ? filter_var($data['level_id'] ?? null, FILTER_VALIDATE_INT) : false;
        if (!$levelId || $levelId < 1) ApiResponse::error('level_id debe ser un entero positivo.', 400);
        try {
            $progress = $this->enrollments->completeLevel($studentId, $enrollmentId, (int)$levelId);
            ApiResponse::send(['ok' => true, 'message' => 'Avance actualizado.', 'data' => $progress]);
        } catch (\DomainException $e) { ApiResponse::error($e->getMessage(), 404); }
    }

    public function enrollments(int $studentId): never
    {
        $rows = $this->enrollments->listForStudent($studentId);
        ApiResponse::send(['ok' => true, 'total' => count($rows), 'data' => $rows]);
    }
}

