<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.json')) {
    $maintenance = json_decode(file_get_contents($maintenance), true);

    if (isset($maintenance['except']) && (in_array(Request::ip(), $maintenance['except']) ||
        in_array('*', $maintenance['except']))) {
        // Request IPs are whitelisted, disable maintenance mode
    } elseif (time() < $maintenance['expires']) {
        http_response_code($maintenance['status'] ?? 503);
        echo file_get_contents(__DIR__.'/../storage/framework/maintenance.html');
        exit;
    }
}

/*
|--------------------------------------------------------------------------
| Register The Auto Loader
|--------------------------------------------------------------------------
*/

require __DIR__.'/../vendor/autoload.php';

/*
|--------------------------------------------------------------------------
| Bootstrap Laravel And Handle The Request
|--------------------------------------------------------------------------
*/

$app = require __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
