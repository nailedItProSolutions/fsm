'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Job, JobPriority, JobStatus } from '@/types';
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
  ShieldCheck,
  Trash2,
  Edit3,
  Receipt,
  Gavel
} from 'lucide-react';
import { ActivityHistoryFeed } from '@/components/audit/ActivityHistoryFeed';
import { DeleteWithPinModal } from '@/components/common/DeleteWithPinModal';
import { CancellationAgreementModal } from '@/components/estimates/CancellationAgreementModal';

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
  const { updateJobStatus, updateJob, toggleChecklistItem, technicians, deleteJob, addInvoice, estimates } = useFSMStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAssignedTechId, setEditAssignedTechId] = useState('');
  const [editScheduledDate, setEditScheduledDate] = useState('');
  const [editTimeWindowStart, setEditTimeWindowStart] = useState('');
  const [editTimeWindowEnd, setEditTimeWindowEnd] = useState('');
  const [editPriority, setEditPriority] = useState<JobPriority>('medium');
  const [editTotalAmount, setEditTotalAmount] = useState('0');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    if (job) {
      setEditTitle(job.title || '');
      setEditDescription(job.description || '');
      setEditAssignedTechId(job.assignedTechId || '');
      setEditScheduledDate(job.scheduledDate || '');
      setEditTimeWindowStart(job.timeWindowStart || '09:00');
      setEditTimeWindowEnd(job.timeWindowEnd || '11:30');
      setEditPriority(job.priority || 'medium');
      setEditTotalAmount((job.totalAmount ?? 0).toString());
      setEditNotes(job.notes || '');
      setIsEditing(false);
    }
  }, [job]);

  if (!isOpen || !job) return null;

  const handleStatusChange = (newStatus: JobStatus) => {
    updateJobStatus(job.id, newStatus);
  };

  const handleSaveEdits = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTech = technicians.find((t) => t.uid === editAssignedTechId);
    updateJob(job.id, {
      title: editTitle.trim() || job.title,
      description: editDescription,
      assignedTechId: editAssignedTechId || undefined,
      assignedTechName: selectedTech ? selectedTech.displayName : 'Unassigned',
      scheduledDate: editScheduledDate,
      timeWindowStart: editTimeWindowStart,
      timeWindowEnd: editTimeWindowEnd,
      priority: editPriority,
      totalAmount: parseFloat(editTotalAmount) || 0,
      notes: editNotes,
    });
    setIsEditing(false);
  };

  const handleGenerateInvoice = () => {
    const subtotal = Math.round((job.totalAmount || 0) * 100) / 100;
    const taxRate = 0.07;
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const createdInvoice = addInvoice({
      jobId: job.id,
      jobNumber: job.jobNumber,
      clientId: job.clientId,
      clientName: job.clientName,
      propertyId: job.propertyId,
      propertyAddress: job.propertyAddress,
      items: [
        {
          id: `inv-item-${Date.now()}`,
          description: `${job.title}${job.description ? ` — ${job.description}` : ''}`,
          quantity: 1,
          unitPrice: subtotal,
          total: subtotal,
        },
      ],
      subtotal,
      tax,
      taxRate,
      total,
      amountPaid: 0,
      balanceDue: total,
      status: 'sent',
      dueDate,
    });

    updateJob(job.id, { invoiceId: createdInvoice.id });
  };

  const handleConfirmDelete = async (authorizingUser: any) => {
    deleteJob(job.id, authorizingUser);
    setIsDeleteModalOpen(false);
    onClose();
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
      <div className="bg-[#111111] text-[#fdfbf7] rounded-2xl shadow-2xl max-w-3xl w-full border border-[#2a2a2a] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
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
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center space-x-1.5 ${
                isEditing
                  ? 'bg-[#c5a059] text-black border-[#c5a059]'
                  : 'bg-[#222222] text-[#c5a059] border-[#c5a059]/40 hover:bg-[#2a2a2a]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit / Reschedule'}</span>
            </button>
            <button 
              onClick={onClose}
              className="text-[#78716c] hover:text-[#fdfbf7] p-1 rounded-lg hover:bg-[#222222] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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

          {isEditing ? (
            <form onSubmit={handleSaveEdits} className="bg-[#161616] p-4 rounded-xl border border-[#c5a059]/40 space-y-4">
              <div className="flex items-center justify-between border-b border-[#262626] pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#c5a059]">
                  Edit / Reschedule Work Order
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#b8b0a5] mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#b8b0a5] mb-1">Scope Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#b8b0a5] mb-1">Assigned Technician</label>
                  <select
                    value={editAssignedTechId}
                    onChange={(e) => setEditAssignedTechId(e.target.value)}
                    className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="">Unassigned</option>
                    {technicians.map((t) => (
                      <option key={t.uid} value={t.uid}>
                        {t.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#b8b0a5] mb-1">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as JobPriority)}
                    className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#b8b0a5] mb-1">Total Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editTotalAmount}
                    onChange={(e) => setEditTotalAmount(e.target.value)}
                    className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] font-mono focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#b8b0a5] mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={editScheduledDate}
                    onChange={(e) => setEditScheduledDate(e.target.value)}
                    className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#b8b0a5] mb-1">Window Start</label>
                  <input
                    type="time"
                    value={editTimeWindowStart}
                    onChange={(e) => setEditTimeWindowStart(e.target.value)}
                    className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#b8b0a5] mb-1">Window End</label>
                  <input
                    type="time"
                    value={editTimeWindowEnd}
                    onChange={(e) => setEditTimeWindowEnd(e.target.value)}
                    className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#b8b0a5] mb-1">Internal Dispatcher Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#333333] text-xs font-bold text-[#b8b0a5] hover:bg-[#222222]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#c5a059] hover:bg-[#b38728] text-black text-xs font-bold transition flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <>
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

              {/* Notes */}
              {job.notes && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#78716c] mb-1">
                    Internal Notes
                  </label>
                  <div className="bg-[#181818] p-3 rounded-lg border border-[#262626] text-[#b8b0a5] leading-relaxed whitespace-pre-wrap">
                    {job.notes}
                  </div>
                </div>
              )}
            </>
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

          {/* Activity History & Audit Trail */}
          <div className="pt-3 border-t border-[#262626]">
            <ActivityHistoryFeed
              entityType="job"
              entityId={job.id}
              title="Job Audit Trail & Change Log"
              compact={true}
              maxItems={10}
            />
          </div>

          {/* Value, Delete & Actions */}
          <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-[#222222]">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-2.5 py-1.5 rounded-lg border border-red-800/40 bg-red-950/20 text-red-400 hover:bg-red-900/30 text-xs font-semibold transition flex items-center space-x-1"
                title="Permanently Delete Job (Requires Employee PIN)"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Delete Job</span>
              </button>
              <div className="text-xs text-[#b8b0a5]">
                Total Value: <span className="font-mono font-bold text-[#c5a059]">${(job.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {(() => {
                const linkedEst = estimates.find(
                  (e) => e.id === job.estimateId || e.convertedToJobId === job.id
                );
                const cncId = job.cancellationAgreementId || linkedEst?.cancellationAgreementId;
                if (cncId) {
                  return (
                    <Link
                      href={`/cancellation/${cncId}`}
                      target="_blank"
                      className="bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-700/60 font-bold px-3 py-2 rounded-lg text-xs transition flex items-center space-x-1.5"
                    >
                      <Gavel className="w-3.5 h-3.5 text-rose-400" />
                      <span>Cancellation Agreement</span>
                    </Link>
                  );
                }
                if (linkedEst) {
                  return (
                    <button
                      type="button"
                      onClick={() => setIsCancelModalOpen(true)}
                      className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 font-bold px-3 py-2 rounded-lg text-xs transition flex items-center space-x-1.5"
                      title="Issue Rome, Floyd County, GA Mid-Job Stop-Work & Cancellation Agreement"
                    >
                      <Gavel className="w-3.5 h-3.5 text-rose-400" />
                      <span>Mid-Job Stop-Work / Cancel</span>
                    </button>
                  );
                }
                return null;
              })()}

              {!job.invoiceId ? (
                <button
                  type="button"
                  onClick={handleGenerateInvoice}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-lg text-xs transition flex items-center space-x-1.5 shadow"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Generate Invoice</span>
                </button>
              ) : (
                <Link
                  href="/dashboard/invoices"
                  className="bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#c5a059] border border-[#c5a059]/40 font-bold px-3.5 py-2 rounded-lg text-xs transition flex items-center space-x-1.5"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>View Invoice</span>
                </Link>
              )}

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

      {/* Delete Job Modal with Employee PIN Verification */}
      {isDeleteModalOpen && (
        <DeleteWithPinModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Work Order / Job"
          itemName={`Job ${job.jobNumber} (${job.title})`}
          itemType="job"
          targetId={job.id}
          warningMessage={`Permanently deleting Job ${job.jobNumber} will remove it from the dispatch board and schedule. This action requires verified employee PIN confirmation.`}
        />
      )}

      {/* Mid-Job Georgia Service Contract Cancellation & Stop-Work Agreement Modal */}
      {isCancelModalOpen && (() => {
        const linkedEst = estimates.find(
          (e) => e.id === job.estimateId || e.convertedToJobId === job.id
        );
        if (!linkedEst) return null;
        return (
          <CancellationAgreementModal
            isOpen={isCancelModalOpen}
            onClose={() => setIsCancelModalOpen(false)}
            estimate={linkedEst}
            job={job}
          />
        );
      })()}
    </div>
  );
};
