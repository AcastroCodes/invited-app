import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import api from '../../lib/api';
import type { Event } from '../../types';
import AppSelect from '../../components/AppSelect';

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

export default function EventList() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('wedding');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('18:00');
  const [formLocation, setFormLocation] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formThemeColor, setFormThemeColor] = useState('#22c55e');
  const [formStatus, setFormStatus] = useState('active');

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
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchEvents(), 300);
    return () => clearTimeout(timer);
  }, [search, filterType, filterStatus]);

  const openCreateModal = () => {
    setEditId(null);
    setFormName('');
    setFormType('wedding');
    setFormDate('');
    setFormTime('18:00');
    setFormLocation('');
    setFormDescription('');
    setFormThemeColor('#22c55e');
    setFormStatus('active');
    setShowModal(true);
  };

  const openEditModal = (ev: Event) => {
    setEditId(ev.id);
    setFormName(ev.name || '');
    setFormType(ev.event_type || 'wedding');
    setFormDate(ev.event_date ? ev.event_date.slice(0, 10) : '');
    setFormTime(ev.event_date ? ev.event_date.slice(11, 16) : '18:00');
    setFormLocation(ev.location || '');
    setFormDescription(ev.description || '');
    setFormThemeColor(ev.theme_color || '#22c55e');
    setFormStatus(ev.status || 'active');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formType || !formDate) return;
    setSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        event_type: formType,
        event_date: `${formDate} ${formTime || '18:00'}:00`,
        location: formLocation.trim(),
        description: formDescription.trim(),
        theme_color: formThemeColor,
        status: formStatus,
      };

      if (editId) {
        const res = await api.put(`/events/${editId}`, payload);
        const updated = res.data.data || res.data;
        setEvents((prev) => prev.map((e) => (e.id === editId ? updated : e)));
      } else {
        const res = await api.post('/events', payload);
        const created = res.data.data || res.data;
        setEvents((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch {
      setError(editId ? 'Error al actualizar evento' : 'Error al crear evento');
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

  const filtered = events.filter((e) => {
    const q = search.toLowerCase();
    if (q && !e.name.toLowerCase().includes(q)) return false;
    if (filterType && e.event_type !== filterType) return false;
    if (filterStatus && e.status !== filterStatus) return false;
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
              className="flex flex-col overflow-hidden"
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
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg text-lg font-bold text-white"
                  style={{ border: '1px solid var(--border-color)', backgroundColor: ev.theme_color || 'var(--primary-accent)' }}
                >
                  <CalendarDays size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold" style={{ color: 'var(--text-main)' }}>
                    {ev.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <MapPin size={13} />
                    <span className="truncate">{ev.location || 'Sin ubicación'}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1">
                      <CalendarDays size={13} />
                      {formatDate(ev.event_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={13} />
                      {ev.guest_count ?? 0} invit.
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex items-end justify-end">
                <div
                  className="flex items-center gap-0.5 rounded-tl-lg p-0.5 text-white"
                  style={{ backgroundColor: 'var(--primary-accent)' }}
                >
                  <button
                    onClick={() => navigate(`/events/${ev.id}`)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-opacity hover:opacity-70"
                    title="Ver"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => openEditModal(ev)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-opacity hover:opacity-70"
                    title="Editar"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteId(ev.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-opacity hover:opacity-70"
                    title="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div
            className="w-full max-w-lg rounded-md shadow-lg my-8"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderTop: '2px solid var(--primary-accent)',
              borderBottom: '2px solid var(--primary-accent)',
            }}
          >
            <div className="pt-3" />
            <div
              className="mb-3 flex items-center justify-between rounded-t-md px-3 py-1.5"
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

            <div className="space-y-4 p-5">
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                    Hora
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                  Lugar / Dirección
                </label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="Ej: Salón Paraíso"
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full resize-none rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                  Color Temático
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formThemeColor}
                    onChange={(e) => setFormThemeColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg p-1"
                    style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)' }}
                  />
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {formThemeColor}
                  </span>
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
