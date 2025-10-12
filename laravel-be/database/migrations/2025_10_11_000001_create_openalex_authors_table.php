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
        Schema::create('openalex_authors', function (Blueprint $table) {
            $table->id();
            $table->string('openalex_id')->unique()->index();
            $table->string('display_name');
            $table->json('last_known_institutions')->nullable();
            $table->integer('h_index')->default(0);
            $table->integer('works_count')->default(0);
            $table->integer('cited_by_count')->default(0);
            $table->json('summary_stats')->nullable();
            $table->json('counts_by_year')->nullable();
            $table->json('x_concepts')->nullable();
            $table->timestamp('fetched_at')->nullable()->index();
            $table->timestamps();

            $table->index(['display_name']);
            $table->index(['works_count']);
            $table->index(['h_index']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('openalex_authors');
    }
};
