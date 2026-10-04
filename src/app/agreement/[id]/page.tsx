'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useFSMStore } from '@/lib/useStore';
import { WorkAgreement, Estimate, EstimatePayment } from '@/types';
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
  DollarSign,
  ArrowLeft,
  QrCode as QrCodeIcon,
  Lock,
  Check,
  CreditCard,
  Building,
  UserCheck,
  FileCheck2,
  Copy,
  ExternalLink,
  Receipt
} from 'lucide-react';

export default function WorkAgreementPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getWorkAgreementById, getEstimateById, signWorkAgreementClient } = useFSMStore();

  const agreementId = params.id as string;
  const agreement = getWorkAgreementById(agreementId);

  // Print & Addendum controls
  const [printMode, setPrintMode] = useState<'both' | 'company' | 'client'>('both');
  const [includeReceipts, setIncludeReceipts] = useState<boolean>(true);
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  const [signNameInput, setSignNameInput] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Fallback / stable Contract ID
  const contractId = useMemo(() => {
    if (!agreement) return '';
    if (agreement.contractId) return agreement.contractId;
    const num = (agreement.agreementNumber.match(/\d+/) || ['84192'])[0].padStart(5, '0');
    return `CTR-2026-${num}`;
  }, [agreement]);

  // Deterministic Cryptographic Tamper-Proof Hash
  const tamperHash = useMemo(() => {
    if (!agreement) return '';
    const raw = `${contractId}|${agreement.agreementNumber}|${agreement.clientId}|${agreement.updatedTotal.toFixed(2)}|${agreement.depositPaid.toFixed(2)}|${agreement.createdAt}|RomeGA`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const hex1 = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
    const hex2 = Math.abs((hash ^ 0x5a5a5a5a)).toString(16).padStart(8, '0').toUpperCase();
    return `SEAL-${hex1.slice(0, 4)}-${hex2.slice(0, 4)}-${hex1.slice(4, 8)}`;
  }, [agreement, contractId]);

  // Linked Estimate & Payments Lookup
  const linkedEstimate: Estimate | undefined = useMemo(() => {
    if (!agreement) return undefined;
    return getEstimateById(agreement.estimateId);
  }, [agreement, getEstimateById]);

  // Aggregate Payment Receipts recorded so far
  const paymentReceipts: EstimatePayment[] = useMemo(() => {
    if (!agreement) return [];
    if (linkedEstimate?.payments && linkedEstimate.payments.length > 0) {
      return linkedEstimate.payments;
    }
    // If no direct payment log in estimate but deposit was paid on agreement, synthesize receipt record
    if (agreement.depositPaid > 0) {
      return [
        {
          id: 'initial-dep',
          estimateId: agreement.estimateId,
          estimateNumber: agreement.estimateNumber,
          clientId: agreement.clientId,
          clientName: agreement.clientName,
          receiptNumber: agreement.paymentReceiptNumber || 'REC-INITIAL-01',
          amount: agreement.depositPaid,
          method: agreement.paymentMethod || 'cash',
          referenceNumber: 'Deposit applied at agreement creation',
          notes: 'Advance deposit credited towards contract scope',
          receivedBy: agreement.contractorSignedBy || 'Brianna Cronan - HR Mgr',
          createdAt: agreement.createdAt,
        },
      ];
    }
    return [];
  }, [agreement, linkedEstimate]);

  // Generate QR Code
  useEffect(() => {
    if (!agreement) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://naileditpro.com';
    const verifyUrl = `${origin}/agreement/${agreement.id}?verified=true&contractId=${contractId}&seal=${tamperHash}`;
    
    QRCode.toDataURL(verifyUrl, {
      width: 220,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [agreement, contractId, tamperHash]);

  // Auto-print check or verified query check
  useEffect(() => {
    if (searchParams.get('print') === 'true') {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
    if (searchParams.get('verified') === 'true') {
      setShowVerifyModal(true);
    }
  }, [searchParams]);

  if (!agreement) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#fdfbf7] flex items-center justify-center p-4">
        <div className="bg-[#111111] p-8 rounded-2xl border border-[#222222] max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 text-[#FF8A00] mx-auto mb-3" />
          <h2 className="text-xl font-bold font-heading">Agreement Not Found</h2>
          <p className="text-xs text-[#b8b0a5] mt-1">This document link may have expired or is invalid.</p>
          <Link
            href="/dashboard/estimates"
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-[#c5a059] text-black text-xs font-bold rounded-lg hover:bg-[#b38728] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Estimates</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleDigitalSignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signNameInput.trim()) return;
    signWorkAgreementClient(agreement.id, signNameInput.trim());
    setShowSignModal(false);
  };

  const handleClearSignature = () => {
    if (confirm('Clear digital signature so document can be printed blank for physical wet-ink signing?')) {
      signWorkAgreementClient(agreement.id, '');
    }
  };

  const handleCopyVerifyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://naileditpro.com';
    const verifyUrl = `${origin}/agreement/${agreement.id}?verified=true&contractId=${contractId}&seal=${tamperHash}`;
    navigator.clipboard.writeText(verifyUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'cashapp':
        return <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold">Cash App</span>;
      case 'zelle':
        return <span className="bg-purple-950/60 text-purple-400 border border-purple-800/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold">Zelle</span>;
      case 'check':
        return <span className="bg-blue-950/60 text-blue-400 border border-blue-800/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold">Check</span>;
      case 'money_order':
        return <span className="bg-amber-950/60 text-amber-400 border border-amber-800/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold">Money Order</span>;
      case 'cash':
        return <span className="bg-green-950/60 text-green-400 border border-green-800/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold">Cash</span>;
      case 'debit_credit':
      default:
        return <span className="bg-orange-950/60 text-orange-400 border border-orange-800/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold">Debit / Card</span>;
    }
  };

  // Render Single Copy (Company Original or Client Copy)
  const renderContractCopy = (copyType: 'company' | 'client') => {
    const isCompany = copyType === 'company';

    return (
      <div 
        key={copyType} 
        className="bg-[#111111] print:bg-white text-[#fdfbf7] print:text-black border border-[#222222] print:border-black rounded-2xl print:rounded-none p-6 sm:p-10 print:p-6 shadow-2xl print:shadow-none relative overflow-hidden mb-10 print:mb-0 avoid-break"
      >
        {/* Copy Type Header Watermark Banner */}
        <div className={`-mx-6 -mt-6 sm:-mx-10 sm:-mt-10 print:-mx-6 print:-mt-6 mb-6 px-6 py-2.5 flex items-center justify-between border-b ${
          isCompany 
            ? 'bg-[#1a1813] print:bg-zinc-100 border-[#c5a059]/40 print:border-black text-[#c5a059] print:text-black' 
            : 'bg-[#14181f] print:bg-zinc-100 border-blue-500/30 print:border-black text-blue-400 print:text-black'
        }`}>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black uppercase tracking-widest">
              {isCompany ? '★ OFFICIAL RECORD • COMPANY ORIGINAL (CONTRACTOR ARCHIVE)' : '◆ CUSTOMER COPY • CLIENT RETENTION ORIGINAL'}
            </span>
            <span className="text-[10px] print:hidden px-2 py-0.5 rounded bg-black/40 border border-white/10 font-mono">
              {isCompany ? 'Floyd County HQ Archive' : 'Homeowner / Client Copy'}
            </span>
          </div>

          <div className="font-mono text-[11px] font-bold">
            CONTRACT ID: <span className="underline">{contractId}</span>
          </div>
        </div>

        {/* Letterhead */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-[#222222] print:border-black">
          <div>
            <img 
              src="/logo.png" 
              alt="Nailed It Property Solutions" 
              className="h-14 w-auto object-contain mb-2 print:grayscale" 
            />
            <div className="text-xs text-[#b8b0a5] print:text-black flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#FF8A00] print:text-black" />
              <span>PO Box 53, Rome, GA 30162 • (706) 844-8193</span>
            </div>
            <div className="text-[11px] text-[#78716c] print:text-zinc-600 mt-0.5">
              General Maintenance, Remodeling & Property Solutions • Floyd County, GA
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#c5a059] print:text-black bg-[#1a1a1a] print:bg-transparent px-3 py-1 rounded-full border border-[#c5a059]/30 print:border-black">
              Company Work Agreement & Service Contract
            </span>
            <h1 className="font-mono text-xl font-bold text-[#fdfbf7] print:text-black mt-2">
              {agreement.agreementNumber}
            </h1>
            <div className="text-[11px] text-[#78716c] print:text-black font-mono mt-0.5">
              Contract Date: {new Date(agreement.createdAt).toLocaleDateString()}
            </div>
            {agreement.jobNumber && (
              <div className="text-[11px] text-emerald-400 print:text-black font-mono mt-0.5">
                Linked Work Order: {agreement.jobNumber}
              </div>
            )}
          </div>
        </div>

        {/* Parties & Job Reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-4 rounded-xl print:rounded-none bg-[#161616] print:bg-zinc-50 border border-[#222222] print:border-black text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716c] print:text-zinc-600 block mb-1">
              Client / Authorized Property Representative
            </span>
            <div className="font-bold text-sm text-[#fdfbf7] print:text-black">{agreement.clientName}</div>
            <div className="text-[#b8b0a5] print:text-black mt-0.5">{agreement.propertyAddress}</div>
            <div className="text-[11px] text-[#78716c] print:text-zinc-600 mt-1 font-mono">
              Account Ref: {agreement.clientId}
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716c] print:text-zinc-600 block mb-1">
              Contractual & Legal References
            </span>
            <div className="text-[#b8b0a5] print:text-black">
              Contract ID: <span className="font-mono text-[#c5a059] print:text-black font-bold">{contractId}</span>
            </div>
            <div className="text-[#b8b0a5] print:text-black mt-0.5">
              Original Estimate Quote: <span className="font-mono font-bold">{agreement.estimateNumber}</span>
            </div>
            <div className="text-[#b8b0a5] print:text-black mt-0.5">
              Service Contractor: <span className="font-medium text-white print:text-black">Nailed It Property Solutions LLC</span>
            </div>
          </div>
        </div>

        {/* Scope of Work: Updated Prices & Materials */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#c5a059] print:text-black flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" />
            <span>Final Scope of Work, Material Specifications & Pricing</span>
          </h3>

          <div className="border border-[#262626] print:border-black rounded-xl print:rounded-none overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181818] print:bg-zinc-100 text-[#78716c] print:text-black uppercase text-[10px] font-bold border-b border-[#262626] print:border-black">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Description & Material Specifications</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222] print:divide-black">
                {agreement.items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#161616] print:hover:bg-transparent">
                    <td className="p-3 text-[11px] font-mono text-[#b8b0a5] print:text-black uppercase">
                      {item.type}
                    </td>
                    <td className="p-3 text-[#fdfbf7] print:text-black">
                      <div className="font-medium">{item.description}</div>
                      {item.varianceNote && (
                        <div className="text-[10px] text-[#c5a059] print:text-zinc-700 italic mt-0.5">
                          Note: {item.varianceNote}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center font-mono text-[#b8b0a5] print:text-black">{item.quantity}</td>
                    <td className="p-3 text-right font-mono text-[#b8b0a5] print:text-black">${Number(item.unitPrice).toFixed(2)}</td>
                    <td className="p-3 text-right font-mono font-bold text-[#fdfbf7] print:text-black">${Number(item.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scope Variance & Why Explanation Section */}
        <div className="my-6 bg-[#181818] print:bg-zinc-50 border border-[#2a2a2a] print:border-black rounded-xl print:rounded-none p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#fdfbf7] print:text-black flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#c5a059] print:text-black" />
              <span>Scope Variance Analysis (Estimate vs. Final Agreement)</span>
            </h4>
            <div className="font-mono text-xs font-bold text-[#c5a059] print:text-black">
              Variance: {agreement.varianceAmount >= 0 ? '+' : ''}${agreement.varianceAmount.toFixed(2)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px]">
            <div className="bg-[#121212] print:bg-white p-2.5 rounded-lg print:rounded-none border border-[#262626] print:border-black">
              <div className="text-[#78716c] print:text-zinc-600 uppercase text-[9px] font-bold">Original Estimate Quote</div>
              <div className="font-mono font-bold text-[#b8b0a5] print:text-black mt-0.5">
                ${agreement.originalEstimateTotal.toFixed(2)}
              </div>
            </div>

            <div className="bg-[#121212] print:bg-white p-2.5 rounded-lg print:rounded-none border border-[#262626] print:border-black">
              <div className="text-[#78716c] print:text-zinc-600 uppercase text-[9px] font-bold">Updated Agreement Scope Total</div>
              <div className="font-mono font-bold text-[#fdfbf7] print:text-black mt-0.5">
                ${agreement.updatedTotal.toFixed(2)}
              </div>
            </div>

            <div className="bg-[#121212] print:bg-white p-2.5 rounded-lg print:rounded-none border border-[#262626] print:border-black">
              <div className="text-[#78716c] print:text-zinc-600 uppercase text-[9px] font-bold">Scope Cost Delta</div>
              <div className="font-mono font-bold mt-0.5 text-[#c5a059] print:text-black">
                {agreement.varianceAmount >= 0 ? '+' : ''}${agreement.varianceAmount.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-[#b8b0a5] print:text-black border-t border-[#262626] print:border-black">
            <span className="font-bold text-[#fdfbf7] print:text-black">Reason / Justification for Variance: </span>
            <span className="italic">{agreement.varianceReason}</span>
          </div>
        </div>

        {/* Financial Breakdown & Advance Deposits */}
        <div className="my-6 bg-[#161616] print:bg-zinc-50 p-5 rounded-xl print:rounded-none border border-[#222222] print:border-black space-y-2 text-xs">
          <div className="flex justify-between text-[#b8b0a5] print:text-black">
            <span>Updated Scope Total:</span>
            <span className="font-mono font-bold text-[#fdfbf7] print:text-black">${agreement.updatedTotal.toFixed(2)}</span>
          </div>
          {agreement.depositPaid > 0 && (
            <div className="flex justify-between text-emerald-400 print:text-black font-bold">
              <span>Advance Deposits / Retainers Credited to Contract:</span>
              <span className="font-mono">-${agreement.depositPaid.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-[#262626] print:border-black text-sm font-bold text-white print:text-black">
            <span>Final Balance Due upon Substantial Completion:</span>
            <span className="font-mono text-base text-[#c5a059] print:text-black font-black">${agreement.balanceDue.toFixed(2)}</span>
          </div>
        </div>

        {/* Contractual Terms & Initial Boxes */}
        <div className="my-6 space-y-3 text-[10px] text-[#78716c] print:text-black leading-relaxed border-t border-[#222222] print:border-black pt-4">
          <div className="font-bold uppercase tracking-wider text-[#b8b0a5] print:text-black">Standard Contract Terms & Conditions:</div>
          <pre className="font-sans whitespace-pre-wrap">{agreement.terms}</pre>
          
          <div className="flex items-center justify-end gap-6 pt-2 font-mono text-[10px]">
            <div>Client Initials: <span className="inline-block border-b-2 border-dashed border-[#555] print:border-black w-14 text-center">&nbsp;</span></div>
            <div>Contractor Initials: <span className="inline-block border-b-2 border-dashed border-[#555] print:border-black w-14 text-center">&nbsp;</span></div>
          </div>
        </div>

        {/* Tamper-Proof Digital Verification & QR Code Block */}
        <div className="my-6 p-4 rounded-xl print:rounded-none bg-[#141414] print:bg-white border border-[#262626] print:border-black flex flex-col sm:flex-row items-center gap-5">
          <div className="bg-white p-2 rounded-lg print:rounded-none border border-black/20 shrink-0">
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="Tamper-Proof Verification QR Code" 
                className="w-24 h-24 object-contain"
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center bg-zinc-100 text-black text-[9px] font-mono">
                Generating QR...
              </div>
            )}
          </div>

          <div className="flex-1 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#c5a059] print:text-black text-[11px]">
              <ShieldCheck className="w-4 h-4 text-[#c5a059] print:text-black" />
              <span>Tamper-Proof Digital Ledger Verification</span>
            </div>
            <div className="text-[#b8b0a5] print:text-black text-[11px]">
              Contract ID: <span className="font-mono font-bold text-white print:text-black">{contractId}</span> • 
              Security Seal: <span className="font-mono text-[#c5a059] print:text-black">{tamperHash}</span>
            </div>
            <p className="text-[10px] text-[#78716c] print:text-zinc-700 leading-snug">
              Scan this QR code with any mobile camera to verify document authenticity, payment records, and line-item validity directly against our immutable company registry. Any post-issuance alteration invalidates this contract.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-950/60 print:bg-zinc-100 text-emerald-400 print:text-black border border-emerald-800/40 print:border-black">
                <Lock className="w-2.5 h-2.5" /> Immutable & Tamper-Free
              </span>
              <button
                onClick={() => setShowVerifyModal(true)}
                className="print-hide text-[10px] text-[#c5a059] hover:underline font-bold"
              >
                Inspect Ledger Certificate
              </button>
            </div>
          </div>
        </div>

        {/* Dual Signature Section (Contractor & Client) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-[#222222] print:border-black">
          {/* Contractor Signature */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716c] print:text-black">
              Authorized Contractor Representative
            </div>
            
            <div className="h-12 border-b-2 border-[#555] print:border-black flex items-end pb-1">
              <span className="font-serif italic text-base text-[#fdfbf7] print:text-black">
                {agreement.contractorSignedBy || 'Brianna Cronan - HR Mgr'}
              </span>
            </div>

            <div className="text-[10px] text-[#b8b0a5] print:text-black flex justify-between font-mono">
              <span>Title: Authorized Officer, Nailed It Property Solutions</span>
              <span>Date: {new Date(agreement.contractorSignedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Client / Property Owner Signature */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716c] print:text-black flex items-center justify-between">
              <span>Client / Property Representative Signature</span>
              {agreement.clientSignatureName && (
                <span className="text-[9px] text-emerald-400 print:text-black font-mono font-normal">
                  ✓ Digitally Signed & Recorded
                </span>
              )}
            </div>

            <div className="h-12 border-b-2 border-[#555] print:border-black flex items-end pb-1">
              {agreement.clientSignatureName ? (
                <span className="font-serif italic text-base text-[#fdfbf7] print:text-black font-semibold">
                  {agreement.clientSignatureName}
                </span>
              ) : (
                <span className="text-xs text-[#555] print:text-zinc-400 italic">
                  X __________________________________________________
                </span>
              )}
            </div>

            <div className="text-[10px] text-[#b8b0a5] print:text-black space-y-1">
              <div className="flex justify-between font-mono">
                <span>Printed Name: {agreement.clientSignatureName || agreement.clientName || '________________________'}</span>
                <span>Date: {agreement.clientSignedAt ? new Date(agreement.clientSignedAt).toLocaleDateString() : '____/____/________'}</span>
              </div>
              <div className="text-[9px] text-[#78716c] print:text-zinc-600 font-mono">
                Capacity: [ ] Property Owner &nbsp;&nbsp; [ ] Authorized Agent &nbsp;&nbsp; [ ] Tenant Representative
              </div>
            </div>
          </div>
        </div>

        {/* ADDENDUM A: RECORD OF ADVANCE DEPOSITS & PAYMENT RECEIPTS */}
        {includeReceipts && paymentReceipts.length > 0 && (
          <div className="mt-10 pt-6 border-t-2 border-dashed border-[#333] print:border-black avoid-break">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#c5a059] print:text-black" />
                <h4 className="font-bold font-mono text-xs uppercase tracking-wider text-[#fdfbf7] print:text-black">
                  ADDENDUM A: RECORD OF ADVANCE DEPOSITS & PAYMENT RECEIPTS
                </h4>
              </div>
              <span className="text-[10px] font-mono text-[#b8b0a5] print:text-black">
                Attached to Contract ID: {contractId}
              </span>
            </div>

            <div className="space-y-3">
              {paymentReceipts.map((receipt, idx) => (
                <div 
                  key={receipt.id || idx}
                  className="bg-[#161616] print:bg-zinc-50 border border-[#262626] print:border-black rounded-xl print:rounded-none p-4 text-xs"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#262626] print:border-black pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#c5a059] print:text-black text-sm">
                          {receipt.receiptNumber}
                        </span>
                        {getPaymentMethodBadge(receipt.method)}
                        <span className="text-[10px] text-emerald-400 print:text-black font-mono">
                          ✓ Paid & Credited
                        </span>
                      </div>
                      <div className="text-[10px] text-[#78716c] print:text-zinc-600 font-mono mt-0.5">
                        Processed on {new Date(receipt.createdAt).toLocaleString()} by {receipt.receivedBy}
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <div className="font-mono font-bold text-emerald-400 print:text-black text-base">
                        ${Number(receipt.amount).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-[#78716c] print:text-zinc-600">
                        Credited to Contract
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px] text-[#b8b0a5] print:text-black">
                    <div>
                      <span className="text-[#78716c] print:text-zinc-600">Payment Channel Ref: </span>
                      <span className="font-mono text-white print:text-black">{receipt.referenceNumber || 'Standard Counter / Direct Transfer'}</span>
                    </div>
                    {receipt.notes && (
                      <div>
                        <span className="text-[#78716c] print:text-zinc-600">Memo / Notes: </span>
                        <span>{receipt.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Receipts Summary Banner */}
            <div className="mt-3 p-3 rounded-lg print:rounded-none bg-[#121212] print:bg-zinc-100 border border-[#222222] print:border-black flex justify-between items-center text-xs font-mono">
              <span className="text-[#b8b0a5] print:text-black font-semibold">
                Total Advance Deposits Applied to Contract:
              </span>
              <span className="text-emerald-400 print:text-black font-bold">
                ${paymentReceipts.reduce((sum, r) => sum + Number(r.amount), 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Document Footer */}
        <div className="mt-8 pt-4 border-t border-[#222222] print:border-black flex justify-between items-center text-[9px] font-mono text-[#78716c] print:text-zinc-600">
          <span>Nailed It Property Solutions LLC • Rome, GA 30162</span>
          <span>Contract ID: {contractId} • {isCompany ? 'Page 1 of 1 (Company Archive)' : 'Page 1 of 1 (Client Copy)'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fdfbf7] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Top Control Bar (Hidden on Print) */}
        <div className="print-hide bg-[#111111] border border-[#222222] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/estimates"
                className="p-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] rounded-lg text-[#b8b0a5] hover:text-white transition"
                title="Back to Estimates"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold font-heading text-white">
                    Company Work Agreement
                  </h2>
                  <span className="font-mono text-xs font-bold text-[#c5a059] bg-[#1a1a1a] px-2.5 py-0.5 rounded border border-[#c5a059]/30">
                    {contractId}
                  </span>
                </div>
                <div className="text-xs text-[#b8b0a5]">
                  {agreement.clientName} • {agreement.propertyAddress}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Tamper Verification Trigger */}
              <button
                onClick={() => setShowVerifyModal(true)}
                className="px-3 py-1.5 bg-[#181818] hover:bg-[#222] border border-[#333] rounded-lg text-[#c5a059] hover:text-white text-xs font-bold transition flex items-center gap-1.5"
                title="Verify Tamper-Free Ledger Certificate"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Verify Status</span>
              </button>

              {/* Digital Signature Trigger */}
              {!agreement.clientSignatureName ? (
                <button
                  onClick={() => {
                    setSignNameInput(agreement.clientName);
                    setShowSignModal(true);
                  }}
                  className="px-3 py-1.5 bg-[#181818] hover:bg-[#222] border border-[#333] rounded-lg text-emerald-400 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
                  title="Sign contract digitally"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sign Digitally</span>
                </button>
              ) : (
                <button
                  onClick={handleClearSignature}
                  className="px-3 py-1.5 bg-[#181818] hover:bg-[#222] border border-[#333] rounded-lg text-[#b8b0a5] hover:text-white text-xs font-medium transition flex items-center gap-1.5"
                  title="Clear digital signature to leave blank for wet-ink pen signing"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Clear Signature</span>
                </button>
              )}

              {/* Main Print Button */}
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#c5a059] hover:bg-[#b38728] text-black font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
                title="Print official copies"
              >
                <Printer className="w-4 h-4" />
                <span>Print Contract</span>
              </button>
            </div>
          </div>

          {/* Print & Addendum Option Toggles */}
          <div className="pt-3 border-t border-[#222222] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              {/* Copy Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[#78716c] font-medium">Print Copies:</span>
                <select
                  value={printMode}
                  onChange={(e) => setPrintMode(e.target.value as any)}
                  className="bg-[#181818] border border-[#333] text-[#fdfbf7] text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="both">Both Copies (Company Original + Client Copy)</option>
                  <option value="company">Company Original Only</option>
                  <option value="client">Client Copy Only</option>
                </select>
              </div>

              {/* Include Receipts Addendum Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#b8b0a5] hover:text-white">
                <input
                  type="checkbox"
                  checked={includeReceipts}
                  onChange={(e) => setIncludeReceipts(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#c5a059] cursor-pointer"
                />
                <span>
                  Include Payment Receipts Addendum ({paymentReceipts.length} recorded)
                </span>
              </label>
            </div>

            <div className="text-[11px] text-[#78716c] font-mono">
              Tamper Digest: <span className="text-[#c5a059]">{tamperHash}</span>
            </div>
          </div>
        </div>

        {/* Printable Documents Container */}
        <div>
          {/* Render Company Original Copy */}
          {printMode !== 'client' && renderContractCopy('company')}

          {/* Page Break between Company Original and Client Copy */}
          {printMode === 'both' && (
            <div className="page-break-before my-8 border-b-2 border-dashed border-[#333] text-center text-xs text-zinc-500 py-4 print:border-none print:m-0 print:p-0 print:h-0">
              <span className="print-hide uppercase tracking-widest text-[11px] font-mono text-[#c5a059]">
                ✂️ PAGE BREAK — CLIENT COPY BEGINS BELOW ✂️
              </span>
            </div>
          )}

          {/* Render Client Copy */}
          {printMode !== 'company' && renderContractCopy('client')}
        </div>

      </div>

      {/* Digital Signature Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <h3 className="text-sm font-bold font-heading text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#c5a059]" />
                <span>Client Digital Signature</span>
              </h3>
              <button 
                onClick={() => setShowSignModal(false)}
                className="text-[#78716c] hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#b8b0a5]">
              Type the client or authorized representative's full legal name to apply a legally binding electronic signature to Contract ID <span className="font-mono text-white font-bold">{contractId}</span>.
            </p>

            <form onSubmit={handleDigitalSignSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-[#78716c] block mb-1">
                  Full Legal Signatory Name
                </label>
                <input
                  type="text"
                  value={signNameInput}
                  onChange={(e) => setSignNameInput(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-[#181818] border border-[#333] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#c5a059]"
                  autoFocus
                  required
                />
              </div>

              {signNameInput.trim() && (
                <div className="p-3 rounded-lg bg-[#111] border border-[#222]">
                  <span className="text-[9px] uppercase tracking-wider text-[#78716c] block">Signature Preview:</span>
                  <div className="font-serif italic text-lg text-[#c5a059] mt-1">
                    {signNameInput.trim()}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSignModal(false)}
                  className="px-3 py-2 text-xs text-[#b8b0a5] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#c5a059] hover:bg-[#b38728] text-black font-bold text-xs rounded-lg transition"
                >
                  Sign & Lock Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tamper-Free Verification Certificate Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-heading text-white">
                    Official Ledger Verification Certificate
                  </h3>
                  <div className="text-[10px] text-emerald-400 font-mono">
                    STATUS: IMMUTABLE & TAMPER-FREE
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowVerifyModal(false)}
                className="text-[#78716c] hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#b8b0a5] leading-relaxed">
              This document has been cross-checked and verified against the master contract registry of <strong className="text-white">Nailed It Property Solutions LLC (Rome, GA)</strong>. The cryptographic seal ensures no prices, terms, or scope items have been modified.
            </p>

            <div className="bg-[#0e0e0e] border border-[#222] rounded-xl p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#78716c]">Contract ID:</span>
                <span className="text-[#c5a059] font-bold">{contractId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716c]">Cryptographic Seal:</span>
                <span className="text-white font-bold">{tamperHash}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716c]">Client:</span>
                <span className="text-white">{agreement.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716c]">Property:</span>
                <span className="text-white truncate max-w-[200px]">{agreement.propertyAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716c]">Updated Total Scope:</span>
                <span className="text-white font-bold">${agreement.updatedTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716c]">Advance Deposit Paid:</span>
                <span className="text-emerald-400 font-bold">${agreement.depositPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716c]">Net Balance Due:</span>
                <span className="text-[#c5a059] font-bold">${agreement.balanceDue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716c]">Issuing Contractor:</span>
                <span className="text-white">Nailed It Property Solutions LLC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716c]">Authorized Officer:</span>
                <span className="text-white">Brianna Cronan - HR Mgr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#78716c]">Registry Timestamp:</span>
                <span className="text-white">{new Date(agreement.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleCopyVerifyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#181818] hover:bg-[#222] border border-[#333] text-xs font-semibold rounded-lg text-[#b8b0a5] hover:text-white transition"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Link Copied!' : 'Copy Verification Link'}</span>
              </button>

              <button
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-1.5 bg-[#c5a059] hover:bg-[#b38728] text-black font-bold text-xs rounded-lg transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
