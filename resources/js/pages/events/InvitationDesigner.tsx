import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
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
  Grid,
  Heart,
  Star,
  Flower2,
  Mountain,
  Undo,
  Redo,
  LoaderCircle,
  Folder,
  Group,
  Ungroup,
  Link,
  Unlink,
  Layout,
  Mail,
  Copy,
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import type { Invitation, Event } from '../../types';
import { StylePickerPopover } from '../../components/StylePickerPopover';
import { ColorPickerPopover } from '../../components/ColorPickerPopover';
import { AssetPickerPopover } from '../../components/AssetPickerPopover';
import AppSelect from '../../components/AppSelect';
import { ImageElementItem, VideoElementItem, ShapeElementItem, ButtonElementItem, AudioElementItem } from '../../components/designer/DesignerMediaElements';
import { TextElementItem } from '../../components/designer/TextElementItem';

interface NumberInputProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  isFloat?: boolean;
  canvasDimension?: number;
}

const InspectorNumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  isFloat = false,
  canvasDimension,
}) => {
  const [inputValue, setInputValue] = useState<string>(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

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
    setInputValue(e.target.value);
  };

  const evaluate = () => {
    let raw = inputValue.trim();
    if (raw === '') {
      onChange(min !== undefined ? min : 0);
      return;
    }
    
    if (raw.endsWith('%') && canvasDimension) {
      const percentage = parseFloat(raw.replace('%', ''));
      if (!isNaN(percentage)) {
         let parsed = (percentage / 100) * canvasDimension;
         if (min !== undefined) parsed = Math.max(min, parsed);
         if (max !== undefined) parsed = Math.min(max, parsed);
         onChange(isFloat ? parseFloat(parsed.toFixed(2)) : Math.round(parsed));
         return;
      }
    }

    let parsed = isFloat ? parseFloat(raw) : parseInt(raw, 10);
    if (isNaN(parsed)) {
      setInputValue(value.toString());
      return;
    }
    if (min !== undefined) parsed = Math.max(min, parsed);
    if (max !== undefined) parsed = Math.min(max, parsed);
    onChange(isFloat ? parseFloat(parsed.toFixed(2)) : Math.round(parsed));
  };

  const handleBlur = () => evaluate();
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur();
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
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
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

interface SelectOption {
  value: string;
  label: string;
}

interface InspectorSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  className?: string;
}

