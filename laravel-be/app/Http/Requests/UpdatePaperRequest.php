<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaperRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $currentYear = date('Y');
        $types = [
            'journal_article',
            'conference_paper',
            'book',
            'chapter',
            'report',
            'dataset',
            'other'
        ];

        $visibilities = ['public', 'institution', 'private'];
        $paperId = $this->route('paper'); // Get the paper ID from route

        return [
            'title' => [
                'sometimes',
                'string',
                'max:500',
                'min:3'
            ],
            'normalized_title' => [
                'nullable',
                'string',
                'max:500'
            ],
            'abstract' => [
                'nullable',
                'string',
                'max:10000'
            ],
            'year' => [
                'sometimes',
                'integer',
                'min:1900',
                'max:' . ($currentYear + 1)
            ],
            'type' => [
                'sometimes',
                Rule::in($types)
            ],
            'doi' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('papers', 'doi')->ignore($paperId, 'paper_id')
            ],
            'venue_name' => [
                'nullable',
                'string',
                'max:255'
            ],
            'volume' => [
                'nullable',
                'string',
                'max:50'
            ],
            'issue' => [
                'nullable',
                'string',
                'max:50'
            ],
            'pages' => [
                'nullable',
                'string',
                'max:50'
            ],
            'url_fulltext' => [
                'nullable',
                'url',
                'max:500'
            ],
            'fingerprint_hash' => [
                'nullable',
                'string',
                'size:40',
                Rule::unique('papers', 'fingerprint_hash')->ignore($paperId, 'paper_id')
            ],
            'visibility' => [
                'sometimes',
                Rule::in($visibilities)
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.min' => 'Judul paper minimal 3 karakter.',
            'title.max' => 'Judul paper maksimal 500 karakter.',
            'year.min' => 'Tahun publikasi minimal 1900.',
            'year.max' => 'Tahun publikasi tidak boleh lebih dari tahun sekarang.',
            'type.in' => 'Jenis paper tidak valid.',
            'doi.unique' => 'DOI sudah digunakan oleh paper lain.',
            'url_fulltext.url' => 'URL fulltext harus berupa URL yang valid.',
            'fingerprint_hash.unique' => 'Fingerprint hash sudah digunakan oleh paper lain.',
            'fingerprint_hash.size' => 'Fingerprint hash harus 40 karakter.',
            'visibility.in' => 'Visibility tidak valid.',
            'abstract.max' => 'Abstract maksimal 10.000 karakter.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Auto-generate fingerprint hash if title or year is updated
        if ($this->hasAny(['title', 'year'])) {
            $paper = $this->route('paper');
            $title = $this->input('title', $paper->title ?? '');
            $year = $this->input('year', $paper->year ?? '');

            if ($title && $year) {
                $this->merge([
                    'fingerprint_hash' => sha1($title . $year)
                ]);
            }
        }
    }
}
