<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\ServiceProvider;

class ScheduleServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->app->booted(function () {
            $schedule = $this->app->make(Schedule::class);

            // Schedule OpenAlex collaborations fetch every month on the 1st at 2 AM
            $schedule->command('openalex:fetch-collaborations')
                ->monthlyOn(1, '02:00')
                ->name('fetch-openalex-collaborations')
                ->withoutOverlapping()
                ->runInBackground();

            // Schedule OpenAlex authors fetch every month on the 1st at 3 AM
            $schedule->command('openalex:fetch-authors')
                ->monthlyOn(1, '03:00')
                ->name('fetch-openalex-authors')
                ->withoutOverlapping()
                ->runInBackground();

            // Schedule OpenAlex papers fetch every month on the 1st at 4 AM
            $schedule->command('openalex:fetch-papers')
                ->monthlyOn(1, '04:00')
                ->name('fetch-openalex-papers')
                ->withoutOverlapping()
                ->runInBackground();
        });
    }
}
