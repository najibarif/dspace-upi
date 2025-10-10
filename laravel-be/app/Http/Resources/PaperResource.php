<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaperResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'paper_id' => $this->paper_id,
            'title' => $this->title,
            'normalized_title' => $this->normalized_title,
            'abstract' => $this->abstract,
            'year' => $this->year,
            'type' => $this->type,
            'type_label' => $this->getTypeLabel(),
            'doi' => $this->doi,
            'venue_name' => $this->venue_name,
            'volume' => $this->volume,
            'issue' => $this->issue,
            'pages' => $this->pages,
            'url_fulltext' => $this->url_fulltext,
            'visibility' => $this->visibility,
            'visibility_label' => $this->getVisibilityLabel(),
            'is_public' => $this->isPublic(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Future relationships (uncomment when you create related models)
            // 'authors' => AuthorResource::collection($this->whenLoaded('authors')),
            // 'keywords' => KeywordResource::collection($this->whenLoaded('keywords')),
            // 'citations_count' => $this->whenLoaded('citations', fn() => $this->citations->count()),
            // 'cited_by_count' => $this->whenLoaded('citedBy', fn() => $this->citedBy->count()),
        ];
    }

    /**
     * Get the type label for the paper.
     */
    private function getTypeLabel(): string
    {
        $options = [
            'journal_article' => 'Journal Article',
            'conference_paper' => 'Conference Paper',
            'book' => 'Book',
            'chapter' => 'Chapter',
            'report' => 'Report',
            'dataset' => 'Dataset',
            'other' => 'Other',
        ];

        return $options[$this->type] ?? $this->type;
    }

    /**
     * Get the visibility label for the paper.
     */
    private function getVisibilityLabel(): string
    {
        $options = [
            'public' => 'Public',
            'institution' => 'Institution',
            'private' => 'Private',
        ];

        return $options[$this->visibility] ?? $this->visibility;
    }
}
