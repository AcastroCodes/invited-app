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
}

export const EnvelopeView: React.FC<EnvelopeViewProps> = ({
  settings = DEFAULT_ENVELOPE_SETTINGS,
  isOpen = false,
  onOpen,
  preloadProgress = 100,
  isPreloading = false,
  isInteractive = true,
}) => {
  const envColor = settings.color || DEFAULT_ENVELOPE_SETTINGS.color;
  const flapColor = settings.flapColor || DEFAULT_ENVELOPE_SETTINGS.flapColor;
  const innerColor = settings.innerColor || DEFAULT_ENVELOPE_SETTINGS.innerColor;
  const sealColor = settings.sealColor || DEFAULT_ENVELOPE_SETTINGS.sealColor;
  const sealDesign = settings.sealDesign || DEFAULT_ENVELOPE_SETTINGS.sealDesign;

  const isReady = preloadProgress >= 100;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-slate-950 p-6 select-none font-sans">
      {/* Fondo ambiental sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black opacity-90 pointer-events-none" />
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Contenedor principal del Sobre 3D */}
      <div 
        onClick={() => {
          if (isInteractive && isReady && onOpen) {
            onOpen();
          }
        }}
        className={`relative w-[340px] sm:w-[400px] h-[520px] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] transition-all duration-700 flex flex-col items-center justify-center p-6 border border-white/10 ${
          isInteractive && isReady ? 'cursor-pointer hover:scale-[1.02] active:scale-95 group' : ''
        }`}
        style={{ backgroundColor: envColor }}
      >
        {/* Solapa Superior del Sobre (Flap) */}
        <div 
          className="absolute top-0 left-0 right-0 h-44 rounded-t-2xl transition-transform duration-700 origin-top shadow-md flex items-end justify-center pb-2 z-10"
          style={{ 
            backgroundColor: flapColor,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            transform: isOpen ? 'rotateX(180deg)' : 'rotateX(0deg)',
          }}
        >
          {/* Sombra de plegado */}
          <div className="w-full h-full bg-black/5 pointer-events-none" />
        </div>

        {/* Interior visible del Sobre */}
        <div 
          className="absolute inset-2 rounded-xl pointer-events-none opacity-40 border border-black/10"
          style={{ backgroundColor: innerColor }}
        />

        {/* Texto del Destinatario impreso en el sobre */}
        <div className="z-20 text-center my-auto px-4 max-w-xs">
          <div className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">
            Invitación Especial
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-slate-800 tracking-tight leading-snug drop-shadow-xs">
            {settings.recipientText || '¡Estás Invitado!'}
          </h2>
          <div className="w-12 h-0.5 bg-slate-400/50 mx-auto mt-3 rounded-full" />
        </div>

        {/* Sello de Cera / Wax Seal Interactivo */}
        <div 
          className="z-30 relative my-4 flex items-center justify-center shadow-xl rounded-full transition-transform duration-300 group-hover:scale-110"
          style={{
            width: '84px',
            height: '84px',
            backgroundColor: sealColor,
            boxShadow: `0 10px 25px -5px ${sealColor}80, inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -4px 6px rgba(0,0,0,0.4)`
          }}
        >
          {/* Borde irregular de cera */}
          <div className="absolute inset-1 rounded-full border-2 border-white/30 pointer-events-none" />
          
          {/* Icono o Monograma dentro del sello */}
          {sealDesign === 'wax_heart' ? (
            <Heart size={36} className="text-amber-100 fill-amber-100/30 drop-shadow-md" />
          ) : sealDesign === 'wax_rings' ? (
            <Gift size={36} className="text-amber-100 drop-shadow-md" />
          ) : sealDesign === 'gold_seal' ? (
            <Award size={40} className="text-yellow-200 drop-shadow-md" />
          ) : (
            <span className="text-xl font-serif font-bold text-amber-100 tracking-wider drop-shadow-md">
              {settings.sealText || 'E & V'}
            </span>
          )}
        </div>

        {/* Estado de Precarga / Barra de Carga */}
        {!isReady && (
          <div className="z-20 w-full max-w-[220px] flex flex-col items-center gap-2 mt-2">
            <div className="w-full bg-black/10 rounded-full h-2 overflow-hidden border border-black/5 p-0.5">
              <div 
                className="h-full bg-pink-500 rounded-full transition-all duration-300 shadow-xs"
                style={{ width: `${Math.min(100, Math.max(5, preloadProgress))}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-slate-500 tracking-wider">
              CARGANDO DETALLES... {preloadProgress}%
            </span>
          </div>
        )}

        {/* Botón de Apertura activado cuando la precarga está lista */}
        {isReady && (
          <div className="z-20 mt-2 flex flex-col items-center animate-pulse">
            <span className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg border border-white/20 flex items-center gap-2 group-hover:bg-pink-600 transition-colors">
              <Sparkles size={14} className="text-amber-300 animate-spin" style={{ animationDuration: '3s' }} />
              {settings.openButtonText || 'Toca para abrir 💌'}
            </span>
          </div>
        )}
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