const InspectorSelect: React.FC<InspectorSelectProps> = ({
  value,
  onChange,
  options,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOpt = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-7 rounded-lg border px-2 text-[10px] font-bold outline-none cursor-pointer flex items-center justify-between transition-all"
        style={{
          backgroundColor: 'var(--bg-app)',
          borderColor: isOpen ? 'var(--primary-accent)' : 'var(--border-color)',
          color: 'var(--text-main)',
        }}
      >
        <span className="truncate">{selectedOpt?.label}</span>
        <ChevronDown size={12} className={`transition-transform duration-200 shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border shadow-xl overflow-hidden py-1"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 text-[10px] font-bold transition-colors cursor-pointer flex items-center justify-between"
                style={{
                  backgroundColor: isSelected ? 'var(--primary-accent-light)' : 'transparent',
                  color: isSelected ? 'var(--primary-accent)' : 'var(--text-main)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--primary-accent-light)';
                    e.currentTarget.style.color = 'var(--primary-accent)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-main)';
                  }
                }}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check size={12} style={{ color: 'var(--primary-accent)' }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export interface ElementPermissions {
  transform?: boolean;  // Posición, Tamaño, Rotación, Opacidad
  typography?: boolean; // Fuente, Tamaño de texto, Alineación, Estilo
  appearance?: boolean; // Colores, Fondo, Filtros de imagen/video
  container?: boolean;  // Bordes, Sombras, Fondo de contenedor
  animation?: boolean;  // Animaciones de entrada/salida
  content?: boolean;    // Editar texto o cambiar medio/recurso
}

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
  // Permisos de Edición por Rol (Superadmin Lock)
  lockedSections?: ElementPermissions;
  // Estilo de Texto & WordArt
  color?: string;
  textBorderWidth?: number;
  textBorderColor?: string;
  textShadowColor?: string;
  textShadowBlur?: number;
  textShadowOffsetX?: number;
  textShadowOffsetY?: number;
  textAboveBorder?: boolean;
  wordArtShape?: 'none' | 'arc' | 'arcUp' | 'arcDown' | 'circle' | 'wave' | 'bulge' | 'skew' | 'semicircle';
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
  objectFit?: string;
  imgScale?: number;
  initialWidth?: number;
  initialHeight?: number;
  naturalWidth?: number;
  naturalHeight?: number;
  repeatTileSize?: number;
  imgBrightness?: number;
  imgContrast?: number;
  imgSaturate?: number;
  imgBlur?: number;
  imgGrayscale?: boolean;
  imgSepia?: boolean;
  groupId?: string;
  groupName?: string;
  preFitState?: { x: number; y: number; width: number; height: number; objectFit?: string };
}

import { EnvelopeSettings } from '../../types/designerTypes';
import { EnvelopeView, EnvelopeInspector, DEFAULT_ENVELOPE_SETTINGS } from '../../components/designer/EnvelopeCustomizer';

export interface Scene {
  id: string;
  name: string;
  isEnvelope?: boolean;
  envelopeSettings?: EnvelopeSettings;
  elements: CanvasElement[];
  transition?: 'none' | 'fade' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'zoomIn' | 'zoomOut';
  transitionDuration?: number;
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
}

export const DEFAULT_ENVELOPE_ELEMENTS: any[] = [
  {
    id: 'comp-env-background',
    isComponentParent: true,
    componentName: 'Componente Fondo Base (Sobre)',
    x: 0,
    y: 0,
    width: 1080,
    height: 1920,
    locked: true,
    visible: true,
    clipContent: true,
    children: [],
  },
  {
    id: 'comp-env-left-strip',
    isComponentParent: true,
    componentName: 'Componente Franja Izquierda',
    x: 0,
    y: 0,
    width: 308,
    height: 1920,
    locked: true,
    visible: true,
    clipContent: true,
    children: [],
  },
  {
    id: 'comp-env-right-strip',
    isComponentParent: true,
    componentName: 'Componente Franja Derecha',
    x: 308,
    y: 0,
    width: 772,
    height: 1920,
    locked: true,
    visible: true,
    clipContent: true,
    children: [],
  },
  {
    id: 'comp-env-middle-strip',
    isComponentParent: true,
    componentName: 'Componente Cintura Central',
    x: 0,
    y: 1100,
    width: 1080,
    height: 90,
    locked: true,
    visible: true,
    clipContent: true,
    children: [],
  },
  {
    id: 'comp-env-seal',
    isComponentParent: true,
    componentName: 'Componente Sello de Cera',
    x: 228,
    y: 1065,
    width: 160,
    height: 160,
    locked: true,
    visible: true,
    clipContent: true,
    children: [],
  },
  {
    id: 'env-open-button',
    type: 'button',
    content: 'Toca para abrir 💌',
    x: 400,
    y: 1125,
    width: 250,
    height: 40,
    fontSize: 18,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#333333',
    backgroundColor: 'transparent',
    textAlign: 'left',
    locked: false,
    visible: true,
  },
  {
    id: 'env-title-1',
    type: 'text',
    content: '¡ESTÁS INVITADO!',
    x: 140,
    y: 300,
    width: 800,
    height: 120,
    fontSize: 54,
    fontFamily: 'Playfair Display',
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    shadowBlur: 10,
    shadowColor: 'rgba(0,0,0,0.4)',
    shadowOffsetY: 4,
    visible: true,
    locked: false,
  },
  {
    id: 'env-subtitle-1',
    type: 'text',
    content: 'Tenemos algo especial para ti',
    x: 140,
    y: 430,
    width: 800,
    height: 60,
    fontSize: 22,
    color: '#F8F8F8',
    textAlign: 'center',
    shadowBlur: 5,
    shadowColor: 'rgba(0,0,0,0.4)',
    visible: true,
    locked: false,
  },
  {
    id: 'env-to-label',
    type: 'text',
    content: 'ENTREGAR A:',
    x: 140,
    y: 1350,
    width: 800,
    height: 60,
    fontSize: 22,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 'bold',
    textAlign: 'center',
    visible: true,
    locked: false,
  },
  {
    id: 'env-recipient',
    type: 'text',
    content: 'Invitado Especial',
    x: 140,
    y: 1420,
    width: 800,
    height: 100,
    fontSize: 48,
    fontFamily: 'Playfair Display',
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    shadowBlur: 8,
    shadowColor: 'rgba(0,0,0,0.4)',
    shadowOffsetY: 2,
    visible: true,
    locked: false,
  }
];

const ensureEnvelopeScene = (rawScenes: Scene[]): Scene[] => {
  const defaultEnv: Scene = {
    id: 'scene-envelope',
    name: 'Sobre ✉️',
    isEnvelope: true,
    envelopeSettings: DEFAULT_ENVELOPE_SETTINGS,
    elements: [...DEFAULT_ENVELOPE_ELEMENTS],
  };

  if (!rawScenes || rawScenes.length === 0) {
    return [
      defaultEnv,
      { id: 'scene-1', name: 'Escena 01', elements: [] }
    ];
  }

  if (rawScenes[0].isEnvelope || rawScenes[0].id === 'scene-envelope') {
    const scene = { 
      ...rawScenes[0], 
      isEnvelope: true, 
      name: 'Sobre ✉️', 
      envelopeSettings: { ...DEFAULT_ENVELOPE_SETTINGS, ...(rawScenes[0].envelopeSettings || {}) },
      elements: rawScenes[0].elements || []
    };
    if (!scene.elements.find(el => el.id === 'comp-env-background' || el.isComponentParent)) {
       // Reemplazar o fusionar los componentes estructurales actualizados
       const structural = DEFAULT_ENVELOPE_ELEMENTS.filter(e => e.isComponentParent);
       const otherElements = scene.elements.filter(e => !e.id.startsWith('env-') && !e.id.startsWith('comp-env-'));
       scene.elements = [...structural, ...otherElements];
    }
    return [scene, ...rawScenes.slice(1)];
  }

  const existingEnv = rawScenes.find(s => s.isEnvelope || s.id === 'scene-envelope');
  const rest = rawScenes.filter(s => s !== existingEnv);

  let envScene = defaultEnv;
  if (existingEnv) {
    envScene = { 
      ...existingEnv, 
      isEnvelope: true, 
      name: 'Sobre ✉️', 
      envelopeSettings: { ...DEFAULT_ENVELOPE_SETTINGS, ...(existingEnv.envelopeSettings || {}) },
      elements: existingEnv.elements || []
    };
    if (!envScene.elements.find(el => el.id === 'comp-env-background' || el.isComponentParent)) {
       const structural = DEFAULT_ENVELOPE_ELEMENTS.filter(e => e.isComponentParent);
       const otherElements = envScene.elements.filter(e => !e.id.startsWith('env-') && !e.id.startsWith('comp-env-'));
       envScene.elements = [...structural, ...otherElements];
    }
  }

  return [envScene, ...rest];
};

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
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';

  const { id: eventId, invitationId } = useParams<{ id: string; invitationId: string }>();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Scenes State
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  
  // UI Panels State
  const [scenesPanelHeight, setScenesPanelHeight] = useState(250);
  const [isResizingScenes, setIsResizingScenes] = useState(false);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editingSceneName, setEditingSceneName] = useState('');
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
    transform: false,
    imageFit: false,
    typography: false,
    wordart: false,
    container: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev: Record<string, boolean>) => {
      const isAlreadyOpen = !!prev[section];
      return {
        content: false,
        transform: false,
        imageFit: false,
        typography: false,
        wordart: false,
        container: false,
        [section]: !isAlreadyOpen,
      };
    });
  };
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);

  // Función para manejar selección (sencilla o múltiple con Shift/Ctrl)
  const handleSelectElement = (id: string | null, isMulti = false) => {
    if (!id) {
      setSelectedElementId(null);
      setSelectedElementIds([]);
      return;
    }

    if (isMulti) {
      setSelectedElementIds((prev) => {
        const exists = prev.includes(id);
        let updated: string[];
        if (exists) {
          updated = prev.filter((i) => i !== id);
        } else {
          updated = [...prev, id];
        }
        setSelectedElementId(updated.length > 0 ? updated[updated.length - 1] : null);
        return updated;
      });
    } else {
      setSelectedElementId(id);
      setSelectedElementIds([id]);
    }
  };

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Función para Agrupar capas seleccionadas
  const handleGroupSelected = () => {
    if (selectedElementIds.length < 2) return;
    const newGroupId = `group-${Date.now()}`;
    const groupName = `Grupo (${selectedElementIds.length} capas)`;
    pushHistorySnapshot(
      elements.map((el) =>
        selectedElementIds.includes(el.id)
          ? { ...el, groupId: newGroupId, groupName }
          : el
      )
    );
  };

  // Función para Desagrupar
  const handleUngroupSelected = (groupIdToUngroup?: string) => {
    const targetGroupId =
      groupIdToUngroup ||
      (selectedElementId
        ? elements.find((el) => el.id === selectedElementId)?.groupId
        : undefined);

    if (!targetGroupId) return;

    pushHistorySnapshot(
      elements.map((el) =>
        el.groupId === targetGroupId ? { ...el, groupId: undefined, groupName: undefined } : el
      )
    );
  };
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
  const stageCanvasRef = useRef<HTMLDivElement>(null);

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

  // Historial de cambios para función Deshacer (Undo) y Rehacer (Redo) - Máximo 15 acciones
  const [historyStack, setHistoryStack] = useState<CanvasElement[][]>([]);
  const [redoStack, setRedoStack] = useState<CanvasElement[][]>([]);

  // Función para guardar snapshot en el historial antes de modificar
  const pushHistorySnapshot = (newElements: CanvasElement[]) => {
    setHistoryStack((prev) => {
      const updated = [...prev, elements];
      // Limitar historial a los últimos 15 pasos
      if (updated.length > 15) return updated.slice(updated.length - 15);
      return updated;
    });
    setRedoStack([]); // Al realizar una nueva acción se limpia la pila de rehacer
    setElements(newElements);
    setHasUnsavedChanges(true);
  };

  // Función Deshacer (Undo)
  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const lastSnapshot = historyStack[historyStack.length - 1];
    setRedoStack((prev) => {
      const updated = [...prev, elements];
      if (updated.length > 15) return updated.slice(updated.length - 15);
      return updated;
    });
    setElements(lastSnapshot);
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));
    setHasUnsavedChanges(true);
  };

  // Función Rehacer (Redo)
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextSnapshot = redoStack[redoStack.length - 1];
    setHistoryStack((prev) => {
      const updated = [...prev, elements];
      if (updated.length > 15) return updated.slice(updated.length - 15);
      return updated;
    });
    setElements(nextSnapshot);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setHasUnsavedChanges(true);
  };

  // Listener para atajos de teclado globales (Ctrl+Z: Deshacer, Ctrl+Y / Ctrl+Shift+Z: Rehacer, Ctrl+G: Agrupar, Ctrl+Shift+G: Desagrupar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si se está escribiendo dentro de un input o textarea editable
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const keyLower = e.key.toLowerCase();

      // Ctrl + Shift + Z / Cmd + Shift + Z o Ctrl + Y (Rehacer)
      if ((isCmdOrCtrl && e.shiftKey && keyLower === 'z') || (isCmdOrCtrl && keyLower === 'y')) {
        e.preventDefault();
        handleRedo();
      }
      // Ctrl + Z / Cmd + Z (Deshacer)
      else if (isCmdOrCtrl && keyLower === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Ctrl + Shift + G / Cmd + Shift + G (Desagrupar)
      if (isCmdOrCtrl && e.shiftKey && keyLower === 'g') {
        e.preventDefault();
        handleUngroupSelected();
      }
      // Ctrl + G / Cmd + G (Agrupar)
      else if (isCmdOrCtrl && !e.shiftKey && keyLower === 'g') {
        e.preventDefault();
        handleGroupSelected();
      }

      // Flechas de dirección: Mover elementos (1px por defecto, 10px con Shift)
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(keyLower)) {
        const targetIds = selectedElementIds.length > 0 ? selectedElementIds : selectedElementId ? [selectedElementId] : [];
        if (targetIds.length > 0) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          let deltaX = 0;
          let deltaY = 0;

          if (keyLower === 'arrowup') deltaY = -step;
          if (keyLower === 'arrowdown') deltaY = step;
          if (keyLower === 'arrowleft') deltaX = -step;
          if (keyLower === 'arrowright') deltaX = step;

          setElements((prev) => {
            let updated = [...prev];
            targetIds.forEach((id) => {
              const targetEl = getSelectedElementRecursive(updated, id);
              if (targetEl && !targetEl.locked) {
                updated = updateElementRecursive(updated, id, {
                  x: Math.round(targetEl.x + deltaX),
                  y: Math.round(targetEl.y + deltaY),
                });
              }
            });
            return updated;
          });
          setHasUnsavedChanges(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [elements, historyStack, redoStack, selectedElementIds, selectedElementId]);

  // Handle Scenes Resizer
  useEffect(() => {
    if (!isResizingScenes) return;

    const handlePointerMove = (e: PointerEvent) => {
      // Calcular nueva altura basada en la distancia del ratón a la parte inferior de la ventana
      const newHeight = window.innerHeight - e.clientY - 90;
      setScenesPanelHeight(Math.max(100, Math.min(newHeight, 500)));
    };

    const handlePointerUp = () => {
      setIsResizingScenes(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingScenes]);

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
          if (invData.content) {
            const raw = invData.content.scenes && invData.content.scenes.length > 0
              ? invData.content.scenes
              : invData.content.elements
              ? [{ id: 'scene-1', name: 'Escena 01', elements: invData.content.elements }]
              : [];
            
            const processedScenes = ensureEnvelopeScene(raw);
            setScenes(processedScenes);

            const activeId = invData.content.activeSceneId && processedScenes.some((s: Scene) => s.id === invData.content.activeSceneId)
              ? invData.content.activeSceneId
              : processedScenes[0].id;
            
            setActiveSceneId(activeId);
            setElements(processedScenes.find((s: Scene) => s.id === activeId)?.elements || []);
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
      navigate(`/events/${eventId}/config?tab=INVITACION`);
    }
  };

  const handleConfirmExit = () => {
    setShowUnsavedModal(false);
    navigate(`/events/${eventId}/config?tab=INVITACION`);
  };

  const handleSave = async () => {
    if (!invitationId) return;
    setSaving(true);

    setSelectedElementId(null);
    setSelectedElementIds([]);

    // Sync current elements to the active scene before saving
    let updatedScenes = scenes;
    if (activeSceneId) {
      updatedScenes = scenes.map((s) => (s.id === activeSceneId ? { ...s, elements } : s));
    }

    let previewUrl: string | undefined = invitation?.content?.preview;
    
    const originalSceneId = activeSceneId;
    const sceneToPreview = updatedScenes.find((s) => !s.isEnvelope) || updatedScenes[0];
    const needsSwitchForPreview = sceneToPreview && sceneToPreview.id !== originalSceneId;

    if (needsSwitchForPreview) {
      flushSync(() => {
        setScenes(updatedScenes);
        setActiveSceneId(sceneToPreview.id);
        setElements(sceneToPreview.elements);
        setZoom(100);
      });
    } else {
      flushSync(() => {
        setScenes(updatedScenes);
        setZoom(100);
      });
    }

    if (stageCanvasRef.current) {
      try {
        const stageNode = stageCanvasRef.current;

        // Wait long enough for React to render Escena 1 and the browser to reflow the zoom.
        await new Promise((r) => setTimeout(r, 600));

        const canvas = await html2canvas(stageNode, {
          scale: 0.2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#FFFFFF',
          logging: false,
          ignoreElements: (element) => element.classList.contains('outline-pink-500'),
        });

        previewUrl = canvas.toDataURL('image/jpeg', 0.5);

      } catch (err) {
        console.error('Error generando vista previa:', err);
      } finally {
        // Restaurar SIEMPRE la escena activa original (ej. Sobre) y sus elementos
        if (needsSwitchForPreview) {
          const origSceneObj = updatedScenes.find((s) => s.id === originalSceneId);
          const origElements = origSceneObj ? origSceneObj.elements : elements;
          flushSync(() => {
            setScenes(updatedScenes);
            setActiveSceneId(originalSceneId);
            setElements(origElements);
          });
        }
        setTimeout(() => {
          handleFitToScreen();
        }, 100);
      }
    }

    try {
      // Ensure CSRF token is fresh before saving to avoid CSRF token mismatch on long sessions
      await api.get('/sanctum/csrf-cookie').catch(() => {});

      const activeSceneObj = updatedScenes.find((s) => s.id === originalSceneId);

      await api.put(`/invitations/${invitationId}`, {
        content: {
          scenes: updatedScenes,
          activeSceneId: originalSceneId,
          elements: activeSceneObj ? activeSceneObj.elements : elements,
          preview: previewUrl,
        },
      });
      setSavedSuccess(true);
      setHasUnsavedChanges(false);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      alert('Error al guardar los cambios del diseñador: ' + (err.response?.data?.message || err.message));
      console.error('Save error details:', err.response || err);
    } finally {
      setSaving(false);
    }
  };

  // Scene Management Functions
  const handleSwitchScene = (sceneId: string) => {
    if (sceneId === activeSceneId) return;

    // Sync current elements to current active scene
    setScenes((prev) => prev.map((s) => (s.id === activeSceneId ? { ...s, elements } : s)));

    // Load new scene
    setScenes((currentScenes) => {
      const newScene = currentScenes.find((s) => s.id === sceneId);
      if (newScene) {
        setActiveSceneId(sceneId);
        setElements(newScene.elements);
        setHistoryStack([]);
        setRedoStack([]);
        setSelectedElementId(null);
        setSelectedElementIds([]);
      }
      return currentScenes;
    });
  };

  const handleAddScene = () => {
    // Sync current first
    setScenes((prev) => prev.map((s) => (s.id === activeSceneId ? { ...s, elements } : s)));
    
    setScenes((currentScenes) => {
      const sceneCount = currentScenes.length;
      const newSceneId = `scene-${Date.now()}`;
      const newScene: Scene = {
        id: newSceneId,
        name: `Escena ${String(sceneCount + 1).padStart(2, '0')}`,
        elements: [],
      };
      
      const newScenesList = [...currentScenes, newScene];
      
      // Auto-switch to new scene
      setActiveSceneId(newSceneId);
      setElements([]);
      setHistoryStack([]);
      setRedoStack([]);
      setSelectedElementId(null);
      setSelectedElementIds([]);
      
      return newScenesList;
    });
  };

  const handleDeleteScene = (sceneId: string) => {
    const targetScene = scenes.find((s) => s.id === sceneId);
    if (targetScene?.isEnvelope || sceneId === scenes[0]?.id) {
      alert("La escena 'Sobre ✉️' es obligatoria para la portada y no se puede eliminar.");
      return;
    }

    if (scenes.length <= 2) {
      alert("Debes conservar al menos una escena de contenido además del Sobre.");
      return;
    }
    
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta escena?");
    if (!confirmDelete) return;

    setScenes((prev) => {
      const filtered = prev.filter((s) => s.id !== sceneId);
      if (activeSceneId === sceneId) {
        const fallback = filtered[0];
        setActiveSceneId(fallback.id);
        setElements(fallback.elements);
        setHistoryStack([]);
        setRedoStack([]);
        setSelectedElementId(null);
        setSelectedElementIds([]);
      }
      return filtered;
    });
  };

  const handleMoveSceneUp = (index: number) => {
    // La escena 0 (Sobre) no se puede mover, ni otra escena puede subirse a la posición 0
    if (index <= 1) return;
    setScenes((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveSceneDown = (index: number) => {
    // La escena 0 (Sobre) no se puede mover hacia abajo
    if (index === 0 || index === scenes.length - 1) return;
    setScenes((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleRenameScene = (sceneId: string, newName: string) => {
    setScenes((prev) => prev.map((s) => (s.id === sceneId ? { ...s, name: newName || s.name } : s)));
    setEditingSceneId(null);
  };

  const handleAddText = (type: 'title' | 'subtitle' | 'paragraph') => {
    const selectedComp = elements.find(el => el.id === selectedElementId && el.isComponentParent);

    const newChild: CanvasElement = {
      id: `el-text-${Date.now()}`,
      type: 'text',
      content: type === 'title' ? 'Título Principal' : type === 'subtitle' ? 'Subtítulo Elegante' : 'Párrafo de Texto',
      x: 20,
      y: 20,
      width: selectedComp ? Math.max(100, selectedComp.width - 40) : 750,
      height: type === 'title' ? 120 : type === 'subtitle' ? 60 : 40,
      fontSize: type === 'title' ? 48 : type === 'subtitle' ? 24 : 18,
      fontWeight: type === 'title' ? 'bold' : 'normal',
      color: 'var(--text-main)',
      textAlign: 'center',
      parentComponentId: selectedComp?.id,
    };

    if (selectedComp && activeScene?.isEnvelope) {
      const updatedElements = elements.map(el => {
        if (el.id === selectedComp.id) {
          return {
            ...el,
            children: [...(el.children || []), newChild]
          };
        }
        return el;
      });
      pushHistorySnapshot(updatedElements);
      setSelectedElementId(newChild.id);
      setSelectedElementIds([newChild.id]);
      return;
    }

    const newEl: CanvasElement = {
      ...newChild,
      x: 150,
      y: 400 + elements.length * 70,
    };
    pushHistorySnapshot([newEl, ...elements]);
    setSelectedElementId(newEl.id);
    setSelectedElementIds([newEl.id]);
  };

  const handleAddElementType = (elementType: 'component' | 'text' | 'image' | 'video' | 'shape' | '3d' | 'button' | 'audio') => {
    const defaultLabels: Record<string, string> = {
      component: 'Nuevo Componente',
      text: 'Nuevo Texto',
      image: '',
      video: '',
      shape: 'Figura geométrica',
      '3d': 'Modelo 3D Interactivo',
      button: 'Botón Interactivo',
      audio: 'Música de Fondo',
    };

    const selectedComp = elements.find(el => el.id === selectedElementId && el.isComponentParent);

    if (elementType === 'component') {
      const newComponent: CanvasElement = {
        id: `el-component-${Date.now()}`,
        type: 'component',
        content: 'Nuevo Componente',
        componentName: 'Nuevo Componente',
        isComponentParent: true,
        children: [],
        clipContent: true,
        x: 180,
        y: 200 + elements.length * 50,
        width: 400,
        height: 300,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderStyle: 'dashed',
        borderRadius: 8,
        visible: true,
        locked: false,
      };

      pushHistorySnapshot([newComponent, ...elements]);
      setSelectedElementId(newComponent.id);
      setSelectedElementIds([newComponent.id]);
      return;
    }

    const defaultWidth = elementType === 'image'
      ? (selectedComp ? Math.min(250, selectedComp.width - 20) : 350)
      : elementType === 'shape' || elementType === 'video'
      ? 200
      : elementType === '3d'
      ? 350
      : elementType === 'text'
      ? (selectedComp ? Math.min(250, selectedComp.width - 20) : 400)
      : 250;

    const defaultHeight = elementType === 'image'
      ? 200
      : elementType === 'shape' || elementType === 'video'
      ? 200
      : elementType === '3d'
      ? 350
      : elementType === 'text'
      ? 60
      : 80;

    const newChild: CanvasElement = {
      id: `el-${elementType}-${Date.now()}`,
      type: elementType,
      content: defaultLabels[elementType] || 'Nuevo Elemento',
      x: 10,
      y: 10,
      width: defaultWidth,
      height: defaultHeight,
      keepAspectRatio: elementType === 'image' ? true : undefined,
      fontSize: elementType === 'text' ? 32 : undefined,
      color: 'var(--text-main)',
      backgroundColor: elementType === 'shape' ? 'var(--primary-accent-light)' : undefined,
      borderRadius: elementType === 'shape' ? 16 : undefined,
      textAlign: 'center',
      visible: true,
      locked: false,
      parentComponentId: selectedComp?.id,
    };

    if (selectedComp) {
      const updatedElements = elements.map(el => {
        if (el.id === selectedComp.id) {
          return {
            ...el,
            children: [...(el.children || []), newChild]
          };
        }
        return el;
      });
      pushHistorySnapshot(updatedElements);
      setSelectedElementId(newChild.id);
      setSelectedElementIds([newChild.id]);
      return;
    }

    const newEl: CanvasElement = {
      ...newChild,
      x: 180,
      y: 350 + elements.length * 80,
    };

    pushHistorySnapshot([newEl, ...elements]);
    setSelectedElementId(newEl.id);
    setSelectedElementIds([newEl.id]);
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

  const handleMoveComponentChildUp = (parentId: string, childId: string) => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.id === parentId && el.children) {
          const idx = el.children.findIndex((c) => c.id === childId);
          if (idx <= 0) return el;
          const nextChildren = [...el.children];
          const temp = nextChildren[idx];
          nextChildren[idx] = nextChildren[idx - 1];
          nextChildren[idx - 1] = temp;
          return { ...el, children: nextChildren };
        }
        return el;
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleMoveComponentChildDown = (parentId: string, childId: string) => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.id === parentId && el.children) {
          const idx = el.children.findIndex((c) => c.id === childId);
          if (idx < 0 || idx >= el.children.length - 1) return el;
          const nextChildren = [...el.children];
          const temp = nextChildren[idx];
          nextChildren[idx] = nextChildren[idx + 1];
          nextChildren[idx + 1] = temp;
          return { ...el, children: nextChildren };
        }
        return el;
      })
    );
    setHasUnsavedChanges(true);
  };

  const toggleComponentChildVisibility = (parentId: string, childId: string) => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.id === parentId && el.children) {
          return {
            ...el,
            children: el.children.map((c) =>
              c.id === childId ? { ...c, visible: c.visible === false ? true : false } : c
            ),
          };
        }
        return el;
      })
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
    pushHistorySnapshot([newEl, ...elements]);
    setSelectedElementId(newEl.id);
    setSelectedElementIds([newEl.id]);
  };

  const handleDuplicateElement = (id: string) => {
    let duplicatedNewId: string | null = null;

    const cloneWithNewId = (el: CanvasElement): CanvasElement => {
      const newId = `el-${el.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      if (!duplicatedNewId) duplicatedNewId = newId;

      return {
        ...el,
        id: newId,
        x: el.x + 20,
        y: el.y + 20,
        children: el.children ? el.children.map((child) => cloneWithNewId(child)) : undefined,
      };
    };

    const duplicateRecursive = (elList: CanvasElement[]): CanvasElement[] => {
      const result: CanvasElement[] = [];
      for (const el of elList) {
        result.push(el);
        if (el.id === id) {
          result.push(cloneWithNewId(el));
        } else if (el.children && el.children.length > 0) {
          const updatedChildren = duplicateRecursive(el.children);
          result[result.length - 1] = { ...el, children: updatedChildren };
        }
      }
      return result;
    };

    const nextElements = duplicateRecursive(elements);
    pushHistorySnapshot(nextElements);

    if (duplicatedNewId) {
      setSelectedElementId(duplicatedNewId);
      setSelectedElementIds([duplicatedNewId]);
    }
  };

  const handleDeleteElement = (id: string) => {
    const deleteRecursive = (elList: CanvasElement[]): CanvasElement[] => {
      return elList
        .filter((el) => el.id !== id)
        .map((el) => {
          if (el.children && el.children.length > 0) {
            return { ...el, children: deleteRecursive(el.children) };
          }
          return el;
        });
    };

    pushHistorySnapshot(deleteRecursive(elements));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const handleDeleteGroup = (groupId: string) => {
    pushHistorySnapshot(elements.filter((el) => el.groupId !== groupId));
    setSelectedElementId(null);
    setSelectedElementIds([]);
  };

  const toggleGroupVisibility = (groupId: string) => {
    const groupItems = elements.filter((el) => el.groupId === groupId);
    const areAllHidden = groupItems.every((el) => el.visible === false);

    setElements((prev) =>
      prev.map((el) => (el.groupId === groupId ? { ...el, visible: areAllHidden ? true : false } : el))
    );
    setHasUnsavedChanges(true);
  };

  const handleMoveGroupUp = (groupId: string) => {
    // Encuentra el primer índice de un elemento del grupo
    const firstIdx = elements.findIndex((el) => el.groupId === groupId);
    if (firstIdx <= 0) return;

    // Elementos del grupo y elementos fuera
    const groupItems = elements.filter((el) => el.groupId === groupId);
    const otherItems = elements.filter((el) => el.groupId !== groupId);

    // Insertar el bloque del grupo una posición más arriba en el orden general
    const prevItemIdx = firstIdx - 1;
    const targetIdx = Math.max(0, prevItemIdx);

    const newElements = [...elements.filter((el) => el.groupId !== groupId)];
    newElements.splice(targetIdx, 0, ...groupItems);

    setElements(newElements);
    setHasUnsavedChanges(true);
  };

  const handleMoveGroupDown = (groupId: string) => {
    const groupIndices = elements
      .map((el, idx) => (el.groupId === groupId ? idx : -1))
      .filter((idx) => idx !== -1);

    if (groupIndices.length === 0) return;
    const lastIdx = groupIndices[groupIndices.length - 1];
    if (lastIdx >= elements.length - 1) return;

    const groupItems = elements.filter((el) => el.groupId === groupId);
    const nextItemIdx = lastIdx + 1;

    const newElements = [...elements.filter((el) => el.groupId !== groupId)];
    const insertPosition = Math.min(newElements.length, nextItemIdx - groupItems.length + 1);
    newElements.splice(insertPosition, 0, ...groupItems);

    setElements(newElements);
    setHasUnsavedChanges(true);
  };

  const handleMoveLayerUp = (index: number) => {
    if (index <= 0) return;
    const targetEl = elements[index];
    if (targetEl && targetEl.groupId) {
      handleMoveGroupUp(targetEl.groupId);
      return;
    }
    // Si el elemento inmediatamente superior pertenece a un grupo, saltar todo el grupo
    const prevEl = elements[index - 1];
    if (prevEl && prevEl.groupId) {
      const prevGroupId = prevEl.groupId;
      const groupFirstIdx = elements.findIndex((el) => el.groupId === prevGroupId);
      const targetPos = Math.max(0, groupFirstIdx);
      
      const newElements = elements.filter((_, i) => i !== index);
      newElements.splice(targetPos, 0, targetEl);
      setElements(newElements);
      setHasUnsavedChanges(true);
      return;
    }

    const newElements = [...elements];
    const temp = newElements[index];
    newElements[index] = newElements[index - 1];
    newElements[index - 1] = temp;
    setElements(newElements);
    setHasUnsavedChanges(true);
  };

  const handleMoveLayerDown = (index: number) => {
    if (index >= elements.length - 1) return;
    const targetEl = elements[index];
    if (targetEl && targetEl.groupId) {
      handleMoveGroupDown(targetEl.groupId);
      return;
    }
    // Si el elemento inmediatamente inferior pertenece a un grupo, saltar todo el grupo
    const nextEl = elements[index + 1];
    if (nextEl && nextEl.groupId) {
      const nextGroupId = nextEl.groupId;
      const groupIndices = elements
        .map((el, i) => (el.groupId === nextGroupId ? i : -1))
        .filter((i) => i !== -1);
      const groupLastIdx = groupIndices[groupIndices.length - 1];
      const targetPos = Math.min(elements.length - 1, groupLastIdx);

      const newElements = elements.filter((_, i) => i !== index);
      newElements.splice(targetPos, 0, targetEl);
      setElements(newElements);
      setHasUnsavedChanges(true);
      return;
    }

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
    const el = getSelectedElementRecursive(elements, id);
    if (!el || el.locked) return;

    // Si el usuario no es superadmin y la sección transform está bloqueada por el superadmin, impedir drag/resize/rotación
    if (!isSuperAdmin && el.lockedSections?.transform) return;

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
      const activeEl = getSelectedElementRecursive(elements, selectedElementId);
      const activeGroupId = activeEl?.groupId;

      setElements((prev) => {
        if (activeGroupId) {
          return prev.map((el) => {
            if (el.groupId === activeGroupId) {
              return {
                ...el,
                x: Math.round(el.x + (deltaX - ((dragState as any).lastDeltaX || 0))),
                y: Math.round(el.y + (deltaY - ((dragState as any).lastDeltaY || 0))),
              };
            }
            return el;
          });
        }
        return updateElementRecursive(prev, selectedElementId, {
          x: Math.round(x + deltaX),
          y: Math.round(y + deltaY),
        });
      });
      setDragState((prev) => (prev ? { ...prev, lastDeltaX: deltaX, lastDeltaY: deltaY } as any : null));
      setHasUnsavedChanges(true);
    } else if (dragState.mode === 'resize' && dragState.handle) {
      const currentEl = getSelectedElementRecursive(elements, selectedElementId);
      const keepRatio = currentEl?.keepAspectRatio;
      const h = dragState.handle;

      // Ángulo de rotación en radianes
      const rad = ((rotation || 0) * Math.PI) / 180;
      const cosRot = Math.cos(rad);
      const sinRot = Math.sin(rad);

      // Convertir el movimiento delta del ratón (pantalla) al espacio local desrotado (Eje X local horizontal, Eje Y local vertical)
      // Matriz inversa de rotación:
      // localDx = deltaX * cos(rad) + deltaY * sin(rad)
      // localDy = -deltaX * sin(rad) + deltaY * cos(rad)
      const localDx = deltaX * cosRot + deltaY * sinRot;
      const localDy = -deltaX * sinRot + deltaY * cosRot;

      let newWidth = width;
      let newHeight = height;

      if (h.includes('e')) newWidth = width + localDx;
      if (h.includes('w')) newWidth = width - localDx;
      if (h.includes('s')) newHeight = height + localDy;
      if (h.includes('n')) newHeight = height - localDy;

      newWidth = Math.max(30, newWidth);
      newHeight = Math.max(20, newHeight);

      if (keepRatio && width > 0 && height > 0) {
        const aspect = width / height;
        if (h === 'se' || h === 'nw') {
          const deltaSize = h === 'se' ? Math.max(localDx, localDy * aspect) : Math.max(-localDx, -localDy * aspect);
          newWidth = Math.max(30, Math.round(width + deltaSize));
          newHeight = Math.round(newWidth / aspect);
        } else if (h === 'ne' || h === 'sw') {
          const deltaSize = h === 'ne' ? Math.max(localDx, -localDy * aspect) : Math.max(-localDx, localDy * aspect);
          newWidth = Math.max(30, Math.round(width + deltaSize));
          newHeight = Math.round(newWidth / aspect);
        } else if (h.includes('e') || h.includes('w')) {
          newHeight = Math.round(newWidth / aspect);
        } else if (h.includes('n') || h.includes('s')) {
          newWidth = Math.round(newHeight * aspect);
        }
      }

      // Ancla fija en espacio de escena (Centro inicial del elemento sin cambiar)
      // El centro del elemento rotado con (x, y, width, height, rot):
      // centerX = x + (width/2)*cosRot - (height/2)*sinRot
      // centerY = y + (width/2)*sinRot + (height/2)*cosRot
      // Queremos que el punto ancla opuesto permanezca INMÓVIL en la escena.
      
      // Vector del centro al ancla opuesto en coordenadas locales (0.5, 0.5 es centro)
      let anchorLocalX = 0; // -0.5 (izquierda), 0 (centro), 0.5 (derecha)
      let anchorLocalY = 0; // -0.5 (arriba), 0 (centro), 0.5 (abajo)

      if (h.includes('w')) anchorLocalX = 0.5; // Ancla a la derecha (+0.5)
      else if (h.includes('e')) anchorLocalX = -0.5; // Ancla a la izquierda (-0.5)

      if (h.includes('n')) anchorLocalY = 0.5; // Ancla abajo (+0.5)
      else if (h.includes('s')) anchorLocalY = -0.5; // Ancla arriba (-0.5)

      // Coordenadas fijas del ancla en la escena basadas en el estado inicial antes de este tick
      const initAnchorX = x + (width / 2 + anchorLocalX * width) * cosRot - (height / 2 + anchorLocalY * height) * sinRot;
      const initAnchorY = y + (width / 2 + anchorLocalX * width) * sinRot + (height / 2 + anchorLocalY * height) * cosRot;

      // Nueva esquina superior izquierda (newX, newY) para que el ancla rotado de la nueva caja siga coincidiendo exactamente con initAnchorX, initAnchorY
      const newX = initAnchorX - (newWidth / 2 + anchorLocalX * newWidth) * cosRot + (newHeight / 2 + anchorLocalY * newHeight) * sinRot;
      const newY = initAnchorY - (newWidth / 2 + anchorLocalX * newWidth) * sinRot - (newHeight / 2 + anchorLocalY * newHeight) * cosRot;

      setElements((prev) =>
        updateElementRecursive(prev, selectedElementId, {
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newWidth),
          height: Math.round(newHeight),
        })
      );
      setHasUnsavedChanges(true);
    } else if (dragState.mode === 'rotate') {
      const currentEl = getSelectedElementRecursive(elements, selectedElementId);
      if (!currentEl) return;

      const centerX = x + width / 2;
      const centerY = y + height / 2;

      // Calculate angle from center to mouse cursor
      const rad = Math.atan2(e.clientY - (dragState.startY - (y - centerY) * scaleFactor), e.clientX - (dragState.startX - (x - centerX) * scaleFactor));
      const deg = Math.round((deltaX + deltaY) % 360);
      const newRot = (rotation + deg + 360) % 360;

      setElements((prev) =>
        updateElementRecursive(prev, selectedElementId, { rotation: newRot })
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

  // Búsqueda recursiva del elemento seleccionado (Soporta elementos hijos dentro de Componentes Padres)
  const getSelectedElementRecursive = (elList: CanvasElement[], targetId: string | null): CanvasElement | undefined => {
    if (!targetId) return undefined;
    for (const el of elList) {
      if (el.id === targetId) return el;
      if (el.children && el.children.length > 0) {
        const foundChild = getSelectedElementRecursive(el.children, targetId);
        if (foundChild) return foundChild;
      }
    }
    return undefined;
  };

  const selectedElement = getSelectedElementRecursive(elements, selectedElementId);
  const activeScene = scenes.find((s) => s.id === activeSceneId);

  const updateActiveScene = (key: keyof Scene, val: any) => {
    if (!activeSceneId) return;
    setScenes((prev) =>
      prev.map((s) => (s.id === activeSceneId ? { ...s, [key]: val } : s))
    );
    setHasUnsavedChanges(true);
  };

  // Actualización recursiva de un elemento (nivel superior o hijo dentro de componente)
  const updateElementRecursive = (
    elList: CanvasElement[],
    targetId: string,
    updates: Partial<CanvasElement>
  ): CanvasElement[] => {
    return elList.map((el) => {
      if (el.id === targetId) {
        return { ...el, ...updates };
      }
      if (el.children && el.children.length > 0) {
        return {
          ...el,
          children: updateElementRecursive(el.children, targetId, updates),
        };
      }
      return el;
    });
  };

  const updateSelectedElement = (key: keyof CanvasElement, val: any) => {
    if (!selectedElementId) return;
    setElements((prev) => updateElementRecursive(prev, selectedElementId, { [key]: val }));
    setHasUnsavedChanges(true);
  };

  const updateSelectedElementBatch = (updates: Partial<CanvasElement>) => {
    if (!selectedElementId) return;
    setElements((prev) => updateElementRecursive(prev, selectedElementId, updates));
    setHasUnsavedChanges(true);
  };

  const toggleSectionLock = (sectionKey: keyof ElementPermissions) => {
    if (!selectedElementId || !selectedElement) return;
    const currentLocks = selectedElement.lockedSections || {};
    const updatedLocks = {
      ...currentLocks,
      [sectionKey]: !currentLocks[sectionKey],
    };
    updateSelectedElement('lockedSections', updatedLocks);
  };

  const handleImageContentChange = (newVal: string) => {
    if (!newVal) {
      updateSelectedElement('content', '');
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      const parentComp = selectedElement?.parentComponentId
        ? elements.find((el) => el.id === selectedElement?.parentComponentId)
        : undefined;

      const maxLimitW = parentComp ? Math.min(350, parentComp.width - 20) : 550;
      let newW = img.naturalWidth || 300;
      let newH = img.naturalHeight || 200;

      if (newW > maxLimitW) {
        const ratio = maxLimitW / newW;
        newW = Math.round(maxLimitW);
        newH = Math.round(newH * ratio);
      }

      updateSelectedElementBatch({
        content: newVal,
        width: newW,
        height: newH,
        initialWidth: newW,
        initialHeight: newH,
        naturalWidth: img.naturalWidth || newW,
        naturalHeight: img.naturalHeight || newH,
        keepAspectRatio: true,
        imgScale: 100,
      });
    };
    img.onerror = () => {
      updateSelectedElement('content', newVal);
    };
    img.src = newVal;
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
          {/* Botón de Preview */}
          <a
            href={`/v/${invitationId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer shadow-sm"
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderColor: 'var(--border-color)',
              color: 'var(--primary-accent)'
            }}
            title="Ver en móvil (Preview)"
          >
            <Smartphone size={16} />
            <span className="text-xs font-bold">Preview</span>
          </a>

          {/* Botones de Deshacer (Undo) y Rehacer (Redo) con Historial de 15 acciones */}
          <div className="flex items-center rounded-lg border p-0.5" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyStack.length === 0}
              className="p-1.5 rounded-md transition-colors hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
              style={{ color: 'var(--text-main)' }}
              title={historyStack.length > 0 ? `Deshacer (${historyStack.length}) - Ctrl+Z` : 'Nada que deshacer'}
            >
              <Undo size={15} />
            </button>
            <div className="h-4 w-[1px] my-auto opacity-40" style={{ backgroundColor: 'var(--border-color)' }} />
            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1.5 rounded-md transition-colors hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
              style={{ color: 'var(--text-main)' }}
              title={redoStack.length > 0 ? `Rehacer (${redoStack.length}) - Ctrl+Y` : 'Nada que rehacer'}
            >
              <Redo size={15} />
            </button>
          </div>

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
            className="p-2 border-b"
            style={{
              backgroundColor: 'var(--bg-app)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center gap-2">
              {/* Columna Izquierda: Componente */}
              <div className="flex items-center shrink-0 pr-2 border-r" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  onClick={() => handleAddElementType('component')}
                  className="group relative flex h-10 w-10 items-center justify-center rounded-lg border transition-all hover:scale-105 active:scale-95 shadow-xs"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)',
                  }}
                >
                  <Folder size={20} className="text-amber-400 fill-amber-400/20" />
                  {/* Tooltip */}
                  <span className="pointer-events-none absolute left-1/2 -bottom-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[9px] font-bold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
                    Componente
                  </span>
                </button>
              </div>

              {/* Columna Derecha: Título + Elementos más pequeños y compactos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Insertar Elementos
                  </span>
                </div>

                <div className="flex items-center gap-0.5 flex-wrap">
                  {/* Texto */}
                  <button
                    onClick={() => handleAddElementType('text')}
                    className="group relative flex h-6 w-6 items-center justify-center rounded-md border transition-all hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)',
                    }}
                  >
                    <Type size={11} style={{ color: 'var(--primary-accent)' }} />
                    <span className="pointer-events-none absolute left-1/2 -bottom-6 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-1 py-0.5 text-[9px] font-bold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
                      Texto
                    </span>
                  </button>

                  {/* Imagen */}
                  <button
                    onClick={() => handleAddElementType('image')}
                    className="group relative flex h-6 w-6 items-center justify-center rounded-md border transition-all hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)',
                    }}
                  >
                    <ImageIcon size={11} className="text-blue-500" />
                    <span className="pointer-events-none absolute left-1/2 -bottom-6 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-1 py-0.5 text-[9px] font-bold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
                      Imagen
                    </span>
                  </button>

                  {/* Video */}
                  <button
                    onClick={() => handleAddElementType('video')}
                    className="group relative flex h-6 w-6 items-center justify-center rounded-md border transition-all hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)',
                    }}
                  >
                    <Video size={11} className="text-purple-500" />
                    <span className="pointer-events-none absolute left-1/2 -bottom-6 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-1 py-0.5 text-[9px] font-bold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
                      Video
                    </span>
                  </button>

                  {/* Shape / Figuras */}
                  <button
                    onClick={() => handleAddElementType('shape')}
                    className="group relative flex h-6 w-6 items-center justify-center rounded-md border transition-all hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)',
                    }}
                  >
                    <Square size={11} className="text-emerald-500" />
                    <span className="pointer-events-none absolute left-1/2 -bottom-6 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-1 py-0.5 text-[9px] font-bold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
                      Shape
                    </span>
                  </button>

                  {/* 3D */}
                  <button
                    onClick={() => handleAddElementType('3d')}
                    className="group relative flex h-6 w-6 items-center justify-center rounded-md border transition-all hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)',
                    }}
                  >
                    <Box size={11} className="text-amber-500" />
                    <span className="pointer-events-none absolute left-1/2 -bottom-6 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-1 py-0.5 text-[9px] font-bold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
                      3D
                    </span>
                  </button>

                  {/* Botón */}
                  <button
                    onClick={() => handleAddElementType('button')}
                    className="group relative flex h-6 w-6 items-center justify-center rounded-md border transition-all hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)',
                    }}
                  >
                    <Smartphone size={11} className="text-teal-500" />
                    <span className="pointer-events-none absolute left-1/2 -bottom-6 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-1 py-0.5 text-[9px] font-bold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
                      Botón
                    </span>
                  </button>

                  {/* Audio */}
                  <button
                    onClick={() => handleAddElementType('audio')}
                    className="group relative flex h-6 w-6 items-center justify-center rounded-md border transition-all hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)',
                    }}
                  >
                    <Music size={11} className="text-rose-500" />
                    <span className="pointer-events-none absolute left-1/2 -bottom-6 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-1 py-0.5 text-[9px] font-bold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
                      Audio
                    </span>
                  </button>
                </div>
              </div>
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

              <div className="flex items-center gap-1.5">
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
                (() => {
                  const renderedGroupIds = new Set<string>();
                  return elements.map((el, idx) => {
                    const isSelected = selectedElementIds.includes(el.id) || selectedElementId === el.id;
                    const isGrouped = !!el.groupId;

                    // Renderizado de Grupo Padre si es el primer elemento encontrado de ese groupId
                    if (isGrouped && el.groupId) {
                      const gId = el.groupId;
                      if (renderedGroupIds.has(gId)) {
                        return null; // Ya se renderizó dentro de la carpeta del grupo
                      }
                      renderedGroupIds.add(gId);

                      const groupChildren = elements.filter((item) => item.groupId === gId);
                      const isCollapsed = collapsedGroups[gId];
                      const isAnyChildSelected = groupChildren.some(
                        (item) => selectedElementIds.includes(item.id) || selectedElementId === item.id
                      );

                      return (
                        <div
                          key={gId}
                          className="rounded-lg border overflow-hidden transition-all shadow-2xs"
                          style={{
                            backgroundColor: 'rgba(245, 158, 11, 0.05)',
                            borderColor: isAnyChildSelected ? '#F59E0B' : 'rgba(245, 158, 11, 0.4)',
                          }}
                        >
                          {/* Cabecera del Grupo (Capa Padre 'Grupo') */}
                          <div
                            onClick={() => {
                              // Al hacer clic en la carpeta de grupo, seleccionar el grupo y focalizar sus hijos
                              const childIds = groupChildren.map((c) => c.id);
                              setSelectedElementIds(childIds);
                              setSelectedElementId(childIds[0] || null);
                            }}
                            className="flex items-center justify-between p-1.5 cursor-pointer bg-amber-500/10 hover:bg-amber-500/15 transition-colors border-b select-none"
                            style={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleGroupCollapse(gId);
                                }}
                                className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
                              >
                                {isCollapsed ? (
                                  <ChevronRight size={12} className="text-amber-500" />
                                ) : (
                                  <ChevronDown size={12} className="text-amber-500" />
                                )}
                              </button>
                              <Folder size={13} className="shrink-0 text-amber-500" />
                              <span className="font-extrabold text-[11px] text-amber-600 dark:text-amber-400 truncate">
                                {el.groupName || `Grupo (${groupChildren.length} capas)`}
                              </span>
                            </div>

                            {/* Controles del Grupo completo: Flechas Reordenar, Ojo, Cadena (Desagrupar), Eliminar */}
                            <div className="flex items-center gap-1 shrink-0 ml-1">
                              {/* Subir / Bajar Bloque del Grupo */}
                              <div className="flex items-center rounded-md border p-0.5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveGroupUp(gId);
                                  }}
                                  className="p-0.5 rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                                  style={{ color: 'var(--text-main)' }}
                                  title="Subir grupo de capas"
                                >
                                  <ChevronUp size={10} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveGroupDown(gId);
                                  }}
                                  className="p-0.5 rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                                  style={{ color: 'var(--text-main)' }}
                                  title="Bajar grupo de capas"
                                >
                                  <ChevronDown size={10} />
                                </button>
                              </div>

                              {/* Ojo (Visibilidad del grupo completo) & Cadena (Desagrupar solo icono) */}
                              <div className="flex items-center rounded-md border p-0.5 gap-0.5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleGroupVisibility(gId);
                                  }}
                                  className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                                  style={{
                                    color: groupChildren.every((c) => c.visible === false)
                                      ? 'var(--text-muted)'
                                      : 'var(--text-main)',
                                  }}
                                  title="Mostrar/Ocultar capas del grupo"
                                >
                                  {groupChildren.every((c) => c.visible === false) ? (
                                    <EyeOff size={10} />
                                  ) : (
                                    <Eye size={10} />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUngroupSelected(gId);
                                  }}
                                  className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-amber-500 cursor-pointer"
                                  title="Desagrupar estas capas"
                                >
                                  <Unlink size={10} />
                                </button>
                              </div>

                              {/* Eliminar Grupo completo */}
                              <div className="flex items-center rounded-md border p-0.5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteGroup(gId);
                                  }}
                                  className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                                  style={{ color: 'var(--danger)' }}
                                  title="Eliminar grupo completo"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Capas Hijos dentro del Grupo (Visualmente normales) */}
                          {!isCollapsed && (
                            <div className="p-1 space-y-1 bg-black/5 dark:bg-white/5">
                              {groupChildren.map((childEl) => {
                                const childIdx = elements.findIndex((item) => item.id === childEl.id);

                                return (
                                  <div
                                    key={childEl.id}
                                    onClick={(e) =>
                                      handleSelectElement(childEl.id, e.shiftKey || e.ctrlKey || e.metaKey)
                                    }
                                    className="flex items-center justify-between p-1.5 rounded-md border text-[11px] cursor-pointer transition-all ml-1.5 hover:opacity-90 shadow-2xs"
                                    style={{
                                      backgroundColor: 'var(--bg-card)',
                                      borderColor: 'var(--border-color)',
                                      color: 'var(--text-main)',
                                    }}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      {childEl.type === 'text' && <Type size={13} className="shrink-0" style={{ color: 'var(--primary-accent)' }} />}
                                      {childEl.type === 'image' && <ImageIcon size={13} className="shrink-0 text-blue-500" />}
                                      {childEl.type === 'video' && <Video size={13} className="shrink-0 text-purple-500" />}
                                      {childEl.type === 'shape' && <Square size={13} className="shrink-0 text-emerald-500" />}
                                      {childEl.type === '3d' && <Box size={13} className="shrink-0 text-amber-500" />}
                                      {childEl.type === 'audio' && <Music size={13} className="shrink-0 text-rose-500" />}
                                      {childEl.type === 'button' && <Smartphone size={13} className="shrink-0" style={{ color: 'var(--success)' }} />}

                                      <span className="truncate text-[11px] font-medium">
                                        {childEl.content}
                                      </span>
                                    </div>

                                    {/* Controles de Capa Hijo */}
                                    <div className="flex items-center gap-0.5 shrink-0 ml-1">
                                      <div className="flex items-center rounded-md border p-0.5" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleMoveLayerUp(childIdx);
                                          }}
                                          disabled={childIdx === 0}
                                          className="p-0.5 rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                                        >
                                          <ChevronUp size={10} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleMoveLayerDown(childIdx);
                                          }}
                                          disabled={childIdx === elements.length - 1}
                                          className="p-0.5 rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                                        >
                                          <ChevronDown size={10} />
                                        </button>
                                      </div>

                                      <div className="flex items-center rounded-md border p-0.5 gap-0.5" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleElementVisibility(childEl.id);
                                          }}
                                          className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                                        >
                                          {childEl.visible === false ? <EyeOff size={10} /> : <Eye size={10} />}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleElementLock(childEl.id);
                                          }}
                                          className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                                        >
                                          {childEl.locked ? <Lock size={10} /> : <Unlock size={10} />}
                                        </button>
                                      </div>

                                      <div className="flex items-center rounded-md border p-0.5 gap-0.5" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDuplicateElement(childEl.id);
                                          }}
                                          className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-blue-500 cursor-pointer"
                                          title="Duplicar elemento"
                                        >
                                          <Copy size={10} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteElement(childEl.id);
                                          }}
                                          className="p-0.5 rounded text-red-500 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                                          title="Eliminar elemento"
                                        >
                                          <Trash2 size={10} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Renderizado de Componente Padre (Exclusivo del Sobre) con Elementos Hijos Anidados
                    if (el.isComponentParent) {
                      const childElements = el.children || [];
                      return (
                        <div
                          key={el.id}
                          className="flex flex-col rounded-lg border overflow-hidden transition-all shadow-2xs"
                          style={{
                            backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-app)',
                            borderColor: isSelected ? 'var(--primary-accent)' : 'var(--border-color)',
                          }}
                        >
                          {/* Cabecera del Componente Padre (Marco Rígido) */}
                          <div
                            onClick={(e) => handleSelectElement(el.id, e.shiftKey || e.ctrlKey || e.metaKey)}
                            className="flex items-center justify-between p-2 cursor-pointer border-b"
                            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Box size={13} className="shrink-0 text-amber-500" />
                              <span className="truncate text-[11px] font-extrabold text-amber-500">
                                {el.componentName || 'Componente'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <div className="flex items-center rounded-md border p-0.5" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveLayerUp(idx);
                                  }}
                                  disabled={idx === 0}
                                  className="p-0.5 rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                                  title="Subir posición de la capa"
                                >
                                  <ChevronUp size={11} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveLayerDown(idx);
                                  }}
                                  disabled={idx === elements.length - 1}
                                  className="p-0.5 rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                                  title="Bajar posición de la capa"
                                >
                                  <ChevronDown size={11} />
                                </button>
                              </div>

                              <div className="flex items-center rounded-md border p-0.5 gap-0.5" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleElementVisibility(el.id);
                                  }}
                                  className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                                  title="Mostrar/Ocultar Componente"
                                >
                                  {el.visible === false ? <EyeOff size={11} /> : <Eye size={11} />}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicateElement(el.id);
                                  }}
                                  className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-blue-500 cursor-pointer"
                                  title="Duplicar Componente"
                                >
                                  <Copy size={11} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Lista de Elementos Hijos (Imagenes, Video, Texto, etc.) seleccionables y editables */}
                          <div className="p-1.5 space-y-1 bg-black/5 dark:bg-white/5">
                            {childElements.map((childEl: CanvasElement, childIdx: number) => {
                              const isChildSelected = selectedElementId === childEl.id;
                              return (
                                <div
                                  key={childEl.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectElement(childEl.id, e.shiftKey || e.ctrlKey || e.metaKey);
                                  }}
                                  className={`flex items-center justify-between p-1.5 rounded-md border text-[11px] cursor-pointer transition-all ${
                                    isChildSelected ? 'shadow-xs border-amber-500 bg-amber-500/15 text-amber-600 font-bold' : 'hover:bg-black/5 dark:hover:bg-white/5 border-transparent opacity-90'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {childEl.type === 'image' && <ImageIcon size={12} className="shrink-0 text-blue-500" />}
                                    {childEl.type === 'video' && <Video size={12} className="shrink-0 text-purple-500" />}
                                    {childEl.type === 'text' && <Type size={12} className="shrink-0 text-emerald-500" />}
                                    {childEl.type === 'shape' && <Square size={12} className="shrink-0 text-amber-500" />}

                                    <span className="truncate text-[10.5px]">
                                      {childEl.content ? childEl.content.substring(0, 20) : `Elemento ${childEl.type}`}
                                    </span>
                                  </div>

                                  {/* Controles del Elemento Hijo dentro del Componente */}
                                  <div className="flex items-center gap-0.5 shrink-0 ml-1">
                                    {/* Flechas Subir / Bajar dentro del Componente */}
                                    <div className="flex items-center rounded-md border p-0.5" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMoveComponentChildUp(el.id, childEl.id);
                                        }}
                                        disabled={childIdx === 0}
                                        className="p-0.5 rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                                        title="Subir posición dentro del componente"
                                      >
                                        <ChevronUp size={10} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMoveComponentChildDown(el.id, childEl.id);
                                        }}
                                        disabled={childIdx === childElements.length - 1}
                                        className="p-0.5 rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                                        title="Bajar posición dentro del componente"
                                      >
                                        <ChevronDown size={10} />
                                      </button>
                                    </div>

                                    {/* Ojo & Candado */}
                                    <div className="flex items-center rounded-md border p-0.5 gap-0.5" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleComponentChildVisibility(el.id, childEl.id);
                                        }}
                                        className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                                        title="Mostrar/Ocultar elemento"
                                      >
                                        {childEl.visible === false ? <EyeOff size={10} /> : <Eye size={10} />}
                                      </button>
                                    </div>

                                    {/* Duplicar & Eliminar Elemento Hijo */}
                                    <div className="flex items-center rounded-md border p-0.5 gap-0.5" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDuplicateElement(childEl.id);
                                        }}
                                        className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-blue-500 cursor-pointer"
                                        title="Duplicar elemento del componente"
                                      >
                                        <Copy size={10} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteElement(childEl.id);
                                        }}
                                        className="p-0.5 rounded text-red-500 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                                        title="Eliminar elemento del componente"
                                      >
                                        <Trash2 size={10} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    // Renderizado de Elemento Independiente (Sin Grupo)
                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleSelectElement(el.id, e.shiftKey || e.ctrlKey || e.metaKey)}
                        className={`flex items-center justify-between p-1.5 rounded-md border text-[11px] cursor-pointer transition-all ${
                          isSelected ? 'shadow-xs' : 'hover:opacity-90'
                        }`}
                        style={{
                          backgroundColor: isSelected ? 'var(--primary-accent-light)' : 'var(--bg-app)',
                          borderColor: isSelected ? 'var(--primary-accent)' : 'var(--border-color)',
                          color: isSelected ? 'var(--primary-accent)' : 'var(--text-main)',
                        }}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {el.type === 'text' && <Type size={13} className="shrink-0" style={{ color: 'var(--primary-accent)' }} />}
                          {el.type === 'image' && <ImageIcon size={13} className="shrink-0 text-blue-500" />}
                          {el.type === 'video' && <Video size={13} className="shrink-0 text-purple-500" />}
                          {el.type === 'shape' && <Square size={13} className="shrink-0 text-emerald-500" />}
                          {el.type === '3d' && <Box size={13} className="shrink-0 text-amber-500" />}
                          {el.type === 'audio' && <Music size={13} className="shrink-0 text-rose-500" />}
                          {el.type === 'button' && <Smartphone size={13} className="shrink-0" style={{ color: 'var(--success)' }} />}

                          <span className={`truncate text-[11px] ${isSelected ? 'font-black' : 'font-medium'}`}>
                            {el.componentName || el.content || (el.type === 'image' ? 'Imagen' : el.type)}
                          </span>
                        </div>

                        {/* Controles de Capa Suelta */}
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          <div className="flex items-center rounded-md border p-0.5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveLayerUp(idx);
                              }}
                              disabled={idx === 0}
                              className="p-0.5 rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                              style={{ color: 'var(--text-main)' }}
                            >
                              <ChevronUp size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveLayerDown(idx);
                              }}
                              disabled={idx === elements.length - 1}
                              className="p-0.5 rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                              style={{ color: 'var(--text-main)' }}
                            >
                              <ChevronDown size={11} />
                            </button>
                          </div>

                          <div className="flex items-center rounded-md border p-0.5 gap-0.5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleElementVisibility(el.id);
                              }}
                              className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                              style={{ color: el.visible === false ? 'var(--text-muted)' : 'var(--text-main)' }}
                            >
                              {el.visible === false ? <EyeOff size={11} /> : <Eye size={11} />}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (selectedElementIds.length >= 2) {
                                  handleGroupSelected();
                                } else {
                                  handleSelectElement(el.id, true);
                                }
                              }}
                              className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                              style={{
                                color: selectedElementIds.length >= 2 ? 'var(--primary-accent)' : 'var(--text-muted)',
                              }}
                              title={
                                selectedElementIds.length >= 2
                                  ? `Agrupar ${selectedElementIds.length} capas seleccionadas`
                                  : 'Selecciona más capas para agrupar con la cadena'
                              }
                            >
                              <Unlink size={11} className="opacity-60 shrink-0" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleElementLock(el.id);
                              }}
                              className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                              style={{ color: el.locked ? 'var(--warning)' : 'var(--text-muted)' }}
                            >
                              {el.locked ? <Lock size={11} /> : <Unlock size={11} />}
                            </button>
                          </div>

                          <div className="flex items-center rounded-md border p-0.5 gap-0.5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateElement(el.id);
                              }}
                              className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-blue-500 cursor-pointer"
                              title="Duplicar elemento"
                            >
                              <Copy size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteElement(el.id);
                              }}
                              className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                              style={{ color: 'var(--danger)' }}
                              title="Eliminar elemento"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>
          </div>

          {/* Resizer */}
          <div
            onPointerDown={(e) => {
              e.preventDefault();
              setIsResizingScenes(true);
            }}
            className="h-1.5 w-full cursor-row-resize shrink-0 transition-colors hover:bg-amber-500/50 touch-none"
            style={{ backgroundColor: 'var(--border-color)' }}
          />

          {/* 3. SECCIÓN ESCENAS */}
          <div
            className="flex flex-col shrink-0"
            style={{ height: scenesPanelHeight }}
          >
            <div
              className="flex items-center justify-between p-3 border-b shrink-0"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="flex items-center gap-2">
                <Layout size={15} style={{ color: 'var(--primary-accent)' }} />
                <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                  Escenas
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {scenes.filter((s) => !s.isEnvelope).length}
                </span>
                <button
                  onClick={handleAddScene}
                  className="p-1 rounded-md transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                  style={{ color: 'var(--primary-accent)' }}
                  title="Añadir Escena"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col">
              <div className="space-y-2">
                {scenes.map((scene, idx) => {
                  if (scene.isEnvelope) return null;

                  const isActive = activeSceneId === scene.id;
                  const isEditing = editingSceneId === scene.id;
                  
                  return (
                    <div
                      key={scene.id}
                      onClick={() => handleSwitchScene(scene.id)}
                      className="flex flex-col p-2 rounded-lg border transition-all hover:shadow-xs cursor-pointer"
                      style={{
                        backgroundColor: isActive ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-card)',
                        borderColor: isActive ? 'var(--primary-accent)' : 'var(--border-color)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingSceneName}
                            onChange={(e) => setEditingSceneName(e.target.value)}
                            onBlur={() => handleRenameScene(scene.id, editingSceneName)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameScene(scene.id, editingSceneName);
                              if (e.key === 'Escape') setEditingSceneId(null);
                            }}
                            autoFocus
                            className="flex-1 text-xs font-bold bg-transparent outline-none border-b mr-2"
                            style={{ borderColor: 'var(--primary-accent)', color: 'var(--text-main)' }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              setEditingSceneId(scene.id);
                              setEditingSceneName(scene.name);
                            }}
                            className="text-xs font-bold truncate flex-1"
                            style={{ color: isActive ? 'var(--primary-accent)' : 'var(--text-main)' }}
                            title="Doble clic para renombrar"
                          >
                            {scene.name}
                          </span>
                        )}

                        <div className="flex items-center gap-0.5 shrink-0 ml-2 border rounded-md p-0.5" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSceneUp(idx);
                            }}
                            disabled={idx === 0 || (idx === 1 && scenes[0].isEnvelope)}
                            className="p-0.5 rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-20"
                            style={{ color: 'var(--text-main)' }}
                            title="Subir"
                          >
                            <ChevronUp size={11} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSceneDown(idx);
                            }}
                            disabled={idx === scenes.length - 1}
                            className="p-0.5 rounded transition-colors hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-20"
                            style={{ color: 'var(--text-main)' }}
                            title="Bajar"
                          >
                            <ChevronDown size={11} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteScene(scene.id);
                            }}
                            className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 ml-0.5"
                            style={{ color: 'var(--danger)' }}
                            title="Eliminar Escena"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>
          </div>
          {/* 4. SECCIÓN SOBRE (Elemento Fijo) */}
          <div
            className="flex flex-col shrink-0 border-t"
            style={{
              backgroundColor: 'var(--bg-sidebar)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div
              className="flex items-center justify-between p-3 border-b shrink-0"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="flex items-center gap-2">
                <Mail size={15} style={{ color: 'var(--primary-accent)' }} />
                <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                  Sobre
                </h3>
              </div>
            </div>

            <div className="p-3">
              {(() => {
                const envelopeScene = scenes.find(s => s.isEnvelope);
                if (!envelopeScene) return null;
                const isActive = activeSceneId === envelopeScene.id;

                return (
                  <div
                    key={envelopeScene.id}
                    onClick={() => handleSwitchScene(envelopeScene.id)}
                    className="flex flex-col p-2 rounded-lg border transition-all hover:shadow-xs cursor-pointer"
                    style={{
                      backgroundColor: isActive ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-card)',
                      borderColor: isActive ? 'var(--primary-accent)' : 'var(--border-color)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-bold truncate flex-1"
                        style={{ color: isActive ? 'var(--primary-accent)' : 'var(--text-main)' }}
                      >
                        {envelopeScene.name}
                      </span>
                      
                      <div className="flex bg-black/10 dark:bg-white/5 rounded-md border border-black/10 dark:border-white/10 p-0.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            const newScenes = [...scenes];
                            const envIdx = newScenes.findIndex(s => s.isEnvelope);
                            newScenes[envIdx] = {
                              ...newScenes[envIdx],
                              envelopeSettings: { ...newScenes[envIdx].envelopeSettings, orientation: 'vertical' }
                            };
                            setScenes(newScenes);
                          }}
                          className="px-2 py-0.5 text-[9px] font-bold rounded-sm transition-all"
                          style={{
                            backgroundColor: (!envelopeScene.envelopeSettings?.orientation || envelopeScene.envelopeSettings.orientation === 'vertical') 
                              ? 'var(--primary-accent)' 
                              : 'transparent',
                            color: (!envelopeScene.envelopeSettings?.orientation || envelopeScene.envelopeSettings.orientation === 'vertical') 
                              ? '#ffffff' 
                              : 'var(--text-muted)',
                            boxShadow: (!envelopeScene.envelopeSettings?.orientation || envelopeScene.envelopeSettings.orientation === 'vertical') 
                              ? '0 1px 2px rgba(0,0,0,0.1)' 
                              : 'none',
                          }}
                        >
                          VERT
                        </button>
                        <button
                          onClick={() => {
                            const newScenes = [...scenes];
                            const envIdx = newScenes.findIndex(s => s.isEnvelope);
                            newScenes[envIdx] = {
                              ...newScenes[envIdx],
                              envelopeSettings: { ...newScenes[envIdx].envelopeSettings, orientation: 'horizontal' }
                            };
                            setScenes(newScenes);
                          }}
                          className="px-2 py-0.5 text-[9px] font-bold rounded-sm transition-all"
                          style={{
                            backgroundColor: (envelopeScene.envelopeSettings?.orientation === 'horizontal') 
                              ? 'var(--primary-accent)' 
                              : 'transparent',
                            color: (envelopeScene.envelopeSettings?.orientation === 'horizontal') 
                              ? '#ffffff' 
                              : 'var(--text-muted)',
                            boxShadow: (envelopeScene.envelopeSettings?.orientation === 'horizontal') 
                              ? '0 1px 2px rgba(0,0,0,0.1)' 
                              : 'none',
                          }}
                        >
                          HORIZ
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
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
              className="transition-transform duration-150 relative shrink-0 origin-center"
              style={{
                width: '1080px',
                height: '1920px',
                transform: `scale(${zoom / 100})`,
              }}
            >
              {/* Canvas Stage 1080px x 1920px (Lienzo Pro con soporte para elementos fuera del lienzo con opacidad) */}
              <div
                ref={stageCanvasRef}
                data-stage-canvas="true"
                className="w-[1080px] h-[1920px] relative overflow-visible shadow-2xl border"
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
                {/* Siempre renderizamos la máscara y los elementos */}
                <>
                  {/* Mascara de atenuación/opacidad para elementos fuera de los bordes (1080x1920) */}
                  <div
                    className="absolute inset-0 pointer-events-none z-[80] border-2 border-pink-500/50"
                    style={{
                      boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.72)',
                    }}
                  />

              {/* Canvas Elements */}
              {elements.map((el, index) => {
                if (el.visible === false) return null;

                // Soporte para Componente Padre con Elementos Hijos anidados
                if (el.isComponentParent && el.children) {
                  const isParentSelected = selectedElementId === el.id;
                  const isAnyChildSelected = el.children.some((child) => child.id === selectedElementId);
                  const isComponentActive = isParentSelected || isAnyChildSelected;
                  const componentZIndex = elements.length - index;

                  return (
                    <div
                      key={el.id}
                      onPointerDown={(e) => handlePointerDown(e, el.id, 'move')}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElementId(el.id);
                      }}
                      className={`absolute select-none pointer-events-auto transition-all ${
                        el.locked ? 'cursor-not-allowed opacity-80' : 'cursor-move'
                      } ${
                        isParentSelected
                          ? 'ring-4 ring-amber-400 border-2 border-amber-500 bg-amber-400/20 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                          : isAnyChildSelected
                          ? 'ring-2 ring-amber-400/80 border-2 border-dashed border-amber-400 bg-amber-400/10 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                          : ''
                      }`}
                      style={{
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        width: `${el.width}px`,
                        height: `${el.height}px`,
                        transform: [
                          el.rotation ? `rotate(${el.rotation}deg)` : '',
                          el.flipH ? 'scaleX(-1)' : '',
                          el.flipV ? 'scaleY(-1)' : '',
                        ].filter(Boolean).join(' ') || undefined,
                        backgroundColor: el.backdropBlurEnabled
                          ? (el.backdropColor || el.backgroundColor) && (el.backdropColor || el.backgroundColor) !== 'transparent'
                              ? `color-mix(in srgb, ${el.backdropColor || el.backgroundColor} ${el.backdropOpacity ?? 30}%, transparent)`
                              : `rgba(255, 255, 255, ${(el.backdropOpacity ?? 30) / 100})`
                          : (isComponentActive
                              ? (el.backgroundColor || 'rgba(245, 158, 11, 0.12)')
                              : el.backgroundColor),
                        backdropFilter: el.backdropBlurEnabled ? `blur(${el.backdropBlurAmount ?? 10}px)` : undefined,
                        WebkitBackdropFilter: el.backdropBlurEnabled ? `blur(${el.backdropBlurAmount ?? 10}px)` : undefined,
                        borderRadius: (el.containerBorderRadius ?? el.borderRadius) ? `${el.containerBorderRadius ?? el.borderRadius}px` : undefined,
                        borderWidth: (el.containerBorderWidth ?? el.borderWidth) ? `${el.containerBorderWidth ?? el.borderWidth}px` : undefined,
                        borderColor: (el.containerBorderWidth ?? el.borderWidth) ? (el.containerBorderColor || el.borderColor || 'transparent') : undefined,
                        borderStyle: (el.containerBorderWidth ?? el.borderWidth) ? (el.containerBorderStyle || el.borderStyle || 'solid') : undefined,
                        overflow: el.clipContent ? 'hidden' : 'visible',
                        zIndex: componentZIndex,
                      }}
                    >
                      {/* Renderizado de los Elementos Hijos anidados (Modificables) */}
                      {el.children.map((childEl, childIdx) => {
                        const isChildSelected = selectedElementId === childEl.id;
                        const childZIndex = el.children!.length - childIdx;

                        return (
                          <div
                            key={childEl.id}
                            onPointerDown={(e) => handlePointerDown(e, childEl.id, 'move')}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedElementId(childEl.id);
                            }}
                            className={`absolute transition-shadow select-none cursor-move ${
                              isChildSelected ? 'outline-4 outline-dashed outline-pink-500' : ''
                            }`}
                            style={{
                              left: `${childEl.x}px`,
                              top: `${childEl.y}px`,
                              width: `${childEl.width}px`,
                              height: `${childEl.height}px`,
                              zIndex: childZIndex,
                              transform: [
                                childEl.rotation ? `rotate(${childEl.rotation}deg)` : '',
                                childEl.flipH ? 'scaleX(-1)' : '',
                                childEl.flipV ? 'scaleY(-1)' : '',
                              ].filter(Boolean).join(' ') || undefined,
                              opacity: childEl.opacity !== undefined ? childEl.opacity / 100 : 1,
                              background: childEl.backgroundColor && childEl.backgroundColor.includes('gradient') ? childEl.backgroundColor : undefined,
                              backgroundColor: childEl.backgroundColor && !childEl.backgroundColor.includes('gradient') ? childEl.backgroundColor : 'transparent',
                              borderRadius: childEl.borderRadius ? `${childEl.borderRadius}px` : undefined,
                              borderWidth: childEl.borderWidth ? `${childEl.borderWidth}px` : undefined,
                              borderColor: childEl.borderColor || undefined,
                              borderStyle: childEl.borderStyle || 'solid',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: childEl.textAlign === 'center' ? 'center' : childEl.textAlign === 'right' ? 'flex-end' : 'flex-start',
                            }}
                          >
                            {childEl.type === 'text' ? (
                              <TextElementItem element={childEl} />
                            ) : childEl.type === 'image' ? (
                              <ImageElementItem element={childEl} />
                            ) : childEl.type === 'video' ? (
                              <VideoElementItem element={childEl} />
                            ) : childEl.type === 'button' ? (
                              <ButtonElementItem element={childEl} />
                            ) : childEl.type === 'shape' ? (
                              <ShapeElementItem element={childEl} />
                            ) : (
                              childEl.content
                            )}

                            {/* Handles de transformación para el Elemento Hijo DENTRO del Componente Padre */}
                            {isChildSelected && (() => {
                              const rot = (childEl.rotation || 0) % 360;
                              return (
                                <>
                                  <div
                                    onPointerDown={(e) => handlePointerDown(e, childEl.id, 'rotate')}
                                    className="absolute -top-10 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-pink-500 border-2 border-white text-white flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing z-40"
                                    title="Girar elemento dentro del componente"
                                  >
                                    <RotateCw size={13} />
                                  </div>

                                  <div
                                    onPointerDown={(e) => handlePointerDown(e, childEl.id, 'resize', 'se')}
                                    className="absolute -bottom-2 -right-2 h-4 w-4 bg-pink-500 border-2 border-white rounded-full cursor-nwse-resize z-40"
                                  />
                                </>
                              );
                            })()}
                          </div>
                        );
                      })}

                      {/* Handles de transformación para el Componente Padre completo */}
                      {isParentSelected && (() => {
                        const getRotatedCursor = (dir: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w') => {
                          const cursors = ['ns-resize', 'nesw-resize', 'ew-resize', 'nwse-resize'];
                          const baseAngles: Record<string, number> = { n: 0, ne: 45, e: 90, se: 135, s: 180, sw: 225, w: 270, nw: 315 };
                          const currentAngle = ((el.rotation || 0) + (baseAngles[dir] || 0)) % 360;
                          const normalized = (currentAngle + 360) % 360;
                          const index = Math.floor((normalized + 22.5) / 45) % 8;
                          return cursors[index % 4];
                        };

                        return (
                          <>
                            {/* Tirador de Rotación */}
                            <div
                              onPointerDown={(e) => handlePointerDown(e, el.id, 'rotate')}
                              className="absolute -top-12 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-amber-500 border-2 border-white text-white flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing hover:scale-110 z-40"
                              title="Girar componente"
                            >
                              <RotateCw size={16} />
                            </div>
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[2px] h-4 bg-amber-500 z-30" />

                            {/* 8 Tiradores de Escala */}
                            <div
                              onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 'nw')}
                              className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-white border-3 border-amber-500 shadow-md hover:scale-125 z-40"
                              style={{ cursor: getRotatedCursor('nw') }}
                            />
                            <div
                              onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 'n')}
                              className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-white border-3 border-amber-500 shadow-md hover:scale-125 z-40"
                              style={{ cursor: getRotatedCursor('n') }}
                            />
                            <div
                              onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 'ne')}
                              className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-white border-3 border-amber-500 shadow-md hover:scale-125 z-40"
                              style={{ cursor: getRotatedCursor('ne') }}
                            />
                            <div
                              onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 'e')}
                              className="absolute top-1/2 -right-3 -translate-y-1/2 h-6 w-6 rounded-full bg-white border-3 border-amber-500 shadow-md hover:scale-125 z-40"
                              style={{ cursor: getRotatedCursor('e') }}
                            />
                            <div
                              onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 'se')}
                              className="absolute -bottom-3 -right-3 h-6 w-6 rounded-full bg-white border-3 border-amber-500 shadow-md hover:scale-125 z-40"
                              style={{ cursor: getRotatedCursor('se') }}
                            />
                            <div
                              onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 's')}
                              className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-white border-3 border-amber-500 shadow-md hover:scale-125 z-40"
                              style={{ cursor: getRotatedCursor('s') }}
                            />
                            <div
                              onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 'sw')}
                              className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-white border-3 border-amber-500 shadow-md hover:scale-125 z-40"
                              style={{ cursor: getRotatedCursor('sw') }}
                            />
                            <div
                              onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 'w')}
                              className="absolute top-1/2 -left-3 -translate-y-1/2 h-6 w-6 rounded-full bg-white border-3 border-amber-500 shadow-md hover:scale-125 z-40"
                              style={{ cursor: getRotatedCursor('w') }}
                            />
                          </>
                        );
                      })()}
                    </div>
                  );
                }

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
                      outlineOffset: isSelected ? '-4px' : undefined,
                      zIndex: activeScene?.isEnvelope && el.type === 'text' 
                                ? (elements.length - index) + 100 
                                : elements.length - index,
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
                      backgroundColor: el.backdropBlurEnabled
                        ? (el.backdropColor || el.backgroundColor) && (el.backdropColor || el.backgroundColor) !== 'transparent'
                            ? `color-mix(in srgb, ${el.backdropColor || el.backgroundColor} ${el.backdropOpacity ?? 30}%, transparent)`
                            : `rgba(255, 255, 255, ${(el.backdropOpacity ?? 30) / 100})`
                        : (el.backgroundColor && !el.backgroundColor.includes('gradient') ? el.backgroundColor : 'transparent'),
                      // Borde del contenedor
                      borderRadius: (el.containerBorderRadius ?? el.borderRadius) ? `${el.containerBorderRadius ?? el.borderRadius}px` : undefined,
                      borderWidth: (el.containerBorderWidth ?? el.borderWidth) ? `${el.containerBorderWidth ?? el.borderWidth}px` : undefined,
                      borderColor: (el.containerBorderWidth ?? el.borderWidth) ? (el.containerBorderColor || el.borderColor || 'transparent') : undefined,
                      borderStyle: (el.containerBorderWidth ?? el.borderWidth) ? (el.containerBorderStyle || el.borderStyle || 'solid') : undefined,
                      // Sombra del contenedor
                      boxShadow: (el.type !== 'text' && (el.containerShadowBlur || el.containerShadowOffsetX || el.containerShadowOffsetY || el.shadowBlur || el.shadowOffsetX || el.shadowOffsetY)) || (el.type === 'text' && (el.containerShadowBlur || el.containerShadowOffsetX || el.containerShadowOffsetY))
                        ? `${el.containerShadowOffsetX ?? (el.type !== 'text' ? el.shadowOffsetX : 0) ?? 0}px ${el.containerShadowOffsetY ?? (el.type !== 'text' ? el.shadowOffsetY : 0) ?? 0}px ${el.containerShadowBlur ?? (el.type !== 'text' ? el.shadowBlur : 0) ?? 0}px ${el.containerShadowColor || (el.type !== 'text' ? el.shadowColor : undefined) || 'rgba(0,0,0,0.5)'}`
                        : undefined,
                      backdropFilter: el.backdropBlurEnabled ? `blur(${el.backdropBlurAmount ?? 10}px)` : undefined,
                      WebkitBackdropFilter: el.backdropBlurEnabled ? `blur(${el.backdropBlurAmount ?? 10}px)` : undefined,
                      overflow: el.clipContent ? 'hidden' : undefined,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {el.type === 'text' ? (
                      <TextElementItem element={el} />
                    ) : el.type === 'image' ? (
                      <ImageElementItem element={el} />
                    ) : el.type === 'video' ? (
                      <VideoElementItem element={el} />
                    ) : el.type === 'button' ? (
                      <ButtonElementItem element={el} />
                    ) : el.type === 'audio' ? (
                      <AudioElementItem element={el} />
                    ) : el.type === '3d' ? (
                      <div className="flex flex-col items-center justify-center w-full h-full bg-amber-950/20 border-2 border-amber-500/40 rounded-2xl text-amber-400 gap-2 text-2xl font-extrabold shadow-inner">
                        <Box size={48} className="animate-bounce" /> {el.content}
                      </div>
                    ) : el.type === 'shape' ? (
                      <ShapeElementItem element={el} />
                    ) : (
                      el.content
                    )}

                    {/* Transform Handles (Transformar, Escalar, Rotar) */}
                    {isSelected && !el.locked && !el.lockTransform && (() => {
                      const rot = (el.rotation || 0) % 360;
                      const getRotatedCursor = (handle: string) => {
                        const baseAngles: Record<string, number> = {
                          n: 0,
                          ne: 45,
                          e: 90,
                          se: 135,
                          s: 180,
                          sw: 225,
                          w: 270,
                          nw: 315,
                        };
                        const baseAngle = baseAngles[handle] ?? 0;
                        const totalAngle = (baseAngle + rot + 360) % 360;
                        if (totalAngle >= 337.5 || totalAngle < 22.5) return 'ns-resize';
                        if (totalAngle >= 22.5 && totalAngle < 67.5) return 'nesw-resize';
                        if (totalAngle >= 67.5 && totalAngle < 112.5) return 'ew-resize';
                        if (totalAngle >= 112.5 && totalAngle < 157.5) return 'nwse-resize';
                        if (totalAngle >= 157.5 && totalAngle < 202.5) return 'ns-resize';
                        if (totalAngle >= 202.5 && totalAngle < 247.5) return 'nesw-resize';
                        if (totalAngle >= 247.5 && totalAngle < 292.5) return 'ew-resize';
                        return 'nwse-resize';
                      };

                      return (
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
                            className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-white border-3 border-pink-500 shadow-md hover:scale-125 z-40"
                            style={{ cursor: getRotatedCursor('nw') }}
                          />
                          {/* Norte N */}
                          <div
                            onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 'n')}
                            className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-white border-3 border-pink-500 shadow-md hover:scale-125 z-40"
                            style={{ cursor: getRotatedCursor('n') }}
                          />
                          {/* Noreste NE */}
                          <div
                            onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 'ne')}
                            className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-white border-3 border-pink-500 shadow-md hover:scale-125 z-40"
                            style={{ cursor: getRotatedCursor('ne') }}
                          />
                          {/* Este E */}
                          <div
                            onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 'e')}
                            className="absolute top-1/2 -right-3 -translate-y-1/2 h-6 w-6 rounded-full bg-white border-3 border-pink-500 shadow-md hover:scale-125 z-40"
                            style={{ cursor: getRotatedCursor('e') }}
                          />
                          {/* Sureste SE */}
                          <div
                            onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 'se')}
                            className="absolute -bottom-3 -right-3 h-6 w-6 rounded-full bg-white border-3 border-pink-500 shadow-md hover:scale-125 z-40"
                            style={{ cursor: getRotatedCursor('se') }}
                          />
                          {/* Sur S */}
                          <div
                            onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 's')}
                            className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-white border-3 border-pink-500 shadow-md hover:scale-125 z-40"
                            style={{ cursor: getRotatedCursor('s') }}
                          />
                          {/* Suroeste SW */}
                          <div
                            onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 'sw')}
                            className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-white border-3 border-pink-500 shadow-md hover:scale-125 z-40"
                            style={{ cursor: getRotatedCursor('sw') }}
                          />
                          {/* Oeste W */}
                          <div
                            onPointerDown={(e) => handlePointerDown(e, el.id, 'resize', 'w')}
                            className="absolute top-1/2 -left-3 -translate-y-1/2 h-6 w-6 rounded-full bg-white border-3 border-pink-500 shadow-md hover:scale-125 z-40"
                            style={{ cursor: getRotatedCursor('w') }}
                          />
                        </>
                      );
                    })()}
                  </div>
                );
              })}
                </>
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
          {selectedElement && (
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
          )}

          {/* Body del Inspector */}
          <div className="flex-1 overflow-y-auto">
            {!selectedElement ? (
              <div className="flex flex-col pb-6">
                <div className="p-3 m-3 rounded-xl border flex items-center gap-2" style={{ backgroundColor: 'var(--primary-accent-light)', borderColor: 'var(--primary-accent)' }}>
                  <Layout size={18} style={{ color: 'var(--primary-accent)' }} />
                  <div>
                    <p className="font-extrabold leading-tight" style={{ color: 'var(--primary-accent)' }}>Configuración de Escena</p>
                    <p className="text-[10px] leading-tight mt-0.5" style={{ color: 'var(--text-main)' }}>Ajusta el comportamiento de la escena actual.</p>
                  </div>
                </div>

                <div className="space-y-4 px-4 mt-2">
                  {/* Transición */}
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Transición hacia la siguiente escena</label>
                    <AppSelect
                      value={activeScene?.transition || 'none'}
                      onChange={(val) => updateActiveScene('transition', val)}
                      options={[
                        { value: 'none', label: 'Ninguna' },
                        { value: 'fade', label: 'Desvanecer (Fade)' },
                        { value: 'slideLeft', label: 'Deslizar Izquierda' },
                        { value: 'slideRight', label: 'Deslizar Derecha' },
                        { value: 'slideUp', label: 'Deslizar Arriba' },
                        { value: 'slideDown', label: 'Deslizar Abajo' },
                        { value: 'zoomIn', label: 'Acercar (Zoom In)' },
                        { value: 'zoomOut', label: 'Alejar (Zoom Out)' },
                      ]}
                      buttonClassName="!py-1.5 !px-2.5 !text-xs"
                      itemClassName="!py-1.5 !text-xs"
                    />
                  </div>
                  
                  {/* Duración */}
                  {activeScene?.transition && activeScene.transition !== 'none' && (
                    <div>
                      <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Duración de transición (s)</label>
                      <InspectorNumberInput
                        value={activeScene?.transitionDuration || 0.5}
                        onChange={(val) => updateActiveScene('transitionDuration', val)}
                        step={0.1}
                        min={0.1}
                        max={5}
                        isFloat={true}
                      />
                    </div>
                  )}

                  {/* Separador */}
                  <div className="h-px w-full my-4" style={{ backgroundColor: 'var(--border-color)' }}></div>

                  {/* Auto-Advance */}
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-xs font-bold leading-tight" style={{ color: 'var(--text-muted)' }}>
                      Pasar automáticamente a la siguiente escena
                    </label>
                    <div
                      className="w-9 h-5 rounded-full p-1 cursor-pointer transition-colors relative flex shrink-0"
                      style={{ backgroundColor: activeScene?.autoAdvance ? 'var(--primary-accent)' : 'var(--border-color)' }}
                      onClick={() => updateActiveScene('autoAdvance', !activeScene?.autoAdvance)}
                    >
                      <div
                        className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200 ${activeScene?.autoAdvance ? 'translate-x-4' : 'translate-x-0'}`}
                      />
                    </div>
                  </div>

                  {/* Auto-Advance Delay */}
                  {activeScene?.autoAdvance && (
                    <div className="pt-2">
                      <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Tiempo de espera (s)</label>
                      <InspectorNumberInput
                        value={activeScene?.autoAdvanceDelay || 3}
                        onChange={(val) => updateActiveScene('autoAdvanceDelay', val)}
                        step={0.5}
                        min={0}
                        max={60}
                        isFloat={true}
                      />
                      <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                        Tiempo que la escena permanecerá visible antes de cambiar a la siguiente.
                      </p>
                    </div>
                  )}
                </div>
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
                  <div className="w-full flex items-center justify-between px-4 py-3 select-none">
                    <button
                      type="button"
                      onClick={() => toggleSection('content')}
                      className="flex-1 flex items-center justify-between font-extrabold uppercase text-[10px] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors pr-2"
                      style={{ color: openSections.content ? 'var(--primary-accent)' : 'var(--text-muted)' }}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>Contenido</span>
                        {!isSuperAdmin && selectedElement.lockedSections?.content && (
                          <Lock size={12} className="text-amber-500 shrink-0" title="Propiedad restringida por el diseñador" />
                        )}
                      </span>
                      {openSections.content ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {isSuperAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSectionLock('content');
                        }}
                        className={`p-1 rounded-md border transition-all cursor-pointer shrink-0 ${
                          selectedElement.lockedSections?.content
                            ? 'bg-amber-500/20 text-amber-500 border-amber-500/40 shadow-xs'
                            : 'hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 border-transparent'
                        }`}
                        title={
                          selectedElement.lockedSections?.content
                            ? 'Bloqueado para otros roles (Clic para permitir edición)'
                            : 'Permitido para otros roles (Clic para bloquear edición)'
                        }
                      >
                        {selectedElement.lockedSections?.content ? <Lock size={13} /> : <Unlock size={13} />}
                      </button>
                    )}
                  </div>

                  {openSections.content && (
                    <div
                      className={`px-4 pb-3 pt-0 border-t space-y-3 transition-opacity ${
                        !isSuperAdmin && selectedElement.lockedSections?.content
                          ? 'opacity-60 pointer-events-none select-none'
                          : ''
                      }`}
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      {selectedElement.type === 'image' ? (
                        <div className="pt-2">
                          <AssetPickerPopover
                            partnerId={event?.partner_id}
                            partnerName={
                              event?.partner?.business_name ||
                              event?.partner?.contact_name ||
                              event?.partner?.user?.name ||
                              'ConceptoDigital'
                            }
                            value={selectedElement.content}
                            onChange={handleImageContentChange}
                          />
                        </div>
                      ) : selectedElement.type === 'video' ? (
                        <div className="pt-2">
                          <AssetPickerPopover
                            partnerId={event?.partner_id}
                            partnerName={
                              event?.partner?.business_name ||
                              event?.partner?.contact_name ||
                              event?.partner?.user?.name ||
                              'ConceptoDigital'
                            }
                            type="video"
                            accept="video/*"
                            label="Video del Elemento"
                            value={selectedElement.content}
                            onChange={(val) => updateSelectedElement('content', val)}
                          />
                        </div>
                      ) : selectedElement.type === 'shape' ? (
                        <div className="pt-2 space-y-2">
                          <label className="block font-extrabold uppercase text-[9px] tracking-wider" style={{ color: 'var(--text-muted)' }}>
                            Patrón de Imagen / SVG
                          </label>
                          <AssetPickerPopover
                            partnerId={event?.partner_id}
                            partnerName={
                              event?.partner?.business_name ||
                              event?.partner?.contact_name ||
                              event?.partner?.user?.name ||
                              'ConceptoDigital'
                            }
                            type="image"
                            accept="image/*,.svg"
                            label="Seleccionar Patrón de Imagen / SVG"
                            value={selectedElement.patternUrl || ''}
                            onChange={(val) => {
                              updateSelectedElementBatch({
                                patternType: 'custom',
                                patternUrl: val,
                              });
                            }}
                          />

                          <div className="pt-1">
                            <div className="flex items-center justify-between mb-1">
                              <label className="block font-extrabold uppercase text-[9px] tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                Escala del Patrón (Tamaño)
                              </label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min={1}
                                  max={5000}
                                  value={selectedElement.patternScale || 24}
                                  onChange={(e) => updateSelectedElement('patternScale', Math.max(1, parseInt(e.target.value, 10) || 1))}
                                  className="w-16 h-6 text-right px-1 text-[11px] font-mono font-bold rounded border outline-none"
                                  style={{
                                    backgroundColor: 'var(--bg-card)',
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--primary-accent)',
                                  }}
                                />
                                <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--text-muted)' }}>px</span>
                              </div>
                            </div>
                            <input
                              type="range"
                              min={4}
                              max={2000}
                              step={2}
                              value={selectedElement.patternScale || 24}
                              onChange={(e) => updateSelectedElement('patternScale', parseInt(e.target.value, 10))}
                              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                              style={{ backgroundColor: 'var(--border-color)', accentColor: 'var(--primary-accent)' }}
                            />
                          </div>
                        </div>
                      ) : selectedElement.type === 'button' ? (
                        <div className="pt-2 space-y-3">
                          <div>
                            <label className="block font-extrabold uppercase text-[9px] tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                              Texto del Botón
                            </label>
                            <input
                              type="text"
                              value={selectedElement.content || ''}
                              onChange={(e) => updateSelectedElement('content', e.target.value)}
                              placeholder="Ej: Confirmar Asistencia"
                              className="w-full rounded-lg px-2.5 py-1.5 border outline-none font-medium text-xs"
                              style={{
                                backgroundColor: 'var(--bg-card)',
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-main)',
                              }}
                            />
                          </div>

                          <div>
                            <label className="block font-extrabold uppercase text-[9px] tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                              Ícono del Botón
                            </label>
                            <select
                              value={selectedElement.buttonIcon || 'none'}
                              onChange={(e) => updateSelectedElement('buttonIcon', e.target.value)}
                              className="w-full rounded-lg px-2.5 py-1.5 border outline-none font-medium text-xs"
                              style={{
                                backgroundColor: 'var(--bg-card)',
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-main)',
                              }}
                            >
                              <option value="none">Sin ícono</option>
                              <option value="map">Ubicación (Mapa)</option>
                              <option value="calendar">Calendario</option>
                              <option value="gift">Mesa de Regalos</option>
                              <option value="check">Check / Confirmar</option>
                              <option value="phone">Teléfono / WhatsApp</option>
                              <option value="heart">Corazón</option>
                              <option value="send">Enviar</option>
                              <option value="external">Enlace Externo</option>
                            </select>
                          </div>

                          {selectedElement.buttonIcon && selectedElement.buttonIcon !== 'none' && (
                            <div>
                              <label className="block font-extrabold uppercase text-[9px] tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                                Posición del Ícono
                              </label>
                              <div className="grid grid-cols-3 gap-1">
                                {[
                                  { id: 'left', label: 'Izquierda' },
                                  { id: 'right', label: 'Derecha' },
                                  { id: 'only', label: 'Solo Ícono' },
                                ].map((pos) => (
                                  <button
                                    key={pos.id}
                                    type="button"
                                    onClick={() => updateSelectedElement('buttonIconPosition', pos.id)}
                                    className="px-2 py-1 text-[10px] font-bold rounded border transition-colors"
                                    style={{
                                      backgroundColor: selectedElement.buttonIconPosition === pos.id ? 'var(--primary-accent)' : 'var(--bg-card)',
                                      color: selectedElement.buttonIconPosition === pos.id ? '#ffffff' : 'var(--text-main)',
                                      borderColor: 'var(--border-color)',
                                    }}
                                  >
                                    {pos.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block font-extrabold uppercase text-[9px] tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                              Enlace Destino (URL)
                            </label>
                            <input
                              type="text"
                              value={selectedElement.buttonUrl || ''}
                              onChange={(e) => updateSelectedElement('buttonUrl', e.target.value)}
                              placeholder="https://maps.google.com/..."
                              className="w-full rounded-lg px-2.5 py-1.5 border outline-none font-medium text-xs font-mono"
                              style={{
                                backgroundColor: 'var(--bg-card)',
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-main)',
                              }}
                            />
                          </div>

                          <div>
                            <label className="block font-extrabold uppercase text-[9px] tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                              Efecto de Animación
                            </label>
                            <select
                              value={selectedElement.buttonAnimation || 'none'}
                              onChange={(e) => updateSelectedElement('buttonAnimation', e.target.value)}
                              className="w-full rounded-lg px-2.5 py-1.5 border outline-none font-medium text-xs"
                              style={{
                                backgroundColor: 'var(--bg-card)',
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-main)',
                              }}
                            >
                              <option value="none">Sin animación</option>
                              <option value="pulse">Latido (Pulse)</option>
                              <option value="bounce">Rebote (Bounce)</option>
                              <option value="shimmer">Brillo (Shimmer)</option>
                            </select>
                          </div>
                        </div>
                      ) : selectedElement.type === 'audio' ? (
                        <div className="pt-2 space-y-3">
                          <AssetPickerPopover
                            partnerId={event?.partner_id}
                            partnerName={
                              event?.partner?.business_name ||
                              event?.partner?.contact_name ||
                              event?.partner?.user?.name ||
                              'ConceptoDigital'
                            }
                            type="audio"
                            accept="audio/*,.mp3,.wav,.ogg,.m4a"
                            label="Archivo de Audio (MP3/WAV)"
                            value={selectedElement.content}
                            onChange={(val) => updateSelectedElement('content', val)}
                          />

                          <div>
                            <label className="block font-extrabold uppercase text-[9px] tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                              Nombre de la Canción / Título
                            </label>
                            <input
                              type="text"
                              value={selectedElement.audioTitle || ''}
                              onChange={(e) => updateSelectedElement('audioTitle', e.target.value)}
                              placeholder="Ej: Canción Principal de los Novios"
                              className="w-full rounded-lg px-2.5 py-1.5 border outline-none font-medium text-xs"
                              style={{
                                backgroundColor: 'var(--bg-card)',
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-main)',
                              }}
                            />
                          </div>

                          <div className="space-y-2 pt-1">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                              <input
                                type="checkbox"
                                checked={selectedElement.audioAutoplay || false}
                                onChange={(e) => updateSelectedElement('audioAutoplay', e.target.checked)}
                                className="w-4 h-4 rounded"
                                style={{ accentColor: 'var(--primary-accent)' }}
                              />
                              Reproducir automáticamente (Autoplay)
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold" style={{ color: 'var(--text-main)' }}>
                              <input
                                type="checkbox"
                                checked={selectedElement.audioLoop !== false}
                                onChange={(e) => updateSelectedElement('audioLoop', e.target.checked)}
                                className="w-4 h-4 rounded"
                                style={{ accentColor: 'var(--primary-accent)' }}
                              />
                              Repetir en bucle (Loop)
                            </label>
                          </div>
                        </div>
                      ) : selectedElement.isComponentParent || selectedElement.type === 'component' ? (
                        <div className="pt-2 space-y-2">
                          <label className="block font-extrabold uppercase text-[9px] tracking-wider" style={{ color: 'var(--text-muted)' }}>
                            Nombre del Componente
                          </label>
                          <input
                            type="text"
                            value={selectedElement.componentName || selectedElement.content || 'Componente'}
                            onChange={(e) => {
                              const newName = e.target.value;
                              updateSelectedElementBatch({
                                componentName: newName,
                                content: newName,
                              });
                            }}
                            placeholder="Nombre del componente"
                            className="w-full rounded-lg px-2.5 py-1.5 border outline-none font-medium text-xs"
                            style={{
                              backgroundColor: 'var(--bg-card)',
                              borderColor: 'var(--border-color)',
                              color: 'var(--text-main)',
                            }}
                          />
                        </div>
                      ) : (
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
                      )}
                    </div>
                  )}
                </div>

                {/* 2. ACORDEÓN: POSICIÓN & TAMAÑO */}
                <div className="border-t" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                  <div className="w-full flex items-center justify-between px-4 py-3 select-none">
                    <button
                      type="button"
                      onClick={() => toggleSection('transform')}
                      className="flex-1 flex items-center justify-between font-extrabold uppercase text-[10px] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors pr-2"
                      style={{ color: openSections.transform ? 'var(--primary-accent)' : 'var(--text-muted)' }}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>Posición & Tamaño</span>
                        {!isSuperAdmin && selectedElement.lockedSections?.transform && (
                          <Lock size={12} className="text-amber-500 shrink-0" title="Propiedad restringida por el diseñador" />
                        )}
                      </span>
                      {openSections.transform ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {isSuperAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSectionLock('transform');
                        }}
                        className={`p-1 rounded-md border transition-all cursor-pointer shrink-0 ${
                          selectedElement.lockedSections?.transform
                            ? 'bg-amber-500/20 text-amber-500 border-amber-500/40 shadow-xs'
                            : 'hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 border-transparent'
                        }`}
                        title={
                          selectedElement.lockedSections?.transform
                            ? 'Bloqueado para otros roles (Clic para permitir edición)'
                            : 'Permitido para otros roles (Clic para bloquear edición)'
                        }
                      >
                        {selectedElement.lockedSections?.transform ? <Lock size={13} /> : <Unlock size={13} />}
                      </button>
                    )}
                  </div>

                  {openSections.transform && (() => {
                    const parentComp = selectedElement.parentComponentId
                      ? elements.find((el) => el.id === selectedElement.parentComponentId)
                      : undefined;
                    const parentWidth = parentComp ? parentComp.width : 1080;
                    const parentHeight = parentComp ? parentComp.height : 1920;

                    return (
                    <div
                      className={`px-4 pb-3 pt-2 border-t space-y-3 transition-opacity ${
                        !isSuperAdmin && selectedElement.lockedSections?.transform
                          ? 'opacity-60 pointer-events-none select-none'
                          : ''
                      }`}
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      {/* Botones de Alineación, Volteo & Aspect Ratio */}
                      <div className="flex items-center justify-between gap-0.5 p-0.5 rounded-lg border shadow-2xs" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                        {/* Grupo 1: Alineación Horizontal */}
                        <div className="flex items-center gap-0">
                          <button
                            onClick={() => {
                              const rad = ((selectedElement.rotation || 0) * Math.PI) / 180;
                              const cos = Math.abs(Math.cos(rad));
                              const sin = Math.abs(Math.sin(rad));
                              const bboxW = selectedElement.width * cos + selectedElement.height * sin;
                              const targetX = (bboxW - selectedElement.width) / 2;
                              updateSelectedElement('x', Math.round(targetX));
                            }}
                            className="p-1 rounded-md hover:opacity-80 transition-colors"
                            style={{ color: 'var(--text-main)' }}
                            title="Alinear a la izquierda del contenedor"
                          >
                            <AlignStartVertical size={13} />
                          </button>
                          <button
                            onClick={() => updateSelectedElement('x', Math.round((parentWidth - selectedElement.width) / 2))}
                            className="p-1 rounded-md hover:opacity-80 transition-colors"
                            style={{ color: 'var(--text-main)' }}
                            title="Alinear al centro horizontal del contenedor"
                          >
                            <AlignCenterVertical size={13} />
                          </button>
                          <button
                            onClick={() => {
                              const rad = ((selectedElement.rotation || 0) * Math.PI) / 180;
                              const cos = Math.abs(Math.cos(rad));
                              const sin = Math.abs(Math.sin(rad));
                              const bboxW = selectedElement.width * cos + selectedElement.height * sin;
                              const targetX = parentWidth - bboxW + (bboxW - selectedElement.width) / 2;
                              updateSelectedElement('x', Math.round(targetX));
                            }}
                            className="p-1 rounded-md hover:opacity-80 transition-colors"
                            style={{ color: 'var(--text-main)' }}
                            title="Alinear a la derecha del contenedor"
                          >
                            <AlignEndVertical size={13} />
                          </button>
                        </div>

                        <div className="h-3.5 w-px shrink-0 opacity-60" style={{ backgroundColor: 'var(--border-color)' }} />

                        {/* Grupo 2: Alineación Vertical */}
                        <div className="flex items-center gap-0">
                          <button
                            onClick={() => {
                              const rad = ((selectedElement.rotation || 0) * Math.PI) / 180;
                              const cos = Math.abs(Math.cos(rad));
                              const sin = Math.abs(Math.sin(rad));
                              const bboxH = selectedElement.width * sin + selectedElement.height * cos;
                              const targetY = (bboxH - selectedElement.height) / 2;
                              updateSelectedElement('y', Math.round(targetY));
                            }}
                            className="p-1 rounded-md hover:opacity-80 transition-colors"
                            style={{ color: 'var(--text-main)' }}
                            title="Alinear arriba del contenedor"
                          >
                            <AlignStartHorizontal size={13} />
                          </button>
                          <button
                            onClick={() => updateSelectedElement('y', Math.round((parentHeight - selectedElement.height) / 2))}
                            className="p-1 rounded-md hover:opacity-80 transition-colors"
                            style={{ color: 'var(--text-main)' }}
                            title="Alinear al centro vertical del contenedor"
                          >
                            <AlignCenterHorizontal size={13} />
                          </button>
                          <button
                            onClick={() => {
                              const rad = ((selectedElement.rotation || 0) * Math.PI) / 180;
                              const cos = Math.abs(Math.cos(rad));
                              const sin = Math.abs(Math.sin(rad));
                              const bboxH = selectedElement.width * sin + selectedElement.height * cos;
                              const targetY = parentHeight - bboxH + (bboxH - selectedElement.height) / 2;
                              updateSelectedElement('y', Math.round(targetY));
                            }}
                            className="p-1 rounded-md hover:opacity-80 transition-colors"
                            style={{ color: 'var(--text-main)' }}
                            title="Alinear abajo del contenedor"
                          >
                            <AlignEndHorizontal size={13} />
                          </button>
                        </div>

                        <div className="h-3.5 w-px shrink-0 opacity-60" style={{ backgroundColor: 'var(--border-color)' }} />

                        {/* Grupo 3: Volteo / Flip & Aspect Ratio */}
                        <div className="flex items-center gap-0">
                          <button
                            onClick={() => updateSelectedElement('flipH', !selectedElement.flipH)}
                            className="p-1 rounded-md transition-colors border"
                            style={{
                              backgroundColor: selectedElement.flipH ? 'var(--primary-accent-light)' : 'transparent',
                              borderColor: selectedElement.flipH ? 'var(--primary-accent)' : 'transparent',
                              color: selectedElement.flipH ? 'var(--primary-accent)' : 'var(--text-main)',
                            }}
                            title="Voltear horizontal (Flip H)"
                          >
                            <FlipHorizontal size={13} />
                          </button>
                          <button
                            onClick={() => updateSelectedElement('flipV', !selectedElement.flipV)}
                            className="p-1 rounded-md transition-colors border"
                            style={{
                              backgroundColor: selectedElement.flipV ? 'var(--primary-accent-light)' : 'transparent',
                              borderColor: selectedElement.flipV ? 'var(--primary-accent)' : 'transparent',
                              color: selectedElement.flipV ? 'var(--primary-accent)' : 'var(--text-main)',
                            }}
                            title="Voltear vertical (Flip V)"
                          >
                            <FlipVertical size={13} />
                          </button>

                          <div className="h-3.5 w-px mx-0.5 shrink-0 opacity-60" style={{ backgroundColor: 'var(--border-color)' }} />

                          <button
                            onClick={() => updateSelectedElement('keepAspectRatio', !selectedElement.keepAspectRatio)}
                            className="p-1 rounded-md transition-colors border"
                            style={{
                              backgroundColor: selectedElement.keepAspectRatio ? 'var(--primary-accent-light)' : 'transparent',
                              borderColor: selectedElement.keepAspectRatio ? 'var(--primary-accent)' : 'transparent',
                              color: selectedElement.keepAspectRatio ? 'var(--primary-accent)' : 'var(--text-main)',
                            }}
                            title={selectedElement.keepAspectRatio ? "Aspect Ratio Bloqueado (Proporcional)" : "Aspect Ratio Libre"}
                          >
                            <Ratio size={13} />
                          </button>

                          <button
                            onClick={() => {
                              updateSelectedElementBatch({
                                x: 0,
                                y: 0,
                                width: parentWidth,
                                height: parentHeight,
                              });
                            }}
                            className="p-1 rounded-md transition-colors hover:bg-black/10 dark:hover:bg-white/10 border border-transparent"
                            style={{ color: 'var(--primary-accent)' }}
                            title={parentComp ? `Ajustar al componente padre (${parentWidth}x${parentHeight})` : `Ajustar al lienzo principal (${parentWidth}x${parentHeight})`}
                          >
                            <Maximize size={13} />
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
                            canvasDimension={1080}
                            onChange={(val) => updateSelectedElement('x', val)}
                          />
                        </div>
                        <div>
                          <label className="block font-extrabold mb-1 uppercase text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            Y
                          </label>
                          <InspectorNumberInput
                            value={selectedElement.y}
                            canvasDimension={1920}
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
                            canvasDimension={1080}
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
                            canvasDimension={1920}
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

                      {/* Profundidad 3D */}
                      <div className="font-mono pt-3 pb-1 border-t mt-3" style={{ borderColor: 'var(--border-color)' }}>
                        <div 
                          className="flex items-center justify-between mb-2 cursor-pointer group" 
                          onClick={() => updateSelectedElement('parallaxEnabled', !selectedElement.parallaxEnabled)}
                        >
                          <label className="font-extrabold uppercase text-[10px] cursor-pointer group-hover:opacity-80 transition-opacity" style={{ color: 'var(--text-main)' }}>
                            Efecto Parallax (3D)
                          </label>
                          <div 
                            className="w-4 h-4 rounded-[4px] flex items-center justify-center transition-all duration-200"
                            style={{
                              backgroundColor: selectedElement.parallaxEnabled ? 'var(--primary-accent)' : 'transparent',
                              borderColor: selectedElement.parallaxEnabled ? 'var(--primary-accent)' : 'var(--border-color)',
                              borderWidth: '1.5px',
                              boxShadow: selectedElement.parallaxEnabled ? '0 0 0 2px rgba(var(--primary-accent-rgb), 0.2)' : 'none'
                            }}
                          >
                            {selectedElement.parallaxEnabled && <Check size={12} color="#ffffff" strokeWidth={3.5} />}
                          </div>
                        </div>

                        {selectedElement.parallaxEnabled && (
                          <div className="pl-1 animate-fade-in mt-2">
                            <label className="block font-extrabold mb-1 uppercase text-[10px]" style={{ color: 'var(--text-muted)' }} title="Intensidad del efecto al mover el móvil (-100 a 100)">
                              Profundidad
                            </label>
                            <InspectorNumberInput
                              value={selectedElement.depth || 0}
                              min={-100}
                              max={100}
                              step={5}
                              onChange={(val) => updateSelectedElement('depth', val)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    );
                  })()}
                </div>

                {/* 2.5 ACORDEÓN: AJUSTE & FILTROS (Imagen y Video) */}
                {(selectedElement.type === 'image' || selectedElement.type === 'video') && (
                  <div className="border-t" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                    <div className="w-full flex items-center justify-between px-4 py-3 select-none">
                      <button
                        type="button"
                        onClick={() => toggleSection('imageFit')}
                        className="flex-1 flex items-center justify-between font-extrabold uppercase text-[10px] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors pr-2"
                        style={{ color: openSections.imageFit ? 'var(--primary-accent)' : 'var(--text-muted)' }}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>Ajuste & Filtros de {selectedElement.type === 'video' ? 'Video' : 'Imagen'}</span>
                          {!isSuperAdmin && selectedElement.lockedSections?.appearance && (
                            <Lock size={12} className="text-amber-500 shrink-0" title="Propiedad restringida por el diseñador" />
                          )}
                        </span>
                        {openSections.imageFit ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>

                      {isSuperAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSectionLock('appearance');
                          }}
                          className={`p-1 rounded-md border transition-all cursor-pointer shrink-0 ${
                            selectedElement.lockedSections?.appearance
                              ? 'bg-amber-500/20 text-amber-500 border-amber-500/40 shadow-xs'
                              : 'hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 border-transparent'
                          }`}
                          title={
                            selectedElement.lockedSections?.appearance
                              ? 'Bloqueado para otros roles (Clic para permitir edición)'
                              : 'Permitido para otros roles (Clic para bloquear edición)'
                          }
                        >
                          {selectedElement.lockedSections?.appearance ? <Lock size={13} /> : <Unlock size={13} />}
                        </button>
                      )}
                    </div>

                    {openSections.imageFit && (
                      <div
                        className={`px-4 pb-3 pt-2 border-t space-y-3 transition-opacity ${
                          !isSuperAdmin && selectedElement.lockedSections?.appearance
                            ? 'opacity-60 pointer-events-none select-none'
                            : ''
                        }`}
                        style={{ borderColor: 'var(--border-color)' }}
                      >
                        {/* 1. MODO DE ENCUADRE Y REPETICIÓN */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block font-extrabold uppercase text-[9px] tracking-wider" style={{ color: 'var(--text-muted)' }}>
                              Modo de Encuadre
                            </label>
                            {/* Checkbox "Toda la Página" para expandir al lienzo completo (1080x1920) con memoria de estado previo */}
                            <label
                              className="flex items-center gap-1 text-[9px] font-extrabold uppercase cursor-pointer select-none transition-colors hover:opacity-80"
                              style={{ color: 'var(--primary-accent)' }}
                              title="Expandir imagen a toda la página del lienzo (1080x1920) y centrarla"
                            >
                              <input
                                type="checkbox"
                                checked={selectedElement.width === 1080 && selectedElement.height === 1920 && selectedElement.x === 0 && selectedElement.y === 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    // Guardar el estado exacto anterior a expandir
                                    const preState = {
                                      x: selectedElement.x,
                                      y: selectedElement.y,
                                      width: selectedElement.width,
                                      height: selectedElement.height,
                                      objectFit: selectedElement.objectFit,
                                    };
                                    updateSelectedElementBatch({
                                      x: 0,
                                      y: 0,
                                      width: 1080,
                                      height: 1920,
                                      objectFit: 'cover',
                                      preFitState: preState,
                                    });
                                  } else {
                                    // Si hay memoria previa guardada, restaurarla
                                    if (selectedElement.preFitState) {
                                      const { x, y, width, height, objectFit } = selectedElement.preFitState;
                                      updateSelectedElementBatch({
                                        x,
                                        y,
                                        width,
                                        height,
                                        objectFit: objectFit || 'contain',
                                        preFitState: undefined,
                                      });
                                    } else {
                                      // Fallback a dimensiones iniciales/originales si no hay preFitState
                                      const origW = selectedElement.initialWidth || selectedElement.naturalWidth || 600;
                                      const origH = selectedElement.initialHeight || selectedElement.naturalHeight || 800;
                                      updateSelectedElementBatch({
                                        x: Math.round((1080 - origW) / 2),
                                        y: Math.round((1920 - origH) / 2),
                                        width: origW,
                                        height: origH,
                                        objectFit: 'contain',
                                      });
                                    }
                                  }
                                }}
                                className="h-3 w-3 rounded border cursor-pointer accent-[var(--primary-accent)]"
                              />
                              <span>Toda la Página</span>
                            </label>
                          </div>
                          <div className="grid grid-cols-4 gap-1 p-0.5 rounded-lg border shadow-2xs mb-2" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                            {[
                              { id: 'contain', label: 'Ajustar', title: 'Ajustar (Mantiene imagen completa)' },
                              { id: 'cover', label: 'Cubrir', title: 'Cubrir (Recorta los bordes sobrantes)' },
                              { id: 'fill', label: 'Estirar', title: 'Estirar (Llenar contenedor)' },
                              { id: 'none', label: 'Real', title: 'Sin escala (Tamaño original)' },
                            ].map((mode) => {
                              const currentFit = selectedElement.objectFit || 'contain';
                              const isActive = currentFit === mode.id;
                              return (
                                <button
                                  key={mode.id}
                                  type="button"
                                  onClick={() => updateSelectedElement('objectFit', mode.id)}
                                  title={mode.title}
                                  className="py-1 rounded-md text-[9px] font-extrabold uppercase transition-all cursor-pointer select-none border flex items-center justify-center"
                                  style={{
                                    backgroundColor: isActive ? 'var(--primary-accent-light)' : 'transparent',
                                    borderColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                    color: isActive ? 'var(--primary-accent)' : 'var(--text-main)',
                                  }}
                                >
                                  {mode.label}
                                </button>
                              );
                            })}
                          </div>

                          {/* FILA CONJUNTA: ESCALA A LA IZQUIERDA Y SELECT DE REPETICIÓN A LA DERECHA (solo para Imagen) */}
                          <div className={`grid ${selectedElement.type === 'image' ? 'grid-cols-2' : 'grid-cols-1'} gap-2 pt-1 font-mono`}>
                            {/* Control Escala de Imagen tomando en cuenta su tamaño original */}
                            <div>
                              <label className="block font-extrabold mb-1 uppercase text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                Escala (%)
                              </label>
                              <InspectorNumberInput
                                value={(() => {
                                  const baseW = selectedElement.initialWidth || selectedElement.naturalWidth || selectedElement.width || 200;
                                  if (!baseW) return 100;
                                  return Math.round((selectedElement.width / baseW) * 100);
                                })()}
                                min={10}
                                max={500}
                                step={5}
                                onChange={(scaleVal) => {
                                  // Base sobre la cual calcular el porcentaje (initialWidth o width si no existe)
                                  const baseW = selectedElement.initialWidth || selectedElement.naturalWidth || selectedElement.width || 200;
                                  const baseH = selectedElement.initialHeight || selectedElement.naturalHeight || selectedElement.height || 200;
                                  const currentAspect = selectedElement.width > 0 && selectedElement.height > 0 ? selectedElement.height / selectedElement.width : baseH / baseW;
                                  
                                  const targetW = Math.round(baseW * (scaleVal / 100));
                                  const targetH = Math.round(targetW * currentAspect);

                                  updateSelectedElementBatch({
                                    imgScale: scaleVal,
                                    initialWidth: baseW,
                                    initialHeight: baseH,
                                    width: Math.max(10, targetW),
                                    height: Math.max(10, targetH),
                                  });
                                }}
                              />
                            </div>

                            {/* Select de Repetición / Patrón (solo si es tipo imagen) */}
                            {selectedElement.type === 'image' && (
                              <div>
                                <label className="block font-extrabold mb-1 uppercase text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                  Repetición
                                </label>
                                <InspectorSelect
                                  value={
                                    selectedElement.objectFit === 'repeat' ||
                                    selectedElement.objectFit === 'repeat-x' ||
                                    selectedElement.objectFit === 'repeat-y'
                                      ? selectedElement.objectFit
                                      : 'no-repeat'
                                  }
                                  onChange={(val) => {
                                    if (val === 'no-repeat') {
                                      updateSelectedElement('objectFit', 'contain');
                                    } else {
                                      updateSelectedElement('objectFit', val);
                                    }
                                  }}
                                  options={[
                                    { value: 'no-repeat', label: 'Sin repetición' },
                                    { value: 'repeat', label: 'Repetir (Mosaico XY)' },
                                    { value: 'repeat-x', label: 'Repetir X (Horizontal)' },
                                    { value: 'repeat-y', label: 'Repetir Y (Vertical)' },
                                  ]}
                                />
                              </div>
                            )}
                          </div>

                          {/* Si está activa la repetición en mosaico, permitir ajustar tamaño del azulejo */}
                          {(selectedElement.objectFit === 'repeat' ||
                            selectedElement.objectFit === 'repeat-x' ||
                            selectedElement.objectFit === 'repeat-y') && (
                            <div className="pt-2 font-mono">
                              <label className="block font-extrabold mb-1 uppercase text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                Tamaño del Azulejo Patrón (px)
                              </label>
                              <InspectorNumberInput
                                value={selectedElement.repeatTileSize || 100}
                                min={10}
                                max={1000}
                                step={10}
                                onChange={(val) => updateSelectedElement('repeatTileSize', val)}
                              />
                            </div>
                          )}

                          {/* CONTROLES DE POSICIONAMIENTO E ENCUADRE INTERNO DE LA IMAGEN DENTRO DE LA MÁSCARA/CONTENEDOR */}
                          <div className="pt-2 border-t space-y-2" style={{ borderColor: 'var(--border-color)' }}>
                            <span className="block font-extrabold uppercase text-[9px] tracking-wider text-amber-500">
                              Ajuste Interno dentro de la Máscara
                            </span>
                            <div className="grid grid-cols-2 gap-2 font-mono">
                              <div>
                                <label className="block font-extrabold mb-1 uppercase text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                  Mover X (px)
                                </label>
                                <InspectorNumberInput
                                  value={selectedElement.mediaX || 0}
                                  min={-1000}
                                  max={1000}
                                  step={5}
                                  onChange={(val) => updateSelectedElement('mediaX', val)}
                                />
                              </div>
                              <div>
                                <label className="block font-extrabold mb-1 uppercase text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                  Mover Y (px)
                                </label>
                                <InspectorNumberInput
                                  value={selectedElement.mediaY || 0}
                                  min={-1000}
                                  max={1000}
                                  step={5}
                                  onChange={(val) => updateSelectedElement('mediaY', val)}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 font-mono">
                              <div>
                                <label className="block font-extrabold mb-1 uppercase text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                  Zoom Interno (%)
                                </label>
                                <InspectorNumberInput
                                  value={selectedElement.mediaScale ?? 100}
                                  min={10}
                                  max={500}
                                  step={5}
                                  onChange={(val) => updateSelectedElement('mediaScale', val)}
                                />
                              </div>
                              <div>
                                <label className="block font-extrabold mb-1 uppercase text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                  Rotación Interna (°)
                                </label>
                                <InspectorNumberInput
                                  value={selectedElement.mediaRotation || 0}
                                  min={-360}
                                  max={360}
                                  step={5}
                                  onChange={(val) => updateSelectedElement('mediaRotation', val)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2. FILTROS VISUALES DE IMAGEN */}
                        <div className="space-y-2 pt-1 border-t" style={{ borderColor: 'var(--border-color)' }}>
                          <span className="block font-extrabold uppercase text-[9px] tracking-wider opacity-70" style={{ color: 'var(--text-muted)' }}>
                            Filtros de Color & Ajuste
                          </span>

                          {/* Brillo & Contraste */}
                          <div className="grid grid-cols-2 gap-2 font-mono">
                            <div>
                              <label className="block font-extrabold mb-1 uppercase text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                Brillo (%)
                              </label>
                              <InspectorNumberInput
                                value={selectedElement.imgBrightness !== undefined ? selectedElement.imgBrightness : 100}
                                min={0}
                                max={200}
                                step={5}
                                onChange={(val) => updateSelectedElement('imgBrightness', val)}
                              />
                            </div>
                            <div>
                              <label className="block font-extrabold mb-1 uppercase text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                Contraste (%)
                              </label>
                              <InspectorNumberInput
                                value={selectedElement.imgContrast !== undefined ? selectedElement.imgContrast : 100}
                                min={0}
                                max={200}
                                step={5}
                                onChange={(val) => updateSelectedElement('imgContrast', val)}
                              />
                            </div>
                          </div>

                          {/* Saturación & Desenfoque */}
                          <div className="grid grid-cols-2 gap-2 font-mono">
                            <div>
                              <label className="block font-extrabold mb-1 uppercase text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                Saturación (%)
                              </label>
                              <InspectorNumberInput
                                value={selectedElement.imgSaturate !== undefined ? selectedElement.imgSaturate : 100}
                                min={0}
                                max={200}
                                step={5}
                                onChange={(val) => updateSelectedElement('imgSaturate', val)}
                              />
                            </div>
                            <div>
                              <label className="block font-extrabold mb-1 uppercase text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                Blur (px)
                              </label>
                              <InspectorNumberInput
                                value={selectedElement.imgBlur || 0}
                                min={0}
                                max={20}
                                step={1}
                                onChange={(val) => updateSelectedElement('imgBlur', val)}
                              />
                            </div>
                          </div>

                          {/* Toggles de Efectos Rápidos: B&N y Sepia */}
                          <div className="grid grid-cols-2 gap-1.5 pt-1.5">
                            <button
                              type="button"
                              onClick={() => updateSelectedElement('imgGrayscale', !selectedElement.imgGrayscale)}
                              className="py-1 px-2 rounded-lg border text-[9px] font-extrabold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              style={{
                                backgroundColor: selectedElement.imgGrayscale ? 'var(--primary-accent-light)' : 'var(--bg-card)',
                                borderColor: selectedElement.imgGrayscale ? 'var(--primary-accent)' : 'var(--border-color)',
                                color: selectedElement.imgGrayscale ? 'var(--primary-accent)' : 'var(--text-main)',
                              }}
                            >
                              Blanco y Negro
                            </button>

                            <button
                              type="button"
                              onClick={() => updateSelectedElement('imgSepia', !selectedElement.imgSepia)}
                              className="py-1 px-2 rounded-lg border text-[9px] font-extrabold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              style={{
                                backgroundColor: selectedElement.imgSepia ? 'var(--primary-accent-light)' : 'var(--bg-card)',
                                borderColor: selectedElement.imgSepia ? 'var(--primary-accent)' : 'var(--border-color)',
                                color: selectedElement.imgSepia ? 'var(--primary-accent)' : 'var(--text-main)',
                              }}
                            >
                              Tono Sepia
                            </button>
                          </div>

                          {/* 3. SECCIÓN PATRÓN DE DISEÑO REPETITIVO (SVG / TEXTURAS PARA FIGURAS/SHAPES) */}
                          {selectedElement.type === 'shape' && (
                            <div className="space-y-2 pt-2 border-t font-mono text-[10px]" style={{ borderColor: 'var(--border-color)' }}>
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold uppercase text-[9px] tracking-wider flex items-center gap-1" style={{ color: 'var(--primary-accent)' }}>
                                  <Grid size={11} /> Patrón de Diseño (SVG)
                                </span>
                              </div>

                              {/* Selector de tipo de patrón vectorial */}
                              <div className="grid grid-cols-5 gap-1">
                                {[
                                  { id: 'none', label: 'Ninguno', icon: Circle },
                                  { id: 'dots', label: 'Puntos', icon: Circle },
                                  { id: 'lines', label: 'Líneas', icon: Spline },
                                  { id: 'grid', label: 'Malla', icon: Grid },
                                  { id: 'waves', label: 'Ondas', icon: Waves },
                                  { id: 'hearts', label: 'Corazones', icon: Heart },
                                  { id: 'stars', label: 'Estrellas', icon: Star },
                                  { id: 'diamonds', label: 'Rombos', icon: Square },
                                  { id: 'floral', label: 'Floral', icon: Flower2 },
                                  { id: 'checkers', label: 'Cuadros', icon: Grid },
                                ].map((pattern) => {
                                  const IconComp = pattern.icon;
                                  const active = (selectedElement.patternType || 'none') === pattern.id;
                                  return (
                                    <button
                                      key={pattern.id}
                                      type="button"
                                      onClick={() => updateSelectedElement('patternType', pattern.id as any)}
                                      className="flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer text-center gap-1"
                                      style={{
                                        backgroundColor: active ? 'var(--primary-accent-light)' : 'var(--bg-card)',
                                        borderColor: active ? 'var(--primary-accent)' : 'var(--border-color)',
                                        color: active ? 'var(--primary-accent)' : 'var(--text-main)',
                                      }}
                                      title={pattern.label}
                                    >
                                      <IconComp size={12} />
                                      <span className="text-[8px] font-bold uppercase truncate w-full">{pattern.label}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Opciones adicionales si el patrón está activo */}
                              {(selectedElement.patternType || 'none') !== 'none' && (
                                <div className="p-2 rounded-lg border space-y-2" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                  {/* Color del patrón y escala */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block font-extrabold mb-1 uppercase text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                        Color Patrón
                                      </label>
                                      <div className="flex items-center gap-1.5">
                                        <input
                                          type="color"
                                          value={selectedElement.patternColor || '#ffffff'}
                                          onChange={(e) => updateSelectedElement('patternColor', e.target.value)}
                                          className="w-6 h-6 rounded border cursor-pointer"
                                        />
                                        <span className="text-[9px] uppercase">{selectedElement.patternColor || '#ffffff'}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block font-extrabold mb-1 uppercase text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                        Escala (px)
                                      </label>
                                      <InspectorNumberInput
                                        value={selectedElement.patternScale || 24}
                                        min={8}
                                        max={120}
                                        step={2}
                                        onChange={(val) => updateSelectedElement('patternScale', val)}
                                      />
                                    </div>
                                  </div>

                                  {/* Opacidad del patrón */}
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <label className="font-extrabold uppercase text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                        Opacidad ({Math.round((selectedElement.patternOpacity ?? 0.5) * 100)}%)
                                      </label>
                                    </div>
                                    <input
                                      type="range"
                                      min={0.05}
                                      max={1}
                                      step={0.05}
                                      value={selectedElement.patternOpacity ?? 0.5}
                                      onChange={(e) => updateSelectedElement('patternOpacity', Number(e.target.value))}
                                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-black/20 dark:bg-white/20"
                                      style={{ accentColor: 'var(--primary-accent)' }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 4. SECCIÓN CHROMA KEY (EFECTO PANTALLA VERDE / ELIMINAR FONDO DE VIDEO) */}
                          {selectedElement.type === 'video' && (
                            <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold uppercase text-[9px] tracking-wider flex items-center gap-1" style={{ color: 'var(--primary-accent)' }}>
                                  <Sparkles size={11} /> Chroma Key (Fondo Transparente)
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={!!selectedElement.chromaKeyEnabled}
                                    onChange={(e) => updateSelectedElement('chromaKeyEnabled', e.target.checked)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-7 h-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all transition-colors" style={{ backgroundColor: selectedElement.chromaKeyEnabled ? 'var(--primary-accent)' : 'var(--border-color)' }}></div>
                                </label>
                              </div>

                              {selectedElement.chromaKeyEnabled && (
                                <div className="p-2 rounded-lg border space-y-2 font-mono text-[10px]" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                  {/* Fila: Selección y Gestión de Múltiples Colores Clave */}
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <span className="font-extrabold uppercase text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                        Colores a Remover ({((selectedElement.chromaKeyColors && selectedElement.chromaKeyColors.length > 0) ? selectedElement.chromaKeyColors : [selectedElement.chromaKeyColor || '#00FF00']).length})
                                      </span>

                                      {/* Cuentagotas si el navegador lo soporta */}
                                      {typeof window !== 'undefined' && 'EyeDropper' in window && (
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            try {
                                              const eyeDropper = new (window as any).EyeDropper();
                                              const result = await eyeDropper.open();
                                              if (result?.sRGBHex) {
                                                const newColor = result.sRGBHex.toUpperCase();
                                                const currentList = selectedElement.chromaKeyColors && selectedElement.chromaKeyColors.length > 0
                                                  ? selectedElement.chromaKeyColors
                                                  : [selectedElement.chromaKeyColor || '#00FF00'];
                                                if (!currentList.includes(newColor)) {
                                                  const newList = [...currentList, newColor];
                                                  updateSelectedElementBatch({
                                                    chromaKeyColor: newColor,
                                                    chromaKeyColors: newList,
                                                  });
                                                }
                                              }
                                            } catch (err) {
                                              // Cancelado
                                            }
                                          }}
                                          className="p-1 rounded-md border flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                                          style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                                          title="Cuentagotas: Tomar muestra de color y agregarlo al ChromaKey"
                                        >
                                          <Palette size={12} />
                                        </button>
                                      )}
                                    </div>

                                    {/* Chips de colores activos */}
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {((selectedElement.chromaKeyColors && selectedElement.chromaKeyColors.length > 0)
                                        ? selectedElement.chromaKeyColors
                                        : [selectedElement.chromaKeyColor || '#00FF00']
                                      ).map((hex, index) => (
                                        <div
                                          key={`${hex}-${index}`}
                                          className="flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9px] font-bold shadow-2xs"
                                          style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                                        >
                                          {/* Círculo de color interactivo (Cuentagotas o Selector para cambiar el color) */}
                                          {typeof window !== 'undefined' && 'EyeDropper' in window ? (
                                            <button
                                              type="button"
                                              onClick={async () => {
                                                try {
                                                  const eyeDropper = new (window as any).EyeDropper();
                                                  const result = await eyeDropper.open();
                                                  if (result?.sRGBHex) {
                                                    const updatedHex = result.sRGBHex.toUpperCase();
                                                    const currentList = selectedElement.chromaKeyColors && selectedElement.chromaKeyColors.length > 0
                                                      ? selectedElement.chromaKeyColors
                                                      : [selectedElement.chromaKeyColor || '#00FF00'];
                                                    const newList = [...currentList];
                                                    newList[index] = updatedHex;
                                                    updateSelectedElementBatch({
                                                      chromaKeyColor: newList[0] || '#00FF00',
                                                      chromaKeyColors: newList,
                                                    });
                                                  }
                                                } catch (err) {
                                                  // Cancelado
                                                }
                                              }}
                                              className="w-3.5 h-3.5 rounded-full border border-white/40 shrink-0 cursor-pointer transition-transform hover:scale-110"
                                              style={{ backgroundColor: hex }}
                                              title="Usar cuentagotas para cambiar este color"
                                            />
                                          ) : (
                                            <label
                                              className="w-3.5 h-3.5 rounded-full border border-white/40 shrink-0 cursor-pointer transition-transform hover:scale-110 relative"
                                              style={{ backgroundColor: hex }}
                                              title="Cambiar este color"
                                            >
                                              <input
                                                type="color"
                                                value={hex}
                                                onChange={(e) => {
                                                  const updatedHex = e.target.value.toUpperCase();
                                                  const currentList = selectedElement.chromaKeyColors && selectedElement.chromaKeyColors.length > 0
                                                    ? selectedElement.chromaKeyColors
                                                    : [selectedElement.chromaKeyColor || '#00FF00'];
                                                  const newList = [...currentList];
                                                  newList[index] = updatedHex;
                                                  updateSelectedElementBatch({
                                                    chromaKeyColor: newList[0] || '#00FF00',
                                                    chromaKeyColors: newList,
                                                  });
                                                }}
                                                className="sr-only"
                                              />
                                            </label>
                                          )}
                                          <span className="uppercase font-mono">{hex}</span>
                                          {((selectedElement.chromaKeyColors || []).length > 1 || (selectedElement.chromaKeyColors && selectedElement.chromaKeyColors.length === 1)) && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const currentList = selectedElement.chromaKeyColors && selectedElement.chromaKeyColors.length > 0
                                                  ? selectedElement.chromaKeyColors
                                                  : [selectedElement.chromaKeyColor || '#00FF00'];
                                                const newList = currentList.filter((_, i) => i !== index);
                                                updateSelectedElementBatch({
                                                  chromaKeyColor: newList[0] || '#00FF00',
                                                  chromaKeyColors: newList,
                                                });
                                              }}
                                              className="ml-0.5 p-0.5 rounded hover:bg-red-500/20 text-red-500 cursor-pointer"
                                              title="Eliminar este color de la lista ChromaKey"
                                            >
                                              <X size={10} />
                                            </button>
                                          )}
                                        </div>
                                      ))}

                                      {/* Agregar nuevo color picker estilizado */}
                                      <div className="relative flex items-center">
                                        <label
                                          className="p-1 rounded-md border flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                                          style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                                          title="Agregar otro color a remover en ChromaKey"
                                        >
                                          <Plus size={12} />
                                          <input
                                            type="color"
                                            value="#00FF00"
                                            onChange={(e) => {
                                              const newColor = e.target.value.toUpperCase();
                                              const currentList = selectedElement.chromaKeyColors && selectedElement.chromaKeyColors.length > 0
                                                ? selectedElement.chromaKeyColors
                                                : [selectedElement.chromaKeyColor || '#00FF00'];
                                              if (!currentList.includes(newColor)) {
                                                const newList = [...currentList, newColor];
                                                updateSelectedElementBatch({
                                                  chromaKeyColor: newColor,
                                                  chromaKeyColors: newList,
                                                });
                                              }
                                            }}
                                            className="sr-only"
                                          />
                                        </label>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Tolerancia de color */}
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <label className="font-extrabold uppercase text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                        Tolerancia ({selectedElement.chromaKeyTolerance ?? 40}%)
                                      </label>
                                    </div>
                                    <input
                                      type="range"
                                      min={5}
                                      max={80}
                                      step={1}
                                      value={selectedElement.chromaKeyTolerance ?? 40}
                                      onChange={(e) => updateSelectedElement('chromaKeyTolerance', Number(e.target.value))}
                                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-black/20 dark:bg-white/20"
                                      style={{ accentColor: 'var(--primary-accent)' }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. ACORDEÓN: TIPOGRAFÍA & ESTILO (solo si aplica a Texto o Botones) */}
                {(selectedElement.type === 'text' || selectedElement.type === 'button') && (
                  <div className="border-t" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                    <div className="w-full flex items-center justify-between px-4 py-3 select-none">
                      <button
                        type="button"
                        onClick={() => toggleSection('typography')}
                        className="flex-1 flex items-center justify-between font-extrabold uppercase text-[10px] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors pr-2"
                        style={{ color: openSections.typography ? 'var(--primary-accent)' : 'var(--text-muted)' }}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>Tipografía & Estilo</span>
                          {!isSuperAdmin && selectedElement.lockedSections?.typography && (
                            <Lock size={12} className="text-amber-500 shrink-0" title="Propiedad restringida por el diseñador" />
                          )}
                        </span>
                        {openSections.typography ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>

                      {isSuperAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSectionLock('typography');
                          }}
                          className={`p-1 rounded-md border transition-all cursor-pointer shrink-0 ${
                            selectedElement.lockedSections?.typography
                              ? 'bg-amber-500/20 text-amber-500 border-amber-500/40 shadow-xs'
                              : 'hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 border-transparent'
                          }`}
                          title={
                            selectedElement.lockedSections?.typography
                              ? 'Bloqueado para otros roles (Clic para permitir edición)'
                              : 'Permitido para otros roles (Clic para bloquear edición)'
                          }
                        >
                          {selectedElement.lockedSections?.typography ? <Lock size={13} /> : <Unlock size={13} />}
                        </button>
                      )}
                    </div>

                    {openSections.typography && (
                      <div
                        className={`px-4 pb-3 pt-2 border-t space-y-3 transition-opacity ${
                          !isSuperAdmin && selectedElement.lockedSections?.typography
                            ? 'opacity-60 pointer-events-none select-none'
                            : ''
                        }`}
                        style={{ borderColor: 'var(--border-color)' }}
                      >
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
                          <div className="grid grid-cols-5 gap-1 rounded-lg p-1 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                            {[
                              { id: 'none', label: 'Normal', icon: Minus },
                              { id: 'arc', label: 'Arco', icon: Spline },
                              { id: 'wave', label: 'Onda', icon: Waves },
                              { id: 'circle', label: 'Circular', icon: LoaderCircle },
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
                                  className={`flex items-center justify-center h-7 rounded-md transition-all cursor-pointer ${
                                    isSelected ? 'font-extrabold shadow-2xs' : 'hover:opacity-80'
                                  }`}
                                  style={{
                                    backgroundColor: isSelected ? 'var(--primary-accent-light)' : 'transparent',
                                    color: isSelected ? 'var(--primary-accent)' : 'var(--text-main)',
                                    borderColor: isSelected ? 'var(--primary-accent)' : 'transparent',
                                  }}
                                >
                                  <IconComp size={16} />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Controles: Curvatura (si aplica) y Espaciado de Letras */}
                        <div className={selectedElement.wordArtShape && selectedElement.wordArtShape !== 'none' ? 'grid grid-cols-2 gap-2' : 'w-full'}>
                          {selectedElement.wordArtShape && selectedElement.wordArtShape !== 'none' && (
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
                          )}

                          <div className={selectedElement.wordArtShape && selectedElement.wordArtShape !== 'none' ? '' : 'w-full'}>
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
                  <div className="w-full flex items-center justify-between px-4 py-3 select-none">
                    <button
                      type="button"
                      onClick={() => toggleSection('container')}
                      className="flex-1 flex items-center justify-between font-extrabold uppercase text-[10px] cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors pr-2"
                      style={{ color: openSections.container ? 'var(--primary-accent)' : 'var(--text-muted)' }}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>Contenedor & Estilo</span>
                        {!isSuperAdmin && selectedElement.lockedSections?.container && (
                          <Lock size={12} className="text-amber-500 shrink-0" title="Propiedad restringida por el diseñador" />
                        )}
                      </span>
                      {openSections.container ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {isSuperAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSectionLock('container');
                        }}
                        className={`p-1 rounded-md border transition-all cursor-pointer shrink-0 ${
                          selectedElement.lockedSections?.container
                            ? 'bg-amber-500/20 text-amber-500 border-amber-500/40 shadow-xs'
                            : 'hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 border-transparent'
                        }`}
                        title={
                          selectedElement.lockedSections?.container
                            ? 'Bloqueado para otros roles (Clic para permitir edición)'
                            : 'Permitido para otros roles (Clic para bloquear edición)'
                        }
                      >
                        {selectedElement.lockedSections?.container ? <Lock size={13} /> : <Unlock size={13} />}
                      </button>
                    )}
                  </div>

                  {openSections.container && (
                    <div
                      className={`px-4 pb-3 pt-2 border-t space-y-2 transition-opacity ${
                        !isSuperAdmin && selectedElement.lockedSections?.container
                          ? 'opacity-60 pointer-events-none select-none'
                          : ''
                      }`}
                      style={{ borderColor: 'var(--border-color)' }}
                    >
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
                    {/* Efecto Esmerilado (Glassmorphism) */}
                      <div className="pt-2 border-t mt-2" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <label className="font-bold text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                            Efecto Esmerilado (Glass)
                          </label>
                          <button
                            onClick={() => updateSelectedElement('backdropBlurEnabled', !selectedElement.backdropBlurEnabled)}
                            className={`w-8 h-4 rounded-full flex items-center transition-colors px-0.5 ${
                              selectedElement.backdropBlurEnabled ? 'bg-pink-500 justify-end' : 'bg-zinc-700 justify-start'
                            }`}
                          >
                            <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                          </button>
                        </div>
                        {selectedElement.backdropBlurEnabled && (
                          <div className="space-y-2.5 mt-2.5 p-2 rounded-lg border bg-black/5 dark:bg-white/5" style={{ borderColor: 'var(--border-color)' }}>
                            <div className="flex items-center justify-between gap-2">
                              <label className="font-bold text-[9.5px] uppercase tracking-wider shrink-0" style={{ color: 'var(--text-muted)' }}>
                                Tinta Glass
                              </label>
                              <div className="w-28">
                                <ColorPickerPopover
                                  value={selectedElement.backdropColor || selectedElement.backgroundColor || '#FFFFFF'}
                                  onChange={(val) => {
                                    updateSelectedElement('backdropColor', val);
                                    updateSelectedElement('backgroundColor', val);
                                  }}
                                  allowGradient={false}
                                  allowTransparent={true}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1 border-t" style={{ borderColor: 'var(--border-color)' }}>
                              <div>
                                <label className="block font-bold mb-1 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                  Blur: {selectedElement.backdropBlurAmount ?? 10}px
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="40"
                                  step="1"
                                  value={selectedElement.backdropBlurAmount ?? 10}
                                  onChange={(e) => updateSelectedElement('backdropBlurAmount', Number(e.target.value))}
                                  className="w-full accent-pink-500 h-1 bg-black/20 dark:bg-white/20 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                              <div>
                                <label className="block font-bold mb-1 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                  Opacidad: {selectedElement.backdropOpacity ?? 30}%
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="1"
                                  value={selectedElement.backdropOpacity ?? 30}
                                  onChange={(e) => updateSelectedElement('backdropOpacity', Number(e.target.value))}
                                  className="w-full accent-pink-500 h-1 bg-black/20 dark:bg-white/20 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* TAB: ANIMACIÓN ESTILO JITTER */
              <div className="p-3 space-y-4 text-xs">
                <div className="p-3 rounded-xl border flex items-center justify-between gap-2" style={{ backgroundColor: 'var(--primary-accent-light)', borderColor: 'var(--primary-accent)' }}>
                  <div className="flex items-center gap-2">
                    <Zap size={18} style={{ color: 'var(--primary-accent)' }} />
                    <div>
                      <p className="font-extrabold" style={{ color: 'var(--primary-accent)' }}>Jitter Motion Engine</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-main)' }}>Configura la animación de entrada y salida del elemento.</p>
                    </div>
                  </div>

                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => toggleSectionLock('animation')}
                      className={`p-1 rounded-md border transition-all cursor-pointer shrink-0 ${
                        selectedElement.lockedSections?.animation
                          ? 'bg-amber-500/20 text-amber-500 border-amber-500/40 shadow-xs'
                          : 'hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 border-transparent'
                      }`}
                      title={
                        selectedElement.lockedSections?.animation
                          ? 'Bloqueado para otros roles (Clic para permitir edición)'
                          : 'Permitido para otros roles (Clic para bloquear edición)'
                      }
                    >
                      {selectedElement.lockedSections?.animation ? <Lock size={13} /> : <Unlock size={13} />}
                    </button>
                  )}
                </div>

                <div className={`space-y-4 transition-opacity ${!isSuperAdmin && selectedElement.lockedSections?.animation ? 'opacity-60 pointer-events-none select-none' : ''}`}>

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

      {/* Overlay de Guardado / Generando Preview */}
      {saving && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-6" style={{ color: 'var(--primary-accent)' }} />
          <h2 className="text-2xl font-extrabold tracking-tight">Guardando diseño...</h2>
          <p className="text-sm opacity-80 mt-2 font-medium">Generando vista previa en alta calidad, por favor espera.</p>
        </div>
      )}
    </div>
  );
}
