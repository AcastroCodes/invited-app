<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\GuestGroup;
use App\Models\Guest;
use App\Models\Invitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GuestController extends Controller
{
    public function index(Event $event)
    {
        $groups = GuestGroup::where('event_id', $event->id)
            ->with('guests')
            ->get()
            ->map(function ($group) {
                return [
                    'id' => $group->id,
                    'eventId' => $group->event_id,
                    'formalAddressee' => $group->formal_addressee,
                    'contactEmail' => $group->contact_email,
                    'contactPhone' => $group->contact_phone,
                    'contactWhatsapp' => $group->contact_whatsapp,
                    'maxGuests' => $group->max_guests,
                    'status' => $group->status,
                    'assignedInvitationId' => $group->assigned_invitation_id,
                    'guests' => $group->guests->map(function ($g) {
                        return [
                            'id' => $g->id,
                            'name' => $g->name,
                            'title' => $g->title ?? 'Sr.',
                            'role' => $g->role,
                            'category' => $g->category ?? 'Adulto',
                            'isConfirmed' => is_null($g->is_confirmed) ? null : (bool)$g->is_confirmed,
                            'dietaryRestrictions' => $g->dietary_restrictions,
                        ];
                    }),
                ];
            });

        $invitations = Invitation::where('event_id', $event->id)->get()->map(function ($inv) {
            return [
                'id' => $inv->id,
                'name' => $inv->name,
                'type' => $inv->type,
            ];
        });

        return response()->json([
            'groups' => $groups,
            'invitations' => $invitations,
        ]);
    }

    public function store(Request $request, Event $event)
    {
        $validated = $request->validate([
            'formalAddressee' => 'required|string',
            'contactEmail' => 'nullable|email',
            'contactPhone' => 'nullable|string',
            'contactWhatsapp' => 'nullable|string',
            'assignedInvitationId' => 'nullable',
            'guests' => 'required|array|min:1',
            'guests.*.name' => 'required|string',
            'guests.*.title' => 'nullable|string',
            'guests.*.role' => 'required|string',
            'guests.*.category' => 'nullable|string',
            'guests.*.dietaryRestrictions' => 'nullable|string',
        ]);

        $createdGroup = DB::transaction(function () use ($validated, $event, $request) {
            $invId = !empty($validated['assignedInvitationId']) ? (int)$validated['assignedInvitationId'] : null;

            $group = GuestGroup::create([
                'event_id' => $event->id,
                'formal_addressee' => $validated['formalAddressee'],
                'contact_email' => $validated['contactEmail'] ?? null,
                'contact_phone' => $validated['contactPhone'] ?? null,
                'contact_whatsapp' => $request->input('contactWhatsapp') ?? null,
                'max_guests' => count($validated['guests']),
                'assigned_invitation_id' => $invId,
                'status' => 'pending',
            ]);

            foreach ($validated['guests'] as $guestData) {
                $group->guests()->create([
                    'event_id' => $event->id,
                    'name' => $guestData['name'],
                    'title' => $guestData['title'] ?? null,
                    'role' => $guestData['role'],
                    'category' => $guestData['category'] ?? 'Adulto',
                    'is_confirmed' => $guestData['isConfirmed'] ?? null,
                    'dietary_restrictions' => $guestData['dietaryRestrictions'] ?? null,
                ]);
            }

            return $group->load('guests');
        });

        return response()->json($createdGroup, 201);
    }

    public function update(Request $request, GuestGroup $guestGroup)
    {
        $validated = $request->validate([
            'formalAddressee' => 'required|string',
            'contactEmail' => 'nullable|email',
            'contactPhone' => 'nullable|string',
            'contactWhatsapp' => 'nullable|string',
            'assignedInvitationId' => 'nullable',
            'guests' => 'required|array|min:1',
            'guests.*.name' => 'required|string',
            'guests.*.title' => 'nullable|string',
            'guests.*.role' => 'required|string',
            'guests.*.category' => 'nullable|string',
            'guests.*.dietaryRestrictions' => 'nullable|string',
        ]);

        DB::transaction(function () use ($guestGroup, $validated) {
            $invId = !empty($validated['assignedInvitationId']) ? (int)$validated['assignedInvitationId'] : null;

            $guestGroup->update([
                'formal_addressee' => $validated['formalAddressee'],
                'contact_email' => $validated['contactEmail'] ?? null,
                'contact_phone' => $validated['contactPhone'] ?? null,
                'contact_whatsapp' => $validated['contactWhatsapp'] ?? null,
                'max_guests' => count($validated['guests']),
                'assigned_invitation_id' => $invId,
            ]);

            $existingGuestIds = [];
            foreach ($validated['guests'] as $guestData) {
                $payload = [
                    'name' => $guestData['name'],
                    'title' => $guestData['title'] ?? null,
                    'role' => $guestData['role'],
                    'category' => $guestData['category'] ?? 'Adulto',
                    'dietary_restrictions' => $guestData['dietaryRestrictions'] ?? null,
                ];

                if (array_key_exists('isConfirmed', $guestData)) {
                    $payload['is_confirmed'] = $guestData['isConfirmed'];
                }

                if (isset($guestData['id']) && is_numeric($guestData['id'])) {
                    $g = $guestGroup->guests()->find($guestData['id']);
                    if ($g) {
                        $g->update($payload);
                        $existingGuestIds[] = $g->id;
                    } else {
                        $newG = $guestGroup->guests()->create(array_merge([
                            'event_id' => $guestGroup->event_id,
                            'is_confirmed' => $guestData['isConfirmed'] ?? null,
                        ], $payload));
                        $existingGuestIds[] = $newG->id;
                    }
                } else {
                    $newG = $guestGroup->guests()->create(array_merge([
                        'event_id' => $guestGroup->event_id,
                        'is_confirmed' => $guestData['isConfirmed'] ?? null,
                    ], $payload));
                    $existingGuestIds[] = $newG->id;
                }
            }

            $guestGroup->guests()->whereNotIn('id', $existingGuestIds)->delete();
        });

        return response()->json($guestGroup->fresh('guests'));
    }

    public function destroy(GuestGroup $guestGroup)
    {
        $guestGroup->guests()->delete();
        $guestGroup->delete();

        return response()->json(null, 204);
    }
}
