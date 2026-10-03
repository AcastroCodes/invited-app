import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
    X, Type, Search, Plus, Star, Globe, Laptop, 
    Check, Layout, MessageSquareText, Filter, Sparkles, Loader2 
} from 'lucide-react';

interface Font {
    id: string;
    name: string;
    url?: string;
    type: 'system' | 'custom' | 'google';
    category: 'script' | 'serif' | 'sans' | 'display' | 'all';
    isPinned?: boolean;
}

interface FontPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (fontName: string) => void;
    currentFont?: string;
    customFonts?: any[];
    onAddCustomFont?: (file: File) => void;
}

const FontPickerModal: React.FC<FontPickerModalProps> = ({ 
    isOpen, onClose, onSelect, currentFont, customFonts = [], onAddCustomFont 
}) => {
    const [search, setSearch] = useState('');
    const [previewText, setPreviewText] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'custom' | 'google' | 'favorites'>('all');
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [visibleCount, setVisibleCount] = useState(12);
    const [selectedFont, setSelectedFont] = useState<string>(currentFont || 'Inter');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (currentFont) {
            setSelectedFont(currentFont);
        }
    }, [currentFont, isOpen]);

    // CATÁLOGO EXTENDIDO GOOGLE FONTS (36 FUENTES DE DPHOTOS)
    const googleFontsData: Font[] = useMemo(() => [
        // SCRIPT / CALIGRAFÍA
        { id: 'g1', name: 'Dancing Script', type: 'google', category: 'script' },
        { id: 'g2', name: 'Great Vibes', type: 'google', category: 'script' },
        { id: 'g3', name: 'Alex Brush', type: 'google', category: 'script' },
        { id: 'g4', name: 'Pinyon Script', type: 'google', category: 'script' },
        { id: 'g5', name: 'Pacifico', type: 'google', category: 'script' },
        { id: 'g6', name: 'Allura', type: 'google', category: 'script' },
        { id: 'g7', name: 'Parisienne', type: 'google', category: 'script' },
        { id: 'g8', name: 'Meie Script', type: 'google', category: 'script' },
        { id: 'g9', name: 'Arizonia', type: 'google', category: 'script' },
        { id: 'g10', name: 'Satisfy', type: 'google', category: 'script' },
        { id: 'g11', name: 'Cookie', type: 'google', category: 'script' },
        { id: 'g12', name: 'Yellowtail', type: 'google', category: 'script' },
        
        // SERIF / LUXE
        { id: 'g13', name: 'Playfair Display', type: 'google', category: 'serif' },
        { id: 'g14', name: 'Cinzel', type: 'google', category: 'serif' },
        { id: 'g15', name: 'Bodoni Moda', type: 'google', category: 'serif' },
        { id: 'g16', name: 'Prata', type: 'google', category: 'serif' },
        { id: 'g17', name: 'Marcellus', type: 'google', category: 'serif' },
        { id: 'g18', name: 'EB Garamond', type: 'google', category: 'serif' },
        { id: 'g19', name: 'Italiana', type: 'google', category: 'serif' },
        { id: 'g20', name: 'Cormorant Garamond', type: 'google', category: 'serif' },
        { id: 'g21', name: 'Lora', type: 'google', category: 'serif' },
        { id: 'g22', name: 'Crimson Text', type: 'google', category: 'serif' },

        // SANS / MODERN MINIMAL
        { id: 'g23', name: 'Montserrat', type: 'google', category: 'sans' },
        { id: 'g24', name: 'Poppins', type: 'google', category: 'sans' },
        { id: 'g25', name: 'Quicksand', type: 'google', category: 'sans' },
        { id: 'g26', name: 'Raleway', type: 'google', category: 'sans' },
        { id: 'g27', name: 'Syne', type: 'google', category: 'sans' },
        { id: 'g28', name: 'Montserrat Alternates', type: 'google', category: 'sans' },
        { id: 'g29', name: 'Tenor Sans', type: 'google', category: 'sans' },
        { id: 'g30', name: 'Comfortaa', type: 'google', category: 'sans' },

        // DISPLAY / IMPACTO
        { id: 'g31', name: 'Bebas Neue', type: 'google', category: 'display' },
        { id: 'g32', name: 'Oswald', type: 'google', category: 'display' },
        { id: 'g33', name: 'Cinzel Decorative', type: 'google', category: 'display' },
        { id: 'g34', name: 'Unbounded', type: 'google', category: 'display' },
        { id: 'g35', name: 'Abril Fatface', type: 'google', category: 'display' },
        { id: 'g36', name: 'Vidaloka', type: 'google', category: 'display' }
    ], []);

    const systemFont: Font = { id: 's1', name: 'Inter', type: 'system', category: 'sans' };

    const [pinnedFonts, setPinnedFonts] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('invited_pinned_fonts');
            return saved ? JSON.parse(saved) : [];
        } catch(e) { return []; }
    });

    const [allFonts, setAllFonts] = useState<Font[]>([systemFont, ...customFonts, ...googleFontsData]);

    useEffect(() => {
        setAllFonts([systemFont, ...customFonts, ...googleFontsData]);
    }, [customFonts, googleFontsData]);

    useEffect(() => {
        localStorage.setItem('invited_pinned_fonts', JSON.stringify(pinnedFonts));
    }, [pinnedFonts]);

    // FILTRADO DE FUENTES
    const filteredFonts = useMemo(() => {
        let list = allFonts || [];
        if (activeTab === 'custom') list = allFonts.filter(f => f.type === 'custom');
        if (activeTab === 'google') list = allFonts.filter(f => f.type === 'google');
        if (activeTab === 'favorites') list = allFonts.filter(f => pinnedFonts.includes(f.name));
        
        if (activeCategory !== 'all') {
            list = list.filter(f => f.category === activeCategory);
        }

        return list.filter(f => f.name && f.name.toLowerCase().includes(search.toLowerCase()));
    }, [activeTab, activeCategory, allFonts, pinnedFonts, search]);

    const visibleFonts = useMemo(() => filteredFonts.slice(0, visibleCount), [filteredFonts, visibleCount]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 100) {
            if (visibleCount < filteredFonts.length) {
                setVisibleCount(prev => prev + 10);
            }
        }
    };

    const togglePin = (e: React.MouseEvent, fontName: string) => {
        e.stopPropagation();
        setPinnedFonts(prev => 
            prev.includes(fontName) ? prev.filter(f => f !== fontName) : [...prev, fontName]
        );
    };

    const loadGoogleFontIfNeeded = (fontName: string) => {
        const fontObj = allFonts.find(f => f.name === fontName);
        if (fontObj && fontObj.type === 'google') {
            const linkId = `google-font-${fontName.replace(/ /g, '-')}`;
            if (!document.getElementById(linkId)) {
                const link = document.createElement('link');
                link.id = linkId;
                link.rel = 'stylesheet';
                link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}&display=swap`;
                document.head.appendChild(link);
            }
        }
    };

    const handleSelectFontCard = (fontName: string) => {
        setSelectedFont(fontName);
        loadGoogleFontIfNeeded(fontName);
    };

    const handleApply = () => {
        if (!selectedFont) return;
        loadGoogleFontIfNeeded(selectedFont);
        onSelect(selectedFont);
        onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto animate-in fade-in duration-200">
            {/* INYECTOR DINÁMICO DE FUENTES PARA EL CATÁLOGO VISIBLE */}
            <style dangerouslySetInnerHTML={{ __html: visibleFonts.filter(f => f.type === 'google').map(f => f.name ? `@import url('https://fonts.googleapis.com/css2?family=${f.name.replace(/ /g, '+')}&display=swap');` : '').join('\n') }} />

            <div 
                className="w-full max-w-6xl h-[88vh] max-h-[92vh] flex flex-col rounded-md shadow-lg my-auto overflow-hidden"
                style={{ 
                    backgroundColor: 'var(--bg-card)', 
                    border: '1px solid var(--border-color)',
                    borderTop: '2px solid var(--primary-accent)',
                    borderBottom: '2px solid var(--primary-accent)'
                }}
            >
                <div className="pt-3" />

                {/* BANNER DE CABECERA CON EL ESTILO EXACTO DEL MODAL DE EVENTOS */}
                <div 
                    className="mb-1 flex items-center justify-between rounded-t-md px-3 py-1.5 shrink-0 mx-5"
                    style={{ 
                        borderLeft: '3px solid var(--primary-accent)', 
                        backgroundColor: 'var(--primary-accent-light)' 
                    }}
                >
                    <div className="flex items-center gap-2">
                        <Type size={18} style={{ color: 'var(--primary-accent)' }} />
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>
                            Font Management
                        </h3>
                        <span className="text-xs font-normal opacity-75" style={{ color: 'var(--text-muted)' }}>
                            — Catálogo Tipográfico
                        </span>
                    </div>

                    <button 
                        type="button"
                        onClick={onClose} 
                        className="rounded-lg p-1.5 transition-colors hover:opacity-70 cursor-pointer"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 flex-1 min-h-0 flex flex-col sm:flex-row gap-4 items-stretch overflow-hidden">
                    {/* SIDEBAR DE PESTAÑAS (TIPO EVENTOS) */}
                    <div 
                        className="w-full sm:w-52 border rounded-md p-3 space-y-1.5 shrink-0"
                        style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                    >
                        <button 
                            onClick={() => { setActiveTab('all'); setVisibleCount(12); }} 
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-bold uppercase transition-all cursor-pointer ${
                                activeTab === 'all' ? 'shadow-2xs' : 'hover:opacity-80'
                            }`}
                            style={{ 
                                backgroundColor: activeTab === 'all' ? 'var(--primary-accent)' : 'transparent',
                                color: activeTab === 'all' ? '#ffffff' : 'var(--text-muted)',
                            }}
                        >
                            <Type size={14}/> Colección Completa
                        </button>

                        <button 
                            onClick={() => { setActiveTab('favorites'); setVisibleCount(12); }} 
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-bold uppercase transition-all cursor-pointer ${
                                activeTab === 'favorites' ? 'shadow-2xs' : 'hover:opacity-80'
                            }`}
                            style={{ 
                                backgroundColor: activeTab === 'favorites' ? 'var(--secondary-accent)' : 'transparent',
                                color: activeTab === 'favorites' ? '#212121' : 'var(--text-muted)',
                            }}
                        >
                            <Star size={14} fill={activeTab === 'favorites' ? 'currentColor' : 'none'}/> Mis Favoritos
                        </button>

                        <button 
                            onClick={() => { setActiveTab('custom'); setVisibleCount(12); }} 
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-bold uppercase transition-all cursor-pointer ${
                                activeTab === 'custom' ? 'shadow-2xs' : 'hover:opacity-80'
                            }`}
                            style={{ 
                                backgroundColor: activeTab === 'custom' ? 'var(--primary-accent-light)' : 'transparent',
                                color: activeTab === 'custom' ? 'var(--primary-accent)' : 'var(--text-muted)',
                            }}
                        >
                            <Laptop size={14}/> Instaladas
                        </button>

                        <button 
                            onClick={() => { setActiveTab('google'); setVisibleCount(12); }} 
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-bold uppercase transition-all cursor-pointer ${
                                activeTab === 'google' ? 'shadow-2xs' : 'hover:opacity-80'
                            }`}
                            style={{ 
                                backgroundColor: activeTab === 'google' ? '#52B788' : 'transparent',
                                color: activeTab === 'google' ? '#ffffff' : 'var(--text-muted)',
                            }}
                        >
                            <Globe size={14}/> Google Library
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col border rounded-md overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                        {/* BARRA DE HERRAMIENTAS / BÚSQUEDA Y FILTROS */}
                        <div 
                            className="p-3.5 border-b space-y-3 shrink-0"
                            style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                        >
                            <div className="flex flex-col md:flex-row items-center gap-3">
                                <div className="flex-1 relative w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: 'var(--text-muted)' }} />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por nombre..." 
                                        value={search}
                                        onChange={(e) => { setSearch(e.target.value); setVisibleCount(12); }}
                                        className="w-full border rounded-md pl-9 pr-3 py-1.5 text-xs outline-none transition-all font-medium"
                                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                    />
                                </div>
                                <div className="flex-1 relative w-full">
                                    <MessageSquareText className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: 'var(--primary-accent)' }} />
                                    <input 
                                        type="text" 
                                        placeholder="Texto de prueba..." 
                                        value={previewText}
                                        onChange={(e) => setPreviewText(e.target.value)}
                                        className="w-full border rounded-md pl-9 pr-3 py-1.5 text-xs outline-none transition-all italic font-medium"
                                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
                                    />
                                </div>
                                {onAddCustomFont && (
                                    <label 
                                        className="flex-none text-white px-3 py-1.5 rounded-md font-bold uppercase tracking-wider text-[10px] cursor-pointer transition-all flex items-center gap-1.5 border-none shadow-2xs hover:opacity-90"
                                        style={{ backgroundColor: 'var(--primary-accent)' }}
                                    >
                                        <Plus size={14}/> Subir .TTF
                                        <input type="file" className="hidden" accept=".ttf,.otf" onChange={(e) => { const f = e.target.files?.[0]; if(f) onAddCustomFont(f); }} />
                                    </label>
                                )}
                            </div>
                            
                            {/* CATEGORÍAS */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 invisible-scrollbar">
                                <span className="text-[10px] font-bold uppercase tracking-wider mr-1 flex items-center gap-1 shrink-0" style={{ color: 'var(--text-muted)' }}>
                                    <Filter size={11} /> Clasificación:
                                </span>
                                {[
                                    { id: 'all', label: 'Todo' },
                                    { id: 'script', label: 'Caligrafía' },
                                    { id: 'serif', label: 'Luxe Serif' },
                                    { id: 'sans', label: 'Minimal Sans' },
                                    { id: 'display', label: 'Impacto' }
                                ].map(cat => (
                                    <button 
                                        key={cat.id} 
                                        onClick={() => { setActiveCategory(cat.id); setVisibleCount(12); }}
                                        className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer"
                                        style={{
                                            backgroundColor: activeCategory === cat.id ? 'var(--primary-accent)' : 'var(--bg-card)',
                                            color: activeCategory === cat.id ? '#ffffff' : 'var(--text-muted)',
                                            borderColor: activeCategory === cat.id ? 'var(--primary-accent)' : 'var(--border-color)',
                                        }}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* LISTADO DE FUENTES */}
                        <div 
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-4 space-y-5"
                        >
                            {/* FAVORITOS */}
                            {pinnedFonts.length > 0 && !search && activeCategory === 'all' && (
                                <div className="space-y-2.5">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--secondary-accent)' }}>
                                        <Star size={12} fill="currentColor"/> Colección Favorita
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {allFonts.filter(f => f && f.name && pinnedFonts.includes(f.name)).map(font => (
                                            <FontRow 
                                                key={`fav-${font.id}`} 
                                                font={font} 
                                                previewText={previewText} 
                                                isPinned={true} 
                                                isSelected={selectedFont === font.name} 
                                                onSelect={() => handleSelectFontCard(font.name)}
                                                onDoubleClick={handleApply}
                                                onTogglePin={(e) => togglePin(e, font.name)} 
                                            />
                                        ))}
                                    </div>
                                    <div className="h-px border-b my-3" style={{ borderColor: 'var(--border-color)' }} />
                                </div>
                            )}

                            {/* LISTADO GENERAL */}
                            <div className="space-y-2.5 pb-8">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 italic" style={{ color: 'var(--text-muted)' }}>
                                    <Layout size={12} /> Catálogo {activeCategory !== 'all' ? `(${activeCategory.toUpperCase()})` : ''}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {visibleFonts.length === 0 ? (
                                        <div className="col-span-full py-12 text-center rounded-md border-2 border-dashed" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}>
                                            <p className="font-bold uppercase tracking-widest text-xs italic" style={{ color: 'var(--text-muted)' }}>
                                                No se encontraron tipografías en esta categoría.
                                            </p>
                                        </div>
                                    ) : (
                                        visibleFonts.map(font => (
                                            <FontRow 
                                                key={font.id} 
                                                font={font} 
                                                previewText={previewText} 
                                                isPinned={pinnedFonts.includes(font.name)} 
                                                isSelected={selectedFont === font.name} 
                                                onSelect={() => handleSelectFontCard(font.name)}
                                                onDoubleClick={handleApply}
                                                onTogglePin={(e) => togglePin(e, font.name)} 
                                            />
                                        ))
                                    )}
                                </div>
                                
                                {visibleCount < filteredFonts.length && (
                                    <div className="py-4 flex flex-col items-center justify-center gap-1.5 opacity-60 animate-pulse">
                                        <Loader2 className="animate-spin" size={20} style={{ color: 'var(--primary-accent)' }} />
                                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                            Cargando más tipografías...
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER OFICIAL CON BOTÓN ACEPTAR / APLICAR Y CANCELAR */}
                <div 
                    className="px-6 py-3 border-t shrink-0 flex items-center justify-between"
                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
                >
                    <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                        <span>Fuente seleccionada:</span>
                        <span 
                            className="text-xs font-extrabold px-2.5 py-1 rounded border"
                            style={{ 
                                color: 'var(--primary-accent)', 
                                backgroundColor: 'var(--primary-accent-light)',
                                borderColor: 'transparent',
                                fontFamily: selectedFont || 'Inter'
                            }}
                        >
                            {selectedFont || 'Ninguna'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-1.5 rounded-md font-bold text-xs uppercase tracking-wider transition-colors hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleApply}
                            disabled={!selectedFont}
                            className="px-5 py-1.5 text-white rounded-md font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                            style={{ backgroundColor: 'var(--primary-accent)' }}
                        >
                            <Check size={16} />
                            <span>Aceptar / Aplicar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

interface FontRowProps {
    font: Font;
    previewText?: string;
    isPinned: boolean;
    isSelected: boolean;
    onSelect: () => void;
    onDoubleClick?: () => void;
    onTogglePin: (e: React.MouseEvent) => void;
}

const FontRow: React.FC<FontRowProps> = ({ font, previewText, isPinned, isSelected, onSelect, onDoubleClick, onTogglePin }) => {
    if (!font) return null;
    return (
        <div 
            onClick={onSelect}
            onDoubleClick={onDoubleClick}
            className={`group rounded-md border transition-all duration-200 relative cursor-pointer overflow-hidden p-3.5 ${
                isSelected ? 'ring-2 shadow-xs scale-[1.01]' : 'hover:shadow-2xs'
            }`}
            style={{ 
                backgroundColor: 'var(--bg-app)',
                borderColor: isSelected ? 'var(--primary-accent)' : 'var(--border-color)',
            }}
        >
            {/* BOTÓN ESTRELLA FAVORITOS */}
            <button 
                onClick={onTogglePin} 
                className="absolute top-2.5 right-2.5 z-30 p-1.5 rounded-md transition-all cursor-pointer"
                style={{ 
                    color: isPinned ? 'var(--secondary-accent)' : 'var(--text-muted)',
                    backgroundColor: isPinned ? 'var(--primary-accent-light)' : 'var(--bg-card)',
                }}
                title={isPinned ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
                <Star size={13} fill={isPinned ? 'currentColor' : 'none'}/>
            </button>

            <div className="flex items-center gap-2 mb-1.5">
                <span 
                    className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1"
                    style={{
                        backgroundColor: font.category === 'script' ? 'rgba(236, 72, 153, 0.15)' :
                                         font.category === 'serif' ? 'rgba(59, 130, 246, 0.15)' :
                                         font.category === 'display' ? 'rgba(168, 85, 247, 0.15)' : 'var(--primary-accent-light)',
                        color: font.category === 'script' ? '#ec4899' :
                               font.category === 'serif' ? '#3b82f6' :
                               font.category === 'display' ? '#a855f7' : 'var(--primary-accent)',
                        borderColor: 'transparent'
                    }}
                >
                    <Sparkles size={9}/> {font.category === 'sans' ? 'Modern Sans' : font.category}
                </span>
                {isSelected && <Check size={13} style={{ color: 'var(--primary-accent)' }} className="animate-in zoom-in" />}
            </div>

            <div className="min-h-[40px] flex items-center pr-6">
                <p 
                    className="text-2xl truncate transition-all font-normal"
                    style={{ 
                        fontFamily: font.name,
                        color: 'var(--text-main)'
                    }}
                >
                    {previewText || font.name}
                </p>
            </div>
            
            <div className="mt-2.5 flex items-center justify-between border-t pt-2" style={{ borderColor: 'var(--border-color)' }}>
                <p className="text-[9px] font-bold uppercase tracking-wider truncate" style={{ color: 'var(--text-muted)' }}>
                    {font.name}
                </p>
                {font.type === 'google' && <Globe size={10} style={{ color: 'var(--text-muted)' }} />}
            </div>
        </div>
    );
};

export default FontPickerModal;
