import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Type,
  FileText,
  Users,
  UserCheck,
  UserX,
  UserMinus,
  Edit,
  UserPlus,
  UtensilsCrossed,
  Table2,
  Share2,
  Check,
  Copy,
  ExternalLink,
  Palette,
} from 'lucide-react';
import api from '../../lib/api';
import type { Event } from '../../types';

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'Boda',
  quince: '15 Años',
  birthday: 'Cumpleaños',
  corporate: 'Corporativo',
  other: 'Otro',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
};

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  active:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  completed:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

interface EventDetailData extends Event {
  guests?: Array<{
    id: number;
    name: string;
    rsvp_status: string;
    created_at: string;
  }>;
  invitation_url?: string;
}

const TABS = [
  { key: '', label: 'Resumen' },
  { key: 'guests', label: 'Invitados' },
  { key: 'menu', label: 'Menú' },
  { key: 'tables', label: 'Mesas' },
  { key: 'invitations', label: 'Invitación' },
];

function StatBox({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-4 text-center">
      <div
        className={`mx-auto flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
      >
        <Icon size={20} className="text-white" />
      </div>
      <p className="mt-2 text-2xl font-bold text-text dark:text-text-dark">
        {value}
      </p>
      <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
        {label}
      </p>
    </div>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [event, setEvent] = useState<EventDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const currentTab = location.pathname.split('/').slice(3).join('/');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/events/${id}`)
      .then((res) => setEvent(res.data.data || res.data))
      .catch(() => setError('Error al cargar el evento'))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleCopyLink = () => {
    if (event?.invitation_url) {
      navigator.clipboard.writeText(event.invitation_url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={() => navigate('/events')}
            className="mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            Volver a eventos
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-secondary dark:text-text-dark-secondary">
          Evento no encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/events')}
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary dark:text-text-dark-secondary hover:text-text dark:hover:text-text-dark transition-colors"
      >
        <ArrowLeft size={16} />
        Volver a eventos
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text dark:text-text-dark">
            {event.name}
          </h1>
          <span
            className={`rounded-full px-3 py-0.5 text-xs font-medium ${
              STATUS_BADGE[event.status] || ''
            }`}
          >
            {STATUS_LABELS[event.status] || event.status}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate(`/events/${id}/guests`)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border dark:border-border-dark px-3.5 py-2 text-sm font-medium text-text dark:text-text-dark hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary transition-colors"
          >
            <UserPlus size={16} />
            Invitados
          </button>
          <button
            onClick={() => navigate(`/events/${id}/menu`)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border dark:border-border-dark px-3.5 py-2 text-sm font-medium text-text dark:text-text-dark hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary transition-colors"
          >
            <UtensilsCrossed size={16} />
            Menú
          </button>
          <button
            onClick={() => navigate(`/events/${id}/tables`)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border dark:border-border-dark px-3.5 py-2 text-sm font-medium text-text dark:text-text-dark hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary transition-colors"
          >
            <Table2 size={16} />
            Mesas
          </button>
          <button
            onClick={() => navigate(`/events/${id}/edit`)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
          >
            <Edit size={16} />
            Editar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBox
          icon={Users}
          label="Invitados"
          value={event.guest_count ?? 0}
          color="bg-blue-500"
        />
        <StatBox
          icon={UserCheck}
          label="Confirmados"
          value={event.confirmed_count ?? 0}
          color="bg-green-500"
        />
        <StatBox
          icon={UserMinus}
          label="Pendientes"
          value={
            (event.guest_count ?? 0) - (event.confirmed_count ?? 0)
          }
          color="bg-amber-500"
        />
        <StatBox
          icon={UserX}
          label="Declinados"
          value={0}
          color="bg-red-500"
        />
      </div>

      <div className="border-b border-border dark:border-border-dark">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          {TABS.map((tab) => {
            const tabPath = tab.key
              ? `/events/${id}/${tab.key}`
              : `/events/${id}`;
            const isActive =
              currentTab === tab.key ||
              (tab.key === '' && currentTab === '');
            return (
              <button
                key={tab.key}
                onClick={() => navigate(tabPath)}
                className={`shrink-0 border-b-2 pb-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-text-secondary dark:text-text-dark-secondary hover:text-text dark:hover:text-text-dark'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5">
            <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4">
              Detalles del Evento
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <CalendarDays
                  size={18}
                  className="mt-0.5 shrink-0 text-primary-500"
                />
                <div>
                  <p className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wide">
                    Fecha
                  </p>
                  <p className="text-sm font-medium text-text dark:text-text-dark">
                    {formatDate(event.event_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock
                  size={18}
                  className="mt-0.5 shrink-0 text-primary-500"
                />
                <div>
                  <p className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wide">
                    Hora
                  </p>
                  <p className="text-sm font-medium text-text dark:text-text-dark">
                    {formatTime(event.event_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-primary-500"
                />
                <div>
                  <p className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wide">
                    Lugar
                  </p>
                  <p className="text-sm font-medium text-text dark:text-text-dark">
                    {event.location || 'No especificado'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Type
                  size={18}
                  className="mt-0.5 shrink-0 text-primary-500"
                />
                <div>
                  <p className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wide">
                    Tipo
                  </p>
                  <p className="text-sm font-medium text-text dark:text-text-dark">
                    {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                  </p>
                </div>
              </div>
              {event.theme_color && (
                <div className="flex items-start gap-3">
                  <Palette
                    size={18}
                    className="mt-0.5 shrink-0 text-primary-500"
                  />
                  <div>
                    <p className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wide">
                      Color Temático
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full border border-border dark:border-border-dark"
                        style={{ backgroundColor: event.theme_color }}
                      />
                      <p className="text-sm font-medium text-text dark:text-text-dark">
                        {event.theme_color}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {event.description && (
              <div className="mt-4 flex items-start gap-3">
                <FileText
                  size={18}
                  className="mt-0.5 shrink-0 text-primary-500"
                />
                <div>
                  <p className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wide">
                    Descripción
                  </p>
                  <p className="mt-0.5 text-sm text-text dark:text-text-dark">
                    {event.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {event.guest_count !== undefined && event.guest_count > 0 && (
            <div className="rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5">
              <h2 className="text-lg font-semibold text-text dark:text-text-dark mb-4">
                Actividad Reciente de Invitados
              </h2>
              {event.guests && event.guests.length > 0 ? (
                <div className="space-y-3">
                  {event.guests.slice(0, 5).map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between rounded-lg border border-border dark:border-border-dark p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-semibold">
                          {g.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text dark:text-text-dark">
                            {g.name}
                          </p>
                          <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                            {new Date(g.created_at).toLocaleDateString(
                              'es-ES',
                              {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              },
                            )}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          g.rsvp_status === 'confirmed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : g.rsvp_status === 'declined'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}
                      >
                        {g.rsvp_status === 'confirmed'
                          ? 'Confirmado'
                          : g.rsvp_status === 'declined'
                          ? 'Declinado'
                          : 'Pendiente'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary text-center py-6">
                  No hay actividad reciente de invitados
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-5">
          {event.invitation_url && (
            <div className="rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5">
              <h3 className="text-sm font-semibold text-text dark:text-text-dark mb-3">
                Invitación Pública
              </h3>
              <div className="flex items-center gap-2 rounded-lg border border-border dark:border-border-dark bg-surface-secondary dark:bg-surface-dark-secondary px-3 py-2">
                <Share2
                  size={16}
                  className="shrink-0 text-text-secondary dark:text-text-dark-secondary"
                />
                <span className="flex-1 truncate text-xs text-text-secondary dark:text-text-dark-secondary">
                  {event.invitation_url}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary-500 px-3 py-2 text-xs font-medium text-white hover:bg-primary-600 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copiar Link
                    </>
                  )}
                </button>
                <a
                  href={event.invitation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-lg border border-border dark:border-border-dark px-3 py-2 text-text-secondary dark:text-text-dark-secondary hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5">
            <h3 className="text-sm font-semibold text-text dark:text-text-dark mb-3">
              Acceso Rápido
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/events/${id}/guests`)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text dark:text-text-dark hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary transition-colors"
              >
                <Users size={18} className="text-primary-500" />
                Gestionar Invitados
              </button>
              <button
                onClick={() => navigate(`/events/${id}/menu`)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text dark:text-text-dark hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary transition-colors"
              >
                <UtensilsCrossed size={18} className="text-primary-500" />
                Configurar Menú
              </button>
              <button
                onClick={() => navigate(`/events/${id}/tables`)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text dark:text-text-dark hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary transition-colors"
              >
                <Table2 size={18} className="text-primary-500" />
                Diseñar Mesas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
