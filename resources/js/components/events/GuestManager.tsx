import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronDown,
  UserPlus,
  Link2,
  Filter,
  Plus,
  FileSpreadsheet,
  UserCheck,
  UserX,
  UserMinus,
} from 'lucide-react';
import api from '../../lib/api';

export interface GuestItem {
  id?: string | number;
  name: string;
  title?: string;
  role: string;
  category?: string;
  isConfirmed: boolean | null;
  dietaryRestrictions?: string;
}

export interface GuestGroupItem {
  id: number;
  eventId: number;
  formalAddressee: string;
  contactEmail?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  maxGuests: number;
  status: string;
  assignedInvitationId?: number | string | null;
  guests: GuestItem[];
}

export interface InvitationOption {
  id: number;
  name: string;
  type: string;
  thumbnail?: string;
}

interface GuestManagerProps {
  eventId: number;
}

export default function GuestManager({ eventId }: GuestManagerProps) {
  const [groups, setGroups] = useState<GuestGroupItem[]>([]);
  const [invitations, setInvitations] = useState<InvitationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GuestGroupItem | null>(null);

  // Form State
  const [formalAddressee, setFormalAddressee] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(true);
  const [isCustomAddressee, setIsCustomAddressee] = useState(false);
  const [isActiveGroup, setIsActiveGroup] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedInvitationId, setSelectedInvitationId] = useState<number | string | null>(null);
  const [guestsList, setGuestsList] = useState<GuestItem[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchGuestData = () => {
    setLoading(true);
    api
      .get(`/events/${eventId}/guests`)
      .then((res) => {
        setGroups(res.data.groups || []);
        setInvitations(res.data.invitations || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (eventId) {
      fetchGuestData();
    }
  }, [eventId]);

  // Smart Addressee Suggestions logic (from deventsapp)
  useEffect(() => {
    if (!isModalOpen) return;
    const principal = guestsList.find((g) => g.role === 'Principal' || g.role === 'Titular');
    if (!principal || !principal.name.trim()) {
      setSuggestions([]);
      return;
    }

    const spouse = guestsList.find((g) => ['Esposo(a)', 'Esposo', 'Esposa', 'Spouse', 'Pareja'].includes(g.role));
    const children = guestsList.filter((g) => ['Hijo(a)', 'Hijo', 'Hija', 'Child'].includes(g.role));
    const parents = guestsList.filter((g) => ['Padre', 'Madre', 'Padre/Madre'].includes(g.role));
    const companions = guestsList.filter((g) => ['Acompañante', 'Companion'].includes(g.role));

    const getLastName = (name: string) => {
      const parts = name.trim().split(' ');
      return parts.length > 1 ? parts[1] : parts[0];
    };

    const newSuggestions: string[] = [];
    const principalFullName = `${principal.title ? principal.title + ' ' : ''}${principal.name}`.trim();

    if (spouse && (children.length > 0 || parents.length > 0)) {
      const principalLastName = getLastName(principal.name);
      const spouseLastName = getLastName(spouse.name);
      newSuggestions.push(`Flia. ${principalLastName} ${spouseLastName}`.trim());
    } else if (children.length > 0) {
      const principalLastName = getLastName(principal.name);
      newSuggestions.push(`Flia. ${principalLastName}`);
    }

    const secondaryAdult = spouse || companions[0];
    if (secondaryAdult) {
      if (secondaryAdult.title === 'Sra.') {
        newSuggestions.push(`${principalFullName} y Sra.`);
      } else if (secondaryAdult.title === 'Sr.') {
        newSuggestions.push(`${principalFullName} y Sr.`);
      }
      const secondaryFullName = `${secondaryAdult.title ? secondaryAdult.title + ' ' : ''}${secondaryAdult.name}`.trim();
      if (secondaryFullName && secondaryAdult.name.trim()) {
        newSuggestions.push(`${principalFullName} y ${secondaryFullName}`);
      }
      newSuggestions.push(`${principalFullName} y Acompañante`);
    }

    if (companions.length > 1) {
      newSuggestions.push(`${principalFullName} y Acompañantes`);
    }

    newSuggestions.push(principalFullName);
    const uniqueSuggestions = Array.from(new Set(newSuggestions.filter(Boolean)));
    setSuggestions(uniqueSuggestions);

    if (!isCustomAddressee && uniqueSuggestions.length > 0) {
      if (!formalAddressee || !uniqueSuggestions.includes(formalAddressee)) {
        setFormalAddressee(uniqueSuggestions[0]);
      }
    }
  }, [guestsList, isCustomAddressee, isModalOpen]);

  const openModal = (group?: GuestGroupItem) => {
    if (group) {
      setEditingGroup(group);
      setFormalAddressee(group.formalAddressee);
      setContactEmail(group.contactEmail || '');
      setContactPhone(group.contactPhone || '');
      setContactWhatsapp(group.contactWhatsapp || group.contactPhone || '');
      setWhatsappSameAsPhone(!group.contactWhatsapp || group.contactWhatsapp === group.contactPhone);
      setSelectedInvitationId(group.assignedInvitationId || null);
      setGuestsList(
        group.guests && group.guests.length
          ? group.guests.map((g) => ({ ...g }))
          : [{ name: '', title: 'Sr.', role: 'Principal', category: 'Adulto', isConfirmed: null }]
      );
      setIsCustomAddressee(true);
    } else {
      setEditingGroup(null);
      setFormalAddressee('');
      setContactEmail('');
      setContactPhone('');
      setContactWhatsapp('');
      setWhatsappSameAsPhone(true);
      setSelectedInvitationId(invitations.length === 1 ? invitations[0].id : null);
      setGuestsList([{ name: '', title: 'Sr.', role: 'Principal', category: 'Adulto', isConfirmed: null }]);
      setIsCustomAddressee(false);
    }
    setIsModalOpen(true);
  };

  const handleAddGuestRow = () => {
    setGuestsList([
      ...guestsList,
      { name: '', title: 'Sr.', role: 'Acompañante', category: 'Adulto', isConfirmed: null },
    ]);
  };

  const handleGuestChange = (index: number, field: keyof GuestItem, value: any) => {
    const newList = [...guestsList];
    let formattedVal = value;
    if (field === 'name' && typeof value === 'string') {
      formattedVal = value
        .split(' ')
        .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
        .join(' ');
    }
    newList[index] = { ...newList[index], [field]: formattedVal };
    setGuestsList(newList);
  };

  const handleRemoveGuestRow = (index: number) => {
    if (guestsList.length > 1) {
      setGuestsList(guestsList.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validGuests = guestsList.filter((g) => g.name && g.name.trim() !== '');
    if (validGuests.length === 0) return alert('Por favor, agrega al menos un integrante con nombre.');

    setSaving(true);
    const finalWhatsapp = whatsappSameAsPhone ? contactPhone : contactWhatsapp;
    const payload = {
      eventId,
      formalAddressee: formalAddressee || (suggestions[0] || 'Invitado Especial'),
      contactEmail,
      contactPhone,
      contactWhatsapp: finalWhatsapp,
      assignedInvitationId: selectedInvitationId || null,
      guests: validGuests,
    };

    const req = editingGroup
      ? api.put(`/guest-groups/${editingGroup.id}`, payload)
      : api.post(`/events/${eventId}/guests`, payload);

    req
      .then(() => {
        setIsModalOpen(false);
        fetchGuestData();
      })
      .catch((err) => {
        const message = err?.response?.data?.message || 'Error al guardar los datos del invitado.';
        alert(message);
        console.error('Error saving guest group:', err?.response?.data || err);
      })
      .finally(() => setSaving(false));
  };

  const handleDelete = (groupId: number) => {
    if (window.confirm('¿Seguro que deseas eliminar este sobre/familia y a todos sus integrantes?')) {
      api
        .delete(`/guest-groups/${groupId}`)
        .then(() => fetchGuestData())
        .catch((err) => console.error(err));
    }
  };

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const matchesSearch =
        g.formalAddressee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.guests.some((pg) => pg.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = statusFilter === 'all' ? true : g.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [groups, searchQuery, statusFilter]);

  const totalSeats = groups.reduce((acc, g) => acc + (g.maxGuests || g.guests.length), 0);
  const confirmedCount = groups.reduce((acc, g) => acc + g.guests.filter((p) => p.isConfirmed).length, 0);
  const pendingCount = totalSeats - confirmedCount;

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary"
          style={{ color: 'var(--primary-accent)' }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar / Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" size={15} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por sobre o nombre de invitado..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl pl-10 pr-4 py-2 text-xs font-medium border outline-none transition-all shadow-sm"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-main)',
            }}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={13} style={{ color: 'var(--text-muted)' }} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full rounded-xl pl-8 pr-4 py-2 text-xs font-bold border outline-none appearance-none shadow-sm"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-main)',
              }}
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmados</option>
            </select>
          </div>

          <button
            type="button"
            title="Cargar lista desde Excel"
            onClick={() => alert('La carga masiva desde Excel estará disponible próximamente.')}
            className="h-[34px] w-[34px] rounded-xl border flex items-center justify-center shrink-0 shadow-sm transition-all hover:bg-emerald-500/10 hover:border-emerald-500 text-emerald-600 dark:text-emerald-400 active:scale-95"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
            }}
          >
            <FileSpreadsheet size={16} />
          </button>

          <button
            type="button"
            onClick={() => openModal()}
            className="px-4 py-2 rounded-xl text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all hover:opacity-90 active:scale-95 flex items-center gap-1.5 shrink-0 h-[34px]"
            style={{ backgroundColor: 'var(--primary-accent)' }}
          >
            <UserPlus size={14} /> + Añadir
          </button>
        </div>
      </div>

      {/* Main Content Grid (Estilo deventsapp) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 min-h-[250px]">
        {filteredGroups.length === 0 ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl flex flex-col items-center justify-center" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
            <Users size={32} className="mx-auto mb-2 opacity-40" />
            <p className="font-extrabold uppercase tracking-wider text-xs mb-1" style={{ color: 'var(--text-main)' }}>Sin Resultados</p>
            <p className="text-[11px]">No se encontraron grupos o invitados con esos criterios.</p>
            {searchQuery || statusFilter !== 'all' ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="mt-3 font-black text-xs uppercase tracking-wider hover:underline"
                style={{ color: 'var(--primary-accent)' }}
              >
                Limpiar Filtros
              </button>
            ) : null}
          </div>
        ) : (
          filteredGroups.map((group) => (
            <GuestGroupCard
              key={group.id}
              group={group}
              invitations={invitations}
              onEdit={() => openModal(group)}
              onDelete={() => handleDelete(group.id)}
            />
          ))
        )}
      </div>

      {/* Modal - Editor de Sobre / Invitación */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div
            className="w-full max-w-4xl rounded-md shadow-lg my-auto flex flex-col max-h-[82vh] overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderTop: '2px solid var(--primary-accent)',
              borderBottom: '2px solid var(--primary-accent)',
            }}
          >
            <div className="pt-3" />
            <div
              className="mb-1 flex items-center justify-between rounded-t-md rounded-none px-4 py-2 shrink-0"
              style={{
                borderLeft: '3px solid var(--primary-accent)',
                backgroundColor: 'var(--primary-accent-light)',
              }}
            >
              <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                <Users size={18} style={{ color: 'var(--primary-accent)' }} />
                {editingGroup ? 'Editar Invitado' : 'Agregar Invitado'}
              </h3>

              <div className="flex items-center gap-4">
                <label
                  className="flex cursor-pointer items-center gap-2 text-sm font-medium select-none"
                  style={{ color: 'var(--text-main)' }}
                >
                  <input
                    type="checkbox"
                    checked={isActiveGroup}
                    onChange={(e) => setIsActiveGroup(e.target.checked)}
                    className="h-4 w-4 rounded cursor-pointer"
                    style={{ accentColor: 'var(--primary-accent)' }}
                  />
                  Activo
                </label>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1.5 transition-colors hover:opacity-70"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
              <form id="guest-group-form" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-5">
                  {/* COLUMNA IZQUIERDA: Nombre de la tarjeta e Integrantes (5/7) */}
                  <div className="md:col-span-5 space-y-3">
                    {/* Nombre de la Tarjeta */}
                    <div className="border-b pb-2.5" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <label className="text-[10px] font-black uppercase tracking-wider opacity-80 shrink-0 whitespace-nowrap" style={{ color: 'var(--text-main)' }}>
                          Nombre de la tarjeta *
                        </label>
                        <select
                          value={
                            isCustomAddressee
                              ? 'custom'
                              : suggestions.includes(formalAddressee)
                              ? formalAddressee
                              : suggestions.length > 0
                              ? suggestions[0]
                              : 'custom'
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'custom') {
                              setIsCustomAddressee(true);
                              setFormalAddressee('');
                            } else {
                              setIsCustomAddressee(false);
                              setFormalAddressee(val);
                            }
                          }}
                          className="flex-1 w-full border rounded-lg px-2.5 py-1.5 text-xs outline-none transition-all"
                          style={{
                            backgroundColor: 'var(--bg-app)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-main)',
                          }}
                        >
                          {suggestions.map((sug, i) => (
                            <option key={i} value={sug}>
                              {sug}
                            </option>
                          ))}
                          {suggestions.length === 0 && !isCustomAddressee && (
                            <option value="">Generando opciones...</option>
                          )}
                          <option value="custom">Personalizar...</option>
                        </select>

                        {isCustomAddressee && (
                          <input
                            required
                            type="text"
                            placeholder="Escribe el nombre..."
                            value={formalAddressee}
                            onChange={(e) => setFormalAddressee(e.target.value)}
                            className="flex-1 w-full border rounded-lg px-2.5 py-1.5 text-xs outline-none transition-all"
                            style={{
                              backgroundColor: 'var(--bg-app)',
                              borderColor: 'var(--primary-accent)',
                              color: 'var(--text-main)',
                            }}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-b pb-1.5" style={{ borderColor: 'var(--border-color)' }}>
                      <h3 className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Integrantes ({guestsList.length})
                      </h3>
                      <button
                        type="button"
                        onClick={handleAddGuestRow}
                        className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-opacity hover:opacity-80"
                        style={{ color: 'var(--primary-accent)' }}
                      >
                        <UserPlus size={13} /> Agregar Integrante
                      </button>
                    </div>

                    <div className="space-y-1 min-h-[280px] max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                      {guestsList.map((guest, index) => {
                        const isFemale = ['Sra.', 'Srita.', 'Dra.'].includes(guest.title || '');
                        const isMale = ['Sr.', 'Srito.', 'Dr.'].includes(guest.title || '');
                        const spouseLabel = isFemale ? 'Esposa' : isMale ? 'Esposo' : 'Esposo(a)';
                        const childLabel = isFemale ? 'Hija' : isMale ? 'Hijo' : 'Hijo(a)';
                        const parentLabel = isFemale ? 'Madre' : isMale ? 'Padre' : 'Padre/Madre';

                        return (
                          <div key={index} className="flex flex-col sm:flex-row items-center gap-1 py-0.5">
                            {/* Trato / Título */}
                            <div className="w-full sm:w-14 shrink-0">
                              <select
                                value={guest.title || ''}
                                onChange={(e) => handleGuestChange(index, 'title', e.target.value)}
                                className="w-full border rounded-md px-1 py-1 text-[11px] outline-none transition-all"
                                style={{
                                  backgroundColor: 'var(--bg-app)',
                                  borderColor: 'var(--border-color)',
                                  color: 'var(--text-main)',
                                }}
                              >
                                <option value="">---</option>
                                <option value="Sr.">Sr.</option>
                                <option value="Sra.">Sra.</option>
                                <option value="Srito.">Srito.</option>
                                <option value="Srita.">Srita.</option>
                                <option value="Dr.">Dr.</option>
                                <option value="Dra.">Dra.</option>
                              </select>
                            </div>

                            {/* Nombre completo */}
                            <div className="flex-1 w-full">
                              <input
                                required
                                type="text"
                                placeholder="Nombre completo"
                                value={guest.name}
                                onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                                className="w-full border rounded-md px-2 py-1 text-[11px] outline-none transition-all"
                                style={{
                                  backgroundColor: 'var(--bg-app)',
                                  borderColor: 'var(--border-color)',
                                  color: 'var(--text-main)',
                                }}
                              />
                            </div>

                            {/* Rol */}
                            <div className="w-full sm:w-22 shrink-0">
                              <select
                                value={guest.role}
                                onChange={(e) => handleGuestChange(index, 'role', e.target.value)}
                                className="w-full border rounded-md px-1.5 py-1 text-[11px] outline-none transition-all"
                                style={{
                                  backgroundColor: 'var(--bg-app)',
                                  borderColor: 'var(--border-color)',
                                  color: 'var(--text-main)',
                                }}
                              >
                                <option value="Principal">Principal</option>
                                <option value={spouseLabel}>{spouseLabel}</option>
                                <option value={childLabel}>{childLabel}</option>
                                <option value={parentLabel}>{parentLabel}</option>
                                <option value="Acompañante">Acompañante</option>
                              </select>
                            </div>

                            {/* Categoría */}
                            <div className="w-full sm:w-18 shrink-0">
                              <select
                                value={guest.category || 'Adulto'}
                                onChange={(e) => handleGuestChange(index, 'category', e.target.value)}
                                className="w-full border rounded-md px-1.5 py-1 text-[11px] outline-none transition-all"
                                style={{
                                  backgroundColor: 'var(--bg-app)',
                                  borderColor: 'var(--border-color)',
                                  color: 'var(--text-main)',
                                }}
                              >
                                <option value="Adulto">Adulto</option>
                                <option value="Joven">Joven</option>
                                <option value="Niño">Niño</option>
                                <option value="Bebé">Bebé</option>
                              </select>
                            </div>

                            {/* Eliminar fila */}
                            {guestsList.length > 1 ? (
                              <button
                                type="button"
                                onClick={() => handleRemoveGuestRow(index)}
                                className="w-6 h-6 shrink-0 flex items-center justify-center rounded-md transition-colors hover:bg-rose-500/10 text-rose-500"
                              >
                                <Trash2 size={13} />
                              </button>
                            ) : (
                              <div className="w-6 h-6 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* COLUMNA DERECHA: Datos de Contacto (2/7) */}
                  <div className="md:col-span-2 space-y-4 md:border-l md:pl-5" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider mb-1 opacity-80 flex items-center gap-1" style={{ color: 'var(--text-main)' }}>
                          <Mail size={11} /> Email
                        </label>
                        <input
                          type="email"
                          placeholder="contacto@ejemplo.com"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full border rounded-lg px-2.5 py-1.5 text-xs outline-none transition-all"
                          style={{
                            backgroundColor: 'var(--bg-app)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-main)',
                          }}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-black uppercase tracking-wider opacity-80 flex items-center gap-1" style={{ color: 'var(--text-main)' }}>
                            <Phone size={11} /> Teléfono
                          </label>
                          <div className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              id="wa-same"
                              checked={whatsappSameAsPhone}
                              onChange={(e) => setWhatsappSameAsPhone(e.target.checked)}
                              className="rounded text-primary focus:ring-primary w-3 h-3"
                            />
                            <label htmlFor="wa-same" className="text-[10px] cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                              WhatsApp
                            </label>
                          </div>
                        </div>

                        <input
                          type="tel"
                          placeholder="Teléfono"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full border rounded-lg px-2.5 py-1.5 text-xs outline-none transition-all"
                          style={{
                            backgroundColor: 'var(--bg-app)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-main)',
                          }}
                        />
                      </div>

                      {!whatsappSameAsPhone && (
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider mb-1 opacity-80 flex items-center gap-1 text-emerald-500">
                            <Phone size={11} /> WhatsApp Dedicado
                          </label>
                          <input
                            type="tel"
                            placeholder="Número de WhatsApp"
                            value={contactWhatsapp}
                            onChange={(e) => setContactWhatsapp(e.target.value)}
                            className="w-full border rounded-lg px-2.5 py-1.5 text-xs outline-none transition-all border-emerald-500/50"
                            style={{
                              backgroundColor: 'var(--bg-app)',
                              color: 'var(--text-main)',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div
              className="px-4 py-2.5 border-t shrink-0 flex justify-end gap-2"
              style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
            >
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                style={{ color: 'var(--text-muted)' }}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="guest-group-form"
                disabled={saving}
                className="px-5 py-1.5 text-white rounded-lg font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                style={{ backgroundColor: 'var(--primary-accent)' }}
              >
                {saving ? 'Guardando...' : editingGroup ? 'Actualizar' : 'Crear Invitado'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const GuestGroupCard: React.FC<{
  group: GuestGroupItem;
  invitations: InvitationOption[];
  onEdit: () => void;
  onDelete: () => void;
}> = ({ group, invitations, onEdit, onDelete }) => {
  // Solo contar respuestas si la invitación fue enviada o si el grupo tiene respuestas reales
  const isSentOrResponded = group.status === 'sent' || group.status === 'Enviada' || group.status === 'enviada' || group.status === 'responded';
  
  const confirmedCount = (isSentOrResponded && group.guests) 
    ? group.guests.filter((g) => g.isConfirmed === true || String(g.isConfirmed) === '1').length 
    : 0;
  const rejectedCount = (isSentOrResponded && group.guests) 
    ? group.guests.filter((g) => g.isConfirmed === false || String(g.isConfirmed) === '0').length 
    : 0;
  const totalGuests = group.guests ? group.guests.length : 0;

  // Solo se considera que hay respuestas si la invitación YA FUE ENVIADA y hay confirmaciones/rechazos explícitos
  const hasResponses = isSentOrResponded && (confirmedCount + rejectedCount) > 0;
  const hasAssignedInvitation = !!group.assignedInvitationId;

  let rsvpText = 'POR ASIGNAR';
  let rsvpColorClass = 'bg-amber-500/15 text-amber-600 dark:text-amber-400';

  if (hasResponses) {
    if (confirmedCount === totalGuests && totalGuests > 0) {
      rsvpText = 'ASISTIRÁN';
      rsvpColorClass = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
    } else if (rejectedCount === totalGuests && totalGuests > 0) {
      rsvpText = 'NO ASISTIRÁN';
      rsvpColorClass = 'bg-rose-500/15 text-rose-500';
    } else {
      rsvpText = 'ASISTENCIA PARCIAL';
      rsvpColorClass = 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
    }
  } else if (group.status === 'sent' || group.status === 'Enviada' || group.status === 'enviada') {
    rsvpText = 'ENVIADA';
    rsvpColorClass = 'bg-sky-500/15 text-sky-600 dark:text-sky-400';
  } else if (hasAssignedInvitation) {
    rsvpText = 'POR ENVIAR';
    rsvpColorClass = 'bg-slate-500/10 text-slate-500 dark:text-slate-400';
  }

  const assignedInvitation = invitations.find((i) => String(i.id) === String(group.assignedInvitationId));
  const hasThumbnail = !!assignedInvitation?.thumbnail;

  return (
    <div
      className="rounded-md shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between max-h-[110px]"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
      }}
    >
      {/* Accent Left Bar */}
      <div className="absolute top-0 left-0 w-1 h-full z-10" style={{ backgroundColor: 'var(--primary-accent)' }} />

      <div className="flex flex-1 min-h-0">
        {/* Thumbnail if assigned */}
        {hasThumbnail && (
          <div className="w-16 shrink-0 relative overflow-hidden border-r ml-1" style={{ borderColor: 'var(--border-color)' }}>
            <img
              src={assignedInvitation.thumbnail}
              alt="Invitación"
              className="w-full h-full object-cover absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </div>
        )}

        {/* Content Body */}
        <div className={`flex-1 py-1 pr-2 ${hasThumbnail ? 'pl-2' : 'pl-2.5'}`}>
          <div className="flex items-center justify-between gap-1 shrink-0">
            <h3 className="font-bold text-[11px] uppercase tracking-wide truncate" style={{ color: 'var(--text-main)' }}>
              {group.formalAddressee}
            </h3>
            {group.contactEmail && (
              <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 truncate shrink-0 max-w-[110px]" style={{ color: 'var(--text-muted)' }}>
                <Mail size={9} /> {group.contactEmail}
              </span>
            )}
          </div>

          {/* Member breakdown */}
          <div className="space-y-0.5 border-t pt-1 max-h-[84px] overflow-y-auto pr-1 custom-scrollbar" style={{ borderColor: 'var(--border-color)' }}>
            {group.guests?.map((guest, idx) => {
              let IconComponent = UserMinus;
              let iconColorClass = 'text-slate-400';

              if (isSentOrResponded) {
                if (guest.isConfirmed === true || String(guest.isConfirmed) === '1') {
                  IconComponent = UserCheck;
                  iconColorClass = 'text-emerald-500';
                } else if (guest.isConfirmed === false || String(guest.isConfirmed) === '0') {
                  IconComponent = UserX;
                  iconColorClass = 'text-rose-500';
                }
              }

              return (
                <div key={guest.id || idx} className="flex justify-between items-center text-[10px] leading-none py-0.5">
                  <span className="flex items-center gap-1 font-semibold truncate" style={{ color: 'var(--text-main)' }}>
                    <IconComponent size={10} className={`${iconColorClass} shrink-0`} />
                    <span className="truncate">{guest.name}</span>
                  </span>
                  <span className="text-[8px] uppercase shrink-0 ml-1.5" style={{ color: 'var(--text-muted)' }}>
                    {guest.role} {guest.category ? `- ${guest.category}` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between border-t pl-2 shrink-0 h-5" style={{ borderColor: 'var(--border-color)' }}>
        {/* RSVP Label Inferior Izquierda */}
        <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider ${rsvpColorClass}`}>
          RSVP: {rsvpText}
        </span>

        {/* Action Buttons (Estilo Partner / Corner Block) */}
        <div
          className="flex items-center gap-0.5 rounded-tl-md p-0.5 text-white h-full"
          style={{ backgroundColor: 'var(--primary-accent)' }}
        >
          <button
            type="button"
            onClick={onEdit}
            className="flex h-4 w-4 items-center justify-center rounded-full text-white transition-opacity hover:opacity-70"
            title="Editar sobre"
          >
            <Edit2 size={10} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-4 w-4 items-center justify-center rounded-full text-white transition-opacity hover:opacity-70"
            title="Eliminar sobre"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>
    </div>
  );
};
