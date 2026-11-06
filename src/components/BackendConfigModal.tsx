import React, { useState } from 'react';
import { Key, Shield, X, Check, Lock, Globe, Settings } from 'lucide-react';

interface BackendConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onSave: (config: { publishSecret: string; googleAuthConfig: any }) => void;
  currentConfig: { publishSecret: string; googleAuthConfig: any };
}

export const BackendConfigModal: React.FC<BackendConfigModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onSave,
  currentConfig,
}) => {
  const [publishSecret, setPublishSecret] = useState(currentConfig.publishSecret);
  const [clientId, setClientId] = useState(currentConfig.googleAuthConfig.client_id || '');
  const [clientSecret, setClientSecret] = useState(currentConfig.googleAuthConfig.client_secret || '');
  const [refreshToken, setRefreshToken] = useState(currentConfig.googleAuthConfig.refresh_token || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      publishSecret: publishSecret.trim(),
      googleAuthConfig: {
        client_id: clientId.trim(),
        client_secret: clientSecret.trim(),
        refresh_token: refreshToken.trim(),
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-colors ${
          isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-sky-500" />
            <h3 className="font-bold text-base">Backend Configuration</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-start gap-3 text-xs text-sky-900 dark:text-sky-200">
            <Shield className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
            <p>
              Configure temporary credentials for this browser session. 
              These are used to authorize publishing and will <strong>not</strong> be saved to GitHub.
            </p>
          </div>

          {/* Section: Publish Secret */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Vercel Publish Secret</span>
            </div>
            <input
              type="password"
              value={publishSecret}
              onChange={(e) => setPublishSecret(e.target.value)}
              placeholder="Enter PUBLISH_SECRET..."
              className={`w-full p-2.5 rounded-xl border font-mono text-sm transition outline-none focus:ring-2 focus:ring-sky-500 ${
                isDarkMode ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'
              }`}
            />
          </div>

          <hr className={isDarkMode ? 'border-slate-800' : 'border-slate-100'} />

          {/* Section: Google OAuth */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              <span>Google OAuth (Overrides)</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Client ID</label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Defaults to Testing Client..."
                  className={`w-full p-2 rounded-lg border font-mono text-[11px] transition outline-none focus:ring-2 focus:ring-sky-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Client Secret</label>
                <input
                  type="password"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="Defaults to Testing Secret..."
                  className={`w-full p-2 rounded-lg border font-mono text-[11px] transition outline-none focus:ring-2 focus:ring-sky-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Refresh Token (Required for testing)</label>
                <textarea
                  value={refreshToken}
                  onChange={(e) => setRefreshToken(e.target.value)}
                  placeholder="Paste your n8n or Google Playground refresh token here..."
                  rows={2}
                  className={`w-full p-2 rounded-lg border font-mono text-[11px] transition outline-none focus:ring-2 focus:ring-sky-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg"
          >
            <Check className="w-4 h-4" />
            Apply Configuration
          </button>
        </div>
      </div>
    </div>
  );
};


