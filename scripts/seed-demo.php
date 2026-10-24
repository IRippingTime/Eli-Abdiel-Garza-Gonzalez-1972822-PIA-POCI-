<?php
declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';

use App\Models\CategoryModel;
use App\Models\CourseModel;
use App\Models\UserModel;

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Este script solo se ejecuta desde la terminal.\n");
    exit(1);
}

$users = new UserModel();
$accountDefinitions = [
    ['name' => 'Administrador Demo', 'email' => 'admin@educursos.demo', 'role' => 'administrador', 'gender' => 'Otro'],
    ['name' => 'Estudiante Demo 1', 'email' => 'estudiante1@educursos.demo', 'role' => 'estudiante', 'gender' => 'Femenino'],
    ['name' => 'Estudiante Demo 2', 'email' => 'estudiante2@educursos.demo', 'role' => 'estudiante', 'gender' => 'Masculino'],
    ['name' => 'Estudiante Demo 3', 'email' => 'estudiante3@educursos.demo', 'role' => 'estudiante', 'gender' => 'Otro'],
    ['name' => 'Instructor Demo 1', 'email' => 'instructor1@educursos.demo', 'role' => 'instructor', 'gender' => 'Femenino'],
    ['name' => 'Instructor Demo 2', 'email' => 'instructor2@educursos.demo', 'role' => 'instructor', 'gender' => 'Masculino'],
    ['name' => 'Instructor Demo 3', 'email' => 'instructor3@educursos.demo', 'role' => 'instructor', 'gender' => 'Otro'],
];

$temporaryCredentials = [];
foreach ($accountDefinitions as $account) {
    $existing = $users->findByEmail($account['email']);
    if ($existing) {
        if ($existing['role'] !== $account['role']) {
            throw new RuntimeException('El correo de demostración ya existe con otro rol: ' . $account['email']);
        }
        continue;
    }
    $password = 'Demo-' . bin2hex(random_bytes(12)) . 'A9!';
    $data = [
        'full_name' => $account['name'], 'gender' => $account['gender'], 'birth_date' => '2000-01-01',
        'email' => $account['email'], 'password' => $password, 'role' => $account['role'], 'avatar_url' => null,
    ];
    if ($account['role'] === 'administrador') {
        $users->createAdmin($account['name'], $account['email'], $password);
    } else {
        $users->create($data);
    }
    $temporaryCredentials[] = ['email' => $account['email'], 'password' => $password];
}

$instructorIds = [];
for ($number = 1; $number <= 3; $number++) {
    $instructor = $users->findByEmail("instructor{$number}@educursos.demo");
    if (!$instructor || $instructor['role'] !== 'instructor') {
        throw new RuntimeException('No se pudo preparar el instructor de demostración ' . $number . '.');
    }
    $instructorIds[$number] = (int)$instructor['id'];
}

$categoryIds = [];
foreach ((new CategoryModel())->all() as $category) {
    $categoryIds[$category['name']] = (int)$category['id'];
}

$courseDefinitions = [
    ['PHP desde Cero con POO y MVC', 'Aprende PHP puro, programación orientada a objetos y el patrón MVC con un proyecto práctico.', 'IT & Software', 899.00, '../img/curso-php.svg', 1, ['Preparar PHP', 'Programación orientada a objetos', 'Modelos y controladores MVC', 'Conexión segura con MySQL', 'Proyecto integrador']],
    ['JavaScript Moderno y Fetch API', 'Practica DOM, promesas, Fetch y consumo de APIs REST con validaciones del lado del cliente.', 'IT & Software', 0.00, '../img/curso-js.svg', 1, ['JavaScript moderno', 'Manipular el DOM', 'Promesas y async/await', 'Consumir una API con Fetch']],
    ['Marketing Digital para Creadores', 'Diseña una estrategia de contenidos, embudos y campañas para redes sociales.', 'Marketing', 599.00, '../img/curso-marketing.svg', 2, ['Marca personal', 'Estrategia de contenidos', 'Medir campañas']],
    ['Diseño UI con Figma', 'Aprende fundamentos de UI/UX, prototipado y sistemas de diseño en Figma.', 'Design', 749.00, '../img/curso-figma.svg', 2, ['Fundamentos UI/UX', 'Componentes y estilos', 'Prototipos interactivos', 'Sistema de diseño']],
    ['Inglés Técnico para TI', 'Aprende vocabulario técnico, entrevistas y comprensión de documentación en inglés.', 'Idiomas', 0.00, '../img/curso-ingles.svg', 3, ['Vocabulario técnico', 'Leer documentación', 'Comunicación en equipos', 'Describir proyectos', 'Preparar entrevistas', 'Presentar soluciones']],
];

$courseModel = new CourseModel();
$demoVideos = require __DIR__ . '/demo-videos.php';
$createdCourses = [];
foreach ($courseDefinitions as [$title, $description, $categoryName, $price, $image, $instructorNumber, $levelTitles]) {
    if ($courseModel->idByTitle($title) !== null) continue;
    if (!isset($categoryIds[$categoryName])) throw new RuntimeException('Falta la categoría: ' . $categoryName);
    $levels = [];
    foreach ($levelTitles as $levelTitle) {
        $videoUrl = $demoVideos[$title][$levelTitle] ?? null;
        if (!$videoUrl) throw new RuntimeException('Falta el video de demostración para: ' . $title . ' / ' . $levelTitle);
        $levels[] = [
            'title' => $levelTitle,
            'description' => 'Video educativo sugerido para este tema.',
            'video_url' => $videoUrl,
        ];
    }
    $id = $courseModel->create([
        'title' => $title, 'description' => $description, 'category_id' => $categoryIds[$categoryName],
        'price' => $price, 'image_url' => $image, 'levels' => $levels,
    ], $instructorIds[$instructorNumber]);
    $createdCourses[] = ['id' => $id, 'title' => $title, 'levels' => count($levels)];
}

echo json_encode([
    'accounts_created' => $temporaryCredentials,
    'courses_created' => $createdCourses,
    'message' => 'Las contraseñas temporales solo se imprimen al crear cuentas nuevas. Cambia las contraseñas de demostración antes de usar el portal fuera de clase.',
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), PHP_EOL;
