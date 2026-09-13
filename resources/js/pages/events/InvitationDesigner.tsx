import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Type,
  Image as ImageIcon,
  Video,
  Square,
  Box,
  Music,
  Sparkles,
  MapPin,
  Layers,
  Sliders,
  Play,
  Pause,
  Trash2,
  Check,
  ZoomIn,
  ZoomOut,
  Smartphone,
  AlertTriangle,
  Maximize,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Palette,
  Zap,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  FlipHorizontal,
  FlipVertical,
  Move,
  RotateCw,
  Plus,
  Upload,
  Search,
  X,
  Globe,
  FileText,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Ratio,
  Minus,
  Moon,
  Sun,
  Circle,
  Waves,
  Spline,
  Mountain,
} from 'lucide-react';
import api from '../../lib/api';
import type { Invitation, Event } from '../../types';
import { StylePickerPopover } from '../../components/StylePickerPopover';

interface NumberInputProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  isFloat?: boolean;
}

const InspectorNumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  isFloat = false,
}) => {
  const handleDecrement = () => {
    const nextVal = value - step;
    const clamped = min !== undefined ? Math.max(min, nextVal) : nextVal;
    onChange(isFloat ? parseFloat(clamped.toFixed(2)) : Math.round(clamped));
  };

  const handleIncrement = () => {
    const nextVal = value + step;
    const clamped = max !== undefined ? Math.min(max, nextVal) : nextVal;
    onChange(isFloat ? parseFloat(clamped.toFixed(2)) : Math.round(clamped));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(min !== undefined ? min : 0);
      return;
    }
    let parsed = isFloat ? parseFloat(raw) : parseInt(raw, 10);
    if (isNaN(parsed)) parsed = 0;
    if (min !== undefined) parsed = Math.max(min, parsed);
    if (max !== undefined) parsed = Math.min(max, parsed);
    onChange(isFloat ? parseFloat(parsed.toFixed(2)) : Math.round(parsed));
  };

  return (
    <div
      className="flex items-center h-7 rounded-lg border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full"
      style={{
        backgroundColor: 'var(--bg-app)',
        borderColor: 'var(--border-color)',
      }}
    >
      <button
        type="button"
        onClick={handleDecrement}
        className="w-5 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--primary-accent)',
        }}
        title="Disminuir"
      >
        <Minus size={10} />
      </button>
      {prefix && (
        <span className="text-[10px] font-bold pl-1.5 opacity-50 shrink-0 select-none">
          {prefix}
        </span>
      )}
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-full text-center bg-transparent outline-none font-mono text-xs font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none px-1"
        style={{ color: 'var(--text-main)' }}
      />
      <button
        type="button"
        onClick={handleIncrement}
        className="w-5 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--primary-accent)',
        }}
        title="Aumentar"
      >
        <Plus size={10} />
      </button>
    </div>
  );
};

interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'video' | 'shape' | '3d' | 'audio' | 'button' | 'widget_rsvp' | 'widget_map' | 'widget_countdown';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
  keepAspectRatio?: boolean;
  opacity?: number;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  // Estilo de Texto & WordArt
  color?: string;
  textBorderWidth?: number;
  textBorderColor?: string;
  textShadowColor?: string;
  textShadowBlur?: number;
  textShadowOffsetX?: number;
  textShadowOffsetY?: number;
  textAboveBorder?: boolean;
  wordArtShape?: 'none' | 'arcUp' | 'arcDown' | 'circle' | 'wave' | 'bulge' | 'skew' | 'semicircle';
  wordArtCurve?: number;
  letterSpacing?: number;
  skewX?: number;
  skewY?: number;

  // Estilo del Contenedor (Marco / Fondo)
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  containerBorderWidth?: number;
  containerBorderColor?: string;
  containerBorderStyle?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  containerBorderRadius?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  containerShadowColor?: string;
  containerShadowBlur?: number;
  containerShadowOffsetX?: number;
  containerShadowOffsetY?: number;
  boxShadow?: string;
  textAlign?: 'left' | 'center' | 'right';
  animation?: 'fade' | 'slideUp' | 'zoomIn' | 'bounce';
  animIn?: 'none' | 'fadeIn' | 'slideInUp' | 'slideInLeft' | 'zoomIn' | 'bounceIn' | 'spinIn';
  animOut?: 'none' | 'fadeOut' | 'slideOutDown' | 'slideOutRight' | 'zoomOut' | 'fadeScale';
  animDuration?: number;
  animDelay?: number;
  animEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier';
  locked?: boolean;
  visible?: boolean;
}

interface FontOption {
  name: string;
  category: string;
  type: 'standard' | 'google' | 'custom';
  url?: string;
}

const INITIAL_FONTS: FontOption[] = [
  { name: 'Inter', category: 'Sans-Serif', type: 'standard' },
  { name: 'Roboto', category: 'Sans-Serif', type: 'standard' },
  { name: 'Montserrat', category: 'Modern Sans', type: 'google' },
  { name: 'Outfit', category: 'Modern Sans', type: 'google' },
  { name: 'Poppins', category: 'Clean Sans', type: 'google' },
  { name: 'Playfair Display', category: 'Elegante Serif', type: 'google' },
  { name: 'Cormorant Garamond', category: 'Lujosa Serif', type: 'google' },
  { name: 'Cinzel', category: 'Románica Serif', type: 'google' },
  { name: 'Dancing Script', category: 'Caligrafía', type: 'google' },
  { name: 'Great Vibes', category: 'Boda Script', type: 'google' },
  { name: 'Alex Brush', category: 'Caligrafía Fina', type: 'google' },
  { name: 'Pacifico', category: 'Script Divertida', type: 'google' },
];

const GOOGLE_FONTS_CATALOG: FontOption[] = [
  { name: 'Alex Brush', category: 'Boda & Evento', type: 'google' },
  { name: 'Allura', category: 'Caligrafía Elegante', type: 'google' },
  { name: 'Bodoni Moda', category: 'Lujo & Moda', type: 'google' },
  { name: 'Caveat', category: 'Manuscrita', type: 'google' },
  { name: 'Cinzel', category: 'Serif Clásica', type: 'google' },
  { name: 'Cormorant Garamond', category: 'Editorial Serif', type: 'google' },
  { name: 'Dancing Script', category: 'Script Romántica', type: 'google' },
  { name: 'Great Vibes', category: 'Script Ceremonia', type: 'google' },
  { name: 'Inter', category: 'Sans Moderna', type: 'google' },
  { name: 'Lora', category: 'Serif Editorial', type: 'google' },
  { name: 'Marcellus', category: 'Románica Titulares', type: 'google' },
  { name: 'Montserrat', category: 'Sans Geométrica', type: 'google' },
  { name: 'Outfit', category: 'Sans Minimalista', type: 'google' },
  { name: 'Parisienne', category: 'Vintage Script', type: 'google' },
  { name: 'Playfair Display', category: 'Serif Alta Costura', type: 'google' },
  { name: 'Poppins', category: 'Sans Redondeada', type: 'google' },
  { name: 'Prata', category: 'Serif Contraste', type: 'google' },
  { name: 'Sacramento', category: 'Retro Script', type: 'google' },
  { name: 'Satisfy', category: 'Caligrafía Manual', type: 'google' },
  { name: 'Tangerine', category: 'Caligrafía Formal', type: 'google' },
];

