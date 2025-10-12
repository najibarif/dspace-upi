<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OpenAlexCollaboration extends Model
{
    protected $table = 'openalex_collaborations';

    protected $fillable = [
        'country_name',
        'country_code',
        'outputs',
        'profiles',
        'fetched_at',
    ];

    protected $casts = [
        'fetched_at' => 'datetime',
        'outputs' => 'integer',
        'profiles' => 'integer',
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
}
