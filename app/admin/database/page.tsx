'use client';
import dynamic from 'next/dynamic';
const AdminDatabase = dynamic(() => import('@/views/admin/AdminDatabase'), { ssr: false });
export default function AdminDatabasePage() { return <AdminDatabase />; }
