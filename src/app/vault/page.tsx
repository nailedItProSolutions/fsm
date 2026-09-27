'use client';
 
import React, { useState, Suspense } from 'react';
import { useAuth } from '@/lib/authContext';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AdminVaultView } from '@/components/vault/AdminVaultView';
import { TechVaultView } from '@/components/vault/TechVaultView';
import Link from 'next/link';
import { ShieldAlert, Building2 } from 'lucide-react';

function VaultContent() {
  const { isAdmin, isTechnician, isClient, role } = useAuth();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const roleParam = searchParams.get('role');
  // Dispatchers share the admin (full vault) view
  const isAdminOrDispatcher = isAdmin || role === 'dispatcher';
  const showAdmin = roleParam === 'admin' || (!roleParam && isAdminOrDispatcher);
  const showTech = roleParam === 'technician' || (!roleParam && isTechnician);
  const showClient = roleParam === 'client' || (!roleParam && isClient && !isAdminOrDispatcher && !isTechnician);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fdfbf7] flex flex-col antialiased">
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto bg-[#0a0a0a]">
          {/* Role-Based Rendering */}
          {showAdmin && <AdminVaultView />}

          {!showAdmin && showTech && <TechVaultView />}

          {!showAdmin && !showTech && showClient && (
            <div className="p-12 text-center bg-[#111111] rounded-2xl border border-[#222222] text-[#fdfbf7] max-w-md mx-auto my-12 space-y-4">
              <ShieldAlert className="w-12 h-12 text-[#FF8A00] mx-auto opacity-80" />
              <h2 className="text-xl font-bold font-heading">Technician Vault Restricted</h2>
              <p className="text-xs text-[#b8b0a5] leading-relaxed">
                The Technician Vault and Historical Timesheet OCR archive is restricted to internal operational personnel and field service technicians.
              </p>
              <div className="pt-2">
                <Link
                  href="/dashboard/investor"
                  className="inline-flex items-center space-x-2 bg-[#c5a059] text-black font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#d4b068] transition shadow"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Return to Landlord &amp; Investor Portal</span>
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function VaultPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#78716c]">Loading Technician Vault...</div>}>
      <AuthGuard allowedRoles={['admin', 'dispatcher', 'technician']}>
        <VaultContent />
      </AuthGuard>
    </Suspense>
  );
}
