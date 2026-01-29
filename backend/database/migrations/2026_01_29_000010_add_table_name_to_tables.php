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
        if (!Schema::hasColumn('tables', 'table_name')) {
            Schema::table('tables', function (Blueprint $table) {
                $table->string('table_name')->nullable()->after('label');
            });

            // Copy existing label values into table_name
            DB::table('tables')->whereNotNull('label')->update(["table_name" => DB::raw('label')]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('tables', 'table_name')) {
            Schema::table('tables', function (Blueprint $table) {
                $table->dropColumn('table_name');
            });
        }
    }
};
