import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { AbsoluteFill, Video as RemotionVideo } from 'remotion';
import {
  X, Play, Pause, Check, Loader2, Volume2, VolumeX, Scissors, 
  Settings2, Wand2, Repeat, Rewind, FastForward, Film, Zap, RefreshCcw, RotateCcw
} from 'lucide-react';
import type { CanvasElement } from '../types/designerTypes';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import WebMWriter from 'webm-writer';

interface VideoEditorModalProps {
  isOpen: boolean;
  element: CanvasElement;
  onClose: () => void;
  onSave: (updates: Partial<CanvasElement>, saveAsNew?: boolean) => void | Promise<void>;
}

const MODES = [
  { id: 'once', name: 'Normal', icon: Play },
  { id: 'seamless', name: 'Bucle Suave', icon: Repeat },
  { id: 'pingpong', name: 'Ping-Pong', icon: RefreshCcw },
  { id: 'boomerang', name: 'Boomerang', icon: Zap },
  { id: 'zoom', name: 'Zoom Dinámico', icon: Wand2 },
  { id: 'stutter', name: 'Tartamudeo', icon: FastForward },
  { id: 'mirror', name: 'Espejo', icon: Scissors },
  { id: 'colorflash', name: 'Blanco / Color', icon: Film },
  { id: 'rewind', name: 'Rebobinar', icon: Rewind },
  { id: 'reverse', name: 'Reversa', icon: RotateCcw },
  { id: 'slowmo', name: 'Cámara Lenta', icon: Zap },
];

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

// Composición principal de Remotion
const VideoComposition: React.FC<{
  src: string;
  startFrame: number;
  endFrame: number;
  isMuted: boolean;
  speed: number;
  loopMode: string;
}> = ({ src, startFrame, endFrame, isMuted, speed, loopMode }) => {
  return (
    <AbsoluteFill className="flex items-center justify-center bg-black">
      <RemotionVideo
        src={src}
        startFrom={startFrame}
        endAt={endFrame}
        muted={isMuted}
        playbackRate={speed}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </AbsoluteFill>
  );
};

