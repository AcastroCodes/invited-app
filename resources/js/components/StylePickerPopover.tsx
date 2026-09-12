import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Palette, X, Edit3, Plus, Minus } from 'lucide-react';
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
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
        className="w-full h-full text-center bg-transparent outline-none font-mono text-[10px] font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
  elementType?: 'text' | 'container' | 'generic';
}

export const StylePickerPopover: React.FC<StylePickerPopoverProps> = ({
  styleConfig,
  onChange,
  label = 'Estilo & Apariencia',
  elementType = 'generic',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'fondo' | 'borde' | 'sombra'>('fondo');

  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popoverCoords, setPopoverCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

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
        className="w-full flex items-center justify-between p-1 rounded-lg border transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-2xs"
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
                  ? (isGrad(borderColor) ? '#E07A5F' : borderColor)
                  : 'transparent',
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
            onClick={() => setIsOpen(false)}
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
                onClick={() => setIsOpen(false)}
                className="p-0.5 rounded hover:opacity-80 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={12} />
              </button>
            </div>

            {/* Preview Box dentro del Modal */}
            <div className="my-2 p-2 rounded-md flex items-center justify-center border border-dashed relative overflow-hidden" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
              {elementType === 'text' || elementType === 'button' ? (
                <div
                  className="px-2 py-1 flex items-center justify-center text-sm font-extrabold transition-all relative select-none"
                  style={{
                    backgroundColor: backgroundColor,
                    borderRadius: `${borderRadius}px`,
                  }}
                >
                  {textAboveBorder ? (
                    <div className="relative inline-block">
                      <span
                        className="block"
                        style={{
                          color: (borderWidth > 0 && borderColor) ? borderColor : 'transparent',
                          WebkitTextStroke: borderWidth > 0 ? `${borderWidth * 2}px ${borderColor}` : undefined,
                          textShadow: shadowCss !== 'none' ? shadowCss : undefined,
                        }}
                      >
                        Texto Previo
                      </span>
                      <span
                        className="absolute inset-0 block"
                        style={{
                          color: isGrad(color) ? 'transparent' : color || '#212121',
                          backgroundImage: isGrad(color) ? color : undefined,
                          WebkitBackgroundClip: isGrad(color) ? 'text' : undefined,
                          WebkitTextFillColor: isGrad(color) ? 'transparent' : undefined,
                          WebkitTextStroke: '0 transparent',
                        }}
                      >
                        Texto Previo
                      </span>
                    </div>
                  ) : (
                    <span
                      style={{
                        color: isGrad(color) ? 'transparent' : (color || 'var(--text-main)'),
                        backgroundImage: isGrad(color) ? color : undefined,
                        WebkitBackgroundClip: isGrad(color) ? 'text' : undefined,
                        WebkitTextFillColor: isGrad(color) ? 'transparent' : undefined,
                        textShadow: shadowCss !== 'none' ? shadowCss : undefined,
                        WebkitTextStroke: (borderWidth > 0 && borderColor) ? `${borderWidth}px ${borderColor}` : undefined,
                      }}
                    >
                      Texto Previo
                    </span>
                  )}
                </div>
              ) : (
                <div
                  className="h-14 w-32 flex items-center justify-center text-[10px] font-bold transition-all relative overflow-hidden shadow-2xs"
                  style={{
                    background: isGrad(backgroundColor) ? backgroundColor : undefined,
                    backgroundColor: !isGrad(backgroundColor)
                      ? (backgroundColor === 'transparent' ? '#FFFFFF' : backgroundColor)
                      : undefined,
                    borderColor: (borderWidth > 0 && borderColor) ? borderColor : 'transparent',
                    borderWidth: borderWidth > 0 ? `${borderWidth}px` : '0px',
                    borderStyle: (borderWidth > 0 && borderStyle !== 'none') ? borderStyle : 'none',
                    borderRadius: `${borderRadius}px`,
                    boxShadow: shadowCss !== 'none' ? shadowCss : undefined,
                    color: 'var(--text-main)',
                  }}
                >
                  {backgroundColor === 'transparent' ? (
                    <span className="text-[10px] text-red-500 font-extrabold uppercase">Transparente</span>
                  ) : (
                    'Vista Previa'
                  )}
                </div>
              )}
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

            {/* BOTONES ABAJO A LA DERECHA: CANCELAR Y AGREGAR */}
            <div className="flex items-center justify-end gap-1.5 pt-2.5 mt-2.5 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
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
