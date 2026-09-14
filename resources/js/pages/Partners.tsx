import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit,
  X,
  Search,
  Building2,
  Shield,
  Users as UsersIcon,
  Trash2,
  Camera,
  Trash as TrashIcon,
  ChevronDown,
  Phone,
  Smartphone,
  MessageCircle,
  Globe,
  AtSign,
  Video,
  Music2,
  X as XIcon,
  Link2,
  Check,
  UserRound,
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import type { Partner, SocialLink, SocialLinkType, User } from '../types';

const SOCIAL_OPTIONS: SocialLinkType[] = [
  'phone',
  'movil',
  'whatsapp',
  'web',
  'facebook',
  'instagram',
  'tiktok',
  'youtube',
  'x',
];

const SOCIAL_LABELS: Record<SocialLinkType, string> = {
  phone: 'Teléfono',
  movil: 'Móvil',
  whatsapp: 'WhatsApp',
  web: 'Web',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X (Twitter)',
};

const SOCIAL_ICONS: Record<SocialLinkType, React.ReactNode> = {
  phone: <Phone size={14} />,
  movil: <Smartphone size={14} />,
  whatsapp: <MessageCircle size={14} />,
  web: <Globe size={14} />,
  facebook: <AtSign size={14} />,
  instagram: <Camera size={14} />,
  tiktok: <Music2 size={14} />,
  youtube: <Video size={14} />,
  x: <XIcon size={14} />,
};

