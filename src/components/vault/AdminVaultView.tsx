'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useActiveFSMData } from '@/lib/useStore';
import { DailyWorkLog, WeeklyTimesheet, JobTradeCategory, PaymentVerification } from '@/types';
import { 
  parseHandwrittenTimesheetText, 
  SAMPLE_HANDWRITTEN_TIMESHEETS,
  sortWorkLogsChronologically 
} from '@/lib/ocrEngine';
import { PaymentVerificationModal } from './PaymentVerificationModal';
import { LockedTimesheetPdfModal } from './LockedTimesheetPdfModal';
import { TimesheetAuditModal } from './TimesheetAuditModal';
import { 
  Upload, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  Wrench, 
  FileText, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  Eye,
  DollarSign,
  ArrowUpDown,
  RefreshCw,
  FolderOpen,
  Edit3
} from 'lucide-react';

export const AdminVaultView: React.FC = () => {
  const { 
    dailyWorkLogs, 
    weeklyTimesheets, 
    properties, 
    getTechnicians, 
    addDailyWorkLog, 
    verifyWeeklyTimesheetPayment,
    updateWeeklyTimesheetAudit,
    generateMissingWeeklyTimesheets
  } = useActiveFSMData();

  const technicians = getTechnicians();

  // Tab State
  const [activeTab, setActiveTab] = useState<'scans' | 'weekly'>('scans');
  const [auditingTimesheet, setAuditingTimesheet] = useState<WeeklyTimesheet | null>(null);

  // Filtering States
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<JobTradeCategory | 'all'>('all');
  const [selectedTech, setSelectedTech] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // OCR Upload / Ingestion States
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrSuccessAlert, setOcrSuccessAlert] = useState<DailyWorkLog | null>(null);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);

  // Modals
  const [verifyingTimesheet, setVerifyingTimesheet] = useState<WeeklyTimesheet | null>(null);
  const [viewingPdfTimesheet, setViewingPdfTimesheet] = useState<WeeklyTimesheet | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('tab') === 'weekly') {
        setActiveTab('weekly');
      }
      if (sp.get('verify') === 'true' && weeklyTimesheets.length > 0) {
        const pending = weeklyTimesheets.find(w => !w.locked) || weeklyTimesheets[0];
        setVerifyingTimesheet(pending);
      }
      if (sp.get('pdf') === 'true' && weeklyTimesheets.length > 0) {
        setViewingPdfTimesheet(weeklyTimesheets[0]);
      }
    }
  }, [weeklyTimesheets]);

  // Filtered & Chronologically Sorted Daily Logs
  const filteredLogs = useMemo(() => {
    let result = [...dailyWorkLogs];

    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      result = result.filter(
        (l) =>
          l.taskDetails.toLowerCase().includes(q) ||
          l.propertyLocation.toLowerCase().includes(q) ||
          l.technicianName.toLowerCase().includes(q) ||
          (l.rawOcrText && l.rawOcrText.toLowerCase().includes(q))
      );
    }

    if (selectedProperty !== 'all') {
      result = result.filter(
        (l) => l.propertyLocation.toLowerCase().includes(selectedProperty.toLowerCase()) || l.propertyId === selectedProperty
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((l) => l.jobCategory === selectedCategory);
    }

    if (selectedTech !== 'all') {
      result = result.filter((l) => l.technicianId === selectedTech);
    }

    if (startDate) {
      result = result.filter((l) => l.date >= startDate);
    }

    if (endDate) {
      result = result.filter((l) => l.date <= endDate);
    }

    // Always sort chronologically by extracted work Date
    return sortWorkLogsChronologically(result, sortOrder);
  }, [dailyWorkLogs, searchKeyword, selectedProperty, selectedCategory, selectedTech, startDate, endDate, sortOrder]);

  // Handle OCR Ingestion from sample or uploaded text
  const handleIngestOcr = async (rawText: string, techNameHint: string = 'Charles Willis', techIdHint: string = 'user-tech-1') => {
    setIsProcessingOcr(true);
    setOcrSuccessAlert(null);

    try {
      // Execute through API endpoint or local parsing engine
      const res = await fetch('/api/vault/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          technicianId: techIdHint,
          technicianName: techNameHint,
        }),
      });

      let parsedData;
      if (res.ok) {
        const json = await res.json();
        parsedData = json.data;
      } else {
        // Fallback to local OCR engine
        parsedData = parseHandwrittenTimesheetText(rawText, { id: techIdHint, name: techNameHint });
      }

      // Add to store
      const created = addDailyWorkLog({
        technicianId: parsedData.technicianId || techIdHint,
        technicianName: parsedData.technicianName || techNameHint,
        date: parsedData.date,
        startTime: parsedData.startTime,
        stopTime: parsedData.stopTime,
        totalHours: parsedData.totalHours,
        propertyLocation: parsedData.propertyLocation,
        taskDetails: parsedData.taskDetails,
        jobCategory: parsedData.jobCategory,
        confidenceScore: parsedData.confidenceScore || 0.96,
        source: 'ocr_scan',
        rawOcrText: rawText,
        scannedImageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
      });

      setOcrSuccessAlert(created);
    } catch (err) {
      console.error('Ingestion failed', err);
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const handleSimulateDropzoneUpload = () => {
    const sample = SAMPLE_HANDWRITTEN_TIMESHEETS[selectedSampleIndex % SAMPLE_HANDWRITTEN_TIMESHEETS.length];
    handleIngestOcr(sample.rawHandwritingText, sample.technicianName, sample.technicianId || 'user-tech-1');
    setSelectedSampleIndex((prev) => prev + 1);
  };

  const handleClearFilters = () => {
    setSearchKeyword('');
    setSelectedProperty('all');
    setSelectedCategory('all');
    setSelectedTech('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6 text-[#fdfbf7]">
      {/* Top Banner */}
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#c5a059] mb-1">
            <Sparkles className="w-4 h-4 text-[#FF8A00]" />
            <span>AI Technician Vault & Timesheet OCR Ingestion</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-[#fdfbf7]">
            Historical Timesheets & Payroll Archive
          </h1>
          <p className="text-xs text-[#b8b0a5] mt-1 max-w-2xl">
            Google Cloud Vision multimodal pipeline for paper timesheets. Documents are automatically parsed for Date, Times, Hours, Property Location, and Tasks, and sorted chronologically.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              const res = generateMissingWeeklyTimesheets();
              if (res.length > 0) {
                alert(`Generated ${res.length} missing weekly timesheet(s) aggregating technician daily hours!`);
              } else {
                alert('All calendar weeks currently have active weekly timesheet aggregates.');
              }
            }}
            className="bg-[#1c1c1c] hover:bg-[#252525] text-[#c5a059] border border-[#c5a059]/40 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-[#FF8A00]" />
            <span>Aggregate Missing Weeks</span>
          </button>
        </div>
      </div>

      {/* OCR Ingestion Success Alert */}
      {ocrSuccessAlert && (
        <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-lg animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-emerald-300">
                AI Handwriting OCR Successfully Extracted!
              </div>
              <div className="text-emerald-200/80 text-[11px] mt-0.5">
                Parsed <span className="font-mono font-bold text-white">{ocrSuccessAlert.totalHours} hrs</span> for{' '}
                <strong className="text-white">{ocrSuccessAlert.technicianName}</strong> on{' '}
                <strong className="text-[#c5a059]">{ocrSuccessAlert.date}</strong> at{' '}
                <span className="text-white">{ocrSuccessAlert.propertyLocation}</span> ({ocrSuccessAlert.jobCategory}).
              </div>
            </div>
          </div>
          <button
            onClick={() => setOcrSuccessAlert(null)}
            className="text-emerald-400 hover:text-white px-2 py-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Bulk Upload Dropzone Card */}
      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-[#fdfbf7] font-heading flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#c5a059]" />
              <span>Bulk-Upload Scanned Paper Timesheets Dropzone</span>
            </h2>
            <p className="text-xs text-[#b8b0a5]">
              Upload photos or PDF scans of handwritten daily technician logs for automated handwriting extraction
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#c5a059] bg-[#c5a059]/10 border border-[#c5a059]/20 px-2 py-0.5 rounded">
            Vision OCR: Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Dropzone Area */}
          <div 
            onClick={handleSimulateDropzoneUpload}
            className="md:col-span-2 border-2 border-dashed border-[#333333] hover:border-[#c5a059] bg-[#161616] hover:bg-[#1a1a1a] rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 group"
          >
            <div className="w-12 h-12 rounded-full bg-[#202020] group-hover:bg-[#c5a059]/20 flex items-center justify-center text-[#78716c] group-hover:text-[#c5a059] transition">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#fdfbf7]">
                {isProcessingOcr ? 'Analyzing Handwriting via Multimodal OCR...' : 'Click to Upload or Drag & Drop Scanned Timesheet'}
              </div>
              <p className="text-[11px] text-[#78716c] mt-1">
                Supports JPG, PNG, PDF scans • Automatically parses handwritten dates, times & property addresses
              </p>
            </div>
            <button
              type="button"
              disabled={isProcessingOcr}
              className="bg-[#c5a059] hover:bg-[#d4b068] text-black font-bold text-xs px-4 py-2 rounded-lg transition shadow"
            >
              {isProcessingOcr ? 'Extracting Handwriting...' : 'Select File / Run Sample Scan'}
            </button>
          </div>

          {/* Sample Pre-scans Selector */}
          <div className="bg-[#161616] p-4 rounded-xl border border-[#242424] space-y-2 flex flex-col justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-[#c5a059] tracking-wider mb-1">
                Quick-Test Pre-Scans
              </div>
              <p className="text-[11px] text-[#b8b0a5] leading-relaxed">
                Test the handwriting extraction engine using realistic historical field logs from Rome, GA jobs:
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              {SAMPLE_HANDWRITTEN_TIMESHEETS.map((sample, idx) => (
                <button
                  key={sample.fileName}
                  onClick={() => handleIngestOcr(sample.rawHandwritingText, sample.technicianName, sample.technicianId || 'user-tech-1')}
                  disabled={isProcessingOcr}
                  className="w-full text-left text-[11px] bg-[#1d1d1d] hover:bg-[#252525] border border-[#2a2a2a] p-2 rounded-lg transition flex items-center justify-between group"
                >
                  <span className="font-medium text-[#fdfbf7] group-hover:text-[#c5a059] truncate">
                    {sample.technicianName} ({sample.fileName.split('_')[2]})
                  </span>
                  <span className="text-[9px] text-[#78716c] font-mono shrink-0 ml-1">Run OCR →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vault Navigation Tabs */}
      <div className="border-b border-[#222222] flex space-x-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('scans')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'scans'
              ? 'border-[#c5a059] text-[#c5a059]'
              : 'border-transparent text-[#b8b0a5] hover:text-[#fdfbf7]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Historical Daily Logs ({dailyWorkLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('weekly')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'weekly'
              ? 'border-[#c5a059] text-[#c5a059]'
              : 'border-transparent text-[#b8b0a5] hover:text-[#fdfbf7]'
          }`}
        >
          <FileCheck className="w-4 h-4 text-[#FF8A00]" />
          <span>Weekly Timesheets & Payroll ({weeklyTimesheets.length})</span>
        </button>
      </div>

      {/* TAB 1: HISTORICAL SCANNED DAILY LOGS */}
      {activeTab === 'scans' && (
        <div className="space-y-4">
          {/* Robust Search & Multi-Attribute Filtering Engine */}
          <div className="bg-[#121212] p-4 rounded-xl border border-[#222222] space-y-3">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Keyword Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#c5a059] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by tasks, materials, or handwriting notes..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg pl-9 pr-3 py-2 text-xs text-[#fdfbf7] placeholder-[#78716c] focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              {/* Property Address Filter */}
              <div className="w-full lg:w-56">
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="all">All Properties</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.street}>
                      {p.street}
                    </option>
                  ))}
                </select>
              </div>

              {/* Job Category Filter */}
              <div className="w-full lg:w-44">
                <select
                  value={selectedCategory}
                  onChange={(e: any) => setSelectedCategory(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="all">All Categories</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Drywall">Drywall</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="Turnover">Turnover</option>
                  <option value="Handyman">Handyman</option>
                </select>
              </div>

              {/* Technician Filter */}
              <div className="w-full lg:w-44">
                <select
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-[#fdfbf7] focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="all">All Technicians</option>
                  {technicians.map((t) => (
                    <option key={t.uid} value={t.uid}>
                      {t.displayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Second Filter Row: Date Range & Sorting */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#1e1e1e] text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[#78716c] font-semibold text-[11px]">Date Range:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#181818] border border-[#2a2a2a] rounded-lg px-2.5 py-1 text-xs text-[#fdfbf7]"
                />
                <span className="text-[#78716c]">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-[#181818] border border-[#2a2a2a] rounded-lg px-2.5 py-1 text-xs text-[#fdfbf7]"
                />

                {(searchKeyword || selectedProperty !== 'all' || selectedCategory !== 'all' || selectedTech !== 'all' || startDate || endDate) && (
                  <button
                    onClick={handleClearFilters}
                    className="text-[#FF8A00] hover:underline text-[11px] ml-2"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-[#78716c]">Chronological Sort:</span>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="bg-[#1a1a1a] hover:bg-[#242424] text-[#c5a059] border border-[#2e2e2e] px-2.5 py-1 rounded-lg transition flex items-center space-x-1 text-xs"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span>{sortOrder === 'desc' ? 'Newest Date First' : 'Oldest Date First'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Daily Logs Table / Cards */}
          <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-[#222222] text-left text-xs">
              <thead className="bg-[#161616] text-[#78716c] text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Work Date</th>
                  <th className="px-5 py-3.5">Technician</th>
                  <th className="px-5 py-3.5">Location / Property</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Shift Window</th>
                  <th className="px-5 py-3.5 text-right">Hours</th>
                  <th className="px-5 py-3.5 text-center">Confidence</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-[#161616] transition">
                        <td className="px-5 py-3.5 font-mono font-bold text-[#c5a059] whitespace-nowrap">
                          {log.date}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-[#fdfbf7]">
                          {log.technicianName}
                        </td>
                        <td className="px-5 py-3.5 text-[#b8b0a5]">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-[#78716c]" />
                            {log.propertyLocation}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="bg-[#242424] text-[#b8b0a5] border border-[#333333] px-2 py-0.5 rounded text-[10px] font-semibold">
                            {log.jobCategory}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[#78716c] font-mono text-[11px]">
                          {log.startTime} — {log.stopTime}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-[#fdfbf7]">
                          {log.totalHours.toFixed(1)}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {(log.confidenceScore * 100).toFixed(0)}% AI
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="text-[#c5a059] hover:underline font-bold text-xs"
                          >
                            {isExpanded ? 'Hide' : 'Details'}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Handwriting Transcription Row */}
                      {isExpanded && (
                        <tr className="bg-[#141414]">
                          <td colSpan={8} className="px-6 py-4 border-t border-[#1e1e1e]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <span className="text-[10px] uppercase font-bold text-[#78716c] tracking-wider">
                                  Extracted Task Summary
                                </span>
                                <p className="text-xs text-[#fdfbf7] leading-relaxed bg-[#1a1a1a] p-3 rounded-lg border border-[#282828]">
                                  {log.taskDetails}
                                </p>
                              </div>

                              <div className="space-y-1.5">
                                <span className="text-[10px] uppercase font-bold text-[#78716c] tracking-wider">
                                  Raw Handwritten OCR Text
                                </span>
                                <pre className="text-[11px] font-mono text-[#b8b0a5] bg-[#1a1a1a] p-3 rounded-lg border border-[#282828] overflow-x-auto whitespace-pre-wrap">
                                  {log.rawOcrText || 'No raw OCR transcription preserved.'}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-[#78716c]">
                      No historical daily logs match your current filter settings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: WEEKLY TIMESHEETS & PAYROLL */}
      {activeTab === 'weekly' && (
        <div className="space-y-4">
          <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-[#222222] text-left text-xs">
              <thead className="bg-[#161616] text-[#78716c] text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Timesheet ID</th>
                  <th className="px-5 py-3.5">Technician</th>
                  <th className="px-5 py-3.5">Cycle Window</th>
                  <th className="px-5 py-3.5 text-right">Hours & Rate</th>
                  <th className="px-5 py-3.5 text-right">Gross Pay</th>
                  <th className="px-5 py-3.5 text-right">Adjustments</th>
                  <th className="px-5 py-3.5 text-right">Audited Net Pay</th>
                  <th className="px-5 py-3.5">Status & Tamper Lock</th>
                  <th className="px-5 py-3.5 text-right">Payroll Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {weeklyTimesheets.map((sheet) => {
                  const isLocked = sheet.locked;
                  const effectiveNet = sheet.netPay !== undefined ? sheet.netPay : sheet.totalGrossPay;
                  const bonusSum = sheet.totalBonuses || sheet.bonuses?.reduce((s, b) => s + (b.amount || 0), 0) || 0;
                  const deductSum = sheet.totalDeductions || sheet.deductions?.reduce((s, d) => s + (d.amountPaid || 0), 0) || 0;

                  return (
                    <tr key={sheet.id} className="hover:bg-[#161616] transition">
                      <td className="px-5 py-4 font-mono font-bold text-[#c5a059]">
                        Week {sheet.weekNumber} ({sheet.year})
                      </td>
                      <td className="px-5 py-4 font-bold text-[#fdfbf7]">
                        {sheet.technicianName}
                      </td>
                      <td className="px-5 py-4 text-[#b8b0a5]">
                        {sheet.weekStartDate} — {sheet.weekEndDate}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="font-mono font-bold text-[#fdfbf7]">{sheet.totalHours.toFixed(1)} hrs</div>
                        <div className="text-[10px] font-mono text-[#c5a059]">${sheet.hourlyRate.toFixed(2)}/hr</div>
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-medium text-[#b8b0a5]">
                        ${sheet.totalGrossPay.toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {bonusSum > 0 || deductSum > 0 ? (
                          <div className="space-y-0.5 text-[10px] font-mono">
                            {bonusSum > 0 && <span className="text-emerald-400 block font-bold">+${bonusSum.toFixed(2)}</span>}
                            {deductSum > 0 && <span className="text-red-400 block font-bold">-${deductSum.toFixed(2)}</span>}
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#78716c] font-mono">—</span>
                        )}
                      </td>
                      {/* BOLD NET PAY IN TABLE */}
                      <td className="px-5 py-4 text-right">
                        <span className="font-mono font-black text-sm text-emerald-400">
                          ${effectiveNet.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {isLocked ? (
                          <div className="flex flex-col">
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase inline-flex items-center gap-1 w-max">
                              <Lock className="w-3 h-3" />
                              <span>LOCKED • VERIFIED PAID</span>
                            </span>
                            {sheet.paymentVerification && (
                              <span className="text-[10px] text-[#78716c] mt-0.5">
                                {sheet.paymentVerification.checkNumber || 'Direct Deposit'} • Paid {sheet.paymentVerification.paymentDate}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            {sheet.auditConfirmed ? (
                              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase inline-flex items-center gap-1 w-max">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>AUDITED • READY TO LOCK</span>
                              </span>
                            ) : (
                              <span className="bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase inline-flex items-center gap-1 w-max">
                                <Clock className="w-3 h-3" />
                                <span>AWAITING FIRST AUDIT</span>
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                        {!sheet.auditConfirmed && !isLocked ? (
                          <button
                            onClick={() => setAuditingTimesheet(sheet)}
                            className="bg-gradient-to-r from-[#c5a059] to-[#d4af37] hover:brightness-110 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition inline-flex items-center space-x-1 shadow"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Audit & View</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setViewingPdfTimesheet(sheet)}
                              className="bg-[#242424] hover:bg-[#2d2d2d] text-[#fdfbf7] text-xs font-bold px-2.5 py-1.5 rounded-lg border border-[#333333] transition inline-flex items-center space-x-1"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#c5a059]" />
                              <span>View PDF</span>
                            </button>

                            {!isLocked && (
                              <button
                                onClick={() => setAuditingTimesheet(sheet)}
                                className="bg-[#1c1c1c] hover:bg-[#262626] text-[#c5a059] text-xs font-bold px-2.5 py-1.5 rounded-lg border border-[#c5a059]/30 transition inline-flex items-center space-x-1"
                                title="Edit hourly rate, added bonuses, or deductions"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[#FF8A00]" />
                                <span>Adjust</span>
                              </button>
                            )}
                          </>
                        )}

                        {!isLocked && (
                          <button
                            onClick={() => setVerifyingTimesheet(sheet)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition inline-flex items-center space-x-1 shadow"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verify & Lock</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {weeklyTimesheets.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-[#78716c]">
                      No weekly timesheets recorded yet. Click "Aggregate Missing Weeks" to compile daily logs.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Timesheet Audit & Confirmation Modal (Hourly Rate Presets, Bonuses, Deductions, Bold Net Pay) */}
      {auditingTimesheet && (
        <TimesheetAuditModal
          timesheet={auditingTimesheet}
          isOpen={Boolean(auditingTimesheet)}
          onClose={() => setAuditingTimesheet(null)}
          onConfirmAudit={(timesheetId, updates) => {
            const updated = updateWeeklyTimesheetAudit(timesheetId, updates);
            setAuditingTimesheet(null);
            // Immediately open official timesheet document with verified net pay
            if (updated) {
              setViewingPdfTimesheet(updated);
            } else {
              const ref = weeklyTimesheets.find((t) => t.id === timesheetId);
              if (ref) setViewingPdfTimesheet(ref);
            }
          }}
        />
      )}

      {/* Payment Verification Modal */}
      {verifyingTimesheet && (
        <PaymentVerificationModal
          timesheet={weeklyTimesheets.find((t) => t.id === verifyingTimesheet.id) || verifyingTimesheet}
          isOpen={Boolean(verifyingTimesheet)}
          onClose={() => setVerifyingTimesheet(null)}
          onVerify={(timesheetId, verification) => {
            verifyWeeklyTimesheetPayment(timesheetId, verification);
            setVerifyingTimesheet(null);
          }}
        />
      )}

      {/* Locked PDF Modal */}
      {viewingPdfTimesheet && (
        <LockedTimesheetPdfModal
          timesheet={weeklyTimesheets.find((t) => t.id === viewingPdfTimesheet.id) || viewingPdfTimesheet}
          logs={dailyWorkLogs.filter((l) => viewingPdfTimesheet.dailyLogIds.includes(l.id))}
          isOpen={Boolean(viewingPdfTimesheet)}
          onClose={() => setViewingPdfTimesheet(null)}
          onEditAudit={() => {
            const current = weeklyTimesheets.find((t) => t.id === viewingPdfTimesheet.id) || viewingPdfTimesheet;
            setViewingPdfTimesheet(null);
            setAuditingTimesheet(current);
          }}
        />
      )}
    </div>
  );
};
