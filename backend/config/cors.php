<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // Exact domains (production)
    'allowed_origins' => [
        'https://brilliant-kleicha-595a66.netlify.app',
        'https://cheerier-zina-snappable.ngrok-free.dev'
    ],

    // Any localhost port (development)
    'allowed_origins_patterns' => [
        '/^http:\/\/localhost:\d+$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];