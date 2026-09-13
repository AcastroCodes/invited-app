import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Plus, Trash2, Check, UploadCloud } from 'lucide-react';

interface AssetPickerPopoverProps {
  value?: string;
  onChange: (val: string) => void;
  label?: string;
  accept?: string;
}

const STORAGE_KEY = 'invited_partner_assets';

// Galería de imágenes inicial por defecto (placeholders atractivos de prueba si el banco está vacío)
const DEFAULT_ASSETS = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=500&auto=format&fit=crop&q=60',
];

export const AssetPickerPopover: React.FC<AssetPickerPopoverProps> = ({
  value = '',
  onChange,
  label = 'Imagen del Elemento',
  accept = 'image/*',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  // Cargar recursos guardados de localStorage
  const [savedAssets, setSavedAssets] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_ASSETS;
    } catch (e) {
      return DEFAULT_ASSETS;
    }
  });

  const saveAssetsToStorage = (assets: string[]) => {
    setSavedAssets(assets);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
    } catch (e) {
      console.error('Error saving assets to localStorage:', e);
    }
  };

  // Manejar carga de archivo desde el equipo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        // Agregar al banco de recursos si no existe ya
        if (!savedAssets.includes(result)) {
          const updated = [result, ...savedAssets];
          saveAssetsToStorage(updated);
        }
        // Aplicar inmediatamente al elemento
        onChange(result);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1500);
      }
    };
    reader.readAsDataURL(file);

    // Resetear input para permitir subir el mismo archivo nuevamente si se desea
    e.target.value = '';
  };

  // Confirmar borrado definitivo del Banco de Recursos
  const confirmDeleteAsset = () => {
    if (deleteConfirmIndex !== null) {
      const assetToDelete = savedAssets[deleteConfirmIndex];
      const updated = savedAssets.filter((_, i) => i !== deleteConfirmIndex);
      saveAssetsToStorage(updated);
      setDeleteConfirmIndex(null);

      // Si la imagen eliminada era la que estaba seleccionada activamente, vaciar el campo
      if (value === assetToDelete) {
        onChange('');
      }
    }
  };

  // Quitar la imagen del elemento (limpiar selección sin borrar de la biblioteca)
  const handleRemoveFromElement = () => {
    onChange('');
  };

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
            borderColor: value ? 'var(--primary-accent)' : 'var(--border-color)',
          }}
        >
          {value ? (
            <img
              src={value}
              alt="Vista previa de imagen"
              className="max-h-full max-w-full object-contain p-1 rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 opacity-50 p-2 text-center">
              <ImageIcon size={22} style={{ color: 'var(--text-muted)' }} />
              <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
                Sin imagen seleccionada
              </span>
            </div>
          )}
        </div>

        {/* BOTONES LADO DERECHO: AGREGAR Y BORRAR DE ELEMENTO */}
        <div className="flex flex-col justify-between gap-1.5 w-9 shrink-0">
          {/* Botón Agregar / Subir */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs group"
            style={{
              backgroundColor: justAdded ? 'var(--primary-accent)' : 'var(--bg-app)',
              borderColor: 'var(--border-color)',
              color: justAdded ? '#FFFFFF' : 'var(--primary-accent)',
            }}
            title="Subir o reemplazar imagen desde tu dispositivo"
          >
            {justAdded ? (
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

      {/* SECCIÓN INFERIOR: LISTADO HORIZONTAL DEL BANCO DE RECURSOS DEL PARTNER */}
      <div className="pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-extrabold uppercase opacity-70 tracking-wider flex items-center gap-1">
            <UploadCloud size={11} style={{ color: 'var(--primary-accent)' }} />
            Banco de Imágenes ({savedAssets.length})
          </span>
          <span className="text-[8px] opacity-50 font-medium">1 Clic: Elegir | 2 Clics: Borrar</span>
        </div>

        {/* Galería Horizontal Desplazable */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 min-h-[64px] max-w-full no-scrollbar scroll-smooth">
          {savedAssets.length === 0 ? (
            <div className="w-full text-center py-3 border border-dashed rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-[9px] italic opacity-40 font-medium">
                No hay imágenes en el banco. Haz clic en "Cargar" para subir una.
              </span>
            </div>
          ) : (
            savedAssets.map((assetUrl, idx) => {
              const isSelected = value === assetUrl;
              return (
                <div
                  key={idx}
                  onClick={() => onChange(assetUrl)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmIndex(idx);
                  }}
                  className={`group/item relative shrink-0 h-14 min-w-[50px] max-w-[90px] rounded-lg border flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-2xs overflow-hidden p-1 ${
                    isSelected ? 'ring-2 ring-emerald-500 shadow-md' : 'opacity-90 hover:opacity-100'
                  }`}
                  title="Un clic para aplicar | Doble clic para eliminar de la biblioteca"
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    borderColor: isSelected ? 'var(--primary-accent)' : 'var(--border-color)',
                  }}
                >
                  <img
                    src={assetUrl}
                    alt={`Asset ${idx}`}
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

      {/* MODAL PERSONALIZADO DEL PROYECTO PARA ELIMINACIÓN DEFINITIVA */}
      {deleteConfirmIndex !== null && (
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
                src={savedAssets[deleteConfirmIndex]}
                alt="Imagen a borrar"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div>
              <p className="text-[12px] font-bold">
                ¿Eliminar de tu Banco de Imágenes?
              </p>
              <p className="text-[10px] opacity-70 mt-0.5">
                Esta acción quitará la imagen de tu biblioteca permanente.
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
