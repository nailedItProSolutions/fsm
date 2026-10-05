'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Trash2, 
  ShieldAlert, 
  KeyRound, 
  AlertCircle, 
  X, 
  Eye, 
  EyeOff, 
  Lock,
  UserCheck
} from 'lucide-react';
import { useFSMStore } from '@/lib/useStore';
import { useAuth } from '@/lib/authContext';
import { UserProfile } from '@/types';

interface DeleteWithPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (authorizingUser: UserProfile) => void | Promise<void>;
  title?: string;
  itemName: string;
  itemType?: 'estimate' | 'agreement' | 'invoice' | 'technician' | 'job' | 'record' | 'client history';
  warningMessage?: string;
  targetId?: string;
}

export const DeleteWithPinModal: React.FC<DeleteWithPinModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Permanent Deletion',
  itemName,
  itemType = 'record',
  warningMessage,
  targetId,
}) => {
  const { getUsers, verifyEmployeePin } = useFSMStore();
  const { user: currentAuthUser } = useAuth();

  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const pinInputRef = useRef<HTMLInputElement>(null);

  // Filter all active staff users (admins, dispatchers, technicians with active !== false)
  const allUsers = getUsers ? getUsers() : [];
  const activeStaff = allUsers.filter(
    (u) => (u.role === 'admin' || u.role === 'technician' || u.role === 'dispatcher') && u.active !== false
  );

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setShowPin(false);
      setError(null);
      setIsSubmitting(false);

      // Default to current logged-in user if they are staff
      if (currentAuthUser && currentAuthUser.employeeId && currentAuthUser.role !== 'client') {
        setSelectedEmpId(currentAuthUser.employeeId);
      } else if (activeStaff.length > 0) {
        // Fallback to first active staff (Charles Willis if present)
        const charles = activeStaff.find((u) => u.employeeId === '1014958');
        setSelectedEmpId(charles ? charles.employeeId! : activeStaff[0].employeeId || '');
      }

      // Auto-focus PIN field
      setTimeout(() => {
        pinInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, currentAuthUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const cleanPin = pin.trim();
    if (!cleanPin) {
      setError('Please enter your employee security PIN.');
      pinInputRef.current?.focus();
      return;
    }

    // Verify PIN against chosen employee or across active staff
    const authorizingUser = verifyEmployeePin(cleanPin, selectedEmpId || undefined);

    if (!authorizingUser) {
      setError('Invalid security PIN. Please verify your employee ID and PIN, then try again.');
      pinInputRef.current?.focus();
      return;
    }

    // Protection rule: If attempting to delete Charles Willis
    if (
      itemType === 'technician' &&
      (targetId === 'user-tech-1' || itemName.toLowerCase().includes('charles willis'))
    ) {
      setError('Primary technician Charles Willis (Employee ID: 1014958) is system-protected and cannot be deleted.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(authorizingUser);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to process deletion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getItemTypeBadge = () => {
    switch (itemType) {
      case 'estimate':
        return <span className="bg-amber-950/60 text-amber-400 border border-amber-800/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">Estimate Record</span>;
      case 'agreement':
        return <span className="bg-[#1a1813] text-[#c5a059] border border-[#c5a059]/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">Work Agreement</span>;
      case 'invoice':
        return <span className="bg-purple-950/60 text-purple-400 border border-purple-800/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">Invoice Record</span>;
      case 'technician':
        return <span className="bg-blue-950/60 text-blue-400 border border-blue-800/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">Technician Profile</span>;
      case 'job':
        return <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">Job / Work Order</span>;
      default:
        return <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">System Record</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-[#111111] text-[#fdfbf7] rounded-2xl shadow-2xl max-w-md w-full border border-red-900/40 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-5"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 text-red-400">
            <div className="w-11 h-11 rounded-xl bg-red-950/70 border border-red-800/60 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-[#c5a059] font-bold uppercase tracking-wider">
                <Lock className="w-3 h-3 text-[#c5a059]" />
                <span>Security PIN Verification</span>
              </div>
              <h3 className="font-bold text-base text-[#fdfbf7]">{title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-[#78716c] hover:text-[#fdfbf7] p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Item Callout */}
        <div className="bg-[#161616] border border-[#262626] rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#78716c] font-semibold">Target Item:</span>
            {getItemTypeBadge()}
          </div>
          <div className="font-bold text-sm text-[#fdfbf7] break-words">
            {itemName}
          </div>
          <p className="text-[11px] text-[#b8b0a5] leading-relaxed">
            {warningMessage || 'This record will be permanently deleted from local and cloud databases. This action is irreversible and will be logged in the company audit trail.'}
          </p>
        </div>

        {/* PIN Authorization Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Authorizing Employee Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b8b0a5] mb-1.5">
              Authorizing Staff Member
            </label>
            <div className="relative">
              <select
                value={selectedEmpId}
                onChange={(e) => {
                  setSelectedEmpId(e.target.value);
                  setError(null);
                }}
                disabled={isSubmitting}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl px-3.5 py-2.5 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059] appearance-none"
              >
                {activeStaff.map((u) => (
                  <option key={u.uid} value={u.employeeId || u.uid}>
                    {u.displayName} ({u.employeeId ? `ID: ${u.employeeId}` : u.role.toUpperCase()})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#78716c] text-[10px]">
                ▼
              </div>
            </div>
          </div>

          {/* Security PIN Field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b8b0a5] mb-1.5">
              Employee Security PIN
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#78716c] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={pinInputRef}
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(null);
                }}
                placeholder="Enter 4-digit PIN..."
                disabled={isSubmitting}
                className="w-full bg-[#181818] border border-[#2a2a2a] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059] font-mono tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-[#fdfbf7] p-1"
                tabIndex={-1}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-[#78716c] mt-1">
              Authorized PIN required to confirm deletion and seal the audit log.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-start space-x-2 animate-in fade-in duration-100">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Modal Buttons */}
          <div className="border-t border-[#262626] pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-[#333333] text-xs font-bold text-[#b8b0a5] hover:bg-[#1a1a1a] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !pin.trim()}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Deleting...' : 'Authorize & Delete'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
