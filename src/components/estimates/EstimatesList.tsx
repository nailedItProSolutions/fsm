'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useFSMStore } from '@/lib/useStore';
import { Estimate } from '@/types';
import { EstimateBuilderModal } from './EstimateBuilderModal';
import { 
  FileText, 
  Plus, 
  Send, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  ExternalLink, 
  Copy, 
  Check, 
  Wrench,
  TrendingUp,
  Clock,
  ArrowRight, Printer
} from 'lucide-react';

export const EstimatesList: React.FC = () => {
  const { estimates, updateEstimateStatus, convertEstimateToJob } = useFSMStore();

  const [filterStatus, setFilterStatus] = useState<Estimate['status'] | 'all'>('all');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [convertedJobAlert, setConvertedJobAlert] = useState<{ estNum: string; jobNum: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('new') === 'true') {
        setIsBuilderOpen(true);
      }
    }
  }, []);

  const filteredEstimates = useMemo(() => {
    if (filterStatus === 'all') return estimates;
    return estimates.filter((e) => e.status === filterStatus);
  }, [estimates, filterStatus]);

  const totalValue = estimates.reduce((acc, e) => acc + (e.total || 0), 0);
  const approvedCount = estimates.filter((e) => e.status === 'approved').length;
  const approvedValue = estimates.filter((e) => e.status === 'approved').reduce((acc, e) => acc + (e.total || 0), 0);

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/estimate/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleConvert = (estimateId: string) => {
    const job = convertEstimateToJob(estimateId);
    if (job) {
      const est = estimates.find((e) => e.id === estimateId);
      setConvertedJobAlert({
        estNum: est?.estimateNumber || '',
        jobNum: job.jobNumber,
      });
      setTimeout(() => setConvertedJobAlert(null), 5000);
    }
  };

  const getStatusBadge = (status: Estimate['status']) => {
    switch (status) {
      case 'approved':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Approved</span>;
      case 'sent':
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Sent to Customer</span>;
      case 'declined':
        return <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Declined</span>;
      default:
        return <span className="bg-slate-700/40 text-slate-300 border border-slate-600/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Draft</span>;
    }
  };

  return (
    <div className="space-y-6 text-[#fdfbf7]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111111] p-6 rounded-2xl border border-[#222222] shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#c5a059] font-bold uppercase tracking-wider mb-1">
            <FileText className="w-3.5 h-3.5 text-[#FF8A00]" />
            <span>Rome, GA Quotation & Approval Pipeline</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-[#fdfbf7]">
            Estimates & Quoting
          </h1>
          <p className="text-xs text-[#b8b0a5] mt-1">
            Line-item quotations, digital customer sign-off links, and 1-click conversion to active jobs
          </p>
        </div>

        <button
          onClick={() => setIsBuilderOpen(true)}
          className="bg-[#c5a059] hover:bg-[#b38728] text-black font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Create New Estimate</span>
        </button>
      </div>

      {/* Converted to Job Success Toast */}
      {convertedJobAlert && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-xl flex items-center justify-between text-xs text-emerald-200 animate-in fade-in duration-200 shadow-xl">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="font-bold text-white">Converted Successfully!</span> Estimate {convertedJobAlert.estNum} was converted into active job{' '}
              <span className="font-mono font-bold text-white bg-emerald-900/60 px-1.5 py-0.5 rounded">{convertedJobAlert.jobNum}</span>.
            </div>
          </div>
          <Link
            href="/dashboard/schedule"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] transition"
          >
            View on Calendar →
          </Link>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-[#222222] p-4 rounded-xl shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#78716c]">Total Estimates</div>
          <div className="text-2xl font-bold font-heading text-[#fdfbf7] mt-1">{estimates.length}</div>
          <div className="text-[10px] text-[#c5a059] mt-0.5">Pipeline in Rome, GA</div>
        </div>

        <div className="bg-[#111111] border border-[#222222] p-4 rounded-xl shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#78716c]">Approved Quotes</div>
          <div className="text-2xl font-bold font-heading text-emerald-400 mt-1">{approvedCount}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">{((approvedCount / (estimates.length || 1)) * 100).toFixed(0)}% Win Rate</div>
        </div>

        <div className="bg-[#111111] border border-[#222222] p-4 rounded-xl shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#78716c]">Total Pipeline Value</div>
          <div className="text-2xl font-bold font-heading text-[#fdfbf7] mt-1">${totalValue.toLocaleString()}</div>
          <div className="text-[10px] text-[#78716c] mt-0.5">All active proposals</div>
        </div>

        <div className="bg-[#111111] border border-[#222222] p-4 rounded-xl shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#78716c]">Approved Value</div>
          <div className="text-2xl font-bold font-heading text-[#c5a059] mt-1">${approvedValue.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Ready for dispatch</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-[#111111] border border-[#222222] p-4 rounded-xl shadow-sm flex items-center justify-between">
        <div className="inline-flex rounded-lg border border-[#2a2a2a] p-1 bg-[#181818] text-xs">
          {(['all', 'draft', 'sent', 'approved', 'declined'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded font-semibold transition ${
                filterStatus === st ? 'bg-[#c5a059] text-black font-bold' : 'text-[#b8b0a5] hover:text-[#fdfbf7]'
              }`}
            >
              {st === 'all' ? 'All Estimates' : st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Estimates Table */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden shadow-xl">
        <table className="min-w-full divide-y divide-[#222222] text-xs">
          <thead className="bg-[#161616] text-[#b8b0a5] font-semibold text-left">
            <tr>
              <th className="px-6 py-4">Estimate #</th>
              <th className="px-6 py-4">Client & Property Location</th>
              <th className="px-6 py-4">Items Included</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-right">Actions & Conversion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {filteredEstimates.map((est) => (
              <tr key={est.id} className="hover:bg-[#161616] transition">
                {/* Estimate Number */}
                <td className="px-6 py-4">
                  <div className="font-mono font-bold text-sm text-[#c5a059]">{est.estimateNumber}</div>
                  <div className="text-[10px] text-[#78716c] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>Valid until {est.validUntil}</span>
                  </div>
                </td>

                {/* Client & Property */}
                <td className="px-6 py-4">
                  <div className="font-bold text-sm text-[#fdfbf7]">{est.clientName}</div>
                  <div className="text-[11px] text-[#b8b0a5] truncate max-w-xs">{est.propertyAddress}</div>
                </td>

                {/* Items Summary */}
                <td className="px-6 py-4">
                  <span className="bg-[#1a1a1a] text-[#fdfbf7] px-2.5 py-1 rounded border border-[#262626] font-semibold">
                    {est.items.length} Line {est.items.length === 1 ? 'Item' : 'Items'}
                  </span>
                  <div className="text-[10px] text-[#78716c] mt-1 truncate max-w-xs">
                    {est.items[0]?.description}
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  {getStatusBadge(est.status)}
                </td>

                {/* Total */}
                <td className="px-6 py-4 text-right font-mono font-bold text-sm text-[#fdfbf7]">
                  ${Number(est.total).toFixed(2)}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right space-x-2">
                  {/* Public Digital Approval Link */}
                  <Link
                    href={`/estimate/${est.id}`}
                    target="_blank"
                    className="inline-block bg-[#1c1c1c] hover:bg-[#252525] text-[#b8b0a5] hover:text-[#fdfbf7] border border-[#333333] px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition"
                    title="View Customer Digital Approval Page"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  {/* Copy Link to SMS/Email */}
                  <button
                    onClick={() => handleCopyLink(est.id)}
                    className="bg-[#1c1c1c] hover:bg-[#252525] text-[#b8b0a5] hover:text-[#c5a059] border border-[#333333] px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition"
                    title="Copy customer link to SMS / Email"
                  >
                    {copiedId === est.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  {/* One-Click Convert to Job if Approved */}
                  {est.status === 'approved' && !est.convertedToJobId && (
                    <button
                      onClick={() => handleConvert(est.id)}
                      className="bg-[#FF8A00] hover:bg-[#ea580c] text-black font-bold text-[11px] px-3 py-1.5 rounded-lg transition shadow flex items-center space-x-1 inline-flex"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>1-Click Convert to Job</span>
                    </button>
                  )}

                  {/* If already converted, show link */}
                  {est.convertedToJobId && (
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/40">
                      ✓ Active Job Dispatched
                    </span>
                  )}

                  {/* If sent, allow quick test-approve button */}
                  {est.status === 'sent' && (
                    <button
                      onClick={() => updateEstimateStatus(est.id, 'approved')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition shadow"
                    >
                      Approve Quote
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {filteredEstimates.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#78716c]">
                  No estimates found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Estimate Builder Modal */}
      <EstimateBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
      />
    </div>
  );
};
