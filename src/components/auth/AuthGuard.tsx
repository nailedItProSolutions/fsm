'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { ShieldAlert, Lock, ArrowRight, Building2 } from 'lucide-react';
import Link from 'next/link';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'dispatcher' | 'technician' | 'client'>;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const { user, loading, role, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/login?redirect=${returnUrl}`);
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#78716c] font-mono">Verifying operational security credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#111111] p-8 rounded-2xl border border-[#222222] max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-[#c5a059] flex items-center justify-center mx-auto border border-amber-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold font-heading text-[#fdfbf7]">Authentication Required</h2>
          <p className="text-xs text-[#b8b0a5] leading-relaxed">
            This internal operations portal is locked. Please authenticate using your corporate email/password or unique Employee ID + PIN.
          </p>
          <div className="pt-2">
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="inline-flex items-center space-x-2 bg-[#c5a059] text-black font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-[#d4b068] transition shadow"
            >
              <span>Sign In to Continue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check role-based restrictions
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#111111] p-8 rounded-2xl border border-[#222222] max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold font-heading text-[#fdfbf7]">Access Restricted</h2>
          <p className="text-xs text-[#b8b0a5] leading-relaxed">
            Your current security profile (<strong>{role}</strong>) does not have clearance to view this module.
          </p>
          <div className="pt-2 flex justify-center space-x-3">
            {role === 'technician' ? (
              <Link
                href="/dashboard/technician"
                className="inline-flex items-center space-x-2 bg-[#c5a059] text-black font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#d4b068] transition shadow"
              >
                <span>Return to Technician Route</span>
              </Link>
            ) : role === 'client' ? (
              <Link
                href="/dashboard/investor"
                className="inline-flex items-center space-x-2 bg-[#c5a059] text-black font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#d4b068] transition shadow"
              >
                <Building2 className="w-4 h-4" />
                <span>Return to Investor Portal</span>
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-2 bg-[#c5a059] text-black font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#d4b068] transition shadow"
              >
                <span>Return to Dashboard</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
