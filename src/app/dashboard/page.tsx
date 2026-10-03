'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { useActiveFSMData } from '@/lib/useStore';
import { 
  Users, 
  CalendarDays, 
  CreditCard, 
  Wrench, 
  ArrowUpRight, 
  Building2, 
  MapPin, 
  Plus, 
  Clock, 
  DollarSign,
  TrendingUp,
  FileText
} from 'lucide-react';
import { ActivityHistoryFeed } from '@/components/audit/ActivityHistoryFeed';

export default function ExecutiveDashboard() {
  const { user } = useAuth();
  const { clients, properties, jobs, invoices } = useActiveFSMData();

  const totalRevenue = clients.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
  const activeJobs = jobs.filter((j) => j.status === 'in_progress' || j.status === 'scheduled');
  const outstandingAR = invoices.reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);

  return (
    <div className="space-y-8 text-[#fdfbf7]">
      {/*  */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111111] p-6 rounded-2xl border border-[#222222] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#c5a059]/5 blur-[90px] pointer-events-none rounded-full" />
        
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#c5a059] font-bold uppercase tracking-wider mb-1">
            <MapPin className="w-3.5 h-3.5 text-[#FF8A00]" />
            <span>Rome, GA Service Headquarters • Floyd County</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#fdfbf7]">
            Operations Command Center
          </h1>
          <p className="text-xs text-[#b8b0a5] mt-1">
            Welcome, <span className="text-[#fdfbf7] font-semibold">{user?.displayName || 'Dispatcher'}</span>. Real-time property maintenance & dispatch metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            href="/dashboard/clients"
            className="bg-[#181818] hover:bg-[#222222] text-[#fdfbf7] border border-[#333333] text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center space-x-1.5"
          >
            <Users className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Clients & CRM</span>
          </Link>
          <Link
            href="/dashboard/schedule"
            className="bg-[#c5a059] hover:bg-[#b38728] text-black text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>+ Dispatch Job</span>
          </Link>
        </div>
      </div>

      {/*  */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/*  */}
        <div className="bg-[#111111] border border-[#222222] p-5 rounded-2xl shadow-sm hover:border-[#c5a059]/30 transition group">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716c]">Billed Revenue (MTD)</span>
            <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 text-[#c5a059] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-[#fdfbf7] mt-2 group-hover:text-[#c5a059] transition">
            ${totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% vs last period</span>
          </div>
        </div>

        {/*  */}
        <div className="bg-[#111111] border border-[#222222] p-5 rounded-2xl shadow-sm hover:border-[#FF8A00]/30 transition group">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716c]">Outstanding AR</span>
            <div className="w-8 h-8 rounded-lg bg-[#FF8A00]/10 text-[#FF8A00] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-[#FF8A00] mt-2">
            ${outstandingAR.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#b8b0a5] mt-1">
            {invoices.filter((i) => i.balanceDue > 0).length} pending collection
          </div>
        </div>

        {/*  */}
        <div className="bg-[#111111] border border-[#222222] p-5 rounded-2xl shadow-sm hover:border-[#333333] transition group">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716c]">Active Dispatch</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-[#fdfbf7] mt-2">
            {activeJobs.length} Jobs
          </div>
          <div className="text-[11px] text-[#b8b0a5] mt-1">
            2 technicians on active route
          </div>
        </div>

        {/*  */}
        <div className="bg-[#111111] border border-[#222222] p-5 rounded-2xl shadow-sm hover:border-[#333333] transition group">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716c]">Client Properties</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-[#fdfbf7] mt-2">
            {properties.length} Addresses
          </div>
          <div className="text-[11px] text-[#c5a059] mt-1">
            Across {clients.length} client accounts
          </div>
        </div>
      </div>

      {/*  */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/*  */}
        <div className="lg:col-span-2 bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold font-heading text-[#fdfbf7]">
                Today's Dispatch Pipeline
              </h2>
              <p className="text-xs text-[#b8b0a5]">Field jobs assigned to technicians in Rome, GA</p>
            </div>
            <Link
              href="/dashboard/schedule"
              className="text-xs text-[#c5a059] hover:underline font-bold flex items-center gap-1"
            >
              <span>View Full Dispatch Board</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {jobs.slice(0, 3).map((job) => (
              <div 
                key={job.id}
                className="bg-[#161616] border border-[#262626] hover:border-[#c5a059]/40 p-4 rounded-xl transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[11px] font-bold text-[#c5a059] bg-[#1f1f1f] px-2 py-0.5 rounded">
                      {job.jobNumber}
                    </span>
                    <h4 className="font-bold text-sm text-[#fdfbf7]">{job.title}</h4>
                  </div>
                  <div className="text-xs text-[#b8b0a5] flex items-center gap-2">
                    <span>{job.clientName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#FF8A00]" />
                      <span>{job.propertyAddress}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#262626] pt-2 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <div className="text-xs font-semibold text-[#fdfbf7]">
                      {job.timeWindowStart} - {job.timeWindowEnd}
                    </div>
                    <div className="text-[10px] text-[#c5a059]">
                      Tech: {job.assignedTechName}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                    job.status === 'in_progress'
                      ? 'bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/40'
                      : job.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {job.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/*  */}
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold font-heading text-[#fdfbf7]">
                Client Directory
              </h2>
              <p className="text-xs text-[#b8b0a5]">Recent customer accounts</p>
            </div>
            <Link
              href="/dashboard/clients"
              className="text-xs text-[#c5a059] hover:underline font-bold"
            >
              See All ({clients.length})
            </Link>
          </div>

          <div className="space-y-3">
            {clients.slice(0, 4).map((c) => {
              const clientProps = properties.filter((p) => p.clientId === c.id);

              return (
                <Link
                  key={c.id}
                  href={`/dashboard/clients/${c.id}`}
                  className="block bg-[#161616] border border-[#262626] hover:border-[#333333] p-3.5 rounded-xl transition group"
                >
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-xs text-[#fdfbf7] group-hover:text-[#c5a059] transition">
                      {c.isCompany ? c.companyName : `${c.firstName} ${c.lastName}`}
                    </div>
                    <span className="text-[10px] font-mono text-[#c5a059]">
                      ${c.totalSpent.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#b8b0a5] mt-1 flex items-center justify-between">
                    <span>{clientProps.length} {clientProps.length === 1 ? 'Property' : 'Properties'}</span>
                    <span className="text-[#78716c]">{c.phone}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <Link
            href="/dashboard/clients"
            className="w-full bg-[#181818] hover:bg-[#222222] text-[#fdfbf7] border border-[#333333] text-xs font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition"
          >
            <Users className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Open Client Manager</span>
          </Link>
        </div>
      </div>

      {/* Global Activity History & Audit Feed */}
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl">
        <ActivityHistoryFeed
          title="Global Operational Audit Trail & Event Stream"
          compact={false}
          maxItems={20}
        />
      </div>
    </div>
  );
}
