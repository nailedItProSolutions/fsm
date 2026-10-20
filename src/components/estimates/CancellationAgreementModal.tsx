'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Estimate,
  WorkAgreement,
  Job,
  ContractCancellation,
  CancellationStage,
  CancellationSettlementItem,
  PaymentMethod,
} from '@/types';
import { useActiveFSMData } from '@/lib/useStore';
import {
  EXPOSED_SYSTEM_CATEGORIES,
  CANCELLATION_STAGE_LABELS,
  buildDefaultCancellationItems,
  buildGeorgiaCancellationTerms,
} from '@/lib/georgiaCancellationLaw';
import {
  X,
  ShieldAlert,
  Scale,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  FileWarning,
  DollarSign,
  Gavel,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Lock,
  Sparkles,
} from 'lucide-react';

interface CancellationAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimate: Estimate;
  agreement?: WorkAgreement;
  job?: Job;
  onSuccess?: (cancellation: ContractCancellation) => void;
}

const CANCELLATION_REASON_PRESETS = [
  'Client elected to halt project mid-job for personal or financial reasons',
  'Client requested stop-work to defer renovations or sell property As-Is',
  'Client scope freeze / budget reallocation after materials were procured and staged',
  'Access denied or third-party interference at service property preventing safe trade execution',
  'Client non-payment of required progress milestone / draw schedule',
  'Mutual termination of service agreement prior to full project completion',
];

