import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Video,
  Music,
  ExternalLink,
  MapPin,
  Calendar,
  Gift,
  CheckCircle2,
  Phone,
  Heart,
  Send,
  Play,
  Pause,
  Volume2,
} from 'lucide-react';
import type { CanvasElement } from '../types/designerTypes';

interface ElementRenderProps {
  element: CanvasElement;
  isSelected?: boolean;
}

export const ButtonElementItem: React.FC<ElementRenderProps> = ({ element }) => {
  const iconName = element.buttonIcon || 'none';
  const iconPos = element.buttonIconPosition || 'left';
  const anim = element.buttonAnimation || 'none';

  const renderIcon = (size = 18) => {
    switch (iconName) {
      case 'map':
        return <MapPin size={size} />;
      case 'calendar':
        return <Calendar size={size} />;
      case 'gift':
        return <Gift size={size} />;
      case 'check':
        return <CheckCircle2 size={size} />;
      case 'phone':
        return <Phone size={size} />;
      case 'heart':
        return <Heart size={size} />;
      case 'send':
        return <Send size={size} />;
      case 'external':
        return <ExternalLink size={size} />;
      default:
        return null;
    }
  };

  const animClass =
    anim === 'pulse'
      ? 'animate-pulse'
      : anim === 'bounce'
      ? 'animate-bounce'
      : anim === 'shimmer'
      ? 'relative overflow-hidden after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_2s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent'
      : '';

  return (
    <div
      className={`w-full h-full flex items-center justify-center gap-2 select-none overflow-hidden transition-all shadow-md ${animClass}`}
      style={{
        backgroundColor: element.backgroundColor || 'var(--primary-accent)',
        color: element.color || '#ffffff',
        fontSize: element.fontSize ? `${element.fontSize}px` : '16px',
        fontFamily: element.fontFamily || 'inherit',
        fontWeight: element.fontWeight || 'bold',
        fontStyle: element.fontStyle || 'normal',
        borderWidth: element.borderWidth ? `${element.borderWidth}px` : undefined,
        borderColor: element.borderColor || 'transparent',
        borderStyle: element.borderStyle || 'solid',
        borderRadius: element.borderRadius ? `${element.borderRadius}px` : '8px',
        paddingLeft: '12px',
        paddingRight: '12px',
      }}
    >
      {(iconPos === 'left' || iconPos === 'only') && renderIcon(element.fontSize ? Math.round(element.fontSize * 1.1) : 18)}
      {iconPos !== 'only' && <span className="truncate">{element.content || 'Confirmar Asistencia'}</span>}
      {iconPos === 'right' && renderIcon(element.fontSize ? Math.round(element.fontSize * 1.1) : 18)}
    </div>
  );
};

