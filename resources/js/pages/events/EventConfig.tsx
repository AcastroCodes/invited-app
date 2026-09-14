import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Users,
  UserCheck,
  UserX,
  Building2,
  Mail,
  Shield,
  Smartphone,
  CheckCircle2,
  XCircle,
  Settings,
  Info,
  Clock,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import InvitationManager from '../../components/events/InvitationManager';
import GuestManager from '../../components/events/GuestManager';
import api from '../../lib/api';
import type { Event } from '../../types';

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'Boda',
  quince: '15 Años',
  birthday: 'Cumpleaños',
  corporate: 'Corporativo',
  other: 'Otro',
  boda: 'Boda',
  xv_anos: 'XV Años',
  cumpleanos: 'Cumpleaños',
  corporativo: 'Corporativo',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
  draft: 'Borrador',
};

const ALL_SERVICES = [
  {
    id: 'INVITADOS',
    name: 'Invitados',
    fullName: 'Lista de Invitados & Asignación',
    description: 'Gestión completa de la lista de invitados, acompañantes, pases y confirmación RSVP.',
    icon: Users,
  },
  {
    id: 'INVITACION',
    name: 'Invitación',
    fullName: 'Invitación Digital 3D',
    description: 'Página web personalizada con mapa, itinerario, confirmación RSVP y fotos.',
    icon: Mail,
  },
  {
    id: 'PROTOCOLO',
    name: 'Protocolo',
    fullName: 'Gestión de Protocolo & Recepción',
    description: 'Control de acceso de invitados en puerta, asignación de mesas y check-in.',
    icon: Shield,
  },
  {
    id: 'TOTEM',
    name: 'Tótem',
    fullName: 'Tótem / Kiosco Interactivo',
    description: 'Pantalla interactiva en la entrada del evento para auto check-in de invitados.',
    icon: Smartphone,
  },
];

