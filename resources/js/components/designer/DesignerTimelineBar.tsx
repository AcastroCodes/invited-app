import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Film,
  ChevronUp,
  ChevronDown,
  Type,
  Image as ImageIcon,
  Video,
  Square,
  Sparkles,
  Clock,
  Zap,
  Waves,
  Layers,
  Circle,
  Heart,
  Star,
  Box,
  Music,
  Smartphone,
  Puzzle,
} from 'lucide-react';
import { CanvasElement } from '../../types/designerTypes';

interface DesignerTimelineBarProps {
  elements: CanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  totalDuration: number;
  setTotalDuration: (duration: number) => void;
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DesignerTimelineBar: React.FC<DesignerTimelineBarProps> = ({
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  totalDuration,
  setTotalDuration,
  isExpanded,
  setIsExpanded,
}) => {
  const rulerRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Playback timer effect
  useEffect(() => {
    let animFrame: number;
    let lastTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (lastTimestamp !== null) {
        const deltaSeconds = (timestamp - lastTimestamp) / 1000;
        setCurrentTime((prevTime) => {
          const nextTime = prevTime + deltaSeconds;
          if (nextTime >= totalDuration) {
            setIsPlaying(false);
            return 0; // Rewind at end
          }
          return nextTime;
        });
      }
      lastTimestamp = timestamp;
      if (isPlaying) {
        animFrame = requestAnimationFrame(step);
      }
    };

    if (isPlaying) {
      animFrame = requestAnimationFrame(step);
    } else {
      lastTimestamp = null;
    }

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [isPlaying, totalDuration, setCurrentTime, setIsPlaying]);

  // Handle Scrubbing on Ruler
  const handleScrub = (clientX: number) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = offsetX / rect.width;
    const newTime = Math.round(percentage * totalDuration * 10) / 10;
    setCurrentTime(newTime);
  };

