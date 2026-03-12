'use client';
import dynamic from 'next/dynamic';

const AdminEvents = dynamic(() => import('@/views/admin/AdminEvents'), { ssr: false });

export default function AdminEventsPage() {
  return <AdminEvents />;
}
