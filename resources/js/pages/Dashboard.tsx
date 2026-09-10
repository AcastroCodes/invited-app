import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Activity,
  Users,
  UserCheck,
  Plus,
  LayoutTemplate,
  Wallet,
  ArrowRight,
  Building2,
  Bell,
  TrendingUp,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../components/theme/ThemeProvider';
import type { DashboardStats } from '../types';

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'Boda',
  quince: '15 Años',
  birthday: 'Cumpleaños',
  corporate: 'Corporativo',
  other: 'Otro',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
};

const PIE_COLORS = ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#5B8DEF'];

interface DashboardData extends DashboardStats {
  recent_events?: Array<{
    id: number;
    name: string;
    event_type: string;
    event_date: string;
    status: string;
    guest_count: number;
    confirmed_count: number;
  }>;
  partner_registrations?: Array<{
    month: string;
    count: number;
  }>;
  active_partners?: number;
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const dummyRegistrations = [
  { month: 'Ene', count: 4 },
  { month: 'Feb', count: 7 },
  { month: 'Mar', count: 5 },
  { month: 'Abr', count: 12 },
  { month: 'May', count: 9 },
  { month: 'Jun', count: 15 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const isDark = theme === 'dark';
  const coralAccent = '#E07A5F';
  const goldAccent = '#F2CC8F';
  const chartColors = [coralAccent, goldAccent, '#52B788', '#E63946', '#5B8DEF'];

  useEffect(() => {
    api
      .get('/dashboard/stats')
      .then((res) => setData(res.data))
      .catch(() => setError('Error al cargar estadísticas'))
      .finally(() => setLoading(false));
  }, []);

  const todayStr = today.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const pieData = useMemo(() => {
    if (!data?.events_by_type) return [];
    return Object.entries(data.events_by_type).map(([key, val]) => ({
      name: EVENT_TYPE_LABELS[key] || key,
      value: val,
    }));
  }, [data]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

  const registrations = data?.partner_registrations?.length
    ? data.partner_registrations
    : dummyRegistrations;

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const calDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const notifications = [
    { id: 1, text: 'Nuevo evento creado: Boda María', time: 'hace 5m', color: coralAccent },
    { id: 2, text: '3 invitados confirmados', time: 'hace 1h', color: '#52B788' },
    { id: 3, text: 'Créditos bajos: 5 restantes', time: 'hace 2h', color: '#E63946' },
  ];

  const tasks = [
    { id: 1, text: 'Diseñar invitación web', done: true },
    { id: 2, text: 'Revisar lista de invitados', done: true },
    { id: 3, text: 'Confirmar menú con el catering', done: false },
    { id: 4, text: 'Enviar recordatorios', done: false },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary-accent)] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-3 text-sm underline" style={{ color: 'var(--primary-accent)' }}>
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-5">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Welcome header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold capitalize" style={{ color: 'var(--text-main)' }}>
              Bienvenido, {user?.name?.split(' ')[0] || 'Usuario'}
            </h1>
            <p className="mt-1 text-sm capitalize" style={{ color: 'var(--text-muted)' }}>
              {todayStr}
            </p>
          </div>
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Buscar..."
              className="w-64 rounded-md px-3 py-1.5 pl-10 text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '9999px',
              }}
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard icon={CalendarDays} label="Total Eventos" value={data?.total_events ?? 0} accent={coralAccent} />
          <KpiCard icon={Activity} label="Eventos Activos" value={data?.active_events ?? 0} accent="#52B788" />
          <KpiCard icon={Users} label="Total Invitados" value={data?.total_guests ?? 0} accent={goldAccent} />
          <KpiCard icon={UserCheck} label="Confirmados" value={data?.confirmed_guests ?? 0} accent="#5B8DEF" />
        </div>

