<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Guest;
use App\Models\Invitation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InvitationController extends Controller
{
    /**
     * Display a listing of invitations for an event.
     */
    public function index($eventId)
    {
        $event = Event::findOrFail($eventId);
        $invitations = $event->invitations()
            ->withCount('guests')
            ->with('guests')
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $invitations,
        ]);
    }

    /**
     * Display the specified invitation.
     */
    public function show($id)
    {
        $invitation = Invitation::withCount('guests')->with('guests')->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $invitation,
        ]);
    }

    /**
     * Display the specified invitation for public guests.
     */
    public function showPublic($idOrSlug)
    {
        // Try to find by slug first, if not found or if it's numeric, find by ID
        $invitation = Invitation::with('event.partner')
            ->where('slug', $idOrSlug)
            ->orWhere('id', $idOrSlug)
            ->firstOrFail();

        // Check if invitation is active
        if (!$invitation->is_active) {
            return response()->json([
                'status' => 'error',
                'message' => 'Esta invitación no está activa o ya no está disponible.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $invitation,
        ]);
    }

    /**
     * Store a newly created invitation for an event.
     */
    public function store(Request $request, $eventId)
    {
        $event = Event::findOrFail($eventId);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'template' => 'nullable|string|max:100',
            'content' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $baseSlug = Str::slug($event->name . '-' . $validated['title']);
        $slug = $baseSlug;
        $counter = 1;
        while (Invitation::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        $invitation = $event->invitations()->create([
            'title' => $validated['title'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'template' => $validated['template'] ?? 'default',
            'content' => $validated['content'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Invitación creada correctamente',
            'data' => $invitation->loadCount('guests'),
        ], 201);
    }

    /**
     * Update the specified invitation.
     */
    public function update(Request $request, $id)
    {
        $invitation = Invitation::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'template' => 'nullable|string|max:100',
            'content' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $invitation->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Invitación actualizada correctamente',
            'data' => $invitation->loadCount('guests')->load('guests'),
        ]);
    }

    /**
     * Remove the specified invitation.
     */
    public function destroy($id)
    {
        $invitation = Invitation::findOrFail($id);
        
        // Remove reference from guests
        Guest::where('invitation_id', $invitation->id)->update(['invitation_id' => null]);
        
        $invitation->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Invitación eliminada correctamente',
        ]);
    }

    /**
     * Assign guests to an invitation.
     */
    public function assignGuests(Request $request, $id)
    {
        $invitation = Invitation::findOrFail($id);

        $validated = $request->validate([
            'guest_ids' => 'present|array',
            'guest_ids.*' => 'integer|exists:guests,id',
        ]);

        $guestIds = $validated['guest_ids'];

        // Assign selected guests to this invitation
        Guest::whereIn('id', $guestIds)->update(['invitation_id' => $invitation->id]);

        // Unassign guests that were previously assigned to this invitation but not in the request
        Guest::where('invitation_id', $invitation->id)
            ->whereNotIn('id', $guestIds)
            ->update(['invitation_id' => null]);

        return response()->json([
            'status' => 'success',
            'message' => 'Invitados asignados correctamente a la invitación',
            'data' => $invitation->fresh(['guests'])->loadCount('guests'),
        ]);
    }
}
