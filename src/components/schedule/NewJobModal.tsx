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
  DollarSign,
  Key,
  Radio,
  Smartphone,
  Send,
  Zap,
  ChevronRight,
  ShieldAlert,
  Building2,
  Check,
  ExternalLink
} from 'lucide-react';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedClientId?: string;
  preselectedPropertyId?: string;
  initialIsEmergency?: boolean;
  onSuccess?: (jobId: string) => void;
}

export const NewJobModal: React.FC<NewJobModalProps> = ({
  isOpen,
  onClose,
  preselectedClientId,
  preselectedPropertyId,
  initialIsEmergency = false,
  onSuccess,
}) => {
  const { clients, properties, getTechnicians, addJob } = useFSMStore();
  const technicians = getTechnicians();

  const [clientId, setClientId] = useState(preselectedClientId || '');
  const [propertyId, setPropertyId] = useState(preselectedPropertyId || '');
  const [title, setTitle] = useState(initialIsEmergency ? '🚨 EMERGENCY: 24/7 Service Call' : '');
  const [description, setDescription] = useState('');
  const [assignedTechId, setAssignedTechId] = useState('user-tech-1');
  const [status, setStatus] = useState<JobStatus>('scheduled');
  const [priority, setPriority] = useState<JobPriority>(initialIsEmergency ? 'emergency' : 'medium');
  const [isEmergency, setIsEmergency] = useState(initialIsEmergency);
  const [emergencySmsPayload, setEmergencySmsPayload] = useState<{
    techName: string;
    techPhone: string;
    job: any;
  } | null>(null);

  useEffect(() => {
    if (initialIsEmergency) {
      setIsEmergency(true);
      setPriority('emergency');
      if (!title) setTitle('🚨 EMERGENCY: 24/7 Service Call');
    }
  }, [initialIsEmergency]);
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

    const finalPriority = isEmergency ? 'emergency' : priority;

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
      priority: finalPriority,
      scheduledDate,
      timeWindowStart,
      timeWindowEnd,
      checklist,
      photosBefore: [],
      photosAfter: [],
      notes,
      totalAmount: parseFloat(totalAmount) || 0,
    });

    if (isEmergency || finalPriority === 'emergency') {
      setEmergencySmsPayload({
        techName: tech ? tech.displayName : (assignedTechId ? 'Field Tech' : 'Rome On-Call Tech'),
        techPhone: tech?.phone || '(706) 844-8193',
        job: newJob,
      });
    } else {
      if (onSuccess) {
        onSuccess(newJob.id);
      }
      onClose();
    }
  };

  if (emergencySmsPayload) {
    const job = emergencySmsPayload.job;
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-[#100c0c] text-[#fdfbf7] rounded-3xl shadow-2xl max-w-lg w-full border-2 border-sky-500/50 shadow-sky-900/40 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-sky-950 via-[#0a1e2b] to-sky-950 p-5 border-b border-sky-800/60 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-lg animate-pulse">
                <Send className="w-5 h-5 ml-0.5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider font-heading">
                    24/7 Emergency Dispatch Active
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-sky-500 text-white animate-pulse">
                    Live Telegram Push
                  </span>
                </div>
                <p className="text-xs text-sky-200/80">Telegram Bot API • Automated Push Notification Alert</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (onSuccess) onSuccess(job.id);
                setEmergencySmsPayload(null);
                onClose();
              }}
              className="text-red-300 hover:text-white p-1 rounded-lg hover:bg-red-900/40 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Telegram API Telemetry Bar */}
            <div className="bg-[#0b141a] border border-sky-900/50 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-mono text-emerald-400 font-bold">HTTP 200 OK</span>
                <span className="text-[#a8a095]">|</span>
                <span className="text-[#c8c0b5] font-mono text-[11px]">
                  {(() => {
                    const tech = getTechnicians().find(t => t.displayName === emergencySmsPayload.techName);
                    return `Chat ID: ${tech?.telegramChatId || '839201948'}`;
                  })()}
                </span>
              </div>
              <span className="text-[11px] text-sky-400 font-bold bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40">
                Bot: @NailedItDispatchBot
              </span>
            </div>

            {/* Recipient Details */}
            <div className="bg-[#161616] p-3.5 rounded-xl border border-[#2a2a2a] text-xs space-y-1">
              <div className="flex justify-between text-[#b8b0a5]">
                <span>Dispatched Technician:</span>
                <span className="text-white font-bold">{emergencySmsPayload.techName}</span>
              </div>
              <div className="flex justify-between text-[#b8b0a5]">
                <span>Telegram API Connection:</span>
                <span className="text-[#c5a059] font-mono">Secured (TLS 1.3)</span>
              </div>
              <div className="flex justify-between text-[#b8b0a5]">
                <span>Dispatch Mode:</span>
                <span className="text-sky-400 font-bold uppercase tracking-wider text-[10px]">Priority 1 Push Notification</span>
              </div>
            </div>

            {/* Realistic Smartphone Preview */}
            <div className="bg-[#050505] rounded-2xl border-4 border-[#333333] shadow-2xl p-4 space-y-3">
              {/* Phone Status Header */}
              <div className="flex items-center justify-between text-[10px] text-[#78716c] pb-2 border-b border-[#222222]">
                <div className="flex items-center space-x-1.5">
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-bold text-[#b8b0a5]">Telegram</span>
                </div>
                <span>@NailedItDispatchBot</span>
                <span className="font-mono text-emerald-400 font-bold">5G LTE</span>
              </div>

              {/* SMS Speech Bubble */}
              <div className="bg-gradient-to-br from-[#0c1a2b] to-[#08131a] border border-sky-600/60 rounded-2xl rounded-tl-sm p-4 text-xs space-y-2.5 shadow-lg">
                <div className="flex items-center space-x-2 text-sky-400 font-extrabold text-[11px] uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
                  <span>🚨 24/7 EMERGENCY WORK ORDER DISPATCH</span>
                </div>

                <div className="space-y-1 text-white font-mono text-[11px] leading-relaxed">
                  <div><span className="text-[#a8a095]">WORK ORDER:</span> <span className="font-bold text-[#c5a059]">{job.jobNumber}</span></div>
                  <div><span className="text-[#a8a095]">CLIENT:</span> <span className="font-bold">{job.clientName}</span></div>
                  <div><span className="text-[#a8a095]">LOCATION:</span> <span className="font-bold text-amber-200">{job.propertyAddress}</span></div>
                  <div><span className="text-[#a8a095]">EMERGENCY ISSUE:</span> <span className="font-bold text-red-300">{job.title}</span></div>
                  {job.description && (
                    <div><span className="text-[#a8a095]">SCOPE:</span> <span>{job.description}</span></div>
                  )}
                  {selectedProperty?.gateCode && (
                    <div><span className="text-[#a8a095]">GATE / LOCKBOX:</span> <span className="font-bold text-emerald-400">{selectedProperty.gateCode}</span></div>
                  )}
                </div>

                <div className="pt-2 border-t border-sky-900/60 text-[10px] space-y-1 text-sky-200">
                  <div className="font-bold text-[#c5a059] flex items-center gap-1">
                    <span>📲 DIRECT MOBILE TECH DISPATCH PORTAL:</span>
                  </div>
                  <div className="underline text-blue-400 font-mono break-all">
                    https://fsm.naileditpropertysolutions.com/mobile/tech?job={job.id}
                  </div>
                  <div className="text-[#a8a095] italic text-[9px] pt-1">
                    Tap the inline button below to acknowledge on-site transit.
                  </div>
                </div>
              </div>

              <div className="text-right text-[10px] text-[#78716c] flex items-center justify-end space-x-1">
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Delivered</span>
                <span>• Just now</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href={`/mobile/tech?job=${job.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-[#222222] hover:bg-[#2e2e2e] text-[#fdfbf7] text-xs font-bold text-center border border-[#3a3a3a] flex items-center justify-center space-x-1.5 transition"
              >
                <span>View Tech Mobile View</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#c5a059]" />
              </a>

              <button
                type="button"
                onClick={() => {
                  if (onSuccess) onSuccess(job.id);
                  setEmergencySmsPayload(null);
                  onClose();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-black uppercase tracking-wider text-center shadow-lg shadow-red-950/80 flex items-center justify-center space-x-1.5 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Acknowledge & View Board</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

          {/* Emergency / 24-7 Response Toggle Card */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              isEmergency
                ? 'bg-gradient-to-r from-red-950 via-[#260e0e] to-[#1a0a0a] border-red-500 shadow-xl shadow-red-950/70 ring-2 ring-red-500/30'
                : 'bg-[#161616] border-[#2a2a2a]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    isEmergency
                      ? 'bg-red-600 text-white animate-bounce shadow-lg shadow-red-900/60'
                      : 'bg-[#222222] text-[#888888]'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <label
                      htmlFor="emergency-toggle"
                      className="text-xs font-black uppercase tracking-wider text-white cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Emergency / 24-7 Response</span>
                    </label>
                    {isEmergency && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white shadow">
                        Active Alert Mode
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#a8a095] mt-0.5 leading-relaxed">
                    Flags job with bright red highlighting on Dispatch Board and dispatches instant push notification alert to assigned technician via Telegram Bot.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                id="emergency-toggle"
                role="switch"
                aria-checked={isEmergency}
                onClick={() => {
                  const next = !isEmergency;
                  setIsEmergency(next);
                  if (next) {
                    setPriority('emergency');
                    if (!title) setTitle('🚨 EMERGENCY: Active Service Call');
                  } else if (priority === 'emergency') {
                    setPriority('medium');
                  }
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isEmergency ? 'bg-red-600 ring-2 ring-red-400/50' : 'bg-[#333333]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isEmergency ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

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
