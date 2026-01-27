<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\ImageController;
use App\Http\Controllers\Api\PdfExportController;
use App\Http\Controllers\Api\AdminController;

Route::middleware('cors')->group(function () {
    // Public routes
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/profile', [AuthController::class, 'profile']);

    // Table routes
    Route::get('/tables', [TableController::class, 'index']);
    Route::post('/tables', [TableController::class, 'store']);
    // Sections
    Route::get('/sections', [\App\Http\Controllers\Api\SectionController::class, 'index']);
    Route::post('/sections', [\App\Http\Controllers\Api\SectionController::class, 'store']);
    Route::post('/tables/save-all', [TableController::class, 'saveAll']);
    Route::get('/tables/{table}', [TableController::class, 'show']);
    Route::put('/tables/{table}', [TableController::class, 'update']);
    Route::delete('/tables/{table}', [TableController::class, 'destroy']);
    
    // Table row routes
    Route::post('/tables/{table}/rows', [TableController::class, 'addRow']);
    Route::put('/rows/{row}', [TableController::class, 'updateRow']);
    Route::delete('/rows/{row}', [TableController::class, 'deleteRow']);

    // Image routes
    Route::get('/images', [ImageController::class, 'index']);
    Route::post('/images', [ImageController::class, 'store']);
    Route::delete('/images/{image}', [ImageController::class, 'destroy']);

    // PDF Export routes
    Route::get('/tables/{table}/export-pdf', [PdfExportController::class, 'exportTable']);

    // Admin routes
    Route::middleware('admin')->group(function () {
        Route::get('/admin/users', [AdminController::class, 'getAllUsers']);
        Route::get('/admin/users/{user}', [AdminController::class, 'getUserDetails']);
        Route::delete('/admin/users/{user}', [AdminController::class, 'deleteUser']);
    });
    });
});
