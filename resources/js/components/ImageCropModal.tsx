import React, { useState, useRef, useEffect } from 'react';
import { Crop as CropIcon, Check, X, RotateCw, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<'free' | '1:1' | '4:3' | '16:9' | '9:16'>('free');
  
  // Crop area coordinates (in percentage 0..100)
  const [crop, setCrop] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragAction, setDragAction] = useState<'move' | 'nw' | 'ne' | 'se' | 'sw' | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; cropStart: typeof crop }>({
    x: 0,
    y: 0,
    cropStart: { x: 10, y: 10, width: 80, height: 80 },
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setCrop({ x: 10, y: 10, width: 80, height: 80 });
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  const handlePointerDown = (
    e: React.PointerEvent,
    action: 'move' | 'nw' | 'ne' | 'se' | 'sw'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    setDragAction(action);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      cropStart: { ...crop },
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragAction || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPercent = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - dragStart.y) / rect.height) * 100;

    const { x, y, width, height } = dragStart.cropStart;

    if (dragAction === 'move') {
      let newX = Math.max(0, Math.min(100 - width, x + deltaXPercent));
      let newY = Math.max(0, Math.min(100 - height, y + deltaYPercent));
      setCrop({ ...crop, x: newX, y: newY });
    } else {
      let newX = x;
      let newY = y;
      let newW = width;
      let newH = height;

      if (dragAction.includes('e')) newW = Math.max(10, Math.min(100 - x, width + deltaXPercent));
      if (dragAction.includes('s')) newH = Math.max(10, Math.min(100 - y, height + deltaYPercent));
      if (dragAction.includes('w')) {
        const potentialW = width - deltaXPercent;
        if (potentialW >= 10 && x + deltaXPercent >= 0) {
          newX = x + deltaXPercent;
          newW = potentialW;
        }
      }
      if (dragAction.includes('n')) {
        const potentialH = height - deltaYPercent;
        if (potentialH >= 10 && y + deltaYPercent >= 0) {
          newY = y + deltaYPercent;
          newH = potentialH;
        }
      }

      setCrop({ x: newX, y: newY, width: newW, height: newH });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setIsDragging(false);
      setDragAction(null);
    }
  };

  const applyCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const naturalW = img.naturalWidth || img.width;
    const naturalH = img.naturalHeight || img.height;

    // Calculate pixel coordinates based on percentage crop
    const pixelX = (crop.x / 100) * naturalW;
    const pixelY = (crop.y / 100) * naturalH;
    const pixelW = (crop.width / 100) * naturalW;
    const pixelH = (crop.height / 100) * naturalH;

    canvas.width = Math.max(1, Math.round(pixelW));
    canvas.height = Math.max(1, Math.round(pixelH));

    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    ctx.drawImage(
      img,
      pixelX,
      pixelY,
      pixelW,
      pixelH,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const croppedDataUrl = canvas.toDataURL('image/png');
    onCropComplete(croppedDataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
        style={{ color: 'var(--text-main)' }}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b shrink-0" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-app)' }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg border bg-[var(--primary-accent-light)] border-[var(--primary-accent)] text-[var(--primary-accent)]">
              <CropIcon size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider">Recortar Imagen</h3>
              <p className="text-[10px] text-[var(--text-muted)]">Ajusta el área de recorte y encuadre del recurso</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Area del Visor del Recorte */}
        <div className="flex-1 p-6 flex items-center justify-center bg-black/40 overflow-hidden relative select-none">
          <div
            ref={containerRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative max-w-full max-h-[50vh] flex items-center justify-center overflow-hidden rounded-lg shadow-lg border border-white/10 touch-none"
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Para recortar"
              className="max-h-[50vh] max-w-full object-contain pointer-events-none transition-transform"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
              crossOrigin="anonymous"
            />

            {/* Cuadro Máscara de Recorte Interactiva */}
            <div
              onPointerDown={(e) => handlePointerDown(e, 'move')}
              className="absolute border-2 border-amber-400 bg-amber-400/10 cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]"
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.width}%`,
                height: `${crop.height}%`,
              }}
            >
              {/* Cuadrícula de tercios */}
              <div className="w-full h-full grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-white" />
                <div className="border-r border-white" />
                <div />
              </div>

              {/* Handles de esquina para cambiar tamaño */}
              <div
                onPointerDown={(e) => handlePointerDown(e, 'nw')}
                className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-amber-400 border border-black rounded-full cursor-nwse-resize"
              />
              <div
                onPointerDown={(e) => handlePointerDown(e, 'ne')}
                className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-400 border border-black rounded-full cursor-nesw-resize"
              />
              <div
                onPointerDown={(e) => handlePointerDown(e, 'se')}
                className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-400 border border-black rounded-full cursor-nwse-resize"
              />
              <div
                onPointerDown={(e) => handlePointerDown(e, 'sw')}
                className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-amber-400 border border-black rounded-full cursor-nesw-resize"
              />
            </div>
          </div>
        </div>

        {/* Toolbar de Controles (Rotación y Zoom) */}
        <div className="px-5 py-3 border-t flex flex-wrap items-center justify-between gap-3 shrink-0" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-app)' }}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-1.5 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              style={{ borderColor: 'var(--border-color)' }}
              title="Alejar Zoom"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-xs font-mono font-bold w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className="p-1.5 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              style={{ borderColor: 'var(--border-color)' }}
              title="Acercar Zoom"
            >
              <ZoomIn size={14} />
            </button>

            <div className="h-4 w-px mx-1 bg-[var(--border-color)]" />

            <button
              type="button"
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="p-1.5 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1 text-xs font-bold cursor-pointer"
              style={{ borderColor: 'var(--border-color)' }}
              title="Rotar 90 grados"
            >
              <RotateCw size={14} />
              <span>Rotar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setRotation(0);
                setCrop({ x: 10, y: 10, width: 80, height: 80 });
              }}
              className="p-1.5 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1 text-xs font-bold cursor-pointer opacity-70 hover:opacity-100"
              style={{ borderColor: 'var(--border-color)' }}
              title="Restablecer"
            >
              <RefreshCw size={13} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              style={{ borderColor: 'var(--border-color)' }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={applyCrop}
              className="px-4 py-2 text-xs font-extrabold rounded-xl text-white flex items-center gap-1.5 shadow-md hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: 'var(--primary-accent)' }}
            >
              <Check size={15} />
              Aplicar Recorte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
