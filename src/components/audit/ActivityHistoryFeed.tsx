'use client';

import React, { useState } from 'react';
import { useFSMStore } from '@/lib/useStore';
import { AuditLog, AuditActionType, AuditEntityType } from '@/types';
import {
  Clock,
  User,
  Shield,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Camera,
  RefreshCw,
  Search,
  DollarSign,
  Activity
} from 'lucide-react';

interface ActivityHistoryFeedProps {
  entityType?: AuditEntityType;
  entityId?: string;
  title?: string;
  compact?: boolean;
  maxItems?: number;
}

export const ActivityHistoryFeed: React.FC<ActivityHistoryFeedProps> = ({
  entityType,
  entityId,
  title = 'Activity History & Audit Trail',
  compact = false,
  maxItems = 50,
}) => {
  const { auditLogs, getAuditLogsByEntity } = useFSMStore();
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Determine logs to display
  let relevantLogs: AuditLog[] = [];
  if (entityType && entityId) {
    relevantLogs = getAuditLogsByEntity(entityType, entityId);
  } else if (entityType) {
    relevantLogs = auditLogs.filter((l) => l.entityType === entityType);
  } else {
    relevantLogs = auditLogs;
  }

  // Filter by action if selected
  if (filterAction !== 'all') {
    relevantLogs = relevantLogs.filter((l) => l.actionType === filterAction);
  }

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    relevantLogs = relevantLogs.filter((l) => {
      const desc = l.description || l.summary || '';
      const name = l.userName || l.employeeName || '';
      const empId = l.employeeId || '';
      const title = l.entityTitle || '';
      return (
        desc.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q) ||
        empId.toLowerCase().includes(q) ||
        title.toLowerCase().includes(q)
      );
    });
  }

  const displayedLogs = relevantLogs.slice(0, maxItems);

  const getActionBadge = (action: AuditActionType) => {
    switch (action) {
      case 'create':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          label: 'Created',
          icon: CheckCircle2,
        };
      case 'update':
        return {
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          label: 'Updated',
          icon: RefreshCw,
        };
      case 'status_change':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          label: 'Status Change',
          icon: Clock,
        };
      case 'checklist_toggle':
        return {
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          label: 'Checklist Toggle',
          icon: FileCheck,
        };
      case 'photo_added':
      case 'photo_upload':
        return {
          bg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
          label: 'Photo Attached',
          icon: Camera,
        };
      case 'ocr_upload':
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          label: 'OCR Ingestion',
          icon: FileText,
        };
      case 'audit_confirm':
        return {
          bg: 'bg-[#c5a059]/20 text-[#c5a059] border-[#c5a059]/40',
          label: 'Audit Confirmed',
          icon: Shield,
        };
      case 'payment_verify':
      case 'payment_received':
        return {
          bg: 'bg-green-500/20 text-green-300 border-green-500/40',
          label: 'Payment Verified',
          icon: DollarSign,
        };
      case 'invoice_sent':
        return {
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          label: 'Invoice Sent',
          icon: FileText,
        };
      case 'delete':
        return {
          bg: 'bg-red-500/10 text-red-400 border-red-500/30',
          label: 'Deleted',
          icon: AlertCircle,
        };
      default:
        return {
          bg: 'bg-slate-700/30 text-slate-300 border-slate-600',
          label: action,
          icon: Activity,
        };
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const renderStateDiff = (log: AuditLog) => {
    if (!log.previousState && !log.newState) {
      return <p className="text-xs text-[#78716c] italic">No state snapshot recorded.</p>;
    }

    // Identify changed keys
    const prev = log.previousState || {};
    const next = log.newState || {};
    const allKeys = Array.from(new Set([...Object.keys(prev), ...Object.keys(next)]));

    // Filter out complex internal objects or long lists for cleaner display
    const changedKeys = allKeys.filter((k) => {
      const valA = JSON.stringify(prev[k]);
      const valB = JSON.stringify(next[k]);
      return valA !== valB;
    });

    return (
      <div className="mt-3 p-3 bg-[#0d0d0d] rounded-lg border border-[#222222] font-mono text-[11px] space-y-2">
        <div className="flex items-center justify-between text-[#78716c] text-[10px] pb-1.5 border-b border-[#222222]">
          <span>Audit Diff (Previous vs New State)</span>
          <span>{changedKeys.length} Field(s) Modified</span>
        </div>

        {changedKeys.length > 0 ? (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {changedKeys.map((key) => {
              const oldVal = prev[key];
              const newVal = next[key];
              return (
                <div key={key} className="grid grid-cols-1 sm:grid-cols-3 gap-1 bg-[#141414] p-2 rounded border border-[#222222]">
                  <div className="text-[#c5a059] font-semibold">{key}</div>
                  <div className="text-red-400/80 truncate">
                    <span className="text-[9px] uppercase tracking-wider text-[#78716c] mr-1">Prev:</span>
                    {oldVal !== undefined ? JSON.stringify(oldVal) : 'undefined'}
                  </div>
                  <div className="text-emerald-400 truncate">
                    <span className="text-[9px] uppercase tracking-wider text-[#78716c] mr-1">New:</span>
                    {newVal !== undefined ? JSON.stringify(newVal) : 'undefined'}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-[#78716c] italic">
            Full record snapshot captured with identical top-level fields.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${compact ? 'text-xs' : 'text-sm'}`}>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#222222]">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-[#c5a059]" />
          <h4 className="font-bold text-[#fdfbf7] font-heading">{title}</h4>
          <span className="bg-[#1f1f1f] text-[#c5a059] border border-[#c5a059]/20 text-[10px] font-mono px-2 py-0.5 rounded-full">
            {displayedLogs.length} Events
          </span>
        </div>

        {!compact && (
          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#78716c] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#161616] text-[#fdfbf7] text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#2c2c2c] focus:border-[#c5a059] focus:outline-none w-44"
              />
            </div>

            {/* Action Filter */}
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-[#161616] text-[#b8b0a5] text-xs px-2.5 py-1.5 rounded-lg border border-[#2c2c2c] focus:border-[#c5a059] focus:outline-none"
            >
              <option value="all">All Actions</option>
              <option value="create">Created</option>
              <option value="update">Updated</option>
              <option value="status_change">Status Changes</option>
              <option value="checklist_toggle">Checklist</option>
              <option value="photo_upload">Photos</option>
              <option value="ocr_upload">OCR Upload</option>
              <option value="audit_confirm">Audit Confirmed</option>
              <option value="payment_verify">Payment Verified</option>
            </select>
          </div>
        )}
      </div>

      {/* Feed List */}
      {displayedLogs.length === 0 ? (
        <div className="text-center py-8 bg-[#141414] rounded-xl border border-[#222222] text-[#78716c]">
          <Clock className="w-8 h-8 text-[#555555] mx-auto mb-2 opacity-50" />
          <p className="text-xs font-semibold">No audit entries found for this record</p>
          <p className="text-[11px] text-[#555555] mt-0.5">
            Any future modifications, status changes, or document uploads will be silently logged here.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#222222]">
          {displayedLogs.map((log) => {
            const badge = getActionBadge(log.actionType);
            const Icon = badge.icon;
            const isExpanded = expandedLogId === log.id;

            return (
              <div key={log.id} className="relative group">
                {/* Timeline Node */}
                <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-[#111111] border-2 border-[#c5a059] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
                </div>

                {/* Log Entry Card */}
                <div className="bg-[#161616] hover:bg-[#1a1a1a] transition p-3.5 rounded-xl border border-[#262626]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    {/* Actor & Action */}
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${badge.bg}`}>
                        <Icon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>

                      <div className="flex items-center space-x-1.5 text-xs">
                        <span className="font-bold text-[#fdfbf7]">{log.userName || log.employeeName}</span>
                        <span className="text-[10px] font-mono bg-[#222222] text-[#c5a059] px-1.5 py-0.2 rounded border border-[#333333]">
                          {log.employeeId}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-[#78716c]">
                          ({log.userRole || log.employeeRole})
                        </span>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="text-[11px] font-mono text-[#78716c] flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(log.timestamp)}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-2 text-xs text-[#b8b0a5] leading-relaxed">
                    {log.description || log.summary}
                  </div>

                  {/* Entity Context if showing global feed */}
                  {(!entityId || log.entityId !== entityId) && log.entityTitle && (
                    <div className="mt-2 text-[10px] font-mono text-[#78716c] bg-[#111111] px-2 py-1 rounded border border-[#222222] inline-block">
                      Target: <span className="text-[#fdfbf7] font-semibold">{log.entityTitle}</span> ({log.entityType})
                    </div>
                  )}

                  {/* Expand Diff Toggle */}
                  {(log.previousState || log.newState) && (
                    <div className="mt-2 pt-2 border-t border-[#222222] flex justify-end">
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="text-[10px] font-bold text-[#c5a059] hover:text-[#e0b968] flex items-center space-x-1 transition"
                      >
                        <span>{isExpanded ? 'Hide State Diff' : 'View State Diff'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  )}

                  {/* Render Diff if expanded */}
                  {isExpanded && renderStateDiff(log)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
