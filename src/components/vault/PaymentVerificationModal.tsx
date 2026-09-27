'use client';

import React, { useState } from 'react';
import { WeeklyTimesheet, PaymentVerification } from '@/types';
import { 
  X, 
  ShieldCheck, 
  Upload, 
  DollarSign, 
  Calendar, 
  FileText, 
  Lock, 
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

interface PaymentVerificationModalProps {
  timesheet: WeeklyTimesheet;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (timesheetId: string, verification: Omit<PaymentVerification, 'id' | 'verifiedAt'>) => void;
}

export const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({
  timesheet,
  isOpen,
  onClose,
  onVerify,
}) => {
  const [checkNumber, setCheckNumber] = useState(`CHK-${Math.floor(10000 + Math.random() * 90000)}`);
  const [amount, setAmount] = useState(timesheet.totalGrossPay);
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'check' | 'direct_deposit' | 'ach' | 'zelle'>('check');
  const [checkImageUrl, setCheckImageUrl] = useState(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
  );
  const [notes, setNotes] = useState('Floyd County First National Bank Payroll Check issued. Funds cleared.');
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(timesheet.id, {
      checkNumber,
      amount: parseFloat(amount.toString()) || timesheet.totalGrossPay,
      paymentDate,
      paymentMethod,
      checkImageUrl,
      notes,
      verifiedBy: 'Sarah Jenkins (Admin)',
    });
    onClose();
  };

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setCheckImageUrl('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80');
      setIsUploading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#111111] text-[#fdfbf7] rounded-2xl shadow-2xl max-w-lg w-full border border-[#2a2a2a] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#181818] p-5 border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#fdfbf7] font-heading">
                Lock Timesheet & Verify Payment
              </h3>
              <p className="text-xs text-[#b8b0a5]">
                {timesheet.technicianName} • Week {timesheet.weekNumber} ({timesheet.weekStartDate} — {timesheet.weekEndDate})
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

        {/* Warning Callout */}
        <div className="bg-amber-950/30 border-b border-amber-500/30 px-5 py-3 text-xs text-amber-300/90 flex items-start space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#c5a059] flex-shrink-0 mt-0.5" />
          <span>
            <strong>Tamper-Proof Lock Notice:</strong> Attaching payment verification permanently locks this weekly timesheet. The technician cannot alter or delete hours once locked.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Timesheet Summary Stats */}
          <div className="bg-[#161616] p-3.5 rounded-xl border border-[#262626] grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[10px] text-[#78716c] uppercase font-bold">Total Hours</div>
              <div className="text-sm font-bold font-mono text-[#fdfbf7] mt-0.5">{timesheet.totalHours} hrs</div>
            </div>
            <div>
              <div className="text-[10px] text-[#78716c] uppercase font-bold">Hourly Rate</div>
              <div className="text-sm font-bold font-mono text-[#c5a059] mt-0.5">${timesheet.hourlyRate.toFixed(2)}/hr</div>
            </div>
            <div>
              <div className="text-[10px] text-[#78716c] uppercase font-bold">Gross Pay Due</div>
              <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">${timesheet.totalGrossPay.toFixed(2)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e: any) => setPaymentMethod(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              >
                <option value="check">Company Payroll Check</option>
                <option value="direct_deposit">Direct Deposit / ACH</option>
                <option value="zelle">Zelle Corporate Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
                Check # / Reference ID *
              </label>
              <input
                type="text"
                value={checkNumber}
                onChange={(e) => setCheckNumber(e.target.value)}
                required
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#fdfbf7] font-mono focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
                Verified Amount ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-[#78716c] font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg pl-7 pr-3 py-2 text-[#fdfbf7] font-mono font-bold focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
                Payment Cleared Date *
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          {/* Check Image Upload / Proof */}
          <div>
            <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
              Check Image or Bank Payment Receipt *
            </label>
            <div className="border border-dashed border-[#333333] bg-[#161616] rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                {checkImageUrl ? (
                  <img
                    src={checkImageUrl}
                    alt="Check Proof Preview"
                    className="w-14 h-10 object-cover rounded-lg border border-[#333333]"
                  />
                ) : (
                  <div className="w-14 h-10 bg-[#222222] rounded-lg flex items-center justify-center text-[#78716c]">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <div className="font-bold text-[#fdfbf7] text-xs">
                    {checkImageUrl ? 'check_receipt_verified.jpg' : 'No image attached'}
                  </div>
                  <div className="text-[10px] text-[#78716c]">Attached to weekly record permanently</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSimulateUpload}
                disabled={isUploading}
                className="bg-[#242424] hover:bg-[#2c2c2c] text-[#c5a059] border border-[#c5a059]/40 text-[11px] font-bold px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Uploading...' : 'Upload New Image'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
              Payroll Notes & Verification Log
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2 border-t border-[#262626]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#b8b0a5] hover:text-[#fdfbf7] hover:bg-[#1e1e1e] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify & Permanently Lock Timesheet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
