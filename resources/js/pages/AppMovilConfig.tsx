import React, { useState, useEffect } from 'react';
import {
  Type,
  Palette,
  Image as ImageIcon,
  Hourglass,
  QrCode,
  Minus,
  Plus,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Upload,
  Trash2,
  Check,
  Save,
  Loader2,
  EyeOff,
  MousePointer2,
  MousePointerClick,
  ArrowLeft,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import MobileSimulator from '../components/events/MobileSimulator';
import GradientPickerModal, { GradientData } from '../components/events/GradientPickerModal';
import FontPickerModal from '../components/events/FontPickerModal';
import FontPicker from '../components/events/FontPicker';
import { StylePickerPopover } from '../components/StylePickerPopover';
import api from '../lib/api';

interface CtrlPixelPorcentageProps {
  value: number;
  unit: string;
  onChangeValue: (val: number) => void;
  onChangeUnit: (unit: string) => void;
  min?: number;
  max?: number;
}

const CtrlPixelPorcentage = ({
  value,
  unit,
  onChangeValue,
  onChangeUnit,
  min = -100,
  max = 300,
}: CtrlPixelPorcentageProps) => (
  <div className="flex items-center gap-1.5 w-full">
    {/* Stepper container: [-] [ valor ] [+] */}
    <div
      className="flex-1 flex items-center h-8 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] shadow-2xs min-w-0"
      style={{
        backgroundColor: 'var(--bg-app)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Botón Disminuir (-) */}
      <button
        type="button"
        onClick={() => onChangeValue(Math.max(min, (parseInt(value as any) || 0) - 1))}
        className="w-7 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--primary-accent)',
        }}
        title="Disminuir"
      >
        <Minus size={11} />
      </button>

      {/* Input de valor numérico */}
      <div className="flex-1 min-w-0 flex items-center justify-center px-1 h-full">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChangeValue(parseInt(e.target.value) || 0)}
          className="w-full h-full text-center bg-transparent outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          style={{ color: 'var(--text-main)' }}
        />
      </div>

      {/* Botón Aumentar (+) */}
      <button
        type="button"
        onClick={() => onChangeValue(Math.min(max, (parseInt(value as any) || 0) + 1))}
        className="w-7 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--primary-accent)',
        }}
        title="Aumentar"
      >
        <Plus size={11} />
      </button>
    </div>

    {/* Espacio + Selector de Unidad (% y px) */}
    <div
      className="flex items-center h-8 rounded-xl border p-0.5 shrink-0 shadow-2xs gap-0.5"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
      }}
    >
      {['px', '%'].map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => onChangeUnit(u)}
          className="px-2 h-full text-[9px] font-extrabold rounded-lg transition-all cursor-pointer flex items-center justify-center"
          style={{
            backgroundColor: unit === u ? 'var(--primary-accent)' : 'transparent',
            color: unit === u ? '#ffffff' : 'var(--text-muted)',
          }}
        >
          {u}
        </button>
      ))}
    </div>
  </div>
);

