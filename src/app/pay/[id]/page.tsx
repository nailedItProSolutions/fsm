'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useFSMStore } from '@/lib/useStore';
import { 
  CreditCard, 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  Lock, 
  Printer, 
  Receipt, 
  Calendar,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function CustomerInvoicePaymentPortal() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { getInvoiceById, markInvoicePaid } = useFSMStore();

  const invoiceId = params.id as string;
  const invoice = getInvoiceById(invoiceId);

  useEffect(() => {
    if (searchParams.get('print') === 'true') {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [searchParams]);

  // Stripe Card State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [zip, setZip] = useState('30162');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');

  if (!invoice) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#fdfbf7] flex items-center justify-center p-4">
        <div className="bg-[#111111] p-8 rounded-2xl border border-[#222222] max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 text-[#FF8A00] mx-auto mb-3" />
          <h2 className="text-xl font-bold font-heading">Invoice Not Found</h2>
          <p className="text-xs text-[#b8b0a5] mt-1">This payment link may have expired or is invalid.</p>
        </div>
      </div>
    );
  }

  const isAlreadyPaid = invoice.status === 'paid' || paymentSuccess;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim() || !cardNumber || !expiry || !cvc) return;

    setIsProcessing(true);
    setTimeout(() => {
      const ref = `pi_live_${Math.floor(10000000 + Math.random() * 90000000)}`;
      markInvoicePaid(invoice.id, ref);
      setTransactionRef(ref);
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 1200);
  };

  const fillDemoCard = () => {
    setCardName(invoice.clientName);
    setCardNumber('4242 4242 4242 4242');
    setExpiry('11/27');
    setCvc('789');
    setZip('30162');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fdfbf7] py-8 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#c5a059]/5 blur-[90px] pointer-events-none rounded-full print-hide" />

          {/* Print Action */}
          <button 
            onClick={() => window.print()}
            className="print-hide absolute top-6 right-6 p-2 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] rounded-lg text-[#b8b0a5] hover:text-[#fdfbf7] transition"
            title="Print Invoice"
          >
            <Printer className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-[#222222] mt-4 sm:mt-0 pr-12">
            <div>
              <img
                src="/logo.png"
                alt="Nailed It Property Solutions"
                className="h-14 w-auto object-contain mb-2"
              />
              <div className="text-xs text-[#b8b0a5] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#FF8A00]" />
                <span>PO Box 53, Rome, GA 30162 • (706) 844-8193</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059] bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#c5a059]/30">
                Customer Invoice
              </span>
              <h1 className="font-mono text-xl font-bold text-[#fdfbf7] mt-2">{invoice.invoiceNumber}</h1>
              <div className="text-xs text-[#b8b0a5] mt-0.5">Due Date: {invoice.dueDate}</div>
            </div>
          </div>

          {/* Billing & Property Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-[#222222] text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#78716c]">Billed To:</span>
              <div className="font-bold text-sm text-[#fdfbf7] mt-0.5">{invoice.clientName}</div>
              <div className="text-[#b8b0a5] flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-[#FF8A00]" />
                <span>{invoice.propertyAddress}</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-[#78716c]">Payment Status:</span>
              <div className="mt-1">
                {isAlreadyPaid ? (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full uppercase inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Paid in Full
                  </span>
                ) : (
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold px-3 py-1 rounded-full uppercase">
                    Balance Due: ${Number(invoice.balanceDue).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Itemized breakdown */}
          <div className="pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#b8b0a5] mb-3">
              Itemized Property Services
            </h3>

            <div className="border border-[#262626] rounded-xl overflow-hidden bg-[#161616]">
              <table className="w-full text-xs">
                <thead className="bg-[#181818] text-[#b8b0a5] font-semibold border-b border-[#262626]">
                  <tr>
                    <th className="p-3.5 text-left">Description</th>
                    <th className="p-3.5 text-center">Qty</th>
                    <th className="p-3.5 text-right">Unit Price</th>
                    <th className="p-3.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#1a1a1a]">
                      <td className="p-3.5 font-semibold text-[#fdfbf7]">{item.description}</td>
                      <td className="p-3.5 text-center text-[#b8b0a5]">{item.quantity}</td>
                      <td className="p-3.5 text-right font-mono text-[#b8b0a5]">${Number(item.unitPrice).toFixed(2)}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-[#fdfbf7]">${Number(item.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#181818] border-t border-[#262626]">
                  <tr>
                    <td colSpan={3} className="p-3 text-right font-semibold text-[#b8b0a5]">Subtotal:</td>
                    <td className="p-3 text-right font-mono font-bold text-[#fdfbf7]">${Number(invoice.subtotal).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="p-3 text-right font-semibold text-[#b8b0a5]">Floyd County Sales Tax (7%):</td>
                    <td className="p-3 text-right font-mono font-bold text-[#fdfbf7]">${Number(invoice.tax).toFixed(2)}</td>
                  </tr>
                  <tr className="bg-[#1c1c1c] text-[#c5a059] font-bold text-sm">
                    <td colSpan={3} className="p-4 text-right">Total Amount Due:</td>
                    <td className="p-4 text-right font-mono text-base font-black">${Number(invoice.total).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Stripe Payment Form or Paid Receipt */}
        {!isAlreadyPaid ? (
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8 shadow-2xl print-hide">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#c5a059]">
                <Lock className="w-4 h-4 text-[#FF8A00]" />
                <span>Stripe Express Checkout</span>
              </div>
              <button
                type="button"
                onClick={fillDemoCard}
                className="text-[11px] text-[#c5a059] hover:underline flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3 h-3" /> Auto-fill Demo Card
              </button>
            </div>

            <h2 className="text-xl font-bold font-heading text-[#fdfbf7] mb-1">
              Pay ${Number(invoice.balanceDue).toFixed(2)} Securely
            </h2>
            <p className="text-xs text-[#b8b0a5] mb-6">
              Payment will be processed instantly and an electronic receipt sent to your email on file.
            </p>

            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#b8b0a5] mb-1">
                  Cardholder Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-xs text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#635BFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#b8b0a5] mb-1">
                  Card Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-xs text-[#fdfbf7] font-mono focus:outline-none focus:border-[#635BFF]"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1.5 text-xs text-[#b8b0a5]">
                    <span className="text-[10px] font-bold text-[#635BFF] bg-[#635BFF]/10 px-1.5 py-0.5 rounded">
                      STRIPE
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#b8b0a5] mb-1">Exp Date *</label>
                  <input
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-xs text-[#fdfbf7] text-center font-mono focus:outline-none focus:border-[#635BFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#b8b0a5] mb-1">CVC *</label>
                  <input
                    type="text"
                    required
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="123"
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-xs text-[#fdfbf7] text-center font-mono focus:outline-none focus:border-[#635BFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#b8b0a5] mb-1">Billing ZIP *</label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="30162"
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-xs text-[#fdfbf7] text-center font-mono focus:outline-none focus:border-[#635BFF]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-[11px] text-[#78716c]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>End-to-end encrypted with Stripe PCI-DSS Level 1</span>
                </div>
                <div className="font-semibold text-[#b8b0a5]">Rome, GA Dispatch</div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#635BFF] hover:bg-[#5349e0] disabled:opacity-50 text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-xl transition flex items-center justify-center space-x-2 mt-4"
              >
                <CreditCard className="w-5 h-5" />
                <span>
                  {isProcessing
                    ? 'Processing Payment with Stripe...'
                    : `Authorize Payment of $${Number(invoice.balanceDue).toFixed(2)}`}
                </span>
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-8 text-center shadow-2xl space-y-4 print-hide">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
            <h2 className="text-2xl font-bold font-heading text-white">Payment Received!</h2>
            <p className="text-xs text-emerald-200 max-w-md mx-auto leading-relaxed">
              Your payment of <span className="font-bold text-white font-mono">${Number(invoice.total).toFixed(2)}</span> has been successfully processed. Thank you for doing business with Nailed It Property Solutions!
            </p>
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 max-w-md mx-auto text-xs text-left space-y-1 font-mono">
              <div className="flex justify-between text-[#b8b0a5]">
                <span>Status:</span>
                <span className="text-emerald-400 font-bold">PAID IN FULL</span>
              </div>
              <div className="flex justify-between text-[#b8b0a5]">
                <span>Transaction Ref:</span>
                <span className="text-[#fdfbf7]">{transactionRef || 'pi_stripe_verified_30162'}</span>
              </div>
              <div className="flex justify-between text-[#b8b0a5]">
                <span>Paid Date:</span>
                <span className="text-[#fdfbf7]">{new Date().toLocaleString()}</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 bg-[#222222] hover:bg-[#2c2c2c] text-xs font-semibold text-[#fdfbf7] px-4 py-2 rounded-xl transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
