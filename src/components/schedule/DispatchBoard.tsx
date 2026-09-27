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
  CheckCircle2
} from 'lucide-react';

interface DispatchBoardProps {
  initialClientId?: string;
  initialPropertyId?: string;
}

export const DispatchBoard: React.FC<DispatchBoardProps> = ({
  initialClientId,
  initialPropertyId,
}) => {
  const { jobs, getTechnicians } = useFSMStore();
  const technicians = getTechnicians();

  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStatus, setSelectedStatus] = useState<JobStatus | 'all'>('all');
  const [selectedTech, setSelectedTech] = useState<string>('all');
  
  // Modals state
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // If initialClientId was passed in query, open modal automatically if user intends
  useEffect(() => {
    if (initialClientId) {
      setIsNewJobOpen(true);
    }
  }, [initialClientId]);

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
                        return (
                          <div
                            key={slot.label}
                            onClick={() => setSelectedJob(slotJob)}
                            className="bg-[#181818] border-l-4 border-[#FF8A00] p-3 rounded-lg shadow-sm hover:border-[#c5a059] hover:bg-[#202020] cursor-pointer transition space-y-1.5"
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-mono text-[10px] font-bold text-[#c5a059]">
                                {slotJob.jobNumber}
                              </span>
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${getStatusBadgeClass(slotJob.status)}`}>
                                {slotJob.status.replace('_', ' ')}
                              </span>
                            </div>
                            <h4 className="font-bold text-xs text-[#fdfbf7] truncate">{slotJob.title}</h4>
                            <div className="text-[11px] text-[#b8b0a5] truncate">{slotJob.clientName}</div>
                            <div className="text-[10px] text-[#78716c] flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-[#FF8A00]" />
                              <span>{slotJob.propertyAddress}</span>
                            </div>
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
                  {filteredJobs.filter(j => !j.assignedTechId || j.status === 'unscheduled').map((job) => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className="bg-[#181818] border-l-4 border-amber-500 p-3 rounded-lg shadow-sm hover:bg-[#222222] cursor-pointer transition space-y-1"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-[10px] font-bold text-amber-400">{job.jobNumber}</span>
                        <span className="text-[9px] bg-amber-900/40 text-amber-300 px-1.5 py-0.5 rounded font-bold uppercase">
                          {job.title.includes('Preventative') ? 'AUTO PM' : 'UNSCHEDULED'}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-[#fdfbf7] truncate">{job.title}</h4>
                      <div className="text-[11px] text-[#b8b0a5] truncate">{job.clientName}</div>
                    </div>
                  ))}
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

                  {dayJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className="bg-[#1c1c1c] border-l-2 border-[#FF8A00] p-2 rounded text-left hover:border-[#c5a059] hover:bg-[#252525] cursor-pointer transition space-y-1"
                    >
                      <div className="text-[10px] font-bold text-[#fdfbf7] truncate">{job.title}</div>
                      <div className="text-[9px] text-[#b8b0a5] truncate">{job.clientName}</div>
                      <div className="text-[9px] font-mono text-[#c5a059]">{job.timeWindowStart}</div>
                    </div>
                  ))}

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

              return (
                <div
                  key={dayNum}
                  onClick={() => setIsNewJobOpen(true)}
                  className={`min-h-[75px] p-2 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                    isToday
                      ? 'bg-[#1e1e1e] border-[#c5a059] ring-1 ring-[#c5a059]/40'
                      : 'bg-[#161616] border-[#262626] hover:border-[#333333]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-mono font-bold ${isToday ? 'text-[#c5a059]' : 'text-[#b8b0a5]'}`}>
                      {dayNum}
                    </span>
                    {dayJobs.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-[#FF8A00]"></span>
                    )}
                  </div>

                  {dayJobs.length > 0 && (
                    <div className="text-[10px] bg-[#222222] text-[#c5a059] font-bold px-1.5 py-0.5 rounded truncate">
                      {dayJobs.length} {dayJobs.length === 1 ? 'Job' : 'Jobs'}
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
    </div>
  );
};
