<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Paper extends Model
{
    use HasFactory, HasUuids;

    /**
     * The table associated with the model.
     */
    protected $table = 'papers';

    /**
     * The primary key for the model.
     */
    protected $primaryKey = 'paper_id';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'title',
        'normalized_title',
        'abstract',
        'year',
        'type',
        'doi',
        'venue_name',
        'volume',
        'issue',
        'pages',
        'url_fulltext',
        'fingerprint_hash',
        'visibility',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'year' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'fingerprint_hash',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($paper) {
            if (empty($paper->normalized_title)) {
                $paper->normalized_title = static::normalizeTitle($paper->title);
            }
        });

        static::updating(function ($paper) {
            if ($paper->isDirty('title') && empty($paper->normalized_title)) {
                $paper->normalized_title = static::normalizeTitle($paper->title);
            }
        });
    }

    /**
     * Generate fingerprint hash for the paper.
     */
    public function generateFingerprintHash(): string
    {
        $data = $this->title . $this->year;

        // Add authors if they exist (you can extend this when you add authors table)
        // $data .= $this->authors->pluck('name')->implode('');

        return sha1($data);
    }

    /**
     * Normalize title for comparison.
     */
    public static function normalizeTitle(string $title): string
    {
        return Str::lower(trim(preg_replace('/\s+/', ' ', $title)));
    }

    /**
     * Scope a query to only include public papers.
     */
    public function scopePublic($query)
    {
        return $query->where('visibility', 'public');
    }

    /**
     * Scope a query to only include papers by type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include papers by year.
     */
    public function scopeByYear($query, int $year)
    {
        return $query->where('year', $year);
    }

    /**
     * Scope a query to search papers by title.
     */
    public function scopeSearchByTitle($query, string $title)
    {
        return $query->where('normalized_title', 'like', '%' . static::normalizeTitle($title) . '%');
    }

    /**
     * Get the paper type options.
     */
    public static function getTypeOptions(): array
    {
        return [
            'journal_article' => 'Journal Article',
            'conference_paper' => 'Conference Paper',
            'book' => 'Book',
            'chapter' => 'Chapter',
            'report' => 'Report',
            'dataset' => 'Dataset',
            'other' => 'Other',
        ];
    }

    /**
     * Get the visibility options.
     */
    public static function getVisibilityOptions(): array
    {
        return [
            'public' => 'Public',
            'institution' => 'Institution',
            'private' => 'Private',
        ];
    }

    /**
     * Check if paper is public.
     */
    public function isPublic(): bool
    {
        return $this->visibility === 'public';
    }

    /**
     * Check if paper is private.
     */
    public function isPrivate(): bool
    {
        return $this->visibility === 'private';
    }

    /**
     * Check if paper is institution only.
     */
    public function isInstitutionOnly(): bool
    {
        return $this->visibility === 'institution';
    }

    // Future relationships (uncomment when you create related models)

    /**
     * Get the authors for the paper.
     */
    // public function authors(): BelongsToMany
    // {
    //     return $this->belongsToMany(Author::class, 'paper_authors', 'paper_id', 'author_id');
    // }

    /**
     * Get the keywords for the paper.
     */
    // public function keywords(): BelongsToMany
    // {
    //     return $this->belongsToMany(Keyword::class, 'paper_keywords', 'paper_id', 'keyword_id');
    // }

    /**
     * Get the citations for this paper.
     */
    // public function citations(): HasMany
    // {
    //     return $this->hasMany(Citation::class, 'cited_paper_id');
    // }

    /**
     * Get the papers that cite this paper.
     */
    // public function citedBy(): HasMany
    // {
    //     return $this->hasMany(Citation::class, 'citing_paper_id');
    // }
}
