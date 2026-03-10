import dynamic from 'next/dynamic';
import PageLoader from '@/components/PageLoader';

const Tutorials = dynamic(() => import('@/views/Tutorials'), { loading: () => <PageLoader /> });

export default function TutorialsPage() {
  return <Tutorials />;
}
