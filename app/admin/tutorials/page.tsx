'use client';
import dynamic from 'next/dynamic';

const AdminTutorials = dynamic(() => import('@/views/admin/AdminTutorials'), { ssr: false });

export default function AdminTutorialsPage() {
  return <AdminTutorials />;
}
