<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MobileTemplate;
use App\Models\Partner;
use Illuminate\Http\Request;

class MobileTemplateController extends Controller
{
    /**
     * Devuelve las configuraciones por defecto completas del simulador/diseñador móvil.
     */
    public static function getDefaultSettings(): array
    {
        return [
            'welcome_precarga_text' => 'Cargando',
            'precarga_title' => 'Cargando',
            'precarga_subtitle' => 'Espere por favor',
            'precarga_powered_by_text' => 'Powered by',
            'precarga_title_font_family' => 'Inter',
            'precarga_title_font_size' => '14',
            'precarga_title_font_color' => '#ffffff',
            'precarga_title_font_weight' => 'bold',
            'precarga_subtitle_font_family' => 'Inter',
            'precarga_subtitle_font_size' => '10',
            'precarga_subtitle_font_color' => '#e2e8f0',
            'precarga_powered_by_font_family' => 'Inter',
            'precarga_powered_by_font_size' => '8.5',
            'precarga_powered_by_font_color' => 'rgba(255, 255, 255, 0.75)',
            'welcome_button_text' => 'Entrar',
            'precarga_button_font_family' => 'Inter',
            'precarga_button_font_size' => '13',
            'precarga_button_font_color' => '#ffffff',
            'precarga_button_hover_color' => '#c65f45',
            'precarga_bg_type' => 'color',
            'precarga_bg_color' => '#0f172a',
            'precarga_card_bg_type' => 'color',
            'precarga_card_bg_color' => '#000000',
            'precarga_card_bg_opacity' => 85,
            'precarga_card_border_radius' => 16,
            'precarga_card_border_color' => '#f6cd18',
            'precarga_card_border_width' => 1,
            'precarga_card_glass_enabled' => true,
            'button_bg_type' => 'color',
            'button_bg_color' => '#E07A5F',
            'button_border_radius' => 12,
            'button_bg_opacity' => 100,
            'button_glass_enabled' => true,
            'precarga_show_logo' => true,
            'partner_logo_show_precarga' => true,
            'project_logo_precarga_url' => '/dinvited.png',
            'partner_logo_precarga_size' => 40,
            'partner_logo_precarga_unit' => 'px',
            'partner_logo_precarga_position_v' => 'bottom',
            'partner_logo_precarga_position_h' => 'center',
            'partner_logo_precarga_powered_by_position' => 'left',
        ];
    }

    public function index()
    {
        $count = MobileTemplate::count();
        if ($count === 0) {
            MobileTemplate::create([
                'name' => 'Template Predeterminado',
                'description' => 'Plantilla clásica estándar para la app móvil de invitados.',
                'is_default' => true,
                'settings' => self::getDefaultSettings(),
            ]);
        }

        $templates = MobileTemplate::with(['partners:id,business_name,logo,mobile_template_id'])
            ->get()
            ->sortByDesc('created_at')
            ->sortByDesc('is_default')
            ->values();

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

        // Si no se envían settings específicos, clonar del template predeterminado o usar defaults completos
        $initialSettings = $validated['settings'] ?? null;
        if (empty($initialSettings)) {
            $defaultTemplate = MobileTemplate::where('is_default', true)->first();
            $initialSettings = ($defaultTemplate && !empty($defaultTemplate->settings))
                ? $defaultTemplate->settings
                : self::getDefaultSettings();
        }

        $template = MobileTemplate::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'settings' => $initialSettings,
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
        // Si el template no tiene settings configurados aún, devolver los valores por defecto
        if (empty($mobile_template->settings)) {
            $defaultTemplate = MobileTemplate::where('is_default', true)->first();
            $mobile_template->settings = ($defaultTemplate && !empty($defaultTemplate->settings))
                ? $defaultTemplate->settings
                : self::getDefaultSettings();
            $mobile_template->save();
        }

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