export const VideoEditorModal: React.FC<VideoEditorModalProps> = ({
  isOpen,
  element,
  onClose,
  onSave,
}) => {
  const playerRef = useRef<HTMLVideoElement | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [durationInSeconds, setDurationInSeconds] = useState(0);
  const [videoWidth, setVideoWidth] = useState(720);
  const [videoHeight, setVideoHeight] = useState(1280);
  
  const [startTime, setStartTime] = useState<number>(Number(element.videoStartTime) || 0);
  const [endTime, setEndTime] = useState<number>(Number(element.videoEndTime) || 0);
  const [isMuted, setIsMuted] = useState<boolean>(element.videoMuted !== false);
  const [speed, setSpeed] = useState<number>(Number(element.videoSpeed) || 1);
  const [loopMode, setLoopMode] = useState<string>((element.videoLoopMode as string) || 'once');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'trim' | 'effects'>('trim');
  const [showResultModal, setShowResultModal] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [videoAspectRatio, setVideoAspectRatio] = useState(16 / 9);

  // FFmpeg states
  const ffmpegRef = useRef(new FFmpeg());
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [trimmedVideoUrl, setTrimmedVideoUrl] = useState<string | null>(null);
  const loadedInputSrcRef = useRef<string | null>(null);

  const fps = 30;

  const startTimeRef = useRef(startTime);
  const endTimeRef = useRef(endTime);
  const lastSeekRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = startTime;
    endTimeRef.current = endTime;
  }, [startTime, endTime]);

  // Bucle de reproducción acotado entre startTime y endTime
  useEffect(() => {
    if (!isOpen) return;

    const intervalId = setInterval(() => {
      const video = playerRef.current;
      if (video && !video.paused && !video.seeking && video.readyState >= 2) {
        const start = startTimeRef.current;
        const end = endTimeRef.current || video.duration;
        
        // Si el video sobrepasa la marca final o reinició por loop nativo a 0 (cuando start > 0.3)
        if (end > start + 0.2) {
          if (video.currentTime >= end - 0.15 || (start > 0.3 && video.currentTime < start - 0.2)) {
            video.currentTime = start;
          }
        }
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, [isOpen]);

  // Sincronizar velocidad de reproducción cuando cambie la velocidad
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Generar fotogramas de la línea de tiempo del video activo (fuente o procesado por el modo)
  useEffect(() => {
    const activeMediaSrc = trimmedVideoUrl || (element.content ? (element.content.startsWith('/') ? `${window.location.origin}${element.content}` : element.content) : null);
    if (!activeMediaSrc || !durationInSeconds || !isOpen) return;

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
        const response = await fetch(activeMediaSrc);
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
        hiddenVideo.style.opacity = '0.01';
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
            const timelineWidth = timelineRef.current.clientWidth || 600;
            const thumbHeight = 64;
            const thumbWidth = thumbHeight * aspectRatio;
            count = Math.max(3, Math.ceil(timelineWidth / thumbWidth));
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
              const targetTime = Math.max(0.05, Math.min(durationInSeconds - 0.05, targetPercent * durationInSeconds));
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
                    frames.push(canvas.toDataURL('image/jpeg', 0.85));
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
  }, [element.content, isOpen, durationInSeconds, trimmedVideoUrl]);

  useEffect(() => {
    if (!element.content || !isOpen) return;

    let mediaUrl = element.content;
    if (mediaUrl.startsWith('/')) {
      mediaUrl = `${window.location.origin}${mediaUrl}`;
    }

    const tempVideo = document.createElement('video');
    tempVideo.src = mediaUrl;
    tempVideo.crossOrigin = 'anonymous';
    
    tempVideo.onloadedmetadata = () => {
      setDurationInSeconds(tempVideo.duration);
      setVideoWidth(tempVideo.videoWidth || 720);
      setVideoHeight(tempVideo.videoHeight || 1280);
      
      if (endTime === 0 || endTime > tempVideo.duration) {
        setEndTime(tempVideo.duration);
      }
    };
  }, [element.content, isOpen]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);

    return () => {
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
    };
  }, [playerRef.current]);

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    }
    if (previewVideoRef.current) {
      if (previewVideoRef.current.paused) {
        previewVideoRef.current.play().catch(() => {});
      } else {
        previewVideoRef.current.pause();
      }
    }
  };

  const processVideoNative = async (
    targetMode: string,
    targetSpeed: number,
    targetMuted: boolean
  ): Promise<string | null> => {
    let canvas: HTMLCanvasElement | null = null;
    let actualSrc = '';
    try {
      setIsProcessing(true);
      setProcessingProgress(10);

      // Pausar el video de previsualización del editor para ahorrar memoria y CPU
      if (playerRef.current) {
        try { playerRef.current.pause(); } catch (e) {}
      }
      setIsPlaying(false);

      let mediaUrl = element.content;
      if (!mediaUrl) return null;
      if (mediaUrl.startsWith('/')) {
        mediaUrl = `${window.location.origin}${mediaUrl}`;
      }

      // 1. Cargar el video fuente en un elemento HTMLVideoElement en memoria
      actualSrc = mediaUrl;
      try {
        const response = await fetch(mediaUrl);
        const blob = await response.blob();
        actualSrc = URL.createObjectURL(blob);
      } catch (e) {
        console.warn('Could not fetch video into blob, falling back to direct URL:', e);
      }

      const tempVideo = document.createElement('video');
      tempVideo.crossOrigin = 'anonymous';
      tempVideo.src = actualSrc;
      tempVideo.muted = true;
      tempVideo.playsInline = true;

      tempVideo.style.position = 'fixed';
      tempVideo.style.top = '0';
      tempVideo.style.left = '0';
      tempVideo.style.opacity = '0.01';
      tempVideo.style.pointerEvents = 'none';
      tempVideo.style.zIndex = '-1000';
      document.body.appendChild(tempVideo);

      await new Promise<void>((resolve, reject) => {
        tempVideo.onloadedmetadata = () => resolve();
        tempVideo.onerror = () => reject(new Error('No se pudo cargar el video fuente'));
      });

      try {
        await tempVideo.play();
        tempVideo.pause();
      } catch (e) {}

      const videoWidth = tempVideo.videoWidth || 720;
      const videoHeight = tempVideo.videoHeight || 1280;
      const totalDur = tempVideo.duration || (durationInSeconds > 0 ? durationInSeconds : 5);

      const startSec = Math.max(0, startTime);
      const endSec = (endTime > 0 && endTime <= totalDur) ? endTime : totalDur;
      const rangeDur = Math.max(0.3, endSec - startSec);

      // Resolución de vista previa ultra-ligera (180p) para generación hiper-rápida (< 300ms)
      canvas = document.createElement('canvas');
      canvas.width = Math.min(180, videoWidth);
      canvas.height = Math.round((canvas.width * videoHeight) / videoWidth);
      
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.opacity = '0.01';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '-1000';
      document.body.appendChild(canvas);
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

      // 12 FPS y calidad WebP 0.6 para generación hiper-rápida en navegador con webm-writer
      const fps = 12;

      const videoWriter = new WebMWriter({
        quality: 0.6,
        frameRate: fps,
        width: canvas.width,
        height: canvas.height,
      });

      type FrameTask = { 
        time: number; 
        scale?: number; 
        mirror?: boolean; 
        grayscale?: number; 
      };
      const frameQueue: FrameTask[] = [];
      const step = (1 / fps) * targetSpeed;

      if (targetMode === 'pingpong' || targetMode === 'yoyo') {
        for (let t = startSec; t <= endSec; t += step) frameQueue.push({ time: t });
        for (let t = endSec; t >= startSec; t -= step) frameQueue.push({ time: t });
      } else if (targetMode === 'boomerang') {
        for (let t = startSec; t <= endSec; t += step) frameQueue.push({ time: t });
        for (let t = endSec; t >= startSec; t -= (step * 2)) frameQueue.push({ time: t });
      } else if (targetMode === 'zoom') {
        for (let t = startSec; t <= endSec; t += step) {
          const progress = (t - startSec) / rangeDur;
          const scale = 1.0 + Math.sin(progress * Math.PI) * 0.3;
          frameQueue.push({ time: t, scale });
        }
      } else if (targetMode === 'stutter') {
        for (let t = startSec; t <= endSec; t += step) frameQueue.push({ time: t });
        const stutterStart = Math.max(startSec, endSec - 0.35);
        for (let r = 0; r < 2; r++) {
          for (let t = stutterStart; t <= endSec; t += step) frameQueue.push({ time: t });
        }
      } else if (targetMode === 'mirror') {
        for (let t = startSec; t <= endSec; t += step) frameQueue.push({ time: t, mirror: false });
        for (let t = endSec; t >= startSec; t -= step) frameQueue.push({ time: t, mirror: true });
      } else if (targetMode === 'colorflash') {
        for (let t = startSec; t <= endSec; t += step) {
          const progress = (t - startSec) / rangeDur;
          frameQueue.push({ time: t, grayscale: 1.0 - progress });
        }
      } else if (targetMode === 'reverse') {
        for (let t = endSec; t >= startSec; t -= step) frameQueue.push({ time: t });
      } else if (targetMode === 'rewind') {
        for (let t = startSec; t <= endSec; t += step) frameQueue.push({ time: t });
        for (let t = endSec; t >= startSec; t -= (step * 3)) frameQueue.push({ time: t });
      } else if (targetMode === 'slowmo') {
        const p1 = startSec + rangeDur * 0.25;
        const p2 = startSec + rangeDur * 0.75;
        for (let t = startSec; t < p1; t += step) frameQueue.push({ time: t });
        for (let t = p1; t < p2; t += (step * 0.5)) frameQueue.push({ time: t });
        for (let t = p2; t <= endSec; t += step) frameQueue.push({ time: t });
      } else { // seamless, once, loop
        for (let t = startSec; t <= endSec; t += step) frameQueue.push({ time: t });
      }

      const totalFrames = frameQueue.length;
      const isSeamless = (targetMode === 'seamless');
      const fadeFramesCount = isSeamless ? Math.min(6, Math.max(3, Math.floor(totalFrames * 0.15))) : 0;

      for (let i = 0; i < totalFrames; i++) {
        const task = frameQueue[i];
        tempVideo.currentTime = Math.max(0, Math.min(totalDur, task.time));
        await new Promise<void>((res) => {
          const onSeeked = () => {
            tempVideo.removeEventListener('seeked', onSeeked);
            setTimeout(res, 2);
          };
          tempVideo.addEventListener('seeked', onSeeked);
        });

        ctx.save();
        ctx.globalAlpha = 1.0;
        ctx.filter = 'none';

        if (task.grayscale !== undefined && task.grayscale > 0) {
          ctx.filter = `grayscale(${Math.round(task.grayscale * 100)}%)`;
        }

        if (task.scale !== undefined && task.scale !== 1.0) {
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.scale(task.scale, task.scale);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);
        }

        if (task.mirror) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }

        ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        // En el modo Bucle Suave, aplicamos un fade gradual con los primeros fotogramas en el tramo final
        if (isSeamless && i >= totalFrames - fadeFramesCount) {
          const fadeIndex = i - (totalFrames - fadeFramesCount);
          const alpha = (fadeIndex + 1) / (fadeFramesCount + 1);
          const startTaskTime = frameQueue[fadeIndex]?.time ?? startSec;

          tempVideo.currentTime = Math.max(0, Math.min(totalDur, startTaskTime));
          await new Promise<void>((res) => {
            const onSeeked = () => {
              tempVideo.removeEventListener('seeked', onSeeked);
              setTimeout(res, 2);
            };
            tempVideo.addEventListener('seeked', onSeeked);
          });

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
          ctx.restore();
        }

        videoWriter.addFrame(canvas);
        setProcessingProgress(Math.min(99, Math.round(((i + 1) / totalFrames) * 100)));
        await new Promise((r) => setTimeout(r, 0));
      }

      const webmBlob = await videoWriter.complete();
      const newUrl = URL.createObjectURL(webmBlob);

      setTrimmedVideoUrl(newUrl);
      
      // Fix for WebM blobs having Infinity duration in Chrome:
      const actualDuration = totalFrames / fps;
      setDurationInSeconds(actualDuration);
      setStartTime(0);
      setEndTime(actualDuration);
      setProcessingProgress(100);
      setIsVideoLoading(true);
      return newUrl;
    } catch (err) {
      console.error('Error en procesador nativo canvas:', err);
      return null;
    } finally {
      try {
        if (canvas && canvas.parentNode) {
          document.body.removeChild(canvas);
        }
        const temps = document.querySelectorAll('video[style*="z-index: -1000"]');
        temps.forEach(v => {
          if (v.parentNode) v.parentNode.removeChild(v);
        });
        if (actualSrc && actualSrc.startsWith('blob:')) {
          URL.revokeObjectURL(actualSrc);
        }
      } catch(e) {}
      setIsProcessing(false);
    }
  };

  const processVideoWithFFmpeg = async (
    targetMode = loopMode,
    targetSpeed = speed,
    targetMuted = isMuted
  ): Promise<string | null> => {
    try {
      setIsProcessing(true);
      setProcessingProgress(5);

      if (playerRef.current) {
        try { playerRef.current.pause(); } catch (e) {}
      }
      setIsPlaying(false);

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

      if (loadedInputSrcRef.current !== element.content) {
        let mediaUrl = element.content || '';
        if (mediaUrl.startsWith('/')) {
          mediaUrl = `${window.location.origin}${mediaUrl}`;
        }
        const resp = await fetch(mediaUrl);
        const arrayBuf = await resp.arrayBuffer();
        await ffmpeg.writeFile('input.mp4', new Uint8Array(arrayBuf));
        loadedInputSrcRef.current = element.content;
      }

      const sourceDur = durationInSeconds > 0 ? durationInSeconds : 5;
      const segStart = startTime;
      const segEnd = endTime;
      const segDur = Math.max(0.3, segEnd - segStart);

      const speedFilter = targetSpeed !== 1 ? `,setpts=${(1 / targetSpeed).toFixed(4)}*PTS` : '';
      const scaleFilter = `scale=-2:'min(480,ih)',format=yuv420p`;
      const fastEncoding = ['-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '30', '-pix_fmt', 'yuv420p'];

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
        const filterGraph = 
          `[0:v]trim=start=${segStart.toFixed(2)}:end=${segEnd.toFixed(2)},setpts=PTS-STARTPTS,${scaleFilter}[seg];` +
          `[seg]split=2[v1][v2_full];` +
          `[v2_full]trim=start=0:end=${fadeDur.toFixed(2)},setpts=PTS-STARTPTS[v2];` +
          `[v1][v2]xfade=transition=fade:duration=${fadeDur.toFixed(2)}:offset=${offset.toFixed(2)}${speedFilter}[outv]`;
        ffmpegArgs = ['-y', '-i', 'input.mp4', '-filter_complex', filterGraph, '-map', '[outv]', ...fastEncoding, ...(targetMuted ? ['-an'] : []), 'output.mp4'];
      } else if (targetMode === 'pingpong' || targetMode === 'yoyo') {
        const filterGraph = 
          `[0:v]trim=start=${segStart.toFixed(2)}:end=${segEnd.toFixed(2)},setpts=PTS-STARTPTS,${scaleFilter}[base];` +
          `[base]split=2[f1][f2];` +
          `[f2]reverse[rev];` +
          `[f1][rev]concat=n=2:v=1:a=0${speedFilter}[outv]`;
        ffmpegArgs = ['-y', '-i', 'input.mp4', '-filter_complex', filterGraph, '-map', '[outv]', ...fastEncoding, ...(targetMuted ? ['-an'] : []), 'output.mp4'];
      } else if (targetMode === 'rewind') {
        const filterGraph = 
          `[0:v]trim=start=${segStart.toFixed(2)}:end=${segEnd.toFixed(2)},setpts=PTS-STARTPTS,${scaleFilter}[base];` +
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
        const filterGraph = 
          `[0:v]trim=start=${segStart.toFixed(2)}:end=${(segStart + p1).toFixed(2)},setpts=PTS-STARTPTS,${scaleFilter}[part1];` +
          `[0:v]trim=start=${(segStart + p1).toFixed(2)}:end=${(segStart + p2).toFixed(2)},setpts=2.0*PTS-STARTPTS,${scaleFilter}[part2];` +
          `[0:v]trim=start=${(segStart + p2).toFixed(2)}:end=${segEnd.toFixed(2)},setpts=PTS-STARTPTS,${scaleFilter}[part3];` +
          `[part1][part2][part3]concat=n=3:v=1:a=0${speedFilter}[outv]`;
        ffmpegArgs = ['-y', '-i', 'input.mp4', '-filter_complex', filterGraph, '-map', '[outv]', ...fastEncoding, ...(targetMuted ? ['-an'] : []), 'output.mp4'];
      } else {
        const filterGraph = `[0:v]trim=start=${segStart.toFixed(2)}:end=${segEnd.toFixed(2)},setpts=PTS-STARTPTS,${scaleFilter}${speedFilter}[outv]`;
        ffmpegArgs = ['-y', '-i', 'input.mp4', '-filter_complex', filterGraph, '-map', '[outv]', ...fastEncoding, ...(targetMuted ? ['-an'] : []), 'output.mp4'];
      }

      await ffmpeg.exec(ffmpegArgs);

      const blob = new Blob([data as Uint8Array], { type: 'video/mp4' });
      const newUrl = URL.createObjectURL(blob);

      setTrimmedVideoUrl(newUrl);
      
      // Update duration state to match new video
      const tempVideo = document.createElement('video');
      tempVideo.src = newUrl;
      tempVideo.onloadedmetadata = () => {
        setDurationInSeconds(tempVideo.duration);
        setStartTime(0);
        setEndTime(tempVideo.duration);
        setProcessingProgress(100);
      };
      setShowResultModal(true);
      return newUrl;
    } catch (error: any) {
      console.warn('FFmpeg WASM processing failed, using native canvas fallback:', error);
      return await processVideoNative(targetMode, targetSpeed, targetMuted);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    setIsProcessing(true);
    await onSave({
      content: trimmedVideoUrl || element.content,
      videoStartTime: startTime,
      videoEndTime: endTime,
      videoMuted: isMuted,
      videoSpeed: speed,
      videoLoopMode: loopMode as any,
    }, false);
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  const durationInFrames = Math.max(1, Math.floor((endTime - startTime) * fps));
  const startFrame = Math.floor(startTime * fps);
  const endFrame = Math.floor(endTime * fps);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
      <div 
        className="rounded-md w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl border"
        style={{ 
          backgroundColor: 'var(--bg-card)', 
          borderColor: 'var(--border-color)',
          color: 'var(--text-main)' 
        }}
      >
        
        {/* Header */}
        <div 
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-app)' }}
        >
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <h2 className="text-sm font-semibold">Editor de Video</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-md transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Workspace */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--bg-app)' }}>
            {/* Preview Section */}
            <div className={`flex-1 flex items-center justify-center p-4 gap-4 overflow-hidden ${trimmedVideoUrl ? 'flex-row' : ''}`}>
              {durationInSeconds > 0 ? (
                trimmedVideoUrl ? (
                  <>
                    {/* LADO IZQUIERDO: VIDEO ORIGINAL */}
                    <div className="relative h-full max-h-[60vh] aspect-[9/16] bg-black rounded-md overflow-hidden shadow-md flex flex-col border border-gray-800">
                      <div className="absolute top-2 left-2 z-20 bg-black/75 text-white text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm border border-white/20">
                        Video Original
                      </div>
                      <video
                        key="orig-side-video"
                        ref={playerRef}
                        src={element.content ? (element.content.startsWith('/') ? `${window.location.origin}${element.content}` : element.content) : ''}
                        className="w-full h-full object-contain cursor-pointer"
                        controls={false}
                        autoPlay
                        loop
                        playsInline
                        muted={isMuted}
                        onLoadedMetadata={(e: React.SyntheticEvent<HTMLVideoElement>) => {
                          const video = e.currentTarget;
                          video.playbackRate = speed;
                        }}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onClick={togglePlay}
                      />
                    </div>

                    {/* LADO DERECHO: PREVIEW GENERADO */}
                    <div className="relative h-full max-h-[60vh] aspect-[9/16] bg-black rounded-md overflow-hidden shadow-md flex flex-col border border-blue-900/50">
                      <div className="absolute top-2 left-2 z-20 bg-blue-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm border border-blue-400/30">
                        Vista Previa
                      </div>
                      {isProcessing && (
                        <div className="absolute inset-0 z-30 bg-black/85 flex flex-col items-center justify-center p-4 text-center backdrop-blur-[2px]">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-2" />
                          <span className="text-sm font-semibold text-white">Generando... {processingProgress}%</span>
                          <span className="text-[10px] text-gray-400 mt-1">Creando vista previa rápida</span>
                        </div>
                      )}
                      {!isProcessing && isVideoLoading && (
                        <div className="absolute inset-0 z-30 bg-black/85 flex flex-col items-center justify-center p-4 text-center backdrop-blur-[2px]">
                          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-2" />
                          <span className="text-xs font-medium text-white">Cargando vista previa...</span>
                          <span className="text-[10px] text-gray-400 mt-1">Preparando reproducción fluida</span>
                        </div>
                      )}
                      <video
                        key={trimmedVideoUrl}
                        src={trimmedVideoUrl}
                        ref={previewVideoRef}
                        className={`w-full h-full object-contain transition-opacity duration-300 cursor-pointer ${isVideoLoading ? 'opacity-0' : 'opacity-100'}`}
                        controls={false}
                        autoPlay
                        loop
                        preload="auto"
                        playsInline
                        muted={isMuted}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onClick={togglePlay}
                        onLoadStart={() => setIsVideoLoading(true)}
                        onLoadedData={() => setIsVideoLoading(false)}
                        onCanPlay={() => setIsVideoLoading(false)}
                        onCanPlayThrough={() => setIsVideoLoading(false)}
                      />
                    </div>
                  </>
                ) : (
                  /* SOLO VIDEO ORIGINAL AL CENTRO CUANDO NO HAY PREVIEW */
                  <div className="relative h-full max-h-[60vh] aspect-[9/16] bg-black rounded-md overflow-hidden shadow-sm">
                    {isProcessing && (
                      <div className="absolute inset-0 z-30 bg-black/85 flex flex-col items-center justify-center p-4 text-center backdrop-blur-[2px]">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-2" />
                        <span className="text-sm font-semibold text-white">Generando... {processingProgress}%</span>
                        <span className="text-[10px] text-gray-400 mt-1">Creando vista previa rápida</span>
                      </div>
                    )}
                    <video
                      key="orig-center-video"
                      ref={playerRef}
                      src={element.content ? (element.content.startsWith('/') ? `${window.location.origin}${element.content}` : element.content) : ''}
                      className="w-full h-full object-contain cursor-pointer"
                      controls={false}
                      autoPlay
                      loop
                      playsInline
                      muted={isMuted}
                      onLoadedMetadata={(e: React.SyntheticEvent<HTMLVideoElement>) => {
                        const video = e.currentTarget;
                        video.playbackRate = speed;
                      }}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onClick={togglePlay}
                    />
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Cargando...</span>
                </div>
              )}
            </div>

            {/* Timeline & Transport (Bottom of Canvas) */}
            <div 
              className="border-t p-3 flex flex-col gap-1.5"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
            >
              {/* Fila principal: Línea de Tiempo a la izquierda + Tiempo y Botones del alto de fotogramas a la derecha */}
              <div className="flex items-stretch gap-2.5 h-[80px]">
                
                {/* Caja de Línea de tiempo detallada */}
                <div 
                  className="flex-1 rounded-md border overflow-hidden shadow-inner flex flex-col h-full" 
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-app)' }}
                >
                  {/* Marcas de tiempo superiores (0s a fin) */}
                  <div 
                    className="h-5 w-full border-b flex items-center justify-between px-3 relative font-mono text-[9px] pointer-events-none select-none shrink-0"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
                  >
                    {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                      const timeLabel = (durationInSeconds * pct).toFixed(1);
                      return (
                        <div key={idx} className="flex flex-col items-center">
                          <span className="leading-none">{timeLabel}s</span>
                          <div className="w-0.5 h-1 mt-0.5" style={{ backgroundColor: 'var(--border-color)' }} />
                        </div>
                      );
                    })}
                  </div>

                  {/* Tira de Fotogramas de inicio (0s) a fin con insignias de tiempo */}
                  <div ref={timelineRef} className="relative flex-1 w-full overflow-hidden">
                    <div className="absolute inset-0 flex items-center" style={{ backgroundColor: 'var(--bg-app)' }}>
                      {thumbnails.length > 0 ? (
                        thumbnails.map((thumb, idx) => {
                          const frameTime = ((idx / Math.max(1, thumbnails.length - 1)) * durationInSeconds).toFixed(1);
                          return (
                            <div
                              key={idx}
                              className="h-full flex-1 relative overflow-hidden border-r last:border-r-0 flex items-center justify-center group"
                              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                            >
                              <img
                                src={thumb}
                                style={{ aspectRatio: `${videoAspectRatio}` }}
                                className="h-full max-w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                alt={`Fotograma ${frameTime}s`}
                              />
                              <div 
                                className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded text-[7.5px] font-mono font-bold border backdrop-blur-[2px]"
                                style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', color: '#fff', borderColor: 'var(--border-color)' }}
                              >
                                {frameTime}s
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center text-[10px] font-mono animate-pulse"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Cargando fotogramas...
                        </div>
                      )}
                    </div>

                    {/* Sombras oscurecidas fuera de la zona seleccionada */}
                    <div 
                      className="absolute top-0 bottom-0 left-0 bg-black/70 backdrop-blur-[1px] border-r-2 z-10 pointer-events-none" 
                      style={{ width: `${(startTime / durationInSeconds) * 100}%`, borderColor: 'var(--primary-accent)' }} 
                    />
                    <div 
                      className="absolute top-0 bottom-0 right-0 bg-black/70 backdrop-blur-[1px] border-l-2 z-10 pointer-events-none" 
                      style={{ width: `${(1 - endTime / durationInSeconds) * 100}%`, borderColor: 'var(--primary-accent)' }} 
                    />

                    {/* Marco con color primario del proyecto resaltando la zona seleccionada */}
                    <div 
                      className="absolute top-0 bottom-0 border-t-2 border-b-2 z-10 pointer-events-none shadow-sm"
                      style={{ 
                        left: `${(startTime / durationInSeconds) * 100}%`,
                        width: `${((endTime - startTime) / durationInSeconds) * 100}%`,
                        borderColor: 'var(--primary-accent)'
                      }}
                    />

                    {/* Deslizadores de recorte (Sliders) */}
                    <input 
                      type="range" 
                      min={0} 
                      max={durationInSeconds} 
                      step={0.1}
                      value={startTime}
                      onChange={(e) => {
                        const val = Math.min(Number(e.target.value), endTime - 0.5);
                        setStartTime(val);
                        startTimeRef.current = val;
                        if (trimmedVideoUrl) setTrimmedVideoUrl(null);
                      }}
                      onPointerUp={() => {
                        if (playerRef.current) {
                          playerRef.current.currentTime = startTimeRef.current;
                        }
                      }}
                      onMouseUp={() => {
                        if (playerRef.current) {
                          playerRef.current.currentTime = startTimeRef.current;
                        }
                      }}
                      onTouchEnd={() => {
                        if (playerRef.current) {
                          playerRef.current.currentTime = startTimeRef.current;
                        }
                      }}
                      className="absolute inset-x-0 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-16 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:cursor-ew-resize [&::-webkit-slider-thumb]:shadow-lg z-20"
                    />
                    <input 
                      type="range" 
                      min={0} 
                      max={durationInSeconds} 
                      step={0.1}
                      value={endTime}
                      onChange={(e) => {
                        const val = Math.max(Number(e.target.value), startTime + 0.5);
                        setEndTime(val);
                        endTimeRef.current = val;
                        if (trimmedVideoUrl) setTrimmedVideoUrl(null);
                      }}
                      onPointerUp={() => {
                        if (playerRef.current && playerRef.current.currentTime >= endTimeRef.current) {
                          playerRef.current.currentTime = startTimeRef.current;
                        }
                      }}
                      onMouseUp={() => {
                        if (playerRef.current && playerRef.current.currentTime >= endTimeRef.current) {
                          playerRef.current.currentTime = startTimeRef.current;
                        }
                      }}
                      onTouchEnd={() => {
                        if (playerRef.current && playerRef.current.currentTime >= endTimeRef.current) {
                          playerRef.current.currentTime = startTimeRef.current;
                        }
                      }}
                      className="absolute inset-x-0 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-16 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:cursor-ew-resize [&::-webkit-slider-thumb]:shadow-lg z-20"
                    />
                    <style>{`
                      input[type=range]::-webkit-slider-thumb {
                        background: var(--primary-accent) !important;
                      }
                    `}</style>
                  </div>
                </div>

                {/* COLUMNA DERECHA: Tiempo encima + Botones del alto exacto de la tira de fotogramas */}
                <div className="flex flex-col h-full justify-between shrink-0">
                  {/* Tiempo encima de los botones (alineado con la barra de marcas de tiempo h-5) */}
                  <div className="h-5 flex items-center justify-center font-mono text-xs font-semibold px-1" style={{ color: 'var(--text-main)' }}>
                    <span style={{ color: 'var(--primary-accent)' }}>{startTime.toFixed(1)}s</span>
                    <span className="mx-0.5 opacity-50">/</span>
                    <span>{endTime.toFixed(1)}s</span>
                  </div>

                  {/* Botones Play/Stop y Mute con el alto exacto de la tira de fotogramas */}
                  <div className="flex-1 flex items-center gap-1.5 pt-0.5">
                    {/* Botón de Reproducción / Parar (Play / Stop) */}
                    <button 
                      onClick={togglePlay}
                      className="h-full px-3.5 flex flex-col items-center justify-center border rounded-md transition-all hover:opacity-80 active:scale-95 shadow-sm"
                      style={{ 
                        backgroundColor: 'var(--primary-accent)', 
                        borderColor: 'var(--primary-accent)', 
                        color: '#fff' 
                      }}
                      title={isPlaying ? 'Pausar / Detener' : 'Reproducir'}
                    >
                      {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                      <span className="text-[8.5px] font-medium mt-0.5 leading-none">{isPlaying ? 'Stop' : 'Play'}</span>
                    </button>

                    {/* Botón de Silenciar (Mute) */}
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="h-full w-12 flex flex-col items-center justify-center border rounded-md transition-all hover:opacity-80 active:scale-95 shadow-sm"
                      style={{ 
                        backgroundColor: 'var(--bg-app)', 
                        borderColor: isMuted ? 'var(--color-danger, #E63946)' : 'var(--border-color)', 
                        color: isMuted ? 'var(--color-danger, #E63946)' : 'var(--text-muted)' 
                      }}
                      title={isMuted ? 'Activar sonido' : 'Silenciar'}
                    >
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      <span className="text-[8.5px] font-medium mt-0.5 leading-none">{isMuted ? 'Mute' : 'Audio'}</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Sidebar Inspector Compacto */}
          <div 
            className="w-full md:w-[300px] border-l flex flex-col"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div 
              className="flex items-center p-2 border-b gap-1"
              style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
            >
              <button 
                onClick={() => setActiveTab('trim')}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors border"
                style={{ 
                  backgroundColor: activeTab === 'trim' ? 'var(--bg-card)' : 'transparent', 
                  color: activeTab === 'trim' ? 'var(--text-main)' : 'var(--text-muted)',
                  borderColor: activeTab === 'trim' ? 'var(--border-color)' : 'transparent'
                }}
              >
                <Scissors size={14} />
                Ajustes
              </button>
              <button 
                onClick={() => setActiveTab('effects')}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors border"
                style={{ 
                  backgroundColor: activeTab === 'effects' ? 'var(--bg-card)' : 'transparent', 
                  color: activeTab === 'effects' ? 'var(--text-main)' : 'var(--text-muted)',
                  borderColor: activeTab === 'effects' ? 'var(--border-color)' : 'transparent'
                }}
              >
                <Wand2 size={14} />
                Efectos
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
              
              {activeTab === 'trim' && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                      <Settings2 size={14} style={{ color: 'var(--text-muted)' }} />
                      Velocidad
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {SPEEDS.map(s => {
                        const isActive = speed === s;
                        return (
                          <button
                            key={s}
                            onClick={() => setSpeed(s)}
                            className="py-1.5 rounded-md text-xs font-medium border transition-colors"
                            style={{ 
                              backgroundColor: isActive ? 'var(--primary-accent)' : 'var(--bg-app)',
                              borderColor: isActive ? 'var(--primary-accent)' : 'var(--border-color)',
                              color: isActive ? '#fff' : 'var(--text-main)',
                              opacity: isActive ? 0.9 : 1
                            }}
                          >
                            {s}x
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                        <Repeat size={14} style={{ color: 'var(--text-muted)' }} />
                        Modo de Bucle
                      </label>
                      <button
                        onClick={() => {
                          const testSec = 2.0;
                          setStartTime(testSec);
                          startTimeRef.current = testSec;
                          if (endTime <= testSec) {
                            const newEnd = Math.min(durationInSeconds, testSec + 3);
                            setEndTime(newEnd);
                            endTimeRef.current = newEnd;
                          }
                          if (trimmedVideoUrl) setTrimmedVideoUrl(null);
                          if (playerRef.current) {
                            const v = playerRef.current;
                            try {
                              v.pause();
                              v.currentTime = testSec;
                              const onSeeked = () => {
                                v.removeEventListener('seeked', onSeeked);
                                v.play().catch(() => {});
                                setIsPlaying(true);
                              };
                              v.addEventListener('seeked', onSeeked, { once: true });
                              // Fallback por si 'seeked' fue instantáneo
                              setTimeout(() => {
                                v.removeEventListener('seeked', onSeeked);
                                if (v.paused) {
                                  v.play().catch(() => {});
                                  setIsPlaying(true);
                                }
                              }, 150);
                            } catch (e) {}
                          }
                        }}
                        className="px-2 py-1 rounded text-[10px] font-bold border bg-purple-600/20 text-purple-400 border-purple-500/40 hover:bg-purple-600/30 transition-colors flex items-center gap-1"
                        title="Probar reproducción desde el segundo 2.0"
                      >
                        <Play size={10} fill="currentColor" />
                        Probar Seg 2.0
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {MODES.map(mode => {
                        const Icon = mode.icon;
                        const isActive = loopMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            onClick={() => setLoopMode(mode.id)}
                            className="flex flex-col items-center gap-1 p-1.5 rounded-md border transition-colors overflow-hidden"
                            style={{
                              backgroundColor: isActive ? 'var(--primary-accent)' : 'var(--bg-app)',
                              borderColor: isActive ? 'var(--primary-accent)' : 'var(--border-color)',
                              color: isActive ? '#fff' : 'var(--text-main)',
                              opacity: isActive ? 0.9 : 1
                            }}
                          >
                            <Icon size={13} strokeWidth={2} />
                            <span className="text-[9px] font-medium leading-none text-center truncate w-full">{mode.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'effects' && (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 opacity-70">
                  <div 
                    className="w-10 h-10 rounded-md flex items-center justify-center border"
                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                  >
                    <Wand2 className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <h4 className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Efectos Próximamente</h4>
                </div>
              )}
            </div>

            <div 
              className="p-3 border-t flex flex-col gap-2"
              style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
            >
              <button
                onClick={() => processVideoNative(loopMode, speed, isMuted)}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 hover:opacity-80"
                style={{ backgroundColor: 'var(--primary-accent)', color: '#fff', border: 'none' }}
              >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generando...</>
                ) : (
                  <><Play className="w-4 h-4 fill-current" /> Preview</>
                )}
              </button>

              <button
                onClick={handleSave}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors border hover:opacity-80 opacity-90"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              >
                <Check className="w-3.5 h-3.5" /> Guardar en Invitación
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
