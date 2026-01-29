<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            // Add table_name column
            $table->string('table_name')->nullable()->after('id');
        });

        // Migrate existing notes by looking up the table name from table_id
        DB::statement('
            UPDATE notes n
            SET table_name = COALESCE(
                (SELECT label FROM tables t WHERE t.id = n.table_id),
                (SELECT table_name FROM tables t WHERE t.id = n.table_id),
                "Unknown"
            )
            WHERE n.table_id IS NOT NULL AND n.table_name IS NULL
        ');

        // Drop the foreign key constraint
        Schema::table('notes', function (Blueprint $table) {
            $table->dropForeign(['table_id']);
            $table->dropColumn('table_id');
        });

        // Make table_name non-nullable
        Schema::table('notes', function (Blueprint $table) {
            $table->string('table_name')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            // Add table_id back as foreign key
            $table->foreignId('table_id')->nullable()->constrained('tables')->onDelete('cascade')->after('id');
        });

        // Migrate existing notes back to table_id
        DB::statement('
            UPDATE notes n
            SET table_id = (SELECT id FROM tables t WHERE t.label = n.table_name OR t.table_name = n.table_name LIMIT 1)
            WHERE n.table_name IS NOT NULL AND n.table_id IS NULL
        ');

        Schema::table('notes', function (Blueprint $table) {
            $table->dropColumn('table_name');
        });
    }
};
