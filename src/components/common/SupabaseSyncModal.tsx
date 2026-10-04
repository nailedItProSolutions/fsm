'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ArrowUpRight,
  Download,
  Upload,
  X,
  Lock,
  Server,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  getSupabaseConfig,
  setSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
} from '@/lib/supabase';
import { useFSMStore } from '@/lib/useStore';
import { SUPABASE_SCHEMA_SQL } from '@/lib/supabaseSchemaSql';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({ isOpen, onClose }) => {
  const store = useFSMStore();

  const [activeTab, setActiveTab] = useState<'sync' | 'credentials' | 'schema'>('sync');
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  // Connection testing state
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    tableCount?: number;
  } | null>(null);

  // Push / Pull states
  const [syncingPush, setSyncingPush] = useState(false);
  const [pushResult, setPushResult] = useState<{
    success: boolean;
    counts: Record<string, number>;
    errors: string[];
  } | null>(null);

  const [syncingPull, setSyncingPull] = useState(false);
  const [pullResult, setPullResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Schema copy state
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load existing credentials on mount / open
  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url);
      setAnonKey(config.anonKey);
      setIsConfigured(config.isConfigured);
      setTestResult(null);
      setPushResult(null);
      setPullResult(null);
      setSaveSuccess(false);

      if (config.isConfigured) {
        runTest();
      }
    }
  }, [isOpen]);

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Failed to connect to Supabase.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveCredentials = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSupabaseConfig(url, anonKey);
    const config = getSupabaseConfig();
    setIsConfigured(config.isConfigured);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    // Immediately test
    await runTest();
  };

  const handleClearCredentials = () => {
    if (confirm('Clear saved Supabase credentials from this browser session?')) {
      clearSupabaseConfig();
      setUrl('');
      setAnonKey('');
      setIsConfigured(false);
      setTestResult(null);
    }
  };

  const handlePushAll = async () => {
    setSyncingPush(true);
    setPushResult(null);
    try {
      const res = await store.syncAllToSupabase();
      setPushResult(res);
    } catch (err: any) {
      setPushResult({
        success: false,
        counts: {},
        errors: [err?.message || 'Sync failed'],
      });
    } finally {
      setSyncingPush(false);
    }
  };

  const handlePullAll = async () => {
    setSyncingPull(true);
    setPullResult(null);
    try {
      const ok = await store.hydrateFromSupabase();
      if (ok) {
        setPullResult({
          success: true,
          message: 'Successfully pulled latest records from Supabase into memory & local cache!',
        });
      } else {
        setPullResult({
          success: false,
          message: 'No cloud records found or Supabase query returned empty. Try pushing local data first.',
        });
      }
    } catch (err: any) {
      setPullResult({
        success: false,
        message: err?.message || 'Failed to pull cloud data.',
      });
    } finally {
      setSyncingPull(false);
    }
  };

  const handleCopySchema = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 3000);
    } catch (err) {
      console.error('Failed to copy schema:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#111111] border border-amber-500/40 rounded-2xl shadow-2xl text-[#fdfbf7] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222222] bg-[#161616]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#c5a059]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-heading text-white">Supabase Cloud Persistence</h2>
                {isConfigured ? (
                  testResult?.success ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Configured
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-900 text-stone-400 border border-stone-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                    Offline (localStorage)
                  </span>
                )}
              </div>
              <p className="text-xs text-[#b8b0a5]">
                Preserve all CRM data, dispatch jobs, estimates, contracts, and payroll safely across code updates.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#78716c] hover:text-white hover:bg-[#222222] rounded-lg transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#222222] bg-[#0c0c0c] px-6">
          <button
            onClick={() => setActiveTab('sync')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'sync'
                ? 'border-[#c5a059] text-[#c5a059]'
                : 'border-transparent text-[#78716c] hover:text-[#b8b0a5]'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            Cloud Backup & Restore
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'credentials'
                ? 'border-[#c5a059] text-[#c5a059]'
                : 'border-transparent text-[#78716c] hover:text-[#b8b0a5]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Credentials & Settings
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'schema'
                ? 'border-[#c5a059] text-[#c5a059]'
                : 'border-transparent text-[#78716c] hover:text-[#b8b0a5]'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            SQL Schema (11 Tables)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: SYNC & MIGRATION */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              {/* Connection Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                  !isConfigured
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                    : testResult?.success
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                    : testResult?.success === false
                    ? 'bg-red-950/20 border-red-500/30 text-red-200'
                    : 'bg-[#181818] border-[#2a2a2a] text-[#b8b0a5]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {!isConfigured ? (
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  ) : testResult?.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      {!isConfigured
                        ? 'Supabase Not Configured Yet'
                        : testResult?.success
                        ? 'Live Cloud Connection Active'
                        : 'Connection Check Failed'}
                    </h3>
                    <p className="mt-1 leading-relaxed text-xs">
                      {!isConfigured
                        ? 'All application records are currently stored in local browser memory. To persist your data permanently across code updates, git pulls, or new browser sessions, add your Supabase credentials in the Credentials tab.'
                        : testResult?.message || 'Ready to backup and restore.'}
                    </p>
                  </div>
                </div>

                {isConfigured && (
                  <button
                    onClick={runTest}
                    disabled={testing}
                    className="px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2c2c2c] text-white border border-[#333333] transition flex items-center gap-1.5 flex-shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-[#c5a059]' : ''}`} />
                    <span>{testing ? 'Testing...' : 'Test Now'}</span>
                  </button>
                )}
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PUSH */}
                <div className="p-4 rounded-xl bg-[#161616] border border-[#2a2a2a] hover:border-amber-500/30 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-[#c5a059] flex items-center justify-center">
                        <Upload className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-white text-sm">Push Local Data to Supabase</h4>
                    </div>
                    <p className="text-[#b8b0a5] text-xs leading-relaxed mb-4">
                      Uploads all existing local clients, jobs, estimates, work agreements, invoices, subscriptions,
                      daily logs, timesheets, and audit logs to the cloud database.
                    </p>
                  </div>

                  <button
                    onClick={handlePushAll}
                    disabled={syncingPush || !isConfigured}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#c5a059] hover:bg-[#b08d4b] text-black font-bold text-xs transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                  >
                    {syncingPush ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-black" />
                        <span>Uploading to Cloud...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Migrate Local Data to Cloud</span>
                      </>
                    )}
                  </button>
                </div>

                {/* PULL */}
                <div className="p-4 rounded-xl bg-[#161616] border border-[#2a2a2a] hover:border-amber-500/30 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <Download className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-white text-sm">Pull Latest Cloud Data</h4>
                    </div>
                    <p className="text-[#b8b0a5] text-xs leading-relaxed mb-4">
                      Fetches all current records from Supabase and overwrites local application memory. Useful if
                      changes were made from another browser or deployment.
                    </p>
                  </div>

                  <button
                    onClick={handlePullAll}
                    disabled={syncingPull || !isConfigured}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#222222] hover:bg-[#2c2c2c] text-white border border-[#333333] font-bold text-xs transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {syncingPull ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#c5a059]" />
                        <span>Downloading Cloud Data...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Pull from Cloud Database</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Push Results Summary */}
              {pushResult && (
                <div
                  className={`p-4 rounded-xl border ${
                    pushResult.success
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                      : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-white mb-2">
                    {pushResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    )}
                    <span>{pushResult.success ? 'Upload Complete!' : 'Upload Completed with Warnings'}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 text-[11px]">
                    {Object.entries(pushResult.counts).map(([table, count]) => (
                      <div key={table} className="bg-[#111111]/80 p-2 rounded-lg border border-[#333333]">
                        <span className="text-[#b8b0a5] capitalize">{table}: </span>
                        <span className="font-bold text-white">{count}</span>
                      </div>
                    ))}
                  </div>

                  {pushResult.errors.length > 0 && (
                    <div className="mt-2 text-[11px] text-red-300">
                      <span className="font-bold">Errors:</span>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5">
                        {pushResult.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Pull Results Summary */}
              {pullResult && (
                <div
                  className={`p-4 rounded-xl border flex items-center gap-3 ${
                    pullResult.success
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                      : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                  }`}
                >
                  {pullResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  )}
                  <div>
                    <h5 className="font-bold text-white">{pullResult.success ? 'Hydration Success' : 'Notice'}</h5>
                    <p className="text-xs">{pullResult.message}</p>
                  </div>
                </div>
              )}

              {/* Current Local Memory Counts */}
              <div className="bg-[#161616] border border-[#262626] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#c5a059]" /> Current Application Memory Snapshot
                  </span>
                  <span className="text-[10px] text-[#78716c]">Synced automatically on mutation</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-[#1a1a1a] p-2 rounded border border-[#2a2a2a]">
                    Clients: <span className="font-bold text-[#c5a059]">{store.clients.length}</span>
                  </div>
                  <div className="bg-[#1a1a1a] p-2 rounded border border-[#2a2a2a]">
                    Properties: <span className="font-bold text-[#c5a059]">{store.properties.length}</span>
                  </div>
                  <div className="bg-[#1a1a1a] p-2 rounded border border-[#2a2a2a]">
                    Jobs: <span className="font-bold text-[#c5a059]">{store.jobs.length}</span>
                  </div>
                  <div className="bg-[#1a1a1a] p-2 rounded border border-[#2a2a2a]">
                    Estimates: <span className="font-bold text-[#c5a059]">{store.estimates.length}</span>
                  </div>
                  <div className="bg-[#1a1a1a] p-2 rounded border border-[#2a2a2a]">
                    Agreements: <span className="font-bold text-[#c5a059]">{store.getWorkAgreements().length}</span>
                  </div>
                  <div className="bg-[#1a1a1a] p-2 rounded border border-[#2a2a2a]">
                    Invoices: <span className="font-bold text-[#c5a059]">{store.invoices.length}</span>
                  </div>
                  <div className="bg-[#1a1a1a] p-2 rounded border border-[#2a2a2a]">
                    Subscriptions: <span className="font-bold text-[#c5a059]">{store.subscriptions.length}</span>
                  </div>
                  <div className="bg-[#1a1a1a] p-2 rounded border border-[#2a2a2a]">
                    Technicians: <span className="font-bold text-[#c5a059]">{store.getTechnicians().length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREDENTIALS */}
          {activeTab === 'credentials' && (
            <div className="space-y-6">
              <form onSubmit={handleSaveCredentials} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-project-id.supabase.co"
                    required
                    className="w-full bg-[#181818] border border-[#2a2a2a] focus:border-[#c5a059] rounded-lg px-3.5 py-2.5 text-white placeholder-[#555] text-xs focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                  />
                  <p className="text-[11px] text-[#78716c] mt-1">
                    Found in your Supabase Dashboard under <strong>Project Settings → API → Project URL</strong>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Supabase Anon API Key (Public)
                  </label>
                  <textarea
                    rows={3}
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    required
                    className="w-full bg-[#181818] border border-[#2a2a2a] focus:border-[#c5a059] rounded-lg p-3 text-white placeholder-[#555] font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#c5a059]"
                  />
                  <p className="text-[11px] text-[#78716c] mt-1">
                    Found in your Supabase Dashboard under <strong>Project Settings → API → Project API Keys (anon public)</strong>.
                  </p>
                </div>

                {saveSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Credentials saved successfully to this browser session!</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleClearCredentials}
                    disabled={!isConfigured && !url && !anonKey}
                    className="px-3.5 py-2 rounded-lg bg-[#1e1e1e] hover:bg-[#282828] text-stone-300 border border-[#333333] transition disabled:opacity-40"
                  >
                    Clear Credentials
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={runTest}
                      disabled={testing || !url || !anonKey}
                      className="px-4 py-2 rounded-lg bg-[#222222] hover:bg-[#2c2c2c] text-white border border-[#333333] transition flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-[#c5a059]' : ''}`} />
                      <span>{testing ? 'Testing...' : 'Test Connection'}</span>
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-[#c5a059] hover:bg-[#b08d4b] text-black font-bold transition shadow-md"
                    >
                      Save & Connect
                    </button>
                  </div>
                </div>
              </form>

              {/* Informative Note */}
              <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#c5a059]" /> Permanent Deployment via Environment Variables
                </div>
                <p className="text-[#b8b0a5] text-xs leading-relaxed">
                  For automated production deployments on Vercel or cloud servers, add these two environment variables
                  in your project settings:
                </p>
                <div className="bg-[#0e0e0e] border border-[#222222] p-3 rounded-lg font-mono text-[11px] text-amber-200/90 space-y-1">
                  <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
                  <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...</div>
                </div>
                <p className="text-[11px] text-[#78716c]">
                  Once configured in Vercel or <code>.env.local</code>, the application automatically connects and
                  syncs in the background without needing to manually input credentials here.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEMA SQL */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">PostgreSQL Schema Definition</h4>
                  <p className="text-[#b8b0a5] text-xs">
                    Run this SQL script in your Supabase project&apos;s SQL Editor to create all 11 tables with Row-Level Security.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#1e1e1e] hover:bg-[#282828] text-white border border-[#333] transition flex items-center gap-1.5"
                  >
                    <span>Supabase Dashboard</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#c5a059]" />
                  </a>
                  <button
                    onClick={handleCopySchema}
                    className="px-3.5 py-1.5 rounded-lg bg-[#c5a059] hover:bg-[#b08d4b] text-black font-bold transition flex items-center gap-1.5 shadow"
                  >
                    {copiedSchema ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-black" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy SQL Script</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instructions list */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-[#181818] p-3 rounded-lg border border-[#282828]">
                  <span className="font-bold text-[#c5a059]">1. Create Project:</span>
                  <p className="text-[#b8b0a5] mt-1">Create a free project at supabase.com.</p>
                </div>
                <div className="bg-[#181818] p-3 rounded-lg border border-[#282828]">
                  <span className="font-bold text-[#c5a059]">2. Open SQL Editor:</span>
                  <p className="text-[#b8b0a5] mt-1">In the sidebar, click the SQL Editor icon.</p>
                </div>
                <div className="bg-[#181818] p-3 rounded-lg border border-[#282828]">
                  <span className="font-bold text-[#c5a059]">3. Paste &amp; Run:</span>
                  <p className="text-[#b8b0a5] mt-1">Paste the script below and click &quot;Run&quot;.</p>
                </div>
                <div className="bg-[#181818] p-3 rounded-lg border border-[#282828]">
                  <span className="font-bold text-[#c5a059]">4. Push Data:</span>
                  <p className="text-[#b8b0a5] mt-1">Return here and click &quot;Migrate Local Data&quot;.</p>
                </div>
              </div>

              {/* SQL Code Block */}
              <div className="relative">
                <pre className="bg-[#0c0c0c] border border-[#2a2a2a] rounded-xl p-4 text-[11px] font-mono text-[#c5a059] overflow-x-auto max-h-[300px] leading-relaxed">
                  {SUPABASE_SCHEMA_SQL}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#222222] bg-[#161616] flex items-center justify-between text-[11px] text-[#78716c]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Nailed It Property Solutions — Continuous Cloud Replication</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2c2c2c] text-white transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
