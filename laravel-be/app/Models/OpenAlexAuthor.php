<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OpenAlexAuthor extends Model
{
    protected $table = 'openalex_authors';

    protected $fillable = [
        'openalex_id',
        'display_name',
        'last_known_institutions',
        'h_index',
        'works_count',
        'cited_by_count',
        'summary_stats',
        'counts_by_year',
        'x_concepts',
        'fetched_at',
    ];

    protected $casts = [
        'last_known_institutions' => 'array',
        'summary_stats' => 'array',
        'counts_by_year' => 'array',
        'x_concepts' => 'array',
        'fetched_at' => 'datetime',
        'h_index' => 'integer',
        'works_count' => 'integer',
        'cited_by_count' => 'integer',
    ];

    /**
     * Scope untuk data yang masih fresh (kurang dari 1 bulan)
     */
    public function scopeFresh($query)
    {
        return $query->where('fetched_at', '>=', now()->subMonth());
    }

    /**
     * Scope untuk data yang sudah expired (lebih dari 1 bulan)
     */
    public function scopeExpired($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('fetched_at')
                ->orWhere('fetched_at', '<', now()->subMonth());
        });
    }

    /**
     * Scope untuk search berdasarkan nama atau afiliasi
     */
    public function scopeSearch($query, $search)
    {
        if (!$search)
            return $query;

        return $query->where(function ($q) use ($search) {
            $q->where('display_name', 'like', "%{$search}%")
                ->orWhereJsonContains('last_known_institutions', $search);
        });
    }

    /**
     * Get author ID from OpenAlex URL
     */
    public static function extractIdFromUrl($url)
    {
        return basename($url);
    }
}
