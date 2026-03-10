import CoreScanner from '@/views/core/CoreScanner';

export default async function CoreScannerPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return <CoreScanner eventId={eventId} />;
}
