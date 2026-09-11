<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    public function index()
    {
        return response()->json(Event::with('partner.user')->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'event_type' => 'required|string',
            'event_date' => 'required|date',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'itinerary' => 'nullable',
            'description' => 'nullable|string',
            'status' => 'nullable|string',
            'services' => 'nullable|json',
            'logo' => 'nullable|image|max:2048',
            'background' => 'nullable|image|max:2048',
        ]);

        $partnerId = $request->input('partner_id');
        if ($partnerId && $partnerId !== '' && $partnerId !== 'null' && $partnerId !== 'undefined' && $partnerId !== 'all') {
            $validated['partner_id'] = (int)$partnerId;
        } else {
            $validated['partner_id'] = null;
        }

        if (isset($validated['itinerary']) && is_string($validated['itinerary'])) {
            $validated['itinerary'] = json_decode($validated['itinerary'], true);
        }

        if (isset($validated['services'])) {
            $validated['services'] = json_decode($validated['services'], true);
        }

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('events/logos', 'public');
        }
        if ($request->hasFile('background')) {
            $validated['background'] = $request->file('background')->store('events/backgrounds', 'public');
        }

        $event = Event::create($validated);
        return response()->json($event->load('partner.user'), 201);
    }

    public function show(Event $event)
    {
        return response()->json($event->load(['partner.user', 'guests']));
    }

    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string',
            'event_type' => 'sometimes|required|string',
            'event_date' => 'sometimes|required|date',
            'location' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'itinerary' => 'nullable',
            'description' => 'nullable|string',
            'status' => 'nullable|string',
            'services' => 'nullable|json',
            'logo' => 'nullable|image|max:2048',
            'background' => 'nullable|image|max:2048',
        ]);

        if ($request->has('partner_id')) {
            $partnerId = $request->input('partner_id');
            if ($partnerId && $partnerId !== '' && $partnerId !== 'null' && $partnerId !== 'undefined' && $partnerId !== 'all') {
                $validated['partner_id'] = (int)$partnerId;
            } else {
                $validated['partner_id'] = null;
            }
        }

        if (isset($validated['itinerary']) && is_string($validated['itinerary'])) {
            $validated['itinerary'] = json_decode($validated['itinerary'], true);
        }

        if (isset($validated['services'])) {
            $validated['services'] = json_decode($validated['services'], true);
        }

        if ($request->hasFile('logo')) {
            if ($event->logo) {
                Storage::disk('public')->delete($event->logo);
            }
            $validated['logo'] = $request->file('logo')->store('events/logos', 'public');
        }
        
        if ($request->hasFile('background')) {
            if ($event->background) {
                Storage::disk('public')->delete($event->background);
            }
            $validated['background'] = $request->file('background')->store('events/backgrounds', 'public');
        }

        $event->update($validated);
        return response()->json($event->load('partner.user'));
    }

    public function destroy(Event $event)
    {
        if ($event->logo) {
            Storage::disk('public')->delete($event->logo);
        }
        if ($event->background) {
            Storage::disk('public')->delete($event->background);
        }
        
        $event->delete();
        return response()->json(null, 204);
    }
}