  const handlePointerDownRuler = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    handleScrub(e.clientX);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isScrubbing) {
        handleScrub(e.clientX);
      }
    };

    const handlePointerUp = () => {
      if (isScrubbing) {
        setIsScrubbing(false);
      }
    };

    if (isScrubbing) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isScrubbing, totalDuration]);

  // Helper to get element icon matching the Capas section
  const getElementIcon = (el: CanvasElement) => {
    switch (el.type) {
      case 'text':
        return <Type size={12} className="shrink-0" style={{ color: 'var(--primary-accent)' }} />;
      case 'image':
        return <ImageIcon size={12} className="shrink-0 text-blue-500" />;
      case 'video':
        return <Video size={12} className="shrink-0 text-purple-500" />;
      case 'shape':
        return <Square size={12} className="shrink-0 text-emerald-500" />;
      case '3d':
        return <Box size={12} className="shrink-0 text-amber-500" />;
      case 'audio':
        return <Music size={12} className="shrink-0 text-rose-500" />;
      case 'button':
        return <Smartphone size={12} className="shrink-0" style={{ color: 'var(--success)' }} />;
      case 'complement':
        return <Puzzle size={12} className="shrink-0 text-indigo-500" />;
      default:
        return <Layers size={12} className="shrink-0 text-gray-400" />;
    }
  };

  // Format seconds to 00:00.0s
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = (sec % 60).toFixed(1);
    return `${mins < 10 ? '0' : ''}${mins}:${parseFloat(secs) < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div
      className="relative w-full z-30 transition-all duration-300 pointer-events-auto rounded-2xl border shadow-xl backdrop-blur-md overflow-hidden flex flex-col shrink-0"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-main)',
      }}
    >
      {/* Top Header / Bar Control Compacta */}
      <div className="flex items-center justify-between px-3 py-2 border-b select-none" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all cursor-pointer shadow-xs border"
            style={{
              backgroundColor: isPlaying ? 'var(--primary-accent)' : 'var(--bg-app)',
              borderColor: 'var(--border-color)',
              color: isPlaying ? '#ffffff' : 'var(--text-main)',
            }}
            title={isPlaying ? 'Pausar reproducción' : 'Reproducir animación'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>

          {/* Rebobinar a 0s */}
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setCurrentTime(0);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5 border"
            style={{
              backgroundColor: 'var(--bg-app)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-muted)',
            }}
            title="Rebobinar al inicio (0.0s)"
          >
            <RotateCcw size={13} />
          </button>

          {/* Contador de Tiempo */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
            <Clock size={12} style={{ color: 'var(--primary-accent)' }} />
            <span>{formatTime(currentTime)}</span>
            <span className="opacity-40">/</span>
            <span className="opacity-70">{formatTime(totalDuration)}</span>
          </div>

          {/* Selector de Duración Total de Escena */}
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-extrabold uppercase opacity-80 pl-2">
            <span>Duración:</span>
            <select
              value={totalDuration}
              onChange={(e) => setTotalDuration(Number(e.target.value))}
              className="bg-transparent border rounded-md px-1.5 py-0.5 text-xs font-bold font-mono outline-none cursor-pointer"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
            >
              <option value={3}>3s</option>
              <option value={5}>5s</option>
              <option value={8}>8s</option>
              <option value={10}>10s</option>
              <option value={15}>15s</option>
              <option value={20}>20s</option>
            </select>
          </div>
        </div>

        {/* Right Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase border transition-all cursor-pointer"
            style={{
              backgroundColor: isExpanded ? 'var(--primary-accent-light)' : 'var(--bg-app)',
              borderColor: isExpanded ? 'var(--primary-accent)' : 'var(--border-color)',
              color: isExpanded ? 'var(--primary-accent)' : 'var(--text-main)',
            }}
          >
            <Film size={13} />
            <span className="hidden md:inline">Línea de Tiempo</span>
            {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded Multitrack Timeline Panel */}
      {isExpanded && (
        <div className="flex flex-col max-h-56 overflow-y-auto select-none p-2 space-y-1">
          {/* Regla de Tiempo (Ruler / Scrubber) */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-36 shrink-0 text-[9px] font-extrabold uppercase tracking-wider pl-1" style={{ color: 'var(--text-muted)' }}>
              Capa / Tiempo
            </div>
            <div
              ref={rulerRef}
              onPointerDown={handlePointerDownRuler}
              className="flex-1 h-6 relative bg-black/10 dark:bg-white/10 rounded-md cursor-pointer overflow-hidden flex items-center"
            >
              {/* Marcas de segundos */}
              {Array.from({ length: Math.floor(totalDuration) + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l flex items-end pb-0.5 pl-0.5 text-[8px] font-mono opacity-50 pointer-events-none"
                  style={{
                    left: `${(i / totalDuration) * 100}%`,
                    borderColor: 'var(--border-color)',
                  }}
                >
                  {i}s
                </div>
              ))}

              {/* Indicador Rojo del Cabezal de Tiempo (Scrubber) */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                style={{ left: `${(currentTime / totalDuration) * 100}%` }}
              >
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full -ml-1 -top-1 absolute shadow-sm" />
              </div>
            </div>
          </div>

          {/* Listado de Pistas por Elemento (Orden directo 1:1 coincidente con el panel de Capas) */}
          {elements.length === 0 ? (
            <div className="text-center py-4 text-xs font-bold opacity-60" style={{ color: 'var(--text-muted)' }}>
              No hay elementos en el lienzo para animar.
            </div>
          ) : (
            elements.reduce((acc: any[], currentEl) => {
              acc.push({ ...currentEl, _isChild: false });
              if (currentEl.isComponentParent && currentEl.children) {
                currentEl.children.forEach((child: any) => acc.push({ ...child, _isChild: true }));
              }
              return acc;
            }, []).map((rawEl: any) => {
              const el = rawEl as CanvasElement;
              const isChild = rawEl._isChild;
              const isSelected = selectedElementId === el.id;
              const hasIn = !!((el.animInType && el.animInType !== 'none') || (el.animIn && el.animIn !== 'none'));
              const hasIdle = !!((el.animIdleType && el.animIdleType !== 'none') || (el.animIdle && el.animIdle !== 'none'));
              const hasOut = !!((el.animOutType && el.animOutType !== 'none') || (el.animOut && el.animOut !== 'none'));
              const hasAnyAnim = hasIn || hasIdle || hasOut;

              const startSec = el.animStartTime ?? 0;
              const inDuration = hasIn ? (el.animDuration ?? 0.8) : 0;
              const idleDuration = hasIdle ? (el.animIdleDuration ?? 3.0) : 0;
              const outDuration = hasOut ? (el.animOutDuration ?? 0.8) : 0;

              const totalAnimDuration = inDuration + idleDuration + outDuration;

              const inStartPct = Math.max(0, (startSec / totalDuration) * 100);
              const totalWidthPct = Math.min(100 - inStartPct, (totalAnimDuration / totalDuration) * 100);

              const inSharePct = totalAnimDuration > 0 ? (inDuration / totalAnimDuration) * 100 : 0;
              const idleSharePct = totalAnimDuration > 0 ? (idleDuration / totalAnimDuration) * 100 : 0;
              const outSharePct = totalAnimDuration > 0 ? (outDuration / totalAnimDuration) * 100 : 0;

              // Handlers para arrastrar y cambiar tamaño estilo editor de video profesional (Premiere / CapCut)
              const handleStartDragTrack = (e: React.PointerEvent, type: 'move' | 'resizeIn' | 'resizeIdle' | 'resizeOut') => {
                e.stopPropagation();
                e.preventDefault();
                onSelectElement(el.id);

                const currentTarget = e.currentTarget as HTMLElement;
                try {
                  currentTarget.setPointerCapture(e.pointerId);
                } catch {}

                const trackElement = (currentTarget.closest('.track-container') as HTMLElement) || rulerRef.current;
                if (!trackElement) return;

                const trackRect = trackElement.getBoundingClientRect();
                const startX = e.clientX;
                const initialStartSec = el.animStartTime ?? 0;
                const initialInDuration = el.animDuration ?? 0.8;
                const initialIdleDuration = el.animIdleDuration ?? 3.0;
                const initialOutDuration = el.animOutDuration ?? 0.8;

                const handlePointerMove = (moveEvent: PointerEvent) => {
                  const deltaX = moveEvent.clientX - startX;
                  const deltaSec = (deltaX / trackRect.width) * totalDuration;

                  if (type === 'move') {
                    const newStartTime = Math.max(0, Math.min(totalDuration - 0.1, Math.round((initialStartSec + deltaSec) * 10) / 10));
                    onUpdateElement(el.id, { animStartTime: newStartTime });
                  } else if (type === 'resizeIn') {
                    const newDuration = Math.max(0.1, Math.min(totalDuration - initialStartSec, Math.round((initialInDuration + deltaSec) * 10) / 10));
                    onUpdateElement(el.id, { animDuration: newDuration });
                  } else if (type === 'resizeIdle') {
                    const newIdleDuration = Math.max(0.2, Math.min(totalDuration - initialStartSec, Math.round((initialIdleDuration + deltaSec) * 10) / 10));
                    onUpdateElement(el.id, { animIdleDuration: newIdleDuration });
                  } else if (type === 'resizeOut') {
                    const newOutDuration = Math.max(0.1, Math.min(totalDuration - initialStartSec, Math.round((initialOutDuration + deltaSec) * 10) / 10));
                    onUpdateElement(el.id, { animOutDuration: newOutDuration });
                  }
                };

                const handlePointerUp = (upEvent: PointerEvent) => {
                  try {
                    currentTarget.releasePointerCapture(upEvent.pointerId);
                  } catch {}
                  window.removeEventListener('pointermove', handlePointerMove);
                  window.removeEventListener('pointerup', handlePointerUp);
                };

                window.addEventListener('pointermove', handlePointerMove);
                window.addEventListener('pointerup', handlePointerUp);
              };

              return (
                <div
                  key={el.id}
                  onClick={() => onSelectElement(el.id)}
                  className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all cursor-pointer hover:opacity-90 ${
                    isSelected ? 'ring-2 ring-[var(--primary-accent)]' : ''
                  } ${isChild ? 'ml-6 opacity-90 scale-[0.98]' : ''}`}
                  style={{
                    backgroundColor: isSelected ? 'var(--primary-accent-light)' : 'var(--bg-app)',
                    borderColor: isSelected ? 'var(--primary-accent)' : 'var(--border-color)',
                  }}
                >
                  {/* Info Elemento (Columna Izquierda) */}
                  <div className="w-36 shrink-0 flex items-center gap-1.5 overflow-hidden">
                    {getElementIcon(el)}
                    <span className="text-[10px] font-extrabold truncate" style={{ color: 'var(--text-main)' }}>
                      {el.content || el.type}
                    </span>
                  </div>

                  {/* Pista Temporal con Bloques Interactivos (IN / DURANTE / OUT) */}
                  <div className="track-container flex-1 h-7 relative bg-black/10 dark:bg-white/10 rounded-lg overflow-hidden flex items-center p-0.5 select-none">
                    {!hasAnyAnim ? (
                      <div className="w-full text-center text-[9px] font-semibold opacity-40 italic" style={{ color: 'var(--text-muted)' }}>
                        Sin animación configurada
                      </div>
                    ) : (
                      /* Contenedor del Bloque Completo del Elemento (Mover Retraso/Delay) */
                      <div
                        onPointerDown={(e) => handleStartDragTrack(e, 'move')}
                        className="absolute top-0.5 bottom-0.5 flex items-center rounded-lg cursor-grab active:cursor-grabbing group/track transition-shadow"
                        style={{
                          left: `${inStartPct}%`,
                          width: `${Math.max(4, totalWidthPct)}%`,
                        }}
                        title={`Arrastrar para mover (Inicio: ${startSec.toFixed(1)}s)`}
                      >
                        {/* 1. Pieza ENTRADA (IN) */}
                        {hasIn && (
                          <div
                            className={`h-full flex items-center justify-between px-2 text-[9px] font-black text-emerald-950 dark:text-emerald-100 relative z-10 border border-emerald-500/70 shadow-xs backdrop-blur-xs group/in ${
                              !hasIdle && !hasOut ? 'rounded-md' : 'rounded-l-md'
                            }`}
                            style={{
                              width: `${inSharePct}%`,
                              backgroundColor: 'rgba(34, 197, 94, 0.65)',
                            }}
                            title={`Entrada: ${el.animIn} (${inDuration.toFixed(1)}s)`}
                          >
                            <span className="truncate flex items-center gap-1 pointer-events-none">
                              <Zap size={10} className="shrink-0 text-emerald-800 dark:text-emerald-200" />
                              <span className="hidden sm:inline">IN:</span> {inDuration.toFixed(1)}s
                            </span>

                            {/* Agarradera de cambio de tamaño de IN (Borde Derecho) */}
                            <div
                              onPointerDown={(e) => handleStartDragTrack(e, 'resizeIn')}
                              className="absolute -right-2 top-0 bottom-0 w-4 cursor-ew-resize z-40 flex items-center justify-center group-hover/in:scale-110 transition-transform"
                              title="Modificar duración de Entrada (IN)"
                            >
                              <div className="w-2 h-4 bg-emerald-400 hover:bg-emerald-300 rounded-sm shadow-md border border-white/80 flex flex-col justify-center items-center gap-0.5">
                                <div className="w-0.5 h-0.5 bg-black/40 rounded-full" />
                                <div className="w-0.5 h-0.5 bg-black/40 rounded-full" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 2. Pieza DURANTE (DURANTE / IDLE) */}
                        {hasIdle && (
                          <div
                            className={`h-full flex items-center justify-between px-2 text-[9px] font-black text-blue-950 dark:text-blue-100 relative z-0 border border-blue-500/70 shadow-xs backdrop-blur-xs group/idle ${
                              !hasIn && !hasOut ? 'rounded-md' : !hasIn ? 'rounded-l-md' : !hasOut ? 'rounded-r-md' : ''
                            }`}
                            style={{
                              width: `${idleSharePct}%`,
                              backgroundColor: 'rgba(59, 130, 246, 0.65)',
                            }}
                            title={`Durante: ${el.animIdle} (${idleDuration.toFixed(1)}s)`}
                          >
                            <span className="truncate flex items-center gap-1 pointer-events-none">
                              <Waves size={10} className="shrink-0 text-blue-800 dark:text-blue-200" />
                              <span className="hidden sm:inline">DUR:</span> {idleDuration.toFixed(1)}s
                            </span>

                            {/* Agarradera de cambio de tamaño de DURANTE (Borde Derecho) */}
                            <div
                              onPointerDown={(e) => handleStartDragTrack(e, 'resizeIdle')}
                              className="absolute -right-2 top-0 bottom-0 w-4 cursor-ew-resize z-40 flex items-center justify-center group-hover/idle:scale-110 transition-transform"
                              title="Modificar duración de Durante (DUR)"
                            >
                              <div className="w-2 h-4 bg-blue-400 hover:bg-blue-300 rounded-sm shadow-md border border-white/80 flex flex-col justify-center items-center gap-0.5">
                                <div className="w-0.5 h-0.5 bg-black/40 rounded-full" />
                                <div className="w-0.5 h-0.5 bg-black/40 rounded-full" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 3. Pieza SALIDA (OUT) */}
                        {hasOut && (
                          <div
                            className={`h-full flex items-center justify-between px-2 text-[9px] font-black text-rose-950 dark:text-rose-100 relative z-0 border border-rose-500/70 shadow-xs backdrop-blur-xs group/out ${
                              !hasIn && !hasIdle ? 'rounded-md' : 'rounded-r-md'
                            }`}
                            style={{
                              width: `${outSharePct}%`,
                              backgroundColor: 'rgba(239, 68, 68, 0.65)',
                            }}
                            title={`Salida: ${el.animOut} (${outDuration.toFixed(1)}s)`}
                          >
                            <span className="truncate flex items-center gap-1 pointer-events-none">
                              <Zap size={10} className="shrink-0 text-rose-800 dark:text-rose-200" />
                              <span className="hidden sm:inline">OUT:</span> {outDuration.toFixed(1)}s
                            </span>

                            {/* Agarradera de cambio de tamaño de OUT (Borde Derecho) */}
                            <div
                              onPointerDown={(e) => handleStartDragTrack(e, 'resizeOut')}
                              className="absolute -right-2 top-0 bottom-0 w-4 cursor-ew-resize z-40 flex items-center justify-center group-hover/out:scale-110 transition-transform"
                              title="Modificar duración de Salida (OUT)"
                            >
                              <div className="w-2 h-4 bg-rose-400 hover:bg-rose-300 rounded-sm shadow-md border border-white/80 flex flex-col justify-center items-center gap-0.5">
                                <div className="w-0.5 h-0.5 bg-black/40 rounded-full" />
                                <div className="w-0.5 h-0.5 bg-black/40 rounded-full" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
