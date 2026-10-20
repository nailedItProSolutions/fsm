'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useFSMStore } from '@/lib/useStore';
import { useAuth } from '@/lib/authContext';
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
  Printer,
  ExternalLink,
  FileCheck2,
  Pencil,
  XCircle
} from 'lucide-react';
import { EstimateBuilderModal } from '@/components/estimates/EstimateBuilderModal';
import { ValueProofComparison } from '@/components/estimates/ValueProofComparison';

export default function CustomerEstimateApprovalPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'dispatcher';
  const { getEstimateById, approveEstimateClient, declineEstimateClient, getWorkAgreementById, getWorkAgreementByEstimateId } = useFSMStore();

  const estimateId = params.id as string;
  const estimate = getEstimateById(estimateId);
  const agreement = estimate?.workAgreementId 
    ? getWorkAgreementById(estimate.workAgreementId) 
    : (estimate ? getWorkAgreementByEstimateId(estimate.id) : undefined);

  const [signatureName, setSignatureName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approvedSuccess, setApprovedSuccess] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [isDeclining, setIsDeclining] = useState(false);

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
  const isDeclined = estimate.status === 'declined';

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureName.trim() || !agreed) return;

    setIsSubmitting(true);
    setTimeout(() => {
      approveEstimateClient(estimate.id, signatureName.trim());
      setIsSubmitting(false);
      setApprovedSuccess(true);
    }, 600);
  };

  const handleDecline = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeclining(true);
    setTimeout(() => {
      declineEstimateClient(estimate.id, declineReason.trim());
      setIsDeclining(false);
      setShowDeclineForm(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fdfbf7] py-10 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Work Agreement Active Banner */}
        {agreement && (
          <div className="bg-gradient-to-r from-[#171410] via-[#211a12] to-[#171410] border border-[#c5a059]/40 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:border-black">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-[#c5a059]/15 text-[#c5a059] rounded-xl border border-[#c5a059]/30 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#c5a059]">
                    Official Work Agreement Finalized
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#111] text-[#e7e5e4] border border-[#333]">
                    {agreement.agreementNumber}
                  </span>
                  {agreement.clientSignatureName && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
                      Signed by Customer
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#b8b0a5] mt-1.5 leading-relaxed">
                  This quotation has been officially finalized into a binding contract with detailed scope and agreed terms. Overall contract total is{' '}
                  <strong className="text-[#fdfbf7] font-mono font-bold">${Number(agreement.updatedTotal).toFixed(2)}</strong>
                  {estimate.originalTotal !== undefined && Math.abs(estimate.originalTotal - agreement.updatedTotal) > 0.009 && (
                    <span className="text-amber-400/90 ml-1.5 font-medium">
                      (Scope adjusted from original quote of ${Number(estimate.originalTotal).toFixed(2)}: {agreement.updatedTotal >= estimate.originalTotal ? '+' : '-'}${Math.abs(agreement.updatedTotal - estimate.originalTotal).toFixed(2)})
                    </span>
                  )}
                  .
                </p>
              </div>
            </div>
            <a
              href={`/agreement/${agreement.id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#c5a059] hover:bg-[#b08d48] text-black font-bold text-xs rounded-xl transition shadow-lg shrink-0 print-hide"
            >
              <span>View Official Contract</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Top Header Card with Logo */}
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#c5a059]/5 blur-[90px] pointer-events-none rounded-full print-hide" />
          
          {/* Actions: Edit & Print */}
          <div className="print-hide absolute top-6 right-6 flex items-center gap-2">
            {isAdmin && (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#252525] border border-amber-500/40 hover:border-amber-400 rounded-lg text-amber-400 hover:text-amber-300 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                title="Edit Estimate (Update line items, prices, quantities, client, or details)"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Estimate</span>
              </button>
            )}
            <button 
              onClick={() => window.print()}
              className="p-2 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] rounded-lg text-[#b8b0a5] hover:text-[#fdfbf7] transition"
              title="Print Estimate"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-[#222222] mt-4 sm:mt-0 pr-12">
            <div>
              <img 
                src="/logo-full.png" 
                alt="Nailed It Property Solutions" 
                className="h-16 w-auto object-contain mb-2" 
              />
              <div className="text-xs text-[#b8b0a5] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#FF8A00]" />
                <span>1600 Shorter Ave Ste H, Rome, GA 30165 • Office: (706) 237-8184</span>
              </div>
              <div className="text-[11px] text-[#78716c] mt-0.5">
                naileditpropertysolutions.com • info@naileditpropertysolutions.com
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
                ) : isDeclined ? (
                  <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold px-3 py-1 rounded-full uppercase inline-flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Declined / Changes Requested
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
                        <div>{item.description}</div>
                        {item.details && (
                          <div className="text-[11px] font-normal text-[#b8b0a5] mt-1 leading-relaxed">
                            {item.details}
                          </div>
                        )}
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
                    <td colSpan={4} className="p-4 text-right">
                      {agreement ? 'Total Agreed Contract Amount:' : 'Total Quote Amount:'}
                    </td>
                    <td className="p-4 text-right font-mono text-base font-black">${Number(estimate.total).toFixed(2)}</td>
                  </tr>
                  {agreement && estimate.originalTotal !== undefined && Math.abs(estimate.originalTotal - estimate.total) > 0.009 && (
                    <tr className="bg-[#141414] text-xs text-[#b8b0a5]">
                      <td colSpan={4} className="px-4 py-2 text-right">
                        Original Estimate Quote (${Number(estimate.originalTotal).toFixed(2)}):
                      </td>
                      <td className="px-4 py-2 text-right font-mono font-semibold text-[#c5a059]">
                        {estimate.total >= estimate.originalTotal ? '+' : '-'}${Math.abs(estimate.total - estimate.originalTotal).toFixed(2)} Scope Variance
                      </td>
                    </tr>
                  )}
                  {Number(estimate.depositPaid || 0) > 0 && (
                    <tr className="bg-[#141414] text-xs text-emerald-400">
                      <td colSpan={4} className="px-4 py-2 text-right font-medium">
                        Payment / Deposit Credited:
                      </td>
                      <td className="px-4 py-2 text-right font-mono font-bold">
                        -${Number(estimate.depositPaid || 0).toFixed(2)}
                      </td>
                    </tr>
                  )}
                  {agreement && (
                    <tr className="bg-[#17130e] text-sm font-bold border-t border-[#333]">
                      <td colSpan={4} className="p-3.5 text-right text-[#fdfbf7]">
                        Remaining Balance Due Upon Completion:
                      </td>
                      <td className="p-3.5 text-right font-mono text-base font-black text-[#c5a059]">
                        ${Math.max(0, Number(estimate.total) - Number(estimate.depositPaid || 0)).toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>
            {/* Estimate Terms & Standard Protections */}
            <div className="mt-6 pt-5 border-t border-[#262626] print:border-black text-[11px] text-[#888] print:text-black space-y-2 leading-relaxed">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-bold text-[#b8b0a5] print:text-black gap-1 pb-1">
                <span className="uppercase tracking-wider text-[#c5a059] print:text-black">Quotation Terms &amp; Standard Protections</span>
                <span className="text-[#78716c] print:text-zinc-600 font-normal">Fully Insured — Commercial Liability • Floyd County, GA</span>
              </div>
              <ul className="space-y-1.5 text-[#a39e93] print:text-black">
                {(estimate.terms && Array.isArray(estimate.terms) && estimate.terms.length > 0
                  ? estimate.terms
                  : [
                      'Quote valid for 30 calendar days from issuance due to material price fluctuations.',
                      '50% deposit due upfront upon approval to schedule project and procure materials; remaining balance is due upon receipt of final invoice upon substantial completion.',
                      'Work is strictly limited to itemized scope above. Unforeseen structural, plumbing, or subfloor defects discovered during execution pause work for written Change Order approval prior to proceeding.',
                      'Fully Insured — Operations are protected under Nailed It Property Solutions\' Commercial General Liability policy.'
                    ]
                ).map((t, i) => {
                  const colonIndex = t.indexOf(':');
                  const hasLabel = colonIndex > 0 && colonIndex < 45;
                  return (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#c5a059] print:text-black font-bold shrink-0 mt-0.5">•</span>
                      <span>
                        {hasLabel ? (
                          <>
                            <strong className="text-[#fdfbf7] print:text-black font-semibold">
                              {t.slice(0, colonIndex + 1)}
                            </strong>{' '}
                            {t.slice(colonIndex + 1).trim()}
                          </>
                        ) : (
                          t
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Floyd County Value Proof Comparison */}
        {estimate.marketComparison && (
          <ValueProofComparison
            nailedItTotal={Number(estimate.total)}
            tradeLabel={estimate.marketComparison.tradeLabel}
            romeLow={estimate.marketComparison.romeLowEstimate}
            romeMedian={estimate.marketComparison.romeMedianEstimate}
            romeHigh={estimate.marketComparison.romeHighEstimate}
            clientSavings={estimate.marketComparison.customerDollarSavings}
            percentBelowMedian={estimate.marketComparison.percentBelowMedian}
          />
        )}

        {/* Digital Approval / Decline Card */}
        {isAlreadyApproved ? (
          <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-8 text-center shadow-2xl space-y-3 print-hide">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h2 className="text-2xl font-bold font-heading text-white">Quotation Approved!</h2>
            <p className="text-xs text-emerald-200 max-w-md mx-auto leading-relaxed">
              Thank you for approving your quote. Nailed It Property Solutions dispatch has received your digital authorization and is scheduling your technician.
            </p>
            {(estimate.clientSignatureName || estimate.clientSignedAt) && (
              <div className="bg-[#111111]/80 border border-emerald-500/30 rounded-xl p-3.5 max-w-md mx-auto text-xs text-left space-y-1 font-mono mt-2">
                {estimate.clientSignatureName && (
                  <div className="flex justify-between text-[#b8b0a5]">
                    <span>Digitally Signed By:</span>
                    <span className="font-serif italic text-emerald-300 font-bold">{estimate.clientSignatureName}</span>
                  </div>
                )}
                {estimate.clientSignedAt && (
                  <div className="flex justify-between text-[#b8b0a5]">
                    <span>Signed Timestamp:</span>
                    <span className="text-[#fdfbf7]">{new Date(estimate.clientSignedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
            <div className="text-[11px] text-[#b8b0a5] pt-2">
              Questions? Call our Rome, GA office at <span className="text-[#c5a059] font-bold">(706) 237-8184</span> or email <span className="text-[#c5a059] font-bold">info@naileditpropertysolutions.com</span>.
            </div>
          </div>
        ) : isDeclined ? (
          <div className="bg-red-950/30 border border-red-500/50 rounded-2xl p-8 text-center shadow-2xl space-y-3 print-hide">
            <XCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h2 className="text-2xl font-bold font-heading text-white">Estimate Declined / Changes Requested</h2>
            <p className="text-xs text-red-200 max-w-md mx-auto leading-relaxed">
              This quotation has been marked as declined or pending scope adjustments. Our Rome, GA office has been notified.
            </p>
            {estimate.declinedReason && (
              <div className="bg-[#111111]/80 border border-red-500/30 rounded-xl p-4 max-w-md mx-auto text-xs text-left">
                <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">Reason / Requested Changes:</div>
                <div className="text-[#fdfbf7] italic">{estimate.declinedReason}</div>
                {estimate.declinedAt && (
                  <div className="text-[10px] text-[#78716c] font-mono mt-2">
                    Recorded: {new Date(estimate.declinedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}
            <div className="text-[11px] text-[#b8b0a5] pt-2">
              Need to discuss revisions? Call our Rome, GA office at <span className="text-[#c5a059] font-bold">(706) 237-8184</span>.
            </div>
          </div>
        ) : (
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8 shadow-2xl print-hide">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#c5a059] mb-1">
              <ShieldCheck className="w-4 h-4 text-[#FF8A00]" />
              <span>Digital Authorization</span>
            </div>
            <h2 className="text-xl font-bold font-heading text-[#fdfbf7]">
              Approve This Estimate & Schedule Work
            </h2>
            <p className="text-xs text-[#b8b0a5] mt-1 mb-6">
              By typing your name below, you authorize Nailed It Property Solutions to proceed with the specified service scope under the terms and payment conditions outlined above.
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

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !signatureName.trim() || !agreed}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isSubmitting ? 'Recording Digital Signature...' : '✓ Approve & Authorize Service'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeclineForm(!showDeclineForm)}
                  className="bg-[#1a1a1a] hover:bg-red-950/40 text-[#b8b0a5] hover:text-red-400 border border-[#333333] hover:border-red-500/40 font-bold text-xs py-3.5 px-5 rounded-xl transition flex items-center justify-center space-x-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Decline / Request Changes</span>
                </button>
              </div>
            </form>

            {showDeclineForm && (
              <form onSubmit={handleDecline} className="mt-6 pt-5 border-t border-[#262626] space-y-3">
                <label className="block text-xs font-bold text-red-400">
                  Reason for Declining or Requested Scope Changes
                </label>
                <textarea
                  rows={3}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Please let us know what changes you'd like or why you are declining this quote..."
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-xs text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-red-500/60"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeclineForm(false)}
                    className="px-4 py-2 text-xs text-[#b8b0a5] hover:text-[#fdfbf7]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeclining}
                    className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2 rounded-xl transition"
                  >
                    {isDeclining ? 'Submitting...' : 'Confirm Decline / Send Feedback'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Modal for editing estimate if input errors were made before signing */}
        {isAdmin && isEditModalOpen && (
          <EstimateBuilderModal
            isOpen={isEditModalOpen}
            estimateToEdit={estimate}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={() => setIsEditModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
