import dynamic from 'next/dynamic';
import PageLoader from '@/components/PageLoader';

const Events = dynamic(() => import('@/views/Events'), { loading: () => <PageLoader /> });

export default function UpcomingEventsPage() {
  return <Events status="upcoming" />;
}
