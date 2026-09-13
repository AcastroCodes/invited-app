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

  // Soporte para formas SVG WordArt (arcUp, arcDown, circle, wave, bulge, semicircle)
  const wShape = el.wordArtShape || 'none';
  const curveVal = el.wordArtCurve ?? 50;

  if (wShape === 'arc' || wShape === 'arcUp' || wShape === 'arcDown' || wShape === 'wave' || wShape === 'circle' || wShape === 'semicircle' || wShape === 'bulge') {
    const pathId = `wordart-path-${el.id}`;
    const gradId = `wordart-grad-${el.id}`;
    const gradBorderId = `wordart-grad-border-${el.id}`;
    const w = Math.max(100, el.width);
    const h = Math.max(40, el.height);
    const curveOffset = Math.round((curveVal / 100) * (h * 0.8));
    const centerY = h / 2;
    let dPath = `M 0 ${centerY} Q ${w / 2} ${centerY - curveOffset} ${w} ${centerY}`;

    if (wShape === 'arcDown') {
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
    } else if (wShape === 'bulge') {
      dPath = `M 0 ${centerY} L ${w} ${centerY}`;
    }

    const strokeVal = isGradBorder ? `url(#${gradBorderId})` : tBorderC;

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
              fontFamily={el.fontFamily || 'Inter'}
              letterSpacing={el.letterSpacing ?? 0}
              textAnchor="middle"
              filter={`url(#shadow-filter-${el.id})`}
              style={{
                stroke: tBorderW > 0 ? strokeVal : undefined,
                strokeWidth: tBorderW > 0 ? `${tBorderW * 2}px` : undefined,
                fill: isGradColor ? `url(#${gradId})` : tColor,
              }}
            >
              <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
                {el.content}
              </textPath>
            </text>
          )}

          {/* Capa de Trazo / Borde de Texto */}
          {tBorderW > 0 && (
            <text
              fontSize={el.fontSize ? `${el.fontSize}px` : '24px'}
              fontWeight={el.fontWeight || 'bold'}
              fontFamily={el.fontFamily || 'Inter'}
              letterSpacing={el.letterSpacing ?? 0}
              textAnchor="middle"
              style={{
                stroke: strokeVal,
                strokeWidth: `${tBorderW * 2}px`,
                fill: 'none',
              }}
            >
              <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
                {el.content}
              </textPath>
            </text>
          )}

          {/* Capa de Relleno principal de texto */}
          <text
            fill={isGradColor ? `url(#${gradId})` : tColor}
            fontSize={el.fontSize ? `${el.fontSize}px` : '24px'}
            fontWeight={el.fontWeight || 'bold'}
            fontFamily={el.fontFamily || 'Inter'}
            letterSpacing={el.letterSpacing ?? 0}
            textAnchor="middle"
            style={{
              stroke: (!el.textAboveBorder && tBorderW > 0) ? strokeVal : undefined,
              strokeWidth: (!el.textAboveBorder && tBorderW > 0) ? `${tBorderW}px` : undefined,
            }}
          >
            <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
              {el.content}
            </textPath>
          </text>
        </svg>
      </div>
    );
  }

  const tShadowC = el.textShadowColor || 'rgba(0,0,0,0.5)';
  const shadowCssVal = hasShadow
    ? `drop-shadow(${el.textShadowOffsetX || 0}px ${el.textShadowOffsetY || 0}px ${el.textShadowBlur || 0}px ${tShadowC})`
    : undefined;

  return el.textAboveBorder ? (
    <div className="w-full relative inline-block text-left" style={{ textAlign: el.textAlign || 'left', transform: skewTransform, filter: shadowCssVal }}>
      {/* Trazo de borde */}
      <span
        className="w-full block truncate relative"
        style={{
          color: isGradBorder ? 'transparent' : (tBorderW > 0 ? tBorderC : 'transparent'),
          backgroundImage: isGradBorder ? tBorderC : undefined,
          WebkitBackgroundClip: isGradBorder ? 'text' : undefined,
          WebkitTextFillColor: isGradBorder ? 'transparent' : undefined,
          WebkitTextStroke: tBorderW > 0 ? `${tBorderW * 2}px ${isGradBorder ? 'transparent' : tBorderC}` : undefined,
          letterSpacing: lSpacing,
        }}
      >
        {el.content}
      </span>
      {/* Relleno principal */}
      <span
        className="w-full absolute inset-0 block truncate pointer-events-none"
        style={{
          color: isGradColor ? 'transparent' : tColor,
          backgroundImage: isGradColor ? tColor : undefined,
          WebkitBackgroundClip: isGradColor ? 'text' : undefined,
          WebkitTextFillColor: isGradColor ? 'transparent' : undefined,
          WebkitTextStroke: '0 transparent',
          letterSpacing: lSpacing,
        }}
      >
        {el.content}
      </span>
    </div>
  ) : (
    <span
      className="w-full truncate"
      style={{
        color: isGradColor ? 'transparent' : tColor,
        backgroundImage: isGradColor ? tColor : undefined,
        WebkitBackgroundClip: isGradColor ? 'text' : undefined,
        WebkitTextFillColor: isGradColor ? 'transparent' : undefined,
        filter: shadowCssVal,
        WebkitTextStroke: tBorderW > 0 ? `${tBorderW}px ${isGradBorder ? '#000' : tBorderC}` : undefined,
        letterSpacing: lSpacing,
        transform: skewTransform,
        display: hasSkew ? 'inline-block' : undefined,
      }}
    >
      {el.content}
    </span>
  );
};
