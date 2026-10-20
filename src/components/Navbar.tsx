'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { useActiveFSMData } from '@/lib/useStore';
import { 
  ShieldCheck, 
  Wrench, 
  Search,
  Bell,
  Menu,
  Phone,
  MapPin,
  Building2,
  Database,
  LogOut,
  User,
  Calendar,
  FileText,
  DollarSign,
  X
} from 'lucide-react';
import { SupabaseSyncModal } from './common/SupabaseSyncModal';
import { getSupabaseConfig } from '@/lib/supabase';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const router = useRouter();
  const { user, loginAs, logout, isAdmin, isTechnician, isClient } = useAuth();
  const { clients, properties, jobs, estimates, invoices } = useActiveFSMData();

  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [isCloudConfigured, setIsCloudConfigured] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    const cfg = getSupabaseConfig();
    setIsCloudConfigured(cfg.isConfigured);
  }, [syncModalOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchedClients = clients
      .filter((c) => {
        const name = `${c.firstName} ${c.lastName}`.toLowerCase();
        const comp = (c.companyName || '').toLowerCase();
        return (
          name.includes(q) ||
          comp.includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
        );
      })
      .slice(0, 4);

    const matchedProperties = properties
      .filter((p) => {
        const addr = `${p.label || ''} ${p.street} ${p.unit || ''} ${p.city} ${p.zip}`.toLowerCase();
        return addr.includes(q);
      })
      .slice(0, 4);

    const matchedJobs = jobs
      .filter((j) => {
        const text = `${j.jobNumber} ${j.title} ${j.clientName} ${j.propertyAddress} ${j.assignedTechName || ''}`.toLowerCase();
        return text.includes(q);
      })
      .slice(0, 4);

    const matchedEstimates = estimates
      .filter((e) => {
        const text = `${e.estimateNumber} ${e.clientName} ${e.propertyAddress}`.toLowerCase();
        return text.includes(q);
      })
      .slice(0, 3);

    const matchedInvoices = invoices
      .filter((inv) => {
        const text = `${inv.invoiceNumber} ${inv.jobNumber} ${inv.clientName} ${inv.propertyAddress}`.toLowerCase();
        return text.includes(q);
      })
      .slice(0, 3);

    const totalCount =
      matchedClients.length +
      matchedProperties.length +
      matchedJobs.length +
      matchedEstimates.length +
      matchedInvoices.length;

    return {
      clients: matchedClients,
      properties: matchedProperties,
      jobs: matchedJobs,
      estimates: matchedEstimates,
      invoices: matchedInvoices,
      totalCount,
    };
  }, [searchQuery, clients, properties, jobs, estimates, invoices]);

  const handleNavigate = (href: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    router.push(href);
  };

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
                <Phone className="w-2.5 h-2.5 text-[#c5a059]" /> (706) 237-8184
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search Input + Live Results Popover */}
        <div ref={searchRef} className="hidden lg:flex items-center flex-1 max-w-md mx-8 relative">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#c5a059] absolute left-3 top-2.5" />
            <input 
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              placeholder="Search clients, addresses, jobs in Rome, GA..." 
              className="w-full bg-[#181818] border border-[#2a2a2a] text-xs rounded-lg pl-9 pr-8 py-2.5 text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 top-2.5 text-[#78716c] hover:text-[#fdfbf7]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isSearchOpen && searchResults && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto divide-y divide-[#222222]">
              {searchResults.totalCount === 0 ? (
                <div className="p-4 text-center text-xs text-[#78716c]">
                  No clients, properties, jobs, estimates, or invoices matching &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                <>
                  {searchResults.clients.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#c5a059]">
                        Clients ({searchResults.clients.length})
                      </div>
                      {searchResults.clients.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleNavigate(`/dashboard/clients/${c.id}`)}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#1e1e1e] transition flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center space-x-2">
                            <User className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                            <div>
                              <div className="font-bold text-[#fdfbf7]">
                                {c.isCompany ? c.companyName : `${c.firstName} ${c.lastName}`}
                              </div>
                              <div className="text-[10px] text-[#78716c]">{c.phone} • {c.email}</div>
                            </div>
                          </div>
                          <span className="text-[10px] text-[#b8b0a5]">Profile →</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.properties.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#c5a059]">
                        Properties ({searchResults.properties.length})
                      </div>
                      {searchResults.properties.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleNavigate(`/dashboard/clients/${p.clientId}`)}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#1e1e1e] transition flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-3.5 h-3.5 text-[#FF8A00] shrink-0" />
                            <div>
                              <div className="font-bold text-[#fdfbf7]">{p.label || 'Managed Property'}</div>
                              <div className="text-[10px] text-[#78716c]">
                                {p.street}{p.unit ? `, ${p.unit}` : ''}, {p.city}, {p.state} {p.zip}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-[#b8b0a5]">View →</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.jobs.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#c5a059]">
                        Dispatch Jobs ({searchResults.jobs.length})
                      </div>
                      {searchResults.jobs.map((j) => (
                        <button
                          key={j.id}
                          type="button"
                          onClick={() => handleNavigate(`/dashboard/schedule?jobId=${j.id}`)}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#1e1e1e] transition flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <div>
                              <div className="font-bold text-[#fdfbf7]">
                                <span className="font-mono text-[#c5a059] mr-1.5">{j.jobNumber}</span>
                                {j.title}
                              </div>
                              <div className="text-[10px] text-[#78716c]">{j.clientName} • {j.propertyAddress}</div>
                            </div>
                          </div>
                          <span className="text-[10px] text-[#b8b0a5] uppercase">{j.status.replace('_', ' ')}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.estimates.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#c5a059]">
                        Estimates ({searchResults.estimates.length})
                      </div>
                      {searchResults.estimates.map((e) => (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => handleNavigate(`/estimate/${e.id}`)}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#1e1e1e] transition flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center space-x-2">
                            <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <div>
                              <div className="font-bold text-[#fdfbf7]">
                                <span className="font-mono text-purple-300 mr-1.5">{e.estimateNumber}</span>
                                {e.clientName}
                              </div>
                              <div className="text-[10px] text-[#78716c]">{e.propertyAddress}</div>
                            </div>
                          </div>
                          <span className="font-mono text-xs font-bold text-[#c5a059]">${e.total.toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.invoices.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#c5a059]">
                        Invoices ({searchResults.invoices.length})
                      </div>
                      {searchResults.invoices.map((inv) => (
                        <button
                          key={inv.id}
                          type="button"
                          onClick={() => handleNavigate(`/dashboard/invoices`)}
                          className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#1e1e1e] transition flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <div>
                              <div className="font-bold text-[#fdfbf7]">
                                <span className="font-mono text-emerald-400 mr-1.5">{inv.invoiceNumber}</span>
                                {inv.clientName}
                              </div>
                              <div className="text-[10px] text-[#78716c]">{inv.propertyAddress}</div>
                            </div>
                          </div>
                          <span className="font-mono text-xs font-bold text-[#fdfbf7]">${inv.total.toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/*  */}
        <div className="flex items-center space-x-4">
          {/* Role Switcher (Admin / Demo Session) */}
          {(isAdmin || user?.uid?.startsWith('user-')) && (
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
          )}

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

          {/* User Profile & Logout */}
          <div className="flex items-center space-x-2.5 pl-2 border-l border-[#2a2a2a]">
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

            {/* Logout Action Button */}
            <button
              onClick={handleLogout}
              title="Log Out of Session"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#181818] border border-[#2a2a2a] hover:border-red-500/50 hover:bg-red-950/30 text-xs font-semibold text-[#b8b0a5] hover:text-red-400 transition shadow-sm ml-1"
            >
              <LogOut className="w-3.5 h-3.5 text-[#b8b0a5] group-hover:text-red-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
      <SupabaseSyncModal isOpen={syncModalOpen} onClose={() => setSyncModalOpen(false)} />
    </header>
  );
};
