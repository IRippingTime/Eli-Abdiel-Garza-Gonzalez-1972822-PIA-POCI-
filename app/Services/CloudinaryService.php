<?php
declare(strict_types=1);

namespace App\Services;

use App\Core\Env;
use RuntimeException;

final class CloudinaryService
{
    public function upload(string $temporaryFile, string $originalName, string $mime, int $size): array
    {
        $cloud = Env::get('CLOUDINARY_CLOUD_NAME', '');
        $key = Env::get('CLOUDINARY_API_KEY', '');
        $secret = Env::get('CLOUDINARY_API_SECRET', '');
        $cloudinaryUrl = trim((string)Env::get('CLOUDINARY_URL', ''));
        if ($cloudinaryUrl !== '' && ($cloud === '' || $key === '' || $secret === '')) {
            $parts = parse_url($cloudinaryUrl);
            if (is_array($parts)) {
                $cloud = $cloud !== '' ? $cloud : (string)($parts['host'] ?? '');
                $key = $key !== '' ? $key : rawurldecode((string)($parts['user'] ?? ''));
                $secret = $secret !== '' ? $secret : rawurldecode((string)($parts['pass'] ?? ''));
            }
        }
        if ($cloud === '' || $key === '' || $secret === '') {
            throw new RuntimeException('La integración Cloudinary no está configurada. Completa CLOUDINARY_URL o las variables CLOUDINARY_* en config/.env.', 503);
        }
        if (!is_file($temporaryFile) || $size <= 0 || $size > 5 * 1024 * 1024) throw new RuntimeException('La imagen no debe superar 5 MB.');
        if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) throw new RuntimeException('Formato no válido. Usa JPG, PNG o WebP.');
        $timestamp = time();
        $folder = 'educursos';
        $signature = sha1("folder=$folder&timestamp=$timestamp$secret");
        $boundary = '----EduCursos' . bin2hex(random_bytes(12));
        $filename = preg_replace('/[^A-Za-z0-9._-]/', '_', basename($originalName)) ?: 'image';
        $content = '';
        foreach (['api_key' => $key, 'timestamp' => (string)$timestamp, 'folder' => $folder, 'signature' => $signature] as $name => $value) {
            $content .= "--$boundary\r\nContent-Disposition: form-data; name=\"$name\"\r\n\r\n$value\r\n";
        }
        $content .= "--$boundary\r\nContent-Disposition: form-data; name=\"file\"; filename=\"$filename\"\r\nContent-Type: $mime\r\n\r\n";
        $content .= file_get_contents($temporaryFile) . "\r\n--$boundary--\r\n";
        $url = "https://api.cloudinary.com/v1_1/" . rawurlencode($cloud) . "/image/upload";
        $context = stream_context_create(['http' => [
            'method' => 'POST',
            'header' => "Content-Type: multipart/form-data; boundary=$boundary\r\nContent-Length: " . strlen($content) . "\r\n",
            'content' => $content,
            'timeout' => 25,
            'ignore_errors' => true,
        ]]);
        $response = file_get_contents($url, false, $context);
        $status = 0;
        foreach ($http_response_header ?? [] as $header) if (preg_match('#^HTTP/\S+\s+(\d+)#', $header, $m)) $status = (int)$m[1];
        $json = is_string($response) ? json_decode($response, true) : null;
        if ($status < 200 || $status >= 300 || !is_array($json) || empty($json['secure_url'])) {
            error_log('Cloudinary upload failed with HTTP ' . $status . ': ' . (is_array($json) ? ($json['error']['message'] ?? 'unknown') : 'no response'));
            throw new RuntimeException('Cloudinary no pudo procesar la imagen. Revisa las credenciales y vuelve a intentarlo.', 502);
        }
        return ['secure_url' => $json['secure_url'], 'public_id' => $json['public_id'] ?? null];
    }
}

