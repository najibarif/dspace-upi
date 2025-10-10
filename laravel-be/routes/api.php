<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\SdgController;

Route::prefix('organizations')->group(function () {
    Route::get('/', [OrganizationController::class, 'index']);      // GET semua data
    Route::get('/{id}', [OrganizationController::class, 'show']);   // GET detail by id
    Route::post('/', [OrganizationController::class, 'store']);     // POST buat baru
    Route::put('/{id}', [OrganizationController::class, 'update']); // PUT update
    Route::delete('/{id}', [OrganizationController::class, 'destroy']); // DELETE
});

Route::prefix('sdgs')->group(function () {
	Route::get('/', [SdgController::class, 'index']);
	Route::get('/{id}', [SdgController::class, 'show']);
	Route::post('/', [SdgController::class, 'store']);
	Route::put('/{id}', [SdgController::class, 'update']);
	Route::delete('/{id}', [SdgController::class, 'destroy']);
});
