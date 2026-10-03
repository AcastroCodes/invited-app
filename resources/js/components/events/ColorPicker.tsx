import React, { Fragment, useState, useEffect, useRef, useCallback } from "react";
import { Popover, Transition } from "@headlessui/react";
import { Eye, Pipette, History as HistoryIcon, Palette } from "lucide-react";

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    palette?: string[];
}

const hexToHsv = (hex: string) => {
    let r = 0, g = 0, b = 0;
    hex = (hex || '#ffffff').replace('#', '');
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16) / 255;
        g = parseInt(hex[1] + hex[1], 16) / 255;
        b = parseInt(hex[2] + hex[2], 16) / 255;
    } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16) / 255;
        g = parseInt(hex.substring(2, 4), 16) / 255;
        b = parseInt(hex.substring(4, 6), 16) / 255;
    }
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, v: v * 100 };
};

const hsvToHex = (h: number, s: number, v: number) => {
    h /= 360; s /= 100; v /= 100;
    let r = 0, g = 0, b = 0;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, palette }) => {
    const [hsv, setHsv] = useState({ h: 0, s: 0, v: 100 });
    const [tempHex, setTempHex] = useState(value || '#ffffff');
    const [history, setHistory] = useState<string[]>([]);
    const [hasEyeDropper, setHasEyeDropper] = useState(false);
    
    const triggerRef = useRef<HTMLButtonElement>(null);
    const saturationRef = useRef<HTMLDivElement>(null);
    const hueRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const currentHex = (value || '#ffffff').toUpperCase();
        setTempHex(currentHex);
        setHsv(hexToHsv(currentHex));
        
        const savedHistory = localStorage.getItem('dphotos-color-history');
        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory);
                if (Array.isArray(parsed)) setHistory(parsed);
            } catch { setHistory([]); }
        }
        
        setHasEyeDropper('EyeDropper' in window);
    }, [value]);

    const updateColor = useCallback((newHsv: { h: number, s: number, v: number }) => {
        setHsv(newHsv);
        const newHex = hsvToHex(newHsv.h, newHsv.s, newHsv.v).toUpperCase();
        setTempHex(newHex);
        onChange(newHex);
    }, [onChange]);

    const onSaturationMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        const move = (event: MouseEvent | TouchEvent) => {
            if (!saturationRef.current) return;
            const rect = saturationRef.current.getBoundingClientRect();
            const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
            const clientY = 'touches' in event ? event.touches[0].clientY : (event as MouseEvent).clientY;
            const s = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
            const v = Math.min(100, Math.max(0, (1 - (clientY - rect.top) / rect.height) * 100));
            updateColor({ ...hsv, s, v });
        };
        const up = () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
            window.removeEventListener('touchmove', move);
            window.removeEventListener('touchend', up);
        };
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
        window.addEventListener('touchmove', move);
        window.addEventListener('touchend', up);
    };

    const onHueMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        const move = (event: MouseEvent | TouchEvent) => {
            if (!hueRef.current) return;
            const rect = hueRef.current.getBoundingClientRect();
            const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
            const h = Math.min(360, Math.max(0, ((clientX - rect.left) / rect.width) * 360));
            updateColor({ ...hsv, h });
        };
        const up = () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
            window.removeEventListener('touchmove', move);
            window.removeEventListener('touchend', up);
        };
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
        window.addEventListener('touchmove', move);
        window.addEventListener('touchend', up);
    };

    const saveToHistory = (hex: string) => {
        const updatedHistory = [hex, ...history.filter(c => c !== hex)].slice(0, 12);
        setHistory(updatedHistory);
        localStorage.setItem('dphotos-color-history', JSON.stringify(updatedHistory));
    };

    return (
        <Popover className="relative flex-1">
            <div className="flex gap-2 items-center">
                <Popover.Button 
                    ref={triggerRef}
                    className="w-[26px] h-[26px] flex-shrink-0 rounded-md border border-slate-700 p-0.5 cursor-pointer shadow-sm overflow-hidden bg-slate-900 hover:border-indigo-500"
                >
                    <div className="w-full h-full rounded-[4px]" style={{ backgroundColor: value || '#6366f1' }} />
                </Popover.Button>
                <input
                    type="text"
                    className="flex-1 min-w-0 text-[10px] font-mono uppercase px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white"
                    value={value || '#6366F1'}
                    onChange={(e) => {
                        const val = e.target.value;
                        onChange(val);
                        if (/^#[0-9A-F]{6}$/i.test(val)) {
                            setHsv(hexToHsv(val));
                        }
                    }}
                />
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
            >
                <Popover.Panel className="absolute left-0 z-[110] w-56 mt-2 rounded-xl bg-slate-900 p-3 shadow-2xl border border-slate-800 text-white">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between pb-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1">
                                <Palette className="w-3 h-3" /> Selector de Color
                            </span>
                        </div>

                        <div 
                            ref={saturationRef}
                            onMouseDown={onSaturationMouseDown}
                            onTouchStart={onSaturationMouseDown}
                            className="relative w-full aspect-[4/3] rounded-lg overflow-hidden cursor-crosshair border border-slate-800 shadow-inner"
                            style={{ backgroundColor: hsvToHex(hsv.h, 100, 100) }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                            <div 
                                className="absolute w-3 h-3 border-2 border-white rounded-full shadow-lg -translate-x-1/2 translate-y-1/2 pointer-events-none"
                                style={{ left: `${hsv.s}%`, bottom: `${hsv.v}%` }}
                            />
                        </div>

                        <div className="space-y-2">
                            <div 
                                ref={hueRef}
                                onMouseDown={onHueMouseDown}
                                onTouchStart={onHueMouseDown}
                                className="relative w-full h-2.5 rounded-full cursor-pointer border border-slate-800"
                                style={{ background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}
                            >
                                <div 
                                    className="absolute w-3.5 h-3.5 bg-white border-2 border-slate-700 rounded-full shadow-md -translate-x-1/2 top-[-2px] pointer-events-none"
                                    style={{ left: `${(hsv.h / 360) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </Popover.Panel>
            </Transition>
        </Popover>
    );
};

export default ColorPicker;
