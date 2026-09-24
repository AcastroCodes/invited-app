import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Film,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Check,
  Scissors,
  Loader2,
  RefreshCw,
  Repeat,
  Rewind,
  RotateCcw,
  Sparkles,
  Zap,
  Wand2,
} from 'lucide-react';
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
  const [loopMode, setLoopMode] = useState<
    'seamless' | 'loop' | 'pingpong' | 'yoyo' | 'once' | 'rewind' | 'reverse' | 'slowmo' | 'stutter'
  >((element.videoLoopMode as any) || 'seamless');
  const [speed, setSpeed] = useState<number>(Number(element.videoSpeed) || 1);

  useEffect(() => {
    const initStart = Number(element.videoStartTime) || 0;
    const initEnd = Number(element.videoEndTime) || 0;
    setStartTime(initStart);
    setEndTime(initEnd);
    startTimeRef.current = initStart;
    endTimeRef.current = initEnd;
    setIsMuted(element.videoMuted !== false);
    setLoopMode((element.videoLoopMode as any) || 'seamless');
    setSpeed(Number(element.videoSpeed) || 1);
  }, [element]);

  const startTimeRef = useRef<number>(startTime);
  const endTimeRef = useRef<number>(endTime);
  const redNeedleRef = useRef<HTMLDivElement>(null);
  const timeBadgeRef = useRef<HTMLDivElement>(null);

  // Cache para no volver a descargar/escribir el video fuente a memoria de FFmpeg
  const loadedInputSrcRef = useRef<string | null>(null);

  // FFmpeg State
  const ffmpegRef = useRef(new FFmpeg());
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [trimmedVideoUrl, setTrimmedVideoUrl] = useState<string | null>(null);

  // Dirección de reproducción para simulación JS en vivo (Ping-Pong / Reverse)
  const playbackDirRef = useRef<1 | -1>(1);

  useEffect(() => {
    startTimeRef.current = startTime;
    endTimeRef.current = endTime;
  }, [startTime, endTime]);

  // Procesar video automáticamente cuando la duración se carga y no hay vista previa recortada activa
  useEffect(() => {
    if (isOpen && element.content && duration > 0 && !trimmedVideoUrl && !isProcessing) {
      processVideoWithFFmpeg();
    }
  }, [isOpen, element.content, duration]);

  // Reproductor de vista previa y loop dentro de [startTime, endTime]
  useEffect(() => {
    const video = previewVideoRef.current;
    if (!video) return;

    video.muted = isMuted;

    let animId: number;

    const handleLoadedMetadata = () => {
      const dur = video.duration || 0;
      setDuration(dur);
      if (endTimeRef.current === 0 || endTimeRef.current > dur) {
        const endVal = Math.round(dur * 10) / 10;
        setEndTime(endVal);
        endTimeRef.current = endVal;
      }
      if (startTimeRef.current > 0 && !trimmedVideoUrl) {
        video.currentTime = startTimeRef.current;
      }
    };

    const updateTimeState = () => {
      if (video && !video.paused) {
        if (!trimmedVideoUrl) {
          const curStart = Math.max(0, startTimeRef.current);
          const curEnd = (endTimeRef.current > curStart && endTimeRef.current <= (duration || video.duration || 999))
            ? endTimeRef.current
            : (duration > 0 ? duration : (video.duration || 0));

          if (curEnd > curStart) {
            if (loopMode === 'reverse') {
              video.playbackRate = 1;
              if (video.currentTime <= curStart + 0.1 || video.currentTime > curEnd) {
                video.currentTime = curEnd - 0.05;
              } else {
                // Retroceder fotograma a fotograma si no hay video procesado
                video.currentTime = Math.max(curStart, video.currentTime - 0.04 * speed);
              }
            } else if (loopMode === 'pingpong' || loopMode === 'yoyo') {
              if (playbackDirRef.current === 1) {
                if (video.currentTime >= curEnd - 0.1) {
                  playbackDirRef.current = -1;
                }
              } else {
                if (video.currentTime <= curStart + 0.1) {
                  playbackDirRef.current = 1;
                  video.currentTime = curStart;
                } else {
                  video.currentTime = Math.max(curStart, video.currentTime - 0.04 * speed);
                }
              }
            } else if (loopMode === 'once') {
              video.playbackRate = speed;
              if (video.currentTime >= curEnd - 0.08) {
                video.pause();
                setIsPlaying(false);
              }
            } else if (loopMode === 'slowmo') {
              const segLen = curEnd - curStart;
              const midStart = curStart + segLen * 0.25;
              const midEnd = curStart + segLen * 0.75;
              if (video.currentTime >= midStart && video.currentTime <= midEnd) {
                video.playbackRate = 0.5 * speed;
              } else {
                video.playbackRate = 1.0 * speed;
              }
              if (video.currentTime >= curEnd - 0.08 || video.currentTime < curStart) {
                video.currentTime = curStart;
              }
            } else {
              // Seamless / standard loop
              video.playbackRate = speed;
              if (video.currentTime >= curEnd - 0.08 || video.currentTime < curStart) {
                video.currentTime = curStart;
              }
            }
          }
        } else {
          video.playbackRate = 1;
        }

        setCurrentTime(video.currentTime);
        if (redNeedleRef.current && duration > 0) {
          const percent = (video.currentTime / duration) * 100;
          redNeedleRef.current.style.left = `${Math.max(0, Math.min(100, percent))}%`;
        }
        if (timeBadgeRef.current) {
          const totalDur = trimmedVideoUrl ? (video.duration || 0) : duration;
          timeBadgeRef.current.textContent = `${video.currentTime.toFixed(1)}s / ${(totalDur > 0 ? totalDur : 0).toFixed(1)}s`;
        }
        animId = requestAnimationFrame(updateTimeState);
      }
    };

    if (isPlaying) {
      animId = requestAnimationFrame(updateTimeState);
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [isMuted, element.content, isPlaying, trimmedVideoUrl, duration, loopMode, speed]);

  const togglePlay = () => {
    const video = previewVideoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      if (!trimmedVideoUrl) {
        const curStart = Math.max(0, startTimeRef.current);
        const curEnd = endTimeRef.current > curStart ? endTimeRef.current : duration;
        if (video.currentTime < curStart || video.currentTime >= curEnd - 0.1) {
          video.currentTime = curStart;
        }
      }
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const timelineRef = useRef<HTMLDivElement>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number>(16 / 9);

  // Generar fotogramas de la línea de tiempo del video activo (fuente o procesado por el modo)
  useEffect(() => {
    const activeMediaSrc = trimmedVideoUrl || (element.content ? (element.content.startsWith('/') ? `${window.location.origin}${element.content}` : element.content) : null);
    if (!activeMediaSrc || !duration) return;

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
        let mediaUrl = activeMediaSrc;
        const response = await fetch(mediaUrl);
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
              }, 120);
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
        console.error('Error generando fotogramas:', error);
      }
    };

    generateThumbnails();

    return () => {
      cleanup();
    };
  }, [element.content, trimmedVideoUrl, duration]);

  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !duration) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const clickPercent = clickX / rect.width;
    const targetTime = Math.round((clickPercent * duration) * 10) / 10;

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

    setTrimmedVideoUrl(null);

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
        if (previewVideoRef.current) {
          previewVideoRef.current.currentTime = newStart;
        }
      } else {
        const newEnd = Math.min(duration, Math.max(moveTargetTime, startTimeRef.current + 0.1));
        setEndTime(newEnd);
        endTimeRef.current = newEnd;
        if (previewVideoRef.current) {
          previewVideoRef.current.currentTime = newEnd;
        }
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', updateTime);
      window.removeEventListener('mouseup', handleMouseUp);
      processVideoWithFFmpeg();
    };

    window.addEventListener('mousemove', updateTime);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleDragBlock = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!timelineRef.current || !duration) return;

    setTrimmedVideoUrl(null);

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

      if (previewVideoRef.current) {
        previewVideoRef.current.currentTime = newStart;
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', updateTime);
      window.removeEventListener('mouseup', handleMouseUp);
      processVideoWithFFmpeg();
    };

    window.addEventListener('mousemove', updateTime);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Referencia a la URL del blob procesado para liberar memoria con revokeObjectURL
  const trimmedUrlRef = useRef<string | null>(null);

  // Liberar la memoria de la vista previa de objetos Blob sin revertir al video base
  const releasePreviewMemory = () => {
    if (trimmedUrlRef.current) {
      try {
        URL.revokeObjectURL(trimmedUrlRef.current);
      } catch (e) {}
      trimmedUrlRef.current = null;
    }
  };

  // Limpiar memoria al cerrar el modal o desmontar el componente
  useEffect(() => {
    return () => {
      releasePreviewMemory();
    };
  }, []);

  // Motor NATIVO de Procesamiento de Video con Canvas y MediaRecorder (Respaldo 100% Confiable)
  const processVideoNative = async (
    targetMode: string,
    targetSpeed: number,
    targetMuted: boolean
  ): Promise<string | null> => {
    try {
      setIsProcessing(true);
      setProcessingProgress(10);

      let mediaUrl = element.content;
      if (!mediaUrl) return null;
      if (mediaUrl.startsWith('/')) {
        mediaUrl = `${window.location.origin}${mediaUrl}`;
      }

      // 1. Cargar el video fuente en un elemento HTMLVideoElement en memoria
      const tempVideo = document.createElement('video');
      tempVideo.crossOrigin = 'anonymous';
      tempVideo.src = mediaUrl;
      tempVideo.muted = true;
      tempVideo.playsInline = true;

      await new Promise<void>((resolve, reject) => {
        tempVideo.onloadedmetadata = () => resolve();
        tempVideo.onerror = () => reject(new Error('No se pudo cargar el video fuente'));
      });

      const videoWidth = tempVideo.videoWidth || 720;
      const videoHeight = tempVideo.videoHeight || 1280;
      const totalDur = tempVideo.duration || (duration > 0 ? duration : 5);

      const canvas = document.createElement('canvas');
      canvas.width = Math.min(640, videoWidth);
      canvas.height = Math.round((canvas.width * videoHeight) / videoWidth);
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

      const fps = 25;
      const stream = canvas.captureStream(fps);

      let mimeType = 'video/webm;codecs=vp8';
      if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264')) {
        mimeType = 'video/mp4;codecs=h264';
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
      }

      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2000000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.start();

      type FrameTask = { time: number };
      const frameQueue: FrameTask[] = [];
      const step = (1 / fps) * targetSpeed;

      if (targetMode === 'pingpong' || targetMode === 'yoyo') {
        for (let t = 0; t <= totalDur; t += step) frameQueue.push({ time: t });
        for (let t = totalDur; t >= 0; t -= step) frameQueue.push({ time: t });
      } else if (targetMode === 'reverse') {
        for (let t = totalDur; t >= 0; t -= step) frameQueue.push({ time: t });
      } else if (targetMode === 'rewind') {
        for (let t = 0; t <= totalDur; t += step) frameQueue.push({ time: t });
        for (let t = totalDur; t >= 0; t -= (step * 3)) frameQueue.push({ time: t });
      } else if (targetMode === 'slowmo') {
        const p1 = totalDur * 0.25;
        const p2 = totalDur * 0.75;
        for (let t = 0; t < p1; t += step) frameQueue.push({ time: t });
        for (let t = p1; t < p2; t += (step * 0.5)) frameQueue.push({ time: t });
        for (let t = p2; t <= totalDur; t += step) frameQueue.push({ time: t });
      } else if (targetMode === 'stutter') {
        const pulseLen = Math.min(0.4, totalDur / 3);
        for (let pulse = 0; pulse < 3; pulse++) {
          for (let t = 0; t <= pulseLen; t += step) frameQueue.push({ time: t });
        }
        for (let t = 0; t <= totalDur; t += step) frameQueue.push({ time: t });
      } else {
        for (let t = 0; t <= totalDur; t += step) frameQueue.push({ time: t });
      }

      const totalFrames = frameQueue.length;

      for (let i = 0; i < totalFrames; i++) {
        const task = frameQueue[i];
        tempVideo.currentTime = Math.max(0, Math.min(totalDur, task.time));
        await new Promise<void>((res) => {
          const onSeeked = () => {
            tempVideo.removeEventListener('seeked', onSeeked);
            res();
          };
          tempVideo.addEventListener('seeked', onSeeked);
        });

        ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
        setProcessingProgress(Math.min(99, Math.round(((i + 1) / totalFrames) * 100)));
        await new Promise((r) => setTimeout(r, 6));
      }

      recorder.stop();

      const newUrl = await new Promise<string>((res) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          res(URL.createObjectURL(blob));
        };
      });

      releasePreviewMemory();
      trimmedUrlRef.current = newUrl;
      setTrimmedVideoUrl(newUrl);
      setProcessingProgress(100);

      if (previewVideoRef.current) {
        previewVideoRef.current.src = newUrl;
        previewVideoRef.current.load();
        previewVideoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }

      return newUrl;
    } catch (err) {
      console.error('Error en procesador nativo canvas:', err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Motor Ultra-Rápido de Procesamiento Unificado con FFmpeg WASM y Gestión de Memoria
  const processVideoWithFFmpeg = async (
    targetMode = loopMode,
    targetSpeed = speed,
    targetMuted = isMuted
  ): Promise<string | null> => {
    try {
      setIsProcessing(true);
      setProcessingProgress(5);

      const ffmpeg = ffmpegRef.current;

      ffmpeg.on('progress', ({ progress }) => {
        setProcessingProgress(Math.min(99, Math.round(progress * 100)));
      });

      if (!ffmpeg.loaded) {
        try {
          const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
          await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
          });
        } catch (e1) {
          const fallbackURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd';
          await ffmpeg.load({
            coreURL: await toBlobURL(`${fallbackURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${fallbackURL}/ffmpeg-core.wasm`, 'application/wasm'),
          });
        }
      }

      // Cargar video fuente en memoria de FFmpeg
      if (loadedInputSrcRef.current !== element.content) {
        let mediaUrl = element.content;
        if (mediaUrl.startsWith('/')) {
          mediaUrl = `${window.location.origin}${mediaUrl}`;
        }
        const resp = await fetch(mediaUrl);
        const arrayBuf = await resp.arrayBuffer();
        await ffmpeg.writeFile('input.mp4', new Uint8Array(arrayBuf));
        loadedInputSrcRef.current = element.content;
      }

      // Procesar el video completo (0 a duration) ignorando recortes de la línea de tiempo para probar los modos
      const sourceDur = (previewVideoRef.current?.duration && previewVideoRef.current.duration > 0)
        ? previewVideoRef.current.duration
        : (duration > 0 ? duration : 5);
      const segStart = 0;
      const segEnd = sourceDur;
      const segDur = Math.max(0.3, segEnd - segStart);

      const speedFilter = targetSpeed !== 1 ? `,setpts=${(1 / targetSpeed).toFixed(4)}*PTS` : '';
      const scaleFilter = `scale=-2:'min(720,ih)',format=yuv420p`;
      const fastEncoding = ['-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '26', '-pix_fmt', 'yuv420p'];

      // Limpiar output previo si existe
      try {
        await ffmpeg.deleteFile('output.mp4');
      } catch (e) {}

      let ffmpegArgs: string[] = [];

      if (targetMode === 'once') {
        const filterGraph = `[0:v]trim=start=${segStart.toFixed(2)}:end=${segEnd.toFixed(2)},setpts=PTS-STARTPTS,${scaleFilter}${speedFilter}[outv]`;
        ffmpegArgs = ['-y', '-i', 'input.mp4', '-filter_complex', filterGraph, '-map', '[outv]', ...fastEncoding, ...(targetMuted ? ['-an'] : []), 'output.mp4'];
      } else if (targetMode === 'seamless' || targetMode === 'loop') {
        const fadeDur = Math.max(0.1, Math.min(0.5, segDur / 4));
        const offset = Math.max(0.1, segDur - fadeDur);
        const filterGraph = `[0:v]trim=start=${segStart.toFixed(2)}:end=${segEnd.toFixed(2)},setpts=PTS-STARTPTS,${scaleFilter}[seg];` +
          `[seg]split=2[v1][v2_full];` +
          `[v2_full]trim=start=0:end=${fadeDur.toFixed(2)},setpts=PTS-STARTPTS[v2];` +
          `[v1][v2]xfade=transition=fade:duration=${fadeDur.toFixed(2)}:offset=${offset.toFixed(2)}${speedFilter}[outv]`;

        ffmpegArgs = ['-y', '-i', 'input.mp4', '-filter_complex', filterGraph, '-map', '[outv]', ...fastEncoding, ...(targetMuted ? ['-an'] : []), 'output.mp4'];
      } else if (targetMode === 'pingpong' || targetMode === 'yoyo') {
        const filterGraph = `[0:v]trim=start=${segStart.toFixed(2)}:end=${segEnd.toFixed(2)},setpts=PTS-STARTPTS,${scaleFilter}[base];` +
          `[base]split=2[f1][f2];` +
          `[f2]reverse[rev];` +
          `[f1][rev]concat=n=2:v=1:a=0${speedFilter}[outv]`;

        ffmpegArgs = ['-y', '-i', 'input.mp4', '-filter_complex', filterGraph, '-map', '[outv]', ...fastEncoding, ...(targetMuted ? ['-an'] : []), 'output.mp4'];
      } else if (targetMode === 'rewind') {
        const filterGraph = `[0:v]trim=start=${segStart.toFixed(2)}:end=${segEnd.toFixed(2)},setpts=PTS-STARTPTS,${scaleFilter}[base];` +
          `[base]split=2[f1][f2];` +
          `[f2]reverse,setpts=0.333*PTS-STARTPTS[rev_fast];` +
          `[f1][rev_fast]concat=n=2:v=1:a=0${speedFilter}[outv]`;

        ffmpegArgs = ['-y', '-i', 'input.mp4', '-filter_complex', filterGraph, '-map', '[outv]', ...fastEncoding, ...(targetMuted ? ['-an'] : []), 'output.mp4'];
      } else if (targetMode === 'reverse') {
        const filterGraph = `[0:v]trim=start=${segStart.toFixed(2)}:end=${segEnd.toFixed(2)},setpts=PTS-STARTPTS,reverse,${scaleFilter}${speedFilter}[outv]`;
        ffmpegArgs = ['-y', '-i', 'input.mp4', '-filter_complex', filterGraph, '-map', '[outv]', ...fastEncoding, ...(targetMuted ? ['-an'] : []), 'output.mp4'];
      } else if (targetMode === 'slowmo') {
        const p1 = segDur * 0.25;
        const p2 = segDur * 0.75;
        const filterGraph = `[0:v]trim=start=${segStart.toFixed(2)}:end=${(segStart + p1).toFixed(2)},setpts=PTS-STARTPTS,${scaleFilter}[part1];` +
          `[0:v]trim=start=${(segStart + p1).toFixed(2)}:end=${(segStart + p2).toFixed(2)},setpts=2.0*PTS-STARTPTS,${scaleFilter}[part2];` +
          `[0:v]trim=start=${(segStart + p2).toFixed(2)}:end=${segEnd.toFixed(2)},setpts=PTS-STARTPTS,${scaleFilter}[part3];` +
          `[part1][part2][part3]concat=n=3:v=1:a=0${speedFilter}[outv]`;

        ffmpegArgs = ['-y', '-i', 'input.mp4', '-filter_complex', filterGraph, '-map', '[outv]', ...fastEncoding, ...(targetMuted ? ['-an'] : []), 'output.mp4'];
      } else if (targetMode === 'stutter') {
        const pulseLen = Math.min(0.4, segDur / 3);
        const filterGraph = `[0:v]trim=start=${segStart.toFixed(2)}:end=${segEnd.toFixed(2)},setpts=PTS-STARTPTS,${scaleFilter}[full_base];` +
          `[full_base]split=2[full1][full2];` +
          `[full1]trim=start=0:end=${pulseLen.toFixed(2)},setpts=PTS-STARTPTS[pulse_base];` +
          `[pulse_base]split=3[p1][p2][p3];` +
          `[p1][p2][p3][full2]concat=n=4:v=1:a=0${speedFilter}[outv]`;

        ffmpegArgs = ['-y', '-i', 'input.mp4', '-filter_complex', filterGraph, '-map', '[outv]', ...fastEncoding, ...(targetMuted ? ['-an'] : []), 'output.mp4'];
      }

      await ffmpeg.exec(ffmpegArgs);

      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([(data as Uint8Array).buffer], { type: 'video/mp4' });
      const newUrl = URL.createObjectURL(blob);

      trimmedUrlRef.current = newUrl;
      setTrimmedVideoUrl(newUrl);
      setProcessingProgress(100);

      // Cargar y reproducir inmediatamente la nueva instancia limpia de video
      if (previewVideoRef.current) {
        previewVideoRef.current.src = newUrl;
        previewVideoRef.current.load();
        previewVideoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }

      return newUrl;
    } catch (error: any) {
      console.warn('FFmpeg WASM no disponible, usando procesador nativo Canvas:', error);
      return await processVideoNative(targetMode, targetSpeed, targetMuted);
    } finally {
      setIsProcessing(false);
    }
  };

  // Manejar cambio directo de Modo de Reproducción con procesamiento inmediato
  const handleSelectMode = (newMode: typeof loopMode) => {
    setLoopMode(newMode);
    processVideoWithFFmpeg(newMode, speed, isMuted);
  };

  // Manejar cambio directo de Velocidad con procesamiento inmediato
  const handleSelectSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
    processVideoWithFFmpeg(loopMode, newSpeed, isMuted);
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      let finalUrl = trimmedVideoUrl;
      if (!finalUrl) {
        finalUrl = await processVideoWithFFmpeg();
      }

      if (finalUrl) {
        await onSave({
          content: finalUrl,
          videoStartTime: 0,
          videoEndTime: 0,
          videoMuted: isMuted,
          videoLoopMode: loopMode,
          videoSpeed: 1,
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
      let finalUrl = trimmedVideoUrl;
      if (!finalUrl) {
        finalUrl = await processVideoWithFFmpeg();
      }

      if (finalUrl) {
        await onSave({
          content: finalUrl,
          videoStartTime: 0,
          videoEndTime: 0,
          videoMuted: isMuted,
          videoLoopMode: loopMode,
          videoSpeed: 1,
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

  const REPRODUCTION_MODES = [
    { id: 'seamless', label: 'Bucle Suave', desc: 'Fundido sin salto', icon: RefreshCw },
    { id: 'pingpong', label: 'Ping-Pong', desc: 'Efecto Boomerang', icon: Repeat },
    { id: 'rewind', label: 'Rebobinado 3x', desc: 'Efecto retro VHS', icon: Rewind },
    { id: 'slowmo', label: 'Cámara Lenta', desc: 'Centro emotivo 0.5x', icon: Sparkles },
    { id: 'reverse', label: 'Reversa Pura', desc: 'Inversión completa', icon: RotateCcw },
    { id: 'stutter', label: 'Stutter 3x', desc: 'Ritmo 1, 2, 3... Go!', icon: Zap },
    { id: 'once', label: 'Una Vez', desc: 'Reproducción limpia', icon: Play },
  ];

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
              <h3 className="text-sm font-extrabold tracking-wide uppercase" style={{ color: 'var(--text-main)' }}>Editor de Video Profesional</h3>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Procesamiento unificado con FFmpeg WASM: Corte, Modos de Reproducción y Vista Previa Real</p>
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

        {/* MODAL BODY GRID (COLUMNA IZQUIERDA: PREVIEW SMARTPHONE 9:16 | COLUMNA DERECHA: CONTROLES) */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* COLUMNA IZQUIERDA: VISTA PREVIA FINAL EN SMARTPHONE 9:16 (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 rounded-none border h-full min-h-[380px]" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
            <div className="relative h-[430px] max-h-full aspect-[9/16] rounded-none overflow-hidden bg-black border-2 shadow-2xl flex items-center justify-center" style={{ borderColor: 'var(--border-color)' }}>
              {/* OVERLAY DE CARGA DE PROCESAMIENTO FFMPEG */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-30 animate-in fade-in duration-150">
                  <Loader2 size={36} className="animate-spin text-emerald-400 mb-2" />
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider text-center">Procesando Modo</span>
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 font-extrabold">{processingProgress}%</span>
                </div>
              )}

              {element.content ? (
                <video
                  key={trimmedVideoUrl || element.content}
                  ref={previewVideoRef}
                  src={trimmedVideoUrl || (element.content.startsWith('/') ? `${window.location.origin}${element.content}` : element.content)}
                  autoPlay
                  loop
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

              {/* INDICADOR DE VIDEO PROCESADO */}
              {trimmedVideoUrl && !isProcessing && (
                <div className="absolute bottom-3 left-3 bg-emerald-500/90 text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-white/20 shadow-md flex items-center gap-1 z-10 animate-in zoom-in-50 duration-200">
                  <Check size={10} /> Video Procesado (Vista Previa Real)
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA: TIMELINE DE RECORTE & MODOS DE REPRODUCCIÓN (7 COLS) */}
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
                    onClick={() => {
                      const nextMute = !isMuted;
                      setIsMuted(nextMute);
                      processVideoWithFFmpeg(loopMode, speed, nextMute);
                    }}
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

              {/* PISTA Y BOTON DE PROCESAMIENTO */}
              <div className="flex gap-4 items-stretch">
                <div
                  ref={timelineRef}
                  onMouseDown={handleTimelineMouseDown}
                  className="relative flex-1 rounded-none bg-slate-950 overflow-hidden cursor-pointer select-none shadow-2xl p-0"
                >
                  {/* REGLA DE TIEMPO */}
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

                  {/* FOTOGRAMAS Y MANIJAS */}
                  <div className="relative h-16 w-full">
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

                    {/* OVERLAYS OSCUROS */}
                    <div className="absolute top-0 bottom-0 left-0 bg-black/60 z-10 pointer-events-none" style={{ width: `${startPercent}%` }} />
                    <div className="absolute top-0 bottom-0 right-0 bg-black/60 z-10 pointer-events-none" style={{ width: `${100 - endPercent}%` }} />

                    {/* MARCO DE SELECCIÓN Y MANIJAS */}
                    <div
                      className="absolute top-0 bottom-0 border-y-2 z-20 group"
                      style={{ borderColor: 'var(--primary-accent)', left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
                    >
                      <div
                        onMouseDown={handleDragBlock}
                        className="absolute inset-y-0 left-1.5 right-1.5 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors pointer-events-auto"
                      />
                      <div
                        onMouseDown={(e) => handleDragHandle(e, 'start')}
                        className="absolute top-0 bottom-0 left-0 w-4 -ml-2 cursor-ew-resize pointer-events-auto flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                        style={{ backgroundColor: 'var(--primary-accent)' }}
                      >
                        <div className="w-0.5 h-4 bg-white/70" />
                      </div>
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

                {/* BOTÓN PROCESAR Y PREVISUALIZAR */}
                <button
                  type="button"
                  onClick={() => processVideoWithFFmpeg()}
                  disabled={isProcessing}
                  title={isProcessing ? 'Procesando...' : 'Aplicar Filtros y Previsualizar'}
                  className="w-[84px] shrink-0 flex flex-col items-center justify-center gap-1.5 rounded-none border transition-all cursor-pointer relative group shadow-md"
                  style={{
                    backgroundColor: trimmedVideoUrl ? 'var(--primary-accent)' : 'var(--bg-card)',
                    borderColor: trimmedVideoUrl ? 'var(--primary-accent)' : 'var(--border-color)',
                    color: trimmedVideoUrl ? '#ffffff' : 'var(--text-main)',
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
                      <Wand2 size={20} className="transition-transform group-hover:scale-110" />
                      <span className="text-[9px] font-extrabold uppercase text-center leading-tight">
                        Procesar
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* MODOS DE REPRODUCCIÓN PROFESIONALES */}
            <div className="p-3.5 rounded-none border space-y-2" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
              <span className="block text-[11px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--primary-accent)' }}>
                Modos de Reproducción Profesionales
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {REPRODUCTION_MODES.map((m) => {
                  const Icon = m.icon;
                  const isActive = loopMode === m.id || (m.id === 'seamless' && loopMode === 'loop');
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectMode(m.id as any)}
                      disabled={isProcessing}
                      className="p-2 rounded-none border transition-all text-left cursor-pointer flex flex-col justify-between group hover:scale-[1.02] disabled:opacity-50"
                      style={{
                        backgroundColor: isActive ? 'var(--primary-accent-light)' : 'var(--bg-card)',
                        borderColor: isActive ? 'var(--primary-accent)' : 'var(--border-color)',
                        color: isActive ? 'var(--primary-accent)' : 'var(--text-main)',
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold leading-tight">{m.label}</span>
                        <Icon size={14} className="shrink-0 opacity-70 group-hover:opacity-100" />
                      </div>
                      <span className="text-[9px] opacity-75 mt-1 font-medium leading-tight">{m.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* VELOCIDAD DE REPRODUCCIÓN */}
            <div className="p-3.5 rounded-none border space-y-2" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
              <span className="block text-[11px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--primary-accent)' }}>
                Velocidad del Fragmento ({speed}x)
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 1, 1.5, 2].map((s) => {
                  const isActive = speed === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSelectSpeed(s)}
                      disabled={isProcessing}
                      className="py-2 rounded-none text-xs font-extrabold border transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
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
              disabled={isProcessing}
              title="Guardar como un nuevo elemento de video unificado"
              className={`px-5 py-2 rounded-none text-xs font-extrabold transition-all flex items-center gap-1.5 border ${
                !isProcessing
                  ? 'cursor-pointer hover:scale-105 active:scale-95 shadow-md'
                  : 'cursor-not-allowed opacity-50'
              }`}
              style={{
                backgroundColor: 'var(--bg-app)',
                borderColor: 'var(--primary-accent)',
                color: 'var(--primary-accent)',
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
