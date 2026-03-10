'use client';
import dynamic from 'next/dynamic';

const Recruitment = dynamic(() => import('@/views/RecruitmentNew'), { ssr: false });

export default function RecruitmentPage() {
  return <Recruitment />;
}
