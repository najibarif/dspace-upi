<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaperRequest extends FormRequest
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

        return [
            'title' => [
                'required',
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
                'required',
                'integer',
                'min:1900',
                'max:' . ($currentYear + 1)
            ],
            'type' => [
                'required',
                Rule::in($types)
            ],
            'doi' => [
                'nullable',
                'string',
                'max:255',
                'unique:papers,doi'
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
                'unique:papers,fingerprint_hash'
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
            'title.required' => 'Judul paper harus diisi.',
            'title.min' => 'Judul paper minimal 3 karakter.',
            'title.max' => 'Judul paper maksimal 500 karakter.',
            'year.required' => 'Tahun publikasi harus diisi.',
            'year.min' => 'Tahun publikasi minimal 1900.',
            'year.max' => 'Tahun publikasi tidak boleh lebih dari tahun sekarang.',
            'type.required' => 'Jenis paper harus diisi.',
            'type.in' => 'Jenis paper tidak valid.',
            'doi.unique' => 'DOI sudah digunakan oleh paper lain.',
            'url_fulltext.url' => 'URL fulltext harus berupa URL yang valid.',
            'fingerprint_hash.unique' => 'Fingerprint hash sudah digunakan oleh paper lain.',
            'fingerprint_hash.size' => 'Fingerprint hash harus 40 karakter.',
            'visibility.in' => 'Visibility tidak valid.',
            'abstract.max' => 'Abstract maksimal 10.000 karakter.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (!$this->has('fingerprint_hash') && $this->has('title') && $this->has('year')) {
            $this->merge([
                'fingerprint_hash' => sha1($this->input('title') . $this->input('year'))
            ]);
        }

        if (!$this->has('visibility')) {
            $this->merge(['visibility' => 'public']);
        }
    }
}
