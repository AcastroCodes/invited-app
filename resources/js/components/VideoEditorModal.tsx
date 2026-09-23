import React, { useState, useRef, useEffect } from 'react';
import { X, Film, Volume2, VolumeX, Play, Pause, Check, Sliders } from 'lucide-react';
import type { CanvasElement } from '../types/designerTypes';

interface VideoEditorModalProps {
  isOpen: boolean;
  element: CanvasElement;
  onClose: () => void;
  onSave: (updates: Partial<CanvasElement>) => void;
}

export const VideoEditorModal: React.FC<VideoEditorModalProps> = ({
  isOpen,
  element,
  onClose,
  onSave,
}) => {
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const [startTime, setStartTime] = useState<number>(Number(element.videoStartTime) || 0);
  const [endTime, setEndTime] = useState<number>(Number(element.videoEndTime) || 0);
  const [isMuted, setIsMuted] = useState<boolean>(element.videoMuted !== false);
  const [loopMode, setLoopMode] = useState<'loop' | 'yoyo' | 'once'>(element.videoLoopMode || 'loop');
  const [speed, setSpeed] = useState<number>(Number(element.videoSpeed) || 1);

  useEffect(() => {
    setStartTime(Number(element.videoStartTime) || 0);
    setEndTime(Number(element.videoEndTime) || 0);
    setIsMuted(element.videoMuted !== false);
    setLoopMode(element.videoLoopMode || 'loop');
    setSpeed(Number(element.videoSpeed) || 1);
  }, [element]);

  const startTimeRef = useRef<number>(startTime);
  const endTimeRef = useRef<number>(endTime);

  useEffect(() => {
    startTimeRef.current = startTime;
    endTimeRef.current = endTime;
  }, [startTime, endTime]);

  const directionRef = useRef<'forward' | 'backward'>('forward');

  useEffect(() => {
    const video = previewVideoRef.current;
    if (!video) return;

    video.muted = isMuted;
    video.playbackRate = speed;

    let animId: number;
    let lastTimeMark = performance.now();

    const handleLoadedMetadata = () => {
      const dur = video.duration || 0;
      setDuration(dur);
      if (endTimeRef.current === 0 || endTimeRef.current > dur) {
        setEndTime(Math.round(dur * 10) / 10);
      }
      if (startTimeRef.current > 0 && video.currentTime < startTimeRef.current) {
        video.currentTime = startTimeRef.current;
      }
    };

    const updateLoopState = (now: number) => {
      if (!video) return;

      const delta = (now - lastTimeMark) / 1000;
      lastTimeMark = now;

      const curStart = startTimeRef.current;
      const curEnd = (endTimeRef.current > 0 && endTimeRef.current > curStart && endTimeRef.current <= video.duration)
        ? endTimeRef.current
        : (video.duration || 0);

      if (curEnd && !isNaN(curEnd)) {
        if (loopMode === 'pingpong' || loopMode === 'yoyo') {
          if (directionRef.current === 'forward') {
            if (video.currentTime >= curEnd - 0.08) {
              directionRef.current = 'backward';
              video.pause();
            }
          } else {
            // Reproducción en reversa para Ping-Pong: retroceder fotograma a fotograma hasta el inicio
            const step = Math.min(0.08, Math.max(0.015, (delta > 0 && delta < 0.2 ? delta : 0.033) * speed));
            const nextTime = video.currentTime - step;

            if (nextTime <= curStart + 0.05) {
              directionRef.current = 'forward';
              video.currentTime = curStart;
              if (isPlaying) {
                video.play().catch(() => {});
              }
            } else {
              video.currentTime = nextTime;
            }
          }
        } else if (loopMode === 'loop') {
          directionRef.current = 'forward';
          if (video.currentTime >= curEnd - 0.08) {
            video.currentTime = curStart;
          }
        } else if (loopMode === 'once') {
          directionRef.current = 'forward';
          if (video.currentTime >= curEnd - 0.08) {
            video.pause();
            setIsPlaying(false);
          }
        }
      }

      setCurrentTime(video.currentTime);

      if (isPlaying) {
        animId = requestAnimationFrame(updateLoopState);
      }
    };

    if (isPlaying) {
      lastTimeMark = performance.now();
      animId = requestAnimationFrame(updateLoopState);
    } else {
      setCurrentTime(video.currentTime);
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [loopMode, isMuted, speed, element.content, isPlaying]);

  const togglePlay = () => {
    const video = previewVideoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      if (video.currentTime >= (endTime || duration)) {
        video.currentTime = startTime;
      }
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const timelineRef = useRef<HTMLDivElement>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const [videoAspectRatio, setVideoAspectRatio] = useState<number>(16 / 9);

  // Generar 10 fotogramas únicos del rango de tiempo seleccionado [startTime, endTime]
  useEffect(() => {
    if (!element.content || !duration) return;

    let isMounted = true;
    const hiddenVideo = document.createElement('video');
    hiddenVideo.src = element.content;
    hiddenVideo.crossOrigin = 'anonymous';
    hiddenVideo.muted = true;
    hiddenVideo.playsInline = true;
    hiddenVideo.preload = 'auto';
    hiddenVideo.style.position = 'fixed';
    hiddenVideo.style.left = '-9999px';
    hiddenVideo.style.top = '0px';
    hiddenVideo.style.width = '1px';
    hiddenVideo.style.height = '1px';
    hiddenVideo.style.opacity = '0.01';
    hiddenVideo.style.pointerEvents = 'none';

    document.body.appendChild(hiddenVideo);

    const frames: string[] = [];

    const cleanup = () => {
      isMounted = false;
      hiddenVideo.onseeked = null;
      hiddenVideo.onloadedmetadata = null;
      if (document.body.contains(hiddenVideo)) {
        document.body.removeChild(hiddenVideo);
      }
    };

    const effectiveStart = Math.max(0, startTime);
    const effectiveEnd = (endTime > effectiveStart && endTime <= duration) ? endTime : duration;
    const activeSegmentDur = Math.max(0.1, effectiveEnd - effectiveStart);

    hiddenVideo.onloadedmetadata = () => {
      if (!isMounted) return;
      const vw = hiddenVideo.videoWidth || 16;
      const vh = hiddenVideo.videoHeight || 9;
      setVideoAspectRatio(vw / vh);

      const count = 10;
      let currentStep = 0;

      const startCapturing = () => {
        const captureStep = () => {
          if (!isMounted) return;
          if (currentStep >= count) {
            setThumbnails([...frames]);
            cleanup();
            return;
          }

          // Marcas de tiempo distribuidas homogéneamente en el rango del recorte [startTime ... endTime]
          const targetPercent = count > 1 ? currentStep / (count - 1) : 0;
          const targetTime = Math.max(0.05, Math.min(duration - 0.05, effectiveStart + (targetPercent * activeSegmentDur)));
          hiddenVideo.currentTime = targetTime;
        };

        hiddenVideo.onseeked = () => {
          if (!isMounted) return;
          setTimeout(() => {
            if (!isMounted) return;
            const canvas = document.createElement('canvas');
            canvas.width = Math.round((70 * vw) / vh);
            canvas.height = 70;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(hiddenVideo, 0, 0, canvas.width, canvas.height);
              frames.push(canvas.toDataURL('image/jpeg', 0.7));
            }
            currentStep++;
            captureStep();
          }, 50);
        };

        captureStep();
      };

      // Desbloquear decodificación de fotogramas en Chrome/Edge/Safari
      hiddenVideo.play().then(() => {
        if (!isMounted) return;
        hiddenVideo.pause();
        startCapturing();
      }).catch(() => {
        if (!isMounted) return;
        startCapturing();
      });
    };

    return () => {
      cleanup();
    };
  }, [element.content, startTime, endTime, duration]);

  // Manejo interactivo de clic / arrastre sobre la Pista Principal de Video Recortado [startTime ... endTime]
  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !duration) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const clickPercent = clickX / rect.width;

    const activeSegmentDur = Math.max(0.1, (endTimeRef.current > startTimeRef.current && endTimeRef.current <= duration) ? (endTimeRef.current - startTimeRef.current) : duration);
    const targetTime = Math.round((startTimeRef.current + (clickPercent * activeSegmentDur)) * 10) / 10;

    if (previewVideoRef.current) {
      previewVideoRef.current.currentTime = Math.max(startTimeRef.current, Math.min(endTimeRef.current, targetTime));
      setCurrentTime(previewVideoRef.current.currentTime);
    }

    const updateTime = (moveEvent: MouseEvent) => {
      const currentRect = timelineRef.current?.getBoundingClientRect();
      if (!currentRect) return;
      const moveX = Math.max(0, Math.min(currentRect.width, moveEvent.clientX - currentRect.left));
      const movePercent = moveX / currentRect.width;
      const moveTargetTime = Math.round((startTimeRef.current + (movePercent * activeSegmentDur)) * 10) / 10;

      if (previewVideoRef.current) {
        previewVideoRef.current.currentTime = Math.max(startTimeRef.current, Math.min(endTimeRef.current, moveTargetTime));
        setCurrentTime(previewVideoRef.current.currentTime);
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', updateTime);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', updateTime);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleSave = () => {
    onSave({
      videoStartTime: startTime,
      videoEndTime: endTime,
      videoMuted: isMuted,
      videoLoopMode: loopMode,
      videoSpeed: speed,
    });
    onClose();
  };

  if (!isOpen) return null;

  const activeSegmentDuration = Math.max(0.1, (endTime > startTime && endTime <= duration) ? (endTime - startTime) : duration);
  const clampedCurrent = Math.max(startTime, Math.min(endTime || duration, currentTime));
  const playheadPercentInside = activeSegmentDuration > 0 ? ((clampedCurrent - startTime) / activeSegmentDuration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-150 font-sans">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-main)',
        }}
      >
        {/* MODAL HEADER */}
        <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg flex items-center justify-center border" style={{ backgroundColor: 'var(--primary-accent-light)', borderColor: 'var(--primary-accent)', color: 'var(--primary-accent)' }}>
              <Film size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-wide uppercase" style={{ color: 'var(--text-main)' }}>Editor de Video</h3>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Línea de tiempo del segmento recortado, control de entrada/salida y reproducción</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border transition-all cursor-pointer opacity-70 hover:opacity-100"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY GRID (COLUMNA IZQUIERDA: PREVIEW 9:16 | COLUMNA DERECHA: TIMELINE & CONTROLES) */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* COLUMNA IZQUIERDA: VISTA PREVIA FINAL EN SMARTPHONE 9:16 (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 rounded-xl border h-full min-h-[380px]" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
            <div className="relative h-[430px] max-h-full aspect-[9/16] rounded-2xl overflow-hidden bg-black border-2 shadow-2xl flex items-center justify-center" style={{ borderColor: 'var(--border-color)' }}>
              {element.content ? (
                <video
                  ref={previewVideoRef}
                  src={element.content}
                  autoPlay
                  playsInline
                  className="w-full h-full"
                  style={{
                    objectFit: (element.objectFit as any) || 'cover',
                    filter: `brightness(${element.imgBrightness !== undefined ? element.imgBrightness : 100}%) contrast(${element.imgContrast !== undefined ? element.imgContrast : 100}%) saturate(${element.imgSaturate !== undefined ? element.imgSaturate : 100}%) blur(${element.imgBlur || 0}px) ${element.imgGrayscale ? 'grayscale(100%)' : ''} ${element.imgSepia ? 'sepia(100%)' : ''}`.trim(),
                    transform: (element.mediaX || element.mediaY || (element.mediaScale && element.mediaScale !== 100) || element.mediaRotation)
                      ? `translate(${element.mediaX || 0}px, ${element.mediaY || 0}px) scale(${(element.mediaScale ?? 100) / 100}) rotate(${element.mediaRotation || 0}deg)`
                      : undefined,
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                  Sin video
                </div>
              )}

              {/* BADGE DE TIEMPO ACTUAL */}
              <div className="absolute top-3 right-3 bg-black/70 px-3 py-1 rounded-full text-[10px] font-mono font-extrabold border shadow-md z-10" style={{ borderColor: 'var(--primary-accent)', color: 'var(--primary-accent)' }}>
                {currentTime.toFixed(1)}s / {duration > 0 ? duration.toFixed(1) : 0}s
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: TIMELINE DE RECORTE & AJUSTES (7 COLS) */}
          <div className="lg:col-span-7 space-y-4 flex flex-col justify-center">
            {/* PISTA PRINCIPAL DE VIDEO RECORTADO */}
            <div className="space-y-3 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--primary-accent)' }}>
                <span className="flex items-center gap-1.5"><Film size={14} /> Línea de Tiempo (Segmento Seleccionado)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                    Duración: {activeSegmentDuration.toFixed(1)}s
                  </span>
                  {/* BOTÓN PLAY / PAUSA */}
                  <button
                    type="button"
                    onClick={togglePlay}
                    title={isPlaying ? 'Pausar' : 'Reproducir'}
                    className="p-1.5 rounded-md border transition-all cursor-pointer flex items-center justify-center"
                    style={{
                      backgroundColor: isPlaying ? 'var(--primary-accent-light)' : 'var(--bg-card)',
                      borderColor: isPlaying ? 'var(--primary-accent)' : 'var(--border-color)',
                      color: isPlaying ? 'var(--primary-accent)' : 'var(--text-main)',
                    }}
                  >
                    {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
                  </button>
                  {/* BOTÓN SILENCIAR */}
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    title={isMuted ? 'Desactivar silenciar' : 'Silenciar audio'}
                    className="p-1.5 rounded-md border transition-all cursor-pointer flex items-center justify-center"
                    style={{
                      backgroundColor: isMuted ? 'var(--primary-accent-light)' : 'var(--bg-card)',
                      borderColor: isMuted ? 'var(--primary-accent)' : 'var(--border-color)',
                      color: isMuted ? 'var(--primary-accent)' : 'var(--text-main)',
                    }}
                  >
                    {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  </button>
                </div>
              </div>

              {/* CONTENEDOR DE LA PISTA DEL SEGMENTO RECORTADO (100% DE ANCHO = DESDE START A END) */}
              <div
                ref={timelineRef}
                onMouseDown={handleTimelineMouseDown}
                className="relative w-full rounded-xl bg-slate-950 overflow-hidden cursor-pointer select-none border-2 shadow-2xl p-0"
                style={{ borderColor: 'var(--primary-accent)' }}
              >
                {/* 1. REGLA DE TIEMPO DEL CORTE (MUESTRA DE STARTTIME A ENDTIME) */}
                <div className="h-6 w-full bg-slate-900/90 border-b border-white/10 flex items-center justify-between px-3 relative font-mono text-[9px] text-white/70 pointer-events-none">
                  {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                    const timeLabel = (startTime + activeSegmentDuration * pct).toFixed(1);
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <span className="leading-none">{timeLabel}s</span>
                        <div className="w-0.5 h-1.5 bg-white/40 mt-0.5" />
                      </div>
                    );
                  })}
                </div>

                {/* 2. FOTOGRAMAS EXCLUSIVOS DEL CORTE SELECCIONADO */}
                <div className="relative h-16 w-full flex items-center bg-black">
                  {thumbnails.length > 0 ? (
                    thumbnails.map((thumb, idx) => {
                      const frameTime = (startTime + (idx / (thumbnails.length - 1)) * activeSegmentDuration).toFixed(1);
                      return (
                        <div
                          key={idx}
                          className="h-full flex-1 relative overflow-hidden border-r border-white/10 last:border-r-0 flex items-center justify-center bg-slate-900/80 group"
                        >
                          <img
                            src={thumb}
                            style={{ aspectRatio: `${videoAspectRatio}` }}
                            className="h-full max-w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                            alt={`Fotograma ${frameTime}s`}
                          />
                          <div className="absolute bottom-1 right-1 bg-black/85 px-1 py-0.2 rounded text-[8px] font-mono font-bold text-white border border-white/10 backdrop-blur-[2px]">
                            {frameTime}s
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center text-[10px] text-white/40 font-mono">
                      Cargando fotogramas del corte...
                    </div>
                  )}
                </div>

                {/* RELLENO TRANSLÚCIDO DE PROGRESO DE REPRODUCCIÓN */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-white/20 backdrop-brightness-125 pointer-events-none"
                  style={{ width: `${Math.max(0, Math.min(100, playheadPercentInside))}%` }}
                />

                {/* AGUJA ROJA PRO (AVANZA DEL 0% AL 100% DE LA PISTA RECORTADA) */}
                <div
                  className="absolute top-0 bottom-0 z-25 pointer-events-none flex flex-col items-center -ml-[1px]"
                  style={{ left: `${Math.max(0, Math.min(100, playheadPercentInside))}%` }}
                >
                  <div className="w-3 h-3 bg-rose-500 rounded-b-xs shadow-[0_0_10px_rgba(244,63,94,1)] -mt-0.5 border border-white" />
                  <div className="w-0.5 h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)]" />
                </div>
              </div>

              {/* BARRA DE CONTROL DE CORTE DE PRECISIÓN (PUNTOS ENTRADA IN / SALIDA OUT) */}
              <div className="p-3.5 rounded-xl border space-y-3 bg-black/40" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--primary-accent)' }}>
                  <span>Puntos de Corte (Inicio / Fin del Video)</span>
                  <span className="font-mono text-white/70">{startTime.toFixed(1)}s ➜ {endTime.toFixed(1)}s</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CONTROL DE INICIO (IN) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span>Punto de Inicio (IN)</span>
                      <span className="font-mono" style={{ color: 'var(--primary-accent)' }}>{startTime.toFixed(1)}s</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, endTime - 0.1)}
                      step={0.1}
                      value={startTime}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setStartTime(val);
                        startTimeRef.current = val;
                        if (previewVideoRef.current) {
                          previewVideoRef.current.currentTime = val;
                        }
                      }}
                      className="w-full accent-[var(--primary-accent)] cursor-pointer"
                    />
                  </div>

                  {/* CONTROL DE FIN (OUT) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span>Punto de Fin (OUT)</span>
                      <span className="font-mono" style={{ color: 'var(--primary-accent)' }}>{endTime.toFixed(1)}s</span>
                    </div>
                    <input
                      type="range"
                      min={Math.min(duration, startTime + 0.1)}
                      max={duration || 10}
                      step={0.1}
                      value={endTime}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEndTime(val);
                        endTimeRef.current = val;
                        if (previewVideoRef.current) {
                          previewVideoRef.current.currentTime = val;
                        }
                      }}
                      className="w-full accent-[var(--primary-accent)] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* MODO DE REPRODUCCIÓN */}
            <div className="p-3.5 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
              <span className="block text-[11px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--primary-accent)' }}>
                Modo de Reproducción
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'loop', label: 'Bucle (Loop)', desc: 'Continuo' },
                  { id: 'pingpong', label: 'Secuencia Ping-Pong', desc: 'Rebote suave' },
                  { id: 'once', label: 'Una Vez', desc: 'Pausa al final' },
                ].map((m) => {
                  const isActive = loopMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setLoopMode(m.id as any)}
                      className="p-2.5 rounded-xl border transition-all text-left cursor-pointer flex flex-col justify-between"
                      style={{
                        backgroundColor: isActive ? 'var(--primary-accent-light)' : 'var(--bg-card)',
                        borderColor: isActive ? 'var(--primary-accent)' : 'var(--border-color)',
                        color: isActive ? 'var(--primary-accent)' : 'var(--text-main)',
                      }}
                    >
                      <span className="text-xs font-bold">{m.label}</span>
                      <span className="text-[9px] opacity-75 mt-0.5 font-medium">{m.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* VELOCIDAD DE REPRODUCCIÓN */}
            <div className="p-3.5 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
              <span className="block text-[11px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--primary-accent)' }}>
                Velocidad de Reproducción ({speed}x)
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 1, 1.5, 2].map((s) => {
                  const isActive = speed === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSpeed(s)}
                      className="py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center justify-center"
                      style={{
                        backgroundColor: isActive ? 'var(--primary-accent-light)' : 'var(--bg-card)',
                        borderColor: isActive ? 'var(--primary-accent)' : 'var(--border-color)',
                        color: isActive ? 'var(--primary-accent)' : 'var(--text-main)',
                      }}
                    >
                      {s}x
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3 border-t flex items-center justify-end gap-3" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-extrabold border transition-colors cursor-pointer"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-extrabold text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95"
            style={{ backgroundColor: 'var(--primary-accent)' }}
          >
            <Check size={14} /> Guardar Ajustes
          </button>
        </div>
      </div>
    </div>
  );
};
