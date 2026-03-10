import CoreRegistrations from '@/views/core/CoreRegistrations';

export default async function CoreRegistrationsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return <CoreRegistrations eventId={eventId} />;
}
