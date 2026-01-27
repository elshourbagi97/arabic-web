<?php

return [
    'sanctum' => [
        'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,127.0.0.1,127.0.0.1:3000,127.0.0.1:5173')),
        'guard' => ['web'],
        'middleware' => [
            'verify_csrf_token' => \App\Http\Middleware\VerifyCsrfToken::class,
            'encrypt_cookies' => \App\Http\Middleware\EncryptCookies::class,
        ],
    ],
];
