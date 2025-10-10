<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sdg extends Model
{
    use HasFactory;

    protected $table = 'sdgs';
    protected $primaryKey = 'sdg_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'sdg_id',
        'number',
        'title',
        'description',
        'icon_url',
    ];
}


