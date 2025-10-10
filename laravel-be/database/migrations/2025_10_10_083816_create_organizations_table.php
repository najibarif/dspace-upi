<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Jalankan migrasi.
     */
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->uuid('org_id')->primary();
            $table->string('name');
            $table->enum('type', [
                'university', 
                'faculty', 
                'school', 
                'department', 
                'center', 
                'lab', 
                'unit'
            ]);
            $table->uuid('parent_org_id')->nullable();
            $table->string('url')->nullable();
            $table->timestamps();

            // Foreign key ke dirinya sendiri
            $table->foreign('parent_org_id')
                  ->references('org_id')
                  ->on('organizations')
                  ->onDelete('set null');
        });
    }

    /**
     * Undo migrasi.
     */
    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};
