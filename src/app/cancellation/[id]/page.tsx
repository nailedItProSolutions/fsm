'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useFSMStore } from '@/lib/useStore';
import { useAuth } from '@/lib/authContext';
import {
  ContractCancellation,
  CancellationClientAcknowledgments,
  PaymentMethod,
} from '@/types';
import { CANCELLATION_STAGE_LABELS } from '@/lib/georgiaCancellationLaw';
import {
  Printer,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
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
  ExternalLink,
  FileWarning,
  Receipt,
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
    getEstimateById,
    signContractCancellationClient,
    recordCancellationSettlementPayment,
    deleteContractCancellation,
    getAuditLogs,
  } = useFSMStore();

  const cancellationId = params.id as string;
  const cancellation = getContractCancellationById(cancellationId);

  const [printMode, setPrintMode] = useState<'both' | 'company' | 'client'>('both');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
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

  const linkedEstimate = useMemo(() => {
    if (!cancellation) return undefined;
    return getEstimateById(cancellation.estimateId);
  }, [cancellation, getEstimateById]);

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

  useEffect(() => {
    if (!cancellation || typeof window === 'undefined') return;
    const verifyUrl = `${window.location.origin}/cancellation/${cancellation.id}?verify=true`;
    QRCode.toDataURL(verifyUrl, {
      width: 140,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => {});
  }, [cancellation]);

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
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
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

  const renderContractCopy = (copyLabel: 'COMPANY RECORD COPY' | 'CLIENT / PROPERTY OWNER COPY') => {
    const isSettled =
      cancellation.status === 'settled_released' ||
      (Boolean(cancellation.clientSignatureName) && cancellation.settlementBalanceDue <= 0.01);

    return (
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border-2 border-slate-300 overflow-hidden print:shadow-none print:rounded-none print:border-slate-400 mb-10 print:mb-6">
        {/* Top Legal Authority Strip */}
        <div className="bg-slate-900 text-white px-6 py-3 flex flex-wrap items-center justify-between gap-2 border-b-4 border-rose-600">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
            <Gavel className="w-4 h-4 text-rose-400" />
            <span>
              STATE OF GEORGIA • COUNTY OF FLOYD • CITY OF ROME • BINDING STOP-WORK & CANCELLATION INSTRUMENT
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black tracking-widest uppercase">
              {copyLabel}
            </span>
            <span className="font-mono text-xs text-amber-400 font-bold">
              {cancellation.cancellationNumber}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Header Row: Company Brand + QR Cryptographic Seal */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 pb-6 border-b-2 border-slate-200">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-black uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                Service Contract Cancellation, Stop-Work Settlement & Liability Release
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                NAILED IT PROPERTY SOLUTIONS
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                Commercial & Residential Property Maintenance, Repair & Renovation Specialists
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 pt-1">
                <span className="flex items-center gap-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" /> Rome, GA • Floyd County Metro
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-rose-600" /> (706) 844-8193
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  Authorized Officer: Charles Willis (ID #1014958)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-3 shrink-0">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="Cryptographic Verification QR"
                  className="w-20 h-20 rounded border border-slate-300 bg-white p-1"
                />
              )}
              <div className="text-xs space-y-1">
                <div className="font-black text-slate-900 uppercase tracking-wider text-[10px]">
                  Cryptographic Seal & Registry
                </div>
                <div className="font-mono font-bold text-rose-700 text-xs">
                  {cancellation.sealCode}
                </div>
                <div className="text-[11px] text-slate-600">
                  Stop-Work Date: <strong>{cancellation.stopWorkDate}</strong>
                </div>
                <div className="text-[11px]">
                  Status:{' '}
                  {isSettled ? (
                    <span className="font-bold text-emerald-700 uppercase">
                      ✓ Executed & Settled in Full
                    </span>
                  ) : cancellation.clientSignatureName ? (
                    <span className="font-bold text-amber-700 uppercase">
                      Executed • Settlement Balance Due
                    </span>
                  ) : (
                    <span className="font-bold text-rose-700 uppercase">
                      Pending Client Execution
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Parties & Referenced Contract Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Cancelling Client / Property Owner
              </div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{cancellation.clientName}</div>
              <div className="text-slate-600 mt-0.5">{cancellation.propertyAddress}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Initiated By:{' '}
                <strong className="uppercase text-slate-800">{cancellation.initiatedBy}</strong>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Terminated Contract Instruments
              </div>
              <div className="font-mono font-bold text-slate-900 mt-0.5">
                Estimate: {cancellation.estimateNumber}
                {cancellation.agreementNumber ? ` • Agreement: ${cancellation.agreementNumber}` : ''}
              </div>
              {cancellation.contractId && (
                <div className="font-mono text-[11px] text-slate-600">
                  Master Contract ID: {cancellation.contractId}
                </div>
              )}
              {cancellation.jobNumber && (
                <div className="font-mono text-[11px] text-slate-600">
                  Halted Dispatch: {cancellation.jobNumber}
                </div>
              )}
              <div className="text-[11px] text-rose-700 font-semibold mt-0.5">
                Stage: {CANCELLATION_STAGE_LABELS[cancellation.stage]} ({cancellation.completionPercentage}% Complete)
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Floyd County Statutory Lien Protection
              </div>
              <div className="font-bold text-slate-900 mt-0.5">
                O.C.G.A. § 44-14-361 & § 44-14-361.1
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                90-Day Lien Recording Deadline:{' '}
                <strong className="text-rose-700">{cancellation.lienRightsExpiresAt}</strong>
              </div>
              <div className="text-[11px] mt-0.5">
                Lien Status:{' '}
                {cancellation.settlementBalanceDue > 0.01 ? (
                  <span className="font-bold text-rose-700">
                    RESERVED UNTIL ${cancellation.settlementBalanceDue.toFixed(2)} PAID
                  </span>
                ) : (
                  <span className="font-bold text-emerald-700">SATISFIED & WAIVED UPON CLEARED FUNDS</span>
                )}
              </div>
            </div>
          </div>

          {/* Prominent Georgia Statutory Mid-Job "As-Is" & Warranty Void Box */}
          <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-600/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-900 font-black text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                MANDATORY GEORGIA NOTICE: MID-JOB &ldquo;AS-IS&rdquo; DEMARCATION & COMPLETE VOIDING OF WARRANTIES
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-900 uppercase">
                O.C.G.A. § 13-8-2 Compliant
              </span>
            </div>
            <p className="text-xs text-rose-950 leading-relaxed">
              Because operations at <strong>{cancellation.propertyAddress}</strong> are being terminated prior to
              100% completion, final inspection, and system commissioning (halted at{' '}
              <strong>{cancellation.completionPercentage}%</strong> completion for reason:{' '}
              <em>&ldquo;{cancellation.cancellationReason}&rdquo;</em>), Client accepts the premises, partial installations,
              and materials strictly <strong>&ldquo;AS-IS, WHERE-IS, AND WITH ALL FAULTS.&rdquo;</strong> All express or
              implied workmanship, structural, waterproofing, plumbing, electrical, HVAC, or material warranties from{' '}
              <strong>Nailed It Property Solutions</strong> are immediately <strong>NULL AND VOID</strong>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-rose-200">
                <div className="font-bold text-slate-900 text-[11px] uppercase">
                  Documented Work Performed Prior to Stop-Work:
                </div>
                <p className="text-slate-700 text-[11px] mt-0.5">{cancellation.workPerformedSummary}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-rose-200">
                <div className="font-bold text-rose-900 text-[11px] uppercase">
                  Unfinished Work Hazard & Demobilization Notice:
                </div>
                <p className="text-slate-700 text-[11px] mt-0.5">{cancellation.unfinishedWorkRisks}</p>
              </div>
            </div>
            {cancellation.exposedSystemsList && cancellation.exposedSystemsList.length > 0 && (
              <div className="pt-1">
                <div className="text-[11px] font-bold text-rose-900 uppercase mb-1">
                  Specific Unfinished / Exposed Systems Assumed Strictly at Client&apos;s Sole Risk:
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-[11px] text-rose-950 list-disc list-inside">
                  {cancellation.exposedSystemsList.map((sys, idx) => (
                    <li key={idx} className="font-medium">
                      {sys}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Itemized Stop-Work & Quantum Meruit Settlement Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-slate-700" />
                Schedule A: Itemized Quantum Meruit & Liquidated Stop-Work Settlement (O.C.G.A. § 9-2-7 & § 13-6-7)
              </h2>
              <span className="text-xs text-slate-500">
                Original Contract Price: <strong>${cancellation.originalContractTotal.toFixed(2)}</strong>
              </span>
            </div>

            <div className="border border-slate-300 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-black uppercase tracking-wider text-slate-600">
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Settlement Item & Statutory Basis</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Rate / Unit</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {cancellation.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-semibold text-[11px] text-slate-700 uppercase">
                        {item.category.replace(/_/g, ' ')}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{item.description}</div>
                        {item.details && (
                          <div className="text-[11px] text-slate-500 mt-0.5">{item.details}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        ${Number(item.unitPrice).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        ${Number(item.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Reconciliation Footer */}
              <div className="bg-slate-50 border-t border-slate-300 p-4 flex flex-col md:flex-row justify-between gap-4">
                <div className="text-[11px] text-slate-600 max-w-md space-y-1">
                  <div className="font-bold text-slate-800 uppercase">
                    Georgia Statutory Late Interest & Collection Notice:
                  </div>
                  <p>
                    Pursuant to <strong>O.C.G.A. § 7-4-16</strong> and <strong>O.C.G.A. § 13-1-11</strong>, any unpaid
                    Net Cancellation Settlement Balance accrues commercial interest at <strong>1.5% per month (18% per annum)</strong>{' '}
                    plus <strong>15% statutory attorney&apos;s fees</strong> and all Floyd County Superior Court filing and lien recording costs.
                  </p>
                </div>

                <div className="w-full md:w-80 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Settlement Subtotal:</span>
                    <span className="font-mono font-semibold">${cancellation.settlementSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Georgia / Floyd County Tax ({(cancellation.taxRate * 100).toFixed(0)}%):</span>
                    <span className="font-mono font-semibold">${cancellation.settlementTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Stop-Work Settlement Charges:</span>
                    <span className="font-mono">${cancellation.totalSettlementCharges.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Less Prior Deposits / Payments Credited:</span>
                    <span className="font-mono">-${cancellation.priorPaymentsCredited.toFixed(2)}</span>
                  </div>
                  {cancellation.settlementPaidAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Less Settlement Payments Received:</span>
                      <span className="font-mono">-${cancellation.settlementPaidAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t-2 border-slate-900 text-sm font-black">
                    <span className="text-slate-900 uppercase">Net Settlement Balance Due:</span>
                    <span
                      className={`font-mono text-base ${
                        cancellation.settlementBalanceDue > 0.01 ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      ${cancellation.settlementBalanceDue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Article Rome, Floyd County, Georgia Legal Contract Terms */}
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <FileWarning className="w-4 h-4 text-rose-600" />
              Binding Articles of Cancellation, Stop-Work Protective Covenants & Floyd County, Georgia Law
            </h2>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 text-[11px] leading-relaxed text-slate-800 whitespace-pre-wrap font-serif">
              {cancellation.terms}
            </div>
          </div>

          {/* Mandatory 4-Point Client Statutory Acknowledgments */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-slate-900">
              Mandatory Client Statutory Acknowledgments (Rome, Floyd County, Georgia)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-800">
              <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-black text-rose-600">
                  {cancellation.acknowledgments?.asIsAndWarrantyVoidAccepted ? '☑' : '☐'}
                </span>
                <span>
                  <strong>1. &ldquo;As-Is&rdquo; Acceptance & Complete Warranty Voiding:</strong> Client accepts all halted
                  work strictly &ldquo;AS-IS&rdquo; and waives all express or implied warranties and post-stop-work defect or
                  subsequent contractor claims (O.C.G.A. § 13-8-2).
                </span>
              </div>
              <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-black text-rose-600">
                  {cancellation.acknowledgments?.quantumMeruitAndLienRightsAccepted ? '☑' : '☐'}
                </span>
                <span>
                  <strong>2. Quantum Meruit & Floyd County Lien Preservation:</strong> Client agrees the itemized charges
                  are fair liquidated values (O.C.G.A. § 9-2-7 & § 13-6-7) and that Contractor&apos;s Mechanics&apos; Lien rights
                  (O.C.G.A. § 44-14-361) remain in full force until paid in full.
                </span>
              </div>
              <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-black text-rose-600">
                  {cancellation.acknowledgments?.noChargebackAndMutualReleaseAccepted ? '☑' : '☐'}
                </span>
                <span>
                  <strong>3. Irrevocable Chargeback Waiver & Conditional Release:</strong> Client waives all credit card/ACH
                  chargebacks or stop-payments on prior deposits or settlement payments (O.C.G.A. § 13-6-11).
                </span>
              </div>
              <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-black text-rose-600">
                  {cancellation.acknowledgments?.floydCountyGeorgiaVenueAccepted ? '☑' : '☐'}
                </span>
                <span>
                  <strong>4. Exclusive Rome, Floyd County, GA Jurisdiction:</strong> Exclusive venue for any dispute or lien
                  foreclosure shall be the Superior or Magistrate Court of Floyd County, Rome, Georgia.
                </span>
              </div>
            </div>
          </div>

          {/* Dual Execution Signature Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Contractor Execution (Nailed It Property Solutions)
              </div>
              <div className="font-serif italic text-xl text-slate-900 border-b border-slate-300 pb-1">
                {cancellation.contractorSignedBy}
              </div>
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>Authorized Officer: Charles Willis (ID #1014958)</span>
                <span>Signed: {new Date(cancellation.contractorSignedAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Client / Property Owner Binding Execution (O.C.G.A. § 10-12-1)
                </span>
                {!cancellation.clientSignatureName && (
                  <button
                    type="button"
                    onClick={() => setShowSignModal(true)}
                    className="print:hidden px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px]"
                  >
                    Sign & Execute Now
                  </button>
                )}
              </div>
              {cancellation.clientSignatureName ? (
                <>
                  <div className="font-serif italic text-xl text-slate-900 border-b border-slate-300 pb-1">
                    {cancellation.clientSignatureName}
                  </div>
                  <div className="flex justify-between text-[11px] text-emerald-700 font-semibold">
                    <span>✓ Electronically Executed by {cancellation.clientName}</span>
                    <span>
                      {cancellation.clientSignedAt
                        ? new Date(cancellation.clientSignedAt).toLocaleString()
                        : ''}
                    </span>
                  </div>
                </>
              ) : (
                <div className="h-12 border-b-2 border-dashed border-rose-300 flex items-end pb-1 text-xs text-rose-600 italic">
                  Awaiting Client Digital or Wet-Ink Signature...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 print:bg-white print:text-slate-900 print:pb-0">
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
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
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
              {(['both', 'company', 'client'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPrintMode(m)}
                  className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition ${
                    printMode === m ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m === 'both' ? 'Both Copies' : `${m} Copy`}
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
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" /> Verify Seal
            </button>

            {!cancellation.clientSignatureName && (
              <button
                type="button"
                onClick={() => setShowSignModal(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/20"
              >
                <Gavel className="w-3.5 h-3.5" /> Execute Cancellation Agreement
              </button>
            )}

            {cancellation.settlementBalanceDue > 0.01 && (
              <button
                type="button"
                onClick={() => setShowPaymentModal(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
              >
                <CreditCard className="w-3.5 h-3.5" /> Pay / Record Settlement ($
                {cancellation.settlementBalanceDue.toFixed(2)})
              </button>
            )}

            {cancellation.invoiceId && (
              <Link
                href={`/pay/${cancellation.invoiceId}`}
                className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5" /> Settlement Invoice
              </Link>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
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
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
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
      <div className="max-w-5xl mx-auto px-4 pt-8 print:px-0 print:pt-0">
        {(printMode === 'both' || printMode === 'company') &&
          renderContractCopy('COMPANY RECORD COPY')}

        {printMode === 'both' && (
          <div className="print:break-before-page my-8 border-t-2 border-dashed border-slate-700 print:hidden" />
        )}

        {(printMode === 'both' || printMode === 'client') &&
          renderContractCopy('CLIENT / PROPERTY OWNER COPY')}
      </div>

      {/* Modal 1: Client Mandatory 4-Point Georgia Statutory Execution Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Gavel className="w-5 h-5 text-rose-400" />
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
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200">
                Under the <strong>Georgia Uniform Electronic Transactions Act (O.C.G.A. § 10-12-1 et seq.)</strong>,
                please review and check all four (4) mandatory statutory acknowledgments below before entering your binding digital signature.
              </div>

              <div className="space-y-2.5 text-xs">
                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-rose-500/40">
                  <input
                    type="checkbox"
                    checked={acks.asIsAndWarrantyVoidAccepted}
                    onChange={(e) =>
                      setAcks((prev) => ({
                        ...prev,
                        asIsAndWarrantyVoidAccepted: e.target.checked,
                      }))
                    }
                    className="mt-1 accent-rose-500"
                  />
                  <span>
                    <strong className="text-white block">
                      1. Mid-Job &ldquo;As-Is&rdquo; Acceptance & Complete Voiding of Warranties (O.C.G.A. § 13-8-2)
                    </strong>
                    <span className="text-slate-400">
                      I accept the property and all unfinished/partial work strictly &ldquo;AS-IS, WHERE-IS&rdquo; and acknowledge that all
                      express or implied warranties from Nailed It Property Solutions are immediately null and void.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-rose-500/40">
                  <input
                    type="checkbox"
                    checked={acks.quantumMeruitAndLienRightsAccepted}
                    onChange={(e) =>
                      setAcks((prev) => ({
                        ...prev,
                        quantumMeruitAndLienRightsAccepted: e.target.checked,
                      }))
                    }
                    className="mt-1 accent-rose-500"
                  />
                  <span>
                    <strong className="text-white block">
                      2. Quantum Meruit Valuation & Floyd County Mechanics&apos; Lien Preservation (O.C.G.A. § 44-14-361)
                    </strong>
                    <span className="text-slate-400">
                      I agree that the Total Settlement Charges (${cancellation.totalSettlementCharges.toFixed(2)}) and Net Balance Due ($
                      {cancellation.settlementBalanceDue.toFixed(2)}) are fair and enforceable, and that Contractor retains full Georgia statutory
                      Mechanics&apos; & Materialmen&apos;s Lien rights in Floyd County Superior Court until paid in full.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-rose-500/40">
                  <input
                    type="checkbox"
                    checked={acks.noChargebackAndMutualReleaseAccepted}
                    onChange={(e) =>
                      setAcks((prev) => ({
                        ...prev,
                        noChargebackAndMutualReleaseAccepted: e.target.checked,
                      }))
                    }
                    className="mt-1 accent-rose-500"
                  />
                  <span>
                    <strong className="text-white block">
                      3. Irrevocable Waiver of Chargebacks / Stop-Payments & Conditional Release (O.C.G.A. § 13-6-11)
                    </strong>
                    <span className="text-slate-400">
                      I irrevocably waive any right to initiate a credit card chargeback, ACH reversal, or check stop-payment on any prior deposit ($
                      {cancellation.priorPaymentsCredited.toFixed(2)}) or settlement payment.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-rose-500/40">
                  <input
                    type="checkbox"
                    checked={acks.floydCountyGeorgiaVenueAccepted}
                    onChange={(e) =>
                      setAcks((prev) => ({
                        ...prev,
                        floydCountyGeorgiaVenueAccepted: e.target.checked,
                      }))
                    }
                    className="mt-1 accent-rose-500"
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
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-serif italic text-lg focus:border-rose-500 focus:outline-none"
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
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2"
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
                  Cryptographic Seal & Document Audit Log
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
                <span className="text-slate-400">Cryptographic Seal:</span>
                <span className="font-mono font-bold text-amber-400">{cancellation.sealCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Governing Court Venue:</span>
                <span className="font-semibold text-rose-300">
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
