import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  CalendarDays,
  MapPin,
  Users,
  X,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Mail,
  Shield,
  Smartphone,
  ChevronUp,
  ChevronDown,
  EyeOff,
  Building2,
  Settings,
} from 'lucide-react';
import api from '../../lib/api';
import type { Event } from '../../types';
import AppSelect from '../../components/AppSelect';
import AppDatePicker from '../../components/AppDatePicker';
import AppTimePicker from '../../components/AppTimePicker';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Marker SVG interactivo personalizado con la paleta de colores del proyecto (Coral #E07A5F y Oro #F2CC8F)
const projectMarkerSvg = `
  <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#E07A5F" />
        <stop offset="100%" stop-color="#F2CC8F" />
      </linearGradient>
      <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#212121" flood-opacity="0.35"/>
      </filter>
    </defs>
    <path d="M16 0C7.16344 0 0 7.16344 0 16C0 27.2 16 42 16 42C16 42 32 27.2 32 16C32 7.16344 24.8366 0 16 0Z" fill="url(#pinGradient)" filter="url(#pinShadow)"/>
    <circle cx="16" cy="15" r="7" fill="#FFFFFF"/>
    <circle cx="16" cy="15" r="4" fill="#E07A5F"/>
  </svg>
`;

const projectIcon = L.divIcon({
  className: 'custom-project-pin',
  html: projectMarkerSvg,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
});

L.Marker.prototype.options.icon = projectIcon;

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'Boda',
  quince: '15 Años',
  birthday: 'Cumpleaños',
  corporate: 'Corporativo',
  other: 'Otro',
};

const EVENT_TYPES = [
  { value: 'wedding', label: 'Boda' },
  { value: 'quince', label: '15 Años' },
  { value: 'birthday', label: 'Cumpleaños' },
  { value: 'corporate', label: 'Corporativo' },
  { value: 'other', label: 'Otro' },
];

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
};

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Super Admin',
  event_planner: 'Event Planner',
  protocol: 'Protocolo',
  host: 'Anfitrión',
};

const SERVICE_ICONS: Record<string, any> = {
  INVITACION: Mail,
  PROTOCOLO: Shield,
  TOTEM: Smartphone,
};

import { usePartner } from '../../context/PartnerContext';

