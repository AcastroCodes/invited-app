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
  Download,
  AlertTriangle,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../lib/api';

export interface GuestItem {
  id?: string | number;
  name: string;
  title?: string;
  role: string;
  category?: string;
  isConfirmed: boolean | null;
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

export interface DuplicateConflict {
  id: string; // ID único temporal
  cardName: string;
  originalName: string;
  newName: string;
  title: string;
  role: string;
  category: string;
  email: string;
  phone: string;
  whatsapp: string;
  conflictReason: string;
  action: 'edit' | 'skip' | 'force';
}

interface GuestManagerProps {
  eventId: number;
}

export default function GuestManager({ eventId }: GuestManagerProps) {
  const [groups, setGroups] = useState<GuestGroupItem[]>([]);
  const [invitations, setInvitations] = useState<InvitationOption[]>([]);
  const [eventInfo, setEventInfo] = useState<{ name?: string; partnerName?: string }>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed'>('all');
  const [isExcelMenuOpen, setIsExcelMenuOpen] = useState(false);
  const excelMenuRef = React.useRef<HTMLDivElement>(null);

  // Modal State para Duplicados
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [conflictingRows, setConflictingRows] = useState<DuplicateConflict[]>([]);
  const [validGroupsToImport, setValidGroupsToImport] = useState<any[]>([]);

  const getCleanFileName = (suffix: string) => {
    const partner = (eventInfo.partnerName || 'partner').trim();
    const eventName = (eventInfo.name || `evento_${eventId}`).trim();
    const rawName = `${partner}_${eventName}_${suffix}`;
    return rawName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-zA-Z0-9_\-]/g, '_') // Reemplazar caracteres especiales y espacios por guion bajo
      .replace(/_+/g, '_') // Evitar guiones bajos dobles
      .toLowerCase();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (excelMenuRef.current && !excelMenuRef.current.contains(e.target as Node)) {
        setIsExcelMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportGuests = () => {
    setIsExcelMenuOpen(false);
    if (!groups || groups.length === 0) {
      alert('No hay invitados registrados para exportar.');
      return;
    }

    const exportData: any[][] = [
      [
        'Nombre de la Tarjeta',
        'Trato',
        'Nombre Completo',
        'Rol',
        'Categoria',
        'Estado Confirmacion',
        'Email Contacto',
        'Telefono Contacto',
        'WhatsApp Contacto',
      ],
    ];

    groups.forEach((grp) => {
      grp.guests.forEach((g, index) => {
        const isFirst = index === 0;
        const confirmStatus =
          g.isConfirmed === true
            ? 'Confirmado'
            : g.isConfirmed === false
            ? 'Rechazado'
            : 'Pendiente';

        exportData.push([
          isFirst ? grp.formalAddressee : '',
          g.title || '',
          g.name || '',
          g.role || 'Principal',
          g.category || 'Adulto',
          confirmStatus,
          isFirst ? grp.contactEmail || '' : '',
          isFirst ? grp.contactPhone || '' : '',
          isFirst ? grp.contactWhatsapp || '' : '',
        ]);
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 26 }, // Nombre de la Tarjeta
      { wch: 10 }, // Trato
      { wch: 26 }, // Nombre Completo
      { wch: 14 }, // Rol
      { wch: 14 }, // Categoria
      { wch: 18 }, // Estado Confirmación
      { wch: 28 }, // Email Contacto
      { wch: 20 }, // Telefono Contacto
      { wch: 20 }, // WhatsApp Contacto
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lista de Invitados');
    const fileName = `${getCleanFileName('invitados')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

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

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    setIsExcelMenuOpen(false);
    const data = [
      [
        'Nombre de la Tarjeta',
        'Trato',
        'Nombre Completo',
        'Rol',
        'Categoria',
        'Email Contacto',
        'Telefono Contacto',
        'WhatsApp Contacto',
      ],
      [
        'Familia Castro Pérez',
        'Sr.',
        'Aristides Castro',
        'Principal',
        'Adulto',
        'aristides@ejemplo.com',
        '+584120000000',
        '+584120000000',
      ],
      [
        '',
        'Sra.',
        'María Pérez',
        'Esposa',
        'Adulto',
        '',
        '',
        '',
      ],
      [
        '',
        'Srito.',
        'Aristides Jr. Castro',
        'Hijo',
        'Joven',
        '',
        '',
        '',
      ],
      [
        'Sr. Juan Mendoza',
        'Sr.',
        'Juan Mendoza',
        'Principal',
        'Adulto',
        'juan@ejemplo.com',
        '+584141112233',
        '+584141112233',
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Ajustar anchos de columnas
    ws['!cols'] = [
      { wch: 26 }, // Nombre de la Tarjeta
      { wch: 10 }, // Trato
      { wch: 26 }, // Nombre Completo
      { wch: 14 }, // Rol
      { wch: 14 }, // Categoria
      { wch: 28 }, // Email Contacto
      { wch: 20 }, // Telefono Contacto
      { wch: 20 }, // WhatsApp Contacto
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invitados');
    const fileName = `${getCleanFileName('plantilla_invitados')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (rows.length === 0) {
          alert('El archivo no contiene filas válidas.');
          return;
        }

        // Agrupar por Nombre de la Tarjeta (manteniendo la última tarjeta si la celda viene vacía)
        const groupsMap: { [cardName: string]: { formalAddressee: string; email: string; phone: string; whatsapp: string; guests: any[] } } = {};
        let currentCardName = '';

        rows.forEach((row) => {
          const rawCardName = row['Nombre de la Tarjeta'] || row['Nombre de la tarjeta'] || row['Nombre Tarjeta'] || row['Tarjeta'] || row['Familia'] || '';
          if (rawCardName.trim()) {
            currentCardName = rawCardName.trim();
          }

          const cardName = currentCardName || 'Invitado Especial';
          const name = row['Nombre Completo'] || row['Nombre'] || row['Invitado'] || '';
          if (!name) return;

          const email = row['Email Contacto'] || row['Email'] || row['Correo'] || '';
          const phone = row['Telefono Contacto'] || row['Telefono'] || row['Teléfono'] || '';
          const whatsapp = row['WhatsApp Contacto'] || row['WhatsApp'] || row['Whatsapp'] || '';

          if (!groupsMap[cardName]) {
            groupsMap[cardName] = {
              formalAddressee: cardName,
              email: email,
              phone: phone,
              whatsapp: whatsapp,
              guests: [],
            };
          } else {
            // Si la fila principal no tenía email/teléfono y esta fila sí, se actualizan los datos de contacto
            if (!groupsMap[cardName].email && email) groupsMap[cardName].email = email;
            if (!groupsMap[cardName].phone && phone) groupsMap[cardName].phone = phone;
            if (!groupsMap[cardName].whatsapp && whatsapp) groupsMap[cardName].whatsapp = whatsapp;
          }

          groupsMap[cardName].guests.push({
            name,
            title: row['Trato'] || row['Título'] || 'Sr.',
            role: row['Rol'] || 'Principal',
            category: row['Categoria'] || row['Categoría'] || 'Adulto',
            isConfirmed: null,
          });
        });

        const groupsArray = Object.values(groupsMap);
        if (groupsArray.length === 0) {
          alert('No se pudieron procesar integrantes válidos del archivo Excel.');
          return;
        }

        // Obtener la lista existente de nombres normalizados de la BD
        const existingGuestNames = new Set<string>();
        groups.forEach((grp) => {
          grp.guests.forEach((g) => {
            if (g.name) {
              const norm = g.name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
              existingGuestNames.add(norm);
            }
          });
        });

        // Analizar duplicados (tanto en BD como internamente en el Excel)
        const seenInExcelNames = new Map<string, string>(); // normName -> cardName
        const conflicts: DuplicateConflict[] = [];
        const cleanGroupsMap: { [cardName: string]: { formalAddressee: string; email: string; phone: string; whatsapp: string; guests: any[] } } = {};

        groupsArray.forEach((grp) => {
          grp.guests.forEach((g: any) => {
            const rawName = g.name.trim();
            const normName = rawName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            let conflictReason = '';

            if (existingGuestNames.has(normName)) {
              conflictReason = 'Ya existe registrado en el evento';
            } else if (seenInExcelNames.has(normName)) {
              conflictReason = `Duplicado dentro del Excel (en la tarjeta "${seenInExcelNames.get(normName)}")`;
            }

            if (conflictReason) {
              conflicts.push({
                id: Math.random().toString(36).substring(2, 9),
                cardName: grp.formalAddressee,
                originalName: rawName,
                newName: rawName,
                title: g.title || 'Sr.',
                role: g.role || 'Principal',
                category: g.category || 'Adulto',
                email: grp.email || '',
                phone: grp.phone || '',
                whatsapp: grp.whatsapp || '',
                conflictReason,
                action: 'edit',
              });
            } else {
              seenInExcelNames.set(normName, grp.formalAddressee);
              if (!cleanGroupsMap[grp.formalAddressee]) {
                cleanGroupsMap[grp.formalAddressee] = {
                  formalAddressee: grp.formalAddressee,
                  email: grp.email,
                  phone: grp.phone,
                  whatsapp: grp.whatsapp,
                  guests: [],
                };
              }
              cleanGroupsMap[grp.formalAddressee].guests.push(g);
            }
          });
        });

        const initialValidGroups = Object.values(cleanGroupsMap);

        if (conflicts.length > 0) {
          setValidGroupsToImport(initialValidGroups);
          setConflictingRows(conflicts);
          setDuplicateModalOpen(true);
        } else {
          // Si no hay duplicados, guardar directamente
          await saveImportedGroups(initialValidGroups);
        }
      } catch (err) {
        console.error('Error al procesar archivo Excel:', err);
        alert('Ocurrió un error al leer o importar el archivo Excel.');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsBinaryString(file);
  };

  const saveImportedGroups = async (groupsToSave: any[]) => {
    setSaving(true);
    let createdCount = 0;
    try {
      for (const grp of groupsToSave) {
        if (!grp.guests || grp.guests.length === 0) continue;
        const payload = {
          eventId,
          formalAddressee: grp.formalAddressee,
          contactEmail: grp.email || null,
          contactPhone: grp.phone || null,
          contactWhatsapp: grp.whatsapp || grp.phone || null,
          assignedInvitationId: invitations.length === 1 ? invitations[0].id : null,
          guests: grp.guests,
        };
        await api.post(`/events/${eventId}/guests`, payload);
        createdCount++;
      }
      alert(`¡Carga masiva completada! Se crearon o actualizaron ${createdCount} sobre(s) de invitación correctamente.`);
      fetchGuestData();
    } catch (err) {
      console.error('Error al guardar grupos:', err);
      alert('Error al guardar los grupos de invitados.');
    } finally {
      setSaving(false);
      setDuplicateModalOpen(false);
      setConflictingRows([]);
      setValidGroupsToImport([]);
    }
  };

  const handleConfirmDuplicateResolution = async () => {
    const finalGroupsMap: { [cardName: string]: { formalAddressee: string; email: string; phone: string; whatsapp: string; guests: any[] } } = {};

    // 1. Agregar grupos limpios iniciales
    validGroupsToImport.forEach((grp) => {
      finalGroupsMap[grp.formalAddressee] = { ...grp, guests: [...grp.guests] };
    });

    // 2. Procesar resoluciones de duplicados
    conflictingRows.forEach((item) => {
      if (item.action === 'skip') return; // Omitir

      const finalName = item.action === 'edit' ? item.newName.trim() : item.originalName.trim();
      if (!finalName) return;

      const cardName = item.cardName || 'Invitado Especial';

      if (!finalGroupsMap[cardName]) {
        finalGroupsMap[cardName] = {
          formalAddressee: cardName,
          email: item.email,
          phone: item.phone,
          whatsapp: item.whatsapp,
          guests: [],
        };
      }

      finalGroupsMap[cardName].guests.push({
        name: finalName,
        title: item.title,
        role: item.role,
        category: item.category,
        isConfirmed: null,
      });
    });

    const finalGroupsArray = Object.values(finalGroupsMap);
    await saveImportedGroups(finalGroupsArray);
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

          {/* Input oculto para carga de Excel */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleExcelFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          {/* Menú Contextual Desplegable de Excel */}
          <div className="relative" ref={excelMenuRef}>
            <button
              type="button"
              title="Opciones de Excel"
              onClick={() => setIsExcelMenuOpen(!isExcelMenuOpen)}
              className="h-[34px] w-[34px] rounded-xl border flex items-center justify-center shrink-0 shadow-sm transition-all hover:bg-emerald-500/10 hover:border-emerald-500 text-emerald-600 dark:text-emerald-400 active:scale-95"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
              }}
            >
              <FileSpreadsheet size={16} />
            </button>

            {isExcelMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl border shadow-xl z-50 py-1 flex flex-col text-xs font-semibold overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-main)',
                }}
              >
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3.5 py-2.5 text-left flex items-center gap-2.5 transition-colors hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  <Download size={14} className="text-sky-500 shrink-0" />
                  <span>Bajar Plantilla de Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExcelMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="px-3.5 py-2.5 text-left flex items-center gap-2.5 transition-colors hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 border-t border-b"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <FileSpreadsheet size={14} className="text-emerald-500 shrink-0" />
                  <span>Subir Plantilla</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportGuests}
                  className="px-3.5 py-2.5 text-left flex items-center gap-2.5 transition-colors hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  <Download size={14} className="text-indigo-500 shrink-0" />
                  <span>Descargar Lista de Invitados</span>
                </button>
              </div>
            )}
          </div>

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 min-h-[250px] items-start">
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

