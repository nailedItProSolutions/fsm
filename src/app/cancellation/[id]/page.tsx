'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFSMStore } from '@/lib/useStore';
import { useAuth } from '@/lib/authContext';
import {
  CancellationClientAcknowledgments,
  PaymentMethod,
} from '@/types';
import { CANCELLATION_STAGE_LABELS } from '@/lib/georgiaCancellationLaw';
import {
  Printer,
  MapPin,
  Phone,
  CheckCircle2,
  Gavel,
  Scale,
  DollarSign,
  ArrowLeft,
  Lock,
  Check,
  CreditCard,
  FileCheck2,
  Copy,
  Trash2,
  Receipt,
  FileText,
} from 'lucide-react';
import { DeleteWithPinModal } from '@/components/common/DeleteWithPinModal';

export default function ContractCancellationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'dispatcher';

  const {
    getContractCancellationById,
    signContractCancellationClient,
    recordCancellationSettlementPayment,
    deleteContractCancellation,
    getAuditLogs,
  } = useFSMStore();

  const cancellationId = params.id as string;
  const cancellation = getContractCancellationById(cancellationId);

  // Default to 'client' (Single Copy) so printing doesn't duplicate pages unless 'both' is chosen
  const [printMode, setPrintMode] = useState<'client' | 'company' | 'both'>('client');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // Client signature & 4 mandatory Georgia statutory acknowledgments
  const [signNameInput, setSignNameInput] = useState<string>('');
  const [acks, setAcks] = useState<CancellationClientAcknowledgments>({
    asIsAndWarrantyVoidAccepted: false,
    quantumMeruitAndLienRightsAccepted: false,
    noChargebackAndMutualReleaseAccepted: false,
    floydCountyGeorgiaVenueAccepted: false,
  });

  // Payment modal state
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('debit_credit');
  const [payRef, setPayRef] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');

  useEffect(() => {
    if (cancellation) {
      setSignNameInput(cancellation.clientSignatureName || cancellation.clientName || '');
      setPayAmount(Number(cancellation.settlementBalanceDue || 0));
      if (cancellation.acknowledgments) {
        setAcks(cancellation.acknowledgments);
      }
    }
  }, [cancellation]);

  useEffect(() => {
    if (searchParams.get('verify') === 'true') {
      setShowVerifyModal(true);
    }
  }, [searchParams]);

  const documentAuditLogs = useMemo(() => {
    if (!cancellation) return [];
    const all = getAuditLogs();
    return all.filter(
      (log) =>
        log.entityId === cancellation.estimateId ||
        log.entityId === cancellation.id ||
        (log.summary && log.summary.includes(cancellation.cancellationNumber))
    );
  }, [cancellation, getAuditLogs]);

  if (!cancellation) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
          <FileText className="w-12 h-12 text-amber-400 mx-auto" />
          <h1 className="text-xl font-black">Cancellation Agreement Not Found</h1>
          <p className="text-xs text-slate-400">
            The requested Service Contract Cancellation & Stop-Work Agreement ({cancellationId}) could not be located.
          </p>
          <Link
            href="/dashboard/estimates"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Estimates & Contracts
          </Link>
        </div>
      </div>
    );
  }

  const allAcksChecked =
    acks.asIsAndWarrantyVoidAccepted &&
    acks.quantumMeruitAndLienRightsAccepted &&
    acks.noChargebackAndMutualReleaseAccepted &&
    acks.floydCountyGeorgiaVenueAccepted;

  const handleCopyShareLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(`${window.location.origin}/cancellation/${cancellation.id}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleClientSignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signNameInput.trim() || !allAcksChecked) return;
    signContractCancellationClient(cancellation.id, signNameInput.trim(), acks);
    setShowSignModal(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;
    recordCancellationSettlementPayment(cancellation.id, {
      amount: payAmount,
      method: payMethod,
      referenceNumber: payRef.trim() || `CNC-SETTLE-${Date.now().toString().slice(-4)}`,
      notes: payNotes.trim() || `Settlement payment on ${cancellation.cancellationNumber}`,
      receivedBy: user?.displayName || 'Charles Willis - Owner & Field Specialist',
    });
    setShowPaymentModal(false);
  };

  const renderContractCopy = (copyLabel: 'CLIENT / PROPERTY OWNER COPY' | 'COMPANY RECORD COPY') => {
    const isSettled =
      cancellation.status === 'settled_released' ||
      (Boolean(cancellation.clientSignatureName) && cancellation.settlementBalanceDue <= 0.01);

    const cleanStatutoryNumbers = (str: string) =>
      str
        .replace(/\s*\(O\.C\.G\.A\.\s*§[^)]*\)/gi, '')
        .replace(/,?\s*O\.C\.G\.A\.\s*§\s*[\d.-]+(?:\s*(?:et\s*seq\.|&\s*§\s*[\d.-]+|and\s*§\s*[\d.-]+))*/gi, '')
        .replace(/O\.C\.G\.A\.\s*§\s*[\d.-]+(?:\s*(?:et\s*seq\.|&\s*§\s*[\d.-]+|and\s*§\s*[\d.-]+))*\s*-?\s*/gi, '');

    const paragraphs = cancellation.terms
      .split(/\n\s*\n/)
      .map((p) => cleanStatutoryNumbers(p.trim()))
      .filter(Boolean);

    return (
      <div className="bg-white text-neutral-900 rounded-xl shadow-xl border border-neutral-300 print:shadow-none print:rounded-none print:border-neutral-800 mb-6 print:mb-0">
        {/* Clean Light Executive Legal Header (No dark fill, no red coloring, no QR code) */}
        <div className="px-5 py-2 border-b-2 border-neutral-900 flex flex-wrap items-center justify-between gap-2 bg-neutral-50 print:bg-white">
          <div className="flex items-center gap-2 text-[10px] print:text-[7.5pt] font-bold tracking-wider uppercase text-neutral-800">
            <Scale className="w-3.5 h-3.5 text-neutral-800 print:hidden" />
            <span>
              STATE OF GEORGIA • COUNTY OF FLOYD • CITY OF ROME • BINDING STOP-WORK & CANCELLATION INSTRUMENT
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] print:text-[7.5pt]">
            <span className="px-2 py-0.5 border border-neutral-700 text-neutral-900 font-bold tracking-wider uppercase">
              {copyLabel}
            </span>
            <span className="font-mono font-bold text-neutral-900">
              {cancellation.cancellationNumber}
            </span>
          </div>
        </div>

        <div className="p-5 print:p-3 space-y-3 print:space-y-2">
          {/* Header Row: Company Brand + Compact Document Registry Block */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 pb-2.5 border-b border-neutral-300">
            <div>
              <div className="text-[10px] print:text-[7.5pt] font-extrabold uppercase tracking-widest text-neutral-600">
                Service Contract Cancellation, Stop-Work Settlement & Mutual Liability Release
              </div>
              <h1 className="text-lg print:text-sm font-black tracking-tight text-neutral-950 uppercase mt-0.5">
                NAILED IT PROPERTY SOLUTIONS
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10.5px] print:text-[7.5pt] text-neutral-700 mt-0.5">
                <span className="flex items-center gap-1 font-semibold">
                  <MapPin className="w-3 h-3 text-neutral-700 print:hidden" /> Rome, GA
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold">
                  <Phone className="w-3 h-3 text-neutral-700 print:hidden" /> (706)237-8184
                </span>
                <span>•</span>
                <span className="font-semibold text-neutral-800">
                  Representative for Nailed It Property Solutions: Charles Willis
                </span>
              </div>
            </div>

            <div className="border border-neutral-300 bg-neutral-50 print:bg-white rounded px-3 py-1.5 text-[10px] print:text-[7pt] space-y-0.5 shrink-0 sm:text-right">
              <div className="font-bold text-neutral-900 uppercase tracking-wider">
                Instrument & Registry Metadata
              </div>
              <div className="font-mono text-neutral-800">
                Seal ID: <strong>{cancellation.sealCode}</strong>
              </div>
              <div className="text-neutral-700">
                Effective Stop-Work Date: <strong>{cancellation.stopWorkDate}</strong>
              </div>
              <div className="text-neutral-800">
                Status:{' '}
                <strong className="uppercase">
                  {isSettled
                    ? '✓ Executed & Settled in Full'
                    : cancellation.clientSignatureName
                    ? 'Executed • Settlement Balance Due'
                    : 'Pending Client Execution'}
                </strong>
              </div>
            </div>
          </div>

          {/* Parties, Contract References & Statutory Lien Notice Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-neutral-50 print:bg-white p-2.5 print:p-1.5 rounded border border-neutral-300 text-[10.5px] print:text-[7.5pt] leading-tight">
            <div>
              <div className="text-[9px] print:text-[6.5pt] font-bold uppercase tracking-wider text-neutral-500">
                Cancelling Client / Property Owner
              </div>
              <div className="font-bold text-neutral-950 mt-0.5">{cancellation.clientName}</div>
              <div className="text-neutral-700">{cancellation.propertyAddress}</div>
              <div className="text-neutral-600 mt-0.5">
                Initiated By: <strong className="uppercase text-neutral-900">{cancellation.initiatedBy}</strong>
              </div>
            </div>

            <div>
              <div className="text-[9px] print:text-[6.5pt] font-bold uppercase tracking-wider text-neutral-500">
                Terminated Contract Instruments
              </div>
              <div className="font-mono font-bold text-neutral-950 mt-0.5">
                Est: {cancellation.estimateNumber}
                {cancellation.agreementNumber ? ` • Agr: ${cancellation.agreementNumber}` : ''}
              </div>
              {cancellation.contractId && (
                <div className="font-mono text-neutral-700">
                  Contract ID: {cancellation.contractId}
                </div>
              )}
              {cancellation.jobNumber && (
                <div className="font-mono text-neutral-700">
                  Halted Work Order: {cancellation.jobNumber}
                </div>
              )}
              <div className="font-semibold text-neutral-800 mt-0.5">
                Stage: {CANCELLATION_STAGE_LABELS[cancellation.stage]} ({cancellation.completionPercentage}% Complete)
              </div>
            </div>

            <div>
              <div className="text-[9px] print:text-[6.5pt] font-bold uppercase tracking-wider text-neutral-500">
                Floyd County Lien Preservation
              </div>
              <div className="font-bold text-neutral-950 mt-0.5">
                Georgia Mechanics&apos; & Materialmen&apos;s Lien Law
              </div>
              <div className="text-neutral-700">
                90-Day Lien Deadline: <strong>{cancellation.lienRightsExpiresAt}</strong>
              </div>
              <div className="text-neutral-800 mt-0.5">
                Lien Rights:{' '}
                <strong>
                  {cancellation.settlementBalanceDue > 0.01
                    ? `RESERVED UNTIL $${cancellation.settlementBalanceDue.toFixed(2)} PAID`
                    : 'SATISFIED UPON CLEARED FUNDS'}
                </strong>
              </div>
            </div>
          </div>

          {/* Mid-Job "As-Is" Demarcation, Exposed Ceiling, T&G Storage & Complete Warranty Void Box */}
          <div className="p-2.5 print:p-2 rounded border border-neutral-800 bg-neutral-50/70 print:bg-white space-y-1.5 text-[10px] print:text-[7pt] leading-snug">
            <div className="flex flex-wrap items-center justify-between gap-1 border-b border-neutral-300 pb-1">
              <div className="font-black text-neutral-950 uppercase tracking-wider">
                NOTICE: MID-JOB &ldquo;AS-IS&rdquo; DEMARCATION, MATERIAL STORAGE RISK & COMPLETE VOIDING OF WARRANTIES
              </div>
              <span className="font-mono font-bold text-[9px] print:text-[6.5pt] uppercase text-neutral-700">
                Georgia Law Compliant
              </span>
            </div>

            <p className="text-neutral-800">
              Because operations at <strong>{cancellation.propertyAddress}</strong> are being terminated prior to
              100% completion, final inspection, and system commissioning (halted at{' '}
              <strong>{cancellation.completionPercentage}%</strong> completion; Reason:{' '}
              <em>&ldquo;{cancellation.cancellationReason}&rdquo;</em>), Client accepts the premises, partial installations,
              exposed ceilings/structures, and staged materials strictly <strong>&ldquo;AS-IS, WHERE-IS, AND WITH ALL FAULTS.&rdquo;</strong>{' '}
              All express or implied workmanship, structural, waterproofing, plumbing, electrical, HVAC, or material warranties from{' '}
              <strong>Nailed It Property Solutions</strong> are immediately <strong>NULL AND VOID</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
              <div className="p-1.5 rounded bg-white border border-neutral-300">
                <span className="font-bold text-neutral-950 uppercase block text-[9px] print:text-[6.5pt]">
                  Work Performed Prior to Stop-Work (Quantum Meruit Basis):
                </span>
                <span className="text-neutral-800">{cancellation.workPerformedSummary}</span>
              </div>
              <div className="p-1.5 rounded bg-white border border-neutral-300">
                <span className="font-bold text-neutral-950 uppercase block text-[9px] print:text-[6.5pt]">
                  Unfinished Work & Material Storage Risk Disclosure:
                </span>
                <span className="text-neutral-800">{cancellation.unfinishedWorkRisks}</span>
              </div>
            </div>

            {cancellation.exposedSystemsList && cancellation.exposedSystemsList.length > 0 && (
              <div className="pt-0.5">
                <div className="font-bold text-neutral-950 uppercase text-[9px] print:text-[6.5pt] mb-0.5">
                  Client Explicitly Assumes 100% of Risk & Responsibility For:
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-neutral-900 list-disc list-inside">
                  {cancellation.exposedSystemsList.map((sys, idx) => (
                    <li key={idx} className="font-medium">
                      {sys}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Schedule A: Itemized Quantum Meruit & Liquidated Stop-Work Settlement Table */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] print:text-[7.5pt]">
              <h2 className="font-black uppercase tracking-wider text-neutral-900">
                Schedule A — Itemized Quantum Meruit & Liquidated Stop-Work Settlement
              </h2>
              <span className="text-neutral-700">
                Original Contract Total: <strong>${cancellation.originalContractTotal.toFixed(2)}</strong>
              </span>
            </div>

            <div className="border border-neutral-400 print:border-neutral-800 rounded overflow-hidden">
              <table className="w-full text-left border-collapse text-[10px] print:text-[7pt] leading-tight">
                <thead>
                  <tr className="bg-neutral-100 border-b border-neutral-400 print:border-neutral-800 font-bold uppercase text-neutral-800">
                    <th className="py-1 px-2">Category</th>
                    <th className="py-1 px-2">Settlement Item & Legal Basis</th>
                    <th className="py-1 px-2 text-right">Qty</th>
                    <th className="py-1 px-2 text-right">Rate</th>
                    <th className="py-1 px-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {cancellation.items.map((item) => {
                    const cleanedDetails = item.details ? cleanStatutoryNumbers(item.details) : '';
                    return (
                      <tr key={item.id}>
                        <td className="py-1 px-2 font-semibold uppercase text-neutral-700 whitespace-nowrap">
                          {item.category.replace(/_/g, ' ')}
                        </td>
                        <td className="py-1 px-2">
                          <span className="font-bold text-neutral-950">{item.description}</span>
                          {cleanedDetails && (
                            <span className="text-neutral-600 ml-1.5">({cleanedDetails})</span>
                          )}
                        </td>
                        <td className="py-1 px-2 text-right font-mono">{item.quantity}</td>
                        <td className="py-1 px-2 text-right font-mono">
                          ${Number(item.unitPrice).toFixed(2)}
                        </td>
                        <td className="py-1 px-2 text-right font-mono font-bold text-neutral-950">
                          ${Number(item.total).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Compact Financial Reconciliation Footer */}
              <div className="bg-neutral-50 print:bg-white border-t border-neutral-400 print:border-neutral-800 px-3 py-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[10px] print:text-[7pt]">
                <div className="text-neutral-700 max-w-md leading-snug">
                  <strong className="text-neutral-950 uppercase">Interest & Collection Notice:</strong>{' '}
                  Under Georgia commercial law, any unpaid Net Settlement
                  Balance accrues commercial interest at <strong>1.5% per month (18% per annum)</strong> plus{' '}
                  <strong>15% statutory attorney&apos;s fees</strong> and Floyd County Superior Court lien filing costs.
                </div>

                <div className="w-full sm:w-72 space-y-0.5 shrink-0">
                  <div className="flex justify-between text-neutral-800">
                    <span>Gross Stop-Work Settlement Charges:</span>
                    <span className="font-mono font-semibold">
                      ${cancellation.totalSettlementCharges.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-800">
                    <span>Less Prior Deposits / Payments Credited:</span>
                    <span className="font-mono font-semibold">
                      -${(cancellation.priorPaymentsCredited + (cancellation.settlementPaidAmount || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-neutral-900 font-black text-[11px] print:text-[8pt] text-neutral-950">
                    <span className="uppercase">Net Settlement Balance Due:</span>
                    <span className="font-mono">
                      ${cancellation.settlementBalanceDue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Article Rome, Floyd County, Georgia Legal Contract Terms — Fine Print 2-Column Layout */}
          <div className="space-y-1">
            <h2 className="text-[10px] print:text-[7.5pt] font-black uppercase tracking-wider text-neutral-900 border-b border-neutral-300 pb-0.5">
              Binding Articles of Cancellation, Stop-Work Protective Covenants & Floyd County, Georgia Law (Fine Print)
            </h2>
            <div className="columns-1 md:columns-2 print:columns-2 gap-4 text-[9px] print:text-[6.4pt] leading-[1.28] print:leading-[1.16] text-neutral-800 font-serif text-justify space-y-1.5 print:space-y-1">
              {paragraphs.map((para, idx) => (
                <p key={idx} className="break-inside-avoid">
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Mandatory 4-Point Client Acknowledgments (Compact 2x2 Grid) */}
          <div className="p-2 print:p-1.5 rounded bg-neutral-50 print:bg-white border border-neutral-400 print:border-neutral-800 space-y-1">
            <div className="text-[9.5px] print:text-[7pt] font-black uppercase tracking-wider text-neutral-950">
              Mandatory Client Acknowledgments (Rome, Floyd County, Georgia)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[9px] print:text-[6.5pt] leading-tight text-neutral-900">
              <div className="flex items-start gap-1.5 bg-white p-1.5 rounded border border-neutral-300">
                <span className="font-black text-neutral-950">
                  {cancellation.acknowledgments?.asIsAndWarrantyVoidAccepted ? '☑' : '☐'}
                </span>
                <span>
                  <strong>1. &ldquo;As-Is&rdquo; Acceptance, Exposed Ceiling/T&G Storage & Warranty Voiding:</strong> Client
                  accepts all halted work, exposed ceilings, and on-site T&G boards/materials strictly &ldquo;AS-IS&rdquo;, assumes
                  all proper storage/acclimation risk, and waives all warranties under Georgia law.
                </span>
              </div>
              <div className="flex items-start gap-1.5 bg-white p-1.5 rounded border border-neutral-300">
                <span className="font-black text-neutral-950">
                  {cancellation.acknowledgments?.quantumMeruitAndLienRightsAccepted ? '☑' : '☐'}
                </span>
                <span>
                  <strong>2. Quantum Meruit & Floyd County Lien Preservation:</strong> Client agrees the itemized charges
                  are fair liquidated values and that Contractor&apos;s Georgia Mechanics&apos; Lien rights
                  remain in full force until paid in full.
                </span>
              </div>
              <div className="flex items-start gap-1.5 bg-white p-1.5 rounded border border-neutral-300">
                <span className="font-black text-neutral-950">
                  {cancellation.acknowledgments?.noChargebackAndMutualReleaseAccepted ? '☑' : '☐'}
                </span>
                <span>
                  <strong>3. Irrevocable Chargeback Waiver & Conditional Release:</strong> Client waives all credit card/ACH
                  chargebacks or stop-payments on prior deposits or settlement payments under Georgia law.
                </span>
              </div>
              <div className="flex items-start gap-1.5 bg-white p-1.5 rounded border border-neutral-300">
                <span className="font-black text-neutral-950">
                  {cancellation.acknowledgments?.floydCountyGeorgiaVenueAccepted ? '☑' : '☐'}
                </span>
                <span>
                  <strong>4. Exclusive Rome, Floyd County, GA Jurisdiction:</strong> Exclusive venue for any dispute or lien
                  foreclosure shall be the Superior or Magistrate Court of Floyd County, Rome, Georgia.
                </span>
              </div>
            </div>
          </div>

          {/* Compact Dual Execution Signature Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-2.5 print:p-1.5 rounded bg-neutral-50 print:bg-white border border-neutral-400 print:border-neutral-800 space-y-1">
              <div className="text-[9px] print:text-[6.5pt] font-black uppercase tracking-wider text-neutral-600">
                Contractor Execution (Nailed It Property Solutions)
              </div>
              <div className="font-serif italic text-base print:text-xs text-neutral-950 border-b border-neutral-400 pb-0.5">
                Charles Willis
              </div>
              <div className="flex justify-between text-[9.5px] print:text-[6.5pt] text-neutral-700">
                <span>Charles Willis — Representative for Nailed It Property Solutions</span>
                <span>Date: {new Date(cancellation.contractorSignedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="p-2.5 print:p-1.5 rounded bg-neutral-50 print:bg-white border border-neutral-400 print:border-neutral-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] print:text-[6.5pt] font-black uppercase tracking-wider text-neutral-600">
                  Client / Property Owner Binding Execution
                </span>
                {!cancellation.clientSignatureName && (
                  <button
                    type="button"
                    onClick={() => setShowSignModal(true)}
                    className="print:hidden px-2.5 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-[10px]"
                  >
                    Sign & Execute Now
                  </button>
                )}
              </div>
              {cancellation.clientSignatureName ? (
                <>
                  <div className="font-serif italic text-base print:text-xs text-neutral-950 border-b border-neutral-400 pb-0.5">
                    {cancellation.clientSignatureName}
                  </div>
                  <div className="flex justify-between text-[9.5px] print:text-[6.5pt] text-neutral-800 font-semibold">
                    <span>✓ Executed by {cancellation.clientName}</span>
                    <span>
                      Date:{' '}
                      {cancellation.clientSignedAt
                        ? new Date(cancellation.clientSignedAt).toLocaleDateString()
                        : ''}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-6 border-b border-dashed border-neutral-500 flex items-end pb-0.5 text-[10px] print:text-[7pt] text-neutral-500 italic">
                    X ____________________________________________________________
                  </div>
                  <div className="flex justify-between text-[9.5px] print:text-[6.5pt] text-neutral-600">
                    <span>Printed Name: {cancellation.clientName}</span>
                    <span>Date: ____/____/2026</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12 print:min-h-0 print:bg-white print:text-neutral-900 print:pb-0">
      <style jsx global>{`
        @media print {
          @page {
            size: letter;
            margin: 0.3in;
          }
          body {
            background: #ffffff !important;
            color: #111111 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Top Action Control Bar (Hidden when printing) */}
      <div className="print:hidden sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/estimates"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Back to Estimates & Contracts"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-white text-sm">
                  {cancellation.cancellationNumber}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-amber-300 border border-slate-700">
                  Rome • Floyd County, GA Cancellation
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {cancellation.clientName} • {cancellation.propertyAddress}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Print Copy Selector */}
            <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs">
              {([
                { id: 'client', label: 'Client Copy (1 Page)' },
                { id: 'company', label: 'Company Copy (1 Page)' },
                { id: 'both', label: 'Both Copies' },
              ] as const).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPrintMode(m.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    printMode === m.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCopyShareLink}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied Link
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" /> Share Link
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowVerifyModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" /> Audit Log
            </button>

            {!cancellation.clientSignatureName && (
              <button
                type="button"
                onClick={() => setShowSignModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg"
              >
                <Gavel className="w-3.5 h-3.5" /> Sign & Execute Agreement
              </button>
            )}

            {cancellation.settlementBalanceDue > 0.01 && (
              <button
                type="button"
                onClick={() => setShowPaymentModal(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg"
              >
                <CreditCard className="w-3.5 h-3.5" /> Pay / Record Settlement ($
                {cancellation.settlementBalanceDue.toFixed(2)})
              </button>
            )}

            {cancellation.invoiceId && (
              <Link
                href={`/pay/${cancellation.invoiceId}`}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5" /> Settlement Invoice
              </Link>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-slate-950 font-bold text-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>

            {isAdmin && (
              <>
                {cancellation.clientSignatureName && (
                  <button
                    type="button"
                    onClick={() => signContractCancellationClient(cancellation.id, '')}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold"
                  >
                    Clear Signature
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700"
                  title="Delete Cancellation Agreement (Requires Employee PIN)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Printable Document Container */}
      <div className="max-w-5xl mx-auto px-4 pt-6 print:max-w-none print:px-0 print:pt-0">
        {(printMode === 'both' || printMode === 'company') &&
          renderContractCopy('COMPANY RECORD COPY')}

        {printMode === 'both' && (
          <div className="print:break-before-page my-6 border-t border-dashed border-slate-700 print:hidden" />
        )}

        {(printMode === 'both' || printMode === 'client') &&
          renderContractCopy('CLIENT / PROPERTY OWNER COPY')}
      </div>

      {/* Modal 1: Client Mandatory 4-Point Georgia Statutory Execution Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Gavel className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">
                  Execute Georgia Service Contract Cancellation & Stop-Work Agreement
                </h3>
              </div>
              <button
                onClick={() => setShowSignModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleClientSignSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200">
                Under the <strong>Georgia Uniform Electronic Transactions Act</strong>,
                please review and check all four (4) mandatory acknowledgments below before entering your binding digital signature.
              </div>

              <div className="space-y-2.5 text-xs">
                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-amber-500/40">
                  <input
                    type="checkbox"
                    checked={acks.asIsAndWarrantyVoidAccepted}
                    onChange={(e) =>
                      setAcks((prev) => ({
                        ...prev,
                        asIsAndWarrantyVoidAccepted: e.target.checked,
                      }))
                    }
                    className="mt-1 accent-amber-500"
                  />
                  <span>
                    <strong className="text-white block">
                      1. Mid-Job &ldquo;As-Is&rdquo; Acceptance, Exposed Ceiling / T&G Storage Risk & Complete Voiding of Warranties
                    </strong>
                    <span className="text-slate-400">
                      I accept the property, exposed ceiling/structures, and all unfinished/partial work strictly &ldquo;AS-IS, WHERE-IS&rdquo;, assume full responsibility for proper climate-controlled flat storage and acclimation of any Tongue & Groove (T&G) boards and materials, and acknowledge that all warranties from Nailed It Property Solutions are immediately null and void.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-amber-500/40">
                  <input
                    type="checkbox"
                    checked={acks.quantumMeruitAndLienRightsAccepted}
                    onChange={(e) =>
                      setAcks((prev) => ({
                        ...prev,
                        quantumMeruitAndLienRightsAccepted: e.target.checked,
                      }))
                    }
                    className="mt-1 accent-amber-500"
                  />
                  <span>
                    <strong className="text-white block">
                      2. Quantum Meruit Valuation & Floyd County Mechanics&apos; Lien Preservation
                    </strong>
                    <span className="text-slate-400">
                      I agree that the Total Settlement Charges (${cancellation.totalSettlementCharges.toFixed(2)}) and Net Balance Due ($
                      {cancellation.settlementBalanceDue.toFixed(2)}) are fair and enforceable, and that Contractor retains full Georgia
                      Mechanics&apos; & Materialmen&apos;s Lien rights in Floyd County Superior Court until paid in full.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-amber-500/40">
                  <input
                    type="checkbox"
                    checked={acks.noChargebackAndMutualReleaseAccepted}
                    onChange={(e) =>
                      setAcks((prev) => ({
                        ...prev,
                        noChargebackAndMutualReleaseAccepted: e.target.checked,
                      }))
                    }
                    className="mt-1 accent-amber-500"
                  />
                  <span>
                    <strong className="text-white block">
                      3. Irrevocable Waiver of Chargebacks / Stop-Payments & Conditional Release
                    </strong>
                    <span className="text-slate-400">
                      I irrevocably waive any right to initiate a credit card chargeback, ACH reversal, or check stop-payment on any prior deposit ($
                      {cancellation.priorPaymentsCredited.toFixed(2)}) or settlement payment.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-amber-500/40">
                  <input
                    type="checkbox"
                    checked={acks.floydCountyGeorgiaVenueAccepted}
                    onChange={(e) =>
                      setAcks((prev) => ({
                        ...prev,
                        floydCountyGeorgiaVenueAccepted: e.target.checked,
                      }))
                    }
                    className="mt-1 accent-amber-500"
                  />
                  <span>
                    <strong className="text-white block">
                      4. Exclusive Governing Law & Venue in Rome, Floyd County, Georgia
                    </strong>
                    <span className="text-slate-400">
                      I consent to the exclusive jurisdiction and venue of the Superior and Magistrate Courts of Floyd County, Rome, Georgia.
                    </span>
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Type Full Legal Name to Execute Binding Electronic Signature:
                </label>
                <input
                  type="text"
                  required
                  value={signNameInput}
                  onChange={(e) => setSignNameInput(e.target.value)}
                  placeholder={cancellation.clientName}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-serif italic text-lg focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSignModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!allAcksChecked || !signNameInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Execute Cancellation Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Record / Pay Settlement Balance */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Settle Cancellation Balance Due
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Settlement Payment Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="debit_credit">Debit / Credit Card</option>
                  <option value="cashapp">Cash App</option>
                  <option value="zelle">Zelle</option>
                  <option value="check">Check</option>
                  <option value="money_order">Money Order</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Reference / Check / Auth Number
                </label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. CHK-8821 or STRIPE-AUTH"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Notes</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="Final stop-work settlement payment..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Apply Settlement Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Cryptographic Seal & Isolated Document Audit Trail */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">
                  Registry Seal & Document Audit Log
                </h3>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Cancellation Instrument:</span>
                <span className="font-mono font-bold text-white">{cancellation.cancellationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Registry Seal ID:</span>
                <span className="font-mono font-bold text-amber-400">{cancellation.sealCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Governing Court Venue:</span>
                <span className="font-semibold text-slate-200">
                  Floyd County Superior Court, Rome, GA
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Immutable Document Activity History ({documentAuditLogs.length})
              </div>
              {documentAuditLogs.length === 0 ? (
                <div className="text-xs text-slate-500 italic p-4 bg-slate-950 rounded-xl">
                  No audit events recorded yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {documentAuditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span className="font-bold text-amber-400">{log.employeeName}</span>
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-200">{log.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Admin PIN-Protected Delete */}
      <DeleteWithPinModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        itemType="cancellation"
        itemName={`${cancellation.cancellationNumber} (${cancellation.clientName})`}
        targetId={cancellation.id}
        onConfirm={(authUser) => {
          deleteContractCancellation(cancellation.id, authUser);
          setShowDeleteModal(false);
          router.push('/dashboard/estimates');
        }}
      />
    </div>
  );
}
