import dynamic from 'next/dynamic';
import PageLoader from '@/components/PageLoader';

const Contact = dynamic(() => import('@/views/Contact'), { loading: () => <PageLoader /> });

export default function ContactPage() {
  return <Contact />;
}
