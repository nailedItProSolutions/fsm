'use client';

import React, { useState, useEffect } from 'react';
import { useFSMStore } from '@/lib/useStore';
import { JobPriority, JobStatus } from '@/types';
import { 
  X, 
  Calendar, 
  Clock, 
  Wrench, 
  MapPin, 
  User, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  DollarSign,
  Key
} from 'lucide-react';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedClientId?: string;
  preselectedPropertyId?: string;
  onSuccess?: (jobId: string) => void;
}

export const NewJobModal: React.FC<NewJobModalProps> = ({
  isOpen,
  onClose,
  preselectedClientId,
  preselectedPropertyId,
  onSuccess,
}) => {
  const { clients, properties, getTechnicians, addJob } = useFSMStore();
  const technicians = getTechnicians();

  const [clientId, setClientId] = useState(preselectedClientId || '');
  const [propertyId, setPropertyId] = useState(preselectedPropertyId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTechId, setAssignedTechId] = useState('user-tech-1');
  const [status, setStatus] = useState<JobStatus>('scheduled');
  const [priority, setPriority] = useState<JobPriority>('medium');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeWindowStart, setTimeWindowStart] = useState('09:00');
  const [timeWindowEnd, setTimeWindowEnd] = useState('11:30');
  const [totalAmount, setTotalAmount] = useState('250.00');
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState<Array<{ id: string; text: string; done: boolean }>>([
    { id: 'item-1', text: 'Initial site walkthrough & damage inspection', done: false },
    { id: 'item-2', text: 'Perform repair/maintenance according to scope', done: false },
    { id: 'item-3', text: 'Clean work area & take completion photos', done: false },
  ]);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Auto-select first client if none selected
  useEffect(() => {
    if (!clientId && clients.length > 0) {
      setClientId(clients[0].id);
    }
  }, [clients, clientId]);

  // When client changes, auto-select their first property
  const clientProperties = properties.filter((p) => p.clientId === clientId);

  useEffect(() => {
    if (clientProperties.length > 0) {
      const exists = clientProperties.some((p) => p.id === propertyId);
      if (!exists) {
        setPropertyId(clientProperties[0].id);
      }
    } else {
      setPropertyId('');
    }
  }, [clientId, clientProperties, propertyId]);

  if (!isOpen) return null;

  const selectedClient = clients.find((c) => c.id === clientId);
  const selectedProperty = properties.find((p) => p.id === propertyId);

  const handleAddChecklistItem = () => {
    if (newChecklistText.trim()) {
      setChecklist([
        ...checklist,
        { id: `item-${Date.now()}`, text: newChecklistText.trim(), done: false },
      ]);
      setNewChecklistText('');
    }
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient || !selectedProperty) {
      alert('Please select both a client and a service property address.');
      return;
    }

    const tech = technicians.find((t) => t.uid === assignedTechId);

    const clientDisplayName = selectedClient.isCompany 
      ? selectedClient.companyName || `${selectedClient.firstName} ${selectedClient.lastName}`
      : `${selectedClient.firstName} ${selectedClient.lastName}`;

    const propAddressString = `${selectedProperty.street} ${selectedProperty.unit ? `(${selectedProperty.unit})` : ''}, ${selectedProperty.city}, ${selectedProperty.state}`;

    const newJob = addJob({
      clientId: selectedClient.id,
      clientName: clientDisplayName,
      propertyId: selectedProperty.id,
      propertyAddress: propAddressString,
      assignedTechId: assignedTechId || undefined,
      assignedTechName: tech ? tech.displayName : (assignedTechId ? 'Assigned Tech' : 'Unassigned'),
      title,
      description,
      status,
      priority,
      scheduledDate,
      timeWindowStart,
      timeWindowEnd,
      checklist,
      photosBefore: [],
      photosAfter: [],
      notes,
      totalAmount: parseFloat(totalAmount) || 0,
    });

    if (onSuccess) {
      onSuccess(newJob.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#111111] text-[#fdfbf7] rounded-2xl shadow-2xl max-w-2xl w-full border border-[#2a2a2a] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#181818] p-5 border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c5a059] flex items-center justify-center text-black font-bold text-sm">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#fdfbf7] font-heading">Dispatch New Service Job</h3>
              <p className="text-xs text-[#b8b0a5]">Schedule work order, assign field technician, & attach checklist</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#78716c] hover:text-[#fdfbf7] p-1 rounded-lg hover:bg-[#222222] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[78vh] overflow-y-auto">
          {/* Client & Property Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-[#c5a059]" />
                <span>Client Account *</span>
              </label>
              <select
                required
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
                required
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              >
                {clientProperties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label ? `${p.label} - ` : ''}{p.street} {p.unit || ''}
                  </option>
                ))}
                {clientProperties.length === 0 && (
                  <option value="">No properties on file for client</option>
                )}
              </select>
            </div>
          </div>

          {/* Property Gate Code & Lockbox Preview */}
          {selectedProperty && (
            <div className="bg-[#161616] p-3 rounded-lg border border-[#262626] flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-2 text-[#b8b0a5]">
                <Key className="w-3.5 h-3.5 text-[#FF8A00]" />
                <span>Access Info:</span>
                <span className="text-[#fdfbf7] font-semibold">
                  {selectedProperty.gateCode ? `Code: ${selectedProperty.gateCode}` : 'No gate code required'}
                </span>
              </div>
              <span className="text-[#78716c] truncate max-w-xs">
                {selectedProperty.accessInstructions || 'Normal front entry'}
              </span>
            </div>
          )}

          {/* Job Title & Scope */}
          <div>
            <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
              Job Title / Service Order Summary *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Shower Leak Repair & Tile Caulking, HVAC Turnover Punchlist"
              className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
              Scope of Work / Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed instructions for the field technician on site..."
              className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          {/* Technician Assignment, Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1 flex items-center gap-1">
                <Wrench className="w-3 h-3 text-[#FF8A00]" />
                <span>Assign Technician</span>
              </label>
              <select
                value={assignedTechId}
                onChange={(e) => setAssignedTechId(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              >
                {technicians.map((t) => (
                  <option key={t.uid} value={t.uid}>
                    {t.displayName}
                  </option>
                ))}
                <option value="">Unassigned (Queue)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="unscheduled">Unscheduled</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as JobPriority)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="emergency">Emergency / Urgent</option>
              </select>
            </div>
          </div>

          {/* Schedule Date & Time Window */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#c5a059]" />
                <span>Service Date *</span>
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#78716c]" />
                <span>Window Start *</span>
              </label>
              <input
                type="time"
                required
                value={timeWindowStart}
                onChange={(e) => setTimeWindowStart(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#78716c]" />
                <span>Window End *</span>
              </label>
              <input
                type="time"
                required
                value={timeWindowEnd}
                onChange={(e) => setTimeWindowEnd(e.target.value)}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          {/* Price / Estimated Revenue */}
          <div>
            <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-[#c5a059]" />
              <span>Estimated Job Value ($)</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="250.00"
              className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          {/* Work Order Checklist */}
          <div className="border-t border-[#222222] pt-4">
            <label className="block text-[11px] font-bold text-[#b8b0a5] mb-2 flex items-center justify-between">
              <span>Technician Work Order Checklist</span>
              <span className="text-[#78716c] font-normal">{checklist.length} items configured</span>
            </label>
            
            <div className="space-y-2 mb-3">
              {checklist.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between bg-[#161616] p-2.5 rounded-lg border border-[#262626]">
                  <span className="text-[#fdfbf7] text-[11px] flex items-center space-x-2">
                    <span className="text-[#c5a059] font-bold">{idx + 1}.</span>
                    <span>{item.text}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="text-[#78716c] hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddChecklistItem(); } }}
                placeholder="Add checklist task (e.g. 'Shut off water valve', 'Test water pressure')..."
                className="flex-1 bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="bg-[#222222] hover:bg-[#333333] text-[#c5a059] px-3 py-1.5 rounded-lg font-bold text-xs"
              >
                + Add Task
              </button>
            </div>
          </div>

          {/* Dispatcher Notes */}
          <div className="border-t border-[#222222] pt-4">
            <label className="block text-[11px] font-bold text-[#b8b0a5] mb-1">
              Internal Dispatcher Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Customer will be home with dog, knock twice on front screen door..."
              className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2 text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          {/* Actions */}
          <div className="border-t border-[#222222] pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#333333] text-xs font-semibold text-[#b8b0a5] hover:bg-[#1a1a1a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#c5a059] hover:bg-[#b38728] text-black text-xs font-bold shadow-lg transition flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Dispatch Job</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
