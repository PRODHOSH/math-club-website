'use client';
import dynamic from 'next/dynamic';
const CoordinatorSettings = dynamic(() => import('@/views/coordinator/CoordinatorSettings'), { ssr: false });
export default function CoordinatorSettingsPage() { return <CoordinatorSettings />; }
