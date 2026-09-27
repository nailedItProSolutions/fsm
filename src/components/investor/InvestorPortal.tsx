'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/lib/authContext';
import { useFSMStore } from '@/lib/useStore';
import { Property, Job, Invoice } from '@/types';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar,
  MapPin,
  User,
  FileText,
  Camera,
  CheckSquare,
  Download,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Wrench,
  Sparkles,
  DollarSign,
  Eye,
  Filter,
  Check,
  X,
  Printer,
  ChevronDown,
  Layers,
  Phone,
  Mail,
  Key
} from 'lucide-react';

export const InvestorPortal: React.FC = () => {
  const { user, isClient, isAdmin } = useAuth();
  const {
    clients,
    properties,
    jobs,
    invoices,
    getPropertiesByClientId,
    getJobsByClientId,
    getInvoicesByClientId,
  } = useFSMStore();

  // Active client scoping: if logged in as client, strictly scope to user.clientId or client-1
  // If admin/dispatcher, allow simulating/switching any investor
  const [selectedClientId, setSelectedClientId] = useState<string>(
    user?.clientId || 'client-1'
  );

  // Property filtering inside the investor portal
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'active'>('all');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const statusParam = params.get('status');
      if (statusParam === 'completed' || statusParam === 'active' || statusParam === 'all') {
        setStatusFilter(statusParam);
      }
      const propParam = params.get('property');
      if (propParam) {
        setSelectedPropertyId(propParam);
      }
    }
  }, []);

  // Modal states
  const [activePhotoModal, setActivePhotoModal] = useState<{
    url: string;
    type: 'Before' | 'After';
    jobTitle: string;
    jobNumber: string;
  } | null>(null);

  const [activeInvoiceModal, setActiveInvoiceModal] = useState<Invoice | null>(null);

  // Get active client
  const activeClient = useMemo(() => {
    return (
      clients.find((c) => c.id === selectedClientId) ||
      clients.find((c) => c.id === 'client-1') ||
      clients[0]
    );
  }, [clients, selectedClientId]);

  // Get properties for this client
  const clientProperties = useMemo(() => {
    if (!activeClient) return [];
    return getPropertiesByClientId(activeClient.id);
  }, [activeClient, getPropertiesByClientId, properties]);

  // Get jobs for this client
  const clientJobs = useMemo(() => {
    if (!activeClient) return [];
    const allClientJobs = getJobsByClientId(activeClient.id);
    
    // Sort chronological: newest scheduled or created date first
    return [...allClientJobs].sort((a, b) => {
      const dateA = new Date(a.completedAt || a.scheduledDate || a.createdAt).getTime();
      const dateB = new Date(b.completedAt || b.scheduledDate || b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [activeClient, getJobsByClientId, jobs]);

  // Filter jobs by selected property and status
  const filteredJobs = useMemo(() => {
    return clientJobs.filter((job) => {
      const matchesProperty =
        selectedPropertyId === 'all' || job.propertyId === selectedPropertyId;
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'completed'
          ? job.status === 'completed'
          : job.status === 'in_progress' || job.status === 'scheduled' || job.status === 'unscheduled';
      return matchesProperty && matchesStatus;
    });
  }, [clientJobs, selectedPropertyId, statusFilter]);

  // Client invoices
  const clientInvoices = useMemo(() => {
    if (!activeClient) return [];
    return getInvoicesByClientId(activeClient.id);
  }, [activeClient, getInvoicesByClientId, invoices]);

  // Compute portfolio metrics
  const metrics = useMemo(() => {
    const totalProps = clientProperties.length;
    const completedJobs = clientJobs.filter((j) => j.status === 'completed').length;
    const activeJobs = clientJobs.filter(
      (j) => j.status === 'in_progress' || j.status === 'scheduled' || j.status === 'unscheduled'
    ).length;
    const totalSpent = clientInvoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    return { totalProps, completedJobs, activeJobs, totalSpent };
  }, [clientProperties, clientJobs, clientInvoices]);

  const selectedPropertyObj = useMemo(() => {
    if (selectedPropertyId === 'all') return null;
    return clientProperties.find((p) => p.id === selectedPropertyId) || null;
  }, [selectedPropertyId, clientProperties]);

  const getStatusPill = (status: Job['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Completed & Verified
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-400 border border-amber-800/80">
            <Clock className="w-3.5 h-3.5 mr-1 animate-spin" />
            In Progress
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-950/80 text-blue-400 border border-blue-800/80">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            Scheduled
          </span>
        );
      case 'unscheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-950/80 text-purple-400 border border-purple-800/80">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Preventative Maint.
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#222222] text-[#b8b0a5]">
            {status}
          </span>
        );
    }
  };

  const getPriorityPill = (priority: Job['priority']) => {
    switch (priority) {
      case 'emergency':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-extrabold uppercase bg-red-950 text-red-400 border border-red-800 animate-pulse">
            🚨 Emergency
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-orange-950 text-orange-400 border border-orange-800">
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#1e293b] text-slate-300">
            Standard
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#1e293b] text-slate-400">
            Routine
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Read-Only Investor Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-[#18181b] to-[#111111] border border-purple-800/40 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start space-x-3.5">
          <div className="p-3 bg-purple-900/50 border border-purple-700/50 rounded-lg text-purple-300 shrink-0 mt-0.5">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Landlord & Investor Portal
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-900/80 text-purple-200 border border-purple-600/60">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Read-Only Verified View
              </span>
            </div>
            <p className="text-sm text-[#b8b0a5] mt-1">
              Real-time property maintenance records, verified inspection photo logs, and financial receipts.
            </p>
          </div>
        </div>

        {/* Admin client switcher or Client profile indicator */}
        <div className="flex items-center space-x-3 bg-[#111111]/80 px-4 py-2.5 rounded-lg border border-[#333333] shrink-0">
          <div className="text-right">
            <p className="text-xs text-[#a8a095]">Investor Account</p>
            <p className="text-sm font-bold text-white">
              {activeClient?.companyName || `${activeClient?.firstName} ${activeClient?.lastName}`}
            </p>
          </div>
          {isAdmin && (
            <div className="relative">
              <select
                aria-label="Switch Simulated Investor Account"
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value);
                  setSelectedPropertyId('all');
                }}
                className="bg-[#222222] border border-[#444444] text-xs text-[#fdfbf7] rounded px-2.5 py-1.5 focus:outline-none focus:border-purple-500 font-medium"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName || `${c.firstName} ${c.lastName}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 sm:p-5 flex items-center space-x-4 shadow">
          <div className="p-3 bg-blue-950/70 border border-blue-800/60 rounded-lg text-blue-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Properties</p>
            <p className="text-2xl font-black text-white">{metrics.totalProps}</p>
            <p className="text-[11px] text-blue-400 mt-0.5">Under Active Care</p>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 sm:p-5 flex items-center space-x-4 shadow">
          <div className="p-3 bg-amber-950/70 border border-amber-800/60 rounded-lg text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Active Work</p>
            <p className="text-2xl font-black text-white">{metrics.activeJobs}</p>
            <p className="text-[11px] text-amber-400 mt-0.5">In Progress / Dispatch</p>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 sm:p-5 flex items-center space-x-4 shadow">
          <div className="p-3 bg-emerald-950/70 border border-emerald-800/60 rounded-lg text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Verified History</p>
            <p className="text-2xl font-black text-white">{metrics.completedJobs}</p>
            <p className="text-[11px] text-emerald-400 mt-0.5">Certified Jobs on File</p>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 sm:p-5 flex items-center space-x-4 shadow">
          <div className="p-3 bg-purple-950/70 border border-purple-800/60 rounded-lg text-purple-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Capital Invested</p>
            <p className="text-2xl font-black text-white">
              ${metrics.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-purple-400 mt-0.5">Paid Maintenance</p>
          </div>
        </div>
      </div>

      {/* Property Selector Cards Grid */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center">
              <Building2 className="w-4 h-4 mr-2 text-purple-400" />
              Portfolio Properties ({clientProperties.length})
            </h2>
            <span className="text-xs text-[#888888] hidden sm:inline">
              Select a property to drill into its dedicated maintenance record
            </span>
          </div>

          <button
            onClick={() => setSelectedPropertyId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              selectedPropertyId === 'all'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-[#18181b] text-[#b8b0a5] hover:text-white border border-[#2a2a2a]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Show All Portfolio History ({clientJobs.length})</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {clientProperties.map((prop) => {
            const isSelected = selectedPropertyId === prop.id;
            const propJobs = clientJobs.filter((j) => j.propertyId === prop.id);
            const activePropJobs = propJobs.filter(
              (j) => j.status === 'in_progress' || j.status === 'scheduled' || j.status === 'unscheduled'
            ).length;
            const completedPropJobs = propJobs.filter((j) => j.status === 'completed').length;

            return (
              <div
                key={prop.id}
                onClick={() => setSelectedPropertyId(prop.id)}
                className={`cursor-pointer rounded-xl p-4 transition border text-left relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#1a1625] to-[#121216] border-purple-500 ring-2 ring-purple-500/20 shadow-lg'
                    : 'bg-[#141414] hover:bg-[#1a1a1a] border-[#262626] hover:border-[#383838]'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-bl">
                    Active Filter
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center">
                      {prop.label || 'Investment Property'}
                    </h3>
                    <p className="text-xs text-[#a8a095] mt-1 flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-purple-400 shrink-0" />
                      {prop.street}{prop.unit ? `, ${prop.unit}` : ''}
                    </p>
                    <p className="text-xs text-[#777777] ml-4.5">
                      {prop.city}, {prop.state} {prop.zip}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[#222222] flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 text-[11px] font-semibold border border-emerald-900/60">
                      {completedPropJobs} Completed
                    </span>
                    {activePropJobs > 0 && (
                      <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 text-[11px] font-semibold border border-amber-900/60">
                        {activePropJobs} Active
                      </span>
                    )}
                  </div>
                  <span className="text-[#a8a095] font-medium flex items-center text-[11px]">
                    History <ChevronRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>

                {prop.gateCode && (
                  <div className="mt-2 text-[11px] text-[#888888] flex items-center">
                    <Key className="w-3 h-3 mr-1 text-amber-400/80" />
                    <span>Gate/Access: <strong className="text-slate-300">{prop.gateCode}</strong></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Property Banner if filtered */}
      {selectedPropertyObj && (
        <div className="bg-[#121215] border border-purple-900/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-950 border border-purple-800 rounded-lg text-purple-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-400 uppercase">Selected Property View</p>
              <h2 className="text-base font-bold text-white">
                {selectedPropertyObj.label} — {selectedPropertyObj.street}{selectedPropertyObj.unit ? `, ${selectedPropertyObj.unit}` : ''}
              </h2>
              {selectedPropertyObj.accessInstructions && (
                <p className="text-xs text-[#999999] mt-0.5">
                  <strong className="text-[#cccccc]">Access Notes:</strong> {selectedPropertyObj.accessInstructions}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setSelectedPropertyId('all')}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold px-3 py-1.5 rounded bg-purple-950/50 border border-purple-800/60 shrink-0 self-start sm:self-auto"
          >
            Clear Property Filter
          </button>
        </div>
      )}

      {/* Chronological Maintenance History Section */}
      <div className="space-y-4">
        {/* Controls: Title & Status Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-3">
          <div>
            <h2 className="text-lg font-black text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-400" />
              Chronological Maintenance History
            </h2>
            <p className="text-xs text-[#888888] mt-0.5">
              Showing {filteredJobs.length} work order{filteredJobs.length === 1 ? '' : 's'} with verified completion logs
            </p>
          </div>

          <div className="flex items-center space-x-1.5 bg-[#141414] p-1 rounded-lg border border-[#262626] self-start sm:self-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                statusFilter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'text-[#999999] hover:text-white'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                statusFilter === 'completed'
                  ? 'bg-purple-600 text-white'
                  : 'text-[#999999] hover:text-white'
              }`}
            >
              Completed & Verified
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                statusFilter === 'active'
                  ? 'bg-purple-600 text-white'
                  : 'text-[#999999] hover:text-white'
              }`}
            >
              Active Work Orders
            </button>
          </div>
        </div>

        {/* Timeline / Cards Feed */}
        {filteredJobs.length === 0 ? (
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-12 text-center">
            <ShieldCheck className="w-12 h-12 text-[#444444] mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Maintenance Records Found</h3>
            <p className="text-xs text-[#888888] max-w-md mx-auto mt-1">
              There are no service orders matching your current property or status filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const invoice = job.invoiceId
                ? invoices.find((inv) => inv.id === job.invoiceId)
                : invoices.find((inv) => inv.jobId === job.id);
              const isCompleted = job.status === 'completed';
              const completedChecklistCount = job.checklist.filter((c) => c.done).length;

              return (
                <div
                  key={job.id}
                  className={`bg-[#141414] border rounded-xl overflow-hidden transition shadow-md ${
                    isCompleted
                      ? 'border-[#2a2a2a] hover:border-emerald-900/60'
                      : 'border-amber-900/40 bg-gradient-to-br from-[#171410] to-[#121212]'
                  }`}
                >
                  {/* Job Header Strip */}
                  <div className="bg-[#18181b] border-b border-[#242424] px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#262626] text-purple-300 border border-[#333333]">
                        {job.jobNumber}
                      </span>
                      {getStatusPill(job.status)}
                      {getPriorityPill(job.priority)}
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-[#a8a095]">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-[#888888]" />
                        {job.scheduledDate} {job.timeWindowStart ? `(${job.timeWindowStart} - ${job.timeWindowEnd})` : ''}
                      </span>
                      {job.assignedTechName && (
                        <span className="flex items-center font-medium text-slate-300">
                          <Wrench className="w-3.5 h-3.5 mr-1 text-[#ff5722]" />
                          Tech: {job.assignedTechName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Main Content Body */}
                  <div className="p-4 sm:p-6 space-y-5">
                    {/* Title & Property Address */}
                    <div>
                      <div className="flex items-baseline space-x-2">
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          {job.title}
                        </h3>
                      </div>
                      <p className="text-xs text-[#a8a095] mt-1 flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-purple-400 shrink-0" />
                        {job.propertyAddress}
                      </p>
                      <p className="text-xs text-[#b8b0a5] mt-2 leading-relaxed bg-[#111111] p-3 rounded-lg border border-[#222222]">
                        {job.description}
                      </p>
                    </div>

                    {/* Official Verified By Nailed It Seal (Displayed for Completed Jobs) */}
                    {isCompleted && (
                      <div className="bg-gradient-to-r from-emerald-950/70 via-[#131f18] to-[#111111] border border-emerald-600/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                        <div className="flex items-start space-x-3.5">
                          <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-400 shrink-0 mt-0.5">
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                                Verified Service Log
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700/60">
                                Official Seal
                              </span>
                            </div>
                            <p className="text-sm font-bold text-white mt-0.5">
                              Certified by Nailed It Property Solutions Quality Assurance
                            </p>
                            <p className="text-xs text-emerald-300/80 mt-0.5">
                              All checklist criteria executed & verified with timestamped photographic proof.
                              {job.completedAt && (
                                <span className="ml-1 text-slate-300">
                                  Completed {new Date(job.completedAt).toLocaleDateString()} at {new Date(job.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center text-[10px] font-mono text-emerald-400/80 bg-emerald-950/90 px-3 py-1.5 rounded-lg border border-emerald-800/80">
                          SEAL: NPS-VERIFIED-{job.jobNumber}
                        </div>
                      </div>
                    )}

                    {/* Completed Checklist Items Section */}
                    {job.checklist && job.checklist.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
                            <CheckSquare className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                            Turnover & Service Checklist ({completedChecklistCount}/{job.checklist.length} Complete)
                          </h4>
                          <span className="text-[11px] text-[#888888]">
                            Field Tech Verified
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#111111] p-3 rounded-lg border border-[#222222]">
                          {job.checklist.map((item) => (
                            <div
                              key={item.id}
                              className={`flex items-start space-x-2 text-xs p-1.5 rounded ${
                                item.done ? 'text-slate-200' : 'text-[#777777]'
                              }`}
                            >
                              {item.done ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-[#444444] shrink-0 mt-0.5" />
                              )}
                              <span className={item.done ? 'font-medium' : 'line-through text-[#666666]'}>
                                {item.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Photographic Evidence: Before & After Photos */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
                          <Camera className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                          Inspection & Photographic Verification Log
                        </h4>
                        <span className="text-[11px] text-[#888888]">
                          High-Res Photographic Evidence
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Before Photo Card */}
                        <div className="bg-[#111111] border border-[#262626] rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-400 flex items-center">
                              <Camera className="w-3.5 h-3.5 mr-1 text-amber-400" />
                              Before Work Commenced
                            </span>
                            <span className="text-[10px] text-[#888888] font-mono">
                              Initial State
                            </span>
                          </div>

                          {job.photosBefore && job.photosBefore.length > 0 ? (
                            <div className="space-y-2">
                              {job.photosBefore.map((photoUrl, idx) => (
                                <div
                                  key={idx}
                                  onClick={() =>
                                    setActivePhotoModal({
                                      url: photoUrl,
                                      type: 'Before',
                                      jobTitle: job.title,
                                      jobNumber: job.jobNumber,
                                    })
                                  }
                                  className="relative group cursor-pointer overflow-hidden rounded-lg border border-[#333333] aspect-video bg-[#1c1917]"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={photoUrl}
                                    alt={`Before service on ${job.jobNumber}`}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="px-3 py-1 rounded bg-black/80 text-white text-xs font-bold flex items-center space-x-1">
                                      <Eye className="w-3.5 h-3.5 mr-1" />
                                      Enlarge Photo
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-32 border border-dashed border-[#333333] rounded-lg flex flex-col items-center justify-center text-center p-4 text-[#666666]">
                              <Camera className="w-6 h-6 mb-1 text-[#444444]" />
                              <p className="text-xs">No initial inspection photo recorded</p>
                            </div>
                          )}
                        </div>

                        {/* After Photo Card */}
                        <div className="bg-[#111111] border border-[#262626] rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400 flex items-center">
                              <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                              After Work Completed & Cleaned
                            </span>
                            <span className="text-[10px] text-emerald-400/80 font-mono">
                              Verified Finished
                            </span>
                          </div>

                          {job.photosAfter && job.photosAfter.length > 0 ? (
                            <div className="space-y-2">
                              {job.photosAfter.map((photoUrl, idx) => (
                                <div
                                  key={idx}
                                  onClick={() =>
                                    setActivePhotoModal({
                                      url: photoUrl,
                                      type: 'After',
                                      jobTitle: job.title,
                                      jobNumber: job.jobNumber,
                                    })
                                  }
                                  className="relative group cursor-pointer overflow-hidden rounded-lg border border-[#333333] aspect-video bg-[#1c1917]"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={photoUrl}
                                    alt={`After service on ${job.jobNumber}`}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="px-3 py-1 rounded bg-black/80 text-white text-xs font-bold flex items-center space-x-1">
                                      <Eye className="w-3.5 h-3.5 mr-1" />
                                      Enlarge Photo
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-32 border border-dashed border-[#333333] rounded-lg flex flex-col items-center justify-center text-center p-4 text-[#666666]">
                              <Clock className="w-6 h-6 mb-1 text-[#444444]" />
                              <p className="text-xs">
                                {isCompleted
                                  ? 'Awaiting final completion upload'
                                  : 'Will be uploaded upon job completion'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Invoice Receipt & Financial Information */}
                    {invoice && (
                      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2.5 bg-blue-950/60 border border-blue-800/60 rounded-lg text-blue-400">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold font-mono text-white">
                                {invoice.invoiceNumber}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  invoice.status === 'paid'
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                    : 'bg-blue-950 text-blue-400 border border-blue-800'
                                }`}
                              >
                                {invoice.status === 'paid' ? 'Paid in Full' : invoice.status}
                              </span>
                            </div>
                            <p className="text-xs text-[#888888] mt-0.5">
                              Total Invoiced: <strong className="text-white">${invoice.total.toFixed(2)}</strong>
                              {invoice.paidAt && ` • Paid on ${new Date(invoice.paidAt).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setActiveInvoiceModal(invoice)}
                            className="px-3.5 py-1.5 bg-[#1f1f23] hover:bg-[#28282e] border border-[#38383e] text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-400" />
                            <span>View Full Receipt</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Technician Notes */}
                    {job.notes && (
                      <div className="text-xs text-[#888888] italic border-l-2 border-purple-500 pl-3">
                        <strong className="text-slate-300 not-italic">Technician Field Notes:</strong> {job.notes}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PHOTO LIGHTBOX MODAL */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl animate-in fade-in">
            <div className="bg-[#18181b] border-b border-[#262626] p-4 flex items-center justify-between">
              <div>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    activePhotoModal.type === 'Before'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}
                >
                  {activePhotoModal.type} Service Inspection Photo
                </span>
                <h3 className="text-sm font-bold text-white mt-1">
                  {activePhotoModal.jobNumber}: {activePhotoModal.jobTitle}
                </h3>
              </div>
              <button
                onClick={() => setActivePhotoModal(null)}
                className="p-1.5 text-[#888888] hover:text-white rounded-lg bg-[#222222] hover:bg-[#333333] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-black flex items-center justify-center max-h-[70vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePhotoModal.url}
                alt="Enlarged verification evidence"
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>

            <div className="bg-[#18181b] border-t border-[#262626] p-3.5 flex items-center justify-between text-xs text-[#a8a095]">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified high-resolution inspection record on file</span>
              </div>
              <button
                onClick={() => setActivePhotoModal(null)}
                className="px-4 py-1.5 rounded-lg bg-[#2b2b2b] text-white font-medium hover:bg-[#383838] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE RECEIPT MODAL */}
      {activeInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl animate-in fade-in">
            {/* Modal Header */}
            <div className="bg-[#18181b] border-b border-[#262626] p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-950 border border-purple-800 rounded-lg text-purple-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Official Service Invoice & Receipt
                  </h3>
                  <p className="text-xs text-[#888888] font-mono">
                    {activeInvoiceModal.invoiceNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveInvoiceModal(null)}
                className="p-1.5 text-[#888888] hover:text-white rounded-lg bg-[#222222] hover:bg-[#333333] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Receipt Body */}
            <div className="p-6 space-y-5 bg-[#0e0e11] max-h-[75vh] overflow-y-auto">
              {/* Receipt Header Branding */}
              <div className="flex items-start justify-between border-b border-[#222222] pb-4">
                <div>
                  <h2 className="text-base font-black text-white tracking-wider">
                    NAILED IT PROPERTY SOLUTIONS
                  </h2>
                  <p className="text-xs text-[#888888]">Property Maintenance & Repair Services</p>
                  <p className="text-xs text-[#666666]">Rome, GA & Austin, TX Metro</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider ${
                      activeInvoiceModal.status === 'paid'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                        : 'bg-blue-950 text-blue-400 border border-blue-700'
                    }`}
                  >
                    {activeInvoiceModal.status === 'paid' ? 'PAID IN FULL' : 'INVOICE'}
                  </span>
                  <p className="text-xs text-[#888888] mt-1">
                    Date: {new Date(activeInvoiceModal.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Billed To / Property Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[#888888] font-semibold uppercase text-[10px]">Billed To</p>
                  <p className="text-white font-bold">{activeInvoiceModal.clientName}</p>
                  <p className="text-[#a8a095]">{activeInvoiceModal.propertyAddress}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#888888] font-semibold uppercase text-[10px]">Work Order</p>
                  <p className="text-white font-mono font-bold">{activeInvoiceModal.jobNumber}</p>
                  {activeInvoiceModal.paidAt && (
                    <p className="text-emerald-400">
                      Paid: {new Date(activeInvoiceModal.paidAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-[#222222] rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#18181b] text-[#888888] font-semibold border-b border-[#222222]">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e24] text-[#cccccc]">
                    {activeInvoiceModal.items.map((item) => (
                      <tr key={item.id} className="hover:bg-[#141418]">
                        <td className="p-2.5 font-medium text-white">{item.description}</td>
                        <td className="p-2.5 text-center text-[#888888]">{item.quantity}</td>
                        <td className="p-2.5 text-right text-[#888888]">${item.unitPrice.toFixed(2)}</td>
                        <td className="p-2.5 text-right font-medium text-white">${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Calculation */}
              <div className="bg-[#141418] p-3.5 rounded-lg border border-[#222222] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#888888]">
                  <span>Subtotal</span>
                  <span>${activeInvoiceModal.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#888888]">
                  <span>Tax</span>
                  <span>${activeInvoiceModal.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-[#262626]">
                  <span>Total Amount</span>
                  <span className="text-emerald-400">${activeInvoiceModal.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-400 font-semibold pt-1">
                  <span>Amount Paid</span>
                  <span>${activeInvoiceModal.amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#888888]">
                  <span>Balance Due</span>
                  <span>${activeInvoiceModal.balanceDue.toFixed(2)}</span>
                </div>
              </div>

              {/* Verified Stamp inside receipt */}
              <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-3 text-center text-xs text-emerald-300">
                <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                <p className="font-bold">Verified Digital Receipt</p>
                <p className="text-[11px] text-emerald-400/80">
                  Nailed It Property Solutions — Thank you for your partnership!
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-[#18181b] border-t border-[#262626] p-4 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-lg bg-[#242429] text-white text-xs font-semibold hover:bg-[#32323a] transition flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-slate-300" />
                <span>Print / Save Receipt</span>
              </button>
              <button
                onClick={() => setActiveInvoiceModal(null)}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
