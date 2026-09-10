import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Users, Sun, Moon } from 'lucide-react';
import { useTheme } from '../components/theme/ThemeProvider';

export default function LandingPage() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}
    >
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white text-sm font-bold"
            style={{ backgroundColor: 'var(--primary-accent)' }}
          >
            dI
          </div>
          <span className="text-xl font-bold">dInvited</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
            style={{
              backgroundColor: isDark ? 'var(--bg-card)' : 'var(--bg-sidebar)',
              border: '1px solid var(--border-color)',
              color: 'var(--primary-accent)',
            }}
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            style={{ color: 'var(--text-main)' }}
          >
            Iniciar Sesión
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--primary-accent)' }}
          >
            Registrarse
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-3xl text-center">
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-white"
            style={{ background: 'var(--gradient-accent)' }}
          >
            <SparkleIcon />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Diseña. <span style={{ color: 'var(--primary-accent)' }}>Invita.</span> Celebra.
          </h1>
          <p className="mt-4 text-lg" style={{ color: 'var(--text-muted)' }}>
            Crea invitaciones digitales para tus eventos, gestiona tus invitados,
            menús y mesas desde un solo lugar.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-md px-3 py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--primary-accent)' }}
            >
              Comenzar gratis
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-md px-3 py-3 text-sm font-semibold"
              style={{ border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="px-6 pb-16">
        <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-3">
          <Feature icon={CalendarDays} title="Eventos" text="Crea y gestiona tus eventos con fechas, lugar y detalles." />
          <Feature icon={Users} title="Invitados" text="Controla confirmaciones, alergias y grupos familiares." />
          <Feature icon={SparkleIcon} title="Invitaciones" text="Diseña invitaciones web y video con plantillas." />
        </div>
      </section>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3m0 12v3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M3 12h3m12 0h3M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1" />
    </svg>
  );
}

function Feature({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--primary-accent-light)' }}>
        <Icon size={20} style={{ color: 'var(--primary-accent)' }} />
      </div>
      <h3 className="mb-1 font-semibold">{title}</h3>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{text}</p>
    </div>
  );
}