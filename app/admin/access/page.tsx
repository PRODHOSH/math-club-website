'use client';
import dynamic from 'next/dynamic';
const AdminAccess = dynamic(() => import('@/views/admin/AdminAccess'), { ssr: false });
export default function Page() { return <AdminAccess />; }
