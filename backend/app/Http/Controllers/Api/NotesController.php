<?php

namespace App\Http\Controllers\Api;

use App\Models\Note;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;

class NotesController extends Controller
{
    /**
     * Store a new note for the authenticated user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_name' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        /** @var User $user */
        $user = Auth::user();
        $note = $user->notes()->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم حفظ الملاحظة بنجاح',
            'data' => $note,
        ], 201);
    }

    /**
     * Get all notes for the authenticated user, grouped by table_name
     */
    public function index()
    {
        // Only fetch notes belonging to the authenticated user
        /** @var User $user */
        $user = Auth::user();
        $notes = $user->notes()
            ->orderBy('table_name')
            ->orderByDesc('created_at')
            ->get()
            ->groupBy('table_name')
            ->map(fn ($group) => [
                'table_name' => $group->first()->table_name,
                'notes' => $group->values(),
            ])
            ->values();

        return response()->json([
            'success' => true,
            'data' => $notes,
        ]);
    }

    /**
     * Get notes for a specific table belonging to the authenticated user
     */
    public function show($table_name)
    {
        // Only fetch notes for this table that belong to the authenticated user
        /** @var User $user */
        $user = Auth::user();
        $notes = $user->notes()
            ->where('table_name', $table_name)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notes,
        ]);
    }

    /**
     * Update a note (only if it belongs to the authenticated user)
     */
    public function update(Request $request, $id)
    {
        // Find the note
        $note = Note::findOrFail($id);

        // Ensure the note belongs to the authenticated user
        if ($note->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: You do not have permission to update this note.',
            ], 403);
        }

        $note->update($request->validate([
            'content' => 'required|string',
        ]));

        return response()->json(['success' => true, 'data' => $note]);
    }

    /**
     * Delete a note (only if it belongs to the authenticated user)
     */
    public function destroy($id)
    {
        $note = Note::findOrFail($id);

        // Ensure the note belongs to the authenticated user
        if ($note->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: You do not have permission to delete this note.',
            ], 403);
        }

        $note->delete();
        return response()->json(['success' => true]);
    }
}

