import { useState, useEffect } from 'react';
import {
  Plus,
  Mail,
  Pencil,
  Trash2,
  Palette,
  X,
  Check,
  Copy,
  Sparkles,
  FileText,
  Globe,
  Video,
} from 'lucide-react';
import api from '../../lib/api';
import type { Invitation } from '../../types';

interface InvitationManagerProps {
  eventId: number;
}

const INVITATION_TYPES = [
  { id: 'interactive', name: '3D', icon: Sparkles, active: true },
  { id: 'flyer', name: 'Flyer', icon: FileText, active: false },
  { id: 'web', name: 'Web', icon: Globe, active: false },
  { id: 'video', name: 'Video', icon: Video, active: false },
];

export default function InvitationManager({ eventId }: InvitationManagerProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingInvitation, setEditingInvitation] = useState<Invitation | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formTemplate, setFormTemplate] = useState('interactive');
  const [formIsActive, setFormIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Copy URL state
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/events/${eventId}/invitations`);
      setInvitations(res.data.data || []);
    } catch {
      // Ignore error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchInvitations();
    }
  }, [eventId]);

  const handleOpenCreate = () => {
    setEditingInvitation(null);
    setFormTitle('');
    setFormTemplate('interactive');
    setFormIsActive(true);
    setShowModal(true);
  };

  const handleOpenEdit = (inv: Invitation) => {
    setEditingInvitation(inv);
    setFormTitle(inv.title);
    setFormTemplate(inv.template || 'interactive');
    setFormIsActive(inv.is_active ?? true);
    setShowModal(true);
  };

  const handleSaveInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setSaving(true);
    const payload = {
      title: formTitle,
      template: formTemplate,
      is_active: formIsActive,
    };

    try {
      if (editingInvitation) {
        await api.put(`/invitations/${editingInvitation.id}`, payload);
      } else {
        await api.post(`/events/${eventId}/invitations`, payload);
      }
      setShowModal(false);
      fetchInvitations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar la invitación');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInvitation = async (inv: Invitation) => {
    if (!confirm(`¿Estás seguro de eliminar la invitación "${inv.title}"?`)) return;

    try {
      await api.delete(`/invitations/${inv.id}`);
      fetchInvitations();
    } catch {
      alert('Error al eliminar la invitación');
    }
  };

  const copyInvitationLink = (inv: Invitation) => {
    const url = `${window.location.origin}/i/${inv.slug || inv.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">


      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-12">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"
            style={{ color: 'var(--primary-accent)' }}
          />
        </div>
      )}

      {/* Empty state */}
      {!loading && invitations.length === 0 && (
        <div
          className="text-center py-12 px-4 rounded-xl border border-dashed"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
        >
          <Mail size={40} className="mx-auto mb-3 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-base font-bold" style={{ color: 'var(--text-main)' }}>
            No hay invitaciones creadas aún
          </h3>
          <p className="text-xs max-w-md mx-auto mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>
            Empieza creando la primera invitación digital para tu evento.
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm hover:opacity-90"
            style={{ backgroundColor: 'var(--primary-accent)' }}
          >
            <Plus size={16} /> Crear Invitación
          </button>
        </div>
      )}

      {/* Invitations Grid (Estilo idéntico a Partner / Event List con 3 cols en mediano y 4 en pantallas grandes) */}
      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {/* Tarjeta Botón de Agregar Invitación (Igual a PartnerList / EventList) */}
          <button
            onClick={handleOpenCreate}
            className="flex min-h-[140px] flex-col items-center justify-center gap-3 p-4 transition-opacity hover:opacity-80 rounded-xl"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderTop: '2px solid var(--primary-accent)',
              borderBottom: '2px solid var(--primary-accent)',
              borderLeft: '1px dashed var(--border-color)',
              borderRight: '1px dashed var(--border-color)',
            }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-sm"
              style={{ backgroundColor: 'var(--primary-accent)' }}
            >
              <Plus size={22} />
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--primary-accent)' }}>
              Agregar Invitación
            </span>
          </button>

          {invitations.map((inv) => {
            const typeConfig = INVITATION_TYPES.find((t) => t.id === (inv.template || 'interactive')) || INVITATION_TYPES[0];
            const TypeIcon = typeConfig.icon;

            return (
              <div
                key={inv.id}
                className="flex items-stretch overflow-hidden rounded-xl transition-all hover:shadow-md relative"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderTop: '2px solid var(--primary-accent)',
                  borderBottom: '2px solid var(--primary-accent)',
                  borderLeft: '1px solid var(--border-color)',
                  borderRight: '1px solid var(--border-color)',
                }}
              >
                {/* Lado Izquierdo: Preview 9:16 con pequeño margen elegante */}
                <div className="p-1.5 shrink-0 flex items-center">
                  <div
                    className="aspect-[9/16] w-22 rounded-lg overflow-hidden flex flex-col items-center justify-center relative border shadow-xs"
                    style={{
                      backgroundColor: 'var(--bg-app)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    {inv.content?.preview ? (
                      <img
                        src={inv.content.preview}
                        alt={inv.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-2 text-center">
                        <TypeIcon size={26} style={{ color: 'var(--primary-accent)' }} />
                        <span className="text-[10px] font-black uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>
                          {typeConfig.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lado Derecho: Header, Contenido y Botones de Acción */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  {/* Top: Status badge en la esquina superior derecha */}
                  <div className="flex items-start justify-end">
                    <span
                      className="rounded-bl-lg px-3 py-1 text-xs font-semibold text-white uppercase"
                      style={{
                        backgroundColor: inv.is_active ? 'var(--success)' : 'var(--text-muted)',
                      }}
                    >
                      {inv.is_active ? 'ACTIVA' : 'INACTIVA'}
                    </span>
                  </div>

                  {/* Middle Info */}
                  <div className="px-4 py-2">
                    <h3 className="truncate font-extrabold text-base" style={{ color: 'var(--text-main)' }}>
                      {inv.title}
                    </h3>
                    <p className="text-xs font-extrabold uppercase tracking-wider mt-1" style={{ color: 'var(--primary-accent)' }}>
                      INVITACIÓN {typeConfig.name}
                    </p>
                  </div>

                  {/* Bottom Actions */}
                  <div className="mt-auto flex items-end justify-end">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => alert(`Abrir Diseñador para "${inv.title}"`)}
                        className="flex h-8 w-8 items-center justify-center rounded-t-lg rounded-b-none text-white shadow-sm transition-opacity hover:opacity-80"
                        style={{ backgroundColor: 'var(--primary-accent)' }}
                        title="Diseñador"
                      >
                        <Palette size={16} />
                      </button>

                      <div
                        className="flex items-center gap-0.5 rounded-tl-lg p-0.5 text-white"
                        style={{ backgroundColor: 'var(--primary-accent)' }}
                      >
                        <button
                          onClick={() => handleOpenEdit(inv)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-opacity hover:opacity-70"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteInvitation(inv)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-opacity hover:opacity-70"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create / Edit Invitation */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div
            className="w-full max-w-lg rounded-md shadow-2xl my-auto overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderTop: '2px solid var(--primary-accent)',
              borderBottom: '2px solid var(--primary-accent)',
            }}
          >
            <div className="pt-3" />
            {/* Modal Header con Status Checkbox */}
            <div
              className="mb-3 flex items-center justify-between rounded-t-md px-3 py-1.5 shrink-0 mx-5"
              style={{
                borderLeft: '3px solid var(--primary-accent)',
                backgroundColor: 'var(--primary-accent-light)',
              }}
            >
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>
                {editingInvitation ? 'Editar Invitación' : 'Nueva Invitación'}
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
                  Activa
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

            {/* Modal Body */}
            <form onSubmit={handleSaveInvitation} className="p-5 pt-2 space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
                  Nombre de la Invitación *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Invitación Principal, VIP, Familia..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
                  Tipo de Invitación *
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {INVITATION_TYPES.map((type) => {
                    const TypeIcon = type.icon;
                    const isSelected = formTemplate === type.id;

                    return (
                      <button
                        key={type.id}
                        type="button"
                        disabled={!type.active}
                        onClick={() => type.active && setFormTemplate(type.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                          !type.active
                            ? 'bg-black/5 opacity-40 cursor-not-allowed border-transparent'
                            : isSelected
                            ? 'bg-white shadow-md border-2'
                            : 'bg-black/5 hover:bg-black/10 border-transparent'
                        }`}
                        style={
                          isSelected && type.active
                            ? { borderColor: 'var(--primary-accent)', color: 'var(--primary-accent)' }
                            : { color: 'var(--text-main)' }
                        }
                        title={!type.active ? 'Próximamente disponible' : type.name}
                      >
                        <TypeIcon size={24} className="mb-1" style={{ color: isSelected && type.active ? 'var(--primary-accent)' : 'var(--text-muted)' }} />
                        <span className="text-xs font-extrabold">{type.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-black/5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm font-bold text-white rounded-lg transition-opacity hover:opacity-90 shadow-sm"
                  style={{ backgroundColor: 'var(--primary-accent)' }}
                >
                  {saving ? 'Guardando...' : editingInvitation ? 'Guardar Cambios' : 'Crear Invitación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
