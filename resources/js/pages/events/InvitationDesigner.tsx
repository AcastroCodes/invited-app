import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Type,
  Image as ImageIcon,
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
} from 'lucide-react';
import api from '../../lib/api';
import type { Invitation, Event } from '../../types';

interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'button' | 'widget_rsvp' | 'widget_map' | 'widget_countdown';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  textAlign?: 'left' | 'center' | 'right';
  animation?: 'fade' | 'slideUp' | 'zoomIn' | 'bounce';
  locked?: boolean;
}

export default function InvitationDesigner() {
  const { id: eventId, invitationId } = useParams<{ id: string; invitationId: string }>();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Studio UI states
  const [activeLeftTab, setActiveLeftTab] = useState<'layers' | 'text' | 'media' | 'widgets'>('layers');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [zoomInputText, setZoomInputText] = useState('100');
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineTime, setTimelineTime] = useState(0);

  useEffect(() => {
    setZoomInputText(String(zoom));
  }, [zoom]);

  const handleZoomInputCommit = (valStr: string) => {
    const parsed = parseInt(valStr.replace(/\D/g, ''), 10);
    if (!isNaN(parsed)) {
      const clamped = Math.min(200, Math.max(25, parsed));
      setZoom(clamped);
      setZoomInputText(String(clamped));
    } else {
      setZoomInputText(String(zoom));
    }
  };

  const handleFitToScreen = () => {
    // 640px height canvas fitting standard studio view area
    setZoom(90);
  };

  // Initial Elements State
  const [elements, setElements] = useState<CanvasElement[]>([
    {
      id: 'el-title-1',
      type: 'text',
      content: '¡Nos Casamos!',
      x: 30,
      y: 80,
      width: 300,
      height: 50,
      fontSize: 28,
      fontWeight: 'bold',
      color: '#2B2D42',
      textAlign: 'center',
      animation: 'slideUp',
    },
    {
      id: 'el-sub-1',
      type: 'text',
      content: 'Acompañanos a celebrar nuestro gran día',
      x: 20,
      y: 140,
      width: 320,
      height: 40,
      fontSize: 14,
      color: '#8D99AE',
      textAlign: 'center',
      animation: 'fade',
    },
    {
      id: 'el-widget-rsvp',
      type: 'button',
      content: 'Confirmar Asistencia (RSVP)',
      x: 50,
      y: 500,
      width: 260,
      height: 48,
      fontSize: 14,
      fontWeight: 'bold',
      color: '#FFFFFF',
      backgroundColor: '#E07A5F',
      borderRadius: 12,
      textAlign: 'center',
      animation: 'zoomIn',
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

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  const updateSelectedElement = (key: keyof CanvasElement, val: any) => {
    if (!selectedElementId) return;
    setElements(
      elements.map((el) => (el.id === selectedElementId ? { ...el, [key]: val } : el))
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
          className="w-72 shrink-0 border-r flex flex-col z-30"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
          }}
        >
          {/* Tool Tabs */}
          <div
            className="grid grid-cols-4 border-b text-xs font-bold"
            style={{
              backgroundColor: 'var(--bg-app)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-muted)',
            }}
          >
            <button
              onClick={() => setActiveLeftTab('layers')}
              className={`p-3 flex flex-col items-center gap-1 border-b-2 transition-colors ${
                activeLeftTab === 'layers' ? 'font-black' : 'hover:opacity-80'
              }`}
              style={{
                borderColor: activeLeftTab === 'layers' ? 'var(--primary-accent)' : 'transparent',
                color: activeLeftTab === 'layers' ? 'var(--primary-accent)' : 'var(--text-muted)',
              }}
            >
              <Layers size={16} /> Capas
            </button>
            <button
              onClick={() => setActiveLeftTab('text')}
              className={`p-3 flex flex-col items-center gap-1 border-b-2 transition-colors ${
                activeLeftTab === 'text' ? 'font-black' : 'hover:opacity-80'
              }`}
              style={{
                borderColor: activeLeftTab === 'text' ? 'var(--primary-accent)' : 'transparent',
                color: activeLeftTab === 'text' ? 'var(--primary-accent)' : 'var(--text-muted)',
              }}
            >
              <Type size={16} /> Texto
            </button>
            <button
              onClick={() => setActiveLeftTab('widgets')}
              className={`p-3 flex flex-col items-center gap-1 border-b-2 transition-colors ${
                activeLeftTab === 'widgets' ? 'font-black' : 'hover:opacity-80'
              }`}
              style={{
                borderColor: activeLeftTab === 'widgets' ? 'var(--primary-accent)' : 'transparent',
                color: activeLeftTab === 'widgets' ? 'var(--primary-accent)' : 'var(--text-muted)',
              }}
            >
              <Smartphone size={16} /> Widgets
            </button>
            <button
              onClick={() => setActiveLeftTab('media')}
              className={`p-3 flex flex-col items-center gap-1 border-b-2 transition-colors ${
                activeLeftTab === 'media' ? 'font-black' : 'hover:opacity-80'
              }`}
              style={{
                borderColor: activeLeftTab === 'media' ? 'var(--primary-accent)' : 'transparent',
                color: activeLeftTab === 'media' ? 'var(--primary-accent)' : 'var(--text-muted)',
              }}
            >
              <ImageIcon size={16} /> Media
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Layers Tab */}
            {activeLeftTab === 'layers' && (
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Capas en Escena
                </h3>
                {elements.length === 0 ? (
                  <p className="text-xs italic py-4 text-center" style={{ color: 'var(--text-muted)' }}>
                    No hay elementos agregados
                  </p>
                ) : (
                  elements.map((el) => (
                    <div
                      key={el.id}
                      onClick={() => setSelectedElementId(el.id)}
                      className="flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all"
                      style={{
                        backgroundColor: selectedElementId === el.id ? 'var(--primary-accent-light)' : 'var(--bg-app)',
                        borderColor: selectedElementId === el.id ? 'var(--primary-accent)' : 'var(--border-color)',
                        color: selectedElementId === el.id ? 'var(--primary-accent)' : 'var(--text-main)',
                      }}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {el.type === 'text' && <Type size={14} className="shrink-0" style={{ color: 'var(--primary-accent)' }} />}
                        {el.type === 'button' && <Smartphone size={14} className="shrink-0" style={{ color: 'var(--success)' }} />}
                        {el.type === 'image' && <ImageIcon size={14} className="shrink-0 text-blue-500" />}
                        <span className="truncate font-semibold">{el.content}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteElement(el.id);
                        }}
                        className="p-1 hover:opacity-75"
                        style={{ color: 'var(--danger)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Text Tab */}
            {activeLeftTab === 'text' && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Agregar Texto
                </h3>
                <button
                  onClick={() => handleAddText('title')}
                  className="w-full p-3 rounded-lg border text-left transition-all hover:shadow-xs"
                  style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                >
                  <p className="font-extrabold text-base" style={{ color: 'var(--text-main)' }}>Título Principal</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Agrega un título grande</p>
                </button>
                <button
                  onClick={() => handleAddText('subtitle')}
                  className="w-full p-3 rounded-lg border text-left transition-all hover:shadow-xs"
                  style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                >
                  <p className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>Subtítulo</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Texto secundario o fecha</p>
                </button>
                <button
                  onClick={() => handleAddText('body')}
                  className="w-full p-3 rounded-lg border text-left transition-all hover:shadow-xs"
                  style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                >
                  <p className="text-xs" style={{ color: 'var(--text-main)' }}>Texto de Párrafo</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Frases, versículos o información</p>
                </button>
              </div>
            )}

            {/* Widgets Tab */}
            {activeLeftTab === 'widgets' && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Componentes Interactivos
                </h3>
                <button
                  onClick={() => handleAddWidget('rsvp', 'Confirmar Asistencia RSVP')}
                  className="w-full p-3 rounded-lg border flex items-center gap-3 text-left transition-all hover:shadow-xs"
                  style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                >
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(82,183,136,0.15)', color: 'var(--success)' }}
                  >
                    <Check size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Botón RSVP</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Confirmación de invitados</p>
                  </div>
                </button>
                <button
                  onClick={() => handleAddWidget('map', 'Ver Ubicación en Waze/Maps')}
                  className="w-full p-3 rounded-lg border flex items-center gap-3 text-left transition-all hover:shadow-xs"
                  style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                >
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}
                  >
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Botón Mapa</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Ubicación GPS interactiva</p>
                  </div>
                </button>
              </div>
            )}

            {/* Media Tab */}
            {activeLeftTab === 'media' && (
              <div className="space-y-3 text-center py-6">
                <ImageIcon size={32} className="mx-auto mb-2 opacity-50" style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Galería e Imágenes</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Sube imágenes de fondo o decorativas.</p>
              </div>
            )}
          </div>
        </aside>

        {/* Center: Canvas Stage (Escenario Móvil 9:16 adaptable al tema) */}
        <main className="flex-1 flex flex-col items-center justify-center relative p-6 overflow-auto" style={{ backgroundColor: 'var(--bg-app)' }}>
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
              onClick={() => setZoom(Math.max(25, zoom - 10))}
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
                title="Escribe un porcentaje (25-200%)"
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
          {/* Snap guides & canvas outer container */}
          <div
            className="transition-transform duration-150 relative"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            {/* Phone Frame 9:16 Stage */}
            <div
              className="w-[360px] h-[640px] rounded-[32px] shadow-2xl relative overflow-hidden border-[8px]"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: 'var(--border-color)',
              }}
              onClick={() => setSelectedElementId(null)}
            >
              {/* Top notch */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-32 rounded-b-xl z-50 flex items-center justify-center"
                style={{ backgroundColor: 'var(--border-color)' }}
              >
                <div className="h-2 w-2 rounded-full opacity-50" style={{ backgroundColor: 'var(--text-muted)' }} />
              </div>

              {/* Canvas Elements */}
              {elements.map((el) => {
                const isSelected = selectedElementId === el.id;

                return (
                  <div
                    key={el.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElementId(el.id);
                    }}
                    className={`absolute cursor-move transition-shadow select-none ${
                      isSelected ? 'outline-2 outline-dashed outline-pink-500 z-30' : ''
                    }`}
                    style={{
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${el.width}px`,
                      height: `${el.height}px`,
                      fontSize: el.fontSize ? `${el.fontSize}px` : undefined,
                      fontWeight: el.fontWeight || 'normal',
                      color: el.color || 'var(--text-main)',
                      backgroundColor: el.backgroundColor || 'transparent',
                      borderRadius: el.borderRadius ? `${el.borderRadius}px` : undefined,
                      textAlign: el.textAlign || 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {el.content}
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Right Panel: Inspector de Propiedades */}
        <aside
          className="w-72 shrink-0 border-l flex flex-col z-30"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div
            className="h-12 border-b px-4 flex items-center gap-2 text-xs font-extrabold uppercase"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
          >
            <Sliders size={16} style={{ color: 'var(--primary-accent)' }} /> Inspector de Propiedades
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!selectedElement ? (
              <div className="text-center py-12 text-xs italic" style={{ color: 'var(--text-muted)' }}>
                Selecciona un elemento en el lienzo para editar sus propiedades.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Element Content */}
                <div>
                  <label className="block font-bold mb-1 uppercase text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    Texto / Contenido
                  </label>
                  <input
                    type="text"
                    value={selectedElement.content}
                    onChange={(e) => updateSelectedElement('content', e.target.value)}
                    className="w-full rounded-lg px-3 py-2 border outline-none"
                    style={{
                      backgroundColor: 'var(--bg-app)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>

                {/* Font Size & Weight */}
                {selectedElement.type === 'text' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold mb-1 uppercase text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        Tamaño Letra
                      </label>
                      <input
                        type="number"
                        value={selectedElement.fontSize || 14}
                        onChange={(e) => updateSelectedElement('fontSize', parseInt(e.target.value, 10))}
                        className="w-full rounded-lg px-3 py-2 border outline-none"
                        style={{
                          backgroundColor: 'var(--bg-app)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-main)',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1 uppercase text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        Alineación
                      </label>
                      <select
                        value={selectedElement.textAlign || 'center'}
                        onChange={(e) => updateSelectedElement('textAlign', e.target.value)}
                        className="w-full rounded-lg px-2 py-2 border outline-none"
                        style={{
                          backgroundColor: 'var(--bg-app)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-main)',
                        }}
                      >
                        <option value="left">Izquierda</option>
                        <option value="center">Centro</option>
                        <option value="right">Derecha</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Color Pickers */}
                <div>
                  <label className="block font-bold mb-1 uppercase text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    Color de Texto
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedElement.color || '#2B2D42'}
                      onChange={(e) => updateSelectedElement('color', e.target.value)}
                      className="h-8 w-8 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono font-bold" style={{ color: 'var(--text-main)' }}>{selectedElement.color}</span>
                  </div>
                </div>

                {selectedElement.type === 'button' && (
                  <div>
                    <label className="block font-bold mb-1 uppercase text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      Color de Fondo Botón
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedElement.backgroundColor || '#E07A5F'}
                        onChange={(e) => updateSelectedElement('backgroundColor', e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="font-mono font-bold" style={{ color: 'var(--text-main)' }}>{selectedElement.backgroundColor}</span>
                    </div>
                  </div>
                )}

                {/* Animation Selector */}
                <div>
                  <label className="block font-bold mb-1 uppercase text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    Animación Jitter Motion
                  </label>
                  <select
                    value={selectedElement.animation || 'slideUp'}
                    onChange={(e) => updateSelectedElement('animation', e.target.value)}
                    className="w-full rounded-lg px-3 py-2 border outline-none"
                    style={{
                      backgroundColor: 'var(--bg-app)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)',
                    }}
                  >
                    <option value="fade">Fade In (Aparecer)</option>
                    <option value="slideUp">Slide Up (Deslizar Arriba)</option>
                    <option value="zoomIn">Zoom In (Escalar)</option>
                    <option value="bounce">Bounce (Rebote)</option>
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
          Lienzo Móvil <strong style={{ color: 'var(--primary-accent)' }}>360px × 640px</strong>
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
    </div>
  );
}