export default function EventList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedPartner: globalSelectedPartner } = usePartner();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPartner, setFilterPartner] = useState('');
  const [partnersList, setPartnersList] = useState<any[]>([]);
  
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('wedding');
  const [formPartner, setFormPartner] = useState<string | number>('');
  const [showFormPartnerDropdown, setShowFormPartnerDropdown] = useState(false);
  const formPartnerRef = useRef<HTMLDivElement>(null);
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('18:00');
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formServices, setFormServices] = useState<string[]>([]);
  const [formLogo, setFormLogo] = useState<File | null>(null);
  const [formBackground, setFormBackground] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState('active');
  const [formItinerary, setFormItinerary] = useState<any[]>([]);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});

  const [mapCenter, setMapCenter] = useState<[number, number]>([10.4806, -66.9036]); // Default to Caracas or any center
  const [userTypedLocation, setUserTypedLocation] = useState(false);

  function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
      click(e) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  // Component to recenter map and set close-up zoom when modal opens or location changes
  function RecenterMap({ center, zoom = 18 }: { center: [number, number]; zoom?: number }) {
    const map = useMap();
    useEffect(() => {
      map.setView(center, zoom);
      // Ensure map renders correctly after modal transition
      setTimeout(() => map.invalidateSize(), 0);
    }, [center, zoom, map]);
    return null;
  }

  const handleMapClick = async (lat: number, lng: number) => {
    setMapCenter([lat, lng]);
    if (!userTypedLocation) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        if (data && data.display_name) {
          setFormLocation(data.display_name);
        }
      } catch (err) {
        console.error("Geocoding error", err);
      }
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          handleMapClick(lat, lng);
        },
        (error) => {
          console.error("Error obtaining location", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const fetchEvents = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (filterType) params.append('event_type', filterType);
    if (filterStatus) params.append('status', filterStatus);

    api
      .get(`/events?${params.toString()}`)
      .then((res) => setEvents(res.data.data || res.data))
      .catch(() => setError('Error al cargar eventos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
    api.get('/partners').then((res) => {
      setPartnersList(res.data.data || res.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (formPartnerRef.current && !formPartnerRef.current.contains(e.target as Node)) {
        setShowFormPartnerDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Function to calculate global event date range text from itinerary
  const computeEventDateRange = (itinerary: any[]) => {
    if (!itinerary || itinerary.length === 0) {
      return '';
    }

    // Helper to parse date + 12h time to timestamp for sorting
    const parseToTimestamp = (dateStr: string, timeStr: string) => {
      if (!dateStr) return 0;
      let timePart = '00:00:00';
      if (timeStr && timeStr.includes(':')) {
        const parts = timeStr.trim().split(' ');
        const [hStr, mStr] = parts[0].split(':');
        let h = parseInt(hStr, 10) || 0;
        const m = mStr || '00';
        if (parts[1]) {
          const p = parts[1].toUpperCase();
          if (p === 'PM' && h < 12) h += 12;
          if (p === 'AM' && h === 12) h = 0;
        }
        timePart = `${String(h).padStart(2, '0')}:${m}:00`;
      }
      return new Date(`${dateStr}T${timePart}`).getTime();
    };

    const validItems = itinerary.filter((i) => i.date);
    if (validItems.length === 0) return '';

    // Sort to find start (lowest) and end (highest)
    const itemsWithStart = [...validItems].sort((a, b) => 
      parseToTimestamp(a.date, a.start_time) - parseToTimestamp(b.date, b.start_time)
    );

    const itemsWithEnd = [...validItems].sort((a, b) => 
      parseToTimestamp(a.date, a.end_time || a.start_time) - parseToTimestamp(b.date, b.end_time || b.start_time)
    );

    const earliest = itemsWithStart[0];
    const latest = itemsWithEnd[itemsWithEnd.length - 1];

    // Helper to format Spanish Date (e.g. "Sábado 10 de Octubre")
    const formatSpanishDateLong = (dStr: string) => {
      if (!dStr) return '';
      const [y, m, d] = dStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      
      const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
      const monthName = dateObj.toLocaleDateString('es-ES', { month: 'long' });
      
      const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      
      return `${capitalizedDay} ${d} de ${capitalizedMonth}`;
    };

    // Helper for strictly 12h AM/PM time strings
    const formatTo12HourString = (tStr: string) => {
      if (!tStr) return '';
      let str = tStr.trim();
      let period = '';
      if (str.toUpperCase().includes('AM')) period = 'am';
      if (str.toUpperCase().includes('PM')) period = 'pm';

      const parts = str.split(' ')[0].split(':');
      let h = parseInt(parts[0], 10);
      const m = parts[1] || '00';

      if (isNaN(h)) return tStr;

      if (!period) {
        // 24h format conversion to 12h AM/PM
        period = h >= 12 ? 'pm' : 'am';
        h = h % 12 || 12;
      } else {
        h = h % 12 || 12;
      }

      return `${h}:${m}${period}`;
    };

    const startTimeFormatted = formatTo12HourString(earliest.start_time || '6:00 PM');
    const endTimeFormatted = formatTo12HourString(latest.end_time || '10:00 PM');

    // Case 1: Misma fecha para el primer y ultimo momento
    if (earliest.date === latest.date) {
      const dateText = formatSpanishDateLong(earliest.date);
      return `${dateText} de ${startTimeFormatted} a ${endTimeFormatted}`;
    }

    // Case 2: Fechas distintas (ej: Sábado 10 de Octubre 6:00pm - Domingo 11 de Octubre 2:00am)
    const startDateText = formatSpanishDateLong(earliest.date);
    const endDateText = formatSpanishDateLong(latest.date);
    return `${startDateText} ${startTimeFormatted} a ${endDateText} ${endTimeFormatted}`;
  };

  const openCreateModal = () => {
    setEditId(null);
    setFormName('');
    setFormType('wedding');
    setFormPartner(activePartnerFilter || '');
    setFormDate('');
    setFormTime('18:00');
    setFormLocation('');
    setFormDescription('');
    setFormServices([]);
    setFormItinerary([]);
    setOpenAccordions({});
    setFormLogo(null);
    setFormBackground(null);
    setLogoPreview(null);
    setBackgroundPreview(null);
    setFormStatus('active');
    setMapCenter([10.4806, -66.9036]);
    setUserTypedLocation(false);
    setShowModal(true);
  };

  const openEditModal = async (ev: Event) => {
    setEditId(ev.id);
    setFormName(ev.name || '');
    setFormType(ev.event_type || 'wedding');
    setFormPartner(ev.partner_id || '');
    setFormDate(ev.event_date ? ev.event_date.slice(0, 10) : '');
    setFormTime(ev.event_date ? ev.event_date.slice(11, 16) : '18:00');
    setFormLocation(ev.location || '');
    setFormDescription(ev.description || '');
    setFormServices(ev.services || []);
    const parsedItinerary = Array.isArray(ev.itinerary) ? ev.itinerary : [];
    setFormItinerary(parsedItinerary);
    const initialAcc: Record<string, boolean> = {};
    parsedItinerary.forEach((item: any, idx: number) => {
      initialAcc[item.id || String(idx)] = true;
    });
    setOpenAccordions(initialAcc);
    setFormLogo(null);
    setFormBackground(null);
    setLogoPreview(ev.logo ? `/storage/${ev.logo}` : null);
    setBackgroundPreview(ev.background ? `/storage/${ev.background}` : null);
    setFormStatus(ev.status || 'active');
    
    if (ev.location) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ev.location)}`);
        const data = await res.json();
        if (data && data.length > 0) {
          setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          setMapCenter([10.4806, -66.9036]);
        }
      } catch (err) {
        console.error("Geocoding error", err);
        setMapCenter([10.4806, -66.9036]);
      }
    } else {
      setMapCenter([10.4806, -66.9036]);
    }

    setUserTypedLocation(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    // Si no hay formDate manual, obtener la fecha de inicio más temprana del itinerario
    let effectiveDate = formDate;
    let effectiveTime = formTime || '18:00';

    if (formItinerary && formItinerary.length > 0) {
      const validItems = formItinerary.filter((i) => i.date);
      if (validItems.length > 0) {
        // Ordenar por timestamp de fecha + hora de inicio
        const sorted = [...validItems].sort((a, b) => {
          const tA = new Date(`${a.date}T${a.start_time || '00:00'}`).getTime();
          const tB = new Date(`${b.date}T${b.start_time || '00:00'}`).getTime();
          return tA - tB;
        });
        effectiveDate = sorted[0].date;
      }
    }

    if (!formName.trim() || !formType || !effectiveDate) return;
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', formName.trim());
      payload.append('event_type', formType);
      const effectivePartner = activePartnerFilter || formPartner;
      if (effectivePartner && String(effectivePartner) !== 'all') {
        payload.append('partner_id', String(effectivePartner));
      } else {
        payload.append('partner_id', '');
      }
      payload.append('event_date', `${effectiveDate} ${effectiveTime}:00`);
      payload.append('location', formLocation.trim());
      payload.append('description', formDescription.trim());
      payload.append('services', JSON.stringify(formServices));
      payload.append('itinerary', JSON.stringify(formItinerary));
      payload.append('status', formStatus);
      if (formLogo) payload.append('logo', formLogo);
      if (formBackground) payload.append('background', formBackground);

      if (editId) {
        payload.append('_method', 'PUT');
        const res = await api.post(`/events/${editId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const updated = res.data.data || res.data;
        setEvents((prev) => prev.map((e) => (e.id === editId ? updated : e)));
      } else {
        const res = await api.post('/events', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const created = res.data.data || res.data;
        setEvents((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch (err: any) {
      console.error("Error al guardar evento:", err?.response?.data || err);
      setError(editId ? `Error al actualizar evento: ${err?.response?.data?.message || err?.message || ''}` : 'Error al crear evento');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/events/${deleteId}`);
      setEvents((prev) => prev.filter((e) => e.id !== deleteId));
    } catch {
      setError('Error al eliminar el evento');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  // Active partner comes from global header dropdown or local page dropdown filter
  const activePartnerFilter = (globalSelectedPartner && globalSelectedPartner !== 'all') 
    ? String(globalSelectedPartner) 
    : filterPartner;

  const filtered = events.filter((e) => {
    const q = search.toLowerCase();
    if (q && !e.name.toLowerCase().includes(q)) return false;
    if (filterType && e.event_type !== filterType) return false;
    if (filterStatus && e.status !== filterStatus) return false;
    if (activePartnerFilter && String(e.partner_id) !== String(activePartnerFilter)) return false;
    return true;
  });

  const totalEvents = events.length;
  const activeEvents = events.filter((e) => e.status === 'active').length;
  const completedEvents = events.filter((e) => e.status === 'completed').length;

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg" style={{ backgroundColor: 'var(--bg-card)' }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="font-medium" style={{ color: 'var(--danger)' }}>{error}</p>
          <button
            onClick={fetchEvents}
            className="mt-3 text-sm hover:underline"
            style={{ color: 'var(--primary-accent)' }}
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div
        className="flex flex-col gap-4 rounded-none -mx-4 -mt-2 px-3 py-1.5 sm:flex-row sm:items-center sm:justify-between md:-mx-6 md:-mt-4 lg:-mx-8 lg:-mt-6"
        style={{
          borderLeft: '3px solid var(--primary-accent)',
          backgroundColor: 'var(--primary-accent-light)',
        }}
      >
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
          Gestión de Eventos
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <select
            value={filterPartner}
            onChange={(e) => setFilterPartner(e.target.value)}
            className="rounded-lg px-3 py-2.5 text-sm outline-none transition-colors w-full sm:w-auto"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
            }}
          >
            <option value="">Todos los partners</option>
            {partnersList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.business_name || p.name}
              </option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg px-3 py-2.5 text-sm outline-none transition-colors w-full sm:w-auto"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
            }}
          >
            <option value="">Todos los tipos</option>
            {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg px-3 py-2.5 text-sm outline-none transition-colors w-full sm:w-auto"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
            }}
          >
            <option value="">Estados</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}>
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Eventos</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>{totalEvents}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(82,183,136,0.15)', color: 'var(--success)' }}>
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Eventos Activos</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>{activeEvents}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(230,57,70,0.15)', color: 'var(--danger)' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Finalizados</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>{completedEvents}</p>
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CalendarDays size={64} className="mb-4 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>
            {events.length === 0 ? 'No tienes eventos aún' : 'No hay resultados'}
          </h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {events.length === 0 ? 'Crea tu primer evento para empezar' : 'Intenta ajustar la búsqueda'}
          </p>
          {events.length === 0 && (
            <button
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--primary-accent)' }}
            >
              <Plus size={18} />
              Agregar Evento
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={openCreateModal}
            className="flex min-h-[120px] flex-col items-center justify-center gap-3 p-4 transition-opacity hover:opacity-80"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderTop: '2px solid var(--primary-accent)',
              borderBottom: '2px solid var(--primary-accent)',
              borderLeft: '1px dashed var(--border-color)',
              borderRight: '1px dashed var(--border-color)',
            }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: 'var(--primary-accent)' }}
            >
              <Plus size={22} />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--primary-accent)' }}>
              Agregar Evento
            </span>
          </button>
          {filtered.map((ev) => (
            <div
              key={ev.id}
              onClick={() => navigate(`/events/${ev.id}/config`)}
              className="flex flex-col overflow-hidden cursor-pointer transition-all hover:shadow-md"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderTop: '2px solid var(--primary-accent)',
                borderBottom: '2px solid var(--primary-accent)',
                borderLeft: '1px solid var(--border-color)',
                borderRight: '1px solid var(--border-color)',
              }}
            >
              <div className="flex items-start justify-between pl-4">
                <span className="mt-2 text-xs font-semibold uppercase" style={{ color: 'var(--primary-accent)' }}>
                  {EVENT_TYPE_LABELS[ev.event_type] || ev.event_type}
                </span>
                <span
                  className="rounded-bl-lg px-3 py-1 text-xs font-semibold text-white"
                  style={{
                    backgroundColor:
                      ev.status === 'active' ? 'var(--success)' :
                      ev.status === 'completed' ? 'var(--primary-accent)' :
                      ev.status === 'cancelled' ? 'var(--danger)' : 'var(--text-muted)'
                  }}
                >
                  {STATUS_LABELS[ev.status] ? STATUS_LABELS[ev.status].toUpperCase() : ev.status.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-4 px-4 py-2">
                {/* Logo or avatar */}
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                  style={{ border: '1px solid var(--border-color)' }}
                >
                  {ev.logo ? (
                    <img src={`/storage/${ev.logo}`} alt="logo" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{
                      ev.name ? ev.name.split(' ').map(w => w[0]).join('').toUpperCase() : ''
                    }</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {/* Line 1: Nombre del Evento */}
                  <h3 className="truncate font-semibold text-base" style={{ color: 'var(--text-main)' }}>
                    {ev.name}
                  </h3>
                  {/* Line 2: Fecha del Evento */}
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    <CalendarDays size={13} className="shrink-0" style={{ color: 'var(--primary-accent)' }} />
                    <span className="truncate">
                      {computeEventDateRange(ev.itinerary || []) || formatDate(ev.event_date)}
                    </span>
                  </div>
                  {/* Line 3: Cantidad de Invitados */}
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    <Users size={13} className="shrink-0" style={{ color: 'var(--primary-accent)' }} />
                    <span className="truncate">
                      {ev.guest_count ?? 0} invitados
                    </span>
                  </div>
                  {/* Line 4: Partner (solo si el selector de partner está en 'Todos los partners' -> activePartnerFilter === '') */}
                  {activePartnerFilter === '' && (
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--primary-accent)' }}>
                      <Building2 size={13} className="shrink-0" />
                      <span className="truncate">
                        {ev.partner?.business_name || 'Sin partner asignado'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-auto flex items-end justify-between" onClick={(e) => e.stopPropagation()}>
                {/* Ordered service icons */}
                <div className="flex gap-2 pl-4 pb-2" style={{ color: 'var(--primary-accent)', opacity: 0.8 }}>
                  {['INVITACION', 'PROTOCOLO', 'TOTEM'].map(srv => {
                    const Icon = SERVICE_ICONS[srv];
                    const isActive = ev.services?.includes(srv);
                    const color = isActive ? 'var(--primary-accent)' : 'var(--border-color)';
                    return Icon ? (
                      <Icon key={srv} size={15} title={srv} color={color} />
                    ) : null;
                  })}
                </div>
                <div className="flex items-center justify-end gap-1">
                  <div
                    className="flex items-center rounded-t-lg px-1.5 py-0.5 text-white"
                    style={{ backgroundColor: 'var(--primary-accent)' }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/events/${ev.id}/config`);
                      }}
                      className="flex h-5 w-5 items-center justify-center rounded-full text-white transition-opacity hover:opacity-70"
                      title="Configuración"
                    >
                      <Settings size={11} />
                    </button>
                  </div>
                  
                  <div
                    className="flex items-center rounded-tl-lg px-1.5 py-0.5 text-white"
                    style={{ backgroundColor: 'var(--primary-accent)' }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(ev);
                      }}
                      className="flex h-5 w-5 items-center justify-center rounded-full text-white transition-opacity hover:opacity-70"
                      title="Editar"
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(ev.id);
                      }}
                      className="flex h-5 w-5 items-center justify-center rounded-full text-white transition-opacity hover:opacity-70"
                      title="Eliminar"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div
            className="w-full max-w-6xl max-h-[92vh] flex flex-col rounded-md shadow-lg my-auto overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderTop: '2px solid var(--primary-accent)',
              borderBottom: '2px solid var(--primary-accent)',
            }}
          >
            <div className="pt-3" />
            <div
              className="mb-1 flex items-center justify-between rounded-t-md px-3 py-1.5 shrink-0 mx-5"
              style={{
                borderLeft: '3px solid var(--primary-accent)',
                backgroundColor: 'var(--primary-accent-light)',
              }}
            >
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>
                {editId ? 'Editar Evento' : 'Nuevo Evento'}
              </h3>
              <div className="flex items-center gap-3">
                <label
                  className="flex cursor-pointer items-center gap-2 text-sm font-medium select-none"
                  style={{ color: 'var(--text-main)' }}
                >
                  <input
                    type="checkbox"
                    checked={formStatus === 'active'}
                    onChange={(e) => setFormStatus(e.target.checked ? 'active' : 'draft')}
                    className="h-4 w-4 rounded"
                    style={{ accentColor: 'var(--primary-accent)' }}
                  />
                  Activo
                </label>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-1.5 transition-colors hover:opacity-70"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-5 flex-1 min-h-0 flex flex-col sm:flex-row gap-6 items-start overflow-visible">
              {/* Left Column (Dicta y define el alto total del formulario) */}
              <div id="modal-left-column" className="sm:w-2/7 shrink-0 space-y-4 pr-1 relative z-20">
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                    Nombre del Evento
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej: Boda de María y Juan"
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                    Tipo de Evento
                  </label>
                  <AppSelect
                    value={formType}
                    onChange={setFormType}
                    options={EVENT_TYPES}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                    Fecha del Evento
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={computeEventDateRange(formItinerary) || (formDate ? `${formDate.split('-').reverse().join('/')} ${formTime || ''}` : '') || 'Se calcula al agregar itinerario'}
                    placeholder="Agrega momentos en el itinerario"
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none cursor-default"
                    style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                    Descripción
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full resize-none rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  />
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                      Logo del Evento
                    </label>
                    <label className="relative flex flex-col items-center justify-center w-full h-20 rounded-lg cursor-pointer overflow-hidden transition-colors hover:opacity-80" style={{ backgroundColor: 'var(--bg-app)', border: '1px dashed var(--border-color)' }}>
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="object-contain w-full h-full p-1" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span className="font-medium">Subir imagen</span>
                        </div>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormLogo(file);
                            setLogoPreview(URL.createObjectURL(file));
                          } else {
                            setFormLogo(null);
                            setLogoPreview(null);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                      Fondo del Evento
                    </label>
                    <label className="relative flex flex-col items-center justify-center w-full h-20 rounded-lg cursor-pointer overflow-hidden transition-colors hover:opacity-80" style={{ backgroundColor: 'var(--bg-app)', border: '1px dashed var(--border-color)' }}>
                      {backgroundPreview ? (
                        <img src={backgroundPreview} alt="Fondo" className="object-cover w-full h-full" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span className="font-medium">Subir imagen</span>
                        </div>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormBackground(file);
                            setBackgroundPreview(URL.createObjectURL(file));
                          } else {
                            setFormBackground(null);
                            setBackgroundPreview(null);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {activePartnerFilter === '' && (
                  <div>
                    <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                      Partner
                    </label>
                    <div className="relative" ref={formPartnerRef}>
                      {(() => {
                        const selectedPartnerObj = partnersList.find((p) => String(p.id) === String(formPartner));
                        return (
                          <>
                            <button
                              type="button"
                              onClick={() => setShowFormPartnerDropdown(!showFormPartnerDropdown)}
                              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                              style={{
                                backgroundColor: 'var(--bg-app)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-main)',
                              }}
                            >
                              {selectedPartnerObj ? (
                                <div className="flex items-center gap-2 min-w-0">
                                  {selectedPartnerObj.logo_url ? (
                                    <img
                                      src={selectedPartnerObj.logo_url}
                                      alt="logo"
                                      className="h-6 w-6 rounded object-cover shrink-0"
                                    />
                                  ) : (
                                    <div
                                      className="flex h-6 w-6 items-center justify-center rounded shrink-0"
                                      style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}
                                    >
                                      <Building2 size={14} />
                                    </div>
                                  )}
                                  <div className="flex flex-col items-start text-left min-w-0">
                                    <span className="text-sm font-medium leading-tight truncate">
                                      {selectedPartnerObj.business_name || selectedPartnerObj.name}
                                    </span>
                                    {selectedPartnerObj.user?.name && (
                                      <span className="text-[11px] leading-tight opacity-70 truncate" style={{ color: 'var(--text-muted)' }}>
                                        {selectedPartnerObj.user.name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Building2 size={16} style={{ color: 'var(--primary-accent)' }} />
                                  <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                                    Todos los partners
                                  </span>
                                </div>
                              )}
                              <ChevronDown size={16} className="ml-1 opacity-70 shrink-0" />
                            </button>

                            {showFormPartnerDropdown && (
                              <div
                                className="absolute left-0 bottom-full mb-1 w-full rounded-xl shadow-2xl py-1 z-50 max-h-60 overflow-y-auto"
                                style={{
                                  backgroundColor: 'var(--bg-card)',
                                  border: '1px solid var(--border-color)',
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormPartner('');
                                    setShowFormPartnerDropdown(false);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                >
                                  <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                                    <Building2 size={16} style={{ color: 'var(--primary-accent)' }} />
                                  </div>
                                  <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                                    Todos los partners
                                  </span>
                                </button>
                                {partnersList.map((p) => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                      setFormPartner(p.id);
                                      setShowFormPartnerDropdown(false);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                    style={{ borderTop: '1px solid var(--border-color)' }}
                                  >
                                    {p.logo_url ? (
                                      <img
                                        src={p.logo_url}
                                        alt="logo"
                                        className="h-7 w-7 rounded object-cover shrink-0"
                                      />
                                    ) : (
                                      <div
                                        className="flex h-7 w-7 items-center justify-center rounded shrink-0"
                                        style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}
                                      >
                                        <Building2 size={14} />
                                      </div>
                                    )}
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-sm font-medium truncate" style={{ color: 'var(--text-main)' }}>
                                        {p.business_name || p.name}
                                      </span>
                                      {p.user?.name && (
                                        <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                                          {p.user.name}
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column Container: tiene position relative y se ajusta a la altura exacta de la izquierda */}
              <div className="sm:w-5/7 flex-1 min-w-0 self-stretch relative">
                <div className="absolute inset-0 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3 shrink-0">
                    <label className="text-sm font-medium shrink-0" style={{ color: 'var(--text-main)' }}>
                      Servicios
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {['INVITACION', 'PROTOCOLO', 'TOTEM'].map((srv) => {
                        const Icon = SERVICE_ICONS[srv];
                        return (
                        <button
                          key={srv}
                          type="button"
                          onClick={() => {
                            setFormServices((prev) => 
                              prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
                            )
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors"
                          style={{
                            backgroundColor: formServices.includes(srv) ? 'var(--primary-accent)' : 'var(--bg-app)',
                            border: `1px solid ${formServices.includes(srv) ? 'var(--primary-accent)' : 'var(--border-color)'}`,
                            color: formServices.includes(srv) ? 'white' : 'var(--text-main)'
                          }}
                        >
                          {Icon && <Icon size={12} />}
                          {srv}
                        </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ITINERARIO Y LUGARES DE EVENTO (CON SCROLL INTERNO SI SUPERA LA ALTURA) */}
                  <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
                    <div className="flex items-center justify-between pb-1 shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <div>
                        <h4 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                          <MapPin size={16} style={{ color: 'var(--primary-accent)' }} /> Itinerario y Lugares
                        </h4>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          Agrega los momentos del evento con su dirección y mapa GPS.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newItemId = String(Date.now());
                          const newItem = {
                            id: newItemId,
                            name: '',
                            date: formDate || '',
                            start_time: '18:00',
                            end_time: '22:00',
                            location_name: '',
                            address: '',
                            latitude: null,
                            longitude: null,
                          };
                          setFormItinerary((prev) => [...prev, newItem]);
                          setOpenAccordions((prev) => ({ ...prev, [newItemId]: true }));
                        }}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90 shadow-sm"
                        style={{ backgroundColor: 'var(--primary-accent)' }}
                      >
                        <Plus size={14} />
                        ADD
                      </button>
                    </div>

                    {formItinerary.length === 0 ? (
                      <div className="text-center py-10 flex-1 flex flex-col items-center justify-center rounded-lg" style={{ border: '1px dashed var(--border-color)', backgroundColor: 'var(--bg-app)' }}>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No hay momentos creados en el itinerario.</p>
                        <button
                          type="button"
                          onClick={() => {
                            const newItemId = String(Date.now());
                            const newItem = {
                              id: newItemId,
                              name: '',
                              date: formDate || '',
                              start_time: '18:00',
                              end_time: '22:00',
                              location_name: '',
                              address: '',
                              latitude: null,
                              longitude: null,
                            };
                            setFormItinerary((prev) => [...prev, newItem]);
                            setOpenAccordions((prev) => ({ ...prev, [newItemId]: true }));
                          }}
                          className="mt-2 text-xs font-medium hover:underline"
                          style={{ color: 'var(--primary-accent)' }}
                        >
                          + Agregar primer momento
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
                      {formItinerary.map((item, index) => {
                        const isOpen = openAccordions[item.id] ?? true;
                        return (
                          <div
                            key={item.id || index}
                            className="rounded-lg overflow-hidden transition-all"
                            style={{
                              backgroundColor: 'var(--bg-app)',
                              border: '1px solid var(--border-color)',
                            }}
                          >
                            {/* HEADER ACORDEÓN */}
                            <div
                              onClick={() => setOpenAccordions((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                              className="flex items-center justify-between px-3 py-2 cursor-pointer transition-colors"
                              style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}
                            >
                              <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                                <span className="flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold text-white shrink-0" style={{ backgroundColor: 'var(--primary-accent)' }}>
                                  {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  {/* Título (Nombre del Lugar) más grande */}
                                  <h5 className="text-sm font-bold truncate" style={{ color: 'var(--text-main)' }}>
                                    {item.name || `Lugar #${index + 1}`}
                                  </h5>

                                  {/* Segunda fila: Fecha larga en español a la izquierda | Establecimiento a la derecha */}
                                  {(() => {
                                    const formatItemDateLong = (dStr: string) => {
                                      if (!dStr) return 'Sin fecha';
                                      const [y, m, d] = dStr.split('-').map(Number);
                                      const dateObj = new Date(y, m - 1, d);
                                      const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
                                      const monthName = dateObj.toLocaleDateString('es-ES', { month: 'long' });
                                      const capDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
                                      const capMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                                      return `${capDay} ${d} de ${capMonth} de ${y}`;
                                    };

                                    const format12Hour = (tStr: string) => {
                                      if (!tStr) return '';
                                      let str = tStr.trim();
                                      let period = '';
                                      if (str.toUpperCase().includes('AM')) period = 'am';
                                      if (str.toUpperCase().includes('PM')) period = 'pm';

                                      const parts = str.split(' ')[0].split(':');
                                      let h = parseInt(parts[0], 10);
                                      const m = parts[1] || '00';

                                      if (isNaN(h)) return tStr;

                                      if (!period) {
                                        period = h >= 12 ? 'pm' : 'am';
                                        h = h % 12 || 12;
                                      } else {
                                        h = h % 12 || 12;
                                      }

                                      return `${h}:${m}${period}`;
                                    };

                                    const startT = format12Hour(item.start_time);
                                    const endT = format12Hour(item.end_time);

                                    let timeString = '';
                                    if (startT && endT) {
                                      timeString = ` de ${startT} a ${endT}`;
                                    } else if (startT) {
                                      timeString = ` a las ${startT}`;
                                    }

                                    return (
                                      <div className="flex items-center justify-between gap-2 text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                        <span className="truncate font-medium">
                                          {formatItemDateLong(item.date)}{timeString}
                                        </span>
                                        {item.location_name && (
                                          <span className="truncate text-right font-semibold shrink-0" style={{ color: 'var(--primary-accent)' }}>
                                            {item.location_name}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {/* Botones Subir / Bajar para reordenar */}
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (index === 0) return;
                                    setFormItinerary((prev) => {
                                      const next = [...prev];
                                      const temp = next[index - 1];
                                      next[index - 1] = next[index];
                                      next[index] = temp;
                                      return next;
                                    });
                                  }}
                                  className="p-1 rounded transition-colors hover:opacity-70 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                                  style={{ color: 'var(--text-main)' }}
                                  title="Subir posición"
                                >
                                  <ChevronUp size={15} />
                                </button>
                                <button
                                  type="button"
                                  disabled={index === formItinerary.length - 1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (index === formItinerary.length - 1) return;
                                    setFormItinerary((prev) => {
                                      const next = [...prev];
                                      const temp = next[index + 1];
                                      next[index + 1] = next[index];
                                      next[index] = temp;
                                      return next;
                                    });
                                  }}
                                  className="p-1 rounded transition-colors hover:opacity-70 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                                  style={{ color: 'var(--text-main)' }}
                                  title="Bajar posición"
                                >
                                  <ChevronDown size={15} />
                                </button>

                                {/* Botón Ojo de Visibilidad */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFormItinerary((prev) =>
                                      prev.map((i) => (i.id === item.id ? { ...i, is_visible: i.is_visible === false ? true : false } : i))
                                    );
                                  }}
                                  className="p-1 rounded transition-colors hover:opacity-70"
                                  style={{ color: item.is_visible === false ? 'var(--text-muted)' : 'var(--primary-accent)' }}
                                  title={item.is_visible === false ? 'Oculto (Click para mostrar)' : 'Visible (Click para ocultar)'}
                                >
                                  {item.is_visible === false ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>

                                {/* Botón Eliminar / Papelera */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFormItinerary((prev) => prev.filter((i) => i.id !== item.id));
                                  }}
                                  className="p-1 rounded hover:opacity-70 ml-1"
                                  style={{ color: 'var(--danger)' }}
                                  title="Eliminar lugar del itinerario"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                            {/* BODY ACORDEÓN */}
                            {isOpen && (
                              <div className="p-3 grid gap-4 sm:grid-cols-7">
                                {/* Left Sub-column 3/7: Form Fields */}
                                <div className="sm:col-span-3 space-y-3">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="mb-0.5 block text-[10px] font-medium" style={{ color: 'var(--text-main)' }}>Lugar</label>
                                      <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setFormItinerary((prev) => prev.map((i) => (i.id === item.id ? { ...i, name: val } : i)));
                                        }}
                                        placeholder="Ej: Iglesia / Recepción"
                                        className="w-full rounded-lg px-2.5 py-1.5 text-xs outline-none"
                                        style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                                      />
                                    </div>
                                    <div>
                                      <label className="mb-0.5 block text-[10px] font-medium" style={{ color: 'var(--text-main)' }}>Establecimiento</label>
                                      <input
                                        type="text"
                                        value={item.location_name}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setFormItinerary((prev) => prev.map((i) => (i.id === item.id ? { ...i, location_name: val } : i)));
                                        }}
                                        placeholder="Ej: Parroquia San José"
                                        className="w-full rounded-lg px-2.5 py-1.5 text-xs outline-none"
                                        style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="mb-0.5 block text-[10px] font-medium" style={{ color: 'var(--text-main)' }}>Fecha</label>
                                    <AppDatePicker
                                      value={item.date}
                                      onChange={(val) => {
                                        setFormItinerary((prev) => prev.map((i) => (i.id === item.id ? { ...i, date: val } : i)));
                                      }}
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    {/* HORA INICIO 12H AM/PM */}
                                    <div>
                                      <label className="mb-0.5 block text-[10px] font-medium" style={{ color: 'var(--text-main)' }}>Hora Inicio (12h)</label>
                                      <AppTimePicker
                                        value={item.start_time || '06:00 PM'}
                                        onChange={(val) => {
                                          setFormItinerary((prev) => prev.map((i) => (i.id === item.id ? { ...i, start_time: val } : i)));
                                        }}
                                      />
                                    </div>

                                    {/* HORA FIN 12H AM/PM */}
                                    <div>
                                      <label className="mb-0.5 block text-[10px] font-medium" style={{ color: 'var(--text-main)' }}>Hora Fin (12h)</label>
                                      <AppTimePicker
                                        value={item.end_time || '10:00 PM'}
                                        onChange={(val) => {
                                          setFormItinerary((prev) => prev.map((i) => (i.id === item.id ? { ...i, end_time: val } : i)));
                                        }}
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="mb-0.5 block text-[10px] font-medium" style={{ color: 'var(--text-main)' }}>Dirección Escrita</label>
                                    <textarea
                                      rows={3}
                                      value={item.address}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setFormItinerary((prev) => prev.map((i) => (i.id === item.id ? { ...i, address: val } : i)));
                                      }}
                                      placeholder="Av. Principal #123"
                                      className="w-full resize-none rounded-lg px-2.5 py-1.5 text-xs outline-none"
                                      style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                                    />
                                  </div>
                                </div>

                                {/* Right Sub-column 4/7: Map with GPS location button */}
                                <div className="sm:col-span-4 flex flex-col">
                                  <div className="mb-1 flex items-center justify-between">
                                    <label className="text-[11px] font-semibold flex items-center gap-1" style={{ color: 'var(--text-main)' }}>
                                      <MapPin size={12} style={{ color: 'var(--primary-accent)' }} /> Ubicación GPS en Mapa
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (navigator.geolocation) {
                                          navigator.geolocation.getCurrentPosition(
                                            async (position) => {
                                              const lat = position.coords.latitude;
                                              const lng = position.coords.longitude;
                                              
                                              // Actualizar estado del item con coordenadas
                                              setFormItinerary((prev) =>
                                                prev.map((i) => (i.id === item.id ? { ...i, latitude: lat, longitude: lng } : i))
                                              );

                                              // Reverse geocoding opcional para autocompletar la direccion
                                              try {
                                                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                                                const data = await res.json();
                                                if (data && data.display_name) {
                                                  setFormItinerary((prev) =>
                                                    prev.map((i) => (i.id === item.id && !i.address ? { ...i, address: data.display_name } : i))
                                                  );
                                                }
                                              } catch (e) {
                                                console.error("Error geocoding", e);
                                              }
                                            },
                                            (err) => {
                                              console.error("Error obteniendo ubicación actual", err);
                                            }
                                          );
                                        }
                                      }}
                                      className="flex h-6 w-6 items-center justify-center rounded transition-all hover:opacity-80"
                                      style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)', border: '1px solid var(--primary-accent)' }}
                                      title="Obtener ubicación actual GPS"
                                    >
                                      <Navigation size={13} />
                                    </button>
                                  </div>
                                  <div className="flex-1 min-h-[220px] w-full rounded overflow-hidden relative" style={{ border: '1px solid var(--border-color)' }}>
                                    <MapContainer
                                      center={item.latitude && item.longitude ? [item.latitude, item.longitude] : [10.4806, -66.9036]}
                                      zoom={item.latitude && item.longitude ? 18 : 14}
                                      style={{ height: '100%', width: '100%' }}
                                    >
                                      <TileLayer
                                        attribution='&copy; OpenStreetMap'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        className="project-map-tiles"
                                      />
                                      <RecenterMap center={item.latitude && item.longitude ? [item.latitude, item.longitude] : [10.4806, -66.9036]} zoom={item.latitude && item.longitude ? 18 : 14} />
                                      <MapClickHandler
                                        onMapClick={(lat, lng) => {
                                          setFormItinerary((prev) =>
                                            prev.map((i) => (i.id === item.id ? { ...i, latitude: lat, longitude: lng } : i))
                                          );
                                        }}
                                      />
                                      {item.latitude && item.longitude && (
                                        <Marker position={[item.latitude, item.longitude]} />
                                      )}
                                    </MapContainer>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

            <div className="flex justify-end gap-3 px-5 py-3" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-70 disabled:opacity-50"
                style={{ border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formName.trim() || !formType || !formDate}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary-accent)' }}
              >
                {saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear Evento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl p-6 shadow-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(230,57,70,0.15)', color: 'var(--danger)' }}>
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--text-main)' }}>
                  Eliminar Evento
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  ¿Estás seguro? Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
                style={{ border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--danger)' }}
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
