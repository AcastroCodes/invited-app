import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Palette, X, Edit3, Plus, Minus, Bookmark, Trash2, Check } from 'lucide-react';
import { ColorPickerPopover } from './ColorPickerPopover';

export interface ElementStyleConfig {
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  borderRadius?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  textAboveBorder?: boolean;
}

interface NumberInputProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}) => {
  return (
    <div
      className="flex items-center h-6.5 rounded-md border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)]"
      style={{
        backgroundColor: 'var(--bg-app)',
        borderColor: 'var(--border-color)',
      }}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-5 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--primary-accent)',
        }}
        title="Disminuir"
      >
        <Minus size={9} />
      </button>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          if (!isNaN(val)) {
            onChange(Math.min(max, Math.max(min, val)));
          }
        }}
        className="w-full h-full text-center text-[10px] font-bold bg-transparent outline-none px-1"
        style={{ color: 'var(--text-main)' }}
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + step))}
        className="w-5 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--primary-accent)',
        }}
        title="Aumentar"
      >
        <Plus size={9} />
      </button>
    </div>
  );
};

interface StylePickerPopoverProps {
  styleConfig: ElementStyleConfig;
  onChange: (updated: Partial<ElementStyleConfig>) => void;
  label?: string;
  elementType?: 'text' | 'container' | 'button' | 'shape' | 'generic';
}

const STORAGE_KEY = 'invited_saved_element_styles';

