<?php

use Illuminate\Support\Facades\Route;

// Optional debug route (safe)
Route::get('/debug-cors', function () {
    return response()->json(headers_list());
});

// Serve React SPA, but NEVER intercept /api routes
Route::get('/{any}', function () {
    return file_get_contents(public_path('index.html'));
})->where('any', '^(?!api).*');