export default function PartnerList() {
  const { user } = useAuth();
  const isSuperadmin = user?.role === 'superadmin';

  const [partners, setPartners] = useState<Partner[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [formBusinessName, setFormBusinessName] = useState('');
  const [formRut, setFormRut] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const [formLogoFile, setFormLogoFile] = useState<File | null>(null);
  const [formLogoPreview, setFormLogoPreview] = useState<string>('');
  const [existingLogo, setExistingLogo] = useState<string>('');
  const [removeLogo, setRemoveLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [openType, setOpenType] = useState<number | null>(null);
  const [usersOpen, setUsersOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const usersRef = useRef<HTMLDivElement>(null);

  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  const fetchPartners = () => {
    setLoading(true);
    api
      .get('/partners')
      .then((res) => setPartners(res.data.data || res.data))
      .catch(() => setError('Error al cargar partners'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPartners();
    api
      .get('/users')
      .then((res) => setUsers(res.data.data || res.data))
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (usersRef.current && !usersRef.current.contains(e.target as Node)) {
        setUsersOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openCreateModal = () => {
    setEditId(null);
    setFormBusinessName('');
    setFormRut('');
    setFormAddress('');
    setFormIsActive(true);
    setFormLogoFile(null);
    setFormLogoPreview('');
    setExistingLogo('');
    setRemoveLogo(false);
    setSelectedUserIds([]);
    setSocialLinks([]);
    setShowModal(true);
  };

  const openEditModal = (p: Partner) => {
    setEditId(p.id);
    setFormBusinessName(p.business_name);
    setFormRut(p.business_rut || '');
    setFormAddress(p.business_address || '');
    setFormIsActive(p.is_active);
    setFormLogoFile(null);
    setFormLogoPreview('');
    setExistingLogo(p.logo_url || '');
    setRemoveLogo(false);
    setSelectedUserIds((p.users || []).map((u) => u.id));
    
    let links: SocialLink[] = [];
    if (typeof p.social_links === 'string') {
      try {
        links = JSON.parse(p.social_links);
      } catch (e) {
        links = [];
      }
    } else if (Array.isArray(p.social_links)) {
      links = p.social_links;
    }
    setSocialLinks(links);
    
    setShowModal(true);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormLogoFile(file);
    setRemoveLogo(false);
    const reader = new FileReader();
    reader.onload = () => setFormLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormLogoFile(null);
    setFormLogoPreview('');
    setRemoveLogo(true);
  };

  const toggleUser = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSave = async () => {
    if (!formBusinessName.trim() || selectedUserIds.length === 0) return;
    setSaving(true);
    try {
      const payload = new FormData();

      payload.append('business_name', formBusinessName.trim());
      if (formRut) payload.append('business_rut', formRut.trim());
      if (formAddress) payload.append('business_address', formAddress.trim());
      payload.append('is_active', formIsActive ? '1' : '0');

      selectedUserIds.forEach((id) => payload.append('user_ids[]', String(id)));

      const sanitizedLinks = socialLinks
        .filter((l) => l.type && l.value && l.value.trim())
        .map((l) => ({ type: l.type, value: l.value.trim() }));

      payload.append('social_links', JSON.stringify(sanitizedLinks));

      if (formLogoFile) {
        payload.append('logo', formLogoFile);
      }
      if (removeLogo) {
        payload.append('remove_logo', '1');
      }

      if (editId) {
        payload.append('_method', 'PUT');
        const res = await api.post(`/partners/${editId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setPartners((prev) =>
          prev.map((p) => (p.id === editId ? (res.data.data || res.data) : p))
        );
      } else {
        const res = await api.post('/partners', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setPartners((prev) => [...prev, res.data.data || res.data]);
      }
      setShowModal(false);
    } catch {
      setError(editId ? 'Error al actualizar partner' : 'Error al crear partner');
    } finally {
      setSaving(false);
    }
  };

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/partners/${deleteId}`);
      setPartners((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } catch {
      setError('Error al eliminar partner');
    } finally {
      setDeleting(false);
    }
  };

  const addSocialLink = () => {
    setSocialLinks((prev) => [...prev, { type: 'phone', value: '' }]);
  };

  const updateSocialLink = (index: number, patch: Partial<SocialLink>) => {
    setSocialLinks((prev) =>
      prev.map((l, i) => (i === index ? { ...l, ...patch } : l))
    );
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const filtered = partners.filter((p) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      p.business_name?.toLowerCase().includes(q) ||
      p.business_rut?.toLowerCase().includes(q) ||
      (p.users || []).some(
        (u) =>
          u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      )
    );
  });

  const totalPartners = partners.length;
  const activePartners = partners.filter((p) => p.is_active).length;
  const inactivePartners = partners.filter((p) => !p.is_active).length;

  const availableUsers = users;
  const userFiltered = availableUsers.filter((u) => {
    const q = userSearch.toLowerCase();
    if (!q) return true;
    return (
      u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  });

  if (!isSuperadmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield size={48} className="mx-auto mb-4 opacity-60" style={{ color: 'var(--danger)' }} />
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-main)' }}>Acceso Restringido</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Solo los administradores pueden gestionar partners
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg" style={{ backgroundColor: 'var(--bg-card)' }} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="font-medium" style={{ color: 'var(--danger)' }}>{error}</p>
          <button
            onClick={fetchPartners}
            className="mt-3 text-sm hover:underline"
            style={{ color: 'var(--primary-accent)' }}
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div
        className="flex flex-col gap-4 rounded-none -mx-4 -mt-2 px-3 py-1.5 sm:flex-row sm:items-center sm:justify-between md:-mx-6 md:-mt-4 lg:-mx-8 lg:-mt-6"
        style={{
          borderLeft: '3px solid var(--primary-accent)',
          backgroundColor: 'var(--primary-accent-light)',
        }}
      >
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
          Gestión de Partners
        </h1>
        <div className="relative w-full sm:w-72">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Buscar partners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none transition-colors"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}>
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Partners</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>{totalPartners}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(82,183,136,0.15)', color: 'var(--success)' }}>
              <UsersIcon size={20} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Partners Activos</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>{activePartners}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(230,57,70,0.15)', color: 'var(--danger)' }}>
              <Trash2 size={20} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Partners Inactivos</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>{inactivePartners}</p>
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 size={64} className="mb-4 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>
            {partners.length === 0 ? 'No hay partners registrados' : 'No hay resultados'}
          </h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {partners.length === 0 ? 'Agrega tu primer partner para empezar' : 'Intenta ajustar la búsqueda'}
          </p>
          {partners.length === 0 && (
            <button
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--primary-accent)' }}
            >
              <Plus size={18} />
              Agregar Partner
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={openCreateModal}
            className="flex min-h-[120px] flex-col items-center justify-center gap-3 p-4 transition-opacity hover:opacity-80"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderTop: '2px solid var(--primary-accent)',
              borderBottom: '2px solid var(--primary-accent)',
              borderLeft: '1px dashed var(--border-color)',
              borderRight: '1px dashed var(--border-color)',
            }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: 'var(--primary-accent)' }}
            >
              <Plus size={22} />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--primary-accent)' }}>
              Agregar Partner
            </span>
          </button>
          {filtered.map((p) => (
            <div
              key={p.id}
              className="flex flex-col overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderTop: '2px solid var(--primary-accent)',
                borderBottom: '2px solid var(--primary-accent)',
                borderLeft: '1px solid var(--border-color)',
                borderRight: '1px solid var(--border-color)',
              }}
            >
              <div className="flex items-start justify-end">
                <span
                  className="rounded-bl-lg px-3 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: 'var(--primary-accent)' }}
                >
                  {p.is_active ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>

              <div className="flex items-center gap-4 px-4 py-2">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg text-lg font-bold text-white"
                  style={{ border: '1px solid var(--border-color)' }}
                >
                  {p.logo_url ? (
                    <img
                      src={p.logo_url}
                      alt={p.business_name}
                      className="h-full w-full rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: 'var(--primary-accent)' }}
                    >
                      {getInitials(p.business_name)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-base" style={{ color: 'var(--text-main)' }}>
                    {p.business_name}
                  </h3>
                  {p.user && (
                    <p className="truncate text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {p.user.name}
                    </p>
                  )}
                  {p.user?.role && (
                    <p className="truncate text-[11px] font-normal opacity-75 mt-0.5" style={{ color: 'var(--primary-accent)' }}>
                      {p.user.role === 'superadmin' ? 'Super Admin' : p.user.role === 'event_planner' ? 'Event Planner' : p.user.role === 'protocol' ? 'Protocolo' : p.user.role === 'host' ? 'Anfitrión' : p.user.role}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-auto flex items-end justify-end">
                <div
                  className="flex items-center rounded-tl-lg px-1.5 py-0.5 text-white"
                  style={{ backgroundColor: 'var(--primary-accent)' }}
                >
                  <button
                    onClick={() => openEditModal(p)}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-white transition-opacity hover:opacity-70"
                    title="Editar"
                  >
                    <Edit size={11} />
                  </button>
                  <button
                    onClick={() => setDeleteId(p.id)}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-white transition-opacity hover:opacity-70"
                    title="Eliminar"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div
            className="w-full max-w-3xl rounded-md shadow-lg my-8"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderTop: '2px solid var(--primary-accent)',
              borderBottom: '2px solid var(--primary-accent)',
            }}
          >
            <div className="pt-3" />
            <div
              className="mb-3 flex items-center justify-between rounded-t-md rounded-none px-3 py-1.5"
              style={{
                borderLeft: '3px solid var(--primary-accent)',
                backgroundColor: 'var(--primary-accent-light)',
              }}
            >
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>
                {editId ? 'Editar Partner' : 'Agregar Partner'}
              </h3>
              <div className="flex items-center gap-3">
                <label
                  className="flex cursor-pointer items-center gap-2 text-sm font-medium select-none"
                  style={{ color: 'var(--text-main)' }}
                >
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="h-4 w-4 rounded"
                    style={{ accentColor: 'var(--primary-accent)' }}
                  />
                  Activo
                </label>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-1.5 transition-colors hover:opacity-70"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-5">
              {/* Columna izquierda 2/5 */}
              <div className="space-y-3 md:col-span-2">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div
                      className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-lg text-3xl font-bold text-white"
                      style={{
                        backgroundColor:
                          formLogoPreview || existingLogo ? 'transparent' : 'var(--primary-accent)',
                        border: '2px solid var(--border-color)',
                      }}
                    >
                      {formLogoPreview ? (
                        <img
                          src={formLogoPreview}
                          alt="logo"
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : existingLogo && !removeLogo ? (
                        <img
                          src={existingLogo}
                          alt="logo"
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : (
                        getInitials(formBusinessName)
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="absolute -right-1 -bottom-1 flex h-9 w-9 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80"
                      style={{ backgroundColor: 'var(--primary-accent)' }}
                      title="Subir logo"
                    >
                      <Camera size={17} />
                    </button>
                    {(formLogoPreview || (existingLogo && !removeLogo)) && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -left-1 -bottom-1 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition-opacity hover:opacity-80"
                        title="Quitar logo"
                      >
                        <TrashIcon size={16} />
                      </button>
                    )}
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </div>
                  <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    Logo del partner
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formBusinessName}
                    onChange={(e) => setFormBusinessName(e.target.value)}
                    placeholder="Nombre del partner"
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="Dirección comercial"
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                    RIF
                  </label>
                  <input
                    type="text"
                    value={formRut}
                    onChange={(e) => setFormRut(e.target.value)}
                    placeholder="Opcional"
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>

                <div>
                  <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                    <UsersIcon size={16} style={{ color: 'var(--primary-accent)' }} />
                    Usuarios del partner
                  </h4>
                  <div className="relative" ref={usersRef}>
                    <button
                      type="button"
                      onClick={() => setUsersOpen((prev) => !prev)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors"
                      style={{
                        backgroundColor: 'var(--bg-app)',
                        border: `1px solid ${usersOpen ? 'var(--primary-accent)' : 'var(--border-color)'}`,
                        color: 'var(--text-main)',
                      }}
                    >
                      <span className="truncate">
                        {selectedUserIds.length === 0
                          ? 'Seleccionar usuarios...'
                          : `${selectedUserIds.length} usuario${selectedUserIds.length > 1 ? 's' : ''} seleccionado${selectedUserIds.length > 1 ? 's' : ''}`}
                      </span>
                      <ChevronDown
                        size={16}
                        className="shrink-0 transition-transform"
                        style={{ color: 'var(--primary-accent)', transform: usersOpen ? 'rotate(180deg)' : 'none' }}
                      />
                    </button>
                    {usersOpen && (
                      <div
                        className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-lg"
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          boxShadow: 'var(--shadow-card)',
                        }}
                      >
                        <div className="border-b p-2" style={{ borderColor: 'var(--border-color)' }}>
                          <input
                            type="text"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            placeholder="Buscar usuario..."
                            className="w-full rounded-lg px-3 py-1.5 text-sm outline-none"
                            style={{
                              backgroundColor: 'var(--bg-app)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-main)',
                            }}
                          />
                        </div>
                        <div className="max-h-56 overflow-y-auto">
                          {userFiltered.length === 0 && (
                            <p className="px-3 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                              No hay usuarios disponibles
                            </p>
                          )}
                          {userFiltered.map((u) => {
                            const selected = selectedUserIds.includes(u.id);
                            return (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => toggleUser(u.id)}
                                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors"
                                style={
                                  selected
                                    ? { backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }
                                    : { backgroundColor: 'transparent', color: 'var(--text-main)' }
                                }
                                onMouseEnter={(e) => {
                                  if (!selected) e.currentTarget.style.backgroundColor = 'var(--bg-sidebar)';
                                }}
                                onMouseLeave={(e) => {
                                  if (!selected) e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                <span className="flex min-w-0 items-center gap-2">
                                  <UserRound size={15} className="shrink-0" />
                                  <span className="truncate">{u.name}</span>
                                  <span className="truncate text-xs opacity-60">{u.email}</span>
                                </span>
                                {selected && <Check size={15} className="shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Columna derecha 3/5 */}
              <div className="space-y-3 md:col-span-3">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h4 className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                      <Link2 size={16} style={{ color: 'var(--primary-accent)' }} />
                      Contacto y Redes
                    </h4>
                    <button
                      type="button"
                      onClick={addSocialLink}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: 'var(--primary-accent)' }}
                    >
                      <Plus size={16} />
                      Agregar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {socialLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="relative w-40 shrink-0">
                          <button
                            type="button"
                            onClick={() => setOpenType(openType === index ? null : index)}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors"
                            style={{
                              backgroundColor: 'var(--bg-app)',
                              border: `1px solid ${openType === index ? 'var(--primary-accent)' : 'var(--border-color)'}`,
                              color: 'var(--text-main)',
                            }}
                          >
                            <span className="flex items-center gap-1.5">
                              {SOCIAL_ICONS[link.type]}
                              {SOCIAL_LABELS[link.type]}
                            </span>
                            <ChevronDown
                              size={15}
                              className="transition-transform"
                              style={{ color: 'var(--primary-accent)', transform: openType === index ? 'rotate(180deg)' : 'none' }}
                            />
                          </button>
                          {openType === index && (
                            <div
                              className="absolute left-0 right-0 z-10 mt-1 overflow-hidden rounded-lg"
                              style={{
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                boxShadow: 'var(--shadow-card)',
                              }}
                            >
                              {SOCIAL_OPTIONS.map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => {
                                    updateSocialLink(index, { type: t });
                                    setOpenType(null);
                                  }}
                                  className="flex w-full items-center justify-between px-3 py-2 text-sm transition-colors"
                                  style={
                                    t === link.type
                                      ? { backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)', fontWeight: 600 }
                                      : { backgroundColor: 'transparent', color: 'var(--text-main)' }
                                  }
                                  onMouseEnter={(e) => {
                                    if (t !== link.type) e.currentTarget.style.backgroundColor = 'var(--bg-sidebar)';
                                  }}
                                  onMouseLeave={(e) => {
                                    if (t !== link.type) e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <span className="flex items-center gap-1.5">
                                    {SOCIAL_ICONS[t]}
                                    {SOCIAL_LABELS[t]}
                                  </span>
                                  {t === link.type && <span style={{ color: 'var(--primary-accent)' }}>✓</span>}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          value={link.value}
                          onChange={(e) => updateSocialLink(index, { value: e.target.value })}
                          placeholder={link.type === 'phone' ? '+56 9 1234 5678' : 'https://...'}
                          className="min-w-0 flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                          style={{
                            backgroundColor: 'var(--bg-app)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-main)',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeSocialLink(index)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white transition-opacity hover:opacity-80"
                          style={{ backgroundColor: 'var(--danger)' }}
                          title="Quitar"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-5 py-3" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="rounded-md px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-70 disabled:opacity-50"
                style={{ border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formBusinessName.trim() || selectedUserIds.length === 0}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary-accent)' }}
              >
                {saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear Partner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-sm rounded-xl p-6 shadow-lg"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>
              Eliminar Partner
            </h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              ¿Estás seguro de que deseas eliminar este partner? Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="rounded-md px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-70 disabled:opacity-50"
                style={{ border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--danger)' }}
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getInitials(name?: string): string {
  if (!name) return 'P';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}