'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Client, Property, Job, Invoice } from '@/types';
import { useFSMStore } from '@/lib/useStore';
import { AddPropertyModal } from './AddPropertyModal';
import { 
  Building2, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Plus, 
  Key, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  DollarSign, 
  ArrowLeft,
  Wrench,
  ChevronRight,
  Repeat,
  ShieldCheck,
  Sparkles,
  Check
} from 'lucide-react';

interface ClientDetailProps {
  client: Client;
  onBack?: () => void;
  initialTab?: 'properties' | 'history' | 'billing' | 'subscriptions' | 'notes';
}

export const ClientDetail: React.FC<ClientDetailProps> = ({ client, onBack, initialTab }) => {
  const { 
    getPropertiesByClientId, 
    getJobsByClientId, 
    getInvoicesByClientId,
    getSubscriptionsByClientId,
    createSubscription,
    cancelSubscription,
    triggerSubscriptionRenewal
  } = useFSMStore();

  const [activeTab, setActiveTab] = useState<'properties' | 'history' | 'billing' | 'subscriptions' | 'notes'>(initialTab || 'properties');
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showNewSubModal, setShowNewSubModal] = useState(false);
  const [selectedPropIdForSub, setSelectedPropIdForSub] = useState('');
  const [renewalNotice, setRenewalNotice] = useState<{ jobNum: string; invNum: string; subId: string } | null>(null);

  const properties = getPropertiesByClientId(client.id);
  const jobs = getJobsByClientId(client.id);
  const invoices = getInvoicesByClientId(client.id);
  const subscriptions = getSubscriptionsByClientId(client.id);

  const getStatusBadge = (status: Job['status']) => {
    switch (status) {
      case 'in_progress':
        return <span className="bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">In Progress</span>;
      case 'scheduled':
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Scheduled</span>;
      case 'completed':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Completed</span>;
      default:
        return <span className="bg-slate-700/50 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 text-[#fdfbf7]">
      {/*  */}
      <div className="flex items-center space-x-2 text-xs text-[#b8b0a5]">
        <Link 
          href="/dashboard/clients" 
          className="hover:text-[#c5a059] flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Clients</span>
        </Link>
        <span>/</span>
        <span className="text-[#fdfbf7] font-semibold">{client.isCompany ? client.companyName : `${client.firstName} ${client.lastName}`}</span>
      </div>

      {/*  */}
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059]/5 blur-[80px] pointer-events-none rounded-full" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059] shadow-md flex-shrink-0">
              {client.isCompany ? (
                <Building2 className="w-7 h-7" />
              ) : (
                <User className="w-7 h-7" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#fdfbf7]">
                  {client.isCompany ? client.companyName : `${client.firstName} ${client.lastName}`}
                </h1>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  client.isCompany 
                    ? 'bg-purple-900/30 text-purple-300 border-purple-700/50' 
                    : 'bg-[#c5a059]/15 text-[#c5a059] border-[#c5a059]/40'
                }`}>
                  {client.isCompany ? 'Property Management Portfolio' : 'Residential Homeowner'}
                </span>
              </div>
              {client.isCompany && (
                <p className="text-xs text-[#b8b0a5] mt-1">
                  Primary Contact: <span className="text-[#fdfbf7] font-semibold">{client.firstName} {client.lastName}</span>
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#b8b0a5] mt-3">
                <span className="flex items-center gap-1.5 hover:text-[#c5a059]">
                  <Phone className="w-3.5 h-3.5 text-[#c5a059]" /> {client.phone}
                </span>
                <span className="flex items-center gap-1.5 hover:text-[#c5a059]">
                  <Mail className="w-3.5 h-3.5 text-[#c5a059]" /> {client.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF8A00]" /> 
                  Billing: {client.billingAddress.street}, {client.billingAddress.city}, {client.billingAddress.state} {client.billingAddress.zip}
                </span>
              </div>
            </div>
          </div>

          {/*  */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddProperty(true)}
              className="bg-[#1e1e1e] hover:bg-[#282828] text-[#fdfbf7] text-xs font-bold px-3.5 py-2.5 rounded-xl border border-[#333333] transition flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Add Property</span>
            </button>
            <Link
              href={`/dashboard/schedule?clientId=${client.id}`}
              className="bg-[#c5a059] hover:bg-[#b38728] text-black text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition flex items-center space-x-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-black" />
              <span>Book Service Job</span>
            </Link>
          </div>
        </div>

        {/*  */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#222222]">
          <div className="bg-[#161616] p-3 rounded-xl border border-[#262626]">
            <div className="text-[10px] uppercase font-bold text-[#78716c] tracking-wider">Properties Linked</div>
            <div className="text-lg font-bold text-[#fdfbf7] mt-0.5 font-heading">{properties.length} Units / Addresses</div>
          </div>
          <div className="bg-[#161616] p-3 rounded-xl border border-[#262626]">
            <div className="text-[10px] uppercase font-bold text-[#78716c] tracking-wider">Active Jobs</div>
            <div className="text-lg font-bold text-[#FF8A00] mt-0.5 font-heading">
              {jobs.filter(j => j.status === 'in_progress' || j.status === 'scheduled').length} In Pipeline
            </div>
          </div>
          <div className="bg-[#161616] p-3 rounded-xl border border-[#262626]">
            <div className="text-[10px] uppercase font-bold text-[#78716c] tracking-wider">Total Lifetime Spend</div>
            <div className="text-lg font-bold text-[#c5a059] mt-0.5 font-heading">${client.totalSpent.toLocaleString()}</div>
          </div>
          <div className="bg-[#161616] p-3 rounded-xl border border-[#262626]">
            <div className="text-[10px] uppercase font-bold text-[#78716c] tracking-wider">Total Invoices</div>
            <div className="text-lg font-bold text-[#fdfbf7] mt-0.5 font-heading">{invoices.length} Generated</div>
          </div>
        </div>
      </div>

      {/*  */}
      <div className="border-b border-[#222222]">
        <nav className="flex space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('properties')}
            className={`pb-3 border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'properties'
                ? 'border-[#c5a059] text-[#c5a059]'
                : 'border-transparent text-[#b8b0a5] hover:text-[#fdfbf7]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Properties Portfolio ({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'history'
                ? 'border-[#c5a059] text-[#c5a059]'
                : 'border-transparent text-[#b8b0a5] hover:text-[#fdfbf7]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Complete Service History ({jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`pb-3 border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'billing'
                ? 'border-[#c5a059] text-[#c5a059]'
                : 'border-transparent text-[#b8b0a5] hover:text-[#fdfbf7]'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Invoices & Billing ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`pb-3 border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'subscriptions'
                ? 'border-[#c5a059] text-[#c5a059]'
                : 'border-transparent text-[#b8b0a5] hover:text-[#fdfbf7]'
            }`}
          >
            <Repeat className="w-4 h-4 text-[#FF8A00]" />
            <span>Subscriptions ({subscriptions.length})</span>
            {subscriptions.length > 0 && (
              <span className="bg-[#c5a059]/20 text-[#c5a059] text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                $99/mo
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-3 border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'notes'
                ? 'border-[#c5a059] text-[#c5a059]'
                : 'border-transparent text-[#b8b0a5] hover:text-[#fdfbf7]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Client Notes & Dispatch Preferences</span>
          </button>
        </nav>
      </div>

      {/*  */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-[#fdfbf7] font-heading">
                Managed Property Locations ({properties.length})
              </h3>
              <p className="text-xs text-[#b8b0a5]">
                {client.isCompany ? 'All rental units and commercial buildings linked to this property manager' : 'Service locations for this homeowner'}
              </p>
            </div>
            <button
              onClick={() => setShowAddProperty(true)}
              className="bg-[#c5a059] hover:bg-[#b38728] text-black text-xs font-bold px-3.5 py-2 rounded-lg transition flex items-center space-x-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Property</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {properties.map((prop) => {
              const propJobs = jobs.filter((j) => j.propertyId === prop.id);
              const activePropJobs = propJobs.filter((j) => j.status !== 'completed' && j.status !== 'canceled');

              return (
                <div 
                  key={prop.id}
                  className="bg-[#111111] border border-[#222222] hover:border-[#c5a059]/40 rounded-xl p-5 shadow-sm transition space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#333333] flex items-center justify-center text-[#c5a059]">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#fdfbf7]">{prop.label || 'Property Unit'}</div>
                        <div className="text-xs text-[#b8b0a5] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#FF8A00]" />
                          <span>{prop.street} {prop.unit ? `(${prop.unit})` : ''}, {prop.city}, {prop.state} {prop.zip}</span>
                        </div>
                      </div>
                    </div>
                    {activePropJobs.length > 0 && (
                      <span className="bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {activePropJobs.length} Active Job
                      </span>
                    )}
                  </div>

                  {/*  */}
                  <div className="bg-[#161616] p-3 rounded-lg border border-[#262626] text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[#b8b0a5]">
                      <span className="flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-[#c5a059]" /> Gate/Lockbox Code:
                      </span>
                      <span className="font-mono font-bold text-[#fdfbf7]">{prop.gateCode || 'None on file'}</span>
                    </div>
                    {prop.accessInstructions && (
                      <div className="text-[11px] text-[#b8b0a5] pt-1 border-t border-[#262626]">
                        <span className="text-[#78716c] font-semibold">Access:</span> {prop.accessInstructions}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2 text-xs">
                    <span className="text-[#78716c]">{propJobs.length} Service jobs logged</span>
                    <Link
                      href={`/dashboard/schedule?clientId=${client.id}&propertyId=${prop.id}`}
                      className="text-[#c5a059] hover:underline font-bold flex items-center space-x-1"
                    >
                      <span>Book Job Here</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {properties.length === 0 && (
              <div className="col-span-2 p-8 text-center bg-[#111111] rounded-xl border border-dashed border-[#333333]">
                <Building2 className="w-8 h-8 text-[#78716c] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#b8b0a5]">No service addresses added yet.</p>
                <button
                  onClick={() => setShowAddProperty(true)}
                  className="mt-3 text-xs bg-[#c5a059] hover:bg-[#b38728] text-black font-bold px-4 py-2 rounded-lg"
                >
                  + Add First Property Address
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/*  */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-[#fdfbf7] font-heading">
                Complete Service Job History
              </h3>
              <p className="text-xs text-[#b8b0a5]">Detailed record of all maintenance and repair work orders</p>
            </div>
            <Link
              href={`/dashboard/schedule?clientId=${client.id}`}
              className="bg-[#c5a059] hover:bg-[#b38728] text-black text-xs font-bold px-3.5 py-2 rounded-lg transition flex items-center space-x-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule New Work Order</span>
            </Link>
          </div>

          <div className="space-y-3">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className="bg-[#111111] border border-[#222222] hover:border-[#333333] rounded-xl p-5 shadow-sm transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold text-[#c5a059] bg-[#1a1a1a] px-2.5 py-1 rounded border border-[#c5a059]/20">
                      {job.jobNumber}
                    </span>
                    <h4 className="font-bold text-sm text-[#fdfbf7]">{job.title}</h4>
                    {getStatusBadge(job.status)}
                  </div>
                  <div className="text-xs text-[#b8b0a5] flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#78716c]" />
                    <span>{job.scheduledDate} ({job.timeWindowStart} - {job.timeWindowEnd})</span>
                  </div>
                </div>

                <p className="text-xs text-[#b8b0a5] leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#222222] text-xs">
                  <div className="flex items-center space-x-4 text-[#b8b0a5]">
                    <span className="flex items-center gap-1 text-[#fdfbf7]">
                      <Wrench className="w-3.5 h-3.5 text-[#FF8A00]" />
                      <span>Tech: {job.assignedTechName || 'Unassigned'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#78716c]" />
                      <span>{job.propertyAddress}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {job.totalAmount && (
                      <span className="font-mono font-bold text-[#c5a059]">${job.totalAmount.toFixed(2)}</span>
                    )}
                    <Link 
                      href={`/dashboard/schedule?jobId=${job.id}`}
                      className="text-xs font-semibold text-[#c5a059] hover:underline"
                    >
                      View Dispatch →
                    </Link>
                  </div>
                </div>

                {/*  */}
                {job.checklist && job.checklist.length > 0 && (
                  <div className="bg-[#161616] p-3 rounded-lg border border-[#222222] text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716c] mb-1.5">
                      Work Order Checklist ({job.checklist.filter(c => c.done).length}/{job.checklist.length} Completed)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {job.checklist.map((item) => (
                        <div key={item.id} className="flex items-center space-x-2 text-[11px]">
                          <span className={item.done ? 'text-emerald-400' : 'text-[#78716c]'}>
                            {item.done ? '✓' : '○'}
                          </span>
                          <span className={item.done ? 'line-through text-[#78716c]' : 'text-[#fdfbf7]'}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {jobs.length === 0 && (
              <div className="p-8 text-center bg-[#111111] rounded-xl border border-dashed border-[#333333]">
                <Clock className="w-8 h-8 text-[#78716c] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#b8b0a5]">No service history for this client yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/*  */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-[#fdfbf7] font-heading">
                Client Invoices & Stripe Payments
              </h3>
              <p className="text-xs text-[#b8b0a5]">Invoicing breakdown with live payment tracking</p>
            </div>
            <Link
              href="/dashboard/invoices"
              className="bg-[#c5a059] hover:bg-[#b38728] text-black text-xs font-bold px-3.5 py-2 rounded-lg transition flex items-center space-x-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Invoice</span>
            </Link>
          </div>

          <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-[#222222] text-xs">
              <thead className="bg-[#161616] text-[#b8b0a5] font-semibold text-left">
                <tr>
                  <th className="px-6 py-3.5">Invoice #</th>
                  <th className="px-6 py-3.5">Job Reference</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                  <th className="px-6 py-3.5 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#161616] transition">
                    <td className="px-6 py-4 font-mono font-bold text-[#c5a059]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-[#fdfbf7]">
                      {inv.jobNumber}
                    </td>
                    <td className="px-6 py-4 text-[#b8b0a5]">
                      {inv.dueDate}
                    </td>
                    <td className="px-6 py-4">
                      {inv.status === 'paid' ? (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Paid in Full
                        </span>
                      ) : (
                        <span className="bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Pending Payment
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-[#fdfbf7]">
                      ${inv.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-[#FF8A00]">
                      ${inv.balanceDue.toFixed(2)}
                    </td>
                  </tr>
                ))}

                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-[#78716c]">
                      No invoices recorded for this client.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subscriptions Tab (Module 1: Stripe Recurring Memberships) */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#c5a059] mb-1">
                <Repeat className="w-4 h-4 text-[#FF8A00]" />
                <span>Stripe Billing & Automated Maintenance</span>
              </div>
              <h2 className="text-xl font-bold font-heading text-[#fdfbf7]">
                Recurring Preventative Maintenance ($99/mo)
              </h2>
              <p className="text-xs text-[#b8b0a5] mt-1 max-w-2xl">
                Active subscriptions automatically renew monthly via Stripe. Each renewal triggers an automatic preventative maintenance inspection job into the <span className="text-[#FF8A00] font-semibold">Unscheduled queue</span> of the Dispatch Board.
              </p>
            </div>

            <button
              onClick={() => {
                if (properties.length > 0) {
                  setSelectedPropIdForSub(properties[0].id);
                }
                setShowNewSubModal(true);
              }}
              className="bg-[#c5a059] hover:bg-[#d4b068] text-black text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition flex items-center space-x-2 flex-shrink-0"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>Enroll New Property ($99/mo)</span>
            </button>
          </div>

          {/* Renewal Event Success Alert */}
          {renewalNotice && (
            <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-lg animate-in fade-in">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="font-bold text-emerald-300">
                    Stripe Subscription Renewal Successfully Triggered!
                  </div>
                  <div className="text-emerald-200/80 text-[11px] mt-0.5">
                    Generated renewal invoice <span className="font-mono font-bold text-white">{renewalNotice.invNum}</span> ($99.00 Paid) and auto-dispatched <span className="font-mono font-bold text-[#c5a059]">{renewalNotice.jobNum}</span> to the Unscheduled Board.
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Link
                  href="/dashboard/schedule"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg transition text-[11px] flex items-center space-x-1"
                >
                  <span>Open Dispatch Board →</span>
                </Link>
                <button
                  onClick={() => setRenewalNotice(null)}
                  className="text-emerald-400 hover:text-white px-2 py-1 text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Subscriptions List */}
          {subscriptions.length === 0 ? (
            <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 text-center space-y-4">
              <Repeat className="w-12 h-12 text-[#78716c] mx-auto opacity-50" />
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-[#fdfbf7] font-heading">
                  No Active Preventative Maintenance Memberships
                </h3>
                <p className="text-xs text-[#b8b0a5] mt-1.5">
                  Enroll this client into the $99/month preventative maintenance plan to automate quarterly HVAC filter changes, plumbing safety checks, and smoke detector testing.
                </p>
              </div>
              <button
                onClick={() => {
                  if (properties.length > 0) setSelectedPropIdForSub(properties[0].id);
                  setShowNewSubModal(true);
                }}
                className="bg-[#c5a059] hover:bg-[#d4b068] text-black font-bold text-xs px-5 py-2.5 rounded-xl transition inline-flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Enroll in $99/mo Maintenance Membership</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {subscriptions.map((sub) => {
                const isActive = sub.status === 'active';
                const property = properties.find((p) => p.id === sub.propertyId);

                return (
                  <div
                    key={sub.id}
                    className={`bg-[#111111] border rounded-2xl p-6 shadow-xl transition space-y-4 ${
                      isActive ? 'border-[#2a2a2a] hover:border-[#c5a059]/40' : 'border-red-900/40 opacity-70'
                    }`}
                  >
                    {/* Top Subscription Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#222222]">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059] bg-[#c5a059]/10 px-2.5 py-0.5 rounded border border-[#c5a059]/30">
                            Stripe Billing
                          </span>
                          <h3 className="font-bold text-base text-[#fdfbf7] font-heading">
                            {sub.planName}
                          </h3>
                        </div>
                        <div className="text-xs text-[#b8b0a5] mt-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#FF8A00]" />
                          <span>Covered Property: <strong className="text-[#fdfbf7]">{sub.propertyAddress}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-base font-bold font-mono text-[#c5a059]">${sub.amount.toFixed(2)}/mo</div>
                          <div className="text-[10px] text-[#78716c]">Billed Monthly</div>
                        </div>

                        <span
                          className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border inline-flex items-center gap-1 ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          {isActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>}
                          {sub.status}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#161616] p-4 rounded-xl border border-[#242424]">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#78716c]">Stripe Subscription ID</span>
                        <div className="font-mono text-[#fdfbf7] text-xs mt-0.5 truncate">
                          {sub.stripeSubscriptionId}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#78716c]">Current Billing Cycle</span>
                        <div className="text-[#b8b0a5] text-xs mt-0.5">
                          {new Date(sub.currentPeriodStart).toLocaleDateString()} — {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#78716c]">Dispatch Automation</span>
                        <div className="text-emerald-400 font-semibold text-xs mt-0.5 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Unscheduled Queue Auto-Trigger</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Simulation Trigger */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
                      <div className="text-[11px] text-[#78716c]">
                        Floyd County Preventative Maintenance Program
                      </div>

                      <div className="flex items-center space-x-2.5 w-full sm:w-auto">
                        {isActive && (
                          <>
                            <button
                              onClick={() => {
                                const res = triggerSubscriptionRenewal(sub.id);
                                if (res) {
                                  setRenewalNotice({
                                    jobNum: res.job.jobNumber,
                                    invNum: res.renewalInvoice.invoiceNumber,
                                    subId: sub.id,
                                  });
                                }
                              }}
                              className="bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#c5a059] border border-[#c5a059]/40 hover:border-[#c5a059] font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                              title="Simulate successful monthly Stripe renewal and auto-generate an Unscheduled Preventative Maintenance job"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[#FF8A00]" />
                              <span>Simulate Monthly Renewal (Auto-Dispatch)</span>
                            </button>

                            <button
                              onClick={() => cancelSubscription(sub.id)}
                              className="text-xs text-[#78716c] hover:text-red-400 font-semibold px-2 py-1.5 transition"
                            >
                              Cancel Plan
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal to Enroll New Property in Subscription */}
          {showNewSubModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-[#222222] bg-[#141414] flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-[#c5a059]/20 text-[#c5a059]">
                      <Repeat className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#fdfbf7]">
                        Enroll Property in $99/mo Maintenance
                      </h3>
                      <p className="text-[11px] text-[#b8b0a5]">Stripe Recurring Billing Setup</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNewSubModal(false)}
                    className="text-[#78716c] hover:text-[#fdfbf7]"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="bg-[#161616] p-4 rounded-xl border border-[#262626] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#b8b0a5]">Plan:</span>
                      <span className="font-bold text-[#fdfbf7]">Preventative Maintenance Plan</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#b8b0a5]">Billing Rate:</span>
                      <span className="font-bold text-[#c5a059] font-mono">$99.00 / Month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#b8b0a5]">Billing Provider:</span>
                      <span className="text-white font-semibold flex items-center gap-1">
                        <span className="text-[#635BFF] font-bold">Stripe</span> Billing
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#b8b0a5] mb-1.5">
                      Select Property to Cover *
                    </label>
                    <select
                      value={selectedPropIdForSub}
                      onChange={(e) => setSelectedPropIdForSub(e.target.value)}
                      className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                    >
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label ? `${p.label} - ` : ''}{p.street}, {p.city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="text-[11px] text-[#78716c] space-y-1 bg-[#141414] p-3 rounded-lg border border-[#222222]">
                    <div className="font-semibold text-[#b8b0a5]">Automated Dispatch Guarantee:</div>
                    <p>
                      Upon renewal, our system automatically schedules quarterly HVAC filter swaps, safety alarm tests, and plumbing inspections into your dispatch calendar.
                    </p>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewSubModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-[#b8b0a5] hover:text-[#fdfbf7]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const prop = properties.find((p) => p.id === selectedPropIdForSub) || properties[0];
                        if (prop) {
                          const now = new Date();
                          const nextMonth = new Date();
                          nextMonth.setMonth(nextMonth.getMonth() + 1);

                          createSubscription({
                            clientId: client.id,
                            clientName: client.isCompany ? client.companyName || `${client.firstName} ${client.lastName}` : `${client.firstName} ${client.lastName}`,
                            propertyId: prop.id,
                            propertyAddress: `${prop.street}, ${prop.city}, ${prop.state}`,
                            planName: 'Preventative Maintenance Plan ($99/mo)',
                            amount: 99.00,
                            billingInterval: 'month',
                            status: 'active',
                            stripeSubscriptionId: `sub_stripe_${Date.now()}`,
                            currentPeriodStart: now.toISOString(),
                            currentPeriodEnd: nextMonth.toISOString(),
                            autoDispatchEnabled: true,
                          });
                          setShowNewSubModal(false);
                        }
                      }}
                      className="bg-[#c5a059] hover:bg-[#d4b068] text-black font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition flex items-center space-x-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm & Activate Subscription</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/*  */}
      {activeTab === 'notes' && (
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#fdfbf7] font-heading">
            Dispatcher Notes & Client Preferences
          </h3>
          <p className="text-xs text-[#b8b0a5] leading-relaxed bg-[#161616] p-4 rounded-xl border border-[#262626]">
            {client.notes || 'No special notes recorded.'}
          </p>
          <div className="text-[11px] text-[#78716c]">
            Client Profile Created: {new Date(client.createdAt).toLocaleDateString()} • Last Updated: {new Date(client.updatedAt).toLocaleDateString()}
          </div>
        </div>
      )}

      {/*  */}
      <AddPropertyModal
        isOpen={showAddProperty}
        onClose={() => setShowAddProperty(false)}
        clientId={client.id}
        clientName={client.isCompany ? client.companyName || '' : `${client.firstName} ${client.lastName}`}
      />
    </div>
  );
};
