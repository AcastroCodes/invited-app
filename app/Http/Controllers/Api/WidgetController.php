<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Widget;

class WidgetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Widget::query();
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'content' => 'required|array',
            'preview_image' => 'nullable|string',
        ]);

        $widget = Widget::create($request->all());

        return response()->json($widget, 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Widget $widget)
    {
        $widget->delete();
        return response()->json(null, 204);
    }
}
