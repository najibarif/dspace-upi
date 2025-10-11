<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::latest()->paginate(10);
        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'       => 'required|string|min:3|max:100',
            'username'   => 'required|string|max:50|unique:users',
            'nim'        => 'nullable|numeric|unique:users,nim',
            'email'      => 'required|email|unique:users,email',
            'faculty'    => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'password'   => 'required|min:6|confirmed', 
        ]);

        $user = User::create([
            'name'       => $request->name,
            'username'   => $request->username,
            'nim'        => $request->nim ?? null,
            'email'      => $request->email,
            'faculty'    => $request->faculty,
            'department' => $request->department,
            'password'   => Hash::make($request->password),
        ]);

        return response()->json(["message" => "User created", "data" => $user], 201);
    }
    public function show($id): JsonResponse
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    public function edit(string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name'       => 'required|string|min:3|max:100',
            'username'   => 'required|string|max:50|unique:users,username,' . $user->id,
            'nim'        => 'nullable|numeric|unique:users,nim,' . $user->id,
            'email'      => 'required|email|unique:users,email,' . $user->id,
            'faculty'    => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'password'   => 'nullable|min:6|confirmed',
        ]);

        $data = [
            'name'       => $request->name,
            'username'   => $request->username,
            'nim'        => $request->nim ?? null,
            'email'      => $request->email,
            'faculty'    => $request->faculty,
            'department' => $request->department,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json(["message" => "User updated", "data" => $user]);
    }

    public function destroy($id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(null, 204);
    }
}

