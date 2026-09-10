import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Sun, Moon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../components/theme/ThemeProvider';

export default function LoginPage() {
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('remembered_email');
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (remember) {
        localStorage.setItem('remembered_email', email);
      } else {
        localStorage.removeItem('remembered_email');
      }
      await login(email, password);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
      setError(data?.message || data?.error || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-app)' }}>
      {/* Left brand panel */}
      <div
        className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden"
        style={{ background: 'var(--gradient-accent)' }}
      >
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white">dInvited</h1>
          <p className="mt-4 text-xl text-white/90">Diseña. Invita. Celebra.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div
        className="flex flex-1 items-center justify-center p-8"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-10 text-center lg:hidden">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--primary-accent)' }}>dInvited</h1>
            <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Diseña. Invita. Celebra.</p>
          </div>

          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Iniciar Sesión</h2>
            <button
              onClick={toggle}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
              style={{
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                color: 'var(--primary-accent)',
              }}
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg p-3 text-sm text-white" style={{ backgroundColor: '#E63946' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="w-full rounded-lg py-2.5 pl-10 pr-4 outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    borderRadius: '8px',
                  }}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full py-2.5 pl-10 pr-12 outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    borderRadius: '8px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded"
                style={{ accentColor: 'var(--primary-accent)' }}
              />
              <label htmlFor="remember" className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                Recordarme
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-1.5 font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary-accent)' }}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              Iniciar Sesión
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            ¿No tienes cuenta?{' '}
            <Link
              to="/register"
              className="font-medium"
              style={{ color: 'var(--primary-accent)' }}
            >
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
