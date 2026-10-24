<?php
declare(strict_types=1);
$router = require dirname(__DIR__) . '/app/bootstrap.php';
$router->dispatch();