export default function AppMovilConfig() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<any>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(true);

  const [settings, setSettings] = useState<Record<string, any>>(() => {
    return {
      welcome_precarga_text: 'Cargando',
      precarga_title: 'Cargando',
      precarga_subtitle: 'Espere por favor',
      precarga_powered_by_text: 'Powered by',
      precarga_title_font_family: 'Inter',
      precarga_title_font_size: '14',
      precarga_title_font_color: '#ffffff',
      precarga_title_font_weight: 'bold',
      precarga_subtitle_font_family: 'Inter',
      precarga_subtitle_font_size: '10',
      precarga_subtitle_font_color: '#e2e8f0',
      precarga_powered_by_font_family: 'Inter',
      precarga_powered_by_font_size: '8.5',
      precarga_powered_by_font_color: 'rgba(255, 255, 255, 0.75)',
      welcome_button_text: 'Entrar',
      precarga_button_font_family: 'Inter',
      precarga_button_font_size: '13',
      precarga_button_font_color: '#ffffff',
      precarga_bg_type: 'color',
      precarga_bg_color: '#0f172a',
      precarga_card_bg_type: 'color',
      precarga_card_bg_color: '#000000',
      precarga_card_bg_opacity: 85,
      precarga_card_border_radius: 16,
      precarga_card_glass_enabled: true,
      button_bg_type: 'color',
      button_bg_color: '#E07A5F',
      button_border_radius: 12,
      button_bg_opacity: 100,
      button_glass_enabled: true,
      precarga_show_logo: true,
      partner_logo_show_precarga: true,
      project_logo_precarga_url: '/dinvited.png',
      partner_logo_precarga_size: 40,
      partner_logo_precarga_unit: 'px',
      partner_logo_precarga_position_v: 'bottom',
      partner_logo_precarga_position_h: 'center',
    };
  });

  const [precargaSubTab, setPrecargaSubTab] = useState<'fuentes' | 'fondos' | 'logos'>('fuentes');
  const [previewView, setPreviewView] = useState<string>('precarga');
  const [precargaTextTarget, setPrecargaTextTarget] = useState<'title' | 'subtitle' | 'button' | 'code' | 'powered_by'>('title');
  const [precargaContainerTarget, setPrecargaContainerTarget] = useState<'fondo' | 'mensaje' | 'input'>('fondo');
  const [buttonState, setButtonState] = useState<'normal' | 'hover'>('normal');
  const [precargaLogoState, setPrecargaLogoState] = useState<'precarga' | 'qr'>('precarga');
  const [containerTarget, setContainerTarget] = useState<'fondo' | 'mensaje' | 'botones'>('fondo');

  const [showGradientModal, setShowGradientModal] = useState(false);
  const [gradientTarget, setGradientTarget] = useState<string>('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const eventColors = ['#E07A5F', '#F2CC8F', '#52B788', '#E63946', '#0A0A0A', '#1E1B4B'];
  const eventColorImage = null;

  // Cargar configuración existente del template específico
  useEffect(() => {
    if (!id) return;
    setIsLoadingTemplate(true);
    api.get(`/mobile-templates/${id}`)
      .then((res) => {
        setTemplate(res.data);
        if (res.data?.settings && typeof res.data.settings === 'object' && Object.keys(res.data.settings).length > 0) {
          setSettings((prev) => ({ ...prev, ...res.data.settings }));
        }
      })
      .catch((err) => console.error('Error cargando template:', err))
      .finally(() => setIsLoadingTemplate(false));
  }, [id]);

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      if (id) {
        await api.put(`/mobile-templates/${id}`, { settings });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Error guardando template:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleElementSelect = (subTab: 'fuentes' | 'fondos' | 'logos', target?: string) => {
    setPrecargaSubTab(subTab);
    if (subTab === 'fuentes' && target) {
      setPrecargaTextTarget(target as any);
    } else if (subTab === 'fondos' && target) {
      setPrecargaContainerTarget(target as any);
    } else if (subTab === 'logos' && target) {
      setPrecargaLogoState(target as any);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full h-[calc(100vh-115px)] max-h-[calc(100vh-115px)]">
      {/* HEADER IDÉNTICO AL ESTILO DE PARTNERS CON BOTÓN VOLVER */}
      <div
        className="flex flex-col gap-4 rounded-none -mx-4 -mt-2 px-3 py-1.5 sm:flex-row sm:items-center sm:justify-between md:-mx-6 md:-mt-4 lg:-mx-8 lg:-mt-6 shrink-0"
        style={{
          borderLeft: '3px solid var(--primary-accent)',
          backgroundColor: 'var(--primary-accent-light)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/app-movil')}
            className="p-1.5 rounded-lg border hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--primary-accent)',
            }}
            title="Volver a lista de templates"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold leading-tight flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
              <span>App Móvil</span>
              {template && (
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider shrink-0"
                  style={{
                    backgroundColor: 'var(--primary-accent)',
                    color: '#ffffff',
                  }}
                >
                  {template.name}
                </span>
              )}
            </h1>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Configuración de Apariencia del Template
            </p>
          </div>
        </div>

        {/* BOTÓN GUARDAR EN LA FILA DEL HEADER (LADO DERECHO) */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSavingSettings}
            className="py-1.5 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm text-white hover:opacity-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: saveSuccess ? '#10B981' : 'var(--primary-accent)',
            }}
            title="Guardar o actualizar configuración de la app móvil"
          >
            {isSavingSettings ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Guardando...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check size={13} />
                <span>¡Guardado!</span>
              </>
            ) : (
              <>
                <Save size={13} />
                <span>Guardar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL: SIMULADOR Y CONFIGURACIÓN */}
      <div className="flex flex-col lg:flex-row gap-5 items-stretch flex-1 min-h-0 w-full overflow-hidden">
      {/* COLUMNA IZQUIERDA: PREVISUALIZACIÓN DE LA APP MÓVIL (MÓVIL + BOTONES DE ESTADO DE LA DERECHA) */}
      <div className="flex flex-col items-center justify-center h-full shrink-0">
        <div className="flex flex-col items-center justify-center h-full py-0">
          {/* ENVOLTORIO CONTENEDOR DEL PREVIEW (INCLUYE EL TELÉFONO Y LOS BOTONES FLOTANTES A SU DERECHA) */}
          <div className="relative flex items-center justify-center h-full max-h-full pr-14">
            {/* FRAME DEL TELÉFONO CON ASPECT RATIO DINÁMICO (9 : 18 -> FORMATO ANDROID INTERMEDIO ESTÁNDAR) */}
            <div
              className="h-full max-h-full aspect-[9/18] rounded-[22px] p-1.5 border-[4px] shadow-2xl relative flex flex-col justify-center shrink-0 overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
              }}
            >
              {/* Isla Dinámica / Notch del teléfono */}
              <div
                className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 rounded-full z-40 border flex items-center justify-end px-1"
                style={{
                  backgroundColor: 'var(--bg-app)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full border"
                  style={{
                    backgroundColor: 'var(--primary-accent)',
                    borderColor: 'var(--border-color)',
                  }}
                />
              </div>

              <MobileSimulator
                data={{ settings }}
                event={{ title: settings.welcome_title || 'App Móvil' }}
                previewView={previewView}
                previewButtonState={buttonState}
                onSelectElement={handleElementSelect}
              />
            </div>

            {/* BOTONES FLOTANTES INTEGRADOS CON LOS COLORES DEL PROYECTO */}
            <div
              className="absolute right-2 top-2 z-50 flex flex-col gap-1.5 p-1.5 rounded-xl border shadow-2xl shrink-0 backdrop-blur-md"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
              }}
            >
              {[
                { id: 'precarga', label: 'Precarga', icon: Hourglass },
                { id: 'qr', label: 'Escáner QR', icon: QrCode },
              ].map((viewItem) => {
                const Icon = viewItem.icon;
                const isActive = previewView === viewItem.id;
                return (
                  <button
                    key={viewItem.id}
                    type="button"
                    title={`Ver vista de ${viewItem.label}`}
                    onClick={() => {
                      setPreviewView(viewItem.id);
                      setPrecargaLogoState(viewItem.id as any);
                      if (viewItem.id === 'qr') {
                        if (precargaTextTarget === 'title' || precargaTextTarget === 'subtitle') {
                          setPrecargaTextTarget('button');
                        }
                        if (precargaContainerTarget === 'fondo') {
                          setPrecargaContainerTarget('mensaje');
                        }
                      } else {
                        if (precargaTextTarget === 'button' || precargaTextTarget === 'code') {
                          setPrecargaTextTarget('title');
                        }
                        if (precargaContainerTarget === 'input') {
                          setPrecargaContainerTarget('fondo');
                        }
                      }
                    }}
                    className="p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                    style={{
                      backgroundColor: isActive ? 'var(--primary-accent)' : 'var(--bg-app)',
                      color: isActive ? '#ffffff' : 'var(--text-muted)',
                      border: `1px solid ${isActive ? 'var(--primary-accent)' : 'var(--border-color)'}`,
                      boxShadow: isActive ? '0 0 8px var(--primary-accent-light)' : 'none',
                    }}
                  >
                    <Icon size={15} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA: PESTAÑAS Y CONTENIDO DE CONFIGURACIÓN (TOMA EL ANCHO SOBRANTE DINÁMICAMENTE) */}
      <div className="flex-1 space-y-3 flex flex-col h-full overflow-hidden min-w-0">
        {/* BARRA DE NAVEGACIÓN DE SUB-PESTAÑAS FIJA EN LA PARTE SUPERIOR */}
        <div className="flex p-1 rounded-xl border gap-1 shrink-0" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          {[
            { id: 'fuentes', label: 'Fuente', icon: Type },
            { id: 'fondos', label: 'Contenedor', icon: Palette },
            { id: 'logos', label: 'Logos', icon: ImageIcon },
          ].map((sub) => {
            const SubIcon = sub.icon;
            const isSubActive = precargaSubTab === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => {
                  setPrecargaSubTab(sub.id as any);
                }}
                className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                style={{
                  backgroundColor: isSubActive ? 'var(--primary-accent-light)' : 'transparent',
                  color: isSubActive ? 'var(--primary-accent)' : 'var(--text-muted)',
                  border: isSubActive ? '1px solid var(--primary-accent)' : '1px solid transparent',
                }}
              >
                <SubIcon size={14} />
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTENEDOR CON SCROLL ÚNICAMENTE PARA EL CONTENIDO */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4 pt-1">

          {/* CONTENIDO INTERNO DE PROGRAMA */}
          <div className="space-y-4">
            {/* 2.1.1 SUB-PESTAÑA FUENTES */}
            {precargaSubTab === 'fuentes' && (() => {
              const partnerEnabled = settings.precarga_show_logo ?? settings.partner_logo_show_precarga ?? true;
              const isQrView = previewView === 'qr';

              // Helper para renderizar cada elemento de texto como sección individual vertical
              const renderTextSection = (target: 'title' | 'subtitle' | 'button' | 'code' | 'powered_by') => {
                const isBtn = target === 'button';
                const isCode = target === 'code';
                const isPoweredBy = target === 'powered_by';
                const isH = isBtn && buttonState === 'hover';
                const isSectionActive = precargaTextTarget === target;

                const configMeta = {
                  title: {
                    label: 'Título Principal',
                    hint: 'Texto del loader de bienvenida',
                    defaultVal: 'Cargando',
                    defaultSize: 14,
                    defaultColor: '#ffffff',
                  },
                  subtitle: {
                    label: 'Subtítulo',
                    hint: 'Texto secundario de espera',
                    defaultVal: 'Espere por favor',
                    defaultSize: 10,
                    defaultColor: '#e2e8f0',
                  },
                  button: {
                    label: 'Botón Entrar',
                    hint: 'Botón principal de acción en pantalla QR',
                    defaultVal: 'Entrar',
                    defaultSize: 10,
                    defaultColor: '#ffffff',
                  },
                  code: {
                    label: 'Cuadro de Código QR',
                    hint: 'Placeholder del código de acceso',
                    defaultVal: 'CÓDIGO',
                    defaultSize: 11,
                    defaultColor: '#ffffff',
                  },
                  powered_by: {
                    label: 'Powered by',
                    hint: 'Créditos al pie de la pantalla',
                    defaultVal: 'Powered by',
                    defaultSize: 8.5,
                    defaultColor: '#ffffff',
                  },
                }[target];

                const isPoweredByDisabled = isPoweredBy && !partnerEnabled;

                // Valores de texto
                const textVal = isBtn
                  ? (settings.welcome_button_text ?? 'Entrar')
                  : isCode
                  ? (settings.welcome_qr_placeholder ?? 'CÓDIGO')
                  : target === 'title'
                  ? (settings.welcome_precarga_text ?? settings.precarga_title ?? 'Cargando')
                  : target === 'subtitle'
                  ? (settings.precarga_subtitle ?? 'Espere por favor')
                  : (settings.precarga_powered_by_text ?? 'Powered by');

                // Fuente
                const fontFamilyVal = isBtn
                  ? (settings.precarga_button_font_family || settings.global_button_font_family || 'Inter')
                  : isCode
                  ? (settings.qr_input_font_family || settings.global_text_font_family || 'Inter')
                  : target === 'title'
                  ? (settings.precarga_title_font_family || settings.global_title_font_family || 'Inter')
                  : target === 'subtitle'
                  ? (settings.precarga_subtitle_font_family || settings.global_text_font_family || 'Inter')
                  : (settings.precarga_powered_by_font_family || 'Inter');

                // Tamaño
                const sizeKey = isCode ? 'qr_input_font_size' : `precarga_${target}_font_size`;
                const currSize = parseFloat(settings[sizeKey] || configMeta.defaultSize.toString());

                // Formato
                const weightKey = isCode ? 'qr_input_font_weight' : `precarga_${target}_font_weight`;
                const styleKey = isCode ? 'qr_input_font_style' : `precarga_${target}_font_style`;
                const decorKey = isCode ? 'qr_input_text_decoration' : `precarga_${target}_text_decoration`;

                const isBold = settings[weightKey] === 'bold' || settings[weightKey] === '900' || ((target === 'title' || isBtn) && settings[weightKey] !== 'normal');
                const isItalic = settings[styleKey] === 'italic';
                const isUnderline = settings[decorKey] === 'underline';

                // Alineación
                const alignKey = isCode ? 'qr_input_text_align' : `precarga_${target}_text_align`;
                const currAlign = settings[alignKey] || 'center';

                // Estilo (Color, Contorno, Sombra)
                const colorKey = isBtn
                  ? (isH ? 'precarga_button_hover_font_color' : 'precarga_button_font_color')
                  : isCode
                  ? 'qr_input_font_color'
                  : `precarga_${target}_font_color`;
                const strokeActiveKey = isBtn ? (isH ? 'precarga_button_hover_stroke_active' : 'precarga_button_stroke_active') : `precarga_${target}_stroke_active`;
                const strokeColorKey = isBtn ? (isH ? 'precarga_button_hover_stroke_color' : 'precarga_button_stroke_color') : `precarga_${target}_stroke_color`;
                const strokeWidthKey = isBtn ? (isH ? 'precarga_button_hover_stroke_width' : 'precarga_button_stroke_width') : `precarga_${target}_stroke_width`;
                const strokeTypeKey = isBtn ? (isH ? 'precarga_button_hover_stroke_type' : 'precarga_button_stroke_type') : `precarga_${target}_stroke_type`;
                const shadowActiveKey = isBtn ? (isH ? 'precarga_button_hover_shadow_active' : 'precarga_button_shadow_active') : `precarga_${target}_shadow_active`;
                const shadowColorKey = isBtn ? (isH ? 'precarga_button_hover_shadow_color' : 'precarga_button_shadow_color') : `precarga_${target}_shadow_color`;
                const shadowBlurKey = isBtn ? (isH ? 'precarga_button_hover_shadow_blur' : 'precarga_button_shadow_blur') : `precarga_${target}_shadow_blur`;

                return (
                  <div
                    key={target}
                    id={`font-section-${target}`}
                    className="rounded-lg p-3.5 border space-y-3 shadow-2xs transition-all"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    {/* Encabezado de la Sección */}
                    <div className="pb-2 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="flex items-center gap-2">
                        <Type size={16} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                            {configMeta.label}
                          </h4>
                          <span className="text-[10px] font-semibold opacity-70" style={{ color: 'var(--text-muted)' }}>
                            {configMeta.hint}
                          </span>
                        </div>
                      </div>

                      {/* Si es botón: Switch de estado Normal / Sobre */}
                      {isBtn && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>
                            Estado:
                          </span>
                          <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                            {[
                              { id: 'normal', label: 'Normal' },
                              { id: 'hover', label: 'Sobre' },
                            ].map((modeItem) => {
                              const isModeActive = buttonState === modeItem.id;
                              return (
                                <button
                                  key={modeItem.id}
                                  type="button"
                                  onClick={() => setButtonState(modeItem.id as any)}
                                  className="botab-item"
                                  style={{
                                    backgroundColor: isModeActive ? 'var(--primary-accent)' : 'transparent',
                                    color: isModeActive ? '#ffffff' : 'var(--text-muted)',
                                  }}
                                >
                                  {modeItem.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Advertencia si Powered by está desactivado */}
                    {isPoweredByDisabled && (
                      <div className="p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}>
                        <EyeOff size={16} className="shrink-0" />
                        <span>El texto "Powered by" está desactivado. Activa su visibilidad en la pestaña <strong>Logos</strong> para habilitar su edición.</span>
                      </div>
                    )}

                    {/* Fila de controles */}
                    <div className={`flex flex-col md:flex-row items-stretch md:items-end gap-3 ${isPoweredByDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                      {/* 1. Texto / Placeholder */}
                      <div className="w-full md:w-52 shrink-0">
                        <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                          {isCode ? 'Placeholder de Código' : isBtn ? 'Texto del Botón' : 'Texto a mostrar'}
                        </label>
                        <input
                          type="text"
                          disabled={isPoweredByDisabled}
                          value={textVal}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const val = e.target.value;
                            if (isBtn) {
                              updateSetting('welcome_button_text', val);
                            } else if (isCode) {
                              updateSetting('welcome_qr_placeholder', val);
                            } else if (target === 'title') {
                              updateSetting('welcome_precarga_text', val);
                              updateSetting('precarga_title', val);
                            } else if (target === 'subtitle') {
                              updateSetting('precarga_subtitle', val);
                            } else {
                              updateSetting('precarga_powered_by_text', val);
                            }
                          }}
                          placeholder={`Ej: ${configMeta.defaultVal}`}
                          className="w-full h-9 rounded-xl px-3 border outline-none text-xs font-medium"
                          style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                        />
                      </div>

                      {/* 2. Fuente */}
                      <div className="flex-1 min-w-[180px]">
                        <FontPicker
                          label="Fuente"
                          value={fontFamilyVal}
                          onChange={(f: string) => {
                            if (isBtn) {
                              updateSetting('precarga_button_font_family', f);
                              updateSetting('global_button_font_family', f);
                            } else if (isCode) {
                              updateSetting('qr_input_font_family', f);
                            } else {
                              updateSetting(`precarga_${target}_font_family`, f);
                            }
                          }}
                        />
                      </div>

                      {/* 3. Tamaño */}
                      <div className="w-full md:w-36 shrink-0">
                        <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                          Tamaño
                        </label>
                        <div
                          className="flex items-center h-9 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full shadow-2xs"
                          style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              const nextVal = Math.max(5, currSize - 0.5);
                              updateSetting(sizeKey, nextVal.toString());
                              if (isBtn) updateSetting('global_button_font_size', nextVal.toString());
                            }}
                            className="w-8 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                            title="Disminuir tamaño"
                          >
                            <Minus size={12} />
                          </button>

                          <div className="flex-1 flex items-center justify-center px-1">
                            <input
                              type="number"
                              min={5}
                              max={80}
                              step={0.5}
                              value={settings[sizeKey] || configMeta.defaultSize.toString()}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                updateSetting(sizeKey, e.target.value);
                                if (isBtn) updateSetting('global_button_font_size', e.target.value);
                              }}
                              className="w-full h-full text-center bg-transparent outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              style={{ color: 'var(--text-main)' }}
                            />
                            <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>
                              px
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const nextVal = Math.min(80, currSize + 0.5);
                              updateSetting(sizeKey, nextVal.toString());
                              if (isBtn) updateSetting('global_button_font_size', nextVal.toString());
                            }}
                            className="w-8 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--primary-accent)' }}
                            title="Aumentar tamaño"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      {/* 4. Formato (Negrita, Itálica, Subrayado) */}
                      <div className="w-full md:w-28 shrink-0">
                        <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                          Formato
                        </label>
                        <div
                          className="flex items-center h-9 rounded-xl border p-0.5 gap-0.5 shadow-2xs"
                          style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                        >
                          <button
                            type="button"
                            onClick={() => updateSetting(weightKey, isBold ? 'normal' : 'bold')}
                            className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                            style={{
                              backgroundColor: isBold ? 'var(--primary-accent)' : 'transparent',
                              color: isBold ? '#ffffff' : 'var(--text-muted)',
                            }}
                            title="Negrita"
                          >
                            <Bold size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateSetting(styleKey, isItalic ? 'normal' : 'italic')}
                            className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                            style={{
                              backgroundColor: isItalic ? 'var(--primary-accent)' : 'transparent',
                              color: isItalic ? '#ffffff' : 'var(--text-muted)',
                            }}
                            title="Itálica"
                          >
                            <Italic size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateSetting(decorKey, isUnderline ? 'none' : 'underline')}
                            className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                            style={{
                              backgroundColor: isUnderline ? 'var(--primary-accent)' : 'transparent',
                              color: isUnderline ? '#ffffff' : 'var(--text-muted)',
                            }}
                            title="Subrayado"
                          >
                            <Underline size={13} />
                          </button>
                        </div>
                      </div>

                      {/* 5. Alineación */}
                      <div className="w-full md:w-32 shrink-0">
                        <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Alineación</label>
                        <div className="flex items-center h-9 rounded-xl border p-0.5 gap-0.5 shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                          {[
                            { id: 'left', icon: AlignLeft, title: 'Izquierda' },
                            { id: 'center', icon: AlignCenter, title: 'Centro' },
                            { id: 'right', icon: AlignRight, title: 'Derecha' },
                            { id: 'justify', icon: AlignJustify, title: 'Justificado' },
                          ].map((align) => {
                            const AlignIcon = align.icon;
                            const isAlignActive = currAlign === align.id;
                            return (
                              <button
                                key={align.id}
                                type="button"
                                onClick={() => {
                                  updateSetting(alignKey, align.id);
                                  if (isBtn) updateSetting('global_button_text_align', align.id);
                                }}
                                className="flex-1 h-full rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                style={{
                                  backgroundColor: isAlignActive ? 'var(--primary-accent)' : 'transparent',
                                  color: isAlignActive ? '#ffffff' : 'var(--text-muted)',
                                }}
                                title={align.title}
                              >
                                <AlignIcon size={13} />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 6. Estilo (Color, Contorno, Sombra) */}
                      <div className="w-full md:w-32 shrink-0">
                        <StylePickerPopover
                          label={isBtn ? `Estilo (${isH ? 'Sobre' : 'Normal'})` : 'Estilo texto'}
                          elementType="text"
                          eventColors={eventColors}
                          eventColorImage={eventColorImage}
                          styleConfig={{
                            fillType: 'color',
                            fillColor: settings[colorKey] || (isH ? '#ffffff' : configMeta.defaultColor),
                            strokeActive: settings[strokeActiveKey] || false,
                            strokeColor: settings[strokeColorKey] || '#000000',
                            strokeWidth: parseInt(settings[strokeWidthKey] || '2'),
                            strokeType: settings[strokeTypeKey] || 'OUT',
                            shadowActive: settings[shadowActiveKey] || false,
                            shadowColor: settings[shadowColorKey] || '#000000',
                            shadowBlur: parseInt(settings[shadowBlurKey] || '8'),
                          }}
                          onChange={(updated: any) => {
                            if (updated.fillColor) {
                              updateSetting(colorKey, updated.fillColor);
                              if (isBtn) updateSetting(isH ? 'global_button_hover_text' : 'global_button_text', updated.fillColor);
                            }
                            if (updated.strokeActive !== undefined) updateSetting(strokeActiveKey, updated.strokeActive);
                            if (updated.strokeColor) updateSetting(strokeColorKey, updated.strokeColor);
                            if (updated.strokeWidth !== undefined) updateSetting(strokeWidthKey, updated.strokeWidth.toString());
                            if (updated.strokeType) updateSetting(strokeTypeKey, updated.strokeType);
                            if (updated.shadowActive !== undefined) updateSetting(shadowActiveKey, updated.shadowActive);
                            if (updated.shadowColor) updateSetting(shadowColorKey, updated.shadowColor);
                            if (updated.shadowBlur !== undefined) updateSetting(shadowBlurKey, updated.shadowBlur.toString());
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              };

              return (
                <div className="space-y-4">
                  {/* BARRA SUPERIOR: SELECTOR DE PANTALLA (PRECARGA / ESCÁNER QR) */}
                  <div
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border gap-2.5 shadow-2xs"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Type size={18} style={{ color: 'var(--primary-accent)' }} />
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                          Fuentes y Textos
                        </h3>
                        <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                          {isQrView ? 'Editando textos de la pantalla Escáner QR' : 'Editando textos de la pantalla de Precarga'}
                        </p>
                      </div>
                    </div>

                    {/* BOTONES PRECARGA Y ESCÁNER QR */}
                    <div
                      className="flex items-center p-1 rounded-lg border gap-1 self-stretch sm:self-auto"
                      style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewView('precarga');
                          setPrecargaLogoState('precarga');
                        }}
                        className="flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        style={{
                          backgroundColor: !isQrView ? 'var(--primary-accent)' : 'transparent',
                          color: !isQrView ? '#ffffff' : 'var(--text-muted)',
                        }}
                      >
                        <Hourglass size={13} />
                        <span>Precarga</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewView('qr');
                          setPrecargaLogoState('qr');
                        }}
                        className="flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        style={{
                          backgroundColor: isQrView ? 'var(--primary-accent)' : 'transparent',
                          color: isQrView ? '#ffffff' : 'var(--text-muted)',
                        }}
                      >
                        <QrCode size={13} />
                        <span>Escáner QR</span>
                      </button>
                    </div>
                  </div>

                  {/* SECCIONES APILADAS VERTICALMENTE UNA DEBAJO DE LA OTRA */}
                  <div className="space-y-3.5">
                    {!isQrView ? (
                      <>
                        {renderTextSection('title')}
                        {renderTextSection('subtitle')}
                        {renderTextSection('powered_by')}
                      </>
                    ) : (
                      <>
                        {renderTextSection('button')}
                        {renderTextSection('code')}
                        {renderTextSection('powered_by')}
                      </>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 2.1.2 SUB-PESTAÑA CONTENEDOR EN PRECARGA / QR (2 COLUMNAS COMO GENERAL) */}
            {precargaSubTab === 'fondos' && (() => {
              const isQrView = previewView === 'qr';
              const effectiveLeftTarget = isQrView
                ? (precargaContainerTarget === 'fondo' ? 'mensaje' : precargaContainerTarget)
                : (precargaContainerTarget === 'input' ? 'fondo' : precargaContainerTarget);

              const isFondoTarget = effectiveLeftTarget === 'fondo';
              const isInputTarget = effectiveLeftTarget === 'input';
              const prefix = isFondoTarget ? 'precarga_screen' : 'precarga_card';
              const bgTypeKey = isFondoTarget ? 'precarga_bg_type' : 'precarga_card_bg_type';
              const bgColorKey = isFondoTarget ? 'precarga_bg_color' : 'precarga_card_bg_color';
              const gradKey = isFondoTarget ? 'precarga_bg_gradient' : 'precarga_card_gradient_data';
              const imageKey = isFondoTarget ? 'precarga_bg_image_url' : 'precarga_card_image_url';
              const videoRotateKey = `${prefix}_video_rotate`;
              const useMediaKey = `${prefix}_use_media`;
              const useMedia = settings[useMediaKey] ?? true;

              const imageUrl = settings[imageKey] || (isFondoTarget ? (settings.precarga_bg_image_url || '') : '');
              const bgType = settings[bgTypeKey] || (isFondoTarget ? (settings.precarga_bg_type || 'color') : 'color');
              const videoRotate = !!settings[videoRotateKey];

              const buttonPrefix = buttonState === 'hover' ? 'button_hover' : 'button';
              const buttonImageKey = `${buttonPrefix}_image_url`;
              const buttonBgTypeKey = `${buttonPrefix}_bg_type`;
              const buttonVideoRotateKey = `${buttonPrefix}_video_rotate`;
              const buttonUseMediaKey = `${buttonPrefix}_use_media`;
              const buttonUseMedia = settings[buttonUseMediaKey] ?? true;
              const buttonImageUrl = settings[buttonImageKey] || '';
              const buttonBgType = settings[buttonBgTypeKey] || 'color';
              const buttonVideoRotate = !!settings[buttonVideoRotateKey];

              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* COLUMNA IZQUIERDA: CONTENEDORES */}
                  <div className="rounded-2xl p-3 border space-y-3 shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                    <div>
                      <div className="pb-2 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex items-center gap-2">
                          <Palette size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                          <div className="flex flex-col leading-tight">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                              <span>Contenedores</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase text-white shadow-2xs" style={{ backgroundColor: 'var(--primary-accent)' }}>
                                {isQrView ? 'Escáner QR' : 'Precarga'}
                              </span>
                            </h3>
                            <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                              {isQrView
                                ? (isInputTarget ? 'Estilo del cuadro de código QR' : 'Fondo y media luna cóncava')
                                : (isFondoTarget ? 'Fondo general de pantalla' : 'Recuadro central de carga')}
                            </span>
                          </div>
                        </div>

                        {/* SELECTORES DE PANTALLA Y CONTENEDOR */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Selector de Pantalla */}
                          <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                            {[
                              { id: 'precarga', label: 'Precarga', icon: Hourglass },
                              { id: 'qr', label: 'QR', icon: QrCode },
                            ].map((vw) => {
                              const Icon = vw.icon;
                              const isVwActive = previewView === vw.id;
                              return (
                                <button
                                  key={vw.id}
                                  type="button"
                                  onClick={() => {
                                    setPreviewView(vw.id);
                                    setPrecargaLogoState(vw.id as any);
                                    if (vw.id === 'qr') setPrecargaContainerTarget('mensaje');
                                    else setPrecargaContainerTarget('fondo');
                                  }}
                                  className="botab-item"
                                  style={{
                                    backgroundColor: isVwActive ? 'var(--primary-accent)' : 'transparent',
                                    color: isVwActive ? '#ffffff' : 'var(--text-muted)',
                                  }}
                                >
                                  <Icon size={12} />
                                  <span>{vw.label}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* PESTAÑAS DE CONTENEDOR */}
                          <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                            {(isQrView
                              ? [
                                  { id: 'mensaje', label: 'Media Luna' },
                                  { id: 'input', label: 'Cuadro Código' },
                                ]
                              : [
                                  { id: 'fondo', label: 'Fondo' },
                                  { id: 'mensaje', label: 'Recuadro' },
                                ]
                            ).map((cTarget) => {
                              const isCTargetActive = effectiveLeftTarget === cTarget.id;
                              return (
                                <button
                                  key={cTarget.id}
                                  type="button"
                                  onClick={() => setPrecargaContainerTarget(cTarget.id as any)}
                                  className="botab-item"
                                  style={{
                                    backgroundColor: isCTargetActive ? 'var(--primary-accent)' : 'transparent',
                                    color: isCTargetActive ? '#ffffff' : 'var(--text-muted)',
                                  }}
                                >
                                  {cTarget.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        {isInputTarget ? (
                          /* CONTROLES ESPECÍFICOS PARA CUADRO DE CÓDIGO QR */
                          <div className="space-y-3 pt-1">
                            <div className="p-2 rounded-xl border flex items-center gap-2 text-xs font-semibold shadow-2xs" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                              <QrCode size={16} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                              <span>Configura los colores, bordes y redondez del cuadro de texto donde el invitado escribe su código.</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end pt-1">
                              {/* Estilo / Color de Fondo y Borde del Cuadro */}
                              <div>
                                <StylePickerPopover
                                  label="Fondo y Bordes"
                                  elementType="box"
                                  eventColors={eventColors}
                                  eventColorImage={eventColorImage}
                                  styleConfig={{
                                    backgroundColor: settings.qr_input_bg_color || 'rgba(0, 0, 0, 0.6)',
                                    borderWidth: settings.qr_input_border_width ?? 1,
                                    borderStyle: settings.qr_input_border_style || 'solid',
                                    borderColor: settings.qr_input_border_color || 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: settings.qr_input_border_radius ?? 8,
                                  }}
                                  onChange={(updated: any) => {
                                    const selectedColor = updated.backgroundColor || updated.fillColor;
                                    if (selectedColor) updateSetting('qr_input_bg_color', selectedColor);
                                    if (updated.borderWidth !== undefined) updateSetting('qr_input_border_width', updated.borderWidth);
                                    if (updated.borderStyle !== undefined) updateSetting('qr_input_border_style', updated.borderStyle);
                                    if (updated.borderColor !== undefined) updateSetting('qr_input_border_color', updated.borderColor);
                                    if (updated.borderRadius !== undefined) updateSetting('qr_input_border_radius', updated.borderRadius);
                                  }}
                                />
                              </div>

                              {/* Redondez Cuadro */}
                              <div>
                                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                  Redondez
                                </label>
                                <div
                                  className="flex items-center h-9 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full shadow-2xs"
                                  style={{
                                    backgroundColor: 'var(--bg-app)',
                                    borderColor: 'var(--border-color)',
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const curr = parseInt(settings.qr_input_border_radius ?? 8);
                                      updateSetting('qr_input_border_radius', Math.max(0, curr - 2));
                                    }}
                                    className="w-8 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                    style={{
                                      backgroundColor: 'var(--bg-card)',
                                      borderColor: 'var(--border-color)',
                                      color: 'var(--primary-accent)',
                                    }}
                                    title="Disminuir redondez"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <div className="flex-1 flex items-center justify-center px-1">
                                    <input
                                      type="number"
                                      min={0}
                                      max={50}
                                      value={settings.qr_input_border_radius ?? 8}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        updateSetting('qr_input_border_radius', parseInt(e.target.value) || 0);
                                      }}
                                      className="w-full h-full text-center bg-transparent outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      style={{ color: 'var(--text-main)' }}
                                    />
                                    <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>
                                      px
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const curr = parseInt(settings.qr_input_border_radius ?? 8);
                                      updateSetting('qr_input_border_radius', Math.min(50, curr + 2));
                                    }}
                                    className="w-8 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                    style={{
                                      backgroundColor: 'var(--bg-card)',
                                      borderColor: 'var(--border-color)',
                                      color: 'var(--primary-accent)',
                                    }}
                                    title="Aumentar redondez"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                              </div>

                              {/* Glass Blur Cuadro */}
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                    Glass (Blur)
                                  </label>
                                  <label className="relative flex items-center cursor-pointer shrink-0 select-none">
                                    <input
                                      type="checkbox"
                                      checked={settings.qr_input_glass_enabled ?? true}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        updateSetting('qr_input_glass_enabled', e.target.checked);
                                      }}
                                      className="sr-only peer"
                                    />
                                    <div
                                      className="w-4 h-4 rounded border flex items-center justify-center transition-all peer-checked:border-[var(--primary-accent)] peer-checked:bg-[var(--primary-accent)]"
                                      style={{
                                        borderColor: (settings.qr_input_glass_enabled ?? true) ? 'var(--primary-accent)' : 'var(--border-color)',
                                        backgroundColor: (settings.qr_input_glass_enabled ?? true) ? 'var(--primary-accent)' : 'var(--bg-card)',
                                      }}
                                    >
                                      {(settings.qr_input_glass_enabled ?? true) && (
                                        <Check size={11} className="text-white stroke-[3]" />
                                      )}
                                    </div>
                                  </label>
                                </div>
                                <div className="flex items-center h-9 rounded-xl border px-3" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                  <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Desenfoque suave</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* CONTROLES PARA FONDO GENERAL O MEDIA LUNA / RECUADRO */
                          <>
                            {/* SUBIR IMAGEN / VIDEO DEL CONTENEDOR */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                  Imagen / Video ({isFondoTarget ? 'Fondo General' : isQrView ? 'Media Luna' : 'Recuadro Central'})
                                </label>
                                <div className="flex items-center gap-3">
                                  <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer select-none" style={{ color: 'var(--text-muted)' }} title="Rotar orientación de video 90° en la pantalla del teléfono">
                                    <input
                                      type="checkbox"
                                      checked={videoRotate}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting(videoRotateKey, e.target.checked)}
                                      className="rounded border-gray-400 focus:ring-0 h-3 w-3 cursor-pointer"
                                      style={{ accentColor: 'var(--primary-accent)' }}
                                    />
                                    <span>Rotar</span>
                                  </label>
                                  <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer select-none" style={{ color: 'var(--text-muted)' }} title="Habilitar o deshabilitar el uso de la imagen/video">
                                    <input
                                      type="checkbox"
                                      checked={useMedia}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting(useMediaKey, e.target.checked)}
                                      className="rounded border-gray-400 focus:ring-0 h-3 w-3 cursor-pointer"
                                      style={{ accentColor: 'var(--primary-accent)' }}
                                    />
                                    <span>Utilizar</span>
                                  </label>
                                </div>
                              </div>
                              
                              <div
                                className="border-2 border-dashed rounded-2xl p-2 text-center flex flex-col items-center justify-center transition-all relative overflow-hidden group h-[120px] min-h-[120px]"
                                style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                              >
                                {imageUrl ? (
                                  <div className="relative w-full h-full rounded-xl overflow-hidden group bg-black/40 flex items-center justify-center">
                                    {bgType === 'video' || String(imageUrl).startsWith('data:video') || String(imageUrl).match(/\.(mp4|webm|ogg)$/i) ? (
                                      <video
                                        src={imageUrl}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-contain"
                                      />
                                    ) : (
                                      <img
                                        src={imageUrl}
                                        alt="Imagen de fondo"
                                        className="w-full h-full object-contain"
                                      />
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <label className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/40 cursor-pointer transition-colors" title="Cambiar archivo">
                                        <Upload size={16} />
                                        <input
                                          type="file"
                                          accept="image/*,video/*"
                                          className="hidden"
                                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const isVideo = file.type.startsWith('video/');
                                              const reader = new FileReader();
                                              reader.onload = (ev) => {
                                                updateSetting(imageKey, ev.target?.result);
                                                updateSetting(bgTypeKey, isVideo ? 'video' : 'image');
                                                if (isFondoTarget) updateSetting('precarga_bg_type', isVideo ? 'video' : 'image');
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                        />
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          updateSetting(imageKey, '');
                                          if (isFondoTarget) updateSetting('precarga_bg_image_url', '');
                                        }}
                                        className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-600 transition-colors"
                                        title="Eliminar archivo"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                                    <div className="p-2.5 rounded-full mb-1.5" style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}>
                                      <Upload size={18} />
                                    </div>
                                    <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Subir Imagen / Video</span>
                                    <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>PNG, JPG, MP4 o WEBM</span>
                                    <input
                                      type="file"
                                      accept="image/*,video/*"
                                      className="hidden"
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const isVideo = file.type.startsWith('video/');
                                          const reader = new FileReader();
                                          reader.onload = (ev) => {
                                            updateSetting(imageKey, ev.target?.result);
                                            updateSetting(bgTypeKey, isVideo ? 'video' : 'image');
                                            if (isFondoTarget) {
                                              updateSetting('precarga_bg_image_url', ev.target?.result);
                                              updateSetting('precarga_bg_type', isVideo ? 'video' : 'image');
                                            }
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                    />
                                  </label>
                                )}
                              </div>
                            </div>

                            {/* CONTROLES: ESTILO, REDONDEZ, GLASS */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end pt-1">
                              {/* Estilo */}
                              <div>
                                <StylePickerPopover
                                  label="Estilo"
                                  elementType="box"
                                  eventColors={eventColors}
                                  eventColorImage={eventColorImage}
                                  styleConfig={{
                                    backgroundColor: settings[bgTypeKey] === 'gradient' && settings[gradKey]
                                      ? (typeof settings[gradKey] === 'string' ? settings[gradKey] : settings[bgColorKey] || (isFondoTarget ? '#0f172a' : '#000000'))
                                      : (settings[bgColorKey] || (isFondoTarget ? '#0f172a' : '#000000')),
                                    borderWidth: settings[`${prefix}_border_width`] ?? 0,
                                    borderStyle: settings[`${prefix}_border_style`] || 'solid',
                                    borderColor: settings[`${prefix}_border_color`] || '#E07A5F',
                                    borderRadius: settings[`${prefix}_border_radius`] ?? (isFondoTarget ? 0 : 16),
                                    shadowColor: settings[`${prefix}_shadow_color`] || '#000000',
                                    shadowBlur: settings[`${prefix}_shadow_blur`] ?? 0,
                                    shadowOffsetX: settings[`${prefix}_shadow_offset_x`] ?? 0,
                                    shadowOffsetY: settings[`${prefix}_shadow_offset_y`] ?? 0,
                                  }}
                                  onChange={(updated: any) => {
                                    const selectedColor = updated.backgroundColor || updated.fillColor;
                                    const selectedGradient = updated.fillGradient;

                                    if (updated.fillType === 'gradient' && selectedGradient) {
                                      updateSetting(bgTypeKey, 'gradient');
                                      updateSetting(gradKey, selectedGradient);
                                      if (isFondoTarget) {
                                        updateSetting('precarga_bg_type', 'gradient');
                                        updateSetting('precarga_bg_gradient', selectedGradient);
                                      }
                                    } else if (selectedColor) {
                                      if (typeof selectedColor === 'string' && selectedColor.includes('gradient')) {
                                        updateSetting(bgTypeKey, 'gradient');
                                        updateSetting(gradKey, selectedColor);
                                        if (isFondoTarget) {
                                          updateSetting('precarga_bg_type', 'gradient');
                                          updateSetting('precarga_bg_gradient', selectedColor);
                                        }
                                      } else {
                                        updateSetting(bgTypeKey, 'color');
                                        updateSetting(bgColorKey, selectedColor);
                                        if (isFondoTarget) {
                                          updateSetting('precarga_bg_type', 'color');
                                          updateSetting('precarga_bg_color', selectedColor);
                                        }
                                      }
                                    }

                                    if (updated.borderWidth !== undefined) updateSetting(`${prefix}_border_width`, updated.borderWidth);
                                    if (updated.borderStyle !== undefined) updateSetting(`${prefix}_border_style`, updated.borderStyle);
                                    if (updated.borderColor !== undefined) updateSetting(`${prefix}_border_color`, updated.borderColor);
                                    if (updated.borderRadius !== undefined) updateSetting(`${prefix}_border_radius`, updated.borderRadius);
                                    if (updated.shadowColor !== undefined) updateSetting(`${prefix}_shadow_color`, updated.shadowColor);
                                    if (updated.shadowBlur !== undefined) updateSetting(`${prefix}_shadow_blur`, updated.shadowBlur);
                                    if (updated.shadowOffsetX !== undefined) updateSetting(`${prefix}_shadow_offset_x`, updated.shadowOffsetX);
                                    if (updated.shadowOffsetY !== undefined) updateSetting(`${prefix}_shadow_offset_y`, updated.shadowOffsetY);
                                  }}
                                />
                              </div>

                              {/* Redondez */}
                              <div>
                                <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                                  Redondez
                                </label>
                                <div
                                  className="flex items-center h-9 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full shadow-2xs"
                                  style={{
                                    backgroundColor: 'var(--bg-app)',
                                    borderColor: 'var(--border-color)',
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const key = `${prefix}_border_radius`;
                                      const curr = parseInt(settings[key] ?? (isFondoTarget ? '0' : '16'));
                                      const nextVal = Math.max(0, curr - 2);
                                      updateSetting(key, nextVal);
                                    }}
                                    className="w-8 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                    style={{
                                      backgroundColor: 'var(--bg-card)',
                                      borderColor: 'var(--border-color)',
                                      color: 'var(--primary-accent)',
                                    }}
                                    title="Disminuir redondez"
                                  >
                                    <Minus size={12} />
                                  </button>

                                  <div className="flex-1 flex items-center justify-center px-1">
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={settings[`${prefix}_border_radius`] ?? (isFondoTarget ? 0 : 16)}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const key = `${prefix}_border_radius`;
                                        updateSetting(key, parseInt(e.target.value) || 0);
                                      }}
                                      className="w-full h-full text-center bg-transparent outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      style={{ color: 'var(--text-main)' }}
                                    />
                                    <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>
                                      px
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const key = `${prefix}_border_radius`;
                                      const curr = parseInt(settings[key] ?? (isFondoTarget ? '0' : '16'));
                                      const nextVal = Math.min(100, curr + 2);
                                      updateSetting(key, nextVal);
                                    }}
                                    className="w-8 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                    style={{
                                      backgroundColor: 'var(--bg-card)',
                                      borderColor: 'var(--border-color)',
                                      color: 'var(--primary-accent)',
                                    }}
                                    title="Aumentar redondez"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                              </div>

                              {/* Glass / Cristal */}
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                    Glass (Blur)
                                  </label>
                                  <label className="relative flex items-center cursor-pointer shrink-0 select-none">
                                    <input
                                      type="checkbox"
                                      checked={
                                        isFondoTarget
                                          ? (settings.precarga_screen_glass_enabled ?? false)
                                          : (settings.precarga_card_glass_enabled ?? true)
                                      }
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const key = isFondoTarget ? 'precarga_screen_glass_enabled' : 'precarga_card_glass_enabled';
                                        updateSetting(key, e.target.checked);
                                      }}
                                      className="sr-only peer"
                                    />
                                    <div
                                      className="w-4 h-4 rounded border flex items-center justify-center transition-all peer-checked:border-[var(--primary-accent)] peer-checked:bg-[var(--primary-accent)]"
                                      style={{
                                        borderColor: (isFondoTarget ? (settings.precarga_screen_glass_enabled ?? false) : (settings.precarga_card_glass_enabled ?? true)) ? 'var(--primary-accent)' : 'var(--border-color)',
                                        backgroundColor: (isFondoTarget ? (settings.precarga_screen_glass_enabled ?? false) : (settings.precarga_card_glass_enabled ?? true)) ? 'var(--primary-accent)' : 'var(--bg-card)',
                                      }}
                                    >
                                      {(isFondoTarget ? (settings.precarga_screen_glass_enabled ?? false) : (settings.precarga_card_glass_enabled ?? true)) && (
                                        <Check size={11} className="text-white stroke-[3]" />
                                      )}
                                    </div>
                                  </label>
                                </div>

                                <div
                                  className={`flex items-center h-9 rounded-xl border px-3 transition-opacity ${
                                    !(isFondoTarget ? (settings.precarga_screen_glass_enabled ?? false) : (settings.precarga_card_glass_enabled ?? true)) ? 'opacity-40 pointer-events-none' : ''
                                  }`}
                                  style={{
                                    backgroundColor: 'var(--bg-app)',
                                    borderColor: 'var(--border-color)',
                                  }}
                                >
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={settings[`${prefix}_bg_opacity`] ?? 100}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting(`${prefix}_bg_opacity`, parseInt(e.target.value))}
                                    className="w-full accent-[var(--primary-accent)] cursor-pointer h-1.5 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none"
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* COLUMNA DERECHA: BOTONES (NORMAL / SOBRE) */}
                  <div className="rounded-2xl p-3 border space-y-3 shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                    <div>
                      <div className="pb-2 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex items-center gap-2">
                          <MousePointerClick size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                          <div className="flex flex-col leading-tight">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                              Botones ({buttonState === 'hover' ? 'Sobre' : 'Normal'})
                            </h3>
                            <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                              Estilos y efectos de botón
                            </span>
                          </div>
                        </div>

                        {/* PESTAÑAS NORMAL / SOBRE */}
                        <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                          {[
                            { id: 'normal', label: 'Normal' },
                            { id: 'hover', label: 'Sobre' },
                          ].map((modeItem) => {
                            const isModeActive = buttonState === modeItem.id;
                            return (
                              <button
                                key={modeItem.id}
                                type="button"
                                onClick={() => setButtonState(modeItem.id as any)}
                                className="botab-item"
                                style={{
                                  backgroundColor: isModeActive ? 'var(--primary-accent)' : 'transparent',
                                  color: isModeActive ? '#ffffff' : 'var(--text-muted)',
                                }}
                              >
                                {modeItem.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        {/* AVISO CONTEXTUAL SI SE ESTÁ EN PRECARGA */}
                        {!isQrView && (
                          <div
                            onClick={() => setPreviewView('qr')}
                            className="p-2 rounded-xl border flex items-center justify-between gap-2 text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity"
                            style={{
                              backgroundColor: 'var(--primary-accent-light)',
                              borderColor: 'var(--primary-accent)',
                              color: 'var(--primary-accent)',
                            }}
                            title="Hacer clic para ver el botón en el simulador"
                          >
                            <div className="flex items-center gap-1.5">
                              <QrCode size={14} />
                              <span>El botón Entrar pertenece a la pantalla Escáner QR</span>
                            </div>
                            <span className="text-[10px] uppercase font-black tracking-wider underline">Ver en QR</span>
                          </div>
                        )}

                        {/* SUBIR IMAGEN / VIDEO DEL BOTÓN */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                              Imagen / Video ({buttonState === 'hover' ? 'Sobre' : 'Normal'})
                            </label>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer select-none" style={{ color: 'var(--text-muted)' }} title="Rotar orientación de video 90° en el botón">
                                <input
                                  type="checkbox"
                                  checked={buttonVideoRotate}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting(buttonVideoRotateKey, e.target.checked)}
                                  className="rounded border-gray-400 focus:ring-0 h-3 w-3 cursor-pointer"
                                  style={{ accentColor: 'var(--primary-accent)' }}
                                />
                                <span>Rotar</span>
                              </label>
                              <label className="flex items-center gap-1 text-[10px] font-bold cursor-pointer select-none" style={{ color: 'var(--text-muted)' }} title="Habilitar o deshabilitar el uso de la imagen/video en el botón">
                                <input
                                  type="checkbox"
                                  checked={buttonUseMedia}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting(buttonUseMediaKey, e.target.checked)}
                                  className="rounded border-gray-400 focus:ring-0 h-3 w-3 cursor-pointer"
                                  style={{ accentColor: 'var(--primary-accent)' }}
                                />
                                <span>Utilizar</span>
                              </label>
                            </div>
                          </div>
                          
                          <div
                            className="border-2 border-dashed rounded-2xl p-2 text-center flex flex-col items-center justify-center transition-all relative overflow-hidden group h-[120px] min-h-[120px]"
                            style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                          >
                            {buttonImageUrl ? (
                              <div className="relative w-full h-full rounded-xl overflow-hidden group bg-black/40 flex items-center justify-center">
                                {buttonBgType === 'video' || String(buttonImageUrl).startsWith('data:video') || String(buttonImageUrl).match(/\.(mp4|webm|ogg)$/i) ? (
                                  <video
                                    src={buttonImageUrl}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <img
                                    src={buttonImageUrl}
                                    alt="Imagen del botón"
                                    className="w-full h-full object-contain"
                                  />
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <label className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/40 cursor-pointer transition-colors" title="Cambiar archivo">
                                    <Upload size={16} />
                                    <input
                                      type="file"
                                      accept="image/*,video/*"
                                      className="hidden"
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const isVideo = file.type.startsWith('video/');
                                          const reader = new FileReader();
                                          reader.onload = (ev) => {
                                            updateSetting(buttonImageKey, ev.target?.result);
                                            updateSetting(buttonBgTypeKey, isVideo ? 'video' : 'image');
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => updateSetting(buttonImageKey, '')}
                                    className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-600 transition-colors"
                                    title="Eliminar archivo"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                                <div className="p-2.5 rounded-full mb-1.5" style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}>
                                  <Upload size={18} />
                                </div>
                                <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Subir Imagen / Video</span>
                                <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>PNG, JPG, MP4 o WEBM</span>
                                <input
                                  type="file"
                                  accept="image/*,video/*"
                                  className="hidden"
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const isVideo = file.type.startsWith('video/');
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        updateSetting(buttonImageKey, ev.target?.result);
                                        updateSetting(buttonBgTypeKey, isVideo ? 'video' : 'image');
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </div>

                        {/* CONTROLES DERECHA: ESTILO, REDONDEZ, GLASS */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end pt-1">
                          {/* Estilo */}
                          <div>
                            <StylePickerPopover
                              label={`Estilo (${buttonState === 'hover' ? 'Sobre' : 'Normal'})`}
                              elementType="box"
                              eventColors={eventColors}
                              eventColorImage={eventColorImage}
                              styleConfig={{
                                backgroundColor: settings[`${buttonPrefix}_bg_type`] === 'gradient' && settings[`${buttonPrefix}_gradient_data`]
                                  ? (typeof settings[`${buttonPrefix}_gradient_data`] === 'string' ? settings[`${buttonPrefix}_gradient_data`] : settings[`${buttonPrefix}_bg_color`] || '#E07A5F')
                                  : (settings[`${buttonPrefix}_bg_color`] || '#E07A5F'),
                                borderWidth: settings[`${buttonPrefix}_border_width`] ?? 0,
                                borderStyle: settings[`${buttonPrefix}_border_style`] || 'solid',
                                borderColor: settings[`${buttonPrefix}_border_color`] || '#E07A5F',
                                borderRadius: settings[`${buttonPrefix}_border_radius`] ?? 12,
                                shadowColor: settings[`${buttonPrefix}_shadow_color`] || '#000000',
                                shadowBlur: settings[`${buttonPrefix}_shadow_blur`] ?? 0,
                                shadowOffsetX: settings[`${buttonPrefix}_shadow_offset_x`] ?? 0,
                                shadowOffsetY: settings[`${buttonPrefix}_shadow_offset_y`] ?? 0,
                              }}
                              onChange={(updated: any) => {
                                const prefix = buttonPrefix;
                                const bgPrefix = `${prefix}_bg`;
                                const gradKey = `${prefix}_gradient_data`;

                                const selectedColor = updated.backgroundColor || updated.fillColor;
                                const selectedGradient = updated.fillGradient;

                                if (updated.fillType === 'gradient' && selectedGradient) {
                                  updateSetting(`${bgPrefix}_type`, 'gradient');
                                  updateSetting(gradKey, selectedGradient);
                                } else if (selectedColor) {
                                  if (typeof selectedColor === 'string' && selectedColor.includes('gradient')) {
                                    updateSetting(`${bgPrefix}_type`, 'gradient');
                                    updateSetting(gradKey, selectedColor);
                                  } else {
                                    updateSetting(`${bgPrefix}_type`, 'color');
                                    updateSetting(`${bgPrefix}_color`, selectedColor);
                                  }
                                }

                                if (updated.borderWidth !== undefined) updateSetting(`${prefix}_border_width`, updated.borderWidth);
                                if (updated.borderStyle !== undefined) updateSetting(`${prefix}_border_style`, updated.borderStyle);
                                if (updated.borderColor !== undefined) updateSetting(`${prefix}_border_color`, updated.borderColor);
                                if (updated.borderRadius !== undefined) updateSetting(`${prefix}_border_radius`, updated.borderRadius);
                                if (updated.shadowColor !== undefined) updateSetting(`${prefix}_shadow_color`, updated.shadowColor);
                                if (updated.shadowBlur !== undefined) updateSetting(`${prefix}_shadow_blur`, updated.shadowBlur);
                                if (updated.shadowOffsetX !== undefined) updateSetting(`${prefix}_shadow_offset_x`, updated.shadowOffsetX);
                                if (updated.shadowOffsetY !== undefined) updateSetting(`${prefix}_shadow_offset_y`, updated.shadowOffsetY);
                              }}
                            />
                          </div>

                          {/* Redondez */}
                          <div>
                            <label className="block text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                              Redondez
                            </label>
                            <div
                              className="flex items-center h-9 rounded-xl border overflow-hidden transition-all focus-within:ring-1 focus-within:ring-[var(--primary-accent)] w-full shadow-2xs"
                              style={{
                                backgroundColor: 'var(--bg-app)',
                                borderColor: 'var(--border-color)',
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  const key = `${buttonPrefix}_border_radius`;
                                  const curr = parseInt(settings[key] ?? '12');
                                  const nextVal = Math.max(0, curr - 2);
                                  updateSetting(key, nextVal);
                                }}
                                className="w-8 h-full flex items-center justify-center border-r hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                style={{
                                  backgroundColor: 'var(--bg-card)',
                                  borderColor: 'var(--border-color)',
                                  color: 'var(--primary-accent)',
                                }}
                                title="Disminuir redondez"
                              >
                                <Minus size={12} />
                              </button>

                              <div className="flex-1 flex items-center justify-center px-1">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={settings[`${buttonPrefix}_border_radius`] ?? 12}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const key = `${buttonPrefix}_border_radius`;
                                    updateSetting(key, parseInt(e.target.value) || 0);
                                  }}
                                  className="w-full h-full text-center bg-transparent outline-none font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  style={{ color: 'var(--text-main)' }}
                                />
                                <span className="text-xs font-extrabold opacity-60 ml-0.5 select-none" style={{ color: 'var(--text-muted)' }}>
                                  px
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const key = `${buttonPrefix}_border_radius`;
                                  const curr = parseInt(settings[key] ?? '12');
                                  const nextVal = Math.min(100, curr + 2);
                                  updateSetting(key, nextVal);
                                }}
                                className="w-8 h-full flex items-center justify-center border-l hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-colors cursor-pointer shrink-0"
                                style={{
                                  backgroundColor: 'var(--bg-card)',
                                  borderColor: 'var(--border-color)',
                                  color: 'var(--primary-accent)',
                                }}
                                title="Aumentar redondez"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Glass */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                Glass ({settings[`${buttonPrefix}_bg_opacity`] ?? 100}%)
                              </label>
                              <label className="relative flex items-center cursor-pointer shrink-0 select-none">
                                <input
                                  type="checkbox"
                                  checked={settings[`${buttonPrefix}_glass_enabled`] ?? true}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const key = `${buttonPrefix}_glass_enabled`;
                                    updateSetting(key, e.target.checked);
                                  }}
                                  className="sr-only peer"
                                />
                                <div
                                  className="w-4 h-4 rounded border flex items-center justify-center transition-all peer-checked:border-[var(--primary-accent)] peer-checked:bg-[var(--primary-accent)]"
                                  style={{
                                    borderColor: (settings[`${buttonPrefix}_glass_enabled`] ?? true) ? 'var(--primary-accent)' : 'var(--border-color)',
                                    backgroundColor: (settings[`${buttonPrefix}_glass_enabled`] ?? true) ? 'var(--primary-accent)' : 'var(--bg-card)',
                                  }}
                                >
                                  {(settings[`${buttonPrefix}_glass_enabled`] ?? true) && (
                                    <Check size={11} className="text-white stroke-[3]" />
                                  )}
                                </div>
                              </label>
                            </div>

                            <div
                              className={`flex items-center h-9 rounded-xl border px-3 transition-opacity ${
                                !(settings[`${buttonPrefix}_glass_enabled`] ?? true) ? 'opacity-40 pointer-events-none' : ''
                              }`}
                              style={{
                                backgroundColor: 'var(--bg-app)',
                                borderColor: 'var(--border-color)',
                              }}
                            >
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={settings[`${buttonPrefix}_bg_opacity`] ?? 100}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  const key = `${buttonPrefix}_bg_opacity`;
                                  updateSetting(key, parseInt(e.target.value));
                                }}
                                className="w-full h-1.5 rounded-lg cursor-pointer"
                                style={{
                                  accentColor: 'var(--primary-accent)',
                                }}
                                title="Opacidad del vidrio"
                                disabled={!(settings[`${buttonPrefix}_glass_enabled`] ?? true)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 2.1.3 SUB-PESTAÑA LOGOS EN PRECARGA / QR (EXCLUSIVAMENTE LOGO DEL PROYECTO) */}
            {precargaSubTab === 'logos' && (() => {
              const displayProjectLogo = settings.project_logo_precarga_url || '/dinvited.png';

              // Estado activo del logo en Precarga/QR: 'precarga' o 'qr'
              const activePrecargaState = precargaLogoState;

              // Helper para Partner/Project Logo en Precarga o QR
              const getPrecargaPartnerVal = (field: string, defaultVal: any) => {
                const statePrefix = activePrecargaState === 'qr' ? 'qr_' : '';
                const key = `partner_logo_${statePrefix}precarga_${field}`;
                if (settings[key] !== undefined) return settings[key];
                if (activePrecargaState === 'qr' && settings[`partner_logo_precarga_${field}`] !== undefined) {
                  return settings[`partner_logo_precarga_${field}`];
                }
                return defaultVal;
              };

              const updatePrecargaPartnerLogo = (field: string, value: any) => {
                const statePrefix = activePrecargaState === 'qr' ? 'qr_' : '';
                updateSetting(`partner_logo_${statePrefix}precarga_${field}`, value);
              };

              const partnerV = getPrecargaPartnerVal('position_v', 'bottom');
              const partnerH = getPrecargaPartnerVal('position_h', 'center');
              const partnerSize = getPrecargaPartnerVal('size', 40);
              const partnerUnit = getPrecargaPartnerVal('unit', 'px');

              const precargaVisible = settings.precarga_show_logo ?? settings.partner_logo_show_precarga ?? true;
              const qrVisible = settings.qr_show_logo ?? settings.partner_logo_show_qr ?? true;
              const isCurrentVisible = activePrecargaState === 'qr' ? qrVisible : precargaVisible;

              const stateLabels: Record<string, string> = { precarga: 'Precarga', qr: 'QR' };

              return (
                <div className="w-full">
                  {/* BLOQUE: LOGO DEL PROYECTO (POWERED BY) EN PRECARGA / QR */}
                  <div className="rounded-2xl p-3 border shadow-sm flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                    <div>
                      <div className="pb-2 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex items-center gap-2">
                          <ImageIcon size={20} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                          <div className="flex flex-col leading-tight">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
                              <span>Logo del Programa</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase text-white shadow-2xs" style={{ backgroundColor: 'var(--primary-accent)' }}>
                                {stateLabels[activePrecargaState]}
                              </span>
                            </h3>
                            <span className="text-[10px] font-semibold opacity-75 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                              Logo dInvited del pie de pantalla de {stateLabels[activePrecargaState].toLowerCase()}
                            </span>
                          </div>
                        </div>

                        {/* CONTROLES DE PANTALLA (PRECARGA / QR) Y VISIBILIDAD EN CADA BOTAB */}
                        <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                          {[
                            { id: 'precarga', label: 'Precarga', icon: Hourglass, showKey: 'precarga_show_logo', partnerKey: 'partner_logo_show_precarga' },
                            { id: 'qr', label: 'QR', icon: QrCode, showKey: 'qr_show_logo', partnerKey: 'partner_logo_show_qr' },
                          ].map((st) => {
                            const Icon = st.icon;
                            const isSelected = activePrecargaState === st.id;
                            const isVisible = st.id === 'qr' ? qrVisible : precargaVisible;
                            return (
                              <div
                                key={st.id}
                                onClick={() => {
                                  setPrecargaLogoState(st.id as any);
                                  setPreviewView(st.id);
                                }}
                                className="botab-item select-none cursor-pointer"
                                style={{
                                  backgroundColor: isSelected ? 'var(--primary-accent)' : 'transparent',
                                  color: isSelected ? '#ffffff' : 'var(--text-muted)',
                                }}
                              >
                                {/* CHECK / VISIBILIDAD A LA IZQUIERDA DEL BOTAB */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateSetting(st.showKey, !isVisible);
                                    updateSetting(st.partnerKey, !isVisible);
                                  }}
                                  className="flex items-center justify-center transition-all cursor-pointer opacity-90 hover:opacity-100 mr-0.5"
                                  style={{
                                    color: isSelected ? '#ffffff' : isVisible ? 'var(--primary-accent)' : 'var(--text-muted)',
                                  }}
                                  title={isVisible ? `Visible en ${st.label} (Clic para ocultar)` : `Oculto en ${st.label} (Clic para mostrar)`}
                                >
                                  {isVisible ? <Check size={12} className="stroke-[3]" /> : <EyeOff size={11} className="opacity-40" />}
                                </button>

                                <Icon size={12} />
                                <span>{st.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* GRID INTERNO: VISTA PREVIA Y CONTROLES */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
                        {/* VISTA PREVIA */}
                        <div className="md:col-span-4 flex flex-col items-center justify-center">
                          <div
                            className="relative w-full h-full min-h-[85px] rounded-xl border overflow-hidden flex flex-col items-center justify-center p-2 shrink-0"
                            style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                          >
                            {(() => {
                              const statePrefix = activePrecargaState === 'qr' ? 'qr_' : '';
                              const poweredPos = settings[`${statePrefix}powered_by_position`] || settings[`partner_logo_${statePrefix}precarga_powered_by_position`] || settings.precarga_powered_by_position || 'top';
                              let flexDirClass = 'flex-col';
                              if (poweredPos === 'bottom') flexDirClass = 'flex-col-reverse';
                              else if (poweredPos === 'left') flexDirClass = 'flex-row items-center';
                              else if (poweredPos === 'right') flexDirClass = 'flex-row-reverse items-center';

                              const poweredText = settings[`${statePrefix}powered_by_text`] || settings.precarga_powered_by_text || 'Powered by';

                              return (
                                <div className={`flex ${flexDirClass} items-center justify-center gap-1.5`}>
                                  <span
                                    className="tracking-widest uppercase select-none text-[9px] font-extrabold opacity-80 shrink-0"
                                    style={{
                                      fontFamily: settings.precarga_powered_by_font_family || 'Inter',
                                      color: settings.precarga_powered_by_font_color || 'var(--text-main)',
                                    }}
                                  >
                                    {poweredText}
                                  </span>
                                  {displayProjectLogo ? (
                                    <img src={displayProjectLogo} alt="Logo del Programa" className="max-h-10 max-w-full object-contain drop-shadow-md shrink-0" />
                                  ) : (
                                    <div className="flex flex-col items-center justify-center text-center p-2 shrink-0">
                                      <ImageIcon size={20} className="opacity-40 mb-1" style={{ color: 'var(--text-muted)' }} />
                                      <span className="text-xs font-bold opacity-75" style={{ color: 'var(--text-main)' }}>Sin logo</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* CONTROLES LOGO PROGRAMA */}
                        <div className="md:col-span-8 space-y-2.5">
                          <div className="grid grid-cols-2 gap-2">
                            {/* Vert */}
                            <div>
                              <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Alineación Vertical</label>
                              <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                {[
                                  { id: 'top', label: 'Arriba', icon: AlignVerticalJustifyStart },
                                  { id: 'center', label: 'Centro', icon: AlignVerticalJustifyCenter },
                                  { id: 'bottom', label: 'Abajo', icon: AlignVerticalJustifyEnd },
                                ].map((pos) => {
                                  const Icon = pos.icon;
                                  return (
                                    <button
                                      key={pos.id}
                                      type="button"
                                      onClick={() => updatePrecargaPartnerLogo('position_v', pos.id)}
                                      className="botab-item flex-1"
                                      style={{
                                        backgroundColor: partnerV === pos.id ? 'var(--primary-accent)' : 'transparent',
                                        color: partnerV === pos.id ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                      title={pos.label}
                                    >
                                      <Icon size={14} />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Horiz */}
                            <div>
                              <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Alineación Horizontal</label>
                              <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                {[
                                  { id: 'left', label: 'Izquierda', icon: AlignLeft },
                                  { id: 'center', label: 'Centro', icon: AlignCenter },
                                  { id: 'right', label: 'Derecha', icon: AlignRight },
                                ].map((pos) => {
                                  const Icon = pos.icon;
                                  return (
                                    <button
                                      key={pos.id}
                                      type="button"
                                      onClick={() => updatePrecargaPartnerLogo('position_h', pos.id)}
                                      className="botab-item flex-1"
                                      style={{
                                        backgroundColor: partnerH === pos.id ? 'var(--primary-accent)' : 'transparent',
                                        color: partnerH === pos.id ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                      title={pos.label}
                                    >
                                      <Icon size={14} />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Tamaño y Ubicación Texto Powered By */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Tamaño / Ancho Máximo</label>
                              <CtrlPixelPorcentage
                                value={partnerSize}
                                unit={partnerUnit}
                                onChangeValue={(v) => updatePrecargaPartnerLogo('size', v)}
                                onChangeUnit={(u) => updatePrecargaPartnerLogo('unit', u)}
                                min={10}
                                max={partnerUnit === '%' ? 100 : 300}
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Ubicación Texto</label>
                              <div className="botab-container" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                {[
                                  { id: 'top', label: 'Arriba' },
                                  { id: 'bottom', label: 'Abajo' },
                                  { id: 'left', label: 'Izq' },
                                  { id: 'right', label: 'Der' },
                                ].map((posItem) => {
                                  const statePrefix = activePrecargaState === 'qr' ? 'qr_' : '';
                                  const currentPos = settings[`${statePrefix}powered_by_position`] || settings[`partner_logo_${statePrefix}precarga_powered_by_position`] || settings.precarga_powered_by_position || 'top';
                                  const isPosActive = currentPos === posItem.id;
                                  return (
                                    <button
                                      key={posItem.id}
                                      type="button"
                                      onClick={() => {
                                        updateSetting(`${statePrefix}powered_by_position`, posItem.id);
                                        updateSetting(`partner_logo_${statePrefix}precarga_powered_by_position`, posItem.id);
                                      }}
                                      className="botab-item flex-1 text-center"
                                      style={{
                                        backgroundColor: isPosActive ? 'var(--primary-accent)' : 'transparent',
                                        color: isPosActive ? '#ffffff' : 'var(--text-muted)',
                                      }}
                                    >
                                      {posItem.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Márgenes */}
                          <div className="pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--border-color)' }}>
                            <label className="block text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Márgenes</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {[
                                { field: 'margin_top', unitField: 'margin_top_unit', label: 'Arriba' },
                                { field: 'margin_bottom', unitField: 'margin_bottom_unit', label: 'Abajo' },
                                { field: 'margin_left', unitField: 'margin_left_unit', label: 'Izquierda' },
                                { field: 'margin_right', unitField: 'margin_right_unit', label: 'Derecha' },
                              ].map((m) => {
                                const val = getPrecargaPartnerVal(m.field, 0);
                                const currentUnit = getPrecargaPartnerVal(m.unitField, 'px');
                                return (
                                  <div key={m.field} className="flex flex-col gap-0.5">
                                    <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                                    <CtrlPixelPorcentage
                                      value={val}
                                      unit={currentUnit}
                                      onChangeValue={(v) => updatePrecargaPartnerLogo(m.field, v)}
                                      onChangeUnit={(u) => updatePrecargaPartnerLogo(m.unitField, u)}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>

      {/* MODAL DE GRADIENTES */}
      <GradientPickerModal
        isOpen={showGradientModal}
        gradientData={settings[gradientTarget]}
        onClose={() => setShowGradientModal(false)}
        onApplyGradient={(gradient) => {
          updateSetting(gradientTarget, gradient);
          setShowGradientModal(false);
        }}
      />
    </div>
  );
}
