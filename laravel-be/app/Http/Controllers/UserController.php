<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\View\View;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $users = User::latest()->paginate(10);
        return view('users.index', compact('users'));
    }

    public function create()
    {
        return view('users.create');
    }

    public function store(Request $request): RedirectResponse
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

        User::create([
            'name'       => $request->name,
            'username'   => $request->username,
            'nim'        => $request->nim ?? null,
            'email'      => $request->email,
            'faculty'    => $request->faculty,
            'department' => $request->department,
            'password'   => Hash::make($request->password),
        ]);

        return redirect()->route('users.index')->with(['success' => 'Data user berhasil disimpan!']);
    }

    public function show(User $user): View
    {
        $user = User::findOrFail($user->id);
        return view('users.show', compact('user'));
    }

    public function edit(string $id): View
    {
        $user = User::findOrFail($id);
        return view('users.edit', compact('user'));
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name'       => 'required|string|min:3|max:100',
            'username'   => 'required|string|max:50|unique:users,username,' . $user->id,
            'nim'        => 'required|numeric|unique:users,nim,' . $user->id,
            'email'      => 'required|email|unique:users,email,' . $user->id,
            'faculty'    => 'nullable|string|max:100',
            'department' => 'nullable|string|max:100',
            'password'   => 'nullable|min:6|confirmed',
        ]);

        if ($request->filled('password')) {
            $user->update([
                'name'       => $request->name,
                'username'   => $request->username,
                'nim'        => $request->nim,
                'email'      => $request->email,
                'faculty'    => $request->faculty,
                'department' => $request->department,
                'password'   => Hash::make($request->password),
            ]);
        } else {
            $user->update([
                'name'       => $request->name,
                'username'   => $request->username,
                'nim'        => $request->nim,
                'email'      => $request->email,
                'faculty'    => $request->faculty,
                'department' => $request->department,
            ]);
        }

        return redirect()->route('users.index')->with(['success' => 'Data user berhasil diperbarui!']);
    }
}

