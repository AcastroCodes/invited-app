<?php

namespace App\Http\Controllers;

use App\Models\Partner;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PartnerController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $user = $request->user();
        
        if ($user && $user->role === 'superadmin') {
            $partners = Partner::with('user')->orderBy('created_at', 'desc')->get();
        } else if ($user) {
            $partners = Partner::with('user')
                ->where('user_id', $user->id)
                ->orWhereHas('users', function ($query) use ($user) {
                    $query->where('users.id', $user->id);
                })
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $partners = collect([]);
        }
        
        return response()->json($partners);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'business_rut' => 'nullable|string|max:50',
            'business_address' => 'nullable|string|max:255',
            'business_phone' => 'nullable|string|max:50',
            'contact_name' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'credits_web' => 'nullable|integer',
            'credits_video' => 'nullable|integer',
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
            'social_links' => 'nullable|json',
            'is_active' => 'boolean',
            'logo' => 'nullable|image|max:2048' // max 2MB
        ]);

        $validated['user_id'] = $validated['user_ids'][0];

        if (isset($validated['social_links'])) {
            $validated['social_links'] = json_decode($validated['social_links'], true);
        }

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('partners/logos', 'public');
            $validated['logo'] = $path;
        }

        $partner = Partner::create($validated);
        // Link all users
        $partner->users()->attach($validated['user_ids']);

        return response()->json($partner->load('user', 'users'), 201);
    }

    public function show(Partner $partner)
    {
        return response()->json($partner->load('user', 'users'));
    }

    public function update(Request $request, Partner $partner)
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'business_rut' => 'nullable|string|max:50',
            'business_address' => 'nullable|string|max:255',
            'business_phone' => 'nullable|string|max:50',
            'contact_name' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'credits_web' => 'nullable|integer',
            'credits_video' => 'nullable|integer',
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
            'social_links' => 'nullable|json',
            'is_active' => 'boolean',
            'logo' => 'nullable|image|max:2048'
        ]);

        $validated['user_id'] = $validated['user_ids'][0];

        if (isset($validated['social_links'])) {
            $validated['social_links'] = json_decode($validated['social_links'], true);
        }

        if ($request->hasFile('logo')) {
            if ($partner->logo) {
                Storage::disk('public')->delete($partner->logo);
            }
            $path = $request->file('logo')->store('partners/logos', 'public');
            $validated['logo'] = $path;
        }

        $partner->update($validated);
        $partner->users()->sync($validated['user_ids']);

        return response()->json($partner->load('user', 'users'));
    }

    public function destroy(Partner $partner)
    {
        if ($partner->logo) {
            Storage::disk('public')->delete($partner->logo);
        }
        $partner->delete();
        return response()->json(null, 204);
    }
}
