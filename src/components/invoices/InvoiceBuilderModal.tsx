'use client';

import React, { useState, useEffect } from 'react';
import { useFSMStore } from '@/lib/useStore';
import { InvoiceItem, Job } from '@/types';
import { X, Plus, Trash2, Receipt, Calculator, Calendar, FileText } from 'lucide-react';

interface InvoiceBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialJobId?: string;
}

export const InvoiceBuilderModal: React.FC<InvoiceBuilderModalProps> = ({
  isOpen,
  onClose,
  initialJobId,
}) => {
  const { clients, properties, jobs, addInvoice } = useFSMStore();

  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Standard Property Maintenance Labor', quantity: 2, unitPrice: 85, total: 170 },
  ]);

  const clientProperties = properties.filter((p) => p.clientId === selectedClientId);
  const clientJobs = jobs.filter((j) => j.clientId === selectedClientId);

  // If initialJobId is provided, pre-populate
  useEffect(() => {
    if (initialJobId) {
      const job = jobs.find((j) => j.id === initialJobId);
      if (job) {
        setSelectedClientId(job.clientId);
        setSelectedPropertyId(job.propertyId);
        setSelectedJobId(job.id);
        
        // Populate items from job or description
        if (job.totalAmount && job.totalAmount > 0) {
          setItems([
            {
              id: 'job-item-1',
              description: `${job.title} - ${job.description.split('\n')[0]}`,
              quantity: 1,
              unitPrice: job.totalAmount,
              total: job.totalAmount,
            },
          ]);
        }
      }
    } else if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
    }
  }, [initialJobId, jobs, clients]);

  // Handle client selection change
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const clientProps = properties.filter((p) => p.clientId === clientId);
    if (clientProps.length > 0) {
      setSelectedPropertyId(clientProps[0].id);
    } else {
      setSelectedPropertyId('');
    }
    setSelectedJobId('');
  };

  // Handle Job Auto-Populate
  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    if (!jobId) return;

    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedPropertyId(job.propertyId);
      // Create line items from job checklist or description
      if (job.checklist && job.checklist.length > 0) {
        const linePrice = job.totalAmount ? (job.totalAmount / job.checklist.length) : 75;
        const newItems: InvoiceItem[] = job.checklist.map((chk, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          description: chk.text,
          quantity: 1,
          unitPrice: Math.round(linePrice * 100) / 100,
          total: Math.round(linePrice * 100) / 100,
        }));
        setItems(newItems);
      } else {
        setItems([
          {
            id: `item-${Date.now()}`,
            description: job.title,
            quantity: 1,
            unitPrice: job.totalAmount || 150,
            total: job.totalAmount || 150,
          },
        ]);
      }
    }
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 85,
      total: 85,
    };
    setItems([...items, newItem]);
  };

  const handleItemChange = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            const qty = field === 'quantity' ? Number(value) : item.quantity;
            const price = field === 'unitPrice' ? Number(value) : item.unitPrice;
            updated.total = Math.round(qty * price * 100) / 100;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const taxRate = 0.07; // Floyd County 7%
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;

    const client = clients.find((c) => c.id === selectedClientId);
    const property = properties.find((p) => p.id === selectedPropertyId);
    const job = jobs.find((j) => j.id === selectedJobId);

    const clientName = client?.isCompany
      ? `${client.companyName} (${client.firstName} ${client.lastName})`
      : `${client?.firstName} ${client?.lastName}`;

    const propertyAddress = property
      ? `${property.street}${property.unit ? `, ${property.unit}` : ''}, ${property.city}, ${property.state}`
      : 'Service Address On File';

    addInvoice({
      jobId: selectedJobId || 'direct-invoice',
      jobNumber: job?.jobNumber || 'DIRECT',
      clientId: selectedClientId,
      clientName: clientName || 'Client',
      propertyId: selectedPropertyId || 'prop-default',
      propertyAddress,
      items,
      subtotal,
      tax,
      total,
      amountPaid: 0,
      balanceDue: total,
      status: 'sent',
      dueDate,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#111111] border border-[#262626] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#222222] bg-[#141414]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-[#fdfbf7]">Create Customer Invoice</h2>
              <p className="text-xs text-[#b8b0a5]">
                Generate invoice with Floyd County 7% sales tax & instant Stripe payment link
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#78716c] hover:text-[#fdfbf7] hover:bg-[#1a1a1a] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client & Property Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#b8b0a5] mb-1.5">
                Client / Company *
              </label>
              <select
                required
                value={selectedClientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.isCompany ? `${c.companyName} (${c.lastName})` : `${c.firstName} ${c.lastName}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#b8b0a5] mb-1.5">
                Service Property *
              </label>
              <select
                required
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              >
                {clientProperties.length === 0 ? (
                  <option value="">No properties saved</option>
                ) : (
                  clientProperties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label ? `${p.label} - ` : ''}{p.street}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#b8b0a5] mb-1.5">
                Link Completed Job (Optional)
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => handleJobSelect(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              >
                <option value="">-- Manual invoice / No job linked --</option>
                {clientJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.jobNumber} - {j.title.slice(0, 28)} ({j.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Terms & Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#161616] p-4 rounded-xl border border-[#222222]">
            <div>
              <label className="block text-xs font-semibold text-[#b8b0a5] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#FF8A00]" /> Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#b8b0a5] mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#c5a059]" /> Payment Terms Preset
              </label>
              <div className="flex gap-2">
                {[
                  { label: 'Due on Receipt', days: 0 },
                  { label: 'Net 15', days: 15 },
                  { label: 'Net 30', days: 30 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + preset.days);
                      setDueDate(d.toISOString().split('T')[0]);
                    }}
                    className="flex-1 py-2 px-2 bg-[#222222] hover:bg-[#2c2c2c] text-[11px] font-semibold text-[#b8b0a5] hover:text-[#fdfbf7] rounded-lg transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#b8b0a5] flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-[#c5a059]" />
                Invoice Line Items
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center space-x-1.5 text-xs text-[#c5a059] hover:text-[#e0bb6b] font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-center bg-[#161616] p-3 rounded-xl border border-[#262626]"
                >
                  <div className="col-span-12 sm:col-span-6">
                    <input
                      type="text"
                      required
                      placeholder="Service or materials description"
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-xs text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <div className="flex items-center">
                      <span className="text-[10px] text-[#78716c] mr-1.5">Qty:</span>
                      <input
                        type="number"
                        min="0.25"
                        step="0.25"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-2 py-1.5 text-xs text-[#fdfbf7] text-center focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <div className="flex items-center">
                      <span className="text-[10px] text-[#78716c] mr-1.5">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                        className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-2 py-1.5 text-xs text-[#fdfbf7] text-right focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>
                  </div>

                  <div className="col-span-3 sm:col-span-1 text-right font-mono text-xs font-bold text-[#fdfbf7]">
                    ${item.total.toFixed(2)}
                  </div>

                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      disabled={items.length <= 1}
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-[#78716c] hover:text-red-400 disabled:opacity-30 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-[#181818] border border-[#262626] rounded-xl p-4 flex flex-col items-end space-y-1.5 text-xs">
            <div className="flex justify-between w-64 text-[#b8b0a5]">
              <span>Subtotal:</span>
              <span className="font-mono text-[#fdfbf7] font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-64 text-[#b8b0a5]">
              <span>Floyd County Tax (7%):</span>
              <span className="font-mono text-[#fdfbf7] font-semibold">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-64 pt-2 border-t border-[#333333] text-sm font-bold text-[#c5a059]">
              <span>Total Balance Due:</span>
              <span className="font-mono text-base font-black text-[#fdfbf7]">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#b8b0a5] hover:text-[#fdfbf7] hover:bg-[#1c1c1c] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#c5a059] hover:bg-[#d4b068] text-black font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg transition flex items-center space-x-2"
            >
              <Receipt className="w-4 h-4" />
              <span>Create & Issue Invoice</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
