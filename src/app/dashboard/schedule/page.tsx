'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DispatchBoard } from '@/components/schedule/DispatchBoard';

function ScheduleContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId') || undefined;
  const propertyId = searchParams.get('propertyId') || undefined;

  return <DispatchBoard initialClientId={clientId} initialPropertyId={propertyId} />;
}

export default function SchedulePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#78716c]">Loading Dispatch Calendar...</div>}>
      <ScheduleContent />
    </Suspense>
  );
}
