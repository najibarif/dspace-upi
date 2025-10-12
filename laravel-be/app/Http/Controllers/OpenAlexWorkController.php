<?php

namespace App\Http\Controllers;

use App\Models\OpenAlexWork;
use Illuminate\Http\Request;

class OpenAlexWorkController extends Controller
{
    /**
     * GET /api/openalex/works
     * Query params: page, per_page, search (q), filter (type, year range like frontend)
     */
    public function index(Request $request)
    {
        $page = max((int) $request->query('page', 1), 1);
        $perPage = min(max((int) $request->query('per_page', 12), 1), 200);
        $q = trim((string) $request->query('search', ''));
        $filter = trim((string) $request->query('filter', ''));
        $sort = trim((string) $request->query('sort', 'year-desc'));

        $query = OpenAlexWork::query();

        if ($q !== '') {
            $query->where('display_name', 'like', "%{$q}%");
        }

        if ($filter !== '') {
            $parts = collect(explode(',', $filter))->map(fn($p) => trim($p))->filter();
            foreach ($parts as $p) {
                if (str_starts_with($p, 'type:')) {
                    $types = explode('|', substr($p, strlen('type:')));
                    $query->whereIn('type', array_filter($types));
                } elseif (str_starts_with($p, 'from_publication_date:')) {
                    $val = substr($p, strlen('from_publication_date:'));
                    $year = (int) substr($val, 0, 4);
                    if ($year > 0)
                        $query->where('publication_year', '>=', $year);
                } elseif (str_starts_with($p, 'to_publication_date:')) {
                    $val = substr($p, strlen('to_publication_date:'));
                    $year = (int) substr($val, 0, 4);
                    if ($year > 0)
                        $query->where('publication_year', '<=', $year);
                } elseif (str_starts_with($p, 'concept:')) {
                    $val = substr($p, strlen('concept:'));
                    $concepts = array_filter(explode('|', $val));
                    if (!empty($concepts)) {
                        $query->where(function ($q) use ($concepts) {
                            foreach ($concepts as $c) {
                                // Match by display_name inside concepts array
                                $q->orWhereRaw("JSON_SEARCH(raw, 'one', ?, NULL, '$.concepts[*].display_name') IS NOT NULL", [$c]);
                            }
                        });
                    }
                } elseif (str_starts_with($p, 'sdg:')) {
                    $val = substr($p, strlen('sdg:'));
                    $sdgs = array_filter(explode('|', $val));
                    if (!empty($sdgs)) {
                        $query->where(function ($q) use ($sdgs) {
                            foreach ($sdgs as $s) {
                                // Match by display_name inside sustainable_development_goals array
                                $q->orWhereRaw("JSON_SEARCH(raw, 'one', ?, NULL, '$.sustainable_development_goals[*].display_name') IS NOT NULL", [$s]);
                            }
                        });
                    }
                }
            }
        }

        // Sorting
        switch ($sort) {
            case 'title-asc':
                $query->orderBy('display_name', 'asc')->orderBy('id', 'desc');
                break;
            case 'title-desc':
                $query->orderBy('display_name', 'desc')->orderBy('id', 'desc');
                break;
            case 'year-asc':
                $query->orderBy('publication_year', 'asc')->orderBy('id', 'desc');
                break;
            case 'year-desc':
                $query->orderBy('publication_year', 'desc')->orderBy('id', 'desc');
                break;
            case 'cite-asc':
                // Order by JSON value cited_by_count ascending
                $query->orderByRaw("JSON_EXTRACT(raw, '$.cited_by_count') ASC")
                    ->orderBy('id', 'desc');
                break;
            case 'cite-desc':
                $query->orderByRaw("JSON_EXTRACT(raw, '$.cited_by_count') DESC")
                    ->orderBy('id', 'desc');
                break;
            default:
                // Fallback
                $query->orderBy('publication_year', 'desc')->orderBy('id', 'desc');
                break;
        }

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'results' => $paginator->map(fn($w) => $w->raw)->values(),
            'meta' => [
                'count' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'page' => $paginator->currentPage(),
                'total_pages' => $paginator->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/openalex/works/{id}
     */
    public function show(string $id)
    {
        $idShort = str_contains($id, '/') ? basename($id) : $id;
        $work = OpenAlexWork::where('openalex_id', $idShort)->first();
        if (!$work) {
            return response()->json(['message' => 'Not found'], 404);
        }
        return response()->json($work->raw);
    }

    /**
     * GET /api/openalex/works/filters
     * Returns top concepts and SDGs with counts
     */
    public function filters(Request $request)
    {
        $limit = max((int) $request->query('limit', 100), 1);
        $sampleSize = max((int) $request->query('sample', 2000), 1);
        $q = trim((string) $request->query('search', ''));
        $filter = trim((string) $request->query('filter', ''));

        // Build base query with same constraints as index()
        $query = OpenAlexWork::query();
        if ($q !== '') {
            $query->where('display_name', 'like', "%{$q}%");
        }
        if ($filter !== '') {
            $parts = collect(explode(',', $filter))->map(fn($p) => trim($p))->filter();
            foreach ($parts as $p) {
                if (str_starts_with($p, 'type:')) {
                    $types = explode('|', substr($p, strlen('type:')));
                    $query->whereIn('type', array_filter($types));
                } elseif (str_starts_with($p, 'from_publication_date:')) {
                    $val = substr($p, strlen('from_publication_date:'));
                    $year = (int) substr($val, 0, 4);
                    if ($year > 0)
                        $query->where('publication_year', '>=', $year);
                } elseif (str_starts_with($p, 'to_publication_date:')) {
                    $val = substr($p, strlen('to_publication_date:'));
                    $year = (int) substr($val, 0, 4);
                    if ($year > 0)
                        $query->where('publication_year', '<=', $year);
                } elseif (str_starts_with($p, 'concept:')) {
                    $val = substr($p, strlen('concept:'));
                    $concepts = array_filter(explode('|', $val));
                    if (!empty($concepts)) {
                        $query->where(function ($q2) use ($concepts) {
                            foreach ($concepts as $c) {
                                $q2->orWhereRaw("JSON_SEARCH(raw, 'one', ?, NULL, '$.concepts[*].display_name') IS NOT NULL", [$c]);
                            }
                        });
                    }
                } elseif (str_starts_with($p, 'sdg:')) {
                    $val = substr($p, strlen('sdg:'));
                    $sdgs = array_filter(explode('|', $val));
                    if (!empty($sdgs)) {
                        $query->where(function ($q2) use ($sdgs) {
                            foreach ($sdgs as $s) {
                                $q2->orWhereRaw("JSON_SEARCH(raw, 'one', ?, NULL, '$.sustainable_development_goals[*].display_name') IS NOT NULL", [$s]);
                            }
                        });
                    }
                }
            }
        }

        // Fetch a sample of filtered works to aggregate facets
        $works = $query->select('raw')
            ->orderByDesc('publication_year')
            ->limit($sampleSize)
            ->get();

        $conceptCounts = [];
        $sdgCounts = [];

        foreach ($works as $w) {
            $raw = (array) ($w->raw ?? []);
            $concepts = is_array($raw['concepts'] ?? null) ? $raw['concepts'] : [];
            foreach ($concepts as $c) {
                $name = is_array($c) ? ($c['display_name'] ?? null) : null;
                if (!$name)
                    continue;
                $conceptCounts[$name] = ($conceptCounts[$name] ?? 0) + 1;
            }

            $sdgs = is_array($raw['sustainable_development_goals'] ?? null) ? $raw['sustainable_development_goals'] : [];
            foreach ($sdgs as $s) {
                $name = is_array($s) ? ($s['display_name'] ?? null) : null;
                if (!$name)
                    continue;
                $sdgCounts[$name] = ($sdgCounts[$name] ?? 0) + 1;
            }
        }

        arsort($conceptCounts);
        arsort($sdgCounts);

        $conceptsOut = [];
        foreach (array_slice($conceptCounts, 0, $limit, true) as $name => $count) {
            $conceptsOut[] = ['name' => $name, 'count' => (int) $count];
        }
        $sdgsOut = [];
        foreach (array_slice($sdgCounts, 0, $limit, true) as $name => $count) {
            $sdgsOut[] = ['name' => $name, 'count' => (int) $count];
        }

        return response()->json([
            'concepts' => $conceptsOut,
            'sdgs' => $sdgsOut,
        ]);
    }
}


