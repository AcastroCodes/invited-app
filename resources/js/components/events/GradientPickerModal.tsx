import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Palette, X, Trash2, Save, History as HistoryIcon, Plus, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';

export interface GradientStop {
    color: string;
    position: number; // 0 to 100
    hidden?: boolean;
}

export interface MeshPoint {
    id: string;
    color: string;
    x: number; // 0-100
    y: number; // 0-100
    radius: number; // 0-100
    opacity: number; // 0-1
    hidden?: boolean;
}

export interface GradientData {
    type: 'linear' | 'radial' | 'reflected' | 'mesh';
    angle: number;
    colors: string[];
    stops?: GradientStop[];
    points?: MeshPoint[];
    radius?: number;
}

interface GradientPreset {
    id: number;
    name: string;
    type: 'linear' | 'radial' | 'reflected' | 'mesh';
    angle: number;
    radius?: number;
    stops?: GradientStop[];
    points?: MeshPoint[];
}

interface GradientPickerModalProps {
    isOpen: boolean;
    initialGradient: GradientData;
    onOpenColorPicker: (initialColor: string, onSelect: (color: string) => void) => void;
    onClose: () => void;
    onSelect: (gradient: GradientData) => void;
}

const GradientPickerModal: React.FC<GradientPickerModalProps> = ({ 
    isOpen, initialGradient, onOpenColorPicker, onClose, onSelect 
}) => {
    const [stops, setStops] = useState<GradientStop[]>([]);
    const [points, setPoints] = useState<MeshPoint[]>([]);
    const [type, setType] = useState<'linear' | 'radial' | 'reflected' | 'mesh'>('linear');
    const [angle, setAngle] = useState(0);
    const [radius, setRadius] = useState(50);
    const [selectedStopIndex, setSelectedStopIndex] = useState<number>(0);
    const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
    const [presets, setPresets] = useState<GradientPreset[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const sliderRef = useRef<HTMLDivElement>(null);
    const meshRef = useRef<HTMLDivElement>(null);

    const prevIsOpen = useRef(isOpen);

    useEffect(() => {
        if (isOpen && !prevIsOpen.current) {
            const gType = initialGradient.type || 'linear';
            setType(gType);
            setAngle(initialGradient.angle || 0);
            setRadius(initialGradient.radius || 50);
            
            if (gType === 'mesh' && initialGradient.points) {
                setPoints(initialGradient.points);
                setSelectedPointId(initialGradient.points[0]?.id || null);
            } else if (gType === 'mesh') {
                const defaultPoints: MeshPoint[] = [
                    { id: '1', color: '#6366f1', x: 0, y: 0, radius: 80, opacity: 1 },
                    { id: '2', color: '#a855f7', x: 100, y: 0, radius: 80, opacity: 1 },
                    { id: '3', color: '#ec4899', x: 0, y: 100, radius: 80, opacity: 1 },
                    { id: '4', color: '#eab308', x: 100, y: 100, radius: 80, opacity: 1 },
                ];
                setPoints(defaultPoints);
                setSelectedPointId('1');
            }

            if (initialGradient.stops && initialGradient.stops.length > 0) {
                setStops([...initialGradient.stops].sort((a, b) => a.position - b.position));
            } else {
                const colors = initialGradient.colors || ['#ffffff', '#000000'];
                const count = colors.length;
                const newStops = colors.map((color, i) => ({
                    color,
                    position: count > 1 ? (i / (count - 1)) * 100 : (i * 100)
                }));
                setStops(newStops);
            }
            setSelectedStopIndex(0);
            
            const savedPresets = localStorage.getItem('dphotos-gradient-presets');
            if (savedPresets) {
                try {
                    setPresets(JSON.parse(savedPresets));
                } catch { setPresets([]); }
            }
        }
        prevIsOpen.current = isOpen;
    }, [isOpen, initialGradient]);

    const meshCSS = useMemo(() => {
        const visiblePoints = points.filter(p => !p.hidden);
        if (visiblePoints.length === 0) return 'transparent';
        return visiblePoints.map(p => `radial-gradient(circle at ${p.x}% ${p.y}%, ${p.color} 0%, transparent ${p.radius}%)`).join(', ');
    }, [points]);

    const gradientCSS = useMemo(() => {
        if (type === 'mesh') return meshCSS;

        const visibleStops = stops.filter(s => !s.hidden);
        if (visibleStops.length === 0) return 'transparent';
        
        const sortedStops = [...visibleStops].sort((a, b) => a.position - b.position);
        
        if (type === 'reflected') {
            const colors = sortedStops.map(s => s.color);
            const reflectedStops = [...colors, ...[...colors].slice(0, -1).reverse()];
            return `linear-gradient(${angle}deg, ${reflectedStops.join(', ')})`;
        }

        if (type === 'radial') {
            const stopsStr = sortedStops.map(s => `${s.color} ${(s.position / 100) * radius}%`).join(', ');
            return `radial-gradient(circle at 50% 50%, ${stopsStr}, transparent ${radius}%)`;
        }

        const stopsStr = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');
        return `linear-gradient(${angle}deg, ${stopsStr})`;
    }, [stops, type, angle, radius, meshCSS]);

    const handleAddPoint = (e: React.MouseEvent) => {
        if (!meshRef.current) return;
        const rect = meshRef.current.getBoundingClientRect();
        const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
        
        const newPoint: MeshPoint = {
            id: Date.now().toString(),
            color: '#3b82f6',
            x, y, radius: 50, opacity: 1
        };
        setPoints([...points, newPoint]);
        setSelectedPointId(newPoint.id);
    };

    const handlePointMouseDown = (id: string) => (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();
        setSelectedPointId(id);
        setIsDragging(true);
        
        const move = (event: MouseEvent | TouchEvent) => {
            if (!meshRef.current) return;
            const rect = meshRef.current.getBoundingClientRect();
            const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
            const clientY = 'touches' in event ? event.touches[0].clientY : (event as MouseEvent).clientY;
            
            const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
            const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
            
            setPoints(prev => prev.map(p => p.id === id ? { ...p, x, y } : p));
        };
        
        const up = () => {
            setIsDragging(false);
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
            window.removeEventListener('touchmove', move);
            window.removeEventListener('touchend', up);
        };
        
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
        window.addEventListener('touchmove', move);
        window.addEventListener('touchend', up);
    };

    const addNewNode = () => {
        if (type === 'mesh') {
            const id = Date.now().toString();
            const newPoint: MeshPoint = {
                id,
                color: '#C5A569',
                x: 50 + (Math.random() * 20 - 10),
                y: 50 + (Math.random() * 20 - 10),
                radius: 50,
                opacity: 1,
                hidden: false
            };
            setPoints([...points, newPoint]);
            setSelectedPointId(id);
        } else {
            const lastPos = stops.length > 0 ? Math.max(...stops.map(s => s.position)) : 0;
            const newPos = lastPos < 90 ? lastPos + 10 : 95;
            const newStop: GradientStop = {
                color: '#C5A569',
                position: newPos,
                hidden: false
            };
            setStops([...stops, newStop]);
            setSelectedStopIndex(stops.length);
        }
    };

    const handleMoveUp = (index: number) => {
        if (index <= 0) return;
        if (type === 'mesh') {
            const newPoints = [...points];
            [newPoints[index - 1], newPoints[index]] = [newPoints[index], newPoints[index - 1]];
            setPoints(newPoints);
        } else {
            const newStops = [...stops];
            [newStops[index - 1], newStops[index]] = [newStops[index], newStops[index - 1]];
            setStops(newStops);
            setSelectedStopIndex(index - 1);
        }
    };

    const handleMoveDown = (index: number) => {
        const list = type === 'mesh' ? points : stops;
        if (index >= list.length - 1) return;
        if (type === 'mesh') {
            const newPoints = [...points];
            [newPoints[index + 1], newPoints[index]] = [newPoints[index], newPoints[index + 1]];
            setPoints(newPoints);
        } else {
            const newStops = [...stops];
            [newStops[index + 1], newStops[index]] = [newStops[index], newStops[index + 1]];
            setStops(newStops);
            setSelectedStopIndex(index + 1);
        }
    };

    const handleToggleVisibility = (index: number) => {
        if (type === 'mesh') {
            setPoints(prev => prev.map((p, i) => i === index ? { ...p, hidden: !p.hidden } : p));
        } else {
            setStops(prev => prev.map((s, i) => i === index ? { ...s, hidden: !s.hidden } : s));
        }
    };

    const handleDeletePoint = (id: string) => {
        if (points.length <= 1) return;
        const newPoints = points.filter(p => p.id !== id);
        setPoints(newPoints);
        setSelectedPointId(newPoints[0]?.id || null);
    };

    const handleDeleteStop = (index: number) => {
        if (stops.length <= 2) return;
        const newStops = stops.filter((_, i) => i !== index);
        setStops(newStops);
        setSelectedStopIndex(Math.max(0, index - 1));
    };

    const handleConfirm = () => {
        const sortedStops = [...stops].sort((a, b) => a.position - b.position);
        onSelect({
            type,
            angle,
            colors: type === 'mesh' ? points.map(p => p.color) : sortedStops.map(s => s.color),
            stops: type === 'mesh' ? undefined : sortedStops,
            points: type === 'mesh' ? points : undefined,
            radius
        });
        onClose();
    };

    const handleSavePreset = () => {
        const newPreset: GradientPreset = {
            id: Date.now(),
            name: `Diseño ${presets.length + 1}`,
            type,
            angle,
            radius,
            stops: type === 'mesh' ? undefined : stops,
            points: type === 'mesh' ? points : undefined
        };
        const updatedPresets = [...presets, newPreset];
        setPresets(updatedPresets);
        localStorage.setItem('dphotos-gradient-presets', JSON.stringify(updatedPresets));
    };

    const deletePreset = (id: number) => {
        const updated = presets.filter(p => p.id !== id);
        setPresets(updated);
        localStorage.setItem('dphotos-gradient-presets', JSON.stringify(updated));
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-3xl max-h-[95vh] bg-slate-900 border border-slate-800 shadow-2xl rounded-xl overflow-hidden flex flex-col text-white">
                
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            <Palette size={18} />
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.1em] text-white">Editor de Degradados Avanzado</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Control Lineal y de Malla</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-all text-slate-400 hover:text-white">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(95vh-160px)]">
                    <div className="grid grid-cols-5 gap-8">
                        
                        {/* Columna Izquierda: Canvas (2/5) */}
                        <div className="col-span-2 space-y-6">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Lienzo de Diseño</label>
                                <div 
                                    ref={meshRef}
                                    onDoubleClick={type === 'mesh' ? handleAddPoint : undefined}
                                    className={`w-full aspect-square rounded-xl border border-slate-800 shadow-inner overflow-hidden relative ${type === 'mesh' ? 'cursor-crosshair' : ''}`}
                                    style={{ background: type === 'mesh' ? meshCSS : gradientCSS }}
                                >
                                    {type === 'mesh' && points.map((p) => (
                                        <div 
                                            key={p.id}
                                            onMouseDown={handlePointMouseDown(p.id)}
                                            onTouchStart={handlePointMouseDown(p.id)}
                                            className={`absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 shadow-2xl cursor-move ${(isDragging && selectedPointId === p.id) ? '' : 'transition-transform'} ${selectedPointId === p.id ? 'border-white ring-4 ring-indigo-500/40 scale-125 z-20' : 'border-white/50 z-10 hover:scale-110'}`}
                                            style={{ left: `${p.x}%`, top: `${p.y}%`, backgroundColor: p.color }}
                                        >
                                            <div className="absolute inset-0 rounded-full border border-black/10" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Presets */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <HistoryIcon size={12} className="text-indigo-400" />
                                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] italic">Mis Diseños</label>
                                    </div>
                                    <button 
                                        onClick={handleSavePreset}
                                        className="text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all cursor-pointer"
                                    >
                                        <Save size={10} /> Guardar
                                    </button>
                                </div>

                                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 min-h-[100px] max-h-[160px] overflow-y-auto shadow-inner">
                                    <div className="grid grid-cols-4 gap-3">
                                        {presets.map((preset) => (
                                            <div key={preset.id} className="group relative">
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        if (preset.type === 'mesh' && preset.points) {
                                                            setPoints(preset.points);
                                                            setSelectedPointId(preset.points[0]?.id || null);
                                                        } else if (preset.stops) {
                                                            setStops(preset.stops);
                                                            setSelectedStopIndex(0);
                                                        }
                                                        setType(preset.type);
                                                        setAngle(preset.angle);
                                                        if (preset.radius) setRadius(preset.radius);
                                                    }}
                                                    className={`w-full aspect-square rounded-lg border border-slate-800 shadow-sm overflow-hidden hover:scale-105 transition-all cursor-pointer ${type === preset.type ? 'ring-2 ring-indigo-500 shadow-lg' : ''}`}
                                                    style={{ background: preset.type === 'mesh' ? 
                                                        preset.points?.map(p => `radial-gradient(circle at ${p.x}% ${p.y}%, ${p.color} 0%, transparent ${p.radius}%)`).join(', ') : 
                                                        preset.type === 'radial' ?
                                                        `radial-gradient(circle at 50% 50%, ${preset.stops?.map(s => `${s.color} ${(s.position / 100) * (preset.radius || 50)}%`).join(', ')}, transparent ${preset.radius || 50}%)` :
                                                        `linear-gradient(${preset.angle}deg, ${preset.stops?.map(s => `${s.color} ${s.position}%`).join(', ')})` 
                                                    }}
                                                />
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); deletePreset(preset.id); }}
                                                    className="absolute -top-1 -right-1 w-5 h-5 bg-slate-900 border border-slate-700 shadow-md rounded-full text-red-500 scale-0 group-hover:scale-100 transition-transform flex items-center justify-center hover:bg-red-500 hover:text-white z-40"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: Configuración */}
                        <div className="col-span-3 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex p-0.5 bg-slate-950 rounded-xl border border-slate-800">
                                        {(['linear', 'reflected', 'radial', 'mesh'] as const).map((t) => (
                                            <button 
                                                key={t}
                                                onClick={() => setType(t)}
                                                className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer ${type === t ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                            >
                                                {t === 'linear' ? 'Lineal' : t === 'reflected' ? 'Reflejado' : t === 'radial' ? 'Radial' : 'Malla'}
                                            </button>
                                        ))}
                                    </div>

                                    <button 
                                        onClick={addNewNode}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-500 transition-all cursor-pointer"
                                    >
                                        <Plus size={10} />
                                        <span className="text-[9px] font-black uppercase tracking-wider">Añadir</span>
                                    </button>
                                </div>

                                {/* Sliders de Ajuste */}
                                {(type === 'linear' || type === 'reflected' || type === 'radial') && (
                                    <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 flex items-center gap-4">
                                        {(type === 'linear' || type === 'reflected') && (
                                            <div className="flex-1 flex items-center gap-4">
                                                <div className="flex items-baseline gap-2 shrink-0">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Ángulo</span>
                                                    <span className="text-[11px] font-black text-indigo-400 font-mono">{angle}°</span>
                                                </div>
                                                <input 
                                                    type="range" min="0" max="360" step="1"
                                                    value={angle}
                                                    onChange={(e) => setAngle(parseInt(e.target.value))}
                                                    className="flex-1 h-1.5 bg-slate-800 rounded-full appearance-none accent-indigo-500 cursor-pointer"
                                                />
                                            </div>
                                        )}
                                        {type === 'radial' && (
                                            <div className="flex-1 flex items-center gap-4">
                                                <div className="flex items-baseline gap-2 shrink-0">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Radio</span>
                                                    <span className="text-[11px] font-black text-indigo-400 font-mono">{radius}%</span>
                                                </div>
                                                <input 
                                                    type="range" min="0" max="200" step="1"
                                                    value={radius}
                                                    onChange={(e) => setRadius(parseInt(e.target.value))}
                                                    className="flex-1 h-1.5 bg-slate-800 rounded-full appearance-none accent-indigo-500 cursor-pointer"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Lista de Nodos */}
                                <div className="bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                                    <div className="max-h-[300px] overflow-y-auto p-1.5 space-y-1.5">
                                        {(type === 'mesh' ? points : stops).map((node, idx) => {
                                            const isSelected = type === 'mesh' ? selectedPointId === (node as MeshPoint).id : selectedStopIndex === idx;
                                            const id = type === 'mesh' ? (node as MeshPoint).id : idx.toString();
                                            
                                            return (
                                                <div 
                                                    key={id}
                                                    onClick={() => type === 'mesh' ? setSelectedPointId((node as MeshPoint).id) : setSelectedStopIndex(idx)}
                                                    className={`group flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${isSelected ? 'bg-slate-800 border-indigo-500/50 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-800/40 opacity-80 hover:opacity-100'}`}
                                                >
                                                    <div className="flex flex-col items-center gap-0.5 opacity-60 pr-1.5 border-r border-slate-700">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleMoveUp(idx); }}
                                                            className="p-0.5 hover:text-indigo-400 transition-colors disabled:opacity-0"
                                                            disabled={idx === 0}
                                                        >
                                                            <ChevronUp size={10} />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleToggleVisibility(idx); }}
                                                            className={`p-0.5 transition-colors ${node.hidden ? 'text-red-500' : 'hover:text-indigo-400'}`}
                                                        >
                                                            {node.hidden ? <EyeOff size={10} /> : <Eye size={10} />}
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleMoveDown(idx); }}
                                                            className="p-0.5 hover:text-indigo-400 transition-colors disabled:opacity-0"
                                                            disabled={idx === (type === 'mesh' ? points.length : stops.length) - 1}
                                                        >
                                                            <ChevronDown size={10} />
                                                        </button>
                                                    </div>

                                                    <div className="flex-1 grid grid-cols-5 gap-3 px-1">
                                                        <div className="col-span-3">
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onOpenColorPicker(node.color, (newColor) => {
                                                                        if (type === 'mesh') {
                                                                            setPoints(prev => prev.map(p => p.id === (node as MeshPoint).id ? { ...p, color: newColor } : p));
                                                                        } else {
                                                                            setStops(prev => prev.map((s, i) => i === idx ? { ...s, color: newColor } : s));
                                                                        }
                                                                    });
                                                                }}
                                                                className="w-full h-8 bg-slate-900 border border-slate-700 rounded flex items-center justify-between px-2 hover:border-indigo-500 transition-all shadow-sm group/btn cursor-pointer"
                                                            >
                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                    <div className="w-3.5 h-3.5 rounded-sm border border-black/10 flex-shrink-0" style={{ backgroundColor: node.color }} />
                                                                    <span className="text-[8px] font-mono font-black uppercase truncate text-slate-200 group-hover/btn:text-indigo-400">{node.color}</span>
                                                                </div>
                                                                <Palette size={10} className="text-slate-400 group-hover/btn:text-indigo-400" />
                                                            </button>
                                                        </div>

                                                        <div className="col-span-2 relative flex flex-col justify-center">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-[7px] font-black uppercase text-slate-400 tracking-tighter">{type === 'mesh' ? 'Ext' : 'Pos'}</span>
                                                                <span className="text-[8px] font-mono font-black text-indigo-400">{Math.round(type === 'mesh' ? (node as MeshPoint).radius : (node as GradientStop).position)}%</span>
                                                            </div>
                                                            <input 
                                                                type="range" 
                                                                min={type === 'mesh' ? 10 : 0} 
                                                                max={type === 'mesh' ? 200 : 100} 
                                                                value={type === 'mesh' ? (node as MeshPoint).radius : (node as GradientStop).position} 
                                                                onClick={(e) => e.stopPropagation()}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value);
                                                                    if (type === 'mesh') {
                                                                        setPoints(prev => prev.map(p => p.id === (node as MeshPoint).id ? { ...p, radius: val } : p));
                                                                    } else {
                                                                        setStops(prev => prev.map((s, i) => i === idx ? { ...s, position: val } : s));
                                                                    }
                                                                }}
                                                                className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                if (type === 'mesh') {
                                                                    handleDeletePoint((node as MeshPoint).id);
                                                                } else {
                                                                    handleDeleteStop(idx);
                                                                }
                                                            }}
                                                            disabled={type === 'mesh' ? points.length <= 1 : stops.length <= 2}
                                                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-all cursor-pointer disabled:opacity-0"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        className="py-2.5 px-6 bg-slate-800 border border-slate-700 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                    >
                        Descartar
                    </button>
                    <button 
                        onClick={handleConfirm} 
                        className="py-2.5 px-8 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-indigo-500 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                        Aplicar Diseño
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default GradientPickerModal;
