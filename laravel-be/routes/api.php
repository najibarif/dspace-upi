<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\SdgController;
use App\Http\Controllers\PaperController;
use Illuminate\Http\Request;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});
// Public user routes (available at /api/users)
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::post('/users', [UserController::class, 'store']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);
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
