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
        Schema::create('papers', function (Blueprint $table) {
            $table->uuid('paper_id')->primary();
            $table->string('title');
            $table->string('normalized_title');
            $table->text('abstract')->nullable();
            $table->integer('year');
            $table->enum('type', [
                'journal_article',
                'conference_paper',
                'book',
                'chapter',
                'report',
                'dataset',
                'other'
            ]);
            $table->string('doi')->nullable();
            $table->string('venue_name')->nullable();
            $table->string('volume')->nullable();
            $table->string('issue')->nullable();
            $table->string('pages')->nullable();
            $table->string('url_fulltext')->nullable();
            $table->char('fingerprint_hash', 40)->nullable();
            $table->enum('visibility', ['public', 'institution', 'private'])->default('public');
            $table->timestamps();

            $table->index(['title', 'year']);
            $table->index('type');
            $table->index('visibility');
            $table->index('fingerprint_hash');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('papers');
    }
};
