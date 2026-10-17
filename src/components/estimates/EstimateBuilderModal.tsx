'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useActiveFSMData } from '@/lib/useStore';
import { Estimate, EstimateItem } from '@/types';
import { 
  X, 
  FileText, 
  Plus, 
  Trash2, 
  DollarSign, 
  Calendar, 
  Building2, 
  User, 
  CheckCircle2, 
  Send,
  Calculator,
  Sparkles,
  Pencil,
  CheckSquare,
  Square,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DynamicRepairEstimator } from './DynamicRepairEstimator';
import { StandardTaskCatalog } from './StandardTaskCatalog';
import { CARPET_DISCLAIMER_TERMS } from '@/lib/standardTasks';

export interface PresetTerm {
  id: string;
  label: string;
  text: string;
}

export const PRESET_PAYMENT_TERMS: PresetTerm[] = [
  {
    id: 'pay_50_upfront',
    label: '50% Due Upfront, Balance Due Upon Receipt',
    text: '50% deposit due upfront upon approval to schedule project and procure materials; remaining balance is due upon receipt of final invoice upon substantial completion.',
  },
  {
    id: 'pay_100_upfront',
    label: 'Total Amount Due to Begin (100% Upfront)',
    text: 'Total estimated amount due in full upfront prior to commencement of work and material procurement.',
  },
  {
    id: 'pay_30_upfront',
    label: '30% Deposit to Schedule, Balance Due Upon Completion',
    text: '30% deposit required to schedule project and order materials; remaining balance due upon certified substantial completion.',
  },
  {
    id: 'pay_due_receipt',
    label: 'Due in Full Upon Receipt (Net 0)',
    text: 'Payment due in full upon receipt of final invoice immediately following substantial completion.',
  },
  {
    id: 'pay_net_15',
    label: 'Net 15 Terms',
    text: 'Net 15 terms: Remaining balance due within 15 calendar days of invoice issuance.',
  },
  {
    id: 'pay_net_30',
    label: 'Net 30 Terms (Commercial / Property Mgmt)',
    text: 'Net 30 terms: Balance payable within 30 days of invoice receipt for approved commercial and property management accounts.',
  },
];

export const PRESET_PROTECTION_TERMS: PresetTerm[] = [
  {
    id: 'prot_valid_30',
    label: 'Quote Valid for 30 Days',
    text: 'Quote valid for 30 calendar days from issuance due to material price fluctuations.',
  },
  {
    id: 'prot_insured',
    label: 'Fully Insured — Commercial Liability Protection',
    text: 'Fully Insured — Operations are protected under Nailed It Property Solutions\' Commercial General Liability policy.',
  },
  {
    id: 'prot_hidden_conditions',
    label: 'Unforeseen / Hidden Conditions Clause',
    text: 'Estimate is based on visual inspection. Hidden defects, structural rot, or non-code wiring/plumbing uncovered during work pause operations for written Change Order approval prior to proceeding.',
  },
  {
    id: 'prot_change_order',
    label: 'Written Change Order Policy',
    text: 'Any additions, deviations, or scope modifications will be executed only upon written authorization and will adjust the final total accordingly.',
  },
  {
    id: 'prot_warranty',
    label: '1-Year Workmanship Warranty',
    text: 'All installation labor is backed by Nailed It Property Solutions\' 1-Year Workmanship Warranty.',
  },
  {
    id: 'scope_materials_allowance',
    label: 'Material Allowance Policy',
    text: 'Pricing reflects standard builder-grade material allowance; client-selected fixtures or finishes exceeding allowance will be billed via Change Order.',
  },
  {
    id: 'scope_exclusions',
    label: 'Excludes Drywall Patching / Painting Unless Itemized',
    text: 'Does not include drywall repair, texturing, painting, or moving personal property unless specifically itemized.',
  },
];

export const DEFAULT_ESTIMATE_TERMS: string[] = [
  PRESET_PAYMENT_TERMS[0].text,
  PRESET_PROTECTION_TERMS[0].text,
  PRESET_PROTECTION_TERMS[1].text,
  PRESET_PROTECTION_TERMS[2].text,
];

interface EstimateBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (estimateId: string) => void;
  estimateToEdit?: Estimate | null;
}

