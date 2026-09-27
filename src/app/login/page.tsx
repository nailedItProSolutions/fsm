'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { 
  ShieldCheck, 
  Wrench, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  KeyRound, 
  UserCheck, 
  AlertCircle 
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const { loginWithEmail, loginWithEmployeePin, loginAs } = useAuth();
  
  // Auth Mode: 'email' | 'pin'
  const [authMode, setAuthMode] = useState<'email' | 'pin'>('email');

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // PIN form state
  const [employeeId, setEmployeeId] = useState('');
  const [pin, setPin] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const ok = await loginWithEmail(email, password);
      if (ok) {
        router.push(redirectUrl);
      } else {
        setError('Invalid email or password. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const ok = await loginWithEmployeePin(employeeId, pin);
      if (ok) {
        router.push(redirectUrl);
      } else {
        setError('Invalid Employee ID or PIN code.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = (empId: string, empPin: string, empEmail: string) => {
    if (authMode === 'pin') {
      setEmployeeId(empId);
      setPin(empPin);
    } else {
      setEmail(empEmail);
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fdfbf7] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#c5a059]/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-[#FF8A00]/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#c5a059] flex items-center justify-center text-black font-extrabold text-2xl shadow-xl shadow-[#c5a059]/20">
            N
          </div>
        </div>
        
        <h1 className="text-2xl font-bold font-heading text-[#fdfbf7]">
          NAILED IT PROPERTY SOLUTIONS
        </h1>
        <p className="mt-1 text-xs text-[#b8b0a5] flex items-center justify-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#FF8A00]" />
          <span>Rome, GA • Floyd County Field Operations</span>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-[#111111] py-8 px-6 sm:px-10 rounded-2xl border border-[#222222] shadow-2xl relative space-y-6">
          {/* Auth Method Tabs */}
          <div className="flex bg-[#181818] p-1 rounded-xl border border-[#262626]">
            <button
              type="button"
              onClick={() => { setAuthMode('email'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                authMode === 'email'
                  ? 'bg-[#c5a059] text-black shadow'
                  : 'text-[#b8b0a5] hover:text-[#fdfbf7]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email & Password</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('pin'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                authMode === 'pin'
                  ? 'bg-[#c5a059] text-black shadow'
                  : 'text-[#b8b0a5] hover:text-[#fdfbf7]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Employee ID + PIN</span>
            </button>
          </div>

          {/* Quick Credential Pre-fill Assistance for Testing */}
          <div className="bg-[#161616] p-3 rounded-xl border border-[#262626] space-y-2">
            <span className="text-[10px] uppercase font-bold text-[#78716c] block text-center">
              Active Authorized Personnel Credentials:
            </span>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleFillCredentials('ADMIN-01', '1001', 'admin@nailedit.com')}
                className="p-2 rounded-lg bg-[#1f1f1f] hover:bg-[#282828] border border-[#333333] transition"
              >
                <div className="text-[11px] font-bold text-[#c5a059] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#c5a059]" />
                  <span>Admin: Sarah J.</span>
                </div>
                <div className="text-[10px] text-[#78716c] font-mono mt-0.5">
                  ID: ADMIN-01 • PIN: 1001
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFillCredentials('TECH-101', '4592', 'mike@nailedit.com')}
                className="p-2 rounded-lg bg-[#1f1f1f] hover:bg-[#282828] border border-[#333333] transition"
              >
                <div className="text-[11px] font-bold text-[#FF8A00] flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-[#FF8A00]" />
                  <span>Lead Tech: Mike R.</span>
                </div>
                <div className="text-[10px] text-[#78716c] font-mono mt-0.5">
                  ID: TECH-101 • PIN: 4592
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: EMAIL & PASSWORD */}
          {authMode === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#b8b0a5] mb-1">
                  Corporate Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#78716c] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@nailedit.com"
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg pl-9 pr-4 py-2.5 text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#b8b0a5] mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#78716c] absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg pl-9 pr-4 py-2.5 text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#c5a059] hover:bg-[#b38728] text-black font-bold text-xs py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In with Email'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: EMPLOYEE ID + PIN */}
          {authMode === 'pin' && (
            <form onSubmit={handlePinSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#b8b0a5] mb-1">
                  Unique Employee ID *
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-[#78716c] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. TECH-101 or ADMIN-01"
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg pl-9 pr-4 py-2.5 text-[#fdfbf7] font-mono uppercase placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#b8b0a5] mb-1">
                  Security PIN Code (4 Digits) *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#78716c] absolute left-3 top-3" />
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg pl-9 pr-4 py-2.5 text-[#fdfbf7] font-mono tracking-widest placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#c5a059] to-[#d4af37] hover:brightness-110 text-black font-bold text-xs py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Verifying PIN...' : 'Authenticate with Employee PIN'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-[#222222] text-center text-[10px] text-[#78716c] space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-mono">
              <Lock className="w-3 h-3" />
              <span>Strict Authentication Wall Active</span>
            </div>
            <div>All session activity is cryptographically bound to the employee audit trail.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#78716c] text-xs font-mono">Loading Security Wall...</div>}>
      <LoginForm />
    </Suspense>
  );
}
