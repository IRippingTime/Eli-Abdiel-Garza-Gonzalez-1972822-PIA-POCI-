<?php
declare(strict_types=1);

namespace App\Contracts;

interface EnrollmentRepository
{
    public function enroll(int $studentId, int $courseId): int;
    public function completeLevel(int $studentId, int $enrollmentId, int $levelId): array;
    public function listForStudent(int $studentId): array;
}
