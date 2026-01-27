<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tables', function (Blueprint $table) {
            if (!Schema::hasColumn('tables', 'section')) {
                $table->string('section')->nullable()->after('label')->comment('مثل: عمارة 1, عمارة 2, مدرسة');
            }
            if (!Schema::hasColumn('tables', 'data')) {
                $table->json('data')->nullable()->after('section');
            }
            if (!Schema::hasColumn('tables', 'last_updated')) {
                $table->timestamp('last_updated')->nullable()->after('updated_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tables', function (Blueprint $table) {
            if (Schema::hasColumn('tables', 'last_updated')) {
                $table->dropColumn('last_updated');
            }
            if (Schema::hasColumn('tables', 'data')) {
                $table->dropColumn('data');
            }
            if (Schema::hasColumn('tables', 'section')) {
                $table->dropColumn('section');
            }
        });
    }
};
