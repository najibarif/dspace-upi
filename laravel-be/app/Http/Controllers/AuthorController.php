<?php

namespace App\Http\Controllers;

use App\Models\OpenAlexAuthor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AuthorController extends Controller
{
    /**
     * Get authors list from database
     */
    public function index(Request $request)
    {
        $query = $request->get('q', '');
        $sortBy = $request->get('sort', 'works_count');
        $perPage = min($request->get('per_page', 12), 200); // Default 12 to match frontend
        $page = max($request->get('page', 1), 1); // Ensure page is at least 1

        $authorsQuery = OpenAlexAuthor::query();

        // Search filter
        if ($query) {
            $authorsQuery->search($query);
        }

        // Sorting
        switch ($sortBy) {
            case 'name':
                $authorsQuery->orderBy('display_name');
                break;
            case 'hIndex':
                $authorsQuery->orderByDesc('h_index');
                break;
            case 'works_count':
            default:
                $authorsQuery->orderByDesc('works_count');
                break;
        }

        $authors = $authorsQuery->paginate($perPage, ['*'], 'page', $page);

        // Transform to match OpenAlex API format
        $results = $authors->map(function ($author) {
            return [
                'id' => $author->openalex_id,
                'display_name' => $author->display_name,
                'last_known_institutions' => $author->last_known_institutions,
                'summary_stats' => $author->summary_stats,
                'works_count' => $author->works_count,
                'cited_by_count' => $author->cited_by_count,
            ];
        });

        return response()->json([
            'results' => $results,
            'meta' => [
                'count' => $authors->total(),
                'per_page' => $authors->perPage(),
                'current_page' => $authors->currentPage(),
                'total_pages' => $authors->lastPage(),
            ],
            'last_updated' => OpenAlexAuthor::latest('fetched_at')->first()?->fetched_at?->toISOString(),
        ]);
    }

    /**
     * Get single author detail from database
     */
    public function show($id)
    {
        $author = OpenAlexAuthor::where('openalex_id', $id)->first();

        if (!$author) {
            return response()->json(['error' => 'Author not found'], 404);
        }

        return response()->json($author);
    }

    /**
     * Get author's works from database (if we decide to cache works too)
     * For now, this will still call OpenAlex API directly for works
     */
    public function works($id)
    {
        // For now, redirect to OpenAlex API for works data
        // In the future, we can cache works data too
        $url = "https://api.openalex.org/works?filter=author.id:{$id}&per-page=200";

        try {
            $response = Http::retry(3, 2000)->timeout(30)->get($url);

            if (!$response->successful()) {
                return response()->json(['error' => 'Failed to fetch works'], $response->status());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to fetch author works', [
                'author_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Failed to fetch works'], 500);
        }
    }

    /**
     * Manual refresh endpoint (POST /api/authors/refresh)
     */
    public function refresh(Request $request)
    {
        try {
            $this->refreshAuthorsFromOpenAlex();

            return response()->json([
                'status' => 'success',
                'message' => 'Authors data refreshed successfully',
                'updated_at' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            Log::error('Manual authors refresh failed: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to refresh authors data: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Fetch authors data from OpenAlex API and store in database
     */
    protected function refreshAuthorsFromOpenAlex(): void
    {
        $url = 'https://api.openalex.org/authors?filter=last_known_institutions.ror:https://ror.org/044b0xj37&per_page=200&sort=works_count:desc';

        // Retry mechanism for handling 429/5xx errors
        $response = Http::retry(3, 2000, function ($exception, $request) {
            return $exception instanceof \Illuminate\Http\Client\RequestException &&
                in_array($exception->response->status(), [429, 500, 502, 503, 504]);
        })->timeout(30)->get($url);

        if (!$response->successful()) {
            $errorMsg = "OpenAlex Authors API request failed with status {$response->status()}";
            Log::error($errorMsg, [
                'status' => $response->status(),
                'body' => $response->body(),
                'url' => $url,
            ]);
            throw new \Exception($errorMsg);
        }

        $data = $response->json();
        $authors = $data['results'] ?? [];

        if (empty($authors)) {
            Log::warning('No authors data received from OpenAlex API');
            return;
        }

        $now = Carbon::now();
        $updatedCount = 0;

        foreach ($authors as $authorData) {
            $openalexId = OpenAlexAuthor::extractIdFromUrl($authorData['id']);

            OpenAlexAuthor::updateOrCreate(
                ['openalex_id' => $openalexId],
                [
                    'display_name' => $authorData['display_name'],
                    'last_known_institutions' => $authorData['last_known_institutions'] ?? null,
                    'h_index' => $authorData['summary_stats']['h_index'] ?? 0,
                    'works_count' => $authorData['works_count'] ?? 0,
                    'cited_by_count' => $authorData['cited_by_count'] ?? 0,
                    'summary_stats' => $authorData['summary_stats'] ?? null,
                    'counts_by_year' => $authorData['counts_by_year'] ?? null,
                    'x_concepts' => $authorData['x_concepts'] ?? null,
                    'fetched_at' => $now,
                ]
            );

            $updatedCount++;
        }

        Log::info("OpenAlex authors refreshed successfully", [
            'updated_authors' => $updatedCount,
            'total_authors_received' => count($authors),
            'fetched_at' => $now->toISOString(),
        ]);
    }
}
