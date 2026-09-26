'use client';

import React, { useState } from 'react';
import { Job, JobStatus } from '@/types';
import { useFSMStore } from '@/lib/useStore';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  DollarSign,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
}) => {
  const { updateJobStatus, toggleChecklistItem, getTechnicians } = useFSMStore();
  const technicians = getTechnicians();

  if (!isOpen || !job) return null;

  const handleStatusChange = (newStatus: JobStatus) => {
    updateJobStatus(job.id, newStatus);
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'in_progress':
        return 'bg-[#FF8A00] text-black font-bold';
      case 'scheduled':
        return 'bg-blue-600 text-white font-bold';
      case 'completed':
        return 'bg-emerald-600 text-white font-bold';
      case 'canceled':
        return 'bg-red-600 text-white font-bold';
      default:
        return 'bg-slate-700 text-slate-200 font-bold';
    }
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.propertyAddress)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#111111] text-[#fdfbf7] rounded-2xl shadow-2xl max-w-xl w-full border border-[#2a2a2a] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#181818] p-5 border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold text-[#c5a059] bg-[#1f1f1f] px-2.5 py-1 rounded border border-[#c5a059]/20">
              {job.jobNumber}
            </span>
            <div>
              <h3 className="font-bold text-sm text-[#fdfbf7] font-heading">{job.title}</h3>
              <p className="text-xs text-[#b8b0a5]">{job.clientName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#78716c] hover:text-[#fdfbf7] p-1 rounded-lg hover:bg-[#222222] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Status Pipeline Switcher */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#78716c] mb-2">
              Update Job Dispatch Status
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 bg-[#181818] p-1.5 rounded-xl border border-[#2a2a2a]">
              {(['unscheduled', 'scheduled', 'in_progress', 'completed', 'canceled'] as JobStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                    job.status === st
                      ? getStatusColor(st)
                      : 'text-[#b8b0a5] hover:text-[#fdfbf7] hover:bg-[#222222]'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 bg-[#161616] p-4 rounded-xl border border-[#262626]">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#78716c]">Assigned Technician</span>
              <div className="font-bold text-xs text-[#fdfbf7] mt-0.5 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#FF8A00]" />
                <span>{job.assignedTechName || 'Unassigned'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#78716c]">Scheduled Window</span>
              <div className="font-bold text-xs text-[#fdfbf7] mt-0.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>{job.scheduledDate} ({job.timeWindowStart} - {job.timeWindowEnd})</span>
              </div>
            </div>

            <div className="col-span-2 pt-2 border-t border-[#262626] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#78716c]">Service Address</span>
                <div className="font-semibold text-xs text-[#fdfbf7] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF8A00]" />
                  <span>{job.propertyAddress}</span>
                </div>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#222222] hover:bg-[#333333] text-[#c5a059] px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
              >
                <span>GPS Directions</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Scope of Work */}
          {job.description && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#78716c] mb-1">
                Scope Description
              </label>
              <div className="bg-[#181818] p-3 rounded-lg border border-[#262626] text-[#b8b0a5] leading-relaxed">
                {job.description}
              </div>
            </div>
          )}

          {/* Interactive Work Order Checklist */}
          {job.checklist && job.checklist.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#78716c]">
                  Work Order Checklist
                </label>
                <span className="text-[11px] font-bold text-[#c5a059]">
                  {job.checklist.filter(c => c.done).length} / {job.checklist.length} Completed
                </span>
              </div>

              <div className="space-y-2 bg-[#161616] p-3 rounded-xl border border-[#262626]">
                {job.checklist.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center space-x-2.5 cursor-pointer p-1.5 hover:bg-[#202020] rounded-lg transition"
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => toggleChecklistItem(job.id, item.id)}
                      className="rounded bg-[#1a1a1a] border-[#333333] text-[#FF8A00] focus:ring-[#FF8A00] w-4 h-4"
                    />
                    <span className={`text-xs ${item.done ? 'line-through text-[#78716c]' : 'text-[#fdfbf7]'}`}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Value & Notes */}
          <div className="flex justify-between items-center pt-2 border-t border-[#222222]">
            <div className="text-xs text-[#b8b0a5]">
              Total Value: <span className="font-mono font-bold text-[#c5a059]">${(job.totalAmount || 0).toFixed(2)}</span>
            </div>
            <button
              onClick={onClose}
              className="bg-[#c5a059] hover:bg-[#b38728] text-black font-bold px-4 py-2 rounded-lg text-xs transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
