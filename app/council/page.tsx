import dynamic from 'next/dynamic';
import PageLoader from '@/components/PageLoader';

const Council = dynamic(() => import('@/views/Council'), { loading: () => <PageLoader /> });

export default function CouncilPage() {
  return <Council />;
}
