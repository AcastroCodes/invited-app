import React from 'react';
import { Mail, Sparkles, Heart, Award, Gift, Music } from 'lucide-react';
import { EnvelopeSettings } from '../../types/designerTypes';

export const DEFAULT_ENVELOPE_SETTINGS: EnvelopeSettings = {
  enabled: true,
  color: '#fbf9f5', // Crema marfil
  flapColor: '#f4f0e6',
  innerColor: '#e8e2d3',
  sealDesign: 'wax_monogram',
  sealColor: '#b91c1c', // Rojo cera / borgoña
  sealText: 'E & V',
  recipientText: '¡Estás Invitado!',
  openButtonText: 'Toca para abrir 💌',
  patternStyle: 'classic',
};

interface EnvelopeViewProps {
  settings?: EnvelopeSettings;
  isOpen?: boolean;
  onOpen?: () => void;
  preloadProgress?: number;
  isPreloading?: boolean;
  isInteractive?: boolean;
  partner?: any;
}

export const EnvelopeView: React.FC<EnvelopeViewProps> = ({
  settings = DEFAULT_ENVELOPE_SETTINGS,
  isOpen = false,
  onOpen,
  preloadProgress = 100,
  isPreloading = false,
  isInteractive = true,
  partner,
}) => {
  const envColor = settings.color || DEFAULT_ENVELOPE_SETTINGS.color;
  const flapColor = settings.flapColor || DEFAULT_ENVELOPE_SETTINGS.flapColor;
  const innerColor = settings.innerColor || DEFAULT_ENVELOPE_SETTINGS.innerColor;
  const sealColor = settings.sealColor || DEFAULT_ENVELOPE_SETTINGS.sealColor;
  const sealDesign = settings.sealDesign || DEFAULT_ENVELOPE_SETTINGS.sealDesign;

  const isReady = preloadProgress >= 100;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between relative overflow-hidden bg-slate-950 p-6 select-none font-sans">
      {/* Fondo ambiental sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black opacity-90 pointer-events-none" />
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Sección Top */}
      <div className="z-20 w-full flex-1 basis-0 min-h-0 flex flex-col justify-center items-center text-center px-4 mt-8">
        <h1 className="text-4xl sm:text-5xl font-serif text-amber-100/90 font-extrabold tracking-widest drop-shadow-lg" style={{textShadow: '0 4px 20px rgba(251, 191, 36, 0.2)'}}>
          ¡ESTÁS INVITADO!
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-3 tracking-[0.3em] uppercase whitespace-nowrap">Tenemos algo especial para ti</p>
      </div>

      {/* Contenedor principal del Sobre 3D */}
      <div 
        onClick={() => {
          if (isInteractive && isReady && onOpen) {
            onOpen();
          }
        }}
        className={`relative w-[340px] sm:w-[400px] h-[280px] sm:h-[320px] rounded-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] transition-all duration-700 flex flex-col items-center justify-center p-6 border border-white/10 shrink-0 ${
          isInteractive && isReady ? 'cursor-pointer hover:scale-[1.02] active:scale-95 group' : ''
        }`}
        style={{ backgroundColor: envColor }}
      >
        {/* Solapa Superior del Sobre (Flap) */}
        <div 
          className="absolute top-0 left-0 right-0 h-36 sm:h-40 rounded-t-2xl transition-transform duration-700 origin-top shadow-md flex items-end justify-center pb-2 z-10"
          style={{ 
            backgroundColor: flapColor,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            transform: isOpen ? 'rotateX(180deg)' : 'rotateX(0deg)',
          }}
        >
          {/* Sombra de plegado */}
          <div className="w-full h-full bg-black/5 pointer-events-none" />
          <div className="absolute left-1/2 bottom-0 w-3 h-3 bg-blue-500 transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Interior visible del Sobre */}
        <div 
          className="absolute inset-2 rounded-xl pointer-events-none opacity-40 border border-black/10"
          style={{ backgroundColor: innerColor }}
        />

        {/* Texto del Destinatario en la base del sobre */}
        <div className="absolute left-2 right-2 top-[36px] sm:top-[40px] bottom-2 flex flex-col items-center justify-center border border-red-500 rounded-xl">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1 opacity-70">
            ENTREGAR A:
          </div>
          <h2 className="text-2xl font-serif font-extrabold text-slate-800 tracking-tight leading-snug drop-shadow-xs truncate px-4">
            {settings.recipientText || 'Invitado Especial'}
          </h2>
          <div className="w-8 h-0.5 bg-slate-400/50 mx-auto mt-3 rounded-full" />
        </div>

      </div>

      {/* Sección Partner (Footer) */}
      <div className="z-20 w-full flex-1 basis-0 min-h-0 flex flex-col items-center justify-center pb-4">
        {!isReady ? (
          <div className="w-full max-w-[220px] flex flex-col items-center gap-2">
            <div className="w-full bg-black/30 rounded-full h-1.5 overflow-hidden border border-white/10 p-0.5">
              <div 
                className="h-full bg-pink-500 rounded-full transition-all duration-300 shadow-xs"
                style={{ width: `${Math.min(100, Math.max(5, preloadProgress))}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400/80 tracking-widest">
              CARGANDO INVITACIÓN... {preloadProgress}%
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-fadeIn">
            <span className="px-6 py-3 rounded-full bg-white/5 backdrop-blur-md text-amber-50 font-bold text-xs tracking-widest uppercase shadow-xl border border-white/10 flex items-center gap-2 transition-all">
              <Sparkles size={16} className="text-amber-300 animate-pulse" />
              {settings.openButtonText || 'Toca para abrir 💌'}
            </span>
          </div>
        )}

        <div className="flex flex-col items-center justify-center mt-8 gap-2">
           <span className="text-[9px] uppercase tracking-widest text-slate-500/60 font-semibold">
             Powered By
           </span>
           {partner && partner.logo ? (
             <img src={`/storage/${partner.logo}`} alt={partner.business_name} className="h-6 object-contain opacity-70 grayscale hover:grayscale-0 transition-all duration-500" />
           ) : (
             <div className="text-sm font-bold text-slate-400/80 uppercase tracking-widest opacity-70">{partner?.business_name || 'Invited Pro'}</div>
           )}
        </div>
      </div>
    </div>
  );
};

interface EnvelopeInspectorProps {
  settings?: EnvelopeSettings;
  onChange: (updated: EnvelopeSettings) => void;
}

export const EnvelopeInspector: React.FC<EnvelopeInspectorProps> = ({
  settings = DEFAULT_ENVELOPE_SETTINGS,
  onChange,
}) => {
  const updateSetting = <K extends keyof EnvelopeSettings>(key: K, val: EnvelopeSettings[K]) => {
    onChange({
      ...settings,
      [key]: val,
    });
  };

  const COLOR_PRESETS = [
    { label: 'Crema Marfil', color: '#fbf9f5', flap: '#f4f0e6', inner: '#e8e2d3' },
    { label: 'Blanco Nieve', color: '#ffffff', flap: '#f8fafc', inner: '#e2e8f0' },
    { label: 'Azul Noche', color: '#0f172a', flap: '#1e293b', inner: '#334155' },
    { label: 'Rosa Palo', color: '#fff1f2', flap: '#ffe4e6', inner: '#fecdd3' },
    { label: 'Negro Elegante', color: '#18181b', flap: '#27272a', inner: '#3f3f46' },
    { label: 'Verde Esmeralda', color: '#064e3b', flap: '#047857', inner: '#065f46' },
  ];

  const SEAL_COLORS = [
    { label: 'Rojo Borgoña', color: '#b91c1c' },
    { label: 'Dorado Lujo', color: '#d97706' },
    { label: 'Rosa Romántico', color: '#db2777' },
    { label: 'Azul Real', color: '#1d4ed8' },
    { label: 'Verde Oliva', color: '#15803d' },
    { label: 'Plata Oscuro', color: '#475569' },
  ];

  return (
    <div className="space-y-5 p-4 text-xs select-none">
      <div className="flex items-center gap-2 font-black text-sm pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <Mail size={18} className="text-pink-500" />
        <span>Personalización del Sobre ✉️</span>
      </div>

      {/* Preset de Colores del Sobre */}
      <div className="space-y-2">
        <label className="font-bold opacity-80 block">Estilo y Color del Sobre</label>
        <div className="grid grid-cols-3 gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                onChange({
                  ...settings,
                  color: preset.color,
                  flapColor: preset.flap,
                  innerColor: preset.inner,
                });
              }}
              className="flex items-center gap-2 p-2 rounded-lg border text-[11px] font-semibold transition-all hover:scale-105 cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-app)',
                borderColor: settings.color === preset.color ? 'var(--primary-accent)' : 'var(--border-color)',
              }}
            >
              <div className="w-4 h-4 rounded-full border shadow-xs shrink-0" style={{ backgroundColor: preset.color }} />
              <span className="truncate">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Texto Impreso en el Sobre */}
      <div className="space-y-1.5">
        <label className="font-bold opacity-80 block">Texto del Destinatario</label>
        <input
          type="text"
          value={settings.recipientText || ''}
          onChange={(e) => updateSetting('recipientText', e.target.value)}
          placeholder="Ej: ¡Estás Invitado! o Para: Familia Pérez"
          className="w-full px-3 py-2 rounded-lg border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-pink-500"
          style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
        />
      </div>

      {/* Diseño y Color del Sello de Cera */}
      <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <label className="font-bold opacity-80 block">Sello de Cera (Wax Seal)</label>

        {/* Selector de Icono de Sello */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'wax_monogram', label: 'Monograma' },
            { id: 'wax_heart', label: 'Corazón' },
            { id: 'wax_rings', label: 'Regalo' },
            { id: 'gold_seal', label: 'Insignia' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => updateSetting('sealDesign', item.id as any)}
              className={`p-2 rounded-lg border text-[10px] font-bold text-center transition-all cursor-pointer ${
                settings.sealDesign === item.id ? 'bg-pink-500/10 border-pink-500 text-pink-500' : 'hover:opacity-80'
              }`}
              style={{ borderColor: settings.sealDesign === item.id ? undefined : 'var(--border-color)' }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Monograma / Texto dentro del sello */}
        {settings.sealDesign === 'wax_monogram' && (
          <div className="space-y-1">
            <label className="text-[10px] font-semibold opacity-70">Iniciales / Monograma del Sello</label>
            <input
              type="text"
              maxLength={6}
              value={settings.sealText || ''}
              onChange={(e) => updateSetting('sealText', e.target.value)}
              placeholder="Ej: A & M"
              className="w-full px-3 py-1.5 rounded-lg border text-xs font-bold focus:outline-none focus:ring-1 focus:ring-pink-500"
              style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
            />
          </div>
        )}

        {/* Color de la Cera */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold opacity-70">Color de la Cera</label>
          <div className="flex items-center gap-2 flex-wrap">
            {SEAL_COLORS.map((sc) => (
              <button
                key={sc.color}
                onClick={() => updateSetting('sealColor', sc.color)}
                className={`w-7 h-7 rounded-full border shadow-xs transition-transform hover:scale-110 cursor-pointer ${
                  settings.sealColor === sc.color ? 'ring-2 ring-pink-500 ring-offset-2' : ''
                }`}
                style={{ backgroundColor: sc.color }}
                title={sc.label}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Botón de Apertura */}
      <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <label className="font-bold opacity-80 block">Texto del Botón de Apertura</label>
        <input
          type="text"
          value={settings.openButtonText || ''}
          onChange={(e) => updateSetting('openButtonText', e.target.value)}
          placeholder="Ej: Toca para abrir 💌"
          className="w-full px-3 py-2 rounded-lg border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-pink-500"
          style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
        />
      </div>
    </div>
  );
};
