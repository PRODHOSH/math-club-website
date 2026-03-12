'use client';
import dynamic from 'next/dynamic';

const AdminTeam = dynamic(() => import('@/views/admin/AdminTeam'), { ssr: false });

export default function AdminTeamPage() {
  return <AdminTeam />;
}
