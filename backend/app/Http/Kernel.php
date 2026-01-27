<?php

namespace App;

use Illuminate\Foundation\Application;

class Kernel
{
    protected $middleware = [
        // Global middleware
    ];

    protected $middlewareGroups = [
        'api' => [
            // API middleware
        ],
    ];

    protected $routeMiddleware = [
        'admin' => \App\Http\Middleware\IsAdmin::class,
    ];
}
