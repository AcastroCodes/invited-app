<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\PartnerController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\InvitationController;

// Rutas públicas
Route::get('/public/invitations/{invitation}', [InvitationController::class, 'showPublic']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('partners', PartnerController::class);
    Route::apiResource('users', UserController::class);
    Route::apiResource('events', EventController::class);
    
    Route::apiResource('events.tables', App\Http\Controllers\TableController::class)->shallow();
    Route::apiResource('events.guests', App\Http\Controllers\GuestController::class)->shallow();
    Route::apiResource('guest-groups', App\Http\Controllers\GuestController::class)->only(['update', 'destroy']);

    // Invitaciones
    Route::get('/events/{event}/invitations', [App\Http\Controllers\InvitationController::class, 'index']);
    Route::post('/events/{event}/invitations', [App\Http\Controllers\InvitationController::class, 'store']);
    Route::get('/invitations/{invitation}', [App\Http\Controllers\InvitationController::class, 'show']);
    Route::put('/invitations/{invitation}', [App\Http\Controllers\InvitationController::class, 'update']);
    Route::delete('/invitations/{invitation}', [App\Http\Controllers\InvitationController::class, 'destroy']);
    // Assets del Partner
    Route::get('/partners/{partner}/assets', [App\Http\Controllers\AssetController::class, 'index']);
    Route::post('/partners/{partner}/assets', [App\Http\Controllers\AssetController::class, 'store']);
    Route::delete('/assets/{asset}', [App\Http\Controllers\AssetController::class, 'destroy']);
});
