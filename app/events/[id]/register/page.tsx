import dynamic from 'next/dynamic';
import PageLoader from '@/components/PageLoader';

const EventRegister = dynamic(() => import('@/views/EventRegister'), { loading: () => <PageLoader /> });

export default function EventRegisterPage() {
  return <EventRegister />;
}
