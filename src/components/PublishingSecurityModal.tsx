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
        <div className={`flex items-start justify-between pb-4 border-b gap-3 ${
          isDarkMode ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Publishing Security</h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Dashboard authorization and external webhook protection.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className={`p-1 rounded-lg transition ${
              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4 text-xs">
          {/* Status Box */}
          <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
            isDarkMode ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}>
            <div className={`font-bold flex items-center gap-1.5 text-xs ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
              <Check className="w-4 h-4" />
              <span>In-App Publishing Is Auto-Authorized</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              When publishing from this dashboard, requests are verified directly via your Google OAuth connection. You do <strong>not</strong> need to enter a secret key each time to publish blogs!
            </p>
          </div>

          {/* Webhook Secret Explanation */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider opacity-60">
              Optional Webhook Secret (<code className="text-sky-500 font-mono">PUBLISH_SECRET</code>)
            </label>
            <input
              type="password"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              placeholder="Leave blank for standard auto-auth"
              className={`w-full text-xs font-mono rounded-lg p-2.5 border outline-none transition ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-sky-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
              }`}
            />
            <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              If you have set <code className="text-sky-500 font-mono">PUBLISH_SECRET</code> in your Vercel Environment Variables to secure external cron triggers, you can enter it here so background calls include the bearer token.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`pt-4 border-t flex items-center justify-between ${
          isDarkMode ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <button
            type="button"
            onClick={handleClear}
            className={`px-3 py-1.5 text-xs font-bold transition ${
              isDarkMode ? 'text-slate-400 hover:text-rose-400' : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            Clear Custom Secret
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg border text-xs font-bold transition ${
                isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-600/20 active:scale-95"
            >
              Save Settings
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
