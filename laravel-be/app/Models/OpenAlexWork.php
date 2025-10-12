<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OpenAlexWork extends Model
{
    protected $table = 'openalex_works';

    protected $fillable = [
        'openalex_id',
        'display_name',
        'type',
        'publication_year',
        'raw',
        'fetched_at',
    ];

    protected $casts = [
        'publication_year' => 'integer',
        'raw' => 'array',
        'fetched_at' => 'datetime',
    ];
}


