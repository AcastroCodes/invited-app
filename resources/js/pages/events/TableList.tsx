import { useParams } from 'react-router-dom';
import { Table2 } from 'lucide-react';

export default function TableList() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>
          Planimetría y Mesas
        </h1>
        <button
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: '#E07A5F' }}
        >
          <Table2 size={16} />
          <span>Añadir Mesa</span>
        </button>
      </div>

      <div className="rounded-xl p-6 text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <p style={{ color: 'var(--text-muted)' }}>La gestión de mesas para el evento {id} se implementará aquí.</p>
      </div>
    </div>
  );
}
