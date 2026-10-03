import React from "react";
import {
    Camera,
    GalleryHorizontal,
    Aperture,
    ImageIcon,
    ArrowLeft,
    Zap,
    RefreshCw,
    Heart,
    Smile,
    Star,
    ZapOff,
    Timer,
    Fingerprint,
    Presentation,
    LayoutGrid,
    MessageCircle,
    UserCircle,
    Search,
    Video,
    ZoomIn
} from "lucide-react";

interface MobileSimulatorProps {
    data: any;
    event?: any;
    previewView: string;
    previewOrientation?: string;
    getButtonStyles?: (hover?: boolean, type?: string) => React.CSSProperties;
    generateGradientString?: (data: any) => string;
}

export default function MobileSimulator({
    data,
    event,
    previewView,
    previewOrientation = "vertical",
    getButtonStyles,
    generateGradientString,
}: MobileSimulatorProps) {
    const settings = data?.settings || {};

    const isLandscape = previewOrientation === "horizontal";

    const defaultButtonStyles = (hover?: boolean, type?: string): React.CSSProperties => {
        return {
            backgroundColor: settings.global_button_bg || "var(--primary-accent)",
            color: settings.global_button_text || "#ffffff",
            borderRadius: `${settings.global_button_radius || 16}px`,
        };
    };

    const activeGetButtonStyles = getButtonStyles || defaultButtonStyles;

    const defaultGenerateGradient = (gData: any) => {
        if (!gData || !gData.stops) return "linear-gradient(180deg, #F7B731, #D49D2B)";
        const stops = gData.stops.map((s: any) => `${s.color} ${s.position}%`).join(", ");
        return `linear-gradient(${gData.angle || 180}deg, ${stops})`;
    };

    const activeGenerateGradient = generateGradientString || defaultGenerateGradient;

    // --- Reproduce getBrandingStyles() from EventLogin.tsx ---
    const getBrandingStyles = (): React.CSSProperties => {
        const bgType = settings.screen_bg_type || "color";
        const bgColor = settings.screen_bg_color || data?.branding?.secondary || "#000000";
        const bgOpacity = settings.screen_bg_opacity !== undefined ? settings.screen_bg_opacity : "100";

        let background = "transparent";
        let backgroundImage = "none";

        if (bgType === "color") {
            const opacityHex = Math.round((parseInt(bgOpacity) || 0) * 2.55).toString(16).padStart(2, "0");
            background = `${bgColor}${opacityHex}`;
        } else if (bgType === "gradient") {
            const opacityHex = Math.round((parseInt(bgOpacity) || 0) * 2.55).toString(16).padStart(2, "0");
            background = `${bgColor}${opacityHex}`;
            const gradientData = settings.screen_gradient_data;
            if (gradientData) {
                backgroundImage = activeGenerateGradient(gradientData);
            } else {
                const gradientAngle = settings.screen_gradient_angle || "180";
                const gradientFrom = settings.screen_gradient_from || "#0A0A0A";
                const gradientTo = settings.screen_gradient_to || "#171717";
                const gOpacityHex = Math.round((parseInt(settings.screen_gradient_opacity || "100") || 0) * 2.55).toString(16).padStart(2, "0");
                backgroundImage = `linear-gradient(${gradientAngle}deg, ${gradientFrom}${gOpacityHex}, ${gradientTo}${gOpacityHex})`;
            }
        } else if (bgType === "image") {
            if (settings.screen_image_url) {
                backgroundImage = `url(${settings.screen_image_url})`;
                background = "transparent";
            } else if (event?.background_image) {
                backgroundImage = `url(/storage/${event.background_image})`;
                background = "transparent";
            }
        }

        if (background === "transparent" && backgroundImage === "none" && data?.branding_colors) {
            const colors = data.branding_colors;
            if (colors.length === 1) {
                background = colors[0];
            } else if (colors.length > 1) {
                backgroundImage = `linear-gradient(135deg, ${colors.join(", ")})`;
            }
        }

        return {
            backgroundColor: background !== "transparent" ? background : undefined,
            backgroundImage: backgroundImage !== "none" ? backgroundImage : undefined,
            backgroundSize: bgType === "image" ? "cover" : undefined,
            backgroundPosition: bgType === "image" ? "center" : undefined,
            opacity: bgType === "image" ? (parseInt(bgOpacity) || 100) / 100 : undefined,
        };
    };

    // --- Reproduce getContainerStyles() from EventLogin.tsx ---
    const getContainerStyles = (): React.CSSProperties => {
        const bgType = settings.container_bg_type || "color";
        const bgColor = settings.container_bg_color || "#000000";
        const bgOpacity = settings.container_bg_opacity !== undefined ? settings.container_bg_opacity : "50";
        const borderRadius = settings.container_border_radius !== undefined ? settings.container_border_radius : "24";

        let innerBackground = "transparent";
        let innerBackgroundImage = "none";

        if (bgType === "color") {
            const opacityHex = Math.round((parseInt(bgOpacity) || 0) * 2.55).toString(16).padStart(2, "0");
            innerBackground = `${bgColor}${opacityHex}`;
        } else if (bgType === "gradient") {
            if (settings.container_gradient_data) {
                innerBackgroundImage = activeGenerateGradient(settings.container_gradient_data);
            } else {
                const angle = settings.container_gradient_angle || "180";
                const from = settings.container_gradient_from || "#000000";
                const to = settings.container_gradient_to || "#ffffff";
                const opacityHex = Math.round((parseInt(settings.container_gradient_opacity || "100") || 0) * 2.55).toString(16).padStart(2, "0");
                innerBackgroundImage = `linear-gradient(${angle}deg, ${from}${opacityHex}, ${to}${opacityHex})`;
            }
        } else if (bgType === "image") {
            if (settings.container_image_url) {
                innerBackgroundImage = `url(${settings.container_image_url})`;
            }
        }

        const styles: React.CSSProperties = {
            borderRadius: `${borderRadius}px`,
            backgroundColor: innerBackground,
            backgroundImage: innerBackgroundImage,
            fontFamily: settings.global_text_font_family || "Inter",
        };

        if (bgType === "image") {
            styles.backgroundSize = "cover";
            styles.backgroundPosition = "center";
        }

        return styles;
    };

    const brandingStyles = getBrandingStyles();
    const containerStyles = getContainerStyles();

    const getGalleryGradientColors = () => {
        let colors = ["#D6293A", "#F59218"];
        const bgType = settings.bar_bg_type || settings.container_bg_type || "color";
        const gradData = settings.bar_gradient_data || settings.container_gradient_data;
        if (bgType === "gradient") {
            if (gradData) {
                try {
                    const parsed = typeof gradData === 'string'
                        ? JSON.parse(gradData)
                        : gradData;
                        
                    if (parsed && Array.isArray(parsed.stops)) {
                        const visibleStops = parsed.stops.filter((s: any) => !s.hidden).sort((a: any, b: any) => a.position - b.position);
                        if (visibleStops.length > 0) {
                            colors = visibleStops.map((s: any) => s.color);
                        }
                    } else if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                        colors = parsed.map((p: any) => p.color || p);
                    } else if (parsed && parsed.colors && Array.isArray(parsed.colors)) {
                        colors = parsed.colors;
                    }
                } catch(e) {
                    console.error("Error parsing gallery simulator gradient:", e);
                }
            } else {
                colors = [
                    settings.bar_gradient_from || settings.container_gradient_from || "#000000",
                    settings.bar_gradient_to || settings.container_gradient_to || "#ffffff"
                ];
            }
        } else {
            const solidColor = settings.bar_bg_color || settings.container_bg_color || "#ffffff";
            colors = [solidColor, solidColor];
        }
        return colors;
    };
    
    const galleryGradientColors = getGalleryGradientColors();
    const galleryHasGradient = (settings.bar_bg_type || settings.container_bg_type || "color") === "gradient";
    const gallerySolidColor = settings.bar_bg_color || settings.container_bg_color || "#ffffff";
    const galleryDockFill = galleryHasGradient ? "url(#previewGalleryDockGradient)" : gallerySolidColor;

    // Logo from event
    const rawLogo = event?.logo_url || event?.logo || event?.logo_path || event?.cover_image || event?.banner_image || event?.image_url;
    const eventLogoUrl = rawLogo
        ? (typeof rawLogo === 'string' && (rawLogo.startsWith("http") || rawLogo.startsWith("/")))
            ? rawLogo
            : `/storage/${rawLogo}`
        : null;

    // El contenedor MobileSimulator tiene 296px de ancho real (320px - 24px de bordes)
    const winWidth = 296; 
    const dockWidth = 236; // 296 (winWidth) - 54 (left) - 6 (right) = 236
    const dockHeight = 42; // Height of the dock
    
    const cxDock = 199; 
    const R = 30; 
    const r = 10; 
    const dy = 0; 
    const val = Math.pow(R + r, 2) - Math.pow(r + dy, 2);
    const dx = val > 0 ? Math.sqrt(val) : 0;
    const cxf_left = cxDock - dx;
    const cxf_right = cxDock + dx;
    const Tx_left = cxDock - (R * dx) / (R + r);
    const Ty_left = -dy + (R * (r + dy)) / (R + r);
    const Tx_right = cxDock + (R * dx) / (R + r);
    const Ty_right = -dy + (R * (r + dy)) / (R + r);

    const franjaWidth = (winWidth * 0.65) - 54; 
    const numSlots = 3;
    const highlightIndex = 0; 
    const slotWidth = (franjaWidth - 16) / numSlots;
    const mountainCx = 8 + slotWidth * highlightIndex + slotWidth / 2 + 4;

    const h_R = 19; 
    const h_r = 9;  
    const h_dy = -1; 

    const h_val = Math.pow(h_R + h_r, 2) - Math.pow(h_r + h_dy, 2);
    const h_dx = Math.sqrt(h_val > 0 ? h_val : 0);
    const h_cxf_left = mountainCx - h_dx;
    const h_cxf_right = mountainCx + h_dx;
    const h_Tx_left = mountainCx - (h_R * h_dx) / (h_R + h_r);
    const h_Ty_left = -h_dy + (h_R * (h_r + h_dy)) / (h_R + h_r);
    const h_Tx_right = mountainCx + (h_R * h_dx) / (h_R + h_r);
    const h_Ty_right = -h_dy + (h_R * (h_r + h_dy)) / (h_R + h_r);

    const dockMaskSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dockWidth} ${dockHeight}" width="${dockWidth}" height="${dockHeight}">
            <defs>
                <mask id="m">
                    <rect x="0" y="0" width="${dockWidth}" height="${dockHeight}" fill="white" />
                    <path d="M ${cxf_left},0 A ${r},${r} 0 0,1 ${Tx_left},${Ty_left} A ${R},${R} 0 0,0 ${Tx_right},${Ty_right} A ${r},${r} 0 0,1 ${cxf_right},0 Z" fill="black" />
                    <path d="M ${h_cxf_left},0 A ${h_r},${h_r} 0 0,1 ${h_Tx_left},${h_Ty_left} A ${h_R},${h_R} 0 0,0 ${h_Tx_right},${h_Ty_right} A ${h_r},${h_r} 0 0,1 ${h_cxf_right},0 Z" fill="black" />
                </mask>
            </defs>
            <rect x="0" y="0" width="${dockWidth}" height="${dockHeight}" fill="black" mask="url(#m)" />
        </svg>
    `.trim().replace(/\n/g, "").replace(/\s+/g, " ");
    const dockEncodedMask = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(dockMaskSvg)}")`;


    return (
        <div className="w-full h-full relative flex flex-col overflow-hidden bg-black rounded-[10px]">
            {/* cFondo_App — static background */}
            <div
                className={`absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-[800ms] ease-in-out ${previewView === "camera" ? "opacity-0" : "opacity-100"}`}
                style={{ backgroundImage: "url('/images/global-bg-vertical.jpg')" }}
            />

            {/* cFondo_Evento — event branding background (used for welcome and gallery) */}
            <div
                className={`absolute inset-0 z-[1] transition-opacity duration-[800ms] ease-in-out ${["welcome", "gallery"].includes(previewView) ? "opacity-100" : "opacity-0"}`}
                style={brandingStyles}
            />

            {/* Inner content container */}
            <div
                className={`relative z-20 flex flex-col items-center justify-between w-full h-full transition-all duration-300 ${isLandscape ? "rotate-90" : ""}`}
            >
                {/* ===== VISTA WELCOME / BIENVENIDA ===== */}
                {previewView === "welcome" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
                        <div className={`w-full flex flex-col items-center gap-4 transition-opacity duration-[800ms] ease-in-out opacity-100 mb-8`}>
                            {/* Logo del evento */}
                            {eventLogoUrl && (
                                <img
                                    src={eventLogoUrl}
                                    alt="Logo Evento"
                                    className="h-20 w-auto max-w-[200px] object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] mb-4"
                                />
                            )}

                            {/* Contenedor principal — igual que EventLogin */}
                            <div
                                className="backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/10 flex flex-col items-center justify-center w-full max-w-[320px]"
                                style={containerStyles}
                            >
                                {/* Subtítulo bienvenida */}
                                <h3
                                    className="text-[9px] uppercase tracking-widest mb-2 mt-1"
                                    style={{
                                        color: settings.use_global_fonts ? settings.global_text_font_color : settings.subtitle_font_color || "#333",
                                        fontFamily: settings.global_text_font_family || "Inter",
                                        fontSize: settings.global_text_font_size ? `${Math.min(13, parseInt(settings.global_text_font_size) * 0.5)}px` : undefined,
                                        fontWeight: (settings.global_text_font_weight as any) || "bold",
                                        fontStyle: (settings.global_text_font_style as any) || "normal",
                                        textDecoration: (settings.global_text_text_decoration as any) || "none",
                                        textAlign: (settings.global_text_text_align as any) || "center",
                                    }}
                                >
                                    {settings.welcome_subtitle || "¡Bienvenido al evento!"}
                                </h3>

                                {/* Nombre del invitado o Evento */}
                                <h1
                                    className="text-2xl drop-shadow-md leading-none uppercase mt-1 mb-2"
                                    style={{
                                        color: settings.use_global_fonts ? settings.global_title_font_color : settings.title_font_color || "#fff",
                                        fontFamily: settings.use_global_fonts ? settings.global_title_font_family : settings.title_font_family || "Inter",
                                        fontSize: settings.global_title_font_size ? `${Math.min(26, parseInt(settings.global_title_font_size) * 0.7)}px` : undefined,
                                        fontWeight: (settings.global_title_font_weight as any) || "bold",
                                        fontStyle: (settings.global_title_font_style as any) || "normal",
                                        textDecoration: (settings.global_title_text_decoration as any) || "none",
                                        textAlign: (settings.global_title_text_align as any) || "center",
                                    }}
                                >
                                    {(event?.event_name || event?.name || event?.title || "Nombre Invitado")}
                                </h1>

                                <p
                                    className="text-[11px] leading-tight mt-3 mb-6 opacity-90"
                                    style={{
                                        color: settings.use_global_fonts ? settings.global_text_font_color : settings.subtitle_font_color || "#333",
                                        fontFamily: settings.global_text_font_family || "Inter",
                                        fontWeight: (settings.global_text_font_weight as any) || "normal",
                                        fontStyle: (settings.global_text_font_style as any) || "normal",
                                        textDecoration: (settings.global_text_text_decoration as any) || "none",
                                        textAlign: (settings.global_text_text_align as any) || "center",
                                    }}
                                >
                                    Prepárate para capturar los mejores momentos
                                </p>

                                {/* Botón Continuar */}
                                <button
                                    type="button"
                                    className="w-4/5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                                    style={activeGetButtonStyles(false)}
                                >
                                    Continuar <ArrowLeft className="w-3 h-3 rotate-180" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== VISTA CÁMARA ===== */}
                {previewView === "camera" && (
                    <div
                        className="absolute inset-0 z-[2] bg-cover bg-center overflow-hidden flex flex-col"
                        style={{ backgroundColor: "#111", backgroundImage: "linear-gradient(135deg, #2a1a3e 0%, #16213e 50%, #0f3460 100%)" }}
                    >
                        {/* GUÍA DE ENCUADRE 9:16 (ZONA SEGURA) */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
                            <div
                                className="h-full border-x border-white/20 bg-black/5 relative"
                                style={{
                                    aspectRatio: isLandscape ? "16/9" : "9/16",
                                    maxHeight: "100%",
                                    maxWidth: "100%",
                                }}
                            >
                                <div className="absolute top-1/2 left-0 right-0 border-t border-white/10" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-l border-white/10 h-full" />
                                <div className="absolute top-[80px] left-1/2 -translate-x-1/2 text-[8px] font-black text-white/50 uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded backdrop-blur-sm shadow-md">
                                    Safe Zone {isLandscape ? "16:9" : "9:16"}
                                </div>
                            </div>
                        </div>
                        
                        {/* Top Controls: Two separated pills */}
                        <div className="w-full flex justify-between pt-2 px-2 z-30">
                            {/* Left Pill (Atrás, Huella) */}
                            <div 
                                className="flex flex-row backdrop-blur-md border shadow-2xl overflow-hidden border-white/10 px-2 items-center justify-center h-[28px]"
                                style={{
                                    ...getContainerStyles(),
                                    opacity: 0.75,
                                    borderRadius: "10px",
                                }}
                            >
                                <div className="p-1 aspect-square flex items-center justify-center text-white"><ArrowLeft size={8} /></div>
                                <div className="bg-white/10 w-px h-4 mx-0.5 my-auto" />
                                <div className="p-1 aspect-square flex items-center justify-center text-white"><Fingerprint size={8} /></div>
                            </div>
                            
                            {/* Right Pill (Flash, Reverse, Timer, Zoom) */}
                            <div 
                                className="flex flex-row backdrop-blur-md border shadow-2xl overflow-hidden border-white/10 px-2 items-center justify-center h-[28px]"
                                style={{
                                    ...getContainerStyles(),
                                    opacity: 0.75,
                                    borderRadius: "10px",
                                }}
                            >
                                <div className="p-1 aspect-square flex items-center justify-center text-white"><ZapOff size={8} /></div>
                                <div className="bg-white/10 w-px h-4 mx-0.5 my-auto" />
                                <div className="p-1 aspect-square flex items-center justify-center text-white"><RefreshCw size={8} /></div>
                                <div className="bg-white/10 w-px h-4 mx-0.5 my-auto" />
                                <div className="p-0.5 flex flex-col items-center justify-center text-white">
                                    <Timer size={8} />
                                    <span className="text-[4px] font-black uppercase mt-[1px]">OFF</span>
                                </div>
                                <div className="bg-white/10 w-px h-4 mx-0.5 my-auto" />
                                <div className="p-0.5 flex flex-col items-center justify-center text-white">
                                    <Search size={8} />
                                    <span className="text-[4px] font-black uppercase mt-[1px]">1.0x</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1" />

                        {/* Bottom Dock Area */}
                        <div className="w-full relative z-30 h-[100px]">
                            {/* Floating Logo positioned centered like in the photo */}
                            {eventLogoUrl && (
                                <div className="absolute bottom-[80px] w-full flex justify-center z-50 pointer-events-none">
                                    <img
                                        src={eventLogoUrl}
                                        alt="Logo Evento"
                                        className="h-[40px] w-auto max-w-[120px] object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                                    />
                                </div>
                            )}

                            {/* 1. Square box for Galería on the bottom left (56px) exactly matching dock height */}
                            <div
                                className="absolute shadow-xl flex flex-col items-center justify-center cursor-pointer z-50 backdrop-blur-md"
                                style={{
                                    width: `42px`,
                                    height: `42px`,
                                    bottom: `6px`,
                                    left: `6px`,
                                    borderRadius: "12px",
                                    ...getContainerStyles(),
                                    opacity: 0.75,
                                }}
                            >
                                <ImageIcon size={14} color="white" className="text-white/90" />
                                <span className="text-[6px] font-bold text-white/90 uppercase tracking-widest mt-0.5">Galería</span>
                            </div>

                            {/* 2. Long bar for Services (Height 56px) - aligned with Galeria */}
                            <div
                                className="absolute z-40 flex items-center px-4"
                                style={{
                                    height: `42px`,
                                    bottom: `6px`,
                                    left: `54px`,
                                    right: `6px`,
                                }}
                            >
                                {/* Background with Mask */}
                                <div
                                    className="absolute inset-0 z-[-1] pointer-events-none shadow-xl backdrop-blur-md"
                                    style={{
                                        borderRadius: "12px 12px 0 0",
                                        ...getContainerStyles(),
                                        opacity: 0.75,
                                        WebkitMaskImage: dockEncodedMask,
                                        maskImage: dockEncodedMask,
                                        WebkitMaskSize: "100% 100%",
                                        maskSize: "100% 100%",
                                    }}
                                />
                                {/* Service Icons inside dock */}
                                <div className="flex items-center h-full absolute left-[8px]" style={{ width: `${franjaWidth - 16}px` }}>
                                    {/* Active/Selected Mode: Show */}
                                    <div className="flex-1 flex justify-center items-center h-full relative z-10">
                                        <div className="relative flex flex-col items-center justify-center w-full h-full bg-transparent">
                                            <div 
                                                className="relative flex justify-center items-center rounded-full shadow-xl"
                                                style={{
                                                    width: '30px',
                                                    height: '30px',
                                                    transform: 'translateY(-16px)',
                                                }}
                                            >
                                                <div
                                                    className="absolute inset-0"
                                                    style={{
                                                        ...getContainerStyles(),
                                                        borderRadius: '9999px',
                                                        opacity: 0.75,
                                                    }}
                                                />
                                                <div className="relative z-10 flex items-center justify-center">
                                                    <Presentation size={14} className="text-white" />
                                                </div>
                                            </div>
                                            <span 
                                                className="absolute font-bold uppercase tracking-widest whitespace-nowrap text-white" 
                                                style={{
                                                    fontSize: '6.5px',
                                                    bottom: '3px',
                                                    transform: 'translateY(-3px)',
                                                }}
                                            >
                                                Show
                                            </span>
                                        </div>
                                    </div>
                                    {/* Inactive Modes */}
                                    <div className="flex-1 flex justify-center items-center h-full relative z-10 opacity-50">
                                        <div className="relative flex flex-col items-center justify-center w-full h-full bg-transparent">
                                            <LayoutGrid size={12} color="white" />
                                        </div>
                                    </div>
                                    <div className="flex-1 flex justify-center items-center h-full relative z-10 opacity-50">
                                        <div className="relative flex flex-col items-center justify-center w-full h-full bg-transparent">
                                            <MessageCircle size={12} color="white" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Huge Shutter Button on the bottom right (64x64) positioned at 85.5% */}
                            <div 
                                className="absolute z-50 flex items-center justify-center shadow-2xl"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    bottom: '24px',
                                    left: '85.5%',
                                    transform: `translateX(-50%)`,
                                }}
                            >
                                <div
                                    className="absolute inset-0 m-auto rounded-full backdrop-blur-md border border-white/10"
                                    style={{
                                        ...getContainerStyles(),
                                        borderRadius: "9999px",
                                        opacity: 0.75,
                                        width: "84.1%",
                                        height: "84.1%",
                                    }}
                                />
                                
                                <svg viewBox="0 0 512 512" className="w-[92%] h-[92%] absolute inset-0 m-auto pointer-events-none overflow-visible">
                                    <defs>
                                        <mask id="shutter-mask-simulator">
                                            <rect width="512" height="512" fill="white" />
                                            <circle cx="256" cy="256" r="60" fill="black" />
                                            <g stroke="black" strokeWidth="20" strokeLinecap="square">
                                                <line x1="256" y1="216" x2="512" y2="216" transform="rotate(0, 256, 256)" />
                                                <line x1="256" y1="216" x2="512" y2="216" transform="rotate(60, 256, 256)" />
                                                <line x1="256" y1="216" x2="512" y2="216" transform="rotate(120, 256, 256)" />
                                                <line x1="256" y1="216" x2="512" y2="216" transform="rotate(180, 256, 256)" />
                                                <line x1="256" y1="216" x2="512" y2="216" transform="rotate(240, 256, 256)" />
                                                <line x1="256" y1="216" x2="512" y2="216" transform="rotate(300, 256, 256)" />
                                            </g>
                                        </mask>
                                    </defs>
                                    <g style={{ transformOrigin: "256px 256px", transform: "scale(0.8)" }}>
                                        <circle cx="256" cy="256" r="220" fill="none" stroke="#ffffff" strokeWidth="28" />
                                        <circle cx="256" cy="256" r="185" fill="#ffffff" mask="url(#shutter-mask-simulator)" />
                                    </g>
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== VISTA GALERÍA ===== */}
                {previewView === "gallery" && (
                    <div className="absolute inset-0 z-30 flex flex-col bg-gray-900" style={brandingStyles}>
                        <div className="w-full h-16 relative flex items-start justify-center shrink-0">
                            <div className="absolute inset-x-0 top-0 h-16 pointer-events-none z-20 flex items-start -scale-y-100">
                                <svg viewBox="0 0 300 60" className="w-full h-full drop-shadow-[0_-5px_15px_rgba(0,0,0,0.3)]" preserveAspectRatio="none">
                                    {galleryHasGradient && (
                                        <defs>
                                            <linearGradient id="previewGalleryDockGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                {galleryGradientColors.map((color, index) => (
                                                    <stop 
                                                        key={index} 
                                                        offset={`${(index / (galleryGradientColors.length - 1)) * 100}%`} 
                                                        stopColor={color} 
                                                    />
                                                ))}
                                            </linearGradient>
                                        </defs>
                                    )}
                                    <path
                                        d="M 0,20 L 45,20 C 65,20 70,45 85,45 L 215,45 C 230,45 235,20 255,20 L 300,20 L 300,60 L 0,60 Z"
                                        fill={galleryDockFill}
                                        opacity="0.85"
                                        stroke="rgba(255,255,255,0.2)"
                                        strokeWidth="2"
                                    />
                                </svg>
                            </div>
                            {eventLogoUrl && (
                                <img
                                    src={eventLogoUrl}
                                    alt="Logo Evento"
                                    className="h-10 w-auto max-w-[120px] object-contain drop-shadow-md relative z-30 mt-2"
                                />
                            )}
                        </div>

                        <div className="flex-1 w-full px-2 overflow-hidden flex flex-col relative z-0 pt-2">
                            <div className="grid grid-cols-2 gap-2 h-full pb-16">
                                <div className="rounded-xl overflow-hidden relative shadow-lg col-span-2" style={{ backgroundColor: settings.gallery_card_bg_color || "#2A2A2C", height: "120px" }}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-800" />
                                    <div className="absolute bottom-2 right-2 flex gap-1">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center">
                                            <Aperture size={10} color="white" />
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center">
                                            <MessageCircle size={10} color="white" />
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center relative">
                                            <Heart size={10} color="white" />
                                            <div className="absolute -top-1 -right-1 bg-red-600 rounded-full w-3 h-3 flex items-center justify-center text-[6px] text-white font-bold">1</div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full p-1 bg-gradient-to-t from-black/80 to-transparent">
                                        <span className="text-[7px] font-bold text-white uppercase ml-1">ACASTROPC</span>
                                    </div>
                                </div>

                                <div className="rounded-xl overflow-hidden relative shadow-lg flex items-center justify-center" style={{ backgroundColor: settings.gallery_card_bg_color || "#f0f0f0", height: "120px" }}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-pink-200 opacity-60" />
                                    <span className="text-[8px] font-black text-gray-800 uppercase tracking-widest relative z-10">Cargando...</span>
                                </div>

                                <div className="rounded-xl overflow-hidden relative shadow-lg flex items-center justify-center" style={{ backgroundColor: settings.gallery_card_bg_color || "#f0f0f0", height: "120px" }}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-blue-200 opacity-60" />
                                    <span className="text-[8px] font-black text-gray-800 uppercase tracking-widest relative z-10">Cargando...</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-16 absolute bottom-0 left-0 right-0 z-40 flex items-end pointer-events-none">
                            <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none z-20">
                                <svg viewBox="0 0 300 60" className="w-full h-full drop-shadow-2xl" preserveAspectRatio="none">
                                    <path
                                        d="M 0,5 L 45,5 C 65,5 70,30 85,30 L 215,30 C 230,30 235,5 255,5 L 300,5 L 300,60 L 0,60 Z"
                                        fill={galleryDockFill}
                                        opacity="0.85"
                                        stroke="rgba(255,255,255,0.2)"
                                        strokeWidth="2"
                                    />
                                </svg>
                            </div>

                            <div className="absolute inset-0 z-30 pointer-events-none">
                                <div className="relative w-full h-full">
                                    <div className="absolute top-0 bottom-0 flex justify-center items-center pointer-events-auto z-50" style={{ left: "11%", transform: "translateX(-50%)", paddingTop: "5px" }}>
                                        <div className="relative flex flex-col items-center justify-center">
                                            <ArrowLeft size={14} color="white" />
                                            <span className="text-[6px] font-black text-white uppercase tracking-widest mt-0.5">Atrás</span>
                                        </div>
                                    </div>

                                    <div className="absolute top-0 bottom-0 flex justify-center items-center pointer-events-auto z-50" style={{ left: "38%", transform: "translateX(-50%)" }}>
                                        <div className="relative flex flex-col items-center justify-center">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-xl bg-gradient-to-br from-orange-400 to-orange-600 mb-[2px]" style={{ transform: "translateY(-14px)" }}>
                                                <LayoutGrid size={14} color="white" />
                                            </div>
                                            <span className="absolute bottom-[2px] text-[7px] font-black text-white uppercase tracking-widest" style={{ transform: "translateY(-4px)" }}>Todas</span>
                                        </div>
                                    </div>

                                    <div className="absolute top-0 bottom-0 flex justify-center items-center pointer-events-auto z-50" style={{ left: "62%", transform: "translateX(-50%)", paddingTop: "5px" }}>
                                        <div className="relative flex flex-col items-center justify-center opacity-60">
                                            <UserCircle size={14} color="white" />
                                            <span className="text-[6px] font-black text-white uppercase tracking-widest mt-0.5">Mis Fotos</span>
                                        </div>
                                    </div>

                                    <div className="absolute top-0 bottom-0 flex justify-center items-center pointer-events-auto z-50" style={{ right: "11%", transform: "translateX(50%)", paddingTop: "5px" }}>
                                        <div className="relative flex flex-col items-center justify-center">
                                            <LayoutGrid size={14} color="white" />
                                            <span className="text-[6px] font-black text-white uppercase tracking-widest mt-0.5">Vista</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
