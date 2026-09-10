<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Guest;
use Illuminate\Http\Request;

class GuestController extends Controller
{
    public function index(Event $event)
    {
        return response()->json($event->guests()->with('table')->get());
    }

    public function store(Request $request, Event $event)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'status' => 'nullable|in:pending,confirmed,declined',
            'companion_count' => 'nullable|integer|min:0',
            'table_id' => 'nullable|exists:tables,id',
        ]);

        $guest = $event->guests()->create($validated);
        return response()->json($guest->load('table'), 201);
    }

    public function show(Guest $guest)
    {
        return response()->json($guest->load('table'));
    }

    public function update(Request $request, Guest $guest)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'status' => 'nullable|in:pending,confirmed,declined',
            'companion_count' => 'nullable|integer|min:0',
            'table_id' => 'nullable|exists:tables,id',
        ]);

        $guest->update($validated);
        return response()->json($guest->load('table'));
    }

    public function destroy(Guest $guest)
    {
        $guest->delete();
        return response()->json(null, 204);
    }
}
