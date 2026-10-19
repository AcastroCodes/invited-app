import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  Plus,
  Search,
  Building2,
  Settings,
  Pencil,
  Trash2,
  X,
  Loader2,
  CheckSquare,
  Square,
  Users,
  CalendarDays,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import api from '../lib/api';
import type { Partner } from '../types';

interface MobileTemplate {
  id: number;
  name: string;
  description?: string | null;
  is_default: boolean;
  settings?: Record<string, any>;
  partners?: Partner[];
  created_at?: string;
  updated_at?: string;
}

export default function AppMovilList() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<MobileTemplate[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPartner, setFilterPartner] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MobileTemplate | null>(null);
  const [modalName, setModalName] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<number[]>([]);
  const [partnerSearch, setPartnerSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/mobile-templates');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setTemplates(data);
    } catch (err) {
      console.error('Error cargando templates:', err);
    }
  };

  const fetchPartners = async () => {
    try {
      const res = await api.get('/partners');
      const partnerData = Array.isArray(res.data) ? res.data : res.data.data || [];
      setPartners(partnerData);
    } catch (err) {
      console.error('Error cargando partners:', err);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchTemplates(), fetchPartners()]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const openCreateModal = () => {
    setEditingTemplate(null);
    setModalName('');
    setModalDescription('');
    setSelectedPartnerIds(filterPartner ? [parseInt(filterPartner)] : []);
    setPartnerSearch('');
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (template: MobileTemplate) => {
    setEditingTemplate(template);
    setModalName(template.name);
    setModalDescription(template.description || '');
    const currentIds = template.partners ? template.partners.map((p) => p.id) : [];
    setSelectedPartnerIds(currentIds);
    setPartnerSearch('');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalName.trim()) return;

    setIsSaving(true);
    setModalError('');
    try {
      if (editingTemplate) {
        await api.put(`/mobile-templates/${editingTemplate.id}`, {
          name: modalName.trim(),
          description: modalDescription.trim() || null,
          partner_ids: selectedPartnerIds,
        });
      } else {
        await api.post('/mobile-templates', {
          name: modalName.trim(),
          description: modalDescription.trim() || null,
          partner_ids: selectedPartnerIds,
        });
        if (filterPartner && !selectedPartnerIds.includes(parseInt(filterPartner))) {
          setFilterPartner('');
        }
      }
      await fetchTemplates();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error guardando template:', err);
      const msg = err.response?.data?.message || err.message || 'Error al guardar el template';
      setModalError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      await api.delete(`/mobile-templates/${id}`);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error eliminando template:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const togglePartnerSelection = (partnerId: number) => {
    setSelectedPartnerIds((prev) =>
      prev.includes(partnerId)
        ? prev.filter((id) => id !== partnerId)
        : [...prev, partnerId]
    );
  };

  const filteredPartnersForModal = useMemo(() => {
    if (!partnerSearch.trim()) return partners;
    const q = partnerSearch.toLowerCase();
    return partners.filter((p) => p.business_name?.toLowerCase().includes(q));
  }, [partners, partnerSearch]);

  const filtered = useMemo(() => {
    let result = templates;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.partners && t.partners.some((p) => p.business_name.toLowerCase().includes(q)))
      );
    }

    if (filterPartner) {
      const pid = parseInt(filterPartner);
      result = result.filter((t) => t.partners && t.partners.some((p) => p.id === pid));
    }

    return result;
  }, [templates, search, filterPartner]);

  // Statistics
  const totalTemplates = templates.length;
  const assignedTemplates = templates.filter((t) => t.partners && t.partners.length > 0).length;
  const unassignedTemplates = templates.filter((t) => !t.partners || t.partners.length === 0).length;

  return (
    <div className="space-y-5">
      {/* HEADER IDENTICO AL ESTILO ESTANDARIZADO DE EVENTLIST */}
      <div
        className="flex flex-col gap-4 rounded-none -mx-4 -mt-2 px-3 py-1.5 sm:flex-row sm:items-center sm:justify-between md:-mx-6 md:-mt-4 lg:-mx-8 lg:-mt-6 shrink-0"
        style={{
          borderLeft: '3px solid var(--primary-accent)',
          backgroundColor: 'var(--primary-accent-light)',
        }}
      >
        <div>
          <h1 className="text-2xl font-bold leading-tight" style={{ color: 'var(--text-main)' }}>
            App Móvil
          </h1>
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Gestión de Templates
          </p>
        </div>

        {/* CONTROLES DE FILTRO / BÚSQUEDA IGUAL A EVENTLIST */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Buscar templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <select
            value={filterPartner}
            onChange={(e) => setFilterPartner(e.target.value)}
            className="rounded-lg px-3 py-2.5 text-sm outline-none transition-colors w-full sm:w-auto"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
            }}
          >
            <option value="">Todos los partners</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.business_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ESTADÍSTICAS SUPERIORES IGUALES A EVENTLIST */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--primary-accent-light)', color: 'var(--primary-accent)' }}>
              <Smartphone size={20} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Templates</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>{totalTemplates}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(82,183,136,0.15)', color: 'var(--success)' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Templates Asignados</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>{assignedTemplates}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(230,57,70,0.15)', color: 'var(--danger)' }}>
              <Layers size={20} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sin Asignar</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>{unassignedTemplates}</p>
            </div>
          </div>
        </div>
      </div>

      {/* LISTADO / CUADRÍCULA DE ITEMS CON ESTILO IDÉNTICO A EVENTLIST */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary-accent)' }} />
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Cargando templates de la app móvil...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Smartphone size={64} className="mb-4 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>
            {templates.length === 0 ? 'No tienes templates aún' : 'No hay resultados'}
          </h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {templates.length === 0 ? 'Crea tu primer template para empezar' : 'Intenta ajustar la búsqueda'}
          </p>
          {templates.length === 0 && (
            <button
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: 'var(--primary-accent)' }}
            >
              <Plus size={18} />
              Agregar Template
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* PRIMER ITEM: TARJETA CON BORDE DASHED PARA AGREGAR TEMPLATE (IDÉNTICO A EVENTLIST) */}
          <button
            onClick={openCreateModal}
            className="flex min-h-[120px] flex-col items-center justify-center gap-3 p-4 transition-opacity hover:opacity-80 cursor-pointer"
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
              Agregar Template
            </span>
          </button>

          {/* TARJETAS DE TEMPLATES CON LA ESTRUCTURA EXACTA DE EVENTLIST */}
          {filtered.map((template) => {
            const assignedCount = template.partners?.length || 0;
            return (
              <div
                key={template.id}
                onClick={() => navigate(`/app-movil/${template.id}/config`)}
                className="flex flex-col overflow-hidden cursor-pointer transition-all hover:shadow-md"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderTop: '2px solid var(--primary-accent)',
                  borderBottom: '2px solid var(--primary-accent)',
                  borderLeft: '1px solid var(--border-color)',
                  borderRight: '1px solid var(--border-color)',
                }}
              >
                {/* FILA SUPERIOR: TIPO Y STATUS (CON rounded-bl-lg) */}
                <div className="flex items-start justify-between pl-4">
                  <span className="mt-2 text-xs font-semibold uppercase" style={{ color: 'var(--primary-accent)' }}>
                    {template.is_default ? 'PLANTILLA BASE' : 'TEMPLATE'}
                  </span>
                  <span
                    className="rounded-bl-lg px-3 py-1 text-xs font-semibold text-white"
                    style={{
                      backgroundColor:
                        template.is_default ? 'var(--primary-accent)' :
                        assignedCount > 0 ? 'var(--success)' : 'var(--text-muted)'
                    }}
                  >
                    {template.is_default ? 'PREDETERMINADO' : (assignedCount > 0 ? 'ASIGNADO' : 'SIN ASIGNAR')}
                  </span>
                </div>

                {/* CUERPO CENTRAL: LOGO / AVATAR + DETALLES EN LÍNEAS */}
                <div className="flex items-center gap-4 px-4 py-2">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                    style={{ border: '1px solid var(--border-color)' }}
                  >
                    {template.settings?.app_logo ? (
                      <img
                        src={template.settings.app_logo}
                        alt="logo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                        {template.name
                          ? template.name.split(' ').map((w: string) => w[0]).join('').slice(0, 3).toUpperCase()
                          : <Smartphone size={20} />}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Línea 1: Nombre del Template */}
                    <h3 className="truncate font-semibold text-base" style={{ color: 'var(--text-main)' }}>
                      {template.name}
                    </h3>

                    {/* Línea 2: Fecha de creación */}
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      <CalendarDays size={13} className="shrink-0" style={{ color: 'var(--primary-accent)' }} />
                      <span className="truncate">
                        {template.created_at
                          ? new Date(template.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
                          : 'Plantilla de App Móvil'}
                      </span>
                    </div>

                    {/* Línea 3: Cantidad de Partners */}
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      <Users size={13} className="shrink-0" style={{ color: 'var(--primary-accent)' }} />
                      <span className="truncate">
                        {assignedCount} {assignedCount === 1 ? 'partner vinculado' : 'partners vinculados'}
                      </span>
                    </div>

                    {/* Línea 4: Partner (solo si el selector de partner está en 'Todos los partners' -> filterPartner === '') */}
                    {filterPartner === '' && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--primary-accent)' }}>
                        <Building2 size={13} className="shrink-0" />
                        <span className="truncate">
                          {assignedCount > 0
                            ? template.partners?.map((p) => p.business_name).join(', ')
                            : 'Sin partner asignado'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* FILA INFERIOR: BOTONES DE ACCIÓN A LA DERECHA */}
                <div className="mt-auto flex items-end justify-end" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    {/* Botón Configuración (con pestaña rounded-t-lg) */}
                    <div
                      className="flex items-center rounded-t-lg px-1.5 py-0.5 text-white"
                      style={{ backgroundColor: 'var(--primary-accent)' }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app-movil/${template.id}/config`);
                        }}
                        className="flex h-5 w-5 items-center justify-center rounded-full text-white transition-opacity hover:opacity-70 cursor-pointer"
                        title="Configuración"
                      >
                        <Settings size={11} />
                      </button>
                    </div>

                    {/* Botón Editar y Eliminar (con pestaña rounded-tl-lg) */}
                    <div
                      className="flex items-center rounded-tl-lg px-1.5 py-0.5 text-white"
                      style={{ backgroundColor: 'var(--primary-accent)' }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(template);
                        }}
                        className="flex h-5 w-5 items-center justify-center rounded-full text-white transition-opacity hover:opacity-70 cursor-pointer"
                        title="Editar"
                      >
                        <Pencil size={11} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(template.id);
                        }}
                        className="flex h-5 w-5 items-center justify-center rounded-full text-white transition-opacity hover:opacity-70 cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL CREAR / EDITAR TEMPLATE CON ESTILO EXACTO DE EVENTLIST */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div
            className="w-full max-w-lg flex flex-col rounded-md shadow-lg my-auto overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderTop: '2px solid var(--primary-accent)',
              borderBottom: '2px solid var(--primary-accent)',
            }}
          >
            <div className="pt-3" />
            <div
              className="mb-3 flex items-center justify-between rounded-t-md px-3 py-1.5 shrink-0 mx-5"
              style={{
                borderLeft: '3px solid var(--primary-accent)',
                backgroundColor: 'var(--primary-accent-light)',
              }}
            >
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>
                {editingTemplate ? 'Editar Template' : 'Nuevo Template'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="hover:opacity-70 transition-opacity cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="px-5 space-y-4 pb-5 overflow-y-auto max-h-[75vh]">
              {modalError && (
                <div className="rounded-md p-2.5 text-xs text-white" style={{ backgroundColor: 'var(--danger)' }}>
                  {modalError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-main)' }}>
                  Nombre del Template <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Boda Real Dorado, Gala Nocturna, etc."
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  className="w-full rounded-md px-3 py-2 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Breve detalle sobre el estilo o propósito de este template"
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  className="w-full rounded-md px-3 py-2 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>

              <div className="pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-main)' }}>
                    Asignar a Partners ({selectedPartnerIds.length} seleccionados)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPartnerIds(partners.map((p) => p.id))}
                      className="text-xs font-medium hover:underline cursor-pointer"
                      style={{ color: 'var(--primary-accent)' }}
                    >
                      Todos
                    </button>
                    <span className="text-xs text-gray-400">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedPartnerIds([])}
                      className="text-xs font-medium hover:underline cursor-pointer"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Ninguno
                    </button>
                  </div>
                </div>

                <div className="relative mb-2">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Filtrar partners..."
                    value={partnerSearch}
                    onChange={(e) => setPartnerSearch(e.target.value)}
                    className="w-full rounded-md pl-8 pr-3 py-1.5 text-xs outline-none"
                    style={{
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>

                <div
                  className="rounded-md border max-h-48 overflow-y-auto p-1 divide-y"
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    borderColor: 'var(--border-color)',
                    divideColor: 'var(--border-color)',
                  }}
                >
                  {filteredPartnersForModal.length === 0 ? (
                    <p className="p-3 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                      No se encontraron partners.
                    </p>
                  ) : (
                    filteredPartnersForModal.map((partner) => {
                      const isSelected = selectedPartnerIds.includes(partner.id);
                      return (
                        <div
                          key={partner.id}
                          onClick={() => togglePartnerSelection(partner.id)}
                          className="flex items-center justify-between p-2 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {isSelected ? (
                              <CheckSquare size={16} style={{ color: 'var(--primary-accent)' }} className="shrink-0" />
                            ) : (
                              <Square size={16} className="text-gray-400 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-main)' }}>
                                {partner.business_name}
                              </p>
                              {partner.contact_name && (
                                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                  Contacto: {partner.contact_name}
                                </p>
                              )}
                            </div>
                          </div>

                          {isSelected && (
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-semibold"
                              style={{
                                backgroundColor: 'var(--primary-accent-light)',
                                color: 'var(--primary-accent)',
                              }}
                            >
                              Asignado
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                  style={{ border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !modalName.trim()}
                  className="rounded-md px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: 'var(--primary-accent)' }}
                >
                  {isSaving ? 'Guardando...' : (editingTemplate ? 'Guardar Cambios' : 'Crear Template')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN IDÉNTICO A EVENTLIST */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-sm rounded-xl p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full shrink-0"
                style={{ backgroundColor: 'rgba(230,57,70,0.15)', color: 'var(--danger)' }}
              >
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--text-main)' }}>
                  Eliminar Template
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  ¿Estás seguro? Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                style={{ border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: 'var(--danger)' }}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
