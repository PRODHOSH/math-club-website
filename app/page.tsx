import dynamic from 'next/dynamic';
import PageLoader from '@/components/PageLoader';

const Home = dynamic(() => import('@/views/Home'), { loading: () => <PageLoader /> });

export default function HomePage() {
  return <Home />;
}
