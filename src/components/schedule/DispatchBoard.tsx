'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useFSMStore } from '@/lib/useStore';
import { Job, JobStatus } from '@/types';
import { NewJobModal } from './NewJobModal';
import { JobDetailModal } from './JobDetailModal';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Wrench, 
  MapPin, 
  Filter, 
  User, 
  CalendarDays,
  CalendarRange,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Smartphone,
  X,
  ExternalLink,
  Check
} from 'lucide-react';

interface DispatchBoardProps {
  initialClientId?: string;
  initialPropertyId?: string;
  initialSmsJobId?: string;
  initialEmergency?: boolean;
}

export const DispatchBoard: React.FC<DispatchBoardProps> = ({
  initialClientId,
  initialPropertyId,
  initialSmsJobId,
  initialEmergency = false,
}) => {
  const { jobs, properties, getTechnicians } = useFSMStore();
  const technicians = getTechnicians();

  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStatus, setSelectedStatus] = useState<JobStatus | 'all'>('all');
  const [selectedTech, setSelectedTech] = useState<string>('all');
  
  // Modals state
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [smsPreviewJob, setSmsPreviewJob] = useState<Job | null>(null);

  // Filter emergency jobs for high-priority dispatch tracking
  const emergencyJobs = useMemo(() => {
    return jobs.filter((j) => j.priority === 'emergency' && j.status !== 'canceled');
  }, [jobs]);

  // Auto-open new job modal or SMS modal if requested in URL
  useEffect(() => {
    if (initialClientId || initialEmergency) {
      setIsNewJobOpen(true);
    }
  }, [initialClientId, initialEmergency]);

  useEffect(() => {
    if (initialSmsJobId) {
      const match = jobs.find((j) => j.id === initialSmsJobId);
      if (match) setSmsPreviewJob(match);
    }
  }, [initialSmsJobId, jobs]);

  // Navigate dates
  const handlePrevDate = () => {
    const next = new Date(currentDate);
    if (calendarView === 'day') next.setDate(next.getDate() - 1);
    else if (calendarView === 'week') next.setDate(next.getDate() - 7);
    else next.setMonth(next.getMonth() - 1);
    setCurrentDate(next);
  };

  const handleNextDate = () => {
    const next = new Date(currentDate);
    if (calendarView === 'day') next.setDate(next.getDate() + 1);
    else if (calendarView === 'week') next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      if (selectedStatus !== 'all' && j.status !== selectedStatus) return false;
      if (selectedTech !== 'all' && j.assignedTechId !== selectedTech) return false;
      return true;
    });
  }, [jobs, selectedStatus, selectedTech]);

  const dateString = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const getStatusBadgeClass = (status: JobStatus) => {
    switch (status) {
      case 'in_progress':
        return 'bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/40';
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'canceled':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border border-slate-600/30';
    }
  };

  // Time slots for Day view swimlanes
  const timeSlots = [
    { label: '08:00 - 10:00 AM', start: '08:00', end: '10:00' },
    { label: '10:00 - 12:00 PM', start: '10:00', end: '12:00' },
    { label: '01:00 - 03:00 PM', start: '13:00', end: '15:00' },
    { label: '03:00 - 05:00 PM', start: '15:00', end: '17:00' },
  ];

  return (
    <div className="space-y-6 text-[#fdfbf7]">
      {/* Top Controls & Navigation Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111111] p-6 rounded-2xl border border-[#222222] shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#c5a059] font-bold uppercase tracking-wider mb-1">
            <CalendarIcon className="w-3.5 h-3.5 text-[#FF8A00]" />
            <span>Rome Dispatching & Work Orders</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-[#fdfbf7]">
            Scheduling & Dispatch Board
          </h1>
          <p className="text-xs text-[#b8b0a5] mt-1">
            Visual calendar grid, technician allocation, and status pipeline tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle: Day / Week / Month */}
          <div className="inline-flex rounded-xl border border-[#2a2a2a] p-1 bg-[#181818] text-xs font-semibold">
            <button
              onClick={() => setCalendarView('day')}
              className={`px-3 py-1.5 rounded-lg transition ${
                calendarView === 'day' ? 'bg-[#c5a059] text-black font-bold shadow-sm' : 'text-[#b8b0a5] hover:text-[#fdfbf7]'
              }`}
            >
              Day Swimlanes
            </button>
            <button
              onClick={() => setCalendarView('week')}
              className={`px-3 py-1.5 rounded-lg transition ${
                calendarView === 'week' ? 'bg-[#c5a059] text-black font-bold shadow-sm' : 'text-[#b8b0a5] hover:text-[#fdfbf7]'
              }`}
            >
              Weekly Grid
            </button>
            <button
              onClick={() => setCalendarView('month')}
              className={`px-3 py-1.5 rounded-lg transition ${
                calendarView === 'month' ? 'bg-[#c5a059] text-black font-bold shadow-sm' : 'text-[#b8b0a5] hover:text-[#fdfbf7]'
              }`}
            >
              Month Overview
            </button>
          </div>

          <button
            onClick={() => setIsNewJobOpen(true)}
            className="bg-[#c5a059] hover:bg-[#b38728] text-black font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Dispatch New Job</span>
          </button>
        </div>
      </div>

      {/* 🚨 Active 24/7 Emergency Alert Banner */}
      {emergencyJobs.length > 0 && (
        <div className="bg-gradient-to-r from-red-950 via-[#330c0c] to-red-950 border-2 border-red-500 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-red-950/80 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shrink-0 animate-pulse ring-4 ring-red-500/20">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping inline-block" />
                    🚨 Active 24/7 Emergency Dispatch Call
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white shadow-md">
                    {emergencyJobs.length} Live Work Order{emergencyJobs.length > 1 ? 's' : ''}
                  </span>
                  <span className="text-[10px] text-red-300 font-mono">
                    High Priority SLA: &lt; 60 Min Arrival
                  </span>
                </div>
                <div className="text-xs text-red-100 font-semibold mt-1 flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[#fdfbf7]">{emergencyJobs[0].jobNumber}: {emergencyJobs[0].title}</span>
                  <span className="text-red-500">•</span>
                  <span className="text-red-200/90 font-normal">{emergencyJobs[0].propertyAddress}</span>
                  <span className="text-red-500">•</span>
                  <span className="text-[#c5a059] font-bold">Tech: {emergencyJobs[0].assignedTechName || 'Rome On-Call Tech'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
              <button
                onClick={() => setSmsPreviewJob(emergencyJobs[0])}
                className="px-3.5 py-2 rounded-xl bg-red-900/70 hover:bg-red-800 border border-red-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md hover:scale-[1.02]"
              >
                <Smartphone className="w-4 h-4 text-red-300 animate-bounce" />
                <span>Twilio SMS Alert</span>
              </button>
              <button
                onClick={() => setSelectedJob(emergencyJobs[0])}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition shadow-lg shadow-red-950 flex items-center space-x-1 hover:scale-[1.02]"
              >
                <span>Manage Emergency</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Navigation & Status Filters Bar */}
      <div className="bg-[#111111] border border-[#222222] p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Date Navigator */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrevDate}
              className="p-1.5 rounded-lg bg-[#181818] border border-[#2a2a2a] text-[#b8b0a5] hover:text-[#fdfbf7] hover:bg-[#222222] transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 rounded-lg bg-[#181818] border border-[#2a2a2a] text-xs font-bold text-[#c5a059] hover:bg-[#222222] transition"
            >
              Today
            </button>
            <button
              onClick={handleNextDate}
              className="p-1.5 rounded-lg bg-[#181818] border border-[#2a2a2a] text-[#b8b0a5] hover:text-[#fdfbf7] hover:bg-[#222222] transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="font-bold text-sm text-[#fdfbf7] font-heading">{dateString}</span>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-[#78716c] uppercase tracking-wider">Status:</span>
          {(['all', 'in_progress', 'scheduled', 'completed', 'unscheduled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${
                selectedStatus === st
                  ? 'bg-[#c5a059] text-black font-extrabold'
                  : 'bg-[#181818] text-[#b8b0a5] border border-[#2a2a2a] hover:text-[#fdfbf7]'
              }`}
            >
              {st === 'all' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: DAY SWIMLANES VIEW (Housecall Pro Style) */}
      {calendarView === 'day' && (
        <div className="bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden shadow-xl">
          {/* Header Row */}
          <div className="grid grid-cols-12 bg-[#161616] border-b border-[#262626] text-xs font-bold text-[#b8b0a5] py-3.5 px-4">
            <div className="col-span-3 flex items-center space-x-1.5">
              <User className="w-4 h-4 text-[#c5a059]" />
              <span>Assigned Technician</span>
            </div>
            <div className="col-span-9 grid grid-cols-4 text-center">
              {timeSlots.map((ts) => (
                <div key={ts.label} className="text-[11px] font-mono text-[#b8b0a5]">
                  {ts.label}
                </div>
              ))}
            </div>
          </div>

          {/* Swimlanes for each technician */}
          <div className="divide-y divide-[#1e1e1e]">
            {technicians.map((tech) => {
              const techJobs = filteredJobs.filter((j) => j.assignedTechId === tech.uid);

              return (
                <div key={tech.uid} className="grid grid-cols-12 p-4 items-center hover:bg-[#141414] transition">
                  {/* Tech Profile Column */}
                  <div className="col-span-3 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#1e1e1e] border border-[#c5a059]/40 text-[#c5a059] flex items-center justify-center font-bold text-sm">
                      {tech.displayName.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#fdfbf7]">{tech.displayName}</div>
                      <div className="text-[11px] text-[#c5a059] flex items-center gap-1 font-medium">
                        <Wrench className="w-3 h-3 text-[#FF8A00]" />
                        <span>{techJobs.length} {techJobs.length === 1 ? 'Job' : 'Jobs'} Scheduled</span>
                      </div>
                    </div>
                  </div>

                  {/* Time Slot Columns */}
                  <div className="col-span-9 grid grid-cols-4 gap-3">
                    {timeSlots.map((slot, idx) => {
                      // Find if a job falls into this slot
                      const slotJob = techJobs.find((j) => {
                        const jobHour = parseInt(j.timeWindowStart.split(':')[0], 10);
                        const slotStartHour = parseInt(slot.start.split(':')[0], 10);
                        return Math.abs(jobHour - slotStartHour) <= 1;
                      });

                      if (slotJob) {
                        const isEmerg = slotJob.priority === 'emergency';
                        return (
                          <div
                            key={slot.label}
                            onClick={() => setSelectedJob(slotJob)}
                            className={`p-3 rounded-lg shadow-sm cursor-pointer transition space-y-1.5 ${
                              isEmerg
                                ? 'bg-gradient-to-br from-red-950 via-[#2f0e0e] to-[#1c0808] border-2 border-red-500 shadow-xl shadow-red-950/80 ring-2 ring-red-500/40 animate-pulse'
                                : 'bg-[#181818] border-l-4 border-[#FF8A00] hover:border-[#c5a059] hover:bg-[#202020]'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className={`font-mono text-[10px] font-bold ${isEmerg ? 'text-red-400 font-black' : 'text-[#c5a059]'}`}>
                                {isEmerg ? `🚨 ${slotJob.jobNumber}` : slotJob.jobNumber}
                              </span>
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                                isEmerg
                                  ? 'bg-red-600 text-white font-black shadow-sm'
                                  : getStatusBadgeClass(slotJob.status)
                              }`}>
                                {isEmerg ? '24/7 EMERGENCY' : slotJob.status.replace('_', ' ')}
                              </span>
                            </div>
                            <h4 className={`font-bold text-xs truncate ${isEmerg ? 'text-red-100 font-extrabold' : 'text-[#fdfbf7]'}`}>
                              {slotJob.title}
                            </h4>
                            <div className={`text-[11px] truncate ${isEmerg ? 'text-red-200/90 font-medium' : 'text-[#b8b0a5]'}`}>
                              {slotJob.clientName}
                            </div>
                            <div className={`text-[10px] flex items-center gap-1 truncate ${isEmerg ? 'text-red-300' : 'text-[#78716c]'}`}>
                              <MapPin className={`w-3 h-3 shrink-0 ${isEmerg ? 'text-red-400' : 'text-[#FF8A00]'}`} />
                              <span>{slotJob.propertyAddress}</span>
                            </div>
                            {isEmerg && (
                              <div className="pt-1.5 border-t border-red-900/60 flex items-center justify-between">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping inline-block" />
                                  <span>Twilio Dispatched</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSmsPreviewJob(slotJob);
                                  }}
                                  className="text-[9px] bg-red-600 hover:bg-red-500 text-white px-2 py-0.5 rounded font-black uppercase tracking-wider transition flex items-center gap-1 shadow-md hover:scale-105"
                                >
                                  <Smartphone className="w-2.5 h-2.5" />
                                  <span>SMS View</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={slot.label}
                          onClick={() => setIsNewJobOpen(true)}
                          className="border border-dashed border-[#262626] hover:border-[#c5a059]/40 hover:bg-[#161616] rounded-lg p-3 flex flex-col items-center justify-center text-[#78716c] text-[11px] cursor-pointer transition min-h-[90px]"
                        >
                          <span>+ Dispatch</span>
                          <span className="text-[9px] text-[#555]">{slot.start} - {slot.end}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Unassigned & Unscheduled Maintenance Queue Swimlane */}
            {filteredJobs.filter(j => !j.assignedTechId || j.status === 'unscheduled').length > 0 && (
              <div className="grid grid-cols-12 p-4 items-center bg-[#1a1414] hover:bg-[#201818] transition border-t border-red-950/60">
                <div className="col-span-3 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-amber-950/60 border border-amber-600 text-amber-400 flex items-center justify-center font-bold text-xs">
                    ⏳
                  </div>
                  <div>
                    <div className="font-bold text-sm text-amber-300">Unscheduled & PM Queue</div>
                    <div className="text-[11px] text-amber-400/80">Awaiting technician allocation</div>
                  </div>
                </div>
                <div className="col-span-9 grid grid-cols-4 gap-3">
                  {filteredJobs.filter(j => !j.assignedTechId || j.status === 'unscheduled').map((job) => {
                    const isEmerg = job.priority === 'emergency';
                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className={`p-3 rounded-lg shadow-sm cursor-pointer transition space-y-1.5 ${
                          isEmerg
                            ? 'bg-gradient-to-br from-red-950 via-[#2f0e0e] to-[#1c0808] border-2 border-red-500 shadow-lg shadow-red-950/80 ring-2 ring-red-500/40 animate-pulse'
                            : 'bg-[#181818] border-l-4 border-amber-500 hover:bg-[#222222]'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`font-mono text-[10px] font-bold ${isEmerg ? 'text-red-400' : 'text-amber-400'}`}>
                            {job.jobNumber}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            isEmerg
                              ? 'bg-red-600 text-white font-black'
                              : 'bg-amber-900/40 text-amber-300'
                          }`}>
                            {isEmerg ? '🚨 EMERGENCY' : (job.title.includes('Preventative') ? 'AUTO PM' : 'UNSCHEDULED')}
                          </span>
                        </div>
                        <h4 className={`font-bold text-xs truncate ${isEmerg ? 'text-red-100' : 'text-[#fdfbf7]'}`}>
                          {job.title}
                        </h4>
                        <div className={`text-[11px] truncate ${isEmerg ? 'text-red-300' : 'text-[#b8b0a5]'}`}>
                          {job.clientName}
                        </div>
                        {isEmerg && (
                          <div className="pt-1 border-t border-red-900/60 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSmsPreviewJob(job);
                              }}
                              className="text-[9px] bg-red-600 hover:bg-red-500 text-white px-2 py-0.5 rounded font-bold uppercase transition"
                            >
                              SMS Alert
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: WEEKLY GRID VIEW */}
      {calendarView === 'week' && (
        <div className="bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden shadow-xl p-4">
          <div className="grid grid-cols-7 gap-3 text-center mb-3">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
              <div key={day} className="bg-[#181818] p-2.5 rounded-lg border border-[#262626] font-bold text-xs text-[#c5a059]">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-3 min-h-[400px]">
            {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
              // Sample distribute jobs across days of week for demo
              const dayJobs = filteredJobs.filter((_, idx) => (idx % 7) === dayIdx || (dayIdx === 3 && idx < 3));

              return (
                <div key={dayIdx} className="bg-[#161616] border border-[#262626] rounded-xl p-2.5 space-y-2 flex flex-col justify-start">
                  <div className="text-[11px] font-mono text-[#78716c] pb-1 border-b border-[#222222] flex justify-between">
                    <span>Day {dayIdx + 1}</span>
                    <span className="text-[#c5a059] font-bold">{dayJobs.length}</span>
                  </div>

                  {dayJobs.map((job) => {
                    const isEmerg = job.priority === 'emergency';
                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className={`p-2 rounded text-left cursor-pointer transition space-y-1 ${
                          isEmerg
                            ? 'bg-[#2b0c0c] border-l-2 border-red-500 hover:border-red-400 shadow-md shadow-red-950/50'
                            : 'bg-[#1c1c1c] border-l-2 border-[#FF8A00] hover:border-[#c5a059] hover:bg-[#252525]'
                        }`}
                      >
                        <div className={`text-[10px] font-bold truncate ${isEmerg ? 'text-red-200' : 'text-[#fdfbf7]'}`}>
                          {isEmerg ? `🚨 ${job.title}` : job.title}
                        </div>
                        <div className={`text-[9px] truncate ${isEmerg ? 'text-red-300/80' : 'text-[#b8b0a5]'}`}>
                          {job.clientName}
                        </div>
                        <div className={`text-[9px] font-mono flex items-center justify-between ${isEmerg ? 'text-red-400' : 'text-[#c5a059]'}`}>
                          <span>{job.timeWindowStart}</span>
                          {isEmerg && <span className="text-[8px] bg-red-600 text-white px-1 rounded uppercase font-black">24/7</span>}
                        </div>
                      </div>
                    );
                  })}

                  <button
                    onClick={() => setIsNewJobOpen(true)}
                    className="w-full mt-auto py-1 text-[10px] text-[#78716c] hover:text-[#c5a059] hover:bg-[#1a1a1a] rounded transition"
                  >
                    + Add
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: MONTHLY OVERVIEW */}
      {calendarView === 'month' && (
        <div className="bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-base text-[#fdfbf7] font-heading">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <span className="text-xs text-[#b8b0a5]">{filteredJobs.length} Total Work Orders in System</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="font-bold text-[#78716c] py-2">{d}</div>
            ))}

            {Array.from({ length: 31 }, (_, i) => i + 1).map((dayNum) => {
              const dayJobs = filteredJobs.filter((_, idx) => (idx * 5 + 3) % 31 === dayNum % 31);
              const isToday = dayNum === new Date().getDate();
              const hasEmergency = dayJobs.some(j => j.priority === 'emergency');

              return (
                <div
                  key={dayNum}
                  onClick={() => setIsNewJobOpen(true)}
                  className={`min-h-[75px] p-2 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                    hasEmergency
                      ? 'bg-[#240c0c] border-red-500/80 shadow-md shadow-red-950/60 ring-1 ring-red-500/30'
                      : isToday
                      ? 'bg-[#1e1e1e] border-[#c5a059] ring-1 ring-[#c5a059]/40'
                      : 'bg-[#161616] border-[#262626] hover:border-[#333333]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-mono font-bold ${hasEmergency ? 'text-red-400' : isToday ? 'text-[#c5a059]' : 'text-[#b8b0a5]'}`}>
                      {dayNum}
                    </span>
                    {dayJobs.length > 0 && (
                      <span className={`w-2 h-2 rounded-full ${hasEmergency ? 'bg-red-500 animate-ping' : 'bg-[#FF8A00]'}`}></span>
                    )}
                  </div>

                  {dayJobs.length > 0 && (
                    <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded truncate ${
                      hasEmergency ? 'bg-red-900/60 text-red-200' : 'bg-[#222222] text-[#c5a059]'
                    }`}>
                      {hasEmergency ? '🚨 24/7 Job' : `${dayJobs.length} ${dayJobs.length === 1 ? 'Job' : 'Jobs'}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Job Dispatch Modal */}
      <NewJobModal
        isOpen={isNewJobOpen}
        onClose={() => setIsNewJobOpen(false)}
        preselectedClientId={initialClientId}
        preselectedPropertyId={initialPropertyId}
        initialIsEmergency={initialEmergency}
        onSuccess={(jobId) => {
          const created = jobs.find((j) => j.id === jobId);
          if (created) setSelectedJob(created);
        }}
      />

      {/* Job Details & Status Management Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
      />

      {/* Twilio SMS Simulation Modal */}
      {smsPreviewJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#100c0c] text-[#fdfbf7] rounded-3xl shadow-2xl max-w-lg w-full border-2 border-red-500 shadow-red-950/80 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-red-950 via-[#360e0e] to-red-950 p-5 border-b border-red-800/60 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg animate-pulse">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-white uppercase tracking-wider font-heading">
                      24/7 Emergency Dispatch Alert
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-red-600 text-white animate-pulse">
                      Twilio Verified
                    </span>
                  </div>
                  <p className="text-xs text-red-200/80">Carrier Delivery Gateway & SMS Dispatch Telemetry</p>
                </div>
              </div>
              <button
                onClick={() => setSmsPreviewJob(null)}
                className="text-red-300 hover:text-white p-1 rounded-lg hover:bg-red-900/40 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Twilio Carrier Delivery Telemetry Bar */}
              <div className="bg-[#181010] border border-red-900/50 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-mono text-emerald-400 font-bold">HTTP 200 OK</span>
                  <span className="text-[#a8a095]">|</span>
                  <span className="text-[#c8c0b5] font-mono text-[11px]">SID: SM{smsPreviewJob.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16).padEnd(16, '0')}</span>
                </div>
                <span className="text-[11px] text-red-400 font-bold bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">
                  Carrier: Verizon FirstNet
                </span>
              </div>

              {/* Recipient Details */}
              <div className="bg-[#161616] p-3.5 rounded-xl border border-[#2a2a2a] text-xs space-y-1">
                <div className="flex justify-between text-[#b8b0a5]">
                  <span>Dispatched Field Tech:</span>
                  <span className="text-white font-bold">{smsPreviewJob.assignedTechName || 'Rome On-Call Tech'}</span>
                </div>
                <div className="flex justify-between text-[#b8b0a5]">
                  <span>Direct Mobile Number:</span>
                  <span className="text-[#c5a059] font-mono">
                    {technicians.find(t => t.uid === smsPreviewJob.assignedTechId)?.phone || '(706) 844-8193'}
                  </span>
                </div>
                <div className="flex justify-between text-[#b8b0a5]">
                  <span>Priority Routing:</span>
                  <span className="text-red-400 font-bold uppercase tracking-wider text-[10px]">
                    24/7 On-Call Emergency Escalation
                  </span>
                </div>
              </div>

              {/* Realistic Smartphone Preview */}
              <div className="bg-[#050505] rounded-2xl border-4 border-[#333333] shadow-2xl p-4 space-y-3">
                {/* Phone Status Header */}
                <div className="flex items-center justify-between text-[10px] text-[#78716c] pb-2 border-b border-[#222222]">
                  <div className="flex items-center space-x-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-red-400" />
                    <span className="font-bold text-[#b8b0a5]">Messages</span>
                  </div>
                  <span>+1 (706) 555-0199 • Nailed It Dispatch</span>
                  <span className="font-mono text-emerald-400 font-bold">5G LTE</span>
                </div>

                {/* SMS Speech Bubble */}
                <div className="bg-gradient-to-br from-[#2b0c0c] to-[#1a0808] border border-red-600/60 rounded-2xl rounded-tl-sm p-4 text-xs space-y-2.5 shadow-lg">
                  <div className="flex items-center space-x-2 text-red-400 font-extrabold text-[11px] uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
                    <span>🚨 24/7 EMERGENCY WORK ORDER DISPATCH</span>
                  </div>

                  <div className="space-y-1 text-white font-mono text-[11px] leading-relaxed">
                    <div><span className="text-[#a8a095]">WORK ORDER:</span> <span className="font-bold text-[#c5a059]">{smsPreviewJob.jobNumber}</span></div>
                    <div><span className="text-[#a8a095]">CLIENT:</span> <span className="font-bold">{smsPreviewJob.clientName}</span></div>
                    <div><span className="text-[#a8a095]">LOCATION:</span> <span className="font-bold text-amber-200">{smsPreviewJob.propertyAddress}</span></div>
                    <div><span className="text-[#a8a095]">EMERGENCY ISSUE:</span> <span className="font-bold text-red-300">{smsPreviewJob.title}</span></div>
                    {smsPreviewJob.description && (
                      <div><span className="text-[#a8a095]">SCOPE:</span> <span>{smsPreviewJob.description}</span></div>
                    )}
                    <div>
                      <span className="text-[#a8a095]">ACCESS:</span>{' '}
                      <span className="font-bold text-emerald-400">
                        {properties.find(p => p.id === smsPreviewJob.propertyId)?.gateCode 
                          ? `Gate Code: ${properties.find(p => p.id === smsPreviewJob.propertyId)?.gateCode}`
                          : 'Standard lockbox / Tenant verified on site'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-red-900/60 text-[10px] space-y-1 text-red-200">
                    <div className="font-bold text-[#c5a059] flex items-center gap-1">
                      <span>📲 DIRECT MOBILE TECH DISPATCH PORTAL:</span>
                    </div>
                    <div className="underline text-blue-400 font-mono break-all">
                      https://fsm.naileditpropertysolutions.com/mobile/tech?job={smsPreviewJob.id}
                    </div>
                    <div className="text-[#a8a095] italic text-[9px] pt-1">
                      Reply &quot;ACK&quot; to confirm on-site transit.
                    </div>
                  </div>
                </div>

                <div className="text-right text-[10px] text-[#78716c] flex items-center justify-end space-x-1">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Delivered</span>
                  <span>• Twilio Handshake Confirmed</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={`/mobile/tech?job=${smsPreviewJob.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#222222] hover:bg-[#2e2e2e] text-[#fdfbf7] text-xs font-bold text-center border border-[#3a3a3a] flex items-center justify-center space-x-1.5 transition"
                >
                  <span>Launch Tech Mobile Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#c5a059]" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const j = smsPreviewJob;
                    setSmsPreviewJob(null);
                    setSelectedJob(j);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-black uppercase tracking-wider text-center shadow-lg shadow-red-950/80 flex items-center justify-center space-x-1.5 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Open Work Order Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
