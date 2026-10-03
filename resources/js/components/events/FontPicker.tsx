import React, { useState } from 'react';
import { Type } from 'lucide-react';
import FontPickerModal from './FontPickerModal';

interface FontPickerProps {
  value: string;
  onChange: (fontName: string) => void;
  label?: string;
  customFonts?: any[];
  onAddCustomFont?: (file: File) => void;
  className?: string;
}

export const loadFontIntoDOM = (fontName: string) => {
  if (!fontName || fontName === 'Inter') return;
  const linkId = `google-font-${fontName.replace(/ /g, '-')}`;
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}&display=swap`;
    document.head.appendChild(link);
  }
};

export default function FontPicker({
  value,
  onChange,
  label,
  customFonts = [],
  onAddCustomFont,
  className = '',
}: FontPickerProps) {
  const [isOpenModal, setIsOpenModal] = useState(false);

  const handleSelect = (fontName: string) => {
    loadFontIntoDOM(fontName);
    onChange(fontName);
  };

  const activeFontName = value || 'Inter';

  // Make sure active font is loaded into DOM for accurate rendering
  loadFontIntoDOM(activeFontName);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
          {label}
        </label>
      )}

      <div className="flex items-center gap-1.5">
        {/* TEXT DISPLAY BOX */}
        <button
          type="button"
          onClick={() => setIsOpenModal(true)}
          className="w-full h-9 rounded-xl px-3 py-1.5 border outline-none font-medium cursor-pointer truncate shadow-2xs transition-all flex items-center justify-between text-left hover:border-[var(--primary-accent)] active:scale-[0.99]"
          style={{
            backgroundColor: 'var(--bg-app)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-main)',
          }}
          title="Haz clic para abrir el catálogo Font Management"
        >
          <span 
            className="truncate text-base"
            style={{ fontFamily: activeFontName }}
          >
            {activeFontName}
          </span>
        </button>

        {/* BUTTON ICON TO OPEN FONT MANAGEMENT MODAL */}
        <button
          type="button"
          onClick={() => setIsOpenModal(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all hover:opacity-90 shadow-2xs cursor-pointer active:scale-95"
          style={{
            backgroundColor: 'var(--primary-accent)',
            borderColor: 'var(--primary-accent)',
            color: '#FFFFFF',
          }}
          title="Abrir catálogo Font Management"
        >
          <Type size={16} />
        </button>
      </div>

      <FontPickerModal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        currentFont={value}
        customFonts={customFonts}
        onAddCustomFont={onAddCustomFont}
        onSelect={(selectedFont) => {
          handleSelect(selectedFont);
          setIsOpenModal(false);
        }}
      />
    </div>
  );
}
