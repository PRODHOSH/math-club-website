'use client';
import { use } from 'react';
import dynamic from 'next/dynamic';
const CoordinatorEvent = dynamic(() => import('@/views/coordinator/CoordinatorEvent'), { ssr: false });

export default function CoordinatorEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  return <CoordinatorEvent eventId={eventId} />;
}
