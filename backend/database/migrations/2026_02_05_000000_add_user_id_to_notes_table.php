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
            // Add user_id column before table_name for better organization
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->onDelete('cascade');
        });

        // Migrate existing notes - assign them to user_id = 1 (or set them to null)
        // If you want to ensure data integrity, leave as NULL and manual review may be needed
        // For now, assigning to user ID 1 if it exists
        DB::statement('
            UPDATE notes SET user_id = 1 WHERE user_id IS NULL
        ');

        // Make user_id non-nullable after migration
        Schema::table('notes', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->dropForeignKey(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
