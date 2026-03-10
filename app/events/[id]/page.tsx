import dynamic from 'next/dynamic';
import PageLoader from '@/components/PageLoader';

const EventDetail = dynamic(() => import('@/views/EventDetail'), { loading: () => <PageLoader /> });

export default function EventDetailPage() {
  return <EventDetail />;
}
