import dynamic from 'next/dynamic';
import PageLoader from '@/components/PageLoader';

const Join = dynamic(() => import('@/views/Join'), { loading: () => <PageLoader /> });

export default function JoinPage() {
  return <Join />;
}