export default function EventConfig() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<string>('INVITADOS');

  const fetchEvent = () => {
    if (!id) return;
    api
      .get(`/events/${id}`)
      .then((res) => {
        const evData = res.data.data || res.data;
        setEvent(evData);
        if (evData.services && evData.services.length > 0 && !activeTab) {
          setActiveTab(evData.services[0]);
        }
      })
      .catch(() => {
        setError('Error al cargar la información del evento');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  // Helper to calculate global event date range text from itinerary
  const computeEventDateRange = (itinerary: any[]) => {
    if (!itinerary || itinerary.length === 0) {
      return '';
    }

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

    const itemsWithStart = [...validItems].sort((a, b) => 
      parseToTimestamp(a.date, a.start_time) - parseToTimestamp(b.date, b.start_time)
    );

    const itemsWithEnd = [...validItems].sort((a, b) => 
      parseToTimestamp(a.date, a.end_time || a.start_time) - parseToTimestamp(b.date, b.end_time || b.start_time)
    );

    const earliest = itemsWithStart[0];
    const latest = itemsWithEnd[itemsWithEnd.length - 1];

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
        period = h >= 12 ? 'pm' : 'am';
        h = h % 12 || 12;
      } else {
        h = h % 12 || 12;
      }

      return `${h}:${m}${period}`;
    };

    const startTimeFormatted = formatTo12HourString(earliest.start_time || '6:00 PM');
    const endTimeFormatted = formatTo12HourString(latest.end_time || '10:00 PM');

    if (earliest.date === latest.date) {
      const dateText = formatSpanishDateLong(earliest.date);
      return `${dateText} de ${startTimeFormatted} a ${endTimeFormatted}`;
    }

    const startDateText = formatSpanishDateLong(earliest.date);
    const endDateText = formatSpanishDateLong(latest.date);
    return `${startDateText} ${startTimeFormatted} a ${endDateText} ${endTimeFormatted}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const [y, m, d] = dateStr.split('T')[0].split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
      const monthName = dateObj.toLocaleDateString('es-ES', { month: 'long' });
      const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      return `${capitalizedDay} ${d} de ${capitalizedMonth} de ${y}`;
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary" style={{ color: 'var(--primary-accent)' }} />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-4 p-6">
        <button
          onClick={() => navigate('/events')}
          className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-75"
          style={{ color: 'var(--primary-accent)' }}
        >
          <ArrowLeft size={16} /> Volver a eventos
        </button>
        <div className="rounded-lg p-4 text-center" style={{ backgroundColor: 'rgba(230,57,70,0.1)', color: 'var(--danger)' }}>
          {error || 'Evento no encontrado'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header con información del Evento a ancho completo de borde a borde con margen reducido arriba */}
      <div
        className="-mx-4 mt-1 md:-mx-6 lg:-mx-8 rounded-none shadow-sm relative flex items-stretch"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderTop: '3px solid var(--primary-accent)',
          borderBottom: '3px solid var(--primary-accent)',
          borderLeft: 'none',
          borderRight: 'none',
          zIndex: 10,
        }}
      >
        {/* Badge del Estado en la esquina superior derecha (igual que en la lista de eventos) */}
        <span
          className="absolute top-0 right-0 rounded-bl-lg px-3 py-1 text-xs font-semibold text-white uppercase z-20"
          style={{
            backgroundColor:
              event.status === 'active' ? 'var(--success)' :
              event.status === 'completed' ? 'var(--primary-accent)' :
              event.status === 'cancelled' ? 'var(--danger)' : 'var(--text-muted)',
          }}
        >
          {STATUS_LABELS[event.status] ? STATUS_LABELS[event.status].toUpperCase() : event.status.toUpperCase()}
        </span>

        {/* Badge del Tipo de Evento y Partner en la esquina superior izquierda (al lado del botón <) */}
        <div className="absolute top-0 left-12 flex items-center z-20">
          <span
            className="rounded-br-lg px-3 py-1 text-xs font-semibold text-white uppercase"
            style={{
              backgroundColor: 'var(--primary-accent)',
            }}
          >
            {EVENT_TYPE_LABELS[event.event_type] ? EVENT_TYPE_LABELS[event.event_type].toUpperCase() : event.event_type.toUpperCase()}
          </span>

          {event.partner && (
            <span
              className="ml-2 rounded-b-lg px-3 py-1 text-xs font-semibold uppercase flex items-center gap-1.5 shadow-sm"
              style={{
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                borderTop: 'none',
                color: 'var(--text-muted)',
              }}
            >
              <Building2 size={13} style={{ color: 'var(--primary-accent)' }} />
              {event.partner.business_name}
            </span>
          )}
        </div>

        {/* Botón Volver tipo < ocupando todo el alto a la izquierda */}
        <button
          onClick={() => navigate('/events')}
          className="flex w-12 shrink-0 items-center justify-center text-white transition-opacity hover:opacity-80 rounded-none z-10"
          style={{ backgroundColor: 'var(--primary-accent)' }}
          title="Volver al listado de eventos"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="py-3 px-6 flex-1 min-w-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pr-12 md:pr-16">
            {/* Columna Izquierda: Nombre del Evento y Fecha */}
            <div className="min-w-0 flex-1">
              <h1 className="mt-5 text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
                {event.name}
              </h1>

              <div className="mt-0.5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <div className="flex items-center gap-1.5">
                  <Calendar size={15} style={{ color: 'var(--primary-accent)' }} />
                  <span>{computeEventDateRange(event.itinerary || []) || formatDate(event.event_date)}</span>
                </div>

                {event.location_name && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={15} style={{ color: 'var(--primary-accent)' }} />
                    <span className="truncate max-w-[250px]">{event.location_name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Logo grande por encima de la franja */}
            {event.logo && (
              <div className="shrink-0 self-center relative z-30 -my-10 mx-6 md:mx-10">
                <img
                  src={`/storage/${event.logo}`}
                  alt="logo"
                  className="h-36 max-w-[320px] object-contain drop-shadow-xl"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Franja de servicios */}
      <div
        className="-mx-4 mt-12 md:-mx-6 lg:-mx-8 px-6 flex items-center justify-between gap-4 text-white shadow-md relative h-8 z-20 overflow-visible"
        style={{
          backgroundColor: 'var(--primary-accent)',
        }}
      >
        <div className="flex items-center gap-4 flex-1 overflow-visible">
          <div className="border-r border-white/30 pr-4 py-0.5 shrink-0">
            <span className="font-black text-sm uppercase tracking-wider">SERVICIOS</span>
          </div>

          <div className="flex items-center gap-3 overflow-visible">
            {ALL_SERVICES.map((srv) => {
              const Icon = srv.icon;
              const isIncluded = srv.id === 'INVITADOS' || event.services?.includes(srv.id);
              if (!isIncluded) return null;

              const isActiveService = activeTab === srv.id;

              return (
                <button
                  key={srv.id}
                  onClick={() => setActiveTab(srv.id as any)}
                  className={`flex items-center gap-2 rounded-lg font-extrabold transition-all ${
                    isActiveService
                      ? 'bg-white text-[var(--primary-accent)] shadow-2xl text-base px-6 py-2.5 -my-3.5 z-30 scale-110 border-[3.5px]'
                      : 'bg-white/20 text-white hover:bg-white/35 text-sm px-5 py-1'
                  }`}
                  style={
                    isActiveService
                      ? { borderColor: 'var(--primary-accent)' }
                      : undefined
                  }
                >
                  <Icon size={isActiveService ? 19 : 16} />
                  <span>{srv.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contador de Invitados (Estilo Recuadro Blanco 3/4 del alto del item seleccionado) */}
        {activeTab === 'INVITADOS' && (() => {
          const totalGuests = event.guest_count ?? (event.guests ? event.guests.length : 0);
          const acceptedGuests = event.confirmed_count ?? (event.guests ? event.guests.filter(g => g.rsvp_status === 'confirmed' || g.rsvp_status === 'accepted' || g.rsvp_status === 'attending').length : 0);
          const rejectedGuests = event.guests ? event.guests.filter(g => g.rsvp_status === 'declined' || g.rsvp_status === 'rejected' || g.rsvp_status === 'not_attending').length : 0;

          return (
            <div
              className="flex items-center gap-3.5 px-3.5 py-1 rounded-lg shrink-0 self-center z-30 shadow-xl bg-white border-[3.5px]"
              style={{
                borderColor: 'var(--primary-accent)',
                color: 'var(--text-main)',
              }}
            >
              {/* TOTAL */}
              <div className="flex flex-col items-center px-1.5 pr-3 border-r leading-tight" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-1">
                  <Users size={12} className="text-slate-800" />
                  <span className="font-black text-sm text-slate-800">{totalGuests}</span>
                </div>
                <span className="text-[8px] uppercase font-black tracking-wider mt-0.5 text-slate-800">
                  Total
                </span>
              </div>

              {/* ACEPTADOS */}
              <div className="flex flex-col items-center px-1.5 pr-3 border-r leading-tight" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-1">
                  <UserCheck size={12} style={{ color: 'var(--success)' }} />
                  <span className="font-black text-sm" style={{ color: 'var(--success)' }}>{acceptedGuests}</span>
                </div>
                <span className="text-[8px] uppercase font-black tracking-wider mt-0.5" style={{ color: 'var(--success)' }}>
                  Aceptados
                </span>
              </div>

              {/* RECHAZADOS */}
              <div className="flex flex-col items-center px-1.5 leading-tight">
                <div className="flex items-center gap-1">
                  <UserX size={12} style={{ color: 'var(--danger)' }} />
                  <span className="font-black text-sm" style={{ color: 'var(--danger)' }}>{rejectedGuests}</span>
                </div>
                <span className="text-[8px] uppercase font-black tracking-wider mt-0.5" style={{ color: 'var(--danger)' }}>
                  Rechazados
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Contenido del Servicio Seleccionado */}
      <div className="pt-4">
        {activeTab === 'INVITADOS' ? (
          <GuestManager eventId={event.id} />
        ) : activeTab === 'INVITACION' && event.services?.includes('INVITACION') ? (
          <InvitationManager eventId={event.id} />
        ) : (
          ALL_SERVICES.map((srv) => {
            if (activeTab !== srv.id || (!event.services?.includes(srv.id) && srv.id !== 'INVITADOS')) return null;
            const Icon = srv.icon;

            return (
              <div
                key={srv.id}
                className="rounded-xl p-6 space-y-4 shadow-sm"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderLeft: '4px solid var(--primary-accent)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>
                      {srv.name}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {srv.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    Configuración y panel activo para el servicio <strong style={{ color: 'var(--primary-accent)' }}>{srv.name}</strong>.
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
