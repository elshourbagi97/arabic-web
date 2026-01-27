<?php

use Illuminate\Support\Facades\Route;

// Catch-all route for frontend
Route::get('/{any}', function () {
    return file_get_contents(public_path('index.html'));
})->where('any', '.*');
