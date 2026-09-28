import React from 'react';
import type { CanvasElement } from '../../types/designerTypes';

const DB_PREVIEW_VALUES: Record<string, string> = {
  nombre_invitado: 'Familia García Pérez',
  pases_asignados: '4 Pases',
  mesa: 'Mesa 12',
  nombre_evento: 'Mi Evento Especial',
  fecha_evento: '15 de Noviembre, 2026',
  hora_evento: '18:00 hrs',
  lugar_evento: 'Hacienda San José',
  direccion_evento: 'Av. Principal #123',
  anfitriones: 'Ana y Carlos',
  codigo_qr: 'QR-ACCESO-88492',
  confirmacion_status: 'Confirmado',
  dias_restantes: '05',
  horas_restantes: '12',
  minutos_restantes: '30',
  segundos_restantes: '45',
  banco_nombre: 'BBVA Bancomer',
  clabe_interbancaria: '012345678901234567',
  titular_cuenta: 'Ana García',
  tienda_regalos_url: 'https://mesaderegalos.com',
  mapa_url: 'https://maps.google.com',
  adultos_confirmados: '2 Adultos',
  ninos_confirmados: '2 Niños',
};

interface TextElementItemProps {
  element: CanvasElement;
  parentWidth?: number;
  parentHeight?: number;
}

