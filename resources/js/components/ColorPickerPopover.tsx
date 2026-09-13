import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Palette, X, Plus, Edit3, Bookmark, Check } from 'lucide-react';

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
  allowGradient?: boolean;
}

const COLOR_STORAGE_KEY = 'invited_saved_colors';

export const ColorPickerPopover: React.FC<ColorPickerPopoverProps> = ({
  value = '#212121',
  onChange,
  label,
  allowTransparent = false,
  allowGradient = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popoverCoords, setPopoverCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [justSaved, setJustSaved] = useState(false);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

  // Cargar colores guardados de localStorage
  const [savedColors, setSavedColors] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(COLOR_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const saveColorsToStorage = (colors: string[]) => {
    setSavedColors(colors);
    try {
      localStorage.setItem(COLOR_STORAGE_KEY, JSON.stringify(colors));
    } catch (e) {
      console.error('Error saving colors to localStorage:', e);
    }
  };

  const safeValue = typeof value === 'string' ? value : '#212121';

  // Mode: 'solid' or 'gradient'
  const isGradientValue = allowGradient && safeValue.includes('gradient');
  const [mode, setMode] = useState<'solid' | 'gradient'>(isGradientValue ? 'gradient' : 'solid');

  // Helper to extract first solid color from a gradient string if needed
  const getSolidFallback = (val: string) => {
    if (!val.includes('gradient')) return val;
    const match = val.match(/(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\))/);
    return match ? match[1] : '#212121';
  };

  // Solid State
  const [solidColor, setSolidColor] = useState(
    safeValue.includes('gradient') ? getSolidFallback(safeValue) : safeValue
  );

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
    if (allowGradient && curVal.includes('gradient')) {
      setMode('gradient');
      let type: PhotoshopGradientType = 'linear';
      if (curVal.includes('/*reflected*/') || curVal.includes('repeating-linear-gradient')) type = 'reflected';
      else if (curVal.includes('/*diamond*/')) type = 'diamond';
      else if (curVal.includes('conic-gradient')) type = 'angle';
      else if (curVal.includes('radial-gradient')) type = 'radial';
      else type = 'linear';
      setGradType(type);

      // Parse angle if linear, reflected or conic
      const angleMatch = curVal.match(/(\d+)deg/);
      if (angleMatch) {
        setGradAngle(parseInt(angleMatch[1], 10));
      }

      // Parse color stops (#HEX or rgb/rgba or name + position %)
      const colorStopMatches = Array.from(
        curVal.matchAll(/(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\)|[a-zA-Z]+)\s+(\d+)%/g)
      );

      if (colorStopMatches.length >= 2) {
        const parsedStops: GradientStop[] = colorStopMatches.map((m, idx) => ({
          id: String(idx + 1),
          color: m[1],
          position: parseInt(m[2], 10),
        }));
        setGradStops(parsedStops);
      }
    } else {
      setMode('solid');
      setSolidColor(getSolidFallback(curVal));
    }
  }, [value, isOpen, allowGradient]);

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

  const handleSaveColor = () => {
    const colorToSave = mode === 'gradient' ? buildGradientCss() : solidColor;

    if (!savedColors.includes(colorToSave)) {
      const updated = [colorToSave, ...savedColors];
      saveColorsToStorage(updated);
    }

    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1200);
  };

  const confirmDeleteColor = () => {
    if (deleteConfirmIndex !== null) {
      const updated = savedColors.filter((_, i) => i !== deleteConfirmIndex);
      saveColorsToStorage(updated);
      setDeleteConfirmIndex(null);
    }
  };

  // Backup initial value before opening popover to allow reverting on Cancel
  const [initialValue, setInitialValue] = useState(safeValue);

  useEffect(() => {
    if (isOpen) {
      setInitialValue(safeValue);
    }
  }, [isOpen]);

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

  // Cancel changes - revert parent element to initialValue
  const handleCancel = () => {
    onChange(initialValue);
    setDraftValue(initialValue);
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

  const officialPalette = ['transparent', '#E07A5F', '#F2CC8F', '#212121', '#FFFFFF', '#52B788', '#E63946', '#3B82F6', '#8B5CF6', '#757575'];

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
        className="w-full flex items-center justify-between p-1 rounded-lg border transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-2xs"
        style={{
          backgroundColor: 'var(--bg-app)',
          borderColor: isOpen ? 'var(--primary-accent)' : 'var(--border-color)',
          color: 'var(--text-main)',
        }}
        title="Haz clic para personalizar el color o degradado"
      >
        <div
          className="h-6 flex-1 rounded-md border transition-all relative overflow-hidden shadow-2xs"
          style={{
            background: safeValue.includes('gradient') ? safeValue : (safeValue === 'transparent' ? '#FFFFFF' : safeValue),
            borderColor: 'var(--border-color)',
          }}
        >
          {safeValue === 'transparent' && (
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,#ef4444_45%,#ef4444_55%,transparent_55%)]" />
          )}
        </div>

        <span
          className="p-1 rounded-md border shrink-0 ml-1.5 flex items-center justify-center transition-transform hover:scale-105"
          style={{
            backgroundColor: 'var(--primary-accent-light)',
            borderColor: 'var(--primary-accent)',
            color: 'var(--primary-accent)',
          }}
          title="Editar color"
        >
          <Edit3 size={11} />
        </span>
      </button>

      {/* Ventana Flotante Popover */}
      {isOpen && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={handleCancel} />

          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed w-64 p-2.5 rounded-xl shadow-2xl border z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col justify-between"
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

              {/* Preview Box con Botón de Guardar al lado derecho */}
              <div className="my-2 flex items-center gap-1.5">
                <div
                  className="h-10 flex-1 rounded-md border shadow-inner transition-all flex items-center justify-center relative overflow-hidden shrink-0"
                  style={{
                    background: mode === 'gradient' ? buildGradientCss() : (solidColor === 'transparent' ? '#FFFFFF' : solidColor),
                    borderColor: 'var(--border-color)',
                  }}
                >
                  {solidColor === 'transparent' && mode === 'solid' && (
                    <span className="text-red-500 font-bold text-[10px] uppercase opacity-80">Transparente</span>
                  )}
                </div>

                {/* Botón de Guardar Color al Lado Derecho */}
                <button
                  type="button"
                  onClick={handleSaveColor}
                  className="self-stretch w-7 rounded-md border flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                  style={{
                    backgroundColor: justSaved ? 'var(--primary-accent)' : 'var(--bg-app)',
                    borderColor: 'var(--border-color)',
                    color: justSaved ? '#FFFFFF' : 'var(--primary-accent)',
                  }}
                  title={justSaved ? '¡Color Guardado!' : 'Guardar este color'}
                >
                  {justSaved ? (
                    <Check size={14} className="animate-in zoom-in-50 duration-150" />
                  ) : (
                    <Bookmark size={14} />
                  )}
                </button>
              </div>

              {/* Abajo: Pestañas Sólido vs Degradado (solo si allowGradient es true) */}
              {allowGradient && (
                <div
                  className="grid grid-cols-2 h-6 p-0.5 rounded-md border text-[9px] font-bold mb-2"
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
                    className={`flex items-center justify-center gap-1 rounded transition-all ${
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
                    className={`flex items-center justify-center gap-1 rounded transition-all ${
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
              )}

              {/* CONTENIDO PESTAÑA SÓLIDO */}
              {mode === 'solid' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 p-1 rounded-md border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                    <input
                      type="color"
                      value={solidColor === 'transparent' ? '#ffffff' : solidColor}
                      onChange={(e) => handleSolidChange(e.target.value)}
                      className="h-5 w-5 rounded cursor-pointer bg-transparent border-0 shrink-0 p-0"
                    />
                    <input
                      type="text"
                      value={solidColor}
                      onChange={(e) => handleSolidChange(e.target.value)}
                      className="w-full bg-transparent outline-none font-mono text-[11px] uppercase font-bold"
                      style={{ color: 'var(--text-main)' }}
                    />
                    {allowTransparent && (
                      <button
                        type="button"
                        onClick={() => handleSolidChange('transparent')}
                        className="text-[9px] font-extrabold px-1.5 py-0.5 rounded border shrink-0 transition-colors"
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
                    <label className="block text-[9px] font-bold mb-1 opacity-60">Paleta Rápida</label>
                    <div className="flex items-center gap-1 flex-wrap">
                      {officialPalette.map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => handleSolidChange(col)}
                          className="h-5 w-5 rounded-full border shadow-2xs transition-transform hover:scale-115 cursor-pointer relative overflow-hidden flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: col === 'transparent' ? '#FFFFFF' : col,
                            borderColor: 'var(--border-color)',
                          }}
                          title={col === 'transparent' ? 'Transparente' : col}
                        >
                          {col === 'transparent' && (
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,#ef4444_45%,#ef4444_55%,transparent_55%)]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENIDO PESTAÑA DEGRADADO */}
              {mode === 'gradient' && (
                <div className="space-y-2">
                  {/* Tipo de Degradado (Select) y Ángulo al lado */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="block text-[9px] font-bold mb-0.5 opacity-70">Tipo de Degradado</label>
                      <select
                        value={gradType}
                        onChange={(e) => {
                          const newType = e.target.value as any;
                          setGradType(newType);
                          updateDraft(buildGradientCss(newType, gradAngle, gradStops));
                        }}
                        className="w-full text-[10px] p-1 h-6 rounded border outline-none font-bold cursor-pointer transition-colors"
                        style={{
                          backgroundColor: 'var(--bg-app)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-main)',
                        }}
                      >
                        <option value="linear" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>Lineal</option>
                        <option value="radial" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>Radial</option>
                        <option value="angle" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>Ángulo</option>
                        <option value="reflected" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>Reflejado</option>
                        <option value="diamond" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>Diamante</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between text-[9px] font-bold mb-0.5 opacity-70">
                        <span>Ángulo</span>
                        <span>{gradAngle}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={gradAngle}
                        onChange={(e) => {
                          const newAng = parseInt(e.target.value, 10);
                          setGradAngle(newAng);
                          updateDraft(buildGradientCss(gradType, newAng, gradStops));
                        }}
                        className="w-full h-1.5 accent-emerald-500 cursor-pointer mt-1"
                      />
                    </div>
                  </div>

                  {/* Visual Gradient Bar Preview & Interactive Stop List */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[9px] font-bold opacity-70">Puntos de Color ({gradStops.length})</label>
                      <button
                        type="button"
                        onClick={addStop}
                        disabled={gradStops.length >= 6}
                        className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border transition-opacity disabled:opacity-40"
                        style={{
                          backgroundColor: 'var(--primary-accent-light)',
                          borderColor: 'var(--primary-accent)',
                          color: 'var(--primary-accent)',
                        }}
                      >
                        <Plus size={10} /> Agregar Punto
                      </button>
                    </div>

                    <div
                      className="h-4.5 w-full rounded border relative overflow-hidden shadow-inner"
                      style={{
                        background: buildGradientCss(),
                        borderColor: 'var(--border-color)',
                      }}
                    />

                    {/* Gradient Stop Items with Color, Hex, Position Slider, Delete */}
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-0.5">
                      {gradStops.map((stop) => {
                        const isSelected = stop.id === activeStopId;
                        return (
                          <div
                            key={stop.id}
                            onClick={() => setActiveStopId(stop.id)}
                            className={`flex items-center gap-1.5 p-1 rounded border transition-all cursor-pointer ${
                              isSelected ? 'ring-1 ring-emerald-500 shadow-2xs' : 'opacity-90'
                            }`}
                            style={{
                              backgroundColor: 'var(--bg-app)',
                              borderColor: isSelected ? 'var(--primary-accent)' : 'var(--border-color)',
                            }}
                          >
                            <input
                              type="color"
                              value={stop.color.startsWith('#') ? stop.color : '#E07A5F'}
                              onChange={(e) => {
                                setActiveStopId(stop.id);
                                updateStop(stop.id, { color: e.target.value });
                              }}
                              className="h-4.5 w-4.5 rounded cursor-pointer bg-transparent border-0 shrink-0 p-0"
                            />
                            <input
                              type="text"
                              value={stop.color}
                              onChange={(e) => {
                                setActiveStopId(stop.id);
                                updateStop(stop.id, { color: e.target.value });
                              }}
                              className="w-12 bg-transparent outline-none font-mono text-[9px] uppercase font-bold shrink-0"
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
                              className="w-full h-1.5 rounded appearance-none cursor-pointer min-w-0 accent-emerald-500"
                            />
                            <span className="text-[9px] font-mono font-bold w-6 text-right shrink-0">{stop.position}%</span>
                            {gradStops.length > 2 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeStop(stop.id);
                                }}
                                className="text-red-500 hover:text-red-700 p-0.5 shrink-0"
                                title="Eliminar este punto"
                              >
                                <X size={9} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Paleta Rápida para seleccionar color base de degradado */}
                  <div>
                    <label className="block text-[9px] font-bold mb-0.5 opacity-60">Paleta Rápida</label>
                    <div className="flex items-center gap-1 flex-wrap">
                      {officialPalette.map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => {
                            const updated = gradStops.map((s) => (s.id === activeStopId ? { ...s, color: col } : s));
                            setGradStops(updated);
                            updateDraft(buildGradientCss(gradType, gradAngle, updated));
                          }}
                          className="h-4.5 w-4.5 rounded-full border shadow-2xs transition-transform hover:scale-115 cursor-pointer relative overflow-hidden flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: col === 'transparent' ? '#FFFFFF' : col,
                            borderColor: 'var(--border-color)',
                          }}
                          title={col === 'transparent' ? 'Transparente' : col}
                        >
                          {col === 'transparent' && (
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,#ef4444_45%,#ef4444_55%,transparent_55%)]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* LISTA DE COLORES GUARDADOS (Abajo de Paleta Rápida) */}
              <div className="mt-2 pt-1.5 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-extrabold uppercase opacity-70 tracking-wider">
                    Colores Guardados
                  </span>
                  <span className="text-[8px] opacity-50 font-bold">{savedColors.length}</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 min-h-[28px] max-w-full no-scrollbar scroll-smooth">
                  {(() => {
                    const displayColors = allowGradient ? savedColors : savedColors.filter((c: string) => !c.includes('gradient'));
                    if (displayColors.length === 0) {
                      return (
                        <span className="text-[9px] italic opacity-40 font-medium py-0.5">
                          Sin colores guardados
                        </span>
                      );
                    }
                    return displayColors.map((col, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          updateDraft(col);
                          onChange(col);
                          if (col.includes('gradient')) {
                            setMode('gradient');
                          } else {
                            setMode('solid');
                            setSolidColor(col);
                          }
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmIndex(idx);
                        }}
                        className="group/item relative shrink-0 w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 shadow-2xs overflow-hidden"
                        title="Un clic para aplicar | Doble clic para eliminar"
                        style={{
                          background: col.includes('gradient') ? col : (col === 'transparent' ? '#FFFFFF' : col),
                          borderColor: 'var(--border-color)',
                        }}
                      >
                        {col === 'transparent' && (
                          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,#ef4444_45%,#ef4444_55%,transparent_55%)]" />
                        )}
                      </button>
                    ));
                  })()}
                </div>
              </div>
            </div>

            {/* Modal de confirmación para eliminar color */}
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
                    ¿Deseas eliminar este color guardado?
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
                      onClick={confirmDeleteColor}
                      className="px-2.5 py-1 rounded text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer shadow-2xs"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* BOTONES ABAJO A LA DERECHA: CANCELAR Y AGREGAR */}
            <div className="flex items-center justify-end gap-1 pt-2 mt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <button
                type="button"
                onClick={handleCancel}
                className="px-2 py-0.5 rounded border text-[10px] font-semibold transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
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
                className="px-2.5 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs transition-all hover:opacity-90 cursor-pointer"
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
