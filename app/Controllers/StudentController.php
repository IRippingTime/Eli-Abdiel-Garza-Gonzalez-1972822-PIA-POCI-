<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiResponse;
use App\Models\EnrollmentModel;

final class StudentController
{
    public function enrollments(int $studentId): never
    {
        $rows = (new EnrollmentModel())->listForStudent($studentId);
        ApiResponse::send(['ok' => true, 'total' => count($rows), 'data' => $rows]);
    }
}
