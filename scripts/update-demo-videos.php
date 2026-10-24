<?php
declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';

use App\Core\Database;

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Este script solo se ejecuta desde la terminal.\n");
    exit(1);
}

$demoVideos = require __DIR__ . '/demo-videos.php';
$pdo = Database::connection();
$findCourse = $pdo->prepare('SELECT id FROM courses WHERE title = :title LIMIT 1');
$findLevel = $pdo->prepare('SELECT id, video_url FROM course_levels WHERE course_id = :course_id AND title = :title LIMIT 1');
$updateLevel = $pdo->prepare('UPDATE course_levels SET video_url = :video_url WHERE id = :id');
$updated = 0;
$unchanged = 0;
$missingCourses = [];

$pdo->beginTransaction();
try {
    foreach ($demoVideos as $courseTitle => $levels) {
        $findCourse->execute(['title' => $courseTitle]);
        $course = $findCourse->fetch();
        if (!$course) {
            $missingCourses[] = $courseTitle;
            continue;
        }

        foreach ($levels as $levelTitle => $videoUrl) {
            $findLevel->execute(['course_id' => $course['id'], 'title' => $levelTitle]);
            $level = $findLevel->fetch();
            if (!$level) {
                throw new RuntimeException('No se encontró la lección: ' . $courseTitle . ' / ' . $levelTitle);
            }
            if ($level['video_url'] === $videoUrl) {
                $unchanged++;
                continue;
            }
            $updateLevel->execute(['video_url' => $videoUrl, 'id' => $level['id']]);
            $updated++;
        }
    }
    $pdo->commit();
} catch (Throwable $error) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    fwrite(STDERR, "No se actualizaron los videos: " . $error->getMessage() . "\n");
    exit(1);
}

echo json_encode([
    'lecciones_actualizadas' => $updated,
    'lecciones_sin_cambios' => $unchanged,
    'cursos_no_encontrados' => $missingCourses,
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), PHP_EOL;
