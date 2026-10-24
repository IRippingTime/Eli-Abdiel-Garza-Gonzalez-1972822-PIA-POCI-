<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\ApiResponse;
use App\Services\CloudinaryService;
use RuntimeException;

final class UploadController
{
    public function image(): never
    {
        if (!isset($_FILES['image']) || !is_array($_FILES['image'])) ApiResponse::error('Selecciona una imagen en el campo image.', 400);
        $file = $_FILES['image'];
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) ApiResponse::error('No se pudo recibir el archivo. Intenta con una imagen de hasta 5 MB.', 400);
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
        try {
            $uploaded = (new CloudinaryService())->upload($file['tmp_name'], $file['name'], (string)$mime, (int)$file['size']);
            ApiResponse::send(['ok' => true, 'message' => 'Imagen subida a Cloudinary.', 'data' => $uploaded], 201);
        } catch (RuntimeException $e) {
            $status = in_array($e->getCode(), [502, 503], true) ? $e->getCode() : 400;
            ApiResponse::error($e->getMessage(), $status);
        }
    }
}

