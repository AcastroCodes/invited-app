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

interface VideoEditorModalProps {
  isOpen: boolean;
  element: CanvasElement;
  onClose: () => void;
  onSave: (updates: Partial<CanvasElement>, saveAsNew?: boolean) => void | Promise<void>;
}

const MODES = [
  { id: 'seamless', name: 'Bucle Suave', icon: Repeat },
  { id: 'pingpong', name: 'Ping-Pong', icon: RefreshCcw },
  { id: 'once', name: 'Una vez', icon: Play },
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
  const playerRef = useRef<PlayerRef>(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [durationInSeconds, setDurationInSeconds] = useState(0);
  const [videoWidth, setVideoWidth] = useState(720);
  const [videoHeight, setVideoHeight] = useState(1280);
  
  const [startTime, setStartTime] = useState<number>(Number(element.videoStartTime) || 0);
  const [endTime, setEndTime] = useState<number>(Number(element.videoEndTime) || 0);
  const [isMuted, setIsMuted] = useState<boolean>(element.videoMuted !== false);
  const [speed, setSpeed] = useState<number>(Number(element.videoSpeed) || 1);
  const [loopMode, setLoopMode] = useState<string>((element.videoLoopMode as string) || 'seamless');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'trim' | 'effects'>('trim');
  const [showResultModal, setShowResultModal] = useState(false);

  // FFmpeg states
  const ffmpegRef = useRef(new FFmpeg());
  const [processingProgress, setProcessingProgress] = useState(0);
  const [trimmedVideoUrl, setTrimmedVideoUrl] = useState<string | null>(null);
  const loadedInputSrcRef = useRef<string | null>(null);

  const fps = 30;

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
  };

  const processVideoNative = async (
    targetMode: string,
    targetSpeed: number,
    targetMuted: boolean
  ): Promise<string | null> => {
    let canvas: HTMLCanvasElement | null = null;
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
      
      // Crucial: Append video to DOM so Chrome updates its internal texture buffer when seeking
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

      const videoWidth = tempVideo.videoWidth || 720;
      const videoHeight = tempVideo.videoHeight || 1280;
      const totalDur = tempVideo.duration || (durationInSeconds > 0 ? durationInSeconds : 5);

      canvas = document.createElement('canvas');
      canvas.width = Math.min(640, videoWidth);
      canvas.height = Math.round((canvas.width * videoHeight) / videoWidth);
      
      // Prevent browser from optimizing out background canvas rendering
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.opacity = '0.01';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '-1000';
      document.body.appendChild(canvas);
      
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
      const recordingStartTime = Date.now();

      for (let i = 0; i < totalFrames; i++) {
        const task = frameQueue[i];
        tempVideo.currentTime = Math.max(0, Math.min(totalDur, task.time));
        await new Promise<void>((res) => {
          const onSeeked = () => {
            tempVideo.removeEventListener('seeked', onSeeked);
            // Allow a tiny bit of time for the internal decoder to flush the frame to the texture
            setTimeout(res, 15);
          };
          tempVideo.addEventListener('seeked', onSeeked);
        });

        ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
        setProcessingProgress(Math.min(99, Math.round(((i + 1) / totalFrames) * 100)));
        
        // Pacing for real-time capture
        const expectedTime = recordingStartTime + i * (1000 / fps);
        const now = Date.now();
        if (now < expectedTime) {
          await new Promise((r) => setTimeout(r, expectedTime - now));
        } else {
          // If we are lagging behind, just yield to let MediaRecorder breathe
          await new Promise((r) => setTimeout(r, 1));
        }
      }

      recorder.stop();

      const newUrl = await new Promise<string>((res) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          res(URL.createObjectURL(blob));
        };
      });

      setTrimmedVideoUrl(newUrl);
      
      // Fix for WebM blobs having Infinity duration in Chrome:
      const actualDuration = totalFrames / fps;
      setDurationInSeconds(actualDuration);
      setStartTime(0);
      setEndTime(actualDuration);
      setProcessingProgress(100);
      setShowResultModal(true);
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
      const scaleFilter = `scale=-2:'min(720,ih)',format=yuv420p`;
      const fastEncoding = ['-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '26', '-pix_fmt', 'yuv420p'];

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

      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([(data as Uint8Array).buffer], { type: 'video/mp4' });
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
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="relative h-full max-h-[60vh] aspect-[9/16] bg-black rounded-md overflow-hidden shadow-sm">
                {durationInSeconds > 0 ? (
                  trimmedVideoUrl ? (
                    <video
                      key={trimmedVideoUrl}
                      src={trimmedVideoUrl}
                      ref={(v) => { if (v) { (playerRef as any).current = v; } }}
                      className="w-full h-full object-contain"
                      controls={false}
                      autoPlay
                      loop
                      muted={isMuted}
                    />
                  ) : (
                    <Player
                      key={trimmedVideoUrl || 'original'}
                      ref={playerRef}
                      component={VideoComposition}
                      inputProps={{
                        src: element.content || '',
                        startFrame,
                        endFrame,
                        isMuted,
                        speed,
                        loopMode,
                      }}
                      durationInFrames={Math.max(1, durationInFrames)}
                      compositionWidth={videoWidth}
                      compositionHeight={videoHeight}
                      fps={fps}
                      style={{ width: '100%', height: '100%' }}
                      controls={false}
                      loop
                      autoPlay
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Cargando...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline & Transport (Bottom of Canvas) */}
            <div 
              className="border-t p-3 flex flex-col gap-2 h-28"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
            >
              {/* Controles de reproducción compactos */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={togglePlay}
                    className="w-8 h-8 flex items-center justify-center border rounded-md transition-colors hover:opacity-80"
                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                  >
                    {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                  </button>
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-8 h-8 flex items-center justify-center border rounded-md transition-colors hover:opacity-80"
                    style={{ 
                      backgroundColor: 'var(--bg-app)', 
                      borderColor: isMuted ? 'transparent' : 'var(--border-color)', 
                      color: isMuted ? 'var(--color-danger, #E63946)' : 'var(--text-muted)' 
                    }}
                  >
                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                </div>
                
                <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  {startTime.toFixed(1)}s / {endTime.toFixed(1)}s
                </div>
              </div>

              {/* Sliders Compactos */}
              <div className="flex-1 relative flex flex-col justify-center mt-2">
                <div 
                  className="relative w-full h-8 rounded-md border flex items-center px-2"
                  style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                >
                  <div 
                    className="absolute left-0 top-0 bottom-0 opacity-20 border-r" 
                    style={{ width: `${(startTime / durationInSeconds) * 100}%`, backgroundColor: 'var(--primary-accent)', borderColor: 'var(--primary-accent)' }}
                  ></div>
                  <div 
                    className="absolute right-0 top-0 bottom-0 opacity-20 border-l" 
                    style={{ width: `${(1 - endTime / durationInSeconds) * 100}%`, backgroundColor: 'var(--primary-accent)', borderColor: 'var(--primary-accent)' }}
                  ></div>
                  
                  <input 
                    type="range" 
                    min={0} 
                    max={durationInSeconds} 
                    step={0.1}
                    value={startTime}
                    onChange={(e) => setStartTime(Math.min(Number(e.target.value), endTime - 0.5))}
                    className="absolute inset-x-2 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:cursor-ew-resize [&::-webkit-slider-thumb]:shadow"
                    style={{ zIndex: 10, '--tw-thumb-bg': 'var(--text-main)', '--tw-thumb-border': 'var(--border-color)' } as any}
                  />
                  <input 
                    type="range" 
                    min={0} 
                    max={durationInSeconds} 
                    step={0.1}
                    value={endTime}
                    onChange={(e) => setEndTime(Math.max(Number(e.target.value), startTime + 0.5))}
                    className="absolute inset-x-2 top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:cursor-ew-resize [&::-webkit-slider-thumb]:shadow"
                    style={{ zIndex: 10, '--tw-thumb-bg': 'var(--text-main)', '--tw-thumb-border': 'var(--border-color)' } as any}
                  />
                  {/* Estilos inyectados para forzar el color del thumb usando las variables */}
                  <style>{`
                    input[type=range]::-webkit-slider-thumb {
                      background: var(--text-main) !important;
                      border-color: var(--border-color) !important;
                    }
                  `}</style>
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
                    <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                      <Repeat size={14} style={{ color: 'var(--text-muted)' }} />
                      Modo de Bucle
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {MODES.map(mode => {
                        const Icon = mode.icon;
                        const isActive = loopMode === mode.id;
                        return (
                          <button
                            key={mode.id}
                            onClick={() => setLoopMode(mode.id)}
                            className="flex flex-col items-center gap-1.5 p-2.5 rounded-md border transition-colors"
                            style={{
                              backgroundColor: isActive ? 'var(--primary-accent)' : 'var(--bg-app)',
                              borderColor: isActive ? 'var(--primary-accent)' : 'var(--border-color)',
                              color: isActive ? '#fff' : 'var(--text-main)',
                              opacity: isActive ? 0.9 : 1
                            }}
                          >
                            <Icon size={16} strokeWidth={2} />
                            <span className="text-[10px] font-medium leading-none">{mode.name}</span>
                          </button>
                        );
                      })}
                    </div>
                    
                    <button 
                      onClick={() => processVideoWithFFmpeg(loopMode, speed, isMuted)}
                      disabled={isProcessing}
                      className="mt-3 w-full py-2 flex items-center justify-center gap-2 rounded-md text-xs font-medium transition-colors border"
                      style={{ 
                        backgroundColor: 'var(--bg-app)',
                        borderColor: 'var(--primary-accent)',
                        color: 'var(--primary-accent)'
                      }}
                    >
                      {isProcessing && processingProgress < 100 ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Procesando {processingProgress}%</>
                      ) : (
                        <><Zap className="w-3 h-3" /> Aplicar Bucle y Velocidad</>
                      )}
                    </button>
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
              className="p-3 border-t"
              style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
            >
              <button
                onClick={handleSave}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 hover:opacity-80"
                style={{ backgroundColor: 'var(--primary-accent)', color: '#fff', border: 'none' }}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Aplicar
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showResultModal && trimmedVideoUrl && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 rounded-md p-4 max-w-3xl w-full flex flex-col gap-4 border border-gray-700 shadow-2xl">
            <div className="flex justify-between items-center text-white">
              <h3 className="font-semibold text-sm">Preview Final (Para Pruebas de Desarrollo)</h3>
              <button onClick={() => setShowResultModal(false)} className="hover:text-red-400">
                <X size={18} />
              </button>
            </div>
            <video src={trimmedVideoUrl} controls autoPlay loop className="w-full max-h-[70vh] rounded-md bg-black" />
            <div className="flex justify-end">
              <button onClick={() => setShowResultModal(false)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors">
                Cerrar y Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
