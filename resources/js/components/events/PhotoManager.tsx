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
} from 'lucide-react';
import api from '../../lib/api';
import MobileSimulator from './MobileSimulator';
import GradientPickerModal, { GradientData } from './GradientPickerModal';
import FontPickerModal from './FontPickerModal';
import FontPicker from './FontPicker';
import { StylePickerPopover } from '../StylePickerPopover';

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
  const [generalSubTab, setGeneralSubTab] = useState<'fuentes' | 'botones' | 'fondos'>('fuentes');
  const [textTarget, setTextTarget] = useState<'global_title' | 'global_text'>('global_title');

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
                <div className="w-full flex items-center justify-between mb-2 px-1">
                  <span className="text-[9.5px] font-black uppercase tracking-widest flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Sparkles size={12} style={{ color: 'var(--primary-accent)' }} /> Previsualización
                  </span>

                  {/* SELECTOR RÁPIDO DE PANTALLA EN SIMULADOR */}
                  <div className="flex items-center gap-0.5 p-0.5 rounded-lg border bg-black/10">
                    {[
                      { id: 'welcome', icon: Tv, title: 'Bienvenida' },
                      { id: 'camera', icon: Camera, title: 'Cámara' },
                      { id: 'gallery', icon: ImageIcon, title: 'Galería' },
                    ].map((pv) => {
                      const PvIcon = pv.icon;
                      const isPvActive = previewView === pv.id;
                      return (
                        <button
                          key={pv.id}
                          type="button"
                          onClick={() => setPreviewView(pv.id)}
                          title={pv.title}
                          className={`p-1 rounded-md transition-all cursor-pointer ${
                            isPvActive ? 'bg-primary-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <PvIcon size={11} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* FRAME DEL TELÉFONO CON MOBILE SIMULATOR DE DPHOTOS */}
                <div className="w-full max-w-[220px] h-[440px] rounded-[12px] p-1.5 border-[3.5px] border-slate-900 shadow-2xl bg-black relative ring-1 ring-white/10">
                  {/* Isla Dinámica / Notch del teléfono */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-3 bg-black rounded-full z-40 border border-slate-800 flex items-center justify-end px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-700" />
                  </div>

                  <MobileSimulator
                    data={{ settings }}
                    event={{ ...eventData, title: settings.welcome_title || eventData?.name || eventData?.title }}
                    previewView={previewView}
                  />
                </div>
              </div>

              <p className="text-[9px] font-bold italic mt-2.5" style={{ color: 'var(--text-muted)' }}>
                * Previsualización interactiva dPhotos
              </p>
            </div>
          </div>

          {/* COLUMNA DERECHA: PESTAÑAS Y CONTENIDO DE CONFIGURACIÓN (CON SCROLL INDEPENDIENTE DESDE LA BARRA DE SERVICIOS) */}
          <div className="xl:col-span-9 space-y-4 max-h-[calc(100vh-145px)] overflow-y-auto pr-1">
            {/* PESTAÑAS PRINCIPALES DE PERSONALIZACIÓN MÓVIL (GENERAL, BIENVENIDA, CÁMARA, GALERÍA) */}
            <div
              className="flex items-center gap-1.5 p-1.5 rounded-2xl border shadow-2xs"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
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
                    onClick={() => handleTabChange(tab.id as any)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                    style={{
                      backgroundColor: isActive ? 'var(--primary-accent)' : 'var(--bg-app)',
                      color: isActive ? '#ffffff' : 'var(--text-muted)',
                      border: isActive ? 'none' : '1px solid var(--border-color)',
                    }}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
                {/* 1. GENERAL TAB */}
                {mobileActiveView === 'general' && (
                  <div className="space-y-4">
                    {/* SUB-PESTAÑAS DE GENERAL: FUENTES, BOTONES, FONDOS */}
                    <div className="flex p-1 rounded-xl border gap-1" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                      {[
                        { id: 'fuentes', label: 'Fuentes & Estilos', icon: Type },
                        { id: 'botones', label: 'Botones Globale', icon: MousePointer2 },
                        { id: 'fondos', label: 'Fondos & Colores', icon: Palette },
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
                      <div className="space-y-4">
                        <div className="rounded-2xl p-5 border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                            <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                              <Type size={16} style={{ color: 'var(--primary-accent)' }} /> Tipografía y Estilos
                            </h3>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 p-0.5 rounded-lg border bg-black/10">
                                <button
                                  type="button"
                                  onClick={() => setTextTarget('global_title')}
                                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md cursor-pointer ${
                                    textTarget === 'global_title' ? 'bg-primary-500 text-white' : 'text-slate-400'
                                  }`}
                                >
                                  Encabezados
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTextTarget('global_text')}
                                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md cursor-pointer ${
                                    textTarget === 'global_text' ? 'bg-primary-500 text-white' : 'text-slate-400'
                                  }`}
                                >
                                  Texto Cuerpo
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowFontModal(true)}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                              >
                                <Type size={12} />
                                <span>Abrir Catálogo</span>
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <FontPicker
                                label="Familia Tipográfica"
                                value={settings[`${textTarget}_font_family`]}
                                onChange={(fontName) => updateSetting(`${textTarget}_font_family`, fontName)}
                              />
                            </div>

                            <div>
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

                            <div>
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

                        {/* EFECTOS AVANZADOS: BORDE Y SOMBRA DE TEXTO */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="rounded-2xl p-4 border space-y-3 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold uppercase" style={{ color: 'var(--text-main)' }}>Borde de Texto (Stroke)</span>
                              <input
                                type="checkbox"
                                checked={settings[`${textTarget}_stroke_active`]}
                                onChange={(e) => updateSetting(`${textTarget}_stroke_active`, e.target.checked)}
                                className="w-4 h-4 rounded cursor-pointer"
                              />
                            </div>
                            {settings[`${textTarget}_stroke_active`] && (
                              <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Grosor ({settings[`${textTarget}_stroke_width`]}px)</label>
                                  <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={settings[`${textTarget}_stroke_width`]}
                                    onChange={(e) => updateSetting(`${textTarget}_stroke_width`, e.target.value)}
                                    className="w-24 accent-primary-500"
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Color de Borde</label>
                                  <input
                                    type="color"
                                    value={settings[`${textTarget}_stroke_color`]}
                                    onChange={(e) => updateSetting(`${textTarget}_stroke_color`, e.target.value)}
                                    className="w-8 h-7 rounded border-0"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="rounded-2xl p-4 border space-y-3 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold uppercase" style={{ color: 'var(--text-main)' }}>Sombra de Texto (Drop Shadow)</span>
                              <input
                                type="checkbox"
                                checked={settings[`${textTarget}_shadow_active`]}
                                onChange={(e) => updateSetting(`${textTarget}_shadow_active`, e.target.checked)}
                                className="w-4 h-4 rounded cursor-pointer"
                              />
                            </div>
                            {settings[`${textTarget}_shadow_active`] && (
                              <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Desenfoque ({settings[`${textTarget}_shadow_blur`]}px)</label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="20"
                                    value={settings[`${textTarget}_shadow_blur`]}
                                    onChange={(e) => updateSetting(`${textTarget}_shadow_blur`, e.target.value)}
                                    className="w-24 accent-primary-500"
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Color Sombra</label>
                                  <input
                                    type="color"
                                    value={settings[`${textTarget}_shadow_color`]}
                                    onChange={(e) => updateSetting(`${textTarget}_shadow_color`, e.target.value)}
                                    className="w-8 h-7 rounded border-0"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* BOTONES GLOBALES */}
                    {generalSubTab === 'botones' && (
                      <div className="rounded-2xl p-5 border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                        <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                          <MousePointer2 size={16} style={{ color: 'var(--primary-accent)' }} /> Estilo de Botones Principales
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Fondo del Botón</label>
                            <input
                              type="color"
                              value={settings.global_button_bg}
                              onChange={(e) => updateSetting('global_button_bg', e.target.value)}
                              className="w-10 h-9 rounded-lg cursor-pointer border-0"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Color de Texto</label>
                            <input
                              type="color"
                              value={settings.global_button_text}
                              onChange={(e) => updateSetting('global_button_text', e.target.value)}
                              className="w-10 h-9 rounded-lg cursor-pointer border-0"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Radio de Borde ({settings.global_button_radius}px)</label>
                            <input
                              type="range"
                              min="0"
                              max="32"
                              value={settings.global_button_radius}
                              onChange={(e) => updateSetting('global_button_radius', parseInt(e.target.value))}
                              className="w-full accent-primary-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FONDOS Y COLORES */}
                    {generalSubTab === 'fondos' && (
                      <div className="space-y-4">
                        <div className="rounded-2xl p-5 border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                          <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                            <Palette size={16} style={{ color: 'var(--primary-accent)' }} /> Fondo de Pantalla Principal
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Tipo de Fondo</label>
                              <select
                                value={settings.screen_bg_type}
                                onChange={(e) => updateSetting('screen_bg_type', e.target.value)}
                                className="w-full rounded-xl px-3 py-2 border outline-none text-xs font-medium"
                                style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                              >
                                <option value="color">Color Sólido</option>
                                <option value="gradient">Gradiente Elegante</option>
                                <option value="image">Imagen Personalizada</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Color de Fondo</label>
                              <input
                                type="color"
                                value={settings.screen_bg_color}
                                onChange={(e) => updateSetting('screen_bg_color', e.target.value)}
                                className="w-10 h-9 rounded-lg cursor-pointer border-0"
                              />
                            </div>
                          </div>
                        </div>

                        {/* VIDRIO GLASSMORPHISM DEL CONTENEDOR */}
                        <div className="rounded-2xl p-5 border space-y-4 shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                          <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                            <Sliders size={16} style={{ color: 'var(--primary-accent)' }} /> Estilo de Contenedor Glassmorphism
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Color del Vidrio</label>
                              <input
                                type="color"
                                value={settings.container_bg_color}
                                onChange={(e) => updateSetting('container_bg_color', e.target.value)}
                                className="w-10 h-9 rounded-lg cursor-pointer border-0"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Opacidad ({settings.container_bg_opacity}%)</label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={settings.container_bg_opacity}
                                onChange={(e) => updateSetting('container_bg_opacity', parseInt(e.target.value))}
                                className="w-full accent-primary-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Esquinas Redondeadas ({settings.container_border_radius}px)</label>
                              <input
                                type="range"
                                min="8"
                                max="40"
                                value={settings.container_border_radius}
                                onChange={(e) => updateSetting('container_border_radius', parseInt(e.target.value))}
                                className="w-full accent-primary-500"
                              />
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
