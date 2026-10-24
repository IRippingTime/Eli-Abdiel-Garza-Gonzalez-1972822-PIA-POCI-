<?php
declare(strict_types=1);

namespace App\Core;

use PDO;
use PDOException;
use RuntimeException;

final class Database
{
    private static ?PDO $connection = null;

    public static function connection(): PDO
    {
        if (self::$connection instanceof PDO) return self::$connection;
        $host = Env::get('DB_HOST', '127.0.0.1');
        $port = Env::get('DB_PORT', '3306');
        $name = Env::get('DB_NAME', 'educursos');
        $charset = Env::get('DB_CHARSET', 'utf8mb4');
        $dsn = "mysql:host=$host;port=$port;dbname=$name;charset=$charset";
        try {
            self::$connection = new PDO($dsn, Env::get('DB_USER', 'root'), Env::get('DB_PASSWORD', ''), [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            return self::$connection;
        } catch (PDOException $e) {
            error_log('Database connection failed: ' . $e->getMessage());
            throw new RuntimeException('No fue posible conectar con la base de datos. Revisa config/.env y ejecuta db/schema.sql.');
        }
    }
}

