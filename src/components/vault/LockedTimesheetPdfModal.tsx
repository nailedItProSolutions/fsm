'use client';

import React from 'react';
import { WeeklyTimesheet, DailyWorkLog } from '@/types';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  Lock, 
  Calendar, 
  User, 
  DollarSign, 
  FileCheck2,
  Building2,
  Clock,
  Sparkles,
  Edit3,
  Gift,
  Receipt
} from 'lucide-react';

interface LockedTimesheetPdfModalProps {
  timesheet: WeeklyTimesheet;
  logs: DailyWorkLog[];
  isOpen: boolean;
  onClose: () => void;
  onEditAudit?: () => void;
}

export const LockedTimesheetPdfModal: React.FC<LockedTimesheetPdfModalProps> = ({
  timesheet,
  logs,
  isOpen,
  onClose,
  onEditAudit,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isVerified = timesheet.status === 'verified_paid' && timesheet.locked;
  const effectiveNetPay = timesheet.netPay !== undefined ? timesheet.netPay : timesheet.totalGrossPay;
  const totalBonuses = timesheet.totalBonuses !== undefined 
    ? timesheet.totalBonuses 
    : (timesheet.bonuses?.reduce((s, b) => s + (b.amount || 0), 0) || 0);
  const totalDeductions = timesheet.totalDeductions !== undefined 
    ? timesheet.totalDeductions 
    : (timesheet.deductions?.reduce((s, d) => s + (d.amountPaid || 0), 0) || 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#121212] text-[#fdfbf7] rounded-2xl shadow-2xl max-w-3xl w-full border border-[#2a2a2a] overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Top Control Bar */}
        <div className="bg-[#1a1a1a] p-4 border-b border-[#292929] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Official Document
            </span>
            <span className="text-xs font-mono font-bold text-[#b8b0a5]">
              {timesheet.id}
            </span>
            {timesheet.auditConfirmed && (
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                ✓ Payroll Audited
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {onEditAudit && !isVerified && (
              <button
                onClick={onEditAudit}
                className="bg-[#242424] hover:bg-[#2e2e2e] text-[#c5a059] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#c5a059]/40 transition flex items-center space-x-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#FF8A00]" />
                <span>Edit Pay & Adjustments</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="bg-[#242424] hover:bg-[#2e2e2e] text-[#fdfbf7] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#383838] transition flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#78716c] hover:text-[#fdfbf7] p-1.5 rounded-lg hover:bg-[#222222] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Timesheet Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 bg-[#0f0f0f] text-xs">
          {/* Company & Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#262626] pb-6">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-[#c5a059] flex items-center justify-center text-black font-extrabold text-lg">
                  N
                </div>
                <div>
                  <h1 className="text-base font-bold font-heading text-[#fdfbf7] tracking-tight">
                    NAILED IT PROPERTY SOLUTIONS
                  </h1>
                  <p className="text-[11px] text-[#78716c]">
                    Floyd County Operations • Rome, GA 30165 • (706) 844-8193
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold uppercase tracking-wider text-[#c5a059]">
                WEEKLY TIME & LABOR AUDIT
              </div>
              <div className="text-base font-bold font-mono text-[#fdfbf7] mt-0.5">
                Week {timesheet.weekNumber} • {timesheet.year}
              </div>
              <div className="text-[11px] text-[#78716c]">
                Cycle: {timesheet.weekStartDate} thru {timesheet.weekEndDate}
              </div>
            </div>
          </div>

          {/* Technician & Security Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-[#161616] p-4 rounded-xl border border-[#242424]">
            <div>
              <span className="text-[10px] text-[#78716c] uppercase font-bold">Technician Name</span>
              <div className="text-sm font-bold text-[#fdfbf7] mt-0.5">{timesheet.technicianName}</div>
              <div className="text-[10px] text-[#78716c]">ID: {timesheet.technicianId}</div>
            </div>

            <div>
              <span className="text-[10px] text-[#78716c] uppercase font-bold">Hourly Compensation</span>
              <div className="text-sm font-bold font-mono text-[#c5a059] mt-0.5">
                ${timesheet.hourlyRate.toFixed(2)}/hr
              </div>
              <div className="text-[10px] text-[#78716c]">
                Logged: {timesheet.totalHours.toFixed(1)} hrs • Gross: ${timesheet.totalGrossPay.toFixed(2)}
              </div>
            </div>

            {/* AUDITED NET PAY IN BOLD */}
            <div>
              <span className="text-[10px] text-emerald-400 uppercase font-black tracking-wider">
                Audited Net Pay
              </span>
              <div className="text-base font-black font-mono text-emerald-400 mt-0.5">
                ${effectiveNetPay.toFixed(2)}
              </div>
              <div className="text-[10px] text-[#78716c]">
                +{totalBonuses.toFixed(2)} bon / -{totalDeductions.toFixed(2)} ded
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#78716c] uppercase font-bold">Audit Status</span>
              <div className="mt-1">
                {isVerified ? (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase inline-flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>LOCKED & PAID</span>
                  </span>
                ) : (
                  <span className="bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>PENDING VERIFICATION</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Daily Work Summaries Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs text-[#fdfbf7] uppercase tracking-wider font-heading flex items-center justify-between">
              <span>Itemized Daily Work Summaries ({logs.length} entries)</span>
              <span className="text-[10px] text-[#78716c] font-normal lowercase">Chronologically sorted by work date</span>
            </h3>

            <div className="border border-[#222222] rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-[#222222] text-left">
                <thead className="bg-[#181818] text-[#78716c] text-[10px] uppercase font-bold">
                  <tr>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Shift Window</th>
                    <th className="px-4 py-2.5">Location / Property</th>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5">Task Description</th>
                    <th className="px-4 py-2.5 text-right">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1e1e] text-xs">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#161616]">
                      <td className="px-4 py-3 font-mono font-bold text-[#c5a059] whitespace-nowrap">
                        {log.date}
                      </td>
                      <td className="px-4 py-3 text-[#b8b0a5] whitespace-nowrap">
                        {log.startTime} — {log.stopTime}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#fdfbf7]">
                        {log.propertyLocation}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-[#242424] text-[#b8b0a5] px-2 py-0.5 rounded text-[10px] font-semibold">
                          {log.jobCategory}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#b8b0a5] max-w-xs line-clamp-2">
                        {log.taskDetails}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-[#fdfbf7]">
                        {log.totalHours.toFixed(1)}
                      </td>
                    </tr>
                  ))}

                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-[#78716c]">
                        No individual daily logs attached to this period.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-[#161616] font-bold border-t border-[#262626]">
                  <tr>
                    <td colSpan={5} className="px-4 py-2.5 text-right uppercase text-[10px] text-[#78716c]">
                      Aggregated Regular Hours:
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-sm text-[#fdfbf7]">
                      {timesheet.totalHours.toFixed(1)} hrs
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="px-4 py-2 text-right uppercase text-[10px] text-[#78716c]">
                      Base Hourly Pay Rate:
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-xs text-[#c5a059]">
                      ${timesheet.hourlyRate.toFixed(2)}/hr
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="px-4 py-2.5 text-right uppercase text-[10px] text-[#78716c]">
                      Base Gross Payroll:
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-sm text-[#fdfbf7]">
                      ${timesheet.totalGrossPay.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* ITEM 2: ADDED BONUSES (If any exist) */}
          {timesheet.bonuses && timesheet.bonuses.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-xs text-[#fdfbf7] uppercase tracking-wider font-heading flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Gift className="w-3.5 h-3.5" />
                  Itemized Added Bonuses & Incentives ({timesheet.bonuses.length})
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  +${totalBonuses.toFixed(2)}
                </span>
              </h3>

              <div className="border border-[#222222] rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-[#222222] text-left text-xs">
                  <thead className="bg-[#181818] text-[#78716c] text-[10px] uppercase font-bold">
                    <tr>
                      <th className="px-4 py-2">Bonus / Incentive Description</th>
                      <th className="px-4 py-2">Responsible Property Owner</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e1e]">
                    {timesheet.bonuses.map((b) => (
                      <tr key={b.id} className="hover:bg-[#161616]">
                        <td className="px-4 py-2.5 font-bold text-[#fdfbf7]">
                          {b.description}
                        </td>
                        <td className="px-4 py-2.5 text-[#b8b0a5] flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[#c5a059]" />
                          <span>{b.propertyOwner}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-400">
                          +${b.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ITEM 3: PAYROLL DEDUCTIONS (If any exist) */}
          {timesheet.deductions && timesheet.deductions.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-xs text-[#fdfbf7] uppercase tracking-wider font-heading flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-red-400">
                  <Receipt className="w-3.5 h-3.5" />
                  Itemized Payroll Deductions & Advances ({timesheet.deductions.length})
                </span>
                <span className="text-[10px] text-red-400 font-mono font-bold">
                  -${totalDeductions.toFixed(2)}
                </span>
              </h3>

              <div className="border border-[#222222] rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-[#222222] text-left text-xs">
                  <thead className="bg-[#181818] text-[#78716c] text-[10px] uppercase font-bold">
                    <tr>
                      <th className="px-4 py-2">Deduction Description</th>
                      <th className="px-4 py-2 text-right">Total Assessed</th>
                      <th className="px-4 py-2 text-right">Deducted This Cycle</th>
                      <th className="px-4 py-2 text-right">Remaining Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e1e]">
                    {timesheet.deductions.map((d) => (
                      <tr key={d.id} className="hover:bg-[#161616]">
                        <td className="px-4 py-2.5 font-bold text-[#fdfbf7]">
                          {d.description}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-[#78716c]">
                          ${d.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-red-400">
                          -${d.amountPaid.toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-amber-400">
                          ${d.remainingBalance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* OFFICIAL AUDIT SUMMARY WITH BOLD NET PAY */}
          <div className="bg-[#141414] border-2 border-[#2b2b2b] rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#222222]">
              <span className="text-[10px] uppercase font-bold text-[#78716c] tracking-wider">
                Audited Compensation Breakdown
              </span>
              <span className="text-[10px] font-mono text-[#c5a059]">
                {timesheet.totalHours.toFixed(1)} Regular Hours @ ${timesheet.hourlyRate.toFixed(2)}/hr
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-[#b8b0a5]">
                <span>Base Gross Payroll (Hours × Rate):</span>
                <span className="font-mono">${timesheet.totalGrossPay.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-400">
                <span>Total Added Bonuses & Performance Incentives:</span>
                <span className="font-mono font-bold">+${totalBonuses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-red-400">
                <span>Total Payroll Deductions Applied:</span>
                <span className="font-mono font-bold">-${totalDeductions.toFixed(2)}</span>
              </div>
            </div>

            {/* BOLD NET PAY CALLOUT */}
            <div className="pt-3 border-t border-[#262626] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-[#191919] p-4 rounded-lg">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 block">
                  Official Net Disbursable Compensation
                </span>
                <span className="text-[11px] text-[#78716c]">
                  Certified Tamper-Proof Gross to Net Amount
                </span>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
                  Net Pay: ${effectiveNetPay.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Verification Attachment Section */}
          {isVerified && timesheet.paymentVerification && (
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-emerald-300 uppercase text-xs">
                    Attached Payment Verification (Tamper-Proof Lock)
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400/80 font-mono">
                  Verified {new Date(timesheet.paymentVerification.verifiedAt).toLocaleDateString()} by {timesheet.paymentVerification.verifiedBy}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] bg-[#141414] p-3 rounded-lg border border-[#262626]">
                <div>
                  <span className="text-[#78716c]">Reference / Check #:</span>
                  <div className="font-mono font-bold text-[#fdfbf7]">
                    {timesheet.paymentVerification.checkNumber || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-[#78716c]">Net Amount Paid:</span>
                  <div className="font-mono font-bold text-emerald-400">
                    ${timesheet.paymentVerification.amount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-[#78716c]">Method / Date:</span>
                  <div className="font-bold text-[#fdfbf7] capitalize">
                    {timesheet.paymentVerification.paymentMethod} • {timesheet.paymentVerification.paymentDate}
                  </div>
                </div>
              </div>

              {timesheet.paymentVerification.checkImageUrl && (
                <div className="pt-2">
                  <span className="text-[10px] text-[#78716c] uppercase font-bold block mb-1.5">
                    Attached Bank Check Voucher Proof:
                  </span>
                  <div className="relative max-w-sm rounded-lg overflow-hidden border border-[#333333]">
                    <img
                      src={timesheet.paymentVerification.checkImageUrl}
                      alt="Check Voucher Image"
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/75 p-1.5 text-[9px] font-mono text-emerald-300 text-center">
                      ✓ Permanently Cryptographically Bound to {timesheet.id}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Document Footer */}
          <div className="pt-4 border-t border-[#222222] flex flex-col sm:flex-row justify-between items-center text-[10px] text-[#78716c] gap-2">
            <div>
              Nailed It FSM Platform • Automated AI Timesheet Aggregation Engine
            </div>
            <div className="font-mono">
              Generated: {new Date().toISOString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
