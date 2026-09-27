'use client';

import React, { useState } from 'react';
import { WeeklyTimesheet, TimesheetBonus, TimesheetDeduction } from '@/types';
import { STANDARD_HOURLY_RATES, calculateNetPay } from '@/lib/ocrEngine';
import { useFSMStore } from '@/lib/useStore';
import { 
  X, 
  DollarSign, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Clock, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface TimesheetAuditModalProps {
  timesheet: WeeklyTimesheet;
  isOpen: boolean;
  onClose: () => void;
  onConfirmAudit: (timesheetId: string, updates: {
    hourlyRate: number;
    bonuses: TimesheetBonus[];
    deductions: TimesheetDeduction[];
    auditConfirmed: boolean;
  }) => void;
}

export const TimesheetAuditModal: React.FC<TimesheetAuditModalProps> = ({
  timesheet,
  isOpen,
  onClose,
  onConfirmAudit,
}) => {
  const { clients } = useFSMStore();

  // Hourly Rate state
  const [hourlyRate, setHourlyRate] = useState<number>(timesheet.hourlyRate || 35.0);
  const [customRateInput, setCustomRateInput] = useState<string>(
    STANDARD_HOURLY_RATES.includes(timesheet.hourlyRate as any) ? '' : timesheet.hourlyRate.toString()
  );

  // Confirmation of Base Hours & Gross Pay
  const [baseConfirmed, setBaseConfirmed] = useState<boolean>(timesheet.auditConfirmed || false);

  // Bonuses state
  const [hasBonuses, setHasBonuses] = useState<boolean>(
    Boolean(timesheet.bonuses && timesheet.bonuses.length > 0)
  );
  const [bonuses, setBonuses] = useState<TimesheetBonus[]>(timesheet.bonuses || []);
  const [bonusDesc, setBonusDesc] = useState('');
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusOwner, setBonusOwner] = useState(
    clients[0] 
      ? (clients[0].companyName || `${clients[0].firstName} ${clients[0].lastName}`.trim()) 
      : 'Apex Property Management'
  );
  const [customOwner, setCustomOwner] = useState('');

  // Deductions state
  const [hasDeductions, setHasDeductions] = useState<boolean>(
    Boolean(timesheet.deductions && timesheet.deductions.length > 0)
  );
  const [deductions, setDeductions] = useState<TimesheetDeduction[]>(timesheet.deductions || []);
  const [deductDesc, setDeductDesc] = useState('');
  const [deductAmount, setDeductAmount] = useState('');
  const [deductPaid, setDeductPaid] = useState('');
  const [deductRemaining, setDeductRemaining] = useState('');

  if (!isOpen) return null;

  // Real-time calculations
  const totalHours = timesheet.totalHours || 0;
  const currentGrossPay = Math.round(totalHours * hourlyRate * 100) / 100;
  const calc = calculateNetPay(currentGrossPay, bonuses, deductions);

  // Handle Preset Rate selection
  const handleSelectPresetRate = (rate: number) => {
    setHourlyRate(rate);
    setCustomRateInput('');
  };

  const handleCustomRateChange = (val: string) => {
    setCustomRateInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setHourlyRate(parsed);
    }
  };

  // Bonus handling
  const handleAddBonus = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(bonusAmount);
    if (!bonusDesc.trim() || isNaN(amountNum) || amountNum <= 0) return;

    const propertyOwnerName = bonusOwner === 'custom' ? customOwner.trim() || 'General Property' : bonusOwner;

    const newBonus: TimesheetBonus = {
      id: `bonus-${Date.now()}`,
      description: bonusDesc.trim(),
      amount: Math.round(amountNum * 100) / 100,
      propertyOwner: propertyOwnerName,
    };

    setBonuses((prev) => [...prev, newBonus]);
    setBonusDesc('');
    setBonusAmount('');
    setCustomOwner('');
  };

  const handleRemoveBonus = (id: string) => {
    setBonuses((prev) => prev.filter((b) => b.id !== id));
  };

  // Deduction handling
  const handleAddDeduction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(deductAmount);
    const paidNum = parseFloat(deductPaid) || 0;
    if (!deductDesc.trim() || isNaN(amountNum) || amountNum <= 0) return;

    const remainingNum = deductRemaining !== '' ? parseFloat(deductRemaining) : Math.max(0, amountNum - paidNum);

    const newDeduct: TimesheetDeduction = {
      id: `deduct-${Date.now()}`,
      description: deductDesc.trim(),
      amount: Math.round(amountNum * 100) / 100,
      amountPaid: Math.round(paidNum * 100) / 100,
      remainingBalance: Math.round((isNaN(remainingNum) ? 0 : remainingNum) * 100) / 100,
    };

    setDeductions((prev) => [...prev, newDeduct]);
    setDeductDesc('');
    setDeductAmount('');
    setDeductPaid('');
    setDeductRemaining('');
  };

  const handleRemoveDeduction = (id: string) => {
    setDeductions((prev) => prev.filter((d) => d.id !== id));
  };

  // Final Confirmation
  const handleSaveAndConfirm = () => {
    onConfirmAudit(timesheet.id, {
      hourlyRate,
      bonuses: hasBonuses ? bonuses : [],
      deductions: hasDeductions ? deductions : [],
      auditConfirmed: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#121212] text-[#fdfbf7] rounded-2xl shadow-2xl max-w-2xl w-full border border-[#2a2a2a] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#181818] p-5 border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#c5a059]/20 text-[#c5a059] flex items-center justify-center border border-[#c5a059]/30">
              <ShieldCheck className="w-5 h-5 text-[#FF8A00]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold text-[#c5a059] tracking-wider">
                  Timesheet Payroll Audit & Confirmation
                </span>
                <span className="bg-[#242424] text-[#b8b0a5] text-[10px] font-mono px-2 py-0.5 rounded">
                  Week {timesheet.weekNumber}
                </span>
              </div>
              <h2 className="text-base font-bold font-heading text-[#fdfbf7] mt-0.5">
                Compensation Audit for {timesheet.technicianName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#78716c] hover:text-[#fdfbf7] p-1.5 rounded-lg hover:bg-[#222222] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Audit Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs bg-[#0f0f0f]">
          {/* Audit Notice */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3.5 flex items-start space-x-2.5 text-[#b8b0a5]">
            <AlertCircle className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Official Timesheet Audit Protocol:</strong> Review base hours, select or edit the technician&apos;s applicable hourly pay rate, verify added bonuses with the responsible property owner, and itemize any wage deductions. Final Net Pay will be locked onto the official timesheet document.
            </p>
          </div>

          {/* STEP 1: HOURLY PAY RATE & BASE HOURS */}
          <div className="bg-[#141414] border border-[#242424] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#c5a059] text-black font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#fdfbf7] font-heading">
                  Hourly Pay Rate & Base Gross Pay Review
                </h3>
              </div>
              <span className="text-[11px] text-[#78716c]">
                Cycle: {timesheet.weekStartDate} — {timesheet.weekEndDate}
              </span>
            </div>

            {/* Quick-Select Hourly Rates */}
            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-2">
                Select Technician Hourly Rate (Historical Presets over Past Year):
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {STANDARD_HOURLY_RATES.map((rate) => {
                  const isSelected = hourlyRate === rate && !customRateInput;
                  return (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => handleSelectPresetRate(rate)}
                      className={`py-2 px-3 rounded-lg font-mono font-bold text-xs transition border flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-[#c5a059] text-black border-[#c5a059] shadow-md'
                          : 'bg-[#1a1a1a] text-[#fdfbf7] border-[#303030] hover:bg-[#252525] hover:border-[#404040]'
                      }`}
                    >
                      <span className="text-sm">${rate}</span>
                      <span className="text-[9px] opacity-75">/ hr</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Rate Input */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
                Or Enter Custom Hourly Rate ($/hr):
              </label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-2 text-[#78716c] font-bold">$</span>
                <input
                  type="number"
                  step="0.50"
                  min="10"
                  placeholder="Custom rate, e.g. 28.50"
                  value={customRateInput}
                  onChange={(e) => handleCustomRateChange(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg pl-7 pr-12 py-2 text-[#fdfbf7] font-mono font-bold text-xs focus:outline-none focus:border-[#c5a059]"
                />
                <span className="absolute right-3 top-2 text-[10px] text-[#78716c]">/ hr</span>
              </div>
            </div>

            {/* Base Calculation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-[#1b1b1b] p-3 rounded-lg border border-[#2a2a2a] text-center">
                <span className="text-[10px] text-[#78716c] uppercase font-bold">Total Work Hours</span>
                <div className="text-lg font-mono font-bold text-[#fdfbf7] mt-0.5">
                  {totalHours.toFixed(1)} hrs
                </div>
                <span className="text-[10px] text-[#78716c]">
                  {timesheet.dailyLogIds?.length || 0} shifts logged
                </span>
              </div>

              <div className="bg-[#1b1b1b] p-3 rounded-lg border border-[#2a2a2a] text-center">
                <span className="text-[10px] text-[#78716c] uppercase font-bold">Applied Hourly Rate</span>
                <div className="text-lg font-mono font-bold text-[#c5a059] mt-0.5">
                  ${hourlyRate.toFixed(2)}/hr
                </div>
                <span className="text-[10px] text-[#78716c]">Effective rate</span>
              </div>

              <div className="bg-[#1b1b1b] p-3 rounded-lg border border-[#2a2a2a] text-center">
                <span className="text-[10px] text-[#78716c] uppercase font-bold">Base Gross Pay</span>
                <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
                  ${currentGrossPay.toFixed(2)}
                </div>
                <span className="text-[10px] text-[#78716c]">Hours × Rate</span>
              </div>
            </div>

            {/* Base Confirmation Checkbox */}
            <div className="pt-2">
              <label className="flex items-start space-x-2.5 cursor-pointer bg-[#181818] p-3 rounded-lg border border-[#2e2e2e] hover:bg-[#202020] transition">
                <input
                  type="checkbox"
                  checked={baseConfirmed}
                  onChange={(e) => setBaseConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-[#404040] text-[#c5a059] focus:ring-[#c5a059] focus:ring-offset-0 bg-[#282828] w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] text-[#fdfbf7] leading-relaxed">
                  <strong>Confirm Base Hours & Gross Pay:</strong> I have reviewed and verified that <strong className="text-emerald-400 font-mono">{totalHours.toFixed(1)} hrs</strong> at <strong className="text-[#c5a059] font-mono">${hourlyRate.toFixed(2)}/hr</strong> for a Base Gross Pay of <strong className="text-emerald-400 font-mono">${currentGrossPay.toFixed(2)}</strong> is correct.
                </span>
              </label>
            </div>
          </div>

          {/* STEP 2: ADDED BONUSES */}
          <div className="bg-[#141414] border border-[#242424] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#c5a059] text-black font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#fdfbf7] font-heading">
                  Added Bonuses & Incentives
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-[#b8b0a5]">Any added bonuses?</span>
                <div className="flex bg-[#1c1c1c] p-0.5 rounded-lg border border-[#2e2e2e]">
                  <button
                    type="button"
                    onClick={() => setHasBonuses(false)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                      !hasBonuses ? 'bg-[#2a2a2a] text-[#fdfbf7]' : 'text-[#78716c] hover:text-[#fdfbf7]'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasBonuses(true)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                      hasBonuses ? 'bg-[#c5a059] text-black' : 'text-[#78716c] hover:text-[#fdfbf7]'
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>

            {hasBonuses && (
              <div className="space-y-4">
                {/* List of active bonuses */}
                {bonuses.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#78716c]">Current Bonuses Added:</span>
                    <div className="divide-y divide-[#222222] border border-[#262626] rounded-lg overflow-hidden bg-[#181818]">
                      {bonuses.map((bonus) => (
                        <div key={bonus.id} className="p-3 flex items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="font-bold text-[#fdfbf7] text-xs">{bonus.description}</div>
                            <div className="text-[10px] text-[#78716c] flex items-center gap-1.5">
                              <Building2 className="w-3 h-3 text-[#c5a059]" />
                              <span>Property Owner: <strong className="text-[#b8b0a5]">{bonus.propertyOwner}</strong></span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 shrink-0">
                            <span className="font-mono font-bold text-xs text-emerald-400">
                              +${bonus.amount.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveBonus(bonus.id)}
                              className="text-[#78716c] hover:text-red-400 p-1 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Bonus Sub-Form */}
                <div className="bg-[#181818] p-3.5 rounded-lg border border-[#2e2e2e] space-y-3">
                  <span className="text-[10px] font-bold uppercase text-[#c5a059] block">
                    + Add New Bonus Detail:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-[#b8b0a5] mb-1">
                        For What? (Description) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Weekend Emergency Callout"
                        value={bonusDesc}
                        onChange={(e) => setBonusDesc(e.target.value)}
                        className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#b8b0a5] mb-1">
                        How Much? ($) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-[#78716c] font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 75.00"
                          value={bonusAmount}
                          onChange={(e) => setBonusAmount(e.target.value)}
                          className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg pl-6 pr-2.5 py-1.5 text-xs text-[#fdfbf7] font-mono focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#b8b0a5] mb-1">
                        Which Property Owner? *
                      </label>
                      <select
                        value={bonusOwner}
                        onChange={(e) => setBonusOwner(e.target.value)}
                        className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                      >
                        {clients.map((c) => {
                          const clientLabel = c.companyName || `${c.firstName} ${c.lastName}`.trim();
                          return (
                            <option key={c.id} value={clientLabel}>
                              {clientLabel}
                            </option>
                          );
                        })}
                        <option value="Apex Property Management">Apex Property Management</option>
                        <option value="Floyd County Municipal Housing">Floyd County Municipal Housing</option>
                        <option value="custom">Other / Custom Owner...</option>
                      </select>
                    </div>
                  </div>

                  {bonusOwner === 'custom' && (
                    <div>
                      <label className="block text-[10px] font-bold text-[#b8b0a5] mb-1">
                        Custom Property Owner Name:
                      </label>
                      <input
                        type="text"
                        placeholder="Enter property owner name"
                        value={customOwner}
                        onChange={(e) => setCustomOwner(e.target.value)}
                        className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddBonus}
                    disabled={!bonusDesc.trim() || !bonusAmount}
                    className="bg-[#242424] hover:bg-[#2c2c2c] disabled:opacity-50 text-[#c5a059] border border-[#c5a059]/40 text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Attach Bonus to Timesheet</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: DEDUCTIONS */}
          <div className="bg-[#141414] border border-[#242424] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#c5a059] text-black font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#fdfbf7] font-heading">
                  Payroll Deductions & Advances
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-[#b8b0a5]">Any deductions?</span>
                <div className="flex bg-[#1c1c1c] p-0.5 rounded-lg border border-[#2e2e2e]">
                  <button
                    type="button"
                    onClick={() => setHasDeductions(false)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                      !hasDeductions ? 'bg-[#2a2a2a] text-[#fdfbf7]' : 'text-[#78716c] hover:text-[#fdfbf7]'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasDeductions(true)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                      hasDeductions ? 'bg-[#c5a059] text-black' : 'text-[#78716c] hover:text-[#fdfbf7]'
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>

            {hasDeductions && (
              <div className="space-y-4">
                {/* List of active deductions */}
                {deductions.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#78716c]">Current Deductions Applied:</span>
                    <div className="divide-y divide-[#222222] border border-[#262626] rounded-lg overflow-hidden bg-[#181818]">
                      {deductions.map((deduct) => (
                        <div key={deduct.id} className="p-3 flex items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="font-bold text-[#fdfbf7] text-xs">{deduct.description}</div>
                            <div className="text-[10px] text-[#78716c]">
                              Assessed: <span className="font-mono text-[#b8b0a5]">${deduct.amount.toFixed(2)}</span> • Remaining Balance: <span className="font-mono font-bold text-amber-400">${deduct.remainingBalance.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 shrink-0">
                            <span className="font-mono font-bold text-xs text-red-400">
                              -${deduct.amountPaid.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDeduction(deduct.id)}
                              className="text-[#78716c] hover:text-red-400 p-1 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Deduction Sub-Form */}
                <div className="bg-[#181818] p-3.5 rounded-lg border border-[#2e2e2e] space-y-3">
                  <span className="text-[10px] font-bold uppercase text-[#c5a059] block">
                    + Add New Deduction Detail:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-[#b8b0a5] mb-1">
                        What For? *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Tool Advance (M18 Drill)"
                        value={deductDesc}
                        onChange={(e) => setDeductDesc(e.target.value)}
                        className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#b8b0a5] mb-1">
                        Total Amount ($) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-[#78716c] font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 100.00"
                          value={deductAmount}
                          onChange={(e) => {
                            setDeductAmount(e.target.value);
                            if (!deductPaid) setDeductPaid(e.target.value);
                          }}
                          className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg pl-6 pr-2.5 py-1.5 text-xs text-[#fdfbf7] font-mono focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#b8b0a5] mb-1">
                        How Much Paid Now ($) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-[#78716c] font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 50.00"
                          value={deductPaid}
                          onChange={(e) => {
                            setDeductPaid(e.target.value);
                            const tot = parseFloat(deductAmount) || 0;
                            const p = parseFloat(e.target.value) || 0;
                            setDeductRemaining(Math.max(0, tot - p).toString());
                          }}
                          className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg pl-6 pr-2.5 py-1.5 text-xs text-[#fdfbf7] font-mono focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#b8b0a5] mb-1">
                        Remaining Balance ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-[#78716c] font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 50.00"
                          value={deductRemaining}
                          onChange={(e) => setDeductRemaining(e.target.value)}
                          className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg pl-6 pr-2.5 py-1.5 text-xs text-[#fdfbf7] font-mono focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddDeduction}
                    disabled={!deductDesc.trim() || !deductAmount || !deductPaid}
                    className="bg-[#242424] hover:bg-[#2c2c2c] disabled:opacity-50 text-[#c5a059] border border-[#c5a059]/40 text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Apply Deduction to Timesheet</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* STEP 4: FINAL NET PAY DISPLAY IN BOLD */}
          <div className="bg-gradient-to-r from-[#171e19] via-[#141b16] to-[#121212] border-2 border-emerald-500/50 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#253328]">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Audited Compensation Summary
                </span>
                <h4 className="text-base font-bold text-[#fdfbf7] font-heading mt-0.5">
                  Gross to Net Payroll Calculation
                </h4>
              </div>

              <div className="bg-[#121a14] px-3 py-1.5 rounded-lg border border-emerald-500/30 text-right">
                <span className="text-[10px] text-[#78716c] uppercase font-bold">Calculation Formula</span>
                <div className="text-[11px] font-mono text-emerald-300">
                  Gross + Bonuses - Deductions
                </div>
              </div>
            </div>

            {/* Arithmetic Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-black/40 p-3 rounded-xl border border-[#2a382d]">
                <span className="text-[10px] text-[#78716c] uppercase font-bold">Base Gross Pay</span>
                <div className="text-base font-bold font-mono text-[#fdfbf7] mt-1">
                  ${currentGrossPay.toFixed(2)}
                </div>
                <span className="text-[9px] text-[#78716c]">{totalHours.toFixed(1)}h @ ${hourlyRate}/hr</span>
              </div>

              <div className="bg-black/40 p-3 rounded-xl border border-[#2a382d]">
                <span className="text-[10px] text-[#78716c] uppercase font-bold">Total Bonuses</span>
                <div className="text-base font-bold font-mono text-emerald-400 mt-1">
                  +${calc.totalBonuses.toFixed(2)}
                </div>
                <span className="text-[9px] text-[#78716c]">{bonuses.length} incentive(s)</span>
              </div>

              <div className="bg-black/40 p-3 rounded-xl border border-[#2a382d]">
                <span className="text-[10px] text-[#78716c] uppercase font-bold">Total Deductions</span>
                <div className="text-base font-bold font-mono text-red-400 mt-1">
                  -${calc.totalDeductions.toFixed(2)}
                </div>
                <span className="text-[9px] text-[#78716c]">{deductions.length} deduction(s)</span>
              </div>

              {/* BOLD NET PAY */}
              <div className="bg-emerald-950/50 p-3 rounded-xl border-2 border-emerald-400/80 shadow-lg">
                <span className="text-[10px] text-emerald-300 uppercase font-black tracking-wider">
                  FINAL NET PAY
                </span>
                <div className="text-2xl font-black font-mono text-white drop-shadow-[0_2px_10px_rgba(52,211,153,0.3)] mt-0.5">
                  ${calc.netPay.toFixed(2)}
                </div>
                <span className="text-[9px] text-emerald-400 font-bold uppercase">Payable Amount</span>
              </div>
            </div>

            {/* Net Pay Callout */}
            <div className="bg-black/60 p-4 rounded-xl border border-emerald-500/30 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[#b8b0a5]">Official Net Disbursement for Check / Direct Deposit:</span>
                <div className="text-xl font-black font-mono text-emerald-400 tracking-tight">
                  Net Pay: ${calc.netPay.toFixed(2)}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-[#78716c] block">Status:</span>
                <span className="text-[11px] font-bold text-[#c5a059]">
                  {baseConfirmed ? '✓ Base Verified' : '⚠️ Pending Confirmation'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="bg-[#181818] p-5 border-t border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#78716c] flex items-center space-x-1.5">
            <UserCheck className="w-4 h-4 text-[#c5a059]" />
            <span>Auditing as: <strong>Sarah Jenkins (Admin)</strong></span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto bg-[#242424] hover:bg-[#2c2c2c] text-[#fdfbf7] text-xs font-bold px-4 py-2.5 rounded-xl border border-[#333333] transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndConfirm}
              className="w-1/2 sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
            >
              <span>Confirm & View Official Timesheet</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