export const CancellationAgreementModal: React.FC<CancellationAgreementModalProps> = ({
  isOpen,
  onClose,
  estimate,
  agreement: propAgreement,
  job: propJob,
  onSuccess,
}) => {
  const {
    workAgreements,
    jobs,
    createContractCancellation,
    calculateAgreementBalances,
  } = useActiveFSMData();

  const agreement =
    propAgreement ||
    workAgreements.find((w) => w.estimateId === estimate.id || w.id === estimate.workAgreementId);
  const linkedJob =
    propJob ||
    jobs.find(
      (j) =>
        j.id === estimate.convertedToJobId ||
        j.estimateId === estimate.id ||
        (agreement && j.id === agreement.jobId)
    );

  // Determine default completion % from job checklist if available
  const checklistDoneCount = linkedJob?.checklist?.filter((c) => c.done).length || 0;
  const checklistTotalCount = linkedJob?.checklist?.length || 0;
  const defaultCompletionPct =
    checklistTotalCount > 0
      ? Math.max(25, Math.round((checklistDoneCount / checklistTotalCount) * 100))
      : linkedJob?.status === 'in_progress'
      ? 50
      : 35;

  const [stage, setStage] = useState<CancellationStage>(
    linkedJob?.status === 'in_progress' ? 'mid_job_active' : 'materials_procured'
  );
  const [initiatedBy, setInitiatedBy] = useState<'client' | 'contractor' | 'mutual'>('client');
  const [reasonPreset, setReasonPreset] = useState<string>(CANCELLATION_REASON_PRESETS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [stopWorkDate, setStopWorkDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [completionPercentage, setCompletionPercentage] = useState<number>(defaultCompletionPct);

  // Auto-populate work performed summary from completed checklist items or estimate items
  const [workPerformedSummary, setWorkPerformedSummary] = useState<string>(() => {
    const completedTasks = linkedJob?.checklist?.filter((c) => c.done).map((c) => c.text) || [];
    if (completedTasks.length > 0) {
      return `Site mobilization, diagnostic layout, material procurement, and execution of the following trade items at ${estimate.propertyAddress}: ${completedTasks.join('; ')}.`;
    }
    const itemTitles = (agreement?.items || estimate.items || []).map((i) => i.description).slice(0, 3);
    return `Initial site mobilization, field measurements, trade scheduling, material staging, and partial execution of contracted scope (${itemTitles.join(', ')}) at ${estimate.propertyAddress}.`;
  });

  const [unfinishedWorkRisks, setUnfinishedWorkRisks] = useState<string>(
    'Work halted mid-stream prior to final finish, pressure/load testing, weatherproofing, and code inspection. Client assumes all responsibility for exposed ceiling/structural areas, proper climate-controlled flat storage and acclimation of Tongue & Groove (T&G) boards and lumber, and securing open trade areas against moisture intrusion or third-party tampering.'
  );

  const [exposedSystemsList, setExposedSystemsList] = useState<string[]>([
    EXPOSED_SYSTEM_CATEGORIES[0], // Exposed Ceiling, Joists, Rafters & Overhead Structural Cavities
    EXPOSED_SYSTEM_CATEGORIES[1], // Tongue & Groove (T&G) Boards, Millwork & Wood Materials — Proper Climate Acclimation, Flat Stacking, Moisture Control & On-Site Storage
    EXPOSED_SYSTEM_CATEGORIES[4], // Drywall, Framing & Structural Wall Cavities
    EXPOSED_SYSTEM_CATEGORIES[9], // Staged / Uninstalled Materials Left On-Site
  ]);
  const [customExposedRisk, setCustomExposedRisk] = useState<string>('');

  const [items, setItems] = useState<CancellationSettlementItem[]>(() =>
    buildDefaultCancellationItems({
      estimate,
      agreement,
      job: linkedJob,
      stage: linkedJob?.status === 'in_progress' ? 'mid_job_active' : 'materials_procured',
      completionPercentage: defaultCompletionPct,
    })
  );

  // Prior payments credited from estimate/agreement
  const defaultPriorPaid = (() => {
    if (agreement) {
      const bal = calculateAgreementBalances(agreement, estimate);
      return bal.totalPaid;
    }
    if (estimate.payments && estimate.payments.length > 0) {
      return estimate.payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    }
    return Number(estimate.depositPaid || 0);
  })();

  const [priorPaymentsCredited, setPriorPaymentsCredited] = useState<number>(defaultPriorPaid);
  const [refundIssued, setRefundIssued] = useState<number>(0);
  const [settlementPaidNow, setSettlementPaidNow] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('debit_credit');
  const [paymentReceiptNumber, setPaymentReceiptNumber] = useState<string>('');
  const [clientSignatureName, setClientSignatureName] = useState<string>('');
  const [generateSettlementInvoice, setGenerateSettlementInvoice] = useState<boolean>(true);
  const [terms, setTerms] = useState<string>('');
  const [isCustomTerms, setIsCustomTerms] = useState<boolean>(false);
  const [createdCancellation, setCreatedCancellation] = useState<ContractCancellation | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Live financial calculations (no tax on cancellation settlements)
  const originalContractTotal = Number(agreement?.updatedTotal ?? estimate.total ?? 0);
  const taxRate = 0;
  const settlementSubtotal =
    Math.round(items.reduce((sum, i) => sum + (Number(i.total) || 0), 0) * 100) / 100;
  const settlementTax = 0;
  const totalSettlementCharges = settlementSubtotal;
  const netBeforeNowPayment = Math.max(
    0,
    Math.round((totalSettlementCharges - priorPaymentsCredited + refundIssued) * 100) / 100
  );
  const settlementBalanceDue = Math.max(
    0,
    Math.round((netBeforeNowPayment - settlementPaidNow) * 100) / 100
  );

  // Keep legal terms synchronized unless user manually edited them
  useEffect(() => {
    if (!isCustomTerms) {
      const generated = buildGeorgiaCancellationTerms({
        clientName: estimate.clientName,
        propertyAddress: estimate.propertyAddress,
        estimateNumber: estimate.estimateNumber,
        agreementNumber: agreement?.agreementNumber,
        contractId: agreement?.contractId,
        jobNumber: linkedJob?.jobNumber,
        stage,
        stopWorkDate,
        completionPercentage,
        workPerformedSummary,
        unfinishedWorkRisks,
        exposedSystemsList,
        originalContractTotal,
        totalSettlementCharges,
        priorPaymentsCredited,
        refundIssued,
        settlementBalanceDue,
      });
      setTerms(generated);
    }
  }, [
    isCustomTerms,
    estimate.clientName,
    estimate.propertyAddress,
    estimate.estimateNumber,
    agreement?.agreementNumber,
    agreement?.contractId,
    linkedJob?.jobNumber,
    stage,
    stopWorkDate,
    completionPercentage,
    workPerformedSummary,
    unfinishedWorkRisks,
    exposedSystemsList,
    originalContractTotal,
    totalSettlementCharges,
    priorPaymentsCredited,
    refundIssued,
    settlementBalanceDue,
    customReason,
    reasonPreset,
  ]);

  if (!isOpen) return null;

  const handleRecalculateDefaultItems = (newStage: CancellationStage, newPct: number) => {
    const recalculated = buildDefaultCancellationItems({
      estimate,
      agreement,
      job: linkedJob,
      stage: newStage,
      completionPercentage: newPct,
    });
    setItems(recalculated);
  };

  const handleToggleExposedSystem = (sys: string) => {
    setExposedSystemsList((prev) =>
      prev.includes(sys) ? prev.filter((s) => s !== sys) : [...prev, sys]
    );
  };

  const handleAddCustomExposedRisk = () => {
    const trimmed = customExposedRisk.trim();
    if (!trimmed) return;
    if (!exposedSystemsList.includes(trimmed)) {
      setExposedSystemsList((prev) => [...prev, trimmed]);
    }
    setCustomExposedRisk('');
  };

  const handleItemChange = (
    idx: number,
    field: keyof CancellationSettlementItem,
    value: string | number
  ) => {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[idx], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const q = field === 'quantity' ? Number(value) || 0 : Number(item.quantity) || 0;
        const p = field === 'unitPrice' ? Number(value) || 0 : Number(item.unitPrice) || 0;
        item.total = Math.round(q * p * 100) / 100;
      }
      next[idx] = item;
      return next;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `cnc-item-${Date.now()}-${prev.length}`,
        category: 'labor_completed',
        description: 'Additional Completed Field Labor / Demobilization Charge',
        details: 'Verified field technician time and site safety lock-down prior to stop-work',
        quantity: 1,
        unitPrice: 125,
        total: 125,
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Please include at least one settlement line item.');
      return;
    }

    try {
      const effectiveReason = customReason.trim() || reasonPreset;
      const created = createContractCancellation(estimate.id, {
        stage,
        initiatedBy,
        cancellationReason: effectiveReason,
        stopWorkDate,
        completionPercentage,
        workPerformedSummary,
        unfinishedWorkRisks,
        exposedSystemsList,
        items,
        taxRate,
        priorPaymentsCredited,
        refundIssued,
        settlementPaidNow,
        paymentMethod: settlementPaidNow > 0 ? paymentMethod : undefined,
        paymentReceiptNumber: settlementPaidNow > 0 ? paymentReceiptNumber : undefined,
        terms,
        clientSignatureName: clientSignatureName.trim() || undefined,
        generateSettlementInvoice,
      });

      setCreatedCancellation(created);
      if (onSuccess) onSuccess(created);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate Cancellation Agreement');
    }
  };

  const handleCopyPortalLink = () => {
    if (!createdCancellation || typeof window === 'undefined') return;
    const url = `${window.location.origin}/cancellation/${createdCancellation.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Combine preset categories + any custom items added by user
  const allExposedOptions = Array.from(
    new Set([...EXPOSED_SYSTEM_CATEGORIES, ...exposedSystemsList])
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Top Legal Header Banner */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-tight">
                  Georgia Service Contract Cancellation & Stop-Work Agreement
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-amber-300 border border-slate-700">
                  Rome • Floyd County, GA (O.C.G.A.)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mid-Job Liability Release, As-Is & Material Storage Risk Assumption, Quantum Meruit & Lien Preservation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {createdCancellation ? (
          <div className="p-8 space-y-6 overflow-y-auto">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Official Stop-Work & Cancellation Instrument Ready
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">
                    {createdCancellation.cancellationNumber} • {createdCancellation.clientName}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Registry Seal: <span className="font-mono text-amber-300">{createdCancellation.sealCode}</span> •
                    Floyd County Lien Protection Deadline:{' '}
                    <span className="font-bold text-white">{createdCancellation.lienRightsExpiresAt}</span> (90 Days under O.C.G.A. § 44-14-361.1)
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-slate-400">Net Settlement Balance Due</div>
                <div className="text-2xl font-black text-amber-400">
                  ${createdCancellation.settlementBalanceDue.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700">
                <div className="text-xs text-slate-400">Original Contract Total</div>
                <div className="text-lg font-bold text-white mt-1">
                  ${createdCancellation.originalContractTotal.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Ref: {createdCancellation.agreementNumber || createdCancellation.estimateNumber}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700">
                <div className="text-xs text-slate-400">Quantum Meruit & Stop-Work Charges</div>
                <div className="text-lg font-bold text-amber-400 mt-1">
                  ${createdCancellation.totalSettlementCharges.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Less ${createdCancellation.priorPaymentsCredited.toFixed(2)} Prior Deposit Credited
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700">
                <div className="text-xs text-slate-400">Warranty & Liability Status</div>
                <div className="text-sm font-bold text-slate-200 mt-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> ALL WARRANTIES VOIDED (&ldquo;AS-IS&rdquo;)
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Venue: Floyd County Superior Court, Rome, GA
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Send to Client for Mandatory Georgia Statutory Acknowledgments & Digital Execution
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleCopyPortalLink}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700 transition"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      Copied Client Cancellation Link!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-400" />
                      Copy Shareable Client Signing Link
                    </>
                  )}
                </button>
                <Link
                  href={`/cancellation/${createdCancellation.id}`}
                  className="flex-1 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Official Cancellation Contract & Print View
                </Link>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold"
              >
                Done & Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="p-6 space-y-6 overflow-y-auto">
            {error && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Contract & Property Summary Bar */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Client / Property Owner</span>
                <span className="font-bold text-white text-sm">{estimate.clientName}</span>
                <span className="text-slate-400 block truncate">{estimate.propertyAddress}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Referenced Instruments</span>
                <span className="font-mono font-bold text-amber-400">
                  {estimate.estimateNumber}
                  {agreement ? ` / ${agreement.agreementNumber}` : ''}
                </span>
                <span className="text-slate-400 block">
                  {linkedJob ? `Job ${linkedJob.jobNumber} (${linkedJob.status})` : 'No active dispatch'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Contract Price & Prior Paid</span>
                <span className="font-bold text-white text-sm">
                  ${originalContractTotal.toFixed(2)} Total
                </span>
                <span className="text-emerald-400 block font-semibold">
                  ${priorPaymentsCredited.toFixed(2)} Deposit/Payments Held
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Governing Jurisdiction</span>
                <span className="font-bold text-slate-200">Rome, Floyd County, GA</span>
                <span className="text-slate-400 block">O.C.G.A. Title 13 & Title 44 Lien Law</span>
              </div>
            </div>

            {/* Section 1: Stop-Work Stage, Completion %, and Cancellation Trigger */}
            <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400" />
                  1. Project Stop-Work Stage & Mid-Job Progress Valuation
                </h3>
                <button
                  type="button"
                  onClick={() => handleRecalculateDefaultItems(stage, completionPercentage)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Auto-Calculate Georgia Statutory Settlement Items
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Cancellation / Stop-Work Stage
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => {
                      const nextStage = e.target.value as CancellationStage;
                      setStage(nextStage);
                      const recommendedPct =
                        nextStage === 'pre_mobilization'
                          ? 0
                          : nextStage === 'materials_procured'
                          ? 15
                          : nextStage === 'mid_job_active'
                          ? 50
                          : nextStage === 'substantial_completion'
                          ? 85
                          : 25;
                      setCompletionPercentage(recommendedPct);
                      handleRecalculateDefaultItems(nextStage, recommendedPct);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                  >
                    {(Object.keys(CANCELLATION_STAGE_LABELS) as CancellationStage[]).map((k) => (
                      <option key={k} value={k}>
                        {CANCELLATION_STAGE_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Cancellation Initiated By
                  </label>
                  <select
                    value={initiatedBy}
                    onChange={(e) => setInitiatedBy(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="client">Client / Property Owner Request (Mid-Contract Stop-Work)</option>
                    <option value="contractor">Contractor Stop-Work (Non-Payment / Unsafe Site / Interference)</option>
                    <option value="mutual">Mutual Termination & Settlement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Effective Stop-Work Date
                  </label>
                  <input
                    type="date"
                    value={stopWorkDate}
                    onChange={(e) => setStopWorkDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center pt-1">
                <div className="md:col-span-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-300">Work Completion % at Stop-Work</span>
                    <span className="font-black text-amber-400">{completionPercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={completionPercentage}
                    onChange={(e) => {
                      const pct = Number(e.target.value);
                      setCompletionPercentage(pct);
                    }}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>0% (Pre-Start)</span>
                    <span>50% (Mid-Job)</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Documented Reason for Cancellation
                  </label>
                  <select
                    value={reasonPreset}
                    onChange={(e) => setReasonPreset(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                  >
                    {CANCELLATION_REASON_PRESETS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Or enter specific custom cancellation reason / field incident details..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Mid-Job "As-Is" Demarcation, Exposed Ceiling, T&G Storage & Warranty Voiding */}
            <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  2. Client Assumes Risk For: Exposed Systems, T&G Material Storage & &ldquo;As-Is&rdquo; Demarcation
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  Voids all warranties & shifts post-departure risk to Client
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Summary of Work Completed Prior to Stop-Work (Quantum Meruit Basis)
                  </label>
                  <textarea
                    rows={3}
                    value={workPerformedSummary}
                    onChange={(e) => setWorkPerformedSummary(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Unfinished Work Risks & Material Storage Warning
                  </label>
                  <textarea
                    rows={3}
                    value={unfinishedWorkRisks}
                    onChange={(e) => setUnfinishedWorkRisks(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-amber-300">
                  Select All Unfinished Systems & On-Site Material Storage Risks Assumed Strictly by Client:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {allExposedOptions.map((sys) => {
                    const checked = exposedSystemsList.includes(sys);
                    return (
                      <label
                        key={sys}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                          checked
                            ? 'bg-amber-500/10 border-amber-500/40 text-white'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleExposedSystem(sys)}
                          className="mt-0.5 accent-amber-500"
                        />
                        <span>{sys}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Add custom client-assumed risk item */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customExposedRisk}
                    onChange={(e) => setCustomExposedRisk(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomExposedRisk();
                      }
                    }}
                    placeholder="Add custom risk item (e.g., Unpainted exterior trim, Open attic access, Client-stored tile boxes)..."
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomExposedRisk}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Risk Item
                  </button>
                </div>
              </div>
            </div>

            {/* Section 3: Itemized Georgia Settlement Schedule */}
            <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    3. Itemized Stop-Work & Liquidated Settlement Schedule (O.C.G.A. § 9-2-7 & § 13-6-7)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Includes completed labor, installed/custom materials, 20% supplier restocking fee, and 15% mobilization/schedule allocation fee.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Settlement Line
                </button>
              </div>

              <div className="space-y-2.5">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-start"
                  >
                    <div className="md:col-span-3">
                      <label className="text-[10px] uppercase text-slate-500 block mb-0.5">Category</label>
                      <select
                        value={item.category}
                        onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs"
                      >
                        <option value="labor_completed">Completed Field Labor</option>
                        <option value="materials_installed">Installed / Staged Materials</option>
                        <option value="materials_uninstalled">Special-Order Materials</option>
                        <option value="restocking_fee">Supplier Restocking / Return Fee (20%)</option>
                        <option value="mobilization_fee">Mobilization & Lost Dispatch Fee (15%)</option>
                        <option value="permit_inspection">Permit / Inspection / Disposal Fee</option>
                      </select>
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-[10px] uppercase text-slate-500 block mb-0.5">Description & Statutory Basis</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-medium"
                      />
                      <input
                        type="text"
                        value={item.details || ''}
                        onChange={(e) => handleItemChange(idx, 'details', e.target.value)}
                        placeholder="Details / statutory citation..."
                        className="w-full px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800/70 text-slate-400 text-[11px] mt-1"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-[10px] uppercase text-slate-500 block mb-0.5">Qty</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs text-right"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] uppercase text-slate-500 block mb-0.5">Unit Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs text-right"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-2 pt-4">
                      <span className="font-mono font-bold text-sm text-white">
                        ${Number(item.total).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition"
                        title="Remove line item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Reconciliation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Prior Deposit / Payments Credited ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={priorPaymentsCredited}
                        onChange={(e) => setPriorPaymentsCredited(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Settlement Paid Now at Signing ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={settlementPaidNow}
                        onChange={(e) => setSettlementPaidNow(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-bold text-xs"
                      />
                    </div>
                  </div>

                  {settlementPaidNow > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
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
                        <label className="block text-xs text-slate-400 mb-1">Receipt / Check #</label>
                        <input
                          type="text"
                          value={paymentReceiptNumber}
                          onChange={(e) => setPaymentReceiptNumber(e.target.value)}
                          placeholder="e.g. CHK-4092 or AUTH-991"
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={generateSettlementInvoice}
                      onChange={(e) => setGenerateSettlementInvoice(e.target.checked)}
                      className="accent-amber-500"
                    />
                    <span>
                      Automatically generate a formal <strong>Cancellation Settlement Invoice</strong> if a net balance is owed
                    </span>
                  </label>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-200">
                    <span>Gross Stop-Work Settlement Charges (Labor, Materials & Fees):</span>
                    <span className="font-mono text-amber-400">${totalSettlementCharges.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Less Prior Deposit / Payments Credited:</span>
                    <span className="font-mono">-${priorPaymentsCredited.toFixed(2)}</span>
                  </div>
                  {settlementPaidNow > 0 && (
                    <div className="flex justify-between text-sky-400">
                      <span>Less Settlement Payment Collected Today:</span>
                      <span className="font-mono">-${settlementPaidNow.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-sm font-black">
                    <span className="text-white">Net Cancellation Settlement Due:</span>
                    <span className="font-mono text-lg text-amber-400">
                      ${settlementBalanceDue.toFixed(2)}
                    </span>
                  </div>
                  {settlementBalanceDue > 0 && (
                    <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      <span>
                        Floyd County Mechanics&apos; & Materialmen&apos;s Lien rights (O.C.G.A. § 44-14-361) remain reserved until $
                        {settlementBalanceDue.toFixed(2)} is paid in cleared funds.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: 7-Article Georgia Legal Terms & Optional Immediate In-Person Client Signature */}
            <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileWarning className="w-4 h-4 text-amber-400" />
                  4. Rome, Floyd County, Georgia Legal Protection Clauses (7 Articles)
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCustomTerms(false)}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Reset to Auto-Generated Georgia Statutory Terms
                </button>
              </div>
              <textarea
                rows={8}
                value={terms}
                onChange={(e) => {
                  setIsCustomTerms(true);
                  setTerms(e.target.value);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-[11px] leading-relaxed focus:border-amber-500 focus:outline-none"
              />

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Optional: Capture Client Digital Signature Now (or leave blank so Client signs via shareable portal link)
                </label>
                <input
                  type="text"
                  value={clientSignatureName}
                  onChange={(e) => setClientSignatureName(e.target.value)}
                  placeholder={`Leave blank to send to ${estimate.clientName} for remote signing, or type full legal name if signing in person...`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm italic font-serif focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg transition"
              >
                <Gavel className="w-4 h-4" />
                Issue Georgia Cancellation & Stop-Work Agreement
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
