<?php

namespace App\Http\Controllers;

use App\Models\Sdg;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SdgController extends Controller
{
    public function index()
    {
        return response()->json(Sdg::orderBy('number')->get());
    }

    public function show($id)
    {
        $sdg = Sdg::findOrFail($id);
        return response()->json($sdg);
    }

    public function store(Request $request)
    {
        $request->validate([
            'number' => 'required|integer|min:1|max:17|unique:sdgs,number',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'icon_url' => 'nullable|url',
        ]);

        $sdg = Sdg::create([
            'sdg_id' => Str::uuid(),
            'number' => $request->number,
            'title' => $request->title,
            'description' => $request->description,
            'icon_url' => $request->icon_url,
        ]);

        return response()->json($sdg, 201);
    }

    public function update(Request $request, $id)
    {
        $sdg = Sdg::findOrFail($id);

        $request->validate([
            'number' => 'sometimes|integer|min:1|max:17|unique:sdgs,number,' . $sdg->sdg_id . ',sdg_id',
            'title' => 'sometimes|string',
            'description' => 'nullable|string',
            'icon_url' => 'nullable|url',
        ]);

        $sdg->update($request->all());
        return response()->json($sdg);
    }

    public function destroy($id)
    {
        $sdg = Sdg::findOrFail($id);
        $sdg->delete();
        return response()->json(['message' => 'SDG deleted successfully']);
    }
}


