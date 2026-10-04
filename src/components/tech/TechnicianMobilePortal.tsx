'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFSMStore } from '@/lib/useStore';
import { useAuth } from '@/lib/authContext';
import { Job, Property, Client } from '@/types';
import { 
  Smartphone, 
  MapPin, 
  Navigation, 
  Phone, 
  CheckSquare, 
  Camera, 
  Clock, 
  AlertTriangle, 
  Key, 
  CheckCircle2, 
  Plus, 
  ChevronRight, 
  Receipt, 
  User, 
  Calendar,
  Image as ImageIcon,
  Check,
  Play,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Building2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const STANDARDIZED_TURNOVER_ITEMS = [
  'HVAC Filter Replacement & Blower Vent Inspection',
  'Re-key Exterior Entry Deadbolts & Verify Master Key',
  'Drywall Patch & Paint Inspection (Walls, Baseboards & Ceiling)',
  'Smoke & Carbon Monoxide Detector Functional Testing',
  'Plumbing Supply Stop, P-Trap & Toilet Flapper Leak Inspection',
  'Appliance Cleanliness & Refrigerator Coil Check',
  'Window Locks & Weatherstripping Integrity Verification',
];

const SAMPLE_FIELD_PHOTOS = [
  { label: 'Ceiling Drywall Patch Before', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80' },
  { label: 'Ceiling Drywall Fresh Texture After', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80' },
  { label: 'Worn Shower Cartridge Before', url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80' },
  { label: 'Clean Re-caulked Shower Pan After', url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80' },
  { label: 'Clogged Gutter Debris Before', url: 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=600&q=80' },
  { label: 'Clear Flowing Downspout After', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80' },
  { label: 'Turnover Fresh Paint & Spackle Cleaned (After)', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80' },
  { label: 'Turnover Re-keyed Deadbolt & Key Tag (After)', url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80' },
  { label: 'Turnover Brand New HVAC Air Filter (After)', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80' },
];

export const TechnicianMobilePortal: React.FC = () => {
  const { 
    jobs, 
    properties, 
    clients, 
    getTechnicians, 
    toggleChecklistItem, 
    updateJobStatus, 
    addJobPhoto,
    updateJob
  } = useFSMStore();

  const { user } = useAuth();
  const technicians = getTechnicians();

  // Active tech state
  const [selectedTechId, setSelectedTechId] = useState<string>(() => {
    return user?.uid?.startsWith('user-tech') ? user.uid : (technicians[0]?.uid || 'user-tech-1');
  });

  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState<Record<string, string>>({});
  const [photoPickerModalJobId, setPhotoPickerModalJobId] = useState<{ jobId: string; type: 'before' | 'after' } | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const jobParam = params.get('job');
      if (jobParam) setExpandedJobId(jobParam);
      const techParam = params.get('tech');
      if (techParam) setSelectedTechId(techParam);
    }
  }, []);

  const activeTech = technicians.find((t) => t.uid === selectedTechId) || technicians[0];
  const techJobs = jobs.filter((j) => j.assignedTechId === selectedTechId);

  // Group by today / upcoming
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysJobs = techJobs.filter((j) => j.scheduledDate === todayStr || !j.scheduledDate);
  const otherJobs = techJobs.filter((j) => j.scheduledDate !== todayStr && j.scheduledDate);

  const completedCount = todaysJobs.filter((j) => j.status === 'completed').length;
  const progressPercent = todaysJobs.length > 0 ? Math.round((completedCount / todaysJobs.length) * 100) : 0;

  const handleStartJob = (jobId: string) => {
    updateJobStatus(jobId, 'in_progress');
  };

  const handleCompleteJob = (jobId: string) => {
    const notes = completionNotes[jobId];
    if (notes) {
      const job = jobs.find((j) => j.id === jobId);
      updateJob(jobId, { notes: `${job?.notes || ''}\n[Tech Completion Note]: ${notes}` });
    }
    updateJobStatus(jobId, 'completed');
  };

  const handleAddSamplePhoto = (photoUrl: string) => {
    if (!photoPickerModalJobId) return;
    addJobPhoto(photoPickerModalJobId.jobId, photoPickerModalJobId.type, photoUrl);
    setPhotoPickerModalJobId(null);
  };

  const handleApplyTurnoverChecklist = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    const newItems = STANDARDIZED_TURNOVER_ITEMS.map((text, idx) => ({
      id: `to-${Date.now()}-${idx}`,
      text,
      done: false,
    }));
    updateJob(jobId, { checklist: newItems });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fdfbf7] pb-24 md:pb-12">
      {/* Mobile Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#111111]/95 backdrop-blur-md border-b border-[#222222] px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#FF8A00]">
                Technician Field Hub
              </div>
              <h1 className="text-sm font-bold font-heading text-[#fdfbf7]">
                Today's Daily Route
              </h1>
            </div>
          </div>

          {/* Tech Switcher Dropdown */}
          <div className="flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-[#b8b0a5]" />
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="bg-[#181818] border border-[#2e2e2e] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
            >
              {technicians.map((t) => (
                <option key={t.uid} value={t.uid}>
                  {t.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content Container (Mobile-first width) */}
      <main className="max-w-xl mx-auto p-4 space-y-4">
        {/* Daily Route Status Card */}
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center space-x-1.5 text-[#b8b0a5] font-semibold">
              <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="text-[11px] font-bold text-[#c5a059]">
              {completedCount} of {todaysJobs.length} Completed ({progressPercent}%)
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#1e1e1e] h-2.5 rounded-full overflow-hidden border border-[#2a2a2a]">
            <div
              className="bg-gradient-to-r from-[#c5a059] to-[#FF8A00] h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-[#78716c]">
            <span>Floyd County Operations</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync Active
            </span>
          </div>
        </div>

        {/* Route Stops Header */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#b8b0a5]">
            Assigned Work Orders ({todaysJobs.length})
          </h2>
          <span className="text-[11px] text-[#78716c]">Rome & Surrounding</span>
        </div>

        {/* Job Cards */}
        {todaysJobs.length === 0 ? (
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 text-center text-[#78716c]">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-[#fdfbf7]">No scheduled stops for today!</p>
            <p className="text-xs mt-1">Enjoy your break or check dispatch for emergency calls.</p>
          </div>
        ) : (
          todaysJobs.map((job, index) => {
            const property = properties.find((p) => p.id === job.propertyId);
            const client = clients.find((c) => c.id === job.clientId);
            const isCompleted = job.status === 'completed';
            const isInProgress = job.status === 'in_progress';
            const isExpanded = expandedJobId === job.id || (!isCompleted && expandedJobId === null && index === 0);

            const checklistDoneCount = job.checklist?.filter((c) => c.done).length || 0;
            const checklistTotal = job.checklist?.length || 0;

            const isTurnoverJob =
              job.title.toLowerCase().includes('turnover') ||
              job.description.toLowerCase().includes('turnover') ||
              job.notes?.toLowerCase().includes('turnover') ||
              (job as any).isTurnover;

            const allChecklistDone =
              checklistTotal > 0 && (job.checklist?.every((c) => c.done) ?? false);
            const hasAfterPhoto = (job.photosAfter?.length || 0) >= 1;
            const isCompletionGated = isTurnoverJob && (!allChecklistDone || !hasAfterPhoto);

            return (
              <div
                key={job.id}
                className={`bg-[#111111] border rounded-2xl shadow-xl overflow-hidden transition ${
                  isInProgress
                    ? 'border-[#FF8A00] ring-1 ring-[#FF8A00]/50'
                    : isCompleted
                    ? 'border-emerald-500/30 opacity-90'
                    : 'border-[#242424]'
                }`}
              >
                {/* Card Top Stop Bar */}
                <div className="bg-[#161616] px-4 py-2.5 border-b border-[#222222] flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#242424] text-[#c5a059] font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                      Stop #{index + 1}
                    </span>
                    <span className="font-mono text-[#b8b0a5] font-semibold text-[11px]">
                      {job.jobNumber}
                    </span>
                    {isTurnoverJob && (
                      <span className="bg-purple-950/80 text-purple-300 border border-purple-700/60 font-mono font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-purple-400" />
                        Turnover Protocol
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-[#b8b0a5] flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-[#FF8A00]" />
                      {job.timeWindowStart} - {job.timeWindowEnd}
                    </span>

                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isInProgress
                          ? 'bg-[#FF8A00]/20 text-[#FF8A00]'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-4">
                  {/* Job Title & Client */}
                  <div>
                    <h3 className="font-bold text-base text-[#fdfbf7] font-heading">
                      {job.title}
                    </h3>
                    <div className="text-xs text-[#b8b0a5] mt-0.5">
                      Client: <span className="font-semibold text-[#fdfbf7]">{job.clientName}</span>
                    </div>
                  </div>

                  {/* Property Address & GPS Launch */}
                  <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-[#FF8A00] flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-[#fdfbf7]">{job.propertyAddress}</div>
                          {property?.label && (
                            <div className="text-[11px] text-[#c5a059]">{property.label}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick GPS & Phone Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                          job.propertyAddress
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#242424] hover:bg-[#2e2e2e] text-[#fdfbf7] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition border border-[#333333]"
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#FF8A00]" />
                        <span>GPS Navigation</span>
                      </a>

                      <a
                        href={`tel:${client?.phone || '7068448193'}`}
                        className="bg-[#242424] hover:bg-[#2e2e2e] text-[#fdfbf7] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition border border-[#333333]"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Call Customer</span>
                      </a>
                    </div>
                  </div>

                  {/* Prominent Access Instructions & Gate Code Alert */}
                  {(property?.gateCode || property?.accessInstructions || job.notes) && (
                    <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3 text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
                        <Key className="w-3.5 h-3.5 text-[#FF8A00]" />
                        <span>Property Access Details:</span>
                      </div>
                      {property?.gateCode && (
                        <div className="text-[#fdfbf7] font-mono text-sm font-bold bg-[#111111] px-2.5 py-1 rounded inline-block border border-amber-500/30">
                          Gate / Lockbox: {property.gateCode}
                        </div>
                      )}
                      {property?.accessInstructions && (
                        <div className="text-amber-200/90 text-[11px] pt-1 leading-snug">
                          {property.accessInstructions}
                        </div>
                      )}
                      {job.notes && (
                        <div className="text-[#b8b0a5] text-[11px] italic pt-0.5">
                          Dispatch Note: {job.notes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Work Order Checklist */}
                  {job.checklist && job.checklist.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#b8b0a5] flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-[#c5a059]" />
                          {isTurnoverJob ? 'Turnover Punch-List' : 'Tasks Checklist'} ({checklistDoneCount}/{checklistTotal})
                        </span>
                        {isTurnoverJob ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-200 border border-purple-700/60">
                            Standard Protocol Active
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#78716c]">Tap to complete</span>
                        )}
                      </div>

                      <div className="space-y-1.5 bg-[#161616] p-2.5 rounded-xl border border-[#242424]">
                        {job.checklist.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleChecklistItem(job.id, item.id)}
                            className="w-full text-left flex items-start space-x-2.5 p-1.5 rounded-lg hover:bg-[#202020] transition group"
                          >
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition ${
                                item.done
                                  ? 'bg-emerald-500 border-emerald-500 text-black'
                                  : 'border-[#444444] bg-[#1a1a1a] group-hover:border-[#c5a059]'
                              }`}
                            >
                              {item.done && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span
                              className={`text-xs ${
                                item.done ? 'line-through text-[#78716c]' : 'text-[#fdfbf7]'
                              }`}
                            >
                              {item.text}
                            </span>
                          </button>
                        ))}
                      </div>

                      {isTurnoverJob && job.checklist.length < STANDARDIZED_TURNOVER_ITEMS.length && (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleApplyTurnoverChecklist(job.id)}
                            className="text-[11px] font-semibold text-purple-300 hover:text-purple-200 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700/60 px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            Apply 7-Point Turnover Checklist Protocol
                          </button>
                        </div>
                      )}
                    </div>
                  ) : isTurnoverJob ? (
                    <div className="bg-[#18181b] p-3 rounded-xl border border-purple-800/60 text-center space-y-2">
                      <p className="text-xs text-purple-200 font-bold">Standardized Turnover Checklist Required</p>
                      <button
                        type="button"
                        onClick={() => handleApplyTurnoverChecklist(job.id)}
                        className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-lg shadow transition flex items-center justify-center mx-auto space-x-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Load 7-Point Turnover Checklist</span>
                      </button>
                    </div>
                  ) : null}

                  {/* Before & After Job Photos */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#b8b0a5] flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-[#FF8A00]" />
                        Before / After Photos
                      </span>
                      {isTurnoverJob && (
                        <span className="text-[10px] text-amber-400 font-semibold">
                          Min 1 &apos;After&apos; photo required to close
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Before Photos */}
                      <div className="bg-[#161616] p-2.5 rounded-xl border border-[#242424] space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#b8b0a5]">Before Photos</span>
                          <button
                            type="button"
                            onClick={() => setPhotoPickerModalJobId({ jobId: job.id, type: 'before' })}
                            className="text-[10px] text-[#c5a059] hover:underline font-bold flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" /> Add
                          </button>
                        </div>

                        {job.photosBefore && job.photosBefore.length > 0 ? (
                          <div className="grid grid-cols-2 gap-1.5">
                            {job.photosBefore.map((p, i) => (
                              <img
                                key={i}
                                src={p}
                                alt="Before"
                                className="w-full h-16 object-cover rounded-lg border border-[#333333]"
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="h-14 border border-dashed border-[#333333] rounded-lg flex items-center justify-center text-[10px] text-[#78716c]">
                            No before photos
                          </div>
                        )}
                      </div>

                      {/* After Photos */}
                      <div className="bg-[#161616] p-2.5 rounded-xl border border-[#242424] space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#b8b0a5]">After Photos</span>
                          <button
                            type="button"
                            onClick={() => setPhotoPickerModalJobId({ jobId: job.id, type: 'after' })}
                            className="text-[10px] text-[#c5a059] hover:underline font-bold flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" /> Add
                          </button>
                        </div>

                        {job.photosAfter && job.photosAfter.length > 0 ? (
                          <div className="grid grid-cols-2 gap-1.5">
                            {job.photosAfter.map((p, i) => (
                              <img
                                key={i}
                                src={p}
                                alt="After"
                                className="w-full h-16 object-cover rounded-lg border border-[#333333]"
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="h-14 border border-dashed border-[#333333] rounded-lg flex items-center justify-center text-[10px] text-[#78716c]">
                            No after photos
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Completion Notes Input (if in-progress or scheduled) */}
                  {!isCompleted && (
                    <div>
                      <label className="block text-[11px] font-semibold text-[#b8b0a5] mb-1">
                        Technician Completion Notes
                      </label>
                      <textarea
                        rows={2}
                        value={completionNotes[job.id] || ''}
                        onChange={(e) =>
                          setCompletionNotes({ ...completionNotes, [job.id]: e.target.value })
                        }
                        placeholder="Add notes for dispatch (e.g. Shutoff valve tagged, job cleaned up)..."
                        className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl p-2.5 text-xs text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>
                  )}

                  {/* Status Change CTA Actions */}
                  <div className="pt-2">
                    {job.status === 'scheduled' && (
                      <button
                        onClick={() => handleStartJob(job.id)}
                        className="w-full bg-[#FF8A00] hover:bg-[#e07b00] text-black font-bold text-xs py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Start Work / Clock In (In Progress)</span>
                      </button>
                    )}

                    {job.status === 'in_progress' && (
                      <div className="space-y-3">
                        {/* Turnover Quality Gate Status Box */}
                        {isTurnoverJob && (
                          <div
                            className={`p-3.5 rounded-xl border transition ${
                              isCompletionGated
                                ? 'bg-amber-950/40 border-amber-600/60 text-amber-200 shadow-md'
                                : 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200 shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {isCompletionGated ? (
                                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                                ) : (
                                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                                )}
                                <div>
                                  <h4 className="text-xs font-black uppercase tracking-wider text-white">
                                    Turnover Quality Gate {isCompletionGated ? '— Sign-Off Locked' : '— Ready'}
                                  </h4>
                                  <p className="text-[11px] text-[#b8b0a5] mt-0.5">
                                    {isCompletionGated
                                      ? 'Turnover protocol requires 100% checklist tasks + 1 "After" photo.'
                                      : 'All turnover quality criteria met. Work order unlocked for completion.'}
                                  </p>
                                </div>
                              </div>

                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded shrink-0 ${
                                  isCompletionGated
                                    ? 'bg-amber-900/80 text-amber-300 border border-amber-700'
                                    : 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                                }`}
                              >
                                {isCompletionGated ? 'Gated Lock' : 'Certified'}
                              </span>
                            </div>

                            {/* Gate Status Grid */}
                            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                              <div
                                className={`p-2 rounded-lg border flex items-center space-x-2 ${
                                  allChecklistDone
                                    ? 'bg-emerald-950/70 border-emerald-700/80 text-emerald-300 font-semibold'
                                    : 'bg-[#18181b] border-[#333333] text-amber-300'
                                }`}
                              >
                                {allChecklistDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                                )}
                                <span className="text-[11px]">
                                  {allChecklistDone
                                    ? `✓ All Tasks (${checklistDoneCount}/${checklistTotal})`
                                    : `Tasks: ${checklistDoneCount}/${checklistTotal} Done`}
                                </span>
                              </div>

                              <div
                                className={`p-2 rounded-lg border flex items-center space-x-2 ${
                                  hasAfterPhoto
                                    ? 'bg-emerald-950/70 border-emerald-700/80 text-emerald-300 font-semibold'
                                    : 'bg-[#18181b] border-[#333333] text-amber-300'
                                }`}
                              >
                                {hasAfterPhoto ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                  <Camera className="w-4 h-4 text-amber-400 shrink-0" />
                                )}
                                <span className="text-[11px]">
                                  {hasAfterPhoto
                                    ? `✓ ${job.photosAfter?.length} 'After' Photo(s)`
                                    : 'Missing 1+ After Photo'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          disabled={isCompletionGated}
                          onClick={() => handleCompleteJob(job.id)}
                          className={`w-full font-bold text-xs py-3.5 px-4 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 ${
                            isCompletionGated
                              ? 'bg-[#202020] text-[#777777] border border-[#333333] cursor-not-allowed opacity-80'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-emerald-950/50 ring-2 ring-emerald-500/40'
                          }`}
                        >
                          {isCompletionGated ? (
                            <>
                              <Lock className="w-4 h-4 text-amber-400" />
                              <span>Complete Job Locked (Turnover Incomplete)</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>✓ Complete Work Order & Sign Off</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Work Order Completed</span>
                        </div>
                        <Link
                          href="/dashboard/invoices"
                          className="bg-[#1f1f1f] hover:bg-[#282828] text-[#c5a059] px-2.5 py-1 rounded-lg text-[11px] font-bold border border-[#c5a059]/30 transition flex items-center gap-1"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Invoice</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Field Photo Picker Modal */}
      {photoPickerModalJobId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#222222] bg-[#141414] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-[#FF8A00]" />
                <h3 className="text-sm font-bold text-[#fdfbf7]">
                  Attach {photoPickerModalJobId.type === 'before' ? 'Before' : 'After'} Photo
                </h3>
              </div>
              <button
                onClick={() => setPhotoPickerModalJobId(null)}
                className="text-[#78716c] hover:text-[#fdfbf7]"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-xs text-[#b8b0a5]">
                Select a field inspection photo from the device camera library:
              </p>

              <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                {SAMPLE_FIELD_PHOTOS.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => handleAddSamplePhoto(photo.url)}
                    className="bg-[#181818] hover:bg-[#222222] border border-[#2e2e2e] rounded-xl overflow-hidden p-2 text-left group transition"
                  >
                    <img
                      src={photo.url}
                      alt={photo.label}
                      className="w-full h-24 object-cover rounded-lg mb-1.5 group-hover:scale-105 transition-transform"
                    />
                    <div className="text-[10px] font-semibold text-[#fdfbf7] truncate">
                      {photo.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
