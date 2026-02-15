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

        // Add API URL to each image without exposing storage paths
        $imagesWithUrl = $images->map(function ($image) {
            return [
                'id' => $image->id,
                'original_name' => $image->original_name,
                'description' => $image->description,
                'mime_type' => $image->mime_type,
                'size' => $image->size,
                'created_at' => $image->created_at,
                'url' => "/api/images/{$image->id}/file",
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
            'file' => 'required|image|max:10240', // 10MB max
            'description' => 'nullable|string',
        ]);

        $file = $validated['file'];
        // Use Laravel's store() method for better handling
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
                'url' => "/api/images/{$image->id}/file",
            ],
        ], 201);
    }

    public function show(Request $request, $id)
    {
        // Require authentication - <img> tags will include auth token if user is logged in
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $image = Image::findOrFail($id);

        // Verify ownership: only allow user to access their own images
        if ($image->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
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
        if ($image->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        Storage::disk('public')->delete($image->path);
        $image->delete();

        return response()->json([
            'success' => true,
            'message' => 'Image deleted successfully',
        ]);
    }
}