        {/* Charts row */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Line chart - Registrations */}
          <div
            className="rounded-2xl border border-[var(--border-color)] p-5"
            style={{ backgroundColor: 'var(--bg-card)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: 'var(--text-main)' }}>Registro de Partners</h3>
              <TrendingUp size={18} style={{ color: coralAccent }} />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={registrations}>
                <defs>
                  <linearGradient id="coralGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={coralAccent} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={coralAccent} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={goldAccent} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={goldAccent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                  }}
                />
                <Area type="monotone" dataKey="count" stroke={coralAccent} strokeWidth={3} fill="url(#coralGrad)" dot={{ fill: coralAccent, r: 4, strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart - Events by type */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: 'var(--text-main)' }}>Eventos por Tipo</h3>
              <BarChart3 size={18} style={{ color: goldAccent }} />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pieData.length > 0 ? pieData : [{ name: 'Sin datos', value: 1 }]} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={chartColors[idx % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Events */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-main)' }}>Eventos Recientes</h3>
          {data?.recent_events && data.recent_events.length > 0 ? (
            <div className="space-y-2">
              {data.recent_events.slice(0, 4).map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between rounded-xl px-3 py-3 cursor-pointer transition-colors"
                  style={{ border: '1px solid var(--border-color)' }}
                  onClick={() => navigate(`/events/${ev.id}`)}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.03)' : '#F5F5F5'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-main)' }}>{ev.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {EVENT_TYPE_LABELS[ev.event_type] || ev.event_type} &middot; {formatDate(ev.event_date)}
                    </p>
                  </div>
                  <span className={`ml-3 shrink-0 rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[ev.status] || ''}`}>
                    {STATUS_LABELS[ev.status] || ev.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No hay eventos recientes</p>
          )}
          {(data?.recent_events?.length ?? 0) > 0 && (
            <button
              onClick={() => navigate('/events')}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              style={{
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                borderRadius: '9999px',
              }}
            >
              Ver todos los eventos <ArrowRight size={16} />
            </button>
          )}
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="font-semibold mb-3" style={{ color: 'var(--text-main)' }}>Acciones Rápidas</h3>
          <div className="flex flex-wrap gap-3">
            <ActionBtn icon={Plus} label="Nuevo Evento" onClick={() => navigate('/events/new')} accent={coralAccent} />
            <ActionBtn icon={LayoutTemplate} label="Ver Plantillas" onClick={() => navigate('/templates')} accent="#52B788" />
            <ActionBtn icon={Wallet} label="Mis Créditos" onClick={() => navigate('/credits')} accent={goldAccent} />
            {user?.role === 'superadmin' && (
              <ActionBtn icon={Building2} label="Partners" onClick={() => navigate('/partners')} accent="#E63946" />
            )}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="hidden xl:flex w-[300px] shrink-0 flex-col gap-5">

        {/* Notifications */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>Notificaciones</h3>
            <Bell size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: n.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs" style={{ color: 'var(--text-main)' }}>{n.text}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donut - Events by type */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>Eventos por Tipo</h3>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={pieData.length > 0 ? pieData : [{ name: 'Sin datos', value: 1 }]} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={chartColors[idx % chartColors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
            {pieData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: chartColors[idx % chartColors.length] }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bars */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-main)' }}>Créditos</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: 'var(--text-muted)' }}>Web</span>
                <span style={{ color: 'var(--text-main)' }}>{data?.credits_web ?? 0}</span>
              </div>
              <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--border-color)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min((data?.credits_web ?? 0) / 20 * 100, 100)}%`,
                    background: 'var(--gradient-accent)',
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: 'var(--text-muted)' }}>Video</span>
                <span style={{ color: 'var(--text-main)' }}>{data?.credits_video ?? 0}</span>
              </div>
              <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--border-color)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((data?.credits_video ?? 0) / 20 * 100, 100)}%`,
                    backgroundColor: '#52B788',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => { if (calMonth === 0) { setCalYear(calYear - 1); setCalMonth(11); } else { setCalMonth(calMonth - 1); } }} className="rounded-lg p-1 transition-colors" style={{ color: 'var(--text-muted)' }}>
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
              {MONTHS[calMonth]} {calYear}
            </span>
            <button onClick={() => { if (calMonth === 11) { setCalYear(calYear + 1); setCalMonth(0); } else { setCalMonth(calMonth + 1); } }} className="rounded-lg p-1 transition-colors" style={{ color: 'var(--text-muted)' }}>
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {DAYS.map((d) => (
              <span key={d} className="text-xs font-medium py-1" style={{ color: 'var(--text-muted)' }}>{d}</span>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {calDays.map((day) => {
              const isToday = day === todayDate && calMonth === todayMonth && calYear === todayYear;
              return (
                <button
                  key={day}
                  className={`rounded-lg py-1 text-xs font-medium transition-colors ${isToday ? 'text-white' : ''}`}
                  style={{
                    backgroundColor: isToday ? coralAccent : 'transparent',
                    color: isToday ? '#fff' : 'var(--text-main)',
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tasks */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>Tareas</h3>
            <span className="text-xs font-medium" style={{ color: coralAccent }}>{tasks.filter((t) => !t.done).length} pendientes</span>
          </div>
          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2.5">
                {task.done ? (
                  <CheckCircle2 size={16} style={{ color: '#52B788' }} />
                ) : (
                  <Circle size={16} style={{ color: 'var(--text-muted)' }} />
                )}
                <span className={`text-xs ${task.done ? 'line-through' : ''}`} style={{ color: task.done ? 'var(--text-muted)' : 'var(--text-main)' }}>
                  {task.text}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string | number; accent: string }) {
  return (
    <div
      className="rounded-2xl p-5 transition-all hover:-translate-y-0.5"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <Icon size={18} style={{ color: accent }} />
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>{value}</p>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, onClick, accent }: { icon: React.ElementType; label: string; onClick: () => void; accent: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all hover:-translate-y-0.5"
      style={{
        backgroundColor: accent + '18',
        color: accent,
        border: `1px solid ${accent}30`,
      }}
    >
      <Icon size={18} />
      {label}
    </button>
  );
}