export const AudioElementItem: React.FC<ElementRenderProps> = ({ element }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const showTitle = element.audioShowTitle !== false;
  const title = element.audioTitle || element.content || 'Música de Fondo';

  return (
    <div
      className="w-full h-full flex items-center px-3 py-2 gap-3 select-none overflow-hidden transition-all shadow-lg rounded-full"
      style={{
        backgroundColor: element.backgroundColor || 'rgba(15, 23, 42, 0.85)',
        color: element.color || '#ffffff',
        borderWidth: element.borderWidth ? `${element.borderWidth}px` : '1px',
        borderColor: element.borderColor || 'rgba(255, 255, 255, 0.2)',
        borderStyle: element.borderStyle || 'solid',
        borderRadius: element.borderRadius ? `${element.borderRadius}px` : '9999px',
        backdropFilter: 'blur(8px)',
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsPlaying(!isPlaying);
        }}
        className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow"
        style={{
          backgroundColor: 'var(--primary-accent)',
          color: '#ffffff',
        }}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {showTitle && (
          <span className="text-xs font-bold truncate tracking-wide leading-tight">
            {title}
          </span>
        )}
        <div className="flex items-center gap-1 mt-0.5">
          <Music size={11} className={`shrink-0 ${isPlaying ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
          {/* Visualizador de Ondas */}
          <div className="flex items-end gap-0.5 h-3">
            {[0.4, 0.8, 0.5, 0.9, 0.6, 1, 0.7].map((h, i) => (
              <div
                key={i}
                className={`w-0.5 rounded-full transition-all duration-300 ${
                  isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
                style={{
                  height: isPlaying ? `${h * 100}%` : '30%',
                  animationDelay: `${i * 120}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <Volume2 size={16} className="shrink-0 text-slate-400 mr-1" />
    </div>
  );
};

export const ImageElementItem: React.FC<ElementRenderProps> = ({ element }) => {
  if (element.content) {
    if (element.objectFit === 'repeat' || element.objectFit === 'repeat-x' || element.objectFit === 'repeat-y') {
      return (
        <div
          className="w-full h-full pointer-events-none select-none transition-all"
          style={{
            backgroundImage: `url(${element.content})`,
            backgroundRepeat: element.objectFit,
            backgroundSize: element.repeatTileSize ? `${element.repeatTileSize}px auto` : 'auto',
            backgroundPosition: 'top left',
            filter: `brightness(${element.imgBrightness !== undefined ? element.imgBrightness : 100}%) contrast(${element.imgContrast !== undefined ? element.imgContrast : 100}%) saturate(${element.imgSaturate !== undefined ? element.imgSaturate : 100}%) blur(${element.imgBlur || 0}px) ${element.imgGrayscale ? 'grayscale(100%)' : ''} ${element.imgSepia ? 'sepia(100%)' : ''}`.trim(),
          }}
        />
      );
    }
    return (
      <img
        src={element.content}
        alt="Imagen del elemento"
        className="w-full h-full pointer-events-none select-none transition-all"
        style={{
          objectFit: (element.objectFit as any) || 'contain',
          filter: `brightness(${element.imgBrightness !== undefined ? element.imgBrightness : 100}%) contrast(${element.imgContrast !== undefined ? element.imgContrast : 100}%) saturate(${element.imgSaturate !== undefined ? element.imgSaturate : 100}%) blur(${element.imgBlur || 0}px) ${element.imgGrayscale ? 'grayscale(100%)' : ''} ${element.imgSepia ? 'sepia(100%)' : ''}`.trim(),
        }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-blue-950/20 border-2 border-dashed border-blue-500/40 rounded-xl text-blue-400 gap-2 text-sm font-bold p-2 text-center select-none">
      <ImageIcon size={32} />
      <span>Imagen</span>
    </div>
  );
};

export const VideoElementItem: React.FC<ElementRenderProps> = ({ element }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (!element.chromaKeyEnabled || !element.content) return;

    let animId: number;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Extraer lista de colores objetivo (soporta múltiples colores o color único)
    const colorList = (element.chromaKeyColors && element.chromaKeyColors.length > 0)
      ? element.chromaKeyColors
      : [element.chromaKeyColor || '#00FF00'];

    const parsedTargetColors = colorList.map((hex) => ({
      r: parseInt(hex.slice(1, 3), 16) || 0,
      g: parseInt(hex.slice(3, 5), 16) || 0,
      b: parseInt(hex.slice(5, 7), 16) || 0,
    }));

    const tolerance = ((element.chromaKeyTolerance ?? 40) / 100) * 255;

    const processFrame = () => {
      if (video.paused || video.ended || !ctx) {
        animId = requestAnimationFrame(processFrame);
        return;
      }

      const w = video.videoWidth || canvas.width || 300;
      const h = video.videoHeight || canvas.height || 150;

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.drawImage(video, 0, 0, w, h);
      const frame = ctx.getImageData(0, 0, w, h);
      const data = frame.data;
      const len = data.length;

      for (let i = 0; i < len; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Comprobar si el pixel coincide con alguno de los colores de la lista
        for (let j = 0; j < parsedTargetColors.length; j++) {
          const tColor = parsedTargetColors[j];
          const diffR = r - tColor.r;
          const diffG = g - tColor.g;
          const diffB = b - tColor.b;
          const dist = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB);

          if (dist < tolerance) {
            data[i + 3] = 0; // Transparente
            break;
          }
        }
      }

      ctx.putImageData(frame, 0, 0);
      animId = requestAnimationFrame(processFrame);
    };

    animId = requestAnimationFrame(processFrame);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [element.chromaKeyEnabled, element.chromaKeyColor, JSON.stringify(element.chromaKeyColors), element.chromaKeyTolerance, element.content]);

  if (element.content) {
    const filterStyle = `brightness(${element.imgBrightness !== undefined ? element.imgBrightness : 100}%) contrast(${element.imgContrast !== undefined ? element.imgContrast : 100}%) saturate(${element.imgSaturate !== undefined ? element.imgSaturate : 100}%) blur(${element.imgBlur || 0}px) ${element.imgGrayscale ? 'grayscale(100%)' : ''} ${element.imgSepia ? 'sepia(100%)' : ''}`.trim();

    return (
      <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
        {/* Video Oculto si ChromaKey está activo o visible si no */}
        <video
          ref={videoRef}
          src={element.content}
          controls={false}
          autoPlay
          loop
          muted
          crossOrigin="anonymous"
          playsInline
          className={`w-full h-full object-cover rounded-xl pointer-events-none transition-all ${
            element.chromaKeyEnabled ? 'hidden' : 'block'
          }`}
          style={{
            objectFit: (element.objectFit as any) || 'cover',
            filter: filterStyle,
          }}
        />

        {/* Canvas transparente interactivo para ChromaKey */}
        {element.chromaKeyEnabled && (
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover rounded-xl pointer-events-none transition-all"
            style={{
              objectFit: (element.objectFit as any) || 'cover',
              filter: filterStyle,
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-purple-950/20 border-2 border-dashed border-purple-500/40 rounded-xl text-purple-400 gap-2 text-sm font-bold p-2 text-center select-none">
      <Video size={32} />
      <span>Video</span>
    </div>
  );
};

// Generador de SVG Data URLs para vectores y patrones integrados
export const getBuiltInSvgPattern = (type: string, color: string = '#ffffff', opacity: number = 0.5): string => {
  const op = opacity;
  let rawSvg = '';

  switch (type) {
    case 'dots':
      rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="4" fill="${color}" fill-opacity="${op}"/></svg>`;
      break;
    case 'lines':
      rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M0 20L20 0M0 0l20 20" stroke="${color}" stroke-width="2" stroke-opacity="${op}"/></svg>`;
      break;
    case 'grid':
      rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="${color}" stroke-width="1.5" stroke-opacity="${op}"/></svg>`;
      break;
    case 'waves':
      rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="15" viewBox="0 0 30 15"><path d="M0 7.5 Q 7.5 0, 15 7.5 T 30 7.5" fill="none" stroke="${color}" stroke-width="2" stroke-opacity="${op}"/></svg>`;
      break;
    case 'hearts':
      rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="${color}" fill-opacity="${op}"/></svg>`;
      break;
    case 'stars':
      rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="${color}" fill-opacity="${op}"/></svg>`;
      break;
    case 'diamonds':
      rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2L2 12l10 10 10-10L12 2z" fill="none" stroke="${color}" stroke-width="2" stroke-opacity="${op}"/></svg>`;
      break;
    case 'floral':
      rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30"><path d="M15 5 C18 10, 22 12, 25 15 C20 18, 18 22, 15 25 C12 20, 8 18, 5 15 C10 12, 12 8, 15 5 Z" fill="${color}" fill-opacity="${op}"/></svg>`;
      break;
    case 'checkers':
      rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect x="0" y="0" width="10" height="10" fill="${color}" fill-opacity="${op}"/><rect x="10" y="10" width="10" height="10" fill="${color}" fill-opacity="${op}"/></svg>`;
      break;
    default:
      return '';
  }

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawSvg)}`;
};

export const ShapeElementItem: React.FC<ElementRenderProps> = ({ element }) => {
  const patternType = element.patternType || 'none';
  const patternScale = element.patternScale || 24;
  const patternColor = element.patternColor || '#ffffff';
  const patternOpacity = element.patternOpacity ?? 1;

  let patternBgUrl = '';
  if (patternType === 'custom' && element.patternUrl) {
    patternBgUrl = element.patternUrl;
  } else if (patternType !== 'none') {
    patternBgUrl = getBuiltInSvgPattern(patternType, patternColor, patternOpacity);
  }

  const hasPattern = patternType !== 'none' && !!patternBgUrl;

  return (
    <div
      className="w-full h-full relative flex items-center justify-center font-bold text-2xl select-none overflow-hidden transition-all"
      style={{
        backgroundColor: element.backgroundColor || 'var(--primary-accent-light)',
        borderWidth: element.borderWidth ? `${element.borderWidth}px` : undefined,
        borderColor: element.borderColor,
        borderStyle: element.borderStyle || 'none',
        borderRadius: element.borderRadius ? `${element.borderRadius}px` : undefined,
      }}
    >
      {/* Capa de Patrón Repetitivo SVG / Imagen */}
      {hasPattern && (
        <div
          className="absolute inset-0 pointer-events-none transition-all"
          style={{
            backgroundImage: `url("${patternBgUrl}")`,
            backgroundRepeat: 'repeat',
            backgroundSize: patternType === 'custom' ? `${patternScale}px auto` : `${patternScale}px ${patternScale}px`,
            backgroundPosition: 'top left',
            opacity: patternOpacity,
          }}
        />
      )}

    </div>
  );
};

