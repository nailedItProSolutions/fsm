'use client';

import React, { useState, useEffect } from 'react';
import { EstimatePayment, PaymentMethod } from '@/types';
import { useActiveFSMData } from '@/lib/useStore';
import { 
  X, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  Pencil,
  Trash2,
  Calendar,
  Receipt,
  Building2
} from 'lucide-react';
import { PaymentReceiptModal } from './PaymentReceiptModal';

interface EditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: EstimatePayment;
  estimateId?: string;
  estimateTotal?: number;
  onPaymentUpdated?: (updated: EstimatePayment) => void;
  onPaymentDeleted?: (paymentId: string) => void;
}

export const EditPaymentModal: React.FC<EditPaymentModalProps> = ({
  isOpen,
  onClose,
  payment,
  estimateId,
  estimateTotal,
  onPaymentUpdated,
  onPaymentDeleted,
}) => {
  const { updateEstimatePayment, deleteEstimatePayment, getEstimateById } = useActiveFSMData();

  const estId = estimateId || payment.estimateId;
  const estimate = estId ? getEstimateById(estId) : undefined;

  const [amount, setAmount] = useState<string>(payment.amount.toString());
  const [method, setMethod] = useState<PaymentMethod>(payment.method);
  const [referenceNumber, setReferenceNumber] = useState<string>(payment.referenceNumber || '');
  const [notes, setNotes] = useState<string>(payment.notes || '');
  const [receivedBy, setReceivedBy] = useState<string>(payment.receivedBy || 'Charles Willis - Owner & Field Specialist');
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showUpdatedReceipt, setShowUpdatedReceipt] = useState<EstimatePayment | null>(null);

  useEffect(() => {
    if (payment) {
      setAmount(payment.amount.toString());
      setMethod(payment.method);
      setReferenceNumber(payment.referenceNumber || '');
      setNotes(payment.notes || '');
      setReceivedBy(payment.receivedBy || 'Charles Willis - Owner & Field Specialist');
      setError(null);
      setIsDeleting(false);
    }
  }, [payment]);

  if (!isOpen) return null;

  const paymentMethods: Array<{ id: PaymentMethod; label: string; desc: string; icon: string }> = [
    { id: 'cashapp', label: 'Cash App', desc: '$Cashtag or confirmation', icon: '🟢' },
    { id: 'zelle', label: 'Zelle', desc: 'Direct bank transfer reference', icon: '🟣' },
    { id: 'check', label: 'Bank Check', desc: 'Physical check # & bank', icon: '🔵' },
    { id: 'money_order', label: 'Money Order', desc: 'Serial # / Western Union', icon: '🟠' },
    { id: 'cash', label: 'Cash Currency', desc: 'In-person currency tender', icon: '💵' },
    { id: 'debit_credit', label: 'Debit / Credit Card', desc: 'Card terminal / authorization', icon: '💳' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid positive payment amount.');
      return;
    }

    try {
      const { payment: updated } = updateEstimatePayment(estId, payment.id, {
        amount: numericAmount,
        method,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        receivedBy: receivedBy.trim(),
      });

      if (onPaymentUpdated) {
        onPaymentUpdated(updated);
      }
      setShowUpdatedReceipt(updated);
    } catch (err: any) {
      setError(err?.message || 'Failed to update payment');
    }
  };

  const handleDelete = () => {
    if (!window.confirm(`Are you sure you want to permanently delete payment receipt ${payment.receiptNumber} ($${payment.amount.toFixed(2)})? This will remove the credited deposit balance.`)) {
      return;
    }

    try {
      deleteEstimatePayment(estId, payment.id);
      if (onPaymentDeleted) {
        onPaymentDeleted(payment.id);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete payment');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-[#111111] text-[#fdfbf7] rounded-2xl shadow-2xl max-w-xl w-full border border-[#2a2a2a] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="bg-[#181818] p-5 border-b border-[#262626] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#c5a059] flex items-center justify-center text-black font-bold">
                <Pencil className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-[#fdfbf7]">Edit Payment Record</h3>
                  <span className="font-mono text-xs font-bold text-[#c5a059] bg-[#141414] px-2 py-0.5 rounded border border-[#c5a059]/30">
                    {payment.receiptNumber}
                  </span>
                </div>
                <p className="text-xs text-[#78716c] mt-0.5">
                  {payment.clientName} • Recorded {new Date(payment.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-[#78716c] hover:text-[#fdfbf7] p-1 rounded-lg hover:bg-[#222222] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
            {error && (
              <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-xl text-red-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Original Payment Information */}
            <div className="bg-[#181818] p-3.5 rounded-xl border border-[#262626] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#78716c] tracking-wider">Original Tender</span>
                <div className="font-mono font-bold text-sm text-[#fdfbf7] mt-0.5">
                  ${Number(payment.amount).toFixed(2)} • {payment.method.toUpperCase()}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#78716c] tracking-wider">Original Timestamp</span>
                <div className="text-[11px] text-[#b8b0a5] font-mono mt-0.5">
                  {new Date(payment.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-[#b8b0a5] mb-2 uppercase tracking-wider">
                Payment Method *
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {paymentMethods.map((pm) => {
                  const isSelected = method === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setMethod(pm.id)}
                      className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition ${
                        isSelected
                          ? 'border-[#c5a059] bg-[#c5a059]/10 ring-1 ring-[#c5a059]'
                          : 'border-[#262626] bg-[#161616] hover:bg-[#1f1f1f]'
                      }`}
                    >
                      <span className="text-base shrink-0 mt-0.5">{pm.icon}</span>
                      <div className="truncate">
                        <div className={`font-bold text-xs ${isSelected ? 'text-[#c5a059]' : 'text-[#fdfbf7]'}`}>
                          {pm.label}
                        </div>
                        <div className="text-[10px] text-[#78716c] truncate mt-0.5">{pm.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount Field */}
            <div>
              <label className="block text-xs font-bold text-[#b8b0a5] mb-1 uppercase tracking-wider">
                Payment Amount ($ USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-[#c5a059]">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg pl-8 pr-4 py-2.5 text-sm font-mono font-bold text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>

            {/* Reference Number & Admin Signoff */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
                  Transaction / Ref # (Optional)
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. Check #, Zelle ID, CashApp Tag"
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
                  Received & Processed By
                </label>
                <input
                  type="text"
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>

            {/* Notes / Memo */}
            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
                Internal Memo / Client Receipt Note
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes describing this payment or correction..."
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="p-3 bg-[#161616] border border-[#222222] rounded-xl flex items-center justify-between text-[11px] text-[#78716c]">
              <span>✓ Recalculates balance due & customer lifetime spend</span>
              <span>✓ Certified in audit trail</span>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-[#262626] pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-lg border border-red-800/50 bg-red-950/30 text-red-400 hover:bg-red-900/40 text-xs font-bold transition flex items-center space-x-1"
                title="Delete this payment record completely"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Delete Payment</span>
              </button>

              <div className="flex items-center space-x-3">
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
                  <span>Save Payment Changes</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Show updated receipt if saved */}
      {showUpdatedReceipt && estimate && (
        <PaymentReceiptModal
          isOpen={true}
          onClose={() => {
            setShowUpdatedReceipt(null);
            onClose();
          }}
          payment={showUpdatedReceipt}
          estimate={estimate}
        />
      )}
    </>
  );
};
