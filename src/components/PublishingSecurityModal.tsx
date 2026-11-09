import React, { useState } from 'react';
import { X, Lock, ShieldCheck, Check, Key, Info } from 'lucide-react';

interface PublishingSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  publishSecret: string;
  onSave: (secret: string) => void;
}

export const PublishingSecurityModal: React.FC<PublishingSecurityModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  publishSecret,
  onSave
}) => {
  const [secretInput, setSecretInput] = useState(publishSecret);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(secretInput.trim());
    onClose();
  };

  const handleClear = () => {
    setSecretInput('');
    onSave('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className={`border rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Publishing Security</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dashboard authorization and external webhook protection.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4 text-xs">
          {/* Status Box */}
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-xs text-emerald-400">
              <Check className="w-4 h-4" />
              <span>In-App Publishing Is Auto-Authorized</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              When publishing from this dashboard, requests are verified directly via your Google OAuth connection. You do <strong>not</strong> need to enter a secret key each time to publish blogs!
            </p>
          </div>

          {/* Webhook Secret Explanation */}
          <div className="space-y-2">
            <label className="block text-xs font-bold">
              Optional Webhook Secret (<code className="text-sky-400 font-mono">PUBLISH_SECRET</code>)
            </label>
            <input
              type="text"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              placeholder="Leave blank for standard auto-auth"
              className={`w-full text-xs font-mono rounded-lg p-2.5 border outline-none ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              If you have set <code className="text-sky-400 font-mono">PUBLISH_SECRET</code> in your Vercel Environment Variables to secure external cron triggers, you can enter it here so background calls include the bearer token.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 transition"
          >
            Clear Custom Secret
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-semibold hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow"
            >
              Save Settings
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
