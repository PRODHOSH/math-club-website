import dynamic from 'next/dynamic';
import PageLoader from '@/components/PageLoader';

const Team = dynamic(() => import('@/views/Team'), { loading: () => <PageLoader /> });

export default function TeamPage() {
  return <Team />;
}
