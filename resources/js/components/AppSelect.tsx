import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  fontFamily?: string;
}

interface AppSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  itemClassName?: string;
}

export default function AppSelect({
  value,
  onChange,
  options,
  placeholder,
  className = '',
  buttonClassName = '',
  itemClassName = '',
}: AppSelectProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Si hay scroll en la pagina principal no pasa nada si es position: fixed,
      // pero si usamos position: absolute, necesitamos window.scrollY.
      // Aquí usaremos position: fixed para evitar problemas de scroll de ventanas modales.
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // Necesitamos verificar si el click fue fuera del botón Y fuera del portal
      if (ref.current && !ref.current.contains(e.target as Node)) {
        // En un portal, e.target puede estar dentro del portal pero fuera de ref.current
        // Para simplificar, le ponemos un ID al menú y lo chequeamos
        const menuEl = document.getElementById('app-select-menu-portal');
        if (menuEl && menuEl.contains(e.target as Node)) {
          return; // Clickeó dentro del menú
        }
        setOpen(false);
      }
    };
    const scrollHandler = (e: Event) => {
      const menuEl = document.getElementById('app-select-menu-portal');
      // No cerrar si el scroll está ocurriendo DENTRO del menú
      if (menuEl && menuEl.contains(e.target as Node)) {
        return;
      }
      setOpen(false);
    };

    if (open) {
      document.addEventListener('mousedown', handler);
      window.addEventListener('scroll', scrollHandler, true);
    }
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('scroll', scrollHandler, true);
    };
  }, [open]);

  const displayOptions = placeholder ? [{ value: '', label: placeholder }, ...options] : options;
  const current = displayOptions.find((o) => o.value === value);
  const hasSelection = value !== '';

  const menuContent = open ? (
    <div
      id="app-select-menu-portal"
      className="fixed z-[999999] max-h-64 overflow-y-auto rounded-lg"
      style={{
        top: coords.top,
        left: coords.left,
        width: coords.width,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: '0px 10px 30px rgba(0,0,0,0.2)', // shadow más fuerte para que flote bien
      }}
    >
      {displayOptions.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(o.value);
            setOpen(false);
          }}
          className={`flex w-full items-center justify-between px-3 py-2 text-sm transition-colors text-left ${itemClassName}`}
          style={
            o.value === value
              ? { backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)', fontWeight: 600, fontFamily: o.fontFamily || 'inherit' }
              : { backgroundColor: 'transparent', color: 'var(--text-main)', fontFamily: o.fontFamily || 'inherit' }
          }
          onMouseEnter={(e) => {
            if (o.value !== value) {
              e.currentTarget.style.backgroundColor = 'var(--primary-accent-light)';
              e.currentTarget.style.color = 'var(--primary-accent)';
            }
          }}
          onMouseLeave={(e) => {
            if (o.value !== value) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-main)';
            }
          }}
        >
          {o.label}
          {o.value === value && <span style={{ color: 'var(--primary-accent)' }}>✓</span>}
        </button>

      ))}
    </div>
  ) : null;

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${buttonClassName}`}
        style={{
          backgroundColor: 'var(--bg-card)',
          border: `1px solid ${open ? 'var(--primary-accent)' : 'var(--border-color)'}`,
          color: hasSelection ? 'var(--text-main)' : 'var(--text-muted)',
          fontFamily: current?.fontFamily || 'inherit'
        }}
      >
        <span>{current ? current.label : placeholder || 'Seleccionar'}</span>
        <ChevronDown
          size={16}
          className="transition-transform"
          style={{ color: 'var(--primary-accent)', transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>
      
      {open && typeof document !== 'undefined' && createPortal(menuContent, document.body)}
    </div>
  );
}