<?php

namespace App\Console\Commands;

use App\Models\Paper;
use App\Models\OpenAlexWork;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FetchOpenAlexPapers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'openalex:fetch-papers {--force : Force refresh even if data is fresh} {--per-page=100 : Items per page for each API call}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch and upsert OpenAlex works (papers) into local database, scheduled monthly';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $force = $this->option('force');

        // If not forced, we can skip if we recently updated (within 1 month)
        if (!$force) {
            $latest = Paper::orderByDesc('updated_at')->first();
            if ($latest && $latest->updated_at->gt(Carbon::now()->subMonth())) {
                $this->info('Data papers masih fresh (< 1 bulan). Gunakan --force untuk memaksa refresh.');
                $this->info("Last updated: {$latest->updated_at->format('Y-m-d H:i:s')}");
                return self::SUCCESS;
            }
        }

        $this->info('Fetching OpenAlex works (papers)...');

        try {
            $this->fetchAndStorePapers();
            $this->info('✅ OpenAlex papers updated successfully!');
            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error('❌ Failed to fetch OpenAlex papers: ' . $e->getMessage());
            Log::error('OpenAlex papers fetch command failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return self::FAILURE;
        }
    }

    /**
     * Fetch and upsert papers into DB using OpenAlex Works API with cursor pagination
     */
    protected function fetchAndStorePapers(): void
    {
        $baseUrl = 'https://api.openalex.org/works';
        // Filter contoh: by institution (UPI) like collaborations, and types commonly used
        // Adjust filter as needed later (e.g., from env or config)
        $filter = 'institutions.id:i130218214,from_publication_date:2010-01-01';
        $perPage = (int) $this->option('per-page');
        if ($perPage < 1 || $perPage > 200) {
            $perPage = 100;
        }

        $params = [
            'filter' => $filter,
            'per_page' => $perPage,
            'sort' => 'cited_by_count:desc',
            'cursor' => '*',
            'mailto' => env('OPENALEX_MAILTO', 'naufalsidiq@upi.edu'),
        ];

        $totalNew = 0;
        $totalUpdated = 0;
        $page = 1;
        $now = Carbon::now();

        do {
            $this->info("Fetching page {$page}...");
            $response = Http::withHeaders(['Accept' => 'application/json'])
                ->connectTimeout(15)
                ->timeout(90)
                ->retry(5, 5000, function ($exception, $request) {
                    if ($exception instanceof \Illuminate\Http\Client\ConnectionException) {
                        return true;
                    }
                    if ($exception instanceof \Illuminate\Http\Client\RequestException) {
                        $status = optional($exception->response)->status();
                        return in_array($status, [408, 429, 500, 502, 503, 504], true);
                    }
                    return false;
                })
                ->get($baseUrl, $params);

            if (!$response->successful()) {
                throw new \Exception("API request failed with status {$response->status()}");
            }

            $payload = $response->json();
            $results = $payload['results'] ?? [];
            $nextCursor = $payload['meta']['next_cursor'] ?? null;

            $count = count($results);
            if ($count === 0) {
                $this->warn("No works found on page {$page}");
                break;
            }

            $progressBar = $this->output->createProgressBar($count);
            $progressBar->start();

            foreach ($results as $work) {
                // Map fields from OpenAlex work to our papers table
                $titleRaw = $work['display_name'] ?? ($work['title'] ?? null);
                $titleSanitized = $titleRaw ? trim(strip_tags($titleRaw)) : null;
                // Hindari error 255 karakter
                $title = $titleSanitized ? mb_substr($titleSanitized, 0, 255) : null;

                $year = (int) ($work['publication_year'] ?? ($work['from_publication_date'] ? substr($work['from_publication_date'], 0, 4) : 0));
                $type = static::mapOpenAlexType($work['type'] ?? '');
                $doi = $work['doi'] ?? null;
                $venueName = $work['host_venue']['display_name'] ?? null;
                $volume = $work['biblio']['volume'] ?? null;
                $issue = $work['biblio']['issue'] ?? null;
                $pages = null;
                if (!empty($work['biblio']['first_page']) || !empty($work['biblio']['last_page'])) {
                    $pages = trim(($work['biblio']['first_page'] ?? '') . '-' . ($work['biblio']['last_page'] ?? ''), '-');
                }
                $urlFulltext = $work['best_oa_location']['url'] ?? ($work['primary_location']['source']['homepage_url'] ?? ($work['primary_location']['landing_page_url'] ?? null));

                if (!$title || !$year) {
                    $progressBar->advance();
                    continue;
                }

                $normalizedTitle = Paper::normalizeTitle($title);

                $existing = Paper::where('normalized_title', $normalizedTitle)
                    ->where('year', $year)
                    ->first();

                if ($existing) {
                    $existing->fill([
                        'title' => $title,
                        'type' => $type,
                        'doi' => $doi,
                        'venue_name' => $venueName,
                        'volume' => $volume,
                        'issue' => $issue,
                        'pages' => $pages,
                        'url_fulltext' => $urlFulltext,
                        'visibility' => $existing->visibility ?: 'public',
                    ]);
                    // maintain normalized title for consistency
                    $existing->normalized_title = $normalizedTitle;
                    if (!$existing->fingerprint_hash) {
                        $existing->fingerprint_hash = $existing->generateFingerprintHash();
                    }
                    $existing->save();
                    $totalUpdated++;
                } else {
                    $paper = new Paper([
                        'title' => $title,
                        'normalized_title' => $normalizedTitle,
                        'abstract' => null,
                        'year' => $year,
                        'type' => $type,
                        'doi' => $doi,
                        'venue_name' => $venueName,
                        'volume' => $volume,
                        'issue' => $issue,
                        'pages' => $pages,
                        'url_fulltext' => $urlFulltext,
                        'visibility' => 'public',
                    ]);
                    $paper->fingerprint_hash = $paper->generateFingerprintHash();
                    $paper->save();
                    $totalNew++;
                }

                $progressBar->advance();

                // Upsert raw into cache table for frontend detailed needs
                try {
                    $openalexId = is_string($work['id'] ?? null) ? basename($work['id']) : null;
                    if ($openalexId) {
                        OpenAlexWork::updateOrCreate(
                            ['openalex_id' => $openalexId],
                            [
                                'display_name' => $work['display_name'] ?? ($work['title'] ?? ''),
                                'type' => $work['type'] ?? null,
                                'publication_year' => $work['publication_year'] ?? null,
                                'raw' => $work,
                                'fetched_at' => $now,
                            ]
                        );
                    }
                } catch (\Throwable $e) {
                    Log::warning('Failed to upsert OpenAlexWork cache', [
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $progressBar->finish();
            $this->newLine();

            $page++;
            $params['cursor'] = $nextCursor;
            usleep(200000); // avoid rate-limit
        } while (!empty($params['cursor']));

        $this->info("\xF0\x9F\x93\x8A Summary:");
        $this->info("  • New papers: {$totalNew}");
        $this->info("  • Updated papers: {$totalUpdated}");
        $this->info("  • Total processed: " . ($totalNew + $totalUpdated));

        Log::info('OpenAlex papers command completed successfully', [
            'new_papers' => $totalNew,
            'updated_papers' => $totalUpdated,
            'total_processed' => $totalNew + $totalUpdated,
            'fetched_at' => $now->toISOString(),
        ]);
    }

    /**
     * Map OpenAlex work type to our papers.type enum
     */
    protected static function mapOpenAlexType(string $oaType): string
    {
        $oaType = strtolower($oaType);
        return match ($oaType) {
            'journal-article', 'article' => 'journal_article',
            'proceedings-article', 'conference-paper' => 'conference_paper',
            'book' => 'book',
            'book-chapter', 'chapter' => 'chapter',
            'report' => 'report',
            'dataset' => 'dataset',
            default => 'other',
        };
    }
}


