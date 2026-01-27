<?php

namespace App\Http\Controllers\Api;

use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class SectionController extends Controller
{
    public function index(Request $request)
    {
        // Return sections for the authenticated user
        $user = $request->user();
        if (!$user) return response()->json([], 200);

        $sections = Section::where('user_id', $user->id)->orderBy('name')->pluck('name');
        return response()->json($sections);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $name = trim($validated['name']);
        // prevent duplicates
        $exists = Section::where('user_id', $user->id)->where('name', $name)->exists();
        if ($exists) {
            return response()->json(['message' => 'Section already exists'], 422);
        }

        $section = Section::create(['user_id' => $user->id, 'name' => $name]);

        return response()->json(['name' => $section->name], 201);
    }
}
