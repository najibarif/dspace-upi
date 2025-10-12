<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\SdgController;
use App\Http\Controllers\PaperController;
use App\Http\Controllers\CollaborationController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\OpenAlexWorkController;
use Illuminate\Http\Request;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::post('/users', [UserController::class, 'store']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);
Route::prefix('organizations')->group(function () {
    Route::get('/', [OrganizationController::class, 'index']);
    Route::get('/{id}', [OrganizationController::class, 'show']);
    Route::post('/', [OrganizationController::class, 'store']);
    Route::put('/{id}', [OrganizationController::class, 'update']);
    Route::delete('/{id}', [OrganizationController::class, 'destroy']);
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

Route::prefix('papers')->group(function () {
    Route::get('/', [PaperController::class, 'index']);
    Route::post('/', [PaperController::class, 'store']);
    Route::get('/{paper}', [PaperController::class, 'show']);
    Route::put('/{paper}', [PaperController::class, 'update']);
    Route::patch('/{paper}', [PaperController::class, 'update']);
    Route::delete('/{paper}', [PaperController::class, 'destroy']);

    Route::get('/statistics/overview', [PaperController::class, 'statistics']);
    Route::delete('/bulk/delete', [PaperController::class, 'bulkDelete']);
    Route::get('/filters/options', [PaperController::class, 'filterOptions']);
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

/*
|--------------------------------------------------------------------------
| OpenAlex Collaborations API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('collaborations')->group(function () {
    Route::get('/', [CollaborationController::class, 'index']);
    Route::post('/refresh', [CollaborationController::class, 'refresh']);
});

Route::prefix('authors')->group(function () {
    Route::get('/', [AuthorController::class, 'index']);
    Route::get('/{id}', [AuthorController::class, 'show']);
    Route::get('/{id}/works', [AuthorController::class, 'works']);
    Route::post('/refresh', [AuthorController::class, 'refresh']);
});

Route::prefix('openalex')->group(function () {
    Route::get('/works', [OpenAlexWorkController::class, 'index']);
    // IMPORTANT: static path before dynamic {id}
    Route::get('/works/filters', [OpenAlexWorkController::class, 'filters']);
    Route::get('/works/{id}', [OpenAlexWorkController::class, 'show']);
});
