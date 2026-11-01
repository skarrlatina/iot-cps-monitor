'use client';

import dynamic from 'next/dynamic';

const HoloCore = dynamic(() => import('@/components/HoloCore'), {
  ssr: false,
});

export default function HoloStage({ compact = false }: { compact?: boolean }) {
  return <HoloCore compact={compact} />;
}