export const EstimateBuilderModal: React.FC<EstimateBuilderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  estimateToEdit,
}) => {
  const { clients, properties, addEstimate, updateEstimate } = useActiveFSMData();

  const [clientId, setClientId] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [taxRate, setTaxRate] = useState(0.07); // 7% Floyd County GA
  const [status, setStatus] = useState<Estimate['status']>('draft');
  const [showRomeCalculator, setShowRomeCalculator] = useState(false);
  const [showTaskCatalog, setShowTaskCatalog] = useState(false);
  const [marketComparisonData, setMarketComparisonData] = useState<any | null>(null);
  const [items, setItems] = useState<EstimateItem[]>([
    { id: '1', type: 'labor', description: 'Technician Labor (Hourly)', details: '', quantity: 2, unitPrice: 85, total: 170 },
    { id: '2', type: 'material', description: 'Commercial Replacement Hardware / Fixtures', details: '', quantity: 1, unitPrice: 95, total: 95 },
  ]);
  const [selectedTerms, setSelectedTerms] = useState<string[]>(DEFAULT_ESTIMATE_TERMS);
  const [customTermText, setCustomTermText] = useState('');
  const [showTermsSection, setShowTermsSection] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    if (estimateToEdit) {
      setClientId(estimateToEdit.clientId);
      setPropertyId(estimateToEdit.propertyId);
      setValidUntil(estimateToEdit.validUntil);
      setTaxRate(estimateToEdit.taxRate ?? 0.07);
      setStatus(estimateToEdit.status || 'draft');
      setItems(
        estimateToEdit.items && estimateToEdit.items.length > 0
          ? estimateToEdit.items.map((it) => ({
              ...it,
              details: it.details || '',
              quantity: Number(it.quantity) || 1,
              unitPrice: Number(it.unitPrice) || 0,
              total: Math.round((Number(it.quantity) || 1) * (Number(it.unitPrice) || 0) * 100) / 100,
            }))
          : [
              { id: '1', type: 'labor', description: 'Technician Labor (Hourly)', details: '', quantity: 2, unitPrice: 85, total: 170 },
              { id: '2', type: 'material', description: 'Commercial Replacement Hardware / Fixtures', details: '', quantity: 1, unitPrice: 95, total: 95 },
            ]
      );
      setMarketComparisonData(estimateToEdit.marketComparison || null);
      if (estimateToEdit.terms && Array.isArray(estimateToEdit.terms) && estimateToEdit.terms.length > 0) {
        setSelectedTerms(estimateToEdit.terms);
      } else {
        setSelectedTerms(DEFAULT_ESTIMATE_TERMS);
      }
    } else {
      if (clients.length > 0) {
        setClientId(clients[0].id);
      }
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setValidUntil(d.toISOString().split('T')[0]);
      setTaxRate(0.07);
      setStatus('draft');
      setMarketComparisonData(null);
      setSelectedTerms(DEFAULT_ESTIMATE_TERMS);
      setCustomTermText('');
      setItems([
        { id: '1', type: 'labor', description: 'Technician Labor (Hourly)', details: '', quantity: 2, unitPrice: 85, total: 170 },
        { id: '2', type: 'material', description: 'Commercial Replacement Hardware / Fixtures', details: '', quantity: 1, unitPrice: 95, total: 95 },
      ]);
    }
  }, [isOpen, estimateToEdit?.id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('rome') === 'true') {
        setShowRomeCalculator(true);
      }
    }
  }, []);

  const clientProperties = useMemo(() => properties.filter((p) => p.clientId === clientId), [properties, clientId]);

  useEffect(() => {
    if (clientProperties.length > 0) {
      setPropertyId((prev) => {
        if (prev && clientProperties.some((p) => p.id === prev)) {
          return prev;
        }
        return clientProperties[0].id;
      });
    } else {
      setPropertyId('');
    }
  }, [clientId, clientProperties]);

  if (!isOpen) return null;

  const selectedClient = clients.find((c) => c.id === clientId);
  const selectedProperty = properties.find((p) => p.id === propertyId);

  const handleItemChange = (index: number, field: keyof EstimateItem, val: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: val };
    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? (val === '' ? 0 : parseFloat(val) || 0) : Number(current.quantity) || 0;
      const p = field === 'unitPrice' ? (val === '' ? 0 : parseFloat(val) || 0) : Number(current.unitPrice) || 0;
      current.total = Math.round(q * p * 100) / 100;
    }
    updated[index] = current;
    setItems(updated);
  };

  const handleAddItem = (type: 'labor' | 'material' | 'flat_rate') => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        type,
        description: type === 'labor' ? 'Additional Service Labor' : type === 'material' ? 'Materials & Parts' : 'Flat-rate Service Fee',
        details: '',
        quantity: 1,
        unitPrice: type === 'labor' ? 85 : 50,
        total: type === 'labor' ? 85 : 50,
      },
    ]);
  };

  const handleSelectStandardTask = (task: any, rate: number) => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random()}`,
        type: 'labor',
        description: task.description,
        details: task.category === 'Carpet Restoration' ? 'Hot-water extraction & restorative fiber maintenance' : '',
        quantity: task.estimatedHours,
        unitPrice: rate,
        total: Math.round(task.estimatedHours * rate * 100) / 100,
      }
    ]);

    // If Carpet Restoration is chosen, automatically activate Carpet Cleaning Service Limitations & Disclaimer
    if (task.category === 'Carpet Restoration' || /carpet/i.test(task.description)) {
      setSelectedTerms((prev) => {
        const toAdd = CARPET_DISCLAIMER_TERMS.filter((t) => !prev.includes(t));
        return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
      });
      setShowTermsSection(true);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const isCarpetDisclaimerActive = CARPET_DISCLAIMER_TERMS.every((t) => selectedTerms.includes(t));

  const toggleCarpetDisclaimer = () => {
    if (isCarpetDisclaimerActive) {
      setSelectedTerms((prev) => prev.filter((t) => !CARPET_DISCLAIMER_TERMS.includes(t)));
    } else {
      setSelectedTerms((prev) => {
        const toAdd = CARPET_DISCLAIMER_TERMS.filter((t) => !prev.includes(t));
        return [...prev, ...toAdd];
      });
    }
  };

  const togglePaymentTerm = (termText: string) => {
    setSelectedTerms((prev) => {
      if (prev.includes(termText)) {
        return prev.filter((t) => t !== termText);
      }
      const paymentTexts = PRESET_PAYMENT_TERMS.map((p) => p.text);
      const withoutPayment = prev.filter((t) => !paymentTexts.includes(t));
      return [termText, ...withoutPayment];
    });
  };

  const toggleTerm = (termText: string) => {
    setSelectedTerms((prev) =>
      prev.includes(termText) ? prev.filter((t) => t !== termText) : [...prev, termText]
    );
  };

  const handleAddCustomTerm = () => {
    const trimmed = customTermText.trim();
    if (!trimmed) return;
    if (!selectedTerms.includes(trimmed)) {
      setSelectedTerms((prev) => [...prev, trimmed]);
    }
    setCustomTermText('');
  };

  const handleRemoveCustomTerm = (termText: string) => {
    setSelectedTerms((prev) => prev.filter((t) => t !== termText));
  };

  const subtotal = items.reduce((acc, item) => acc + (Number(item.total) || 0), 0);
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const total = subtotal + taxAmount;

  const handleSave = (status: Estimate['status'] = 'draft') => {
    if (!selectedClient || !selectedProperty) {
      alert('Please select a client and service property address.');
      return;
    }

    const clientDisplayName = selectedClient.isCompany
      ? selectedClient.companyName || `${selectedClient.firstName} ${selectedClient.lastName}`
      : `${selectedClient.firstName} ${selectedClient.lastName}`;

    const propAddressString = `${selectedProperty.street} ${selectedProperty.unit ? `(${selectedProperty.unit})` : ''}, ${selectedProperty.city}, ${selectedProperty.state}`;

    const cleanedItems = items.map((it) => {
      const q = Number(it.quantity) || 0;
      const p = Number(it.unitPrice) || 0;
      return {
        ...it,
        details: it.details?.trim() || undefined,
        quantity: q,
        unitPrice: p,
        total: Math.round(q * p * 100) / 100,
      };
    });

    const computedSubtotal = cleanedItems.reduce((acc, it) => acc + it.total, 0);
    const computedTaxAmount = Math.round(computedSubtotal * taxRate * 100) / 100;
    const computedTotal = Math.round((computedSubtotal + computedTaxAmount) * 100) / 100;

    if (estimateToEdit) {
      updateEstimate(estimateToEdit.id, {
        clientId: selectedClient.id,
        clientName: clientDisplayName,
        propertyId: selectedProperty.id,
        propertyAddress: propAddressString,
        items: cleanedItems,
        subtotal: computedSubtotal,
        taxRate,
        taxAmount: computedTaxAmount,
        total: computedTotal,
        status: status || estimateToEdit.status,
        validUntil,
        marketComparison: marketComparisonData || undefined,
        terms: selectedTerms,
      });

      if (onSuccess) onSuccess(estimateToEdit.id);
      onClose();
      return;
    }

    const created = addEstimate({
      clientId: selectedClient.id,
      clientName: clientDisplayName,
      propertyId: selectedProperty.id,
      propertyAddress: propAddressString,
      items: cleanedItems,
      subtotal: computedSubtotal,
      taxRate,
      taxAmount: computedTaxAmount,
      total: computedTotal,
      status: (status === 'draft' || status === 'sent') ? status : 'draft',
      validUntil,
      marketComparison: marketComparisonData || undefined,
      terms: selectedTerms,
    });

    if (onSuccess) onSuccess(created.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#111111] text-[#fdfbf7] rounded-2xl shadow-2xl max-w-5xl w-full border border-[#2a2a2a] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#181818] p-5 border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c5a059] flex items-center justify-center text-black font-bold">
              {estimateToEdit ? <Pencil className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#fdfbf7] font-heading">
                {estimateToEdit ? `Edit Estimate ${estimateToEdit.estimateNumber}` : 'Create Line-Item Estimate'}
              </h3>
              <p className="text-xs text-[#b8b0a5]">
                {estimateToEdit 
                  ? 'Correct line items, prices, quantities, or property address before customer digital signing' 
                  : 'Build quotation with labor, materials, and one-click conversion'}
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

        <div className="p-6 space-y-6 text-xs max-h-[85vh] overflow-y-auto">
          {/* Client & Property Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-[#c5a059]" />
                <span>Client Account *</span>
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.isCompany ? `${c.companyName} (${c.firstName} ${c.lastName})` : `${c.firstName} ${c.lastName}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[#c5a059]" />
                <span>Service Property Address *</span>
              </label>
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              >
                {clientProperties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label ? `${p.label} - ` : ''}{p.street} {p.unit || ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Expiration Date, Tax Rate & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#c5a059]" />
                <span>Valid Until Date</span>
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
                Rome, GA Sales Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={taxRate * 100}
                onChange={(e) => setTaxRate((parseFloat(e.target.value) || 0) / 100)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#c5a059]" />
                <span>Estimate Status</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              >
                <option value="draft">Draft (Internal)</option>
                <option value="sent">Pending Digital Signature</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>

          {/* Rome, GA Market Pegged Calculator Trigger Card */}
          {/* Automated Estimate Tools */}
          <div className="bg-[#161616] border border-[#262626] p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-[#c5a059]" />
                <span className="text-xs font-bold text-[#fdfbf7] uppercase tracking-wider">Automated Pricing Tools</span>
              </div>
              <p className="text-[11px] text-[#b8b0a5] mt-0.5">
                Generate estimates using Rome GA pegging or standard predetermined task list.
              </p>
            </div>

            <div className="flex space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowRomeCalculator(!showRomeCalculator);
                  setShowTaskCatalog(false);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
                  showRomeCalculator
                    ? 'bg-[#c5a059] text-black font-extrabold shadow-md'
                    : 'bg-[#222222] hover:bg-[#2c2c2c] text-[#c5a059] border border-[#c5a059]/40'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>{showRomeCalculator ? 'Hide Pegging Tool' : 'Rome Pegging'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowTaskCatalog(!showTaskCatalog);
                  setShowRomeCalculator(false);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
                  showTaskCatalog
                    ? 'bg-emerald-600 text-white font-extrabold shadow-md'
                    : 'bg-[#222222] hover:bg-[#2c2c2c] text-emerald-400 border border-emerald-500/40'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showTaskCatalog ? 'Hide Catalog' : 'Standard Tasks'}</span>
              </button>
            </div>
          </div>

          {/* Inline Dynamic Repair Estimator */}
          {showRomeCalculator && (
            <DynamicRepairEstimator
              onApplyEstimateItems={(newItems, comparison) => {
                setItems(newItems);
                setMarketComparisonData(comparison);
                setShowRomeCalculator(false);
              }}
              onClose={() => setShowRomeCalculator(false)}
            />
          )}

          {/* Standard Task Catalog */}
          {showTaskCatalog && (
            <StandardTaskCatalog 
              onSelectTask={handleSelectStandardTask}
            />
          )}

          {/* Market Comparison / AI Status Pill if set */}
          {marketComparisonData && (
            <div className={`border rounded-xl p-3 flex justify-between items-center text-xs ${marketComparisonData.isGeminiOption ? 'bg-purple-950/40 border-purple-500/50' : 'bg-emerald-950/40 border-emerald-500/50'}`}>
              <span className={`font-semibold flex items-center gap-1.5 ${marketComparisonData.isGeminiOption ? 'text-purple-300' : 'text-emerald-300'}`}>
                {marketComparisonData.isGeminiOption ? (
                  <>
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Applied Gemini AI Option: {marketComparisonData.tradeLabel}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Estimate pegged to Rome, GA median for {marketComparisonData.tradeLabel}</span>
                  </>
                )}
              </span>
              {!marketComparisonData.isGeminiOption && (
                <span className="font-mono text-emerald-400 font-bold">
                  Customer Saves ${marketComparisonData.customerDollarSavings?.toFixed(2)} ({marketComparisonData.percentBelowMedian}% below local median)
                </span>
              )}
            </div>
          )}

          {/* Line Items Table */}
          <div className="border border-[#262626] rounded-xl overflow-hidden bg-[#161616]">
            <div className="p-3 bg-[#181818] border-b border-[#262626] flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#b8b0a5]">Line Items</span>
              <div className="flex space-x-1.5">
                <button
                  type="button"
                  onClick={() => handleAddItem('labor')}
                  className="bg-[#222222] hover:bg-[#2c2c2c] text-blue-400 text-[10px] font-bold px-2 py-1 rounded"
                >
                  + Add Labor
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem('material')}
                  className="bg-[#222222] hover:bg-[#2c2c2c] text-amber-400 text-[10px] font-bold px-2 py-1 rounded"
                >
                  + Add Material
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem('flat_rate')}
                  className="bg-[#222222] hover:bg-[#2c2c2c] text-emerald-400 text-[10px] font-bold px-2 py-1 rounded"
                >
                  + Add Flat Rate
                </button>
              </div>
            </div>

            <div className="divide-y divide-[#222222] p-2 space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className="p-2.5 rounded-lg bg-[#181818] space-y-2">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    {/* Type */}
                    <div className="col-span-2">
                      <select
                        value={item.type}
                        onChange={(e) => handleItemChange(idx, 'type', e.target.value)}
                        className="w-full bg-[#111111] border border-[#2a2a2a] rounded px-2 py-1.5 text-[11px] text-[#fdfbf7] focus:outline-none"
                      >
                        <option value="labor">Labor</option>
                        <option value="material">Materials</option>
                        <option value="flat_rate">Flat Rate</option>
                      </select>
                    </div>

                    {/* Description */}
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="Line item description"
                        className="w-full bg-[#111111] border border-[#2a2a2a] rounded px-2 py-1.5 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full bg-[#111111] border border-[#2a2a2a] rounded px-2 py-1.5 text-xs text-[#fdfbf7] text-center focus:outline-none"
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1.5 text-[#78716c]">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full bg-[#111111] border border-[#2a2a2a] rounded pl-5 pr-2 py-1.5 text-xs text-[#fdfbf7] text-right font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        className="text-[#78716c] hover:text-red-400 disabled:opacity-30 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Optional Description / Scope Details Line Beneath Item */}
                  <div className="pl-1 pr-1 flex items-center gap-2">
                    <span className="text-[10px] text-[#78716c] shrink-0 font-medium">↳ Note:</span>
                    <input
                      type="text"
                      value={item.details || ''}
                      onChange={(e) => handleItemChange(idx, 'details', e.target.value)}
                      placeholder="Optional brief description / scope details (e.g. brand, model, room, or procedure)"
                      className="w-full bg-[#111111] border border-[#262626] rounded px-2.5 py-1 text-[11px] text-[#d6d3cd] placeholder-[#555] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Footer */}
            <div className="bg-[#181818] border-t border-[#262626] p-4 space-y-1.5 text-right">
              <div className="text-xs text-[#b8b0a5]">
                Subtotal: <span className="font-mono text-[#fdfbf7] font-bold ml-2">${Number(subtotal).toFixed(2)}</span>
              </div>
              <div className="text-xs text-[#b8b0a5]">
                Floyd County Sales Tax ({Number(taxRate * 100).toFixed(0)}%): <span className="font-mono text-[#fdfbf7] font-bold ml-2">${Number(taxAmount).toFixed(2)}</span>
              </div>
              <div className="text-sm font-bold text-[#c5a059] pt-2 border-t border-[#262626]">
                Grand Total: <span className="font-mono text-base ml-2">${Number(total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions Selection Card */}
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer select-none" 
              onClick={() => setShowTermsSection(!showTermsSection)}
            >
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#fdfbf7]">
                  Quotation Terms &amp; Conditions
                </span>
                <span className="bg-[#1e1e1e] border border-[#333] text-[#c5a059] text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  {selectedTerms.length} Selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTerms(DEFAULT_ESTIMATE_TERMS);
                  }}
                  className="text-[10px] text-[#78716c] hover:text-[#c5a059] underline font-medium"
                >
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTerms([]);
                  }}
                  className="text-[10px] text-[#78716c] hover:text-red-400 underline font-medium"
                >
                  Clear All
                </button>
                {showTermsSection ? (
                  <ChevronUp className="w-4 h-4 text-[#78716c]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#78716c]" />
                )}
              </div>
            </div>

            {showTermsSection && (
              <div className="space-y-4 pt-2 border-t border-[#222222]">
                {/* Payment Terms Section */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b8b0a5] mb-2 flex items-center justify-between">
                    <span>1. Payment Terms (Select to Apply)</span>
                    <span className="text-[10px] text-[#78716c] font-normal">Click to switch or toggle</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PRESET_PAYMENT_TERMS.map((pt) => {
                      const isChecked = selectedTerms.includes(pt.text);
                      return (
                        <div
                          key={pt.id}
                          onClick={() => togglePaymentTerm(pt.text)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-left cursor-pointer transition select-none ${
                            isChecked
                              ? 'bg-[#c5a059]/10 border-[#c5a059] text-[#fdfbf7]'
                              : 'bg-[#181818] border-[#262626] text-[#888] hover:border-[#333] hover:text-[#b8b0a5]'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-[#c5a059]" />
                            ) : (
                              <Square className="w-4 h-4 text-[#555]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-semibold ${isChecked ? 'text-[#c5a059]' : 'text-[#d6d3cd]'}`}>
                              {pt.label}
                            </div>
                            <div className="text-[10px] text-[#78716c] leading-relaxed mt-0.5">
                              {pt.text}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Protection & Scope Clauses */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b8b0a5] mb-2">
                    2. Protection &amp; Scope Clauses (Check all that apply)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PRESET_PROTECTION_TERMS.map((pt) => {
                      const isChecked = selectedTerms.includes(pt.text);
                      return (
                        <div
                          key={pt.id}
                          onClick={() => toggleTerm(pt.text)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-left cursor-pointer transition select-none ${
                            isChecked
                              ? 'bg-[#c5a059]/10 border-[#c5a059] text-[#fdfbf7]'
                              : 'bg-[#181818] border-[#262626] text-[#888] hover:border-[#333] hover:text-[#b8b0a5]'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-[#c5a059]" />
                            ) : (
                              <Square className="w-4 h-4 text-[#555]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-semibold ${isChecked ? 'text-[#c5a059]' : 'text-[#d6d3cd]'}`}>
                              {pt.label}
                            </div>
                            <div className="text-[10px] text-[#78716c] leading-relaxed mt-0.5">
                              {pt.text}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Specialized Service Disclaimers */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b8b0a5] mb-2 flex items-center justify-between">
                    <span>3. Specialized Service Disclaimers</span>
                    <span className="text-[10px] text-[#c5a059] font-normal">Auto-attaches when selecting Carpet Restoration</span>
                  </label>
                  <div
                    onClick={toggleCarpetDisclaimer}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition select-none ${
                      isCarpetDisclaimerActive
                        ? 'bg-amber-950/20 border-[#c5a059] text-[#fdfbf7]'
                        : 'bg-[#181818] border-[#262626] text-[#888] hover:border-[#333] hover:text-[#b8b0a5]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {isCarpetDisclaimerActive ? (
                          <CheckSquare className="w-4 h-4 text-[#c5a059]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#555]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isCarpetDisclaimerActive ? 'text-[#c5a059]' : 'text-[#d6d3cd]'}`}>
                            Carpet Cleaning Service Limitations &amp; Disclaimer
                          </span>
                          <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded font-bold ${
                            isCarpetDisclaimerActive ? 'bg-[#c5a059] text-black' : 'bg-[#222] text-[#888]'
                          }`}>
                            4 Protection Clauses
                          </span>
                        </div>
                        <div className="text-[10px] text-[#888] mt-2 space-y-1.5 leading-relaxed">
                          <div>
                            <strong className="text-[#d6d3cd]">Stains &amp; Wear:</strong> Professional-grade extraction used; complete removal of all stains, dyes, or deep discolorations cannot be guaranteed. Cleaning removes soil but cannot repair crushed fibers, fraying, or traffic lane wear.
                          </div>
                          <div>
                            <strong className="text-[#d6d3cd]">Pet Odors &amp; Pad Damage:</strong> Surface cleaning treats carpet fibers but does not penetrate the underlying pad or subfloor. Severe odors (such as pet urine) in padding may require full replacement and subfloor treatment.
                          </div>
                          <div>
                            <strong className="text-[#d6d3cd]">Safety &amp; Drying:</strong> Please allow 6 to 24 hours for carpets to fully dry. Exercise extreme caution walking from damp carpet onto hard flooring (tile or wood), as footwear will be slippery.
                          </div>
                          <div>
                            <strong className="text-[#d6d3cd]">Acceptance:</strong> By approving this estimate, client acknowledges this is maintenance cleaning in lieu of carpet replacement; contractor is not liable for pre-existing conditions, permanent stains, or structural wear.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Terms & Summary */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b8b0a5] mb-1.5">
                    4. Custom Condition / Specific Scope Note
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customTermText}
                      onChange={(e) => setCustomTermText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomTerm();
                        }
                      }}
                      placeholder="e.g. Client provides vanity hardware; work performed between 9am-2pm only..."
                      className="flex-1 bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-xs text-[#fdfbf7] placeholder-[#555] focus:outline-none focus:border-[#c5a059]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTerm}
                      disabled={!customTermText.trim()}
                      className="bg-[#222222] hover:bg-[#2c2c2c] disabled:opacity-40 text-[#c5a059] font-bold text-xs px-3 py-1.5 rounded-lg border border-[#333] transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Term</span>
                    </button>
                  </div>

                  {/* Non-preset custom terms list */}
                  {selectedTerms.filter(t => 
                    !PRESET_PAYMENT_TERMS.some(p => p.text === t) && 
                    !PRESET_PROTECTION_TERMS.some(p => p.text === t) &&
                    !CARPET_DISCLAIMER_TERMS.includes(t)
                  ).length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <div className="text-[10px] font-bold text-[#b8b0a5] uppercase">Active Custom Conditions:</div>
                      {selectedTerms.filter(t => 
                        !PRESET_PAYMENT_TERMS.some(p => p.text === t) && 
                        !PRESET_PROTECTION_TERMS.some(p => p.text === t) &&
                        !CARPET_DISCLAIMER_TERMS.includes(t)
                      ).map((ct, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-[#181818] border border-[#333] text-xs text-[#fdfbf7]">
                          <span className="flex-1 mr-2 text-[11px]">• {ct}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomTerm(ct)}
                            className="text-[#78716c] hover:text-red-400 p-0.5"
                            title="Remove custom term"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="border-t border-[#222222] pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#333333] text-xs font-semibold text-[#b8b0a5] hover:bg-[#1a1a1a]"
            >
              Cancel
            </button>
            {estimateToEdit ? (
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => handleSave(status)}
                  className="px-5 py-2 rounded-lg bg-[#c5a059] hover:bg-[#b38728] text-black text-xs font-bold shadow-lg transition flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save & Update Estimate</span>
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => handleSave('draft')}
                  className="px-4 py-2 rounded-lg bg-[#222222] hover:bg-[#2a2a2a] text-[#fdfbf7] text-xs font-bold border border-[#333333]"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('sent')}
                  className="px-5 py-2 rounded-lg bg-[#c5a059] hover:bg-[#b38728] text-black text-xs font-bold shadow-lg transition flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Customer for Approval</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
