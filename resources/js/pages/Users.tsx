import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  Shield,
  Users as UsersIcon,
  UserCog,
  UserCheck,
  UserX,
  Camera,
  Trash as TrashIcon,
  ChevronDown,
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types';

type Role = 'superadmin' | 'event_planner' | 'protocol' | 'host';

const ROLE_LABELS: Record<Role, string> = {
  superadmin: 'SuperAdmin',
  event_planner: 'EventPlanner',
  protocol: 'Protocol',
  host: 'Hosts',
};

const ROLE_LIST: Role[] = ['superadmin', 'event_planner', 'protocol', 'host'];

export default function UserList() {
  const { user: currentUser } = useAuth();
  const isSuperadmin = currentUser?.role === 'superadmin';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<Role>('event_planner');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formAvatarFile, setFormAvatarFile] = useState<File | null>(null);
  const [formAvatarPreview, setFormAvatarPreview] = useState<string>('');
  const [existingAvatar, setExistingAvatar] = useState<string>('');
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUsers = () => {
    setLoading(true);
    api
      .get('/users')
      .then((res) => setUsers(res.data.data || res.data))
      .catch(() => setError('Error al cargar usuarios'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditId(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('event_planner');
    setFormIsActive(true);
    setFormAvatarFile(null);
    setFormAvatarPreview('');
    setExistingAvatar('');
    setRemoveAvatar(false);
    setShowModal(true);
  };

  const openEditModal = (u: User) => {
    setEditId(u.id);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormPassword('');
    setFormRole(u.role);
    setFormIsActive(u.is_active ?? true);
    setFormAvatarFile(null);
    setFormAvatarPreview('');
    setExistingAvatar(u.avatar_url || '');
    setRemoveAvatar(false);
    setShowModal(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormAvatarFile(file);
    setRemoveAvatar(false);
    const reader = new FileReader();
    reader.onload = () => setFormAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setFormAvatarFile(null);
    setFormAvatarPreview('');
    setRemoveAvatar(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formEmail.trim()) return;
    if (!editId && !formPassword) return;
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', formName.trim());
      payload.append('email', formEmail.trim());
      payload.append('role', formRole);
      payload.append('is_active', formIsActive ? '1' : '0');
      if (formPassword) {
        payload.append('password', formPassword);
        payload.append('password_confirmation', formPassword);
      }
      if (formAvatarFile) {
        payload.append('avatar', formAvatarFile);
      }
      if (removeAvatar) {
        payload.append('remove_avatar', '1');
      }

      if (editId) {
        payload.append('_method', 'PUT');
        const res = await api.post(`/users/${editId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setUsers((prev) => prev.map((u) => (u.id === editId ? (res.data.data || res.data) : u)));
      } else {
        const res = await api.post('/users', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setUsers((prev) => [res.data.data || res.data, ...prev]);
      }
      setShowModal(false);
    } catch {
      setError(editId ? 'Error al actualizar usuario' : 'Error al crear usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteId}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteId));
      setDeleteId(null);
    } catch {
      setError('Error al eliminar usuario');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      ROLE_LABELS[u.role]?.toLowerCase().includes(q)
    );
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const inactiveUsers = users.filter((u) => !u.is_active).length;

  if (!isSuperadmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield size={48} className="mx-auto mb-4 opacity-60" style={{ color: 'var(--danger)' }} />
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-main)' }}>Acceso Restringido</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Solo los administradores pueden gestionar usuarios
          </p>
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
          Gestión de Usuarios
        </h1>
        <div className="relative w-full sm:w-72">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Buscar usuarios..."
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
              <UsersIcon size={20} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Usuarios</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>{totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(82,183,136,0.15)', color: 'var(--success)' }}>
              <UserCheck size={20} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Usuarios Activos</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>{activeUsers}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(230,57,70,0.15)', color: 'var(--danger)' }}>
              <UserX size={20} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Usuarios Inactivos</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>{inactiveUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg" style={{ backgroundColor: 'var(--bg-card)' }} />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="font-medium" style={{ color: 'var(--danger)' }}>{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-3 text-sm hover:underline"
              style={{ color: 'var(--primary-accent)' }}
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <UsersIcon size={64} className="mb-4 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>
            {users.length === 0 ? 'No hay usuarios registrados' : 'No hay resultados'}
          </h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {users.length === 0 ? 'Agrega tu primer usuario para empezar' : 'Intenta ajustar la búsqueda'}
          </p>
          {users.length === 0 && (
            <button
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--primary-accent)' }}
            >
              <Plus size={18} />
              Agregar Usuario
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
              Agregar Usuario
            </span>
          </button>
          {filtered.map((u) => (
            <div
              key={u.id}
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
                  {u.is_active ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>

              <div className="flex items-center gap-4 px-4 py-2">
                <UserAvatar user={u} size={56} />
                <div className="min-w-0">
                  <h3 className="truncate font-semibold" style={{ color: 'var(--text-main)' }}>
                    {u.name}
                    {currentUser?.id === u.id && (
                      <span className="ml-1 text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(tú)</span>
                    )}
                  </h3>
                  <p className="truncate text-sm" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                  <span
                    className="mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={getRoleBadgeStyle(u.role)}
                  >
                    {ROLE_LABELS[u.role]}
                  </span>
                </div>
              </div>

              <div
                className="mt-auto flex items-end justify-end"
              >
                <div
                  className="flex items-center gap-0.5 rounded-tl-lg p-0.5 text-white"
                  style={{ backgroundColor: 'var(--primary-accent)' }}
                >
                  <button
                    onClick={() => openEditModal(u)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-opacity hover:opacity-70"
                    title="Editar"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteId(u.id)}
                    disabled={currentUser?.id === u.id}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
                    title={currentUser?.id === u.id ? 'No puedes eliminar tu propia cuenta' : 'Eliminar'}
                  >
                    <Trash2 size={15} />
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
            className="w-full max-w-md rounded-md shadow-lg my-8"
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
                {editId ? 'Editar Usuario' : 'Agregar Usuario'}
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

            <div className="space-y-3 p-5">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div
                    className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full text-2xl font-bold text-white"
                    style={{
                      backgroundColor:
                        formAvatarPreview || existingAvatar ? 'transparent' : 'var(--primary-accent)',
                      border: '2px solid var(--border-color)',
                    }}
                  >
                    {formAvatarPreview ? (
                      <img
                        src={formAvatarPreview}
                        alt="avatar"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : existingAvatar && !removeAvatar ? (
                      <img
                        src={existingAvatar}
                        alt="avatar"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(formName)
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80"
                    style={{ backgroundColor: 'var(--primary-accent)' }}
                    title="Subir imagen"
                  >
                    <Camera size={15} />
                  </button>
                  {(formAvatarPreview || (existingAvatar && !removeAvatar)) && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -left-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-opacity hover:opacity-80"
                      title="Quitar imagen"
                    >
                      <TrashIcon size={14} />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                  Nombre
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nombre completo"
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
                  Email
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
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
                  Contraseña {editId && '(dejar vacío para mantener)'}
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={editId ? 'Nueva contraseña' : 'Contraseña'}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                  Rol
                </label>
                <div className="relative" ref={roleRef}>
                  <button
                    type="button"
                    onClick={() => setRoleOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: `1px solid ${roleOpen ? 'var(--primary-accent)' : 'var(--border-color)'}`,
                      color: 'var(--text-main)',
                    }}
                  >
                    <span>{ROLE_LABELS[formRole]}</span>
                    <ChevronDown
                      size={16}
                      className="transition-transform"
                      style={{ color: 'var(--primary-accent)', transform: roleOpen ? 'rotate(180deg)' : 'none' }}
                    />
                  </button>
                  {roleOpen && (
                    <div
                      className="absolute left-0 right-0 z-10 mt-1 overflow-hidden rounded-lg"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-card)',
                      }}
                    >
                      {ROLE_LIST.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            setFormRole(r);
                            setRoleOpen(false);
                          }}
                          className="flex w-full items-center justify-between px-3 py-2.5 text-sm transition-colors"
                          style={
                            r === formRole
                              ? { backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)', fontWeight: 600 }
                              : { backgroundColor: 'transparent', color: 'var(--text-main)' }
                          }
                          onMouseEnter={(e) => {
                            if (r !== formRole) e.currentTarget.style.backgroundColor = 'var(--bg-sidebar)';
                          }}
                          onMouseLeave={(e) => {
                            if (r !== formRole) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {ROLE_LABELS[r]}
                          {r === formRole && <span style={{ color: 'var(--primary-accent)' }}>✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-5 py-3" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-70 disabled:opacity-50"
                style={{ border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formName.trim() || !formEmail.trim() || (!editId && !formPassword)}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary-accent)' }}
              >
                {saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear Usuario'}
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
              Eliminar Usuario
            </h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-70 disabled:opacity-50"
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
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function getRoleBadgeStyle(role: Role) {
  const styles: Record<Role, { backgroundColor: string; color: string }> = {
    superadmin: { backgroundColor: '#F2CC8F', color: '#212121' },
    event_planner: { backgroundColor: '#E07A5F', color: '#FFFFFF' },
    protocol: { backgroundColor: '#52B788', color: '#FFFFFF' },
    host: { backgroundColor: '#FDE9E2', color: '#E07A5F' },
  };
  return styles[role];
}

function UserAvatar({
  user,
  size = 36,
  backgroundColor,
}: {
  user: User;
  size?: number;
  backgroundColor?: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (user.avatar_url && !imgError) {
    return (
      <img
        src={user.avatar_url}
        alt={user.name}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size, border: '1px solid var(--border-color)' }}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: backgroundColor || (user.role === 'superadmin' ? 'var(--secondary-accent)' : 'var(--primary-accent)'),      }}
    >
      {getInitials(user.name)}
    </div>
  );
}