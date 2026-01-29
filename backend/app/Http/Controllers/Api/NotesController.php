<?php

namespace App\Http\Controllers\Api;


use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;

class NotesController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_name' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $note = Note::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم حفظ الملاحظة بنجاح',
            'data' => $note,
        ], 201);
    }

    public function index()
    {
        $notes = Note::orderBy('table_name')
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

    public function show($table_name)
    {
        return response()->json([
            'success' => true,
            'data' => Note::where('table_name', $table_name)->latest()->get(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $note = Note::findOrFail($id);
        $note->update($request->validate([
            'content' => 'required|string',
        ]));

        return response()->json(['success' => true, 'data' => $note]);
    }

    public function destroy($id)
    {
        Note::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }
}
