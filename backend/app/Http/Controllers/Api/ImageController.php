<?php

namespace App\Http\Controllers\Api;

use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;

class ImageController extends Controller
{
    public function index(Request $request)
    {
        $images = $request->user()->images()->select([
            'id',
            'original_name',
            'description',
            'mime_type',
            'size',
            'created_at',
        ])->get();

        $imagesWithUrl = $images->map(function ($image) {
            return [
                'id' => $image->id,
                'original_name' => $image->original_name,
                'description' => $image->description,
                'mime_type' => $image->mime_type,
                'size' => $image->size,
                'created_at' => $image->created_at,
                'url' => url("/api/images/{$image->id}/file"),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $imagesWithUrl,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|image|max:10240',
            'description' => 'nullable|string',
        ]);

        $file = $validated['file'];
        $path = $file->store('uploads', 'public');

        $image = $request->user()->images()->create([
            'filename' => basename($path),
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
            'path' => $path,
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $image->id,
                'original_name' => $image->original_name,
                'description' => $image->description,
                'mime_type' => $image->mime_type,
                'size' => $image->size,
                'created_at' => $image->created_at,
                'url' => url("/api/images/{$image->id}/file"),
            ],
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $image = Image::findOrFail($id);

        // === LOCAL DEV BYPASS ===
        if (app()->environment('local')) {
            // Skip auth locally
        } else {
            // Require authentication on live
            if (!$request->user()) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            // Only allow owner/admin
            if ($image->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
                return response()->json(['message' => 'Forbidden'], 403);
            }
        }

        if (!Storage::disk('public')->exists($image->path)) {
            return response()->json(['message' => 'Image not found'], 404);
        }

        $mimeType = Storage::disk('public')->mimeType($image->path) ?? $image->mime_type ?? 'image/jpeg';

        return response()->file(
            Storage::disk('public')->path($image->path),
            [
                'Content-Type' => $mimeType,
                'Cache-Control' => 'public, max-age=86400',
            ]
        );
    }

    public function destroy(Request $request, Image $image)
    {
        if (app()->environment('local')) {
            // Allow deletion locally for testing
        } else {
            if ($image->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        Storage::disk('public')->delete($image->path);
        $image->delete();

        return response()->json([
            'success' => true,
            'message' => 'Image deleted successfully',
        ]);
    }
}
