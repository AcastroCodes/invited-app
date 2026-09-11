import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Type,
  Image as ImageIcon,
  Sparkles,
  Music,
  MapPin,
  Calendar,
  Clock,
  Layers,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Move,
  Check,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Palette,
  Volume2,
  Smartphone,
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

  // Studio UI states
  const [activeLeftTab, setActiveLeftTab] = useState<'layers' | 'text' | 'media' | 'widgets' | 'audio'>('layers');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineTime, setTimelineTime] = useState(0);

  // Initial Elements State
  const [elements, setElements] = useState<CanvasElement[]>([
    {
      id: 'el-title-1',
      type: 'text',
      content: '¡Nos Casamos!',
      x: 40,
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
      x: 30,
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
      x: 60,
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

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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
      .finally(() => setLoading(false));
  }, [eventId, invitationId]);

  const handleSave = async () => {
    if (!invitationId) return;
    setSaving(true);
    try {
      await api.put(`/invitations/${invitationId}`, {
        content: { elements },
      });
      setSavedSuccess(true);
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
      x: 50,
      y: 200 + elements.length * 20,
      width: 280,
      height: 40,
      fontSize: type === 'title' ? 24 : type === 'subtitle' ? 16 : 13,
      fontWeight: type === 'title' ? 'bold' : 'normal',
      color: '#2B2D42',
      textAlign: 'center',
    };
    setElements([...elements, newEl]);
    setSelectedElementId(newEl.id);
  };

  const handleAddWidget = (widgetType: string, label: string) => {
    const newEl: CanvasElement = {
      id: `el-widget-${Date.now()}`,
      type: 'button',
      content: label,
      x: 50,
      y: 350,
      width: 280,
      height: 45,
      fontSize: 14,
      fontWeight: 'bold',
      color: '#FFFFFF',
      backgroundColor: '#E07A5F',
      borderRadius: 10,
      textAlign: 'center',
    };
    setElements([...elements, newEl]);
    setSelectedElementId(newEl.id);
  };

  const handleDeleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  const updateSelectedElement = (key: keyof CanvasElement, val: any) => {
    if (!selectedElementId) return;
    setElements(
      elements.map((el) => (el.id === selectedElementId ? { ...el, [key]: val } : el))
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-950 text-gray-100 select-none">
      {/* 1. Header Studio Bar (Estilo Jitter Studio) */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-800 bg-gray-900 px-4 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/events/${eventId}/config`)}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={16} /> Volver a Configuración
          </button>
          <div className="h-4 w-[1px] bg-gray-700" />
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            <h1 className="text-sm font-extrabold tracking-wide text-white">
              Diseñador 3D Studio <span className="text-gray-400 font-normal">| {invitation?.title || 'Invitación'}</span>
            </h1>
          </div>
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center gap-2 rounded-lg bg-gray-950 px-2 py-1 border border-gray-800 text-xs">
          <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1 hover:text-white text-gray-400">
            <ZoomOut size={14} />
          </button>
          <span className="w-12 text-center font-mono text-gray-300">{zoom}%</span>
          <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-1 hover:text-white text-gray-400">
            <ZoomIn size={14} />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Check size={14} /> Guardado
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-extrabold text-white transition-opacity hover:opacity-90 shadow-md"
            style={{ backgroundColor: 'var(--primary-accent)' }}
          >
            <Save size={15} /> {saving ? 'Guardando...' : 'Guardar Diseño'}
          </button>
        </div>
      </header>

      {/* 2. Main Studio Workspace */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Panel: Tools & Layers (Capas y Elementos) */}
        <aside className="w-72 shrink-0 border-r border-gray-800 bg-gray-900 flex flex-col z-30">
          {/* Tool Tabs */}
          <div className="grid grid-cols-4 border-b border-gray-800 bg-gray-950 text-xs font-bold text-gray-400">
            <button
              onClick={() => setActiveLeftTab('layers')}
              className={`p-3 flex flex-col items-center gap-1 border-b-2 transition-colors ${
                activeLeftTab === 'layers' ? 'border-primary text-white bg-gray-900' : 'border-transparent hover:text-gray-200'
              }`}
              style={{ borderColor: activeLeftTab === 'layers' ? 'var(--primary-accent)' : undefined }}
            >
              <Layers size={16} /> Capas
            </button>
            <button
              onClick={() => setActiveLeftTab('text')}
              className={`p-3 flex flex-col items-center gap-1 border-b-2 transition-colors ${
                activeLeftTab === 'text' ? 'border-primary text-white bg-gray-900' : 'border-transparent hover:text-gray-200'
              }`}
              style={{ borderColor: activeLeftTab === 'text' ? 'var(--primary-accent)' : undefined }}
            >
              <Type size={16} /> Texto
            </button>
            <button
              onClick={() => setActiveLeftTab('widgets')}
              className={`p-3 flex flex-col items-center gap-1 border-b-2 transition-colors ${
                activeLeftTab === 'widgets' ? 'border-primary text-white bg-gray-900' : 'border-transparent hover:text-gray-200'
              }`}
              style={{ borderColor: activeLeftTab === 'widgets' ? 'var(--primary-accent)' : undefined }}
            >
              <Smartphone size={16} /> Widgets
            </button>
            <button
              onClick={() => setActiveLeftTab('media')}
              className={`p-3 flex flex-col items-center gap-1 border-b-2 transition-colors ${
                activeLeftTab === 'media' ? 'border-primary text-white bg-gray-900' : 'border-transparent hover:text-gray-200'
              }`}
              style={{ borderColor: activeLeftTab === 'media' ? 'var(--primary-accent)' : undefined }}
            >
              <ImageIcon size={16} /> Media
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Layers Tab */}
            {activeLeftTab === 'layers' && (
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Capas en Escena</h3>
                {elements.length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-4 text-center">No hay elementos agregados</p>
                ) : (
                  elements.map((el) => (
                    <div
                      key={el.id}
                      onClick={() => setSelectedElementId(el.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        selectedElementId === el.id
                          ? 'border-primary bg-primary/10 text-white font-bold'
                          : 'border-gray-800 bg-gray-950/50 text-gray-300 hover:bg-gray-800'
                      }`}
                      style={selectedElementId === el.id ? { borderColor: 'var(--primary-accent)' } : undefined}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {el.type === 'text' && <Type size={14} className="text-amber-400 shrink-0" />}
                        {el.type === 'button' && <Smartphone size={14} className="text-emerald-400 shrink-0" />}
                        {el.type === 'image' && <ImageIcon size={14} className="text-blue-400 shrink-0" />}
                        <span className="truncate">{el.content}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteElement(el.id);
                        }}
                        className="text-gray-500 hover:text-red-400 p-1"
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
                <h3 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Agregar Texto</h3>
                <button
                  onClick={() => handleAddText('title')}
                  className="w-full p-3 rounded-lg border border-gray-800 bg-gray-950 text-left hover:border-gray-700 transition-colors"
                >
                  <p className="font-extrabold text-base text-white">Título Principal</p>
                  <p className="text-[10px] text-gray-500">Agrega un título grande</p>
                </button>
                <button
                  onClick={() => handleAddText('subtitle')}
                  className="w-full p-3 rounded-lg border border-gray-800 bg-gray-950 text-left hover:border-gray-700 transition-colors"
                >
                  <p className="font-bold text-sm text-gray-200">Subtítulo</p>
                  <p className="text-[10px] text-gray-500">Texto secundario o fecha</p>
                </button>
                <button
                  onClick={() => handleAddText('body')}
                  className="w-full p-3 rounded-lg border border-gray-800 bg-gray-950 text-left hover:border-gray-700 transition-colors"
                >
                  <p className="text-xs text-gray-300">Texto de Párrafo</p>
                  <p className="text-[10px] text-gray-500">Frases, versículos o información</p>
                </button>
              </div>
            )}

            {/* Widgets Tab */}
            {activeLeftTab === 'widgets' && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Componentes Interactivos</h3>
                <button
                  onClick={() => handleAddWidget('rsvp', 'Confirmar Asistencia RSVP')}
                  className="w-full p-3 rounded-lg border border-gray-800 bg-gray-950 flex items-center gap-3 hover:border-gray-700 transition-colors text-left"
                >
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Botón RSVP</p>
                    <p className="text-[10px] text-gray-500">Confirmación de invitados</p>
                  </div>
                </button>
                <button
                  onClick={() => handleAddWidget('map', 'Ver Ubicación en Waze/Maps')}
                  className="w-full p-3 rounded-lg border border-gray-800 bg-gray-950 flex items-center gap-3 hover:border-gray-700 transition-colors text-left"
                >
                  <div className="h-8 w-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Botón Mapa</p>
                    <p className="text-[10px] text-gray-500">Ubicación GPS interactiva</p>
                  </div>
                </button>
              </div>
            )}

            {/* Media Tab */}
            {activeLeftTab === 'media' && (
              <div className="space-y-3 text-center py-6">
                <ImageIcon size={32} className="mx-auto text-gray-600 mb-2" />
                <p className="text-xs text-gray-400 font-bold">Galería e Imágenes</p>
                <p className="text-[11px] text-gray-500">Sube imágenes de fondo o decorativas.</p>
              </div>
            )}
          </div>
        </aside>

        {/* Center: Canvas Stage (Escenario Móvil 9:16) */}
        <main className="flex-1 bg-gray-950 flex flex-col items-center justify-center relative p-6 overflow-auto">
          {/* Snap guides & canvas outer container */}
          <div
            className="transition-transform duration-150 relative"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            {/* Phone Frame 9:16 Stage */}
            <div
              className="w-[360px] h-[640px] bg-white rounded-[32px] shadow-2xl relative overflow-hidden border-[8px] border-gray-900"
              onClick={() => setSelectedElementId(null)}
            >
              {/* Top notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-32 bg-gray-900 rounded-b-xl z-50 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-gray-800" />
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
                      color: el.color || '#2B2D42',
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
        <aside className="w-72 shrink-0 border-l border-gray-800 bg-gray-900 flex flex-col z-30">
          <div className="h-12 border-b border-gray-800 px-4 flex items-center gap-2 text-xs font-extrabold uppercase text-gray-300">
            <Sliders size={16} style={{ color: 'var(--primary-accent)' }} /> Inspector de Propiedades
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!selectedElement ? (
              <div className="text-center py-12 text-gray-500 text-xs italic">
                Selecciona un elemento en el lienzo para editar sus propiedades.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Element Content */}
                <div>
                  <label className="block font-bold text-gray-400 mb-1 uppercase text-[10px]">Texto / Contenido</label>
                  <input
                    type="text"
                    value={selectedElement.content}
                    onChange={(e) => updateSelectedElement('content', e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* Font Size & Weight */}
                {selectedElement.type === 'text' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-gray-400 mb-1 uppercase text-[10px]">Tamaño Letra</label>
                      <input
                        type="number"
                        value={selectedElement.fontSize || 14}
                        onChange={(e) => updateSelectedElement('fontSize', parseInt(e.target.value, 10))}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-400 mb-1 uppercase text-[10px]">Alineación</label>
                      <select
                        value={selectedElement.textAlign || 'center'}
                        onChange={(e) => updateSelectedElement('textAlign', e.target.value)}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2 py-2 text-white"
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
                  <label className="block font-bold text-gray-400 mb-1 uppercase text-[10px]">Color de Texto</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedElement.color || '#000000'}
                      onChange={(e) => updateSelectedElement('color', e.target.value)}
                      className="h-8 w-8 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-gray-300">{selectedElement.color}</span>
                  </div>
                </div>

                {selectedElement.type === 'button' && (
                  <div>
                    <label className="block font-bold text-gray-400 mb-1 uppercase text-[10px]">Color de Fondo Botón</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedElement.backgroundColor || '#E07A5F'}
                        onChange={(e) => updateSelectedElement('backgroundColor', e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="font-mono text-gray-300">{selectedElement.backgroundColor}</span>
                    </div>
                  </div>
                )}

                {/* Animation Selector */}
                <div>
                  <label className="block font-bold text-gray-400 mb-1 uppercase text-[10px]">Animación Jitter Motion</label>
                  <select
                    value={selectedElement.animation || 'slideUp'}
                    onChange={(e) => updateSelectedElement('animation', e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white"
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

      {/* 3. Bottom Timeline Motion Bar (Línea de tiempo de animación Jitter) */}
      <footer className="h-12 border-t border-gray-800 bg-gray-900 px-6 flex items-center justify-between text-xs shrink-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-white"
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <span className="font-mono font-bold text-gray-400">00:00 / 00:05</span>
        </div>

        <div className="flex-1 max-w-xl mx-8 flex items-center gap-3">
          <span className="text-[10px] uppercase font-bold text-gray-500">Timeline</span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={timelineTime}
            onChange={(e) => setTimelineTime(parseFloat(e.target.value))}
            className="w-full accent-pink-500 cursor-pointer"
          />
        </div>

        <div className="text-[11px] text-gray-400 font-medium">
          Lienzo Móvil <strong className="text-white">360px × 640px</strong>
        </div>
      </footer>
    </div>
  );
}
