'use client';
import dynamic from 'next/dynamic';
const CoordinatorDashboard = dynamic(() => import('@/views/coordinator/CoordinatorDashboard'), { ssr: false });
export default function CoordinatorPage() { return <CoordinatorDashboard />; }
