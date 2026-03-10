import dynamic from 'next/dynamic';
import PageLoader from '@/components/PageLoader';

const About = dynamic(() => import('@/views/About'), { loading: () => <PageLoader /> });

export default function AboutPage() {
  return <About />;
}
