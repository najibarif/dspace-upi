<?php

use App\Http\Controllers\PaperController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

/*
|--------------------------------------------------------------------------
| Paper API Routes
|--------------------------------------------------------------------------
*/

// Paper CRUD routes
Route::prefix('papers')->group(function () {
    // Basic CRUD operations
    Route::get('/', [PaperController::class, 'index']);                    // GET /api/papers
    Route::post('/', [PaperController::class, 'store']);                   // POST /api/papers
    Route::get('/{paper}', [PaperController::class, 'show']);              // GET /api/papers/{id}
    Route::put('/{paper}', [PaperController::class, 'update']);            // PUT /api/papers/{id}
    Route::patch('/{paper}', [PaperController::class, 'update']);          // PATCH /api/papers/{id}
    Route::delete('/{paper}', [PaperController::class, 'destroy']);        // DELETE /api/papers/{id}

    // Additional endpoints
    Route::get('/statistics/overview', [PaperController::class, 'statistics']);  // GET /api/papers/statistics/overview
    Route::delete('/bulk/delete', [PaperController::class, 'bulkDelete']);       // DELETE /api/papers/bulk/delete
    Route::get('/filters/options', [PaperController::class, 'filterOptions']);   // GET /api/papers/filters/options
});

/*
|--------------------------------------------------------------------------
| Health Check Route
|--------------------------------------------------------------------------
*/

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0'
    ]);
});
