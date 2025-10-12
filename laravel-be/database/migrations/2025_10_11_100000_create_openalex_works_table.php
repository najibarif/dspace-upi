<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('openalex_works', function (Blueprint $table) {
            $table->id();
            $table->string('openalex_id')->unique();
            $table->string('display_name');
            $table->string('type')->nullable();
            $table->integer('publication_year')->nullable();
            $table->json('raw');
            $table->timestamp('fetched_at')->nullable();
            $table->timestamps();

            $table->index('publication_year');
            $table->index('type');
            $table->index('display_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('openalex_works');
    }
};


