<?php

use Illuminate\Support\Facades\Route;

// Temporary debug route to inspect headers (remove in production)
Route::get('/debug-cors', function () {
    return response()->json(headers_list());
});

// Catch-all route for frontend
Route::get('/{any}', function () {
    return file_get_contents(public_path('index.html'));
})->where('any', '.*');