export const StylePickerPopover: React.FC<StylePickerPopoverProps> = ({
  styleConfig,
  onChange,
  label = 'Estilo & Apariencia',
  elementType = 'generic',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'fondo' | 'borde' | 'sombra'>('fondo');
  const [initialStyleConfig, setInitialStyleConfig] = useState<ElementStyleConfig>(styleConfig);

  useEffect(() => {
    if (isOpen) {
      setInitialStyleConfig({ ...styleConfig });
    }
  }, [isOpen]);

  const handleCancel = () => {
    onChange(initialStyleConfig);
    setIsOpen(false);
  };

  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popoverCoords, setPopoverCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [justSaved, setJustSaved] = useState(false);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

  const confirmDeleteStyle = () => {
    if (deleteConfirmIndex !== null) {
      const updated = savedStyles.filter((_, i) => i !== deleteConfirmIndex);
      saveStylesToStorage(updated);
      setDeleteConfirmIndex(null);
    }
  };

  // Cargar estilos guardados de localStorage
  const [savedStyles, setSavedStyles] = useState<ElementStyleConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const saveStylesToStorage = (styles: ElementStyleConfig[]) => {
    setSavedStyles(styles);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(styles));
    } catch (e) {
      console.error('Error saving styles to localStorage:', e);
    }
  };

  const handleSaveStyle = () => {
    const currentStyle: ElementStyleConfig = {
      color: styleConfig?.color || 'transparent',
      backgroundColor: styleConfig?.backgroundColor || 'transparent',
      borderColor: styleConfig?.borderColor || 'transparent',
      borderWidth: styleConfig?.borderWidth ?? 0,
      borderStyle: styleConfig?.borderStyle || 'solid',
      borderRadius: styleConfig?.borderRadius ?? 0,
      shadowColor: styleConfig?.shadowColor || 'rgba(0,0,0,0)',
      shadowBlur: styleConfig?.shadowBlur ?? 0,
      shadowOffsetX: styleConfig?.shadowOffsetX ?? 0,
      shadowOffsetY: styleConfig?.shadowOffsetY ?? 0,
      textAboveBorder: styleConfig?.textAboveBorder ?? false,
    };

    const isDuplicate = savedStyles.some(
      (s) => JSON.stringify(s) === JSON.stringify(currentStyle)
    );

    if (!isDuplicate) {
      const updated = [currentStyle, ...savedStyles];
      saveStylesToStorage(updated);
    }

    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1200);
  };

  const handleDeleteSavedStyle = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedStyles.filter((_, i) => i !== index);
    saveStylesToStorage(updated);
  };

  // Destructure values with safe fallback values
  const safeConfig = styleConfig || {};
  const color = safeConfig.color || '#212121';
  const backgroundColor = safeConfig.backgroundColor || 'transparent';
  const borderColor = safeConfig.borderColor || '#E07A5F';
  const borderWidth = safeConfig.borderWidth ?? 0;
  const borderStyle = safeConfig.borderStyle || 'solid';
  const borderRadius = safeConfig.borderRadius ?? 0;
  const shadowColor = safeConfig.shadowColor || '#212121';
  const shadowBlur = safeConfig.shadowBlur ?? 0;
  const shadowOffsetX = safeConfig.shadowOffsetX ?? 0;
  const shadowOffsetY = safeConfig.shadowOffsetY ?? 0;
  const textAboveBorder = !!safeConfig.textAboveBorder;

  // Compute CSS box-shadow string for preview
  const shadowCss = (shadowBlur || shadowOffsetX || shadowOffsetY)
    ? `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px ${shadowColor}`
    : 'none';

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverWidth = 280;
      let left = rect.left - popoverWidth - 10;
      if (left < 10) {
        left = Math.max(10, rect.left);
      }
      let top = Math.min(window.innerHeight - 440, Math.max(10, rect.top - 20));
      setPopoverCoords({ top, left });

      // Seleccionar automáticamente la pestaña relevante si hay borde o sombra activos
      if (borderWidth > 0 && borderStyle !== 'none') {
        setActiveTab('borde');
      } else if (shadowBlur > 0 || shadowOffsetX !== 0 || shadowOffsetY !== 0) {
        setActiveTab('sombra');
      } else {
        setActiveTab('fondo');
      }
    }
  }, [isOpen]);

  const isGrad = (val?: string) => typeof val === 'string' && val.includes('gradient');

  return (
    <div className="relative">
      {/* Label section */}
      {label && (
        <span className="block font-bold uppercase text-[9px] mb-1" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
      )}

      {/* Recuadro Trigger con Preview del Estilo Completo */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-7 flex items-center justify-between p-1 rounded-lg border transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-2xs"
        style={{
          backgroundColor: 'var(--bg-app)',
          borderColor: isOpen ? 'var(--primary-accent)' : 'var(--border-color)',
          color: 'var(--text-main)',
        }}
        title="Haz clic para editar estilo, fondo, borde y sombra"
      >
        {/* Recuadro Muestra del Estilo Real Aplicado */}
        {(() => {
          const hasBackground = backgroundColor && backgroundColor !== 'transparent';
          const hasBorder = borderWidth > 0 && borderStyle !== 'none';
          const hasShadow = shadowCss !== 'none';
          const hasTextColor = elementType === 'text' && color && color !== 'transparent';
          const isConfigured = hasBackground || hasBorder || hasShadow || hasTextColor;
          const isBorderGradient = isGrad(borderColor);

          return (
            <div
              className="h-6 flex-1 rounded-md transition-all relative overflow-hidden flex items-center justify-center p-0.5"
              style={{
                background: isGrad(backgroundColor)
                  ? backgroundColor
                  : (isGrad(color) && elementType === 'text' ? color : undefined),
                backgroundColor: !isGrad(backgroundColor)
                  ? (backgroundColor === 'transparent'
                      ? (elementType === 'text' && color && !isGrad(color) && color !== 'transparent' ? color : 'var(--bg-app)')
                      : backgroundColor)
                  : undefined,
                borderColor: (borderWidth > 0 && borderStyle !== 'none')
                  ? (isBorderGradient ? 'transparent' : borderColor)
                  : 'transparent',
                borderImage: (borderWidth > 0 && borderStyle !== 'none' && isBorderGradient)
                  ? `${borderColor} 1`
                  : undefined,
                borderWidth: (borderWidth > 0 && borderStyle !== 'none') ? `${Math.min(borderWidth, 3)}px` : '0px',
                borderStyle: (borderWidth > 0 && borderStyle !== 'none') ? borderStyle : 'none',
                borderRadius: `${Math.min(borderRadius, 6)}px`,
                boxShadow: shadowCss !== 'none' ? shadowCss : undefined,
              }}
            >
              {!isConfigured && (
                <span className="text-[10px] font-bold select-none capitalize opacity-60" style={{ color: 'var(--text-muted)' }}>
                  Ninguno
                </span>
              )}
            </div>
          );
        })()}

        {/* Solo el Icono de Editar al Lado Derecho */}
        <span
          className="p-1 rounded-md border shrink-0 ml-1.5 flex items-center justify-center transition-transform hover:scale-105"
          style={{
            backgroundColor: 'var(--primary-accent-light)',
            borderColor: 'var(--primary-accent)',
            color: 'var(--primary-accent)',
          }}
          title="Editar estilo"
        >
          <Edit3 size={11} />
        </span>
      </button>

      {/* Ventana Flotante Principal Popover */}
      {isOpen && createPortal(
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={handleCancel}
          />

          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed w-64 p-2.5 rounded-xl shadow-2xl border z-50 animate-in fade-in zoom-in-95 duration-150"
            style={{
              top: `${popoverCoords.top}px`,
              left: `${popoverCoords.left}px`,
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)',
            }}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-1.5 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-1.5">
                <Palette size={12} style={{ color: 'var(--primary-accent)' }} />
                <span className="font-extrabold text-[10px] uppercase tracking-wider">
                  Configurador de Estilo
                </span>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="p-0.5 rounded hover:opacity-80 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={12} />
              </button>
            </div>

            {/* Preview Box dentro del Modal con Botón de Guardar al lado derecho */}
            <div className="my-2 flex items-center gap-1.5">
              <div className="flex-1 p-2 rounded-md flex items-center justify-center border border-dashed relative overflow-hidden" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                {(() => {
                  const hasBackground = backgroundColor && backgroundColor !== 'transparent';
                  const hasBorder = borderWidth > 0 && borderStyle !== 'none';
                  const hasShadow = shadowCss !== 'none';
                  const hasTextColor = elementType === 'text' && color && color !== 'transparent';
                  const isConfigured = hasBackground || hasBorder || hasShadow || hasTextColor;
                  const isBorderGradient = isGrad(borderColor);

                  return (
                    <div
                      className="h-10 w-full rounded-md transition-all relative overflow-hidden flex items-center justify-center p-0.5"
                      style={{
                        background: isGrad(backgroundColor)
                          ? backgroundColor
                          : (isGrad(color) && elementType === 'text' ? color : undefined),
                        backgroundColor: !isGrad(backgroundColor)
                          ? (backgroundColor === 'transparent'
                              ? (elementType === 'text' && color && !isGrad(color) && color !== 'transparent' ? color : 'var(--bg-app)')
                              : backgroundColor)
                          : undefined,
                        borderColor: (borderWidth > 0 && borderStyle !== 'none')
                          ? (isBorderGradient ? 'transparent' : borderColor)
                          : 'transparent',
                        borderImage: (borderWidth > 0 && borderStyle !== 'none' && isBorderGradient)
                          ? `${borderColor} 1`
                          : undefined,
                        borderWidth: (borderWidth > 0 && borderStyle !== 'none') ? `${Math.min(borderWidth, 3)}px` : '0px',
                        borderStyle: (borderWidth > 0 && borderStyle !== 'none') ? borderStyle : 'none',
                        borderRadius: `${Math.min(borderRadius, 6)}px`,
                        boxShadow: shadowCss !== 'none' ? shadowCss : undefined,
                      }}
                    >
                      {!isConfigured && (
                        <span className="text-[10px] font-bold select-none capitalize opacity-60" style={{ color: 'var(--text-muted)' }}>
                          Ninguno
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Botón de Guardar Estilo del Lado Derecho (solo ícono, mismo alto del preview) */}
              <button
                type="button"
                onClick={handleSaveStyle}
                className="self-stretch w-7 rounded-md border flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                style={{
                  backgroundColor: justSaved ? 'var(--primary-accent)' : 'var(--bg-app)',
                  borderColor: 'var(--border-color)',
                  color: justSaved ? '#FFFFFF' : 'var(--primary-accent)',
                }}
                title={justSaved ? '¡Estilo Guardado!' : 'Guardar este estilo'}
              >
                {justSaved ? (
                  <Check size={14} className="animate-in zoom-in-50 duration-150" />
                ) : (
                  <Bookmark size={14} />
                )}
              </button>
            </div>

            {/* Pestañas Principales: Fondo, Borde, Sombra */}
            <div
              className="grid grid-cols-3 h-6 p-0.5 rounded-md border text-[9px] font-bold mb-2"
              style={{
                backgroundColor: 'var(--bg-app)',
                borderColor: 'var(--border-color)',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('fondo')}
                className={`flex items-center justify-center gap-1 rounded transition-all ${
                  activeTab === 'fondo' ? 'text-white font-extrabold shadow-2xs' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: activeTab === 'fondo' ? 'var(--primary-accent)' : 'transparent',
                  color: activeTab === 'fondo' ? '#FFFFFF' : 'var(--text-muted)',
                }}
              >
                Fondo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('borde')}
                className={`flex items-center justify-center gap-1 rounded transition-all ${
                  activeTab === 'borde' ? 'text-white font-extrabold shadow-2xs' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: activeTab === 'borde' ? 'var(--primary-accent)' : 'transparent',
                  color: activeTab === 'borde' ? '#FFFFFF' : 'var(--text-muted)',
                }}
              >
                Borde
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sombra')}
                className={`flex items-center justify-center gap-1 rounded transition-all ${
                  activeTab === 'sombra' ? 'text-white font-extrabold shadow-2xs' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: activeTab === 'sombra' ? 'var(--primary-accent)' : 'transparent',
                  color: activeTab === 'sombra' ? '#FFFFFF' : 'var(--text-muted)',
                }}
              >
                Sombra
              </button>
            </div>

            {/* TAB 1: FONDO */}
            {activeTab === 'fondo' && (
              <div className="space-y-2.5">
                {elementType === 'text' || elementType === 'button' ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold opacity-70">Color de Fuente (Texto)</label>
                      <label className="flex items-center gap-1 text-[10px] font-semibold cursor-pointer select-none" style={{ color: 'var(--text-muted)' }}>
                        <input
                          type="checkbox"
                          checked={textAboveBorder}
                          onChange={(e) => onChange({ textAboveBorder: e.target.checked })}
                          className="rounded border-gray-400 focus:ring-0 h-3 w-3 cursor-pointer"
                          style={{ accentColor: 'var(--primary-accent)' }}
                        />
                        <span>Redibujar</span>
                      </label>
                    </div>

                    {/* Colorpicker de texto */}
                    <ColorPickerPopover
                      value={color}
                      onChange={(newVal) => onChange({ color: newVal })}
                    />
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-bold opacity-70 mb-1">Color de Fondo Relleno</label>
                      <ColorPickerPopover
                        value={backgroundColor}
                        onChange={(newVal) => onChange({ backgroundColor: newVal })}
                        allowTransparent={true}
                      />
                    </div>

                    {/* Transparencia rápida abajo */}
                    <div className="flex items-center justify-between p-2 rounded-lg border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                      <span className="text-[10px] font-bold opacity-70">Fondo Transparente</span>
                      <button
                        type="button"
                        onClick={() => onChange({ backgroundColor: 'transparent' })}
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded-md border transition-all hover:scale-105"
                        style={{
                          backgroundColor: backgroundColor === 'transparent' ? 'var(--primary-accent-light)' : 'var(--bg-card)',
                          borderColor: backgroundColor === 'transparent' ? 'var(--primary-accent)' : 'var(--border-color)',
                          color: backgroundColor === 'transparent' ? 'var(--primary-accent)' : 'var(--text-main)',
                        }}
                      >
                        {backgroundColor === 'transparent' ? '✓ Transparente' : 'Hacer Transparente'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: BORDE */}
            {activeTab === 'borde' && (
              <div className="space-y-2.5">
                {/* En la misma fila: Colorpicker a la izquierda, Grosor a la derecha */}
                <div className="grid grid-cols-2 gap-2 items-end">
                  <div>
                    <label className="block text-[10px] font-bold opacity-70 mb-1">Color de Borde</label>
                    <ColorPickerPopover
                      value={borderColor}
                      onChange={(newVal) => onChange({ borderColor: newVal })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold mb-1 opacity-70">Grosor (px)</label>
                    <NumberInput
                      min={0}
                      max={30}
                      value={borderWidth}
                      onChange={(val) => onChange({ borderWidth: val })}
                    />
                  </div>
                </div>

                {/* Abajo: Estilo y Radio de esquinas */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold mb-1 opacity-70">Estilo de Línea</label>
                    <select
                      value={borderStyle}
                      onChange={(e) => onChange({ borderStyle: e.target.value as any })}
                      className="w-full h-8 rounded-lg px-2 border outline-none font-bold text-xs cursor-pointer transition-colors focus:ring-1 focus:ring-[var(--primary-accent)]"
                      style={{
                        backgroundColor: 'var(--bg-app)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-main)',
                      }}
                    >
                      <option value="solid" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>Sólida (Continua)</option>
                      <option value="dashed" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>Discontinua (Dashed)</option>
                      <option value="dotted" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>Punteada (Dotted)</option>
                      <option value="double" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>Doble (Double)</option>
                      <option value="none" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>Sin borde</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold mb-1 opacity-70">Redondeado (px)</label>
                    <NumberInput
                      min={0}
                      max={100}
                      value={borderRadius}
                      onChange={(val) => onChange({ borderRadius: val })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SOMBRA */}
            {activeTab === 'sombra' && (
              <div className="space-y-2.5">
                {/* En la misma fila arriba: Colorpicker a la izquierda, Desenfoque Blur (px) a la derecha */}
                <div className="grid grid-cols-2 gap-2 items-end">
                  <div>
                    <label className="block text-[10px] font-bold opacity-70 mb-1">Color de Sombra</label>
                    <ColorPickerPopover
                      value={shadowColor}
                      allowGradient={false}
                      onChange={(newVal) => onChange({ shadowColor: newVal })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold mb-1 opacity-70">Desenfoque Blur (px)</label>
                    <NumberInput
                      min={0}
                      max={100}
                      value={shadowBlur}
                      onChange={(val) => onChange({ shadowBlur: val })}
                    />
                  </div>
                </div>

                {/* En la misma linea abajo: Desplazamiento X (px) y Desplazamiento Y (px) */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold mb-1 opacity-70">Desplazamiento X (px)</label>
                    <NumberInput
                      min={-50}
                      max={50}
                      value={shadowOffsetX}
                      onChange={(val) => onChange({ shadowOffsetX: val })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold mb-1 opacity-70">Desplazamiento Y (px)</label>
                    <NumberInput
                      min={-50}
                      max={50}
                      value={shadowOffsetY}
                      onChange={(val) => onChange({ shadowOffsetY: val })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* LISTA HORIZONTAL DE ESTILOS GUARDADOS (siempre visible abajo) */}
            <div className="mt-2.5 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-extrabold uppercase opacity-70 tracking-wider">
                  Estilos Guardados
                </span>
                <span className="text-[8px] opacity-50 font-bold">{savedStyles.length}</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 min-h-[30px] max-w-full no-scrollbar scroll-smooth">
                {savedStyles.length === 0 ? (
                  <span className="text-[9px] italic opacity-40 font-medium py-1">
                    Sin estilos guardados
                  </span>
                ) : (
                  savedStyles.map((item, idx) => {
                    const itemColor = item.color || '#212121';
                    const itemBg = item.backgroundColor || 'transparent';
                    const itemBorderColor = item.borderColor || 'transparent';
                    const itemBorderWidth = item.borderWidth ?? 0;
                    const itemBorderStyle = item.borderStyle || 'solid';
                    const itemRadius = item.borderRadius ?? 0;
                    const itemShadowBlur = item.shadowBlur ?? 0;
                    const itemShadowColor = item.shadowColor || 'rgba(0,0,0,0)';
                    const itemShadowX = item.shadowOffsetX ?? 0;
                    const itemShadowY = item.shadowOffsetY ?? 0;
                    const itemShadowCss = (itemShadowBlur > 0 || itemShadowX !== 0 || itemShadowY !== 0)
                      ? `${itemShadowX}px ${itemShadowY}px ${itemShadowBlur}px ${itemShadowColor}`
                      : 'none';

                    const itemHasBg = itemBg && itemBg !== 'transparent';
                    const itemHasBorder = itemBorderWidth > 0 && itemBorderStyle !== 'none';
                    const itemHasShadow = itemShadowCss !== 'none';
                    const itemHasTextColor = elementType === 'text' && itemColor && itemColor !== 'transparent';
                    const itemIsConfigured = itemHasBg || itemHasBorder || itemHasShadow || itemHasTextColor;
                    const itemIsBorderGradient = isGrad(itemBorderColor);

                    return (
                      <div
                        key={idx}
                        onClick={() => onChange(item)}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmIndex(idx);
                        }}
                        className="group/item relative shrink-0 w-7 h-7 rounded-md transition-all flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 overflow-hidden"
                        title="Un clic para aplicar | Doble clic para eliminar"
                        style={{
                          background: isGrad(itemBg)
                            ? itemBg
                            : (isGrad(itemColor) && elementType === 'text' ? itemColor : undefined),
                          backgroundColor: !isGrad(itemBg)
                            ? (itemBg === 'transparent'
                                ? (elementType === 'text' && itemColor && !isGrad(itemColor) && itemColor !== 'transparent' ? itemColor : 'var(--bg-app)')
                                : itemBg)
                            : undefined,
                          borderColor: (itemBorderWidth > 0 && itemBorderStyle !== 'none')
                            ? (itemIsBorderGradient ? 'transparent' : itemBorderColor)
                            : 'var(--border-color)',
                          borderImage: (itemBorderWidth > 0 && itemBorderStyle !== 'none' && itemIsBorderGradient)
                            ? `${itemBorderColor} 1`
                            : undefined,
                          borderWidth: (itemBorderWidth > 0 && itemBorderStyle !== 'none') ? `${Math.min(itemBorderWidth, 2)}px` : '1px',
                          borderStyle: (itemBorderWidth > 0 && itemBorderStyle !== 'none') ? itemBorderStyle : 'solid',
                          borderRadius: `${Math.min(itemRadius, 6)}px`,
                          boxShadow: itemShadowCss !== 'none' ? itemShadowCss : undefined,
                        }}
                      >
                        {!itemIsConfigured && (
                          <span className="text-[7px] font-extrabold select-none opacity-40" style={{ color: 'var(--text-muted)' }}>
                            N/A
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal de confirmación para eliminar estilo (Sistema interno) */}
            {deleteConfirmIndex !== null && (
              <div className="absolute inset-0 z-50 rounded-xl bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
                <div
                  className="w-full p-3 rounded-lg border shadow-xl text-center space-y-2"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)',
                  }}
                >
                  <p className="text-[11px] font-bold">
                    ¿Deseas eliminar este estilo guardado?
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmIndex(null)}
                      className="px-2.5 py-1 rounded text-[10px] font-semibold border hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
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
                      onClick={confirmDeleteStyle}
                      className="px-2.5 py-1 rounded text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer shadow-2xs"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* BOTONES ABAJO A LA DERECHA: CANCELAR Y AGREGAR */}
            <div className="flex items-center justify-end gap-1.5 pt-2.5 mt-2.5 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <button
                type="button"
                onClick={handleCancel}
                className="px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
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
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 rounded-md text-[11px] font-bold text-white shadow-2xs transition-all hover:opacity-90 cursor-pointer"
                style={{
                  backgroundColor: 'var(--primary-accent)',
                }}
              >
                Agregar
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};
