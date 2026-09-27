'use client';

import React, { useState, useMemo } from 'react';
import { 
  RepairTradeType, 
  RepairSeverity, 
  ROME_GA_BENCHMARKS,
  calculateSingleRepairEstimate,
  SingleRepairEstimateResult
} from '@/lib/pricingEngine';
import { EstimateItem } from '@/types';
import { 
  Calculator, 
  Wrench, 
  Check, 
  DollarSign, 
  AlertCircle, 
  ArrowRight, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  Package 
} from 'lucide-react';

interface DynamicRepairEstimatorProps {
  onApplyEstimateItems: (items: EstimateItem[], comparison: SingleRepairEstimateResult) => void;
  onClose?: () => void;
}

export const DynamicRepairEstimator: React.FC<DynamicRepairEstimatorProps> = ({
  onApplyEstimateItems,
  onClose,
}) => {
  const [trade, setTrade] = useState<RepairTradeType>('plumbing');
  const [severity, setSeverity] = useState<RepairSeverity>('moderate');
  const [isEmergency, setIsEmergency] = useState<boolean>(false);
  const [customLaborHours, setCustomLaborHours] = useState<number | undefined>(undefined);
  const [customMaterialsCost, setCustomMaterialsCost] = useState<number | undefined>(undefined);

  const benchmark = ROME_GA_BENCHMARKS[trade];

  const result = useMemo(() => {
    return calculateSingleRepairEstimate({
      trade,
      severity,
      customLaborHours,
      customMaterialsCost,
      emergencySurcharge: isEmergency,
    });
  }, [trade, severity, customLaborHours, customMaterialsCost, isEmergency]);

  const handleApply = () => {
    const laborItem: EstimateItem = {
      id: `labor-${Date.now()}`,
      type: 'labor',
      description: `${benchmark.tradeLabel} - Technician Labor (${severity.toUpperCase()} scope pegged to Rome, GA standard)`,
      quantity: result.laborHours,
      unitPrice: benchmark.nailedItHourlyLabor,
      total: result.nailedItLaborCost,
    };

    const materialItem: EstimateItem = {
      id: `mat-${Date.now() + 1}`,
      type: 'material',
      description: `Floyd County Commercial Parts, Couplings & Hardware (${benchmark.tradeLabel})`,
      quantity: 1,
      unitPrice: result.materialsCost,
      total: result.materialsCost,
    };

    const items: EstimateItem[] = [laborItem, materialItem];

    if (isEmergency) {
      items.push({
        id: `emerg-${Date.now() + 2}`,
        type: 'flat_rate',
        description: '24/7 Priority Emergency Rapid-Response Dispatch Fee',
        quantity: 1,
        unitPrice: Math.round((result.nailedItTotal - (result.nailedItLaborCost + result.materialsCost)) * 100) / 100,
        total: Math.round((result.nailedItTotal - (result.nailedItLaborCost + result.materialsCost)) * 100) / 100,
      });
    }

    onApplyEstimateItems(items, result);
    if (onClose) onClose();
  };

  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#222222] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-[#c5a059]/20 text-[#c5a059]">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#fdfbf7] font-heading">
              Rome, GA Market Pegging Calculator
            </h4>
            <p className="text-[11px] text-[#b8b0a5]">
              Auto-computes labor & materials 5-10% below Floyd County contractor median
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full">
          Pegged: {benchmark.discountPercentage.toFixed(1)}% Below Median
        </span>
      </div>

      {/* Trade Selector */}
      <div>
        <label className="block text-xs font-bold text-[#b8b0a5] mb-1.5">
          Select Repair Trade / Specialty *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.keys(ROME_GA_BENCHMARKS) as RepairTradeType[]).map((t) => {
            const b = ROME_GA_BENCHMARKS[t];
            const isSelected = trade === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTrade(t)}
                className={`p-2.5 rounded-xl border text-left transition ${
                  isSelected
                    ? 'bg-[#1e1c14] border-[#c5a059] text-white shadow-sm'
                    : 'bg-[#181818] border-[#262626] text-[#b8b0a5] hover:text-[#fdfbf7]'
                }`}
              >
                <div className="text-xs font-bold truncate">{b.tradeLabel.split('&')[0]}</div>
                <div className="text-[10px] font-mono text-[#c5a059] mt-0.5">
                  ${b.nailedItHourlyLabor}/hr <span className="text-[#78716c] line-through text-[9px]">${b.romeMedianHourlyLabor}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Severity Selector & Emergency Toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#b8b0a5] mb-1.5">
            Repair Scope Severity
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['minor', 'moderate', 'major'] as RepairSeverity[]).map((s) => {
              const isSelected = severity === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSeverity(s);
                    setCustomLaborHours(undefined);
                    setCustomMaterialsCost(undefined);
                  }}
                  className={`py-2 rounded-xl border text-center text-xs font-bold uppercase tracking-wider transition ${
                    isSelected
                      ? s === 'minor' 
                        ? 'bg-blue-600 text-white border-blue-400' 
                        : s === 'moderate' 
                        ? 'bg-[#c5a059] text-black border-[#c5a059]' 
                        : 'bg-red-600 text-white border-red-400'
                      : 'bg-[#181818] border-[#262626] text-[#78716c] hover:text-[#fdfbf7]'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#b8b0a5] mb-1.5">
            Emergency 24/7 Response
          </label>
          <button
            type="button"
            onClick={() => setIsEmergency(!isEmergency)}
            className={`w-full py-2 px-3 rounded-xl border font-bold text-xs transition flex items-center justify-between ${
              isEmergency
                ? 'bg-red-950/80 border-red-500 text-red-300'
                : 'bg-[#181818] border-[#262626] text-[#78716c] hover:text-[#fdfbf7]'
            }`}
          >
            <span>🚨 24/7 Rapid Dispatch</span>
            <span className="font-mono text-[10px]">{isEmergency ? '+25% Priority Rate' : 'Standard Window'}</span>
          </button>
        </div>
      </div>

      {/* Computed Labor Hours & Materials Inputs */}
      <div className="grid grid-cols-2 gap-3 bg-[#181818] p-3 rounded-xl border border-[#262626]">
        <div>
          <label className="block text-[11px] text-[#b8b0a5] mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#FF8A00]" />
            <span>Estimated Labor Hours</span>
          </label>
          <input
            type="number"
            step="0.25"
            value={result.laborHours}
            onChange={(e) => setCustomLaborHours(parseFloat(e.target.value) || 0)}
            className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
          />
        </div>

        <div>
          <label className="block text-[11px] text-[#b8b0a5] mb-1 flex items-center gap-1">
            <Package className="w-3 h-3 text-[#c5a059]" />
            <span>Estimated Materials Cost ($)</span>
          </label>
          <input
            type="number"
            step="5"
            value={result.materialsCost}
            onChange={(e) => setCustomMaterialsCost(parseFloat(e.target.value) || 0)}
            className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
          />
        </div>
      </div>

      {/* Comparison & Savings Callout Box */}
      <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#b8b0a5]">Rome, GA Market Comparison:</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Save ${result.customerDollarSavings.toFixed(2)} ({result.percentBelowMedian}% below median)</span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-[#121212] p-2.5 rounded-lg border border-[#222222]">
            <div className="text-[10px] text-[#78716c] uppercase">Rome Low</div>
            <div className="font-mono text-xs font-bold text-[#b8b0a5] mt-0.5">
              ${result.romeLowEstimate.toFixed(2)}
            </div>
          </div>
          <div className="bg-[#1e1c14] p-2.5 rounded-lg border border-[#c5a059] shadow-sm">
            <div className="text-[10px] text-[#c5a059] font-black uppercase">Nailed It Price</div>
            <div className="font-mono text-sm font-black text-white mt-0.5">
              ${result.nailedItTotal.toFixed(2)}
            </div>
          </div>
          <div className="bg-[#121212] p-2.5 rounded-lg border border-[#222222]">
            <div className="text-[10px] text-[#78716c] uppercase">Rome Median</div>
            <div className="font-mono text-xs font-bold text-[#888] line-through mt-0.5">
              ${result.romeMedianEstimate.toFixed(2)}
            </div>
          </div>
        </div>

        <p className="text-[10px] text-[#78716c] italic text-center">
          {result.peggingNotes}
        </p>
      </div>

      {/* Button to Apply Scope to Estimate */}
      <button
        type="button"
        onClick={handleApply}
        className="w-full bg-[#c5a059] hover:bg-[#b38728] text-black font-black text-xs uppercase tracking-wider py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
      >
        <CheckCircle2 className="w-4 h-4 text-black" />
        <span>Apply Rome Pegged Scope to Estimate (${result.nailedItTotal.toFixed(2)})</span>
      </button>
    </div>
  );
};
