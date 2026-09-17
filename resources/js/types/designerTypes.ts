export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'video' | 'shape' | '3d' | 'audio' | 'button' | 'widget_rsvp' | 'widget_map' | 'widget_countdown';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
  keepAspectRatio?: boolean;
  opacity?: number;
  parallaxEnabled?: boolean;
  depth?: number;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  // Estilo de Texto & WordArt
  color?: string;
  textBorderWidth?: number;
  textBorderColor?: string;
  textShadowColor?: string;
  textShadowBlur?: number;
  textShadowOffsetX?: number;
  textShadowOffsetY?: number;
  textAboveBorder?: boolean;
  wordArtShape?: 'none' | 'arc' | 'arcUp' | 'arcDown' | 'circle' | 'wave' | 'bulge' | 'skew' | 'semicircle';
  wordArtCurve?: number;
  letterSpacing?: number;
  skewX?: number;
  skewY?: number;

  // Estilo del Contenedor (Marco / Fondo)
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  containerBorderWidth?: number;
  containerBorderColor?: string;
  containerBorderStyle?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  containerBorderRadius?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  containerShadowColor?: string;
  containerShadowBlur?: number;
  containerShadowOffsetX?: number;
  containerShadowOffsetY?: number;
  boxShadow?: string;
  backdropBlurEnabled?: boolean;
  backdropBlurAmount?: number;
  backdropOpacity?: number;
  textAlign?: 'left' | 'center' | 'right';
  animation?: 'fade' | 'slideUp' | 'zoomIn' | 'bounce';
  animIn?: 'none' | 'fadeIn' | 'slideInUp' | 'slideInLeft' | 'zoomIn' | 'bounceIn' | 'spinIn';
  animOut?: 'none' | 'fadeOut' | 'slideOutDown' | 'slideOutRight' | 'zoomOut' | 'fadeScale';
  animDuration?: number;
  animDelay?: number;
  animEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier';
  locked?: boolean;
  visible?: boolean;
  objectFit?: string;
  imgScale?: number;
  initialWidth?: number;
  initialHeight?: number;
  naturalWidth?: number;
  naturalHeight?: number;
  repeatTileSize?: number;
  imgBrightness?: number;
  imgContrast?: number;
  imgSaturate?: number;
  imgBlur?: number;
  imgGrayscale?: boolean;
  imgSepia?: boolean;
  chromaKeyEnabled?: boolean;
  chromaKeyColor?: string;
  chromaKeyColors?: string[];
  chromaKeyTolerance?: number;
  patternType?: 'none' | 'dots' | 'lines' | 'grid' | 'waves' | 'custom';
  patternUrl?: string;
  patternScale?: number;
  patternColor?: string;
  patternOpacity?: number;
  // Botón (Button)
  buttonIcon?: string;
  buttonIconPosition?: 'left' | 'right' | 'only';
  buttonActionType?: 'url' | 'scroll' | 'action';
  buttonUrl?: string;
  buttonAnimation?: 'none' | 'pulse' | 'bounce' | 'shimmer';
  // Audio
  audioAutoplay?: boolean;
  audioLoop?: boolean;
  audioVolume?: number;
  audioShowTitle?: boolean;
  audioTitle?: string;
  groupId?: string;
  groupName?: string;
  preFitState?: { x: number; y: number; width: number; height: number; objectFit?: string };
}

export interface EnvelopeSettings {
  enabled?: boolean;
  color?: string;
  flapColor?: string;
  innerColor?: string;
  sealDesign?: 'wax_monogram' | 'wax_heart' | 'wax_rings' | 'ribbon' | 'gold_seal';
  sealColor?: string;
  sealText?: string;
  recipientText?: string;
  openButtonText?: string;
  patternStyle?: 'classic' | 'floral' | 'stripes' | 'dots' | 'clean';
  orientation?: 'vertical' | 'horizontal';
}

export interface FontOption {
  name: string;
  category: string;
  type: 'standard' | 'google' | 'custom';
  url?: string;
}
