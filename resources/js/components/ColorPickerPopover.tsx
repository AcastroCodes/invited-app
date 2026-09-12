import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Palette, X, Plus, Edit3 } from 'lucide-react';

export interface GradientStop {
  id: string;
  color: string;
  position: number; // 0..100
}

export type PhotoshopGradientType = 'linear' | 'radial' | 'angle' | 'reflected' | 'diamond';

interface ColorPickerPopoverProps {
  value?: string; // Hex color (#FFFFFF) or CSS gradient string (linear-gradient(...) / radial-gradient(...))
  onChange: (val: string) => void;
  label?: string;
  allowTransparent?: boolean;
}

export const ColorPickerPopover: React.FC<ColorPickerPopoverProps> = ({
  value = '#212121',
  onChange,
  label,
  allowTransparent = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popoverCoords, setPopoverCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const safeValue = typeof value === 'string' ? value : '#212121';

  // Mode: 'solid' or 'gradient'
  const isGradientValue = safeValue.includes('gradient');
  const [mode, setMode] = useState<'solid' | 'gradient'>(isGradientValue ? 'gradient' : 'solid');

  // Solid State
  const [solidColor, setSolidColor] = useState(isGradientValue ? '#E07A5F' : safeValue);

  // Gradient State (Photoshop Types: Lineal, Radial, Ángulo/Cónico, Reflejado, Diamante)
  const [gradType, setGradType] = useState<PhotoshopGradientType>('linear');
  const [gradAngle, setGradAngle] = useState(135);
  const [gradStops, setGradStops] = useState<GradientStop[]>([
    { id: '1', color: '#E07A5F', position: 0 },
    { id: '2', color: '#F2CC8F', position: 100 },
  ]);

  // Active stop selection state for Quick Palette
  const [activeStopId, setActiveStopId] = useState<string>('1');

  // Ensure activeStopId is valid when stops change
  useEffect(() => {
    if (gradStops.length > 0 && !gradStops.some((s) => s.id === activeStopId)) {
      setActiveStopId(gradStops[0].id);
    }
  }, [gradStops]);

  // Temp draft state for Cancel/Apply support
  const [draftValue, setDraftValue] = useState(safeValue);

  // Sync internal state when popover opens or value changes
  useEffect(() => {
    const curVal = typeof value === 'string' ? value : '#212121';
    setDraftValue(curVal);
    if (curVal.includes('gradient')) {
      setMode('gradient');
      if (curVal.includes('/*reflected*/') || curVal.includes('repeating-linear-gradient')) setGradType('reflected');
      else if (curVal.includes('/*diamond*/') || curVal.includes('polygon(')) setGradType('diamond');
      else if (curVal.includes('conic-gradient')) setGradType('angle');
      else if (curVal.includes('radial-gradient')) setGradType('radial');
      else setGradType('linear');
    } else {
      setMode('solid');
      setSolidColor(curVal);
    }
  }, [value, isOpen]);

  // Helper to build gradient string based on Photoshop Gradient Types
  const buildGradientCss = (
    type: PhotoshopGradientType = gradType,
    angle: number = gradAngle,
    stops: GradientStop[] = gradStops
  ) => {
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    const stopsCss = sorted.map((s) => `${s.color} ${s.position}%`).join(', ');

    if (type === 'angle') {
      // Photoshop Angle Gradient -> CSS Conic Gradient
      return `conic-gradient(from ${angle}deg at center, ${stopsCss})`;
    }
    if (type === 'radial') {
      // Photoshop Radial Gradient -> CSS Radial Gradient
      return `radial-gradient(circle at center, ${stopsCss})`;
    }
    if (type === 'reflected') {
      // Photoshop Reflected Gradient -> Symmetrical stop distribution
      // Replaces stops symmetrically from 0% (edge) -> 50% (center) -> 100% (edge)
      const c1 = sorted[0]?.color || '#E07A5F';
      const c2 = sorted[sorted.length - 1]?.color || '#F2CC8F';
      const midStops = sorted.map(s => `${s.color} ${Math.round(s.position / 2)}%`).join(', ');
      const revStops = [...sorted].reverse().map(s => `${s.color} ${Math.round(50 + s.position / 2)}%`).join(', ');
      return `/*reflected*/ linear-gradient(${angle}deg, ${midStops}, ${revStops})`;
    }
    if (type === 'diamond') {
      // Photoshop Diamond Gradient -> Radial / Conic diamond approximation in CSS
      return `/*diamond*/ radial-gradient(ellipse at center, ${stopsCss})`;
    }
    // Default Photoshop Linear Gradient
    return `linear-gradient(${angle}deg, ${stopsCss})`;
  };

  // Update current draft value
  const updateDraft = (newVal: string) => {
    setDraftValue(newVal);
  };

  const handleSolidChange = (newColor: string) => {
    setSolidColor(newColor);
    updateDraft(newColor);
  };

  // Add gradient stop
  const addStop = () => {
    if (gradStops.length >= 6) return;
    const newId = String(Date.now());
    const lastPos = gradStops[gradStops.length - 1]?.position || 50;
    const newStops = [...gradStops, { id: newId, color: '#3B82F6', position: Math.min(100, lastPos + 20) }];
    setGradStops(newStops);
    updateDraft(buildGradientCss(gradType, gradAngle, newStops));
  };

  // Remove stop
  const removeStop = (id: string) => {
    if (gradStops.length <= 2) return;
    const newStops = gradStops.filter((s) => s.id !== id);
    setGradStops(newStops);
    updateDraft(buildGradientCss(gradType, gradAngle, newStops));
  };

  // Update stop
  const updateStop = (id: string, fields: Partial<GradientStop>) => {
    const newStops = gradStops.map((s) => (s.id === id ? { ...s, ...fields } : s));
    setGradStops(newStops);
    updateDraft(buildGradientCss(gradType, gradAngle, newStops));
  };

  // Apply changes to parent
  const handleApply = () => {
    onChange(draftValue);
    setIsOpen(false);
  };

  // Cancel changes
  const handleCancel = () => {
    setDraftValue(value);
    setIsOpen(false);
  };

  // Calculate coords for portal floating window
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const width = 310;
      let left = rect.left - width - 10;
      if (left < 10) left = Math.max(10, rect.left);
      let top = Math.min(window.innerHeight - 520, Math.max(10, rect.top - 20));
      setPopoverCoords({ top, left });
    }
  }, [isOpen]);

  const officialPalette = ['#E07A5F', '#F2CC8F', '#212121', '#FFFFFF', '#52B788', '#E63946', '#3B82F6', '#8B5CF6', '#757575'];

  return (
    <div className="relative">
      {label && (
        <span className="block font-bold text-[10px] uppercase mb-1 opacity-70" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
      )}

      {/* Recuadro Trigger / Selector */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-1.5 rounded-xl border transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-2xs"
        style={{
          backgroundColor: 'var(--bg-app)',
          borderColor: isOpen ? 'var(--primary-accent)' : 'var(--border-color)',
          color: 'var(--text-main)',
        }}
        title="Haz clic para personalizar el color o degradado"
      >
        <div
          className="h-7 flex-1 rounded-lg border transition-all relative overflow-hidden shadow-2xs"
          style={{
            background: safeValue.includes('gradient') ? safeValue : (safeValue === 'transparent' ? '#FFFFFF' : safeValue),
            borderColor: 'var(--border-color)',
          }}
        >
          {safeValue === 'transparent' && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-red-500 font-bold">/</div>
          )}
        </div>

        <span
          className="p-1.5 rounded-lg border shrink-0 ml-2 flex items-center justify-center transition-transform hover:scale-105"
          style={{
            backgroundColor: 'var(--primary-accent-light)',
            borderColor: 'var(--primary-accent)',
            color: 'var(--primary-accent)',
          }}
          title="Editar color"
        >
          <Edit3 size={13} />
        </span>
      </button>

      {/* Ventana Flotante Popover */}
      {isOpen && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={handleCancel} />

          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed w-76 p-3 rounded-xl shadow-2xl border z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col justify-between"
            style={{
              top: `${popoverCoords.top}px`,
              left: `${popoverCoords.left}px`,
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)',
            }}
          >
            <div>
              {/* Header del Modal */}
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <span className="font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Palette size={13} style={{ color: 'var(--primary-accent)' }} />
                  Selector de Color
                </span>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="p-1 rounded hover:opacity-80 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={13} />
                </button>
              </div>

              {/* Arriba: Preview de cómo se va a ver el color o degradado (Limpio) */}
              <div
                className="my-2.5 h-14 rounded-lg border shadow-inner transition-all flex items-center justify-center relative overflow-hidden"
                style={{
                  background: mode === 'gradient' ? buildGradientCss() : (solidColor === 'transparent' ? '#FFFFFF' : solidColor),
                  borderColor: 'var(--border-color)',
                }}
              >
                {solidColor === 'transparent' && mode === 'solid' && (
                  <span className="text-red-500 font-bold text-xs uppercase opacity-80">Transparente</span>
                )}
              </div>

              {/* Abajo: Pestañas Sólido vs Degradado */}
              <div
                className="grid grid-cols-2 h-7 p-0.5 rounded-lg border text-[10px] font-bold mb-2.5"
                style={{
                  backgroundColor: 'var(--bg-app)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMode('solid');
                    updateDraft(solidColor);
                  }}
                  className={`flex items-center justify-center gap-1 rounded-md transition-all ${
                    mode === 'solid' ? 'text-white font-extrabold shadow-2xs' : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: mode === 'solid' ? 'var(--primary-accent)' : 'transparent',
                    color: mode === 'solid' ? '#FFFFFF' : 'var(--text-muted)',
                  }}
                >
                  Sólido
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('gradient');
                    updateDraft(buildGradientCss());
                  }}
                  className={`flex items-center justify-center gap-1 rounded-md transition-all ${
                    mode === 'gradient' ? 'text-white font-extrabold shadow-2xs' : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: mode === 'gradient' ? 'var(--primary-accent)' : 'transparent',
                    color: mode === 'gradient' ? '#FFFFFF' : 'var(--text-muted)',
                  }}
                >
                  Degradado
                </button>
              </div>

              {/* CONTENIDO PESTAÑA SÓLIDO */}
              {mode === 'solid' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-1.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                    <input
                      type="color"
                      value={solidColor === 'transparent' ? '#ffffff' : solidColor}
                      onChange={(e) => handleSolidChange(e.target.value)}
                      className="h-7 w-7 rounded cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={solidColor}
                      onChange={(e) => handleSolidChange(e.target.value)}
                      className="w-full bg-transparent outline-none font-mono text-xs uppercase font-bold"
                      style={{ color: 'var(--text-main)' }}
                    />
                    {allowTransparent && (
                      <button
                        type="button"
                        onClick={() => handleSolidChange('transparent')}
                        className="text-[10px] font-extrabold px-2 py-1 rounded-md border shrink-0 transition-colors"
                        style={{
                          backgroundColor: solidColor === 'transparent' ? 'var(--primary-accent-light)' : 'var(--bg-card)',
                          borderColor: 'var(--border-color)',
                          color: solidColor === 'transparent' ? 'var(--primary-accent)' : 'var(--text-main)',
                        }}
                      >
                        Transparente
                      </button>
                    )}
                  </div>

                  {/* Paleta rápida */}
                  <div>
                    <label className="block text-[9px] font-bold mb-1.5 opacity-60">Paleta Rápida</label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {officialPalette.map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => handleSolidChange(col)}
                          className="h-6 w-6 rounded-full border shadow-2xs transition-transform hover:scale-115 cursor-pointer"
                          style={{
                            backgroundColor: col,
                            borderColor: 'var(--border-color)',
                          }}
                          title={col}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENIDO PESTAÑA DEGRADADO */}
              {mode === 'gradient' && (
                <div className="space-y-3">
                  {/* Tipo de Degradado (Select) y Ángulo al lado */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold mb-1 opacity-70">Tipo de Degradado</label>
                      <select
                        value={gradType}
                        onChange={(e) => {
                          const t = e.target.value as any;
                          setGradType(t);
                          updateDraft(buildGradientCss(t, gradAngle, gradStops));
                        }}
                        className="w-full rounded-lg px-2 py-1.5 border outline-none text-xs font-bold"
                        style={{
                          backgroundColor: 'var(--bg-app)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-main)',
                        }}
                      >
                        <option value="linear">Lineal (Linear)</option>
                        <option value="radial">Radial</option>
                        <option value="angle">Ángulo (Angle / Cónico)</option>
                        <option value="reflected">Reflejado (Reflected)</option>
                        <option value="diamond">Diamante (Diamond)</option>
                      </select>
                    </div>

                    <div>
                      {gradType !== 'radial' && gradType !== 'diamond' ? (
                        <>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-bold opacity-70">Ángulo</label>
                            <span className="text-[10px] font-mono font-bold">{gradAngle}°</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={gradAngle}
                            onChange={(e) => {
                              const a = parseInt(e.target.value, 10);
                              setGradAngle(a);
                              updateDraft(buildGradientCss(gradType, a, gradStops));
                            }}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer mt-1"
                            style={{ accentColor: 'var(--primary-accent)', backgroundColor: 'var(--border-color)' }}
                          />
                        </>
                      ) : (
                        <div className="flex flex-col justify-center h-full pt-3">
                          <span className="text-[10px] italic opacity-60 text-center">Centro circular</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lista de colores de degradado */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-bold opacity-70">Colores ({gradStops.length})</label>
                      <button
                        type="button"
                        onClick={addStop}
                        disabled={gradStops.length >= 6}
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded-md border flex items-center gap-1 transition-all hover:scale-105 disabled:opacity-40"
                        style={{
                          backgroundColor: 'var(--primary-accent-light)',
                          borderColor: 'var(--primary-accent)',
                          color: 'var(--primary-accent)',
                        }}
                      >
                        <Plus size={11} />
                        Agregar Color
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {gradStops.map((stop) => {
                        const isSelected = stop.id === activeStopId;
                        return (
                          <div
                            key={stop.id}
                            onClick={() => setActiveStopId(stop.id)}
                            className="flex items-center gap-2 p-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs"
                            style={{
                              backgroundColor: 'var(--bg-app)',
                              borderColor: isSelected ? 'var(--primary-accent)' : 'var(--border-color)',
                              boxShadow: isSelected ? '0 0 0 1px var(--primary-accent)' : undefined,
                            }}
                          >
                            <input
                              type="color"
                              value={stop.color}
                              onChange={(e) => {
                                setActiveStopId(stop.id);
                                updateStop(stop.id, { color: e.target.value });
                              }}
                              className="h-5 w-5 rounded cursor-pointer bg-transparent border-0 shrink-0"
                            />
                            <input
                              type="text"
                              value={stop.color}
                              onChange={(e) => {
                                setActiveStopId(stop.id);
                                updateStop(stop.id, { color: e.target.value });
                              }}
                              className="w-14 bg-transparent outline-none font-mono text-[10px] uppercase font-bold shrink-0"
                              style={{ color: 'var(--text-main)' }}
                            />
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={stop.position}
                              onChange={(e) => {
                                setActiveStopId(stop.id);
                                updateStop(stop.id, { position: parseInt(e.target.value, 10) || 0 });
                              }}
                              className="flex-1 h-1 rounded appearance-none cursor-pointer min-w-0"
                              style={{ accentColor: 'var(--primary-accent)', backgroundColor: 'var(--border-color)' }}
                            />
                            <span className="text-[9px] font-mono font-bold w-6 text-right shrink-0">{stop.position}%</span>
                            {gradStops.length > 2 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeStop(stop.id);
                                }}
                                className="p-1 text-red-500 hover:opacity-80 transition-colors shrink-0"
                                title="Eliminar este color"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Paleta Rápida para seleccionar color base de degradado */}
                  <div>
                    <label className="block text-[9px] font-bold mb-1 opacity-60">Paleta Rápida</label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {officialPalette.map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => {
                            const updated = gradStops.map((s) => (s.id === activeStopId ? { ...s, color: col } : s));
                            setGradStops(updated);
                            updateDraft(buildGradientCss(gradType, gradAngle, updated));
                          }}
                          className="h-5 w-5 rounded-full border shadow-2xs transition-transform hover:scale-115 cursor-pointer"
                          style={{
                            backgroundColor: col,
                            borderColor: 'var(--border-color)',
                          }}
                          title={col}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

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
                onClick={handleApply}
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
