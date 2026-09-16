import React from 'react';
import { Mail, Sparkles, Heart, Award, Gift, Music, ChevronRight } from 'lucide-react';
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
  orientation: 'vertical',
};

interface EnvelopeViewProps {
  settings?: EnvelopeSettings;
  isOpen?: boolean;
  onOpen?: () => void;
  preloadProgress?: number;
  isPreloading?: boolean;
  isInteractive?: boolean;
  partner?: any;
  scale?: number;
}

export const EnvelopeView: React.FC<EnvelopeViewProps> = ({
  settings = DEFAULT_ENVELOPE_SETTINGS,
  isOpen = false,
  onOpen,
  preloadProgress = 100,
  isPreloading = false,
  isInteractive = true,
  partner,
  scale = 1,
}) => {
  const envColor = settings.color || DEFAULT_ENVELOPE_SETTINGS.color;
  const flapColor = settings.flapColor || DEFAULT_ENVELOPE_SETTINGS.flapColor;
  const innerColor = settings.innerColor || DEFAULT_ENVELOPE_SETTINGS.innerColor;
  const sealColor = settings.sealColor || DEFAULT_ENVELOPE_SETTINGS.sealColor;
  const sealDesign = settings.sealDesign || DEFAULT_ENVELOPE_SETTINGS.sealDesign;

  const isReady = preloadProgress >= 100;

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950 select-none font-sans">
      <div 
        className="absolute top-1/2 left-1/2 flex flex-col items-center justify-between"
        style={{
          width: `${100 / scale}%`,
          height: `${100 / scale}%`,
          transform: `translate(-50%, -50%) scale(${scale})`
        }}
      >
        {/* Fondo ambiental sutil */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black opacity-90 pointer-events-none" />
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:24px_24px]" />

        {settings.orientation === 'horizontal' ? (
          // --- MODO HORIZONTAL ---
          <div className="z-20 w-full h-full flex flex-col justify-center items-center text-center">
            {/* Contenedor principal del Sobre Horizontal (Pantalla Completa) */}
            <div 
              className="relative w-full h-full overflow-hidden flex"
              style={{ 
                backgroundColor: 'transparent'
              }}
            >
              {/* Franja Izquierda 2/7 (Efecto Vidrio Esmerilado) */}
              <div 
                className="flex-[2] h-full relative flex flex-col justify-end items-center pb-6 sm:pb-8 z-10 transition-all duration-700"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: 'inset -5px 0 15px rgba(255,255,255,0.1), 5px 0 15px rgba(0,0,0,0.1)'
                }}
              >
                {/* Partner Logo centrado en la parte inferior */}
                <div className="flex flex-col items-center gap-1.5 opacity-80 text-center drop-shadow-md">
                  <span className="text-[9px] uppercase tracking-widest text-white font-semibold">
                    Powered By
                  </span>
                  {partner && partner.logo ? (
                    <img src={`/storage/${partner.logo}`} alt={partner.business_name} className="h-5 sm:h-6 object-contain grayscale hover:grayscale-0 transition-all duration-500 brightness-0 invert" />
                  ) : (
                    <div className="text-xs font-bold text-white uppercase tracking-widest">{partner?.business_name || 'Invited Pro'}</div>
                  )}
                </div>
              </div>

              {/* Divisor exacto para anclar el sello entre ambas columnas */}
              <div className="relative w-0 h-full z-50">
                {/* Sello de Cera (Wax Seal) */}
                <div 
                  className="absolute w-[72px] sm:w-[88px] h-[72px] sm:h-[88px] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.6)] border border-black/20 transition-all duration-700"
                  style={{ 
                    top: '60%',
                    left: '0',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: sealColor,
                    backgroundImage: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0.3) 100%)'
                  }}
                >
                  <div className="absolute inset-1.5 sm:inset-2 rounded-full border border-white/20 shadow-[inset_0_3px_6px_rgba(0,0,0,0.5)] flex items-center justify-center">
                    {sealDesign === 'wax_heart' && <Heart size={24} className="text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:w-8 sm:h-8" fill="currentColor" />}
                    {sealDesign === 'wax_rings' && <Gift size={24} className="text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:w-8 sm:h-8" />}
                    {sealDesign === 'gold_seal' && <Award size={26} className="text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:w-10 sm:h-10" />}
                  </div>
                </div>
              </div>

              <div 
                className="flex-[5] h-full relative z-10 transition-all duration-700"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: 'inset 5px 0 15px rgba(255,255,255,0.1), -5px 0 15px rgba(0,0,0,0.1)'
                }}
              >
                {/* Los textos han sido removidos porque ahora se manejan como capas (elementos) del lienzo */}
              </div>
              
              {/* Franja del Sello (Horizontal - Belly Band) */}
              <div 
                className="absolute left-0 right-0 pointer-events-none z-40 flex items-center justify-end pr-4 sm:pr-6 shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
                style={{ 
                  top: '60%', 
                  height: 'clamp(45px, 6vw, 55px)',
                  transform: 'translateY(-50%)',
                  backgroundColor: settings.color || '#fbf9f5', // Color principal del sobre
                  borderTop: '1px solid rgba(255,255,255,0.8)',
                  borderBottom: '1px solid rgba(0,0,0,0.1)'
                }}
              >
                {/* Botón de Abrir (Derecha de la Franja) */}
                <div 
                  className="flex items-center gap-2 sm:gap-3 pointer-events-auto cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                  onClick={() => {
                    if (isInteractive && isReady && onOpen) onOpen();
                  }}
                >
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-800 drop-shadow-xs">
                    {settings.openButtonText || 'Toca para abrir 💌'}
                  </span>
                  <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-slate-800 flex items-center justify-center text-white shadow-sm border border-white/20">
                    <ChevronRight size={14} strokeWidth={3} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // --- MODO VERTICAL (Sobre Clásico) ---
          <>
            {/* Sección Top (Los textos han sido removidos para manejarse como capas de texto) */}
            <div className="z-20 w-full flex-1 basis-0 min-h-0 flex flex-col justify-center items-center text-center">
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
                className="absolute top-0 left-0 right-0 h-36 sm:h-40 rounded-t-2xl transition-transform duration-700 origin-top shadow-md flex items-end justify-center pb-2 z-40"
                style={{ 
                  backgroundColor: flapColor,
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  transform: isOpen ? 'rotateX(180deg)' : 'rotateX(0deg)',
                }}
              >
                <div className="w-full h-full bg-black/5 pointer-events-none" />
              </div>

              {/* Sello de cera (Wax Seal) */}
              <div 
                className={`absolute left-1/2 top-36 sm:top-40 w-[72px] sm:w-[88px] h-[72px] sm:h-[88px] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.6)] border border-black/20 z-[60] transition-all duration-700 ${isOpen ? 'opacity-0 scale-150 pointer-events-none' : 'opacity-100 scale-100'}`}
                style={{ 
                  transform: 'translate(-50%, -65%)',
                  backgroundColor: sealColor,
                  backgroundImage: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0.3) 100%)'
                }}
              >
                <div className="absolute inset-1.5 sm:inset-2 rounded-full border border-white/20 shadow-[inset_0_3px_6px_rgba(0,0,0,0.5)] flex items-center justify-center">
                  {sealDesign === 'wax_heart' && <Heart size={24} className="text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:w-8 sm:h-8" fill="currentColor" />}
                  {sealDesign === 'wax_rings' && <Gift size={24} className="text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:w-8 sm:h-8" />}
                  {sealDesign === 'gold_seal' && <Award size={26} className="text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:w-10 sm:h-10" />}
                </div>
              </div>

              {/* Interior visible del Sobre */}
              <div 
                className="absolute inset-2 rounded-xl pointer-events-none opacity-40 border border-black/10"
                style={{ backgroundColor: innerColor }}
              />

              {/* Texto del Destinatario en la base del sobre (Removido para usar capas del lienzo) */}
              <div className="absolute left-2 right-2 top-44 sm:top-48 bottom-2 flex flex-col items-center justify-center rounded-xl">
              </div>
            </div>
          </>
        )}

      {/* Sección Partner (Footer) */}
      <div className="z-20 w-full flex-1 basis-0 min-h-0 flex flex-col items-center pb-2">
        <div className="flex-1 flex flex-col items-center justify-center w-full">
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
        </div>

        {settings.orientation !== 'horizontal' && (
          <div className="flex flex-col items-center justify-center mt-auto mb-2 gap-1.5">
             <span className="text-[9px] uppercase tracking-widest text-slate-500/60 font-semibold">
               Powered By
             </span>
             {partner && partner.logo ? (
               <img src={`/storage/${partner.logo}`} alt={partner.business_name} className="h-6 object-contain opacity-70 grayscale hover:grayscale-0 transition-all duration-500" />
             ) : (
               <div className="text-sm font-bold text-slate-400/80 uppercase tracking-widest opacity-70">{partner?.business_name || 'Invited Pro'}</div>
             )}
          </div>
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

      {(!settings.orientation || settings.orientation === 'vertical') ? (
        <>
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
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center opacity-60 border border-dashed border-white/20 rounded-xl bg-white/5">
          <Mail size={24} className="mb-2" />
          <p className="font-bold">Modo Horizontal</p>
          <p className="text-[10px] mt-1">Controles pendientes de configuración.</p>
        </div>
      )}
    </div>
  );
};
