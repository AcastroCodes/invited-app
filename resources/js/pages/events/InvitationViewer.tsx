import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Smartphone, RotateCcw } from 'lucide-react';
import api from '../../lib/api';
import { EnvelopeView, DEFAULT_ENVELOPE_SETTINGS } from '../../components/designer/EnvelopeCustomizer';
import { TextElementItem } from '../../components/designer/TextElementItem';
import { 
  ImageElementItem, 
  VideoElementItem, 
  ShapeElementItem, 
  ButtonElementItem, 
  AudioElementItem 
} from '../../components/designer/DesignerMediaElements';

const ensureEnvelopeScene = (rawScenes: any[]): any[] => {
  const defaultEnv = {
    id: 'scene-envelope',
    name: 'Sobre ✉️',
    isEnvelope: true,
    envelopeSettings: DEFAULT_ENVELOPE_SETTINGS,
    elements: [],
  };

  if (!rawScenes || rawScenes.length === 0) {
    return [defaultEnv, { id: 'scene-1', name: 'Escena 01', elements: [] }];
  }

  if (rawScenes[0].isEnvelope || rawScenes[0].id === 'scene-envelope') {
    return [{ ...rawScenes[0], isEnvelope: true, name: 'Sobre ✉️', envelopeSettings: { ...DEFAULT_ENVELOPE_SETTINGS, ...(rawScenes[0].envelopeSettings || {}) } }, ...rawScenes.slice(1)];
  }

  const existingEnv = rawScenes.find(s => s.isEnvelope || s.id === 'scene-envelope');
  const rest = rawScenes.filter(s => s !== existingEnv);

  const envScene = existingEnv ? { ...existingEnv, isEnvelope: true, name: 'Sobre ✉️', envelopeSettings: { ...DEFAULT_ENVELOPE_SETTINGS, ...(existingEnv.envelopeSettings || {}) } } : defaultEnv;

  return [envScene, ...rest];
};

