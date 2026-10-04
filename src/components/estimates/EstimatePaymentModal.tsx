'use client';

import React, { useState } from 'react';
import { Estimate, PaymentMethod, EstimatePayment } from '@/types';
import { useActiveFSMData } from '@/lib/useStore';
import { 
  X, 
  DollarSign, 
  CheckCircle2, 
  CreditCard, 
  Send, 
  Banknote, 
  Receipt, 
  AlertCircle,
  FileCheck2,
  Calendar,
  UserCheck
} from 'lucide-react';
import { PaymentReceiptModal } from './PaymentReceiptModal';

interface EstimatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimate: Estimate;
  onPaymentRecorded?: (payment: EstimatePayment) => void;
}

export const EstimatePaymentModal: React.FC<EstimatePaymentModalProps> = ({
  isOpen,
  onClose,
  estimate,
  onPaymentRecorded,
}) => {
  const { recordEstimatePayment } = useActiveFSMData();

  const totalEstimate = Number(estimate.total || 0);
  const alreadyPaid = Number(estimate.depositPaid || 0);
  const remainingBalance = Math.max(0, totalEstimate - alreadyPaid);
  const halfDeposit = Number((totalEstimate / 2).toFixed(2));

  // Form states
  const [method, setMethod] = useState<PaymentMethod>('zelle');
  const [amount, setAmount] = useState<string>(remainingBalance > 0 ? (alreadyPaid === 0 ? halfDeposit.toString() : remainingBalance.toString()) : '50.00');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('Deposit received for materials & commencement');
  const [receivedBy, setReceivedBy] = useState('Brianna Cronan - HR Mgr');
  const [error, setError] = useState<string | null>(null);

  // Success state & receipt modal
  const [recordedPayment, setRecordedPayment] = useState<EstimatePayment | null>(null);

  if (!isOpen) return null;

  const paymentMethods: Array<{ id: PaymentMethod; label: string; desc: string; icon: string }> = [
    { id: 'cashapp', label: 'Cash App', desc: '$Cashtag or web confirmation', icon: '🟢' },
    { id: 'zelle', label: 'Zelle', desc: 'Direct bank transfer reference', icon: '🟣' },
    { id: 'check', label: 'Bank Check', desc: 'Physical check # & issuing bank', icon: '🔵' },
    { id: 'money_order', label: 'Money Order', desc: 'USPS / Western Union serial #', icon: '🟠' },
    { id: 'cash', label: 'Cash Currency', desc: 'In-person currency tender', icon: '💵' },
    { id: 'debit_credit', label: 'Debit / Credit Card', desc: 'Card terminal or authorization ID', icon: '💳' },
  ];

  const handleApplyPreset = (presetAmount: number) => {
    setAmount(presetAmount.toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid positive payment amount.');
      return;
    }

    try {
      const { payment } = recordEstimatePayment(estimate.id, {
        amount: numericAmount,
        method,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        receivedBy: receivedBy.trim(),
      });

      if (onPaymentRecorded) {
        onPaymentRecorded(payment);
      }
      setRecordedPayment(payment);
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
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
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#fdfbf7]">Record Payment / Deposit</h3>
                <p className="text-xs text-[#78716c]">
                  Estimate {estimate.estimateNumber} • {estimate.clientName}
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

            {/* Financial Status Banner */}
            <div className="grid grid-cols-3 gap-3 bg-[#181818] p-3.5 rounded-xl border border-[#262626]">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716c]">Quote Total</div>
                <div className="font-mono font-bold text-sm text-[#fdfbf7] mt-0.5">${totalEstimate.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716c]">Already Paid</div>
                <div className="font-mono font-bold text-sm text-emerald-400 mt-0.5">${alreadyPaid.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716c]">Balance Remaining</div>
                <div className="font-mono font-bold text-sm text-[#c5a059] mt-0.5">${remainingBalance.toFixed(2)}</div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-[#b8b0a5] mb-2 uppercase tracking-wider">
                Select Payment Method *
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

            {/* Amount Field + Presets */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-[#b8b0a5] uppercase tracking-wider">
                  Payment Amount ($ USD) *
                </label>
                <div className="flex items-center space-x-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(halfDeposit)}
                    className="px-2 py-0.5 rounded bg-[#1f1f1f] border border-[#333] hover:text-[#c5a059] transition"
                  >
                    50% Deposit (${halfDeposit.toFixed(2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(remainingBalance)}
                    className="px-2 py-0.5 rounded bg-[#1f1f1f] border border-[#333] hover:text-[#c5a059] transition"
                  >
                    Full Balance (${remainingBalance.toFixed(2)})
                  </button>
                </div>
              </div>
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
                  placeholder={
                    method === 'check' 
                      ? 'e.g. Check #4812' 
                      : method === 'cashapp' 
                      ? 'e.g. $Cashtag / ID' 
                      : method === 'zelle' 
                      ? 'e.g. Zelle Ref #9482' 
                      : 'e.g. Receipt / Serial #'
                  }
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
                placeholder="Notes describing this payment, material down payment, or milestone..."
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div className="p-3 bg-[#161616] border border-[#222222] rounded-xl flex items-center justify-between text-[11px] text-[#78716c]">
              <span>✓ Auto-logs entry to client & estimate activity history</span>
              <span>✓ Generates printable client receipt</span>
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
                <span>Confirm Payment & Print Receipt</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Immediate Receipt View */}
      {recordedPayment && (
        <PaymentReceiptModal
          isOpen={true}
          onClose={() => {
            setRecordedPayment(null);
            onClose();
          }}
          payment={recordedPayment}
          estimate={estimate}
        />
      )}
    </>
  );
};
