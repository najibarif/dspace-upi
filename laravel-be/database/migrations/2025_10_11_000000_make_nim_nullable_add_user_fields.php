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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'username')) {
                $table->string('username')->unique()->after('name');
            }

            if (!Schema::hasColumn('users', 'nim')) {
                $table->string('nim')->nullable()->unique()->after('username');
            } else {
                // make sure nim is nullable
                $table->string('nim')->nullable()->change();
            }

            if (!Schema::hasColumn('users', 'faculty')) {
                $table->string('faculty')->nullable()->after('email');
            }

            if (!Schema::hasColumn('users', 'department')) {
                $table->string('department')->nullable()->after('faculty');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'department')) {
                $table->dropColumn('department');
            }

            if (Schema::hasColumn('users', 'faculty')) {
                $table->dropColumn('faculty');
            }

            if (Schema::hasColumn('users', 'nim')) {
                // dropping unique index if exists - name may vary, so attempt
                try {
                    $table->dropUnique(['nim']);
                } catch (\Throwable $e) {
                    // ignore
                }
                $table->dropColumn('nim');
            }

            if (Schema::hasColumn('users', 'username')) {
                try {
                    $table->dropUnique(['username']);
                } catch (\Throwable $e) {
                }
                $table->dropColumn('username');
            }
        });
    }
};
