import React from 'react';
import type { CanvasElement } from '../../types/designerTypes';

interface TextElementItemProps {
  element: CanvasElement;
}

export const TextElementItem: React.FC<TextElementItemProps> = ({ element: el }) => {
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
  const w = Math.max(100, el.width);
  const h = Math.max(40, el.height);
  const curveOffset = Math.round((curveVal / 100) * (h * 0.8));
  const centerY = h / 2;
  
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
    <div className="w-full h-full flex items-center justify-center relative overflow-visible" style={{ transform: skewTransform }}>
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
              {el.content}
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
              {el.content}
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
            {el.content}
          </textPath>
        </text>
      </svg>
    </div>
  );
};
