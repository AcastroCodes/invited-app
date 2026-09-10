<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;

class EventController extends Controller
{
    public function index()
    {
        return response()->json(Event::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'event_type' => 'required|string',
            'event_date' => 'required|date',
            'location' => 'nullable|string',
            'description' => 'nullable|string',
            'theme_color' => 'nullable|string',
        ]);

        $event = Event::create($validated);
        return response()->json($event, 201);
    }

    public function show(Event $event)
    {
        return response()->json($event);
    }

    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string',
            'event_type' => 'sometimes|required|string',
            'event_date' => 'sometimes|required|date',
            'location' => 'nullable|string',
            'description' => 'nullable|string',
            'theme_color' => 'nullable|string',
        ]);

        $event->update($validated);
        return response()->json($event);
    }

    public function destroy(Event $event)
    {
        $event->delete();
        return response()->json(null, 204);
    }
}
