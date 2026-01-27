'use client';

import ShiftCheckInScreen from '@/components/ShiftCheckInScreen';
import { useParams } from 'next/navigation';

export default function ShiftCheckInPage() {
  const params = useParams();
  const shiftId = params.id as string;

  // Mock data - in production would come from API/DB
  const mockShift = {
    id: shiftId,
    title: 'Монтаж стенда',
    date: new Date(Date.now() + 20 * 60000).toLocaleString('ru-RU'), // 20 min from now
  };

  return (
    <ShiftCheckInScreen
      shiftId={mockShift.id}
      shiftTitle={mockShift.title}
      shiftDate={mockShift.date}
    />
  );
}
