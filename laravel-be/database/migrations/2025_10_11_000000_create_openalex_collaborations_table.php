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
        Schema::create('openalex_collaborations', function (Blueprint $table) {
            $table->id();
            $table->string('country_name')->index();
            $table->string('country_code')->nullable()->index();
            $table->unsignedInteger('outputs')->default(0);
            $table->unsignedInteger('profiles')->default(0);
            $table->timestamp('fetched_at')->nullable()->index();
            $table->timestamps();

            $table->unique(['country_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('openalex_collaborations');
    }
};