const loadFontIntoDOM = (fontName: string, isCustom = false, fontUrl?: string) => {
  if (!fontName || fontName === 'Inter' || fontName === 'Roboto' || fontName === 'sans-serif') return;

  if (isCustom && fontUrl) {
    const styleId = `custom-font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = `@font-face { font-family: "${fontName}"; src: url("${fontUrl}"); font-display: swap; }`;
      document.head.appendChild(styleEl);
    }
  } else {
    const linkId = `google-font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
    if (!document.getElementById(linkId)) {
      const linkEl = document.createElement('link');
      linkEl.id = linkId;
      linkEl.rel = 'stylesheet';
      linkEl.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap`;
      document.head.appendChild(linkEl);
    }
  }
};

export default function InvitationDesigner() {
  const { id: eventId, invitationId } = useParams<{ id: string; invitationId: string }>();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Fonts state
  const [availableFonts, setAvailableFonts] = useState<FontOption[]>(INITIAL_FONTS);
  const [showFontModal, setShowFontModal] = useState(false);
  const [fontModalTab, setFontModalTab] = useState<'google' | 'upload'>('google');
  const [googleFontSearch, setGoogleFontSearch] = useState('');
  const [fontPreviewText, setFontPreviewText] = useState('');

  const handleSelectGoogleFont = (fontName: string) => {
    loadFontIntoDOM(fontName);
    setAvailableFonts((prev) => {
      if (prev.some((f) => f.name === fontName)) return prev;
      return [{ name: fontName, category: 'Google Font', type: 'google' }, ...prev];
    });
    if (selectedElementId) {
      updateSelectedElement('fontFamily', fontName);
    }
    setShowFontModal(false);
  };

  const handleFileUploadFont = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fontName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const blobUrl = URL.createObjectURL(file);

    loadFontIntoDOM(fontName, true, blobUrl);

    const newFont: FontOption = {
      name: fontName,
      category: 'Cargada desde Archivo',
      type: 'custom',
      url: blobUrl,
    };

    setAvailableFonts((prev) => {
      if (prev.some((f) => f.name === fontName)) return prev;
      return [newFont, ...prev];
    });

    if (selectedElementId) {
      updateSelectedElement('fontFamily', fontName);
    }

    setShowFontModal(false);
  };

  // Studio UI states
  const [activeLeftTab, setActiveLeftTab] = useState<'layers' | 'text' | 'media' | 'widgets'>('layers');
  const [inspectorTab, setInspectorTab] = useState<'design' | 'animation'>('design');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    content: true,
    transform: true,
    typography: true,
    wordart: false,
    container: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev: Record<string, boolean>) => {
      const isAlreadyOpen = !!prev[section];
      return {
        content: false,
        transform: false,
        typography: false,
        wordart: false,
        container: false,
        [section]: !isAlreadyOpen,
      };
    });
  };
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(30);
  const [zoomInputText, setZoomInputText] = useState('30');
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineTime, setTimelineTime] = useState(0);
  const [showStyleMenu, setShowStyleMenu] = useState(false);

  useEffect(() => {
    setZoomInputText(String(zoom));
  }, [zoom]);

  const handleZoomInputCommit = (valStr: string) => {
    const parsed = parseInt(valStr.replace(/\D/g, ''), 10);
    if (!isNaN(parsed)) {
      const clamped = Math.min(200, Math.max(10, parsed));
      setZoom(clamped);
      setZoomInputText(String(clamped));
    } else {
      setZoomInputText(String(zoom));
    }
  };

  const mainContainerRef = useRef<HTMLDivElement>(null);

  const handleFitToScreen = () => {
    if (!mainContainerRef.current) {
      setZoom(30);
      return;
    }
    const padding = 64; // Padding inside main container
    const availWidth = Math.max(100, mainContainerRef.current.clientWidth - padding);
    const availHeight = Math.max(100, mainContainerRef.current.clientHeight - padding);

    const scaleX = availWidth / 1080;
    const scaleY = availHeight / 1920;
    const fitScale = Math.min(scaleX, scaleY);

    const calculatedZoom = Math.floor(fitScale * 100);
    const finalZoom = Math.min(200, Math.max(10, calculatedZoom));
    setZoom(finalZoom);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFitToScreen();
    }, 100);
    window.addEventListener('resize', handleFitToScreen);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleFitToScreen);
    };
  }, []);

  // Initial Elements State
  const [elements, setElements] = useState<CanvasElement[]>([
    {
      id: 'el-title-1',
      type: 'text',
      content: '¡Nos Casamos!',
      x: 90,
      y: 240,
      width: 900,
      height: 150,
      fontSize: 84,
      fontWeight: 'bold',
      color: '#2B2D42',
      textAlign: 'center',
      animation: 'slideUp',
      visible: true,
      locked: false,
    },
    {
      id: 'el-sub-1',
      type: 'text',
      content: 'Acompañanos a celebrar nuestro gran día',
      x: 60,
      y: 420,
      width: 960,
      height: 120,
      fontSize: 42,
      color: '#8D99AE',
      textAlign: 'center',
      animation: 'fade',
      visible: true,
      locked: false,
    },
    {
      id: 'el-widget-rsvp',
      type: 'button',
      content: 'Confirmar Asistencia (RSVP)',
      x: 140,
      y: 1500,
      width: 800,
      height: 140,
      fontSize: 42,
      fontWeight: 'bold',
      color: '#FFFFFF',
      backgroundColor: '#E07A5F',
      borderRadius: 36,
      textAlign: 'center',
      animation: 'zoomIn',
      visible: true,
      locked: false,
    },
  ]);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (!eventId || !invitationId) return;
    setLoading(true);

    Promise.all([
      api.get(`/events/${eventId}`),
      api.get(`/invitations/${invitationId}`).catch(() => null),
    ])
      .then(([evRes, invRes]) => {
        setEvent(evRes.data.data || evRes.data);
        if (invRes) {
          const invData = invRes.data.data || invRes.data;
          setInvitation(invData);
          if (invData.content?.elements) {
            setElements(invData.content.elements);
          }
        }
      })
      .finally(() => {
        setLoading(false);
        setHasUnsavedChanges(false);
      });
  }, [eventId, invitationId]);

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      navigate(`/events/${eventId}/config`);
    }
  };

  const handleConfirmExit = () => {
    setShowUnsavedModal(false);
    navigate(`/events/${eventId}/config`);
  };

  const handleSave = async () => {
    if (!invitationId) return;
    setSaving(true);
    try {
      await api.put(`/invitations/${invitationId}`, {
        content: { elements },
      });
      setSavedSuccess(true);
      setHasUnsavedChanges(false);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch {
      alert('Error al guardar los cambios del diseñador');
    } finally {
      setSaving(false);
    }
  };

  const handleAddText = (type: 'title' | 'subtitle' | 'body') => {
    const newEl: CanvasElement = {
      id: `el-text-${Date.now()}`,
      type: 'text',
      content: type === 'title' ? 'Nuevo Título' : type === 'subtitle' ? 'Subtítulo' : 'Texto descriptivo...',
      x: 40,
      y: 180 + elements.length * 25,
      width: 280,
      height: 40,
      fontSize: type === 'title' ? 24 : type === 'subtitle' ? 16 : 13,
      fontWeight: type === 'title' ? 'bold' : 'normal',
      color: 'var(--text-main)',
      textAlign: 'center',
    };
    setElements([...elements, newEl]);
    setSelectedElementId(newEl.id);
    setHasUnsavedChanges(true);
  };

  const handleAddElementType = (elementType: 'text' | 'image' | 'video' | 'shape' | '3d' | 'button' | 'audio') => {
    const defaultLabels: Record<string, string> = {
      text: 'Nuevo Texto',
      image: 'Imagen Decorativa',
      video: 'Video Interactivo',
      shape: 'Figura geométrica',
      '3d': 'Modelo 3D Interactivo',
      button: 'Botón Interactivo',
      audio: 'Música de Fondo',
    };

    const newEl: CanvasElement = {
      id: `el-${elementType}-${Date.now()}`,
      type: elementType,
      content: defaultLabels[elementType] || 'Nuevo Elemento',
      x: 50,
      y: 120 + elements.length * 30,
      width: elementType === 'shape' ? 120 : elementType === '3d' ? 200 : 260,
      height: elementType === 'shape' ? 120 : elementType === '3d' ? 200 : 45,
      fontSize: elementType === 'text' ? 18 : undefined,
      color: 'var(--text-main)',
      backgroundColor: elementType === 'shape' ? 'var(--primary-accent-light)' : undefined,
      borderRadius: elementType === 'shape' ? 16 : undefined,
      textAlign: 'center',
      visible: true,
      locked: false,
    };

    setElements([...elements, newEl]);
    setSelectedElementId(newEl.id);
    setHasUnsavedChanges(true);
  };

  const toggleElementVisibility = (id: string) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, visible: el.visible === false ? true : false } : el))
    );
    setHasUnsavedChanges(true);
  };

  const toggleElementLock = (id: string) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, locked: !el.locked } : el))
    );
    setHasUnsavedChanges(true);
  };

  const handleAddWidget = (widgetType: string, label: string) => {
    const newEl: CanvasElement = {
      id: `el-widget-${Date.now()}`,
      type: 'button',
      content: label,
      x: 40,
      y: 360,
      width: 280,
      height: 45,
      fontSize: 14,
      fontWeight: 'bold',
      color: '#FFFFFF',
      backgroundColor: 'var(--primary-accent)',
      borderRadius: 10,
      textAlign: 'center',
      visible: true,
      locked: false,
    };
    setElements([...elements, newEl]);
    setSelectedElementId(newEl.id);
    setHasUnsavedChanges(true);
  };

  const handleDeleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
    setHasUnsavedChanges(true);
  };

  const handleMoveLayerUp = (index: number) => {
    if (index <= 0) return;
    const newElements = [...elements];
    const temp = newElements[index];
    newElements[index] = newElements[index - 1];
    newElements[index - 1] = temp;
    setElements(newElements);
    setHasUnsavedChanges(true);
  };

  const handleMoveLayerDown = (index: number) => {
    if (index >= elements.length - 1) return;
    const newElements = [...elements];
    const temp = newElements[index];
    newElements[index] = newElements[index + 1];
    newElements[index + 1] = temp;
    setElements(newElements);
    setHasUnsavedChanges(true);
  };

  // Drag & Transform interactive state
  const [dragState, setDragState] = useState<{
    mode: 'move' | 'resize' | 'rotate' | null;
    handle?: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
    startX: number;
    startY: number;
    elementInitial: { x: number; y: number; width: number; height: number; rotation: number };
  } | null>(null);

  const handlePointerDown = (
    e: React.PointerEvent,
    id: string,
    mode: 'move' | 'resize' | 'rotate',
    handle?: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
  ) => {
    e.stopPropagation();
    const el = elements.find((item) => item.id === id);
    if (!el || el.locked) return;

    setSelectedElementId(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setDragState({
      mode,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      elementInitial: {
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        rotation: el.rotation || 0,
      },
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState || !selectedElementId) return;

    const scaleFactor = zoom / 100;
    const deltaX = (e.clientX - dragState.startX) / scaleFactor;
    const deltaY = (e.clientY - dragState.startY) / scaleFactor;

    const { x, y, width, height, rotation } = dragState.elementInitial;

    if (dragState.mode === 'move') {
      const newX = Math.round(x + deltaX);
      const newY = Math.round(y + deltaY);
      setElements((prev) =>
        prev.map((el) => (el.id === selectedElementId ? { ...el, x: newX, y: newY } : el))
      );
      setHasUnsavedChanges(true);
    } else if (dragState.mode === 'resize' && dragState.handle) {
      const currentEl = elements.find((item) => item.id === selectedElementId);
      const keepRatio = currentEl?.keepAspectRatio;

      let newX = x;
      let newY = y;
      let newWidth = width;
      let newHeight = height;

      const h = dragState.handle;
      const initialAspect = width / height;

      if (h.includes('e')) newWidth = Math.max(30, width + deltaX);
      if (h.includes('s')) newHeight = Math.max(20, height + deltaY);

      if (h.includes('w')) {
        const potentialWidth = width - deltaX;
        if (potentialWidth >= 30) {
          newWidth = potentialWidth;
          newX = x + deltaX;
        }
      }

      if (h.includes('n')) {
        const potentialHeight = height - deltaY;
        if (potentialHeight >= 20) {
          newHeight = potentialHeight;
          newY = y + deltaY;
        }
      }

      if (keepRatio && initialAspect > 0) {
        if (h.includes('e') || h.includes('w')) {
          newHeight = Math.round(newWidth / initialAspect);
          if (h.includes('n')) {
            newY = y + (height - newHeight);
          }
        } else if (h.includes('n') || h.includes('s')) {
          newWidth = Math.round(newHeight * initialAspect);
          if (h.includes('w')) {
            newX = x + (width - newWidth);
          }
        }
      }

      setElements((prev) =>
        prev.map((el) =>
          el.id === selectedElementId
            ? { ...el, x: Math.round(newX), y: Math.round(newY), width: Math.round(newWidth), height: Math.round(newHeight) }
            : el
        )
      );
      setHasUnsavedChanges(true);
    } else if (dragState.mode === 'rotate') {
      const currentEl = elements.find((el) => el.id === selectedElementId);
      if (!currentEl) return;

      const centerX = x + width / 2;
      const centerY = y + height / 2;

      // Calculate angle from center to mouse cursor
      const rad = Math.atan2(e.clientY - (dragState.startY - (y - centerY) * scaleFactor), e.clientX - (dragState.startX - (x - centerX) * scaleFactor));
      const deg = Math.round((deltaX + deltaY) % 360);
      const newRot = (rotation + deg + 360) % 360;

      setElements((prev) =>
        prev.map((el) => (el.id === selectedElementId ? { ...el, rotation: newRot } : el))
      );
      setHasUnsavedChanges(true);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragState) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setDragState(null);
    }
  };

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  const updateSelectedElement = (key: keyof CanvasElement, val: any) => {
    if (!selectedElementId) return;
    setElements((prev) =>
      prev.map((el) => (el.id === selectedElementId ? { ...el, [key]: val } : el))
    );
    setHasUnsavedChanges(true);
  };

  const updateSelectedElementBatch = (updates: Partial<CanvasElement>) => {
    if (!selectedElementId) return;
    setElements((prev) =>
      prev.map((el) => (el.id === selectedElementId ? { ...el, ...updates } : el))
    );
    setHasUnsavedChanges(true);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg-app)' }}>
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"
          style={{ color: 'var(--primary-accent)' }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden select-none" style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}>
      {/* 1. Header Studio Bar (Con borde inferior del color del evento) */}
      <header
        className="flex h-14 shrink-0 items-center justify-between border-b-2 px-4 z-40"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderBottomColor: 'var(--primary-accent)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackClick}
            className="flex items-center justify-center rounded-lg p-2 transition-colors hover:opacity-80 border"
            style={{
              backgroundColor: 'var(--bg-app)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)',
            }}
            title="Volver"
          >
            <ArrowLeft size={18} style={{ color: 'var(--primary-accent)' }} />
          </button>
          <div className="h-4 w-[1px]" style={{ backgroundColor: 'var(--border-color)' }} />
          <div className="flex items-center gap-2">
            {(() => {
              const rawEvName = event?.name || (event as any)?.title || 'EVENTO';
              const evNameUpper = rawEvName.toUpperCase();
              
              const rawInvName = invitation?.title || (invitation as any)?.name || 'Invitación';
              const invNameCapitalized = rawInvName.charAt(0).toUpperCase() + rawInvName.slice(1).toLowerCase();

              return (
                <h1 className="text-sm font-extrabold tracking-wide" style={{ color: 'var(--text-main)' }}>
                  <span>{evNameUpper}</span>
                  <span className="font-normal opacity-70 ml-2">
                    | {invNameCapitalized}
                  </span>
                </h1>
              );
            })()}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {hasUnsavedChanges ? (
            <span
              className="text-xs font-extrabold flex items-center gap-1.5 px-2.5 py-1 rounded-full border animate-pulse"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
              }}
            >
              <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
              Sin guardar
            </span>
          ) : savedSuccess ? (
            <span className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--success)' }}>
              <Check size={14} /> Cambios guardados
            </span>
          ) : (
            <span className="text-xs font-medium opacity-60 flex items-center gap-1">
              <Check size={13} /> Guardado
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-extrabold text-white transition-opacity hover:opacity-90 shadow-xs"
            style={{ backgroundColor: 'var(--primary-accent)' }}
          >
            <Save size={15} /> {saving ? 'Guardando...' : 'Guardar Diseño'}
          </button>
        </div>
      </header>

      {/* 2. Main Studio Workspace */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Panel: Tools & Layers (Capas y Elementos) */}
        <aside
          className="w-72 shrink-0 border-r flex flex-col z-30 overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
          }}
        >
          {/* 1. SECCIÓN SUPERIOR: Icon-only Tool Bar con Tooltips (Texto, Imagen, Video, Shape, 3D, Audio) */}
          <div
            className="p-3 border-b"
            style={{
              backgroundColor: 'var(--bg-app)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Insertar Elemento
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {/* Texto */}
              <button
                onClick={() => handleAddElementType('text')}
                className="group relative flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-main)',
                }}
              >
                <Type size={15} style={{ color: 'var(--primary-accent)' }} />
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-1/2 -bottom-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
                  Texto
                </span>
              </button>

              {/* Imagen */}
              <button
                onClick={() => handleAddElementType('image')}
                className="group relative flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-main)',
                }}
              >
                <ImageIcon size={15} className="text-blue-500" />
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-1/2 -bottom-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
                  Imagen
                </span>
              </button>

              {/* Video */}
              <button
                onClick={() => handleAddElementType('video')}
                className="group relative flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-main)',
                }}
              >
                <Video size={15} className="text-purple-500" />
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-1/2 -bottom-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
                  Video
                </span>
              </button>

              {/* Shape / Figuras */}
              <button
                onClick={() => handleAddElementType('shape')}
                className="group relative flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-main)',
                }}
              >
                <Square size={15} className="text-emerald-500" />
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-1/2 -bottom-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
                  Shape
                </span>
              </button>

              {/* 3D */}
              <button
                onClick={() => handleAddElementType('3d')}
                className="group relative flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-main)',
                }}
              >
                <Box size={15} className="text-amber-500" />
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-1/2 -bottom-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
                  3D
                </span>
              </button>

              {/* Botón */}
              <button
                onClick={() => handleAddElementType('button')}
                className="group relative flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-main)',
                }}
              >
                <Smartphone size={15} className="text-teal-500" />
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-1/2 -bottom-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
                  Botón
                </span>
              </button>

              {/* Audio */}
              <button
                onClick={() => handleAddElementType('audio')}
                className="group relative flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-main)',
                }}
              >
                <Music size={15} className="text-rose-500" />
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-1/2 -bottom-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
                  Audio
                </span>
              </button>
            </div>
          </div>

          {/* 2. SECCIÓN INFERIOR: Administración de Capas (Layers) */}
          <div className="flex-1 flex flex-col min-h-0">
            <div
              className="flex items-center justify-between p-3 border-b shrink-0"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="flex items-center gap-2">
                <Layers size={15} style={{ color: 'var(--primary-accent)' }} />
                <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                  Capas
                </h3>
              </div>
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: 'var(--bg-app)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-muted)',
                }}
              >
                {elements.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {elements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Layers size={28} className="opacity-40 mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    No hay capas en el lienzo
                  </p>
                  <p className="text-[10px] mt-1 opacity-75" style={{ color: 'var(--text-muted)' }}>
                    Usa la barra superior para agregar elementos.
                  </p>
                </div>
              ) : (
                elements.map((el, idx) => {
                  const isSelected = selectedElementId === el.id;

                  return (
                    <div
                      key={el.id}
                      onClick={() => setSelectedElementId(el.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected ? 'shadow-xs' : 'hover:opacity-90'
                      }`}
                      style={{
                        backgroundColor: isSelected ? 'var(--primary-accent-light)' : 'var(--bg-app)',
                        borderColor: isSelected ? 'var(--primary-accent)' : 'var(--border-color)',
                        color: isSelected ? 'var(--primary-accent)' : 'var(--text-main)',
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Icono por tipo de elemento */}
                        {el.type === 'text' && <Type size={15} className="shrink-0" style={{ color: 'var(--primary-accent)' }} />}
                        {el.type === 'image' && <ImageIcon size={15} className="shrink-0 text-blue-500" />}
                        {el.type === 'video' && <Video size={15} className="shrink-0 text-purple-500" />}
                        {el.type === 'shape' && <Square size={15} className="shrink-0 text-emerald-500" />}
                        {el.type === '3d' && <Box size={15} className="shrink-0 text-amber-500" />}
                        {el.type === 'audio' && <Music size={15} className="shrink-0 text-rose-500" />}
                        {el.type === 'button' && <Smartphone size={15} className="shrink-0" style={{ color: 'var(--success)' }} />}

                        <span className={`truncate text-xs ${isSelected ? 'font-black' : 'font-semibold'}`}>
                          {el.content}
                        </span>
                      </div>

                      {/* Controles de Capa (Reordenar arriba/abajo, Visibilidad, Candado y Eliminar) */}
                      <div className="flex items-center gap-0.5 shrink-0 ml-2">
                        {/* Subir Capa (Mover más arriba en la lista / frente) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveLayerUp(idx);
                          }}
                          disabled={idx === 0}
                          className="p-1 rounded-md hover:opacity-80 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                          style={{ color: 'var(--text-main)' }}
                          title="Subir capa (Llevar hacia al frente)"
                        >
                          <ChevronUp size={13} />
                        </button>

                        {/* Bajar Capa (Mover más abajo en la lista / atrás) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveLayerDown(idx);
                          }}
                          disabled={idx === elements.length - 1}
                          className="p-1 rounded-md hover:opacity-80 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                          style={{ color: 'var(--text-main)' }}
                          title="Bajar capa (Enviar hacia atrás)"
                        >
                          <ChevronDown size={13} />
                        </button>

                        {/* Visibilidad */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleElementVisibility(el.id);
                          }}
                          className="p-1 rounded-md hover:opacity-80 transition-colors"
                          style={{ color: el.visible === false ? 'var(--text-muted)' : 'var(--text-main)' }}
                          title={el.visible === false ? 'Mostrar capa' : 'Ocultar capa'}
                        >
                          {el.visible === false ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>

                        {/* Bloqueo / Candado */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleElementLock(el.id);
                          }}
                          className="p-1 rounded-md hover:opacity-80 transition-colors"
                          style={{ color: el.locked ? 'var(--warning)' : 'var(--text-muted)' }}
                          title={el.locked ? 'Desbloquear capa' : 'Bloquear capa'}
                        >
                          {el.locked ? <Lock size={13} /> : <Unlock size={13} />}
                        </button>

                        {/* Eliminar Capa */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteElement(el.id);
                          }}
                          className="p-1 rounded-md hover:opacity-80 transition-colors"
                          style={{ color: 'var(--danger)' }}
                          title="Eliminar capa"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* Center: Canvas Stage (Escenario Móvil 9:16 adaptable al tema) */}
        <main
          ref={mainContainerRef}
          className="flex-1 flex flex-col items-center justify-center relative p-6 overflow-auto"
          style={{ backgroundColor: 'var(--bg-app)' }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Controls Zoom flotantes (Esquina superior izquierda del área del diseñador) */}
          <div
            className="absolute top-4 left-4 z-30 flex items-center gap-1.5 rounded-xl p-1.5 border shadow-sm backdrop-blur-xs text-xs font-bold"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)',
            }}
          >
            <button
              onClick={() => setZoom(Math.max(10, zoom - 10))}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:opacity-75 border"
              style={{
                backgroundColor: 'var(--bg-app)',
                borderColor: 'var(--border-color)',
              }}
              title="Reducir zoom (-10%)"
            >
              <ZoomOut size={14} />
            </button>

            {/* Input para escribir el porcentaje directamente */}
            <div className="relative flex items-center">
              <input
                type="text"
                value={zoomInputText}
                onChange={(e) => setZoomInputText(e.target.value)}
                onBlur={(e) => handleZoomInputCommit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleZoomInputCommit(zoomInputText);
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="w-12 rounded-md py-0.5 text-center font-mono text-xs border bg-transparent focus:outline-hidden"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-main)',
                }}
                title="Escribe un porcentaje (10-200%)"
              />
              <span className="text-[10px] font-mono opacity-60 ml-0.5">%</span>
            </div>

            <button
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:opacity-75 border"
              style={{
                backgroundColor: 'var(--bg-app)',
                borderColor: 'var(--border-color)',
              }}
              title="Aumentar zoom (+10%)"
            >
              <ZoomIn size={14} />
            </button>

            <div className="h-4 w-[1px] mx-0.5" style={{ backgroundColor: 'var(--border-color)' }} />

            {/* Botón Ajustar a Pantalla (Fit) */}
            <button
              onClick={handleFitToScreen}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-extrabold transition-colors hover:opacity-80 border"
              style={{
                backgroundColor: 'var(--bg-app)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-main)',
              }}
              title="Ajustar diseño a la pantalla"
            >
              <Maximize size={13} style={{ color: 'var(--primary-accent)' }} />
              Ajustar
            </button>
          </div>

          {/* Canvas stage outer layout container (Dimensiones físicas exactas según el zoom) */}
          <div
            className="flex items-center justify-center shrink-0 transition-all duration-150 my-auto"
            style={{
              width: `${1080 * (zoom / 100)}px`,
              height: `${1920 * (zoom / 100)}px`,
            }}
          >
            {/* Canvas stage transform container */}
            <div
              className="transition-transform duration-150 relative shadow-2xl shrink-0 origin-center"
              style={{
                width: '1080px',
                height: '1920px',
                transform: `scale(${zoom / 100})`,
              }}
            >
              {/* Canvas Stage 1080px x 1920px (Lienzo Pro sin aspecto de teléfono) */}
              <div
                className="w-[1080px] h-[1920px] relative overflow-hidden shadow-2xl border"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: 'var(--border-color)',
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setSelectedElementId(null);
                }
              }}
            >

              {/* Canvas Elements */}
              {elements.map((el, index) => {
                if (el.visible === false) return null;
                const isSelected = selectedElementId === el.id;

                return (
                  <div
                    key={el.id}
                    onPointerDown={(e) => handlePointerDown(e, el.id, 'move')}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElementId(el.id);
                    }}
                    className={`absolute transition-shadow select-none ${
                      el.locked ? 'cursor-not-allowed opacity-80' : 'cursor-move'
                    } ${
                      isSelected ? 'outline-4 outline-dashed outline-pink-500' : ''
                    }`}
                    style={{
                      zIndex: isSelected ? 999 : elements.length - index,
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
                      // Fondo / Relleno del contenedor
                      background: el.backgroundColor && el.backgroundColor.includes('gradient') ? el.backgroundColor : undefined,
                      backgroundColor: el.backgroundColor && !el.backgroundColor.includes('gradient') ? (el.backgroundColor === 'transparent' ? 'transparent' : el.backgroundColor) : 'transparent',
                      // Borde del contenedor
                      borderRadius: (el.containerBorderRadius ?? el.borderRadius) ? `${el.containerBorderRadius ?? el.borderRadius}px` : undefined,
                      borderWidth: (el.containerBorderWidth ?? el.borderWidth) ? `${el.containerBorderWidth ?? el.borderWidth}px` : undefined,
                      borderColor: (el.containerBorderWidth ?? el.borderWidth) ? (el.containerBorderColor || el.borderColor || 'transparent') : undefined,
                      borderStyle: (el.containerBorderWidth ?? el.borderWidth) ? (el.containerBorderStyle || el.borderStyle || 'solid') : undefined,
                      // Sombra del contenedor
                      boxShadow: (el.containerShadowBlur || el.containerShadowOffsetX || el.containerShadowOffsetY || el.shadowBlur || el.shadowOffsetX || el.shadowOffsetY)
                        ? `${el.containerShadowOffsetX ?? el.shadowOffsetX ?? 0}px ${el.containerShadowOffsetY ?? el.shadowOffsetY ?? 0}px ${el.containerShadowBlur ?? el.shadowBlur ?? 0}px ${el.containerShadowColor || el.shadowColor || 'rgba(0,0,0,0.5)'}`
                        : undefined,
                      textAlign: el.textAlign || 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {el.type === 'text' ? (
                      (() => {
                        const tBorderW = el.textBorderWidth ?? el.containerBorderWidth ?? el.borderWidth ?? 0;
                        const tBorderC = el.textBorderColor || el.containerBorderColor || el.borderColor || '#000000';
                        const tColor = el.color || 'var(--text-main)';
                        const isGradColor = typeof tColor === 'string' && tColor.includes('gradient');
                        const isGradBorder = typeof tBorderC === 'string' && tBorderC.includes('gradient');
                        const hasShadow = !!(el.textShadowBlur || el.textShadowOffsetX || el.textShadowOffsetY);
                        const shadowStr = hasShadow
                          ? `${el.textShadowOffsetX || 0}px ${el.textShadowOffsetY || 0}px ${el.textShadowBlur || 0}px ${el.textShadowColor || 'rgba(0,0,0,0.5)'}`
                          : undefined;

                        const lSpacing = el.letterSpacing ? `${el.letterSpacing}px` : undefined;
                        const hasSkew = (el.skewX || 0) !== 0 || (el.skewY || 0) !== 0;
                        const skewTransform = hasSkew ? `skew(${el.skewX || 0}deg, ${el.skewY || 0}deg)` : undefined;

                        // Soporte para formas SVG WordArt (arcUp, arcDown, circle, wave, bulge)
                        const wShape = el.wordArtShape || 'none';
                        const curveVal = el.wordArtCurve ?? 50;

                        if (wShape === 'arcUp' || wShape === 'arcDown' || wShape === 'wave' || wShape === 'circle' || wShape === 'semicircle') {
                          const pathId = `wordart-path-${el.id}`;
                          const gradId = `wordart-grad-${el.id}`;
                          const w = Math.max(100, el.width);
                          const h = Math.max(40, el.height);
                          const curveOffset = Math.round((curveVal / 100) * (h * 0.8));
                          const centerY = h / 2;
                          let dPath = `M 0 ${centerY} Q ${w / 2} ${centerY - curveOffset} ${w} ${centerY}`;

                          if (wShape === 'arcDown') {
                            dPath = `M 0 ${centerY} Q ${w / 2} ${centerY + curveOffset} ${w} ${centerY}`;
                          } else if (wShape === 'wave') {
                            dPath = `M 0 ${centerY} Q ${w / 4} ${centerY - curveOffset} ${w / 2} ${centerY} T ${w} ${centerY}`;
                          } else if (wShape === 'circle') {
                            const r = Math.min(w, h) / 2.2;
                            dPath = `M ${w / 2} ${centerY - r} A ${r} ${r} 0 1 1 ${w / 2 - 0.1} ${centerY - r}`;
                          } else if (wShape === 'semicircle') {
                            // Semicírculo: Empieza abajo a la izquierda, sube en arco de 180° y cae a la derecha
                            const rx = w / 2;
                            const ry = Math.max(10, Math.min(h * 0.85, (curveVal / 100) * h));
                            const baseScaleY = Math.min(h - 5, centerY + (ry / 2));
                            dPath = `M 0 ${baseScaleY} A ${rx} ${ry} 0 0 1 ${w} ${baseScaleY}`;
                          }

                          return (
                            <div className="w-full h-full flex items-center justify-center relative overflow-visible" style={{ transform: skewTransform }}>
                              <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${w} ${h}`}>
                                <defs>
                                  {isGradColor && (
                                    <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                                      {(() => {
                                        const stopsMatches = Array.from(
                                          tColor.matchAll(/(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\)|[a-zA-Z]+)\s+(\d+)%/g)
                                        );
                                        if (stopsMatches.length >= 2) {
                                          return stopsMatches.map((m, idx) => (
                                            <stop key={idx} offset={`${m[2]}%`} stopColor={m[1]} />
                                          ));
                                        }
                                        return (
                                          <>
                                            <stop offset="0%" stopColor="#E07A5F" />
                                            <stop offset="100%" stopColor="#F2CC8F" />
                                          </>
                                        );
                                      })()}
                                    </linearGradient>
                                  )}
                                </defs>
                                <path id={pathId} d={dPath} fill="none" stroke="none" />

                                {/* Si el borde debe estar abajo o redibujado por encima */}
                                {tBorderW > 0 && (
                                  <text
                                    fontSize={el.fontSize ? `${el.fontSize}px` : '24px'}
                                    fontWeight={el.fontWeight || 'bold'}
                                    fontFamily={el.fontFamily || 'Inter'}
                                    letterSpacing={el.letterSpacing ?? 0}
                                    textAnchor="middle"
                                    style={{
                                      stroke: isGradBorder ? '#E07A5F' : tBorderC,
                                      strokeWidth: `${tBorderW * 2}px`,
                                      fill: 'none',
                                      filter: shadowStr ? 'drop-shadow(0px 2px 4px rgba(0,0,0,0.4))' : undefined,
                                    }}
                                  >
                                    <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
                                      {el.content}
                                    </textPath>
                                  </text>
                                )}

                                {/* Capa de Relleno principal de texto */}
                                <text
                                  fill={isGradColor ? `url(#${gradId})` : tColor}
                                  fontSize={el.fontSize ? `${el.fontSize}px` : '24px'}
                                  fontWeight={el.fontWeight || 'bold'}
                                  fontFamily={el.fontFamily || 'Inter'}
                                  letterSpacing={el.letterSpacing ?? 0}
                                  textAnchor="middle"
                                  style={{
                                    stroke: (!el.textAboveBorder && tBorderW > 0) ? (isGradBorder ? '#E07A5F' : tBorderC) : undefined,
                                    strokeWidth: (!el.textAboveBorder && tBorderW > 0) ? `${tBorderW}px` : undefined,
                                    filter: (!tBorderW && shadowStr) ? 'drop-shadow(0px 2px 4px rgba(0,0,0,0.4))' : undefined,
                                  }}
                                >
                                  <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
                                    {el.content}
                                  </textPath>
                                </text>
                              </svg>
                            </div>
                          );
                        }

                        return el.textAboveBorder ? (
                          <div className="w-full relative inline-block text-left" style={{ textAlign: el.textAlign || 'left', transform: skewTransform }}>
                            {/* Capa inferior: Trazo de borde del texto */}
                            <span
                              className="w-full block truncate"
                              style={{
                                color: isGradBorder ? 'transparent' : (tBorderW > 0 ? tBorderC : 'transparent'),
                                backgroundImage: isGradBorder ? tBorderC : undefined,
                                WebkitBackgroundClip: isGradBorder ? 'text' : undefined,
                                WebkitTextFillColor: isGradBorder ? 'transparent' : undefined,
                                WebkitTextStroke: tBorderW > 0 ? `${tBorderW * 2}px ${isGradBorder ? 'transparent' : tBorderC}` : undefined,
                                textShadow: shadowStr,
                                letterSpacing: lSpacing,
                              }}
                            >
                              {el.content}
                            </span>
                            {/* Capa superior: Texto limpio redibujado por encima */}
                            <span
                              className="w-full absolute inset-0 block truncate pointer-events-none"
                              style={{
                                color: isGradColor ? 'transparent' : tColor,
                                backgroundImage: isGradColor ? tColor : undefined,
                                WebkitBackgroundClip: isGradColor ? 'text' : undefined,
                                WebkitTextFillColor: isGradColor ? 'transparent' : undefined,
                                WebkitTextStroke: '0 transparent',
                                letterSpacing: lSpacing,
                              }}
                            >
                              {el.content}
                            </span>
                          </div>
                        ) : (
                          <span
                            className="w-full truncate"
                            style={{
                              color: isGradColor ? 'transparent' : tColor,
                              backgroundImage: isGradColor ? tColor : undefined,
                              WebkitBackgroundClip: isGradColor ? 'text' : undefined,
                              WebkitTextFillColor: isGradColor ? 'transparent' : undefined,
                              textShadow: shadowStr,
                              WebkitTextStroke: tBorderW > 0 ? `${tBorderW}px ${isGradBorder ? '#000' : tBorderC}` : undefined,
                              letterSpacing: lSpacing,
                              transform: skewTransform,
                              display: hasSkew ? 'inline-block' : undefined,
                            }}
                          >
                            {el.content}
                          </span>
                        );
                      })()
                    ) : el.type === 'video' ? (
                      <div className="flex items-center justify-center w-full h-full bg-purple-950/20 border-2 border-purple-500/40 rounded-xl text-purple-400 gap-3 text-2xl font-bold">
                        <Video size={36} /> {el.content}
                      </div>
                    ) : el.type === '3d' ? (
                      <div className="flex flex-col items-center justify-center w-full h-full bg-amber-950/20 border-2 border-amber-500/40 rounded-2xl text-amber-400 gap-2 text-2xl font-extrabold shadow-inner">
                        <Box size={48} className="animate-bounce" /> {el.content}
                      </div>
                    ) : el.type === 'audio' ? (
                      <div className="flex items-center justify-center w-full h-full bg-rose-950/20 border-2 border-rose-500/40 rounded-xl text-rose-400 gap-3 text-2xl font-bold">
                        <Music size={32} /> {el.content}
                      </div>
                    ) : el.type === 'shape' ? (
                      <div className="w-full h-full flex items-center justify-center border-2 border-emerald-500/40 font-bold text-2xl" style={{ backgroundColor: el.backgroundColor || 'var(--primary-accent-light)' }}>
                        {el.content}
                      </div>
                    ) : (
                      el.content
                    )}

                    {/* Transform Handles (Transformar, Escalar, Rotar) */}
                    {isSelected && !el.locked && (
                      <>
                        {/* Control de Rotación Superior */}
                        <div
                          onPointerDown={(e) => handlePointerDown(e, el.id, 'rotate')}
                          className="absolute -top-12 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-pink-500 border-2 border-white text-white flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing hover:scale-110 z-40"
                          title="Girar / Rotar elemento"
                        >
                          <RotateCw size={16} />
                        </div>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[2px] h-4 bg-pink-500 z-30" />

                        {/* 8 Tiradores de Escala (Esquinas y Lados) */}
                        {/* Noroeste NW */}
                        <div
                          onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 'nw')}
                          className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-white border-3 border-pink-500 cursor-nwse-resize shadow-md hover:scale-125 z-40"
                        />
                        {/* Norte N */}
                        <div
                          onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 'n')}
                          className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-white border-3 border-pink-500 cursor-ns-resize shadow-md hover:scale-125 z-40"
                        />
                        {/* Noreste NE */}
                        <div
                          onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 'ne')}
                          className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-white border-3 border-pink-500 cursor-nesw-resize shadow-md hover:scale-125 z-40"
                        />
                        {/* Este E */}
                        <div
                          onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 'e')}
                          className="absolute top-1/2 -right-3 -translate-y-1/2 h-6 w-6 rounded-full bg-white border-3 border-pink-500 cursor-ew-resize shadow-md hover:scale-125 z-40"
                        />
                        {/* Sureste SE */}
                        <div
                          onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 'se')}
                          className="absolute -bottom-3 -right-3 h-6 w-6 rounded-full bg-white border-3 border-pink-500 cursor-nwse-resize shadow-md hover:scale-125 z-40"
                        />
                        {/* Sur S */}
                        <div
                          onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 's')}
                          className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-white border-3 border-pink-500 cursor-ns-resize shadow-md hover:scale-125 z-40"
                        />
                        {/* Suroeste SW */}
                        <div
                          onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 'sw')}
                          className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-white border-3 border-pink-500 cursor-nesw-resize shadow-md hover:scale-125 z-40"
                        />
                        {/* Oeste W */}
                        <div
                          onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 'w')}
                          className="absolute top-1/2 -left-3 -translate-y-1/2 h-6 w-6 rounded-full bg-white border-3 border-pink-500 cursor-ew-resize shadow-md hover:scale-125 z-40"
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

        {/* Right Panel: Inspector de Propiedades estilo Jitter */}
        <aside
          className="w-72 shrink-0 border-l flex flex-col z-30"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
          }}
        >
          {/* Tabs principales del Inspector: Diseño y Animación */}
          <div
            className="grid grid-cols-2 h-11 border-b text-xs font-bold shrink-0"
            style={{
              backgroundColor: 'var(--bg-app)',
              borderColor: 'var(--border-color)',
            }}
          >
            <button
              onClick={() => setInspectorTab('design')}
              className={`flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                inspectorTab === 'design' ? 'font-black' : 'hover:opacity-80'
              }`}
              style={{
                borderColor: inspectorTab === 'design' ? 'var(--primary-accent)' : 'transparent',
                color: inspectorTab === 'design' ? 'var(--primary-accent)' : 'var(--text-muted)',
              }}
            >
              <Palette size={15} /> Diseño
            </button>
            <button
              onClick={() => setInspectorTab('animation')}
              className={`flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                inspectorTab === 'animation' ? 'font-black' : 'hover:opacity-80'
              }`}
              style={{
                borderColor: inspectorTab === 'animation' ? 'var(--primary-accent)' : 'transparent',
                color: inspectorTab === 'animation' ? 'var(--primary-accent)' : 'var(--text-muted)',
              }}
            >
              <Zap size={15} /> Animación
            </button>
          </div>

          {/* Body del Inspector */}
          <div className="flex-1 overflow-y-auto">
            {!selectedElement ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <Sliders size={32} className="opacity-30 mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Selecciona una capa en el lienzo para ver y editar sus propiedades.
                </p>
              </div>
            ) : inspectorTab === 'design' ? (
              /* TAB: DISEÑO (ACORDEÓN EDGE-TO-EDGE SIN ESPACIOS MARGINALES) */
              <div className="text-xs border-b" style={{ borderColor: 'var(--border-color)' }}>
                {/* Header Informativo del Diseñador */}
                <div className="p-3 m-3 rounded-xl border flex items-center gap-2" style={{ backgroundColor: 'var(--primary-accent-light)', borderColor: 'var(--primary-accent)' }}>
                  <Palette size={18} style={{ color: 'var(--primary-accent)' }} />
                  <div>
                    <p className="font-extrabold" style={{ color: 'var(--primary-accent)' }}>Visual Design Engine</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-main)' }}>Configura el contenido, dimensiones y estilos del elemento.</p>
                  </div>
                </div>

                {/* 1. ACORDEÓN: CONTENIDO */}
                <div className="border-t" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => toggleSection('content')}
                    className="w-full flex items-center justify-between px-4 py-3 font-extrabold uppercase text-[10px] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors select-none"
                    style={{ color: openSections.content ? 'var(--primary-accent)' : 'var(--text-muted)' }}
                  >
                    <span>Contenido</span>
                    {openSections.content ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>

                  {openSections.content && (
                    <div className="px-4 pb-3 pt-0 border-t space-y-3" style={{ borderColor: 'var(--border-color)' }}>
                      <textarea
                        rows={3}
                        value={selectedElement.content}
                        onChange={(e) => updateSelectedElement('content', e.target.value)}
                        className="w-full rounded-lg px-3 py-2 border outline-none font-medium resize-y mt-2"
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-main)',
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* 2. ACORDEÓN: POSICIÓN & TAMAÑO */}
                <div className="border-t" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => toggleSection('transform')}
                    className="w-full flex items-center justify-between px-4 py-3 font-extrabold uppercase text-[10px] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors select-none"
                    style={{ color: openSections.transform ? 'var(--primary-accent)' : 'var(--text-muted)' }}
                  >
                    <span>Posición & Tamaño</span>
                    {openSections.transform ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>

                  {openSections.transform && (
                    <div className="px-4 pb-3 pt-2 border-t space-y-3" style={{ borderColor: 'var(--border-color)' }}>
                      {/* Botones de Alineación, Volteo & Aspect Ratio */}
                      <div className="flex items-center justify-between gap-0.5 p-0.5 rounded-lg border shadow-2xs" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                        {/* Grupo 1: Alineación Horizontal */}
                        <div className="flex items-center gap-0">
                          <button
                            onClick={() => updateSelectedElement('x', 0)}
                            className="p-1 rounded-md hover:opacity-80 transition-colors"
                            style={{ color: 'var(--text-main)' }}
                            title="Alinear a la izquierda"
                          >
                            <AlignStartVertical size={13} />
                          </button>
                          <button
                            onClick={() => updateSelectedElement('x', Math.round((1080 - selectedElement.width) / 2))}
                            className="p-1 rounded-md hover:opacity-80 transition-colors"
                            style={{ color: 'var(--text-main)' }}
                            title="Alinear al centro horizontal"
                          >
                            <AlignCenterVertical size={13} />
                          </button>
                          <button
                            onClick={() => updateSelectedElement('x', 1080 - selectedElement.width)}
                            className="p-1 rounded-md hover:opacity-80 transition-colors"
                            style={{ color: 'var(--text-main)' }}
                            title="Alinear a la derecha"
                          >
                            <AlignEndVertical size={13} />
                          </button>
                        </div>

                        <div className="h-3.5 w-px shrink-0 opacity-60" style={{ backgroundColor: 'var(--border-color)' }} />

                        {/* Grupo 2: Alineación Vertical */}
                        <div className="flex items-center gap-0">
                          <button
                            onClick={() => updateSelectedElement('y', 0)}
                            className="p-1 rounded-md hover:opacity-80 transition-colors"
                            style={{ color: 'var(--text-main)' }}
                            title="Alinear arriba"
                          >
                            <AlignStartHorizontal size={13} />
                          </button>
                          <button
                            onClick={() => updateSelectedElement('y', Math.round((1920 - selectedElement.height) / 2))}
                            className="p-1 rounded-md hover:opacity-80 transition-colors"
                            style={{ color: 'var(--text-main)' }}
                            title="Alinear al centro vertical"
                          >
                            <AlignCenterHorizontal size={13} />
                          </button>
                          <button
                            onClick={() => updateSelectedElement('y', 1920 - selectedElement.height)}
                            className="p-1 rounded-md hover:opacity-80 transition-colors"
                            style={{ color: 'var(--text-main)' }}
                            title="Alinear abajo"
                          >
                            <AlignEndHorizontal size={13} />
                          </button>
                        </div>

                        <div className="h-3.5 w-px shrink-0 opacity-60" style={{ backgroundColor: 'var(--border-color)' }} />

                        {/* Grupo 3: Volteo / Flip & Aspect Ratio */}
                        <div className="flex items-center gap-0">
                          <button
                            onClick={() => updateSelectedElement('flipH', !selectedElement.flipH)}
                            className={`p-1 rounded-md transition-colors ${
                              selectedElement.flipH ? 'bg-pink-500/20 text-pink-500 font-bold border border-pink-500/30' : 'hover:opacity-80'
                            }`}
                            style={{ color: selectedElement.flipH ? undefined : 'var(--text-main)' }}
                            title="Voltear horizontal (Flip H)"
                          >
                            <FlipHorizontal size={13} />
                          </button>
                          <button
                            onClick={() => updateSelectedElement('flipV', !selectedElement.flipV)}
                            className={`p-1 rounded-md transition-colors ${
                              selectedElement.flipV ? 'bg-pink-500/20 text-pink-500 font-bold border border-pink-500/30' : 'hover:opacity-80'
                            }`}
                            style={{ color: selectedElement.flipV ? undefined : 'var(--text-main)' }}
                            title="Voltear vertical (Flip V)"
                          >
                            <FlipVertical size={13} />
                          </button>

                          <div className="h-3.5 w-px mx-0.5 shrink-0 opacity-60" style={{ backgroundColor: 'var(--border-color)' }} />

                          <button
                            onClick={() => updateSelectedElement('keepAspectRatio', !selectedElement.keepAspectRatio)}
                            className={`p-1 rounded-md transition-colors ${
                              selectedElement.keepAspectRatio ? 'bg-pink-500/20 text-pink-500 font-bold border border-pink-500/30' : 'hover:opacity-80'
                            }`}
                            style={{ color: selectedElement.keepAspectRatio ? undefined : 'var(--text-main)' }}
                            title={selectedElement.keepAspectRatio ? "Aspect Ratio Bloqueado (Proporcional)" : "Aspect Ratio Libre"}
                          >
                            <Ratio size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Coordenadas X, Y, W, H */}
                      <div className="grid grid-cols-2 gap-2 font-mono">
                        <div>
                          <label className="block font-extrabold mb-1 uppercase text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            X
                          </label>
                          <InspectorNumberInput
                            value={selectedElement.x}
                            onChange={(val) => updateSelectedElement('x', val)}
                          />
                        </div>
                        <div>
                          <label className="block font-extrabold mb-1 uppercase text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            Y
                          </label>
                          <InspectorNumberInput
                            value={selectedElement.y}
                            onChange={(val) => updateSelectedElement('y', val)}
                          />
                        </div>
                        <div>
                          <label className="block font-extrabold mb-1 uppercase text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            W
                          </label>
                          <InspectorNumberInput
                            value={selectedElement.width}
                            min={10}
                            onChange={(val) => updateSelectedElement('width', val)}
                          />
                        </div>
                        <div>
                          <label className="block font-extrabold mb-1 uppercase text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            H
                          </label>
                          <InspectorNumberInput
                            value={selectedElement.height}
                            min={10}
                            onChange={(val) => updateSelectedElement('height', val)}
                          />
                        </div>
                      </div>

                      {/* Rotación y Opacidad */}
                      <div className="grid grid-cols-2 gap-2 font-mono pt-1">
                        <div>
                          <label className="block font-extrabold mb-1 uppercase text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            Rotación (°)
                          </label>
                          <InspectorNumberInput
                            value={selectedElement.rotation || 0}
                            min={-360}
                            max={360}
                            step={1}
                            onChange={(val) => updateSelectedElement('rotation', val)}
                          />
                        </div>
                        <div>
                          <label className="block font-extrabold mb-1 uppercase text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            Opacidad (%)
                          </label>
                          <InspectorNumberInput
                            value={selectedElement.opacity !== undefined ? selectedElement.opacity : 100}
                            min={0}
                            max={100}
                            step={5}
                            onChange={(val) => updateSelectedElement('opacity', val)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. ACORDEÓN: TIPOGRAFÍA & ESTILO (solo si aplica a Texto o Botones) */}
                {(selectedElement.type === 'text' || selectedElement.type === 'button') && (
                  <div className="border-t" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                    <button
                      type="button"
                      onClick={() => toggleSection('typography')}
                      className="w-full flex items-center justify-between px-4 py-3 font-extrabold uppercase text-[10px] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors select-none"
                      style={{ color: openSections.typography ? 'var(--primary-accent)' : 'var(--text-muted)' }}
                    >
                      <span>Tipografía & Estilo</span>
                      {openSections.typography ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {openSections.typography && (
                      <div className="px-4 pb-3 pt-2 border-t space-y-3" style={{ borderColor: 'var(--border-color)' }}>
                        {/* Fuente */}
                        <div>
                          <label className="block font-bold mb-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            Fuente
                          </label>
                          <div className="flex items-center gap-1.5">
                            <select
                              value={selectedElement.fontFamily || 'Inter'}
                              onChange={(e) => {
                                const font = e.target.value;
                                loadFontIntoDOM(font);
                                updateSelectedElement('fontFamily', font);
                              }}
                              className="w-full h-7 rounded-lg px-2 py-1 border outline-none font-medium text-xs cursor-pointer truncate"
                              style={{
                                backgroundColor: 'var(--bg-card)',
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-main)',
                                fontFamily: selectedElement.fontFamily || 'Inter',
                              }}
                            >
                              {availableFonts.map((f) => (
                                <option key={f.name} value={f.name} style={{ fontFamily: f.name }}>
                                  {f.name} {f.type === 'custom' ? '(Local)' : f.type === 'google' ? '(Google)' : ''}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => setShowFontModal(true)}
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-all hover:opacity-80 shadow-2xs cursor-pointer"
                              style={{
                                backgroundColor: 'var(--primary-accent)',
                                borderColor: 'var(--primary-accent)',
                                color: '#FFFFFF',
                              }}
                              title="Gestionar y explorar más fuentes en Google Fonts o subir archivo"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Estilo del Texto */}
                        <div>
                          <StylePickerPopover
                            label="Texto"
                            elementType="text"
                            styleConfig={{
                              color: selectedElement.color,
                              borderColor: selectedElement.textBorderColor || '#E07A5F',
                              borderWidth: selectedElement.textBorderWidth ?? 0,
                              shadowColor: selectedElement.textShadowColor || '#212121',
                              shadowBlur: selectedElement.textShadowBlur ?? 0,
                              shadowOffsetX: selectedElement.textShadowOffsetX ?? 0,
                              shadowOffsetY: selectedElement.textShadowOffsetY ?? 0,
                              textAboveBorder: selectedElement.textAboveBorder,
                            }}
                            onChange={(updatedStyles) => {
                              const mapped: any = {};
                              if (updatedStyles.color !== undefined) mapped.color = updatedStyles.color;
                              if (updatedStyles.borderColor !== undefined) mapped.textBorderColor = updatedStyles.borderColor;
                              if (updatedStyles.borderWidth !== undefined) mapped.textBorderWidth = updatedStyles.borderWidth;
                              if (updatedStyles.shadowColor !== undefined) mapped.textShadowColor = updatedStyles.shadowColor;
                              if (updatedStyles.shadowBlur !== undefined) mapped.textShadowBlur = updatedStyles.shadowBlur;
                              if (updatedStyles.shadowOffsetX !== undefined) mapped.textShadowOffsetX = updatedStyles.shadowOffsetX;
                              if (updatedStyles.shadowOffsetY !== undefined) mapped.textShadowOffsetY = updatedStyles.shadowOffsetY;
                              if (updatedStyles.textAboveBorder !== undefined) mapped.textAboveBorder = updatedStyles.textAboveBorder;
                              
                              Object.entries(mapped).forEach(([key, val]) => {
                                updateSelectedElement(key as any, val);
                              });
                            }}
                          />
                        </div>

                        {/* Tamaño & Peso */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-bold mb-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              Tamaño
                            </label>
                            <InspectorNumberInput
                              value={selectedElement.fontSize || 16}
                              min={6}
                              max={200}
                              step={1}
                              onChange={(val) => updateSelectedElement('fontSize', val)}
                            />
                          </div>
                          <div>
                            <label className="block font-bold mb-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              Peso
                            </label>
                            <select
                              value={selectedElement.fontWeight || 'normal'}
                              onChange={(e) => updateSelectedElement('fontWeight', e.target.value)}
                              className="w-full h-7 rounded-lg px-2 py-1 border outline-none font-semibold text-xs"
                              style={{
                                backgroundColor: 'var(--bg-card)',
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-main)',
                              }}
                            >
                              <option value="normal">Normal</option>
                              <option value="semibold">Semibold</option>
                              <option value="bold">Bold</option>
                            </select>
                          </div>
                        </div>

                        {/* Alineación de Texto */}
                        <div>
                          <label className="block font-bold mb-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            Alineación
                          </label>
                          <div className="grid grid-cols-4 gap-1 rounded-lg p-1 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                            <button
                              onClick={() => updateSelectedElement('textAlign', 'left')}
                              title="Izquierda"
                              className={`flex items-center justify-center py-1 rounded-md transition-colors ${
                                (selectedElement.textAlign || 'left') === 'left' ? 'bg-black/10 dark:bg-white/10 font-bold' : 'hover:opacity-75'
                              }`}
                            >
                              <AlignLeft size={14} />
                            </button>
                            <button
                              onClick={() => updateSelectedElement('textAlign', 'center')}
                              title="Centrado"
                              className={`flex items-center justify-center py-1 rounded-md transition-colors ${
                                selectedElement.textAlign === 'center' ? 'bg-black/10 dark:bg-white/10 font-bold' : 'hover:opacity-75'
                              }`}
                            >
                              <AlignCenter size={14} />
                            </button>
                            <button
                              onClick={() => updateSelectedElement('textAlign', 'right')}
                              title="Derecha"
                              className={`flex items-center justify-center py-1 rounded-md transition-colors ${
                                selectedElement.textAlign === 'right' ? 'bg-black/10 dark:bg-white/10 font-bold' : 'hover:opacity-75'
                              }`}
                            >
                              <AlignRight size={14} />
                            </button>
                            <button
                              onClick={() => updateSelectedElement('textAlign', 'justify')}
                              title="Justificado"
                              className={`flex items-center justify-center py-1 rounded-md transition-colors ${
                                selectedElement.textAlign === 'justify' ? 'bg-black/10 dark:bg-white/10 font-bold' : 'hover:opacity-75'
                              }`}
                            >
                              <AlignJustify size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. ACORDEÓN: WORDART (solo si aplica a Texto o Botones) */}
                {(selectedElement.type === 'text' || selectedElement.type === 'button') && (
                  <div className="border-t" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                    <button
                      type="button"
                      onClick={() => toggleSection('wordart')}
                      className="w-full flex items-center justify-between px-4 py-3 font-extrabold uppercase text-[10px] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors select-none"
                      style={{ color: openSections.wordart ? 'var(--primary-accent)' : 'var(--text-muted)' }}
                    >
                      <span>WordArt</span>
                      {openSections.wordart ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {openSections.wordart && (
                      <div className="px-4 pb-3 pt-2 border-t space-y-3" style={{ borderColor: 'var(--border-color)' }}>
                        {/* Selector de Forma / Efecto WordArt con Botones e Iconos Unicolor */}
                        <div>
                          <label className="block font-bold mb-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            Forma de Texto
                          </label>
                          <div className="grid grid-cols-4 gap-1 rounded-lg p-1 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                            {[
                              { id: 'none', label: 'Normal', icon: Minus },
                              { id: 'arcUp', label: 'Arco Arriba', icon: Moon },
                              { id: 'arcDown', label: 'Arco Abajo', icon: Sun },
                              { id: 'wave', label: 'Onda', icon: Waves },
                              { id: 'semicircle', label: 'Semicírculo', icon: Moon },
                              { id: 'bulge', label: 'Abombado', icon: Sparkles },
                              { id: 'skew', label: 'Inclinado', icon: Spline },
                            ].map((item) => {
                              const IconComp = item.icon;
                              const isSelected = (selectedElement.wordArtShape || 'none') === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => updateSelectedElement('wordArtShape', item.id as any)}
                                  title={item.label}
                                  className={`flex flex-col items-center justify-center p-1.5 rounded-md transition-all cursor-pointer ${
                                    isSelected ? 'font-extrabold shadow-2xs' : 'hover:opacity-80'
                                  }`}
                                  style={{
                                    backgroundColor: isSelected ? 'var(--primary-accent-light)' : 'transparent',
                                    color: isSelected ? 'var(--primary-accent)' : 'var(--text-main)',
                                    borderColor: isSelected ? 'var(--primary-accent)' : 'transparent',
                                  }}
                                >
                                  <IconComp size={15} />
                                  <span className="text-[9px] mt-0.5 font-semibold truncate w-full text-center">{item.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Controles en la misma fila: Curvatura (si aplica) y Espaciado de Letras */}
                        <div className="grid grid-cols-2 gap-2">
                          {selectedElement.wordArtShape && selectedElement.wordArtShape !== 'none' ? (
                            <div>
                              <label className="block font-bold mb-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                Curvatura (%)
                              </label>
                              <InspectorNumberInput
                                value={selectedElement.wordArtCurve ?? 50}
                                min={-100}
                                max={100}
                                step={5}
                                onChange={(val) => updateSelectedElement('wordArtCurve', val)}
                              />
                            </div>
                          ) : (
                            <div />
                          )}

                          <div>
                            <label className="block font-bold mb-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              Espaciado (px)
                            </label>
                            <InspectorNumberInput
                              value={selectedElement.letterSpacing ?? 0}
                              min={-5}
                              max={50}
                              step={1}
                              onChange={(val) => updateSelectedElement('letterSpacing', val)}
                            />
                          </div>
                        </div>

                        {/* Inclinación 3D Skew X / Skew Y si se selecciona Inclinado o estilo personalizado */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <label className="block font-bold mb-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              Inclinación X (°)
                            </label>
                            <InspectorNumberInput
                              value={selectedElement.skewX ?? 0}
                              min={-45}
                              max={45}
                              step={1}
                              onChange={(val) => updateSelectedElement('skewX', val)}
                            />
                          </div>
                          <div>
                            <label className="block font-bold mb-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              Inclinación Y (°)
                            </label>
                            <InspectorNumberInput
                              value={selectedElement.skewY ?? 0}
                              min={-45}
                              max={45}
                              step={1}
                              onChange={(val) => updateSelectedElement('skewY', val)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. ACORDEÓN: CONTENEDOR & ESTILO */}
                <div className="border-t" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => toggleSection('container')}
                    className="w-full flex items-center justify-between px-4 py-3 font-extrabold uppercase text-[10px] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors select-none"
                    style={{ color: openSections.container ? 'var(--primary-accent)' : 'var(--text-muted)' }}
                  >
                    <span>Contenedor & Estilo</span>
                    {openSections.container ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>

                  {openSections.container && (
                    <div className="px-4 pb-3 pt-2 border-t space-y-2" style={{ borderColor: 'var(--border-color)' }}>
                      <StylePickerPopover
                        label="Estilo del contenedor"
                        elementType="container"
                        styleConfig={{
                          backgroundColor: selectedElement.backgroundColor,
                          borderColor: selectedElement.containerBorderColor || '#E07A5F',
                          borderWidth: selectedElement.containerBorderWidth ?? 0,
                          borderStyle: selectedElement.containerBorderStyle || 'solid',
                          borderRadius: selectedElement.containerBorderRadius ?? 0,
                          shadowColor: selectedElement.containerShadowColor || '#212121',
                          shadowBlur: selectedElement.containerShadowBlur ?? 0,
                          shadowOffsetX: selectedElement.containerShadowOffsetX ?? 0,
                          shadowOffsetY: selectedElement.containerShadowOffsetY ?? 0,
                        }}
                        onChange={(updatedStyles) => {
                          const mapped: any = {};
                          if (updatedStyles.backgroundColor !== undefined) mapped.backgroundColor = updatedStyles.backgroundColor;
                          if (updatedStyles.borderColor !== undefined) mapped.containerBorderColor = updatedStyles.borderColor;
                          if (updatedStyles.borderWidth !== undefined) mapped.containerBorderWidth = updatedStyles.borderWidth;
                          if (updatedStyles.borderStyle !== undefined) mapped.containerBorderStyle = updatedStyles.borderStyle;
                          if (updatedStyles.borderRadius !== undefined) mapped.containerBorderRadius = updatedStyles.borderRadius;
                          if (updatedStyles.shadowColor !== undefined) mapped.containerShadowColor = updatedStyles.shadowColor;
                          if (updatedStyles.shadowBlur !== undefined) mapped.containerShadowBlur = updatedStyles.shadowBlur;
                          if (updatedStyles.shadowOffsetX !== undefined) mapped.containerShadowOffsetX = updatedStyles.shadowOffsetX;
                          if (updatedStyles.shadowOffsetY !== undefined) mapped.containerShadowOffsetY = updatedStyles.shadowOffsetY;

                          Object.entries(mapped).forEach(([key, val]) => {
                            updateSelectedElement(key as any, val);
                          });
                        }}
                      />

                      {/* Control directo de Redondez de Bordes */}
                      <div className="pt-1">
                        <label className="block font-bold mb-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          Redondez (px)
                        </label>
                        <InspectorNumberInput
                          value={selectedElement.containerBorderRadius ?? selectedElement.borderRadius ?? 0}
                          min={0}
                          max={200}
                          step={1}
                          onChange={(val) => {
                            updateSelectedElement('containerBorderRadius', val);
                            updateSelectedElement('borderRadius', val);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* TAB: ANIMACIÓN ESTILO JITTER */
              <div className="p-3 space-y-4 text-xs">
                <div className="p-3 rounded-xl border flex items-center gap-2" style={{ backgroundColor: 'var(--primary-accent-light)', borderColor: 'var(--primary-accent)' }}>
                  <Zap size={18} style={{ color: 'var(--primary-accent)' }} />
                  <div>
                    <p className="font-extrabold" style={{ color: 'var(--primary-accent)' }}>Jitter Motion Engine</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-main)' }}>Configura la animación de entrada y salida del elemento.</p>
                  </div>
                </div>

                {/* Animación de Entrada (In) */}
                <div>
                  <label className="block font-extrabold mb-1 uppercase text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    EFECTO DE ENTRADA (IN)
                  </label>
                  <select
                    value={selectedElement.animIn || 'slideInUp'}
                    onChange={(e) => updateSelectedElement('animIn', e.target.value)}
                    className="w-full rounded-lg px-3 py-2 border outline-none font-bold"
                    style={{
                      backgroundColor: 'var(--bg-app)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)',
                    }}
                  >
                    <option value="none">Sin animación</option>
                    <option value="fadeIn">Fade In (Disolución)</option>
                    <option value="slideInUp">Slide In Up (Deslizar desde abajo)</option>
                    <option value="slideInLeft">Slide In Left (Deslizar desde izquierda)</option>
                    <option value="zoomIn">Zoom In (Escalado elástico)</option>
                    <option value="bounceIn">Bounce In (Rebote dinámico)</option>
                    <option value="spinIn">Spin In (Rotación 3D)</option>
                  </select>
                </div>

                {/* Animación de Salida (Out) */}
                <div>
                  <label className="block font-extrabold mb-1 uppercase text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    EFECTO DE SALIDA (OUT)
                  </label>
                  <select
                    value={selectedElement.animOut || 'none'}
                    onChange={(e) => updateSelectedElement('animOut', e.target.value)}
                    className="w-full rounded-lg px-3 py-2 border outline-none font-bold"
                    style={{
                      backgroundColor: 'var(--bg-app)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)',
                    }}
                  >
                    <option value="none">Sin animación</option>
                    <option value="fadeOut">Fade Out (Desvanecer)</option>
                    <option value="slideOutDown">Slide Out Down (Deslizar abajo)</option>
                    <option value="slideOutRight">Slide Out Right (Deslizar derecha)</option>
                    <option value="zoomOut">Zoom Out (Reducir)</option>
                  </select>
                </div>

                {/* Tiempos de Animación: Duración y Retraso */}
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div>
                    <label className="block font-bold mb-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      Duración (seg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="5"
                      value={selectedElement.animDuration || 0.8}
                      onChange={(e) => updateSelectedElement('animDuration', parseFloat(e.target.value) || 0.8)}
                      className="w-full rounded-lg px-2.5 py-1.5 border outline-none"
                      style={{
                        backgroundColor: 'var(--bg-app)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-main)',
                      }}
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      Retraso Delay (seg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={selectedElement.animDelay || 0}
                      onChange={(e) => updateSelectedElement('animDelay', parseFloat(e.target.value) || 0)}
                      className="w-full rounded-lg px-2.5 py-1.5 border outline-none"
                      style={{
                        backgroundColor: 'var(--bg-app)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-main)',
                      }}
                    />
                  </div>
                </div>

                {/* Easing Curves */}
                <div>
                  <label className="block font-bold mb-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    Curva Easing de Transición
                  </label>
                  <select
                    value={selectedElement.animEasing || 'ease-out'}
                    onChange={(e) => updateSelectedElement('animEasing', e.target.value)}
                    className="w-full rounded-lg px-3 py-2 border outline-none"
                    style={{
                      backgroundColor: 'var(--bg-app)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)',
                    }}
                  >
                    <option value="ease">Ease</option>
                    <option value="ease-in">Ease In</option>
                    <option value="ease-out">Ease Out</option>
                    <option value="ease-in-out">Ease In Out</option>
                    <option value="cubic-bezier">Elastic Cubic Bezier</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* 3. Bottom Timeline Motion Bar (Línea de tiempo adaptable al tema) */}
      <footer
        className="h-12 border-t px-6 flex items-center justify-between text-xs shrink-0 z-40"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-xs"
            style={{ backgroundColor: 'var(--primary-accent)' }}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <span className="font-mono font-bold" style={{ color: 'var(--text-muted)' }}>00:00 / 00:05</span>
        </div>

        <div className="flex-1 max-w-xl mx-8 flex items-center gap-3">
          <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Timeline</span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={timelineTime}
            onChange={(e) => setTimelineTime(parseFloat(e.target.value))}
            className="w-full cursor-pointer"
            style={{ accentColor: 'var(--primary-accent)' }}
          />
        </div>

        <div className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
          Lienzo Vertical <strong style={{ color: 'var(--primary-accent)' }}>1080px × 1920px (9:16)</strong>
        </div>
      </footer>

      {/* Modal de Advertencia de Cambios sin Guardar */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl border transition-all scale-100"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-extrabold" style={{ color: 'var(--text-main)' }}>
                  ¿Deseas salir sin guardar?
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Tienes cambios sin guardar en el diseñador. Si sales ahora, perderás las modificaciones realizadas.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowUnsavedModal(false)}
                className="rounded-xl px-4 py-2.5 text-xs font-bold transition-all border hover:opacity-80"
                style={{
                  backgroundColor: 'var(--bg-app)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-main)',
                }}
              >
                No, continuar editando
              </button>
              <button
                onClick={handleConfirmExit}
                className="rounded-xl px-4 py-2.5 text-xs font-extrabold text-white transition-all shadow-sm hover:opacity-90 bg-red-600 hover:bg-red-700"
              >
                Sí, salir sin guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestión y Selección de Fuentes (Google Fonts & Cargar Archivo) */}
      {showFontModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            className="w-full max-w-2xl max-h-[85vh] rounded-2xl flex flex-col shadow-2xl border transition-all overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)',
            }}
          >
            {/* Header del Modal */}
            <div className="p-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-app)' }}>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
                  <Type size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold" style={{ color: 'var(--text-main)' }}>
                    Gestionar & Agregar Fuentes
                  </h3>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Explora la librería de Google Fonts o sube un archivo local (.ttf, .otf, .woff)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFontModal(false)}
                className="p-1.5 rounded-lg hover:opacity-80 transition-colors cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs del Modal */}
            <div className="grid grid-cols-2 h-10 border-b text-xs font-bold shrink-0" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-app)' }}>
              <button
                onClick={() => setFontModalTab('google')}
                className={`flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
                  fontModalTab === 'google' ? 'font-black' : 'opacity-60 hover:opacity-90'
                }`}
                style={{
                  borderColor: fontModalTab === 'google' ? 'var(--primary-accent)' : 'transparent',
                  color: fontModalTab === 'google' ? 'var(--primary-accent)' : 'var(--text-main)',
                }}
              >
                <Globe size={14} /> Google Fonts (Web)
              </button>
              <button
                onClick={() => setFontModalTab('upload')}
                className={`flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
                  fontModalTab === 'upload' ? 'font-black' : 'opacity-60 hover:opacity-90'
                }`}
                style={{
                  borderColor: fontModalTab === 'upload' ? 'var(--primary-accent)' : 'transparent',
                  color: fontModalTab === 'upload' ? 'var(--primary-accent)' : 'var(--text-main)',
                }}
              >
                <Upload size={14} /> Cargar Archivo (.ttf, .otf, .woff)
              </button>
            </div>

            {/* Body del Modal */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {fontModalTab === 'google' ? (
                <>
                  {/* Buscador de fuentes y Texto de Vista Previa */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="relative">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre o categoría..."
                        value={googleFontSearch}
                        onChange={(e) => setGoogleFontSearch(e.target.value)}
                        className="w-full rounded-xl pl-9 pr-4 py-2 border outline-none text-xs font-medium"
                        style={{
                          backgroundColor: 'var(--bg-app)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-main)',
                        }}
                      />
                    </div>
                    <div className="relative">
                      <Type size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                      <input
                        type="text"
                        placeholder="Escribe un texto de prueba..."
                        value={fontPreviewText}
                        onChange={(e) => setFontPreviewText(e.target.value)}
                        className="w-full rounded-xl pl-9 pr-4 py-2 border outline-none text-xs font-medium"
                        style={{
                          backgroundColor: 'var(--bg-app)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-main)',
                        }}
                        title="Si se deja vacío, la vista previa mostrará el nombre de la fuente"
                      />
                    </div>
                  </div>

                  {/* Grid de Google Fonts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {GOOGLE_FONTS_CATALOG.filter((f) =>
                      f.name.toLowerCase().includes(googleFontSearch.toLowerCase()) ||
                      f.category.toLowerCase().includes(googleFontSearch.toLowerCase())
                    ).map((f) => {
                      loadFontIntoDOM(f.name);
                      const isCurrent = selectedElement?.fontFamily === f.name;

                      return (
                        <div
                          key={f.name}
                          className={`rounded-xl p-3 border flex flex-col justify-between transition-all hover:border-pink-500/50 ${
                            isCurrent ? 'border-pink-500 bg-pink-500/5' : ''
                          }`}
                          style={{
                            backgroundColor: 'var(--bg-app)',
                            borderColor: isCurrent ? undefined : 'var(--border-color)',
                          }}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                                {f.name}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold bg-gray-500/10 text-gray-400">
                                {f.category}
                              </span>
                            </div>
                            <p
                              className="text-lg py-2 truncate text-slate-800 dark:text-slate-100"
                              style={{ fontFamily: `'${f.name}', sans-serif` }}
                            >
                              {fontPreviewText.trim() !== '' ? fontPreviewText : f.name}
                            </p>
                          </div>

                          <button
                            onClick={() => handleSelectGoogleFont(f.name)}
                            className="mt-2 w-full rounded-lg py-1.5 text-xs font-bold transition-all border flex items-center justify-center gap-1 hover:opacity-90 cursor-pointer"
                            style={{
                              backgroundColor: isCurrent ? 'var(--primary-accent)' : 'var(--bg-card)',
                              borderColor: 'var(--border-color)',
                              color: isCurrent ? '#FFFFFF' : 'var(--text-main)',
                            }}
                          >
                            {isCurrent ? (
                              <>
                                <Check size={13} /> Fuente Activa
                              </>
                            ) : (
                              '+ Usar esta Fuente'
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Tab Upload File */
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-pink-500/10 text-pink-500 border border-pink-500/20 flex items-center justify-center mb-4">
                    <Upload size={32} />
                  </div>
                  <h4 className="text-sm font-extrabold mb-1" style={{ color: 'var(--text-main)' }}>
                    Cargar archivo de fuente local
                  </h4>
                  <p className="text-xs max-w-sm mb-6 opacity-70" style={{ color: 'var(--text-muted)' }}>
                    Soporta archivos de tipografía formato <strong>.ttf</strong>, <strong>.otf</strong>, <strong>.woff</strong> y <strong>.woff2</strong>.
                  </p>

                  <label
                    className="px-6 py-3 rounded-xl font-extrabold text-xs text-white shadow-md cursor-pointer transition-all hover:opacity-90 flex items-center gap-2"
                    style={{ backgroundColor: 'var(--primary-accent)' }}
                  >
                    <FileText size={16} /> Seleccionar archivo de fuente
                    <input
                      type="file"
                      accept=".ttf,.otf,.woff,.woff2"
                      onChange={handleFileUploadFont}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
