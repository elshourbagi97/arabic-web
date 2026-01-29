<?php

namespace App\Http\Controllers\Api;

use App\Models\Table;
use App\Models\TableRow;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TableController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->tables()->with('rows');

        if ($request->has('section')) {
            $query->where('section', $request->query('section'));
        }

        $tables = $query->get();

        return response()->json($tables);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'nullable|string|max:255',
            'section' => 'required|string|max:255',
            'data' => 'nullable|array',
            'column_headers' => 'nullable|array',
        ]);

        // Determine label if not provided: find existing labels in section and increment
        if (empty($validated['label'])) {
            $section = $validated['section'];
            $existing = $request->user()->tables()->where('section', $section)->pluck('label')->toArray();
            $max = 0;
            foreach ($existing as $lbl) {
                if (preg_match('/(\d+)$/u', $lbl, $m)) {
                    $n = (int)$m[1];
                    if ($n > $max) $max = $n;
                }
            }
            $validated['label'] = 'جدول ' . ($max + 1);
        }

        $table = $request->user()->tables()->create([
            'label' => $validated['label'],
            'section' => $validated['section'],
            'data' => $validated['data'] ?? null,
            'column_headers' => $validated['column_headers'] ?? null,
            'last_updated' => now(),
        ]);

        return response()->json($table->load('rows'), 201);
    }

    public function show(Request $request, Table $table)
    {
        if ($table->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($table->load('rows'));
    }

    public function update(Request $request, Table $table)
    {
        if ($table->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'label' => 'nullable|string|max:255',
            'data' => 'nullable|array',
            'column_headers' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $update = [];
        if (array_key_exists('label', $validated)) $update['label'] = $validated['label'];
        if (array_key_exists('data', $validated)) $update['data'] = $validated['data'];
        if (array_key_exists('column_headers', $validated)) $update['column_headers'] = $validated['column_headers'];
        if (array_key_exists('notes', $validated)) $update['notes'] = $validated['notes'];

        if (!empty($update)) {
            $update['last_updated'] = now();
            $table->update($update);
        }

        return response()->json($table->fresh()->load('rows'));
    }

    /**
     * Bulk save or update tables for a section (used by auto-save)
     * Expected payload: { section: string, tables: [ { id?, label, data, column_headers, notes } ] }
     */
    public function saveAll(Request $request)
    {
        $payload = $request->validate([
            'section' => 'required|string',
            'tables' => 'required|array',
        ]);

        $section = $payload['section'];
        $saved = [];

        foreach ($payload['tables'] as $t) {
            $t = (array)$t;
            if (!empty($t['id'])) {
                $table = $request->user()->tables()->where('id', $t['id'])->first();
                if ($table) {
                    $table->update([
                        'label' => $t['label'] ?? $table->label,
                        'data' => $t['data'] ?? $table->data,
                        'column_headers' => $t['column_headers'] ?? $table->column_headers,
                        'notes' => $t['notes'] ?? $table->notes,
                        'last_updated' => now(),
                        'section' => $section,
                    ]);
                    $saved[] = $table->fresh()->load('rows');
                    continue;
                }
            }

            // create new
            $created = $request->user()->tables()->create([
                'label' => $t['label'] ?? null,
                'section' => $section,
                'data' => $t['data'] ?? null,
                'column_headers' => $t['column_headers'] ?? null,
                'notes' => $t['notes'] ?? null,
                'last_updated' => now(),
            ]);
            $saved[] = $created->load('rows');
        }

        return response()->json(['saved' => $saved], 200);
    }

    public function destroy(Request $request, Table $table)
    {
        if ($table->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $table->delete();

        return response()->json(['message' => 'Table deleted successfully']);
    }

    /**
     * Rename a table (update its label)
     */
    public function renameTable(Request $request, Table $table)
    {
        if ($table->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'غير مصرح', 'error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'table_name' => 'required|string|max:255',
            'table_data' => 'nullable|array',
        ]);

        // Use transaction for data integrity
        try {
            \DB::beginTransaction();

            $update = ['label' => $validated['table_name']];
            // If DB has a dedicated `table_name` column, update it as well
            if (Schema::hasColumn($table->getTable(), 'table_name')) {
                $update['table_name'] = $validated['table_name'];
            }
            if (array_key_exists('table_data', $validated) && $validated['table_data'] !== null) {
                $update['data'] = $validated['table_data'];
            }
            $update['last_updated'] = now();

            $table->update($update);

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث اسم الجدول بنجاح',
                'data' => $table->fresh()->load('rows')
            ], 200);
        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تحديث الجدول',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Alias method named `rename` to match route handler expectation.
     * Delegates to renameTable for actual work.
     */
    public function rename(Request $request, Table $table)
    {
        // Validate input and return 422 on validation errors
        try {
            $validated = $request->validate([
                'table_name' => 'required|string|max:255',
                'table_data' => 'sometimes|array',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);
        }

        // Determine which column to update: prefer `name`, then `table_name`, then `label`
        $tableNameCol = null;
        if (Schema::hasColumn($table->getTable(), 'name')) {
            $tableNameCol = 'name';
        } elseif (Schema::hasColumn($table->getTable(), 'table_name')) {
            $tableNameCol = 'table_name';
        } elseif (Schema::hasColumn($table->getTable(), 'label')) {
            $tableNameCol = 'label';
        }

        if (!$tableNameCol) {
            return response()->json([
                'success' => false,
                'message' => 'No suitable name column found on tables table',
            ], 500);
        }

        try {
            DB::beginTransaction();

            $update = [ $tableNameCol => $validated['table_name'] ];
            if (array_key_exists('table_data', $validated) && $validated['table_data'] !== null) {
                $update['data'] = $validated['table_data'];
            }
            $update['last_updated'] = now();

            $table->update($update);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث اسم الجدول بنجاح',
                'data' => $table->fresh()->load('rows'),
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تحديث الجدول',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function addRow(Request $request, Table $table)
    {
        if ($table->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'row_data' => 'required|array',
        ]);

        $rowNumber = $table->rows()->max('row_number') + 1;

        $row = $table->rows()->create([
            'row_number' => $rowNumber,
            'row_data' => $validated['row_data'],
        ]);

        return response()->json($row, 201);
    }

    public function updateRow(Request $request, TableRow $row)
    {
        $row->load('table');
        if ($row->table->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'row_data' => 'required|array',
        ]);

        $row->update($validated);

        return response()->json($row);
    }

    public function deleteRow(Request $request, TableRow $row)
    {
        $row->load('table');
        if ($row->table->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $row->delete();

        return response()->json(['message' => 'Row deleted successfully']);
    }
}
