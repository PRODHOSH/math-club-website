'use client';
import dynamic from 'next/dynamic';

const AdminCouncil = dynamic(() => import('@/views/admin/AdminCouncil'), { ssr: false });

export default function AdminCouncilPage() {
  return <AdminCouncil />;
}
