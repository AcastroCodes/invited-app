import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';
import { TextElementItem } from '../../components/designer/TextElementItem';
import { 
  ImageElementItem, 
  VideoElementItem, 
  ShapeElementItem, 
  ButtonElementItem, 
  AudioElementItem 
} from '../../components/designer/DesignerMediaElements';

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
    if (!invitation?.content?.scenes) return;
    
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
      // Ancho máximo del contenedor en modo PC/tablet es equivalente a max-w-md (448px aprox)
      // En móviles tomará el 100% de la pantalla
      const availableW = Math.min(window.innerWidth, 448);
      const availableH = window.innerHeight;
      
      // El lienzo original es estrictamente 1080x1920
      const scaleX = availableW / 1080;
      const scaleY = availableH / 1920;
      
      // Tomamos la escala más pequeña para que el 100% del lienzo sea visible
      // y nunca se corten los bordes (object-fit: contain logic)
      setScale(Math.min(scaleX, scaleY));
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Ejecutar inmediatamente

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  const scenes = invitation?.content?.scenes || [];
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
    } else {
      if (isPrev) return null; // Ocultar por completo si no está transitando
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
        }}
      >
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
          const isInteractive = el.type === 'button' || el.type === 'audio' || el.type === 'video';

          return (
            <div
              key={el.id}
              className="absolute select-none"
              style={{
                // El mismo cálculo exacto de zIndex que en el diseñador para respetar las capas
                zIndex: elements.length - index,
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: `${el.width}px`,
                height: `${el.height}px`,
                transform: [
                  el.rotation ? `rotate(${el.rotation}deg)` : '',
                  el.flipH ? 'scaleX(-1)' : '',
                  el.flipV ? 'scaleY(-1)' : '',
                ].filter(Boolean).join(' ') || undefined,
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
    );
  };

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden font-sans">
      {/* Contenedor simulando la pantalla 9:16 con tamaño adaptativo */}
      <div 
        ref={containerRef}
        className="relative overflow-hidden sm:border-x sm:border-zinc-800 shadow-2xl bg-zinc-900"
        style={{ 
          width: 1080 * scale,
          height: 1920 * scale,
        }}
      >
        {/* Contenedor lógico que SIEMPRE mide 1080x1920 y es escalado por CSS */}
        <div style={{
          width: 1080,
          height: 1920,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0,
        }}>
          {scenes.map((scene: any, index: number) => 
            renderScene(
              scene, 
              index === prevSceneIndex, 
              index === currentSceneIndex
            )
          )}
        </div>
      </div>
    </div>
  );
}
