'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useFSMStore } from '@/lib/useStore';
import { 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  Check, 
  AlertCircle,
  Printer
} from 'lucide-react';
import { ValueProofComparison } from '@/components/estimates/ValueProofComparison';

export default function CustomerEstimateApprovalPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { getEstimateById, updateEstimateStatus } = useFSMStore();

  const estimateId = params.id as string;
  const estimate = getEstimateById(estimateId);

  const [signatureName, setSignatureName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approvedSuccess, setApprovedSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('print') === 'true') {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [searchParams]);

  if (!estimate) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#fdfbf7] flex items-center justify-center p-4">
        <div className="bg-[#111111] p-8 rounded-2xl border border-[#222222] max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 text-[#FF8A00] mx-auto mb-3" />
          <h2 className="text-xl font-bold font-heading">Estimate Not Found</h2>
          <p className="text-xs text-[#b8b0a5] mt-1">This quotation link may have expired or is invalid.</p>
        </div>
      </div>
    );
  }

  const isAlreadyApproved = estimate.status === 'approved' || approvedSuccess;

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureName.trim() || !agreed) return;

    setIsSubmitting(true);
    setTimeout(() => {
      updateEstimateStatus(estimate.id, 'approved');
      setIsSubmitting(false);
      setApprovedSuccess(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fdfbf7] py-10 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header Card with Logo */}
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#c5a059]/5 blur-[90px] pointer-events-none rounded-full print-hide" />
          
          {/* Print Action */}
          <button 
            onClick={() => window.print()}
            className="print-hide absolute top-6 right-6 p-2 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] rounded-lg text-[#b8b0a5] hover:text-[#fdfbf7] transition"
            title="Print Estimate"
          >
            <Printer className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-[#222222] mt-4 sm:mt-0 pr-12">
            <div>
              <img 
                src="/logo-full.png" 
                alt="Nailed It Property Solutions" 
                className="h-16 w-auto object-contain mb-2" 
              />
              <div className="text-xs text-[#b8b0a5] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#FF8A00]" />
                <span>PO Box 53, Rome, GA 30162 • (706) 844-8193</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059] bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#c5a059]/30">
                Service Quotation
              </span>
              <h1 className="font-mono text-xl font-bold text-[#fdfbf7] mt-2">{estimate.estimateNumber}</h1>
              <div className="text-xs text-[#b8b0a5] mt-0.5">Valid until: {estimate.validUntil}</div>
            </div>
          </div>

          {/* Client & Service Address Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-[#222222] text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#78716c]">Prepared For:</span>
              <div className="font-bold text-sm text-[#fdfbf7] mt-0.5">{estimate.clientName}</div>
              <div className="text-[#b8b0a5] flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-[#FF8A00]" />
                <span>{estimate.propertyAddress}</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-[#78716c]">Quote Status:</span>
              <div className="mt-1">
                {isAlreadyApproved ? (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full uppercase inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved by Customer
                  </span>
                ) : (
                  <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 text-xs font-bold px-3 py-1 rounded-full uppercase">
                    Pending Digital Signature
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Line-Item Breakdown */}
          <div className="pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#b8b0a5] mb-3">
              Proposed Scope of Work & Pricing
            </h3>

            <div className="border border-[#262626] rounded-xl overflow-hidden bg-[#161616]">
              <table className="w-full text-xs">
                <thead className="bg-[#181818] text-[#b8b0a5] font-semibold border-b border-[#262626]">
                  <tr>
                    <th className="p-3.5 text-left">Item & Description</th>
                    <th className="p-3.5 text-center">Type</th>
                    <th className="p-3.5 text-center">Qty / Hrs</th>
                    <th className="p-3.5 text-right">Unit Price</th>
                    <th className="p-3.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {estimate.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#1a1a1a]">
                      <td className="p-3.5 font-semibold text-[#fdfbf7]">
                        {item.description}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          item.type === 'labor' 
                            ? 'bg-blue-900/40 text-blue-300' 
                            : item.type === 'material' 
                            ? 'bg-amber-900/40 text-amber-300' 
                            : 'bg-emerald-900/40 text-emerald-300'
                        }`}>
                          {item.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-center text-[#b8b0a5]">{item.quantity}</td>
                      <td className="p-3.5 text-right font-mono text-[#b8b0a5]">${Number(item.unitPrice).toFixed(2)}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-[#fdfbf7]">${Number(item.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#181818] border-t border-[#262626]">
                  <tr>
                    <td colSpan={4} className="p-3 text-right font-semibold text-[#b8b0a5]">Subtotal:</td>
                    <td className="p-3 text-right font-mono font-bold text-[#fdfbf7]">${Number(estimate.subtotal).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="p-3 text-right font-semibold text-[#b8b0a5]">
                      Floyd County Sales Tax ({Number(estimate.taxRate * 100).toFixed(0)}%):
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-[#fdfbf7]">${Number(estimate.taxAmount).toFixed(2)}</td>
                  </tr>
                  <tr className="bg-[#1c1c1c] text-[#c5a059] font-bold text-sm">
                    <td colSpan={4} className="p-4 text-right">Total Quote Amount:</td>
                    <td className="p-4 text-right font-mono text-base font-black">${Number(estimate.total).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* The Value Proof™ Rome, GA Market Pegging Visual Component */}
        <ValueProofComparison
          nailedItTotal={estimate.total}
          tradeLabel={estimate.marketComparison?.tradeLabel || estimate.items[0]?.description}
          romeLow={estimate.marketComparison?.romeLowEstimate}
          romeMedian={estimate.marketComparison?.romeMedianEstimate}
          romeHigh={estimate.marketComparison?.romeHighEstimate}
          clientSavings={estimate.marketComparison?.customerDollarSavings}
          percentBelowMedian={estimate.marketComparison?.percentBelowMedian}
        />

        {/* Digital Approval Card */}
        {!isAlreadyApproved ? (
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8 shadow-2xl print-hide">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#c5a059] mb-1">
              <ShieldCheck className="w-4 h-4 text-[#FF8A00]" />
              <span>Digital Authorization</span>
            </div>
            <h2 className="text-xl font-bold font-heading text-[#fdfbf7]">
              Approve This Estimate & Schedule Work
            </h2>
            <p className="text-xs text-[#b8b0a5] mt-1 mb-6">
              By typing your name below, you authorize Nailed It Property Solutions to proceed with the specified service scope and order materials.
            </p>

            <form onSubmit={handleApprove} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#b8b0a5] mb-1">
                  Type Your Full Legal Name to Digitally Sign *
                </label>
                <input
                  type="text"
                  required
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="e.g. David Chen"
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059] font-heading"
                />
              </div>

              <label className="flex items-start space-x-2.5 text-xs text-[#b8b0a5] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="rounded bg-[#1a1a1a] border-[#333333] text-[#FF8A00] focus:ring-[#FF8A00] mt-0.5"
                />
                <span>
                  I confirm that I am the authorized property owner/manager for this service address and agree to the scope and pricing outlined above.
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting || !signatureName.trim() || !agreed}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 mt-4"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isSubmitting ? 'Recording Digital Signature...' : '✓ Approve & Authorize Service'}</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-8 text-center shadow-2xl space-y-3 print-hide">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h2 className="text-2xl font-bold font-heading text-white">Quotation Approved!</h2>
            <p className="text-xs text-emerald-200 max-w-md mx-auto leading-relaxed">
              Thank you for approving your quote. Nailed It Property Solutions dispatch has received your digital authorization and is scheduling your technician.
            </p>
            <div className="text-[11px] text-[#b8b0a5] pt-2">
              Questions? Call our Rome, GA office at <span className="text-[#c5a059] font-bold">(706) 844-8193</span>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
