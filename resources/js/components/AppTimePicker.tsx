import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Clock } from 'lucide-react';

interface AppTimePickerProps {
  value: string; // e.g. "06:00 PM" or "18:00"
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function AppTimePicker({
  value,
  onChange,
  placeholder = 'Seleccionar hora',
  className = '',
}: AppTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Parse time state: hour (1-12), minute ("00","15","30","45"), period ("AM"|"PM")
  const parseTime = (valStr: string) => {
    let hh = 6;
    let mm = '00';
    let period = 'PM';

    if (valStr && valStr.includes(':')) {
      const parts = valStr.trim().split(' ');
      const timePart = parts[0];
      if (parts[1] && (parts[1].toUpperCase() === 'AM' || parts[1].toUpperCase() === 'PM')) {
        period = parts[1].toUpperCase();
      }

      const [hStr, mStr] = timePart.split(':');
      let hNum = parseInt(hStr, 10);
      if (!isNaN(hNum)) {
        if (parts.length === 1) {
          // 24h fallback conversion
          period = hNum >= 12 ? 'PM' : 'AM';
          hNum = hNum % 12 || 12;
        }
        hh = hNum === 0 ? 12 : hNum > 12 ? hNum - 12 : hNum;
      }
      if (mStr) mm = mStr;
    }
    return { hh, mm, period };
  };

  const { hh, mm, period } = parseTime(value);

  useLayoutEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(rect.width, 240),
      });
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const portalEl = document.getElementById('app-timepicker-portal');
      if (buttonRef.current && buttonRef.current.contains(e.target as Node)) {
        return;
      }
      if (portalEl && portalEl.contains(e.target as Node)) {
        return;
      }
      setOpen(false);
    };

    const scrollHandler = (e: Event) => {
      const portalEl = document.getElementById('app-timepicker-portal');
      if (portalEl && portalEl.contains(e.target as Node)) {
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

  const updateTime = (newH: number, newM: string, newP: string) => {
    const formatted = `${String(newH).padStart(2, '0')}:${newM} ${newP}`;
    onChange(formatted);
  };

  // Format label for button
  const displayLabel = value ? `${String(hh).padStart(2, '0')}:${mm} ${period}` : placeholder;

  const hoursList = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  const popoverContent = open && coords.top > 0 ? (
    <div
      id="app-timepicker-portal"
      className="fixed z-[999999] rounded-xl p-3 shadow-2xl select-none"
      style={{
        top: coords.top,
        left: coords.left,
        width: 240,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: '0px 14px 40px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div className="text-center text-xs font-semibold pb-2 mb-2" style={{ color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
        Seleccionar Hora (12h AM/PM)
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* Hours Column */}
        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
          <span className="text-[10px] font-bold text-center" style={{ color: 'var(--text-muted)' }}>HORA</span>
          {hoursList.map((h) => {
            const isSelected = h === hh;
            return (
              <button
                key={h}
                type="button"
                onClick={() => updateTime(h, mm, period)}
                className="py-1 px-2 text-xs font-medium rounded transition-all text-center"
                style={{
                  backgroundColor: isSelected ? 'var(--primary-accent)' : 'transparent',
                  color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                  fontWeight: isSelected ? 700 : 500,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--primary-accent-light)';
                    e.currentTarget.style.color = 'var(--primary-accent)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-main)';
                  }
                }}
              >
                {String(h).padStart(2, '0')}
              </button>
            );
          })}
        </div>

        {/* Minutes Column */}
        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
          <span className="text-[10px] font-bold text-center" style={{ color: 'var(--text-muted)' }}>MIN</span>
          {minutesList.map((m) => {
            const isSelected = m === mm;
            return (
              <button
                key={m}
                type="button"
                onClick={() => updateTime(hh, m, period)}
                className="py-1 px-2 text-xs font-medium rounded transition-all text-center"
                style={{
                  backgroundColor: isSelected ? 'var(--primary-accent)' : 'transparent',
                  color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                  fontWeight: isSelected ? 700 : 500,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--primary-accent-light)';
                    e.currentTarget.style.color = 'var(--primary-accent)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-main)';
                  }
                }}
              >
                {m}
              </button>
            );
          })}
        </div>

        {/* AM / PM Column */}
        <div className="flex flex-col gap-2 justify-center">
          <span className="text-[10px] font-bold text-center" style={{ color: 'var(--text-muted)' }}>PERÍODO</span>
          {['AM', 'PM'].map((p) => {
            const isSelected = p === period;
            return (
              <button
                key={p}
                type="button"
                onClick={() => updateTime(hh, mm, p)}
                className="py-2 px-2 text-xs font-bold rounded-lg transition-all text-center"
                style={{
                  backgroundColor: isSelected ? 'var(--primary-accent)' : 'var(--bg-app)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                  border: `1px solid ${isSelected ? 'var(--primary-accent)' : 'var(--border-color)'}`,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--primary-accent-light)';
                    e.currentTarget.style.color = 'var(--primary-accent)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-app)';
                    e.currentTarget.style.color = 'var(--text-main)';
                  }
                }}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-all"
        style={{
          backgroundColor: 'var(--bg-app)',
          border: `1px solid ${open ? 'var(--primary-accent)' : 'var(--border-color)'}`,
          color: value ? 'var(--text-main)' : 'var(--text-muted)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <Clock size={14} style={{ color: 'var(--primary-accent)' }} />
          <span>{displayLabel}</span>
        </div>
      </button>

      {open && typeof document !== 'undefined' && createPortal(popoverContent, document.body)}
    </div>
  );
}
