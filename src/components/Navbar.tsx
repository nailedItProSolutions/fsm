'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { 
  ShieldCheck, 
  Wrench, 
  Search,
  Bell,
  Menu,
  Phone,
  MapPin,
  Building2,
  Database
} from 'lucide-react';
import { SupabaseSyncModal } from './common/SupabaseSyncModal';
import { getSupabaseConfig } from '@/lib/supabase';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, loginAs, isAdmin, isTechnician, isClient } = useAuth();
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [isCloudConfigured, setIsCloudConfigured] = useState(false);

  useEffect(() => {
    const cfg = getSupabaseConfig();
    setIsCloudConfigured(cfg.isConfigured);
  }, [syncModalOpen]);

  return (
    <header className="bg-[#111111] border-b border-[#222222] text-[#fdfbf7] sticky top-0 z-40 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/*  */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-[#b8b0a5] hover:text-[#fdfbf7] rounded-lg focus:outline-none"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <Link href="/dashboard" className="flex items-center space-x-3 py-2 group">
            <div className="relative h-12 w-48 sm:w-60 flex items-center">
              <img 
                src="/logo-full.png" 
                alt="Nailed It Property Solutions" 
                className="max-h-12 w-auto object-contain transition-transform group-hover:scale-105 duration-200" 
              />
            </div>
            <div className="hidden xl:flex flex-col border-l border-[#2c2c2c] pl-3 py-0.5">
              <span className="text-[11px] font-bold tracking-wider text-[#c5a059] uppercase flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#FF8A00]" /> Rome, GA Operations
              </span>
              <span className="text-[10px] text-[#b8b0a5] flex items-center gap-1">
                <Phone className="w-2.5 h-2.5 text-[#c5a059]" /> (706) 844-8193
              </span>
            </div>
          </Link>
        </div>

        {/*  */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#c5a059] absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Search clients, addresses, jobs in Rome, GA..." 
              className="w-full bg-[#181818] border border-[#2a2a2a] text-xs rounded-lg pl-9 pr-4 py-2.5 text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition"
            />
          </div>
        </div>

        {/*  */}
        <div className="flex items-center space-x-4">
          {/*  */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-[#181818] p-1 rounded-lg border border-[#2a2a2a] text-xs">
            <span className="text-[11px] text-[#b8b0a5] px-2 font-medium">Role:</span>
            <button
              onClick={() => loginAs('admin')}
              className={`px-2.5 py-1 rounded font-semibold transition flex items-center space-x-1 ${
                isAdmin 
                  ? 'bg-[#c5a059] text-black shadow-md font-bold' 
                  : 'text-[#b8b0a5] hover:text-[#fdfbf7]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin / Dispatch</span>
            </button>
            <button
              onClick={() => loginAs('technician')}
              className={`px-2.5 py-1 rounded font-semibold transition flex items-center space-x-1 ${
                isTechnician 
                  ? 'bg-[#FF8A00] text-black shadow-md font-bold' 
                  : 'text-[#b8b0a5] hover:text-[#fdfbf7]'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Field Tech</span>
            </button>
            <button
              onClick={() => loginAs('client')}
              className={`px-2.5 py-1 rounded font-semibold transition flex items-center space-x-1 ${
                isClient 
                  ? 'bg-purple-600 text-white shadow-md font-bold' 
                  : 'text-[#b8b0a5] hover:text-[#fdfbf7]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Investor / Landlord</span>
            </button>
          </div>

          {/* Cloud Persistence Sync Button */}
          <button
            onClick={() => setSyncModalOpen(true)}
            title={isCloudConfigured ? "Supabase Cloud Database Connected" : "Configure Supabase Cloud Sync"}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#181818] border border-[#2a2a2a] hover:border-amber-500/40 text-xs font-semibold text-[#b8b0a5] hover:text-[#fdfbf7] transition shadow-sm"
          >
            <Database className="w-3.5 h-3.5 text-[#c5a059]" />
            <span className="hidden sm:inline">Cloud Sync</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isCloudConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-2 pl-2 border-l border-[#2a2a2a]">
            <div className="w-8 h-8 rounded-full bg-[#1e1e1e] border border-[#c5a059]/40 flex items-center justify-center text-xs font-bold text-[#c5a059]">
              {user?.displayName ? user.displayName.charAt(0) : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-[#fdfbf7] leading-tight">
                {user?.displayName || 'User'}
              </div>
              <div className="text-[10px] text-[#c5a059] font-medium capitalize">
                {user?.role || 'Guest'}
              </div>
            </div>
          </div>
        </div>
      </div>
      <SupabaseSyncModal isOpen={syncModalOpen} onClose={() => setSyncModalOpen(false)} />
    </header>
  );
};
