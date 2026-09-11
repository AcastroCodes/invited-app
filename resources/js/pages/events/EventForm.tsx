import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Plus, Trash2, ChevronDown, ChevronUp, MapPin, Calendar, Clock } from 'lucide-react';
import api from '../../lib/api';
import AppSelect from '../../components/AppSelect';
import type { Event, ItineraryItem } from '../../types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';

const customPinSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
  <defs>
    <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E07A5F" />
      <stop offset="100%" stop-color="#F2CC8F" />
    </linearGradient>
    <filter id="shadow" x="-30%" y="-20%" width="160%" height="150%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>
  <path d="M12 0 C5.37 0 0 5.37 0 12 C0 21 12 36 12 36 C12 36 24 21 24 12 C24 5.37 18.63 0 12 0 Z" fill="url(#pinGrad)" stroke="#FFFFFF" stroke-width="1.5" filter="url(#shadow)"/>
  <circle cx="12" cy="11" r="4" fill="#3D405B"/>
</svg>`;

const createCustomIcon = () => {
  return new L.DivIcon({
    className: 'custom-leaflet-marker-pin',
    html: `<div style="width: 24px; height: 36px; display: flex; align-items: flex-end; justify-content: center;">${customPinSvg}</div>`,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
};

function MapController({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (coords && coords[0] !== null && coords[1] !== null && !initialized) {
      map.setView(coords, 16, { animate: false });
      setInitialized(true);
    }
  }, [coords, map, initialized]);
  return null;
}

function MapEvents({ setCoordinates }: { setCoordinates: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      setCoordinates(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function LocationMapPicker({
  latitude,
  longitude,
  onLocationChange,
}: {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-semibold text-text dark:text-text-dark flex items-center gap-1">
        <MapPin size={14} className="text-primary-500" /> Ubicación GPS en el mapa
      </label>
      <div className="h-56 w-full rounded-lg overflow-hidden border border-border dark:border-border-dark z-0 relative">
        <MapContainer
          center={latitude && longitude ? [latitude, longitude] : [10.4806, -66.9036]}
          zoom={latitude && longitude ? 16 : 5}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="grayscale sepia saturate-200 hue-rotate-[320deg] dark:invert dark:grayscale dark:sepia dark:saturate-200 dark:hue-rotate-[320deg] dark:brightness-90"
          />
          <MapController coords={latitude && longitude ? [latitude, longitude] : null} />
          <MapEvents setCoordinates={onLocationChange} />
          {latitude && longitude && (
            <Marker
              position={[latitude, longitude]}
              icon={createCustomIcon()}
              draggable={true}
              eventHandlers={{
                dragend(e) {
                  const marker = e.target;
                  const pos = marker.getLatLng();
                  onLocationChange(pos.lat, pos.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>
      {latitude && longitude ? (
        <div className="flex items-center justify-between text-[11px] text-text-secondary dark:text-text-dark-secondary px-1">
          <span>GPS Seleccionado:</span>
          <span className="font-mono bg-surface-secondary dark:bg-surface-dark-secondary px-1.5 py-0.5 rounded border border-border dark:border-border-dark text-text dark:text-text-dark">
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </span>
        </div>
      ) : (
        <p className="text-[11px] text-amber-600 dark:text-amber-400 px-1">
          Haz clic en el mapa para marcar el GPS exacto.
        </p>
      )}
    </div>
  );
}

const EVENT_TYPES = [
  { value: 'wedding', label: 'Boda' },
  { value: 'quince', label: '15 Años' },
  { value: 'birthday', label: 'Cumpleaños' },
  { value: 'corporate', label: 'Corporativo' },
  { value: 'other', label: 'Otro' },
];

interface FormData {
  name: string;
  event_type: string;
  event_date: string;
  event_time: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  theme_color: string;
  itinerary: ItineraryItem[];
}

interface FormErrors {
  name?: string;
  event_type?: string;
  event_date?: string;
}

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormData>({
    name: '',
    event_type: 'wedding',
    event_date: '',
    event_time: '18:00',
    location: '',
    latitude: null,
    longitude: null,
    description: '',
    theme_color: '#22c55e',
    itinerary: [],
  });
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(isEdit);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/events/${id}`)
      .then((res) => {
        const ev: Event = res.data.data || res.data;
        const datePart = ev.event_date ? ev.event_date.slice(0, 10) : '';
        const parsedItinerary = Array.isArray(ev.itinerary) ? ev.itinerary : [];
        setForm({
          name: ev.name || '',
          event_type: ev.event_type || 'wedding',
          event_date: datePart,
          event_time: ev.event_date ? ev.event_date.slice(11, 16) : '18:00',
          location: ev.location || '',
          latitude: ev.latitude ?? null,
          longitude: ev.longitude ?? null,
          description: ev.description || '',
          theme_color: ev.theme_color || '#22c55e',
          itinerary: parsedItinerary,
        });

        const initialAccordions: Record<string, boolean> = {};
        parsedItinerary.forEach((item, idx) => {
          initialAccordions[item.id || String(idx)] = true;
        });
        setOpenAccordions(initialAccordions);
      })
      .catch(() => setFetchError('Error al cargar el evento'))
      .finally(() => setLoadingEvent(false));
  }, [id, isEdit]);

  const toggleAccordion = (itemId: string) => {
    setOpenAccordions((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const addItineraryItem = () => {
    const newItemId = String(Date.now());
    const newItem: ItineraryItem = {
      id: newItemId,
      name: '',
      date: form.event_date || '',
      start_time: '18:00',
      end_time: '22:00',
      location_name: '',
      address: '',
      latitude: null,
      longitude: null,
    };
    setForm((prev) => ({ ...prev, itinerary: [...prev.itinerary, newItem] }));
    setOpenAccordions((prev) => ({ ...prev, [newItemId]: true }));
  };

  const removeItineraryItem = (itemId: string) => {
    setForm((prev) => ({
      ...prev,
      itinerary: prev.itinerary.filter((item) => item.id !== itemId),
    }));
  };

  const updateItineraryItem = (itemId: string, field: keyof ItineraryItem, value: any) => {
    setForm((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'El nombre del evento es obligatorio';
    if (!form.event_type) errs.event_type = 'Selecciona un tipo de evento';
    if (!form.event_date) errs.event_date = 'Selecciona una fecha';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        event_type: form.event_type,
        event_date: `${form.event_date} ${form.event_time || '18:00'}:00`,
        location: form.location.trim(),
        latitude: form.latitude,
        longitude: form.longitude,
        itinerary: form.itinerary,
        description: form.description.trim(),
        theme_color: form.theme_color,
      };

      if (isEdit) {
        await api.put(`/events/${id}`, payload);
      } else {
        await api.post('/events', payload);
      }
      navigate('/events');
    } catch {
      setErrors({ name: 'Error al guardar el evento. Intenta de nuevo.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEvent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500 font-medium">{fetchError}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={() => navigate('/events')}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-text-secondary dark:text-text-dark-secondary hover:text-text dark:hover:text-text-dark transition-colors"
      >
        <ArrowLeft size={16} />
        Volver a eventos
      </button>

      <h1 className="text-2xl font-bold text-text dark:text-text-dark mb-6">
        {isEdit ? 'Editar Evento' : 'Nuevo Evento'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-6 space-y-5">
          <h2 className="text-lg font-semibold text-text dark:text-text-dark pb-2 border-b border-border dark:border-border-dark">
            Información General
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-text dark:text-text-dark">
                Nombre del Evento
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej: Boda de María y Juan"
                className={`w-full rounded-lg border bg-surface dark:bg-surface-dark px-3.5 py-2.5 text-sm text-text dark:text-text-dark placeholder:text-text-secondary outline-none transition-colors ${
                  errors.name
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-border dark:border-border-dark focus:border-primary-500'
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="event_type" className="mb-1.5 block text-sm font-medium text-text dark:text-text-dark">
                Tipo de Evento
              </label>
              <AppSelect
                value={form.event_type}
                onChange={(v) => handleChange({ target: { name: 'event_type', value: v } } as any)}
                options={EVENT_TYPES}
              />
              {errors.event_type && <p className="mt-1 text-xs text-red-500">{errors.event_type}</p>}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="event_date" className="mb-1.5 block text-sm font-medium text-text dark:text-text-dark">
                Fecha Principal
              </label>
              <input
                id="event_date"
                name="event_date"
                type="date"
                value={form.event_date}
                onChange={handleChange}
                className={`w-full rounded-lg border bg-surface dark:bg-surface-dark px-3.5 py-2.5 text-sm text-text dark:text-text-dark outline-none transition-colors ${
                  errors.event_date ? 'border-red-500' : 'border-border dark:border-border-dark focus:border-primary-500'
                }`}
              />
              {errors.event_date && <p className="mt-1 text-xs text-red-500">{errors.event_date}</p>}
            </div>

            <div>
              <label htmlFor="event_time" className="mb-1.5 block text-sm font-medium text-text dark:text-text-dark">
                Hora Principal
              </label>
              <input
                id="event_time"
                name="event_time"
                type="time"
                value={form.event_time}
                onChange={handleChange}
                className="w-full rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3.5 py-2.5 text-sm text-text dark:text-text-dark outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-text dark:text-text-dark">
              Descripción del Evento
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe los detalles principales del evento..."
              className="w-full resize-none rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3.5 py-2.5 text-sm text-text dark:text-text-dark placeholder:text-text-secondary outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="theme_color" className="mb-1.5 block text-sm font-medium text-text dark:text-text-dark">
              Color Temático
            </label>
            <div className="flex items-center gap-3">
              <input
                id="theme_color"
                name="theme_color"
                type="color"
                value={form.theme_color}
                onChange={handleChange}
                className="h-10 w-14 cursor-pointer rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-1"
              />
              <span className="text-sm font-mono text-text-secondary dark:text-text-dark-secondary">
                {form.theme_color}
              </span>
            </div>
          </div>
        </div>

        {/* SECCIÓN ITINERARIO Y LUGARES DE EVENTO */}
        <div className="rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-6 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-border dark:border-border-dark">
            <div>
              <h2 className="text-lg font-semibold text-text dark:text-text-dark flex items-center gap-2">
                <MapPin className="text-primary-500" size={20} /> Itinerario y Lugares del Evento
              </h2>
              <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                Agrega los lugares del evento (Ceremonia, Recepción, Fiesta, etc.) con sus fechas, horarios y ubicación GPS.
              </p>
            </div>
            <button
              type="button"
              onClick={addItineraryItem}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-2 text-xs font-medium text-white hover:bg-primary-600 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Agregar Lugar
            </button>
          </div>

          {form.itinerary.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-border dark:border-border-dark rounded-xl bg-surface-secondary/40 dark:bg-surface-dark-secondary/40">
              <MapPin className="mx-auto text-text-secondary dark:text-text-dark-secondary mb-2" size={32} />
              <p className="text-sm font-medium text-text dark:text-text-dark">No hay lugares añadidos al itinerario</p>
              <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-1 mb-4">
                Haz clic en "Agregar Lugar" para estructurar las distintas ubicaciones de tu evento.
              </p>
              <button
                type="button"
                onClick={addItineraryItem}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary-500 text-primary-500 px-3 py-1.5 text-xs font-medium hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
              >
                <Plus size={14} />
                Agregar Primer Lugar
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {form.itinerary.map((item, index) => {
                const isOpen = openAccordions[item.id] ?? true;
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border dark:border-border-dark bg-surface-secondary/30 dark:bg-surface-dark-secondary/30 overflow-hidden transition-all shadow-sm"
                  >
                    {/* ACCORDION HEADER */}
                    <div
                      onClick={() => toggleAccordion(item.id)}
                      className="flex items-center justify-between px-4 py-3 cursor-pointer bg-surface dark:bg-surface-dark hover:bg-surface-secondary/60 dark:hover:bg-surface-dark-secondary/60 transition-colors border-b border-border dark:border-border-dark"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-bold text-xs">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="text-sm font-semibold text-text dark:text-text-dark">
                            {item.name || `Lugar #${index + 1}`}
                          </h3>
                          <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                            {item.location_name ? item.location_name : 'Sin nombre de local'}
                            {item.start_time && ` • ${item.start_time}`}
                            {item.end_time && ` a ${item.end_time}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItineraryItem(item.id);
                          }}
                          className="p-1.5 text-text-secondary hover:text-red-500 dark:text-text-dark-secondary dark:hover:text-red-400 transition-colors rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                        <span className="text-text-secondary dark:text-text-dark-secondary">
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </span>
                      </div>
                    </div>

                    {/* ACCORDION BODY */}
                    {isOpen && (
                      <div className="p-4 grid gap-5 md:grid-cols-2 border-t border-border/50 dark:border-border-dark/50">
                        {/* COLUMNA IZQUIERDA: DATOS DE DIRECCIÓN Y TIEMPOS */}
                        <div className="space-y-3.5">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-text dark:text-text-dark">
                              Nombre del Momento / Lugar
                            </label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateItineraryItem(item.id, 'name', e.target.value)}
                              placeholder="Ej: Iglesia / Ceremonia Religiosa, Recepción, Salón de Fiestas"
                              className="w-full rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3 py-2 text-xs text-text dark:text-text-dark outline-none focus:border-primary-500"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-semibold text-text dark:text-text-dark">
                              Lugar / Nombre del Establecimiento
                            </label>
                            <input
                              type="text"
                              value={item.location_name}
                              onChange={(e) => updateItineraryItem(item.id, 'location_name', e.target.value)}
                              placeholder="Ej: Parroquia San José / Hotel Eurobuilding"
                              className="w-full rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3 py-2 text-xs text-text dark:text-text-dark outline-none focus:border-primary-500"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="mb-1 block text-xs font-semibold text-text dark:text-text-dark flex items-center gap-1">
                                <Calendar size={12} /> Fecha
                              </label>
                              <input
                                type="date"
                                value={item.date}
                                onChange={(e) => updateItineraryItem(item.id, 'date', e.target.value)}
                                className="w-full rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-2 py-1.5 text-xs text-text dark:text-text-dark outline-none focus:border-primary-500"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-semibold text-text dark:text-text-dark flex items-center gap-1">
                                <Clock size={12} /> Inicio
                              </label>
                              <input
                                type="time"
                                value={item.start_time}
                                onChange={(e) => updateItineraryItem(item.id, 'start_time', e.target.value)}
                                className="w-full rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-2 py-1.5 text-xs text-text dark:text-text-dark outline-none focus:border-primary-500"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-semibold text-text dark:text-text-dark flex items-center gap-1">
                                <Clock size={12} /> Fin
                              </label>
                              <input
                                type="time"
                                value={item.end_time}
                                onChange={(e) => updateItineraryItem(item.id, 'end_time', e.target.value)}
                                className="w-full rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-2 py-1.5 text-xs text-text dark:text-text-dark outline-none focus:border-primary-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-semibold text-text dark:text-text-dark">
                              Dirección Escrita Detallada
                            </label>
                            <textarea
                              rows={2}
                              value={item.address}
                              onChange={(e) => updateItineraryItem(item.id, 'address', e.target.value)}
                              placeholder="Ej: Av. Principal #123, Frente al Parque Central..."
                              className="w-full resize-none rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3 py-2 text-xs text-text dark:text-text-dark outline-none focus:border-primary-500"
                            />
                          </div>
                        </div>

                        {/* COLUMNA DERECHA: MAPA SELECCIONADOR DE GPS */}
                        <div>
                          <LocationMapPicker
                            latitude={item.latitude}
                            longitude={item.longitude}
                            onLocationChange={(lat, lng) => {
                              updateItineraryItem(item.id, 'latitude', lat);
                              updateItineraryItem(item.id, 'longitude', lng);
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="rounded-md border border-border dark:border-border-dark px-4 py-2 text-sm font-medium text-text dark:text-text-dark hover:bg-surface-secondary transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors disabled:opacity-60 shadow-md"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isEdit ? 'Guardar Cambios' : 'Crear Evento'}
          </button>
        </div>
      </form>
    </div>
  );
}

