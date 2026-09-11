<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\PartnerController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EventController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('partners', PartnerController::class);
    Route::apiResource('users', UserController::class);
    Route::apiResource('events', EventController::class);
    
    Route::apiResource('events.tables', App\Http\Controllers\TableController::class)->shallow();
    Route::apiResource('events.guests', App\Http\Controllers\GuestController::class)->shallow();

    // Invitaciones
    Route::get('/events/{event}/invitations', [App\Http\Controllers\InvitationController::class, 'index']);
    Route::post('/events/{event}/invitations', [App\Http\Controllers\InvitationController::class, 'store']);
    Route::put('/invitations/{invitation}', [App\Http\Controllers\InvitationController::class, 'update']);
    Route::delete('/invitations/{invitation}', [App\Http\Controllers\InvitationController::class, 'destroy']);
    Route::post('/invitations/{invitation}/assign-guests', [App\Http\Controllers\InvitationController::class, 'assignGuests']);
});
