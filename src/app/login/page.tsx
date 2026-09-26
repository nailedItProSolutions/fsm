'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { ShieldCheck, Wrench, Lock, Mail, ArrowRight, CheckCircle2, MapPin } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, loginAs } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const ok = await loginWithEmail(email, password);
      if (ok) {
        router.push('/dashboard');
      } else {
        setError('Invalid credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: 'admin' | 'technician') => {
    loginAs(role);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fdfbf7] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/*  */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#c5a059]/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-[#FF8A00]/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        {/*  */}
        <div className="flex justify-center mb-6">
          <img 
            src="/logo.png" 
            alt="Nailed It Property Solutions" 
            className="h-16 w-auto object-contain drop-shadow-xl" 
          />
        </div>
        
        <h2 className="text-2xl font-bold font-heading text-[#fdfbf7]">
          Field Service Operating System
        </h2>
        <p className="mt-1 text-xs text-[#b8b0a5] flex items-center justify-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#FF8A00]" />
          <span>Serving Rome, GA & Floyd County</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-[#111111] py-8 px-6 sm:px-10 rounded-2xl border border-[#222222] shadow-2xl relative">
          {/*  */}
          <div className="mb-6 p-3 bg-[#181818] border border-[#2a2a2a] rounded-xl">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#c5a059] mb-2 text-center">
              Quick One-Click Demo Access
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2.5 rounded-lg bg-[#222222] hover:bg-[#c5a059] hover:text-black border border-[#333333] text-left transition group"
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#fdfbf7] group-hover:text-black">
                  <ShieldCheck className="w-4 h-4 text-[#c5a059] group-hover:text-black" />
                  <span>Admin / Dispatch</span>
                </div>
                <div className="text-[10px] text-[#b8b0a5] group-hover:text-neutral-800">
                  Full control & CRM
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('technician')}
                className="p-2.5 rounded-lg bg-[#222222] hover:bg-[#FF8A00] hover:text-black border border-[#333333] text-left transition group"
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#fdfbf7] group-hover:text-black">
                  <Wrench className="w-4 h-4 text-[#FF8A00] group-hover:text-black" />
                  <span>Field Tech</span>
                </div>
                <div className="text-[10px] text-[#b8b0a5] group-hover:text-neutral-800">
                  Mobile daily route
                </div>
              </button>
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#222222]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#111111] px-3 text-[#78716c] uppercase font-bold tracking-wider text-[10px]">
                Or Sign In With Email
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#b8b0a5] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#78716c] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nailedit.com"
                  className="w-full text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg pl-9 pr-4 py-2.5 text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#b8b0a5] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#78716c] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg pl-9 pr-4 py-2.5 text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c5a059] hover:bg-[#b38728] text-black font-bold text-xs py-3 px-4 rounded-lg shadow-lg transition flex items-center justify-center space-x-2 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Operating System'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-[11px] text-[#78716c]">
            Role-Based Access Control Protected • Firebase Authenticated
          </div>
        </div>
      </div>
    </div>
  );
}
