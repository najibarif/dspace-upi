<?php

namespace App\Console\Commands;

use App\Models\OpenAlexAuthor;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FetchOpenAlexAuthors extends Command
{
    protected $signature = 'openalex:fetch-authors {--force : Force refresh even if data is fresh}';
    protected $description = 'Fetch and update OpenAlex authors data (scheduled monthly)';

    public function handle(): int
    {
        $force = $this->option('force');

        if (!$force) {
            $latest = OpenAlexAuthor::orderByDesc('fetched_at')->first();
            if ($latest && $latest->fetched_at->gt(Carbon::now()->subMonth())) {
                $this->info('Data is still fresh (less than 1 month old). Use --force to refresh anyway.');
                $this->info("Last updated: {$latest->fetched_at->format('Y-m-d H:i:s')}");
                return self::SUCCESS;
            }
        }

        $this->info('Fetching OpenAlex authors data...');

        try {
            $this->fetchAndStoreAuthors();
            $this->info('✅ OpenAlex authors data updated successfully!');
            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error('❌ Failed to fetch OpenAlex authors: ' . $e->getMessage());
            Log::error('OpenAlex authors fetch command failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return self::FAILURE;
        }
    }

    protected function fetchAndStoreAuthors(): void
    {
        // Mulai dengan cursor mode
        $baseUrl = 'https://api.openalex.org/authors';
        $params = [
            'filter' => 'last_known_institutions.ror:https://ror.org/044b0xj37',
            'per_page' => 100,
            'sort' => 'works_count:desc',
            'cursor' => '*',
            'mailto' => env('OPENALEX_MAILTO', 'naufalsidiq@upi.edu'),
        ];

        $totalNew = 0;
        $totalUpdated = 0;
        $page = 1;
        $now = Carbon::now();

        do {
            $url = $baseUrl . '?' . http_build_query($params);
            $this->info("Fetching page {$page}...");

            $response = Http::withHeaders(['Accept' => 'application/json'])
                ->connectTimeout(15)     // waktu tunggu koneksi
                ->timeout(90)            // total waktu request (naik dari 30s -> 90s)
                ->retry(5, 5000, function ($exception, $request) {
                    // Retry kalau timeout/koneksi putus, atau 408/429/5xx
                    if ($exception instanceof ConnectionException)
                        return true;
                    if ($exception instanceof RequestException) {
                        $status = optional($exception->response)->status();
                        return in_array($status, [408, 429, 500, 502, 503, 504], true);
                    }
                    return false;
                })
                ->get($baseUrl, $params);

            if (!$response->successful()) {
                throw new \Exception("API request failed with status {$response->status()}");
            }

            $data = $response->json();
            $authors = $data['results'] ?? [];
            $nextCursor = $data['meta']['next_cursor'] ?? null;

            $count = count($authors);
            if ($count === 0) {
                $this->warn("No authors found on page {$page}");
                break;
            }

            $progressBar = $this->output->createProgressBar($count);
            $progressBar->start();

            foreach ($authors as $authorData) {
                $openalexId = OpenAlexAuthor::extractIdFromUrl($authorData['id']);
                $isNew = !OpenAlexAuthor::where('openalex_id', $openalexId)->exists();

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

                $isNew ? $totalNew++ : $totalUpdated++;
                $progressBar->advance();
            }

            $progressBar->finish();
            $this->newLine();

            $page++;
            $params['cursor'] = $nextCursor;
            usleep(200000); // jeda 200ms agar tidak kena rate-limit
        } while (!empty($params['cursor']));

        $this->info("📊 Summary:");
        $this->info("  • New authors: {$totalNew}");
        $this->info("  • Updated authors: {$totalUpdated}");
        $this->info("  • Total processed: " . ($totalNew + $totalUpdated));
        $this->info("  • Last updated: {$now->format('Y-m-d H:i:s')}");
        $this->info("  • Next scheduled update: {$now->copy()->addMonth()->format('Y-m-d H:i:s')}");

        Log::info('OpenAlex authors command completed successfully', [
            'new_authors' => $totalNew,
            'updated_authors' => $totalUpdated,
            'total_processed' => $totalNew + $totalUpdated,
            'fetched_at' => $now->toISOString(),
        ]);
    }
}
