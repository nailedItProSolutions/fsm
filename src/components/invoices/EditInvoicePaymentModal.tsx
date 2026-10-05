'use client';

import React, { useState, useEffect } from 'react';
import { Invoice } from '@/types';
import { useActiveFSMData } from '@/lib/useStore';
import { 
  X, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  Pencil,
  Receipt,
  Clock
} from 'lucide-react';

interface EditInvoicePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onPaymentUpdated?: (updated: Invoice) => void;
}

export const EditInvoicePaymentModal: React.FC<EditInvoicePaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onPaymentUpdated,
}) => {
  const { updateInvoicePayment } = useActiveFSMData();

  const [amountPaid, setAmountPaid] = useState<string>((invoice.amountPaid || 0).toString());
  const [status, setStatus] = useState<Invoice['status']>(invoice.status);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invoice) {
      setAmountPaid((invoice.amountPaid || 0).toString());
      setStatus(invoice.status);
      setError(null);
    }
  }, [invoice]);

  if (!isOpen) return null;

  const total = Number(invoice.total || 0);
  const parsedPaid = parseFloat(amountPaid) || 0;
  const computedBalance = Math.max(0, total - parsedPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericPaid = parseFloat(amountPaid);
    if (isNaN(numericPaid) || numericPaid < 0) {
      setError('Please enter a valid payment amount (zero or greater).');
      return;
    }

    try {
      const updated = updateInvoicePayment(invoice.id, {
        amountPaid: numericPaid,
        status,
        notes: notes.trim() || undefined,
      });

      if (onPaymentUpdated) {
        onPaymentUpdated(updated);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update invoice payment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#111111] text-[#fdfbf7] rounded-2xl shadow-2xl max-w-lg w-full border border-[#2a2a2a] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#181818] p-5 border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c5a059] flex items-center justify-center text-black font-bold">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#fdfbf7]">Edit Invoice Payment</h3>
                <span className="font-mono text-xs font-bold text-[#c5a059] bg-[#141414] px-2 py-0.5 rounded border border-[#c5a059]/30">
                  {invoice.invoiceNumber}
                </span>
              </div>
              <p className="text-xs text-[#78716c] mt-0.5">
                {invoice.clientName} • Job #{invoice.jobNumber}
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

          {/* Financial Breakdown */}
          <div className="grid grid-cols-3 gap-3 bg-[#181818] p-3.5 rounded-xl border border-[#262626]">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716c]">Invoice Total</div>
              <div className="font-mono font-bold text-sm text-[#fdfbf7] mt-0.5">${total.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716c]">Amount Paid</div>
              <div className="font-mono font-bold text-sm text-emerald-400 mt-0.5">${parsedPaid.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716c]">Balance Remaining</div>
              <div className="font-mono font-bold text-sm text-[#c5a059] mt-0.5">${computedBalance.toFixed(2)}</div>
            </div>
          </div>

          {/* Amount Paid Field + Quick Buttons */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-[#b8b0a5] uppercase tracking-wider">
                Amount Paid ($ USD) *
              </label>
              <div className="flex items-center space-x-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => setAmountPaid('0.00')}
                  className="px-2 py-0.5 rounded bg-[#1f1f1f] border border-[#333] hover:text-[#c5a059] transition"
                >
                  $0 (Unpaid)
                </button>
                <button
                  type="button"
                  onClick={() => setAmountPaid((total / 2).toFixed(2))}
                  className="px-2 py-0.5 rounded bg-[#1f1f1f] border border-[#333] hover:text-[#c5a059] transition"
                >
                  50% (${(total / 2).toFixed(2)})
                </button>
                <button
                  type="button"
                  onClick={() => setAmountPaid(total.toFixed(2))}
                  className="px-2 py-0.5 rounded bg-[#1f1f1f] border border-[#333] hover:text-[#c5a059] transition"
                >
                  Full (${total.toFixed(2)})
                </button>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-[#c5a059]">$</span>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                value={amountPaid}
                onChange={(e) => {
                  const val = e.target.value;
                  setAmountPaid(val);
                  const num = parseFloat(val) || 0;
                  if (num >= total) {
                    setStatus('paid');
                  } else if (num === 0 && status === 'paid') {
                    setStatus('sent');
                  }
                }}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg pl-8 pr-4 py-2.5 text-sm font-mono font-bold text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          {/* Status Override */}
          <div>
            <label className="block text-xs font-bold text-[#b8b0a5] mb-1.5 uppercase tracking-wider">
              Invoice Status
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['sent', 'paid', 'overdue', 'draft'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`p-2 rounded-lg border font-bold text-xs uppercase tracking-wider transition ${
                    status === st
                      ? 'border-[#c5a059] bg-[#c5a059]/15 text-[#c5a059]'
                      : 'border-[#262626] bg-[#161616] text-[#78716c] hover:bg-[#202020]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
              Payment Adjustment Reason / Note (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Check cleared via Floyd County Bank, manual payment correction..."
              className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          <div className="p-3 bg-[#161616] border border-[#222222] rounded-xl flex items-center justify-between text-[11px] text-[#78716c]">
            <span>✓ Recalculates balance due & customer lifetime spend</span>
            <span>✓ Certified in audit trail</span>
          </div>

          {/* Actions */}
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
              <span>Save Payment Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
