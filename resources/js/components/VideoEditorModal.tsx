import React, { useState, useRef, useEffect } from 'react';
import { X, Film, Volume2, VolumeX, Play, Pause, Check, Sliders, Scissors, Loader2 } from 'lucide-react';
import type { CanvasElement } from '../types/designerTypes';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

interface VideoEditorModalProps {
  isOpen: boolean;
  element: CanvasElement;
  onClose: () => void;
  onSave: (updates: Partial<CanvasElement>, saveAsNew?: boolean) => void | Promise<void>;
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
  const redNeedleRef = useRef<HTMLDivElement>(null);
  const timeBadgeRef = useRef<HTMLDivElement>(null);
  
  const [isPreviewCrop, setIsPreviewCrop] = useState<boolean>(false);
  const isPreviewCropRef = useRef<boolean>(isPreviewCrop);

  // FFmpeg State
  const ffmpegRef = useRef(new FFmpeg());
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [trimmedVideoUrl, setTrimmedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    isPreviewCropRef.current = isPreviewCrop;
  }, [isPreviewCrop]);

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

      const cropMode = isPreviewCropRef.current;
      const curStart = cropMode ? startTimeRef.current : 0;
      const curEnd = cropMode
        ? (endTimeRef.current > 0 && endTimeRef.current > curStart && endTimeRef.current <= video.duration
            ? endTimeRef.current
            : (video.duration || 0))
        : (video.duration || 0);

      if (curEnd && !isNaN(curEnd)) {
        // Forzar a que la aguja nunca reproduzca antes del punto de inicio
        if (!video.seeking && video.currentTime < curStart && directionRef.current === 'forward') {
          video.currentTime = curStart;
        }

        if (loopMode === 'pingpong' || loopMode === 'yoyo') {
          if (directionRef.current === 'forward') {
            if (!video.seeking && video.currentTime >= curEnd - 0.08) {
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
          if (!video.seeking && video.currentTime >= curEnd - 0.08) {
            video.currentTime = curStart;
          }
        } else if (loopMode === 'once') {
          directionRef.current = 'forward';
          if (!video.seeking && video.currentTime >= curEnd - 0.08) {
            video.pause();
            setIsPlaying(false);
          }
        }
      }

      // Optimización: Actualizar DOM directamente sin re-renderizar todo React
      if (redNeedleRef.current && duration > 0) {
        const percent = (video.currentTime / duration) * 100;
        redNeedleRef.current.style.left = `${Math.max(0, Math.min(100, percent))}%`;
      }
      if (timeBadgeRef.current) {
        timeBadgeRef.current.textContent = `${video.currentTime.toFixed(1)}s / ${(duration > 0 ? duration : 0).toFixed(1)}s`;
      }

      if (isPlaying) {
        animId = requestAnimationFrame(updateLoopState);
      }
    };

    if (isPlaying) {
      lastTimeMark = performance.now();
      animId = requestAnimationFrame(updateLoopState);
    } else {
      if (redNeedleRef.current && duration > 0) {
        const percent = (video.currentTime / duration) * 100;
        redNeedleRef.current.style.left = `${Math.max(0, Math.min(100, percent))}%`;
      }
      if (timeBadgeRef.current) {
        timeBadgeRef.current.textContent = `${video.currentTime.toFixed(1)}s / ${(duration > 0 ? duration : 0).toFixed(1)}s`;
      }
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
      const curStart = isPreviewCrop ? startTime : 0;
      const curEnd = isPreviewCrop ? (endTime || duration) : duration;
      
      if (video.currentTime < curStart || video.currentTime >= curEnd - 0.1) {
        video.currentTime = curStart;
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
    let objectUrl = '';
    let hiddenVideo: HTMLVideoElement | null = null;

    const cleanup = () => {
      isMounted = false;
      if (hiddenVideo) {
        hiddenVideo.onseeked = null;
        hiddenVideo.onloadedmetadata = null;
        if (document.body.contains(hiddenVideo)) {
          document.body.removeChild(hiddenVideo);
        }
      }
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };

    const generateThumbnails = async () => {
      try {
        // Descargar el video como Blob para forzar que el navegador lo tenga 100% en memoria
        // Esto soluciona los problemas de saltos (seek) fallidos o repetidos.
        const response = await fetch(element.content);
        const blob = await response.blob();
        if (!isMounted) return;

        objectUrl = URL.createObjectURL(blob);

        hiddenVideo = document.createElement('video');
        hiddenVideo.src = objectUrl;
        hiddenVideo.crossOrigin = 'anonymous';
        hiddenVideo.muted = true;
        hiddenVideo.playsInline = true;
        hiddenVideo.preload = 'auto';
        hiddenVideo.style.position = 'fixed';
        hiddenVideo.style.bottom = '0px';
        hiddenVideo.style.right = '0px';
        hiddenVideo.style.width = '10px';
        hiddenVideo.style.height = '10px';
        hiddenVideo.style.opacity = '0.2';
        hiddenVideo.style.pointerEvents = 'none';
        hiddenVideo.style.zIndex = '-999';

        document.body.appendChild(hiddenVideo);

        const frames: string[] = [];

        hiddenVideo.onloadedmetadata = () => {
          if (!isMounted) return;
          const vw = hiddenVideo!.videoWidth || 16;
          const vh = hiddenVideo!.videoHeight || 9;
          const aspectRatio = vw / vh;
          setVideoAspectRatio(aspectRatio);

          let count = 10;
          if (timelineRef.current) {
            const timelineWidth = timelineRef.current.clientWidth;
            const thumbHeight = 64; 
            const thumbWidth = thumbHeight * aspectRatio;
            count = Math.max(2, Math.ceil(timelineWidth / thumbWidth));
          }

          let currentStep = 0;

          const startCapturing = () => {
            const captureStep = () => {
              if (!isMounted || !hiddenVideo) return;
              if (currentStep >= count) {
                setThumbnails([...frames]);
                cleanup();
                return;
              }

              const targetPercent = count > 1 ? currentStep / (count - 1) : 0;
              const targetTime = Math.max(0.05, Math.min(duration - 0.05, targetPercent * duration));
              hiddenVideo.currentTime = targetTime;
            };

            hiddenVideo!.onseeked = () => {
              if (!isMounted || !hiddenVideo) return;
              setTimeout(() => {
                if (!isMounted || !hiddenVideo) return;
                if (hiddenVideo.readyState >= 2) {
                  const canvas = document.createElement('canvas');
                  canvas.width = Math.round((70 * vw) / vh);
                  canvas.height = 70;
                  const ctx = canvas.getContext('2d', { willReadFrequently: true });
                  if (ctx) {
                    ctx.drawImage(hiddenVideo, 0, 0, canvas.width, canvas.height);
                    frames.push(canvas.toDataURL('image/jpeg', 0.7));
                  }
                  currentStep++;
                  captureStep();
                } else {
                  hiddenVideo.onseeked?.(new Event('seeked'));
                }
              }, 150);
            };

            captureStep();
          };

          hiddenVideo!.play().then(() => {
            if (!isMounted) return;
            hiddenVideo!.pause();
            startCapturing();
          }).catch(() => {
            if (!isMounted) return;
            startCapturing();
          });
        };
      } catch (error) {
        console.error('Error fetching video blob for thumbnails:', error);
      }
    };

    generateThumbnails();

    return () => {
      cleanup();
    };
  }, [element.content, startTime, endTime, duration]);

  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !duration) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const clickPercent = clickX / rect.width;
    const targetTime = Math.round((clickPercent * duration) * 10) / 10;
    
    // Al buscar manualmente, desactivamos la vista de recorte para que pueda moverse libremente
    setIsPreviewCrop(false);

    if (previewVideoRef.current) {
      previewVideoRef.current.currentTime = Math.max(0, Math.min(duration, targetTime));
      setCurrentTime(previewVideoRef.current.currentTime);
    }

    const updateTime = (moveEvent: MouseEvent) => {
      const currentRect = timelineRef.current?.getBoundingClientRect();
      if (!currentRect) return;
      const moveX = Math.max(0, Math.min(currentRect.width, moveEvent.clientX - currentRect.left));
      const movePercent = moveX / currentRect.width;
      const moveTargetTime = Math.round((movePercent * duration) * 10) / 10;

      if (previewVideoRef.current) {
        previewVideoRef.current.currentTime = Math.max(0, Math.min(duration, moveTargetTime));
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

  const handleDragHandle = (e: React.MouseEvent<HTMLDivElement>, type: 'start' | 'end') => {
    e.stopPropagation();
    if (!timelineRef.current || !duration) return;

    // Al arrastrar los controles, desactivamos la vista de recorte para evitar carga
    setIsPreviewCrop(false);

    const updateTime = (moveEvent: MouseEvent) => {
      const currentRect = timelineRef.current?.getBoundingClientRect();
      if (!currentRect) return;
      const moveX = Math.max(0, Math.min(currentRect.width, moveEvent.clientX - currentRect.left));
      const movePercent = moveX / currentRect.width;
      const moveTargetTime = Math.round((movePercent * duration) * 10) / 10;

      if (type === 'start') {
        const newStart = Math.max(0, Math.min(moveTargetTime, endTimeRef.current - 0.1));
        setStartTime(newStart);
        startTimeRef.current = newStart;
      } else {
        const newEnd = Math.min(duration, Math.max(moveTargetTime, startTimeRef.current + 0.1));
        setEndTime(newEnd);
        endTimeRef.current = newEnd;
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', updateTime);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', updateTime);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleDragBlock = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!timelineRef.current || !duration) return;

    setIsPreviewCrop(false);
    
    const startX = e.clientX;
    const initialStartTime = startTimeRef.current;
    const initialEndTime = endTimeRef.current;
    const blockDuration = initialEndTime - initialStartTime;

    const updateTime = (moveEvent: MouseEvent) => {
      const currentRect = timelineRef.current?.getBoundingClientRect();
      if (!currentRect) return;
      
      const deltaX = moveEvent.clientX - startX;
      const deltaPercent = deltaX / currentRect.width;
      const deltaTime = deltaPercent * duration;
      
      let newStart = initialStartTime + deltaTime;
      let newEnd = initialEndTime + deltaTime;

      if (newStart < 0) {
        newStart = 0;
        newEnd = blockDuration;
      } else if (newEnd > duration) {
        newEnd = duration;
        newStart = duration - blockDuration;
      }

      setStartTime(newStart);
      startTimeRef.current = newStart;
      setEndTime(newEnd);
      endTimeRef.current = newEnd;
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', updateTime);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', updateTime);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handlePhysicalCut = async () => {
    try {
      setIsProcessing(true);
      setProcessingProgress(0);
      
      const ffmpeg = ffmpegRef.current;
      
      ffmpeg.on('progress', ({ progress }) => {
        setProcessingProgress(Math.round(progress * 100));
      });

      if (!ffmpeg.loaded) {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
      }

      await ffmpeg.writeFile('input.mp4', await fetchFile(element.content));

      const actualEnd = (endTime > startTime && endTime <= duration) ? endTime : duration;
      const startStr = startTime.toString();
      const endStr = actualEnd.toString();

      // -c copy is extremely fast and uses no CPU, perfect for this!
      await ffmpeg.exec(['-i', 'input.mp4', '-ss', startStr, '-to', endStr, '-c:v', 'copy', '-c:a', 'copy', 'output.mp4']);

      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([(data as Uint8Array).buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      setTrimmedVideoUrl(url);
      setIsPreviewCrop(true);
      
      if (previewVideoRef.current) {
        previewVideoRef.current.src = url;
        previewVideoRef.current.load();
        previewVideoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
      
    } catch (error) {
      console.error('Error al cortar físicamente el video:', error);
      alert('Hubo un error al recortar el video físicamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      if (trimmedVideoUrl) {
        await onSave({
          content: trimmedVideoUrl,
          videoStartTime: 0,
          videoEndTime: 0,
          videoMuted: isMuted,
          videoLoopMode: loopMode,
          videoSpeed: speed,
        }, false);
      } else {
        await onSave({
          videoStartTime: startTime,
          videoEndTime: endTime,
          videoMuted: isMuted,
          videoLoopMode: loopMode,
          videoSpeed: speed,
        }, false);
      }
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveNew = async () => {
    setIsProcessing(true);
    try {
      if (trimmedVideoUrl) {
        await onSave({
          content: trimmedVideoUrl,
          videoStartTime: 0,
          videoEndTime: 0,
          videoMuted: isMuted,
          videoLoopMode: loopMode,
          videoSpeed: speed,
        }, true);
      } else {
        await onSave({
          videoStartTime: startTime,
          videoEndTime: endTime,
          videoMuted: isMuted,
          videoLoopMode: loopMode,
          videoSpeed: speed,
        }, true);
      }
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const actualEndTime = (endTime > startTime && endTime <= duration) ? endTime : duration;
  const activeSegmentDuration = Math.max(0.1, actualEndTime - startTime);
  const startPercent = duration > 0 ? (startTime / duration) * 100 : 0;
  const endPercent = duration > 0 ? (actualEndTime / duration) * 100 : 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-150 font-sans">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl border rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-main)',
        }}
      >
        {/* MODAL HEADER */}
        <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-none flex items-center justify-center border" style={{ backgroundColor: 'var(--primary-accent-light)', borderColor: 'var(--primary-accent)', color: 'var(--primary-accent)' }}>
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
            className="p-1.5 rounded-none border transition-all cursor-pointer opacity-70 hover:opacity-100"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY GRID (COLUMNA IZQUIERDA: PREVIEW 9:16 | COLUMNA DERECHA: TIMELINE & CONTROLES) */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* COLUMNA IZQUIERDA: VISTA PREVIA FINAL EN SMARTPHONE 9:16 (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 rounded-none border h-full min-h-[380px]" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
            <div className="relative h-[430px] max-h-full aspect-[9/16] rounded-none overflow-hidden bg-black border-2 shadow-2xl flex items-center justify-center" style={{ borderColor: 'var(--border-color)' }}>
              {element.content ? (
                <video
                  ref={previewVideoRef}
                  src={element.content}
                  autoPlay
                  playsInline
                  crossOrigin="anonymous"
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
              <div 
                ref={timeBadgeRef}
                className="absolute top-3 right-3 bg-black/70 px-3 py-1 rounded-full text-[10px] font-mono font-extrabold border shadow-md z-10" 
                style={{ borderColor: 'var(--primary-accent)', color: 'var(--primary-accent)' }}
              >
                {currentTime.toFixed(1)}s / {duration > 0 ? duration.toFixed(1) : 0}s
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: TIMELINE DE RECORTE & AJUSTES (7 COLS) */}
          <div className="lg:col-span-7 space-y-4 flex flex-col justify-center">
            {/* PISTA PRINCIPAL DE VIDEO RECORTADO */}
            <div className="space-y-3 p-4 rounded-none border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
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
                    className="p-1.5 rounded-none border transition-all cursor-pointer flex items-center justify-center"
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
                    className="p-1.5 rounded-none border transition-all cursor-pointer flex items-center justify-center"
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

              {/* PISTA Y BOTON DE RECORTE */}
              <div className="flex gap-4 items-stretch">
                <div
                  ref={timelineRef}
                  onMouseDown={handleTimelineMouseDown}
                  className="relative flex-1 rounded-none bg-slate-950 overflow-hidden cursor-pointer select-none shadow-2xl p-0"
                >
                  {/* 1. REGLA DE TIEMPO (MUESTRA DE 0 A DURATION) */}
                  <div className="h-6 w-full bg-slate-900/90 border-b border-white/10 flex items-center justify-between px-3 relative font-mono text-[9px] text-white/70 pointer-events-none">
                    {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                      const timeLabel = (duration * pct).toFixed(1);
                      return (
                        <div key={idx} className="flex flex-col items-center">
                          <span className="leading-none">{timeLabel}s</span>
                          <div className="w-0.5 h-1.5 bg-white/40 mt-0.5" />
                        </div>
                      );
                    })}
                  </div>

                  {/* CONTENEDOR DE FOTOGRAMAS Y SELECCIÓN (EL ALTO DEL FOTOGRAMA) */}
                  <div className="relative h-16 w-full">
                    {/* 2. FOTOGRAMAS EXCLUSIVOS DEL VIDEO */}
                    <div className="absolute inset-0 flex items-center bg-black">
                      {thumbnails.length > 0 ? (
                        thumbnails.map((thumb, idx) => {
                          const frameTime = ((idx / (thumbnails.length - 1)) * duration).toFixed(1);
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

                    {/* OVERLAYS OSCUROS FUERA DEL RECORTE */}
                    <div className="absolute top-0 bottom-0 left-0 bg-black/60 z-10 pointer-events-none" style={{ width: `${startPercent}%` }} />
                    <div className="absolute top-0 bottom-0 right-0 bg-black/60 z-10 pointer-events-none" style={{ width: `${100 - endPercent}%` }} />
                    
                    {/* MARCO DEL RECORTE Y MANIJAS */}
                    <div 
                      className="absolute top-0 bottom-0 border-y-2 z-20 group" 
                      style={{ borderColor: 'var(--primary-accent)', left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
                    >
                      {/* ÁREA CENTRAL ARRASTRABLE */}
                      <div 
                        onMouseDown={handleDragBlock}
                        className="absolute inset-y-0 left-1.5 right-1.5 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors pointer-events-auto"
                      />

                      {/* MANIJA START */}
                      <div 
                        onMouseDown={(e) => handleDragHandle(e, 'start')}
                        className="absolute top-0 bottom-0 left-0 w-4 -ml-2 cursor-ew-resize pointer-events-auto flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                        style={{ backgroundColor: 'var(--primary-accent)' }}
                      >
                        <div className="w-0.5 h-4 bg-white/70" />
                      </div>
                      {/* MANIJA END */}
                      <div 
                        onMouseDown={(e) => handleDragHandle(e, 'end')}
                        className="absolute top-0 bottom-0 right-0 w-4 -mr-2 cursor-ew-resize pointer-events-auto flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                        style={{ backgroundColor: 'var(--primary-accent)' }}
                      >
                        <div className="w-0.5 h-4 bg-white/70" />
                      </div>
                    </div>
                  </div>

                {/* AGUJA ROJA PRO */}
                <div
                  ref={redNeedleRef}
                  className="absolute top-0 bottom-0 z-25 pointer-events-none flex flex-col items-center -ml-[1px]"
                  style={{ left: `${Math.max(0, Math.min(100, duration > 0 ? (currentTime / duration) * 100 : 0))}%` }}
                >
                  <div className="w-3 h-3 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)] -mt-0.5 border border-white" />
                  <div className="w-0.5 h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)]" />
                </div>
              </div>

                {/* BOTÓN PREVISUALIZAR RECORTE EN LA COLUMNA DERECHA */}
                <button
                  type="button"
                  onClick={handlePhysicalCut}
                  disabled={isProcessing}
                  title={isProcessing ? 'Procesando...' : 'Aplicar Corte'}
                  className="w-[72px] shrink-0 flex flex-col items-center justify-center gap-1.5 rounded-none border transition-all cursor-pointer relative group"
                  style={{
                    backgroundColor: isPreviewCrop ? 'var(--primary-accent)' : 'var(--bg-card)',
                    borderColor: isPreviewCrop ? 'var(--primary-accent)' : 'var(--border-color)',
                    color: isPreviewCrop ? '#ffffff' : 'var(--text-main)',
                    opacity: isProcessing ? 0.7 : 1,
                    cursor: isProcessing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span className="text-[10px] font-extrabold uppercase text-center leading-tight">
                        {processingProgress}%
                      </span>
                    </>
                  ) : (
                    <>
                      <Scissors size={20} />
                      <span className="text-[10px] font-extrabold uppercase text-center leading-tight">
                        Cortar
                      </span>
                      {isPreviewCrop && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white border border-black animate-pulse" />
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* MODO DE REPRODUCCIÓN */}
            <div className="p-3.5 rounded-none border space-y-2" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
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
                      className="p-2.5 rounded-none border transition-all text-left cursor-pointer flex flex-col justify-between"
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
            <div className="p-3.5 rounded-none border space-y-2" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
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
                      className="py-2 rounded-none text-xs font-extrabold border transition-all cursor-pointer flex items-center justify-center"
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
            className="px-4 py-2 rounded-none text-xs font-extrabold border transition-colors cursor-pointer"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
          >
            Cancelar
          </button>
          
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleSaveNew}
              disabled={!trimmedVideoUrl || isProcessing}
              title={!trimmedVideoUrl ? "Debes hacer un corte físico primero" : "Guardar como un nuevo elemento de video"}
              className={`px-5 py-2 rounded-none text-xs font-extrabold transition-all flex items-center gap-1.5 border ${
                trimmedVideoUrl && !isProcessing
                  ? 'cursor-pointer hover:scale-105 active:scale-95 shadow-md' 
                  : 'cursor-not-allowed opacity-50'
              }`}
              style={{ 
                backgroundColor: 'var(--bg-app)', 
                borderColor: trimmedVideoUrl ? 'var(--primary-accent)' : 'var(--border-color)', 
                color: trimmedVideoUrl ? 'var(--primary-accent)' : 'var(--text-main)' 
              }}
            >
              {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Film size={14} />} Guardar Nuevo
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isProcessing}
              className={`px-5 py-2 rounded-none text-xs font-extrabold text-white transition-all flex items-center gap-1.5 shadow-md ${
                isProcessing ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:scale-105 active:scale-95'
              }`}
              style={{ backgroundColor: 'var(--primary-accent)' }}
            >
              {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Guardar Ajustes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
