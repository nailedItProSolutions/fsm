'use client';

import React, { useState, useEffect } from 'react';
import { useFSMStore } from '@/lib/useStore';
import { EstimateItem } from '@/types';
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
  Send
} from 'lucide-react';

interface EstimateBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (estimateId: string) => void;
}

export const EstimateBuilderModal: React.FC<EstimateBuilderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { clients, properties, addEstimate } = useFSMStore();

  const [clientId, setClientId] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [taxRate, setTaxRate] = useState(0.07); // 7% Floyd County GA
  const [items, setItems] = useState<EstimateItem[]>([
    { id: '1', type: 'labor', description: 'Technician Labor (Hourly)', quantity: 2, unitPrice: 85, total: 170 },
    { id: '2', type: 'material', description: 'Commercial Replacement Hardware / Fixtures', quantity: 1, unitPrice: 95, total: 95 },
  ]);

  useEffect(() => {
    if (!clientId && clients.length > 0) {
      setClientId(clients[0].id);
    }
  }, [clients, clientId]);

  const clientProperties = properties.filter((p) => p.clientId === clientId);

  useEffect(() => {
    if (clientProperties.length > 0) {
      setPropertyId(clientProperties[0].id);
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
      const q = field === 'quantity' ? parseFloat(val) || 0 : current.quantity;
      const p = field === 'unitPrice' ? parseFloat(val) || 0 : current.unitPrice;
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
        quantity: 1,
        unitPrice: type === 'labor' ? 85 : 50,
        total: type === 'labor' ? 85 : 50,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.total || 0), 0);
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const total = subtotal + taxAmount;

  const handleSave = (status: 'draft' | 'sent') => {
    if (!selectedClient || !selectedProperty) {
      alert('Please select a client and service property address.');
      return;
    }

    const clientDisplayName = selectedClient.isCompany
      ? selectedClient.companyName || `${selectedClient.firstName} ${selectedClient.lastName}`
      : `${selectedClient.firstName} ${selectedClient.lastName}`;

    const propAddressString = `${selectedProperty.street} ${selectedProperty.unit ? `(${selectedProperty.unit})` : ''}, ${selectedProperty.city}, ${selectedProperty.state}`;

    const created = addEstimate({
      clientId: selectedClient.id,
      clientName: clientDisplayName,
      propertyId: selectedProperty.id,
      propertyAddress: propAddressString,
      items,
      subtotal,
      taxRate,
      taxAmount,
      total,
      status,
      validUntil,
    });

    if (onSuccess) onSuccess(created.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#111111] text-[#fdfbf7] rounded-2xl shadow-2xl max-w-3xl w-full border border-[#2a2a2a] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#181818] p-5 border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c5a059] flex items-center justify-center text-black font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#fdfbf7] font-heading">Create Line-Item Estimate</h3>
              <p className="text-xs text-[#b8b0a5]">Build quotation with labor, materials, and one-click conversion</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#78716c] hover:text-[#fdfbf7] p-1 rounded-lg hover:bg-[#222222] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs max-h-[78vh] overflow-y-auto">
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

          {/* Expiration Date */}
          <div className="grid grid-cols-2 gap-4">
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
          </div>

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
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-[#181818]">
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
                      className="w-full bg-[#111111] border border-[#2a2a2a] rounded px-2 py-1.5 text-xs text-[#fdfbf7] focus:outline-none"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
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
              ))}
            </div>

            {/* Calculations Footer */}
            <div className="bg-[#181818] border-t border-[#262626] p-4 space-y-1.5 text-right">
              <div className="text-xs text-[#b8b0a5]">
                Subtotal: <span className="font-mono text-[#fdfbf7] font-bold ml-2">${subtotal.toFixed(2)}</span>
              </div>
              <div className="text-xs text-[#b8b0a5]">
                Floyd County Sales Tax ({(taxRate * 100).toFixed(0)}%): <span className="font-mono text-[#fdfbf7] font-bold ml-2">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="text-sm font-bold text-[#c5a059] pt-2 border-t border-[#262626]">
                Grand Total: <span className="font-mono text-base ml-2">${total.toFixed(2)}</span>
              </div>
            </div>
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
          </div>
        </div>
      </div>
    </div>
  );
};
