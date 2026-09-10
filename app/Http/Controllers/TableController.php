<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Table;
use Illuminate\Http\Request;

class TableController extends Controller
{
    public function index(Event $event)
    {
        return response()->json($event->tables()->withCount('guests')->get());
    }

    public function store(Request $request, Event $event)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
        ]);

        $table = $event->tables()->create($validated);
        return response()->json($table, 201);
    }

    public function show(Table $table)
    {
        return response()->json($table->load('guests'));
    }

    public function update(Request $request, Table $table)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'capacity' => 'sometimes|required|integer|min:1',
        ]);

        $table->update($validated);
        return response()->json($table);
    }

    public function destroy(Table $table)
    {
        $table->delete();
        return response()->json(null, 204);
    }
}
