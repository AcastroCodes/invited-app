import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface AppDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function AppDatePicker({
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  className = '',
}: AppDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  
  // Parse initial date or default to current date
  const parseDate = (valString: string) => {
    if (!valString) return new Date();
    const [y, m, d] = valString.split('-').map(Number);
    if (y && m && d) return new Date(y, m - 1, d);
    return new Date();
  };

  const selectedDate = value ? parseDate(value) : null;
  const [viewDate, setViewDate] = useState<Date>(selectedDate || new Date());

  const buttonRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(rect.width, 310),
      });
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const portalEl = document.getElementById('app-datepicker-portal');
      if (buttonRef.current && buttonRef.current.contains(e.target as Node)) {
        return;
      }
      if (portalEl && portalEl.contains(e.target as Node)) {
        return;
      }
      setOpen(false);
    };

    const scrollHandler = (e: Event) => {
      const portalEl = document.getElementById('app-datepicker-portal');
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

  // Calendar logic
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const formattedDate = `${currentYear}-${formattedMonth}-${formattedDay}`;
    onChange(formattedDate);
    setOpen(false);
  };

  // Generate Year range (e.g. 10 years in future to 20 years past for events, or 100 years for birth dates)
  const years = Array.from({ length: 50 }, (_, i) => currentYear - 25 + i);

  // Format button label in Spanish standard (e.g. 15 de Octubre de 2026 or 15/10/2026)
  const formatDisplay = (valString: string) => {
    if (!valString) return placeholder;
    const [y, m, d] = valString.split('-').map(Number);
    if (!y || !m || !d) return placeholder;
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    );
  };

  const popoverContent = open && coords.top > 0 ? (
    <div
      id="app-datepicker-portal"
      className="fixed z-[999999] rounded-xl p-4 shadow-2xl select-none"
      style={{
        top: coords.top,
        left: coords.left,
        width: 320,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: '0px 14px 40px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Header Month / Year Dropdowns (Shadcn UI Date of Birth Style) */}
      <div className="flex items-center justify-between gap-1.5 pb-3 mb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <button
          type="button"
          onClick={handlePrevMonth}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:opacity-80"
          style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1.5 flex-1 justify-center">
          {/* Select Mes */}
          <select
            value={currentMonth}
            onChange={(e) => setViewDate(new Date(currentYear, parseInt(e.target.value, 10), 1))}
            className="rounded-md px-2 py-1 text-xs font-semibold outline-none cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
            }}
          >
            {MONTH_NAMES.map((mName, idx) => (
              <option key={mName} value={idx}>
                {mName}
              </option>
            ))}
          </select>

          {/* Select Año */}
          <select
            value={currentYear}
            onChange={(e) => setViewDate(new Date(parseInt(e.target.value, 10), currentMonth, 1))}
            className="rounded-md px-2 py-1 text-xs font-semibold outline-none cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
            }}
          >
            {years.map((yNum) => (
              <option key={yNum} value={yNum}>
                {yNum}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:opacity-80"
          style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 mb-2 text-center text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Empty offset slots */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8 w-8" />
        ))}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const selected = isSelected(day);
          const today = isToday(day);

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleSelectDay(day)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: selected
                  ? 'var(--primary-accent)'
                  : today
                  ? 'var(--primary-accent-light)'
                  : 'transparent',
                color: selected
                  ? '#FFFFFF'
                  : today
                  ? 'var(--primary-accent)'
                  : 'var(--text-main)',
                fontWeight: selected || today ? 700 : 500,
                border: today && !selected ? '1px solid var(--primary-accent)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!selected) {
                  e.currentTarget.style.backgroundColor = 'var(--primary-accent-light)';
                  e.currentTarget.style.color = 'var(--primary-accent)';
                }
              }}
              onMouseLeave={(e) => {
                if (!selected) {
                  e.currentTarget.style.backgroundColor = today
                    ? 'var(--primary-accent-light)'
                    : 'transparent';
                  e.currentTarget.style.color = today
                    ? 'var(--primary-accent)'
                    : 'var(--text-main)';
                }
              }}
            >
              {day}
            </button>
          );
        })}
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
          <CalendarIcon size={14} style={{ color: 'var(--primary-accent)' }} />
          <span>{formatDisplay(value)}</span>
        </div>
      </button>

      {open && typeof document !== 'undefined' && createPortal(popoverContent, document.body)}
    </div>
  );
}
