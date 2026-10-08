import React, { useState, useEffect } from 'react';
import {
  Camera,
  CheckCircle2,
  XCircle,
  QrCode,
  Tv,
  Settings,
  Image as ImageIcon,
  Download,
  Trash2,
  Sparkles,
  ExternalLink,
  Sliders,
  Share2,
  Smartphone,
  Type,
  MousePointer2,
  MousePointerClick,
  Palette,
  Maximize2,
  RotateCw,
  Plus,
  Minus,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Upload,
  Square,
  Check,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Hourglass,
  MapPin,
  UserPlus,
  Info,
} from 'lucide-react';
import api from '../../lib/api';
import MobileSimulator from './MobileSimulator';
import GradientPickerModal, { GradientData } from './GradientPickerModal';
import FontPickerModal from './FontPickerModal';
import FontPicker from './FontPicker';
import { StylePickerPopover } from '../StylePickerPopover';
import { ColorPickerPopover } from '../ColorPickerPopover';

interface PhotoManagerProps {
  eventId: number;
  activeSubTab?: 'app_movil' | 'display' | 'totem' | 'moderation' | 'qr';
  onSubTabChange?: (tab: 'app_movil' | 'display' | 'totem' | 'moderation' | 'qr') => void;
}

interface Photo {
  id: number;
  file_path: string;
  guest_name?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface CtrlPixelPorcentageProps {
  value: number;
  unit: string;
  onChangeValue: (val: number) => void;
  onChangeUnit: (unit: string) => void;
  min?: number;
  max?: number;
}

const CtrlPixelPorcentage = ({
  value,
  unit,
  onChangeValue,
  onChangeUnit,
  min = -100,
  max = 300,
}: CtrlPixelPorcentageProps) => (
  <div className="flex items-center gap-1.5 w-full">
    {/* Stepper container: [-] [ valor ] [+] */}
    <div
      className="flex-1 flex items-center h-8 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] shadow-2xs min-w-0"
      style={{
        backgroundColor: 'var(--bg-app)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Botón Disminuir (-) */}
      <button
        type="button"
        onClick={() => onChangeValue(Math.max(min, (parseInt(value as any) || 0) - 1))}
        className="w-7 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--primary-accent)',
        }}
        title="Disminuir"
      >
        <Minus size={11} />
      </button>

      {/* Input de valor numérico */}
      <div className="flex-1 min-w-0 flex items-center justify-center px-1 h-full">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChangeValue(parseInt(e.target.value) || 0)}
          className="w-full h-full text-center bg-transparent outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          style={{ color: 'var(--text-main)' }}
        />
      </div>

      {/* Botón Aumentar (+) */}
      <button
        type="button"
        onClick={() => onChangeValue(Math.min(max, (parseInt(value as any) || 0) + 1))}
        className="w-7 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--primary-accent)',
        }}
        title="Aumentar"
      >
        <Plus size={11} />
      </button>
    </div>

    {/* Espacio + Selector de Unidad (% y px) */}
    <div
      className="flex items-center h-8 rounded-xl border p-0.5 shrink-0 shadow-2xs gap-0.5"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
      }}
    >
      {['px', '%'].map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => onChangeUnit(u)}
          className="px-2 h-full text-[9px] font-extrabold rounded-lg transition-all cursor-pointer flex items-center justify-center"
          style={{
            backgroundColor: unit === u ? 'var(--primary-accent)' : 'transparent',
            color: unit === u ? '#ffffff' : 'var(--text-muted)',
          }}
        >
          {u}
        </button>
      ))}
    </div>
  </div>
);

export default function PhotoManager({ eventId, activeSubTab, onSubTabChange }: PhotoManagerProps) {
  const [subTab, setSubTabState] = useState<'app_movil' | 'display' | 'totem' | 'moderation' | 'qr'>(activeSubTab || 'app_movil');

  useEffect(() => {
    if (activeSubTab) {
      setSubTabState(activeSubTab);
    }
  }, [activeSubTab]);

  const setSubTab = (tab: 'app_movil' | 'display' | 'totem' | 'moderation' | 'qr') => {
    setSubTabState(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Modals state
  const [showFontModal, setShowFontModal] = useState(false);
  const [showGradientModal, setShowGradientModal] = useState(false);

  // Mobile app config states
  const [mobileActiveView, setMobileActiveView] = useState<'general' | 'welcome' | 'camera' | 'gallery'>('general');
  const [previewView, setPreviewView] = useState<string>('welcome');
  const [activeLogoState, setActiveLogoState] = useState<'precarga' | 'qr' | 'welcome' | 'camera' | 'gallery'>('welcome');
  const [precargaLogoState, setPrecargaLogoState] = useState<'precarga' | 'qr'>('precarga');
  const [generalSubTab, setGeneralSubTab] = useState<'fuentes' | 'botones' | 'fondos' | 'logos'>('fuentes');
  const [welcomeSubTab, setWelcomeSubTab] = useState<'precarga' | 'evento'>('precarga');
  const [infoScreenTarget, setInfoScreenTarget] = useState<'bienvenida' | 'gps' | 'registro'>('bienvenida');
  const [bienvenidaSubTab, setBienvenidaSubTab] = useState<'fuentes' | 'fondos' | 'logos' | 'info'>('fuentes');
  const [gpsSubTab, setGpsSubTab] = useState<'fuentes' | 'fondos' | 'logos' | 'info'>('fuentes');
  const [registroSubTab, setRegistroSubTab] = useState<'fuentes' | 'fondos' | 'logos' | 'info'>('fuentes');
  const [precargaSubTab, setPrecargaSubTab] = useState<'fuentes' | 'botones' | 'fondos' | 'logos'>('fuentes');
  const [textTarget, setTextTarget] = useState<'global_title' | 'global_text'>('global_title');
  const [precargaTextTarget, setPrecargaTextTarget] = useState<'title' | 'subtitle' | 'powered_by' | 'button'>('title');
  const [containerTarget, setContainerTarget] = useState<'fondo' | 'mensaje' | 'barra' | 'botones'>('fondo');
  const [precargaContainerTarget, setPrecargaContainerTarget] = useState<'fondo' | 'mensaje' | 'boton'>('fondo');
  const [buttonState, setButtonState] = useState<'normal' | 'hover'>('normal');

  const [settings, setSettings] = useState<any>({
    welcome_title: '¡Bienvenido al evento!',
    welcome_subtitle: 'Prepárate para capturar los mejores momentos',
    welcome_button_text: 'Continuar',

    global_title_font_family: 'Inter',
    global_title_font_size: '22',
    global_title_font_color: '#ffffff',
    global_title_bold: true,
    global_title_italic: false,
    global_title_uppercase: true,

    global_text_font_family: 'Inter',
    global_text_font_size: '14',
    global_text_font_color: '#e2e8f0',

    global_title_stroke_active: false,
    global_title_stroke_color: '#000000',
    global_title_stroke_width: '2',
    global_title_stroke_type: 'OUT',
    global_title_shadow_active: true,
    global_title_shadow_color: '#000000',
    global_title_shadow_blur: '8',

    global_button_bg: '#6366F1',
    global_button_text: '#ffffff',
    global_button_radius: 16,
    global_button_hover_bg: '#4f46e5',
    global_button_shadow: true,

    screen_bg_type: 'color',
    screen_bg_color: '#0A0A0A',
    screen_bg_opacity: 100,
    screen_gradient_from: '#1e1b4b',
    screen_gradient_to: '#0f172a',
    screen_gradient_angle: 180,

    container_bg_type: 'color',
    container_bg_color: '#0f172a',
    container_bg_opacity: 75,
    container_border_radius: 24,

    camera_instructions: 'Encuadra la foto y presiona para capturar',
    camera_show_grid: true,
    camera_safe_zone: true,
    gallery_title: 'Galería del Evento',
    gallery_empty_text: 'Sé el primero en subir una foto',
    gallery_card_bg_color: '#1e293b',
    allow_downloads: true,
  });

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setSaveSuccess(false);
    try {
      await api.put(`/events/${eventId}`, {
        mobile_settings: settings,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error al guardar la configuración de la app móvil:', err);
      // Reintento de respaldo o endpoint específico si no soporta mobile_settings directo
      try {
        await api.post(`/events/${eventId}/settings`, { settings });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (fallbackErr) {
        console.error('Error en fallback de guardado:', fallbackErr);
      }
    } finally {
      setIsSavingSettings(false);
    }
  };

  const updateSetting = (key: string, val: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: val }));
  };

  const handleTabChange = (view: 'general' | 'welcome' | 'camera' | 'gallery') => {
    setMobileActiveView(view);
    if (view === 'general') {
      setPreviewView('welcome');
    } else if (view === 'welcome') {
      setPreviewView(welcomeSubTab === 'precarga' ? 'precarga' : 'welcome');
      setActiveLogoState('welcome');
    } else {
      setPreviewView(view);
      setActiveLogoState(view);
    }
  };

  // Event colors state
  const [eventColors, setEventColors] = useState<string[]>([]);
  const [eventColorImage, setEventColorImage] = useState<string | null>(null);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/events/${eventId}/photos`);
      const rawData = res.data.data || res.data;
      setPhotos(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      console.error('Error fetching event photos:', err);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  const [eventData, setEventData] = useState<any>(null);

  const fetchEventDetails = async () => {
    try {
      const res = await api.get(`/events/${eventId}`);
      const ev = res.data.data || res.data;
      if (ev) {
        setEventData(ev);
        if (Array.isArray(ev.colors) && ev.colors.length > 0) {
          setEventColors(ev.colors);
        } else if (ev.color_palette) {
          try {
            const parsed = typeof ev.color_palette === 'string' ? JSON.parse(ev.color_palette) : ev.color_palette;
            if (Array.isArray(parsed)) setEventColors(parsed);
          } catch(e) {}
        }
        if (ev.banner_image || ev.image_url) {
          setEventColorImage(ev.banner_image || ev.image_url);
        }
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
    }
  };

  useEffect(() => {
    fetchPhotos();
    fetchEventDetails();
  }, [eventId]);

  const targetPrefix = containerTarget === 'fondo'
    ? 'screen'
    : containerTarget === 'mensaje'
    ? 'container'
    : containerTarget === 'barra'
    ? 'bar'
    : (buttonState === 'hover' ? 'button_hover' : 'button');
  const currentImageKey = `${targetPrefix}_image_url`;
  const currentBgTypeKey = `${targetPrefix}_bg_type`;
  const currentVideoRotateKey = `${targetPrefix}_video_rotate`;
  const currentImageUrl = settings[currentImageKey] || '';
  const currentBgType = settings[currentBgTypeKey] || 'color';
  const currentVideoRotate = !!settings[currentVideoRotateKey];

  const safePhotos = Array.isArray(photos) ? photos : [];

  const filteredPhotos = safePhotos.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const updatePhotoStatus = async (photoId: number, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/events/${eventId}/photos/${photoId}`, { status });
      setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, status } : p)));
    } catch (err) {
      console.error('Error updating photo status:', err);
    }
  };

  return (
    <div className="space-y-6">

      {/* MODERATION SUB-TAB */}
      {subTab === 'moderation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Filtrar por:
              </span>
              {(['pending', 'approved', 'rejected', 'all'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer capitalize"
                  style={{
                    backgroundColor: filterStatus === st ? 'var(--primary-accent-light)' : 'var(--bg-card)',
                    borderColor: filterStatus === st ? 'var(--primary-accent)' : 'var(--border-color)',
                    color: filterStatus === st ? 'var(--primary-accent)' : 'var(--text-main)',
                  }}
                >
                  {st === 'pending' ? 'Pendientes' : st === 'approved' ? 'Aprobadas' : st === 'rejected' ? 'Rechazadas' : 'Todas'}
                </button>
              ))}
            </div>

            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              Total: {filteredPhotos.length} fotos
            </span>
          </div>

          {filteredPhotos.length === 0 ? (
            <div
              className="py-12 text-center rounded-2xl border-2 border-dashed space-y-3"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <ImageIcon className="mx-auto opacity-40" size={36} style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>
                No hay fotos {filterStatus === 'pending' ? 'pendientes' : 'para mostrar'}
              </p>
              <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
                Las fotos que capturen o suban los invitados aparecerán aquí para ser moderadas antes de la pantalla.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-2xl border overflow-hidden shadow-sm flex flex-col justify-between group"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                >
                  <div className="relative aspect-square overflow-hidden bg-black/5">
                    <img
                      src={photo.file_path}
                      alt={photo.guest_name || 'Foto de invitado'}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase shadow-xs backdrop-blur-md"
                        style={{
                          backgroundColor:
                            photo.status === 'approved'
                              ? 'rgba(34, 197, 94, 0.9)'
                              : photo.status === 'rejected'
                              ? 'rgba(239, 68, 68, 0.9)'
                              : 'rgba(234, 179, 8, 0.9)',
                          color: '#ffffff',
                        }}
                      >
                        {photo.status === 'approved' ? 'Aprobada' : photo.status === 'rejected' ? 'Rechazada' : 'Pendiente'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    <p className="text-xs font-bold truncate" style={{ color: 'var(--text-main)' }}>
                      {photo.guest_name || 'Invitado Anónimo'}
                    </p>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => updatePhotoStatus(photo.id, 'approved')}
                        className="py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                        style={{
                          backgroundColor: photo.status === 'approved' ? 'var(--success)' : 'var(--bg-app)',
                          color: photo.status === 'approved' ? '#ffffff' : 'var(--success)',
                          border: '1px solid var(--success)',
                        }}
                      >
                        <CheckCircle2 size={13} />
                        <span>Aprobar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updatePhotoStatus(photo.id, 'rejected')}
                        className="py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                        style={{
                          backgroundColor: photo.status === 'rejected' ? 'var(--danger)' : 'var(--bg-app)',
                          color: photo.status === 'rejected' ? '#ffffff' : 'var(--danger)',
                          border: '1px solid var(--danger)',
                        }}
                      >
                        <XCircle size={13} />
                        <span>Rechazar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QR & ACCESS SUB-TAB */}
      {subTab === 'qr' && (
        <div
          className="rounded-2xl p-6 border space-y-4"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-3">
            <QrCode size={24} style={{ color: 'var(--primary-accent)' }} />
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>
                Código QR & Enlace de Captura Móvil
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Imprime o comparte este código QR en las mesas para que los invitados escaneen y suban sus fotos.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border flex flex-col items-center gap-3 max-w-sm mx-auto bg-white dark:bg-slate-900">
            <div className="w-48 h-48 rounded-xl bg-slate-100 flex items-center justify-center border text-slate-400">
              <QrCode size={80} />
            </div>
            <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
              https://invited.app/e/{eventId}/photos
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-500 text-white flex items-center gap-1"
              >
                <Share2 size={13} /> Compartir
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg text-xs font-bold border text-slate-700 dark:text-slate-200 flex items-center gap-1"
              >
                <Download size={13} /> Descargar QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPLAY PROJECTION SUB-TAB */}
      {subTab === 'display' && (
        <div
          className="rounded-2xl p-6 border space-y-4"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-3">
            <Tv size={24} style={{ color: 'var(--primary-accent)' }} />
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>
                Proyección en Pantalla Gigante (Kiosco)
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Abre esta pantalla en la laptop o TV conectada al proyector del evento para transmitir el pase de fotos automático.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-xl border text-center space-y-3" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
            <Tv className="mx-auto text-primary-500 animate-pulse" size={40} />
            <h4 className="text-sm font-extrabold" style={{ color: 'var(--text-main)' }}>
              Pantalla de Proyección Lista
            </h4>
            <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
              El reproductor proyectará automáticamente las fotos aprobadas con transiciones continuas.
            </p>
            <a
              href={`/events/${eventId}/display`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--primary-accent)' }}
            >
              <ExternalLink size={14} />
              <span>Abrir Proyector Kiosco a Pantalla Completa</span>
            </a>
          </div>
        </div>
      )}

      {/* APP MÓVIL SUB-TAB (DPHOTOS CUSTOMIZER FULL) */}
      {subTab === 'app_movil' && (
        <div className="flex flex-col lg:flex-row gap-5 items-stretch h-[calc(100vh-350px)] max-h-[calc(100vh-350px)]">
          {/* COLUMNA IZQUIERDA: PREVISUALIZACIÓN DE LA APP MÓVIL (MÓVIL + BOTONES DE ESTADO DE LA DERECHA) */}
          <div className="flex flex-col items-center justify-center h-full shrink-0">
            <div className="flex flex-col items-center justify-center h-full py-0">
              {/* ENVOLTORIO CONTENEDOR DEL PREVIEW (INCLUYE EL TELÉFONO Y LOS BOTONES FLOTANTES A SU DERECHA) */}
              <div className="relative flex items-center justify-center h-full max-h-full pr-14">
                {/* FRAME DEL TELÉFONO CON ASPECT RATIO DINÁMICO (9 : 18 -> FORMATO ANDROID INTERMEDIO ESTÁNDAR) */}
                <div 
                  className="h-full max-h-full aspect-[9/18] rounded-[22px] p-1.5 border-[4px] shadow-2xl relative flex flex-col justify-center shrink-0 overflow-hidden"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  {/* Isla Dinámica / Notch del teléfono */}
                  <div 
                    className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 rounded-full z-40 border flex items-center justify-end px-1"
                    style={{
                      backgroundColor: 'var(--bg-app)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    <div 
                      className="w-1.5 h-1.5 rounded-full border"
                      style={{
                        backgroundColor: 'var(--primary-accent)',
                        borderColor: 'var(--border-color)',
                      }}
                    />
                  </div>

                  <MobileSimulator
                    data={{ settings }}
                    event={{ ...eventData, title: settings.welcome_title || eventData?.name || eventData?.title }}
                    previewView={previewView}
                    previewButtonState={containerTarget === 'botones' ? buttonState : undefined}
                  />
                </div>

                {/* BOTONES FLOTANTES INTEGRADOS CON LOS COLORES DEL PROYECTO */}
                {(mobileActiveView === 'general' || mobileActiveView === 'welcome') && (
                  <div 
                    className="absolute right-2 top-2 z-50 flex flex-col gap-1.5 p-1.5 rounded-xl border shadow-2xl shrink-0 backdrop-blur-md"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    {[
                      { id: 'precarga', label: 'Precarga', icon: Hourglass },
                      { id: 'qr', label: 'Escáner QR', icon: QrCode },
                      { id: 'welcome', label: 'Pantallas', icon: Tv },
                      { id: 'camera', label: 'Cámara', icon: Camera },
                      { id: 'gallery', label: 'Galería', icon: ImageIcon },
                    ].map((viewItem) => {
                      const Icon = viewItem.icon;
                      const isActive = previewView === viewItem.id;
                      return (
                        <button
                          key={viewItem.id}
                          type="button"
                          title={`Ver vista de ${viewItem.label}`}
                          onClick={() => setPreviewView(viewItem.id)}
                          className="p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                          style={{
                            backgroundColor: isActive ? 'var(--primary-accent)' : 'var(--bg-app)',
                            color: isActive ? '#ffffff' : 'var(--text-muted)',
                            border: `1px solid ${isActive ? 'var(--primary-accent)' : 'var(--border-color)'}`,
                            boxShadow: isActive ? '0 0 8px var(--primary-accent-light)' : 'none',
                          }}
                        >
                          <Icon size={15} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: PESTAÑAS Y CONTENIDO DE CONFIGURACIÓN (TOMA EL ANCHO SOBRANTE DINÁMICAMENTE) */}
          <div className="flex-1 space-y-3 pt-3 flex flex-col h-full overflow-hidden min-w-0">
            {/* BARRA DE PANTALLA Y PERSONALIZACIÓN MÓVIL (GENERAL, BIENVENIDA, CÁMARA, GALERÍA) Y BOTÓN DE GUARDAR */}
            <div
              className="px-4 flex items-center justify-between gap-4 text-white shadow-md relative h-9 z-20 overflow-visible rounded-lg shrink-0"
              style={{ backgroundColor: 'var(--primary-accent)' }}
            >
              <div className="flex items-center gap-4 flex-1 overflow-visible">
                <div className="border-r border-white/30 pr-4 py-0.5 shrink-0">
                  <span className="font-black text-sm uppercase tracking-wider">PANTALLA</span>
                </div>

                <div className="flex items-center gap-5 overflow-visible flex-1">
                  {[
                    { id: 'general', label: 'General', icon: Sparkles },
                    { id: 'welcome', label: 'Pantallas', icon: Tv },
                    { id: 'camera', label: 'Cámara', icon: Camera },
                    { id: 'gallery', label: 'Galería', icon: ImageIcon },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = mobileActiveView === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        title={!isActive ? tab.label : undefined}
                        onClick={() => handleTabChange(tab.id as any)}
                        className={`flex items-center gap-2 rounded-lg font-extrabold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-white text-[var(--primary-accent)] shadow-2xl text-sm px-5 py-2 -my-2.5 z-30 scale-105 border-[3px]'
                            : 'bg-white/20 text-white hover:bg-white/35 p-1.5'
                        }`}
                        style={isActive ? { borderColor: 'var(--primary-accent)' } : undefined}
                      >
                        <Icon size={isActive ? 18 : 17} />
                        {isActive && <span>{tab.label}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECCIÓN INDEPENDIENTE DE GUARDAR / ACTUALIZAR CONFIGURACIÓN */}
              <div className="shrink-0 flex items-center pl-3 border-l border-white/30">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="py-1 px-3.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md bg-white text-[var(--primary-accent)] hover:bg-slate-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={saveSuccess ? { backgroundColor: '#10B981', color: '#ffffff' } : undefined}
                  title="Guardar o actualizar configuración de la app móvil"
                >
                  {isSavingSettings ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check size={13} />
                      <span>¡Guardado!</span>
                    </>
                  ) : (
                    <>
                      <Save size={13} />
                      <span>Guardar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* CONTENEDOR CON SCROLL ÚNICAMENTE PARA EL CONTENIDO (FUENTES, CONTENEDOR, LOGOS, ETC.) */}
            <div className="overflow-y-auto pr-1 flex-1 space-y-4 pt-1">
                {/* 1. GENERAL TAB */}
                {mobileActiveView === 'general' && (
                  <div className="space-y-4">
                    {/* SUB-PESTAÑAS DE GENERAL: FUENTES, CONTENEDOR, LOGOS */}
                    <div className="flex p-1 rounded-xl border gap-1" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                      {[
                        { id: 'fuentes', label: 'Fuente', icon: Type },
                        { id: 'fondos', label: 'Contenedor', icon: Palette },
                        { id: 'logos', label: 'Logos', icon: ImageIcon },
                      ].map((sub) => {
                        const SubIcon = sub.icon;
                        const isSubActive = generalSubTab === sub.id;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => setGeneralSubTab(sub.id as any)}
                            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            style={{
                              backgroundColor: isSubActive ? 'var(--primary-accent-light)' : 'transparent',
                              color: isSubActive ? 'var(--primary-accent)' : 'var(--text-muted)',
                              border: isSubActive ? '1px solid var(--primary-accent)' : '1px solid transparent',
                            }}
                          >
                            <SubIcon size={14} />
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* FUENTES Y ESTILOS */}
                    {generalSubTab === 'fuentes' && (
                      <div className="space-y-2">
                        <div className="rounded-2xl p-3 border space-y-2 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                          <div className="pb-1 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                            <div className="flex items-center gap-2.5">
                              {textTarget === 'global_title' ? (
                                <Type size={22} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                              ) : (
                                <AlignJustify size={22} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                              )}
                              <div className="flex flex-col leading-tight">
                                <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                  {textTarget === 'global_title' ? 'Fuentes (Encabezado)' : 'Fuente (Contenido)'}
                                </h3>
                                <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                  Tipografía y Estilos
                                </span>
                              </div>
                            </div>

                            {/* PESTAÑAS ENCABEZADO / CONTENIDO EN EL LADO DERECHO */}
                            <div className="flex items-center gap-1 p-0.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                              {[
                                { id: 'global_title', label: 'Encabezado' },
                                { id: 'global_text', label: 'Contenido' },
                              ].map((targetItem) => {
                                const isTargetActive = textTarget === targetItem.id;
                                return (
                                  <button
                                    key={targetItem.id}
                                    type="button"
                                    onClick={() => setTextTarget(targetItem.id as any)}
                                    className="botab-item"
                                    style={{
                                      backgroundColor: isTargetActive ? 'var(--primary-accent)' : 'transparent',
                                      color: isTargetActive ? '#ffffff' : 'var(--text-muted)',
                                    }}
                                  >
                                    {targetItem.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* CONTROLES DE TIPOGRAFÍA EN UNA SOLA FILA ALINEADOS VERTICALMENTE */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
                            {/* FUENTE: MÁS ANCHO QUE LOS DEMÁS (COL-SPAN 2) */}
                            <div className="lg:col-span-2">
                              <FontPicker
                                label="Fuente"
                                value={settings[`${textTarget}_font_family`]}
                                onChange={(fontName) => updateSetting(`${textTarget}_font_family`, fontName)}
                              />
                            </div>

                            {/* TAMAÑO */}
                            <div className="lg:col-span-1">
                              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                Tamaño
                              </label>
                              <div
                                className="flex items-center h-9 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full shadow-2xs"
                                style={{
                                  backgroundColor: 'var(--bg-app)',
                                  borderColor: 'var(--border-color)',
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    const curr = parseInt(settings[`${textTarget}_font_size`] || '16');
                                    const nextVal = Math.max(8, curr - 1);
                                    updateSetting(`${textTarget}_font_size`, nextVal.toString());
                                  }}
                                  className="w-8 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                  style={{
                                    backgroundColor: 'var(--bg-card)',
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--primary-accent)',
                                  }}
                                  title="Disminuir tamaño"
                                >
                                  <Minus size={12} />
                                </button>

                                <div className="flex-1 flex items-center justify-center px-2">
                                  <input
                                    type="number"
                                    min={8}
                                    max={100}
                                    value={settings[`${textTarget}_font_size`] || 16}
                                    onChange={(e) => updateSetting(`${textTarget}_font_size`, e.target.value)}
                                    className="w-full h-full text-center bg-transparent outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    style={{ color: 'var(--text-main)' }}
                                  />
                                  <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>
                                    px
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const curr = parseInt(settings[`${textTarget}_font_size`] || '16');
                                    const nextVal = Math.min(100, curr + 1);
                                    updateSetting(`${textTarget}_font_size`, nextVal.toString());
                                  }}
                                  className="w-8 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                  style={{
                                    backgroundColor: 'var(--bg-card)',
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--primary-accent)',
                                  }}
                                  title="Aumentar tamaño"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>

                            {/* FORMATO DE TEXTO (NEGRITA, ITÁLICA, SUBRAYADO) */}
                            <div className="lg:col-span-1">
                              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                Formato
                              </label>
                              <div
                                className="flex items-center h-9 rounded-xl border p-0.5 gap-1 shadow-2xs"
                                style={{
                                  backgroundColor: 'var(--bg-app)',
                                  borderColor: 'var(--border-color)',
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => updateSetting(`${textTarget}_font_weight`, settings[`${textTarget}_font_weight`] === 'bold' ? 'normal' : 'bold')}
                                  className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                  style={{
                                    backgroundColor: settings[`${textTarget}_font_weight`] === 'bold' ? 'var(--primary-accent)' : 'transparent',
                                    color: settings[`${textTarget}_font_weight`] === 'bold' ? '#ffffff' : 'var(--text-muted)',
                                  }}
                                  title="Negrita"
                                >
                                  <Bold size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateSetting(`${textTarget}_font_style`, settings[`${textTarget}_font_style`] === 'italic' ? 'normal' : 'italic')}
                                  className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                  style={{
                                    backgroundColor: settings[`${textTarget}_font_style`] === 'italic' ? 'var(--primary-accent)' : 'transparent',
                                    color: settings[`${textTarget}_font_style`] === 'italic' ? '#ffffff' : 'var(--text-muted)',
                                  }}
                                  title="Itálica"
                                >
                                  <Italic size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateSetting(`${textTarget}_text_decoration`, settings[`${textTarget}_text_decoration`] === 'underline' ? 'none' : 'underline')}
                                  className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                  style={{
                                    backgroundColor: settings[`${textTarget}_text_decoration`] === 'underline' ? 'var(--primary-accent)' : 'transparent',
                                    color: settings[`${textTarget}_text_decoration`] === 'underline' ? '#ffffff' : 'var(--text-muted)',
                                  }}
                                  title="Subrayado"
                                >
                                  <Underline size={14} />
                                </button>
                              </div>
                            </div>

                            {/* ALINEACIÓN HORIZONTAL DE TEXTO */}
                            <div className="lg:col-span-1">
                              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                Alineación
                              </label>
                              <div
                                className="flex items-center h-9 rounded-xl border p-0.5 gap-1 shadow-2xs"
                                style={{
                                  backgroundColor: 'var(--bg-app)',
                                  borderColor: 'var(--border-color)',
                                }}
                              >
                                {[
                                  { id: 'left', icon: AlignLeft, title: 'Izquierda' },
                                  { id: 'center', icon: AlignCenter, title: 'Centro' },
                                  { id: 'right', icon: AlignRight, title: 'Derecha' },
                                  { id: 'justify', icon: AlignJustify, title: 'Justificado' },
                                ].map((align) => {
                                  const AlignIcon = align.icon;
                                  const isAlignActive = (settings[`${textTarget}_text_align`] || 'center') === align.id;
                                  return (
                                    <button
                                      key={align.id}
                                      type="button"
                                      onClick={() => updateSetting(`${textTarget}_text_align`, align.id)}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                      style={{
                                        backgroundColor: isAlignActive ? 'var(--primary-accent)' : 'transparent',
                                        color: isAlignActive ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                      title={align.title}
                                    >
                                      <AlignIcon size={14} />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* ESTILO DEL TEXTO */}
                            <div className="lg:col-span-1">
                              <StylePickerPopover
                                label="Estilo del texto"
                                elementType="text"
                                eventColors={eventColors.length > 0 ? eventColors : ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B']}
                                eventColorImage={eventColorImage}
                                styleConfig={{
                                  fillType: 'color',
                                  fillColor: settings[`${textTarget}_font_color`] || '#ffffff',
                                  strokeActive: settings[`${textTarget}_stroke_active`] || false,
                                  strokeColor: settings[`${textTarget}_stroke_color`] || '#000000',
                                  strokeWidth: parseInt(settings[`${textTarget}_stroke_width`] || '2'),
                                  strokeType: settings[`${textTarget}_stroke_type`] || 'OUT',
                                  shadowActive: settings[`${textTarget}_shadow_active`] || false,
                                  shadowColor: settings[`${textTarget}_shadow_color`] || '#000000',
                                  shadowBlur: parseInt(settings[`${textTarget}_shadow_blur`] || '8'),
                                }}
                                onChange={(updated) => {
                                  if (updated.fillColor) updateSetting(`${textTarget}_font_color`, updated.fillColor);
                                  if (updated.strokeActive !== undefined) updateSetting(`${textTarget}_stroke_active`, updated.strokeActive);
                                  if (updated.strokeColor) updateSetting(`${textTarget}_stroke_color`, updated.strokeColor);
                                  if (updated.strokeWidth !== undefined) updateSetting(`${textTarget}_stroke_width`, updated.strokeWidth.toString());
                                  if (updated.strokeType) updateSetting(`${textTarget}_stroke_type`, updated.strokeType);
                                  if (updated.shadowActive !== undefined) updateSetting(`${textTarget}_shadow_active`, updated.shadowActive);
                                  if (updated.shadowColor) updateSetting(`${textTarget}_shadow_color`, updated.shadowColor);
                                  if (updated.shadowBlur !== undefined) updateSetting(`${textTarget}_shadow_blur`, updated.shadowBlur.toString());
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* 3. BOTONES */}
                        <div className="rounded-2xl p-3 border space-y-2 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                          <div className="pb-1 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                            <div className="flex items-center gap-2.5">
                              <MousePointer2 size={22} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                              <div className="flex flex-col leading-tight">
                                <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                  {buttonState === 'normal' ? 'Botones (Normal)' : 'Botones (Sobre)'}
                                </h3>
                                <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                  Tipografía y Estilos
                                </span>
                              </div>
                            </div>

                            {/* PESTAÑAS NORMAL / SOBRE EN EL LADO DERECHO */}
                            <div className="flex items-center gap-1 p-0.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                              {[
                                { id: 'normal', label: 'Normal' },
                                { id: 'hover', label: 'Sobre' },
                              ].map((modeItem) => {
                                const isModeActive = buttonState === modeItem.id;
                                return (
                                  <button
                                    key={modeItem.id}
                                    type="button"
                                    onClick={() => setButtonState(modeItem.id as any)}
                                    className="botab-item"
                                    style={{
                                      backgroundColor: isModeActive ? 'var(--primary-accent)' : 'transparent',
                                      color: isModeActive ? '#ffffff' : 'var(--text-muted)',
                                    }}
                                  >
                                    {modeItem.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
                            <div className="lg:col-span-2">
                              <FontPicker
                                label="Fuente"
                                value={settings['global_button_font_family']}
                                onChange={(fontName) => updateSetting('global_button_font_family', fontName)}
                              />
                            </div>

                            <div className="lg:col-span-1">
                              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                Tamaño
                              </label>
                              <div
                                className="flex items-center h-9 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full shadow-2xs"
                                style={{
                                  backgroundColor: 'var(--bg-app)',
                                  borderColor: 'var(--border-color)',
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    const curr = parseInt(settings['global_button_font_size'] || '14');
                                    const nextVal = Math.max(8, curr - 1);
                                    updateSetting('global_button_font_size', nextVal.toString());
                                  }}
                                  className="w-8 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                  style={{
                                    backgroundColor: 'var(--bg-card)',
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--primary-accent)',
                                  }}
                                  title="Disminuir tamaño"
                                >
                                  <Minus size={12} />
                                </button>

                                <div className="flex-1 flex items-center justify-center px-2">
                                  <input
                                    type="number"
                                    min={8}
                                    max={100}
                                    value={settings['global_button_font_size'] || 14}
                                    onChange={(e) => updateSetting('global_button_font_size', e.target.value)}
                                    className="w-full h-full text-center bg-transparent outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    style={{ color: 'var(--text-main)' }}
                                  />
                                  <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>
                                    px
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const curr = parseInt(settings['global_button_font_size'] || '14');
                                    const nextVal = Math.min(100, curr + 1);
                                    updateSetting('global_button_font_size', nextVal.toString());
                                  }}
                                  className="w-8 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                  style={{
                                    backgroundColor: 'var(--bg-card)',
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--primary-accent)',
                                  }}
                                  title="Aumentar tamaño"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>

                            <div className="lg:col-span-1">
                              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                Formato
                              </label>
                              <div
                                className="flex items-center h-9 rounded-xl border p-0.5 gap-1 shadow-2xs"
                                style={{
                                  backgroundColor: 'var(--bg-app)',
                                  borderColor: 'var(--border-color)',
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => updateSetting('global_button_font_weight', settings['global_button_font_weight'] === 'bold' ? 'normal' : 'bold')}
                                  className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                  style={{
                                    backgroundColor: settings['global_button_font_weight'] === 'bold' ? 'var(--primary-accent)' : 'transparent',
                                    color: settings['global_button_font_weight'] === 'bold' ? '#ffffff' : 'var(--text-muted)',
                                  }}
                                  title="Negrita"
                                >
                                  <Bold size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateSetting('global_button_font_style', settings['global_button_font_style'] === 'italic' ? 'normal' : 'italic')}
                                  className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                  style={{
                                    backgroundColor: settings['global_button_font_style'] === 'italic' ? 'var(--primary-accent)' : 'transparent',
                                    color: settings['global_button_font_style'] === 'italic' ? '#ffffff' : 'var(--text-muted)',
                                  }}
                                  title="Itálica"
                                >
                                  <Italic size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateSetting('global_button_text_decoration', settings['global_button_text_decoration'] === 'underline' ? 'none' : 'underline')}
                                  className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                  style={{
                                    backgroundColor: settings['global_button_text_decoration'] === 'underline' ? 'var(--primary-accent)' : 'transparent',
                                    color: settings['global_button_text_decoration'] === 'underline' ? '#ffffff' : 'var(--text-muted)',
                                  }}
                                  title="Subrayado"
                                >
                                  <Underline size={14} />
                                </button>
                              </div>
                            </div>

                            <div className="lg:col-span-1">
                              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                Alineación
                              </label>
                              <div
                                className="flex items-center h-9 rounded-xl border p-0.5 gap-1 shadow-2xs"
                                style={{
                                  backgroundColor: 'var(--bg-app)',
                                  borderColor: 'var(--border-color)',
                                }}
                              >
                                {[
                                  { id: 'left', icon: AlignLeft, title: 'Izquierda' },
                                  { id: 'center', icon: AlignCenter, title: 'Centro' },
                                  { id: 'right', icon: AlignRight, title: 'Derecha' },
                                  { id: 'justify', icon: AlignJustify, title: 'Justificado' },
                                ].map((align) => {
                                  const AlignIcon = align.icon;
                                  const isAlignActive = (settings['global_button_text_align'] || 'center') === align.id;
                                  return (
                                    <button
                                      key={align.id}
                                      type="button"
                                      onClick={() => updateSetting('global_button_text_align', align.id)}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                      style={{
                                        backgroundColor: isAlignActive ? 'var(--primary-accent)' : 'transparent',
                                        color: isAlignActive ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                      title={align.title}
                                    >
                                      <AlignIcon size={14} />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="lg:col-span-1">
                              <StylePickerPopover
                                label="Estilo del texto"
                                elementType="text"
                                eventColors={eventColors.length > 0 ? eventColors : ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B']}
                                eventColorImage={eventColorImage}
                                styleConfig={{
                                  fillType: 'color',
                                  fillColor: settings['global_button_font_color'] || '#ffffff',
                                  strokeActive: settings['global_button_stroke_active'] || false,
                                  strokeColor: settings['global_button_stroke_color'] || '#000000',
                                  strokeWidth: parseInt(settings['global_button_stroke_width'] || '2'),
                                  strokeType: settings['global_button_stroke_type'] || 'OUT',
                                  shadowActive: settings['global_button_shadow_active'] || false,
                                  shadowColor: settings['global_button_shadow_color'] || '#000000',
                                  shadowBlur: parseInt(settings['global_button_shadow_blur'] || '8'),
                                }}
                                onChange={(updated) => {
                                  if (updated.fillColor) updateSetting('global_button_font_color', updated.fillColor);
                                  if (updated.strokeActive !== undefined) updateSetting('global_button_stroke_active', updated.strokeActive);
                                  if (updated.strokeColor) updateSetting('global_button_stroke_color', updated.strokeColor);
                                  if (updated.strokeWidth !== undefined) updateSetting('global_button_stroke_width', updated.strokeWidth.toString());
                                  if (updated.strokeType) updateSetting('global_button_stroke_type', updated.strokeType);
                                  if (updated.shadowActive !== undefined) updateSetting('global_button_shadow_active', updated.shadowActive);
                                  if (updated.shadowColor) updateSetting('global_button_shadow_color', updated.shadowColor);
                                  if (updated.shadowBlur !== undefined) updateSetting('global_button_shadow_blur', updated.shadowBlur.toString());
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}


                    {/* CONTENEDOR */}
                    {generalSubTab === 'fondos' && (() => {
                      const activeLeftTarget = containerTarget === 'botones' ? 'fondo' : containerTarget;
                      const leftPrefix = activeLeftTarget === 'fondo' ? 'screen' : activeLeftTarget === 'mensaje' ? 'container' : 'bar';
                      const leftImageKey = `${leftPrefix}_image_url`;
                      const leftBgTypeKey = `${leftPrefix}_bg_type`;
                      const leftVideoRotateKey = `${leftPrefix}_video_rotate`;
                      const leftImageUrl = settings[leftImageKey] || '';
                      const leftBgType = settings[leftBgTypeKey] || 'color';
                      const leftVideoRotate = !!settings[leftVideoRotateKey];

                      const buttonPrefix = buttonState === 'hover' ? 'button_hover' : 'button';
                      const buttonImageKey = `${buttonPrefix}_image_url`;
                      const buttonBgTypeKey = `${buttonPrefix}_bg_type`;
                      const buttonVideoRotateKey = `${buttonPrefix}_video_rotate`;
                      const buttonImageUrl = settings[buttonImageKey] || '';
                      const buttonBgType = settings[buttonBgTypeKey] || 'color';
                      const buttonVideoRotate = !!settings[buttonVideoRotateKey];

                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* COLUMNA IZQUIERDA: CONTENEDORES (FONDO, MENSAJE, BARRA) */}
                          <div className="rounded-2xl p-3 border space-y-3 shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                            <div>
                              <div className="pb-2 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-2">
                                  <Palette size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                  <div className="flex flex-col leading-tight">
                                    <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                      Contenedores ({activeLeftTarget === 'fondo' ? 'Fondo' : activeLeftTarget === 'mensaje' ? 'Mensaje' : 'Barra'})
                                    </h3>
                                    <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                      Estilos y fondos de pantalla
                                    </span>
                                  </div>
                                </div>

                                {/* PESTAÑAS FONDO / MENSAJE / BARRA */}
                                <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                  {[
                                    { id: 'fondo', label: 'Fondo' },
                                    { id: 'mensaje', label: 'Mensajes' },
                                    { id: 'barra', label: 'Barra' },
                                  ].map((cTarget) => {
                                    const isCTargetActive = activeLeftTarget === cTarget.id;
                                    return (
                                      <button
                                        key={cTarget.id}
                                        type="button"
                                        onClick={() => setContainerTarget(cTarget.id as any)}
                                        className="px-2 py-0.5 text-[11px] font-bold rounded transition-all cursor-pointer"
                                        style={{
                                          backgroundColor: isCTargetActive ? 'var(--primary-accent)' : 'transparent',
                                          color: isCTargetActive ? '#ffffff' : 'var(--text-muted)',
                                        }}
                                      >
                                        {cTarget.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="space-y-3 pt-2">
                                {/* SUBIR IMAGEN / VIDEO DEL CONTENEDOR */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                      Imagen / Video ({activeLeftTarget === 'fondo' ? 'Fondo' : activeLeftTarget === 'mensaje' ? 'Mensaje' : 'Barra'})
                                    </label>
                                    <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer select-none" style={{ color: 'var(--text-muted)' }} title="Rotar orientación de video 90° en la pantalla del teléfono">
                                      <input
                                        type="checkbox"
                                        checked={leftVideoRotate}
                                        onChange={(e) => updateSetting(leftVideoRotateKey, e.target.checked)}
                                        className="rounded border-gray-400 focus:ring-0 h-3 w-3 cursor-pointer"
                                        style={{ accentColor: 'var(--primary-accent)' }}
                                      />
                                      <span>Rotar Video</span>
                                    </label>
                                  </div>
                                  
                                  <div
                                    className="border-2 border-dashed rounded-2xl p-2 text-center flex flex-col items-center justify-center transition-all relative overflow-hidden group h-[120px] min-h-[120px]"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                                  >
                                    {leftImageUrl ? (
                                      <div className="relative w-full h-full rounded-xl overflow-hidden group bg-black/40 flex items-center justify-center">
                                        {leftBgType === 'video' || String(leftImageUrl).startsWith('data:video') || String(leftImageUrl).match(/\.(mp4|webm|ogg)$/i) ? (
                                          <video
                                            src={leftImageUrl}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full h-full object-contain"
                                          />
                                        ) : (
                                          <img
                                            src={leftImageUrl}
                                            alt="Imagen de fondo"
                                            className="w-full h-full object-contain"
                                          />
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                          <label className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/40 cursor-pointer transition-colors" title="Cambiar archivo">
                                            <Upload size={16} />
                                            <input
                                              type="file"
                                              accept="image/*,video/*"
                                              className="hidden"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  const isVideo = file.type.startsWith('video/');
                                                  const reader = new FileReader();
                                                  reader.onload = (ev) => {
                                                    updateSetting(leftImageKey, ev.target?.result);
                                                    updateSetting(leftBgTypeKey, isVideo ? 'video' : 'image');
                                                  };
                                                  reader.readAsDataURL(file);
                                                }
                                              }}
                                            />
                                          </label>
                                          <button
                                            type="button"
                                            onClick={() => updateSetting(leftImageKey, '')}
                                            className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-600 transition-colors"
                                            title="Eliminar archivo"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                                        <div className="p-2.5 rounded-full mb-1.5" style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}>
                                          <Upload size={18} />
                                        </div>
                                        <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Subir Imagen / Video</span>
                                        <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>PNG, JPG, MP4 o WEBM</span>
                                        <input
                                          type="file"
                                          accept="image/*,video/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const isVideo = file.type.startsWith('video/');
                                              const reader = new FileReader();
                                              reader.onload = (ev) => {
                                                updateSetting(leftImageKey, ev.target?.result);
                                                updateSetting(leftBgTypeKey, isVideo ? 'video' : 'image');
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                        />
                                      </label>
                                    )}
                                  </div>
                                </div>

                                {/* CONTROLES IZQUIERDA: ESTILO, REDONDEZ, GLASS */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end pt-1">
                                  {/* Estilo */}
                                  <div>
                                    <StylePickerPopover
                                      label="Estilo"
                                      elementType="box"
                                      eventColors={eventColors.length > 0 ? eventColors : ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B']}
                                      eventColorImage={eventColorImage}
                                      styleConfig={{
                                        backgroundColor: settings[`${leftPrefix}_bg_type`] === 'gradient' && settings[`${leftPrefix}_gradient_data`]
                                          ? (typeof settings[`${leftPrefix}_gradient_data`] === 'string' ? settings[`${leftPrefix}_gradient_data`] : settings[`${leftPrefix}_bg_color`] || '#E07A5F')
                                          : (settings[`${leftPrefix}_bg_color`] || '#E07A5F'),
                                        borderWidth: settings[`${leftPrefix}_border_width`] ?? 0,
                                        borderStyle: settings[`${leftPrefix}_border_style`] || 'solid',
                                        borderColor: settings[`${leftPrefix}_border_color`] || '#E07A5F',
                                        borderRadius: settings[`${leftPrefix}_border_radius`] ?? (activeLeftTarget === 'mensaje' ? 24 : 12),
                                        shadowColor: settings[`${leftPrefix}_shadow_color`] || '#000000',
                                        shadowBlur: settings[`${leftPrefix}_shadow_blur`] ?? 0,
                                        shadowOffsetX: settings[`${leftPrefix}_shadow_offset_x`] ?? 0,
                                        shadowOffsetY: settings[`${leftPrefix}_shadow_offset_y`] ?? 0,
                                      }}
                                      onChange={(updated) => {
                                        const prefix = leftPrefix;
                                        const bgPrefix = `${prefix}_bg`;
                                        const gradKey = `${prefix}_gradient_data`;

                                        const selectedColor = updated.backgroundColor || updated.fillColor;
                                        const selectedGradient = updated.fillGradient;

                                        if (updated.fillType === 'gradient' && selectedGradient) {
                                          updateSetting(`${bgPrefix}_type`, 'gradient');
                                          updateSetting(gradKey, selectedGradient);
                                        } else if (selectedColor) {
                                          if (typeof selectedColor === 'string' && selectedColor.includes('gradient')) {
                                            updateSetting(`${bgPrefix}_type`, 'gradient');
                                            updateSetting(gradKey, selectedColor);
                                          } else {
                                            updateSetting(`${bgPrefix}_type`, 'color');
                                            updateSetting(`${bgPrefix}_color`, selectedColor);
                                          }
                                        }

                                        if (updated.borderWidth !== undefined) updateSetting(`${prefix}_border_width`, updated.borderWidth);
                                        if (updated.borderStyle !== undefined) updateSetting(`${prefix}_border_style`, updated.borderStyle);
                                        if (updated.borderColor !== undefined) updateSetting(`${prefix}_border_color`, updated.borderColor);
                                        if (updated.borderRadius !== undefined) updateSetting(`${prefix}_border_radius`, updated.borderRadius);
                                        if (updated.shadowColor !== undefined) updateSetting(`${prefix}_shadow_color`, updated.shadowColor);
                                        if (updated.shadowBlur !== undefined) updateSetting(`${prefix}_shadow_blur`, updated.shadowBlur);
                                        if (updated.shadowOffsetX !== undefined) updateSetting(`${prefix}_shadow_offset_x`, updated.shadowOffsetX);
                                        if (updated.shadowOffsetY !== undefined) updateSetting(`${prefix}_shadow_offset_y`, updated.shadowOffsetY);
                                      }}
                                    />
                                  </div>

                                  {/* Redondez */}
                                  <div>
                                    <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                      Redondez
                                    </label>
                                    <div
                                      className="flex items-center h-9 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full shadow-2xs"
                                      style={{
                                        backgroundColor: 'var(--bg-app)',
                                        borderColor: 'var(--border-color)',
                                      }}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const key = `${leftPrefix}_border_radius`;
                                          const curr = parseInt(settings[key] ?? (activeLeftTarget === 'mensaje' ? '24' : '12'));
                                          const nextVal = Math.max(0, curr - 2);
                                          updateSetting(key, nextVal);
                                        }}
                                        className="w-8 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                        style={{
                                          backgroundColor: 'var(--bg-card)',
                                          borderColor: 'var(--border-color)',
                                          color: 'var(--primary-accent)',
                                        }}
                                        title="Disminuir redondez"
                                      >
                                        <Minus size={12} />
                                      </button>

                                      <div className="flex-1 flex items-center justify-center px-1">
                                        <input
                                          type="number"
                                          min={0}
                                          max={100}
                                          value={settings[`${leftPrefix}_border_radius`] ?? (activeLeftTarget === 'mensaje' ? 24 : 12)}
                                          onChange={(e) => {
                                            const key = `${leftPrefix}_border_radius`;
                                            updateSetting(key, parseInt(e.target.value) || 0);
                                          }}
                                          className="w-full h-full text-center bg-transparent outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                          style={{ color: 'var(--text-main)' }}
                                        />
                                        <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>
                                          px
                                        </span>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          const key = `${leftPrefix}_border_radius`;
                                          const curr = parseInt(settings[key] ?? (activeLeftTarget === 'mensaje' ? '24' : '12'));
                                          const nextVal = Math.min(100, curr + 2);
                                          updateSetting(key, nextVal);
                                        }}
                                        className="w-8 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                        style={{
                                          backgroundColor: 'var(--bg-card)',
                                          borderColor: 'var(--border-color)',
                                          color: 'var(--primary-accent)',
                                        }}
                                        title="Aumentar redondez"
                                      >
                                        <Plus size={12} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Glass */}
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                        Glass ({settings[`${leftPrefix}_bg_opacity`] ?? 100}%)
                                      </label>
                                      <label className="relative flex items-center cursor-pointer shrink-0 select-none">
                                        <input
                                          type="checkbox"
                                          checked={settings[`${leftPrefix}_glass_enabled`] ?? true}
                                          onChange={(e) => {
                                            const key = `${leftPrefix}_glass_enabled`;
                                            updateSetting(key, e.target.checked);
                                          }}
                                          className="sr-only peer"
                                        />
                                        <div
                                          className="w-4 h-4 rounded border flex items-center justify-center transition-all peer-checked:border-[var(--primary-accent)] peer-checked:bg-[var(--primary-accent)]"
                                          style={{
                                            borderColor: (settings[`${leftPrefix}_glass_enabled`] ?? true) ? 'var(--primary-accent)' : 'var(--border-color)',
                                            backgroundColor: (settings[`${leftPrefix}_glass_enabled`] ?? true) ? 'var(--primary-accent)' : 'var(--bg-card)',
                                          }}
                                        >
                                          {(settings[`${leftPrefix}_glass_enabled`] ?? true) && (
                                            <Check size={11} className="text-white stroke-[3]" />
                                          )}
                                        </div>
                                      </label>
                                    </div>

                                    <div
                                      className={`flex items-center h-9 rounded-xl border px-3 transition-opacity ${
                                        !(settings[`${leftPrefix}_glass_enabled`] ?? true) ? 'opacity-40 pointer-events-none' : ''
                                      }`}
                                      style={{
                                        backgroundColor: 'var(--bg-app)',
                                        borderColor: 'var(--border-color)',
                                      }}
                                    >
                                      <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={settings[`${leftPrefix}_bg_opacity`] ?? 100}
                                        onChange={(e) => {
                                          const key = `${leftPrefix}_bg_opacity`;
                                          updateSetting(key, parseInt(e.target.value));
                                        }}
                                        className="w-full h-1.5 rounded-lg cursor-pointer"
                                        style={{
                                          accentColor: 'var(--primary-accent)',
                                        }}
                                        title="Opacidad del vidrio"
                                        disabled={!(settings[`${leftPrefix}_glass_enabled`] ?? true)}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* COLUMNA DERECHA: BOTONES (NORMAL / SOBRE) */}
                          <div className="rounded-2xl p-3 border space-y-3 shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                            <div>
                              <div className="pb-2 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-2">
                                  <MousePointerClick size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                  <div className="flex flex-col leading-tight">
                                    <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                      Botones ({buttonState === 'hover' ? 'Sobre' : 'Normal'})
                                    </h3>
                                    <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                      Estilos y efectos de botón
                                    </span>
                                  </div>
                                </div>

                                {/* PESTAÑAS NORMAL / SOBRE */}
                                <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                  {[
                                    { id: 'normal', label: 'Normal' },
                                    { id: 'hover', label: 'Sobre' },
                                  ].map((modeItem) => {
                                    const isModeActive = buttonState === modeItem.id;
                                    return (
                                      <button
                                        key={modeItem.id}
                                        type="button"
                                        onClick={() => setButtonState(modeItem.id as any)}
                                        className="botab-item"
                                        style={{
                                          backgroundColor: isModeActive ? 'var(--primary-accent)' : 'transparent',
                                          color: isModeActive ? '#ffffff' : 'var(--text-muted)',
                                        }}
                                      >
                                        {modeItem.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="space-y-3 pt-2">
                                {/* SUBIR IMAGEN / VIDEO DEL BOTÓN */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                      Imagen / Video ({buttonState === 'hover' ? 'Sobre' : 'Normal'})
                                    </label>
                                    <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer select-none" style={{ color: 'var(--text-muted)' }} title="Rotar orientación de video 90° en el botón">
                                      <input
                                        type="checkbox"
                                        checked={buttonVideoRotate}
                                        onChange={(e) => updateSetting(buttonVideoRotateKey, e.target.checked)}
                                        className="rounded border-gray-400 focus:ring-0 h-3 w-3 cursor-pointer"
                                        style={{ accentColor: 'var(--primary-accent)' }}
                                      />
                                      <span>Rotar Video</span>
                                    </label>
                                  </div>
                                  
                                  <div
                                    className="border-2 border-dashed rounded-2xl p-2 text-center flex flex-col items-center justify-center transition-all relative overflow-hidden group h-[120px] min-h-[120px]"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                                  >
                                    {buttonImageUrl ? (
                                      <div className="relative w-full h-full rounded-xl overflow-hidden group bg-black/40 flex items-center justify-center">
                                        {buttonBgType === 'video' || String(buttonImageUrl).startsWith('data:video') || String(buttonImageUrl).match(/\.(mp4|webm|ogg)$/i) ? (
                                          <video
                                            src={buttonImageUrl}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full h-full object-contain"
                                          />
                                        ) : (
                                          <img
                                            src={buttonImageUrl}
                                            alt="Imagen del botón"
                                            className="w-full h-full object-contain"
                                          />
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                          <label className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/40 cursor-pointer transition-colors" title="Cambiar archivo">
                                            <Upload size={16} />
                                            <input
                                              type="file"
                                              accept="image/*,video/*"
                                              className="hidden"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  const isVideo = file.type.startsWith('video/');
                                                  const reader = new FileReader();
                                                  reader.onload = (ev) => {
                                                    updateSetting(buttonImageKey, ev.target?.result);
                                                    updateSetting(buttonBgTypeKey, isVideo ? 'video' : 'image');
                                                  };
                                                  reader.readAsDataURL(file);
                                                }
                                              }}
                                            />
                                          </label>
                                          <button
                                            type="button"
                                            onClick={() => updateSetting(buttonImageKey, '')}
                                            className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-600 transition-colors"
                                            title="Eliminar archivo"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                                        <div className="p-2.5 rounded-full mb-1.5" style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}>
                                          <Upload size={18} />
                                        </div>
                                        <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Subir Imagen / Video</span>
                                        <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>PNG, JPG, MP4 o WEBM</span>
                                        <input
                                          type="file"
                                          accept="image/*,video/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const isVideo = file.type.startsWith('video/');
                                              const reader = new FileReader();
                                              reader.onload = (ev) => {
                                                updateSetting(buttonImageKey, ev.target?.result);
                                                updateSetting(buttonBgTypeKey, isVideo ? 'video' : 'image');
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                        />
                                      </label>
                                    )}
                                  </div>
                                </div>

                                {/* CONTROLES DERECHA: ESTILO, REDONDEZ, GLASS */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end pt-1">
                                  {/* Estilo */}
                                  <div>
                                    <StylePickerPopover
                                      label={`Estilo (${buttonState === 'hover' ? 'Sobre' : 'Normal'})`}
                                      elementType="box"
                                      eventColors={eventColors.length > 0 ? eventColors : ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B']}
                                      eventColorImage={eventColorImage}
                                      styleConfig={{
                                        backgroundColor: settings[`${buttonPrefix}_bg_type`] === 'gradient' && settings[`${buttonPrefix}_gradient_data`]
                                          ? (typeof settings[`${buttonPrefix}_gradient_data`] === 'string' ? settings[`${buttonPrefix}_gradient_data`] : settings[`${buttonPrefix}_bg_color`] || '#E07A5F')
                                          : (settings[`${buttonPrefix}_bg_color`] || '#E07A5F'),
                                        borderWidth: settings[`${buttonPrefix}_border_width`] ?? 0,
                                        borderStyle: settings[`${buttonPrefix}_border_style`] || 'solid',
                                        borderColor: settings[`${buttonPrefix}_border_color`] || '#E07A5F',
                                        borderRadius: settings[`${buttonPrefix}_border_radius`] ?? 12,
                                        shadowColor: settings[`${buttonPrefix}_shadow_color`] || '#000000',
                                        shadowBlur: settings[`${buttonPrefix}_shadow_blur`] ?? 0,
                                        shadowOffsetX: settings[`${buttonPrefix}_shadow_offset_x`] ?? 0,
                                        shadowOffsetY: settings[`${buttonPrefix}_shadow_offset_y`] ?? 0,
                                      }}
                                      onChange={(updated) => {
                                        const prefix = buttonPrefix;
                                        const bgPrefix = `${prefix}_bg`;
                                        const gradKey = `${prefix}_gradient_data`;

                                        const selectedColor = updated.backgroundColor || updated.fillColor;
                                        const selectedGradient = updated.fillGradient;

                                        if (updated.fillType === 'gradient' && selectedGradient) {
                                          updateSetting(`${bgPrefix}_type`, 'gradient');
                                          updateSetting(gradKey, selectedGradient);
                                        } else if (selectedColor) {
                                          if (typeof selectedColor === 'string' && selectedColor.includes('gradient')) {
                                            updateSetting(`${bgPrefix}_type`, 'gradient');
                                            updateSetting(gradKey, selectedColor);
                                          } else {
                                            updateSetting(`${bgPrefix}_type`, 'color');
                                            updateSetting(`${bgPrefix}_color`, selectedColor);
                                          }
                                        }

                                        if (updated.borderWidth !== undefined) updateSetting(`${prefix}_border_width`, updated.borderWidth);
                                        if (updated.borderStyle !== undefined) updateSetting(`${prefix}_border_style`, updated.borderStyle);
                                        if (updated.borderColor !== undefined) updateSetting(`${prefix}_border_color`, updated.borderColor);
                                        if (updated.borderRadius !== undefined) updateSetting(`${prefix}_border_radius`, updated.borderRadius);
                                        if (updated.shadowColor !== undefined) updateSetting(`${prefix}_shadow_color`, updated.shadowColor);
                                        if (updated.shadowBlur !== undefined) updateSetting(`${prefix}_shadow_blur`, updated.shadowBlur);
                                        if (updated.shadowOffsetX !== undefined) updateSetting(`${prefix}_shadow_offset_x`, updated.shadowOffsetX);
                                        if (updated.shadowOffsetY !== undefined) updateSetting(`${prefix}_shadow_offset_y`, updated.shadowOffsetY);
                                      }}
                                    />
                                  </div>

                                  {/* Redondez */}
                                  <div>
                                    <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                      Redondez
                                    </label>
                                    <div
                                      className="flex items-center h-9 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full shadow-2xs"
                                      style={{
                                        backgroundColor: 'var(--bg-app)',
                                        borderColor: 'var(--border-color)',
                                      }}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const key = `${buttonPrefix}_border_radius`;
                                          const curr = parseInt(settings[key] ?? '12');
                                          const nextVal = Math.max(0, curr - 2);
                                          updateSetting(key, nextVal);
                                        }}
                                        className="w-8 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                        style={{
                                          backgroundColor: 'var(--bg-card)',
                                          borderColor: 'var(--border-color)',
                                          color: 'var(--primary-accent)',
                                        }}
                                        title="Disminuir redondez"
                                      >
                                        <Minus size={12} />
                                      </button>

                                      <div className="flex-1 flex items-center justify-center px-1">
                                        <input
                                          type="number"
                                          min={0}
                                          max={100}
                                          value={settings[`${buttonPrefix}_border_radius`] ?? 12}
                                          onChange={(e) => {
                                            const key = `${buttonPrefix}_border_radius`;
                                            updateSetting(key, parseInt(e.target.value) || 0);
                                          }}
                                          className="w-full h-full text-center bg-transparent outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                          style={{ color: 'var(--text-main)' }}
                                        />
                                        <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>
                                          px
                                        </span>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          const key = `${buttonPrefix}_border_radius`;
                                          const curr = parseInt(settings[key] ?? '12');
                                          const nextVal = Math.min(100, curr + 2);
                                          updateSetting(key, nextVal);
                                        }}
                                        className="w-8 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                        style={{
                                          backgroundColor: 'var(--bg-card)',
                                          borderColor: 'var(--border-color)',
                                          color: 'var(--primary-accent)',
                                        }}
                                        title="Aumentar redondez"
                                      >
                                        <Plus size={12} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Glass */}
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                        Glass ({settings[`${buttonPrefix}_bg_opacity`] ?? 100}%)
                                      </label>
                                      <label className="relative flex items-center cursor-pointer shrink-0 select-none">
                                        <input
                                          type="checkbox"
                                          checked={settings[`${buttonPrefix}_glass_enabled`] ?? true}
                                          onChange={(e) => {
                                            const key = `${buttonPrefix}_glass_enabled`;
                                            updateSetting(key, e.target.checked);
                                          }}
                                          className="sr-only peer"
                                        />
                                        <div
                                          className="w-4 h-4 rounded border flex items-center justify-center transition-all peer-checked:border-[var(--primary-accent)] peer-checked:bg-[var(--primary-accent)]"
                                          style={{
                                            borderColor: (settings[`${buttonPrefix}_glass_enabled`] ?? true) ? 'var(--primary-accent)' : 'var(--border-color)',
                                            backgroundColor: (settings[`${buttonPrefix}_glass_enabled`] ?? true) ? 'var(--primary-accent)' : 'var(--bg-card)',
                                          }}
                                        >
                                          {(settings[`${buttonPrefix}_glass_enabled`] ?? true) && (
                                            <Check size={11} className="text-white stroke-[3]" />
                                          )}
                                        </div>
                                      </label>
                                    </div>

                                    <div
                                      className={`flex items-center h-9 rounded-xl border px-3 transition-opacity ${
                                        !(settings[`${buttonPrefix}_glass_enabled`] ?? true) ? 'opacity-40 pointer-events-none' : ''
                                      }`}
                                      style={{
                                        backgroundColor: 'var(--bg-app)',
                                        borderColor: 'var(--border-color)',
                                      }}
                                    >
                                      <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={settings[`${buttonPrefix}_bg_opacity`] ?? 100}
                                        onChange={(e) => {
                                          const key = `${buttonPrefix}_bg_opacity`;
                                          updateSetting(key, parseInt(e.target.value));
                                        }}
                                        className="w-full h-1.5 rounded-lg cursor-pointer"
                                        style={{
                                          accentColor: 'var(--primary-accent)',
                                        }}
                                        title="Opacidad del vidrio"
                                        disabled={!(settings[`${buttonPrefix}_glass_enabled`] ?? true)}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* LOGOS SUB-TAB */}
                    {generalSubTab === 'logos' && (() => {
                      const displayEventLogo = settings.event_logo_url || eventData?.logo_url || (eventData?.logo ? `/storage/${eventData.logo}` : null);
                      const displayPartnerLogo = settings.partner_logo_url 
                        || eventData?.partner_logo_url 
                        || (eventData?.partner_logo ? `/storage/${eventData.partner_logo}` : null)
                        || eventData?.partner?.logo_url
                        || (eventData?.partner?.logo ? `/storage/${eventData.partner.logo}` : null)
                        || eventData?.branding?.logo;

                      // Determinar pantalla activa a configurar para Logos
                      const activeState = activeLogoState;
                      const stateLabels: Record<string, string> = { welcome: 'Bienvenida', camera: 'Cámara', gallery: 'Galería' };

                      // Helper para leer un ajuste con fallback al valor legacy
                      const getSettingVal = (type: 'event' | 'partner', field: string, defaultVal: any) => {
                        const key = `${type}_logo_${activeState}_${field}`;
                        if (settings[key] !== undefined) return settings[key];
                        const legacyKey = `${type}_logo_${field}`;
                        if (settings[legacyKey] !== undefined) return settings[legacyKey];
                        return defaultVal;
                      };

                      // Helper para actualizar ajuste específico de la pantalla activa
                      const updateLogoSetting = (type: 'event' | 'partner', field: string, value: any) => {
                        updateSetting(`${type}_logo_${activeState}_${field}`, value);
                      };

                      // Valores actuales para la pantalla activa
                      const eventV = getSettingVal('event', 'position_v', 'top');
                      const eventH = getSettingVal('event', 'position_h', 'center');
                      const eventSize = getSettingVal('event', 'size', 60);
                      const eventUnit = getSettingVal('event', 'unit', 'px');
                      const eventEnabled = settings[`event_logo_show_${activeState}`] ?? settings[`event_logo_${activeState}_show`] ?? settings.event_logo_enabled ?? true;

                      const partnerV = getSettingVal('partner', 'position_v', 'bottom');
                      const partnerH = getSettingVal('partner', 'position_h', 'center');
                      const partnerSize = getSettingVal('partner', 'size', 40);
                      const partnerUnit = getSettingVal('partner', 'unit', 'px');
                      const partnerEnabled = settings[`partner_logo_show_${activeState}`] ?? settings[`partner_logo_${activeState}_show`] ?? settings.partner_logo_enabled ?? true;

                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* COLUMNA 1: LOGO DEL EVENTO */}
                          <div className="rounded-2xl p-4 border shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                            <div>
                              <div className="pb-2 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-2">
                                  <Sparkles size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                  <div className="flex flex-col leading-tight">
                                    <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                                      <span>Logo del Evento</span>
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase text-white shadow-2xs" style={{ backgroundColor: 'var(--primary-accent)' }}>
                                        {stateLabels[activeState]}
                                      </span>
                                    </h3>
                                    <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                      Configurando la pantalla de {stateLabels[activeState]}
                                    </span>
                                  </div>
                                </div>

                                {/* SELECCIÓN DE PANTALLA Y VISIBILIDAD (BIENVENIDA, CÁMARA, GALERÍA) */}
                                <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                  {[
                                    { id: 'welcome', label: 'Bienvenida', icon: Tv, key: 'event_logo_show_welcome' },
                                    { id: 'camera', label: 'Cámara', icon: Camera, key: 'event_logo_show_camera' },
                                    { id: 'gallery', label: 'Galería', icon: ImageIcon, key: 'event_logo_show_gallery' },
                                  ].map((st) => {
                                    const Icon = st.icon;
                                    const isSelected = activeState === st.id;
                                    const isVisible = settings[st.key] ?? true;
                                    return (
                                      <div
                                        key={st.id}
                                        className="flex items-center rounded-lg border transition-all overflow-hidden"
                                        style={{
                                          backgroundColor: isSelected ? 'var(--primary-accent)' : 'transparent',
                                          borderColor: isSelected ? 'var(--primary-accent)' : 'transparent',
                                        }}
                                      >
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveLogoState(st.id as any);
                                            setPreviewView(st.id);
                                          }}
                                          className="flex items-center justify-center p-1.5 transition-all cursor-pointer"
                                          style={{
                                            color: isSelected ? '#ffffff' : 'var(--text-muted)',
                                          }}
                                          title={`Configurar para ${st.label}`}
                                        >
                                          <Icon size={14} />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateSetting(st.key, !isVisible);
                                          }}
                                          className="px-1.5 py-1 border-l transition-all cursor-pointer flex items-center justify-center opacity-80 hover:opacity-100"
                                          style={{
                                            borderColor: isSelected ? 'rgba(255,255,255,0.3)' : 'var(--border-color)',
                                            color: isSelected ? '#ffffff' : isVisible ? 'var(--primary-accent)' : 'var(--text-muted)',
                                          }}
                                          title={isVisible ? `Visible en ${st.label} (Clic para ocultar)` : `Oculto en ${st.label} (Clic para mostrar)`}
                                        >
                                          {isVisible ? <Eye size={12} /> : <EyeOff size={12} className="opacity-40" />}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* GRID INTERNO: IZQ = LOGO, DER = CONTROLES */}
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3">
                                {/* LADO IZQUIERDO: VISTA PREVIA LOGO (5 cols) */}
                                <div className="md:col-span-4 flex flex-col items-center justify-center">
                                  <div
                                    className="relative w-full h-full min-h-[140px] rounded-xl border overflow-hidden flex flex-col items-center justify-center p-3"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                                  >
                                    {displayEventLogo ? (
                                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                                        <img src={displayEventLogo} alt="Logo Evento BD" className="max-h-24 max-w-full object-contain drop-shadow-md" />
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center text-center p-2">
                                        <ImageIcon size={20} className="opacity-40 mb-1" style={{ color: 'var(--text-muted)' }} />
                                        <span className="text-xs font-bold opacity-75" style={{ color: 'var(--text-main)' }}>
                                          Sin logo registrado
                                        </span>
                                        <span className="text-[10px] opacity-60 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                          El evento en BD no tiene un logo cargado
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* LADO DERECHO: CONTROLES (8 cols) */}
                                <div className="md:col-span-8 space-y-2.5">
                                  <div className="grid grid-cols-2 gap-2">
                                    {/* Alineación Vertical Evento */}
                                    <div>
                                      <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                        Alineación Vertical
                                      </label>
                                      <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                        {[
                                          { id: 'top', label: 'Arriba' },
                                          { id: 'center', label: 'Centro' },
                                          { id: 'bottom', label: 'Abajo' },
                                        ].map((pos) => {
                                          const isActive = eventV === pos.id;
                                          const isDisabled = partnerEnabled && partnerV === pos.id && partnerH === eventH;

                                          return (
                                            <button
                                              key={pos.id}
                                              type="button"
                                              disabled={isDisabled}
                                              onClick={() => updateLogoSetting('event', 'position_v', pos.id)}
                                              className="botab-item"
                                              style={{
                                                backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                color: isActive ? '#ffffff' : 'var(--text-muted)',
                                              }}
                                              title={isDisabled ? 'Ocupado por el Logo del Partner' : undefined}
                                            >
                                              {pos.label}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Alineación Horizontal Evento */}
                                    <div>
                                      <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                        Alineación Horizontal
                                      </label>
                                      <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                        {[
                                          { id: 'left', label: 'Izq' },
                                          { id: 'center', label: 'Centro' },
                                          { id: 'right', label: 'Der' },
                                        ].map((pos) => {
                                          const isActive = eventH === pos.id;
                                          const isDisabled = partnerEnabled && partnerH === pos.id && partnerV === eventV;

                                          return (
                                            <button
                                              key={pos.id}
                                              type="button"
                                              disabled={isDisabled}
                                              onClick={() => updateLogoSetting('event', 'position_h', pos.id)}
                                              className="botab-item"
                                              style={{
                                                backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                color: isActive ? '#ffffff' : 'var(--text-muted)',
                                              }}
                                              title={isDisabled ? 'Ocupado por el Logo del Partner' : undefined}
                                            >
                                              {pos.label}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Tamaño / Ancho Máximo */}
                                  <div>
                                    <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                      Tamaño / Ancho Máximo
                                    </label>
                                    <div className="flex items-center gap-1.5">
                                      <div className="flex-1 flex items-center h-7 rounded-lg border px-2 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                        <input
                                          type="number"
                                          min={10}
                                          max={eventUnit === '%' ? 100 : 300}
                                          value={eventSize}
                                          onChange={(e) => updateLogoSetting('event', 'size', parseInt(e.target.value) || 30)}
                                          className="w-full bg-transparent outline-none font-bold text-xs text-center"
                                          style={{ color: 'var(--text-main)' }}
                                        />
                                      </div>
                                      <div className="flex rounded-lg border p-0.5" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                        {['px', '%'].map((u) => {
                                          const isActive = eventUnit === u;
                                          return (
                                            <button
                                              key={u}
                                              type="button"
                                              onClick={() => updateLogoSetting('event', 'unit', u)}
                                              className="px-2 py-0.5 text-[9px] font-extrabold rounded transition-all"
                                              style={{
                                                backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                color: isActive ? '#ffffff' : 'var(--text-muted)',
                                              }}
                                            >
                                              {u}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Márgenes independientes */}
                                  <div className="pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--border-color)' }}>
                                    <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                      Márgenes
                                    </label>

                                    {/* Fila 1: Arriba / Abajo */}
                                    <div className="grid grid-cols-2 gap-2">
                                      {[
                                        { field: 'margin_top', unitField: 'margin_top_unit', label: 'Arriba' },
                                        { field: 'margin_bottom', unitField: 'margin_bottom_unit', label: 'Abajo' },
                                      ].map((m) => {
                                        const val = getSettingVal('event', m.field, 0);
                                        const currentUnit = getSettingVal('event', m.unitField, getSettingVal('event', 'margin_unit', 'px'));
                                        return (
                                          <div key={m.field} className="flex flex-col gap-0.5">
                                            <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                                            <div className="flex items-center gap-1">
                                              <div className="flex-1 flex items-center h-7 rounded-lg border px-1.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                <input
                                                  type="number"
                                                  value={val}
                                                  onChange={(e) => updateLogoSetting('event', m.field, parseInt(e.target.value) || 0)}
                                                  className="w-full bg-transparent outline-none font-bold text-[10px] text-center"
                                                  style={{ color: 'var(--text-main)' }}
                                                />
                                              </div>
                                              <div className="flex rounded-lg border p-0.5 shrink-0" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                {['px', '%'].map((u) => {
                                                  const isActive = currentUnit === u;
                                                  return (
                                                    <button
                                                      key={u}
                                                      type="button"
                                                      onClick={() => updateLogoSetting('event', m.unitField, u)}
                                                      className="px-1.5 py-0.5 text-[8px] font-extrabold rounded transition-all cursor-pointer"
                                                      style={{
                                                        backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                        color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                      }}
                                                    >
                                                      {u}
                                                    </button>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* Fila 2: Izquierda / Derecha */}
                                    <div className="grid grid-cols-2 gap-2">
                                      {[
                                        { field: 'margin_left', unitField: 'margin_left_unit', label: 'Izquierda' },
                                        { field: 'margin_right', unitField: 'margin_right_unit', label: 'Derecha' },
                                      ].map((m) => {
                                        const val = getSettingVal('event', m.field, 0);
                                        const currentUnit = getSettingVal('event', m.unitField, getSettingVal('event', 'margin_unit', 'px'));
                                        return (
                                          <div key={m.field} className="flex flex-col gap-0.5">
                                            <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                                            <div className="flex items-center gap-1">
                                              <div className="flex-1 flex items-center h-7 rounded-lg border px-1.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                <input
                                                  type="number"
                                                  value={val}
                                                  onChange={(e) => updateLogoSetting('event', m.field, parseInt(e.target.value) || 0)}
                                                  className="w-full bg-transparent outline-none font-bold text-[10px] text-center"
                                                  style={{ color: 'var(--text-main)' }}
                                                />
                                              </div>
                                              <div className="flex rounded-lg border p-0.5 shrink-0" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                {['px', '%'].map((u) => {
                                                  const isActive = currentUnit === u;
                                                  return (
                                                    <button
                                                      key={u}
                                                      type="button"
                                                      onClick={() => updateLogoSetting('event', m.unitField, u)}
                                                      className="px-1.5 py-0.5 text-[8px] font-extrabold rounded transition-all cursor-pointer"
                                                      style={{
                                                        backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                        color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                      }}
                                                    >
                                                      {u}
                                                    </button>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* COLUMNA 2: LOGO DEL PARTNER / MARCA */}
                          <div className="rounded-2xl p-4 border shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                            <div>
                              <div className="pb-2 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-2">
                                  <Smartphone size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                  <div className="flex flex-col leading-tight">
                                    <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                                      <span>Logo del Partner</span>
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase text-white shadow-2xs" style={{ backgroundColor: 'var(--primary-accent)' }}>
                                        {stateLabels[activeState]}
                                      </span>
                                    </h3>
                                    <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                      Configurando la pantalla de {stateLabels[activeState]}
                                    </span>
                                  </div>
                                </div>

                                {/* SELECCIÓN DE PANTALLA Y VISIBILIDAD (BIENVENIDA, CÁMARA, GALERÍA) */}
                                <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                  {[
                                    { id: 'welcome', label: 'Bienvenida', icon: Tv, key: 'partner_logo_show_welcome' },
                                    { id: 'camera', label: 'Cámara', icon: Camera, key: 'partner_logo_show_camera' },
                                    { id: 'gallery', label: 'Galería', icon: ImageIcon, key: 'partner_logo_show_gallery' },
                                  ].map((st) => {
                                    const Icon = st.icon;
                                    const isSelected = activeState === st.id;
                                    const isVisible = settings[st.key] ?? true;
                                    return (
                                      <div
                                        key={st.id}
                                        className="flex items-center rounded-lg border transition-all overflow-hidden"
                                        style={{
                                          backgroundColor: isSelected ? 'var(--primary-accent)' : 'transparent',
                                          borderColor: isSelected ? 'var(--primary-accent)' : 'transparent',
                                        }}
                                      >
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveLogoState(st.id as any);
                                            setPreviewView(st.id);
                                          }}
                                          className="flex items-center justify-center p-1.5 transition-all cursor-pointer"
                                          style={{
                                            color: isSelected ? '#ffffff' : 'var(--text-muted)',
                                          }}
                                          title={`Configurar para ${st.label}`}
                                        >
                                          <Icon size={14} />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateSetting(st.key, !isVisible);
                                          }}
                                          className="px-1.5 py-1 border-l transition-all cursor-pointer flex items-center justify-center opacity-80 hover:opacity-100"
                                          style={{
                                            borderColor: isSelected ? 'rgba(255,255,255,0.3)' : 'var(--border-color)',
                                            color: isSelected ? '#ffffff' : isVisible ? 'var(--primary-accent)' : 'var(--text-muted)',
                                          }}
                                          title={isVisible ? `Visible en ${st.label} (Clic para ocultar)` : `Oculto en ${st.label} (Clic para mostrar)`}
                                        >
                                          {isVisible ? <Eye size={12} /> : <EyeOff size={12} className="opacity-40" />}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* GRID INTERNO: IZQ = LOGO, DER = CONTROLES */}
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3">
                                {/* LADO IZQUIERDO: VISTA PREVIA LOGO PARTNER (5 cols) */}
                                <div className="md:col-span-4 flex flex-col items-center justify-center">
                                  <div
                                    className="relative w-full h-full min-h-[140px] rounded-xl border overflow-hidden flex flex-col items-center justify-center p-3"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                                  >
                                    {displayPartnerLogo ? (
                                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                                        <img src={displayPartnerLogo} alt="Logo Partner BD" className="max-h-24 max-w-full object-contain drop-shadow-md" />
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center text-center p-2">
                                        <Smartphone size={20} className="opacity-40 mb-1" style={{ color: 'var(--text-muted)' }} />
                                        <span className="text-xs font-bold opacity-75" style={{ color: 'var(--text-main)' }}>
                                          Sin logo partner registrado
                                        </span>
                                        <span className="text-[10px] opacity-60 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                          El evento en BD no tiene un partner asignado
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* LADO DERECHO: CONTROLES PARTNER (8 cols) */}
                                <div className="md:col-span-8 space-y-2.5">
                                  <div className="grid grid-cols-2 gap-2">
                                    {/* Alineación Vertical Partner */}
                                    <div>
                                      <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                        Alineación Vertical
                                      </label>
                                      <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                        {[
                                          { id: 'top', label: 'Arriba' },
                                          { id: 'center', label: 'Centro' },
                                          { id: 'bottom', label: 'Abajo' },
                                        ].map((pos) => {
                                          const isActive = partnerV === pos.id;
                                          const isDisabled = eventEnabled && eventV === pos.id && eventH === partnerH;

                                          return (
                                            <button
                                              key={pos.id}
                                              type="button"
                                              disabled={isDisabled}
                                              onClick={() => updateLogoSetting('partner', 'position_v', pos.id)}
                                              className="botab-item"
                                              style={{
                                                backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                color: isActive ? '#ffffff' : 'var(--text-muted)',
                                              }}
                                              title={isDisabled ? 'Ocupado por el Logo del Evento' : undefined}
                                            >
                                              {pos.label}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Alineación Horizontal Partner */}
                                    <div>
                                      <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                        Alineación Horizontal
                                      </label>
                                      <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                        {[
                                          { id: 'left', label: 'Izq' },
                                          { id: 'center', label: 'Centro' },
                                          { id: 'right', label: 'Der' },
                                        ].map((pos) => {
                                          const isActive = partnerH === pos.id;
                                          const isDisabled = eventEnabled && eventH === pos.id && eventV === partnerV;

                                          return (
                                            <button
                                              key={pos.id}
                                              type="button"
                                              disabled={isDisabled}
                                              onClick={() => updateLogoSetting('partner', 'position_h', pos.id)}
                                              className="botab-item"
                                              style={{
                                                backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                color: isActive ? '#ffffff' : 'var(--text-muted)',
                                              }}
                                              title={isDisabled ? 'Ocupado por el Logo del Evento' : undefined}
                                            >
                                              {pos.label}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Tamaño / Ancho Máximo */}
                                  <div>
                                    <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                      Tamaño / Ancho Máximo
                                    </label>
                                    <div className="flex items-center gap-1.5">
                                      <div className="flex-1 flex items-center h-7 rounded-lg border px-2 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                        <input
                                          type="number"
                                          min={10}
                                          max={partnerUnit === '%' ? 100 : 300}
                                          value={partnerSize}
                                          onChange={(e) => updateLogoSetting('partner', 'size', parseInt(e.target.value) || 30)}
                                          className="w-full bg-transparent outline-none font-bold text-xs text-center"
                                          style={{ color: 'var(--text-main)' }}
                                        />
                                      </div>
                                      <div className="flex rounded-lg border p-0.5" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                        {['px', '%'].map((u) => {
                                          const isActive = partnerUnit === u;
                                          return (
                                            <button
                                              key={u}
                                              type="button"
                                              onClick={() => updateLogoSetting('partner', 'unit', u)}
                                              className="px-2 py-0.5 text-[9px] font-extrabold rounded transition-all"
                                              style={{
                                                backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                color: isActive ? '#ffffff' : 'var(--text-muted)',
                                              }}
                                            >
                                              {u}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Márgenes independientes */}
                                  <div className="pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--border-color)' }}>
                                    <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                      Márgenes
                                    </label>

                                    {/* Fila 1: Arriba / Abajo */}
                                    <div className="grid grid-cols-2 gap-2">
                                      {[
                                        { field: 'margin_top', unitField: 'margin_top_unit', label: 'Arriba' },
                                        { field: 'margin_bottom', unitField: 'margin_bottom_unit', label: 'Abajo' },
                                      ].map((m) => {
                                        const val = getSettingVal('partner', m.field, 0);
                                        const currentUnit = getSettingVal('partner', m.unitField, getSettingVal('partner', 'margin_unit', 'px'));
                                        return (
                                          <div key={m.field} className="flex flex-col gap-0.5">
                                            <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                                            <div className="flex items-center gap-1">
                                              <div className="flex-1 flex items-center h-7 rounded-lg border px-1.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                <input
                                                  type="number"
                                                  value={val}
                                                  onChange={(e) => updateLogoSetting('partner', m.field, parseInt(e.target.value) || 0)}
                                                  className="w-full bg-transparent outline-none font-bold text-[10px] text-center"
                                                  style={{ color: 'var(--text-main)' }}
                                                />
                                              </div>
                                              <div className="flex rounded-lg border p-0.5 shrink-0" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                {['px', '%'].map((u) => {
                                                  const isActive = currentUnit === u;
                                                  return (
                                                    <button
                                                      key={u}
                                                      type="button"
                                                      onClick={() => updateLogoSetting('partner', m.unitField, u)}
                                                      className="px-1.5 py-0.5 text-[8px] font-extrabold rounded transition-all cursor-pointer"
                                                      style={{
                                                        backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                        color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                      }}
                                                    >
                                                      {u}
                                                    </button>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* Fila 2: Izquierda / Derecha */}
                                    <div className="grid grid-cols-2 gap-2">
                                      {[
                                        { field: 'margin_left', unitField: 'margin_left_unit', label: 'Izquierda' },
                                        { field: 'margin_right', unitField: 'margin_right_unit', label: 'Derecha' },
                                      ].map((m) => {
                                        const val = getSettingVal('partner', m.field, 0);
                                        const currentUnit = getSettingVal('partner', m.unitField, getSettingVal('partner', 'margin_unit', 'px'));
                                        return (
                                          <div key={m.field} className="flex flex-col gap-0.5">
                                            <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                                            <div className="flex items-center gap-1">
                                              <div className="flex-1 flex items-center h-7 rounded-lg border px-1.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                <input
                                                  type="number"
                                                  value={val}
                                                  onChange={(e) => updateLogoSetting('partner', m.field, parseInt(e.target.value) || 0)}
                                                  className="w-full bg-transparent outline-none font-bold text-[10px] text-center"
                                                  style={{ color: 'var(--text-main)' }}
                                                />
                                              </div>
                                              <div className="flex rounded-lg border p-0.5 shrink-0" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                {['px', '%'].map((u) => {
                                                  const isActive = currentUnit === u;
                                                  return (
                                                    <button
                                                      key={u}
                                                      type="button"
                                                      onClick={() => updateLogoSetting('partner', m.unitField, u)}
                                                      className="px-1.5 py-0.5 text-[8px] font-extrabold rounded transition-all cursor-pointer"
                                                      style={{
                                                        backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                        color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                      }}
                                                    >
                                                      {u}
                                                    </button>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 2. BIENVENIDA TAB CON SUB-PESTAÑAS (PRECARGA, BIENVENIDA, VERIFICACIÓN GPS, REGISTRO) */}
                {mobileActiveView === 'welcome' && (
                  <div className="space-y-4">
                    {/* NAVEGACIÓN DE SUB-PESTAÑAS EN BIENVENIDA (ESTRUCTURA DUAL: PROGRAMA E EVENTO) */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-1.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                      {/* LADO IZQUIERDO: PROGRAMA (FUENTE, CONTENEDOR, LOGOS PRECARGA/QR) */}
                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border shadow-2xs" style={{ color: 'var(--text-main)', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-app)' }}>
                          PROGRAMA
                        </span>
                        <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                          {[
                            { id: 'fuentes', label: 'Fuente', icon: Type },
                            { id: 'fondos', label: 'Contenedor', icon: Palette },
                            { id: 'logos', label: 'Logos', icon: ImageIcon },
                          ].map((sub) => {
                            const SubIcon = sub.icon;
                            const isSubActive = welcomeSubTab === 'precarga' && precargaSubTab === sub.id;
                            return (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => {
                                  setWelcomeSubTab('precarga' as any);
                                  setPrecargaSubTab(sub.id as any);
                                  setPreviewView('precarga');
                                }}
                                className="botab-item"
                                style={{
                                  backgroundColor: isSubActive ? 'var(--primary-accent-light)' : 'transparent',
                                  color: isSubActive ? 'var(--primary-accent)' : 'var(--text-muted)',
                                  border: isSubActive ? '1px solid var(--primary-accent)' : '1px solid transparent',
                                }}
                                title={sub.label}
                              >
                                <SubIcon size={13} />
                                {isSubActive && <span>{sub.label}</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* LADO DERECHO: EVENTO */}
                      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                        <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border shadow-2xs" style={{ color: 'var(--text-main)', borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-app)' }}>
                          EVENTO
                        </span>
                        <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                          {[
                            { id: 'fuentes', label: 'Fuente', icon: Type },
                            { id: 'fondos', label: 'Contenedor', icon: Palette },
                            { id: 'logos', label: 'Logos', icon: ImageIcon },
                            { id: 'info', label: 'Información', icon: Info },
                          ].map((sub) => {
                            const SubIcon = sub.icon;
                            const isSubActive = welcomeSubTab === 'evento' && bienvenidaSubTab === sub.id;
                            return (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => {
                                  setWelcomeSubTab('evento' as any);
                                  setBienvenidaSubTab(sub.id as any);
                                  setPreviewView('welcome');
                                }}
                                className="botab-item"
                                style={{
                                  backgroundColor: isSubActive ? 'var(--primary-accent-light)' : 'transparent',
                                  color: isSubActive ? 'var(--primary-accent)' : 'var(--text-muted)',
                                  border: isSubActive ? '1px solid var(--primary-accent)' : '1px solid transparent',
                                }}
                                title={sub.label}
                              >
                                <SubIcon size={13} />
                                {isSubActive && <span>{sub.label}</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* 2.1 SUB-PESTAÑA PRECARGA */}
                    {welcomeSubTab === 'precarga' && (
                      <div className="space-y-4">

                        {/* 2.1.1 SUB-PESTAÑA FUENTES EN PRECARGA */}
                        {precargaSubTab === 'fuentes' && (() => {
                          const partnerEnabled = settings.precarga_show_logo ?? settings.partner_logo_show_precarga ?? true;
                          const activeTarget = precargaTextTarget === 'button' ? 'title' : precargaTextTarget;
                          const isPoweredByDisabled = activeTarget === 'powered_by' && !partnerEnabled;

                          return (
                          <div className="space-y-4">
                            {/* 1. TARJETA SUPERIOR: FUENTES Y TEXTOS (TÍTULO, SUBTÍTULO, GENERAL) */}
                            <div className="rounded-2xl p-4 border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                              <div className="pb-2 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-2.5">
                                  <Type size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                  <div className="flex flex-col leading-tight">
                                    <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                      Fuentes y Textos
                                    </h3>
                                    <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                      {activeTarget === 'title' ? 'Título Principal' : activeTarget === 'subtitle' ? 'Subtítulo' : 'Contenido'}
                                    </span>
                                  </div>
                                </div>

                                {/* PESTAÑAS TÍTULO / SUBTÍTULO / CONTENIDO EN EL LADO DERECHO */}
                                <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                  {[
                                    { id: 'title', label: 'Título' },
                                    { id: 'subtitle', label: 'Subtítulo' },
                                    { id: 'powered_by', label: 'Contenido' },
                                  ].map((targetItem) => {
                                    const isTargetActive = activeTarget === targetItem.id;
                                    const isPoweredByItem = targetItem.id === 'powered_by';
                                    const isItemDisabled = isPoweredByItem && !partnerEnabled;

                                    return (
                                      <button
                                        key={targetItem.id}
                                        type="button"
                                        onClick={() => setPrecargaTextTarget(targetItem.id as any)}
                                        className="botab-item"
                                        style={{
                                          backgroundColor: isTargetActive ? 'var(--primary-accent)' : 'transparent',
                                          color: isTargetActive ? '#ffffff' : isItemDisabled ? 'var(--text-muted)' : 'var(--text-muted)',
                                          opacity: isItemDisabled ? 0.6 : 1,
                                        }}
                                        title={isItemDisabled ? 'Visibilidad desactivada en la pestaña Logos' : undefined}
                                      >
                                        <span>{targetItem.label}</span>
                                        {isItemDisabled && <EyeOff size={11} className="shrink-0" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* ADVERTENCIA DE VISIBILIDAD SI POWERED BY ESTÁ DESACTIVADO */}
                              {isPoweredByDisabled && (
                                <div className="p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}>
                                  <EyeOff size={16} className="shrink-0" />
                                  <span>El texto "Powered by" y el Logo están desactivados. Activa el suiche de visibilidad en la pestaña <strong>Logos</strong> para habilitar su edición y visualización.</span>
                                </div>
                              )}

                              {/* CONTROLES DE TEXTO, TIPOGRAFÍA Y ESTILOS */}
                              <div className={`flex flex-col md:flex-row items-stretch md:items-end gap-3 ${isPoweredByDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                {/* CAMPO TEXTO / CONTENIDO (Ancho moderado fijo) */}
                                <div className="w-full md:w-52 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                    {activeTarget === 'title' ? 'Texto del Título' : activeTarget === 'subtitle' ? 'Texto del Contenido' : 'Texto de Powered by'}
                                  </label>
                                  <input
                                    type="text"
                                    disabled={isPoweredByDisabled}
                                    value={
                                      activeTarget === 'title'
                                        ? (settings.welcome_precarga_text ?? settings.precarga_title ?? 'Cargando')
                                        : activeTarget === 'subtitle'
                                        ? (settings.precarga_subtitle ?? 'Espere por favor')
                                        : (settings.precarga_powered_by_text ?? 'Powered by')
                                    }
                                    onChange={(e) => {
                                      if (activeTarget === 'title') {
                                        updateSetting('welcome_precarga_text', e.target.value);
                                        updateSetting('precarga_title', e.target.value);
                                      } else if (activeTarget === 'subtitle') {
                                        updateSetting('precarga_subtitle', e.target.value);
                                      } else {
                                        updateSetting('precarga_powered_by_text', e.target.value);
                                      }
                                    }}
                                    placeholder={
                                      activeTarget === 'title'
                                        ? 'Ej: Cargando'
                                        : activeTarget === 'subtitle'
                                        ? 'Ej: Espere por favor'
                                        : 'Ej: Powered by'
                                    }
                                    className="w-full h-9 rounded-xl px-3 border outline-none text-xs font-medium"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                  />
                                </div>

                                {/* FUENTE (Toma el ancho mayor flexible) */}
                                <div className="flex-1 min-w-[180px]">
                                  <FontPicker
                                    label="Fuente"
                                    value={
                                      settings[`precarga_${activeTarget}_font_family`] ||
                                      (activeTarget === 'title' ? (settings.global_title_font_family || 'Inter') : (settings.global_text_font_family || 'Inter'))
                                    }
                                    onChange={(f) => updateSetting(`precarga_${activeTarget}_font_family`, f)}
                                  />
                                </div>

                                {/* TAMAÑO (Un poco más ancho) */}
                                <div className="w-full md:w-36 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                    Tamaño
                                  </label>
                                  <div
                                    className="flex items-center h-9 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full shadow-2xs"
                                    style={{
                                      backgroundColor: 'var(--bg-app)',
                                      borderColor: 'var(--border-color)',
                                    }}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const defaultSize = activeTarget === 'title' ? 13 : activeTarget === 'subtitle' ? 10 : 8.5;
                                        const curr = parseFloat(settings[`precarga_${activeTarget}_font_size`] || defaultSize.toString());
                                        const nextVal = Math.max(5, curr - 0.5);
                                        updateSetting(`precarga_${activeTarget}_font_size`, nextVal.toString());
                                      }}
                                      className="w-8 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                      style={{
                                        backgroundColor: 'var(--bg-card)',
                                        borderColor: 'var(--border-color)',
                                        color: 'var(--primary-accent)',
                                      }}
                                      title="Disminuir tamaño"
                                    >
                                      <Minus size={12} />
                                    </button>

                                    <div className="flex-1 flex items-center justify-center px-1">
                                      <input
                                        type="number"
                                        min={5}
                                        max={80}
                                        step={0.5}
                                        value={
                                          settings[`precarga_${activeTarget}_font_size`] ||
                                          (activeTarget === 'title' ? '13' : activeTarget === 'subtitle' ? '10' : '8.5')
                                        }
                                        onChange={(e) => updateSetting(`precarga_${activeTarget}_font_size`, e.target.value)}
                                        className="w-full h-full text-center bg-transparent outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        style={{ color: 'var(--text-main)' }}
                                      />
                                      <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>
                                        px
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const defaultSize = activeTarget === 'title' ? 13 : activeTarget === 'subtitle' ? 10 : 8.5;
                                        const curr = parseFloat(settings[`precarga_${activeTarget}_font_size`] || defaultSize.toString());
                                        const nextVal = Math.min(80, curr + 0.5);
                                        updateSetting(`precarga_${activeTarget}_font_size`, nextVal.toString());
                                      }}
                                      className="w-8 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                      style={{
                                        backgroundColor: 'var(--bg-card)',
                                        borderColor: 'var(--border-color)',
                                        color: 'var(--primary-accent)',
                                      }}
                                      title="Aumentar tamaño"
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                </div>

                                {/* FORMATO (NEGRITA, ITÁLICA, SUBRAYADO) */}
                                <div className="w-full md:w-28 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                    Formato
                                  </label>
                                  <div
                                    className="flex items-center h-9 rounded-xl border p-0.5 gap-0.5 shadow-2xs"
                                    style={{
                                      backgroundColor: 'var(--bg-app)',
                                      borderColor: 'var(--border-color)',
                                    }}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => updateSetting(`precarga_${activeTarget}_font_weight`, settings[`precarga_${activeTarget}_font_weight`] === 'bold' ? 'normal' : 'bold')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                      style={{
                                        backgroundColor: settings[`precarga_${activeTarget}_font_weight`] === 'bold' ? 'var(--primary-accent)' : 'transparent',
                                        color: settings[`precarga_${activeTarget}_font_weight`] === 'bold' ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                      title="Negrita"
                                    >
                                      <Bold size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting(`precarga_${activeTarget}_font_style`, settings[`precarga_${activeTarget}_font_style`] === 'italic' ? 'normal' : 'italic')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                      style={{
                                        backgroundColor: settings[`precarga_${activeTarget}_font_style`] === 'italic' ? 'var(--primary-accent)' : 'transparent',
                                        color: settings[`precarga_${activeTarget}_font_style`] === 'italic' ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                      title="Itálica"
                                    >
                                      <Italic size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting(`precarga_${activeTarget}_text_decoration`, settings[`precarga_${activeTarget}_text_decoration`] === 'underline' ? 'none' : 'underline')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                      style={{
                                        backgroundColor: settings[`precarga_${activeTarget}_text_decoration`] === 'underline' ? 'var(--primary-accent)' : 'transparent',
                                        color: settings[`precarga_${activeTarget}_text_decoration`] === 'underline' ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                      title="Subrayado"
                                    >
                                      <Underline size={13} />
                                    </button>
                                  </div>
                                </div>

                                {/* ALINEACIÓN */}
                                <div className="w-full md:w-32 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Alineación</label>
                                  <div className="flex items-center h-9 rounded-xl border p-0.5 gap-0.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                    {[
                                      { id: 'left', icon: AlignLeft, title: 'Izquierda' },
                                      { id: 'center', icon: AlignCenter, title: 'Centro' },
                                      { id: 'right', icon: AlignRight, title: 'Derecha' },
                                      { id: 'justify', icon: AlignJustify, title: 'Justificado' },
                                    ].map((align) => {
                                      const AlignIcon = align.icon;
                                      const isAlignActive = (settings[`precarga_${activeTarget}_text_align`] || 'center') === align.id;
                                      return (
                                        <button
                                          key={align.id}
                                          type="button"
                                          onClick={() => updateSetting(`precarga_${activeTarget}_text_align`, align.id)}
                                          className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                          style={{
                                            backgroundColor: isAlignActive ? 'var(--primary-accent)' : 'transparent',
                                            color: isAlignActive ? '#ffffff' : 'var(--text-muted)',
                                          }}
                                          title={align.title}
                                        >
                                          <AlignIcon size={13} />
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* ESTILO DEL TEXTO (StylePickerPopover) */}
                                <div className="w-full md:w-32 shrink-0">
                                  <StylePickerPopover
                                    label="Estilo texto"
                                    elementType="text"
                                    eventColors={eventColors.length > 0 ? eventColors : ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B']}
                                    eventColorImage={eventColorImage}
                                    styleConfig={{
                                      fillType: 'color',
                                      fillColor: settings[`precarga_${activeTarget}_font_color`] || (activeTarget === 'title' ? '#ffffff' : activeTarget === 'subtitle' ? '#e2e8f0' : '#ffffff'),
                                      strokeActive: settings[`precarga_${activeTarget}_stroke_active`] || false,
                                      strokeColor: settings[`precarga_${activeTarget}_stroke_color`] || '#000000',
                                      strokeWidth: parseInt(settings[`precarga_${activeTarget}_stroke_width`] || '2'),
                                      strokeType: settings[`precarga_${activeTarget}_stroke_type`] || 'OUT',
                                      shadowActive: settings[`precarga_${activeTarget}_shadow_active`] || false,
                                      shadowColor: settings[`precarga_${activeTarget}_shadow_color`] || '#000000',
                                      shadowBlur: parseInt(settings[`precarga_${activeTarget}_shadow_blur`] || '8'),
                                    }}
                                    onChange={(updated) => {
                                      if (updated.fillColor) updateSetting(`precarga_${activeTarget}_font_color`, updated.fillColor);
                                      if (updated.strokeActive !== undefined) updateSetting(`precarga_${activeTarget}_stroke_active`, updated.strokeActive);
                                      if (updated.strokeColor) updateSetting(`precarga_${activeTarget}_stroke_color`, updated.strokeColor);
                                      if (updated.strokeWidth !== undefined) updateSetting(`precarga_${activeTarget}_stroke_width`, updated.strokeWidth.toString());
                                      if (updated.strokeType) updateSetting(`precarga_${activeTarget}_stroke_type`, updated.strokeType);
                                      if (updated.shadowActive !== undefined) updateSetting(`precarga_${activeTarget}_shadow_active`, updated.shadowActive);
                                      if (updated.shadowColor) updateSetting(`precarga_${activeTarget}_shadow_color`, updated.shadowColor);
                                      if (updated.shadowBlur !== undefined) updateSetting(`precarga_${activeTarget}_shadow_blur`, updated.shadowBlur.toString());
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* 2. TARJETA INFERIOR: FUENTE DE BOTÓN (NORMAL / SOBRE) */}
                            <div className="rounded-2xl p-4 border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                              <div className="pb-2 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-2.5">
                                  <MousePointer2 size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                  <div className="flex flex-col leading-tight">
                                    <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                      Fuente de Botón ({buttonState === 'hover' ? 'Sobre' : 'Normal'})
                                    </h3>
                                    <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                      Tipografía, texto y estilo del botón "Entrar"
                                    </span>
                                  </div>
                                </div>

                                {/* PESTAÑAS NORMAL / SOBRE */}
                                <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                  {[
                                    { id: 'normal', label: 'Normal' },
                                    { id: 'hover', label: 'Sobre' },
                                  ].map((modeItem) => {
                                    const isModeActive = buttonState === modeItem.id;
                                    return (
                                      <button
                                        key={modeItem.id}
                                        type="button"
                                        onClick={() => setButtonState(modeItem.id as any)}
                                        className="botab-item"
                                        style={{
                                          backgroundColor: isModeActive ? 'var(--primary-accent)' : 'transparent',
                                          color: isModeActive ? '#ffffff' : 'var(--text-muted)',
                                        }}
                                      >
                                        {modeItem.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* CONTROLES DE TEXTO, TIPOGRAFÍA Y ESTILOS PARA BOTÓN */}
                              <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
                                {/* TEXTO DEL BOTÓN (Ancho moderado fijo) */}
                                <div className="w-full md:w-52 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                    Texto del Botón
                                  </label>
                                  <input
                                    type="text"
                                    value={settings.welcome_button_text ?? 'Entrar'}
                                    onChange={(e) => updateSetting('welcome_button_text', e.target.value)}
                                    placeholder="Ej: Entrar"
                                    className="w-full h-9 rounded-xl px-3 border outline-none text-xs font-medium"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                  />
                                </div>

                                {/* FUENTE (Toma el ancho mayor flexible) */}
                                <div className="flex-1 min-w-[180px]">
                                  <FontPicker
                                    label="Fuente"
                                    value={settings.precarga_button_font_family || settings.global_button_font_family || 'Inter'}
                                    onChange={(f) => {
                                      updateSetting('precarga_button_font_family', f);
                                      updateSetting('global_button_font_family', f);
                                    }}
                                  />
                                </div>

                                {/* TAMAÑO (Un poco más ancho) */}
                                <div className="w-full md:w-36 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                    Tamaño
                                  </label>
                                  <div
                                    className="flex items-center h-9 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full shadow-2xs"
                                    style={{
                                      backgroundColor: 'var(--bg-app)',
                                      borderColor: 'var(--border-color)',
                                    }}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const curr = parseFloat(settings.precarga_button_font_size || settings.global_button_font_size || '14');
                                        const nextVal = Math.max(5, curr - 0.5);
                                        updateSetting('precarga_button_font_size', nextVal.toString());
                                        updateSetting('global_button_font_size', nextVal.toString());
                                      }}
                                      className="w-8 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                      style={{
                                        backgroundColor: 'var(--bg-card)',
                                        borderColor: 'var(--border-color)',
                                        color: 'var(--primary-accent)',
                                      }}
                                      title="Disminuir tamaño"
                                    >
                                      <Minus size={12} />
                                    </button>

                                    <div className="flex-1 flex items-center justify-center px-1">
                                      <input
                                        type="number"
                                        min={5}
                                        max={80}
                                        step={0.5}
                                        value={settings.precarga_button_font_size || settings.global_button_font_size || '14'}
                                        onChange={(e) => {
                                          updateSetting('precarga_button_font_size', e.target.value);
                                          updateSetting('global_button_font_size', e.target.value);
                                        }}
                                        className="w-full h-full text-center bg-transparent outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        style={{ color: 'var(--text-main)' }}
                                      />
                                      <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>
                                        px
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const curr = parseFloat(settings.precarga_button_font_size || settings.global_button_font_size || '14');
                                        const nextVal = Math.min(80, curr + 0.5);
                                        updateSetting('precarga_button_font_size', nextVal.toString());
                                        updateSetting('global_button_font_size', nextVal.toString());
                                      }}
                                      className="w-8 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                      style={{
                                        backgroundColor: 'var(--bg-card)',
                                        borderColor: 'var(--border-color)',
                                        color: 'var(--primary-accent)',
                                      }}
                                      title="Aumentar tamaño"
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                </div>

                                {/* FORMATO (NEGRITA, ITÁLICA, SUBRAYADO) */}
                                <div className="w-full md:w-28 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                    Formato
                                  </label>
                                  <div
                                    className="flex items-center h-9 rounded-xl border p-0.5 gap-0.5 shadow-2xs"
                                    style={{
                                      backgroundColor: 'var(--bg-app)',
                                      borderColor: 'var(--border-color)',
                                    }}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => updateSetting('precarga_button_font_weight', settings.precarga_button_font_weight === 'bold' ? 'normal' : 'bold')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                      style={{
                                        backgroundColor: settings.precarga_button_font_weight === 'bold' ? 'var(--primary-accent)' : 'transparent',
                                        color: settings.precarga_button_font_weight === 'bold' ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                      title="Negrita"
                                    >
                                      <Bold size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting('precarga_button_font_style', settings.precarga_button_font_style === 'italic' ? 'normal' : 'italic')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                      style={{
                                        backgroundColor: settings.precarga_button_font_style === 'italic' ? 'var(--primary-accent)' : 'transparent',
                                        color: settings.precarga_button_font_style === 'italic' ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                      title="Itálica"
                                    >
                                      <Italic size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting('precarga_button_text_decoration', settings.precarga_button_text_decoration === 'underline' ? 'none' : 'underline')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                      style={{
                                        backgroundColor: settings.precarga_button_text_decoration === 'underline' ? 'var(--primary-accent)' : 'transparent',
                                        color: settings.precarga_button_text_decoration === 'underline' ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                      title="Subrayado"
                                    >
                                      <Underline size={13} />
                                    </button>
                                  </div>
                                </div>

                                {/* ALINEACIÓN */}
                                <div className="w-full md:w-32 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Alineación</label>
                                  <div className="flex items-center h-9 rounded-xl border p-0.5 gap-0.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                    {[
                                      { id: 'left', icon: AlignLeft, title: 'Izquierda' },
                                      { id: 'center', icon: AlignCenter, title: 'Centro' },
                                      { id: 'right', icon: AlignRight, title: 'Derecha' },
                                      { id: 'justify', icon: AlignJustify, title: 'Justificado' },
                                    ].map((align) => {
                                      const AlignIcon = align.icon;
                                      const isAlignActive = (settings.precarga_button_text_align || settings.global_button_text_align || 'center') === align.id;
                                      return (
                                        <button
                                          key={align.id}
                                          type="button"
                                          onClick={() => {
                                            updateSetting('precarga_button_text_align', align.id);
                                            updateSetting('global_button_text_align', align.id);
                                          }}
                                          className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                          style={{
                                            backgroundColor: isAlignActive ? 'var(--primary-accent)' : 'transparent',
                                            color: isAlignActive ? '#ffffff' : 'var(--text-muted)',
                                          }}
                                          title={align.title}
                                        >
                                          <AlignIcon size={13} />
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* ESTILO DEL TEXTO DEL BOTÓN (StylePickerPopover) */}
                                <div className="w-full md:w-32 shrink-0">
                                  <StylePickerPopover
                                    label={`Estilo (${buttonState === 'hover' ? 'Sobre' : 'Normal'})`}
                                    elementType="text"
                                    eventColors={eventColors.length > 0 ? eventColors : ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B']}
                                    eventColorImage={eventColorImage}
                                    styleConfig={{
                                      fillType: 'color',
                                      fillColor: buttonState === 'hover'
                                        ? (settings.precarga_button_hover_font_color || settings.global_button_hover_text || '#ffffff')
                                        : (settings.precarga_button_font_color || settings.global_button_text || '#ffffff'),
                                      strokeActive: buttonState === 'hover' ? (settings.precarga_button_hover_stroke_active || false) : (settings.precarga_button_stroke_active || false),
                                      strokeColor: buttonState === 'hover' ? (settings.precarga_button_hover_stroke_color || '#000000') : (settings.precarga_button_stroke_color || '#000000'),
                                      strokeWidth: parseInt(buttonState === 'hover' ? (settings.precarga_button_hover_stroke_width || '2') : (settings.precarga_button_stroke_width || '2')),
                                      strokeType: buttonState === 'hover' ? (settings.precarga_button_hover_stroke_type || 'OUT') : (settings.precarga_button_stroke_type || 'OUT'),
                                      shadowActive: buttonState === 'hover' ? (settings.precarga_button_hover_shadow_active || false) : (settings.precarga_button_shadow_active || false),
                                      shadowColor: buttonState === 'hover' ? (settings.precarga_button_hover_shadow_color || '#000000') : (settings.precarga_button_shadow_color || '#000000'),
                                      shadowBlur: parseInt(buttonState === 'hover' ? (settings.precarga_button_hover_shadow_blur || '8') : (settings.precarga_button_shadow_blur || '8')),
                                    }}
                                    onChange={(updated) => {
                                      const isH = buttonState === 'hover';
                                      const colorKey = isH ? 'precarga_button_hover_font_color' : 'precarga_button_font_color';
                                      const globalColorKey = isH ? 'global_button_hover_text' : 'global_button_text';
                                      const strokeActiveKey = isH ? 'precarga_button_hover_stroke_active' : 'precarga_button_stroke_active';
                                      const strokeColorKey = isH ? 'precarga_button_hover_stroke_color' : 'precarga_button_stroke_color';
                                      const strokeWidthKey = isH ? 'precarga_button_hover_stroke_width' : 'precarga_button_stroke_width';
                                      const strokeTypeKey = isH ? 'precarga_button_hover_stroke_type' : 'precarga_button_stroke_type';
                                      const shadowActiveKey = isH ? 'precarga_button_hover_shadow_active' : 'precarga_button_shadow_active';
                                      const shadowColorKey = isH ? 'precarga_button_hover_shadow_color' : 'precarga_button_shadow_color';
                                      const shadowBlurKey = isH ? 'precarga_button_hover_shadow_blur' : 'precarga_button_shadow_blur';

                                      if (updated.fillColor) {
                                        updateSetting(colorKey, updated.fillColor);
                                        updateSetting(globalColorKey, updated.fillColor);
                                      }
                                      if (updated.strokeActive !== undefined) updateSetting(strokeActiveKey, updated.strokeActive);
                                      if (updated.strokeColor) updateSetting(strokeColorKey, updated.strokeColor);
                                      if (updated.strokeWidth !== undefined) updateSetting(strokeWidthKey, updated.strokeWidth.toString());
                                      if (updated.strokeType) updateSetting(strokeTypeKey, updated.strokeType);
                                      if (updated.shadowActive !== undefined) updateSetting(shadowActiveKey, updated.shadowActive);
                                      if (updated.shadowColor) updateSetting(shadowColorKey, updated.shadowColor);
                                      if (updated.shadowBlur !== undefined) updateSetting(shadowBlurKey, updated.shadowBlur.toString());
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          );
                        })()}

                        {/* 2.1.2 SUB-PESTAÑA CONTENEDOR EN PRECARGA / QR (2 COLUMNAS COMO GENERAL) */}
                        {precargaSubTab === 'fondos' && (() => {
                          const activeLeftTarget = precargaContainerTarget === 'boton' ? 'fondo' : precargaContainerTarget;
                          const isFondoTarget = activeLeftTarget === 'fondo';
                          const prefix = isFondoTarget ? 'precarga_screen' : 'precarga_card';
                          const bgTypeKey = isFondoTarget ? 'precarga_bg_type' : 'precarga_card_bg_type';
                          const bgColorKey = isFondoTarget ? 'precarga_bg_color' : 'precarga_card_bg_color';
                          const gradKey = isFondoTarget ? 'precarga_bg_gradient' : 'precarga_card_gradient_data';
                          const imageKey = isFondoTarget ? 'precarga_bg_image_url' : 'precarga_card_image_url';
                          const videoRotateKey = `${prefix}_video_rotate`;

                          const imageUrl = settings[imageKey] || (isFondoTarget ? (settings.precarga_bg_image_url || '') : '');
                          const bgType = settings[bgTypeKey] || (isFondoTarget ? (settings.precarga_bg_type || 'color') : 'color');
                          const videoRotate = !!settings[videoRotateKey];

                          const buttonPrefix = buttonState === 'hover' ? 'button_hover' : 'button';
                          const buttonImageKey = `${buttonPrefix}_image_url`;
                          const buttonBgTypeKey = `${buttonPrefix}_bg_type`;
                          const buttonVideoRotateKey = `${buttonPrefix}_video_rotate`;
                          const buttonImageUrl = settings[buttonImageKey] || '';
                          const buttonBgType = settings[buttonBgTypeKey] || 'color';
                          const buttonVideoRotate = !!settings[buttonVideoRotateKey];

                          return (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* COLUMNA IZQUIERDA: CONTENEDORES (FONDO / MENSAJE) */}
                              <div className="rounded-2xl p-3 border space-y-3 shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                <div>
                                  <div className="pb-2 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center gap-2">
                                      <Palette size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                      <div className="flex flex-col leading-tight">
                                        <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                          Contenedores ({activeLeftTarget === 'fondo' ? 'Fondo' : 'Mensaje'})
                                        </h3>
                                        <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                          Estilos y fondos de pantalla de precarga
                                        </span>
                                      </div>
                                    </div>

                                    {/* PESTAÑAS FONDO / MENSAJES */}
                                    <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                      {[
                                        { id: 'fondo', label: 'Fondo' },
                                        { id: 'mensaje', label: 'Mensajes' },
                                      ].map((cTarget) => {
                                        const isCTargetActive = activeLeftTarget === cTarget.id;
                                        return (
                                          <button
                                            key={cTarget.id}
                                            type="button"
                                            onClick={() => setPrecargaContainerTarget(cTarget.id as any)}
                                            className="botab-item"
                                            style={{
                                              backgroundColor: isCTargetActive ? 'var(--primary-accent)' : 'transparent',
                                              color: isCTargetActive ? '#ffffff' : 'var(--text-muted)',
                                            }}
                                          >
                                            {cTarget.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="space-y-3 pt-2">
                                    {/* SUBIR IMAGEN / VIDEO DEL CONTENEDOR */}
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                          Imagen / Video ({isFondoTarget ? 'Fondo General' : 'Recuadro Central'})
                                        </label>
                                        <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer select-none" style={{ color: 'var(--text-muted)' }} title="Rotar orientación de video 90° en la pantalla del teléfono">
                                          <input
                                            type="checkbox"
                                            checked={videoRotate}
                                            onChange={(e) => updateSetting(videoRotateKey, e.target.checked)}
                                            className="rounded border-gray-400 focus:ring-0 h-3 w-3 cursor-pointer"
                                            style={{ accentColor: 'var(--primary-accent)' }}
                                          />
                                          <span>Rotar Video</span>
                                        </label>
                                      </div>
                                      
                                      <div
                                        className="border-2 border-dashed rounded-2xl p-2 text-center flex flex-col items-center justify-center transition-all relative overflow-hidden group h-[120px] min-h-[120px]"
                                        style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                                      >
                                        {imageUrl ? (
                                          <div className="relative w-full h-full rounded-xl overflow-hidden group bg-black/40 flex items-center justify-center">
                                            {bgType === 'video' || String(imageUrl).startsWith('data:video') || String(imageUrl).match(/\.(mp4|webm|ogg)$/i) ? (
                                              <video
                                                src={imageUrl}
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className="w-full h-full object-contain"
                                              />
                                            ) : (
                                              <img
                                                src={imageUrl}
                                                alt="Imagen de fondo"
                                                className="w-full h-full object-contain"
                                              />
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                              <label className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/40 cursor-pointer transition-colors" title="Cambiar archivo">
                                                <Upload size={16} />
                                                <input
                                                  type="file"
                                                  accept="image/*,video/*"
                                                  className="hidden"
                                                  onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                      const isVideo = file.type.startsWith('video/');
                                                      const reader = new FileReader();
                                                      reader.onload = (ev) => {
                                                        updateSetting(imageKey, ev.target?.result);
                                                        updateSetting(bgTypeKey, isVideo ? 'video' : 'image');
                                                        if (isFondoTarget) updateSetting('precarga_bg_type', isVideo ? 'video' : 'image');
                                                      };
                                                      reader.readAsDataURL(file);
                                                    }
                                                  }}
                                                />
                                              </label>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  updateSetting(imageKey, '');
                                                  if (isFondoTarget) updateSetting('precarga_bg_image_url', '');
                                                }}
                                                className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-600 transition-colors"
                                                title="Eliminar archivo"
                                              >
                                                <Trash2 size={16} />
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                                            <div className="p-2.5 rounded-full mb-1.5" style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}>
                                              <Upload size={18} />
                                            </div>
                                            <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Subir Imagen / Video</span>
                                            <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>PNG, JPG, MP4 o WEBM</span>
                                            <input
                                              type="file"
                                              accept="image/*,video/*"
                                              className="hidden"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  const isVideo = file.type.startsWith('video/');
                                                  const reader = new FileReader();
                                                  reader.onload = (ev) => {
                                                    updateSetting(imageKey, ev.target?.result);
                                                    updateSetting(bgTypeKey, isVideo ? 'video' : 'image');
                                                    if (isFondoTarget) {
                                                      updateSetting('precarga_bg_image_url', ev.target?.result);
                                                      updateSetting('precarga_bg_type', isVideo ? 'video' : 'image');
                                                    }
                                                  };
                                                  reader.readAsDataURL(file);
                                                }
                                              }}
                                            />
                                          </label>
                                        )}
                                      </div>
                                    </div>

                                    {/* CONTROLES IZQUIERDA: ESTILO, REDONDEZ, GLASS */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end pt-1">
                                      {/* Estilo */}
                                      <div>
                                        <StylePickerPopover
                                          label="Estilo"
                                          elementType="box"
                                          eventColors={eventColors.length > 0 ? eventColors : ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B']}
                                          eventColorImage={eventColorImage}
                                          styleConfig={{
                                            backgroundColor: settings[bgTypeKey] === 'gradient' && settings[gradKey]
                                              ? (typeof settings[gradKey] === 'string' ? settings[gradKey] : settings[bgColorKey] || (isFondoTarget ? '#0f172a' : '#000000'))
                                              : (settings[bgColorKey] || (isFondoTarget ? '#0f172a' : '#000000')),
                                            borderWidth: settings[`${prefix}_border_width`] ?? 0,
                                            borderStyle: settings[`${prefix}_border_style`] || 'solid',
                                            borderColor: settings[`${prefix}_border_color`] || '#E07A5F',
                                            borderRadius: settings[`${prefix}_border_radius`] ?? (isFondoTarget ? 0 : 16),
                                            shadowColor: settings[`${prefix}_shadow_color`] || '#000000',
                                            shadowBlur: settings[`${prefix}_shadow_blur`] ?? 0,
                                            shadowOffsetX: settings[`${prefix}_shadow_offset_x`] ?? 0,
                                            shadowOffsetY: settings[`${prefix}_shadow_offset_y`] ?? 0,
                                          }}
                                          onChange={(updated) => {
                                            const selectedColor = updated.backgroundColor || updated.fillColor;
                                            const selectedGradient = updated.fillGradient;

                                            if (updated.fillType === 'gradient' && selectedGradient) {
                                              updateSetting(bgTypeKey, 'gradient');
                                              updateSetting(gradKey, selectedGradient);
                                              if (isFondoTarget) {
                                                updateSetting('precarga_bg_type', 'gradient');
                                                updateSetting('precarga_bg_gradient', selectedGradient);
                                              }
                                            } else if (selectedColor) {
                                              if (typeof selectedColor === 'string' && selectedColor.includes('gradient')) {
                                                updateSetting(bgTypeKey, 'gradient');
                                                updateSetting(gradKey, selectedColor);
                                                if (isFondoTarget) {
                                                  updateSetting('precarga_bg_type', 'gradient');
                                                  updateSetting('precarga_bg_gradient', selectedColor);
                                                }
                                              } else {
                                                updateSetting(bgTypeKey, 'color');
                                                updateSetting(bgColorKey, selectedColor);
                                                if (isFondoTarget) {
                                                  updateSetting('precarga_bg_type', 'color');
                                                  updateSetting('precarga_bg_color', selectedColor);
                                                }
                                              }
                                            }

                                            if (updated.borderWidth !== undefined) updateSetting(`${prefix}_border_width`, updated.borderWidth);
                                            if (updated.borderStyle !== undefined) updateSetting(`${prefix}_border_style`, updated.borderStyle);
                                            if (updated.borderColor !== undefined) updateSetting(`${prefix}_border_color`, updated.borderColor);
                                            if (updated.borderRadius !== undefined) updateSetting(`${prefix}_border_radius`, updated.borderRadius);
                                            if (updated.shadowColor !== undefined) updateSetting(`${prefix}_shadow_color`, updated.shadowColor);
                                            if (updated.shadowBlur !== undefined) updateSetting(`${prefix}_shadow_blur`, updated.shadowBlur);
                                            if (updated.shadowOffsetX !== undefined) updateSetting(`${prefix}_shadow_offset_x`, updated.shadowOffsetX);
                                            if (updated.shadowOffsetY !== undefined) updateSetting(`${prefix}_shadow_offset_y`, updated.shadowOffsetY);
                                          }}
                                        />
                                      </div>

                                      {/* Redondez */}
                                      <div>
                                        <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                          Redondez
                                        </label>
                                        <div
                                          className="flex items-center h-9 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full shadow-2xs"
                                          style={{
                                            backgroundColor: 'var(--bg-app)',
                                            borderColor: 'var(--border-color)',
                                          }}
                                        >
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const key = `${prefix}_border_radius`;
                                              const curr = parseInt(settings[key] ?? (isFondoTarget ? '0' : '16'));
                                              const nextVal = Math.max(0, curr - 2);
                                              updateSetting(key, nextVal);
                                            }}
                                            className="w-8 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                            style={{
                                              backgroundColor: 'var(--bg-card)',
                                              borderColor: 'var(--border-color)',
                                              color: 'var(--primary-accent)',
                                            }}
                                            title="Disminuir redondez"
                                          >
                                            <Minus size={12} />
                                          </button>

                                          <div className="flex-1 flex items-center justify-center px-1">
                                            <input
                                              type="number"
                                              min={0}
                                              max={100}
                                              value={settings[`${prefix}_border_radius`] ?? (isFondoTarget ? 0 : 16)}
                                              onChange={(e) => {
                                                const key = `${prefix}_border_radius`;
                                                updateSetting(key, parseInt(e.target.value) || 0);
                                              }}
                                              className="w-full h-full text-center bg-transparent outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                              style={{ color: 'var(--text-main)' }}
                                            />
                                            <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>
                                              px
                                            </span>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              const key = `${prefix}_border_radius`;
                                              const curr = parseInt(settings[key] ?? (isFondoTarget ? '0' : '16'));
                                              const nextVal = Math.min(100, curr + 2);
                                              updateSetting(key, nextVal);
                                            }}
                                            className="w-8 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                            style={{
                                              backgroundColor: 'var(--bg-card)',
                                              borderColor: 'var(--border-color)',
                                              color: 'var(--primary-accent)',
                                            }}
                                            title="Aumentar redondez"
                                          >
                                            <Plus size={12} />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Glass / Cristal */}
                                      <div>
                                        <div className="flex items-center justify-between mb-1">
                                          <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                            Glass (Blur)
                                          </label>
                                          <label className="relative flex items-center cursor-pointer shrink-0 select-none">
                                            <input
                                              type="checkbox"
                                              checked={
                                                isFondoTarget
                                                  ? (settings.precarga_screen_glass_enabled ?? false)
                                                  : (settings.precarga_card_glass_enabled ?? true)
                                              }
                                              onChange={(e) => {
                                                const key = isFondoTarget ? 'precarga_screen_glass_enabled' : 'precarga_card_glass_enabled';
                                                updateSetting(key, e.target.checked);
                                              }}
                                              className="sr-only peer"
                                            />
                                            <div
                                              className="w-4 h-4 rounded border flex items-center justify-center transition-all peer-checked:border-[var(--primary-accent)] peer-checked:bg-[var(--primary-accent)]"
                                              style={{
                                                borderColor: (isFondoTarget ? (settings.precarga_screen_glass_enabled ?? false) : (settings.precarga_card_glass_enabled ?? true)) ? 'var(--primary-accent)' : 'var(--border-color)',
                                                backgroundColor: (isFondoTarget ? (settings.precarga_screen_glass_enabled ?? false) : (settings.precarga_card_glass_enabled ?? true)) ? 'var(--primary-accent)' : 'var(--bg-card)',
                                              }}
                                            >
                                              {(isFondoTarget ? (settings.precarga_screen_glass_enabled ?? false) : (settings.precarga_card_glass_enabled ?? true)) && (
                                                <Check size={11} className="text-white stroke-[3]" />
                                              )}
                                            </div>
                                          </label>
                                        </div>

                                        <div
                                          className={`flex items-center h-9 rounded-xl border px-3 transition-opacity ${
                                            !(isFondoTarget ? (settings.precarga_screen_glass_enabled ?? false) : (settings.precarga_card_glass_enabled ?? true)) ? 'opacity-40 pointer-events-none' : ''
                                          }`}
                                          style={{
                                            backgroundColor: 'var(--bg-app)',
                                            borderColor: 'var(--border-color)',
                                          }}
                                        >
                                          <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="1"
                                            value={settings[`${prefix}_bg_opacity`] ?? 100}
                                            onChange={(e) => updateSetting(`${prefix}_bg_opacity`, parseInt(e.target.value))}
                                            className="w-full accent-[var(--primary-accent)] cursor-pointer h-1.5 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* COLUMNA DERECHA: BOTONES (NORMAL / SOBRE) */}
                              <div className="rounded-2xl p-3 border space-y-3 shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                <div>
                                  <div className="pb-2 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center gap-2">
                                      <MousePointerClick size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                      <div className="flex flex-col leading-tight">
                                        <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                          Botones ({buttonState === 'hover' ? 'Sobre' : 'Normal'})
                                        </h3>
                                        <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                          Estilos y efectos de botón
                                        </span>
                                      </div>
                                    </div>

                                    {/* PESTAÑAS NORMAL / SOBRE */}
                                    <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                      {[
                                        { id: 'normal', label: 'Normal' },
                                        { id: 'hover', label: 'Sobre' },
                                      ].map((modeItem) => {
                                        const isModeActive = buttonState === modeItem.id;
                                        return (
                                          <button
                                            key={modeItem.id}
                                            type="button"
                                            onClick={() => setButtonState(modeItem.id as any)}
                                            className="botab-item"
                                            style={{
                                              backgroundColor: isModeActive ? 'var(--primary-accent)' : 'transparent',
                                              color: isModeActive ? '#ffffff' : 'var(--text-muted)',
                                            }}
                                          >
                                            {modeItem.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="space-y-3 pt-2">
                                    {/* SUBIR IMAGEN / VIDEO DEL BOTÓN */}
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                          Imagen / Video ({buttonState === 'hover' ? 'Sobre' : 'Normal'})
                                        </label>
                                        <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer select-none" style={{ color: 'var(--text-muted)' }} title="Rotar orientación de video 90° en el botón">
                                          <input
                                            type="checkbox"
                                            checked={buttonVideoRotate}
                                            onChange={(e) => updateSetting(buttonVideoRotateKey, e.target.checked)}
                                            className="rounded border-gray-400 focus:ring-0 h-3 w-3 cursor-pointer"
                                            style={{ accentColor: 'var(--primary-accent)' }}
                                          />
                                          <span>Rotar Video</span>
                                        </label>
                                      </div>
                                      
                                      <div
                                        className="border-2 border-dashed rounded-2xl p-2 text-center flex flex-col items-center justify-center transition-all relative overflow-hidden group h-[120px] min-h-[120px]"
                                        style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                                      >
                                        {buttonImageUrl ? (
                                          <div className="relative w-full h-full rounded-xl overflow-hidden group bg-black/40 flex items-center justify-center">
                                            {buttonBgType === 'video' || String(buttonImageUrl).startsWith('data:video') || String(buttonImageUrl).match(/\.(mp4|webm|ogg)$/i) ? (
                                              <video
                                                src={buttonImageUrl}
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className="w-full h-full object-contain"
                                              />
                                            ) : (
                                              <img
                                                src={buttonImageUrl}
                                                alt="Imagen del botón"
                                                className="w-full h-full object-contain"
                                              />
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                              <label className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/40 cursor-pointer transition-colors" title="Cambiar archivo">
                                                <Upload size={16} />
                                                <input
                                                  type="file"
                                                  accept="image/*,video/*"
                                                  className="hidden"
                                                  onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                      const isVideo = file.type.startsWith('video/');
                                                      const reader = new FileReader();
                                                      reader.onload = (ev) => {
                                                        updateSetting(buttonImageKey, ev.target?.result);
                                                        updateSetting(buttonBgTypeKey, isVideo ? 'video' : 'image');
                                                      };
                                                      reader.readAsDataURL(file);
                                                    }
                                                  }}
                                                />
                                              </label>
                                              <button
                                                type="button"
                                                onClick={() => updateSetting(buttonImageKey, '')}
                                                className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-600 transition-colors"
                                                title="Eliminar archivo"
                                              >
                                                <Trash2 size={16} />
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                                            <div className="p-2.5 rounded-full mb-1.5" style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}>
                                              <Upload size={18} />
                                            </div>
                                            <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Subir Imagen / Video</span>
                                            <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>PNG, JPG, MP4 o WEBM</span>
                                            <input
                                              type="file"
                                              accept="image/*,video/*"
                                              className="hidden"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  const isVideo = file.type.startsWith('video/');
                                                  const reader = new FileReader();
                                                  reader.onload = (ev) => {
                                                    updateSetting(buttonImageKey, ev.target?.result);
                                                    updateSetting(buttonBgTypeKey, isVideo ? 'video' : 'image');
                                                  };
                                                  reader.readAsDataURL(file);
                                                }
                                              }}
                                            />
                                          </label>
                                        )}
                                      </div>
                                    </div>

                                    {/* CONTROLES DERECHA: ESTILO, REDONDEZ, GLASS */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end pt-1">
                                      {/* Estilo */}
                                      <div>
                                        <StylePickerPopover
                                          label={`Estilo (${buttonState === 'hover' ? 'Sobre' : 'Normal'})`}
                                          elementType="box"
                                          eventColors={eventColors.length > 0 ? eventColors : ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B']}
                                          eventColorImage={eventColorImage}
                                          styleConfig={{
                                            backgroundColor: settings[`${buttonPrefix}_bg_type`] === 'gradient' && settings[`${buttonPrefix}_gradient_data`]
                                              ? (typeof settings[`${buttonPrefix}_gradient_data`] === 'string' ? settings[`${buttonPrefix}_gradient_data`] : settings[`${buttonPrefix}_bg_color`] || '#E07A5F')
                                              : (settings[`${buttonPrefix}_bg_color`] || '#E07A5F'),
                                            borderWidth: settings[`${buttonPrefix}_border_width`] ?? 0,
                                            borderStyle: settings[`${buttonPrefix}_border_style`] || 'solid',
                                            borderColor: settings[`${buttonPrefix}_border_color`] || '#E07A5F',
                                            borderRadius: settings[`${buttonPrefix}_border_radius`] ?? 12,
                                            shadowColor: settings[`${buttonPrefix}_shadow_color`] || '#000000',
                                            shadowBlur: settings[`${buttonPrefix}_shadow_blur`] ?? 0,
                                            shadowOffsetX: settings[`${buttonPrefix}_shadow_offset_x`] ?? 0,
                                            shadowOffsetY: settings[`${buttonPrefix}_shadow_offset_y`] ?? 0,
                                          }}
                                          onChange={(updated) => {
                                            const prefix = buttonPrefix;
                                            const bgPrefix = `${prefix}_bg`;
                                            const gradKey = `${prefix}_gradient_data`;

                                            const selectedColor = updated.backgroundColor || updated.fillColor;
                                            const selectedGradient = updated.fillGradient;

                                            if (updated.fillType === 'gradient' && selectedGradient) {
                                              updateSetting(`${bgPrefix}_type`, 'gradient');
                                              updateSetting(gradKey, selectedGradient);
                                            } else if (selectedColor) {
                                              if (typeof selectedColor === 'string' && selectedColor.includes('gradient')) {
                                                updateSetting(`${bgPrefix}_type`, 'gradient');
                                                updateSetting(gradKey, selectedColor);
                                              } else {
                                                updateSetting(`${bgPrefix}_type`, 'color');
                                                updateSetting(`${bgPrefix}_color`, selectedColor);
                                              }
                                            }

                                            if (updated.borderWidth !== undefined) updateSetting(`${prefix}_border_width`, updated.borderWidth);
                                            if (updated.borderStyle !== undefined) updateSetting(`${prefix}_border_style`, updated.borderStyle);
                                            if (updated.borderColor !== undefined) updateSetting(`${prefix}_border_color`, updated.borderColor);
                                            if (updated.borderRadius !== undefined) updateSetting(`${prefix}_border_radius`, updated.borderRadius);
                                            if (updated.shadowColor !== undefined) updateSetting(`${prefix}_shadow_color`, updated.shadowColor);
                                            if (updated.shadowBlur !== undefined) updateSetting(`${prefix}_shadow_blur`, updated.shadowBlur);
                                            if (updated.shadowOffsetX !== undefined) updateSetting(`${prefix}_shadow_offset_x`, updated.shadowOffsetX);
                                            if (updated.shadowOffsetY !== undefined) updateSetting(`${prefix}_shadow_offset_y`, updated.shadowOffsetY);
                                          }}
                                        />
                                      </div>

                                      {/* Redondez */}
                                      <div>
                                        <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                          Redondez
                                        </label>
                                        <div
                                          className="flex items-center h-9 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full shadow-2xs"
                                          style={{
                                            backgroundColor: 'var(--bg-app)',
                                            borderColor: 'var(--border-color)',
                                          }}
                                        >
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const key = `${buttonPrefix}_border_radius`;
                                              const curr = parseInt(settings[key] ?? '12');
                                              const nextVal = Math.max(0, curr - 2);
                                              updateSetting(key, nextVal);
                                            }}
                                            className="w-8 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                            style={{
                                              backgroundColor: 'var(--bg-card)',
                                              borderColor: 'var(--border-color)',
                                              color: 'var(--primary-accent)',
                                            }}
                                            title="Disminuir redondez"
                                          >
                                            <Minus size={12} />
                                          </button>

                                          <div className="flex-1 flex items-center justify-center px-1">
                                            <input
                                              type="number"
                                              min={0}
                                              max={100}
                                              value={settings[`${buttonPrefix}_border_radius`] ?? 12}
                                              onChange={(e) => {
                                                const key = `${buttonPrefix}_border_radius`;
                                                updateSetting(key, parseInt(e.target.value) || 0);
                                              }}
                                              className="w-full h-full text-center bg-transparent outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                              style={{ color: 'var(--text-main)' }}
                                            />
                                            <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>
                                              px
                                            </span>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              const key = `${buttonPrefix}_border_radius`;
                                              const curr = parseInt(settings[key] ?? '12');
                                              const nextVal = Math.min(100, curr + 2);
                                              updateSetting(key, nextVal);
                                            }}
                                            className="w-8 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                            style={{
                                              backgroundColor: 'var(--bg-card)',
                                              borderColor: 'var(--border-color)',
                                              color: 'var(--primary-accent)',
                                            }}
                                            title="Aumentar redondez"
                                          >
                                            <Plus size={12} />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Glass */}
                                      <div>
                                        <div className="flex items-center justify-between mb-1">
                                          <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                            Glass ({settings[`${buttonPrefix}_bg_opacity`] ?? 100}%)
                                          </label>
                                          <label className="relative flex items-center cursor-pointer shrink-0 select-none">
                                            <input
                                              type="checkbox"
                                              checked={settings[`${buttonPrefix}_glass_enabled`] ?? true}
                                              onChange={(e) => {
                                                const key = `${buttonPrefix}_glass_enabled`;
                                                updateSetting(key, e.target.checked);
                                              }}
                                              className="sr-only peer"
                                            />
                                            <div
                                              className="w-4 h-4 rounded border flex items-center justify-center transition-all peer-checked:border-[var(--primary-accent)] peer-checked:bg-[var(--primary-accent)]"
                                              style={{
                                                borderColor: (settings[`${buttonPrefix}_glass_enabled`] ?? true) ? 'var(--primary-accent)' : 'var(--border-color)',
                                                backgroundColor: (settings[`${buttonPrefix}_glass_enabled`] ?? true) ? 'var(--primary-accent)' : 'var(--bg-card)',
                                              }}
                                            >
                                              {(settings[`${buttonPrefix}_glass_enabled`] ?? true) && (
                                                <Check size={11} className="text-white stroke-[3]" />
                                              )}
                                            </div>
                                          </label>
                                        </div>

                                        <div
                                          className={`flex items-center h-9 rounded-xl border px-3 transition-opacity ${
                                            !(settings[`${buttonPrefix}_glass_enabled`] ?? true) ? 'opacity-40 pointer-events-none' : ''
                                          }`}
                                          style={{
                                            backgroundColor: 'var(--bg-app)',
                                            borderColor: 'var(--border-color)',
                                          }}
                                        >
                                          <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="1"
                                            value={settings[`${buttonPrefix}_bg_opacity`] ?? 100}
                                            onChange={(e) => {
                                              const key = `${buttonPrefix}_bg_opacity`;
                                              updateSetting(key, parseInt(e.target.value));
                                            }}
                                            className="w-full h-1.5 rounded-lg cursor-pointer"
                                            style={{
                                              accentColor: 'var(--primary-accent)',
                                            }}
                                            title="Opacidad del vidrio"
                                            disabled={!(settings[`${buttonPrefix}_glass_enabled`] ?? true)}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* 2.1.3 SUB-PESTAÑA LOGOS EN PRECARGA / QR (EXCLUSIVAMENTE LOGO DEL PROYECTO) */}
                        {precargaSubTab === 'logos' && (() => {
                          const displayProjectLogo = settings.project_logo_precarga_url || '/dinvited.png';

                          // Estado activo del logo en Precarga/QR: 'precarga' o 'qr'
                          const activePrecargaState = precargaLogoState;

                          // Helper para Partner/Project Logo en Precarga o QR
                          const getPrecargaPartnerVal = (field: string, defaultVal: any) => {
                            const statePrefix = activePrecargaState === 'qr' ? 'qr_' : '';
                            const key = `partner_logo_${statePrefix}precarga_${field}`;
                            if (settings[key] !== undefined) return settings[key];
                            // Fallback al valor general de precarga si es QR
                            if (activePrecargaState === 'qr' && settings[`partner_logo_precarga_${field}`] !== undefined) {
                              return settings[`partner_logo_precarga_${field}`];
                            }
                            return defaultVal;
                          };

                          const updatePrecargaPartnerLogo = (field: string, value: any) => {
                            const statePrefix = activePrecargaState === 'qr' ? 'qr_' : '';
                            updateSetting(`partner_logo_${statePrefix}precarga_${field}`, value);
                          };

                          const partnerV = getPrecargaPartnerVal('position_v', 'bottom');
                          const partnerH = getPrecargaPartnerVal('position_h', 'center');
                          const partnerSize = getPrecargaPartnerVal('size', 40);
                          const partnerUnit = getPrecargaPartnerVal('unit', 'px');

                          const precargaVisible = settings.precarga_show_logo ?? settings.partner_logo_show_precarga ?? true;
                          const qrVisible = settings.qr_show_logo ?? settings.partner_logo_show_qr ?? true;
                          const isCurrentVisible = activePrecargaState === 'qr' ? qrVisible : precargaVisible;

                          const stateLabels: Record<string, string> = { precarga: 'Precarga', qr: 'QR' };

                          return (
                            <div className="w-full">
                              {/* BLOQUE: LOGO DEL PROYECTO (POWERED BY) EN PRECARGA / QR */}
                              <div className="rounded-2xl p-3 border shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                <div>
                                  <div className="pb-2 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center gap-2">
                                      <ImageIcon size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                      <div className="flex flex-col leading-tight">
                                        <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                                          <span>Logo del Programa</span>
                                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase text-white shadow-2xs" style={{ backgroundColor: 'var(--primary-accent)' }}>
                                            {stateLabels[activePrecargaState]}
                                          </span>
                                        </h3>
                                        <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                          Logo dInvited del pie de pantalla de {stateLabels[activePrecargaState].toLowerCase()}
                                        </span>
                                      </div>
                                    </div>

                                    {/* CONTROLES DE PANTALLA (PRECARGA / QR) Y VISIBILIDAD EN CADA BOTAB */}
                                     <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                       {[
                                         { id: 'precarga', label: 'Precarga', icon: Hourglass, showKey: 'precarga_show_logo', partnerKey: 'partner_logo_show_precarga' },
                                         { id: 'qr', label: 'QR', icon: QrCode, showKey: 'qr_show_logo', partnerKey: 'partner_logo_show_qr' },
                                       ].map((st) => {
                                         const Icon = st.icon;
                                         const isSelected = activePrecargaState === st.id;
                                         const isVisible = st.id === 'qr' ? qrVisible : precargaVisible;
                                         return (
                                           <div
                                             key={st.id}
                                             onClick={() => {
                                               setPrecargaLogoState(st.id as any);
                                               setPreviewView(st.id);
                                             }}
                                             className="botab-item select-none cursor-pointer"
                                             style={{
                                               backgroundColor: isSelected ? 'var(--primary-accent)' : 'transparent',
                                               color: isSelected ? '#ffffff' : 'var(--text-muted)',
                                             }}
                                           >
                                             {/* CHECK / VISIBILIDAD A LA IZQUIERDA DEL BOTAB */}
                                             <button
                                               type="button"
                                               onClick={(e) => {
                                                 e.stopPropagation();
                                                 updateSetting(st.showKey, !isVisible);
                                                 updateSetting(st.partnerKey, !isVisible);
                                               }}
                                               className="flex items-center justify-center transition-all cursor-pointer opacity-90 hover:opacity-100 mr-0.5"
                                               style={{
                                                 color: isSelected ? '#ffffff' : isVisible ? 'var(--primary-accent)' : 'var(--text-muted)',
                                               }}
                                               title={isVisible ? `Visible en ${st.label} (Clic para ocultar)` : `Oculto en ${st.label} (Clic para mostrar)`}
                                             >
                                               {isVisible ? <Check size={12} className="stroke-[3]" /> : <EyeOff size={11} className="opacity-40" />}
                                             </button>

                                             <Icon size={12} />
                                             <span>{st.label}</span>
                                           </div>
                                         );
                                       })}
                                     </div>
                                   </div>

                                   {/* GRID INTERNO: VISTA PREVIA Y CONTROLES */}
                                   <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
                                     {/* VISTA PREVIA */}
                                     <div className="md:col-span-4 flex flex-col items-center justify-center">
                                       <div
                                         className="relative w-full h-full min-h-[85px] rounded-xl border overflow-hidden flex flex-col items-center justify-center p-2 shrink-0"
                                         style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                                       >
                                         {(() => {
                                           const statePrefix = activePrecargaState === 'qr' ? 'qr_' : '';
                                           const poweredPos = settings[`${statePrefix}powered_by_position`] || settings[`partner_logo_${statePrefix}precarga_powered_by_position`] || settings.precarga_powered_by_position || 'top';
                                           let flexDirClass = 'flex-col';
                                           if (poweredPos === 'bottom') flexDirClass = 'flex-col-reverse';
                                           else if (poweredPos === 'left') flexDirClass = 'flex-row items-center';
                                           else if (poweredPos === 'right') flexDirClass = 'flex-row-reverse items-center';

                                           const poweredText = settings[`${statePrefix}powered_by_text`] || settings.precarga_powered_by_text || 'Powered by';

                                           return (
                                             <div className={`flex ${flexDirClass} items-center justify-center gap-1.5`}>
                                               <span
                                                 className="tracking-widest uppercase select-none text-[9px] font-extrabold opacity-80 shrink-0"
                                                 style={{
                                                   fontFamily: settings.precarga_powered_by_font_family || 'Inter',
                                                   color: settings.precarga_powered_by_font_color || 'var(--text-main)',
                                                 }}
                                               >
                                                 {poweredText}
                                               </span>
                                               {displayProjectLogo ? (
                                                 <img src={displayProjectLogo} alt="Logo del Programa" className="max-h-10 max-w-full object-contain drop-shadow-md shrink-0" />
                                               ) : (
                                                 <div className="flex flex-col items-center justify-center text-center p-2 shrink-0">
                                                   <ImageIcon size={20} className="opacity-40 mb-1" style={{ color: 'var(--text-muted)' }} />
                                                   <span className="text-xs font-bold opacity-75" style={{ color: 'var(--text-main)' }}>Sin logo</span>
                                                 </div>
                                               )}
                                             </div>
                                           );
                                         })()}
                                       </div>
                                     </div>

                                     {/* CONTROLES LOGO PROGRAMA */}
                                     <div className="md:col-span-8 space-y-2.5">
                                       <div className="grid grid-cols-2 gap-2">
                                         {/* Vert */}
                                         <div>
                                           <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Alineación Vertical</label>
                                           <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                             {[
                                               { id: 'top', label: 'Arriba' },
                                               { id: 'center', label: 'Centro' },
                                               { id: 'bottom', label: 'Abajo' },
                                             ].map((pos) => (
                                               <button
                                                 key={pos.id}
                                                 type="button"
                                                 onClick={() => updatePrecargaPartnerLogo('position_v', pos.id)}
                                                 className="botab-item flex-1 text-center"
                                                 style={{
                                                   backgroundColor: partnerV === pos.id ? 'var(--primary-accent)' : 'transparent',
                                                   color: partnerV === pos.id ? '#ffffff' : 'var(--text-muted)',
                                                 }}
                                               >
                                                 {pos.label}
                                               </button>
                                             ))}
                                           </div>
                                         </div>

                                         {/* Horiz */}
                                         <div>
                                           <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Alineación Horizontal</label>
                                           <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                             {[
                                               { id: 'left', label: 'Izq' },
                                               { id: 'center', label: 'Centro' },
                                               { id: 'right', label: 'Der' },
                                             ].map((pos) => (
                                               <button
                                                 key={pos.id}
                                                 type="button"
                                                 onClick={() => updatePrecargaPartnerLogo('position_h', pos.id)}
                                                 className="botab-item flex-1 text-center"
                                                 style={{
                                                   backgroundColor: partnerH === pos.id ? 'var(--primary-accent)' : 'transparent',
                                                   color: partnerH === pos.id ? '#ffffff' : 'var(--text-muted)',
                                                 }}
                                               >
                                                 {pos.label}
                                               </button>
                                             ))}
                                           </div>
                                         </div>
                                       </div>

                                       {/* Tamaño y Ubicación Texto Powered By */}
                                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                         <div>
                                           <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Tamaño / Ancho Máximo</label>
                                           <CtrlPixelPorcentage
                                             value={partnerSize}
                                             unit={partnerUnit}
                                             onChangeValue={(v) => updatePrecargaPartnerLogo('size', v)}
                                             onChangeUnit={(u) => updatePrecargaPartnerLogo('unit', u)}
                                             min={10}
                                             max={partnerUnit === '%' ? 100 : 300}
                                           />
                                         </div>

                                         <div>
                                           <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Ubicación Texto</label>
                                           <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                             {[
                                               { id: 'top', label: 'Arriba' },
                                               { id: 'bottom', label: 'Abajo' },
                                               { id: 'left', label: 'Izq' },
                                               { id: 'right', label: 'Der' },
                                             ].map((posItem) => {
                                               const statePrefix = activePrecargaState === 'qr' ? 'qr_' : '';
                                               const currentPos = settings[`${statePrefix}powered_by_position`] || settings[`partner_logo_${statePrefix}precarga_powered_by_position`] || settings.precarga_powered_by_position || 'top';
                                               const isPosActive = currentPos === posItem.id;
                                               return (
                                                 <button
                                                   key={posItem.id}
                                                   type="button"
                                                   onClick={() => {
                                                     updateSetting(`${statePrefix}powered_by_position`, posItem.id);
                                                     updateSetting(`partner_logo_${statePrefix}precarga_powered_by_position`, posItem.id);
                                                   }}
                                                   className="botab-item flex-1 text-center"
                                                   style={{
                                                     backgroundColor: isPosActive ? 'var(--primary-accent)' : 'transparent',
                                                     color: isPosActive ? '#ffffff' : 'var(--text-muted)',
                                                   }}
                                                 >
                                                   {posItem.label}
                                                 </button>
                                               );
                                             })}
                                           </div>
                                         </div>
                                       </div>

                                       {/* Márgenes */}
                                       <div className="pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--border-color)' }}>
                                         <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Márgenes</label>
                                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                           {[
                                             { field: 'margin_top', unitField: 'margin_top_unit', label: 'Arriba' },
                                             { field: 'margin_bottom', unitField: 'margin_bottom_unit', label: 'Abajo' },
                                             { field: 'margin_left', unitField: 'margin_left_unit', label: 'Izquierda' },
                                             { field: 'margin_right', unitField: 'margin_right_unit', label: 'Derecha' },
                                           ].map((m) => {
                                             const val = getPrecargaPartnerVal(m.field, 0);
                                             const currentUnit = getPrecargaPartnerVal(m.unitField, 'px');
                                             return (
                                               <div key={m.field} className="flex flex-col gap-0.5">
                                                 <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                                                 <CtrlPixelPorcentage
                                                   value={val}
                                                   unit={currentUnit}
                                                   onChangeValue={(v) => updatePrecargaPartnerLogo(m.field, v)}
                                                   onChangeUnit={(u) => updatePrecargaPartnerLogo(m.unitField, u)}
                                                 />
                                               </div>
                                             );
                                           })}
                                         </div>
                                       </div>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             </div>
                         );
                       })()}
                     </div>
                   )}



                   {/* 2.2 SUB-PESTAÑA EVENTO (UNIFICADA) */}
                    {welcomeSubTab === 'evento' && (
                      <div className="space-y-4">
                        {/* 2.2.1 SUB-PESTAÑA FUENTES EN BIENVENIDA (ESTRUCTURA Y CAMPOS DE PRECARGA/QR) */}
                        {bienvenidaSubTab === 'fuentes' && (() => {
                          const activeTarget = precargaTextTarget === 'button' || precargaTextTarget === 'powered_by' ? 'title' : precargaTextTarget;

                          const getTargetSubtitle = () => {
                            if (activeTarget === 'title') return 'Título Principal';
                            if (activeTarget === 'event') return 'Subtítulo del Evento';
                            return 'Contenido';
                          };

                          return (
                          <div className="space-y-4">
                            {/* 1. TARJETA SUPERIOR: FUENTES Y TEXTOS DE BIENVENIDA */}
                            <div className="rounded-2xl p-4 border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                              <div className="pb-2 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-2.5">
                                  <Type size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                  <div className="flex flex-col leading-tight">
                                    <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                      Fuentes y Textos de Bienvenida
                                    </h3>
                                    <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                      {getTargetSubtitle()}
                                    </span>
                                  </div>
                                </div>

                                {/* PESTAÑAS TÍTULO / SUBTÍTULO / CONTENIDO EN EL LADO DERECHO */}
                                <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                  {[
                                    { id: 'title', label: 'Título' },
                                    { id: 'event', label: 'Subtítulo' },
                                    { id: 'subtitle', label: 'Contenido' },
                                  ].map((targetItem) => {
                                    const isTargetActive = activeTarget === targetItem.id;
                                    return (
                                      <button
                                        key={targetItem.id}
                                        type="button"
                                        onClick={() => setPrecargaTextTarget(targetItem.id as any)}
                                        className="botab-item flex items-center gap-1"
                                        style={{
                                          backgroundColor: isTargetActive ? 'var(--primary-accent)' : 'transparent',
                                          color: isTargetActive ? '#ffffff' : 'var(--text-muted)',
                                        }}
                                      >
                                        <span>{targetItem.label}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* CONTROLES DE TEXTO, TIPOGRAFÍA Y ESTILOS */}
                              <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
                                {/* CAMPO TEXTO / CONTENIDO */}
                                <div className="w-full md:w-52 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                    {activeTarget === 'title' ? 'Texto del Título' : activeTarget === 'event' ? 'Texto del Evento' : 'Texto del Contenido'}
                                  </label>
                                  <input
                                    type="text"
                                    readOnly={activeTarget === 'event'}
                                    disabled={activeTarget === 'event'}
                                    value={
                                      activeTarget === 'title'
                                        ? (settings.welcome_title ?? '¡Bienvenido al evento!')
                                        : activeTarget === 'event'
                                        ? (eventData?.event_name || eventData?.name || eventData?.title || settings.welcome_event || settings.event_name || 'Evento')
                                        : (settings.welcome_subtitle ?? 'Prepárate para capturar los mejores momentos')
                                    }
                                    onChange={(e) => {
                                      if (activeTarget === 'title') {
                                        updateSetting('welcome_title', e.target.value);
                                      } else if (activeTarget === 'subtitle') {
                                        updateSetting('welcome_subtitle', e.target.value);
                                      }
                                    }}
                                    placeholder={activeTarget === 'title' ? 'Ej: Título del Evento' : activeTarget === 'event' ? 'Nombre del Evento' : 'Ej: Mensaje de Bienvenida'}
                                    className={`w-full h-9 rounded-xl px-3 border outline-none text-xs font-medium ${activeTarget === 'event' ? 'opacity-70 cursor-not-allowed select-none' : ''}`}
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                  />
                                </div>

                                {/* FUENTE */}
                                <div className="flex-1 min-w-[180px]">
                                  <FontPicker
                                    label="Fuente"
                                    value={
                                      settings[`welcome_${activeTarget}_font_family`] ||
                                      (activeTarget === 'title' || activeTarget === 'event' ? (settings.global_title_font_family || 'Inter') : (settings.global_text_font_family || 'Inter'))
                                    }
                                    onChange={(f) => updateSetting(`welcome_${activeTarget}_font_family`, f)}
                                  />
                                </div>

                                {/* TAMAÑO */}
                                <div className="w-full md:w-36 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                    Tamaño
                                  </label>
                                  <div
                                    className="flex items-center h-9 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full shadow-2xs"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const defaultSize = activeTarget === 'title' ? 18 : 12;
                                        const curr = parseFloat(settings[`welcome_${activeTarget}_font_size`] || defaultSize.toString());
                                        updateSetting(`welcome_${activeTarget}_font_size`, Math.max(5, curr - 0.5).toString());
                                      }}
                                      className="w-8 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                                    >
                                      <Minus size={12} />
                                    </button>

                                    <div className="flex-1 flex items-center justify-center px-1">
                                      <input
                                        type="number"
                                        min={5}
                                        max={80}
                                        step={0.5}
                                        value={
                                          settings[`welcome_${activeTarget}_font_size`] ||
                                          (activeTarget === 'title' ? '18' : '12')
                                        }
                                        onChange={(e) => updateSetting(`welcome_${activeTarget}_font_size`, e.target.value)}
                                        className="w-full h-full text-center bg-transparent outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        style={{ color: 'var(--text-main)' }}
                                      />
                                      <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>px</span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const defaultSize = activeTarget === 'title' ? 18 : 12;
                                        const curr = parseFloat(settings[`welcome_${activeTarget}_font_size`] || defaultSize.toString());
                                        updateSetting(`welcome_${activeTarget}_font_size`, Math.min(80, curr + 0.5).toString());
                                      }}
                                      className="w-8 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                </div>

                                 {/* FORMATO */}
                                <div className="w-full md:w-28 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Formato</label>
                                  <div className="flex items-center h-9 rounded-xl border p-0.5 gap-0.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting(`welcome_${activeTarget}_font_weight`, settings[`welcome_${activeTarget}_font_weight`] === 'bold' ? 'normal' : 'bold')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                      style={{
                                        backgroundColor: settings[`welcome_${activeTarget}_font_weight`] === 'bold' ? 'var(--primary-accent)' : 'transparent',
                                        color: settings[`welcome_${activeTarget}_font_weight`] === 'bold' ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                      title="Negrita"
                                    >
                                      <Bold size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting(`welcome_${activeTarget}_font_style`, settings[`welcome_${activeTarget}_font_style`] === 'italic' ? 'normal' : 'italic')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                      style={{
                                        backgroundColor: settings[`welcome_${activeTarget}_font_style`] === 'italic' ? 'var(--primary-accent)' : 'transparent',
                                        color: settings[`welcome_${activeTarget}_font_style`] === 'italic' ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                      title="Itálica"
                                    >
                                      <Italic size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting(`welcome_${activeTarget}_text_decoration`, settings[`welcome_${activeTarget}_text_decoration`] === 'underline' ? 'none' : 'underline')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                      style={{
                                        backgroundColor: settings[`welcome_${activeTarget}_text_decoration`] === 'underline' ? 'var(--primary-accent)' : 'transparent',
                                        color: settings[`welcome_${activeTarget}_text_decoration`] === 'underline' ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                      title="Subrayado"
                                    >
                                      <Underline size={13} />
                                    </button>
                                  </div>
                                </div>

                                {/* ALINEACIÓN */}
                                <div className="w-full md:w-32 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Alineación</label>
                                  <div className="flex items-center h-9 rounded-xl border p-0.5 gap-0.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                    {[
                                      { id: 'left', icon: AlignLeft, title: 'Izquierda' },
                                      { id: 'center', icon: AlignCenter, title: 'Centro' },
                                      { id: 'right', icon: AlignRight, title: 'Derecha' },
                                      { id: 'justify', icon: AlignJustify, title: 'Justificado' },
                                    ].map((align) => {
                                      const AlignIcon = align.icon;
                                      const isAlignActive = (settings[`welcome_${activeTarget}_text_align`] || 'center') === align.id;
                                      return (
                                        <button
                                          key={align.id}
                                          type="button"
                                          onClick={() => updateSetting(`welcome_${activeTarget}_text_align`, align.id)}
                                          className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                          style={{
                                            backgroundColor: isAlignActive ? 'var(--primary-accent)' : 'transparent',
                                            color: isAlignActive ? '#ffffff' : 'var(--text-muted)',
                                          }}
                                          title={align.title}
                                        >
                                          <AlignIcon size={13} />
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* ESTILO DEL TEXTO (StylePickerPopover) */}
                                <div className="w-full md:w-32 shrink-0">
                                  <StylePickerPopover
                                    label="Estilo"
                                    elementType="text"
                                    eventColors={eventColors.length > 0 ? eventColors : ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B']}
                                    eventColorImage={eventColorImage}
                                    styleConfig={{
                                      fillType: 'color',
                                      fillColor: settings[`welcome_${activeTarget}_font_color`] || '#ffffff',
                                      strokeActive: settings[`welcome_${activeTarget}_stroke_active`] || false,
                                      strokeColor: settings[`welcome_${activeTarget}_stroke_color`] || '#000000',
                                      strokeWidth: parseInt(settings[`welcome_${activeTarget}_stroke_width`] || '2'),
                                      strokeType: settings[`welcome_${activeTarget}_stroke_type`] || 'OUT',
                                      shadowActive: settings[`welcome_${activeTarget}_shadow_active`] || false,
                                      shadowColor: settings[`welcome_${activeTarget}_shadow_color`] || '#000000',
                                      shadowBlur: parseInt(settings[`welcome_${activeTarget}_shadow_blur`] || '8'),
                                    }}
                                    onChange={(updated) => {
                                      if (updated.fillColor) updateSetting(`welcome_${activeTarget}_font_color`, updated.fillColor);
                                      if (updated.strokeActive !== undefined) updateSetting(`welcome_${activeTarget}_stroke_active`, updated.strokeActive);
                                      if (updated.strokeColor) updateSetting(`welcome_${activeTarget}_stroke_color`, updated.strokeColor);
                                      if (updated.strokeWidth !== undefined) updateSetting(`welcome_${activeTarget}_stroke_width`, updated.strokeWidth.toString());
                                      if (updated.strokeType) updateSetting(`welcome_${activeTarget}_stroke_type`, updated.strokeType);
                                      if (updated.shadowActive !== undefined) updateSetting(`welcome_${activeTarget}_shadow_active`, updated.shadowActive);
                                      if (updated.shadowColor) updateSetting(`welcome_${activeTarget}_shadow_color`, updated.shadowColor);
                                      if (updated.shadowBlur !== undefined) updateSetting(`welcome_${activeTarget}_shadow_blur`, updated.shadowBlur.toString());
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* 2. TARJETA INFERIOR: FUENTE Y ESTILOS DE BOTÓN (NORMAL / SOBRE) */}
                            <div className="rounded-2xl p-4 border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                              <div className="pb-2 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-2.5">
                                  <MousePointer2 size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                  <div className="flex flex-col leading-tight">
                                    <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                      Fuente y Estilo de Botón ({buttonState === 'hover' ? 'Sobre' : 'Normal'})
                                    </h3>
                                    <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                      Tipografía, alineación, formato y estilo de texto del botón
                                    </span>
                                  </div>
                                </div>

                                <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                  {[
                                    { id: 'normal', label: 'Normal' },
                                    { id: 'hover', label: 'Sobre' },
                                  ].map((modeItem) => {
                                    const isModeActive = buttonState === modeItem.id;
                                    return (
                                      <button
                                        key={modeItem.id}
                                        type="button"
                                        onClick={() => setButtonState(modeItem.id as any)}
                                        className="botab-item"
                                        style={{
                                          backgroundColor: isModeActive ? 'var(--primary-accent)' : 'transparent',
                                          color: isModeActive ? '#ffffff' : 'var(--text-muted)',
                                        }}
                                      >
                                        {modeItem.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
                                {/* TEXTO DEL BOTÓN */}
                                <div className="w-full md:w-52 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                    Texto del Botón
                                  </label>
                                  <input
                                    type="text"
                                    value={settings.welcome_button_text ?? 'Continuar'}
                                    onChange={(e) => updateSetting('welcome_button_text', e.target.value)}
                                    placeholder="Ej: Continuar"
                                    className="w-full h-9 rounded-xl px-3 border outline-none text-xs font-medium"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                  />
                                </div>

                                {/* FUENTE */}
                                <div className="flex-1 min-w-[180px]">
                                  <FontPicker
                                    label="Fuente"
                                    value={settings.welcome_button_font_family || settings.global_button_font_family || 'Inter'}
                                    onChange={(f) => updateSetting('welcome_button_font_family', f)}
                                  />
                                </div>

                                {/* TAMAÑO */}
                                <div className="w-full md:w-36 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Tamaño</label>
                                  <div className="flex items-center h-9 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const curr = parseFloat(settings.welcome_button_font_size || '14');
                                        updateSetting('welcome_button_font_size', Math.max(5, curr - 0.5).toString());
                                      }}
                                      className="w-8 h-full flex items-center justify-center border-r hover:bg-black/5 cursor-pointer shrink-0"
                                      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                                    >
                                      <Minus size={12} />
                                    </button>
                                    <div className="flex-1 flex items-center justify-center px-1">
                                      <input
                                        type="number"
                                        min={5}
                                        max={80}
                                        step={0.5}
                                        value={settings.welcome_button_font_size || '14'}
                                        onChange={(e) => updateSetting('welcome_button_font_size', e.target.value)}
                                        className="w-full h-full text-center bg-transparent outline-none font-bold text-xs"
                                        style={{ color: 'var(--text-main)' }}
                                      />
                                      <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>px</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const curr = parseFloat(settings.welcome_button_font_size || '14');
                                        updateSetting('welcome_button_font_size', Math.min(80, curr + 0.5).toString());
                                      }}
                                      className="w-8 h-full flex items-center justify-center border-l hover:bg-black/5 cursor-pointer shrink-0"
                                      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                </div>

                                {/* FORMATO */}
                                <div className="w-full md:w-28 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Formato</label>
                                  <div className="flex items-center h-9 rounded-xl border p-0.5 gap-0.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting('welcome_button_font_weight', settings.welcome_button_font_weight === 'bold' ? 'normal' : 'bold')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center cursor-pointer"
                                      style={{ backgroundColor: settings.welcome_button_font_weight === 'bold' ? 'var(--primary-accent)' : 'transparent', color: settings.welcome_button_font_weight === 'bold' ? '#ffffff' : 'var(--text-muted)' }}
                                    >
                                      <Bold size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting('welcome_button_font_style', settings.welcome_button_font_style === 'italic' ? 'normal' : 'italic')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center cursor-pointer"
                                      style={{ backgroundColor: settings.welcome_button_font_style === 'italic' ? 'var(--primary-accent)' : 'transparent', color: settings.welcome_button_font_style === 'italic' ? '#ffffff' : 'var(--text-muted)' }}
                                    >
                                      <Italic size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting('welcome_button_text_decoration', settings.welcome_button_text_decoration === 'underline' ? 'none' : 'underline')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center cursor-pointer"
                                      style={{ backgroundColor: settings.welcome_button_text_decoration === 'underline' ? 'var(--primary-accent)' : 'transparent', color: settings.welcome_button_text_decoration === 'underline' ? '#ffffff' : 'var(--text-muted)' }}
                                    >
                                      <Underline size={13} />
                                    </button>
                                  </div>
                                </div>

                                {/* ALINEACIÓN */}
                                <div className="w-full md:w-32 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Alineación</label>
                                  <div className="flex items-center h-9 rounded-xl border p-0.5 gap-0.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                    {[
                                      { id: 'left', icon: AlignLeft, title: 'Izquierda' },
                                      { id: 'center', icon: AlignCenter, title: 'Centro' },
                                      { id: 'right', icon: AlignRight, title: 'Derecha' },
                                      { id: 'justify', icon: AlignJustify, title: 'Justificado' },
                                    ].map((align) => {
                                      const AlignIcon = align.icon;
                                      const isAlignActive = (settings.welcome_button_text_align || settings.global_button_text_align || 'center') === align.id;
                                      return (
                                        <button
                                          key={align.id}
                                          type="button"
                                          onClick={() => updateSetting('welcome_button_text_align', align.id)}
                                          className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                          style={{
                                            backgroundColor: isAlignActive ? 'var(--primary-accent)' : 'transparent',
                                            color: isAlignActive ? '#ffffff' : 'var(--text-muted)',
                                          }}
                                          title={align.title}
                                        >
                                          <AlignIcon size={13} />
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* ESTILO DEL TEXTO (Normal / Sobre) */}
                                <div className="w-full md:w-32 shrink-0">
                                  {(() => {
                                    const isH = buttonState === 'hover';
                                    const colorKey = isH ? 'welcome_button_hover_font_color' : 'welcome_button_font_color';
                                    const strokeActiveKey = isH ? 'welcome_button_hover_stroke_active' : 'welcome_button_stroke_active';
                                    const strokeColorKey = isH ? 'welcome_button_hover_stroke_color' : 'welcome_button_stroke_color';
                                    const strokeWidthKey = isH ? 'welcome_button_hover_stroke_width' : 'welcome_button_stroke_width';
                                    const strokeTypeKey = isH ? 'welcome_button_hover_stroke_type' : 'welcome_button_stroke_type';
                                    const shadowActiveKey = isH ? 'welcome_button_hover_shadow_active' : 'welcome_button_shadow_active';
                                    const shadowColorKey = isH ? 'welcome_button_hover_shadow_color' : 'welcome_button_shadow_color';
                                    const shadowBlurKey = isH ? 'welcome_button_hover_shadow_blur' : 'welcome_button_shadow_blur';

                                    return (
                                      <StylePickerPopover
                                        label={`Estilo (${isH ? 'Sobre' : 'Normal'})`}
                                        elementType="text"
                                        eventColors={eventColors.length > 0 ? eventColors : ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B']}
                                        eventColorImage={eventColorImage}
                                        styleConfig={{
                                          fillType: 'color',
                                          fillColor: settings[colorKey] || '#ffffff',
                                          strokeActive: settings[strokeActiveKey] || false,
                                          strokeColor: settings[strokeColorKey] || '#000000',
                                          strokeWidth: parseInt(settings[strokeWidthKey] || '2'),
                                          strokeType: settings[strokeTypeKey] || 'OUT',
                                          shadowActive: settings[shadowActiveKey] || false,
                                          shadowColor: settings[shadowColorKey] || '#000000',
                                          shadowBlur: parseInt(settings[shadowBlurKey] || '8'),
                                        }}
                                        onChange={(updated) => {
                                          if (updated.fillColor) updateSetting(colorKey, updated.fillColor);
                                          if (updated.strokeActive !== undefined) updateSetting(strokeActiveKey, updated.strokeActive);
                                          if (updated.strokeColor) updateSetting(strokeColorKey, updated.strokeColor);
                                          if (updated.strokeWidth !== undefined) updateSetting(strokeWidthKey, updated.strokeWidth.toString());
                                          if (updated.strokeType) updateSetting(strokeTypeKey, updated.strokeType);
                                          if (updated.shadowActive !== undefined) updateSetting(shadowActiveKey, updated.shadowActive);
                                          if (updated.shadowColor) updateSetting(shadowColorKey, updated.shadowColor);
                                          if (updated.shadowBlur !== undefined) updateSetting(shadowBlurKey, updated.shadowBlur.toString());
                                        }}
                                      />
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                          );
                        })()}

                        {/* 2.2.2 SUB-PESTAÑA CONTENEDOR EN BIENVENIDA (ESTRUCTURA EXACTA A PRECARGA/QR) */}
                        {bienvenidaSubTab === 'fondos' && (() => {
                          const activeLeftTarget = precargaContainerTarget === 'boton' ? 'fondo' : precargaContainerTarget;
                          const isFondoTarget = activeLeftTarget === 'fondo';
                          const prefix = isFondoTarget ? 'welcome_screen' : 'welcome_card';
                          const bgTypeKey = `${prefix}_bg_type`;
                          const bgColorKey = `${prefix}_bg_color`;
                          const gradKey = `${prefix}_gradient_data`;
                          const imageKey = `${prefix}_image_url`;
                          const videoRotateKey = `${prefix}_video_rotate`;

                          const imageUrl = settings[imageKey] || '';
                          const bgType = settings[bgTypeKey] || 'color';
                          const videoRotate = !!settings[videoRotateKey];

                          const buttonPrefix = buttonState === 'hover' ? 'button_hover' : 'button';
                          const buttonImageKey = `${buttonPrefix}_image_url`;
                          const buttonBgTypeKey = `${buttonPrefix}_bg_type`;
                          const buttonVideoRotateKey = `${buttonPrefix}_video_rotate`;
                          const buttonImageUrl = settings[buttonImageKey] || '';
                          const buttonBgType = settings[buttonBgTypeKey] || 'color';
                          const buttonVideoRotate = !!settings[buttonVideoRotateKey];

                          return (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* COLUMNA IZQUIERDA: CONTENEDORES (FONDO / MENSAJE) */}
                              <div className="rounded-2xl p-3 border space-y-3 shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                <div>
                                  <div className="pb-2 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center gap-2">
                                      <Palette size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                      <div className="flex flex-col leading-tight">
                                        <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                          Contenedores ({activeLeftTarget === 'fondo' ? 'Fondo' : 'Mensaje'})
                                        </h3>
                                        <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                          Estilos y fondos de pantalla de bienvenida
                                        </span>
                                      </div>
                                    </div>

                                    {/* PESTAÑAS FONDO / MENSAJE */}
                                    <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                      {[
                                        { id: 'fondo', label: 'Fondo' },
                                        { id: 'mensaje', label: 'Mensaje' },
                                      ].map((cTarget) => {
                                        const isCTargetActive = activeLeftTarget === cTarget.id;
                                        return (
                                          <button
                                            key={cTarget.id}
                                            type="button"
                                            onClick={() => setPrecargaContainerTarget(cTarget.id as any)}
                                            className="botab-item"
                                            style={{
                                              backgroundColor: isCTargetActive ? 'var(--primary-accent)' : 'transparent',
                                              color: isCTargetActive ? '#ffffff' : 'var(--text-muted)',
                                            }}
                                          >
                                            {cTarget.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="space-y-3 pt-2">
                                    {/* SUBIR IMAGEN / VIDEO DEL CONTENEDOR */}
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                          Imagen / Video ({isFondoTarget ? 'Fondo General' : 'Recuadro Central'})
                                        </label>
                                        <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer select-none" style={{ color: 'var(--text-muted)' }}>
                                          <input
                                            type="checkbox"
                                            checked={videoRotate}
                                            onChange={(e) => updateSetting(videoRotateKey, e.target.checked)}
                                            className="rounded border-gray-400 focus:ring-0 h-3 w-3 cursor-pointer"
                                            style={{ accentColor: 'var(--primary-accent)' }}
                                          />
                                          <span>Rotar Video</span>
                                        </label>
                                      </div>
                                      
                                      <div className="border-2 border-dashed rounded-2xl p-2 text-center flex flex-col items-center justify-center transition-all relative overflow-hidden group h-[120px] min-h-[120px]" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                        {imageUrl ? (
                                          <div className="relative w-full h-full rounded-xl overflow-hidden group bg-black/40 flex items-center justify-center">
                                            <img src={imageUrl} alt="Imagen de fondo" className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                              <button type="button" onClick={() => updateSetting(imageKey, '')} className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-600 transition-colors">
                                                <Trash2 size={16} />
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                                            <div className="p-2.5 rounded-full mb-1.5" style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}>
                                              <Upload size={18} />
                                            </div>
                                            <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Subir Imagen / Video</span>
                                            <input
                                              type="file"
                                              accept="image/*,video/*"
                                              className="hidden"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  const isVideo = file.type.startsWith('video/');
                                                  const reader = new FileReader();
                                                  reader.onload = (ev) => {
                                                    updateSetting(imageKey, ev.target?.result);
                                                    updateSetting(bgTypeKey, isVideo ? 'video' : 'image');
                                                  };
                                                  reader.readAsDataURL(file);
                                                }
                                              }}
                                            />
                                          </label>
                                        )}
                                      </div>
                                    </div>

                                    {/* CONTROLES IZQUIERDA: ESTILO, REDONDEZ, GLASS */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end pt-1">
                                      <div>
                                        <StylePickerPopover
                                          label="Estilo"
                                          elementType="box"
                                          eventColors={eventColors.length > 0 ? eventColors : ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B']}
                                          eventColorImage={eventColorImage}
                                          styleConfig={{
                                            backgroundColor: settings[bgColorKey] || (isFondoTarget ? '#0f172a' : '#000000'),
                                            borderWidth: settings[`${prefix}_border_width`] ?? 0,
                                            borderStyle: settings[`${prefix}_border_style`] || 'solid',
                                            borderColor: settings[`${prefix}_border_color`] || '#E07A5F',
                                            borderRadius: settings[`${prefix}_border_radius`] ?? (isFondoTarget ? 0 : 16),
                                          }}
                                          onChange={(updated) => {
                                            const selectedColor = updated.backgroundColor || updated.fillColor;
                                            if (selectedColor) updateSetting(bgColorKey, selectedColor);
                                            if (updated.borderWidth !== undefined) updateSetting(`${prefix}_border_width`, updated.borderWidth);
                                            if (updated.borderColor !== undefined) updateSetting(`${prefix}_border_color`, updated.borderColor);
                                            if (updated.borderRadius !== undefined) updateSetting(`${prefix}_border_radius`, updated.borderRadius);
                                          }}
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Redondez</label>
                                        <div className="flex items-center h-9 rounded-xl border overflow-hidden w-full" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const curr = parseInt(settings[`${prefix}_border_radius`] ?? (isFondoTarget ? '0' : '16'));
                                              updateSetting(`${prefix}_border_radius`, Math.max(0, curr - 2));
                                            }}
                                            className="w-8 h-full flex items-center justify-center border-r shrink-0 cursor-pointer"
                                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                                          >
                                            <Minus size={12} />
                                          </button>
                                          <div className="flex-1 flex items-center justify-center px-1">
                                            <input
                                              type="number"
                                              min={0}
                                              max={50}
                                              value={settings[`${prefix}_border_radius`] ?? (isFondoTarget ? 0 : 16)}
                                              onChange={(e) => updateSetting(`${prefix}_border_radius`, parseInt(e.target.value) || 0)}
                                              className="w-full h-full text-center bg-transparent outline-none font-bold text-xs"
                                              style={{ color: 'var(--text-main)' }}
                                            />
                                            <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>px</span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const curr = parseInt(settings[`${prefix}_border_radius`] ?? (isFondoTarget ? '0' : '16'));
                                              updateSetting(`${prefix}_border_radius`, Math.min(50, curr + 2));
                                            }}
                                            className="w-8 h-full flex items-center justify-center border-l shrink-0 cursor-pointer"
                                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                                          >
                                            <Plus size={12} />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Glass / Cristal */}
                                      <div>
                                        <div className="flex items-center justify-between mb-1">
                                          <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                            Glass (Blur)
                                          </label>
                                          <label className="relative flex items-center cursor-pointer shrink-0 select-none">
                                            <input
                                              type="checkbox"
                                              checked={
                                                isFondoTarget
                                                  ? (settings.welcome_screen_glass_enabled ?? false)
                                                  : (settings.welcome_card_glass_enabled ?? true)
                                              }
                                              onChange={(e) => {
                                                const key = isFondoTarget ? 'welcome_screen_glass_enabled' : 'welcome_card_glass_enabled';
                                                updateSetting(key, e.target.checked);
                                              }}
                                              className="sr-only peer"
                                            />
                                            <div
                                              className="w-4 h-4 rounded border flex items-center justify-center transition-all peer-checked:border-[var(--primary-accent)] peer-checked:bg-[var(--primary-accent)]"
                                              style={{
                                                borderColor: (isFondoTarget ? (settings.welcome_screen_glass_enabled ?? false) : (settings.welcome_card_glass_enabled ?? true)) ? 'var(--primary-accent)' : 'var(--border-color)',
                                                backgroundColor: (isFondoTarget ? (settings.welcome_screen_glass_enabled ?? false) : (settings.welcome_card_glass_enabled ?? true)) ? 'var(--primary-accent)' : 'var(--bg-card)',
                                              }}
                                            >
                                              {(isFondoTarget ? (settings.welcome_screen_glass_enabled ?? false) : (settings.welcome_card_glass_enabled ?? true)) && (
                                                <Check size={11} className="text-white stroke-[3]" />
                                              )}
                                            </div>
                                          </label>
                                        </div>

                                        <div
                                          className={`flex items-center h-9 rounded-xl border px-3 transition-opacity ${
                                            !(isFondoTarget ? (settings.welcome_screen_glass_enabled ?? false) : (settings.welcome_card_glass_enabled ?? true)) ? 'opacity-40 pointer-events-none' : ''
                                          }`}
                                          style={{
                                            backgroundColor: 'var(--bg-app)',
                                            borderColor: 'var(--border-color)',
                                          }}
                                        >
                                          <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="1"
                                            value={settings[`${prefix}_bg_opacity`] ?? 100}
                                            onChange={(e) => updateSetting(`${prefix}_bg_opacity`, parseInt(e.target.value))}
                                            className="w-full accent-[var(--primary-accent)] cursor-pointer h-1.5 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* COLUMNA DERECHA: BOTONES (NORMAL / SOBRE) */}
                              <div className="rounded-2xl p-3 border space-y-3 shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                <div>
                                  <div className="pb-2 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center gap-2">
                                      <MousePointerClick size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                      <div className="flex flex-col leading-tight">
                                        <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                          Botones ({buttonState === 'hover' ? 'Sobre' : 'Normal'})
                                        </h3>
                                        <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                          Estilos y efectos de botón
                                        </span>
                                      </div>
                                    </div>

                                    {/* PESTAÑAS NORMAL / SOBRE */}
                                    <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                      {[
                                        { id: 'normal', label: 'Normal' },
                                        { id: 'hover', label: 'Sobre' },
                                      ].map((modeItem) => {
                                        const isModeActive = buttonState === modeItem.id;
                                        return (
                                          <button
                                            key={modeItem.id}
                                            type="button"
                                            onClick={() => setButtonState(modeItem.id as any)}
                                            className="botab-item"
                                            style={{
                                              backgroundColor: isModeActive ? 'var(--primary-accent)' : 'transparent',
                                              color: isModeActive ? '#ffffff' : 'var(--text-muted)',
                                            }}
                                          >
                                            {modeItem.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="space-y-3 pt-2">
                                    {/* SUBIR IMAGEN / VIDEO DEL BOTÓN */}
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                          Imagen / Video ({buttonState === 'hover' ? 'Sobre' : 'Normal'})
                                        </label>
                                        <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer select-none" style={{ color: 'var(--text-muted)' }} title="Rotar orientación de video 90° en el botón">
                                          <input
                                            type="checkbox"
                                            checked={buttonVideoRotate}
                                            onChange={(e) => updateSetting(buttonVideoRotateKey, e.target.checked)}
                                            className="rounded border-gray-400 focus:ring-0 h-3 w-3 cursor-pointer"
                                            style={{ accentColor: 'var(--primary-accent)' }}
                                          />
                                          <span>Rotar Video</span>
                                        </label>
                                      </div>
                                      
                                      <div
                                        className="border-2 border-dashed rounded-2xl p-2 text-center flex flex-col items-center justify-center transition-all relative overflow-hidden group h-[120px] min-h-[120px]"
                                        style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                                      >
                                        {buttonImageUrl ? (
                                          <div className="relative w-full h-full rounded-xl overflow-hidden group bg-black/40 flex items-center justify-center">
                                            {buttonBgType === 'video' || String(buttonImageUrl).startsWith('data:video') || String(buttonImageUrl).match(/\.(mp4|webm|ogg)$/i) ? (
                                              <video
                                                src={buttonImageUrl}
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className="w-full h-full object-contain"
                                              />
                                            ) : (
                                              <img
                                                src={buttonImageUrl}
                                                alt="Imagen del botón"
                                                className="w-full h-full object-contain"
                                              />
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                              <label className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/40 cursor-pointer transition-colors" title="Cambiar archivo">
                                                <Upload size={16} />
                                                <input
                                                  type="file"
                                                  accept="image/*,video/*"
                                                  className="hidden"
                                                  onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                      const isVideo = file.type.startsWith('video/');
                                                      const reader = new FileReader();
                                                      reader.onload = (ev) => {
                                                        updateSetting(buttonImageKey, ev.target?.result);
                                                        updateSetting(buttonBgTypeKey, isVideo ? 'video' : 'image');
                                                      };
                                                      reader.readAsDataURL(file);
                                                    }
                                                  }}
                                                />
                                              </label>
                                              <button
                                                type="button"
                                                onClick={() => updateSetting(buttonImageKey, '')}
                                                className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-600 transition-colors"
                                                title="Eliminar archivo"
                                              >
                                                <Trash2 size={16} />
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                                            <div className="p-2.5 rounded-full mb-1.5" style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}>
                                              <Upload size={18} />
                                            </div>
                                            <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Subir Imagen / Video</span>
                                            <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>PNG, JPG, MP4 o WEBM</span>
                                            <input
                                              type="file"
                                              accept="image/*,video/*"
                                              className="hidden"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  const isVideo = file.type.startsWith('video/');
                                                  const reader = new FileReader();
                                                  reader.onload = (ev) => {
                                                    updateSetting(buttonImageKey, ev.target?.result);
                                                    updateSetting(buttonBgTypeKey, isVideo ? 'video' : 'image');
                                                  };
                                                  reader.readAsDataURL(file);
                                                }
                                              }}
                                            />
                                          </label>
                                        )}
                                      </div>
                                    </div>

                                    {/* CONTROLES DERECHA: ESTILO, REDONDEZ, GLASS */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end pt-1">
                                      {/* Estilo */}
                                      <div>
                                        <StylePickerPopover
                                          label={`Estilo (${buttonState === 'hover' ? 'Sobre' : 'Normal'})`}
                                          elementType="box"
                                          eventColors={eventColors.length > 0 ? eventColors : ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B']}
                                          eventColorImage={eventColorImage}
                                          styleConfig={{
                                            backgroundColor: settings[`${buttonPrefix}_bg_type`] === 'gradient' && settings[`${buttonPrefix}_gradient_data`]
                                              ? (typeof settings[`${buttonPrefix}_gradient_data`] === 'string' ? settings[`${buttonPrefix}_gradient_data`] : settings[`${buttonPrefix}_bg_color`] || '#E07A5F')
                                              : (settings[`${buttonPrefix}_bg_color`] || '#E07A5F'),
                                            borderWidth: settings[`${buttonPrefix}_border_width`] ?? 0,
                                            borderStyle: settings[`${buttonPrefix}_border_style`] || 'solid',
                                            borderColor: settings[`${buttonPrefix}_border_color`] || '#E07A5F',
                                            borderRadius: settings[`${buttonPrefix}_border_radius`] ?? 12,
                                            shadowColor: settings[`${buttonPrefix}_shadow_color`] || '#000000',
                                            shadowBlur: settings[`${buttonPrefix}_shadow_blur`] ?? 0,
                                            shadowOffsetX: settings[`${buttonPrefix}_shadow_offset_x`] ?? 0,
                                            shadowOffsetY: settings[`${buttonPrefix}_shadow_offset_y`] ?? 0,
                                          }}
                                          onChange={(updated) => {
                                            const prefix = buttonPrefix;
                                            const bgPrefix = `${prefix}_bg`;
                                            const gradKey = `${prefix}_gradient_data`;

                                            const selectedColor = updated.backgroundColor || updated.fillColor;
                                            const selectedGradient = updated.fillGradient;

                                            if (updated.fillType === 'gradient' && selectedGradient) {
                                              updateSetting(`${bgPrefix}_type`, 'gradient');
                                              updateSetting(gradKey, selectedGradient);
                                            } else if (selectedColor) {
                                              if (typeof selectedColor === 'string' && selectedColor.includes('gradient')) {
                                                updateSetting(`${bgPrefix}_type`, 'gradient');
                                                updateSetting(gradKey, selectedColor);
                                              } else {
                                                updateSetting(`${bgPrefix}_type`, 'color');
                                                updateSetting(`${bgPrefix}_color`, selectedColor);
                                              }
                                            }

                                            if (updated.borderWidth !== undefined) updateSetting(`${prefix}_border_width`, updated.borderWidth);
                                            if (updated.borderStyle !== undefined) updateSetting(`${prefix}_border_style`, updated.borderStyle);
                                            if (updated.borderColor !== undefined) updateSetting(`${prefix}_border_color`, updated.borderColor);
                                            if (updated.borderRadius !== undefined) updateSetting(`${prefix}_border_radius`, updated.borderRadius);
                                            if (updated.shadowColor !== undefined) updateSetting(`${prefix}_shadow_color`, updated.shadowColor);
                                            if (updated.shadowBlur !== undefined) updateSetting(`${prefix}_shadow_blur`, updated.shadowBlur);
                                            if (updated.shadowOffsetX !== undefined) updateSetting(`${prefix}_shadow_offset_x`, updated.shadowOffsetX);
                                            if (updated.shadowOffsetY !== undefined) updateSetting(`${prefix}_shadow_offset_y`, updated.shadowOffsetY);
                                          }}
                                        />
                                      </div>

                                      {/* Redondez */}
                                      <div>
                                        <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                          Redondez
                                        </label>
                                        <div
                                          className="flex items-center h-9 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full shadow-2xs"
                                          style={{
                                            backgroundColor: 'var(--bg-app)',
                                            borderColor: 'var(--border-color)',
                                          }}
                                        >
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const key = `${buttonPrefix}_border_radius`;
                                              const curr = parseInt(settings[key] ?? '12');
                                              const nextVal = Math.max(0, curr - 2);
                                              updateSetting(key, nextVal);
                                            }}
                                            className="w-8 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                            style={{
                                              backgroundColor: 'var(--bg-card)',
                                              borderColor: 'var(--border-color)',
                                              color: 'var(--primary-accent)',
                                            }}
                                            title="Disminuir redondez"
                                          >
                                            <Minus size={12} />
                                          </button>

                                          <div className="flex-1 flex items-center justify-center px-1">
                                            <input
                                              type="number"
                                              min={0}
                                              max={100}
                                              value={settings[`${buttonPrefix}_border_radius`] ?? 12}
                                              onChange={(e) => {
                                                const key = `${buttonPrefix}_border_radius`;
                                                updateSetting(key, parseInt(e.target.value) || 0);
                                              }}
                                              className="w-full h-full text-center bg-transparent outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                              style={{ color: 'var(--text-main)' }}
                                            />
                                            <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>
                                              px
                                            </span>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              const key = `${buttonPrefix}_border_radius`;
                                              const curr = parseInt(settings[key] ?? '12');
                                              const nextVal = Math.min(100, curr + 2);
                                              updateSetting(key, nextVal);
                                            }}
                                            className="w-8 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                            style={{
                                              backgroundColor: 'var(--bg-card)',
                                              borderColor: 'var(--border-color)',
                                              color: 'var(--primary-accent)',
                                            }}
                                            title="Aumentar redondez"
                                          >
                                            <Plus size={12} />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Glass */}
                                      <div>
                                        <div className="flex items-center justify-between mb-1">
                                          <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                            Glass ({settings[`${buttonPrefix}_bg_opacity`] ?? 100}%)
                                          </label>
                                          <label className="relative flex items-center cursor-pointer shrink-0 select-none">
                                            <input
                                              type="checkbox"
                                              checked={settings[`${buttonPrefix}_glass_enabled`] ?? true}
                                              onChange={(e) => {
                                                const key = `${buttonPrefix}_glass_enabled`;
                                                updateSetting(key, e.target.checked);
                                              }}
                                              className="sr-only peer"
                                            />
                                            <div
                                              className="w-4 h-4 rounded border flex items-center justify-center transition-all peer-checked:border-[var(--primary-accent)] peer-checked:bg-[var(--primary-accent)]"
                                              style={{
                                                borderColor: (settings[`${buttonPrefix}_glass_enabled`] ?? true) ? 'var(--primary-accent)' : 'var(--border-color)',
                                                backgroundColor: (settings[`${buttonPrefix}_glass_enabled`] ?? true) ? 'var(--primary-accent)' : 'var(--bg-card)',
                                              }}
                                            >
                                              {(settings[`${buttonPrefix}_glass_enabled`] ?? true) && (
                                                <Check size={11} className="text-white stroke-[3]" />
                                              )}
                                            </div>
                                          </label>
                                        </div>

                                        <div
                                          className={`flex items-center h-9 rounded-xl border px-3 transition-opacity ${
                                            !(settings[`${buttonPrefix}_glass_enabled`] ?? true) ? 'opacity-40 pointer-events-none' : ''
                                          }`}
                                          style={{
                                            backgroundColor: 'var(--bg-app)',
                                            borderColor: 'var(--border-color)',
                                          }}
                                        >
                                          <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="1"
                                            value={settings[`${buttonPrefix}_bg_opacity`] ?? 100}
                                            onChange={(e) => {
                                              const key = `${buttonPrefix}_bg_opacity`;
                                              updateSetting(key, parseInt(e.target.value));
                                            }}
                                            className="w-full h-1.5 rounded-lg cursor-pointer"
                                            style={{
                                              accentColor: 'var(--primary-accent)',
                                            }}
                                            title="Opacidad del vidrio"
                                            disabled={!(settings[`${buttonPrefix}_glass_enabled`] ?? true)}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* LOGOS EN BIENVENIDA (CONFIGURACIÓN DE LOGO DEL EVENTO Y LOGO DEL PARTNER) */}
                        {bienvenidaSubTab === 'logos' && (() => {
                          const displayEventLogo = settings.event_logo_url || eventData?.logo_url || (eventData?.logo ? `/storage/${eventData.logo}` : null);
                          const displayPartnerLogo = settings.project_logo_precarga_url || settings.partner_logo_precarga_url || settings.partner_logo_url || eventData?.partner_logo_url || eventData?.partner?.logo_url || "/dinvited.png";
                          const activeState = 'welcome';
                          const stateLabels: Record<string, string> = { welcome: 'Bienvenida', camera: 'Cámara', gallery: 'Galería' };

                          const getSettingVal = (type: 'event' | 'partner', field: string, defaultVal: any) => {
                            const key = `${type}_logo_${activeState}_${field}`;
                            if (settings[key] !== undefined) return settings[key];
                            return defaultVal;
                          };
                          const updateLogoSetting = (type: 'event' | 'partner', field: string, value: any) => {
                            updateSetting(`${type}_logo_${activeState}_${field}`, value);
                          };

                          const eventV = getSettingVal('event', 'position_v', 'top');
                          const eventH = getSettingVal('event', 'position_h', 'center');
                          const eventSize = getSettingVal('event', 'size', 60);
                          const eventUnit = getSettingVal('event', 'unit', 'px');

                          const partnerV = getSettingVal('partner', 'position_v', 'bottom');
                          const partnerH = getSettingVal('partner', 'position_h', 'center');
                          const partnerSize = getSettingVal('partner', 'size', 40);
                          const partnerUnit = getSettingVal('partner', 'unit', 'px');

                          const eventShowKey = `event_logo_show_welcome`;
                          const partnerShowKey = `partner_logo_show_welcome`;

                          const eventShow = settings[eventShowKey] ?? true;
                          const partnerShow = settings[partnerShowKey] ?? true;

                          return (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* COLUMNA 1: LOGO DEL EVENTO */}
                              <div className="rounded-2xl p-4 border shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                <div>
                                  <div className="pb-2 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center gap-2">
                                      <ImageIcon size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                      <div className="flex flex-col leading-tight">
                                        <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                                          <span>Logo del Evento</span>
                                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase text-white shadow-2xs" style={{ backgroundColor: 'var(--primary-accent)' }}>
                                            {stateLabels[activeState]}
                                          </span>
                                        </h3>
                                        <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                          Configurando la pantalla de {stateLabels[activeState]}
                                        </span>
                                      </div>
                                    </div>

                                    {/* VISIBILIDAD DE LOGO EVENTO EN BIENVENIDA */}
                                    <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                      {[
                                        { id: 'welcome', label: 'Bienvenida', key: 'event_logo_show_welcome' },
                                        { id: 'gps', label: 'GPS', key: 'event_logo_show_gps' },
                                        { id: 'registro', label: 'Registro', key: 'event_logo_show_registro' },
                                      ].map((screen) => {
                                        const isSelected = activeState === screen.id;
                                        const isVis = settings[screen.key] ?? true;
                                        return (
                                          <div
                                            key={screen.id}
                                            onClick={() => setPreviewView(screen.id)}
                                            className="botab-item select-none cursor-pointer"
                                            style={{
                                              backgroundColor: isSelected ? 'var(--primary-accent)' : 'transparent',
                                              color: isSelected ? '#ffffff' : 'var(--text-muted)',
                                            }}
                                          >
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                updateSetting(screen.key, !isVis);
                                              }}
                                              className="flex items-center justify-center transition-all cursor-pointer opacity-90 hover:opacity-100 mr-0.5"
                                              style={{
                                                color: isSelected ? '#ffffff' : isVis ? 'var(--primary-accent)' : 'var(--text-muted)',
                                              }}
                                              title={isVis ? `Visible en ${screen.label}` : `Oculto en ${screen.label}`}
                                            >
                                              {isVis ? <Check size={12} className="stroke-[3]" /> : <EyeOff size={11} className="opacity-40" />}
                                            </button>
                                            <span>{screen.label}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* GRID INTERNO: IZQ = VISTA PREVIA, DER = CONTROLES */}
                                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3">
                                    {/* VISTA PREVIA LOGO EVENTO */}
                                    <div className="md:col-span-4 flex flex-col items-center justify-center">
                                      <div
                                        className="relative w-full h-full min-h-[140px] rounded-xl border overflow-hidden flex flex-col items-center justify-center p-3"
                                        style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                                      >
                                        {displayEventLogo ? (
                                          <div className="relative w-full h-full flex flex-col items-center justify-center">
                                            <img src={displayEventLogo} alt="Logo Evento" className="max-h-24 max-w-full object-contain drop-shadow-md" />
                                          </div>
                                        ) : (
                                          <div className="flex flex-col items-center justify-center text-center p-2">
                                            <ImageIcon size={20} className="opacity-40 mb-1" style={{ color: 'var(--text-muted)' }} />
                                            <span className="text-xs font-bold opacity-75" style={{ color: 'var(--text-main)' }}>
                                              Sin logo registrado
                                            </span>
                                            <span className="text-[10px] opacity-60 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                              El evento en BD no tiene un logo cargado
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* CONTROLES LOGO EVENTO */}
                                    <div className="md:col-span-8 space-y-2.5">
                                      <div className="grid grid-cols-2 gap-2">
                                        {/* Alineación Vertical */}
                                        <div>
                                          <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                            Alineación Vertical
                                          </label>
                                          <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            {[
                                              { id: 'top', label: 'Arriba' },
                                              { id: 'center', label: 'Centro' },
                                              { id: 'bottom', label: 'Abajo' },
                                            ].map((pos) => {
                                              const isActive = eventV === pos.id;
                                              const isDisabled = partnerShow && partnerV === pos.id && partnerH === eventH;
                                              return (
                                                <button
                                                  key={pos.id}
                                                  type="button"
                                                  disabled={isDisabled}
                                                  onClick={() => updateLogoSetting('event', 'position_v', pos.id)}
                                                  className="botab-item"
                                                  style={{
                                                    backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                  }}
                                                  title={isDisabled ? 'Ocupado por el Logo del Partner' : undefined}
                                                >
                                                  {pos.label}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>

                                        {/* Alineación Horizontal */}
                                        <div>
                                          <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                            Alineación Horizontal
                                          </label>
                                          <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            {[
                                              { id: 'left', label: 'Izq' },
                                              { id: 'center', label: 'Centro' },
                                              { id: 'right', label: 'Der' },
                                            ].map((pos) => {
                                              const isActive = eventH === pos.id;
                                              const isDisabled = partnerShow && partnerH === pos.id && partnerV === eventV;
                                              return (
                                                <button
                                                  key={pos.id}
                                                  type="button"
                                                  disabled={isDisabled}
                                                  onClick={() => updateLogoSetting('event', 'position_h', pos.id)}
                                                  className="botab-item"
                                                  style={{
                                                    backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                  }}
                                                  title={isDisabled ? 'Ocupado por el Logo del Partner' : undefined}
                                                >
                                                  {pos.label}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Tamaño / Ancho Máximo */}
                                      <div>
                                        <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                          Tamaño / Ancho Máximo
                                        </label>
                                        <div className="flex items-center gap-1.5">
                                          <div className="flex-1 flex items-center h-7 rounded-lg border px-2 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            <input
                                              type="number"
                                              min={10}
                                              max={eventUnit === '%' ? 100 : 300}
                                              value={eventSize}
                                              onChange={(e) => updateLogoSetting('event', 'size', parseInt(e.target.value) || 30)}
                                              className="w-full bg-transparent outline-none font-bold text-xs text-center"
                                              style={{ color: 'var(--text-main)' }}
                                            />
                                          </div>
                                          <div className="flex rounded-lg border p-0.5" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            {['px', '%'].map((u) => {
                                              const isActive = eventUnit === u;
                                              return (
                                                <button
                                                  key={u}
                                                  type="button"
                                                  onClick={() => updateLogoSetting('event', 'unit', u)}
                                                  className="px-2 py-0.5 text-[9px] font-extrabold rounded transition-all cursor-pointer"
                                                  style={{
                                                    backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                  }}
                                                >
                                                  {u}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Márgenes independientes */}
                                      <div className="pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--border-color)' }}>
                                        <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                          Márgenes
                                        </label>

                                        {/* Fila 1: Arriba / Abajo */}
                                        <div className="grid grid-cols-2 gap-2">
                                          {[
                                            { field: 'margin_top', unitField: 'margin_top_unit', label: 'Arriba' },
                                            { field: 'margin_bottom', unitField: 'margin_bottom_unit', label: 'Abajo' },
                                          ].map((m) => {
                                            const val = getSettingVal('event', m.field, 0);
                                            const currentUnit = getSettingVal('event', m.unitField, getSettingVal('event', 'margin_unit', 'px'));
                                            return (
                                              <div key={m.field} className="flex flex-col gap-0.5">
                                                <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                                                <div className="flex items-center gap-1">
                                                  <div className="flex-1 flex items-center h-7 rounded-lg border px-1.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    <input
                                                      type="number"
                                                      value={val}
                                                      onChange={(e) => updateLogoSetting('event', m.field, parseInt(e.target.value) || 0)}
                                                      className="w-full bg-transparent outline-none font-bold text-[10px] text-center"
                                                      style={{ color: 'var(--text-main)' }}
                                                    />
                                                  </div>
                                                  <div className="flex rounded-lg border p-0.5 shrink-0" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    {['px', '%'].map((u) => {
                                                      const isActive = currentUnit === u;
                                                      return (
                                                        <button
                                                          key={u}
                                                          type="button"
                                                          onClick={() => updateLogoSetting('event', m.unitField, u)}
                                                          className="px-1.5 py-0.5 text-[8px] font-extrabold rounded transition-all cursor-pointer"
                                                          style={{
                                                            backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                            color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                          }}
                                                        >
                                                          {u}
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>

                                        {/* Fila 2: Izquierda / Derecha */}
                                        <div className="grid grid-cols-2 gap-2">
                                          {[
                                            { field: 'margin_left', unitField: 'margin_left_unit', label: 'Izquierda' },
                                            { field: 'margin_right', unitField: 'margin_right_unit', label: 'Derecha' },
                                          ].map((m) => {
                                            const val = getSettingVal('event', m.field, 0);
                                            const currentUnit = getSettingVal('event', m.unitField, getSettingVal('event', 'margin_unit', 'px'));
                                            return (
                                              <div key={m.field} className="flex flex-col gap-0.5">
                                                <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                                                <div className="flex items-center gap-1">
                                                  <div className="flex-1 flex items-center h-7 rounded-lg border px-1.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    <input
                                                      type="number"
                                                      value={val}
                                                      onChange={(e) => updateLogoSetting('event', m.field, parseInt(e.target.value) || 0)}
                                                      className="w-full bg-transparent outline-none font-bold text-[10px] text-center"
                                                      style={{ color: 'var(--text-main)' }}
                                                    />
                                                  </div>
                                                  <div className="flex rounded-lg border p-0.5 shrink-0" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    {['px', '%'].map((u) => {
                                                      const isActive = currentUnit === u;
                                                      return (
                                                        <button
                                                          key={u}
                                                          type="button"
                                                          onClick={() => updateLogoSetting('event', m.unitField, u)}
                                                          className="px-1.5 py-0.5 text-[8px] font-extrabold rounded transition-all cursor-pointer"
                                                          style={{
                                                            backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                            color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                          }}
                                                        >
                                                          {u}
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* COLUMNA 2: LOGO DEL PARTNER / MARCA */}
                              <div className="rounded-2xl p-4 border shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                <div>
                                  <div className="pb-2 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center gap-2">
                                      <Smartphone size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                      <div className="flex flex-col leading-tight">
                                        <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                                          <span>Logo del Partner</span>
                                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase text-white shadow-2xs" style={{ backgroundColor: 'var(--primary-accent)' }}>
                                            {stateLabels[activeState]}
                                          </span>
                                        </h3>
                                        <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                          Configurando la pantalla de {stateLabels[activeState]}
                                        </span>
                                      </div>
                                    </div>

                                    {/* VISIBILIDAD DE LOGO PARTNER EN BIENVENIDA */}
                                    <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                      {[
                                        { id: 'welcome', label: 'Bienvenida', key: 'partner_logo_show_welcome' },
                                        { id: 'gps', label: 'GPS', key: 'partner_logo_show_gps' },
                                        { id: 'registro', label: 'Registro', key: 'partner_logo_show_registro' },
                                      ].map((screen) => {
                                        const isSelected = activeState === screen.id;
                                        const isVis = settings[screen.key] ?? true;
                                        return (
                                          <div
                                            key={screen.id}
                                            onClick={() => setPreviewView(screen.id)}
                                            className="botab-item select-none cursor-pointer"
                                            style={{
                                              backgroundColor: isSelected ? 'var(--primary-accent)' : 'transparent',
                                              color: isSelected ? '#ffffff' : 'var(--text-muted)',
                                            }}
                                          >
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                updateSetting(screen.key, !isVis);
                                              }}
                                              className="flex items-center justify-center transition-all cursor-pointer opacity-90 hover:opacity-100 mr-0.5"
                                              style={{
                                                color: isSelected ? '#ffffff' : isVis ? 'var(--primary-accent)' : 'var(--text-muted)',
                                              }}
                                              title={isVis ? `Visible en ${screen.label}` : `Oculto en ${screen.label}`}
                                            >
                                              {isVis ? <Check size={12} className="stroke-[3]" /> : <EyeOff size={11} className="opacity-40" />}
                                            </button>
                                            <span>{screen.label}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* GRID INTERNO: IZQ = VISTA PREVIA PARTNER, DER = CONTROLES PARTNER */}
                                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3">
                                    {/* VISTA PREVIA LOGO PARTNER */}
                                    <div className="md:col-span-4 flex flex-col items-center justify-center">
                                      <div
                                        className="relative w-full h-full min-h-[140px] rounded-xl border overflow-hidden flex flex-col items-center justify-center p-3"
                                        style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                                      >
                                        {displayPartnerLogo ? (
                                          <div className="relative w-full h-full flex flex-col items-center justify-center">
                                            <img src={displayPartnerLogo} alt="Logo Partner" className="max-h-24 max-w-full object-contain drop-shadow-md" />
                                          </div>
                                        ) : (
                                          <div className="flex flex-col items-center justify-center text-center p-2">
                                            <Smartphone size={20} className="opacity-40 mb-1" style={{ color: 'var(--text-muted)' }} />
                                            <span className="text-xs font-bold opacity-75" style={{ color: 'var(--text-main)' }}>
                                              Sin logo partner registrado
                                            </span>
                                            <span className="text-[10px] opacity-60 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                              El evento en BD no tiene un partner asignado
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* CONTROLES LOGO PARTNER */}
                                    <div className="md:col-span-8 space-y-2.5">
                                      <div className="grid grid-cols-2 gap-2">
                                        {/* Alineación Vertical Partner */}
                                        <div>
                                          <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                            Alineación Vertical
                                          </label>
                                          <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            {[
                                              { id: 'top', label: 'Arriba' },
                                              { id: 'center', label: 'Centro' },
                                              { id: 'bottom', label: 'Abajo' },
                                            ].map((pos) => {
                                              const isActive = partnerV === pos.id;
                                              const isDisabled = eventShow && eventV === pos.id && eventH === partnerH;
                                              return (
                                                <button
                                                  key={pos.id}
                                                  type="button"
                                                  disabled={isDisabled}
                                                  onClick={() => updateLogoSetting('partner', 'position_v', pos.id)}
                                                  className="botab-item"
                                                  style={{
                                                    backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                  }}
                                                  title={isDisabled ? 'Ocupado por el Logo del Evento' : undefined}
                                                >
                                                  {pos.label}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>

                                        {/* Alineación Horizontal Partner */}
                                        <div>
                                          <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                            Alineación Horizontal
                                          </label>
                                          <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            {[
                                              { id: 'left', label: 'Izq' },
                                              { id: 'center', label: 'Centro' },
                                              { id: 'right', label: 'Der' },
                                            ].map((pos) => {
                                              const isActive = partnerH === pos.id;
                                              const isDisabled = eventShow && eventH === pos.id && eventV === partnerV;
                                              return (
                                                <button
                                                  key={pos.id}
                                                  type="button"
                                                  disabled={isDisabled}
                                                  onClick={() => updateLogoSetting('partner', 'position_h', pos.id)}
                                                  className="botab-item"
                                                  style={{
                                                    backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                  }}
                                                  title={isDisabled ? 'Ocupado por el Logo del Evento' : undefined}
                                                >
                                                  {pos.label}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Tamaño / Ancho Máximo Partner */}
                                      <div>
                                        <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                          Tamaño / Ancho Máximo
                                        </label>
                                        <div className="flex items-center gap-1.5">
                                          <div className="flex-1 flex items-center h-7 rounded-lg border px-2 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            <input
                                              type="number"
                                              min={10}
                                              max={partnerUnit === '%' ? 100 : 300}
                                              value={partnerSize}
                                              onChange={(e) => updateLogoSetting('partner', 'size', parseInt(e.target.value) || 30)}
                                              className="w-full bg-transparent outline-none font-bold text-xs text-center"
                                              style={{ color: 'var(--text-main)' }}
                                            />
                                          </div>
                                          <div className="flex rounded-lg border p-0.5" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            {['px', '%'].map((u) => {
                                              const isActive = partnerUnit === u;
                                              return (
                                                <button
                                                  key={u}
                                                  type="button"
                                                  onClick={() => updateLogoSetting('partner', 'unit', u)}
                                                  className="px-2 py-0.5 text-[9px] font-extrabold rounded transition-all cursor-pointer"
                                                  style={{
                                                    backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                  }}
                                                >
                                                  {u}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Márgenes independientes Partner */}
                                      <div className="pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--border-color)' }}>
                                        <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                          Márgenes
                                        </label>

                                        {/* Fila 1: Arriba / Abajo */}
                                        <div className="grid grid-cols-2 gap-2">
                                          {[
                                            { field: 'margin_top', unitField: 'margin_top_unit', label: 'Arriba' },
                                            { field: 'margin_bottom', unitField: 'margin_bottom_unit', label: 'Abajo' },
                                          ].map((m) => {
                                            const val = getSettingVal('partner', m.field, 0);
                                            const currentUnit = getSettingVal('partner', m.unitField, getSettingVal('partner', 'margin_unit', 'px'));
                                            return (
                                              <div key={m.field} className="flex flex-col gap-0.5">
                                                <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                                                <div className="flex items-center gap-1">
                                                  <div className="flex-1 flex items-center h-7 rounded-lg border px-1.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    <input
                                                      type="number"
                                                      value={val}
                                                      onChange={(e) => updateLogoSetting('partner', m.field, parseInt(e.target.value) || 0)}
                                                      className="w-full bg-transparent outline-none font-bold text-[10px] text-center"
                                                      style={{ color: 'var(--text-main)' }}
                                                    />
                                                  </div>
                                                  <div className="flex rounded-lg border p-0.5 shrink-0" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    {['px', '%'].map((u) => {
                                                      const isActive = currentUnit === u;
                                                      return (
                                                        <button
                                                          key={u}
                                                          type="button"
                                                          onClick={() => updateLogoSetting('partner', m.unitField, u)}
                                                          className="px-1.5 py-0.5 text-[8px] font-extrabold rounded transition-all cursor-pointer"
                                                          style={{
                                                            backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                            color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                          }}
                                                        >
                                                          {u}
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>

                                        {/* Fila 2: Izquierda / Derecha */}
                                        <div className="grid grid-cols-2 gap-2">
                                          {[
                                            { field: 'margin_left', unitField: 'margin_left_unit', label: 'Izquierda' },
                                            { field: 'margin_right', unitField: 'margin_right_unit', label: 'Derecha' },
                                          ].map((m) => {
                                            const val = getSettingVal('partner', m.field, 0);
                                            const currentUnit = getSettingVal('partner', m.unitField, getSettingVal('partner', 'margin_unit', 'px'));
                                            return (
                                              <div key={m.field} className="flex flex-col gap-0.5">
                                                <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                                                <div className="flex items-center gap-1">
                                                  <div className="flex-1 flex items-center h-7 rounded-lg border px-1.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    <input
                                                      type="number"
                                                      value={val}
                                                      onChange={(e) => updateLogoSetting('partner', m.field, parseInt(e.target.value) || 0)}
                                                      className="w-full bg-transparent outline-none font-bold text-[10px] text-center"
                                                      style={{ color: 'var(--text-main)' }}
                                                    />
                                                  </div>
                                                  <div className="flex rounded-lg border p-0.5 shrink-0" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    {['px', '%'].map((u) => {
                                                      const isActive = currentUnit === u;
                                                      return (
                                                        <button
                                                          key={u}
                                                          type="button"
                                                          onClick={() => updateLogoSetting('partner', m.unitField, u)}
                                                          className="px-1.5 py-0.5 text-[8px] font-extrabold rounded transition-all cursor-pointer"
                                                          style={{
                                                            backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                            color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                          }}
                                                        >
                                                          {u}
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* SUB-PESTAÑA INFORMACIÓN BIENVENIDA */}
                        {bienvenidaSubTab === 'info' && (
                          <div className="rounded-2xl p-5 border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                            <div className="pb-3 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{ borderColor: 'var(--border-color)' }}>
                              <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                                <Info size={16} style={{ color: 'var(--primary-accent)' }} /> Información y Textos de Bienvenida
                              </h3>

                              {/* SELECTOR DE PANTALLA (GPS, REGISTRO, BIENVENIDA) ARRIBA A LA DERECHA */}
                              <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                {[
                                  { id: 'gps', label: 'GPS' },
                                  { id: 'registro', label: 'Registro' },
                                  { id: 'bienvenida', label: 'Bienvenida' },
                                ].map((screenItem) => {
                                  const isScreenActive = infoScreenTarget === screenItem.id;
                                  return (
                                    <button
                                      key={screenItem.id}
                                      type="button"
                                      onClick={() => setInfoScreenTarget(screenItem.id as any)}
                                      className="botab-item"
                                      style={{
                                        backgroundColor: isScreenActive ? 'var(--primary-accent)' : 'transparent',
                                        color: isScreenActive ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                    >
                                      {screenItem.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Texto del Título</label>
                                <input
                                  type="text"
                                  value={settings.welcome_title ?? '¡Bienvenido al evento!'}
                                  onChange={(e) => updateSetting('welcome_title', e.target.value)}
                                  className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium"
                                  style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Nombre del Evento</label>
                                <input
                                  type="text"
                                  readOnly
                                  disabled
                                  value={eventData?.event_name || eventData?.name || eventData?.title || settings.welcome_event || settings.event_name || 'Evento'}
                                  className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium opacity-70 cursor-not-allowed select-none"
                                  style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Texto del Contenido</label>
                                <input
                                  type="text"
                                  value={settings.welcome_subtitle ?? 'Prepárate para capturar los mejores momentos'}
                                  onChange={(e) => updateSetting('welcome_subtitle', e.target.value)}
                                  className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium"
                                  style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {/* 2.3 SUB-PESTAÑA VERIFICACIÓN GPS */}
                    {welcomeSubTab === 'gps' && (
                      <div className="space-y-4">
                        {/* SUB-PESTAÑAS UNIFORMES (FUENTE, CONTENEDOR, LOGOS, INFORMACIÓN) */}
                        <div className="flex p-1 rounded-xl border gap-1" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                          {[
                            { id: 'fuentes', label: 'Fuente', icon: Type },
                            { id: 'fondos', label: 'Contenedor', icon: Palette },
                            { id: 'logos', label: 'Logos', icon: ImageIcon },
                            { id: 'info', label: 'Información', icon: Info },
                          ].map((sub) => {
                            const SubIcon = sub.icon;
                            const isSubActive = gpsSubTab === sub.id;
                            return (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => setGpsSubTab(sub.id as any)}
                                className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                style={{
                                  backgroundColor: isSubActive ? 'var(--primary-accent-light)' : 'transparent',
                                  color: isSubActive ? 'var(--primary-accent)' : 'var(--text-muted)',
                                  border: isSubActive ? '1px solid var(--primary-accent)' : '1px solid transparent',
                                }}
                              >
                                <SubIcon size={14} />
                                <span>{sub.label}</span>
                              </button>
                            );
                          })}
                        </div>
                        {/* 2.2.1 SUB-PESTAÑA FUENTES EN BIENVENIDA (ESTRUCTURA Y CAMPOS DE PRECARGA/QR) */}
                        {gpsSubTab === 'fuentes' && (() => {
                          const activeTarget = precargaTextTarget === 'button' || precargaTextTarget === 'powered_by' ? 'title' : precargaTextTarget;

                          const getTargetSubtitle = () => {
                            if (activeTarget === 'title') return 'Título Principal';
                            if (activeTarget === 'event') return 'Nombre del Evento';
                            return 'Contenido';
                          };

                          return (
                          <div className="space-y-4">
                            {/* 1. TARJETA SUPERIOR: FUENTES Y TEXTOS DE BIENVENIDA */}
                            <div className="rounded-2xl p-4 border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                              <div className="pb-2 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-2.5">
                                  <Type size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                  <div className="flex flex-col leading-tight">
                                    <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                      Fuentes y Textos de GPS
                                    </h3>
                                    <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                      {getTargetSubtitle()}
                                    </span>
                                  </div>
                                </div>

                                {/* PESTAÑAS TÍTULO / EVENTO / CONTENIDO EN EL LADO DERECHO */}
                                <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                  {[
                                    { id: 'title', label: 'Título' },
                                    { id: 'event', label: 'Evento' },
                                    { id: 'subtitle', label: 'Contenido' },
                                  ].map((targetItem) => {
                                    const isTargetActive = activeTarget === targetItem.id;
                                    return (
                                      <button
                                        key={targetItem.id}
                                        type="button"
                                        onClick={() => setPrecargaTextTarget(targetItem.id as any)}
                                        className="botab-item flex items-center gap-1"
                                        style={{
                                          backgroundColor: isTargetActive ? 'var(--primary-accent)' : 'transparent',
                                          color: isTargetActive ? '#ffffff' : 'var(--text-muted)',
                                        }}
                                      >
                                        <span>{targetItem.label}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* CONTROLES DE TEXTO, TIPOGRAFÍA Y ESTILOS */}
                              <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
                                {/* CAMPO TEXTO / CONTENIDO */}
                                <div className="w-full md:w-52 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                    {activeTarget === 'title' ? 'Texto del Título' : activeTarget === 'event' ? 'Texto del Evento' : 'Texto del Contenido'}
                                  </label>
                                  <input
                                    type="text"
                                    readOnly={activeTarget === 'event'}
                                    disabled={activeTarget === 'event'}
                                    value={
                                      activeTarget === 'title'
                                        ? (settings.gps_title ?? '¡Bienvenido al evento!')
                                        : activeTarget === 'event'
                                        ? (eventData?.event_name || eventData?.name || eventData?.title || settings.gps_event || settings.event_name || 'Evento')
                                        : (settings.gps_subtitle ?? 'Prepárate para capturar los mejores momentos')
                                    }
                                    onChange={(e) => {
                                      if (activeTarget === 'title') {
                                        updateSetting('gps_title', e.target.value);
                                      } else if (activeTarget === 'subtitle') {
                                        updateSetting('gps_subtitle', e.target.value);
                                      }
                                    }}
                                    placeholder={activeTarget === 'title' ? 'Ej: Título del Evento' : activeTarget === 'event' ? 'Nombre del Evento' : 'Ej: Mensaje de GPS'}
                                    className={`w-full h-9 rounded-xl px-3 border outline-none text-xs font-medium ${activeTarget === 'event' ? 'opacity-70 cursor-not-allowed select-none' : ''}`}
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                  />
                                </div>

                                {/* FUENTE */}
                                <div className="flex-1 min-w-[180px]">
                                  <FontPicker
                                    label="Fuente"
                                    value={
                                      settings[`welcome_${activeTarget}_font_family`] ||
                                      (activeTarget === 'title' || activeTarget === 'event' ? (settings.global_title_font_family || 'Inter') : (settings.global_text_font_family || 'Inter'))
                                    }
                                    onChange={(f) => updateSetting(`welcome_${activeTarget}_font_family`, f)}
                                  />
                                </div>

                                {/* TAMAÑO */}
                                <div className="w-full md:w-36 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                    Tamaño
                                  </label>
                                  <div
                                    className="flex items-center h-9 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full shadow-2xs"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const defaultSize = activeTarget === 'title' ? 18 : 12;
                                        const curr = parseFloat(settings[`welcome_${activeTarget}_font_size`] || defaultSize.toString());
                                        updateSetting(`welcome_${activeTarget}_font_size`, Math.max(5, curr - 0.5).toString());
                                      }}
                                      className="w-8 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                                    >
                                      <Minus size={12} />
                                    </button>

                                    <div className="flex-1 flex items-center justify-center px-1">
                                      <input
                                        type="number"
                                        min={5}
                                        max={80}
                                        step={0.5}
                                        value={
                                          settings[`welcome_${activeTarget}_font_size`] ||
                                          (activeTarget === 'title' ? '18' : '12')
                                        }
                                        onChange={(e) => updateSetting(`welcome_${activeTarget}_font_size`, e.target.value)}
                                        className="w-full h-full text-center bg-transparent outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        style={{ color: 'var(--text-main)' }}
                                      />
                                      <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>px</span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const defaultSize = activeTarget === 'title' ? 18 : 12;
                                        const curr = parseFloat(settings[`welcome_${activeTarget}_font_size`] || defaultSize.toString());
                                        updateSetting(`welcome_${activeTarget}_font_size`, Math.min(80, curr + 0.5).toString());
                                      }}
                                      className="w-8 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                </div>

                                 {/* FORMATO */}
                                <div className="w-full md:w-28 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Formato</label>
                                  <div className="flex items-center h-9 rounded-xl border p-0.5 gap-0.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting(`welcome_${activeTarget}_font_weight`, settings[`welcome_${activeTarget}_font_weight`] === 'bold' ? 'normal' : 'bold')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                      style={{
                                        backgroundColor: settings[`welcome_${activeTarget}_font_weight`] === 'bold' ? 'var(--primary-accent)' : 'transparent',
                                        color: settings[`welcome_${activeTarget}_font_weight`] === 'bold' ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                      title="Negrita"
                                    >
                                      <Bold size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting(`welcome_${activeTarget}_font_style`, settings[`welcome_${activeTarget}_font_style`] === 'italic' ? 'normal' : 'italic')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                      style={{
                                        backgroundColor: settings[`welcome_${activeTarget}_font_style`] === 'italic' ? 'var(--primary-accent)' : 'transparent',
                                        color: settings[`welcome_${activeTarget}_font_style`] === 'italic' ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                      title="Itálica"
                                    >
                                      <Italic size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting(`welcome_${activeTarget}_text_decoration`, settings[`welcome_${activeTarget}_text_decoration`] === 'underline' ? 'none' : 'underline')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                      style={{
                                        backgroundColor: settings[`welcome_${activeTarget}_text_decoration`] === 'underline' ? 'var(--primary-accent)' : 'transparent',
                                        color: settings[`welcome_${activeTarget}_text_decoration`] === 'underline' ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                      title="Subrayado"
                                    >
                                      <Underline size={13} />
                                    </button>
                                  </div>
                                </div>

                                {/* ALINEACIÓN */}
                                <div className="w-full md:w-32 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Alineación</label>
                                  <div className="flex items-center h-9 rounded-xl border p-0.5 gap-0.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                    {[
                                      { id: 'left', icon: AlignLeft, title: 'Izquierda' },
                                      { id: 'center', icon: AlignCenter, title: 'Centro' },
                                      { id: 'right', icon: AlignRight, title: 'Derecha' },
                                      { id: 'justify', icon: AlignJustify, title: 'Justificado' },
                                    ].map((align) => {
                                      const AlignIcon = align.icon;
                                      const isAlignActive = (settings[`welcome_${activeTarget}_text_align`] || 'center') === align.id;
                                      return (
                                        <button
                                          key={align.id}
                                          type="button"
                                          onClick={() => updateSetting(`welcome_${activeTarget}_text_align`, align.id)}
                                          className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                          style={{
                                            backgroundColor: isAlignActive ? 'var(--primary-accent)' : 'transparent',
                                            color: isAlignActive ? '#ffffff' : 'var(--text-muted)',
                                          }}
                                          title={align.title}
                                        >
                                          <AlignIcon size={13} />
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* ESTILO DEL TEXTO (StylePickerPopover) */}
                                <div className="w-full md:w-32 shrink-0">
                                  <StylePickerPopover
                                    label="Estilo"
                                    elementType="text"
                                    eventColors={eventColors.length > 0 ? eventColors : ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B']}
                                    eventColorImage={eventColorImage}
                                    styleConfig={{
                                      fillType: 'color',
                                      fillColor: settings[`welcome_${activeTarget}_font_color`] || '#ffffff',
                                      strokeActive: settings[`welcome_${activeTarget}_stroke_active`] || false,
                                      strokeColor: settings[`welcome_${activeTarget}_stroke_color`] || '#000000',
                                      strokeWidth: parseInt(settings[`welcome_${activeTarget}_stroke_width`] || '2'),
                                      strokeType: settings[`welcome_${activeTarget}_stroke_type`] || 'OUT',
                                      shadowActive: settings[`welcome_${activeTarget}_shadow_active`] || false,
                                      shadowColor: settings[`welcome_${activeTarget}_shadow_color`] || '#000000',
                                      shadowBlur: parseInt(settings[`welcome_${activeTarget}_shadow_blur`] || '8'),
                                    }}
                                    onChange={(updated) => {
                                      if (updated.fillColor) updateSetting(`welcome_${activeTarget}_font_color`, updated.fillColor);
                                      if (updated.strokeActive !== undefined) updateSetting(`welcome_${activeTarget}_stroke_active`, updated.strokeActive);
                                      if (updated.strokeColor) updateSetting(`welcome_${activeTarget}_stroke_color`, updated.strokeColor);
                                      if (updated.strokeWidth !== undefined) updateSetting(`welcome_${activeTarget}_stroke_width`, updated.strokeWidth.toString());
                                      if (updated.strokeType) updateSetting(`welcome_${activeTarget}_stroke_type`, updated.strokeType);
                                      if (updated.shadowActive !== undefined) updateSetting(`welcome_${activeTarget}_shadow_active`, updated.shadowActive);
                                      if (updated.shadowColor) updateSetting(`welcome_${activeTarget}_shadow_color`, updated.shadowColor);
                                      if (updated.shadowBlur !== undefined) updateSetting(`welcome_${activeTarget}_shadow_blur`, updated.shadowBlur.toString());
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* 2. TARJETA INFERIOR: FUENTE Y ESTILOS DE BOTÓN (NORMAL / SOBRE) */}
                            <div className="rounded-2xl p-4 border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                              <div className="pb-2 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-2.5">
                                  <MousePointer2 size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                  <div className="flex flex-col leading-tight">
                                    <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                      Fuente y Estilo de Botón ({buttonState === 'hover' ? 'Sobre' : 'Normal'})
                                    </h3>
                                    <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                      Tipografía, alineación, formato y estilo de texto del botón
                                    </span>
                                  </div>
                                </div>

                                <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                  {[
                                    { id: 'normal', label: 'Normal' },
                                    { id: 'hover', label: 'Sobre' },
                                  ].map((modeItem) => {
                                    const isModeActive = buttonState === modeItem.id;
                                    return (
                                      <button
                                        key={modeItem.id}
                                        type="button"
                                        onClick={() => setButtonState(modeItem.id as any)}
                                        className="botab-item"
                                        style={{
                                          backgroundColor: isModeActive ? 'var(--primary-accent)' : 'transparent',
                                          color: isModeActive ? '#ffffff' : 'var(--text-muted)',
                                        }}
                                      >
                                        {modeItem.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
                                {/* TEXTO DEL BOTÓN */}
                                <div className="w-full md:w-52 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                    Texto del Botón
                                  </label>
                                  <input
                                    type="text"
                                    value={settings.welcome_button_text ?? 'Continuar'}
                                    onChange={(e) => updateSetting('welcome_button_text', e.target.value)}
                                    placeholder="Ej: Continuar"
                                    className="w-full h-9 rounded-xl px-3 border outline-none text-xs font-medium"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                  />
                                </div>

                                {/* FUENTE */}
                                <div className="flex-1 min-w-[180px]">
                                  <FontPicker
                                    label="Fuente"
                                    value={settings.welcome_button_font_family || settings.global_button_font_family || 'Inter'}
                                    onChange={(f) => updateSetting('welcome_button_font_family', f)}
                                  />
                                </div>

                                {/* TAMAÑO */}
                                <div className="w-full md:w-36 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Tamaño</label>
                                  <div className="flex items-center h-9 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const curr = parseFloat(settings.welcome_button_font_size || '14');
                                        updateSetting('welcome_button_font_size', Math.max(5, curr - 0.5).toString());
                                      }}
                                      className="w-8 h-full flex items-center justify-center border-r hover:bg-black/5 cursor-pointer shrink-0"
                                      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                                    >
                                      <Minus size={12} />
                                    </button>
                                    <div className="flex-1 flex items-center justify-center px-1">
                                      <input
                                        type="number"
                                        min={5}
                                        max={80}
                                        step={0.5}
                                        value={settings.welcome_button_font_size || '14'}
                                        onChange={(e) => updateSetting('welcome_button_font_size', e.target.value)}
                                        className="w-full h-full text-center bg-transparent outline-none font-bold text-xs"
                                        style={{ color: 'var(--text-main)' }}
                                      />
                                      <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>px</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const curr = parseFloat(settings.welcome_button_font_size || '14');
                                        updateSetting('welcome_button_font_size', Math.min(80, curr + 0.5).toString());
                                      }}
                                      className="w-8 h-full flex items-center justify-center border-l hover:bg-black/5 cursor-pointer shrink-0"
                                      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                </div>

                                {/* FORMATO */}
                                <div className="w-full md:w-28 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Formato</label>
                                  <div className="flex items-center h-9 rounded-xl border p-0.5 gap-0.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting('welcome_button_font_weight', settings.welcome_button_font_weight === 'bold' ? 'normal' : 'bold')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center cursor-pointer"
                                      style={{ backgroundColor: settings.welcome_button_font_weight === 'bold' ? 'var(--primary-accent)' : 'transparent', color: settings.welcome_button_font_weight === 'bold' ? '#ffffff' : 'var(--text-muted)' }}
                                    >
                                      <Bold size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting('welcome_button_font_style', settings.welcome_button_font_style === 'italic' ? 'normal' : 'italic')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center cursor-pointer"
                                      style={{ backgroundColor: settings.welcome_button_font_style === 'italic' ? 'var(--primary-accent)' : 'transparent', color: settings.welcome_button_font_style === 'italic' ? '#ffffff' : 'var(--text-muted)' }}
                                    >
                                      <Italic size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting('welcome_button_text_decoration', settings.welcome_button_text_decoration === 'underline' ? 'none' : 'underline')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center cursor-pointer"
                                      style={{ backgroundColor: settings.welcome_button_text_decoration === 'underline' ? 'var(--primary-accent)' : 'transparent', color: settings.welcome_button_text_decoration === 'underline' ? '#ffffff' : 'var(--text-muted)' }}
                                    >
                                      <Underline size={13} />
                                    </button>
                                  </div>
                                </div>

                                {/* ALINEACIÓN */}
                                <div className="w-full md:w-32 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Alineación</label>
                                  <div className="flex items-center h-9 rounded-xl border p-0.5 gap-0.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                    {[
                                      { id: 'left', icon: AlignLeft, title: 'Izquierda' },
                                      { id: 'center', icon: AlignCenter, title: 'Centro' },
                                      { id: 'right', icon: AlignRight, title: 'Derecha' },
                                      { id: 'justify', icon: AlignJustify, title: 'Justificado' },
                                    ].map((align) => {
                                      const AlignIcon = align.icon;
                                      const isAlignActive = (settings.welcome_button_text_align || settings.global_button_text_align || 'center') === align.id;
                                      return (
                                        <button
                                          key={align.id}
                                          type="button"
                                          onClick={() => updateSetting('welcome_button_text_align', align.id)}
                                          className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                          style={{
                                            backgroundColor: isAlignActive ? 'var(--primary-accent)' : 'transparent',
                                            color: isAlignActive ? '#ffffff' : 'var(--text-muted)',
                                          }}
                                          title={align.title}
                                        >
                                          <AlignIcon size={13} />
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* ESTILO DEL TEXTO (Normal / Sobre) */}
                                <div className="w-full md:w-32 shrink-0">
                                  {(() => {
                                    const isH = buttonState === 'hover';
                                    const colorKey = isH ? 'welcome_button_hover_font_color' : 'welcome_button_font_color';
                                    const strokeActiveKey = isH ? 'welcome_button_hover_stroke_active' : 'welcome_button_stroke_active';
                                    const strokeColorKey = isH ? 'welcome_button_hover_stroke_color' : 'welcome_button_stroke_color';
                                    const strokeWidthKey = isH ? 'welcome_button_hover_stroke_width' : 'welcome_button_stroke_width';
                                    const strokeTypeKey = isH ? 'welcome_button_hover_stroke_type' : 'welcome_button_stroke_type';
                                    const shadowActiveKey = isH ? 'welcome_button_hover_shadow_active' : 'welcome_button_shadow_active';
                                    const shadowColorKey = isH ? 'welcome_button_hover_shadow_color' : 'welcome_button_shadow_color';
                                    const shadowBlurKey = isH ? 'welcome_button_hover_shadow_blur' : 'welcome_button_shadow_blur';

                                    return (
                                      <StylePickerPopover
                                        label={`Estilo (${isH ? 'Sobre' : 'Normal'})`}
                                        elementType="text"
                                        eventColors={eventColors.length > 0 ? eventColors : ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B']}
                                        eventColorImage={eventColorImage}
                                        styleConfig={{
                                          fillType: 'color',
                                          fillColor: settings[colorKey] || '#ffffff',
                                          strokeActive: settings[strokeActiveKey] || false,
                                          strokeColor: settings[strokeColorKey] || '#000000',
                                          strokeWidth: parseInt(settings[strokeWidthKey] || '2'),
                                          strokeType: settings[strokeTypeKey] || 'OUT',
                                          shadowActive: settings[shadowActiveKey] || false,
                                          shadowColor: settings[shadowColorKey] || '#000000',
                                          shadowBlur: parseInt(settings[shadowBlurKey] || '8'),
                                        }}
                                        onChange={(updated) => {
                                          if (updated.fillColor) updateSetting(colorKey, updated.fillColor);
                                          if (updated.strokeActive !== undefined) updateSetting(strokeActiveKey, updated.strokeActive);
                                          if (updated.strokeColor) updateSetting(strokeColorKey, updated.strokeColor);
                                          if (updated.strokeWidth !== undefined) updateSetting(strokeWidthKey, updated.strokeWidth.toString());
                                          if (updated.strokeType) updateSetting(strokeTypeKey, updated.strokeType);
                                          if (updated.shadowActive !== undefined) updateSetting(shadowActiveKey, updated.shadowActive);
                                          if (updated.shadowColor) updateSetting(shadowColorKey, updated.shadowColor);
                                          if (updated.shadowBlur !== undefined) updateSetting(shadowBlurKey, updated.shadowBlur.toString());
                                        }}
                                      />
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                          );
                        })()}

                        {/* 2.2.2 SUB-PESTAÑA CONTENEDOR EN BIENVENIDA (ESTRUCTURA EXACTA A PRECARGA/QR) */}
                        {gpsSubTab === 'fondos' && (() => {
                          const activeLeftTarget = precargaContainerTarget === 'boton' ? 'fondo' : precargaContainerTarget;
                          const isFondoTarget = activeLeftTarget === 'fondo';
                          const prefix = isFondoTarget ? 'welcome_screen' : 'welcome_card';
                          const bgTypeKey = `${prefix}_bg_type`;
                          const bgColorKey = `${prefix}_bg_color`;
                          const gradKey = `${prefix}_gradient_data`;
                          const imageKey = `${prefix}_image_url`;
                          const videoRotateKey = `${prefix}_video_rotate`;

                          const imageUrl = settings[imageKey] || '';
                          const bgType = settings[bgTypeKey] || 'color';
                          const videoRotate = !!settings[videoRotateKey];

                          const buttonPrefix = buttonState === 'hover' ? 'button_hover' : 'button';
                          const buttonImageKey = `${buttonPrefix}_image_url`;
                          const buttonBgTypeKey = `${buttonPrefix}_bg_type`;
                          const buttonVideoRotateKey = `${buttonPrefix}_video_rotate`;
                          const buttonImageUrl = settings[buttonImageKey] || '';
                          const buttonBgType = settings[buttonBgTypeKey] || 'color';
                          const buttonVideoRotate = !!settings[buttonVideoRotateKey];

                          return (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* COLUMNA IZQUIERDA: CONTENEDORES (FONDO / MENSAJE) */}
                              <div className="rounded-2xl p-3 border space-y-3 shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                <div>
                                  <div className="pb-2 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center gap-2">
                                      <Palette size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                      <div className="flex flex-col leading-tight">
                                        <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                          Contenedores ({activeLeftTarget === 'fondo' ? 'Fondo' : 'Mensaje'})
                                        </h3>
                                        <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                          Estilos y fondos de pantalla de GPS
                                        </span>
                                      </div>
                                    </div>

                                    {/* PESTAÑAS FONDO / MENSAJE */}
                                    <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                      {[
                                        { id: 'fondo', label: 'Fondo' },
                                        { id: 'mensaje', label: 'Mensaje' },
                                      ].map((cTarget) => {
                                        const isCTargetActive = activeLeftTarget === cTarget.id;
                                        return (
                                          <button
                                            key={cTarget.id}
                                            type="button"
                                            onClick={() => setPrecargaContainerTarget(cTarget.id as any)}
                                            className="botab-item"
                                            style={{
                                              backgroundColor: isCTargetActive ? 'var(--primary-accent)' : 'transparent',
                                              color: isCTargetActive ? '#ffffff' : 'var(--text-muted)',
                                            }}
                                          >
                                            {cTarget.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="space-y-3 pt-2">
                                    {/* SUBIR IMAGEN / VIDEO DEL CONTENEDOR */}
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                          Imagen / Video ({isFondoTarget ? 'Fondo General' : 'Recuadro Central'})
                                        </label>
                                        <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer select-none" style={{ color: 'var(--text-muted)' }}>
                                          <input
                                            type="checkbox"
                                            checked={videoRotate}
                                            onChange={(e) => updateSetting(videoRotateKey, e.target.checked)}
                                            className="rounded border-gray-400 focus:ring-0 h-3 w-3 cursor-pointer"
                                            style={{ accentColor: 'var(--primary-accent)' }}
                                          />
                                          <span>Rotar Video</span>
                                        </label>
                                      </div>
                                      
                                      <div className="border-2 border-dashed rounded-2xl p-2 text-center flex flex-col items-center justify-center transition-all relative overflow-hidden group h-[120px] min-h-[120px]" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                        {imageUrl ? (
                                          <div className="relative w-full h-full rounded-xl overflow-hidden group bg-black/40 flex items-center justify-center">
                                            <img src={imageUrl} alt="Imagen de fondo" className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                              <button type="button" onClick={() => updateSetting(imageKey, '')} className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-600 transition-colors">
                                                <Trash2 size={16} />
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                                            <div className="p-2.5 rounded-full mb-1.5" style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}>
                                              <Upload size={18} />
                                            </div>
                                            <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Subir Imagen / Video</span>
                                            <input
                                              type="file"
                                              accept="image/*,video/*"
                                              className="hidden"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  const isVideo = file.type.startsWith('video/');
                                                  const reader = new FileReader();
                                                  reader.onload = (ev) => {
                                                    updateSetting(imageKey, ev.target?.result);
                                                    updateSetting(bgTypeKey, isVideo ? 'video' : 'image');
                                                  };
                                                  reader.readAsDataURL(file);
                                                }
                                              }}
                                            />
                                          </label>
                                        )}
                                      </div>
                                    </div>

                                    {/* CONTROLES IZQUIERDA: ESTILO, REDONDEZ, GLASS */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end pt-1">
                                      <div>
                                        <StylePickerPopover
                                          label="Estilo"
                                          elementType="box"
                                          eventColors={eventColors.length > 0 ? eventColors : ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B']}
                                          eventColorImage={eventColorImage}
                                          styleConfig={{
                                            backgroundColor: settings[bgColorKey] || (isFondoTarget ? '#0f172a' : '#000000'),
                                            borderWidth: settings[`${prefix}_border_width`] ?? 0,
                                            borderStyle: settings[`${prefix}_border_style`] || 'solid',
                                            borderColor: settings[`${prefix}_border_color`] || '#E07A5F',
                                            borderRadius: settings[`${prefix}_border_radius`] ?? (isFondoTarget ? 0 : 16),
                                          }}
                                          onChange={(updated) => {
                                            const selectedColor = updated.backgroundColor || updated.fillColor;
                                            if (selectedColor) updateSetting(bgColorKey, selectedColor);
                                            if (updated.borderWidth !== undefined) updateSetting(`${prefix}_border_width`, updated.borderWidth);
                                            if (updated.borderColor !== undefined) updateSetting(`${prefix}_border_color`, updated.borderColor);
                                            if (updated.borderRadius !== undefined) updateSetting(`${prefix}_border_radius`, updated.borderRadius);
                                          }}
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Redondez</label>
                                        <div className="flex items-center h-9 rounded-xl border overflow-hidden w-full" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const curr = parseInt(settings[`${prefix}_border_radius`] ?? (isFondoTarget ? '0' : '16'));
                                              updateSetting(`${prefix}_border_radius`, Math.max(0, curr - 2));
                                            }}
                                            className="w-8 h-full flex items-center justify-center border-r shrink-0 cursor-pointer"
                                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                                          >
                                            <Minus size={12} />
                                          </button>
                                          <div className="flex-1 flex items-center justify-center px-1">
                                            <input
                                              type="number"
                                              min={0}
                                              max={50}
                                              value={settings[`${prefix}_border_radius`] ?? (isFondoTarget ? 0 : 16)}
                                              onChange={(e) => updateSetting(`${prefix}_border_radius`, parseInt(e.target.value) || 0)}
                                              className="w-full h-full text-center bg-transparent outline-none font-bold text-xs"
                                              style={{ color: 'var(--text-main)' }}
                                            />
                                            <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>px</span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const curr = parseInt(settings[`${prefix}_border_radius`] ?? (isFondoTarget ? '0' : '16'));
                                              updateSetting(`${prefix}_border_radius`, Math.min(50, curr + 2));
                                            }}
                                            className="w-8 h-full flex items-center justify-center border-l shrink-0 cursor-pointer"
                                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                                          >
                                            <Plus size={12} />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Glass / Cristal */}
                                      <div>
                                        <div className="flex items-center justify-between mb-1">
                                          <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                            Glass (Blur)
                                          </label>
                                          <label className="relative flex items-center cursor-pointer shrink-0 select-none">
                                            <input
                                              type="checkbox"
                                              checked={
                                                isFondoTarget
                                                  ? (settings.welcome_screen_glass_enabled ?? false)
                                                  : (settings.welcome_card_glass_enabled ?? true)
                                              }
                                              onChange={(e) => {
                                                const key = isFondoTarget ? 'welcome_screen_glass_enabled' : 'welcome_card_glass_enabled';
                                                updateSetting(key, e.target.checked);
                                              }}
                                              className="sr-only peer"
                                            />
                                            <div
                                              className="w-4 h-4 rounded border flex items-center justify-center transition-all peer-checked:border-[var(--primary-accent)] peer-checked:bg-[var(--primary-accent)]"
                                              style={{
                                                borderColor: (isFondoTarget ? (settings.welcome_screen_glass_enabled ?? false) : (settings.welcome_card_glass_enabled ?? true)) ? 'var(--primary-accent)' : 'var(--border-color)',
                                                backgroundColor: (isFondoTarget ? (settings.welcome_screen_glass_enabled ?? false) : (settings.welcome_card_glass_enabled ?? true)) ? 'var(--primary-accent)' : 'var(--bg-card)',
                                              }}
                                            >
                                              {(isFondoTarget ? (settings.welcome_screen_glass_enabled ?? false) : (settings.welcome_card_glass_enabled ?? true)) && (
                                                <Check size={11} className="text-white stroke-[3]" />
                                              )}
                                            </div>
                                          </label>
                                        </div>

                                        <div
                                          className={`flex items-center h-9 rounded-xl border px-3 transition-opacity ${
                                            !(isFondoTarget ? (settings.welcome_screen_glass_enabled ?? false) : (settings.welcome_card_glass_enabled ?? true)) ? 'opacity-40 pointer-events-none' : ''
                                          }`}
                                          style={{
                                            backgroundColor: 'var(--bg-app)',
                                            borderColor: 'var(--border-color)',
                                          }}
                                        >
                                          <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="1"
                                            value={settings[`${prefix}_bg_opacity`] ?? 100}
                                            onChange={(e) => updateSetting(`${prefix}_bg_opacity`, parseInt(e.target.value))}
                                            className="w-full accent-[var(--primary-accent)] cursor-pointer h-1.5 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* COLUMNA DERECHA: BOTONES (NORMAL / SOBRE) */}
                              <div className="rounded-2xl p-3 border space-y-3 shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                <div>
                                  <div className="pb-2 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center gap-2">
                                      <MousePointerClick size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                      <div className="flex flex-col leading-tight">
                                        <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                          Botones ({buttonState === 'hover' ? 'Sobre' : 'Normal'})
                                        </h3>
                                        <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                          Estilos y efectos de botón
                                        </span>
                                      </div>
                                    </div>

                                    {/* PESTAÑAS NORMAL / SOBRE */}
                                    <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                      {[
                                        { id: 'normal', label: 'Normal' },
                                        { id: 'hover', label: 'Sobre' },
                                      ].map((modeItem) => {
                                        const isModeActive = buttonState === modeItem.id;
                                        return (
                                          <button
                                            key={modeItem.id}
                                            type="button"
                                            onClick={() => setButtonState(modeItem.id as any)}
                                            className="botab-item"
                                            style={{
                                              backgroundColor: isModeActive ? 'var(--primary-accent)' : 'transparent',
                                              color: isModeActive ? '#ffffff' : 'var(--text-muted)',
                                            }}
                                          >
                                            {modeItem.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="space-y-3 pt-2">
                                    {/* SUBIR IMAGEN / VIDEO DEL BOTÓN */}
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                          Imagen / Video ({buttonState === 'hover' ? 'Sobre' : 'Normal'})
                                        </label>
                                        <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer select-none" style={{ color: 'var(--text-muted)' }} title="Rotar orientación de video 90° en el botón">
                                          <input
                                            type="checkbox"
                                            checked={buttonVideoRotate}
                                            onChange={(e) => updateSetting(buttonVideoRotateKey, e.target.checked)}
                                            className="rounded border-gray-400 focus:ring-0 h-3 w-3 cursor-pointer"
                                            style={{ accentColor: 'var(--primary-accent)' }}
                                          />
                                          <span>Rotar Video</span>
                                        </label>
                                      </div>
                                      
                                      <div
                                        className="border-2 border-dashed rounded-2xl p-2 text-center flex flex-col items-center justify-center transition-all relative overflow-hidden group h-[120px] min-h-[120px]"
                                        style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                                      >
                                        {buttonImageUrl ? (
                                          <div className="relative w-full h-full rounded-xl overflow-hidden group bg-black/40 flex items-center justify-center">
                                            {buttonBgType === 'video' || String(buttonImageUrl).startsWith('data:video') || String(buttonImageUrl).match(/\.(mp4|webm|ogg)$/i) ? (
                                              <video
                                                src={buttonImageUrl}
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className="w-full h-full object-contain"
                                              />
                                            ) : (
                                              <img
                                                src={buttonImageUrl}
                                                alt="Imagen del botón"
                                                className="w-full h-full object-contain"
                                              />
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                              <label className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/40 cursor-pointer transition-colors" title="Cambiar archivo">
                                                <Upload size={16} />
                                                <input
                                                  type="file"
                                                  accept="image/*,video/*"
                                                  className="hidden"
                                                  onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                      const isVideo = file.type.startsWith('video/');
                                                      const reader = new FileReader();
                                                      reader.onload = (ev) => {
                                                        updateSetting(buttonImageKey, ev.target?.result);
                                                        updateSetting(buttonBgTypeKey, isVideo ? 'video' : 'image');
                                                      };
                                                      reader.readAsDataURL(file);
                                                    }
                                                  }}
                                                />
                                              </label>
                                              <button
                                                type="button"
                                                onClick={() => updateSetting(buttonImageKey, '')}
                                                className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-600 transition-colors"
                                                title="Eliminar archivo"
                                              >
                                                <Trash2 size={16} />
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                                            <div className="p-2.5 rounded-full mb-1.5" style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}>
                                              <Upload size={18} />
                                            </div>
                                            <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Subir Imagen / Video</span>
                                            <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>PNG, JPG, MP4 o WEBM</span>
                                            <input
                                              type="file"
                                              accept="image/*,video/*"
                                              className="hidden"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  const isVideo = file.type.startsWith('video/');
                                                  const reader = new FileReader();
                                                  reader.onload = (ev) => {
                                                    updateSetting(buttonImageKey, ev.target?.result);
                                                    updateSetting(buttonBgTypeKey, isVideo ? 'video' : 'image');
                                                  };
                                                  reader.readAsDataURL(file);
                                                }
                                              }}
                                            />
                                          </label>
                                        )}
                                      </div>
                                    </div>

                                    {/* CONTROLES DERECHA: ESTILO, REDONDEZ, GLASS */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end pt-1">
                                      {/* Estilo */}
                                      <div>
                                        <StylePickerPopover
                                          label={`Estilo (${buttonState === 'hover' ? 'Sobre' : 'Normal'})`}
                                          elementType="box"
                                          eventColors={eventColors.length > 0 ? eventColors : ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B']}
                                          eventColorImage={eventColorImage}
                                          styleConfig={{
                                            backgroundColor: settings[`${buttonPrefix}_bg_type`] === 'gradient' && settings[`${buttonPrefix}_gradient_data`]
                                              ? (typeof settings[`${buttonPrefix}_gradient_data`] === 'string' ? settings[`${buttonPrefix}_gradient_data`] : settings[`${buttonPrefix}_bg_color`] || '#E07A5F')
                                              : (settings[`${buttonPrefix}_bg_color`] || '#E07A5F'),
                                            borderWidth: settings[`${buttonPrefix}_border_width`] ?? 0,
                                            borderStyle: settings[`${buttonPrefix}_border_style`] || 'solid',
                                            borderColor: settings[`${buttonPrefix}_border_color`] || '#E07A5F',
                                            borderRadius: settings[`${buttonPrefix}_border_radius`] ?? 12,
                                            shadowColor: settings[`${buttonPrefix}_shadow_color`] || '#000000',
                                            shadowBlur: settings[`${buttonPrefix}_shadow_blur`] ?? 0,
                                            shadowOffsetX: settings[`${buttonPrefix}_shadow_offset_x`] ?? 0,
                                            shadowOffsetY: settings[`${buttonPrefix}_shadow_offset_y`] ?? 0,
                                          }}
                                          onChange={(updated) => {
                                            const prefix = buttonPrefix;
                                            const bgPrefix = `${prefix}_bg`;
                                            const gradKey = `${prefix}_gradient_data`;

                                            const selectedColor = updated.backgroundColor || updated.fillColor;
                                            const selectedGradient = updated.fillGradient;

                                            if (updated.fillType === 'gradient' && selectedGradient) {
                                              updateSetting(`${bgPrefix}_type`, 'gradient');
                                              updateSetting(gradKey, selectedGradient);
                                            } else if (selectedColor) {
                                              if (typeof selectedColor === 'string' && selectedColor.includes('gradient')) {
                                                updateSetting(`${bgPrefix}_type`, 'gradient');
                                                updateSetting(gradKey, selectedColor);
                                              } else {
                                                updateSetting(`${bgPrefix}_type`, 'color');
                                                updateSetting(`${bgPrefix}_color`, selectedColor);
                                              }
                                            }

                                            if (updated.borderWidth !== undefined) updateSetting(`${prefix}_border_width`, updated.borderWidth);
                                            if (updated.borderStyle !== undefined) updateSetting(`${prefix}_border_style`, updated.borderStyle);
                                            if (updated.borderColor !== undefined) updateSetting(`${prefix}_border_color`, updated.borderColor);
                                            if (updated.borderRadius !== undefined) updateSetting(`${prefix}_border_radius`, updated.borderRadius);
                                            if (updated.shadowColor !== undefined) updateSetting(`${prefix}_shadow_color`, updated.shadowColor);
                                            if (updated.shadowBlur !== undefined) updateSetting(`${prefix}_shadow_blur`, updated.shadowBlur);
                                            if (updated.shadowOffsetX !== undefined) updateSetting(`${prefix}_shadow_offset_x`, updated.shadowOffsetX);
                                            if (updated.shadowOffsetY !== undefined) updateSetting(`${prefix}_shadow_offset_y`, updated.shadowOffsetY);
                                          }}
                                        />
                                      </div>

                                      {/* Redondez */}
                                      <div>
                                        <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                          Redondez
                                        </label>
                                        <div
                                          className="flex items-center h-9 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full shadow-2xs"
                                          style={{
                                            backgroundColor: 'var(--bg-app)',
                                            borderColor: 'var(--border-color)',
                                          }}
                                        >
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const key = `${buttonPrefix}_border_radius`;
                                              const curr = parseInt(settings[key] ?? '12');
                                              const nextVal = Math.max(0, curr - 2);
                                              updateSetting(key, nextVal);
                                            }}
                                            className="w-8 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                            style={{
                                              backgroundColor: 'var(--bg-card)',
                                              borderColor: 'var(--border-color)',
                                              color: 'var(--primary-accent)',
                                            }}
                                            title="Disminuir redondez"
                                          >
                                            <Minus size={12} />
                                          </button>

                                          <div className="flex-1 flex items-center justify-center px-1">
                                            <input
                                              type="number"
                                              min={0}
                                              max={100}
                                              value={settings[`${buttonPrefix}_border_radius`] ?? 12}
                                              onChange={(e) => {
                                                const key = `${buttonPrefix}_border_radius`;
                                                updateSetting(key, parseInt(e.target.value) || 0);
                                              }}
                                              className="w-full h-full text-center bg-transparent outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                              style={{ color: 'var(--text-main)' }}
                                            />
                                            <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>
                                              px
                                            </span>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              const key = `${buttonPrefix}_border_radius`;
                                              const curr = parseInt(settings[key] ?? '12');
                                              const nextVal = Math.min(100, curr + 2);
                                              updateSetting(key, nextVal);
                                            }}
                                            className="w-8 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                            style={{
                                              backgroundColor: 'var(--bg-card)',
                                              borderColor: 'var(--border-color)',
                                              color: 'var(--primary-accent)',
                                            }}
                                            title="Aumentar redondez"
                                          >
                                            <Plus size={12} />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Glass */}
                                      <div>
                                        <div className="flex items-center justify-between mb-1">
                                          <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                            Glass ({settings[`${buttonPrefix}_bg_opacity`] ?? 100}%)
                                          </label>
                                          <label className="relative flex items-center cursor-pointer shrink-0 select-none">
                                            <input
                                              type="checkbox"
                                              checked={settings[`${buttonPrefix}_glass_enabled`] ?? true}
                                              onChange={(e) => {
                                                const key = `${buttonPrefix}_glass_enabled`;
                                                updateSetting(key, e.target.checked);
                                              }}
                                              className="sr-only peer"
                                            />
                                            <div
                                              className="w-4 h-4 rounded border flex items-center justify-center transition-all peer-checked:border-[var(--primary-accent)] peer-checked:bg-[var(--primary-accent)]"
                                              style={{
                                                borderColor: (settings[`${buttonPrefix}_glass_enabled`] ?? true) ? 'var(--primary-accent)' : 'var(--border-color)',
                                                backgroundColor: (settings[`${buttonPrefix}_glass_enabled`] ?? true) ? 'var(--primary-accent)' : 'var(--bg-card)',
                                              }}
                                            >
                                              {(settings[`${buttonPrefix}_glass_enabled`] ?? true) && (
                                                <Check size={11} className="text-white stroke-[3]" />
                                              )}
                                            </div>
                                          </label>
                                        </div>

                                        <div
                                          className={`flex items-center h-9 rounded-xl border px-3 transition-opacity ${
                                            !(settings[`${buttonPrefix}_glass_enabled`] ?? true) ? 'opacity-40 pointer-events-none' : ''
                                          }`}
                                          style={{
                                            backgroundColor: 'var(--bg-app)',
                                            borderColor: 'var(--border-color)',
                                          }}
                                        >
                                          <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="1"
                                            value={settings[`${buttonPrefix}_bg_opacity`] ?? 100}
                                            onChange={(e) => {
                                              const key = `${buttonPrefix}_bg_opacity`;
                                              updateSetting(key, parseInt(e.target.value));
                                            }}
                                            className="w-full h-1.5 rounded-lg cursor-pointer"
                                            style={{
                                              accentColor: 'var(--primary-accent)',
                                            }}
                                            title="Opacidad del vidrio"
                                            disabled={!(settings[`${buttonPrefix}_glass_enabled`] ?? true)}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* LOGOS EN BIENVENIDA (CONFIGURACIÓN DE LOGO DEL EVENTO Y LOGO DEL PARTNER) */}
                        {gpsSubTab === 'logos' && (() => {
                          const displayEventLogo = settings.event_logo_url || eventData?.logo_url || (eventData?.logo ? `/storage/${eventData.logo}` : null);
                          const displayPartnerLogo = settings.project_logo_precarga_url || settings.partner_logo_precarga_url || settings.partner_logo_url || eventData?.partner_logo_url || eventData?.partner?.logo_url || "/dinvited.png";
                          const activeState = 'welcome';
                          const stateLabels: Record<string, string> = { welcome: 'GPS', camera: 'Cámara', gallery: 'Galería' };

                          const getSettingVal = (type: 'event' | 'partner', field: string, defaultVal: any) => {
                            const key = `${type}_logo_${activeState}_${field}`;
                            if (settings[key] !== undefined) return settings[key];
                            return defaultVal;
                          };
                          const updateLogoSetting = (type: 'event' | 'partner', field: string, value: any) => {
                            updateSetting(`${type}_logo_${activeState}_${field}`, value);
                          };

                          const eventV = getSettingVal('event', 'position_v', 'top');
                          const eventH = getSettingVal('event', 'position_h', 'center');
                          const eventSize = getSettingVal('event', 'size', 60);
                          const eventUnit = getSettingVal('event', 'unit', 'px');

                          const partnerV = getSettingVal('partner', 'position_v', 'bottom');
                          const partnerH = getSettingVal('partner', 'position_h', 'center');
                          const partnerSize = getSettingVal('partner', 'size', 40);
                          const partnerUnit = getSettingVal('partner', 'unit', 'px');

                          const eventShowKey = `event_logo_show_welcome`;
                          const partnerShowKey = `partner_logo_show_welcome`;

                          const eventShow = settings[eventShowKey] ?? true;
                          const partnerShow = settings[partnerShowKey] ?? true;

                          return (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* COLUMNA 1: LOGO DEL EVENTO */}
                              <div className="rounded-2xl p-4 border shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                <div>
                                  <div className="pb-2 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center gap-2">
                                      <ImageIcon size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                      <div className="flex flex-col leading-tight">
                                        <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                                          <span>Logo del Evento</span>
                                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase text-white shadow-2xs" style={{ backgroundColor: 'var(--primary-accent)' }}>
                                            {stateLabels[activeState]}
                                          </span>
                                        </h3>
                                        <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                          Configurando la pantalla de {stateLabels[activeState]}
                                        </span>
                                      </div>
                                    </div>

                                    {/* VISIBILIDAD DE LOGO EVENTO EN BIENVENIDA */}
                                    <button
                                      type="button"
                                      onClick={() => updateSetting(eventShowKey, !eventShow)}
                                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer"
                                      style={{
                                        backgroundColor: eventShow ? 'var(--primary-accent)' : 'var(--bg-app)',
                                        borderColor: eventShow ? 'var(--primary-accent)' : 'var(--border-color)',
                                        color: eventShow ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                    >
                                      {eventShow ? <Eye size={13} /> : <EyeOff size={13} />}
                                      <span>{eventShow ? 'Visible en GPS' : 'Oculto en GPS'}</span>
                                    </button>
                                  </div>

                                  {/* GRID INTERNO: IZQ = VISTA PREVIA, DER = CONTROLES */}
                                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3">
                                    {/* VISTA PREVIA LOGO EVENTO */}
                                    <div className="md:col-span-4 flex flex-col items-center justify-center">
                                      <div
                                        className="relative w-full h-full min-h-[140px] rounded-xl border overflow-hidden flex flex-col items-center justify-center p-3"
                                        style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                                      >
                                        {displayEventLogo ? (
                                          <div className="relative w-full h-full flex flex-col items-center justify-center">
                                            <img src={displayEventLogo} alt="Logo Evento" className="max-h-24 max-w-full object-contain drop-shadow-md" />
                                          </div>
                                        ) : (
                                          <div className="flex flex-col items-center justify-center text-center p-2">
                                            <ImageIcon size={20} className="opacity-40 mb-1" style={{ color: 'var(--text-muted)' }} />
                                            <span className="text-xs font-bold opacity-75" style={{ color: 'var(--text-main)' }}>
                                              Sin logo registrado
                                            </span>
                                            <span className="text-[10px] opacity-60 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                              El evento en BD no tiene un logo cargado
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* CONTROLES LOGO EVENTO */}
                                    <div className="md:col-span-8 space-y-2.5">
                                      <div className="grid grid-cols-2 gap-2">
                                        {/* Alineación Vertical */}
                                        <div>
                                          <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                            Alineación Vertical
                                          </label>
                                          <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            {[
                                              { id: 'top', label: 'Arriba' },
                                              { id: 'center', label: 'Centro' },
                                              { id: 'bottom', label: 'Abajo' },
                                            ].map((pos) => {
                                              const isActive = eventV === pos.id;
                                              const isDisabled = partnerShow && partnerV === pos.id && partnerH === eventH;
                                              return (
                                                <button
                                                  key={pos.id}
                                                  type="button"
                                                  disabled={isDisabled}
                                                  onClick={() => updateLogoSetting('event', 'position_v', pos.id)}
                                                  className="botab-item"
                                                  style={{
                                                    backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                  }}
                                                  title={isDisabled ? 'Ocupado por el Logo del Partner' : undefined}
                                                >
                                                  {pos.label}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>

                                        {/* Alineación Horizontal */}
                                        <div>
                                          <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                            Alineación Horizontal
                                          </label>
                                          <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            {[
                                              { id: 'left', label: 'Izq' },
                                              { id: 'center', label: 'Centro' },
                                              { id: 'right', label: 'Der' },
                                            ].map((pos) => {
                                              const isActive = eventH === pos.id;
                                              const isDisabled = partnerShow && partnerH === pos.id && partnerV === eventV;
                                              return (
                                                <button
                                                  key={pos.id}
                                                  type="button"
                                                  disabled={isDisabled}
                                                  onClick={() => updateLogoSetting('event', 'position_h', pos.id)}
                                                  className="botab-item"
                                                  style={{
                                                    backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                  }}
                                                  title={isDisabled ? 'Ocupado por el Logo del Partner' : undefined}
                                                >
                                                  {pos.label}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Tamaño / Ancho Máximo */}
                                      <div>
                                        <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                          Tamaño / Ancho Máximo
                                        </label>
                                        <div className="flex items-center gap-1.5">
                                          <div className="flex-1 flex items-center h-7 rounded-lg border px-2 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            <input
                                              type="number"
                                              min={10}
                                              max={eventUnit === '%' ? 100 : 300}
                                              value={eventSize}
                                              onChange={(e) => updateLogoSetting('event', 'size', parseInt(e.target.value) || 30)}
                                              className="w-full bg-transparent outline-none font-bold text-xs text-center"
                                              style={{ color: 'var(--text-main)' }}
                                            />
                                          </div>
                                          <div className="flex rounded-lg border p-0.5" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            {['px', '%'].map((u) => {
                                              const isActive = eventUnit === u;
                                              return (
                                                <button
                                                  key={u}
                                                  type="button"
                                                  onClick={() => updateLogoSetting('event', 'unit', u)}
                                                  className="px-2 py-0.5 text-[9px] font-extrabold rounded transition-all cursor-pointer"
                                                  style={{
                                                    backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                  }}
                                                >
                                                  {u}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Márgenes independientes */}
                                      <div className="pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--border-color)' }}>
                                        <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                          Márgenes
                                        </label>

                                        {/* Fila 1: Arriba / Abajo */}
                                        <div className="grid grid-cols-2 gap-2">
                                          {[
                                            { field: 'margin_top', unitField: 'margin_top_unit', label: 'Arriba' },
                                            { field: 'margin_bottom', unitField: 'margin_bottom_unit', label: 'Abajo' },
                                          ].map((m) => {
                                            const val = getSettingVal('event', m.field, 0);
                                            const currentUnit = getSettingVal('event', m.unitField, getSettingVal('event', 'margin_unit', 'px'));
                                            return (
                                              <div key={m.field} className="flex flex-col gap-0.5">
                                                <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                                                <div className="flex items-center gap-1">
                                                  <div className="flex-1 flex items-center h-7 rounded-lg border px-1.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    <input
                                                      type="number"
                                                      value={val}
                                                      onChange={(e) => updateLogoSetting('event', m.field, parseInt(e.target.value) || 0)}
                                                      className="w-full bg-transparent outline-none font-bold text-[10px] text-center"
                                                      style={{ color: 'var(--text-main)' }}
                                                    />
                                                  </div>
                                                  <div className="flex rounded-lg border p-0.5 shrink-0" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    {['px', '%'].map((u) => {
                                                      const isActive = currentUnit === u;
                                                      return (
                                                        <button
                                                          key={u}
                                                          type="button"
                                                          onClick={() => updateLogoSetting('event', m.unitField, u)}
                                                          className="px-1.5 py-0.5 text-[8px] font-extrabold rounded transition-all cursor-pointer"
                                                          style={{
                                                            backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                            color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                          }}
                                                        >
                                                          {u}
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>

                                        {/* Fila 2: Izquierda / Derecha */}
                                        <div className="grid grid-cols-2 gap-2">
                                          {[
                                            { field: 'margin_left', unitField: 'margin_left_unit', label: 'Izquierda' },
                                            { field: 'margin_right', unitField: 'margin_right_unit', label: 'Derecha' },
                                          ].map((m) => {
                                            const val = getSettingVal('event', m.field, 0);
                                            const currentUnit = getSettingVal('event', m.unitField, getSettingVal('event', 'margin_unit', 'px'));
                                            return (
                                              <div key={m.field} className="flex flex-col gap-0.5">
                                                <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                                                <div className="flex items-center gap-1">
                                                  <div className="flex-1 flex items-center h-7 rounded-lg border px-1.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    <input
                                                      type="number"
                                                      value={val}
                                                      onChange={(e) => updateLogoSetting('event', m.field, parseInt(e.target.value) || 0)}
                                                      className="w-full bg-transparent outline-none font-bold text-[10px] text-center"
                                                      style={{ color: 'var(--text-main)' }}
                                                    />
                                                  </div>
                                                  <div className="flex rounded-lg border p-0.5 shrink-0" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    {['px', '%'].map((u) => {
                                                      const isActive = currentUnit === u;
                                                      return (
                                                        <button
                                                          key={u}
                                                          type="button"
                                                          onClick={() => updateLogoSetting('event', m.unitField, u)}
                                                          className="px-1.5 py-0.5 text-[8px] font-extrabold rounded transition-all cursor-pointer"
                                                          style={{
                                                            backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                            color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                          }}
                                                        >
                                                          {u}
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* COLUMNA 2: LOGO DEL PARTNER / MARCA */}
                              <div className="rounded-2xl p-4 border shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                <div>
                                  <div className="pb-2 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center gap-2">
                                      <Smartphone size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                      <div className="flex flex-col leading-tight">
                                        <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                                          <span>Logo del Partner</span>
                                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase text-white shadow-2xs" style={{ backgroundColor: 'var(--primary-accent)' }}>
                                            {stateLabels[activeState]}
                                          </span>
                                        </h3>
                                        <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                          Configurando la pantalla de {stateLabels[activeState]}
                                        </span>
                                      </div>
                                    </div>

                                    {/* VISIBILIDAD DE LOGO PARTNER EN BIENVENIDA */}
                                    <button
                                      type="button"
                                      onClick={() => updateSetting(partnerShowKey, !partnerShow)}
                                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer"
                                      style={{
                                        backgroundColor: partnerShow ? 'var(--primary-accent)' : 'var(--bg-app)',
                                        borderColor: partnerShow ? 'var(--primary-accent)' : 'var(--border-color)',
                                        color: partnerShow ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                    >
                                      {partnerShow ? <Eye size={13} /> : <EyeOff size={13} />}
                                      <span>{partnerShow ? 'Visible en GPS' : 'Oculto en GPS'}</span>
                                    </button>
                                  </div>

                                  {/* GRID INTERNO: IZQ = VISTA PREVIA PARTNER, DER = CONTROLES PARTNER */}
                                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3">
                                    {/* VISTA PREVIA LOGO PARTNER */}
                                    <div className="md:col-span-4 flex flex-col items-center justify-center">
                                      <div
                                        className="relative w-full h-full min-h-[140px] rounded-xl border overflow-hidden flex flex-col items-center justify-center p-3"
                                        style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                                      >
                                        {displayPartnerLogo ? (
                                          <div className="relative w-full h-full flex flex-col items-center justify-center">
                                            <img src={displayPartnerLogo} alt="Logo Partner" className="max-h-24 max-w-full object-contain drop-shadow-md" />
                                          </div>
                                        ) : (
                                          <div className="flex flex-col items-center justify-center text-center p-2">
                                            <Smartphone size={20} className="opacity-40 mb-1" style={{ color: 'var(--text-muted)' }} />
                                            <span className="text-xs font-bold opacity-75" style={{ color: 'var(--text-main)' }}>
                                              Sin logo partner registrado
                                            </span>
                                            <span className="text-[10px] opacity-60 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                              El evento en BD no tiene un partner asignado
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* CONTROLES LOGO PARTNER */}
                                    <div className="md:col-span-8 space-y-2.5">
                                      <div className="grid grid-cols-2 gap-2">
                                        {/* Alineación Vertical Partner */}
                                        <div>
                                          <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                            Alineación Vertical
                                          </label>
                                          <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            {[
                                              { id: 'top', label: 'Arriba' },
                                              { id: 'center', label: 'Centro' },
                                              { id: 'bottom', label: 'Abajo' },
                                            ].map((pos) => {
                                              const isActive = partnerV === pos.id;
                                              const isDisabled = eventShow && eventV === pos.id && eventH === partnerH;
                                              return (
                                                <button
                                                  key={pos.id}
                                                  type="button"
                                                  disabled={isDisabled}
                                                  onClick={() => updateLogoSetting('partner', 'position_v', pos.id)}
                                                  className="botab-item"
                                                  style={{
                                                    backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                  }}
                                                  title={isDisabled ? 'Ocupado por el Logo del Evento' : undefined}
                                                >
                                                  {pos.label}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>

                                        {/* Alineación Horizontal Partner */}
                                        <div>
                                          <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                            Alineación Horizontal
                                          </label>
                                          <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            {[
                                              { id: 'left', label: 'Izq' },
                                              { id: 'center', label: 'Centro' },
                                              { id: 'right', label: 'Der' },
                                            ].map((pos) => {
                                              const isActive = partnerH === pos.id;
                                              const isDisabled = eventShow && eventH === pos.id && eventV === partnerV;
                                              return (
                                                <button
                                                  key={pos.id}
                                                  type="button"
                                                  disabled={isDisabled}
                                                  onClick={() => updateLogoSetting('partner', 'position_h', pos.id)}
                                                  className="botab-item"
                                                  style={{
                                                    backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                  }}
                                                  title={isDisabled ? 'Ocupado por el Logo del Evento' : undefined}
                                                >
                                                  {pos.label}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Tamaño / Ancho Máximo Partner */}
                                      <div>
                                        <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                          Tamaño / Ancho Máximo
                                        </label>
                                        <div className="flex items-center gap-1.5">
                                          <div className="flex-1 flex items-center h-7 rounded-lg border px-2 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            <input
                                              type="number"
                                              min={10}
                                              max={partnerUnit === '%' ? 100 : 300}
                                              value={partnerSize}
                                              onChange={(e) => updateLogoSetting('partner', 'size', parseInt(e.target.value) || 30)}
                                              className="w-full bg-transparent outline-none font-bold text-xs text-center"
                                              style={{ color: 'var(--text-main)' }}
                                            />
                                          </div>
                                          <div className="flex rounded-lg border p-0.5" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            {['px', '%'].map((u) => {
                                              const isActive = partnerUnit === u;
                                              return (
                                                <button
                                                  key={u}
                                                  type="button"
                                                  onClick={() => updateLogoSetting('partner', 'unit', u)}
                                                  className="px-2 py-0.5 text-[9px] font-extrabold rounded transition-all cursor-pointer"
                                                  style={{
                                                    backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                  }}
                                                >
                                                  {u}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Márgenes independientes Partner */}
                                      <div className="pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--border-color)' }}>
                                        <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                          Márgenes
                                        </label>

                                        {/* Fila 1: Arriba / Abajo */}
                                        <div className="grid grid-cols-2 gap-2">
                                          {[
                                            { field: 'margin_top', unitField: 'margin_top_unit', label: 'Arriba' },
                                            { field: 'margin_bottom', unitField: 'margin_bottom_unit', label: 'Abajo' },
                                          ].map((m) => {
                                            const val = getSettingVal('partner', m.field, 0);
                                            const currentUnit = getSettingVal('partner', m.unitField, getSettingVal('partner', 'margin_unit', 'px'));
                                            return (
                                              <div key={m.field} className="flex flex-col gap-0.5">
                                                <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                                                <div className="flex items-center gap-1">
                                                  <div className="flex-1 flex items-center h-7 rounded-lg border px-1.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    <input
                                                      type="number"
                                                      value={val}
                                                      onChange={(e) => updateLogoSetting('partner', m.field, parseInt(e.target.value) || 0)}
                                                      className="w-full bg-transparent outline-none font-bold text-[10px] text-center"
                                                      style={{ color: 'var(--text-main)' }}
                                                    />
                                                  </div>
                                                  <div className="flex rounded-lg border p-0.5 shrink-0" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    {['px', '%'].map((u) => {
                                                      const isActive = currentUnit === u;
                                                      return (
                                                        <button
                                                          key={u}
                                                          type="button"
                                                          onClick={() => updateLogoSetting('partner', m.unitField, u)}
                                                          className="px-1.5 py-0.5 text-[8px] font-extrabold rounded transition-all cursor-pointer"
                                                          style={{
                                                            backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                            color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                          }}
                                                        >
                                                          {u}
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>

                                        {/* Fila 2: Izquierda / Derecha */}
                                        <div className="grid grid-cols-2 gap-2">
                                          {[
                                            { field: 'margin_left', unitField: 'margin_left_unit', label: 'Izquierda' },
                                            { field: 'margin_right', unitField: 'margin_right_unit', label: 'Derecha' },
                                          ].map((m) => {
                                            const val = getSettingVal('partner', m.field, 0);
                                            const currentUnit = getSettingVal('partner', m.unitField, getSettingVal('partner', 'margin_unit', 'px'));
                                            return (
                                              <div key={m.field} className="flex flex-col gap-0.5">
                                                <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                                                <div className="flex items-center gap-1">
                                                  <div className="flex-1 flex items-center h-7 rounded-lg border px-1.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    <input
                                                      type="number"
                                                      value={val}
                                                      onChange={(e) => updateLogoSetting('partner', m.field, parseInt(e.target.value) || 0)}
                                                      className="w-full bg-transparent outline-none font-bold text-[10px] text-center"
                                                      style={{ color: 'var(--text-main)' }}
                                                    />
                                                  </div>
                                                  <div className="flex rounded-lg border p-0.5 shrink-0" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    {['px', '%'].map((u) => {
                                                      const isActive = currentUnit === u;
                                                      return (
                                                        <button
                                                          key={u}
                                                          type="button"
                                                          onClick={() => updateLogoSetting('partner', m.unitField, u)}
                                                          className="px-1.5 py-0.5 text-[8px] font-extrabold rounded transition-all cursor-pointer"
                                                          style={{
                                                            backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                            color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                          }}
                                                        >
                                                          {u}
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* SUB-PESTAÑA INFORMACIÓN */}
                        {bienvenidaSubTab === 'info' && (
                          <div className="rounded-2xl p-5 border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                            <div className="pb-3 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{ borderColor: 'var(--border-color)' }}>
                              <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                                <Info size={16} style={{ color: 'var(--primary-accent)' }} /> Información y Textos de Bienvenida
                              </h3>

                              {/* SELECTOR DE PANTALLA (GPS, REGISTRO, BIENVENIDA) ARRIBA A LA DERECHA */}
                              <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                {[
                                  { id: 'gps', label: 'GPS' },
                                  { id: 'registro', label: 'Registro' },
                                  { id: 'bienvenida', label: 'Bienvenida' },
                                ].map((screenItem) => {
                                  const isScreenActive = infoScreenTarget === screenItem.id;
                                  return (
                                    <button
                                      key={screenItem.id}
                                      type="button"
                                      onClick={() => setInfoScreenTarget(screenItem.id as any)}
                                      className="botab-item"
                                      style={{
                                        backgroundColor: isScreenActive ? 'var(--primary-accent)' : 'transparent',
                                        color: isScreenActive ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                    >
                                      {screenItem.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* CONTENIDO 1: BIENVENIDA */}
                            {infoScreenTarget === 'bienvenida' && (
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Texto del Título de Bienvenida</label>
                                  <input
                                    type="text"
                                    value={settings.welcome_title ?? '¡Bienvenido al evento!'}
                                    onChange={(e) => updateSetting('welcome_title', e.target.value)}
                                    className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Nombre del Evento</label>
                                  <input
                                    type="text"
                                    readOnly
                                    disabled
                                    value={eventData?.event_name || eventData?.name || eventData?.title || settings.welcome_event || settings.event_name || 'Evento'}
                                    className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium opacity-70 cursor-not-allowed select-none"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Texto del Subtítulo / Contenido</label>
                                  <input
                                    type="text"
                                    value={settings.welcome_subtitle ?? 'Prepárate para capturar los mejores momentos'}
                                    onChange={(e) => updateSetting('welcome_subtitle', e.target.value)}
                                    className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Texto del Botón Principal</label>
                                  <input
                                    type="text"
                                    value={settings.welcome_button_text ?? 'Ingresar'}
                                    onChange={(e) => updateSetting('welcome_button_text', e.target.value)}
                                    className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* CONTENIDO 2: GPS */}
                            {infoScreenTarget === 'gps' && (
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Texto del Título GPS</label>
                                  <input
                                    type="text"
                                    value={settings.gps_title ?? 'Verificación GPS'}
                                    onChange={(e) => updateSetting('gps_title', e.target.value)}
                                    className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Nombre del Evento</label>
                                  <input
                                    type="text"
                                    readOnly
                                    disabled
                                    value={eventData?.event_name || eventData?.name || eventData?.title || settings.welcome_event || settings.event_name || 'Evento'}
                                    className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium opacity-70 cursor-not-allowed select-none"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Texto del Contenido GPS</label>
                                  <input
                                    type="text"
                                    value={settings.gps_subtitle ?? 'Debes estar en el lugar del evento para ingresar'}
                                    onChange={(e) => updateSetting('gps_subtitle', e.target.value)}
                                    className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Mensaje de Error (Fuera de Rango)</label>
                                  <input
                                    type="text"
                                    value={settings.welcome_gps_error_msg ?? 'Debes estar en el lugar del evento para continuar'}
                                    onChange={(e) => updateSetting('welcome_gps_error_msg', e.target.value)}
                                    className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                  />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                  <div>
                                    <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Activar Verificación de Ubicación GPS</p>
                                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Requiere que los invitados estén en la ubicación física del evento para continuar</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={settings.welcome_gps_enabled ?? false}
                                    onChange={(e) => updateSetting('welcome_gps_enabled', e.target.checked)}
                                    className="w-4 h-4 rounded cursor-pointer"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Radio Máximo de Distancia (Metros)</label>
                                  <input
                                    type="number"
                                    value={settings.welcome_gps_radius ?? '500'}
                                    onChange={(e) => updateSetting('welcome_gps_radius', e.target.value)}
                                    className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* CONTENIDO 3: REGISTRO */}
                            {infoScreenTarget === 'registro' && (
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Texto del Título de Registro</label>
                                  <input
                                    type="text"
                                    value={settings.registro_title ?? 'Registro de Asistente'}
                                    onChange={(e) => updateSetting('registro_title', e.target.value)}
                                    className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Texto del Subtítulo / Instrucciones</label>
                                  <input
                                    type="text"
                                    value={settings.registro_subtitle ?? 'Ingresa tus datos para continuar'}
                                    onChange={(e) => updateSetting('registro_subtitle', e.target.value)}
                                    className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                  />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                  <div>
                                    <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Solicitar Nombre Completo</p>
                                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Campo obligatorio en el formulario de registro</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={settings.registro_require_name ?? true}
                                    onChange={(e) => updateSetting('registro_require_name', e.target.checked)}
                                    className="w-4 h-4 rounded cursor-pointer"
                                  />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                  <div>
                                    <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Solicitar Correo Electrónico</p>
                                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Campo para enviar confirmación / fotos</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={settings.registro_require_email ?? false}
                                    onChange={(e) => updateSetting('registro_require_email', e.target.checked)}
                                    className="w-4 h-4 rounded cursor-pointer"
                                  />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                  <div>
                                    <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Solicitar Teléfono / WhatsApp</p>
                                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Permite enviar notificaciones por WhatsApp</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={settings.registro_require_phone ?? false}
                                    onChange={(e) => updateSetting('registro_require_phone', e.target.checked)}
                                    className="w-4 h-4 rounded cursor-pointer"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {/* 2.4 SUB-PESTAÑA REGISTRO */}
                    {welcomeSubTab === 'registro' && (
                      <div className="space-y-4">
                        {/* SUB-PESTAÑAS UNIFORMES (FUENTE, CONTENEDOR, LOGOS, INFORMACIÓN) */}
                        <div className="flex p-1 rounded-xl border gap-1" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                          {[
                            { id: 'fuentes', label: 'Fuente', icon: Type },
                            { id: 'fondos', label: 'Contenedor', icon: Palette },
                            { id: 'logos', label: 'Logos', icon: ImageIcon },
                            { id: 'info', label: 'Información', icon: Info },
                          ].map((sub) => {
                            const SubIcon = sub.icon;
                            const isSubActive = registroSubTab === sub.id;
                            return (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => setRegistroSubTab(sub.id as any)}
                                className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                style={{
                                  backgroundColor: isSubActive ? 'var(--primary-accent-light)' : 'transparent',
                                  color: isSubActive ? 'var(--primary-accent)' : 'var(--text-muted)',
                                  border: isSubActive ? '1px solid var(--primary-accent)' : '1px solid transparent',
                                }}
                              >
                                <SubIcon size={14} />
                                <span>{sub.label}</span>
                              </button>
                            );
                          })}
                        </div>
                        {/* 2.2.1 SUB-PESTAÑA FUENTES EN BIENVENIDA (ESTRUCTURA Y CAMPOS DE PRECARGA/QR) */}
                        {registroSubTab === 'fuentes' && (() => {
                          const activeTarget = precargaTextTarget === 'button' || precargaTextTarget === 'powered_by' ? 'title' : precargaTextTarget;

                          const getTargetSubtitle = () => {
                            if (activeTarget === 'title') return 'Título Principal';
                            if (activeTarget === 'event') return 'Nombre del Evento';
                            return 'Contenido';
                          };

                          return (
                          <div className="space-y-4">
                            {/* 1. TARJETA SUPERIOR: FUENTES Y TEXTOS DE BIENVENIDA */}
                            <div className="rounded-2xl p-4 border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                              <div className="pb-2 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-2.5">
                                  <Type size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                  <div className="flex flex-col leading-tight">
                                    <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                      Fuentes y Textos de Registro
                                    </h3>
                                    <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                      {getTargetSubtitle()}
                                    </span>
                                  </div>
                                </div>

                                {/* PESTAÑAS TÍTULO / EVENTO / CONTENIDO EN EL LADO DERECHO */}
                                <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                  {[
                                    { id: 'title', label: 'Título' },
                                    { id: 'event', label: 'Evento' },
                                    { id: 'subtitle', label: 'Contenido' },
                                  ].map((targetItem) => {
                                    const isTargetActive = activeTarget === targetItem.id;
                                    return (
                                      <button
                                        key={targetItem.id}
                                        type="button"
                                        onClick={() => setPrecargaTextTarget(targetItem.id as any)}
                                        className="botab-item flex items-center gap-1"
                                        style={{
                                          backgroundColor: isTargetActive ? 'var(--primary-accent)' : 'transparent',
                                          color: isTargetActive ? '#ffffff' : 'var(--text-muted)',
                                        }}
                                      >
                                        <span>{targetItem.label}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* CONTROLES DE TEXTO, TIPOGRAFÍA Y ESTILOS */}
                              <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
                                {/* CAMPO TEXTO / CONTENIDO */}
                                <div className="w-full md:w-52 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                    {activeTarget === 'title' ? 'Texto del Título' : activeTarget === 'event' ? 'Texto del Evento' : 'Texto del Contenido'}
                                  </label>
                                  <input
                                    type="text"
                                    readOnly={activeTarget === 'event'}
                                    disabled={activeTarget === 'event'}
                                    value={
                                      activeTarget === 'title'
                                        ? (settings.registro_title ?? '¡Bienvenido al evento!')
                                        : activeTarget === 'event'
                                        ? (eventData?.event_name || eventData?.name || eventData?.title || settings.registro_event || settings.event_name || 'Evento')
                                        : (settings.registro_subtitle ?? 'Prepárate para capturar los mejores momentos')
                                    }
                                    onChange={(e) => {
                                      if (activeTarget === 'title') {
                                        updateSetting('registro_title', e.target.value);
                                      } else if (activeTarget === 'subtitle') {
                                        updateSetting('registro_subtitle', e.target.value);
                                      }
                                    }}
                                    placeholder={activeTarget === 'title' ? 'Ej: Título del Evento' : activeTarget === 'event' ? 'Nombre del Evento' : 'Ej: Mensaje de Registro'}
                                    className={`w-full h-9 rounded-xl px-3 border outline-none text-xs font-medium ${activeTarget === 'event' ? 'opacity-70 cursor-not-allowed select-none' : ''}`}
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                  />
                                </div>

                                {/* FUENTE */}
                                <div className="flex-1 min-w-[180px]">
                                  <FontPicker
                                    label="Fuente"
                                    value={
                                      settings[`welcome_${activeTarget}_font_family`] ||
                                      (activeTarget === 'title' || activeTarget === 'event' ? (settings.global_title_font_family || 'Inter') : (settings.global_text_font_family || 'Inter'))
                                    }
                                    onChange={(f) => updateSetting(`welcome_${activeTarget}_font_family`, f)}
                                  />
                                </div>

                                {/* TAMAÑO */}
                                <div className="w-full md:w-36 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                    Tamaño
                                  </label>
                                  <div
                                    className="flex items-center h-9 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full shadow-2xs"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const defaultSize = activeTarget === 'title' ? 18 : 12;
                                        const curr = parseFloat(settings[`welcome_${activeTarget}_font_size`] || defaultSize.toString());
                                        updateSetting(`welcome_${activeTarget}_font_size`, Math.max(5, curr - 0.5).toString());
                                      }}
                                      className="w-8 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                                    >
                                      <Minus size={12} />
                                    </button>

                                    <div className="flex-1 flex items-center justify-center px-1">
                                      <input
                                        type="number"
                                        min={5}
                                        max={80}
                                        step={0.5}
                                        value={
                                          settings[`welcome_${activeTarget}_font_size`] ||
                                          (activeTarget === 'title' ? '18' : '12')
                                        }
                                        onChange={(e) => updateSetting(`welcome_${activeTarget}_font_size`, e.target.value)}
                                        className="w-full h-full text-center bg-transparent outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        style={{ color: 'var(--text-main)' }}
                                      />
                                      <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>px</span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const defaultSize = activeTarget === 'title' ? 18 : 12;
                                        const curr = parseFloat(settings[`welcome_${activeTarget}_font_size`] || defaultSize.toString());
                                        updateSetting(`welcome_${activeTarget}_font_size`, Math.min(80, curr + 0.5).toString());
                                      }}
                                      className="w-8 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                </div>

                                 {/* FORMATO */}
                                <div className="w-full md:w-28 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Formato</label>
                                  <div className="flex items-center h-9 rounded-xl border p-0.5 gap-0.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting(`welcome_${activeTarget}_font_weight`, settings[`welcome_${activeTarget}_font_weight`] === 'bold' ? 'normal' : 'bold')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                      style={{
                                        backgroundColor: settings[`welcome_${activeTarget}_font_weight`] === 'bold' ? 'var(--primary-accent)' : 'transparent',
                                        color: settings[`welcome_${activeTarget}_font_weight`] === 'bold' ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                      title="Negrita"
                                    >
                                      <Bold size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting(`welcome_${activeTarget}_font_style`, settings[`welcome_${activeTarget}_font_style`] === 'italic' ? 'normal' : 'italic')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                      style={{
                                        backgroundColor: settings[`welcome_${activeTarget}_font_style`] === 'italic' ? 'var(--primary-accent)' : 'transparent',
                                        color: settings[`welcome_${activeTarget}_font_style`] === 'italic' ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                      title="Itálica"
                                    >
                                      <Italic size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting(`welcome_${activeTarget}_text_decoration`, settings[`welcome_${activeTarget}_text_decoration`] === 'underline' ? 'none' : 'underline')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                      style={{
                                        backgroundColor: settings[`welcome_${activeTarget}_text_decoration`] === 'underline' ? 'var(--primary-accent)' : 'transparent',
                                        color: settings[`welcome_${activeTarget}_text_decoration`] === 'underline' ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                      title="Subrayado"
                                    >
                                      <Underline size={13} />
                                    </button>
                                  </div>
                                </div>

                                {/* ALINEACIÓN */}
                                <div className="w-full md:w-32 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Alineación</label>
                                  <div className="flex items-center h-9 rounded-xl border p-0.5 gap-0.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                    {[
                                      { id: 'left', icon: AlignLeft, title: 'Izquierda' },
                                      { id: 'center', icon: AlignCenter, title: 'Centro' },
                                      { id: 'right', icon: AlignRight, title: 'Derecha' },
                                      { id: 'justify', icon: AlignJustify, title: 'Justificado' },
                                    ].map((align) => {
                                      const AlignIcon = align.icon;
                                      const isAlignActive = (settings[`welcome_${activeTarget}_text_align`] || 'center') === align.id;
                                      return (
                                        <button
                                          key={align.id}
                                          type="button"
                                          onClick={() => updateSetting(`welcome_${activeTarget}_text_align`, align.id)}
                                          className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                          style={{
                                            backgroundColor: isAlignActive ? 'var(--primary-accent)' : 'transparent',
                                            color: isAlignActive ? '#ffffff' : 'var(--text-muted)',
                                          }}
                                          title={align.title}
                                        >
                                          <AlignIcon size={13} />
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* ESTILO DEL TEXTO (StylePickerPopover) */}
                                <div className="w-full md:w-32 shrink-0">
                                  <StylePickerPopover
                                    label="Estilo"
                                    elementType="text"
                                    eventColors={eventColors.length > 0 ? eventColors : ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B']}
                                    eventColorImage={eventColorImage}
                                    styleConfig={{
                                      fillType: 'color',
                                      fillColor: settings[`welcome_${activeTarget}_font_color`] || '#ffffff',
                                      strokeActive: settings[`welcome_${activeTarget}_stroke_active`] || false,
                                      strokeColor: settings[`welcome_${activeTarget}_stroke_color`] || '#000000',
                                      strokeWidth: parseInt(settings[`welcome_${activeTarget}_stroke_width`] || '2'),
                                      strokeType: settings[`welcome_${activeTarget}_stroke_type`] || 'OUT',
                                      shadowActive: settings[`welcome_${activeTarget}_shadow_active`] || false,
                                      shadowColor: settings[`welcome_${activeTarget}_shadow_color`] || '#000000',
                                      shadowBlur: parseInt(settings[`welcome_${activeTarget}_shadow_blur`] || '8'),
                                    }}
                                    onChange={(updated) => {
                                      if (updated.fillColor) updateSetting(`welcome_${activeTarget}_font_color`, updated.fillColor);
                                      if (updated.strokeActive !== undefined) updateSetting(`welcome_${activeTarget}_stroke_active`, updated.strokeActive);
                                      if (updated.strokeColor) updateSetting(`welcome_${activeTarget}_stroke_color`, updated.strokeColor);
                                      if (updated.strokeWidth !== undefined) updateSetting(`welcome_${activeTarget}_stroke_width`, updated.strokeWidth.toString());
                                      if (updated.strokeType) updateSetting(`welcome_${activeTarget}_stroke_type`, updated.strokeType);
                                      if (updated.shadowActive !== undefined) updateSetting(`welcome_${activeTarget}_shadow_active`, updated.shadowActive);
                                      if (updated.shadowColor) updateSetting(`welcome_${activeTarget}_shadow_color`, updated.shadowColor);
                                      if (updated.shadowBlur !== undefined) updateSetting(`welcome_${activeTarget}_shadow_blur`, updated.shadowBlur.toString());
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* 2. TARJETA INFERIOR: FUENTE Y ESTILOS DE BOTÓN (NORMAL / SOBRE) */}
                            <div className="rounded-2xl p-4 border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                              <div className="pb-2 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-2.5">
                                  <MousePointer2 size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                  <div className="flex flex-col leading-tight">
                                    <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                      Fuente y Estilo de Botón ({buttonState === 'hover' ? 'Sobre' : 'Normal'})
                                    </h3>
                                    <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                      Tipografía, alineación, formato y estilo de texto del botón
                                    </span>
                                  </div>
                                </div>

                                <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                  {[
                                    { id: 'normal', label: 'Normal' },
                                    { id: 'hover', label: 'Sobre' },
                                  ].map((modeItem) => {
                                    const isModeActive = buttonState === modeItem.id;
                                    return (
                                      <button
                                        key={modeItem.id}
                                        type="button"
                                        onClick={() => setButtonState(modeItem.id as any)}
                                        className="botab-item"
                                        style={{
                                          backgroundColor: isModeActive ? 'var(--primary-accent)' : 'transparent',
                                          color: isModeActive ? '#ffffff' : 'var(--text-muted)',
                                        }}
                                      >
                                        {modeItem.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
                                {/* TEXTO DEL BOTÓN */}
                                <div className="w-full md:w-52 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                    Texto del Botón
                                  </label>
                                  <input
                                    type="text"
                                    value={settings.welcome_button_text ?? 'Continuar'}
                                    onChange={(e) => updateSetting('welcome_button_text', e.target.value)}
                                    placeholder="Ej: Continuar"
                                    className="w-full h-9 rounded-xl px-3 border outline-none text-xs font-medium"
                                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                  />
                                </div>

                                {/* FUENTE */}
                                <div className="flex-1 min-w-[180px]">
                                  <FontPicker
                                    label="Fuente"
                                    value={settings.welcome_button_font_family || settings.global_button_font_family || 'Inter'}
                                    onChange={(f) => updateSetting('welcome_button_font_family', f)}
                                  />
                                </div>

                                {/* TAMAÑO */}
                                <div className="w-full md:w-36 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Tamaño</label>
                                  <div className="flex items-center h-9 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const curr = parseFloat(settings.welcome_button_font_size || '14');
                                        updateSetting('welcome_button_font_size', Math.max(5, curr - 0.5).toString());
                                      }}
                                      className="w-8 h-full flex items-center justify-center border-r hover:bg-black/5 cursor-pointer shrink-0"
                                      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                                    >
                                      <Minus size={12} />
                                    </button>
                                    <div className="flex-1 flex items-center justify-center px-1">
                                      <input
                                        type="number"
                                        min={5}
                                        max={80}
                                        step={0.5}
                                        value={settings.welcome_button_font_size || '14'}
                                        onChange={(e) => updateSetting('welcome_button_font_size', e.target.value)}
                                        className="w-full h-full text-center bg-transparent outline-none font-bold text-xs"
                                        style={{ color: 'var(--text-main)' }}
                                      />
                                      <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>px</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const curr = parseFloat(settings.welcome_button_font_size || '14');
                                        updateSetting('welcome_button_font_size', Math.min(80, curr + 0.5).toString());
                                      }}
                                      className="w-8 h-full flex items-center justify-center border-l hover:bg-black/5 cursor-pointer shrink-0"
                                      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                </div>

                                {/* FORMATO */}
                                <div className="w-full md:w-28 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Formato</label>
                                  <div className="flex items-center h-9 rounded-xl border p-0.5 gap-0.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting('welcome_button_font_weight', settings.welcome_button_font_weight === 'bold' ? 'normal' : 'bold')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center cursor-pointer"
                                      style={{ backgroundColor: settings.welcome_button_font_weight === 'bold' ? 'var(--primary-accent)' : 'transparent', color: settings.welcome_button_font_weight === 'bold' ? '#ffffff' : 'var(--text-muted)' }}
                                    >
                                      <Bold size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting('welcome_button_font_style', settings.welcome_button_font_style === 'italic' ? 'normal' : 'italic')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center cursor-pointer"
                                      style={{ backgroundColor: settings.welcome_button_font_style === 'italic' ? 'var(--primary-accent)' : 'transparent', color: settings.welcome_button_font_style === 'italic' ? '#ffffff' : 'var(--text-muted)' }}
                                    >
                                      <Italic size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting('welcome_button_text_decoration', settings.welcome_button_text_decoration === 'underline' ? 'none' : 'underline')}
                                      className="flex-1 h-full rounded-lg flex items-center justify-center cursor-pointer"
                                      style={{ backgroundColor: settings.welcome_button_text_decoration === 'underline' ? 'var(--primary-accent)' : 'transparent', color: settings.welcome_button_text_decoration === 'underline' ? '#ffffff' : 'var(--text-muted)' }}
                                    >
                                      <Underline size={13} />
                                    </button>
                                  </div>
                                </div>

                                {/* ALINEACIÓN */}
                                <div className="w-full md:w-32 shrink-0">
                                  <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Alineación</label>
                                  <div className="flex items-center h-9 rounded-xl border p-0.5 gap-0.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                    {[
                                      { id: 'left', icon: AlignLeft, title: 'Izquierda' },
                                      { id: 'center', icon: AlignCenter, title: 'Centro' },
                                      { id: 'right', icon: AlignRight, title: 'Derecha' },
                                      { id: 'justify', icon: AlignJustify, title: 'Justificado' },
                                    ].map((align) => {
                                      const AlignIcon = align.icon;
                                      const isAlignActive = (settings.welcome_button_text_align || settings.global_button_text_align || 'center') === align.id;
                                      return (
                                        <button
                                          key={align.id}
                                          type="button"
                                          onClick={() => updateSetting('welcome_button_text_align', align.id)}
                                          className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                          style={{
                                            backgroundColor: isAlignActive ? 'var(--primary-accent)' : 'transparent',
                                            color: isAlignActive ? '#ffffff' : 'var(--text-muted)',
                                          }}
                                          title={align.title}
                                        >
                                          <AlignIcon size={13} />
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* ESTILO DEL TEXTO (Normal / Sobre) */}
                                <div className="w-full md:w-32 shrink-0">
                                  {(() => {
                                    const isH = buttonState === 'hover';
                                    const colorKey = isH ? 'welcome_button_hover_font_color' : 'welcome_button_font_color';
                                    const strokeActiveKey = isH ? 'welcome_button_hover_stroke_active' : 'welcome_button_stroke_active';
                                    const strokeColorKey = isH ? 'welcome_button_hover_stroke_color' : 'welcome_button_stroke_color';
                                    const strokeWidthKey = isH ? 'welcome_button_hover_stroke_width' : 'welcome_button_stroke_width';
                                    const strokeTypeKey = isH ? 'welcome_button_hover_stroke_type' : 'welcome_button_stroke_type';
                                    const shadowActiveKey = isH ? 'welcome_button_hover_shadow_active' : 'welcome_button_shadow_active';
                                    const shadowColorKey = isH ? 'welcome_button_hover_shadow_color' : 'welcome_button_shadow_color';
                                    const shadowBlurKey = isH ? 'welcome_button_hover_shadow_blur' : 'welcome_button_shadow_blur';

                                    return (
                                      <StylePickerPopover
                                        label={`Estilo (${isH ? 'Sobre' : 'Normal'})`}
                                        elementType="text"
                                        eventColors={eventColors.length > 0 ? eventColors : ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B']}
                                        eventColorImage={eventColorImage}
                                        styleConfig={{
                                          fillType: 'color',
                                          fillColor: settings[colorKey] || '#ffffff',
                                          strokeActive: settings[strokeActiveKey] || false,
                                          strokeColor: settings[strokeColorKey] || '#000000',
                                          strokeWidth: parseInt(settings[strokeWidthKey] || '2'),
                                          strokeType: settings[strokeTypeKey] || 'OUT',
                                          shadowActive: settings[shadowActiveKey] || false,
                                          shadowColor: settings[shadowColorKey] || '#000000',
                                          shadowBlur: parseInt(settings[shadowBlurKey] || '8'),
                                        }}
                                        onChange={(updated) => {
                                          if (updated.fillColor) updateSetting(colorKey, updated.fillColor);
                                          if (updated.strokeActive !== undefined) updateSetting(strokeActiveKey, updated.strokeActive);
                                          if (updated.strokeColor) updateSetting(strokeColorKey, updated.strokeColor);
                                          if (updated.strokeWidth !== undefined) updateSetting(strokeWidthKey, updated.strokeWidth.toString());
                                          if (updated.strokeType) updateSetting(strokeTypeKey, updated.strokeType);
                                          if (updated.shadowActive !== undefined) updateSetting(shadowActiveKey, updated.shadowActive);
                                          if (updated.shadowColor) updateSetting(shadowColorKey, updated.shadowColor);
                                          if (updated.shadowBlur !== undefined) updateSetting(shadowBlurKey, updated.shadowBlur.toString());
                                        }}
                                      />
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                          );
                        })()}

                        {/* 2.2.2 SUB-PESTAÑA CONTENEDOR EN BIENVENIDA (ESTRUCTURA EXACTA A PRECARGA/QR) */}
                        {registroSubTab === 'fondos' && (() => {
                          const activeLeftTarget = precargaContainerTarget === 'boton' ? 'fondo' : precargaContainerTarget;
                          const isFondoTarget = activeLeftTarget === 'fondo';
                          const prefix = isFondoTarget ? 'welcome_screen' : 'welcome_card';
                          const bgTypeKey = `${prefix}_bg_type`;
                          const bgColorKey = `${prefix}_bg_color`;
                          const gradKey = `${prefix}_gradient_data`;
                          const imageKey = `${prefix}_image_url`;
                          const videoRotateKey = `${prefix}_video_rotate`;

                          const imageUrl = settings[imageKey] || '';
                          const bgType = settings[bgTypeKey] || 'color';
                          const videoRotate = !!settings[videoRotateKey];

                          const buttonPrefix = buttonState === 'hover' ? 'button_hover' : 'button';
                          const buttonImageKey = `${buttonPrefix}_image_url`;
                          const buttonBgTypeKey = `${buttonPrefix}_bg_type`;
                          const buttonVideoRotateKey = `${buttonPrefix}_video_rotate`;
                          const buttonImageUrl = settings[buttonImageKey] || '';
                          const buttonBgType = settings[buttonBgTypeKey] || 'color';
                          const buttonVideoRotate = !!settings[buttonVideoRotateKey];

                          return (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* COLUMNA IZQUIERDA: CONTENEDORES (FONDO / MENSAJE) */}
                              <div className="rounded-2xl p-3 border space-y-3 shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                <div>
                                  <div className="pb-2 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center gap-2">
                                      <Palette size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                      <div className="flex flex-col leading-tight">
                                        <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                          Contenedores ({activeLeftTarget === 'fondo' ? 'Fondo' : 'Mensaje'})
                                        </h3>
                                        <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                          Estilos y fondos de pantalla de Registro
                                        </span>
                                      </div>
                                    </div>

                                    {/* PESTAÑAS FONDO / MENSAJE */}
                                    <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                      {[
                                        { id: 'fondo', label: 'Fondo' },
                                        { id: 'mensaje', label: 'Mensaje' },
                                      ].map((cTarget) => {
                                        const isCTargetActive = activeLeftTarget === cTarget.id;
                                        return (
                                          <button
                                            key={cTarget.id}
                                            type="button"
                                            onClick={() => setPrecargaContainerTarget(cTarget.id as any)}
                                            className="botab-item"
                                            style={{
                                              backgroundColor: isCTargetActive ? 'var(--primary-accent)' : 'transparent',
                                              color: isCTargetActive ? '#ffffff' : 'var(--text-muted)',
                                            }}
                                          >
                                            {cTarget.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="space-y-3 pt-2">
                                    {/* SUBIR IMAGEN / VIDEO DEL CONTENEDOR */}
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                          Imagen / Video ({isFondoTarget ? 'Fondo General' : 'Recuadro Central'})
                                        </label>
                                        <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer select-none" style={{ color: 'var(--text-muted)' }}>
                                          <input
                                            type="checkbox"
                                            checked={videoRotate}
                                            onChange={(e) => updateSetting(videoRotateKey, e.target.checked)}
                                            className="rounded border-gray-400 focus:ring-0 h-3 w-3 cursor-pointer"
                                            style={{ accentColor: 'var(--primary-accent)' }}
                                          />
                                          <span>Rotar Video</span>
                                        </label>
                                      </div>
                                      
                                      <div className="border-2 border-dashed rounded-2xl p-2 text-center flex flex-col items-center justify-center transition-all relative overflow-hidden group h-[120px] min-h-[120px]" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                        {imageUrl ? (
                                          <div className="relative w-full h-full rounded-xl overflow-hidden group bg-black/40 flex items-center justify-center">
                                            <img src={imageUrl} alt="Imagen de fondo" className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                              <button type="button" onClick={() => updateSetting(imageKey, '')} className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-600 transition-colors">
                                                <Trash2 size={16} />
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                                            <div className="p-2.5 rounded-full mb-1.5" style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}>
                                              <Upload size={18} />
                                            </div>
                                            <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Subir Imagen / Video</span>
                                            <input
                                              type="file"
                                              accept="image/*,video/*"
                                              className="hidden"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  const isVideo = file.type.startsWith('video/');
                                                  const reader = new FileReader();
                                                  reader.onload = (ev) => {
                                                    updateSetting(imageKey, ev.target?.result);
                                                    updateSetting(bgTypeKey, isVideo ? 'video' : 'image');
                                                  };
                                                  reader.readAsDataURL(file);
                                                }
                                              }}
                                            />
                                          </label>
                                        )}
                                      </div>
                                    </div>

                                    {/* CONTROLES IZQUIERDA: ESTILO, REDONDEZ, GLASS */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end pt-1">
                                      <div>
                                        <StylePickerPopover
                                          label="Estilo"
                                          elementType="box"
                                          eventColors={eventColors.length > 0 ? eventColors : ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B']}
                                          eventColorImage={eventColorImage}
                                          styleConfig={{
                                            backgroundColor: settings[bgColorKey] || (isFondoTarget ? '#0f172a' : '#000000'),
                                            borderWidth: settings[`${prefix}_border_width`] ?? 0,
                                            borderStyle: settings[`${prefix}_border_style`] || 'solid',
                                            borderColor: settings[`${prefix}_border_color`] || '#E07A5F',
                                            borderRadius: settings[`${prefix}_border_radius`] ?? (isFondoTarget ? 0 : 16),
                                          }}
                                          onChange={(updated) => {
                                            const selectedColor = updated.backgroundColor || updated.fillColor;
                                            if (selectedColor) updateSetting(bgColorKey, selectedColor);
                                            if (updated.borderWidth !== undefined) updateSetting(`${prefix}_border_width`, updated.borderWidth);
                                            if (updated.borderColor !== undefined) updateSetting(`${prefix}_border_color`, updated.borderColor);
                                            if (updated.borderRadius !== undefined) updateSetting(`${prefix}_border_radius`, updated.borderRadius);
                                          }}
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Redondez</label>
                                        <div className="flex items-center h-9 rounded-xl border overflow-hidden w-full" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const curr = parseInt(settings[`${prefix}_border_radius`] ?? (isFondoTarget ? '0' : '16'));
                                              updateSetting(`${prefix}_border_radius`, Math.max(0, curr - 2));
                                            }}
                                            className="w-8 h-full flex items-center justify-center border-r shrink-0 cursor-pointer"
                                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                                          >
                                            <Minus size={12} />
                                          </button>
                                          <div className="flex-1 flex items-center justify-center px-1">
                                            <input
                                              type="number"
                                              min={0}
                                              max={50}
                                              value={settings[`${prefix}_border_radius`] ?? (isFondoTarget ? 0 : 16)}
                                              onChange={(e) => updateSetting(`${prefix}_border_radius`, parseInt(e.target.value) || 0)}
                                              className="w-full h-full text-center bg-transparent outline-none font-bold text-xs"
                                              style={{ color: 'var(--text-main)' }}
                                            />
                                            <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>px</span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const curr = parseInt(settings[`${prefix}_border_radius`] ?? (isFondoTarget ? '0' : '16'));
                                              updateSetting(`${prefix}_border_radius`, Math.min(50, curr + 2));
                                            }}
                                            className="w-8 h-full flex items-center justify-center border-l shrink-0 cursor-pointer"
                                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                                          >
                                            <Plus size={12} />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Glass / Cristal */}
                                      <div>
                                        <div className="flex items-center justify-between mb-1">
                                          <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                            Glass (Blur)
                                          </label>
                                          <label className="relative flex items-center cursor-pointer shrink-0 select-none">
                                            <input
                                              type="checkbox"
                                              checked={
                                                isFondoTarget
                                                  ? (settings.welcome_screen_glass_enabled ?? false)
                                                  : (settings.welcome_card_glass_enabled ?? true)
                                              }
                                              onChange={(e) => {
                                                const key = isFondoTarget ? 'welcome_screen_glass_enabled' : 'welcome_card_glass_enabled';
                                                updateSetting(key, e.target.checked);
                                              }}
                                              className="sr-only peer"
                                            />
                                            <div
                                              className="w-4 h-4 rounded border flex items-center justify-center transition-all peer-checked:border-[var(--primary-accent)] peer-checked:bg-[var(--primary-accent)]"
                                              style={{
                                                borderColor: (isFondoTarget ? (settings.welcome_screen_glass_enabled ?? false) : (settings.welcome_card_glass_enabled ?? true)) ? 'var(--primary-accent)' : 'var(--border-color)',
                                                backgroundColor: (isFondoTarget ? (settings.welcome_screen_glass_enabled ?? false) : (settings.welcome_card_glass_enabled ?? true)) ? 'var(--primary-accent)' : 'var(--bg-card)',
                                              }}
                                            >
                                              {(isFondoTarget ? (settings.welcome_screen_glass_enabled ?? false) : (settings.welcome_card_glass_enabled ?? true)) && (
                                                <Check size={11} className="text-white stroke-[3]" />
                                              )}
                                            </div>
                                          </label>
                                        </div>

                                        <div
                                          className={`flex items-center h-9 rounded-xl border px-3 transition-opacity ${
                                            !(isFondoTarget ? (settings.welcome_screen_glass_enabled ?? false) : (settings.welcome_card_glass_enabled ?? true)) ? 'opacity-40 pointer-events-none' : ''
                                          }`}
                                          style={{
                                            backgroundColor: 'var(--bg-app)',
                                            borderColor: 'var(--border-color)',
                                          }}
                                        >
                                          <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="1"
                                            value={settings[`${prefix}_bg_opacity`] ?? 100}
                                            onChange={(e) => updateSetting(`${prefix}_bg_opacity`, parseInt(e.target.value))}
                                            className="w-full accent-[var(--primary-accent)] cursor-pointer h-1.5 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* COLUMNA DERECHA: BOTONES (NORMAL / SOBRE) */}
                              <div className="rounded-2xl p-3 border space-y-3 shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                <div>
                                  <div className="pb-2 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center gap-2">
                                      <MousePointerClick size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                      <div className="flex flex-col leading-tight">
                                        <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                          Botones ({buttonState === 'hover' ? 'Sobre' : 'Normal'})
                                        </h3>
                                        <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                          Estilos y efectos de botón
                                        </span>
                                      </div>
                                    </div>

                                    {/* PESTAÑAS NORMAL / SOBRE */}
                                    <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                      {[
                                        { id: 'normal', label: 'Normal' },
                                        { id: 'hover', label: 'Sobre' },
                                      ].map((modeItem) => {
                                        const isModeActive = buttonState === modeItem.id;
                                        return (
                                          <button
                                            key={modeItem.id}
                                            type="button"
                                            onClick={() => setButtonState(modeItem.id as any)}
                                            className="botab-item"
                                            style={{
                                              backgroundColor: isModeActive ? 'var(--primary-accent)' : 'transparent',
                                              color: isModeActive ? '#ffffff' : 'var(--text-muted)',
                                            }}
                                          >
                                            {modeItem.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="space-y-3 pt-2">
                                    {/* SUBIR IMAGEN / VIDEO DEL BOTÓN */}
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                          Imagen / Video ({buttonState === 'hover' ? 'Sobre' : 'Normal'})
                                        </label>
                                        <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer select-none" style={{ color: 'var(--text-muted)' }} title="Rotar orientación de video 90° en el botón">
                                          <input
                                            type="checkbox"
                                            checked={buttonVideoRotate}
                                            onChange={(e) => updateSetting(buttonVideoRotateKey, e.target.checked)}
                                            className="rounded border-gray-400 focus:ring-0 h-3 w-3 cursor-pointer"
                                            style={{ accentColor: 'var(--primary-accent)' }}
                                          />
                                          <span>Rotar Video</span>
                                        </label>
                                      </div>
                                      
                                      <div
                                        className="border-2 border-dashed rounded-2xl p-2 text-center flex flex-col items-center justify-center transition-all relative overflow-hidden group h-[120px] min-h-[120px]"
                                        style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                                      >
                                        {buttonImageUrl ? (
                                          <div className="relative w-full h-full rounded-xl overflow-hidden group bg-black/40 flex items-center justify-center">
                                            {buttonBgType === 'video' || String(buttonImageUrl).startsWith('data:video') || String(buttonImageUrl).match(/\.(mp4|webm|ogg)$/i) ? (
                                              <video
                                                src={buttonImageUrl}
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className="w-full h-full object-contain"
                                              />
                                            ) : (
                                              <img
                                                src={buttonImageUrl}
                                                alt="Imagen del botón"
                                                className="w-full h-full object-contain"
                                              />
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                              <label className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/40 cursor-pointer transition-colors" title="Cambiar archivo">
                                                <Upload size={16} />
                                                <input
                                                  type="file"
                                                  accept="image/*,video/*"
                                                  className="hidden"
                                                  onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                      const isVideo = file.type.startsWith('video/');
                                                      const reader = new FileReader();
                                                      reader.onload = (ev) => {
                                                        updateSetting(buttonImageKey, ev.target?.result);
                                                        updateSetting(buttonBgTypeKey, isVideo ? 'video' : 'image');
                                                      };
                                                      reader.readAsDataURL(file);
                                                    }
                                                  }}
                                                />
                                              </label>
                                              <button
                                                type="button"
                                                onClick={() => updateSetting(buttonImageKey, '')}
                                                className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-600 transition-colors"
                                                title="Eliminar archivo"
                                              >
                                                <Trash2 size={16} />
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                                            <div className="p-2.5 rounded-full mb-1.5" style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}>
                                              <Upload size={18} />
                                            </div>
                                            <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Subir Imagen / Video</span>
                                            <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>PNG, JPG, MP4 o WEBM</span>
                                            <input
                                              type="file"
                                              accept="image/*,video/*"
                                              className="hidden"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  const isVideo = file.type.startsWith('video/');
                                                  const reader = new FileReader();
                                                  reader.onload = (ev) => {
                                                    updateSetting(buttonImageKey, ev.target?.result);
                                                    updateSetting(buttonBgTypeKey, isVideo ? 'video' : 'image');
                                                  };
                                                  reader.readAsDataURL(file);
                                                }
                                              }}
                                            />
                                          </label>
                                        )}
                                      </div>
                                    </div>

                                    {/* CONTROLES DERECHA: ESTILO, REDONDEZ, GLASS */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end pt-1">
                                      {/* Estilo */}
                                      <div>
                                        <StylePickerPopover
                                          label={`Estilo (${buttonState === 'hover' ? 'Sobre' : 'Normal'})`}
                                          elementType="box"
                                          eventColors={eventColors.length > 0 ? eventColors : ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B']}
                                          eventColorImage={eventColorImage}
                                          styleConfig={{
                                            backgroundColor: settings[`${buttonPrefix}_bg_type`] === 'gradient' && settings[`${buttonPrefix}_gradient_data`]
                                              ? (typeof settings[`${buttonPrefix}_gradient_data`] === 'string' ? settings[`${buttonPrefix}_gradient_data`] : settings[`${buttonPrefix}_bg_color`] || '#E07A5F')
                                              : (settings[`${buttonPrefix}_bg_color`] || '#E07A5F'),
                                            borderWidth: settings[`${buttonPrefix}_border_width`] ?? 0,
                                            borderStyle: settings[`${buttonPrefix}_border_style`] || 'solid',
                                            borderColor: settings[`${buttonPrefix}_border_color`] || '#E07A5F',
                                            borderRadius: settings[`${buttonPrefix}_border_radius`] ?? 12,
                                            shadowColor: settings[`${buttonPrefix}_shadow_color`] || '#000000',
                                            shadowBlur: settings[`${buttonPrefix}_shadow_blur`] ?? 0,
                                            shadowOffsetX: settings[`${buttonPrefix}_shadow_offset_x`] ?? 0,
                                            shadowOffsetY: settings[`${buttonPrefix}_shadow_offset_y`] ?? 0,
                                          }}
                                          onChange={(updated) => {
                                            const prefix = buttonPrefix;
                                            const bgPrefix = `${prefix}_bg`;
                                            const gradKey = `${prefix}_gradient_data`;

                                            const selectedColor = updated.backgroundColor || updated.fillColor;
                                            const selectedGradient = updated.fillGradient;

                                            if (updated.fillType === 'gradient' && selectedGradient) {
                                              updateSetting(`${bgPrefix}_type`, 'gradient');
                                              updateSetting(gradKey, selectedGradient);
                                            } else if (selectedColor) {
                                              if (typeof selectedColor === 'string' && selectedColor.includes('gradient')) {
                                                updateSetting(`${bgPrefix}_type`, 'gradient');
                                                updateSetting(gradKey, selectedColor);
                                              } else {
                                                updateSetting(`${bgPrefix}_type`, 'color');
                                                updateSetting(`${bgPrefix}_color`, selectedColor);
                                              }
                                            }

                                            if (updated.borderWidth !== undefined) updateSetting(`${prefix}_border_width`, updated.borderWidth);
                                            if (updated.borderStyle !== undefined) updateSetting(`${prefix}_border_style`, updated.borderStyle);
                                            if (updated.borderColor !== undefined) updateSetting(`${prefix}_border_color`, updated.borderColor);
                                            if (updated.borderRadius !== undefined) updateSetting(`${prefix}_border_radius`, updated.borderRadius);
                                            if (updated.shadowColor !== undefined) updateSetting(`${prefix}_shadow_color`, updated.shadowColor);
                                            if (updated.shadowBlur !== undefined) updateSetting(`${prefix}_shadow_blur`, updated.shadowBlur);
                                            if (updated.shadowOffsetX !== undefined) updateSetting(`${prefix}_shadow_offset_x`, updated.shadowOffsetX);
                                            if (updated.shadowOffsetY !== undefined) updateSetting(`${prefix}_shadow_offset_y`, updated.shadowOffsetY);
                                          }}
                                        />
                                      </div>

                                      {/* Redondez */}
                                      <div>
                                        <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                          Redondez
                                        </label>
                                        <div
                                          className="flex items-center h-9 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full shadow-2xs"
                                          style={{
                                            backgroundColor: 'var(--bg-app)',
                                            borderColor: 'var(--border-color)',
                                          }}
                                        >
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const key = `${buttonPrefix}_border_radius`;
                                              const curr = parseInt(settings[key] ?? '12');
                                              const nextVal = Math.max(0, curr - 2);
                                              updateSetting(key, nextVal);
                                            }}
                                            className="w-8 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                            style={{
                                              backgroundColor: 'var(--bg-card)',
                                              borderColor: 'var(--border-color)',
                                              color: 'var(--primary-accent)',
                                            }}
                                            title="Disminuir redondez"
                                          >
                                            <Minus size={12} />
                                          </button>

                                          <div className="flex-1 flex items-center justify-center px-1">
                                            <input
                                              type="number"
                                              min={0}
                                              max={100}
                                              value={settings[`${buttonPrefix}_border_radius`] ?? 12}
                                              onChange={(e) => {
                                                const key = `${buttonPrefix}_border_radius`;
                                                updateSetting(key, parseInt(e.target.value) || 0);
                                              }}
                                              className="w-full h-full text-center bg-transparent outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                              style={{ color: 'var(--text-main)' }}
                                            />
                                            <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>
                                              px
                                            </span>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              const key = `${buttonPrefix}_border_radius`;
                                              const curr = parseInt(settings[key] ?? '12');
                                              const nextVal = Math.min(100, curr + 2);
                                              updateSetting(key, nextVal);
                                            }}
                                            className="w-8 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                            style={{
                                              backgroundColor: 'var(--bg-card)',
                                              borderColor: 'var(--border-color)',
                                              color: 'var(--primary-accent)',
                                            }}
                                            title="Aumentar redondez"
                                          >
                                            <Plus size={12} />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Glass */}
                                      <div>
                                        <div className="flex items-center justify-between mb-1">
                                          <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                            Glass ({settings[`${buttonPrefix}_bg_opacity`] ?? 100}%)
                                          </label>
                                          <label className="relative flex items-center cursor-pointer shrink-0 select-none">
                                            <input
                                              type="checkbox"
                                              checked={settings[`${buttonPrefix}_glass_enabled`] ?? true}
                                              onChange={(e) => {
                                                const key = `${buttonPrefix}_glass_enabled`;
                                                updateSetting(key, e.target.checked);
                                              }}
                                              className="sr-only peer"
                                            />
                                            <div
                                              className="w-4 h-4 rounded border flex items-center justify-center transition-all peer-checked:border-[var(--primary-accent)] peer-checked:bg-[var(--primary-accent)]"
                                              style={{
                                                borderColor: (settings[`${buttonPrefix}_glass_enabled`] ?? true) ? 'var(--primary-accent)' : 'var(--border-color)',
                                                backgroundColor: (settings[`${buttonPrefix}_glass_enabled`] ?? true) ? 'var(--primary-accent)' : 'var(--bg-card)',
                                              }}
                                            >
                                              {(settings[`${buttonPrefix}_glass_enabled`] ?? true) && (
                                                <Check size={11} className="text-white stroke-[3]" />
                                              )}
                                            </div>
                                          </label>
                                        </div>

                                        <div
                                          className={`flex items-center h-9 rounded-xl border px-3 transition-opacity ${
                                            !(settings[`${buttonPrefix}_glass_enabled`] ?? true) ? 'opacity-40 pointer-events-none' : ''
                                          }`}
                                          style={{
                                            backgroundColor: 'var(--bg-app)',
                                            borderColor: 'var(--border-color)',
                                          }}
                                        >
                                          <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="1"
                                            value={settings[`${buttonPrefix}_bg_opacity`] ?? 100}
                                            onChange={(e) => {
                                              const key = `${buttonPrefix}_bg_opacity`;
                                              updateSetting(key, parseInt(e.target.value));
                                            }}
                                            className="w-full h-1.5 rounded-lg cursor-pointer"
                                            style={{
                                              accentColor: 'var(--primary-accent)',
                                            }}
                                            title="Opacidad del vidrio"
                                            disabled={!(settings[`${buttonPrefix}_glass_enabled`] ?? true)}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* LOGOS EN BIENVENIDA (CONFIGURACIÓN DE LOGO DEL EVENTO Y LOGO DEL PARTNER) */}
                        {registroSubTab === 'logos' && (() => {
                          const displayEventLogo = settings.event_logo_url || eventData?.logo_url || (eventData?.logo ? `/storage/${eventData.logo}` : null);
                          const displayPartnerLogo = settings.project_logo_precarga_url || settings.partner_logo_precarga_url || settings.partner_logo_url || eventData?.partner_logo_url || eventData?.partner?.logo_url || "/dinvited.png";
                          const activeState = 'welcome';
                          const stateLabels: Record<string, string> = { welcome: 'Registro', camera: 'Cámara', gallery: 'Galería' };

                          const getSettingVal = (type: 'event' | 'partner', field: string, defaultVal: any) => {
                            const key = `${type}_logo_${activeState}_${field}`;
                            if (settings[key] !== undefined) return settings[key];
                            return defaultVal;
                          };
                          const updateLogoSetting = (type: 'event' | 'partner', field: string, value: any) => {
                            updateSetting(`${type}_logo_${activeState}_${field}`, value);
                          };

                          const eventV = getSettingVal('event', 'position_v', 'top');
                          const eventH = getSettingVal('event', 'position_h', 'center');
                          const eventSize = getSettingVal('event', 'size', 60);
                          const eventUnit = getSettingVal('event', 'unit', 'px');

                          const partnerV = getSettingVal('partner', 'position_v', 'bottom');
                          const partnerH = getSettingVal('partner', 'position_h', 'center');
                          const partnerSize = getSettingVal('partner', 'size', 40);
                          const partnerUnit = getSettingVal('partner', 'unit', 'px');

                          const eventShowKey = `event_logo_show_welcome`;
                          const partnerShowKey = `partner_logo_show_welcome`;

                          const eventShow = settings[eventShowKey] ?? true;
                          const partnerShow = settings[partnerShowKey] ?? true;

                          return (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* COLUMNA 1: LOGO DEL EVENTO */}
                              <div className="rounded-2xl p-4 border shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                <div>
                                  <div className="pb-2 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center gap-2">
                                      <ImageIcon size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                      <div className="flex flex-col leading-tight">
                                        <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                                          <span>Logo del Evento</span>
                                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase text-white shadow-2xs" style={{ backgroundColor: 'var(--primary-accent)' }}>
                                            {stateLabels[activeState]}
                                          </span>
                                        </h3>
                                        <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                          Configurando la pantalla de {stateLabels[activeState]}
                                        </span>
                                      </div>
                                    </div>

                                    {/* VISIBILIDAD DE LOGO EVENTO EN BIENVENIDA */}
                                    <button
                                      type="button"
                                      onClick={() => updateSetting(eventShowKey, !eventShow)}
                                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer"
                                      style={{
                                        backgroundColor: eventShow ? 'var(--primary-accent)' : 'var(--bg-app)',
                                        borderColor: eventShow ? 'var(--primary-accent)' : 'var(--border-color)',
                                        color: eventShow ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                    >
                                      {eventShow ? <Eye size={13} /> : <EyeOff size={13} />}
                                      <span>{eventShow ? 'Visible en Registro' : 'Oculto en Registro'}</span>
                                    </button>
                                  </div>

                                  {/* GRID INTERNO: IZQ = VISTA PREVIA, DER = CONTROLES */}
                                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3">
                                    {/* VISTA PREVIA LOGO EVENTO */}
                                    <div className="md:col-span-4 flex flex-col items-center justify-center">
                                      <div
                                        className="relative w-full h-full min-h-[140px] rounded-xl border overflow-hidden flex flex-col items-center justify-center p-3"
                                        style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                                      >
                                        {displayEventLogo ? (
                                          <div className="relative w-full h-full flex flex-col items-center justify-center">
                                            <img src={displayEventLogo} alt="Logo Evento" className="max-h-24 max-w-full object-contain drop-shadow-md" />
                                          </div>
                                        ) : (
                                          <div className="flex flex-col items-center justify-center text-center p-2">
                                            <ImageIcon size={20} className="opacity-40 mb-1" style={{ color: 'var(--text-muted)' }} />
                                            <span className="text-xs font-bold opacity-75" style={{ color: 'var(--text-main)' }}>
                                              Sin logo registrado
                                            </span>
                                            <span className="text-[10px] opacity-60 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                              El evento en BD no tiene un logo cargado
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* CONTROLES LOGO EVENTO */}
                                    <div className="md:col-span-8 space-y-2.5">
                                      <div className="grid grid-cols-2 gap-2">
                                        {/* Alineación Vertical */}
                                        <div>
                                          <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                            Alineación Vertical
                                          </label>
                                          <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            {[
                                              { id: 'top', label: 'Arriba' },
                                              { id: 'center', label: 'Centro' },
                                              { id: 'bottom', label: 'Abajo' },
                                            ].map((pos) => {
                                              const isActive = eventV === pos.id;
                                              const isDisabled = partnerShow && partnerV === pos.id && partnerH === eventH;
                                              return (
                                                <button
                                                  key={pos.id}
                                                  type="button"
                                                  disabled={isDisabled}
                                                  onClick={() => updateLogoSetting('event', 'position_v', pos.id)}
                                                  className="botab-item"
                                                  style={{
                                                    backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                  }}
                                                  title={isDisabled ? 'Ocupado por el Logo del Partner' : undefined}
                                                >
                                                  {pos.label}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>

                                        {/* Alineación Horizontal */}
                                        <div>
                                          <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                            Alineación Horizontal
                                          </label>
                                          <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            {[
                                              { id: 'left', label: 'Izq' },
                                              { id: 'center', label: 'Centro' },
                                              { id: 'right', label: 'Der' },
                                            ].map((pos) => {
                                              const isActive = eventH === pos.id;
                                              const isDisabled = partnerShow && partnerH === pos.id && partnerV === eventV;
                                              return (
                                                <button
                                                  key={pos.id}
                                                  type="button"
                                                  disabled={isDisabled}
                                                  onClick={() => updateLogoSetting('event', 'position_h', pos.id)}
                                                  className="botab-item"
                                                  style={{
                                                    backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                  }}
                                                  title={isDisabled ? 'Ocupado por el Logo del Partner' : undefined}
                                                >
                                                  {pos.label}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Tamaño / Ancho Máximo */}
                                      <div>
                                        <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                          Tamaño / Ancho Máximo
                                        </label>
                                        <div className="flex items-center gap-1.5">
                                          <div className="flex-1 flex items-center h-7 rounded-lg border px-2 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            <input
                                              type="number"
                                              min={10}
                                              max={eventUnit === '%' ? 100 : 300}
                                              value={eventSize}
                                              onChange={(e) => updateLogoSetting('event', 'size', parseInt(e.target.value) || 30)}
                                              className="w-full bg-transparent outline-none font-bold text-xs text-center"
                                              style={{ color: 'var(--text-main)' }}
                                            />
                                          </div>
                                          <div className="flex rounded-lg border p-0.5" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            {['px', '%'].map((u) => {
                                              const isActive = eventUnit === u;
                                              return (
                                                <button
                                                  key={u}
                                                  type="button"
                                                  onClick={() => updateLogoSetting('event', 'unit', u)}
                                                  className="px-2 py-0.5 text-[9px] font-extrabold rounded transition-all cursor-pointer"
                                                  style={{
                                                    backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                  }}
                                                >
                                                  {u}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Márgenes independientes */}
                                      <div className="pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--border-color)' }}>
                                        <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                          Márgenes
                                        </label>

                                        {/* Fila 1: Arriba / Abajo */}
                                        <div className="grid grid-cols-2 gap-2">
                                          {[
                                            { field: 'margin_top', unitField: 'margin_top_unit', label: 'Arriba' },
                                            { field: 'margin_bottom', unitField: 'margin_bottom_unit', label: 'Abajo' },
                                          ].map((m) => {
                                            const val = getSettingVal('event', m.field, 0);
                                            const currentUnit = getSettingVal('event', m.unitField, getSettingVal('event', 'margin_unit', 'px'));
                                            return (
                                              <div key={m.field} className="flex flex-col gap-0.5">
                                                <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                                                <div className="flex items-center gap-1">
                                                  <div className="flex-1 flex items-center h-7 rounded-lg border px-1.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    <input
                                                      type="number"
                                                      value={val}
                                                      onChange={(e) => updateLogoSetting('event', m.field, parseInt(e.target.value) || 0)}
                                                      className="w-full bg-transparent outline-none font-bold text-[10px] text-center"
                                                      style={{ color: 'var(--text-main)' }}
                                                    />
                                                  </div>
                                                  <div className="flex rounded-lg border p-0.5 shrink-0" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    {['px', '%'].map((u) => {
                                                      const isActive = currentUnit === u;
                                                      return (
                                                        <button
                                                          key={u}
                                                          type="button"
                                                          onClick={() => updateLogoSetting('event', m.unitField, u)}
                                                          className="px-1.5 py-0.5 text-[8px] font-extrabold rounded transition-all cursor-pointer"
                                                          style={{
                                                            backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                            color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                          }}
                                                        >
                                                          {u}
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>

                                        {/* Fila 2: Izquierda / Derecha */}
                                        <div className="grid grid-cols-2 gap-2">
                                          {[
                                            { field: 'margin_left', unitField: 'margin_left_unit', label: 'Izquierda' },
                                            { field: 'margin_right', unitField: 'margin_right_unit', label: 'Derecha' },
                                          ].map((m) => {
                                            const val = getSettingVal('event', m.field, 0);
                                            const currentUnit = getSettingVal('event', m.unitField, getSettingVal('event', 'margin_unit', 'px'));
                                            return (
                                              <div key={m.field} className="flex flex-col gap-0.5">
                                                <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                                                <div className="flex items-center gap-1">
                                                  <div className="flex-1 flex items-center h-7 rounded-lg border px-1.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    <input
                                                      type="number"
                                                      value={val}
                                                      onChange={(e) => updateLogoSetting('event', m.field, parseInt(e.target.value) || 0)}
                                                      className="w-full bg-transparent outline-none font-bold text-[10px] text-center"
                                                      style={{ color: 'var(--text-main)' }}
                                                    />
                                                  </div>
                                                  <div className="flex rounded-lg border p-0.5 shrink-0" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    {['px', '%'].map((u) => {
                                                      const isActive = currentUnit === u;
                                                      return (
                                                        <button
                                                          key={u}
                                                          type="button"
                                                          onClick={() => updateLogoSetting('event', m.unitField, u)}
                                                          className="px-1.5 py-0.5 text-[8px] font-extrabold rounded transition-all cursor-pointer"
                                                          style={{
                                                            backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                            color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                          }}
                                                        >
                                                          {u}
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* COLUMNA 2: LOGO DEL PARTNER / MARCA */}
                              <div className="rounded-2xl p-4 border shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                <div>
                                  <div className="pb-2 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center gap-2">
                                      <Smartphone size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                                      <div className="flex flex-col leading-tight">
                                        <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                                          <span>Logo del Partner</span>
                                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase text-white shadow-2xs" style={{ backgroundColor: 'var(--primary-accent)' }}>
                                            {stateLabels[activeState]}
                                          </span>
                                        </h3>
                                        <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                          Configurando la pantalla de {stateLabels[activeState]}
                                        </span>
                                      </div>
                                    </div>

                                    {/* VISIBILIDAD DE LOGO PARTNER EN BIENVENIDA */}
                                    <button
                                      type="button"
                                      onClick={() => updateSetting(partnerShowKey, !partnerShow)}
                                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer"
                                      style={{
                                        backgroundColor: partnerShow ? 'var(--primary-accent)' : 'var(--bg-app)',
                                        borderColor: partnerShow ? 'var(--primary-accent)' : 'var(--border-color)',
                                        color: partnerShow ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                    >
                                      {partnerShow ? <Eye size={13} /> : <EyeOff size={13} />}
                                      <span>{partnerShow ? 'Visible en Registro' : 'Oculto en Registro'}</span>
                                    </button>
                                  </div>

                                  {/* GRID INTERNO: IZQ = VISTA PREVIA PARTNER, DER = CONTROLES PARTNER */}
                                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3">
                                    {/* VISTA PREVIA LOGO PARTNER */}
                                    <div className="md:col-span-4 flex flex-col items-center justify-center">
                                      <div
                                        className="relative w-full h-full min-h-[140px] rounded-xl border overflow-hidden flex flex-col items-center justify-center p-3"
                                        style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                                      >
                                        {displayPartnerLogo ? (
                                          <div className="relative w-full h-full flex flex-col items-center justify-center">
                                            <img src={displayPartnerLogo} alt="Logo Partner" className="max-h-24 max-w-full object-contain drop-shadow-md" />
                                          </div>
                                        ) : (
                                          <div className="flex flex-col items-center justify-center text-center p-2">
                                            <Smartphone size={20} className="opacity-40 mb-1" style={{ color: 'var(--text-muted)' }} />
                                            <span className="text-xs font-bold opacity-75" style={{ color: 'var(--text-main)' }}>
                                              Sin logo partner registrado
                                            </span>
                                            <span className="text-[10px] opacity-60 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                              El evento en BD no tiene un partner asignado
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* CONTROLES LOGO PARTNER */}
                                    <div className="md:col-span-8 space-y-2.5">
                                      <div className="grid grid-cols-2 gap-2">
                                        {/* Alineación Vertical Partner */}
                                        <div>
                                          <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                            Alineación Vertical
                                          </label>
                                          <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            {[
                                              { id: 'top', label: 'Arriba' },
                                              { id: 'center', label: 'Centro' },
                                              { id: 'bottom', label: 'Abajo' },
                                            ].map((pos) => {
                                              const isActive = partnerV === pos.id;
                                              const isDisabled = eventShow && eventV === pos.id && eventH === partnerH;
                                              return (
                                                <button
                                                  key={pos.id}
                                                  type="button"
                                                  disabled={isDisabled}
                                                  onClick={() => updateLogoSetting('partner', 'position_v', pos.id)}
                                                  className="botab-item"
                                                  style={{
                                                    backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                  }}
                                                  title={isDisabled ? 'Ocupado por el Logo del Evento' : undefined}
                                                >
                                                  {pos.label}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>

                                        {/* Alineación Horizontal Partner */}
                                        <div>
                                          <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                            Alineación Horizontal
                                          </label>
                                          <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            {[
                                              { id: 'left', label: 'Izq' },
                                              { id: 'center', label: 'Centro' },
                                              { id: 'right', label: 'Der' },
                                            ].map((pos) => {
                                              const isActive = partnerH === pos.id;
                                              const isDisabled = eventShow && eventH === pos.id && eventV === partnerV;
                                              return (
                                                <button
                                                  key={pos.id}
                                                  type="button"
                                                  disabled={isDisabled}
                                                  onClick={() => updateLogoSetting('partner', 'position_h', pos.id)}
                                                  className="botab-item"
                                                  style={{
                                                    backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                  }}
                                                  title={isDisabled ? 'Ocupado por el Logo del Evento' : undefined}
                                                >
                                                  {pos.label}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Tamaño / Ancho Máximo Partner */}
                                      <div>
                                        <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                          Tamaño / Ancho Máximo
                                        </label>
                                        <div className="flex items-center gap-1.5">
                                          <div className="flex-1 flex items-center h-7 rounded-lg border px-2 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            <input
                                              type="number"
                                              min={10}
                                              max={partnerUnit === '%' ? 100 : 300}
                                              value={partnerSize}
                                              onChange={(e) => updateLogoSetting('partner', 'size', parseInt(e.target.value) || 30)}
                                              className="w-full bg-transparent outline-none font-bold text-xs text-center"
                                              style={{ color: 'var(--text-main)' }}
                                            />
                                          </div>
                                          <div className="flex rounded-lg border p-0.5" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            {['px', '%'].map((u) => {
                                              const isActive = partnerUnit === u;
                                              return (
                                                <button
                                                  key={u}
                                                  type="button"
                                                  onClick={() => updateLogoSetting('partner', 'unit', u)}
                                                  className="px-2 py-0.5 text-[9px] font-extrabold rounded transition-all cursor-pointer"
                                                  style={{
                                                    backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                  }}
                                                >
                                                  {u}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Márgenes independientes Partner */}
                                      <div className="pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--border-color)' }}>
                                        <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                          Márgenes
                                        </label>

                                        {/* Fila 1: Arriba / Abajo */}
                                        <div className="grid grid-cols-2 gap-2">
                                          {[
                                            { field: 'margin_top', unitField: 'margin_top_unit', label: 'Arriba' },
                                            { field: 'margin_bottom', unitField: 'margin_bottom_unit', label: 'Abajo' },
                                          ].map((m) => {
                                            const val = getSettingVal('partner', m.field, 0);
                                            const currentUnit = getSettingVal('partner', m.unitField, getSettingVal('partner', 'margin_unit', 'px'));
                                            return (
                                              <div key={m.field} className="flex flex-col gap-0.5">
                                                <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                                                <div className="flex items-center gap-1">
                                                  <div className="flex-1 flex items-center h-7 rounded-lg border px-1.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    <input
                                                      type="number"
                                                      value={val}
                                                      onChange={(e) => updateLogoSetting('partner', m.field, parseInt(e.target.value) || 0)}
                                                      className="w-full bg-transparent outline-none font-bold text-[10px] text-center"
                                                      style={{ color: 'var(--text-main)' }}
                                                    />
                                                  </div>
                                                  <div className="flex rounded-lg border p-0.5 shrink-0" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    {['px', '%'].map((u) => {
                                                      const isActive = currentUnit === u;
                                                      return (
                                                        <button
                                                          key={u}
                                                          type="button"
                                                          onClick={() => updateLogoSetting('partner', m.unitField, u)}
                                                          className="px-1.5 py-0.5 text-[8px] font-extrabold rounded transition-all cursor-pointer"
                                                          style={{
                                                            backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                            color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                          }}
                                                        >
                                                          {u}
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>

                                        {/* Fila 2: Izquierda / Derecha */}
                                        <div className="grid grid-cols-2 gap-2">
                                          {[
                                            { field: 'margin_left', unitField: 'margin_left_unit', label: 'Izquierda' },
                                            { field: 'margin_right', unitField: 'margin_right_unit', label: 'Derecha' },
                                          ].map((m) => {
                                            const val = getSettingVal('partner', m.field, 0);
                                            const currentUnit = getSettingVal('partner', m.unitField, getSettingVal('partner', 'margin_unit', 'px'));
                                            return (
                                              <div key={m.field} className="flex flex-col gap-0.5">
                                                <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                                                <div className="flex items-center gap-1">
                                                  <div className="flex-1 flex items-center h-7 rounded-lg border px-1.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    <input
                                                      type="number"
                                                      value={val}
                                                      onChange={(e) => updateLogoSetting('partner', m.field, parseInt(e.target.value) || 0)}
                                                      className="w-full bg-transparent outline-none font-bold text-[10px] text-center"
                                                      style={{ color: 'var(--text-main)' }}
                                                    />
                                                  </div>
                                                  <div className="flex rounded-lg border p-0.5 shrink-0" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                                    {['px', '%'].map((u) => {
                                                      const isActive = currentUnit === u;
                                                      return (
                                                        <button
                                                          key={u}
                                                          type="button"
                                                          onClick={() => updateLogoSetting('partner', m.unitField, u)}
                                                          className="px-1.5 py-0.5 text-[8px] font-extrabold rounded transition-all cursor-pointer"
                                                          style={{
                                                            backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
                                                            color: isActive ? '#ffffff' : 'var(--text-muted)',
                                                          }}
                                                        >
                                                          {u}
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* SUB-PESTAÑA INFORMACIÓN REGISTRO */}
                        {registroSubTab === 'info' && (
                          <div className="rounded-2xl p-5 border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                            <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                              <Info size={16} style={{ color: 'var(--primary-accent)' }} /> Información y Campos de Registro
                            </h3>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Texto del Título</label>
                                <input
                                  type="text"
                                  value={settings.registro_title ?? 'Registro de Invitados'}
                                  onChange={(e) => updateSetting('registro_title', e.target.value)}
                                  className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium"
                                  style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Nombre del Evento</label>
                                <input
                                  type="text"
                                  readOnly
                                  disabled
                                  value={eventData?.event_name || eventData?.name || eventData?.title || settings.welcome_event || settings.event_name || 'Evento'}
                                  className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium opacity-70 cursor-not-allowed select-none"
                                  style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Texto del Contenido</label>
                                <input
                                  type="text"
                                  value={settings.registro_subtitle ?? 'Por favor completa tus datos para ingresar'}
                                  onChange={(e) => updateSetting('registro_subtitle', e.target.value)}
                                  className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium"
                                  style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                />
                              </div>

                              <div className="flex items-center justify-between p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                <div>
                                  <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Requerir Registro de Invitados</p>
                                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Solicita datos de identificación al invitado antes de ingresar a la cámara</p>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={settings.welcome_registro_enabled ?? false}
                                  onChange={(e) => updateSetting('welcome_registro_enabled', e.target.checked)}
                                  className="w-4 h-4 rounded cursor-pointer"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="flex items-center justify-between p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                  <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Nombre Obligatorio</span>
                                  <input
                                    type="checkbox"
                                    checked={settings.welcome_registro_require_name ?? true}
                                    onChange={(e) => updateSetting('welcome_registro_require_name', e.target.checked)}
                                    className="w-4 h-4 rounded cursor-pointer"
                                  />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                  <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Correo Obligatorio</span>
                                  <input
                                    type="checkbox"
                                    checked={settings.welcome_registro_require_email ?? false}
                                    onChange={(e) => updateSetting('welcome_registro_require_email', e.target.checked)}
                                    className="w-4 h-4 rounded cursor-pointer"
                                  />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                  <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Teléfono Obligatorio</span>
                                  <input
                                    type="checkbox"
                                    checked={settings.welcome_registro_require_phone ?? false}
                                    onChange={(e) => updateSetting('welcome_registro_require_phone', e.target.checked)}
                                    className="w-4 h-4 rounded cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {/* 3. CÁMARA TAB */}
                {mobileActiveView === 'camera' && (
                  <div className="rounded-2xl p-5 border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                      <Camera size={16} style={{ color: 'var(--primary-accent)' }} /> Ajustes de Cámara Móvil
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Instrucciones en Pantalla de Cámara</label>
                        <input
                          type="text"
                          value={settings.camera_instructions}
                          onChange={(e) => updateSetting('camera_instructions', e.target.value)}
                          className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium"
                          style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                        <div>
                          <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Rejilla de Composición (Grid Overlay)</p>
                          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Muestra la rejilla de los tercios en el visor de cámara</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.camera_show_grid}
                          onChange={(e) => updateSetting('camera_show_grid', e.target.checked)}
                          className="w-4 h-4 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. GALERÍA TAB */}
                {mobileActiveView === 'gallery' && (
                  <div className="rounded-2xl p-5 border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                      <ImageIcon size={16} style={{ color: 'var(--primary-accent)' }} /> Configuración de Galería
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Título del Muro de Fotos</label>
                        <input
                          type="text"
                          value={settings.gallery_title}
                          onChange={(e) => updateSetting('gallery_title', e.target.value)}
                          className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium"
                          style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Mensaje de Muro Vacío</label>
                        <input
                          type="text"
                          value={settings.gallery_empty_text}
                          onChange={(e) => updateSetting('gallery_empty_text', e.target.value)}
                          className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium"
                          style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* TÓTEMS SUB-TAB */}
      {subTab === 'totem' && (
        <div
          className="rounded-2xl p-6 border space-y-4"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-3">
            <Sliders size={24} style={{ color: 'var(--primary-accent)' }} />
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>
                Gestión de Tótems & Kioscos Interactivos
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Asocia tótems físicos o pantallas táctiles para la toma de fotografías y registro en puerta.
              </p>
            </div>
          </div>

          <div
            className="p-8 text-center rounded-xl border border-dashed space-y-3"
            style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
          >
            <Sliders size={36} className="mx-auto opacity-50 text-primary-500" />
            <h4 className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>
              No hay tótems asociados a este evento
            </h4>
            <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
              Puedes vincular un tótem ingresando el código del dispositivo para sincronizar el software de captura.
            </p>
            <button
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
              style={{ backgroundColor: 'var(--primary-accent)' }}
            >
              Vincular Nuevo Tótem
            </button>
          </div>
        </div>
      )}

      {/* AUXILIARY MODALS MIGRATED FROM DPHOTOS */}
      <FontPickerModal
        isOpen={showFontModal}
        onClose={() => setShowFontModal(false)}
        currentFont={textTarget === 'global_title' ? settings.global_title_font_family : settings.global_text_font_family}
        onSelect={(fontName) => {
          if (textTarget === 'global_title') {
            updateSetting('global_title_font_family', fontName);
          } else {
            updateSetting('global_text_font_family', fontName);
          }
          setShowFontModal(false);
        }}
      />

      <GradientPickerModal
        isOpen={showGradientModal}
        initialGradient={{ type: 'linear', angle: 180, colors: ['#6366f1', '#a855f7'] }}
        onOpenColorPicker={() => {}}
        onClose={() => setShowGradientModal(false)}
        onSelect={(gradient) => {
          setShowGradientModal(false);
        }}
      />
    </div>
  );
}
