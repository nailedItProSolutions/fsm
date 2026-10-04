'use client';

import React from 'react';
import { EstimatePayment, Estimate } from '@/types';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  DollarSign, 
  Calendar, 
  FileText, 
  ShieldCheck,
  CreditCard,
  Building2
} from 'lucide-react';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: EstimatePayment;
  estimate: Estimate;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  estimate,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getMethodDetails = (method: string) => {
    switch (method) {
      case 'cashapp':
        return { label: 'Cash App', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'zelle':
        return { label: 'Zelle', badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      case 'check':
        return { label: 'Bank Check', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'money_order':
        return { label: 'Money Order', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'cash':
        return { label: 'Cash Currency', badge: 'bg-green-500/20 text-green-400 border-green-500/30' };
      case 'debit_credit':
        return { label: 'Debit / Credit Card', badge: 'bg-sky-500/20 text-sky-400 border-sky-500/30' };
      default:
        return { label: method, badge: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
  };

  const methodInfo = getMethodDetails(payment.method);
  const totalEstimate = Number(estimate.total || 0);
  const allPaidBeforeThis = (estimate.payments || [])
    .filter(p => p.id !== payment.id)
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const totalPaidToDate = allPaidBeforeThis + Number(payment.amount);
  const remainingBalance = Math.max(0, totalEstimate - totalPaidToDate);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#111111] text-[#fdfbf7] rounded-2xl shadow-2xl max-w-2xl w-full border border-[#2a2a2a] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Controls Bar (hidden during print) */}
        <div className="print-hide bg-[#181818] p-4 border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#c5a059] uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Official Client Receipt Generated</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#c5a059] hover:bg-[#b38728] text-black font-bold text-xs rounded-lg transition flex items-center space-x-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Client Copy</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#78716c] hover:text-[#fdfbf7] p-1.5 rounded-lg hover:bg-[#222222] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 sm:p-8 space-y-6 text-xs bg-[#111111]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#262626]">
            <div>
              <img 
                src="/logo.png" 
                alt="Nailed It Property Solutions" 
                className="h-12 w-auto object-contain mb-1" 
              />
              <div className="text-[11px] text-[#b8b0a5] space-y-0.5">
                <div>PO Box 53, Rome, GA 30162</div>
                <div>Office: (706) 844-8193 • contact@naileditprops.com</div>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Official Payment Receipt
              </span>
              <div className="font-mono text-base font-bold text-[#fdfbf7] mt-1.5">
                {payment.receiptNumber}
              </div>
              <div className="text-[11px] text-[#78716c] font-mono mt-0.5">
                Date: {new Date(payment.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Billing & Estimate Details */}
          <div className="grid grid-cols-2 gap-4 bg-[#181818] p-4 rounded-xl border border-[#262626]">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716c] mb-1">
                Client / Payee
              </div>
              <div className="font-bold text-sm text-[#fdfbf7]">{estimate.clientName}</div>
              <div className="text-[#b8b0a5] text-[11px] mt-0.5">{estimate.propertyAddress}</div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716c] mb-1">
                Associated Document
              </div>
              <div className="font-mono font-bold text-xs text-[#c5a059]">
                Estimate {estimate.estimateNumber}
              </div>
              <div className="text-[11px] text-[#b8b0a5] mt-0.5">
                Recorded By: {payment.receivedBy}
              </div>
            </div>
          </div>

          {/* Payment Method & Transaction Breakdown */}
          <div className="border border-[#262626] rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#181818] text-[#78716c] font-bold uppercase text-[10px] border-b border-[#262626]">
                <tr>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Transaction Reference</th>
                  <th className="p-3 text-right">Amount Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                <tr>
                  <td className="p-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${methodInfo.badge}`}>
                      {methodInfo.label}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-[#fdfbf7]">
                    {payment.referenceNumber || 'N/A (Standard Tender)'}
                  </td>
                  <td className="p-3.5 text-right font-mono font-black text-emerald-400 text-sm">
                    ${Number(payment.amount).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {payment.notes && (
            <div className="p-3 bg-[#181818] border border-[#262626] rounded-lg text-[11px] text-[#b8b0a5]">
              <span className="font-bold text-[#fdfbf7]">Payment Memo / Notes: </span>
              <span>{payment.notes}</span>
            </div>
          )}

          {/* Account Balance Summary */}
          <div className="bg-[#181818] p-4 rounded-xl border border-[#262626] space-y-2">
            <div className="flex justify-between text-[#b8b0a5]">
              <span>Total Quoted Estimate Value:</span>
              <span className="font-mono text-[#fdfbf7] font-bold">${totalEstimate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Total Payments & Deposits Received:</span>
              <span className="font-mono">-${totalPaidToDate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#262626] text-sm font-bold text-[#fdfbf7]">
              <span>Remaining Balance Due:</span>
              <span className="font-mono text-[#c5a059] font-black">${remainingBalance.toFixed(2)}</span>
            </div>
          </div>

          {/* Receipt Stamp & Terms */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-[#262626]">
            <div className="text-[10px] text-[#78716c] leading-relaxed max-w-sm">
              Thank you for choosing Nailed It Property Solutions. Keep this receipt for your records. All funds are credited directly to your property service ledger in Rome, GA.
            </div>

            <div className="border-2 border-emerald-500/60 bg-emerald-950/20 px-4 py-2 rounded-lg text-center transform -rotate-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                ★ PAID & ACKNOWLEDGED ★
              </div>
              <div className="text-[9px] font-mono text-emerald-300 mt-0.5">
                Nailed It Operations • Rome, GA
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="print-hide bg-[#181818] p-4 border-t border-[#262626] flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#333333] text-xs font-bold text-[#b8b0a5] hover:bg-[#1a1a1a]"
          >
            Close Receipt
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 rounded-lg bg-[#c5a059] hover:bg-[#b38728] text-black text-xs font-bold shadow-md transition flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
