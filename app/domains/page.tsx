import dynamic from 'next/dynamic';
import PageLoader from '@/components/PageLoader';

const Domains = dynamic(() => import('@/views/Domains'), { loading: () => <PageLoader /> });

export default function DomainsPage() {
  return <Domains />;
}
