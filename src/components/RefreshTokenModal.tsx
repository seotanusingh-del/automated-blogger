import React, { useState } from 'react';
import { Key, ShieldAlert, CheckCircle2, ExternalLink, X, RefreshCw, AlertTriangle } from 'lucide-react';

interface RefreshTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onSave: (token: string) => void;
  currentToken: string;
}

export const RefreshTokenModal: React.FC<RefreshTokenModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onSave,
  currentToken,
}) => {
  const [tokenInput, setTokenInput] = useState(currentToken);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestToken = async () => {
    if (!tokenInput.trim()) {
      setTestResult({ success: false, message: 'Please paste a refresh token first.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`/api/status?refreshToken=${encodeURIComponent(tokenInput.trim())}`);
      const data = await res.json();
      if (data.connected) {
        setTestResult({ 
          success: true, 
          message: 'Success! This Refresh Token is valid and connected to Blogger.' 
        });
      } else {
        setTestResult({ 
          success: false, 
          message: data.error || 'Token test failed. Check that your Google Client ID matches this token.' 
        });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Network error while testing token.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAndClose = () => {
    onSave(tokenInput.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-colors ${
          isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm">Google Blogger Authorization</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* Permanent Token Tip Banner */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Why does Google Refresh Token expire after 7 days?</span>
            </div>
            <p className="leading-relaxed">
              Google automatically expires refresh tokens every <strong>7 days</strong> if your Google Cloud OAuth Consent Screen is in <strong>&quot;Testing&quot;</strong> mode.
            </p>
            <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] font-medium leading-relaxed">
              💡 <strong>How to make it NEVER expire:</strong> Go to Google Cloud Console &gt; <em>APIs &amp; Services</em> &gt; <em>OAuth consent screen</em> and click <strong>&quot;Publish App&quot;</strong> (status: &quot;In production&quot;). Permanent tokens never expire!
            </div>
          </div>

          {/* Token Input Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-slate-300">Google Refresh Token (1//...)</label>
              <a
                href="https://developers.google.com/oauthplayground"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold"
              >
                OAuth Playground <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <textarea
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste new Refresh Token here (e.g. 1//04...)"
              rows={3}
              className={`w-full p-2.5 rounded-xl border font-mono text-[11px] outline-none transition focus:ring-2 focus:ring-sky-500 ${
                isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            />
            <p className="text-[11px] text-slate-500">
              Saving here will update your current browser session so you can publish immediately without waiting for Vercel redeployment.
            </p>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div className={`p-3 rounded-xl border flex items-start gap-2 text-xs ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
              ) : (
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleTestToken}
              disabled={isTesting || !tokenInput.trim()}
              className={`flex-1 py-2.5 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition ${
                isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <button
              onClick={handleSaveAndClose}
              disabled={!tokenInput.trim()}
              className="flex-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition flex items-center justify-center gap-1.5 shadow"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save &amp; Use Token</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
