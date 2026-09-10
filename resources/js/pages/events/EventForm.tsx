import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import AppSelect from '../../components/AppSelect';
import type { Event } from '../../types';

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
  description: string;
  theme_color: string;
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
    description: '',
    theme_color: '#22c55e',
  });
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
        const datePart = ev.event_date
          ? ev.event_date.slice(0, 10)
          : '';
        setForm({
          name: ev.name || '',
          event_type: ev.event_type || 'wedding',
          event_date: datePart,
          event_time: ev.event_date
            ? ev.event_date.slice(11, 16)
            : '18:00',
          location: ev.location || '',
          description: ev.description || '',
          theme_color: ev.theme_color || '#22c55e',
        });
      })
      .catch(() => setFetchError('Error al cargar el evento'))
      .finally(() => setLoadingEvent(false));
  }, [id, isEdit]);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'El nombre del evento es obligatorio';
    if (!form.event_type) errs.event_type = 'Selecciona un tipo de evento';
    if (!form.event_date) errs.event_date = 'Selecciona una fecha';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
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
    <div className="mx-auto max-w-2xl">
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5 space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-text dark:text-text-dark"
            >
              Nombre del Evento
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Ej: Boda de María y Juan"
              className={`w-full rounded-lg border bg-surface dark:bg-surface-dark px-3.5 py-2.5 text-sm text-text dark:text-text-dark placeholder:text-text-secondary dark:placeholder:text-text-dark-secondary outline-none transition-colors focus:ring-1 ${
                errors.name
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-border dark:border-border-dark focus:border-primary-500 focus:ring-primary-500'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="event_type"
              className="mb-1.5 block text-sm font-medium text-text dark:text-text-dark"
            >
              Tipo de Evento
            </label>
            <AppSelect
              value={form.event_type}
              onChange={(v) => handleChange({ target: { name: 'event_type', value: v } } as any)}
              options={EVENT_TYPES}
            />
            {errors.event_type && (
              <p className="mt-1 text-xs text-red-500">{errors.event_type}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="event_date"
                className="mb-1.5 block text-sm font-medium text-text dark:text-text-dark"
              >
                Fecha del Evento
              </label>
              <input
                id="event_date"
                name="event_date"
                type="date"
                value={form.event_date}
                onChange={handleChange}
                className={`w-full rounded-lg border bg-surface dark:bg-surface-dark px-3.5 py-2.5 text-sm text-text dark:text-text-dark outline-none transition-colors focus:ring-1 ${
                  errors.event_date
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-border dark:border-border-dark focus:border-primary-500 focus:ring-primary-500'
                }`}
              />
              {errors.event_date && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.event_date}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="event_time"
                className="mb-1.5 block text-sm font-medium text-text dark:text-text-dark"
              >
                Hora
              </label>
              <input
                id="event_time"
                name="event_time"
                type="time"
                value={form.event_time}
                onChange={handleChange}
                className="w-full rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3.5 py-2.5 text-sm text-text dark:text-text-dark outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="location"
              className="mb-1.5 block text-sm font-medium text-text dark:text-text-dark"
            >
              Lugar / Dirección
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={form.location}
              onChange={handleChange}
              placeholder="Ej: Salón de Eventos Paraíso, Av. Principal #123"
              className="w-full rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3.5 py-2.5 text-sm text-text dark:text-text-dark placeholder:text-text-secondary dark:placeholder:text-text-dark-secondary outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-medium text-text dark:text-text-dark"
            >
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe los detalles del evento..."
              className="w-full resize-none rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-3.5 py-2.5 text-sm text-text dark:text-text-dark placeholder:text-text-secondary dark:placeholder:text-text-dark-secondary outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label
              htmlFor="theme_color"
              className="mb-1.5 block text-sm font-medium text-text dark:text-text-dark"
            >
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
              <span className="text-sm text-text-secondary dark:text-text-dark-secondary">
                {form.theme_color}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="rounded-md border border-border dark:border-border-dark px-3 py-1.5 text-sm font-medium text-text dark:text-text-dark hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-md bg-primary-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-600 transition-colors disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isEdit ? 'Guardar Cambios' : 'Crear Evento'}
          </button>
        </div>
      </form>
    </div>
  );
}
