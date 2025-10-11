<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrganizationController extends Controller
{
    public function index(Request $request)
    {
        $query = Organization::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('type', 'like', "%{$searchTerm}%");
            });
        }

        // Pagination
        $page = $request->get('page', 1);
        $size = $request->get('size', 20);
        
        $organizations = $query->paginate($size, ['*'], 'page', $page);

        return response()->json([
            'data' => $organizations->items(),
            'pagination' => [
                'current_page' => $organizations->currentPage(),
                'per_page' => $organizations->perPage(),
                'total' => $organizations->total(),
                'last_page' => $organizations->lastPage(),
                'from' => $organizations->firstItem(),
                'to' => $organizations->lastItem(),
            ]
        ]);
    }

    public function show($id)
    {
        $organization = Organization::findOrFail($id);
        return response()->json($organization);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'type' => 'required|in:university,faculty,school,department,center,lab,unit',
            'parent_org_id' => 'nullable|uuid|exists:organizations,org_id',
            'url' => 'nullable|string',
        ]);

        $organization = Organization::create([
            'org_id' => Str::uuid(),
            'name' => $request->name,
            'type' => $request->type,
            'parent_org_id' => $request->parent_org_id,
            'url' => $request->url,
        ]);

        return response()->json($organization, 201);
    }

    public function update(Request $request, $id)
    {
        $organization = Organization::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string',
            'type' => 'sometimes|in:university,faculty,school,department,center,lab,unit',
            'parent_org_id' => 'nullable|uuid|exists:organizations,org_id',
            'url' => 'nullable|string',
        ]);

        $organization->update($request->all());

        return response()->json($organization);
    }

    public function destroy($id)
    {
        $organization = Organization::findOrFail($id);
        $organization->delete();

        return response()->json(['message' => 'Organization deleted successfully']);
    }
}