export default function InvitationViewer() {
  const { id } = useParams<{ id: string }>();
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [prevSceneIndex, setPrevSceneIndex] = useState(-1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [deltaY, setDeltaY] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isLandscapeOrientation = window.innerWidth > window.innerHeight && window.innerHeight < 900;
      setIsLandscape(isLandscapeOrientation);
    };

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    checkOrientation();

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);
  
  const [hasEntered, setHasEntered] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [isPreloading, setIsPreloading] = useState(false);

  useEffect(() => {
    // Fetch invitation from the public route
    api.get(`/public/invitations/${id}`)
      .then(res => {
        setInvitation(res.data.data);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'No se pudo cargar la invitación.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!invitation?.content?.scenes || !hasEntered) return;
    
    const scenes = invitation.content.scenes;
    const activeScene = scenes[currentSceneIndex];
    
    if (activeScene?.autoAdvance) {
      if (timerRef.current) clearTimeout(timerRef.current);
      
      const delayMs = (activeScene.autoAdvanceDelay || 3) * 1000;
      timerRef.current = setTimeout(() => {
        goToScene((currentSceneIndex + 1) % scenes.length);
      }, delayMs);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [invitation, currentSceneIndex]);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      
      // En PC queremos que se vea centrado con un ancho fijo máximo como un móvil
      const availableW = isMobile ? window.innerWidth : 448;
      const availableH = containerRef.current?.clientHeight || window.innerHeight;
      
      const scaleX = availableW / 1080;
      const scaleY = availableH / 1920;
      
      if (isMobile) {
         setScale(scaleX); // Ajuste perfecto al ancho
         const logicalHeight = availableH / scaleX;
         setDeltaY(logicalHeight > 1920 ? logicalHeight - 1920 : 0);
      } else {
         setScale(Math.min(scaleX, scaleY)); // Contenido dentro del monitor
         setDeltaY(0);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Ejecutar inmediatamente

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Preload Logic
  useEffect(() => {
    if (!invitation?.content?.scenes || loading) return;
    if (isPreloading || hasEntered || preloadProgress === 100) return;
    
    setIsPreloading(true);
    
    const assetsToLoad: string[] = [];
    invitation.content.scenes.forEach((scene: any) => {
      if (scene.backgroundImage) {
        assetsToLoad.push(scene.backgroundImage);
      }
      scene.elements?.forEach((el: any) => {
        if (el.type === 'image' && el.content) assetsToLoad.push(el.content);
        if (el.type === 'video' && el.content) assetsToLoad.push(el.content);
        if (el.type === 'audio' && el.content) assetsToLoad.push(el.content);
      });
    });

    const uniqueAssets = Array.from(new Set(assetsToLoad));
    
    if (uniqueAssets.length === 0) {
      setPreloadProgress(100);
      return;
    }

    let loadedCount = 0;
    
    uniqueAssets.forEach(url => {
      const isVideoOrAudio = url.match(/\.(mp4|webm|m4v|mp3|wav|ogg)$/i);
      if (isVideoOrAudio) {
        fetch(url)
          .then(res => res.blob())
          .then(() => {
            loadedCount++;
            setPreloadProgress(Math.round((loadedCount / uniqueAssets.length) * 100));
          })
          .catch(() => {
             loadedCount++;
             setPreloadProgress(Math.round((loadedCount / uniqueAssets.length) * 100));
          });
      } else {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          setPreloadProgress(Math.round((loadedCount / uniqueAssets.length) * 100));
        };
        img.onerror = () => {
          loadedCount++;
          setPreloadProgress(Math.round((loadedCount / uniqueAssets.length) * 100));
        };
        img.src = url;
      }
    });
  }, [invitation, isPreloading, hasEntered, loading, preloadProgress]);

  const handleEnter = async () => {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await ((document.documentElement as any).webkitRequestFullscreen)();
        }
      } catch (e) {
        console.warn("No se pudo iniciar pantalla completa", e);
      }

      if (typeof (DeviceOrientationEvent as any) !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          await (DeviceOrientationEvent as any).requestPermission();
        } catch (e) {
          console.warn("Error pidiendo permiso de giroscopio", e);
        }
      }
    }
    // Push state para interceptar el botón atrás
    window.history.pushState({ entered: true }, '');
    setHasEntered(true);
  };

  // Escuchar botón atrás y salida de pantalla completa
  useEffect(() => {
    const handlePopState = () => {
      if (hasEntered) setHasEntered(false);
    };

    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement || (document as any).webkitFullscreenElement;
      if (!isFullscreen && hasEntered) {
        setHasEntered(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [hasEntered]);

  // Parallax mediante Giroscopio
  useEffect(() => {
    if (!hasEntered) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return;
      
      let x = event.gamma; // inclinación izquierda/derecha (-90 a 90)
      let y = event.beta;  // inclinación adelante/atrás (-180 a 180)
      
      // Limitamos el rango de inclinación a 25 grados para que sea mucho más sensible
      x = Math.max(-25, Math.min(25, x));
      // Asumimos que sostienen el móvil a ~45 grados, lo restamos para el "centro"
      y = y - 45;
      y = Math.max(-25, Math.min(25, y));
      
      // Multiplicador normalizado de -1 a 1 (sensibilidad alta)
      requestAnimationFrame(() => {
        setTilt({ x: x / 25, y: y / 25 });
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [hasEntered]);

  const goToScene = (newIndex: number) => {
    if (isTransitioning) return;
    setPrevSceneIndex(currentSceneIndex);
    setCurrentSceneIndex(newIndex);
    setIsTransitioning(true);
    
    // We get the transition duration from the scene we are leaving
    const scenes = invitation?.content?.scenes || [];
    const leavingScene = scenes[currentSceneIndex];
    const duration = (leavingScene?.transitionDuration || 0.5) * 1000;
    
    setTimeout(() => {
      setIsTransitioning(false);
      setPrevSceneIndex(-1); // Reseteamos la escena anterior una vez termina la transición
    }, duration);
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-zinc-950 text-white font-bold">
        Cargando invitación...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-zinc-950 text-white text-center p-8">
        <div>
          <h2 className="text-xl font-bold mb-2 text-red-400">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const scenes = ensureEnvelopeScene(invitation?.content?.scenes || []);
  if (scenes.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-zinc-950 text-white">
        Esta invitación no tiene contenido.
      </div>
    );
  }

  const renderScene = (scene: any, isPrev: boolean, isCurrent: boolean) => {
    if (!scene) return null;
    if (!isPrev && !isCurrent) return null; // Solo renderizamos la actual y la saliente

    if (scene.isEnvelope) {
      return (
        <div key={scene.id} className="w-full h-full absolute inset-0 z-40 bg-black">
          <EnvelopeView
            settings={scene.envelopeSettings}
            preloadProgress={preloadProgress}
            isPreloading={isPreloading}
            isInteractive={true}
            onOpen={() => {
              handleEnter();
              goToScene(1);
            }}
          />
        </div>
      );
    }

    // Configuración de animación basada en la escena de salida
    const leavingScene = isPrev ? scene : scenes[prevSceneIndex];
    const transitionType = leavingScene?.transition || 'none';
    const duration = leavingScene?.transitionDuration || 0.5;

    let transitionStyle: React.CSSProperties = {
      transition: transitionType !== 'none' ? `all ${duration}s cubic-bezier(0.4, 0, 0.2, 1)` : 'none',
      opacity: 1,
      transform: 'none',
      position: 'absolute',
      inset: 0,
      zIndex: isCurrent ? 10 : 5, // La escena actual por encima
    };

    if (isTransitioning) {
      if (isPrev) {
        // Estilos para la escena que está saliendo
        transitionStyle.zIndex = 10; // Mantenemos la saliente arriba si es fade out
        if (transitionType === 'fade') transitionStyle.opacity = 0;
        else if (transitionType === 'slideLeft') transitionStyle.transform = 'translateX(-100%)';
        else if (transitionType === 'slideRight') transitionStyle.transform = 'translateX(100%)';
        else if (transitionType === 'slideUp') transitionStyle.transform = 'translateY(-100%)';
        else if (transitionType === 'slideDown') transitionStyle.transform = 'translateY(100%)';
        else if (transitionType === 'zoomOut') {
          transitionStyle.transform = 'scale(0.8)';
          transitionStyle.opacity = 0;
        }
        else if (transitionType === 'zoomIn') {
          transitionStyle.transform = 'scale(1.2)';
          transitionStyle.opacity = 0;
        }
      } else if (isCurrent) {
        // Estilos para la escena que está entrando
        transitionStyle.zIndex = 5; // Empieza debajo de la saliente
        transitionStyle.opacity = 1;
        transitionStyle.transform = 'none';
      }
    }

    const elements = scene.elements || [];

    return (
      <div
        key={scene.id}
        style={{
          ...transitionStyle,
          backgroundColor: scene.backgroundColor || '#ffffff',
          backgroundImage: scene.backgroundImage ? `url(${scene.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflow: 'hidden',
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <div style={{
          width: 1080,
          height: 1920 + deltaY,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: `calc(50% - ${((1920 + deltaY) * scale) / 2}px)`,
          left: `calc(50% - ${(1080 * scale) / 2}px)`,
          overflow: 'hidden',
        }}>
        {elements.map((el: any, index: number) => {
          if (el.visible === false) return null;
          
          let innerElement = null;
          switch (el.type) {
            case 'text': innerElement = <TextElementItem element={el} />; break;
            case 'image': innerElement = <ImageElementItem element={el} />; break;
            case 'video': innerElement = <VideoElementItem element={el} />; break;
            case 'shape': innerElement = <ShapeElementItem element={el} />; break;
            case 'button': innerElement = <ButtonElementItem element={el} />; break;
            case 'audio': innerElement = <AudioElementItem element={el} />; break;
            default: break;
          }

          // Si es botón y tiene enlace, lo envolvemos en un <a>
          if (el.type === 'button' && el.buttonLink) {
            innerElement = (
              <a 
                href={el.buttonLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full h-full block cursor-pointer pointer-events-auto"
                style={{ zIndex: 50 }}
              >
                {innerElement}
              </a>
            );
          }

          // Para todos los elementos desactivamos pointer events excepto botones u otros interactivos
          const isInteractive = el.type === 'button' || el.type === 'audio';

          let adjustedY = el.y;
          let adjustedHeight = el.height;
          
          if (deltaY > 0) {
            const centerY = el.y + (el.height / 2);
            
            // Si es un fondo que cubre todo el lienzo desde arriba hasta abajo, lo estiramos
            if (el.y <= 0 && (el.y + el.height) >= 1900) {
              adjustedHeight += deltaY;
            } else {
              // Anclaje inteligente basado en el CENTRO del elemento
              if (centerY >= 1280) {
                // Tercio inferior -> se pega abajo
                adjustedY += deltaY;
              } else if (centerY >= 640) {
                // Tercio medio -> se centra proporcionalmente
                adjustedY += deltaY / 2;
              }
            }
          }

          return (
            <div
              key={el.id}
              className="absolute select-none"
              style={{
                // El mismo cálculo exacto de zIndex que en el diseñador para respetar las capas
                zIndex: elements.length - index,
                left: `${el.x}px`,
                top: `${adjustedY}px`,
                width: `${el.width}px`,
                height: `${adjustedHeight}px`,
                transform: [
                  (el.parallaxEnabled && el.depth && el.depth !== 0) ? `translate(${tilt.x * el.depth * 3}px, ${tilt.y * el.depth * 3}px)` : '',
                  el.rotation ? `rotate(${el.rotation}deg)` : '',
                  el.flipH ? 'scaleX(-1)' : '',
                  el.flipV ? 'scaleY(-1)' : '',
                ].filter(Boolean).join(' ') || undefined,
                transition: (el.parallaxEnabled && el.depth && el.depth !== 0) ? 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
                opacity: el.opacity !== undefined ? el.opacity / 100 : 1,
                fontSize: el.fontSize ? `${el.fontSize}px` : undefined,
                fontWeight: el.fontWeight || 'normal',
                fontFamily: el.fontFamily ? `'${el.fontFamily}', sans-serif` : undefined,
                // Fondo y borde heredados del diseñador
                background: el.backgroundColor && el.backgroundColor.includes('gradient') ? el.backgroundColor : undefined,
                backgroundColor: el.backgroundColor && !el.backgroundColor.includes('gradient') ? (el.backgroundColor === 'transparent' ? 'transparent' : el.backgroundColor) : 'transparent',
                borderRadius: (el.containerBorderRadius ?? el.borderRadius) ? `${el.containerBorderRadius ?? el.borderRadius}px` : undefined,
                borderWidth: (el.containerBorderWidth ?? el.borderWidth) ? `${el.containerBorderWidth ?? el.borderWidth}px` : undefined,
                borderColor: (el.containerBorderWidth ?? el.borderWidth) ? (el.containerBorderColor || el.borderColor || 'transparent') : undefined,
                borderStyle: (el.containerBorderWidth ?? el.borderWidth) ? (el.containerBorderStyle || el.borderStyle || 'solid') : undefined,
                // Sombras
                boxShadow: (el.type !== 'text' && (el.containerShadowBlur || el.containerShadowOffsetX || el.containerShadowOffsetY || el.shadowBlur || el.shadowOffsetX || el.shadowOffsetY)) || (el.type === 'text' && (el.containerShadowBlur || el.containerShadowOffsetX || el.containerShadowOffsetY))
                  ? `${el.containerShadowOffsetX ?? (el.type !== 'text' ? el.shadowOffsetX : 0) ?? 0}px ${el.containerShadowOffsetY ?? (el.type !== 'text' ? el.shadowOffsetY : 0) ?? 0}px ${el.containerShadowBlur ?? (el.type !== 'text' ? el.shadowBlur : 0) ?? 0}px ${el.containerShadowColor || (el.type !== 'text' ? el.shadowColor : undefined) || 'rgba(0,0,0,0.5)'}`
                  : undefined,
                textAlign: el.textAlign || 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
                pointerEvents: isInteractive ? 'auto' : 'none',
              }}
            >
              {innerElement}
            </div>
          );
        })}
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-dvh overflow-hidden bg-black fixed inset-0 font-sans"
    >
      {scenes.map((scene: any, index: number) => 
        renderScene(
          scene, 
          index === prevSceneIndex, 
          index === currentSceneIndex
        )
      )}

      {/* Debug del giroscopio (temporal para verificar si iOS lo bloquea por HTTP) */}
      <div className="fixed top-4 right-4 z-50 bg-black/75 text-white text-[10px] p-2 rounded pointer-events-none font-mono">
        Tilt X: {tilt.x.toFixed(2)}<br/>
        Tilt Y: {tilt.y.toFixed(2)}<br/>
        {typeof (DeviceOrientationEvent as any) !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function' ? 'Permisos: Soportado' : 'Permisos: NO Soportado (HTTP)'}
      </div>

      {/* Overlay de advertencia cuando el teléfono se gira a horizontal (Landscape) */}
      {isLandscape && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md p-6 text-center text-white select-none transition-all animate-fadeIn">
          <div className="relative mb-6">
            <div className="w-16 h-28 border-4 border-pink-500/80 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.35)] animate-bounce">
              <RotateCcw size={28} className="text-pink-400 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <Smartphone size={36} className="text-slate-400 absolute -bottom-2 -right-3 rotate-90 opacity-40" />
          </div>
          <h3 className="text-xl font-extrabold text-white mb-2 tracking-tight">
            Gira tu dispositivo
          </h3>
          <p className="text-sm text-slate-300 max-w-xs leading-relaxed">
            Esta invitación está optimizada para disfrutarse con la pantalla en posición <span className="text-pink-400 font-extrabold">vertical</span>.
          </p>
        </div>
      )}
    </div>
  );
}
