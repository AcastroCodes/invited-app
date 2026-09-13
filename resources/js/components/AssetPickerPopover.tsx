import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, Check, UploadCloud, LoaderCircle } from 'lucide-react';
import api from '../lib/api';

export interface AssetItem {
  id: number;
  partner_id: number;
  name: string;
  type: string;
  file_path: string;
  url: string;
}

interface AssetPickerPopoverProps {
  partnerId?: number | string;
  partnerName?: string;
  value?: string;
  onChange: (val: string) => void;
  label?: string;
  accept?: string;
  type?: string;
}

export const AssetPickerPopover: React.FC<AssetPickerPopoverProps> = ({
  partnerId,
  partnerName = 'ConceptoDigital',
  value = '',
  onChange,
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

  return (
    <div className="space-y-3">
      {/* Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Label principal */}
      {label && (
        <span className="block font-bold text-[10px] uppercase tracking-wider opacity-70" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
      )}

      {/* VISTA PREVIA SUPERIOR (PREVIEW BOX) */}
      <div className="flex items-stretch gap-2">
        {/* Contenedor Preview */}
        <div
          className="flex-1 h-24 rounded-xl border border-dashed flex items-center justify-center relative overflow-hidden transition-all shadow-inner"
          style={{
            backgroundColor: 'var(--bg-app)',
            borderColor: isImgValid ? 'var(--primary-accent)' : 'var(--border-color)',
          }}
        >
          {isImgValid ? (
            <img
              src={value}
              alt="Vista previa de imagen"
              onError={() => setHasImgError(true)}
              className="max-h-full max-w-full object-contain p-1 rounded-lg"
            />
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-2 text-center transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer group select-none"
              title="Haz clic para agregar una imagen"
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
                Agregar Imagen
              </span>
            </button>
          )}
        </div>

        {/* BOTONES LADO DERECHO: AGREGAR Y BORRAR DE ELEMENTO */}
        <div className="flex flex-col justify-between gap-1.5 w-9 shrink-0">
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
            title="Subir o reemplazar imagen desde tu dispositivo"
          >
            {uploading ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : justAdded ? (
              <Check size={16} className="animate-in zoom-in-50 duration-150" />
            ) : (
              <Plus size={16} className="transition-transform group-hover:scale-110" />
            )}
            <span className="text-[7px] font-extrabold uppercase leading-none">Cargar</span>
          </button>

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
            title="Quitar imagen de este elemento (mantiene la imagen en el banco)"
          >
            <Trash2 size={15} className="transition-transform group-hover:scale-110" />
            <span className="text-[7px] font-extrabold uppercase leading-none">Quitar</span>
          </button>
        </div>
      </div>

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
            assets.map((asset, idx) => {
              const isSelected = value === asset.url;
              return (
                <div
                  key={asset.id}
                  onClick={() => onChange(asset.url)}
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
                  <img
                    src={asset.url}
                    alt={asset.name || `Asset ${asset.id}`}
                    className="max-h-full max-w-full object-contain rounded"
                  />

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
            {/* Vista previa de la imagen a eliminar */}
            <div className="h-20 w-full rounded-lg border overflow-hidden flex items-center justify-center bg-black/5 dark:bg-white/5 p-1">
              <img
                src={assets[deleteConfirmIndex].url}
                alt="Imagen a borrar"
                className="max-h-full max-w-full object-contain"
              />
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
