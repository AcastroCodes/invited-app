<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MobileTemplate;
use App\Models\Partner;
use Illuminate\Http\Request;

class MobileTemplateController extends Controller
{
    public function index()
    {
        $count = MobileTemplate::count();
        if ($count === 0) {
            MobileTemplate::create([
                'name' => 'Template Predeterminado',
                'description' => 'Plantilla clásica estándar para la app móvil de invitados.',
                'is_default' => true,
                'settings' => [
                    'welcome_precarga_text' => 'Cargando',
                    'precarga_title' => 'Cargando',
                    'precarga_subtitle' => 'Espere por favor',
                    'precarga_powered_by_text' => 'Powered by',
                    'precarga_show_logo' => true,
                    'precarga_logo_align' => 'center',
                    'precarga_logo_size' => 120,
                    'precarga_logo_size_unit' => 'px',
                    'precarga_title_font' => 'Inter',
                    'precarga_title_size' => 20,
                    'precarga_title_color' => '#ffffff',
                    'precarga_title_bold' => true,
                    'precarga_title_align' => 'center',
                    'precarga_button_color' => '#E07A5F',
                    'precarga_button_hover_color' => '#c65f45',
                    'precarga_button_radius' => 12,
                    'precarga_bg_color' => '#171717',
                ],
            ]);
        }

        $templates = MobileTemplate::with(['partners:id,business_name,logo,mobile_template_id'])
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($templates);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'settings' => 'nullable|array',
            'partner_ids' => 'nullable|array',
            'partner_ids.*' => 'exists:partners,id',
        ]);

        $template = MobileTemplate::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'settings' => $validated['settings'] ?? [],
            'is_default' => false,
        ]);

        if (!empty($validated['partner_ids'])) {
            Partner::whereIn('id', $validated['partner_ids'])
                ->update(['mobile_template_id' => $template->id]);
        }

        return response()->json($template->load(['partners:id,business_name,logo,mobile_template_id']), 201);
    }

    public function show(MobileTemplate $mobile_template)
    {
        return response()->json($mobile_template->load(['partners:id,business_name,logo,mobile_template_id']));
    }

    public function update(Request $request, MobileTemplate $mobile_template)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'settings' => 'nullable|array',
            'partner_ids' => 'nullable|array',
            'partner_ids.*' => 'exists:partners,id',
        ]);

        if (isset($validated['name'])) {
            $mobile_template->name = $validated['name'];
        }
        if (array_key_exists('description', $validated)) {
            $mobile_template->description = $validated['description'];
        }
        if (isset($validated['settings'])) {
            $currentSettings = $mobile_template->settings ?? [];
            $mobile_template->settings = array_merge($currentSettings, $validated['settings']);
        }

        $mobile_template->save();

        if ($request->has('partner_ids')) {
            // Desvincular los que ya no están
            Partner::where('mobile_template_id', $mobile_template->id)
                ->whereNotIn('id', $validated['partner_ids'])
                ->update(['mobile_template_id' => null]);

            // Vincular los nuevos
            if (!empty($validated['partner_ids'])) {
                Partner::whereIn('id', $validated['partner_ids'])
                    ->update(['mobile_template_id' => $mobile_template->id]);
            }
        }

        return response()->json($mobile_template->load(['partners:id,business_name,logo,mobile_template_id']));
    }

    public function destroy(MobileTemplate $mobile_template)
    {
        // Desvincular partners
        Partner::where('mobile_template_id', $mobile_template->id)
            ->update(['mobile_template_id' => null]);

        $mobile_template->delete();

        return response()->json(['message' => 'Template eliminado correctamente']);
    }
}
