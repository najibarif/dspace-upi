<?php

namespace App\Console\Commands;

use App\Models\OpenAlexCollaboration;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FetchOpenAlexCollaborations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'openalex:fetch-collaborations {--force : Force refresh even if data is fresh}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch and update OpenAlex collaborations data (scheduled monthly)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $force = $this->option('force');

        // Check if data is fresh (less than 1 month old)
        if (!$force) {
            $latest = OpenAlexCollaboration::orderByDesc('fetched_at')->first();

            if ($latest && $latest->fetched_at->gt(Carbon::now()->subMonth())) {
                $this->info('Data is still fresh (less than 1 month old). Use --force to refresh anyway.');
                $this->info("Last updated: {$latest->fetched_at->format('Y-m-d H:i:s')}");
                return self::SUCCESS;
            }
        }

        $this->info('Fetching OpenAlex collaborations data...');

        try {
            $this->fetchAndStoreData();
            $this->info('✅ OpenAlex collaborations data updated successfully!');
            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error('❌ Failed to fetch OpenAlex data: ' . $e->getMessage());
            Log::error('OpenAlex fetch command failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return self::FAILURE;
        }
    }

    /**
     * Fetch data from OpenAlex API and store in database
     */
    protected function fetchAndStoreData(): void
    {
        $url = 'https://api.openalex.org/works?filter=institutions.id:i130218214&group_by=authorships.institutions.country_code&mailto=naufalsidiq@upi.edu';

        $this->info("Fetching from: {$url}");

        // Retry mechanism for handling 429/5xx errors
        $response = Http::retry(3, 2000, function ($exception, $request) {
            // Retry on 429 (rate limit) or 5xx server errors
            return $exception instanceof \Illuminate\Http\Client\RequestException &&
                in_array($exception->response->status(), [429, 500, 502, 503, 504]);
        })->timeout(30)->get($url);

        if (!$response->successful()) {
            throw new \Exception("API request failed with status {$response->status()}");
        }

        $data = $response->json();
        $items = $data['group_by'] ?? [];

        if (empty($items)) {
            throw new \Exception('No collaboration data received from API');
        }

        $now = Carbon::now();
        $updatedCount = 0;
        $newCount = 0;

        $count = count($items);
        $this->info("Processing {$count} collaboration records...");

        $progressBar = $this->output->createProgressBar($count);
        $progressBar->start();

        foreach ($items as $item) {
            $countryName = $item['key_display_name'] ?? null;
            $outputs = (int) ($item['count'] ?? 0);

            if (!$countryName || $outputs <= 0) {
                $progressBar->advance();
                continue;
            }

            // Calculate profiles as 30% of outputs
            $profiles = (int) floor($outputs * 0.3);

            $isNew = !OpenAlexCollaboration::where('country_name', $countryName)->exists();

            OpenAlexCollaboration::updateOrCreate(
                ['country_name' => $countryName],
                [
                    'outputs' => $outputs,
                    'profiles' => $profiles,
                    'fetched_at' => $now,
                ]
            );

            $isNew ? $newCount++ : $updatedCount++;
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine();

        $this->info("📊 Summary:");
        $this->info("  • New countries: {$newCount}");
        $this->info("  • Updated countries: {$updatedCount}");
        $this->info("  • Total processed: " . ($newCount + $updatedCount));
        $this->info("  • Last updated: {$now->format('Y-m-d H:i:s')}");
        $this->info("  • Next scheduled update: {$now->addMonth()->format('Y-m-d H:i:s')}");

        Log::info('OpenAlex collaborations command completed successfully', [
            'new_countries' => $newCount,
            'updated_countries' => $updatedCount,
            'total_processed' => $newCount + $updatedCount,
            'fetched_at' => $now->toISOString(),
        ]);
    }
}
