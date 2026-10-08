import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Database, CheckCircle2, AlertCircle, Copy, Terminal, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured, saveSupabaseCredentials, clearSupabaseCredentials, testSupabaseConnection } from '../../services/supabase';
import { useToast } from '../../context/ToastContext';

export const SupabaseSetupModal = ({ isOpen, onClose }) => {
  const { success, error } = useToast();
  const [url, setUrl] = useState(() => localStorage.getItem('rentflow_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '');
  const [key, setKey] = useState(() => localStorage.getItem('rentflow_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const isConnected = isSupabaseConfigured();

  const handleTest = async () => {
    if (!url || !key) {
      error('Missing Fields', 'Please enter both the Supabase URL and Anon Key.');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(url, key);
    setIsTesting(false);
    setTestResult(res);
    if (res.success) {
      success('Connection Verified', res.message);
    } else {
      error('Connection Failed', res.message);
    }
  };

  const handleSave = () => {
    if (!url || !key) {
      error('Missing credentials', 'Please enter Supabase URL and Anon Key.');
      return;
    }
    saveSupabaseCredentials(url, key);
  };

  const handleDisconnect = () => {
    clearSupabaseCredentials();
  };

  const copySqlNotice = () => {
    navigator.clipboard.writeText('supabase_schema.sql');
    setCopiedSql(true);
    success('Copied', 'Filename supabase_schema.sql copied to clipboard. Run it in your Supabase SQL Editor.');
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase Database Configuration"
      subtitle="Connect your live Supabase project or explore using the integrated instant sandbox."
      maxWidth="max-w-xl"
    >
      <div className="space-y-6 text-sm">
        {/* Status banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          isConnected
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold">
                {isConnected ? 'Connected to Live Supabase' : 'Running in Instant Sandbox Mode'}
              </p>
              <p className="text-xs opacity-80 mt-0.5">
                {isConnected
                  ? 'All auth, fleet, bookings and updates persist directly to your Postgres database.'
                  : 'Interactive mock fleet & operations active. Enter your credentials below to switch to live Supabase.'}
              </p>
            </div>
          </div>
          {isConnected && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-full font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Live
            </span>
          )}
        </div>

        {/* Form inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Supabase Project URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Supabase Anon Public API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono"
            />
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Database setup tip */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              SQL Schema & Seed Script Ready
            </span>
            <button
              onClick={copySqlNotice}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedSql ? 'Copied!' : 'Copy Path'}
            </button>
          </div>
          <p className="text-slate-400 leading-relaxed">
            The project root contains <code className="text-amber-300 bg-slate-800 px-1 py-0.5 rounded">supabase_schema.sql</code>. Open your Supabase Dashboard &gt; <strong>SQL Editor</strong>, paste it and click <strong>Run</strong> to create all tables, RLS policies, and seed vehicles.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
          {isConnected ? (
            <Button variant="danger" size="sm" onClick={handleDisconnect}>
              Disconnect & Return to Sandbox
            </Button>
          ) : (
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1"
            >
              Get Supabase API Keys <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <div className="flex items-center gap-2.5">
            <Button variant="secondary" size="sm" isLoading={isTesting} onClick={handleTest}>
              Test Connection
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Save & Apply
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
