// @ts-nocheck
import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, ChevronDown, Building2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePartner } from '../../context/PartnerContext';
import api from '../../lib/api';
import type { Partner } from '../../types';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { selectedPartner, setSelectedPartner } = usePartner();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [partners, setPartners] = useState<Partner[]>([]);
  const [showPartnerDropdown, setShowPartnerDropdown] = useState(false);
  const partnerDropdownRef = useRef<HTMLDivElement>(null);

  const currentPartnerObj = partners.find(p => p.id === selectedPartner) || null;

  useEffect(() => {
    if (user) {
      api.get('/partners')
        .then(res => setPartners(res.data.data || res.data))
        .catch(err => console.error('Error fetching partners', err));
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (partnerDropdownRef.current && !partnerDropdownRef.current.contains(e.target as Node)) {
        setShowPartnerDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <header
      className="flex h-12 items-center gap-4 px-4 md:px-6"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 md:hidden"
        style={{ color: 'var(--text-muted)' }}
      >
        <Menu size={22} />
      </button>

      <div className="flex items-center gap-2 md:ml-4">
        <div className="relative" ref={partnerDropdownRef}>
          <button
            onClick={() => setShowPartnerDropdown(!showPartnerDropdown)}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors"
            style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
          >
            {currentPartnerObj ? (
              <div className="flex items-center gap-2">
                {currentPartnerObj.logo_url ? (
                  <img src={currentPartnerObj.logo_url} alt="logo" className="h-5 w-5 rounded object-cover" />
                ) : (
                  <Building2 size={16} style={{ color: 'var(--primary-accent)' }} />
                )}
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium leading-none">{currentPartnerObj.business_name}</span>
                  {user?.role === 'superadmin' && currentPartnerObj.user?.name && (
                    <span className="text-[10px] leading-none opacity-70 mt-0.5" style={{ color: 'var(--text-muted)' }}>{currentPartnerObj.user.name}</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Building2 size={16} style={{ color: 'var(--primary-accent)' }} />
                <span className="text-sm font-medium">
                  {user?.role === 'superadmin' ? 'Todos los Partners' : 'Mis Partners'}
                </span>
              </div>
            )}
            <ChevronDown size={14} className="ml-1 opacity-70" />
          </button>
          
          {showPartnerDropdown && (
             <div className="absolute left-0 mt-2 w-64 rounded-xl shadow-lg py-1 z-50 max-h-96 overflow-y-auto" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
               <button onClick={() => { setSelectedPartner('all'); setShowPartnerDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                 <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                   <Building2 size={16} style={{ color: 'var(--primary-accent)' }} />
                 </div>
                 <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                   {user?.role === 'superadmin' ? 'Todos los Partners' : 'Mis Partners'}
                 </span>
               </button>
               {partners.map(p => (
                 <button key={p.id} onClick={() => { setSelectedPartner(p.id); setShowPartnerDropdown(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderTop: '1px solid var(--border-color)' }}>
                   {p.logo_url ? (
                     <img src={p.logo_url} alt="logo" className="h-7 w-7 rounded object-cover shrink-0" />
                   ) : (
                     <div className="flex h-7 w-7 items-center justify-center rounded shrink-0" style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}>
                       <Building2 size={14} />
                     </div>
                   )}
                   <div className="flex flex-col min-w-0">
                     <span className="text-sm font-medium truncate" style={{ color: 'var(--text-main)' }}>{p.business_name}</span>
                     {user?.role === 'superadmin' && p.user?.name && (
                       <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{p.user.name}</span>
                     )}
                   </div>
                 </button>
               ))}
             </div>
          )}
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button
          className="relative rounded-lg p-2 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <Bell size={20} />
          <span
            className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full ring-2"
            style={{
              backgroundColor: 'var(--primary-accent)',
              ringColor: 'var(--bg-card)',
            }}
          />
        </button>
      </div>
    </header>
  );
}
