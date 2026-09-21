<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Partner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AssetController extends Controller
{
    /**
     * Listar assets de un partner (opcionalmente filtrados por tipo)
     */
    public function index(Request $request, Partner $partner): JsonResponse
    {
        $query = Asset::where('partner_id', $partner->id);

        if ($request->has('type')) {
            $query->where('type', $request->query('type'));
        }

        $assets = $query->latest()->get();

        return response()->json($assets);
    }

    /**
     * Subir y registrar un nuevo asset para el partner
     */
    public function store(Request $request, Partner $partner): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:51200', // Max 50MB for 3D/Video
            'type' => 'nullable|string',
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        
        $type = $request->input('type');
        if (!$type) {
            if (in_array($extension, ['glb', 'gltf', 'fbx', 'dae', 'obj'])) {
                $type = '3d';
            } elseif (in_array($extension, ['mp4', 'webm', 'ogg', 'mov', 'avi'])) {
                $type = 'video';
            } else {
                $type = 'image';
            }
        }

        $path = $file->store("partners/{$partner->id}/assets", 'public');

        $asset = Asset::create([
            'partner_id' => $partner->id,
            'name' => $file->getClientOriginalName(),
            'type' => $type,
            'file_path' => $path,
            'mime_type' => $file->getClientMimeType() ?: 'application/octet-stream',
            'size' => $file->getSize(),
        ]);

        return response()->json($asset, 201);
    }

    /**
     * Eliminar un asset por ID
     */
    public function destroy(Asset $asset): JsonResponse
    {
        if ($asset->file_path && Storage::disk('public')->exists($asset->file_path)) {
            Storage::disk('public')->delete($asset->file_path);
        }

        $asset->delete();

        return response()->json(['message' => 'Asset eliminado correctamente']);
    }
}
