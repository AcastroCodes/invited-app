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
    previewButtonState?: "normal" | "hover";
    getButtonStyles?: (hover?: boolean, type?: string) => React.CSSProperties;
    generateGradientString?: (data: any) => string;
}

export default function MobileSimulator({
    data,
    event,
    previewView,
    previewOrientation = "vertical",
    previewButtonState,
    getButtonStyles,
    generateGradientString,
}: MobileSimulatorProps) {
    const settings = data?.settings || {};

    const isLandscape = previewOrientation === "horizontal";

    React.useEffect(() => {
        const fontsToLoad = [
            settings.global_title_font_family,
            settings.global_text_font_family,
            settings.global_button_font_family,
            settings.title_font_family,
            settings.subtitle_font_family
        ].filter(Boolean);

        fontsToLoad.forEach(fontName => {
            if (!fontName || fontName === 'Inter' || fontName === 'system-ui') return;
            const fontId = `google-font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
            if (!document.getElementById(fontId)) {
                const link = document.createElement('link');
                link.id = fontId;
                link.rel = 'stylesheet';
                link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:ital,wght@0,300;0,400;0,600;0,700;0,800;0,900;1,400;1,700&display=swap`;
                document.head.appendChild(link);
            }
        });
    }, [
        settings.global_title_font_family,
        settings.global_text_font_family,
        settings.global_button_font_family,
        settings.title_font_family,
        settings.subtitle_font_family
    ]);

    const defaultButtonStyles = (hover?: boolean, type?: string): React.CSSProperties => {
        const isHover = hover || previewButtonState === "hover";
        const prefix = isHover ? "button_hover" : "button";

        const bgType = settings[`${prefix}_bg_type`] || (isHover ? (settings.button_bg_type || "color") : "color");
        const bgColor = settings[`${prefix}_bg_color`] || (isHover ? (settings.button_bg_color || settings.global_button_bg || "var(--primary-accent)") : (settings.button_bg_color || settings.global_button_bg || "var(--primary-accent)"));
        const bgOpacity = settings[`${prefix}_bg_opacity`] ?? (isHover ? (settings.button_bg_opacity ?? 100) : 100);
        const borderRadius = settings[`${prefix}_border_radius`] ?? (isHover ? (settings.button_border_radius ?? settings.global_button_radius ?? 16) : (settings.button_border_radius ?? settings.global_button_radius ?? 16));

        let background = bgColor;
        let backgroundImage: string | undefined = undefined;

        if (bgType === "color") {
            const opacityHex = Math.round((parseInt(bgOpacity) || 0) * 2.55).toString(16).padStart(2, "0");
            background = `${bgColor}${opacityHex}`;
        } else if (bgType === "gradient") {
            const gradData = settings[`${prefix}_gradient_data`] || (isHover ? settings.button_gradient_data : undefined);
            if (gradData) {
                backgroundImage = activeGenerateGradient(gradData);
            }
        } else if (bgType === "image" || bgType === "video" || (settings[`${prefix}_image_url`] && bgType !== "gradient")) {
            const imgUrl = settings[`${prefix}_image_url`] || (isHover ? settings.button_image_url : undefined);
            if (imgUrl && !String(imgUrl).startsWith('data:video') && !String(imgUrl).match(/\.(mp4|webm|ogg)$/i)) {
                backgroundImage = `url(${imgUrl})`;
            }
        }

        const borderWidth = settings[`${prefix}_border_width`] ?? (isHover ? (settings.button_border_width ?? 0) : 0);
        const borderStyle = settings[`${prefix}_border_style`] || (isHover ? (settings.button_border_style || "solid") : "solid");
        const borderColor = settings[`${prefix}_border_color`] || (isHover ? (settings.button_border_color || "#E07A5F") : "#E07A5F");
        const shadowBlur = settings[`${prefix}_shadow_blur`] ?? (isHover ? (settings.button_shadow_blur ?? 0) : 0);
        const shadowColor = settings[`${prefix}_shadow_color`] || (isHover ? (settings.button_shadow_color || "#000000") : "#000000");
        const shadowX = settings[`${prefix}_shadow_offset_x`] ?? (isHover ? (settings.button_shadow_offset_x ?? 0) : 0);
        const shadowY = settings[`${prefix}_shadow_offset_y`] ?? (isHover ? (settings.button_shadow_offset_y ?? 0) : 0);

        return {
            backgroundColor: background,
            backgroundImage,
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: settings.global_button_text || "#ffffff",
            borderRadius: `${borderRadius}px`,
            borderWidth: borderWidth > 0 && borderStyle !== "none" ? `${borderWidth}px` : undefined,
            borderStyle: borderWidth > 0 && borderStyle !== "none" ? borderStyle : undefined,
            borderColor: borderWidth > 0 && borderStyle !== "none" ? borderColor : undefined,
            boxShadow: (shadowBlur || shadowX || shadowY) ? `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowColor}` : undefined,
        };
    };

    const activeGetButtonStyles = getButtonStyles || defaultButtonStyles;

    const defaultGenerateGradient = (gData: any) => {
        if (!gData) return "linear-gradient(180deg, #F7B731, #D49D2B)";
        if (typeof gData === 'string' && gData.includes('gradient')) return gData;
        if (gData.stops && Array.isArray(gData.stops)) {
            const stops = gData.stops.map((s: any) => `${s.color} ${s.position}%`).join(", ");
            return `linear-gradient(${gData.angle || 180}deg, ${stops})`;
        }
        return typeof gData === 'string' ? gData : "linear-gradient(180deg, #F7B731, #D49D2B)";
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
        } else if (bgType === "image" || bgType === "video" || (settings.container_image_url && bgType !== "gradient")) {
            if (settings.container_image_url && !String(settings.container_image_url).startsWith('data:video') && !String(settings.container_image_url).match(/\.(mp4|webm|ogg)$/i)) {
                innerBackgroundImage = `url(${settings.container_image_url})`;
            }
        }

        const borderWidth = settings.container_border_width ?? 0;
        const borderStyle = settings.container_border_style || "solid";
        const borderColor = settings.container_border_color || "#E07A5F";
        const shadowBlur = settings.container_shadow_blur ?? 0;
        const shadowColor = settings.container_shadow_color || "#000000";
        const shadowX = settings.container_shadow_offset_x ?? 0;
        const shadowY = settings.container_shadow_offset_y ?? 0;

        const styles: React.CSSProperties = {
            borderRadius: `${borderRadius}px`,
            backgroundColor: innerBackground,
            backgroundImage: innerBackgroundImage !== "none" ? innerBackgroundImage : undefined,
            borderWidth: borderWidth > 0 && borderStyle !== "none" ? `${borderWidth}px` : undefined,
            borderStyle: borderWidth > 0 && borderStyle !== "none" ? borderStyle : undefined,
            borderColor: borderWidth > 0 && borderStyle !== "none" ? borderColor : undefined,
            boxShadow: (shadowBlur || shadowX || shadowY) ? `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowColor}` : undefined,
            fontFamily: settings.global_text_font_family || "Inter",
        };

        if (bgType === "image") {
            styles.backgroundSize = "cover";
            styles.backgroundPosition = "center";
        }

        return styles;
    };

    const getBarStyles = (): React.CSSProperties => {
        const bgType = settings.bar_bg_type || "color";
        const bgColor = settings.bar_bg_color || "#1e293b";
        const bgOpacity = settings.bar_bg_opacity ?? 85;
        const borderRadius = settings.bar_border_radius ?? 12;

        let innerBackground = "transparent";
        let innerBackgroundImage = "none";

        if (bgType === "color") {
            const opacityHex = Math.round((parseInt(bgOpacity) || 0) * 2.55).toString(16).padStart(2, "0");
            innerBackground = `${bgColor}${opacityHex}`;
        } else if (bgType === "gradient") {
            if (settings.bar_gradient_data) {
                innerBackgroundImage = activeGenerateGradient(settings.bar_gradient_data);
            } else {
                const angle = settings.bar_gradient_angle || "180";
                const from = settings.bar_gradient_from || "#000000";
                const to = settings.bar_gradient_to || "#ffffff";
                const opacityHex = Math.round((parseInt(settings.bar_gradient_opacity || "100") || 0) * 2.55).toString(16).padStart(2, "0");
                innerBackgroundImage = `linear-gradient(${angle}deg, ${from}${opacityHex}, ${to}${opacityHex})`;
            }
        } else if (bgType === "image" || bgType === "video" || (settings.bar_image_url && bgType !== "gradient")) {
            if (settings.bar_image_url && !String(settings.bar_image_url).startsWith('data:video') && !String(settings.bar_image_url).match(/\.(mp4|webm|ogg)$/i)) {
                innerBackgroundImage = `url(${settings.bar_image_url})`;
            }
        }

        const borderWidth = settings.bar_border_width ?? 0;
        const borderStyle = settings.bar_border_style || "solid";
        const borderColor = settings.bar_border_color || "#E07A5F";
        const shadowBlur = settings.bar_shadow_blur ?? 0;
        const shadowColor = settings.bar_shadow_color || "#000000";
        const shadowX = settings.bar_shadow_offset_x ?? 0;
        const shadowY = settings.bar_shadow_offset_y ?? 0;

        return {
            borderRadius: `${borderRadius}px`,
            backgroundColor: innerBackground,
            backgroundImage: innerBackgroundImage !== "none" ? innerBackgroundImage : undefined,
            borderWidth: borderWidth > 0 && borderStyle !== "none" ? `${borderWidth}px` : undefined,
            borderStyle: borderWidth > 0 && borderStyle !== "none" ? borderStyle : undefined,
            borderColor: borderWidth > 0 && borderStyle !== "none" ? borderColor : undefined,
            boxShadow: (shadowBlur || shadowX || shadowY) ? `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowColor}` : undefined,
        };
    };

    const brandingStyles = getBrandingStyles();
    const containerStyles = getContainerStyles();
    const barStyles = getBarStyles();

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

    // Logo resolution
    const rawLogo = event?.logo_url || event?.logo || event?.logo_path || event?.cover_image || event?.banner_image || event?.image_url;
    const eventLogoUrl = rawLogo
        ? (typeof rawLogo === 'string' && (rawLogo.startsWith("http") || rawLogo.startsWith("/")))
            ? rawLogo
            : `/storage/${rawLogo}`
        : null;

    const rawPartnerLogo = event?.partner_logo_url 
        || event?.partner_logo 
        || event?.partner?.logo_url 
        || event?.partner?.logo 
        || data?.branding?.logo;

    const partnerLogoUrl = rawPartnerLogo
        ? (typeof rawPartnerLogo === 'string' && (rawPartnerLogo.startsWith("http") || rawPartnerLogo.startsWith("/")))
            ? rawPartnerLogo
            : `/storage/${rawPartnerLogo}`
        : null;

    const activeEventLogoUrl = settings.event_logo_url || eventLogoUrl;
    const activePartnerLogoUrl = settings.partner_logo_url || partnerLogoUrl || settings.event_icon_url;

    const getLogoConfig = (type: 'event' | 'partner', view: string) => {
        const isEvent = type === 'event';
        const logoUrl = isEvent ? activeEventLogoUrl : activePartnerLogoUrl;

        const showKey1 = `${type}_logo_show_${view}`;
        const showKey2 = `${type}_logo_${view}_show`;
        const showKeyLegacy = `${type}_logo_enabled`;
        const isShowSetting = settings[showKey1] ?? settings[showKey2] ?? settings[showKeyLegacy] ?? true;
        const show = isShowSetting && !!logoUrl;

        const getValue = (field: string, legacyField: string, defaultVal: any) => {
            const viewKey = `${type}_logo_${view}_${field}`;
            if (settings[viewKey] !== undefined) return settings[viewKey];
            if (settings[legacyField] !== undefined) return settings[legacyField];
            return defaultVal;
        };

        const vPos = getValue('position_v', `${type}_logo_position_v`, isEvent ? 'top' : 'bottom');
        const hPos = getValue('position_h', `${type}_logo_position_h`, 'center');
        const size = getValue('size', `${type}_logo_size`, isEvent ? 60 : 40);
        const unit = getValue('unit', `${type}_logo_unit`, 'px');
        const mTop = getValue('margin_top', `${type}_logo_margin_top`, 0);
        const mBottom = getValue('margin_bottom', `${type}_logo_margin_bottom`, 0);
        const mLeft = getValue('margin_left', `${type}_logo_margin_left`, 0);
        const mRight = getValue('margin_right', `${type}_logo_margin_right`, 0);
        const mTopUnit = getValue('margin_top_unit', `${type}_logo_margin_top_unit`, getValue('margin_unit', `${type}_logo_margin_unit`, 'px'));
        const mBottomUnit = getValue('margin_bottom_unit', `${type}_logo_margin_bottom_unit`, getValue('margin_unit', `${type}_logo_margin_unit`, 'px'));
        const mLeftUnit = getValue('margin_left_unit', `${type}_logo_margin_left_unit`, getValue('margin_unit', `${type}_logo_margin_unit`, 'px'));
        const mRightUnit = getValue('margin_right_unit', `${type}_logo_margin_right_unit`, getValue('margin_unit', `${type}_logo_margin_unit`, 'px'));

        const style = getLogoStyle(
            vPos, hPos, size, unit,
            mTop, mBottom, mLeft, mRight,
            mTopUnit, mBottomUnit, mLeftUnit, mRightUnit
        );

        return { show, style, logoUrl };
    };

    const getLogoStyle = (
        vPos = 'top', 
        hPos = 'center', 
        size = 60, 
        unit = 'px',
        mTop = 0,
        mBottom = 0,
        mLeft = 0,
        mRight = 0,
        mTopUnit = 'px',
        mBottomUnit = 'px',
        mLeftUnit = 'px',
        mRightUnit = 'px'
    ): React.CSSProperties => {
        const isPercent = unit === '%';
        const style: React.CSSProperties = {
            position: 'absolute',
            objectFit: 'contain',
            zIndex: 35,
            pointerEvents: 'none',
        };

        if (isPercent) {
            style.width = `${Math.min(Math.max(size, 10), 100)}%`;
            style.maxHeight = '50%';
        } else {
            style.maxHeight = `${size}px`;
            style.maxWidth = '85%';
        }

        const topVal = vPos === 'top' ? 12 : 0;
        const bottomVal = vPos === 'bottom' ? 12 : 0;
        const leftVal = hPos === 'left' ? 12 : 0;
        const rightVal = hPos === 'right' ? 12 : 0;

        if (vPos === 'top') style.top = `calc(${topVal}px + ${mTop}${mTopUnit} - ${mBottom}${mBottomUnit})`;
        else if (vPos === 'bottom') style.bottom = `calc(${bottomVal}px + ${mBottom}${mBottomUnit} - ${mTop}${mTopUnit})`;
        else {
            style.top = `calc(50% + ${mTop}${mTopUnit} - ${mBottom}${mBottomUnit})`;
            style.transform = (hPos === 'center') ? 'translate(-50%, -50%)' : 'translateY(-50%)';
        }

        if (hPos === 'left') style.left = `calc(${leftVal}px + ${mLeft}${mLeftUnit} - ${mRight}${mRightUnit})`;
        else if (hPos === 'right') style.right = `calc(${rightVal}px + ${mRight}${mRightUnit} - ${mLeft}${mLeftUnit})`;
        else {
            style.left = `calc(50% + ${mLeft}${mLeftUnit} - ${mRight}${mRightUnit})`;
            if (vPos !== 'center') style.transform = 'translateX(-50%)';
        }

        return style;
    };

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

            {/* cFondo_Imagen — background image if screen_image_url exists and bgType is image or transparent */}
            {settings.screen_image_url && (settings.screen_bg_type === 'image' || settings.screen_bg_color === 'transparent') && settings.screen_bg_type !== 'video' && ["welcome", "gallery"].includes(previewView) && (
                <div
                    className="absolute inset-0 z-[1] bg-cover bg-center transition-opacity duration-300"
                    style={{ backgroundImage: `url(${settings.screen_image_url})` }}
                />
            )}

            {/* cFondo_Video — background video if screen_bg_type is video or screen_bg_color is transparent and video loaded */}
            {(settings.screen_bg_type === 'video' || (settings.screen_bg_color === 'transparent' && settings.screen_bg_type === 'video')) && settings.screen_image_url && ["welcome", "gallery"].includes(previewView) && (
                <div className="absolute inset-0 z-[1] w-full h-full overflow-hidden flex items-center justify-center bg-black">
                    <video
                        src={settings.screen_image_url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className={`object-cover transition-transform duration-300 ${
                            settings.screen_video_rotate
                                ? 'w-[520px] h-[260px] max-w-none max-h-none rotate-90 scale-[2.2]'
                                : 'w-full h-full'
                        }`}
                    />
                </div>
            )}

            {/* Capa de tinte / color y desenfoque glass sobre el FONDO (screen) de pantalla */}
            {settings.screen_image_url && ["welcome", "gallery"].includes(previewView) && (
                <div
                    className={`absolute inset-0 w-full h-full z-[1] pointer-events-none transition-all ${
                        (settings.screen_glass_enabled ?? true) ? 'backdrop-blur-md' : ''
                    }`}
                    style={{
                        backgroundColor: (() => {
                            const bgColor = settings.screen_bg_color || "#0a0a0a";
                            const bgOpacity = settings.screen_bg_opacity ?? 100;
                            if (bgColor === 'transparent') return 'transparent';
                            const opacityHex = Math.round((parseInt(bgOpacity) || 0) * 2.55).toString(16).padStart(2, "0");
                            return `${bgColor}${opacityHex}`;
                        })()
                    }}
                />
            )}

            {/* cFondo_Evento — event branding background (used for welcome and gallery when not transparent/image/video) */}
            <div
                className={`absolute inset-0 z-[1] transition-opacity duration-[800ms] ease-in-out ${["welcome", "gallery"].includes(previewView) && settings.screen_bg_type !== 'video' && (!settings.screen_image_url || settings.screen_bg_color !== 'transparent') ? "opacity-100" : "opacity-0"}`}
                style={brandingStyles}
            />

            {/* Inner content container */}
            <div
                className={`relative z-20 flex flex-col items-center justify-between w-full h-full transition-all duration-300 ${isLandscape ? "rotate-90" : ""}`}
            >
                {/* ===== VISTA WELCOME / BIENVENIDA ===== */}
                {previewView === "welcome" && (() => {
                    const eventCfg = getLogoConfig('event', 'welcome');
                    const partnerCfg = getLogoConfig('partner', 'welcome');
                    return (
                        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
                            <div className={`w-full flex flex-col items-center gap-4 transition-opacity duration-[800ms] ease-in-out opacity-100 mb-8`}>
                                {/* Logo del evento */}
                                {eventCfg.show && (
                                    <img
                                        src={eventCfg.logoUrl!}
                                        alt="Logo Evento"
                                        style={eventCfg.style}
                                        className="drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                                    />
                                )}

                                {/* Logo del Partner / Marca */}
                                {partnerCfg.show && (
                                    <img
                                        src={partnerCfg.logoUrl!}
                                        alt="Logo Partner"
                                        style={partnerCfg.style}
                                        className="drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                                    />
                                )}

                                {/* Contenedor principal — igual que EventLogin */}
                                <div
                                    className="backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/10 flex flex-col items-center justify-center w-full max-w-[320px] relative overflow-hidden"
                                    style={containerStyles}
                                >
                                    {/* Video de fondo para el contenedor de Mensaje */}
                                    {(settings.container_bg_type === 'video' ||
                                      String(settings.container_image_url || '').startsWith('data:video') ||
                                      String(settings.container_image_url || '').match(/\.(mp4|webm|ogg)$/i)) && settings.container_image_url ? (
                                        <video
                                            src={settings.container_image_url}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className={`absolute inset-0 w-full h-full object-cover z-0 pointer-events-none ${settings.container_video_rotate ? 'scale-[2.2] rotate-90' : ''}`}
                                        />
                                    ) : settings.container_image_url ? (
                                        <div
                                            className="absolute inset-0 w-full h-full bg-cover bg-center z-0 pointer-events-none"
                                            style={{ backgroundImage: `url(${settings.container_image_url})` }}
                                        />
                                    ) : null}

                                    {/* Capa de tinte / color y desenfoque glass sobre la imagen o video */}
                                    {settings.container_image_url && (
                                        <div
                                            className={`absolute inset-0 w-full h-full z-[1] pointer-events-none ${
                                                (settings.container_glass_enabled ?? true) ? 'backdrop-blur-md' : ''
                                            }`}
                                            style={{
                                                backgroundColor: (() => {
                                                    const bgColor = settings.container_bg_color || "#0f172a";
                                                    const bgOpacity = settings.container_bg_opacity ?? 75;
                                                    const opacityHex = Math.round((parseInt(bgOpacity) || 0) * 2.55).toString(16).padStart(2, "0");
                                                    return `${bgColor}${opacityHex}`;
                                                })()
                                            }}
                                        />
                                    )}

                                    <div className="relative z-10 w-full flex flex-col items-center justify-center">
                                    {/* Subtítulo bienvenida */}
                                    <h3
                                        className="text-[9px] uppercase tracking-widest mb-2 mt-1"
                                        style={{
                                            color: settings.global_text_font_color || settings.subtitle_font_color || "#ffffff",
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
                                            color: settings.global_title_font_color || settings.title_font_color || "#ffffff",
                                            fontFamily: settings.global_title_font_family || settings.title_font_family || "Inter",
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
                                            color: settings.global_text_font_color || settings.subtitle_font_color || "#ffffff",
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
                        </div>
                    );
                })()}

                {/* ===== VISTA CÁMARA ===== */}
                {previewView === "camera" && (() => {
                    const eventCfg = getLogoConfig('event', 'camera');
                    const partnerCfg = getLogoConfig('partner', 'camera');
                    return (
                    <div
                        className="absolute inset-0 z-[2] bg-cover bg-center overflow-hidden flex flex-col"
                        style={{ backgroundColor: "#111", backgroundImage: "linear-gradient(135deg, #2a1a3e 0%, #16213e 50%, #0f3460 100%)" }}
                    >
                        {/* Logos en Cámara */}
                        {eventCfg.show && (
                            <img
                                src={eventCfg.logoUrl!}
                                alt="Logo Evento"
                                style={eventCfg.style}
                                className="drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                            />
                        )}
                        {partnerCfg.show && (
                            <img
                                src={partnerCfg.logoUrl!}
                                alt="Logo Partner"
                                style={partnerCfg.style}
                                className="drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                            />
                        )}

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
                                    className="absolute inset-0 z-[-1] pointer-events-none shadow-xl backdrop-blur-md overflow-hidden"
                                    style={{
                                        borderRadius: "12px 12px 0 0",
                                        ...barStyles,
                                        WebkitMaskImage: dockEncodedMask,
                                        maskImage: dockEncodedMask,
                                        WebkitMaskSize: "100% 100%",
                                        maskSize: "100% 100%",
                                    }}
                                >
                                    {/* Video o Imagen de fondo para la Barra */}
                                    {(settings.bar_bg_type === 'video' ||
                                      String(settings.bar_image_url || '').startsWith('data:video') ||
                                      String(settings.bar_image_url || '').match(/\.(mp4|webm|ogg)$/i)) && settings.bar_image_url ? (
                                        <video
                                            src={settings.bar_image_url}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className={`absolute inset-0 w-full h-full object-cover z-0 pointer-events-none ${settings.bar_video_rotate ? 'scale-[2.2] rotate-90' : ''}`}
                                        />
                                    ) : settings.bar_image_url ? (
                                        <div
                                            className="absolute inset-0 w-full h-full bg-cover bg-center z-0 pointer-events-none"
                                            style={{ backgroundImage: `url(${settings.bar_image_url})` }}
                                        />
                                    ) : null}

                                    {/* Capa de tinte / color y desenfoque glass para Barra */}
                                    {settings.bar_image_url && (
                                        <div
                                            className={`absolute inset-0 w-full h-full z-[1] pointer-events-none ${
                                                (settings.bar_glass_enabled ?? true) ? 'backdrop-blur-md' : ''
                                            }`}
                                            style={{
                                                backgroundColor: (() => {
                                                    const bgColor = settings.bar_bg_color || "#1e293b";
                                                    const bgOpacity = settings.bar_bg_opacity ?? 85;
                                                    const opacityHex = Math.round((parseInt(bgOpacity) || 0) * 2.55).toString(16).padStart(2, "0");
                                                    return `${bgColor}${opacityHex}`;
                                                })()
                                            }}
                                        />
                                    )}
                                </div>
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
                    );
                })()}

                {/* ===== VISTA GALERÍA ===== */}
                {previewView === "gallery" && (() => {
                    const eventCfg = getLogoConfig('event', 'gallery');
                    const partnerCfg = getLogoConfig('partner', 'gallery');
                    return (
                    <div className="absolute inset-0 z-30 flex flex-col bg-gray-900 overflow-hidden" style={brandingStyles}>
                        {/* Logos en Galería */}
                        {eventCfg.show && (
                            <img
                                src={eventCfg.logoUrl!}
                                alt="Logo Evento"
                                style={eventCfg.style}
                                className="drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                            />
                        )}
                        {partnerCfg.show && (
                            <img
                                src={partnerCfg.logoUrl!}
                                alt="Logo Partner"
                                style={partnerCfg.style}
                                className="drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                            />
                        )}

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
                    );
                })()}
            </div>
        </div>
    );
}
