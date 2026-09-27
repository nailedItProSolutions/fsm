'use client';

import React, { useState, useMemo } from 'react';
import { useFSMStore } from '@/lib/useStore';
import { 
  SubscriptionTier, 
  InspectionGrade, 
  PropertyPricingVariables,
  SUBSCRIPTION_TIER_CONFIG,
  AVAILABLE_ADDONS,
  calculateSubscriptionQuote,
  calculateAddOns
} from '@/lib/pricingEngine';
import { 
  Sliders, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  Home, 
  Wrench, 
  Calendar, 
  Clock, 
  Zap, 
  DollarSign, 
  Layers, 
  Info,
  ChevronRight,
  TrendingDown,
  CheckCircle2,
  X
} from 'lucide-react';

interface DynamicSubscriptionCalculatorProps {
  clientId: string;
  clientName: string;
  isOpen: boolean;
  onClose: () => void;
  preselectedPropertyId?: string;
  onSuccess?: (subscriptionId: string) => void;
}

export const DynamicSubscriptionCalculator: React.FC<DynamicSubscriptionCalculatorProps> = ({
  clientId,
  clientName,
  isOpen,
  onClose,
  preselectedPropertyId,
  onSuccess,
}) => {
  const { properties, createSubscription } = useFSMStore();
  const clientProperties = properties.filter((p) => p.clientId === clientId);

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    preselectedPropertyId || (clientProperties.length > 0 ? clientProperties[0].id : '')
  );

  // 1. Subscription Tier
  const [tier, setTier] = useState<SubscriptionTier>('essentials');

  // 2. Property Variables
  const [sqFt, setSqFt] = useState<number>(1850);
  const [beds, setBeds] = useState<number>(3);
  const [baths, setBaths] = useState<number>(2);
  const [hvacUnits, setHvacUnits] = useState<number>(1);
  const [kitchens, setKitchens] = useState<number>(1);
  const [propertyAgeYears, setPropertyAgeYears] = useState<number>(18);
  const [inspectionGrade, setInspectionGrade] = useState<InspectionGrade>('B');

  // 3. Selected Add-Ons
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([
    'labor-block-2hr',
  ]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);

  // Compute Quote in real-time
  const propertyVariables: PropertyPricingVariables = useMemo(() => ({
    sqFt,
    beds,
    baths,
    hvacUnits,
    kitchens,
    propertyAgeYears,
    inspectionGrade,
  }), [sqFt, beds, baths, hvacUnits, kitchens, propertyAgeYears, inspectionGrade]);

  const quote = useMemo(() => {
    return calculateSubscriptionQuote(tier, propertyVariables);
  }, [tier, propertyVariables]);

  const addOnsSummary = useMemo(() => {
    return calculateAddOns(selectedAddOnIds);
  }, [selectedAddOnIds]);

  const totalMonthlyBilled = useMemo(() => {
    return Math.round((quote.finalMonthlyPrice + addOnsSummary.monthlyAddOnsTotal) * 100) / 100;
  }, [quote.finalMonthlyPrice, addOnsSummary.monthlyAddOnsTotal]);

  const toggleAddOn = (id: string) => {
    if (selectedAddOnIds.includes(id)) {
      setSelectedAddOnIds(selectedAddOnIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedAddOnIds([...selectedAddOnIds, id]);
    }
  };

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

  const handleEnrollStripePlan = () => {
    if (!selectedProperty) {
      alert('Please select a property to enroll in membership.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const propAddressString = `${selectedProperty.street} ${selectedProperty.unit ? `(${selectedProperty.unit})` : ''}, ${selectedProperty.city}, ${selectedProperty.state}`;
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      const newSub = createSubscription({
        clientId,
        clientName,
        propertyId: selectedProperty.id,
        propertyAddress: propAddressString,
        planName: `${quote.tierName} (${sqFt.toLocaleString()} sq ft, Grade ${inspectionGrade})`,
        amount: totalMonthlyBilled,
        billingInterval: 'month',
        status: 'active',
        stripeSubscriptionId: `sub_custom_${Date.now()}`,
        currentPeriodStart: now.toISOString(),
        currentPeriodEnd: nextMonth.toISOString(),
        autoDispatchEnabled: true,
        tier,
        pricingVariables: propertyVariables,
        selectedAddOns: addOnsSummary.selectedItems.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          billingType: item.billingType,
          nailedItPrice: item.nailedItPrice,
        })),
        monthlyAddOnsTotal: addOnsSummary.monthlyAddOnsTotal,
        oneTimeAddOnsTotal: addOnsSummary.oneTimeAddOnsTotal,
      });

      setIsSubmitting(false);
      setSuccessReceipt({
        subId: newSub.id,
        stripeSubId: newSub.stripeSubscriptionId,
        propertyAddress: propAddressString,
        monthlyTotal: totalMonthlyBilled,
        oneTimeTotal: addOnsSummary.oneTimeAddOnsTotal,
        tierName: quote.tierName,
      });

      if (onSuccess) {
        onSuccess(newSub.id);
      }
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#100f0f] text-[#fdfbf7] rounded-3xl shadow-2xl max-w-4xl w-full border border-[#2a2a2a] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#181818] via-[#1c1813] to-[#181818] p-5 sm:p-6 border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#c5a059] flex items-center justify-center text-black shadow-md font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-[#fdfbf7] font-heading">
                  Fair & Profitable Subscription Calculator
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40">
                  Rome, GA Algorithm
                </span>
              </div>
              <p className="text-xs text-[#b8b0a5] mt-0.5">
                Dynamic pricing engine with property modifiers, labor hour blocks, & Stripe billing sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#78716c] hover:text-[#fdfbf7] p-2 rounded-xl hover:bg-[#222222] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {!successReceipt ? (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[80vh] overflow-y-auto">
            {/* Left 7 Columns: Interactive Configuration Form */}
            <div className="lg:col-span-7 space-y-6">
              {/* Property Target Selector */}
              <div>
                <label className="block text-xs font-bold text-[#b8b0a5] mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Target Service Property for {clientName}</span>
                </label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-3.5 py-2.5 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                >
                  {clientProperties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label ? `${p.label} - ` : ''}{p.street} {p.unit || ''} ({p.city}, {p.state})
                    </option>
                  ))}
                  {clientProperties.length === 0 && (
                    <option value="">No registered properties found</option>
                  )}
                </select>
              </div>

              {/* STEP 1: Subscription Tier Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#b8b0a5] mb-2">
                  Step 1: Choose Base Service Tier
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['essentials', 'plus', 'premium'] as SubscriptionTier[]).map((t) => {
                    const cfg = SUBSCRIPTION_TIER_CONFIG[t];
                    const isSelected = tier === t;
                    return (
                      <div
                        key={t}
                        onClick={() => setTier(t)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition text-left relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#1e1a12] border-[#c5a059] ring-2 ring-[#c5a059]/30 shadow-lg'
                            : 'bg-[#141414] border-[#262626] hover:border-[#383838]'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#c5a059] flex items-center justify-center text-black text-[10px]">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                        <div>
                          <div className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#c5a059]' : 'text-[#78716c]'}`}>
                            {t}
                          </div>
                          <div className="font-bold text-sm text-[#fdfbf7] mt-0.5 truncate">
                            {cfg.name.split(' ')[0]}
                          </div>
                          <div className="font-mono text-base font-black text-[#c5a059] mt-1">
                            ${cfg.basePrice.toFixed(0)}<span className="text-[10px] font-normal text-[#888]">/mo</span>
                          </div>
                        </div>
                        <div className="text-[9px] text-[#78716c] mt-2 pt-2 border-t border-[#222222] truncate">
                          {cfg.includedVisits.split(' ')[0]} {cfg.includedVisits.split(' ')[1]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: Modifier Variables Inputs */}
              <div className="bg-[#141414] p-4 rounded-2xl border border-[#222222] space-y-4">
                <div className="flex items-center justify-between border-b border-[#222222] pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#b8b0a5] flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#FF8A00]" />
                    <span>Step 2: Property Scale & Condition Modifiers</span>
                  </span>
                  <span className="text-[10px] text-[#78716c]">Dynamic Upcharges</span>
                </div>

                {/* Square Footage Slider */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-[#b8b0a5]">Square Footage (Sq Ft)</span>
                    <span className="font-mono text-[#c5a059] font-bold text-sm">{sqFt.toLocaleString()} sq ft</span>
                  </div>
                  <input
                    type="range"
                    min="800"
                    max="6000"
                    step="50"
                    value={sqFt}
                    onChange={(e) => setSqFt(parseInt(e.target.value, 10))}
                    className="w-full accent-[#c5a059] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#78716c] mt-0.5">
                    <span>800 sq ft</span>
                    <span className="text-[#a8a095]">Base threshold: 1,500 sq ft (+15 per 500 sq ft)</span>
                    <span>6,000 sq ft</span>
                  </div>
                </div>

                {/* Beds, Baths, HVAC, Kitchens Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-[#b8b0a5] mb-1">Bedrooms</label>
                    <select
                      value={beds}
                      onChange={(e) => setBeds(parseInt(e.target.value, 10))}
                      className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>{n} Bed{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#b8b0a5] mb-1">Bathrooms</label>
                    <select
                      value={baths}
                      onChange={(e) => setBaths(parseInt(e.target.value, 10))}
                      className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>{n} Bath{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#b8b0a5] mb-1">HVAC Units</label>
                    <select
                      value={hvacUnits}
                      onChange={(e) => setHvacUnits(parseInt(e.target.value, 10))}
                      className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n} {n === 1 ? 'Unit' : 'Units'} (+$20/ea)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#b8b0a5] mb-1">Kitchens</label>
                    <select
                      value={kitchens}
                      onChange={(e) => setKitchens(parseInt(e.target.value, 10))}
                      className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                    >
                      {[1, 2, 3].map((n) => (
                        <option key={n} value={n}>{n} {n === 1 ? 'Main' : 'Kitchens'} (+$25/ea)</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Age & Inspection Grade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <span className="text-[#b8b0a5]">Property Age ({propertyAgeYears} Years)</span>
                      <span className="text-[10px] text-[#FF8A00] font-bold">
                        {propertyAgeYears > 40 ? '+15% Surcharge' : propertyAgeYears > 20 ? '+10% Surcharge' : '0% (Standard)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="75"
                      value={propertyAgeYears}
                      onChange={(e) => setPropertyAgeYears(parseInt(e.target.value, 10))}
                      className="w-full accent-[#FF8A00] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#78716c]">
                      <span>New Build (1 yr)</span>
                      <span>Older Home (75 yrs)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#b8b0a5] mb-1">
                      Initial Inspection Grade
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['A', 'B', 'C', 'D'] as InspectionGrade[]).map((g) => {
                        const isGrade = inspectionGrade === g;
                        const label = g === 'A' ? 'Pristine (0%)' : g === 'B' ? 'Good (+5%)' : g === 'C' ? 'Fair (+15%)' : 'Poor (+25%)';
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setInspectionGrade(g)}
                            className={`py-1.5 text-center rounded-lg border font-bold text-xs transition ${
                              isGrade
                                ? g === 'A' 
                                  ? 'bg-emerald-600 text-white border-emerald-400' 
                                  : g === 'B'
                                  ? 'bg-blue-600 text-white border-blue-400'
                                  : g === 'C'
                                  ? 'bg-amber-600 text-white border-amber-400'
                                  : 'bg-red-600 text-white border-red-400'
                                : 'bg-[#181818] border-[#2a2a2a] text-[#78716c] hover:text-[#fdfbf7]'
                            }`}
                            title={label}
                          >
                            Grade {g}
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-[10px] text-[#78716c] mt-1 text-center">
                      Grade {inspectionGrade}: {inspectionGrade === 'A' ? 'Zero deferred maintenance' : inspectionGrade === 'B' ? 'Minor cosmetic wear' : inspectionGrade === 'C' ? 'Moderate deferred wear' : 'Remediation risk'}
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: Optional Add-Ons & Labor Hour Blocks */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#b8b0a5] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Step 3: Optional Add-Ons & Labor Hour Blocks</span>
                  </span>
                  <span className="text-[10px] text-[#c5a059] font-bold">
                    {selectedAddOnIds.length} Selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AVAILABLE_ADDONS.map((item) => {
                    const isChecked = selectedAddOnIds.includes(item.id);
                    const isLabor = item.category === 'labor_block';
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleAddOn(item.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-start space-x-2.5 ${
                          isChecked
                            ? 'bg-[#1e1c14] border-[#c5a059] shadow-sm'
                            : 'bg-[#141414] border-[#262626] hover:border-[#333333]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by div
                          className="rounded bg-[#1a1a1a] border-[#333333] text-[#c5a059] focus:ring-[#c5a059] mt-0.5 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-bold text-xs text-[#fdfbf7] truncate">{item.name}</span>
                            <span className="text-xs font-mono font-bold text-[#c5a059] whitespace-nowrap">
                              ${item.nailedItPrice.toFixed(0)}
                              <span className="text-[9px] font-normal text-[#888]">
                                {item.billingType === 'monthly_recurring' ? '/mo' : ' one-time'}
                              </span>
                            </span>
                          </div>
                          <p className="text-[10px] text-[#78716c] line-clamp-1 mt-0.5">{item.description}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {item.badge && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-[#c5a059]/15 text-[#c5a059]">
                                {item.badge}
                              </span>
                            )}
                            <span className="text-[9px] text-emerald-400 font-semibold">
                              Save ${item.savings.toFixed(0)} vs Rome Median
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Dynamic Quote Breakdown & Stripe Sync */}
            <div className="lg:col-span-5 bg-[#141414] border border-[#262626] rounded-2xl p-5 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#c5a059] tracking-wider">Live Pricing Calculation</span>
                    <h4 className="font-bold text-base text-white font-heading">{quote.tierName}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#78716c]">Base Rate</span>
                    <div className="font-mono font-bold text-sm text-[#fdfbf7]">${quote.basePrice.toFixed(2)}/mo</div>
                  </div>
                </div>

                {/* Modifiers Breakdown Table */}
                <div className="space-y-2 text-xs">
                  <span className="text-[10px] uppercase font-bold text-[#78716c] tracking-wider">Applied Modifiers:</span>
                  
                  {quote.modifiers.length === 0 ? (
                    <div className="text-[11px] text-[#666] italic bg-[#181818] p-2.5 rounded-lg border border-[#222222]">
                      Standard property scope — zero size or fixture surcharges applied.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {quote.modifiers.map((m, idx) => (
                        <div key={idx} className="bg-[#181818] p-2 rounded-lg border border-[#222222] flex justify-between items-center text-[11px]">
                          <div className="truncate pr-2">
                            <span className="text-[#fdfbf7] font-semibold">{m.label.split('(')[0]}</span>
                            <div className="text-[9px] text-[#78716c]">{m.calculationDetail}</div>
                          </div>
                          <span className="font-mono font-bold text-[#FF8A00] whitespace-nowrap">
                            +${m.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Percentage Surcharges */}
                  {(quote.ageMultiplierPercent > 0 || quote.gradeMultiplierPercent > 0) && (
                    <div className="bg-[#1c1815] p-2.5 rounded-lg border border-[#3d2e1c] space-y-1 text-[11px]">
                      {quote.ageMultiplierPercent > 0 && (
                        <div className="flex justify-between text-amber-300">
                          <span>Property Age Surcharge (+{quote.ageMultiplierPercent}% for {propertyAgeYears} yrs):</span>
                          <span className="font-mono font-bold">+${quote.ageSurchargeAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {quote.gradeMultiplierPercent > 0 && (
                        <div className="flex justify-between text-amber-300">
                          <span>Inspection Grade {inspectionGrade} Surcharge (+{quote.gradeMultiplierPercent}%):</span>
                          <span className="font-mono font-bold">+${quote.gradeSurchargeAmount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Add-Ons Breakdown */}
                {addOnsSummary.selectedItems.length > 0 && (
                  <div className="border-t border-[#222222] pt-3 space-y-2 text-xs">
                    <span className="text-[10px] uppercase font-bold text-[#78716c] tracking-wider">A La Carte Add-Ons:</span>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {addOnsSummary.selectedItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-[11px] bg-[#181818] p-2 rounded-lg border border-[#222222]">
                          <span className="text-[#fdfbf7] truncate">{item.name}</span>
                          <span className="font-mono font-bold text-[#c5a059] whitespace-nowrap pl-2">
                            +${item.nailedItPrice.toFixed(2)} {item.billingType === 'monthly_recurring' ? '/mo' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Savings Banner */}
                {addOnsSummary.totalSavingsVsRomeMarket > 0 && (
                  <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <span className="text-emerald-300 text-[11px] flex items-center gap-1.5 font-semibold">
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Rome Market Labor Bundle Savings:</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      -${addOnsSummary.totalSavingsVsRomeMarket.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Total & Checkout Section */}
              <div className="border-t border-[#222222] pt-4 space-y-3">
                <div className="bg-[#181818] p-3.5 rounded-xl border border-[#2a2a2a] space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[#b8b0a5]">Calculated Monthly Membership:</span>
                    <span className="font-mono text-xl font-black text-[#c5a059]">
                      ${totalMonthlyBilled.toFixed(2)}
                      <span className="text-xs font-normal text-[#888]">/mo</span>
                    </span>
                  </div>

                  {addOnsSummary.oneTimeAddOnsTotal > 0 && (
                    <div className="flex justify-between items-baseline text-xs text-[#b8b0a5] pt-1 border-t border-[#222222]">
                      <span>Prepaid Labor Blocks (One-Time):</span>
                      <span className="font-mono font-bold text-[#fdfbf7]">
                        +${addOnsSummary.oneTimeAddOnsTotal.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="text-[10px] text-[#78716c] pt-1 flex justify-between">
                    <span>Stripe Recurring Sync:</span>
                    <span className="text-emerald-400 font-semibold">Ready for Custom Plan Injection</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleEnrollStripePlan}
                  disabled={isSubmitting || !selectedProperty}
                  className="w-full bg-[#c5a059] hover:bg-[#b38728] disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>
                    {isSubmitting ? 'Configuring Stripe Plan...' : `Enroll in Membership • $${totalMonthlyBilled.toFixed(2)}/mo`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Enrollment Success Receipt */
          <div className="p-8 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-heading text-white">
              Custom Membership Successfully Enrolled!
            </h3>
            <p className="text-xs text-[#b8b0a5] leading-relaxed">
              The dynamic quote algorithm has generated a custom monthly billing plan linked directly to Stripe Subscriptions.
            </p>

            <div className="bg-[#161616] p-4 rounded-2xl border border-[#262626] text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-[#b8b0a5]">
                <span>Customer Account:</span>
                <span className="text-white font-bold">{clientName}</span>
              </div>
              <div className="flex justify-between text-[#b8b0a5]">
                <span>Covered Property:</span>
                <span className="text-white truncate max-w-xs">{successReceipt.propertyAddress}</span>
              </div>
              <div className="flex justify-between text-[#b8b0a5]">
                <span>Plan Tier:</span>
                <span className="text-[#c5a059] font-bold">{successReceipt.tierName}</span>
              </div>
              <div className="flex justify-between text-[#b8b0a5]">
                <span>Stripe Subscription SID:</span>
                <span className="text-purple-400">{successReceipt.stripeSubId}</span>
              </div>
              <div className="flex justify-between border-t border-[#262626] pt-2 text-sm font-bold">
                <span className="text-white">Monthly Billed:</span>
                <span className="text-[#c5a059]">${successReceipt.monthlyTotal.toFixed(2)} / month</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSuccessReceipt(null);
                onClose();
              }}
              className="bg-[#222222] hover:bg-[#333333] text-white text-xs font-bold px-6 py-3 rounded-xl border border-[#444] transition"
            >
              Close & View Updated CRM Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
