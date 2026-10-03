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
  const [generalSubTab, setGeneralSubTab] = useState<'fuentes' | 'botones' | 'fondos' | 'logos'>('fuentes');
  const [textTarget, setTextTarget] = useState<'global_title' | 'global_text'>('global_title');
  const [containerTarget, setContainerTarget] = useState<'fondo' | 'mensaje' | 'barra'>('fondo');
  const [buttonState, setButtonState] = useState<'normal' | 'hover'>('normal');

  const [settings, setSettings] = useState<any>({
    welcome_title: 'Boda Laura & David',
    welcome_subtitle: '¡Bienvenido al evento!',
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
    if (view === 'general') setPreviewView('welcome');
    else setPreviewView(view);
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
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* COLUMNA IZQUIERDA: PREVISUALIZACIÓN DE LA APP MÓVIL (MOBILE SIMULATOR) */}
          <div className="xl:col-span-3 flex flex-col items-center h-full">
            <div className="sticky top-[85px] z-10 w-full flex flex-col items-center justify-between h-full py-0">
              <div className="w-full flex flex-col items-center">
                {/* FRAME DEL TELÉFONO CON MOBILE SIMULATOR DE DPHOTOS */}
                <div className="w-full max-w-[260px] h-[520px] rounded-[16px] p-1.5 border-[4px] border-slate-900 shadow-2xl bg-black relative ring-1 ring-white/10">
                  {/* Isla Dinámica / Notch del teléfono */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-black rounded-full z-40 border border-slate-800 flex items-center justify-end px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-700" />
                  </div>

                  <MobileSimulator
                    data={{ settings }}
                    event={{ ...eventData, title: settings.welcome_title || eventData?.name || eventData?.title }}
                    previewView={previewView}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: PESTAÑAS Y CONTENIDO DE CONFIGURACIÓN */}
          <div className="xl:col-span-9 space-y-3 pt-3 flex flex-col max-h-[calc(100vh-145px)]">
            {/* BARRA DE PANTALLA Y PERSONALIZACIÓN MÓVIL (GENERAL, BIENVENIDA, CÁMARA, GALERÍA) Y BOTÓN DE GUARDAR */}
            <div
              className="px-4 flex items-center justify-between gap-4 text-white shadow-md relative h-8 z-20 overflow-visible rounded-lg shrink-0"
              style={{ backgroundColor: 'var(--primary-accent)' }}
            >
              <div className="flex items-center gap-4 flex-1 overflow-visible">
                <div className="border-r border-white/30 pr-4 py-0.5 shrink-0">
                  <span className="font-black text-sm uppercase tracking-wider">PANTALLA</span>
                </div>

                <div className="flex items-center gap-5 overflow-visible flex-1">
                  {[
                    { id: 'general', label: 'General', icon: Sparkles },
                    { id: 'welcome', label: 'Bienvenida', icon: Tv },
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
                            ? 'bg-white text-[var(--primary-accent)] shadow-2xl text-base px-6 py-2.5 -my-3.5 z-30 scale-110 border-[3.5px]'
                            : 'bg-white/20 text-white hover:bg-white/35 p-1.5'
                        }`}
                        style={isActive ? { borderColor: 'var(--primary-accent)' } : undefined}
                      >
                        <Icon size={isActive ? 19 : 18} />
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
                        { id: 'fuentes', label: 'Fuentes & Estilos', icon: Type },
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
                                    className="px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer"
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
                                    className="px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer"
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
                    {generalSubTab === 'fondos' && (
                      <div className="rounded-2xl p-3 border space-y-3 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                        <div className="pb-1 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                          <div className="flex items-center gap-2.5">
                            <Palette size={22} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                            <div className="flex flex-col leading-tight">
                              <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                Contenedor ({containerTarget === 'fondo' ? 'Fondo' : containerTarget === 'mensaje' ? 'Mensaje' : 'Barra'})
                              </h3>
                              <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                Estilos y configuración del contenedor
                              </span>
                            </div>
                          </div>

                          {/* PESTAÑAS FONDO / MENSAJE / BARRA EN EL LADO DERECHO */}
                          <div className="flex items-center gap-1 p-0.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                            {[
                              { id: 'fondo', label: 'Fondo' },
                              { id: 'mensaje', label: 'Mensaje' },
                              { id: 'barra', label: 'Barra' },
                            ].map((cTarget) => {
                              const isCTargetActive = containerTarget === cTarget.id;
                              return (
                                <button
                                  key={cTarget.id}
                                  type="button"
                                  onClick={() => setContainerTarget(cTarget.id as any)}
                                  className="px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer"
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                          {/* COLUMNA IZQUIERDA: SUBIR IMAGEN / VIDEO DE FONDO */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                              Imagen / Video
                            </label>
                            
                            <div
                              className="border-2 border-dashed rounded-2xl p-4 text-center space-y-2 flex flex-col items-center justify-center transition-all relative overflow-hidden group min-h-[160px]"
                              style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                            >
                              {settings.screen_image_url ? (
                                <div className="relative w-full h-32 rounded-xl overflow-hidden group">
                                  {settings.screen_bg_type === 'video' || String(settings.screen_image_url).startsWith('data:video') || String(settings.screen_image_url).match(/\.(mp4|webm|ogg)$/i) ? (
                                    <video
                                      src={settings.screen_image_url}
                                      autoPlay
                                      loop
                                      muted
                                      playsInline
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <img
                                      src={settings.screen_image_url}
                                      alt="Fondo de pantalla"
                                      className="w-full h-full object-cover"
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
                                              updateSetting('screen_image_url', ev.target?.result);
                                              updateSetting('screen_bg_type', isVideo ? 'video' : 'image');
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting('screen_image_url', '')}
                                      className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-600 transition-colors"
                                      title="Eliminar archivo"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                                  <div className="p-3 rounded-full mb-2" style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}>
                                    <Upload size={20} />
                                  </div>
                                  <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Subir Imagen / Video</span>
                                  <span className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>PNG, JPG, MP4 o WEBM (máx. 15MB)</span>
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
                                          updateSetting('screen_image_url', ev.target?.result);
                                          updateSetting('screen_bg_type', isVideo ? 'video' : 'image');
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>

                          {/* COLUMNA DERECHA: CONTROLES ADAPTATIVOS EN UNA SOLA FILA DE 3 COMPONENTES */}
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                              {/* 1. Estilo con StylePickerPopover */}
                              <div>
                                <StylePickerPopover
                                  label={containerTarget === 'fondo' ? 'Estilo de fondo' : containerTarget === 'mensaje' ? 'Estilo mensaje' : 'Estilo barra'}
                                  elementType="box"
                                  eventColors={eventColors.length > 0 ? eventColors : ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B']}
                                  eventColorImage={eventColorImage}
                                  styleConfig={{
                                    backgroundColor: containerTarget === 'fondo'
                                      ? (settings.screen_bg_type === 'gradient' && settings.screen_gradient_data
                                          ? (typeof settings.screen_gradient_data === 'string' ? settings.screen_gradient_data : settings.screen_bg_color || '#000000')
                                          : (settings.screen_bg_color || '#000000'))
                                      : containerTarget === 'mensaje'
                                      ? (settings.container_bg_type === 'gradient' && settings.container_gradient_data
                                          ? (typeof settings.container_gradient_data === 'string' ? settings.container_gradient_data : settings.container_bg_color || '#0f172a')
                                          : (settings.container_bg_color || '#0f172a'))
                                      : (settings.bar_bg_type === 'gradient' && settings.bar_gradient_data
                                          ? (typeof settings.bar_gradient_data === 'string' ? settings.bar_gradient_data : settings.bar_bg_color || '#1e293b')
                                          : (settings.bar_bg_color || '#1e293b')),
                                    borderWidth: containerTarget === 'fondo' ? settings.screen_border_width ?? 0 : containerTarget === 'mensaje' ? settings.container_border_width ?? 0 : settings.bar_border_width ?? 0,
                                    borderStyle: containerTarget === 'fondo' ? settings.screen_border_style || 'solid' : containerTarget === 'mensaje' ? settings.container_border_style || 'solid' : settings.bar_border_style || 'solid',
                                    borderColor: containerTarget === 'fondo' ? settings.screen_border_color || '#E07A5F' : containerTarget === 'mensaje' ? settings.container_border_color || '#E07A5F' : settings.bar_border_color || '#E07A5F',
                                    borderRadius: containerTarget === 'fondo' ? settings.screen_border_radius ?? 0 : containerTarget === 'mensaje' ? settings.container_border_radius ?? 24 : settings.bar_border_radius ?? 0,
                                    shadowColor: containerTarget === 'fondo' ? settings.screen_shadow_color || '#000000' : containerTarget === 'mensaje' ? settings.container_shadow_color || '#000000' : settings.bar_shadow_color || '#000000',
                                    shadowBlur: containerTarget === 'fondo' ? settings.screen_shadow_blur ?? 0 : containerTarget === 'mensaje' ? settings.container_shadow_blur ?? 0 : settings.bar_shadow_blur ?? 0,
                                    shadowOffsetX: containerTarget === 'fondo' ? settings.screen_shadow_offset_x ?? 0 : containerTarget === 'mensaje' ? settings.container_shadow_offset_x ?? 0 : settings.bar_shadow_offset_x ?? 0,
                                    shadowOffsetY: containerTarget === 'fondo' ? settings.screen_shadow_offset_y ?? 0 : containerTarget === 'mensaje' ? settings.container_shadow_offset_y ?? 0 : settings.bar_shadow_offset_y ?? 0,
                                  }}
                                  onChange={(updated) => {
                                    const prefix = containerTarget === 'fondo' ? 'screen' : containerTarget === 'mensaje' ? 'container' : 'bar';
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

                              {/* 2. Redondez */}
                              <div>
                                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
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
                                      const key = containerTarget === 'fondo' ? 'screen_border_radius' : containerTarget === 'mensaje' ? 'container_border_radius' : 'bar_border_radius';
                                      const curr = parseInt(settings[key] ?? (containerTarget === 'mensaje' ? '24' : '12'));
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
                                      value={
                                        containerTarget === 'fondo'
                                          ? (settings.screen_border_radius ?? 0)
                                          : containerTarget === 'mensaje'
                                          ? (settings.container_border_radius ?? 24)
                                          : (settings.bar_border_radius ?? 16)
                                      }
                                      onChange={(e) => {
                                        const key = containerTarget === 'fondo' ? 'screen_border_radius' : containerTarget === 'mensaje' ? 'container_border_radius' : 'bar_border_radius';
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
                                      const key = containerTarget === 'fondo' ? 'screen_border_radius' : containerTarget === 'mensaje' ? 'container_border_radius' : 'bar_border_radius';
                                      const curr = parseInt(settings[key] ?? (containerTarget === 'mensaje' ? '24' : '12'));
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

                              {/* 3. Efecto Glass (misma fila, tercera columna) */}
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                    Glass ({
                                      containerTarget === 'fondo'
                                        ? (settings.screen_bg_opacity ?? 100)
                                        : containerTarget === 'mensaje'
                                        ? (settings.container_bg_opacity ?? 75)
                                        : (settings.bar_bg_opacity ?? 85)
                                    }%)
                                  </label>

                                  {/* Checkbox a la derecha del título de Glass */}
                                  <label className="relative flex items-center cursor-pointer shrink-0 select-none">
                                    <input
                                      type="checkbox"
                                      checked={
                                        containerTarget === 'fondo'
                                          ? (settings.screen_glass_enabled ?? true)
                                          : containerTarget === 'mensaje'
                                          ? (settings.container_glass_enabled ?? true)
                                          : (settings.bar_glass_enabled ?? true)
                                      }
                                      onChange={(e) => {
                                        const key = containerTarget === 'fondo' ? 'screen_glass_enabled' : containerTarget === 'mensaje' ? 'container_glass_enabled' : 'bar_glass_enabled';
                                        updateSetting(key, e.target.checked);
                                      }}
                                      className="sr-only peer"
                                    />
                                    <div
                                      className="w-4 h-4 rounded-md border flex items-center justify-center transition-all peer-checked:border-[var(--primary-accent)] peer-checked:bg-[var(--primary-accent)]"
                                      style={{
                                        borderColor: (
                                          containerTarget === 'fondo'
                                            ? (settings.screen_glass_enabled ?? true)
                                            : containerTarget === 'mensaje'
                                            ? (settings.container_glass_enabled ?? true)
                                            : (settings.bar_glass_enabled ?? true)
                                        ) ? 'var(--primary-accent)' : 'var(--border-color)',
                                        backgroundColor: (
                                          containerTarget === 'fondo'
                                            ? (settings.screen_glass_enabled ?? true)
                                            : containerTarget === 'mensaje'
                                            ? (settings.container_glass_enabled ?? true)
                                            : (settings.bar_glass_enabled ?? true)
                                        ) ? 'var(--primary-accent)' : 'var(--bg-card)',
                                      }}
                                    >
                                      {(
                                        containerTarget === 'fondo'
                                          ? (settings.screen_glass_enabled ?? true)
                                          : containerTarget === 'mensaje'
                                          ? (settings.container_glass_enabled ?? true)
                                          : (settings.bar_glass_enabled ?? true)
                                      ) && (
                                        <Check size={11} className="text-white stroke-[3]" />
                                      )}
                                    </div>
                                  </label>
                                </div>

                                <div
                                  className={`flex items-center h-9 rounded-xl border px-3 transition-opacity ${
                                    !(
                                      containerTarget === 'fondo'
                                        ? (settings.screen_glass_enabled ?? true)
                                        : containerTarget === 'mensaje'
                                        ? (settings.container_glass_enabled ?? true)
                                        : (settings.bar_glass_enabled ?? true)
                                    ) ? 'opacity-40 pointer-events-none' : ''
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
                                    value={
                                      containerTarget === 'fondo'
                                        ? (settings.screen_bg_opacity ?? 100)
                                        : containerTarget === 'mensaje'
                                        ? (settings.container_bg_opacity ?? 75)
                                        : (settings.bar_bg_opacity ?? 85)
                                    }
                                    onChange={(e) => {
                                      const key = containerTarget === 'fondo' ? 'screen_bg_opacity' : containerTarget === 'mensaje' ? 'container_bg_opacity' : 'bar_bg_opacity';
                                      updateSetting(key, parseInt(e.target.value));
                                    }}
                                    className="w-full h-1.5 rounded-lg cursor-pointer"
                                    style={{
                                      accentColor: 'var(--primary-accent)',
                                    }}
                                    title="Opacidad del vidrio"
                                    disabled={
                                      !(
                                        containerTarget === 'fondo'
                                          ? (settings.screen_glass_enabled ?? true)
                                          : containerTarget === 'mensaje'
                                          ? (settings.container_glass_enabled ?? true)
                                          : (settings.bar_glass_enabled ?? true)
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* LOGOS SUB-TAB */}
                    {generalSubTab === 'logos' && (
                      <div className="rounded-2xl p-4 border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                        <div className="pb-2 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                          <div className="flex items-center gap-2.5">
                            <ImageIcon size={22} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                            <div className="flex flex-col leading-tight">
                              <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                Logos del Evento
                              </h3>
                              <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                Personalización de isotipo y logotipo institucional
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* LOGO PRINCIPAL */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                              Logo Principal
                            </label>
                            <div
                              className="relative w-full h-36 rounded-xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center transition-all group"
                              style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                            >
                              {settings.event_logo_url ? (
                                <div className="relative w-full h-full flex items-center justify-center p-3">
                                  <img src={settings.event_logo_url} alt="Logo Principal" className="max-h-full max-w-full object-contain" />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <label className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/40 cursor-pointer transition-colors">
                                      <Upload size={16} />
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (ev) => updateSetting('event_logo_url', ev.target?.result);
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting('event_logo_url', '')}
                                      className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-600 transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-3">
                                  <div className="p-2.5 rounded-full mb-1.5" style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}>
                                    <Upload size={18} />
                                  </div>
                                  <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Subir Logo</span>
                                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>PNG transparente (máx. 2MB)</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => updateSetting('event_logo_url', ev.target?.result);
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>

                          {/* ISOTIPO / ICONO */}
                          <div className="space-y-2">
                            <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                              Isotipo / Ícono Secundario
                            </label>
                            <div
                              className="relative w-full h-36 rounded-xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center transition-all group"
                              style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                            >
                              {settings.event_icon_url ? (
                                <div className="relative w-full h-full flex items-center justify-center p-3">
                                  <img src={settings.event_icon_url} alt="Isotipo" className="max-h-full max-w-full object-contain" />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <label className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/40 cursor-pointer transition-colors">
                                      <Upload size={16} />
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (ev) => updateSetting('event_icon_url', ev.target?.result);
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => updateSetting('event_icon_url', '')}
                                      className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-600 transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-3">
                                  <div className="p-2.5 rounded-full mb-1.5" style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}>
                                    <Upload size={18} />
                                  </div>
                                  <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Subir Isotipo</span>
                                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Formato PNG o SVG</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => updateSetting('event_icon_url', ev.target?.result);
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. BIENVENIDA TAB */}
                {mobileActiveView === 'welcome' && (
                  <div className="rounded-2xl p-5 border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                      <Tv size={16} style={{ color: 'var(--primary-accent)' }} /> Contenido de Pantalla de Bienvenida
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Título del Evento</label>
                        <input
                          type="text"
                          value={settings.welcome_title}
                          onChange={(e) => updateSetting('welcome_title', e.target.value)}
                          className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium"
                          style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Texto del Botón</label>
                        <input
                          type="text"
                          value={settings.welcome_button_text}
                          onChange={(e) => updateSetting('welcome_button_text', e.target.value)}
                          className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium"
                          style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Subtítulo / Mensaje de Bienvenida</label>
                        <input
                          type="text"
                          value={settings.welcome_subtitle}
                          onChange={(e) => updateSetting('welcome_subtitle', e.target.value)}
                          className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium"
                          style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                        />
                      </div>
                    </div>
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
