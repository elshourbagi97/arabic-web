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
        $images = $request->user()->images()->get();
        return response()->json([
            'success' => true,
            'data' => $images,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|image|max:10240', // 10MB max
            'description' => 'nullable|string',
        ]);

        $file = $validated['file'];
        $path = 'uploads/' . uniqid() . '.' . $file->getClientOriginalExtension();

        Storage::disk('public')->put($path, file_get_contents($file));

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
            'data' => $image,
        ], 201);
    }

    public function show($id)
    {
        $image = Image::findOrFail($id);
        
        if (!Storage::disk('public')->exists($image->path)) {
            return response()->json(['message' => 'Image not found'], 404);
        }

        $file = Storage::disk('public')->get($image->path);
        $mimeType = Storage::disk('public')->mimeType($image->path) ?? $image->mime_type ?? 'image/jpeg';

        return response($file)
            ->header('Content-Type', $mimeType)
            ->header('Cache-Control', 'public, max-age=86400')
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type');
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
