export interface ElementPermissions {
  transform?: boolean;  // Posición, Tamaño, Rotación, Opacidad
  typography?: boolean; // Fuente, Tamaño de texto, Alineación, Estilo
  appearance?: boolean; // Colores, Fondo, Filtros de imagen/video
  container?: boolean;  // Bordes, Sombras, Fondo de contenedor
  animation?: boolean;  // Animaciones de entrada/salida
  content?: boolean;    // Editar texto o cambiar medio/recurso
}

export interface CanvasElement {
  id: string;
  type: 'component' | 'text' | 'image' | 'video' | 'shape' | '3d' | 'audio' | 'button' | 'widget_rsvp' | 'widget_map' | 'widget_countdown';
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
  // Permisos de Edición por Rol (Superadmin Lock)
  lockedSections?: ElementPermissions;
  // Estructura de Componente con Elementos Hijos (Exclusivo para el Sobre)
  isComponentParent?: boolean;     // Es el Componente Contenedor Padre
  parentComponentId?: string;      // ID del Componente Padre al que pertenece el elemento hijo
  componentName?: string;          // Nombre del Componente (ej: "Componente Franja Izquierda")
  children?: CanvasElement[];      // Lista de elementos hijos reales dentro del componente
  clipContent?: boolean;           // Aplica recorte overflow: hidden a los elementos hijos
  // Transformación interna/relativa de los elementos dentro del componente
  mediaX?: number;
  mediaY?: number;
  mediaScale?: number;
  mediaRotation?: number;
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
  backdropColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  animationStartTime?: number;
  animationEndTime?: number;
  animationInDuration?: number;
  animationOutDuration?: number;
  animationLoop?: 'none' | 'float' | 'pulse' | 'wiggle' | 'spin' | 'heartbeat';
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
  maskEnabled?: boolean;
  maskMode?: 'feather' | 'shape';
  maskDirection?: 'bottom' | 'top' | 'left' | 'right' | 'radial';
  maskFeather?: number;
  maskShape?: 'circle' | 'rounded' | 'diamond' | 'star' | 'heart' | 'arch' | 'splash' | 'custom';
  maskCustomSvgUrl?: string;
  maskShapeRadius?: number;
  maskShapeInverted?: boolean;
  maskShapeBorder?: number;
  maskShapeBorderColor?: string;
  maskShapeScale?: number;
  maskShapeX?: number;
  maskShapeY?: number;
  chromaKeyEnabled?: boolean;
  chromaKeyColor?: string;
  chromaKeyColors?: string[];
  chromaKeyTolerance?: number;
  // Editor de Video & Reproducción (Trim, Mute, Loop/Yoyo, Velocidad)
  videoStartTime?: number;
  videoEndTime?: number;
  videoMuted?: boolean;
  videoLoopMode?: 'loop' | 'seamless' | 'pingpong' | 'yoyo' | 'once' | 'rewind' | 'reverse' | 'slowmo' | 'stutter';
  videoSpeed?: number;
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
  // Objeto 3D
  modelAutoPlay?: boolean;
  modelAutoRotate?: boolean;
  modelShadowIntensity?: number;
  modelAnimation?: string;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  modelScaleX?: number;
  modelScaleY?: number;
  modelScaleZ?: number;
  modelOffsetX?: number;
  modelOffsetY?: number;
  modelOffsetZ?: number;
  // Calibración Base de Pivote y Orientación (Modal de Configuración Base 3D)
  modelPivotX?: number;
  modelPivotY?: number;
  modelPivotZ?: number;
  modelBaseScale?: number;
  modelBaseRotX?: number;
  modelBaseRotY?: number;
  modelBaseRotZ?: number;
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