export const TextElementItem: React.FC<TextElementItemProps> = ({ element: el, parentWidth, parentHeight }) => {
  const displayContent = React.useMemo(() => {
    const content = el.content || '';
    if (!content.includes('[')) return content;
    return content.replace(/\[([a-zA-Z0-9_]+)\]/g, (match, key) => {
      return DB_PREVIEW_VALUES[key] || key.replace(/_/g, ' ').toUpperCase();
    });
  }, [el.content]);
  const tBorderW = el.textBorderWidth ?? el.containerBorderWidth ?? el.borderWidth ?? 0;
  const tBorderC = el.textBorderColor || el.containerBorderColor || el.borderColor || '#000000';
  const tColor = el.color || 'var(--text-main)';
  const isGradColor = typeof tColor === 'string' && tColor.includes('gradient');
  const isGradBorder = typeof tBorderC === 'string' && tBorderC.includes('gradient');
  const hasShadow = !!(el.textShadowBlur || el.textShadowOffsetX || el.textShadowOffsetY);

  const lSpacing = el.letterSpacing ? `${el.letterSpacing}px` : undefined;
  const hasSkew = (el.skewX || 0) !== 0 || (el.skewY || 0) !== 0;
  const skewTransform = hasSkew ? `skew(${el.skewX || 0}deg, ${el.skewY || 0}deg)` : undefined;

  // Soporte universal SVG (ahora incluye straight text)
  const wShape = el.wordArtShape || 'none';
  const curveVal = el.wordArtCurve ?? 50;

  const pathId = `wordart-path-${el.id}`;
  const gradId = `wordart-grad-${el.id}`;
  const gradBorderId = `wordart-grad-border-${el.id}`;

  const pW = parentWidth || 1080;
  const pH = parentHeight || 1920;

  const rawW = el.widthUnit === '%' ? (el.width / 100) * pW : el.width;
  const rawH = el.heightUnit === '%' ? (el.height / 100) * pH : el.height;

  const w = Math.max(50, rawW);
  const h = Math.max(20, rawH);
  const curveOffset = Math.round((curveVal / 100) * (h * 0.8));
  const fontSize = el.fontSize || 24;
  let centerY = h / 2 + fontSize * 0.35;
  if (wShape === 'none' || wShape === 'bulge') {
    if (el.verticalAlign === 'top') {
      centerY = Math.min(h / 2, fontSize * 0.85);
    } else if (el.verticalAlign === 'bottom') {
      centerY = Math.max(h / 2, h - fontSize * 0.15);
    } else {
      centerY = h / 2 + fontSize * 0.35;
    }
  }

  let dPath = `M 0 ${centerY} L ${w} ${centerY}`; // Default straight line

  if (wShape === 'arc' || wShape === 'arcUp') {
    dPath = `M 0 ${centerY} Q ${w / 2} ${centerY - curveOffset} ${w} ${centerY}`;
  } else if (wShape === 'arcDown') {
    dPath = `M 0 ${centerY} Q ${w / 2} ${centerY + curveOffset} ${w} ${centerY}`;
  } else if (wShape === 'wave') {
    dPath = `M 0 ${centerY} Q ${w / 4} ${centerY - curveOffset} ${w / 2} ${centerY} T ${w} ${centerY}`;
  } else if (wShape === 'circle') {
    const r = Math.min(w, h) / 2.3;
    const isPositive = curveVal >= 0;
    const angleDeg = curveVal * 3.6;
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    
    const startX = w / 2 + r * Math.cos(angleRad);
    const startY = centerY + r * Math.sin(angleRad);
    
    const sweep = isPositive ? 1 : 0;
    const midX = w / 2 - (startX - w / 2);
    const midY = centerY - (startY - centerY);

    dPath = `M ${startX} ${startY} A ${r} ${r} 0 1 ${sweep} ${midX} ${midY} A ${r} ${r} 0 1 ${sweep} ${startX - 0.01} ${startY - 0.01}`;
  } else if (wShape === 'semicircle') {
    const rx = w / 2;
    const ry = Math.max(10, Math.min(h * 0.85, (curveVal / 100) * h));
    const baseScaleY = Math.min(h - 5, centerY + (ry / 2));
    dPath = `M 0 ${baseScaleY} A ${rx} ${ry} 0 0 1 ${w} ${baseScaleY}`;
  }

  const strokeVal = isGradBorder ? `url(#${gradBorderId})` : tBorderC;

  let startOffset = '50%';
  let textAnchor = 'middle';
  if (wShape === 'none' || wShape === 'bulge') {
    if (el.textAlign === 'left') {
      startOffset = '0%';
      textAnchor = 'start';
    } else if (el.textAlign === 'right') {
      startOffset = '100%';
      textAnchor = 'end';
    }
  }

  return (
    <div className={`w-full h-full flex relative overflow-visible ${el.verticalAlign === 'top' ? 'items-start' : el.verticalAlign === 'bottom' ? 'items-end' : 'items-center'} justify-center`} style={{ transform: skewTransform }}>
      <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${w} ${h}`}>
        <defs>
          {isGradColor && (
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              {(() => {
                const stopsMatches = Array.from(
                  tColor.matchAll(/(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\)|[a-zA-Z]+)\s+(\d+)%/g)
                );
                if (stopsMatches.length >= 2) {
                  return stopsMatches.map((m, idx) => (
                    <stop key={idx} offset={`${m[2]}%`} stopColor={m[1]} />
                  ));
                }
                return (
                  <>
                    <stop offset="0%" stopColor="#E07A5F" />
                    <stop offset="100%" stopColor="#F2CC8F" />
                  </>
                );
              })()}
            </linearGradient>
          )}
          {isGradBorder && (
            <linearGradient id={gradBorderId} x1="0%" y1="0%" x2="100%" y2="100%">
              {(() => {
                const stopsMatches = Array.from(
                  tBorderC.matchAll(/(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\)|[a-zA-Z]+)\s+(\d+)%/g)
                );
                if (stopsMatches.length >= 2) {
                  return stopsMatches.map((m, idx) => (
                    <stop key={idx} offset={`${m[2]}%`} stopColor={m[1]} />
                  ));
                }
                return (
                  <>
                    <stop offset="0%" stopColor="#E07A5F" />
                    <stop offset="100%" stopColor="#F2CC8F" />
                  </>
                );
              })()}
            </linearGradient>
          )}
          {hasShadow && (
            <filter id={`shadow-filter-${el.id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx={el.textShadowOffsetX || 0}
                dy={el.textShadowOffsetY || 0}
                stdDeviation={(el.textShadowBlur || 0) / 2}
                floodColor={el.textShadowColor || 'rgba(0,0,0,0.5)'}
              />
            </filter>
          )}
        </defs>
        <path id={pathId} d={dPath} fill="none" stroke="none" />

        {/* Sombra SVG */}
        {hasShadow && (
          <text
            fontSize={el.fontSize ? `${el.fontSize}px` : '24px'}
            fontWeight={el.fontWeight || 'bold'}
            fontFamily={el.fontFamily ? `'${el.fontFamily}', sans-serif` : 'Inter'}
            letterSpacing={lSpacing ?? 0}
            filter={`url(#shadow-filter-${el.id})`}
            style={{
              stroke: tBorderW > 0 ? strokeVal : undefined,
              strokeWidth: tBorderW > 0 ? `${tBorderW * 2}px` : undefined,
              fill: isGradColor ? `url(#${gradId})` : tColor,
            }}
          >
            <textPath href={`#${pathId}`} startOffset={startOffset} textAnchor={textAnchor}>
              {displayContent}
            </textPath>
          </text>
        )}

        {/* Capa de Trazo / Borde de Texto (Se dibuja siempre que haya borde, textAboveBorder maneja el grosor) */}
        {tBorderW > 0 && (
          <text
            fontSize={el.fontSize ? `${el.fontSize}px` : '24px'}
            fontWeight={el.fontWeight || 'bold'}
            fontFamily={el.fontFamily ? `'${el.fontFamily}', sans-serif` : 'Inter'}
            letterSpacing={lSpacing ?? 0}
            style={{
              stroke: strokeVal,
              strokeWidth: el.textAboveBorder ? `${tBorderW * 2}px` : `${tBorderW}px`,
              fill: 'none',
            }}
          >
            <textPath href={`#${pathId}`} startOffset={startOffset} textAnchor={textAnchor}>
              {displayContent}
            </textPath>
          </text>
        )}

        {/* Capa de Relleno principal de texto */}
        <text
          fill={isGradColor ? `url(#${gradId})` : tColor}
          fontSize={el.fontSize ? `${el.fontSize}px` : '24px'}
          fontWeight={el.fontWeight || 'bold'}
          fontFamily={el.fontFamily ? `'${el.fontFamily}', sans-serif` : 'Inter'}
          letterSpacing={lSpacing ?? 0}
          style={{
            stroke: (!el.textAboveBorder && tBorderW > 0) ? strokeVal : undefined,
            strokeWidth: (!el.textAboveBorder && tBorderW > 0) ? `${tBorderW}px` : undefined,
          }}
        >
          <textPath href={`#${pathId}`} startOffset={startOffset} textAnchor={textAnchor}>
            {displayContent}
          </textPath>
        </text>
      </svg>
    </div>
  );
};
