'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Client } from '@/types';
import { useFSMStore } from '@/lib/useStore';
import { NewClientModal } from './NewClientModal';
import { AddPropertyModal } from './AddPropertyModal';
import { 
  Building2, 
  User, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink, 
  Calendar,
  Filter,
  DollarSign,
  Briefcase
} from 'lucide-react';

export const ClientList: React.FC = () => {
  const { clients, properties, jobs } = useFSMStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'company' | 'residential'>('all');
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [activeClientForProp, setActiveClientForProp] = useState<Client | null>(null);

  // Filter clients based on query and type
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesType = 
        filterType === 'all' 
          ? true 
          : filterType === 'company' 
          ? c.isCompany 
          : !c.isCompany;

      if (!matchesType) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const name = `${c.firstName} ${c.lastName}`.toLowerCase();
      const comp = (c.companyName || '').toLowerCase();
      const email = c.email.toLowerCase();
      const phone = c.phone.toLowerCase();
      const address = `${c.billingAddress.street} ${c.billingAddress.city} ${c.billingAddress.zip}`.toLowerCase();

      return name.includes(q) || comp.includes(q) || email.includes(q) || phone.includes(q) || address.includes(q);
    });
  }, [clients, searchQuery, filterType]);

  // Total properties count
  const totalProperties = properties.length;
  const totalActiveJobs = jobs.filter(j => j.status === 'in_progress' || j.status === 'scheduled').length;
  const totalRevenue = clients.reduce((acc, c) => acc + (c.totalSpent || 0), 0);

  return (
    <div className="space-y-6 text-[#fdfbf7]">
      {/*  */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[#fdfbf7]">
            Client & Property CRM
          </h1>
          <p className="text-xs text-[#b8b0a5] mt-1">
            Customer relationship records, multi-property portfolios, and service histories for Rome, GA
          </p>
        </div>
        <button
          onClick={() => setIsNewClientOpen(true)}
          className="bg-[#c5a059] hover:bg-[#b38728] text-black font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Add New Client</span>
        </button>
      </div>

      {/*  */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-[#222222] p-4 rounded-xl shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#78716c]">Total Clients</div>
          <div className="text-2xl font-bold font-heading text-[#fdfbf7] mt-1">{clients.length}</div>
          <div className="text-[10px] text-[#c5a059] mt-0.5">Active accounts in Rome, GA</div>
        </div>

        <div className="bg-[#111111] border border-[#222222] p-4 rounded-xl shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#78716c]">Managed Properties</div>
          <div className="text-2xl font-bold font-heading text-[#fdfbf7] mt-1">{totalProperties} Units</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Multiple addresses linked</div>
        </div>

        <div className="bg-[#111111] border border-[#222222] p-4 rounded-xl shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#78716c]">Jobs in Dispatch</div>
          <div className="text-2xl font-bold font-heading text-[#FF8A00] mt-1">{totalActiveJobs} Active</div>
          <div className="text-[10px] text-[#b8b0a5] mt-0.5">Scheduled or in progress</div>
        </div>

        <div className="bg-[#111111] border border-[#222222] p-4 rounded-xl shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#78716c]">Lifetime Revenue</div>
          <div className="text-2xl font-bold font-heading text-[#c5a059] mt-1">${totalRevenue.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Total billed across clients</div>
        </div>
      </div>

      {/*  */}
      <div className="bg-[#111111] border border-[#222222] p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-[#78716c] absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, company, email, phone, or property address..."
            className="w-full text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg pl-9 pr-4 py-2.5 text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="inline-flex rounded-lg border border-[#2a2a2a] p-1 bg-[#181818] text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded font-semibold transition ${
                filterType === 'all' ? 'bg-[#c5a059] text-black font-bold' : 'text-[#b8b0a5] hover:text-[#fdfbf7]'
              }`}
            >
              All ({clients.length})
            </button>
            <button
              onClick={() => setFilterType('company')}
              className={`px-3 py-1 rounded font-semibold transition ${
                filterType === 'company' ? 'bg-[#c5a059] text-black font-bold' : 'text-[#b8b0a5] hover:text-[#fdfbf7]'
              }`}
            >
              Property Managers
            </button>
            <button
              onClick={() => setFilterType('residential')}
              className={`px-3 py-1 rounded font-semibold transition ${
                filterType === 'residential' ? 'bg-[#c5a059] text-black font-bold' : 'text-[#b8b0a5] hover:text-[#fdfbf7]'
              }`}
            >
              Homeowners
            </button>
          </div>
        </div>
      </div>

      {/*  */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#222222] text-xs">
            <thead className="bg-[#161616] text-[#b8b0a5] font-semibold text-left">
              <tr>
                <th className="px-6 py-4">Client / Company Name</th>
                <th className="px-6 py-4">Contact Information</th>
                <th className="px-6 py-4">Properties Linked</th>
                <th className="px-6 py-4">Lifetime Spend</th>
                <th className="px-6 py-4">Active Pipeline</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c1c1c]">
              {filteredClients.map((client) => {
                const clientProps = properties.filter((p) => p.clientId === client.id);
                const clientJobs = jobs.filter((j) => j.clientId === client.id);
                const activeJobs = clientJobs.filter((j) => j.status === 'in_progress' || j.status === 'scheduled');

                return (
                  <tr key={client.id} className="hover:bg-[#161616] transition group">
                    {/*  */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-[#1a1a1a] border border-[#333333] flex items-center justify-center text-[#c5a059] flex-shrink-0">
                          {client.isCompany ? (
                            <Building2 className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <Link 
                            href={`/dashboard/clients/${client.id}`}
                            className="font-bold text-sm text-[#fdfbf7] group-hover:text-[#c5a059] transition flex items-center gap-1.5"
                          >
                            <span>{client.isCompany ? client.companyName : `${client.firstName} ${client.lastName}`}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                          {client.isCompany && (
                            <div className="text-[11px] text-[#b8b0a5]">
                              Contact: {client.firstName} {client.lastName}
                            </div>
                          )}
                          <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            client.isCompany 
                              ? 'bg-purple-900/30 text-purple-300 border-purple-700/50' 
                              : 'bg-[#c5a059]/15 text-[#c5a059] border-[#c5a059]/40'
                          }`}>
                            {client.isCompany ? 'Portfolio / Landlord' : 'Residential'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/*  */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-[#b8b0a5]">
                        <div className="flex items-center space-x-1.5 text-[#fdfbf7]">
                          <Phone className="w-3 h-3 text-[#c5a059]" />
                          <span>{client.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Mail className="w-3 h-3 text-[#78716c]" />
                          <span>{client.email}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-[11px] text-[#78716c] truncate max-w-xs">
                          <MapPin className="w-3 h-3 text-[#FF8A00] flex-shrink-0" />
                          <span>{client.billingAddress.city}, {client.billingAddress.state}</span>
                        </div>
                      </div>
                    </td>

                    {/*  */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[#fdfbf7] bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#333333]">
                            {clientProps.length} {clientProps.length === 1 ? 'Property' : 'Properties'}
                          </span>
                          <button
                            onClick={() => setActiveClientForProp(client)}
                            className="text-[11px] text-[#c5a059] hover:underline font-semibold"
                          >
                            + Add Property
                          </button>
                        </div>
                        {clientProps.length > 0 && (
                          <div className="text-[11px] text-[#78716c] truncate max-w-xs">
                            {clientProps[0].street} {clientProps[0].unit ? `(${clientProps[0].unit})` : ''}
                            {clientProps.length > 1 && ` + ${clientProps.length - 1} more`}
                          </div>
                        )}
                      </div>
                    </td>

                    {/*  */}
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-sm text-[#c5a059]">
                        ${client.totalSpent.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#78716c]">
                        {clientJobs.length} past jobs
                      </div>
                    </td>

                    {/*  */}
                    <td className="px-6 py-4">
                      {activeJobs.length > 0 ? (
                        <span className="bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {activeJobs.length} In Progress
                        </span>
                      ) : (
                        <span className="text-[#78716c] text-[11px]">No active work</span>
                      )}
                    </td>

                    {/*  */}
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="inline-block bg-[#1a1a1a] hover:bg-[#252525] text-[#fdfbf7] border border-[#333333] font-bold text-[11px] px-3 py-1.5 rounded-lg transition"
                      >
                        View Profile
                      </Link>
                      <Link
                        href={`/dashboard/schedule?clientId=${client.id}`}
                        className="inline-block bg-[#c5a059] hover:bg-[#b38728] text-black font-bold text-[11px] px-3 py-1.5 rounded-lg transition shadow"
                      >
                        + Book Job
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#78716c]">
                    <User className="w-8 h-8 text-[#78716c] mx-auto mb-2" />
                    <p className="text-sm font-semibold text-[#b8b0a5]">No clients found matching your search.</p>
                    <button
                      onClick={() => { setSearchQuery(''); setFilterType('all'); }}
                      className="mt-2 text-xs text-[#c5a059] hover:underline"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/*  */}
      <NewClientModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
      />

      {/*  */}
      {activeClientForProp && (
        <AddPropertyModal
          isOpen={!!activeClientForProp}
          onClose={() => setActiveClientForProp(null)}
          clientId={activeClientForProp.id}
          clientName={activeClientForProp.isCompany ? activeClientForProp.companyName || '' : `${activeClientForProp.firstName} ${activeClientForProp.lastName}`}
        />
      )}
    </div>
  );
};
