<?php

namespace App\Http\Controllers;

use App\Models\OpenAlexCollaboration;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CollaborationController extends Controller
{
    /**
     * Get collaborations data from database
     * If data is expired (> 1 month), trigger refresh
     */
    public function index(Request $request)
    {
        // Check if data needs refresh (older than 1 month)
        $latest = OpenAlexCollaboration::orderByDesc('fetched_at')->first();
        $needsRefresh = !$latest || $latest->fetched_at->lt(Carbon::now()->subMonth());

        if ($needsRefresh) {
            // Try to refresh in background, but don't wait for it
            try {
                $this->refreshFromOpenAlex();
            } catch (\Exception $e) {
                Log::warning('Failed to refresh OpenAlex data: ' . $e->getMessage());
                // Continue with existing data if available
            }
        }

        // Get data ordered by outputs descending
        $collaborations = OpenAlexCollaboration::orderByDesc('outputs')
            ->get();

        // Return in format similar to OpenAlex API for frontend compatibility
        return response()->json([
            'group_by' => $collaborations->map(function ($collaboration) {
                return [
                    'key_display_name' => $collaboration->country_name,
                    'count' => $collaboration->outputs,
                ];
            })->values(),
            'last_updated' => $latest?->fetched_at?->toISOString(),
            'next_update' => $latest?->fetched_at?->addMonth()->toISOString(),
        ]);
    }

    /**
     * Manual refresh endpoint (POST /api/collaborations/refresh)
     */
    public function refresh(Request $request)
    {
        try {
            $this->refreshFromOpenAlex();

            return response()->json([
                'status' => 'success',
                'message' => 'Collaborations data refreshed successfully',
                'updated_at' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            Log::error('Manual refresh failed: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to refresh data: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Fetch data from OpenAlex API and store in database
     */
    protected function refreshFromOpenAlex(): void
    {
        $url = 'https://api.openalex.org/works?filter=institutions.id:i130218214&group_by=authorships.institutions.country_code&mailto=naufalsidiq@upi.edu';

        // Retry mechanism for handling 429/5xx errors
        $response = Http::retry(3, 2000, function ($exception, $request) {
            // Retry on 429 (rate limit) or 5xx server errors
            return $exception instanceof \Illuminate\Http\Client\RequestException &&
                in_array($exception->response->status(), [429, 500, 502, 503, 504]);
        })->timeout(30)->get($url);

        if (!$response->successful()) {
            $errorMsg = "OpenAlex API request failed with status {$response->status()}";
            Log::error($errorMsg, [
                'status' => $response->status(),
                'body' => $response->body(),
                'url' => $url,
            ]);
            throw new \Exception($errorMsg);
        }

        $data = $response->json();
        $items = $data['group_by'] ?? [];

        if (empty($items)) {
            Log::warning('No collaboration data received from OpenAlex API');
            return;
        }

        $now = Carbon::now();
        $updatedCount = 0;

        foreach ($items as $item) {
            $countryName = $item['key_display_name'] ?? null;
            $outputs = (int) ($item['count'] ?? 0);

            if (!$countryName || $outputs <= 0) {
                continue;
            }

            // Calculate profiles as 30% of outputs (same logic as frontend)
            $profiles = (int) floor($outputs * 0.3);

            OpenAlexCollaboration::updateOrCreate(
                ['country_name' => $countryName],
                [
                    'outputs' => $outputs,
                    'profiles' => $profiles,
                    'fetched_at' => $now,
                ]
            );

            $updatedCount++;
        }

        Log::info("OpenAlex collaborations refreshed successfully", [
            'updated_countries' => $updatedCount,
            'total_items_received' => count($items),
            'fetched_at' => $now->toISOString(),
        ]);
    }
}
