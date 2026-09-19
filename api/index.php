<?php
// EduCursos - Ruta base PHP para Primer Avance
// Uso: php -S localhost:8000 -t .
// Luego abrir: http://localhost:8000/api/index.php
// Luego abrir: http://localhost:8000/html/index.html
// Responde JSON con MIME application/json y codigo HTTP correcto.

header("Content-Type: application/json; charset=utf-8");

$metodo = $_SERVER["REQUEST_METHOD"] ?? "GET";

if ($metodo !== "GET") {
    http_response_code(405);
    echo json_encode([
        "ok" => false,
        "error" => "Metodo no permitido. Usa GET para la ruta base."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(200);
echo json_encode([
    "ok" => true,
    "proyecto" => "EduCursos - Portal de Cursos en Linea",
    "avance" => "Primer avance - PIA POCI",
    "php_version" => phpversion(),
    "ruta_base" => "/api/index.php",
    "api_version" => "v1",
    "endpoints" => [
        "GET /api/v1/cursos",
        "GET /api/v1/cursos/{id}",
        "POST /api/v1/cursos",
        "PUT /api/v1/cursos/{id}",
        "DELETE /api/v1/cursos/{id}",
        "GET /api/v1/categorias",
        "POST /api/v1/categorias"
    ],
    "mensaje" => "Servidor web en operacion. PHP respondiendo correctamente."
], JSON_UNESCAPED_UNICODE);
