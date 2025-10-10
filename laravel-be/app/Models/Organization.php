<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Organization extends Model
{
    use HasFactory;

    protected $primaryKey = 'org_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'org_id',
        'name',
        'type',
        'parent_org_id',
        'url',
    ];

    public function parent()
    {
        return $this->belongsTo(Organization::class, 'parent_org_id');
    }

    public function children()
    {
        return $this->hasMany(Organization::class, 'parent_org_id');
    }
}
