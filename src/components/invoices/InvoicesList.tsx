'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFSMStore } from '@/lib/useStore';
import { Invoice } from '@/types';
import { InvoiceBuilderModal } from './InvoiceBuilderModal';
import { 
  Receipt, 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer, 
  Copy, 
  ExternalLink, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  X,
  ShieldCheck,
  Check
} from 'lucide-react';

export const InvoicesList: React.FC = () => {
  const { invoices, markInvoicePaid } = useFSMStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'paid' | 'overdue'>('all');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);
  const [selectedInvoiceForStripe, setSelectedInvoiceForStripe] = useState<Invoice | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Stripe Modal state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [cardZip, setCardZip] = useState('30162');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Calculations for KPI cards
  const totalAR = invoices
    .filter((inv) => inv.status !== 'paid' && inv.status !== 'void')
    .reduce((sum, inv) => sum + inv.balanceDue, 0);

  const totalCollected = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.amountPaid || inv.total), 0);

  const unpaidCount = invoices.filter((inv) => inv.status !== 'paid').length;
  const paidCount = invoices.filter((inv) => inv.status === 'paid').length;

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCopyLink = (invoice: Invoice) => {
    const url = `${window.location.origin}/pay/${invoice.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(invoice.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleProcessStripePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForStripe) return;

    setIsProcessingPayment(true);
    setTimeout(() => {
      markInvoicePaid(selectedInvoiceForStripe.id, `ch_test_${Date.now()}`);
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setSelectedInvoiceForStripe(null);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#c5a059] mb-1">
            <CreditCard className="w-4 h-4 text-[#FF8A00]" />
            <span>Billing, Accounts Receivable & Stripe</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-[#fdfbf7]">
            Invoicing & Payment Collection
          </h1>
          <p className="text-xs text-[#b8b0a5] mt-1">
            Generate Floyd County compliant PDF invoices, process credit cards via Stripe, and track cashflow.
          </p>
        </div>

        <button
          onClick={() => setIsBuilderOpen(true)}
          className="bg-[#c5a059] hover:bg-[#d4b068] text-black font-bold text-xs px-4 py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer Invoice</span>
        </button>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF8A00]/5 blur-2xl rounded-full" />
          <div className="flex items-center justify-between text-xs text-[#b8b0a5] mb-2 font-medium">
            <span>Outstanding AR</span>
            <AlertCircle className="w-4 h-4 text-[#FF8A00]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#fdfbf7]">
            ${totalAR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#78716c] mt-1 flex items-center gap-1">
            <span className="text-[#FF8A00] font-semibold">{unpaidCount} invoices</span> awaiting settlement
          </div>
        </div>

        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />
          <div className="flex items-center justify-between text-xs text-[#b8b0a5] mb-2 font-medium">
            <span>Total Collected</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ${totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#78716c] mt-1">
            <span className="text-emerald-400 font-semibold">{paidCount} invoices</span> paid in full
          </div>
        </div>

        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#b8b0a5] mb-2 font-medium">
            <span>Floyd County Sales Tax Rate</span>
            <DollarSign className="w-4 h-4 text-[#c5a059]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#c5a059]">7.00%</div>
          <div className="text-[11px] text-[#78716c] mt-1">
            State (4%) + Local Option (3%)
          </div>
        </div>

        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#b8b0a5] mb-2 font-medium">
            <span>Stripe Integration</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-sm font-bold text-[#fdfbf7] flex items-center gap-1.5 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Card Processing Ready</span>
          </div>
          <div className="text-[11px] text-[#78716c] mt-2">
            Apple Pay, Google Pay, CC auto-link
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716c]" />
          <input
            type="text"
            placeholder="Search by invoice #, client, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl pl-9 pr-4 py-2 text-xs text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-[#78716c] flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {(['all', 'sent', 'paid', 'overdue'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                statusFilter === tab
                  ? 'bg-[#c5a059] text-black font-bold'
                  : 'bg-[#181818] text-[#b8b0a5] hover:bg-[#202020]'
              }`}
            >
              {tab === 'all' ? 'All Invoices' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161616] text-[#b8b0a5] font-semibold border-b border-[#222222]">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Client & Property</th>
                <th className="p-4">Linked Job</th>
                <th className="p-4">Due Date</th>
                <th className="p-4 text-right">Total Amount</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#78716c]">
                    No invoices matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => {
                  const isPaid = invoice.status === 'paid';
                  const isOverdue = invoice.status === 'overdue';

                  return (
                    <tr key={invoice.id} className="hover:bg-[#161616]/80 transition">
                      <td className="p-4 font-mono font-bold text-[#fdfbf7]">
                        <div className="flex items-center gap-1.5">
                          <Receipt className="w-3.5 h-3.5 text-[#c5a059]" />
                          <span>{invoice.invoiceNumber}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-[#fdfbf7]">{invoice.clientName}</div>
                        <div className="text-[11px] text-[#78716c] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#FF8A00]" />
                          <span className="truncate max-w-xs">{invoice.propertyAddress}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-mono text-[11px] bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#2a2a2a] text-[#b8b0a5]">
                          {invoice.jobNumber}
                        </span>
                      </td>

                      <td className="p-4 text-[#b8b0a5]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#78716c]" />
                          <span>{invoice.dueDate}</span>
                        </div>
                      </td>

                      <td className="p-4 text-right font-mono font-bold text-sm text-[#fdfbf7]">
                        ${invoice.total.toFixed(2)}
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${
                            isPaid
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : isOverdue
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {invoice.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Print / PDF preview */}
                          <button
                            onClick={() => setSelectedInvoiceForPrint(invoice)}
                            title="View / Print PDF Invoice"
                            className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-[#b8b0a5] hover:text-[#fdfbf7] border border-[#2c2c2c] transition"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Copy Payment Link */}
                          <button
                            onClick={() => handleCopyLink(invoice)}
                            title="Copy Direct Customer Payment Link"
                            className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-[#b8b0a5] hover:text-[#fdfbf7] border border-[#2c2c2c] transition relative"
                          >
                            {copiedId === invoice.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Public Pay Link */}
                          <Link
                            href={`/pay/${invoice.id}`}
                            target="_blank"
                            title="Open Customer Checkout Portal"
                            className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-[#b8b0a5] hover:text-[#fdfbf7] border border-[#2c2c2c] transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Stripe Pay button if not paid */}
                          {!isPaid ? (
                            <button
                              onClick={() => setSelectedInvoiceForStripe(invoice)}
                              className="bg-[#c5a059] hover:bg-[#d4b068] text-black font-bold px-2.5 py-1.5 rounded-lg transition text-[11px] flex items-center space-x-1"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Stripe Pay</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-400 font-semibold px-2 py-1">
                              Paid ✓
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Builder Modal */}
      <InvoiceBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
      />

      {/* Stripe Payment Checkout Modal */}
      {selectedInvoiceForStripe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#111111] border border-[#262626] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-[#222222] bg-[#141414] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-[#635BFF]/20 text-[#635BFF]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#fdfbf7]">Stripe Secure Payment</h3>
                  <p className="text-[11px] text-[#b8b0a5]">Invoice {selectedInvoiceForStripe.invoiceNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoiceForStripe(null)}
                className="text-[#78716c] hover:text-[#fdfbf7]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProcessStripePayment} className="p-6 space-y-4">
              <div className="bg-[#161616] p-4 rounded-xl border border-[#262626] flex justify-between items-center text-xs">
                <div>
                  <div className="text-[#b8b0a5]">Customer:</div>
                  <div className="font-bold text-[#fdfbf7]">{selectedInvoiceForStripe.clientName}</div>
                </div>
                <div className="text-right">
                  <div className="text-[#b8b0a5]">Amount Due:</div>
                  <div className="text-base font-bold font-mono text-[#c5a059]">
                    ${selectedInvoiceForStripe.balanceDue.toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#b8b0a5] mb-1">
                  Card Number (Demo test mode enabled)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-xs text-[#fdfbf7] font-mono focus:outline-none focus:border-[#635BFF]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-[#635BFF]/20 text-[#635BFF] px-2 py-0.5 rounded font-bold">
                    TEST
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#b8b0a5] mb-1">Expires</label>
                  <input
                    type="text"
                    required
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-[#fdfbf7] text-center font-mono focus:outline-none focus:border-[#635BFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#b8b0a5] mb-1">CVC</label>
                  <input
                    type="text"
                    required
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-[#fdfbf7] text-center font-mono focus:outline-none focus:border-[#635BFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#b8b0a5] mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={cardZip}
                    onChange={(e) => setCardZip(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-[#fdfbf7] text-center font-mono focus:outline-none focus:border-[#635BFF]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-[#78716c] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-bit encrypted via Stripe Payments API</span>
              </div>

              <button
                type="submit"
                disabled={isProcessingPayment || paymentSuccess}
                className="w-full bg-[#635BFF] hover:bg-[#5249e0] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
              >
                {isProcessingPayment ? (
                  <span>Authorizing with Stripe...</span>
                ) : paymentSuccess ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Payment Confirmed!
                  </span>
                ) : (
                  <span>Charge ${selectedInvoiceForStripe.balanceDue.toFixed(2)} USD</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Printable PDF Invoice Preview Modal */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-white text-gray-900 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
            {/* Top Toolbar */}
            <div className="bg-[#111111] text-[#fdfbf7] p-4 flex items-center justify-between border-b border-[#222222]">
              <div className="flex items-center space-x-2 text-xs">
                <Receipt className="w-4 h-4 text-[#c5a059]" />
                <span className="font-bold">Official Invoice Preview: {selectedInvoiceForPrint.invoiceNumber}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="bg-[#c5a059] hover:bg-[#d4b068] text-black font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setSelectedInvoiceForPrint(null)}
                  className="p-1.5 text-[#78716c] hover:text-[#fdfbf7] rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Physical Invoice Paper Layout */}
            <div className="p-8 sm:p-12 space-y-8 bg-white relative">
              {/* Payment Watermark if paid */}
              {selectedInvoiceForPrint.status === 'paid' && (
                <div className="absolute top-1/3 right-12 -rotate-12 border-4 border-emerald-600/30 text-emerald-600/30 font-black text-4xl sm:text-6xl px-6 py-2 uppercase rounded-xl pointer-events-none select-none">
                  PAID IN FULL
                </div>
              )}

              {/* Header with Logo and Nailed It Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-gray-200">
                <div>
                  <img
                    src="/logo.png"
                    alt="Nailed It Property Solutions"
                    className="h-14 w-auto object-contain mb-2"
                  />
                  <p className="text-xs text-gray-600 font-medium">Nailed It Property Solutions LLC</p>
                  <p className="text-xs text-gray-500">PO Box 53, Rome, GA 30162</p>
                  <p className="text-xs text-gray-500">Phone: (706) 844-8193</p>
                  <p className="text-xs text-gray-500">Email: dispatch@naileditpropertysolutions.com</p>
                </div>

                <div className="text-left sm:text-right">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">INVOICE</h2>
                  <div className="font-mono text-sm font-bold text-gray-700 mt-1">
                    {selectedInvoiceForPrint.invoiceNumber}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Date Issued: {new Date(selectedInvoiceForPrint.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-700 font-bold">
                    Due Date: {selectedInvoiceForPrint.dueDate}
                  </div>
                  <div className="mt-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded border ${
                        selectedInvoiceForPrint.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      Status: {selectedInvoiceForPrint.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bill To & Service Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-gray-200 pb-6">
                <div>
                  <span className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">
                    Billed To:
                  </span>
                  <div className="font-bold text-gray-900 text-sm mt-1">
                    {selectedInvoiceForPrint.clientName}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">
                    Service Property Address:
                  </span>
                  <div className="text-gray-800 font-medium text-xs mt-1">
                    {selectedInvoiceForPrint.propertyAddress}
                  </div>
                  <div className="text-gray-500 text-[11px] mt-0.5 font-mono">
                    Ref Job: {selectedInvoiceForPrint.jobNumber}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-300">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedInvoiceForPrint.items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-3 font-medium text-gray-800">{item.description}</td>
                        <td className="p-3 text-center text-gray-600">{item.quantity}</td>
                        <td className="p-3 text-right font-mono text-gray-600">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-gray-900">
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <div className="w-72 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold">${selectedInvoiceForPrint.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Floyd County Sales Tax (7%):</span>
                    <span className="font-mono font-semibold">${selectedInvoiceForPrint.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-black text-sm pt-2 border-t border-gray-300">
                    <span>Total:</span>
                    <span className="font-mono">${selectedInvoiceForPrint.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold pt-1">
                    <span>Amount Paid:</span>
                    <span className="font-mono">-${selectedInvoiceForPrint.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between bg-gray-100 p-2.5 rounded text-gray-900 font-black text-sm">
                    <span>Balance Due:</span>
                    <span className="font-mono text-base text-[#c5a059]">
                      ${selectedInvoiceForPrint.balanceDue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-6 border-t border-gray-200 text-[11px] text-gray-500 text-center">
                <p>Thank you for choosing Nailed It Property Solutions! We appreciate your business.</p>
                <p className="mt-0.5">Payment can be made via credit card online or check payable to Nailed It Property Solutions.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
