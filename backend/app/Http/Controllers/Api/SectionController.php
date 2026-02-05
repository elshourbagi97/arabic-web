<?php

namespace App\Http\Controllers\Api;

use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class SectionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $sections = Section::where('user_id', $user->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json($sections);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $name = trim($validated['name']);

        // Prevent duplicates
        $exists = Section::where('user_id', $user->id)
            ->where('name', $name)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Section already exists'], 422);
        }

        $section = Section::create(['user_id' => $user->id, 'name' => $name]);

        return response()->json(['id' => $section->id, 'name' => $section->name], 201);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $section = Section::find($id);
        if (!$section) {
            return response()->json(['message' => 'Section not found'], 404);
        }

        if ($section->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $section->delete();

        return response()->json(['message' => 'Section deleted successfully'], 200);
    }

    public function rename(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $section = Section::find($id);
        if (!$section) {
            return response()->json(['message' => 'Section not found'], 404);
        }

        if ($section->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $newName = trim($validated['name']);

        // Check if new name already exists for this user
        $exists = Section::where('user_id', $user->id)
            ->where('name', $newName)
            ->where('id', '!=', $id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Section name already exists'], 422);
        }

        $section->update(['name' => $newName]);

        return response()->json(['id' => $section->id, 'name' => $section->name], 200);
    }
}
