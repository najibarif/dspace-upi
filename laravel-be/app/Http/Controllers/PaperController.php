<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaperRequest;
use App\Http\Requests\UpdatePaperRequest;
use App\Http\Resources\PaperCollection;
use App\Http\Resources\PaperResource;
use App\Models\Paper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaperController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Paper::query();

            // Search by title
            if ($request->has('search') && !empty($request->search)) {
                $query->searchByTitle($request->search);
            }

            // Filter by type
            if ($request->has('type') && !empty($request->type)) {
                $query->ofType($request->type);
            }

            // Filter by year
            if ($request->has('year') && !empty($request->year)) {
                $query->byYear($request->year);
            }

            // Filter by visibility
            if ($request->has('visibility') && !empty($request->visibility)) {
                $query->where('visibility', $request->visibility);
            }

            // Sort options
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            $allowedSortFields = ['title', 'year', 'type', 'visibility', 'created_at', 'updated_at'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            // Pagination
            $perPage = min($request->get('per_page', 15), 100); // Max 100 per page
            $papers = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Data papers berhasil diambil.',
                'data' => new PaperCollection($papers)
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching papers: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data papers.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePaperRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $paper = Paper::create($request->validated());

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Paper berhasil dibuat.',
                'data' => new PaperResource($paper)
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating paper: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat membuat paper.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $paper = Paper::findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Data paper berhasil diambil.',
                'data' => new PaperResource($paper)
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Paper tidak ditemukan.'
            ], 404);

        } catch (\Exception $e) {
            Log::error('Error fetching paper: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data paper.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePaperRequest $request, string $id): JsonResponse
    {
        try {
            $paper = Paper::findOrFail($id);

            DB::beginTransaction();

            $paper->update($request->validated());

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Paper berhasil diperbarui.',
                'data' => new PaperResource($paper->fresh())
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Paper tidak ditemukan.'
            ], 404);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating paper: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui paper.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $paper = Paper::findOrFail($id);

            DB::beginTransaction();

            $paper->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Paper berhasil dihapus.'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Paper tidak ditemukan.'
            ], 404);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting paper: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus paper.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get paper statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total_papers' => Paper::count(),
                'public_papers' => Paper::public()->count(),
                'papers_by_type' => Paper::selectRaw('type, COUNT(*) as count')
                    ->groupBy('type')
                    ->pluck('count', 'type')
                    ->toArray(),
                'papers_by_year' => Paper::selectRaw('year, COUNT(*) as count')
                    ->groupBy('year')
                    ->orderBy('year', 'desc')
                    ->limit(10)
                    ->pluck('count', 'year')
                    ->toArray(),
                'papers_by_visibility' => Paper::selectRaw('visibility, COUNT(*) as count')
                    ->groupBy('visibility')
                    ->pluck('count', 'visibility')
                    ->toArray(),
            ];

            return response()->json([
                'success' => true,
                'message' => 'Statistik papers berhasil diambil.',
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching paper statistics: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil statistik papers.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Bulk delete papers.
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'uuid|exists:papers,paper_id'
        ]);

        try {
            DB::beginTransaction();

            $deletedCount = Paper::whereIn('paper_id', $request->ids)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "{$deletedCount} paper berhasil dihapus."
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error bulk deleting papers: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus papers.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get available filter options.
     */
    public function filterOptions(): JsonResponse
    {
        try {
            $options = [
                'types' => Paper::getTypeOptions(),
                'visibilities' => Paper::getVisibilityOptions(),
                'years' => Paper::select('year')
                    ->distinct()
                    ->orderBy('year', 'desc')
                    ->pluck('year')
                    ->toArray(),
            ];

            return response()->json([
                'success' => true,
                'message' => 'Opsi filter berhasil diambil.',
                'data' => $options
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching filter options: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil opsi filter.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
