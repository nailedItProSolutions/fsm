'use client';

import React, { useState, useMemo } from 'react';
import { useActiveFSMData } from '@/lib/useStore';
import { UserProfile } from '@/types';
import { 
  Users, 
  Wrench, 
  ShieldCheck, 
  Lock, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Send,
  Shield,
  Smartphone
} from 'lucide-react';

export const TechnicianManager: React.FC = () => {
  const { getTechnicians, addTechnician, updateTechnician, deleteTechnician } = useActiveFSMData();
  const technicians = getTechnicians();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<UserProfile | null>(null);
  const [deletingTech, setDeletingTech] = useState<UserProfile | null>(null);
  
  // PIN visibility toggles per tech
  const [visiblePins, setVisiblePins] = useState<Record<string, boolean>>({});

  // Feedback states
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formPin, setFormPin] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTelegram, setFormTelegram] = useState('');
  const [formActive, setFormActive] = useState(true);

  const togglePinVisibility = (uid: string) => {
    setVisiblePins(prev => ({ ...prev, [uid]: !prev[uid] }));
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const handleOpenAdd = () => {
    // Generate next suggested employee ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormName('');
    setFormEmployeeId(`TECH-${randomSuffix}`);
    setFormPin('1234');
    setFormEmail('');
    setFormPhone('(706) 555-');
    setFormTelegram('');
    setFormActive(true);
    setErrorMessage(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (tech: UserProfile) => {
    setEditingTech(tech);
    setFormName(tech.displayName);
    setFormEmployeeId(tech.employeeId || '');
    setFormPin(tech.pin || '');
    setFormEmail(tech.email);
    setFormPhone(tech.phone || '');
    setFormTelegram(tech.telegramChatId || '');
    setFormActive(tech.active !== false);
    setErrorMessage(null);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formName.trim() || !formEmployeeId.trim() || !formPin.trim()) {
        showError('Please provide technician full name, Employee ID, and PIN code.');
        return;
      }

      addTechnician({
        displayName: formName.trim(),
        email: formEmail.trim() || `${formEmployeeId.toLowerCase().replace(/[^a-z0-9]/g, '')}@nailedit.com`,
        phone: formPhone.trim(),
        employeeId: formEmployeeId.trim(),
        pin: formPin.trim(),
        telegramChatId: formTelegram.trim() || undefined,
        active: formActive,
      });

      setIsAddModalOpen(false);
      showSuccess(`Technician ${formName.trim()} has been added successfully!`);
    } catch (err: any) {
      showError(err.message || 'Failed to add technician');
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTech) return;

    try {
      if (!formName.trim() || !formPin.trim()) {
        showError('Technician name and PIN code are required.');
        return;
      }

      updateTechnician(editingTech.uid, {
        displayName: formName.trim(),
        employeeId: formEmployeeId.trim(),
        pin: formPin.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        telegramChatId: formTelegram.trim() || undefined,
        active: formActive,
      });

      setEditingTech(null);
      showSuccess(`Updated profile for ${formName.trim()}`);
    } catch (err: any) {
      showError(err.message || 'Failed to update technician');
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingTech) return;

    try {
      deleteTechnician(deletingTech.uid);
      showSuccess(`Technician ${deletingTech.displayName} removed from roster.`);
      setDeletingTech(null);
    } catch (err: any) {
      showError(err.message || 'Failed to delete technician.');
      setDeletingTech(null);
    }
  };

  const isProtectedTech = (tech: UserProfile) => {
    return tech.employeeId === '1014958' || tech.uid === 'user-tech-1' || tech.displayName.toLowerCase().includes('charles willis');
  };

  const filteredTechs = useMemo(() => {
    return technicians.filter(tech => {
      if (filterActive === 'active' && !tech.active) return false;
      if (filterActive === 'inactive' && tech.active) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const name = (tech.displayName || '').toLowerCase();
      const empId = (tech.employeeId || '').toLowerCase();
      const email = (tech.email || '').toLowerCase();
      const phone = (tech.phone || '').toLowerCase();

      return name.includes(q) || empId.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [technicians, filterActive, searchQuery]);

  const activeCount = technicians.filter(t => t.active).length;

  return (
    <div className="space-y-6 text-[#fdfbf7]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#c5a059] font-bold uppercase tracking-wider mb-1">
            <Wrench className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Field Staffing & Operations ? Rome, GA</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-[#fdfbf7]">
            Technician Roster & Credentials
          </h1>
          <p className="text-xs text-[#b8b0a5] mt-1">
            Manage field service personnel, employee IDs, authentication PINs, and Telegram push dispatch profiles.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#c5a059] hover:bg-[#b38728] text-black font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Add New Technician</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-950/50 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-red-950/50 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-[#222222] p-4 rounded-xl shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#78716c]">Total Technicians</div>
          <div className="text-2xl font-bold font-heading text-[#fdfbf7] mt-1">{technicians.length}</div>
          <div className="text-[10px] text-[#c5a059] mt-0.5">Assigned to Floyd County</div>
        </div>

        <div className="bg-[#111111] border border-[#222222] p-4 rounded-xl shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#78716c]">Active in Dispatch</div>
          <div className="text-2xl font-bold font-heading text-emerald-400 mt-1">{activeCount} Ready</div>
          <div className="text-[10px] text-[#b8b0a5] mt-0.5">Available for work orders</div>
        </div>

        <div className="bg-[#111111] border border-[#222222] p-4 rounded-xl shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#78716c]">Primary Lead Tech</div>
          <div className="text-base font-bold text-[#c5a059] mt-1.5 truncate">Charles Willis</div>
          <div className="text-[10px] text-[#78716c] mt-0.5 font-mono">ID: 1014958 (System Protected)</div>
        </div>

        <div className="bg-[#111111] border border-[#222222] p-4 rounded-xl shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#78716c]">Telegram Bot Dispatch</div>
          <div className="text-2xl font-bold font-heading text-[#FF8A00] mt-1">Live</div>
          <div className="text-[10px] text-[#b8b0a5] mt-0.5">Push notifications armed</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111111] border border-[#222222] p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-[#78716c] absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, employee ID, phone, or email..."
            className="w-full text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg pl-9 pr-4 py-2.5 text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
          />
        </div>

        <div className="inline-flex rounded-lg border border-[#2a2a2a] p-1 bg-[#181818] text-xs shrink-0">
          <button
            onClick={() => setFilterActive('all')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              filterActive === 'all' ? 'bg-[#c5a059] text-black font-bold' : 'text-[#b8b0a5] hover:text-[#fdfbf7]'
            }`}
          >
            All ({technicians.length})
          </button>
          <button
            onClick={() => setFilterActive('active')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              filterActive === 'active' ? 'bg-[#c5a059] text-black font-bold' : 'text-[#b8b0a5] hover:text-[#fdfbf7]'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilterActive('inactive')}
            className={`px-3 py-1.5 rounded-md font-semibold transition ${
              filterActive === 'inactive' ? 'bg-[#c5a059] text-black font-bold' : 'text-[#b8b0a5] hover:text-[#fdfbf7]'
            }`}
          >
            Inactive ({technicians.length - activeCount})
          </button>
        </div>
      </div>

      {/* Technicians Table */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#222222] text-xs">
            <thead className="bg-[#161616] text-[#b8b0a5] font-semibold text-left">
              <tr>
                <th className="px-6 py-4">Technician Name & Role</th>
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Security PIN</th>
                <th className="px-6 py-4">Contact & Telegram</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c1c1c]">
              {filteredTechs.map((tech) => {
                const isProtected = isProtectedTech(tech);
                const isPinVisible = !!visiblePins[tech.uid];

                return (
                  <tr key={tech.uid} className="hover:bg-[#161616] transition group">
                    {/* Name & Avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1e1e1e] border border-[#333333] flex items-center justify-center font-bold text-[#c5a059] text-sm shrink-0">
                          {tech.displayName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[#fdfbf7] flex items-center gap-1.5">
                            <span>{tech.displayName}</span>
                            {isProtected && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-[#c5a059] border border-amber-500/30">
                                <Shield className="w-3 h-3 text-[#c5a059]" />
                                Primary Tech
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#78716c] flex items-center gap-2 mt-0.5">
                            <span>Field Technician</span>
                            {tech.createdAt && (
                              <span>? Enrolled {new Date(tech.createdAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Employee ID */}
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center font-mono font-bold text-xs px-2.5 py-1 rounded bg-[#181818] border border-[#2a2a2a] text-[#fdfbf7]">
                        {tech.employeeId || 'N/A'}
                      </div>
                    </td>

                    {/* PIN */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs bg-[#181818] border border-[#2a2a2a] px-2.5 py-1 rounded text-[#c5a059] min-w-[60px] text-center">
                          {isPinVisible ? (tech.pin || '----') : '••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePinVisibility(tech.uid)}
                          className="p-1 rounded text-[#78716c] hover:text-[#fdfbf7] hover:bg-[#222222] transition"
                          title={isPinVisible ? 'Hide PIN' : 'Reveal PIN'}
                        >
                          {isPinVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-[#b8b0a5]">
                        {tech.phone && (
                          <div className="flex items-center space-x-1.5 text-[#fdfbf7]">
                            <Phone className="w-3 h-3 text-[#c5a059]" />
                            <span>{tech.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1.5">
                          <Mail className="w-3 h-3 text-[#78716c]" />
                          <span className="truncate max-w-[180px]">{tech.email}</span>
                        </div>
                        {tech.telegramChatId && (
                          <div className="flex items-center space-x-1.5 text-[11px] text-[#FF8A00]">
                            <Send className="w-3 h-3" />
                            <span>TG: {tech.telegramChatId}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {tech.active !== false ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                          Active Dispatch
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900 text-zinc-400 border border-zinc-700/40">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(tech)}
                        className="inline-flex items-center space-x-1 bg-[#1a1a1a] hover:bg-[#252525] text-[#fdfbf7] border border-[#333333] font-bold text-[11px] px-3 py-1.5 rounded-lg transition"
                      >
                        <Edit3 className="w-3 h-3 text-[#c5a059]" />
                        <span>Edit</span>
                      </button>

                      {isProtected ? (
                        <span 
                          title="Charles Willis (Employee ID: 1014958) is the protected primary system technician and cannot be deleted."
                          className="inline-flex items-center space-x-1 bg-[#141414] text-[#78716c] border border-[#222222] font-semibold text-[11px] px-2.5 py-1.5 rounded-lg cursor-not-allowed opacity-60"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Protected</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => setDeletingTech(tech)}
                          className="inline-flex items-center space-x-1 bg-[#1a1a1a] hover:bg-red-950/40 text-red-400 border border-[#333333] hover:border-red-900/50 font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition"
                          title="Delete technician profile"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredTechs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#78716c]">
                    <Users className="w-8 h-8 text-[#78716c] mx-auto mb-2" />
                    <p className="text-sm font-semibold text-[#b8b0a5]">No technicians found matching criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Technician Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111111] text-[#fdfbf7] rounded-2xl shadow-2xl max-w-lg w-full border border-[#2a2a2a] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#181818] p-5 border-b border-[#262626] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#c5a059] flex items-center justify-center text-black font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#fdfbf7]">Add New Technician</h3>
                  <p className="text-xs text-[#78716c]">Create credentials for field mobile login & dispatch</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#78716c] hover:text-[#fdfbf7] p-1 rounded-lg hover:bg-[#222222] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#b8b0a5] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#b8b0a5] mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formEmployeeId}
                    onChange={(e) => setFormEmployeeId(e.target.value.toUpperCase())}
                    placeholder="e.g. 1014960"
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-[#fdfbf7] font-mono uppercase placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
                  />
                  <p className="text-[10px] text-[#78716c] mt-1">Used for portal keypad login</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#b8b0a5] mb-1">
                    Security PIN (4-6 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formPin}
                    onChange={(e) => setFormPin(e.target.value)}
                    placeholder="e.g. 8572"
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-[#fdfbf7] font-mono placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
                  />
                  <p className="text-[10px] text-[#78716c] mt-1">Technician secret PIN</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#b8b0a5] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="tech@nailedit.com"
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#b8b0a5] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="(706) 555-0199"
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#b8b0a5] mb-1 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-[#FF8A00]" />
                  <span>Telegram Chat ID (Optional)</span>
                </label>
                <input
                  type="text"
                  value={formTelegram}
                  onChange={(e) => setFormTelegram(e.target.value)}
                  placeholder="e.g. 839201948 (for instant job push notifications)"
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="rounded accent-[#c5a059] bg-[#181818] border-[#2a2a2a]"
                />
                <label htmlFor="activeToggle" className="text-xs font-semibold text-[#fdfbf7] cursor-pointer">
                  Active for Immediate Dispatch Scheduling
                </label>
              </div>

              <div className="border-t border-[#262626] pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#333333] text-xs font-bold text-[#b8b0a5] hover:bg-[#1a1a1a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#c5a059] hover:bg-[#b38728] text-black text-xs font-bold shadow-md transition flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Technician</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Technician Modal */}
      {editingTech && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111111] text-[#fdfbf7] rounded-2xl shadow-2xl max-w-lg w-full border border-[#2a2a2a] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#181818] p-5 border-b border-[#262626] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#c5a059] flex items-center justify-center text-black font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#fdfbf7]">Edit Technician Profile</h3>
                  <p className="text-xs text-[#78716c]">Modify credentials, active status, or contact details</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingTech(null)}
                className="text-[#78716c] hover:text-[#fdfbf7] p-1 rounded-lg hover:bg-[#222222] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#b8b0a5] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#b8b0a5] mb-1 flex items-center justify-between">
                    <span>Employee ID</span>
                    {isProtectedTech(editingTech) && (
                      <span className="text-[10px] text-[#c5a059] font-normal flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> Protected
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isProtectedTech(editingTech)}
                    value={formEmployeeId}
                    onChange={(e) => setFormEmployeeId(e.target.value.toUpperCase())}
                    className={`w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-[#fdfbf7] font-mono uppercase placeholder-[#78716c] focus:outline-none focus:border-[#c5a059] ${
                      isProtectedTech(editingTech) ? 'opacity-60 cursor-not-allowed bg-[#141414]' : ''
                    }`}
                  />
                  {isProtectedTech(editingTech) ? (
                    <p className="text-[10px] text-[#c5a059] mt-1">ID 1014958 is system protected</p>
                  ) : (
                    <p className="text-[10px] text-[#78716c] mt-1">Used for portal PIN login</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#b8b0a5] mb-1">
                    Security PIN *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formPin}
                    onChange={(e) => setFormPin(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-[#fdfbf7] font-mono placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
                  />
                  <p className="text-[10px] text-[#78716c] mt-1">Keypad access code</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#b8b0a5] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#b8b0a5] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#b8b0a5] mb-1 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-[#FF8A00]" />
                  <span>Telegram Chat ID (Optional)</span>
                </label>
                <input
                  type="text"
                  value={formTelegram}
                  onChange={(e) => setFormTelegram(e.target.value)}
                  placeholder="e.g. 839201948"
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="activeToggleEdit"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="rounded accent-[#c5a059] bg-[#181818] border-[#2a2a2a]"
                />
                <label htmlFor="activeToggleEdit" className="text-xs font-semibold text-[#fdfbf7] cursor-pointer">
                  Active for Immediate Dispatch Scheduling
                </label>
              </div>

              <div className="border-t border-[#262626] pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingTech(null)}
                  className="px-4 py-2 rounded-lg border border-[#333333] text-xs font-bold text-[#b8b0a5] hover:bg-[#1a1a1a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#c5a059] hover:bg-[#b38728] text-black text-xs font-bold shadow-md transition flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTech && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111111] text-[#fdfbf7] rounded-2xl shadow-2xl max-w-md w-full border border-red-900/40 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-800/50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#fdfbf7]">Delete Technician</h3>
                <p className="text-xs text-[#b8b0a5]">Confirm permanent removal from roster</p>
              </div>
            </div>

            <p className="text-xs text-[#b8b0a5] leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-[#fdfbf7]">{deletingTech.displayName}</span> (Employee ID: {deletingTech.employeeId})? This technician will no longer be able to log in or be assigned new work orders.
            </p>

            <div className="border-t border-[#262626] pt-4 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeletingTech(null)}
                className="px-4 py-2 rounded-lg border border-[#333333] text-xs font-bold text-[#b8b0a5] hover:bg-[#1a1a1a]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Removal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