      {/* Modal de Resolución de Duplicados */}
      {duplicateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-4xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
            }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 border-b flex items-center justify-between shrink-0"
              style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold" style={{ color: 'var(--text-main)' }}>
                    Revisión de Invitados Duplicados
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Se detectaron <strong className="text-amber-500 font-black">{conflictingRows.length}</strong> registro(s) duplicado(s). Modifica o selecciona la acción deseada.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDuplicateModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Table */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr
                      className="border-b uppercase tracking-wider font-extrabold text-[10px]"
                      style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
                    >
                      <th className="p-3">Sobre / Tarjeta</th>
                      <th className="p-3">Nombre en Excel</th>
                      <th className="p-3">Motivo / Conflicto</th>
                      <th className="p-3">Acción y Corrección</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                    {conflictingRows.map((item, index) => (
                      <tr key={item.id} className="hover:bg-amber-500/5 transition-colors">
                        <td className="p-3 font-bold truncate max-w-[150px]" style={{ color: 'var(--text-main)' }}>
                          {item.cardName}
                        </td>
                        <td className="p-3 font-semibold" style={{ color: 'var(--text-main)' }}>
                          {item.originalName}
                        </td>
                        <td className="p-3 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                          {item.conflictReason}
                        </td>
                        <td className="p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <select
                              value={item.action}
                              onChange={(e) => {
                                const val = e.target.value as 'edit' | 'skip' | 'force';
                                const updated = [...conflictingRows];
                                updated[index].action = val;
                                setConflictingRows(updated);
                              }}
                              className="rounded-lg px-2 py-1 text-xs border outline-none font-bold"
                              style={{
                                backgroundColor: 'var(--bg-app)',
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-main)',
                              }}
                            >
                              <option value="edit">✏️ Corregir Nombre</option>
                              <option value="skip">🚫 Omitir Registros</option>
                              <option value="force">⚠️ Importar De Todos Modos</option>
                            </select>
                          </div>

                          {item.action === 'edit' && (
                            <input
                              type="text"
                              value={item.newName}
                              placeholder="Escribe el nombre corregido..."
                              onChange={(e) => {
                                const updated = [...conflictingRows];
                                updated[index].newName = e.target.value;
                                setConflictingRows(updated);
                              }}
                              className="w-full rounded-lg px-2.5 py-1 text-xs border outline-none font-medium focus:ring-1 focus:ring-amber-500"
                              style={{
                                backgroundColor: 'var(--bg-app)',
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-main)',
                              }}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Actions */}
            <div
              className="px-6 py-3.5 border-t shrink-0 flex items-center justify-between gap-3"
              style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
            >
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                Se añadirán <strong>{validGroupsToImport.length}</strong> sobres limpios + <strong>{conflictingRows.filter((i) => i.action !== 'skip').length}</strong> resuelto(s).
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDuplicateModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                  style={{ color: 'var(--text-muted)' }}
                  disabled={saving}
                >
                  Cancelar Carga
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDuplicateResolution}
                  disabled={saving}
                  className="px-5 py-2 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                  style={{ backgroundColor: 'var(--primary-accent)' }}
                >
                  {saving ? 'Guardando...' : 'Confirmar e Importar'}
                </button>
              </div>
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
      className="flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderTop: '2px solid var(--primary-accent)',
        borderBottom: '2px solid var(--primary-accent)',
        borderLeft: '1px solid var(--border-color)',
        borderRight: '1px solid var(--border-color)',
      }}
    >
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
        <div className={`flex-1 pt-2 pb-1 ${hasThumbnail ? 'px-2' : 'px-3'}`}>
          <div className="flex items-center justify-between gap-1 shrink-0">
            <h3 className="font-extrabold text-sm uppercase tracking-wide truncate" style={{ color: 'var(--text-main)' }}>
              {group.formalAddressee}
            </h3>
            {group.contactEmail && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 truncate shrink-0 max-w-[110px]" style={{ color: 'var(--text-muted)' }}>
                <Mail size={10} /> {group.contactEmail}
              </span>
            )}
          </div>

          {/* Member breakdown (Espaciado simétrico izquierda/derecha) */}
          <div className="my-2.5 space-y-0.5 py-1 pr-1 max-h-[96px] overflow-y-auto custom-scrollbar">
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
                <div key={guest.id || idx} className="flex justify-between items-center text-[10.5px] leading-snug py-0.5">
                  <span className="flex items-center gap-1 font-semibold truncate" style={{ color: 'var(--text-main)' }}>
                    <IconComponent size={10} className={`${iconColorClass} shrink-0`} />
                    <span className="truncate">{guest.name}</span>
                  </span>
                  <span className="text-[8.5px] uppercase shrink-0 ml-1.5" style={{ color: 'var(--text-muted)' }}>
                    {guest.role} {guest.category ? `- ${guest.category}` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card Footer - Estilo Partner */}
      <div className="mt-auto flex items-end justify-between border-t pl-2.5 h-6" style={{ borderColor: 'var(--border-color)' }}>
        {/* RSVP Badge Inferior Izquierda */}
        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${rsvpColorClass}`}>
          RSVP: {rsvpText}
        </span>

        {/* Action Buttons (Estilo Partner / Corner Block rounded-tl-lg) */}
        <div
          className="flex items-center gap-1 rounded-tl-lg px-1.5 py-0.5 text-white"
          style={{ backgroundColor: 'var(--primary-accent)' }}
        >
          <button
            type="button"
            onClick={onEdit}
            className="flex h-5 w-5 items-center justify-center rounded-full text-white transition-opacity hover:opacity-70"
            title="Editar sobre"
          >
            <Edit2 size={11} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-5 w-5 items-center justify-center rounded-full text-white transition-opacity hover:opacity-70"
            title="Eliminar sobre"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
};
