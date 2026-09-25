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

  // Helper to get element icon
  const getElementIcon = (el: CanvasElement) => {
    switch (el.type) {
      case 'text':
        return <Type size={12} className="shrink-0 text-blue-400" />;
      case 'image':
        return <ImageIcon size={12} className="shrink-0 text-emerald-400" />;
      case 'video':
        return <Video size={12} className="shrink-0 text-purple-400" />;
      case 'shape':
        return <Square size={12} className="shrink-0 text-amber-400" />;
      case 'button':
        return <Sparkles size={12} className="shrink-0 text-pink-400" />;
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
      className="absolute bottom-4 left-4 right-4 z-30 transition-all duration-300 pointer-events-auto rounded-2xl border shadow-xl backdrop-blur-md overflow-hidden flex flex-col"
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
              Capas / Capa
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

          {/* Listado de Pistas por Elemento */}
          {elements.length === 0 ? (
            <div className="text-center py-4 text-xs font-bold opacity-60" style={{ color: 'var(--text-muted)' }}>
              No hay elementos en el lienzo para animar.
            </div>
          ) : (
            elements.map((el) => {
              const isSelected = selectedElementId === el.id;
              const startSec = el.animStartTime ?? 0;
              const inDuration = el.animDuration ?? 0.8;
              const idleDuration = el.animIdleDuration ?? 3.0;
              const outDuration = el.animOutDuration ?? 0.8;

              const inStartPct = Math.max(0, (startSec / totalDuration) * 100);
              const inWidthPct = Math.min(100 - inStartPct, (inDuration / totalDuration) * 100);
              const idleWidthPct = Math.min(100 - (inStartPct + inWidthPct), (idleDuration / totalDuration) * 100);
              const outWidthPct = Math.min(100 - (inStartPct + inWidthPct + idleWidthPct), (outDuration / totalDuration) * 100);

              // Handlers para arrastrar y cambiar tamaño de bloques de animación
              const handleStartDragTrack = (e: React.PointerEvent, type: 'move' | 'resizeIn' | 'resizeIdle' | 'resizeOut') => {
                e.stopPropagation();
                e.preventDefault();
                onSelectElement(el.id);

                const trackElement = (e.currentTarget.closest('.track-container') as HTMLElement) || rulerRef.current;
                if (!trackElement) return;

                const trackRect = trackElement.getBoundingClientRect();
                const startX = e.clientX;
                const initialStartSec = startSec;
                const initialInDuration = inDuration;
                const initialIdleDuration = idleDuration;
                const initialOutDuration = outDuration;

                const handlePointerMove = (moveEvent: PointerEvent) => {
                  const deltaX = moveEvent.clientX - startX;
                  const deltaSec = (deltaX / trackRect.width) * totalDuration;

                  if (type === 'move') {
                    const newStartTime = Math.max(0, Math.min(totalDuration - 0.5, Math.round((initialStartSec + deltaSec) * 10) / 10));
                    onUpdateElement(el.id, { animStartTime: newStartTime });
                  } else if (type === 'resizeIn') {
                    const newDuration = Math.max(0.1, Math.min(10.0, Math.round((initialInDuration + deltaSec) * 10) / 10));
                    onUpdateElement(el.id, { animDuration: newDuration });
                  } else if (type === 'resizeIdle') {
                    const newIdleDuration = Math.max(0.2, Math.min(15.0, Math.round((initialIdleDuration + deltaSec) * 10) / 10));
                    onUpdateElement(el.id, { animIdleDuration: newIdleDuration });
                  } else if (type === 'resizeOut') {
                    const newOutDuration = Math.max(0.1, Math.min(10.0, Math.round((initialOutDuration + deltaSec) * 10) / 10));
                    onUpdateElement(el.id, { animOutDuration: newOutDuration });
                  }
                };

                const handlePointerUp = () => {
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
                  className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected ? 'ring-1' : 'hover:opacity-90'
                  }`}
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
                  <div className="track-container flex-1 h-7 relative bg-black/10 dark:bg-white/10 rounded-lg overflow-hidden flex items-center p-0.5">
                    {/* Contenedor del Bloque Completo del Elemento (Desplazable) */}
                    <div
                      onPointerDown={(e) => handleStartDragTrack(e, 'move')}
                      className="absolute top-0.5 bottom-0.5 flex items-center rounded-lg cursor-grab active:cursor-grabbing group/track"
                      style={{
                        left: `${inStartPct}%`,
                        width: `${inWidthPct + idleWidthPct + outWidthPct}%`,
                      }}
                      title="Haz clic y arrastra para mover el tiempo de inicio (Retraso/Delay)"
                    >
                      {/* 1. Pieza ENTRADA (IN) */}
                      <div
                        className="h-full flex items-center justify-between px-1 text-[8px] font-black text-emerald-950 dark:text-emerald-100 relative z-10 rounded-l-md shadow-xs border border-emerald-500/50 backdrop-blur-xs group/in"
                        style={{
                          width: `${(inWidthPct / (inWidthPct + idleWidthPct + outWidthPct)) * 100}%`,
                          backgroundColor: 'rgba(34, 197, 94, 0.45)',
                        }}
                        title={`Entrada: ${el.animIn || 'slideInUp'} (${inDuration.toFixed(1)}s)`}
                      >
                        <span className="truncate flex items-center gap-1 pointer-events-none">
                          <Zap size={9} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span className="hidden sm:inline">IN:</span> {inDuration.toFixed(1)}s
                        </span>

                        {/* Handle para redimensionar Duración de IN */}
                        <div
                          onPointerDown={(e) => handleStartDragTrack(e, 'resizeIn')}
                          className="absolute -right-1 top-0 bottom-0 w-2.5 cursor-ew-resize z-30 flex items-center justify-center group-hover/in:opacity-100 opacity-60"
                          title="Arrastra para cambiar la duración de entrada"
                        >
                          <div className="w-1.5 h-3 bg-emerald-600 rounded-full shadow-xs border border-white/50" />
                        </div>
                      </div>

                      {/* 2. Pieza DURANTE (LOOP / IDLE) */}
                      <div
                        className="h-full flex items-center justify-between px-1 text-[8px] font-black text-blue-950 dark:text-blue-100 relative z-0 shadow-xs border border-blue-500/50 backdrop-blur-xs group/idle"
                        style={{
                          width: `${(idleWidthPct / (inWidthPct + idleWidthPct + outWidthPct)) * 100}%`,
                          backgroundColor: 'rgba(59, 130, 246, 0.45)',
                        }}
                        title={`Durante: ${el.animIdle || 'Estático'} (${idleDuration.toFixed(1)}s)`}
                      >
                        <span className="truncate flex items-center gap-1 pointer-events-none">
                          <Waves size={9} className="shrink-0 text-blue-600 dark:text-blue-400" />
                          <span className="hidden sm:inline">DUR:</span> {idleDuration.toFixed(1)}s
                        </span>

                        {/* Handle para redimensionar Duración de DURANTE */}
                        <div
                          onPointerDown={(e) => handleStartDragTrack(e, 'resizeIdle')}
                          className="absolute -right-1 top-0 bottom-0 w-2.5 cursor-ew-resize z-30 flex items-center justify-center group-hover/idle:opacity-100 opacity-60"
                          title="Arrastra para cambiar la duración de durante"
                        >
                          <div className="w-1.5 h-3 bg-blue-600 rounded-full shadow-xs border border-white/50" />
                        </div>
                      </div>

                      {/* 3. Pieza SALIDA (OUT) */}
                      <div
                        className="h-full flex items-center justify-between px-1 text-[8px] font-black text-rose-950 dark:text-rose-100 relative z-0 rounded-r-md shadow-xs border border-rose-500/50 backdrop-blur-xs group/out"
                        style={{
                          width: `${(outWidthPct / (inWidthPct + idleWidthPct + outWidthPct)) * 100}%`,
                          backgroundColor: 'rgba(239, 68, 68, 0.45)',
                        }}
                        title={`Salida: ${el.animOut || 'Sin salida'} (${outDuration.toFixed(1)}s)`}
                      >
                        <span className="truncate flex items-center gap-1 pointer-events-none">
                          <Zap size={9} className="shrink-0 text-rose-600 dark:text-rose-400" />
                          <span className="hidden sm:inline">OUT:</span> {outDuration.toFixed(1)}s
                        </span>

                        {/* Handle para redimensionar Duración de OUT */}
                        <div
                          onPointerDown={(e) => handleStartDragTrack(e, 'resizeOut')}
                          className="absolute -right-1 top-0 bottom-0 w-2.5 cursor-ew-resize z-30 flex items-center justify-center group-hover/out:opacity-100 opacity-60"
                          title="Arrastra para cambiar la duración de salida"
                        >
                          <div className="w-1.5 h-3 bg-rose-600 rounded-full shadow-xs border border-white/50" />
                        </div>
                      </div>
                    </div>
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
