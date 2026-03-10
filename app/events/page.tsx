import dynamic from 'next/dynamic';
import PageLoader from '@/components/PageLoader';

const EventsAll = dynamic(() => import('@/views/EventsAll'), { loading: () => <PageLoader /> });

export default function EventsPage() {
  return <EventsAll />;
}
