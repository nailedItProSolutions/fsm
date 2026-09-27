'use client';

import React, { Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useFSMStore } from '@/lib/useStore';
import { ClientDetail } from '@/components/clients/ClientDetail';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

function ClientDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getClientById } = useFSMStore();

  const clientId = params.id as string;
  const client = getClientById(clientId);
  const tabParam = searchParams.get('tab') as any;

  if (!client) {
    return (
      <div className="p-12 text-center bg-[#111111] rounded-2xl border border-[#222222] text-[#fdfbf7] max-w-md mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-[#FF8A00] mx-auto mb-3" />
        <h2 className="text-lg font-bold font-heading">Client Not Found</h2>
        <p className="text-xs text-[#b8b0a5] mt-1 mb-6">
          The requested client record may have been removed or does not exist.
        </p>
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center space-x-2 bg-[#c5a059] text-black font-bold text-xs px-4 py-2.5 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Client Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <ClientDetail
      client={client}
      initialTab={tabParam}
      onBack={() => router.push('/dashboard/clients')}
    />
  );
}

export default function ClientDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#78716c]">Loading Client Profile...</div>}>
      <ClientDetailContent />
    </Suspense>
  );
}
