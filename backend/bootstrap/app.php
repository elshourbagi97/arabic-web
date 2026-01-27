<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
    )
    ->withProviders([
        \Illuminate\Foundation\Providers\FoundationServiceProvider::class,
        \Illuminate\Auth\AuthServiceProvider::class,
        \Illuminate\Database\DatabaseServiceProvider::class,
    ])
    ->withMiddleware(function (Middleware $middleware) {
        // Stateful API middleware removed - using token-based auth instead
        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
