'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useFSMStore } from '@/lib/useStore';
import { DailyWorkLog, WeeklyTimesheet } from '@/types';
import { LockedTimesheetPdfModal } from './LockedTimesheetPdfModal';
import { 
  Lock, 
  Calendar, 
  Clock, 
  DollarSign, 
  Building2, 
  CheckCircle2, 
  FileText, 
  Eye, 
  AlertCircle,
  FileCheck2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const TechVaultView: React.FC = () => {
  const { user } = useAuth();
  const { getDailyWorkLogsByTechId, getWeeklyTimesheetsByTechId, dailyWorkLogs } = useFSMStore();

  const currentTechId = user?.role === 'technician' ? user.uid : 'user-tech-1';
  const techDisplayName = user?.role === 'technician' ? user.displayName : 'Mike Rivera (Lead Field Tech)';
  const myDailyLogs = getDailyWorkLogsByTechId(currentTechId);
  const myWeeklyTimesheets = getWeeklyTimesheetsByTechId(currentTechId);

  const [viewingPdfTimesheet, setViewingPdfTimesheet] = useState<WeeklyTimesheet | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'logs' | 'pay'>('logs');

  // Compute Totals
  const totalHoursLogged = myDailyLogs.reduce((acc, log) => acc + (log.totalHours || 0), 0);
  const paidTimesheets = myWeeklyTimesheets.filter((t) => t.status === 'verified_paid');
  const totalVerifiedEarnings = paidTimesheets.reduce(
    (acc, t) => acc + (t.netPay !== undefined ? t.netPay : (t.totalGrossPay || 0)),
    0
  );
  const pendingTimesheets = myWeeklyTimesheets.filter((t) => t.status !== 'verified_paid');
  const pendingHours = pendingTimesheets.reduce((acc, t) => acc + (t.totalHours || 0), 0);

  return (
    <div className="space-y-6 text-[#fdfbf7]">
      {/* Header Banner */}
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#FF8A00] mb-1">
            <UserCheck className="w-4 h-4 text-[#c5a059]" />
            <span>Technician Portal • Personal Vault</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-[#fdfbf7]">
            {techDisplayName} Timesheet & Pay Vault
          </h1>
          <p className="text-xs text-[#b8b0a5] mt-1 max-w-2xl">
            Restricted historical daily logs and weekly compensation summaries. Timesheets verified and locked by administration cannot be modified.
          </p>
        </div>

        <div className="bg-[#161616] px-4 py-2.5 rounded-xl border border-[#262626] text-right shrink-0">
          <div className="text-[10px] text-[#78716c] uppercase font-bold">Standard Compensation</div>
          <div className="text-base font-bold font-mono text-[#c5a059]">$35.00 / hr</div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111111] border border-[#222222] p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-[#78716c] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Hours Logged</span>
            <Clock className="w-4 h-4 text-[#c5a059]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#fdfbf7]">{totalHoursLogged.toFixed(1)} hrs</div>
          <div className="text-[11px] text-[#78716c] mt-1">{myDailyLogs.length} total shifts recorded</div>
        </div>

        <div className="bg-[#111111] border border-[#222222] p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-[#78716c] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Verified Paid Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">${totalVerifiedEarnings.toFixed(2)}</div>
          <div className="text-[11px] text-emerald-400/80 mt-1">{paidTimesheets.length} week(s) paid in full</div>
        </div>

        <div className="bg-[#111111] border border-[#222222] p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center text-[#78716c] mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Review Hours</span>
            <Lock className="w-4 h-4 text-[#FF8A00]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#FF8A00]">{pendingHours.toFixed(1)} hrs</div>
          <div className="text-[11px] text-[#78716c] mt-1">{pendingTimesheets.length} week(s) awaiting payroll audit</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-[#222222] flex space-x-6 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('logs')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition ${
            activeSubTab === 'logs'
              ? 'border-[#c5a059] text-[#c5a059]'
              : 'border-transparent text-[#b8b0a5] hover:text-[#fdfbf7]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>My Daily Work Logs ({myDailyLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pay')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition ${
            activeSubTab === 'pay'
              ? 'border-[#c5a059] text-[#c5a059]'
              : 'border-transparent text-[#b8b0a5] hover:text-[#fdfbf7]'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-[#FF8A00]" />
          <span>My Weekly Pay Summaries ({myWeeklyTimesheets.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: MY DAILY LOGS */}
      {activeSubTab === 'logs' && (
        <div className="space-y-4">
          <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-[#222222] text-left text-xs">
              <thead className="bg-[#161616] text-[#78716c] text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Work Date</th>
                  <th className="px-5 py-3.5">Shift Window</th>
                  <th className="px-5 py-3.5">Property Location</th>
                  <th className="px-5 py-3.5">Trade Category</th>
                  <th className="px-5 py-3.5">Completed Tasks</th>
                  <th className="px-5 py-3.5 text-right">Hours</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {myDailyLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#161616] transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#c5a059] whitespace-nowrap">
                      {log.date}
                    </td>
                    <td className="px-5 py-3.5 text-[#b8b0a5] font-mono whitespace-nowrap">
                      {log.startTime} — {log.stopTime}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#fdfbf7]">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#78716c]" />
                        {log.propertyLocation}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="bg-[#242424] text-[#b8b0a5] border border-[#333333] px-2 py-0.5 rounded text-[10px] font-semibold">
                        {log.jobCategory}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#b8b0a5] max-w-sm">
                      {log.taskDetails}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-[#fdfbf7]">
                      {log.totalHours.toFixed(1)} hrs
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {log.weeklyTimesheetId ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase inline-flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Locked</span>
                        </span>
                      ) : (
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Logged
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {myDailyLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[#78716c]">
                      No daily shifts recorded for your technician profile yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MY WEEKLY PAY SUMMARIES */}
      {activeSubTab === 'pay' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {myWeeklyTimesheets.map((sheet) => {
              const isLocked = sheet.locked;

              return (
                <div
                  key={sheet.id}
                  className={`bg-[#111111] border rounded-2xl p-6 shadow-sm space-y-4 transition ${
                    isLocked ? 'border-emerald-500/40 bg-gradient-to-b from-[#131a15] to-[#111111]' : 'border-[#222222]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#222222]">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-sm text-[#c5a059]">
                          Week {sheet.weekNumber} ({sheet.year})
                        </span>
                        {isLocked ? (
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase inline-flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Locked • Verified Paid</span>
                          </span>
                        ) : (
                          <span className="bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Pending Review</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#b8b0a5] mt-1">
                        Billing Period: {sheet.weekStartDate} thru {sheet.weekEndDate}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-xs font-mono text-[#b8b0a5]">
                          {sheet.totalHours.toFixed(1)} hrs @ ${sheet.hourlyRate.toFixed(2)}/hr
                        </div>
                        <div className="text-base font-black font-mono text-emerald-400">
                          Net: ${(sheet.netPay !== undefined ? sheet.netPay : sheet.totalGrossPay).toFixed(2)}
                        </div>
                        {((sheet.totalBonuses || 0) > 0 || (sheet.totalDeductions || 0) > 0) && (
                          <div className="text-[10px] font-mono text-[#78716c]">
                            +${(sheet.totalBonuses || 0).toFixed(0)} bon / -${(sheet.totalDeductions || 0).toFixed(0)} ded
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setViewingPdfTimesheet(sheet)}
                        className="bg-[#1f1f1f] hover:bg-[#282828] text-[#fdfbf7] border border-[#333333] text-xs font-bold px-3 py-2 rounded-xl transition flex items-center space-x-1.5 shadow"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span>View Document</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Lock Proof Banner */}
                  {isLocked && sheet.paymentVerification ? (
                    <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Payroll Verified & Cleared via {sheet.paymentVerification.paymentMethod === 'check' ? 'Company Check' : 'Bank Transfer'}</span>
                        </div>
                        <div className="text-[11px] text-emerald-200/80">
                          Ref: <strong className="font-mono text-white">{sheet.paymentVerification.checkNumber}</strong> • Paid: <strong className="text-white">{sheet.paymentVerification.paymentDate}</strong> • Verified by: {sheet.paymentVerification.verifiedBy}
                        </div>
                      </div>

                      <div className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30 shrink-0 font-mono">
                        🔒 Tamper-Proof Locked
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#161616] p-3 rounded-xl border border-[#242424] text-[11px] text-[#78716c] flex items-center justify-between">
                      <span>This weekly timesheet is pending review and approval by administration.</span>
                      <span className="text-[#FF8A00] font-semibold">Editable until verified</span>
                    </div>
                  )}
                </div>
              );
            })}

            {myWeeklyTimesheets.length === 0 && (
              <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 text-center text-[#78716c]">
                No weekly timesheets generated yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF Document Modal */}
      {viewingPdfTimesheet && (
        <LockedTimesheetPdfModal
          timesheet={viewingPdfTimesheet}
          logs={dailyWorkLogs.filter((l) => viewingPdfTimesheet.dailyLogIds.includes(l.id))}
          isOpen={Boolean(viewingPdfTimesheet)}
          onClose={() => setViewingPdfTimesheet(null)}
        />
      )}
    </div>
  );
};
