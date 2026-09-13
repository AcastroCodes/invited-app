import { useParams } from 'react-router-dom';
import GuestManager from '../../components/events/GuestManager';

export default function GuestList() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <GuestManager eventId={Number(id) || 1} />
    </div>
  );
}

