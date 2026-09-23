import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, Check, UploadCloud, LoaderCircle, Crop, Settings, Film } from 'lucide-react';
import api from '../lib/api';
import { ImageCropModal } from './ImageCropModal';

export interface AssetItem {
  id: number;
  partner_id: number;
  name: string;
  type: string;
  file_path: string;
  url: string;
  settings?: {
    modelPivotX?: number;
    modelPivotY?: number;
    modelPivotZ?: number;
    modelBaseScale?: number;
    modelBaseRotX?: number;
    modelBaseRotY?: number;
    modelBaseRotZ?: number;
  };
}

interface AssetPickerPopoverProps {
  partnerId?: number | string;
  partnerName?: string;
  value?: string;
  onChange: (val: string) => void;
  onSelectAsset?: (asset: AssetItem) => void;
  onConfigureAsset?: (asset: AssetItem) => void;
  onConfigureVideo?: () => void;
  selectedElementSettings?: {
    modelPivotX?: number;
    modelPivotY?: number;
    modelPivotZ?: number;
    modelBaseScale?: number;
    modelBaseRotX?: number;
    modelBaseRotY?: number;
    modelBaseRotZ?: number;
  };
  label?: string;
  accept?: string;
  type?: string;
}

export const AssetPickerPopover: React.FC<AssetPickerPopoverProps> = ({
  partnerId,
  partnerName = 'ConceptoDigital',
  value = '',
  onChange,
  onSelectAsset,
  onConfigureAsset,
  onConfigureVideo,
  selectedElementSettings,
  label = 'Imagen del Elemento',
  accept = 'image/*',
  type = 'image',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  // Cargar recursos del partner desde la API backend (Base de Datos MySQL)
  const fetchAssets = async () => {
    if (!partnerId) {
      setAssets([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/partners/${partnerId}/assets?type=${type}`);
      const data = res.data?.data || res.data || [];
      setAssets(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error al cargar assets de la base de datos:', e);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [partnerId, type]);

  // Manejar carga de archivo al servidor / base de datos
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Si no hay partnerId disponible aún en la prop, leer en vista previa DataURL
    if (!partnerId) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const resUrl = ev.target?.result as string;
        if (resUrl) onChange(resUrl);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const res = await api.post(`/partners/${partnerId}/assets`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newAsset: AssetItem = res.data;
      if (newAsset && newAsset.url) {
        setAssets((prev) => [newAsset, ...prev]);
        onChange(newAsset.url);
        if (onSelectAsset) onSelectAsset(newAsset);
        if (onConfigureAsset && (newAsset.type === '3d' || type === '3d')) {
          onConfigureAsset(newAsset);
        }
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1500);
      }
    } catch (err) {
      console.error('Error guardando el asset en la base de datos:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Confirmar borrado definitivo del servidor y la Base de Datos
  const confirmDeleteAsset = async () => {
    if (deleteConfirmIndex !== null) {
      const assetToDelete = assets[deleteConfirmIndex];
      if (assetToDelete) {
        try {
          await api.delete(`/assets/${assetToDelete.id}`);
          setAssets((prev) => prev.filter((_, i) => i !== deleteConfirmIndex));
          if (value === assetToDelete.url) {
            onChange('');
          }
        } catch (err) {
          console.error('Error eliminando el asset de la base de datos:', err);
        }
      }
      setDeleteConfirmIndex(null);
    }
  };

  // Quitar la imagen del elemento (limpiar selección sin borrar de la base de datos)
  const handleRemoveFromElement = () => {
    onChange('');
  };

  const [hasImgError, setHasImgError] = useState(false);

  useEffect(() => {
    setHasImgError(false);
  }, [value]);

  const isImgValid = value && !hasImgError && (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:') ||
    value.startsWith('/storage/')
  );

  const is3dType = type === '3d' || (typeof value === 'string' && (value.endsWith('.glb') || value.endsWith('.gltf') || value.endsWith('.fbx') || value.endsWith('.dae') || value.endsWith('.obj')));
  const isVideoType = type === 'video' || (typeof value === 'string' && (value.endsWith('.mp4') || value.endsWith('.webm') || value.endsWith('.ogg') || value.startsWith('data:video/')));
  const [showCropModal, setShowCropModal] = useState<boolean>(false);

  const effectiveAccept = accept !== 'image/*' 
    ? accept 
    : type === '3d' 
    ? '.glb,.gltf,.fbx,.dae,.obj' 
    : type === 'video' 
    ? 'video/*' 
    : 'image/*';

  return (
    <div className="space-y-3">
      {/* Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept={effectiveAccept}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Label principal */}
      {label && (
        <span className="block font-bold text-[10px] uppercase tracking-wider opacity-70" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
      )}

      {/* CONTENEDOR PRINCIPAL VISTA PREVIA Y BOTONES */}
      <div className="flex items-center gap-2">
        {/* VISTA PREVIA GRANDE DEL RECURSO */}
        <div
          className="flex-1 h-28 rounded-xl border flex items-center justify-center overflow-hidden relative shadow-2xs transition-all group"
          style={{
            backgroundColor: 'var(--bg-app)',
            borderColor: 'var(--border-color)',
          }}
        >
          {(value && (value.startsWith('http') || value.startsWith('data:') || value.startsWith('blob:') || value.startsWith('/storage/'))) ? (
            is3dType ? (() => {
              const matchedAsset = assets.find((a) => a.url === value);
              const baseRotX = (selectedElementSettings?.modelBaseRotX !== undefined ? selectedElementSettings.modelBaseRotX : matchedAsset?.settings?.modelBaseRotX) ?? 0;
              const baseRotY = (selectedElementSettings?.modelBaseRotY !== undefined ? selectedElementSettings.modelBaseRotY : matchedAsset?.settings?.modelBaseRotY) ?? 0;
              const baseRotZ = (selectedElementSettings?.modelBaseRotZ !== undefined ? selectedElementSettings.modelBaseRotZ : matchedAsset?.settings?.modelBaseRotZ) ?? 0;
              const baseScale = (selectedElementSettings?.modelBaseScale !== undefined ? selectedElementSettings.modelBaseScale : matchedAsset?.settings?.modelBaseScale) ?? 1;
              const pivotX = (selectedElementSettings?.modelPivotX !== undefined ? selectedElementSettings.modelPivotX : matchedAsset?.settings?.modelPivotX) ?? 0;
              const pivotY = (selectedElementSettings?.modelPivotY !== undefined ? selectedElementSettings.modelPivotY : matchedAsset?.settings?.modelPivotY) ?? 0;
              const pivotZ = (selectedElementSettings?.modelPivotZ !== undefined ? selectedElementSettings.modelPivotZ : matchedAsset?.settings?.modelPivotZ) ?? 0;

              return React.createElement('model-viewer', {
                src: value,
                alt: 'Modelo 3D',
                'auto-rotate': true,
                'camera-controls': true,
                orientation: `${baseRotX}deg ${baseRotY}deg ${baseRotZ}deg`,
                scale: `${baseScale} ${baseScale} ${baseScale}`,
                'camera-target': `${pivotX}m ${pivotY}m ${pivotZ}m`,
                bounds: 'tight',
                style: { width: '100%', height: '100%', borderRadius: '0.5rem', outline: 'none' }
              });
            })() : isVideoType ? (
              <video
                src={value}
                controls
                muted
                className="max-h-full max-w-full object-contain p-1 rounded-lg"
              />
            ) : !hasImgError ? (
              <img
                src={value}
                alt="Vista previa"
                onError={() => setHasImgError(true)}
                className="max-h-full max-w-full object-contain p-1 rounded-lg"
              />
            ) : (
              <div className="text-[10px] text-red-500 font-bold p-2 text-center">Error al cargar imagen</div>
            )
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-2 text-center transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer group select-none"
              title={`Haz clic para agregar un ${type === 'video' ? 'video' : 'recurso'}`}
            >
              <div
                className="p-2 rounded-full border transition-transform group-hover:scale-110 flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--primary-accent-light)',
                  borderColor: 'var(--primary-accent)',
                  color: 'var(--primary-accent)',
                }}
              >
                <Plus size={16} />
              </div>
              <span className="text-[10px] font-extrabold" style={{ color: 'var(--primary-accent)' }}>
                Agregar {type === 'video' ? 'Video' : 'Imagen'}
              </span>
            </button>
          )}
        </div>

        {/* BOTONES LADO DERECHO: AGREGAR, CORTAR Y QUITAR DE ELEMENTO */}
        <div className="flex flex-col justify-between gap-1 w-9 shrink-0 h-28">
          {/* Botón Agregar / Subir */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs group disabled:opacity-50"
            style={{
              backgroundColor: justAdded ? 'var(--primary-accent)' : 'var(--bg-app)',
              borderColor: 'var(--border-color)',
              color: justAdded ? '#FFFFFF' : 'var(--primary-accent)',
            }}
            title="Subir o reemplazar recurso desde tu dispositivo"
          >
            {uploading ? (
              <LoaderCircle size={13} className="animate-spin" />
            ) : justAdded ? (
              <Check size={14} className="animate-in zoom-in-50 duration-150" />
            ) : (
              <Plus size={14} className="transition-transform group-hover:scale-110" />
            )}
            <span className="text-[7px] font-extrabold uppercase leading-none">Cargar</span>
          </button>

          {/* Botón Acción Secundaria: Configurar (3D), Editor (Video), Cortar (Imagen) */}
          {is3dType ? (
            <button
              type="button"
              onClick={() => {
                const currentAsset = assets.find((a) => a.url === value);
                if (currentAsset && onSelectAsset) onSelectAsset(currentAsset);
                if (onConfigureAsset && currentAsset) onConfigureAsset(currentAsset);
                else if (onConfigureAsset) onConfigureAsset({ id: 0, partner_id: 0, name: '', type: '3d', file_path: '', url: value });
              }}
              disabled={!value}
              className="flex-1 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed group"
              style={{
                backgroundColor: 'var(--bg-app)',
                borderColor: 'var(--border-color)',
                color: 'var(--primary-accent)',
              }}
              title="Configurar pivote y orientación de este objeto 3D"
            >
              <Settings size={13} className="transition-transform group-hover:scale-110" />
              <span className="text-[7px] font-extrabold uppercase leading-none">Ajustar</span>
            </button>
          ) : isVideoType ? (
            <button
              type="button"
              onClick={() => {
                if (onConfigureVideo) onConfigureVideo();
              }}
              disabled={!value}
              className="flex-1 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed group"
              style={{
                backgroundColor: 'var(--bg-app)',
                borderColor: 'var(--border-color)',
                color: 'var(--primary-accent)',
              }}
              title="Abrir Editor de Video (Recorte, Mute, Bucle Yoyo, Velocidad)"
            >
              <Film size={13} className="transition-transform group-hover:scale-110" />
              <span className="text-[7px] font-extrabold uppercase leading-none">Editor</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowCropModal(true)}
              disabled={!value || !isImgValid}
              className="flex-1 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed group"
              style={{
                backgroundColor: 'var(--bg-app)',
                borderColor: 'var(--border-color)',
                color: 'var(--primary-accent)',
              }}
              title="Cortar y encuadrar esta imagen"
            >
              <Crop size={13} className="transition-transform group-hover:scale-110" />
              <span className="text-[7px] font-extrabold uppercase leading-none">Cortar</span>
            </button>
          )}

          {/* Botón Quitar de Elemento */}
          <button
            type="button"
            onClick={handleRemoveFromElement}
            disabled={!value}
            className="flex-1 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed group"
            style={{
              backgroundColor: 'var(--bg-app)',
              borderColor: 'var(--border-color)',
              color: '#EF4444',
            }}
            title="Quitar de este elemento (mantiene el recurso en el banco)"
          >
            <Trash2 size={13} className="transition-transform group-hover:scale-110" />
            <span className="text-[7px] font-extrabold uppercase leading-none">Quitar</span>
          </button>
        </div>
      </div>

      {/* MODAL CROPPER DE IMAGEN */}
      {showCropModal && value && (
        <ImageCropModal
          isOpen={showCropModal}
          imageSrc={value}
          onClose={() => setShowCropModal(false)}
          onCropComplete={(croppedUrl) => {
            onChange(croppedUrl);
            setShowCropModal(false);
          }}
        />
      )}

      {/* SECCIÓN INFERIOR: LISTADO HORIZONTAL DEL BANCO DE RECURSOS DE LA BASE DE DATOS */}
      <div className="pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-extrabold uppercase opacity-70 tracking-wider flex items-center gap-1">
            <UploadCloud size={11} style={{ color: 'var(--primary-accent)' }} />
            Assets {partnerName ? `de ${partnerName}` : ''} ({assets.length})
          </span>
        </div>

        {/* Galería Horizontal Desplazable */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 min-h-[64px] max-w-full no-scrollbar scroll-smooth">
          {loading ? (
            <div className="w-full text-center py-3 flex items-center justify-center gap-2 opacity-50">
              <LoaderCircle size={14} className="animate-spin" />
              <span className="text-[9px] font-bold">Cargando base de datos...</span>
            </div>
          ) : assets.length === 0 ? (
            <div className="w-full text-center py-3 border border-dashed rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-[9px] italic opacity-40 font-medium">
                Sin recursos guardados en la base de datos. Haz clic en "Cargar" para subir uno.
              </span>
            </div>
          ) : (
            [...assets]
              .sort((a, b) => {
                const aSel = a.url === value;
                const bSel = b.url === value;
                if (aSel && !bSel) return -1;
                if (!aSel && bSel) return 1;
                return 0;
              })
              .map((asset, idx) => {
                const isSelected = value === asset.url;
                const isAssetVideo = asset.type === 'video' || asset.url.endsWith('.mp4') || asset.url.endsWith('.webm') || asset.url.endsWith('.ogg');
              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    onChange(asset.url);
                    if (onSelectAsset) {
                      onSelectAsset(asset);
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmIndex(idx);
                  }}
                  className={`group/item relative shrink-0 h-14 min-w-[50px] max-w-[90px] rounded-lg border flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-2xs overflow-hidden p-1 ${
                    isSelected ? 'ring-2 ring-emerald-500 shadow-md' : 'opacity-90 hover:opacity-100'
                  }`}
                  title={`${asset.name} | Un clic para aplicar | Doble clic para eliminar de la BD`}
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    borderColor: isSelected ? 'var(--primary-accent)' : 'var(--border-color)',
                  }}
                >
                  {asset.type === 'video' || (typeof asset.url === 'string' && (asset.url.endsWith('.mp4') || asset.url.endsWith('.webm') || asset.url.endsWith('.ogg'))) ? (
                    <video
                      src={asset.url}
                      muted
                      loop
                      autoPlay
                      playsInline
                      className="max-h-full max-w-full object-contain rounded pointer-events-none"
                    />
                  ) : asset.type === '3d' || (typeof asset.url === 'string' && (asset.url.endsWith('.glb') || asset.url.endsWith('.gltf') || asset.url.endsWith('.obj'))) ? (
                    React.createElement('model-viewer', {
                      src: asset.url,
                      alt: 'Modelo 3D',
                      orientation: `${(isSelected && selectedElementSettings?.modelBaseRotX !== undefined ? selectedElementSettings.modelBaseRotX : asset.settings?.modelBaseRotX) ?? 0}deg ${(isSelected && selectedElementSettings?.modelBaseRotY !== undefined ? selectedElementSettings.modelBaseRotY : asset.settings?.modelBaseRotY) ?? 0}deg ${(isSelected && selectedElementSettings?.modelBaseRotZ !== undefined ? selectedElementSettings.modelBaseRotZ : asset.settings?.modelBaseRotZ) ?? 0}deg`,
                      scale: `${(isSelected && selectedElementSettings?.modelBaseScale !== undefined ? selectedElementSettings.modelBaseScale : asset.settings?.modelBaseScale) ?? 1} ${(isSelected && selectedElementSettings?.modelBaseScale !== undefined ? selectedElementSettings.modelBaseScale : asset.settings?.modelBaseScale) ?? 1} ${(isSelected && selectedElementSettings?.modelBaseScale !== undefined ? selectedElementSettings.modelBaseScale : asset.settings?.modelBaseScale) ?? 1}`,
                      'camera-target': `${(isSelected && selectedElementSettings?.modelPivotX !== undefined ? selectedElementSettings.modelPivotX : asset.settings?.modelPivotX) ?? 0}m ${(isSelected && selectedElementSettings?.modelPivotY !== undefined ? selectedElementSettings.modelPivotY : asset.settings?.modelPivotY) ?? 0}m ${(isSelected && selectedElementSettings?.modelPivotZ !== undefined ? selectedElementSettings.modelPivotZ : asset.settings?.modelPivotZ) ?? 0}m`,
                      bounds: 'tight',
                      style: { width: '100%', height: '100%', borderRadius: '0.25rem', pointerEvents: 'none', outline: 'none' }
                    })
                  ) : (
                    <img
                      src={asset.url}
                      alt={asset.name || `Asset ${asset.id}`}
                      className="max-h-full max-w-full object-contain rounded"
                    />
                  )}


                  {/* Badge de seleccionado */}
                  {isSelected && (
                    <div className="absolute top-0.5 right-0.5 bg-emerald-500 text-white rounded-full p-0.5 shadow-2xs">
                      <Check size={8} strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL PERSONALIZADO DEL PROYECTO PARA ELIMINACIÓN DEFINITIVA EN LA BD */}
      {deleteConfirmIndex !== null && assets[deleteConfirmIndex] && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs p-4 rounded-xl border shadow-2xl text-center space-y-3 animate-in zoom-in-95 duration-150"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)',
            }}
          >
            {/* Vista previa del recurso a eliminar */}
            <div className="h-20 w-full rounded-lg border overflow-hidden flex items-center justify-center bg-black/5 dark:bg-white/5 p-1">
              {assets[deleteConfirmIndex].type === 'video' || assets[deleteConfirmIndex].url.endsWith('.mp4') || assets[deleteConfirmIndex].url.endsWith('.webm') ? (
                <video
                  src={assets[deleteConfirmIndex].url}
                  muted
                  loop
                  autoPlay
                  playsInline
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <img
                  src={assets[deleteConfirmIndex].url}
                  alt="Recurso a borrar"
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>

            <div>
              <p className="text-[12px] font-bold">
                ¿Eliminar permanentemente de la Base de Datos?
              </p>
              <p className="text-[10px] opacity-70 mt-0.5">
                Esta acción eliminará el archivo del servidor y del banco del partner.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmIndex(null)}
                className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold border hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-app)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-main)',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteAsset}
                className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer shadow-2xs"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
