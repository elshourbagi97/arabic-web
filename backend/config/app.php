<?php

return [
    'APP_NAME' => 'Arabic Website',
    'APP_ENV' => 'local',
    'APP_KEY' => env('APP_KEY', ''),
    'APP_DEBUG' => env('APP_DEBUG', false),
    'APP_URL' => env('APP_URL', 'http://localhost:8000'),
    'APP_TIMEZONE' => 'UTC',

    'DB_CONNECTION' => env('DB_CONNECTION', 'mysql'),
    'DB_HOST' => env('DB_HOST', '127.0.0.1'),
    'DB_PORT' => env('DB_PORT', 3306),
    'DB_DATABASE' => env('DB_DATABASE', 'arabicwebsite_db'),
    'DB_USERNAME' => env('DB_USERNAME', 'root'),
    'DB_PASSWORD' => env('DB_PASSWORD', ''),

    'API_BASE_URL' => env('API_BASE_URL', 'http://localhost:8000/api'),

    'FEATURES' => [
        'pdf_export' => true,
        'image_upload' => true,
        'admin_panel' => true,
    ],
];
