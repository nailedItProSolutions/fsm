'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Estimate, WorkAgreementItem, WorkAgreement, Job } from '@/types';
import { useActiveFSMData } from '@/lib/useStore';
import { 
  X, 
  FileText, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Calendar, 
  UserCheck, 
  Wrench,
  Printer,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface WorkAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimate: Estimate;
  onSuccess?: (agreement: WorkAgreement) => void;
}

export const WorkAgreementModal: React.FC<WorkAgreementModalProps> = ({
  isOpen,
  onClose,
  estimate,
  onSuccess,
}) => {
  const { getTechnicians, createWorkAgreement } = useActiveFSMData();
  const technicians = getTechnicians();

  // Pre-populate items from estimate
  const [items, setItems] = useState<WorkAgreementItem[]>(() => {
    return (estimate.items || []).map((item, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      type: item.type || 'labor',
      description: item.description,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      total: Number(item.total) || 0,
      isNewOrModified: false,
    }));
  });

  // Variance & explanation
  const VARIANCE_PRESETS = [
    'Additional hidden dry rot / subfloor moisture damage discovered upon pre-start walkthrough',
    'Client requested upgraded premium fixtures & materials during consultation',
    'Floyd County building code compliance adjustment (expansion of safety items)',
    'Expedited turnaround emergency labor rate',
    'Material cost price update from local Rome wholesale supplier',
    'Scope modification requested by property owner / manager',
    'Exact match to approved quote (no scope changes)',
  ];

  const [variancePreset, setVariancePreset] = useState(VARIANCE_PRESETS[0]);
  const [customVarianceReason, setCustomVarianceReason] = useState('');
  
  // Financials
  const [depositPaid, setDepositPaid] = useState<number>(Number(estimate.depositPaid || 0));
  const [amountDueNow, setAmountDueNow] = useState<number>(0);
  const [dueNowDescription, setDueNowDescription] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [assignedTechId, setAssignedTechId] = useState<string>(technicians[0]?.uid || 'user-tech-1');
  const [clientSignatureName, setClientSignatureName] = useState(estimate.clientName);

  // Flow states
  const [error, setError] = useState<string | null>(null);
  const [createdAgreement, setCreatedAgreement] = useState<WorkAgreement | null>(null);

  if (!isOpen) return null;

  // Real-time updated state math
  const originalEstimateTotal = Number(estimate.originalTotal || estimate.total || 0);
  const updatedSubtotal = items.reduce((acc, item) => acc + (Number(item.total) || 0), 0);
  const taxRate = Number(estimate.taxRate || 0.08);
  const updatedTax = updatedSubtotal * taxRate;
  const updatedTotal = updatedSubtotal + updatedTax;
  const varianceAmount = updatedTotal - originalEstimateTotal;
  const variancePercent = originalEstimateTotal > 0 ? (varianceAmount / originalEstimateTotal) * 100 : 0;
  const balanceDueUponCompletion = Math.max(0, updatedTotal - depositPaid - amountDueNow);
  const balanceDue = balanceDueUponCompletion;

  const handleItemChange = (index: number, field: keyof WorkAgreementItem, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index], isNewOrModified: true };

      if (field === 'quantity') {
        const q = value === '' ? 0 : parseFloat(value) || 0;
        item.quantity = q;
        const p = Number(item.unitPrice) || 0;
        item.total = Number((q * p).toFixed(2));
      } else if (field === 'unitPrice') {
        const p = value === '' ? 0 : parseFloat(value) || 0;
        item.unitPrice = p;
        const q = Number(item.quantity) || 0;
        item.total = Number((q * p).toFixed(2));
      } else {
        (item as any)[field] = value;
      }

      copy[index] = item;
      return copy;
    });
  };

  const handleAddItem = (type: 'material' | 'labor' | 'flat_rate') => {
    const defaultDescriptions: Record<string, string> = {
      material: 'Materials: Heavy-Duty Hardware / Plumbing Fittings',
      labor: 'Labor: Additional Field Carpentry / Installation (1 Hr)',
      flat_rate: 'Equipment: Specialized Extraction / Tool Rental',
    };
    const defaultPrices: Record<string, number> = {
      material: 45.0,
      labor: 47.5,
      flat_rate: 65.0,
    };

    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${prev.length}`,
        type,
        description: defaultDescriptions[type] || 'Additional Scope Item',
        quantity: 1,
        unitPrice: defaultPrices[type] || 47.5,
        total: defaultPrices[type] || 47.5,
        isNewOrModified: true,
        varianceNote: 'Item added during Work Agreement creation',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('At least one line item is required on the work agreement.');
      return;
    }

    const finalReason = customVarianceReason.trim() || variancePreset;

    try {
      const agreement = createWorkAgreement(estimate.id, {
        items,
        varianceReason: finalReason,
        depositPaid,
        amountDueNow,
        dueNowDescription: dueNowDescription.trim() || undefined,
        clientSignatureName: clientSignatureName.trim() || undefined,
        scheduledDate,
        techId: assignedTechId,
      });

      setCreatedAgreement(agreement);
      if (onSuccess) {
        onSuccess(agreement);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create Company Work Agreement.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#111111] text-[#fdfbf7] rounded-2xl shadow-2xl max-w-4xl w-full border border-[#2a2a2a] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#181818] p-5 border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c5a059] flex items-center justify-center text-black font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#fdfbf7]">Create Company Work Agreement</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
                  Phase Transition
                </span>
              </div>
              <p className="text-xs text-[#78716c]">
                Transition Estimate {estimate.estimateNumber} into a binding Company Work Order with updated materials & variance tracking
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#78716c] hover:text-[#fdfbf7] p-1.5 rounded-lg hover:bg-[#222222] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!createdAgreement ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
            {error && (
              <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-xl text-red-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Client & Estimate Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#181818] p-4 rounded-xl border border-[#262626]">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716c]">Customer Profile</div>
                <div className="font-bold text-xs text-[#fdfbf7] mt-0.5 truncate">{estimate.clientName}</div>
                <div className="text-[10px] text-[#78716c] truncate">{estimate.propertyAddress}</div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716c]">Original Quote Total</div>
                <div className="font-mono font-bold text-sm text-[#fdfbf7] mt-0.5">${originalEstimateTotal.toFixed(2)}</div>
                <div className="text-[10px] text-[#78716c]">Doc: {estimate.estimateNumber}</div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716c]">Credited Deposit</div>
                <div className="font-mono font-bold text-sm text-emerald-400 mt-0.5">${depositPaid.toFixed(2)}</div>
                <div className="text-[10px] text-[#78716c]">Credited toward balance</div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716c]">Agreement Target</div>
                <div className="font-mono font-bold text-xs text-[#c5a059] mt-0.5">Rome, GA Work Order</div>
                <div className="text-[10px] text-[#78716c]">Auto-dispatches to tech</div>
              </div>
            </div>

            {/* Line Items: Prices & Materials UPDATED State */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#c5a059] flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Prices & Materials Updated State</span>
                  </h4>
                  <p className="text-[11px] text-[#78716c]">
                    Update quantities, adjust rates, or add unforeseen materials discovered prior to execution.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleAddItem('material')}
                    className="px-2.5 py-1.5 rounded-lg bg-[#1e1e1e] hover:bg-[#282828] border border-[#333] text-[#fdfbf7] font-semibold text-[11px] transition flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3 text-[#c5a059]" />
                    <span>+ Add Material</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddItem('labor')}
                    className="px-2.5 py-1.5 rounded-lg bg-[#1e1e1e] hover:bg-[#282828] border border-[#333] text-[#fdfbf7] font-semibold text-[11px] transition flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3 text-[#c5a059]" />
                    <span>+ Add Labor</span>
                  </button>
                </div>
              </div>

              <div className="border border-[#262626] rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[#181818] text-[#78716c] font-bold uppercase text-[10px] border-b border-[#262626]">
                    <tr>
                      <th className="p-3 w-28">Type</th>
                      <th className="p-3">Description / Specification</th>
                      <th className="p-3 w-20 text-center">Qty</th>
                      <th className="p-3 w-24 text-right">Unit Price</th>
                      <th className="p-3 w-24 text-right">Total</th>
                      <th className="p-3 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222222]">
                    {items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-[#151515] transition">
                        <td className="p-2.5">
                          <select
                            value={item.type}
                            onChange={(e) => handleItemChange(idx, 'type', e.target.value)}
                            className="w-full bg-[#181818] border border-[#2a2a2a] rounded px-2 py-1 text-[11px] text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                          >
                            <option value="labor">Labor</option>
                            <option value="material">Material</option>
                            <option value="flat_rate">Flat Rate</option>
                          </select>
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            className="w-full bg-[#181818] border border-[#2a2a2a] rounded px-2 py-1 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-full bg-[#181818] border border-[#2a2a2a] rounded px-2 py-1 text-xs text-center font-mono text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                            className="w-full bg-[#181818] border border-[#2a2a2a] rounded px-2 py-1 text-xs text-right font-mono text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                          />
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-[#fdfbf7]">
                          ${Number(item.total).toFixed(2)}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-[#78716c] hover:text-red-400 p-1 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scope & Price Variance Tracker ("Show the difference and why") */}
            <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                    varianceAmount > 0 
                      ? 'bg-amber-500/20 text-[#c5a059]' 
                      : varianceAmount < 0 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {varianceAmount > 0 ? <TrendingUp className="w-4 h-4" /> : varianceAmount < 0 ? <TrendingDown className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#fdfbf7]">
                      Estimate-to-Work Order Variance Tracking
                    </h4>
                    <p className="text-[11px] text-[#78716c]">
                      Real-time mathematical delta between original estimate and updated agreement
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-[#78716c]">Variance Amount</div>
                  <div className={`font-mono text-base font-black ${
                    varianceAmount > 0 ? 'text-[#c5a059]' : varianceAmount < 0 ? 'text-blue-400' : 'text-[#fdfbf7]'
                  }`}>
                    {varianceAmount > 0 ? `+ $${varianceAmount.toFixed(2)} (+${variancePercent.toFixed(1)}%)` : varianceAmount < 0 ? `- $${Math.abs(varianceAmount).toFixed(2)} (${variancePercent.toFixed(1)}%)` : '$0.00 (Exact Match)'}
                  </div>
                </div>
              </div>

              {/* Difference & Why Explanation Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#262626]">
                <div>
                  <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
                    Standard Variance Category (Why) *
                  </label>
                  <select
                    value={variancePreset}
                    onChange={(e) => setVariancePreset(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                  >
                    {VARIANCE_PRESETS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-[#78716c] mt-1">
                    Recorded in permanent audit history and client agreement terms.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
                    Detailed Work Order Notes / Material Findings (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={customVarianceReason}
                    onChange={(e) => setCustomVarianceReason(e.target.value)}
                    placeholder="Specific site findings, discovered damaged joists, or upgraded fixture SKU details..."
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>
            </div>

            {/* Financial Reconciliation & Dispatch Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dispatch Details */}
              <div className="bg-[#181818] border border-[#262626] p-4 rounded-xl space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider text-[#c5a059] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Work Order Dispatch Setup</span>
                </h5>

                <div>
                  <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
                    Assigned Field Technician
                  </label>
                  <select
                    value={assignedTechId}
                    onChange={(e) => setAssignedTechId(e.target.value)}
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                  >
                    {technicians.map((t) => (
                      <option key={t.uid} value={t.uid}>
                        {t.displayName} ({t.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
                      Execution Date
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
                      Client Sign-Off Name
                    </label>
                    <input
                      type="text"
                      value={clientSignatureName}
                      onChange={(e) => setClientSignatureName(e.target.value)}
                      className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Totals Reconciliation & Payment Schedule */}
              <div className="bg-[#181818] border border-[#262626] p-4 rounded-xl space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider text-[#c5a059] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Financial Reconciliation &amp; Payment Terms</span>
                  </div>
                </h5>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-[#b8b0a5]">
                    <span>Updated Items Subtotal:</span>
                    <span className="font-mono text-[#fdfbf7]">${updatedSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#b8b0a5]">
                    <span>Estimated Tax ({(taxRate * 100).toFixed(0)}%):</span>
                    <span className="font-mono text-[#fdfbf7]">${updatedTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#262626] text-xs font-bold text-[#fdfbf7]">
                    <span>Total Agreement Amount:</span>
                    <span className="font-mono text-sm text-[#c5a059]">${updatedTotal.toFixed(2)}</span>
                  </div>
                  {depositPaid > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Credited Advance Deposit (Paid to Date):</span>
                      <span className="font-mono">-${depositPaid.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Payment Amount Due Now & Schedule Note */}
                <div className="pt-2 border-t border-[#262626] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#fdfbf7]">
                      Payment Amount Due Now (If Any)
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setAmountDueNow(0)}
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#111111] border border-[#333333] text-[#78716c] hover:text-[#fdfbf7] transition"
                      >
                        $0 None
                      </button>
                      <button
                        type="button"
                        onClick={() => setAmountDueNow(Math.round(((updatedTotal - depositPaid) * 0.5) * 100) / 100)}
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#111111] border border-[#333333] text-[#c5a059] hover:bg-[#c5a059]/10 transition"
                      >
                        50% Upfront
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const matTotal = items.filter(i => i.type === 'material').reduce((acc, i) => acc + (Number(i.total) || 0), 0);
                          setAmountDueNow(Math.round(matTotal * (1 + taxRate) * 100) / 100);
                        }}
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#111111] border border-[#333333] text-[#c5a059] hover:bg-[#c5a059]/10 transition"
                      >
                        Materials Only
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-5 relative">
                      <span className="absolute left-2.5 top-2 text-[#78716c] text-xs font-mono">$</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={amountDueNow === 0 ? '' : amountDueNow}
                        placeholder="0.00"
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                          setAmountDueNow(Math.max(0, val));
                        }}
                        className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg pl-6 pr-2.5 py-1.5 text-xs text-[#fdfbf7] font-mono font-bold focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>

                    <div className="sm:col-span-7">
                      <input
                        type="text"
                        value={dueNowDescription}
                        onChange={(e) => setDueNowDescription(e.target.value)}
                        placeholder="What it's due for (optional: e.g. Upfront materials procurement, 50% mobilization fee)"
                        className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>
                  </div>

                  {amountDueNow > 0 && (
                    <div className="p-2 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/25 flex items-center justify-between text-[11px]">
                      <span className="text-[#c5a059] font-medium">
                        Due Now Upon Signing{dueNowDescription ? ` (${dueNowDescription})` : ''}:
                      </span>
                      <span className="font-mono font-bold text-[#fdfbf7]">
                        ${amountDueNow.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Dynamic Remaining Balance Due Upon Completion */}
                <div className="flex justify-between pt-2 border-t border-[#262626] text-sm font-black text-white">
                  <div>
                    <span>Remaining Balance Due upon Completion:</span>
                    <span className="block text-[10px] text-[#78716c] font-normal">
                      Overall Total (${updatedTotal.toFixed(2)}) - Credited Deposit (${depositPaid.toFixed(2)}){amountDueNow > 0 ? ` - Due Now ($${amountDueNow.toFixed(2)})` : ''}
                    </span>
                  </div>
                  <span className="font-mono text-base text-emerald-400 font-black">
                    ${balanceDueUponCompletion.toFixed(2)}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>The estimate overall total and balance due will update from ${originalEstimateTotal.toFixed(2)} to ${updatedTotal.toFixed(2)} automatically upon agreement confirmation.</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-[#262626] pt-4 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-[#333333] text-xs font-bold text-[#b8b0a5] hover:bg-[#1a1a1a]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#c5a059] hover:bg-[#b38728] text-black text-xs font-bold shadow-md transition flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Create Company Work Agreement & Dispatch Job</span>
              </button>
            </div>
          </form>
        ) : (
          /* Agreement Created Success State */
          <div className="p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Seamless Transition Complete
              </span>
              <h2 className="text-xl font-bold font-heading text-[#fdfbf7] mt-2">
                Work Agreement {createdAgreement.agreementNumber} Active
              </h2>
              <p className="text-xs text-[#b8b0a5] mt-1 max-w-lg mx-auto">
                The estimate has been promoted into an active Company Work Order. Line items and material prices have been finalized, variance has been logged in activity history, and the job has been scheduled.
              </p>
            </div>

            {/* Variance Recap Pill */}
            <div className="inline-flex items-center gap-3 bg-[#181818] border border-[#2a2a2a] px-4 py-2 rounded-xl text-xs">
              <span className="text-[#78716c]">Variance:</span>
              <span className="font-mono font-bold text-[#c5a059]">
                {createdAgreement.varianceAmount >= 0 ? '+' : ''}${createdAgreement.varianceAmount.toFixed(2)}
              </span>
              <span className="text-[#78716c]">•</span>
              <span className="text-[#b8b0a5] italic max-w-xs truncate">{createdAgreement.varianceReason}</span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <Link
                href={`/agreement/${createdAgreement.id}?print=true`}
                target="_blank"
                className="px-4 py-2.5 bg-[#c5a059] hover:bg-[#b38728] text-black font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Work Agreement</span>
              </Link>

              <Link
                href="/dashboard/schedule"
                className="px-4 py-2.5 bg-[#181818] hover:bg-[#252525] border border-[#2a2a2a] text-[#fdfbf7] font-bold text-xs rounded-xl transition flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4 text-[#c5a059]" />
                <span>View Dispatch Board</span>
              </Link>

              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-[#141414] hover:bg-[#1a1a1a] border border-[#222222] text-[#b8b0a5] font-semibold text-xs rounded-xl transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
