'use client';

import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useFSMStore } from '@/lib/useStore';
import { 
  Printer, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  Wrench,
  DollarSign
} from 'lucide-react';

export default function WorkAgreementPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { getWorkAgreementById } = useFSMStore();

  const agreementId = params.id as string;
  const agreement = getWorkAgreementById(agreementId);

  useEffect(() => {
    if (searchParams.get('print') === 'true') {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!agreement) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#fdfbf7] flex items-center justify-center p-4">
        <div className="bg-[#111111] p-8 rounded-2xl border border-[#222222] max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 text-[#FF8A00] mx-auto mb-3" />
          <h2 className="text-xl font-bold font-heading">Agreement Not Found</h2>
          <p className="text-xs text-[#b8b0a5] mt-1">This document link may have expired or is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fdfbf7] py-10 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Document Card */}
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          
          {/* Print Button */}
          <button 
            onClick={() => window.print()}
            className="print-hide absolute top-6 right-6 p-2 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] rounded-lg text-[#b8b0a5] hover:text-[#fdfbf7] transition flex items-center gap-1.5 text-xs font-bold"
            title="Print Work Agreement"
          >
            <Printer className="w-4 h-4 text-[#c5a059]" />
            <span>Print Agreement</span>
          </button>

          {/* Letterhead */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-[#222222] mt-4 sm:mt-0 pr-12">
            <div>
              <img 
                src="/logo.png" 
                alt="Nailed It Property Solutions" 
                className="h-14 w-auto object-contain mb-2" 
              />
              <div className="text-xs text-[#b8b0a5] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#FF8A00]" />
                <span>PO Box 53, Rome, GA 30162 • (706) 844-8193</span>
              </div>
              <div className="text-[11px] text-[#78716c] mt-0.5">
                General Maintenance & Property Solutions • Floyd County, GA
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#c5a059] bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#c5a059]/30">
                Company Work Agreement & Service Contract
              </span>
              <h1 className="font-mono text-xl font-bold text-[#fdfbf7] mt-2">
                {agreement.agreementNumber}
              </h1>
              <div className="text-[11px] text-[#78716c] font-mono mt-0.5">
                Date: {new Date(agreement.createdAt).toLocaleDateString()}
              </div>
              {agreement.jobNumber && (
                <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                  Linked Work Order: {agreement.jobNumber}
                </div>
              )}
            </div>
          </div>

          {/* Parties & Job Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-4 rounded-xl bg-[#161616] border border-[#222222] text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716c] block mb-1">
                Client / Authorized Property Representative
              </span>
              <div className="font-bold text-sm text-[#fdfbf7]">{agreement.clientName}</div>
              <div className="text-[#b8b0a5] mt-0.5">{agreement.propertyAddress}</div>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716c] block mb-1">
                Contractual References
              </span>
              <div className="text-[#b8b0a5]">
                Original Quotation: <span className="font-mono text-[#c5a059] font-bold">{agreement.estimateNumber}</span>
              </div>
              <div className="text-[#b8b0a5] mt-0.5">
                Contractor: <span className="text-white font-medium">Nailed It Property Solutions LLC</span>
              </div>
            </div>
          </div>

          {/* Scope of Work: Updated Prices & Materials */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#c5a059] flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" />
              <span>Scope of Work, Materials & Final Pricing</span>
            </h3>

            <div className="border border-[#262626] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#181818] text-[#78716c] uppercase text-[10px] font-bold border-b border-[#262626]">
                  <tr>
                    <th className="p-3">Category</th>
                    <th className="p-3">Description & Material Specifications</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {agreement.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#161616]">
                      <td className="p-3 text-[11px] font-mono text-[#b8b0a5] uppercase">
                        {item.type}
                      </td>
                      <td className="p-3 text-[#fdfbf7]">
                        <div className="font-medium">{item.description}</div>
                        {item.varianceNote && (
                          <div className="text-[10px] text-[#c5a059] italic mt-0.5">
                            Note: {item.varianceNote}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono text-[#b8b0a5]">{item.quantity}</td>
                      <td className="p-3 text-right font-mono text-[#b8b0a5]">${Number(item.unitPrice).toFixed(2)}</td>
                      <td className="p-3 text-right font-mono font-bold text-[#fdfbf7]">${Number(item.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scope Variance & Why Explanation Section */}
          <div className="my-6 bg-[#181818] border border-[#2a2a2a] rounded-xl p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#fdfbf7] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
                <span>Scope Variance Analysis (Estimate vs. Final Agreement)</span>
              </h4>
              <div className="font-mono text-xs font-bold text-[#c5a059]">
                Variance: {agreement.varianceAmount >= 0 ? '+' : ''}${agreement.varianceAmount.toFixed(2)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px]">
              <div className="bg-[#121212] p-2.5 rounded-lg border border-[#262626]">
                <div className="text-[#78716c] uppercase text-[9px] font-bold">Original Estimate</div>
                <div className="font-mono font-bold text-[#b8b0a5] mt-0.5">
                  ${agreement.originalEstimateTotal.toFixed(2)}
                </div>
              </div>

              <div className="bg-[#121212] p-2.5 rounded-lg border border-[#262626]">
                <div className="text-[#78716c] uppercase text-[9px] font-bold">Updated Agreement Total</div>
                <div className="font-mono font-bold text-[#fdfbf7] mt-0.5">
                  ${agreement.updatedTotal.toFixed(2)}
                </div>
              </div>

              <div className="bg-[#121212] p-2.5 rounded-lg border border-[#262626]">
                <div className="text-[#78716c] uppercase text-[9px] font-bold">Scope Delta</div>
                <div className={`font-mono font-bold mt-0.5 ${
                  agreement.varianceAmount > 0 ? 'text-[#c5a059]' : agreement.varianceAmount < 0 ? 'text-blue-400' : 'text-zinc-400'
                }`}>
                  {agreement.varianceAmount >= 0 ? '+' : ''}${agreement.varianceAmount.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-[#b8b0a5] border-t border-[#262626]">
              <span className="font-bold text-[#fdfbf7]">Justification / Reason for Variance: </span>
              <span className="italic">{agreement.varianceReason}</span>
            </div>
          </div>

          {/* Financial Breakdown & Deposit Credited */}
          <div className="my-6 bg-[#161616] p-5 rounded-xl border border-[#222222] space-y-2 text-xs">
            <div className="flex justify-between text-[#b8b0a5]">
              <span>Updated Total Scope:</span>
              <span className="font-mono font-bold text-[#fdfbf7]">${agreement.updatedTotal.toFixed(2)}</span>
            </div>
            {agreement.depositPaid > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Deposits / Advance Prepayments Received:</span>
                <span className="font-mono">-${agreement.depositPaid.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-[#262626] text-sm font-bold text-white">
              <span>Final Balance Due upon Completion:</span>
              <span className="font-mono text-base text-[#c5a059] font-black">${agreement.balanceDue.toFixed(2)}</span>
            </div>
          </div>

          {/* Contractual Terms */}
          <div className="my-6 space-y-2 text-[10px] text-[#78716c] leading-relaxed border-t border-[#222222] pt-4">
            <div className="font-bold uppercase tracking-wider text-[#b8b0a5]">Standard Contract Terms:</div>
            <pre className="font-sans whitespace-pre-wrap">{agreement.terms}</pre>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-[#222222]">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716c] mb-2">
                Authorized Contractor Representative
              </div>
              <div className="h-10 border-b border-[#444] flex items-end pb-1 font-serif text-sm text-[#fdfbf7] italic">
                {agreement.contractorSignedBy}
              </div>
              <div className="text-[10px] text-[#78716c] mt-1 font-mono">
                Date Signed: {new Date(agreement.contractorSignedAt).toLocaleDateString()}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716c] mb-2">
                Client / Authorized Property Representative
              </div>
              <div className="h-10 border-b border-[#444] flex items-end pb-1 font-serif text-sm text-[#fdfbf7] italic">
                {agreement.clientSignatureName || agreement.clientName}
              </div>
              <div className="text-[10px] text-[#78716c] mt-1 font-mono">
                Date: {agreement.clientSignedAt ? new Date(agreement.clientSignedAt).toLocaleDateString() : new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
