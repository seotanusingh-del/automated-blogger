import React, { useState } from 'react';
import { X, Sparkles, Check, Key, ShieldCheck, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { AiProvider, getAiProvider, setAiProvider, getDeepSeekApiKey, setDeepSeekApiKey, getGeminiApiKey, setGeminiApiKey } from '../services/deepseek';

interface AiProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onSaved: (msg: string) => void;
}

export const AiProviderModal: React.FC<AiProviderModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onSaved
}) => {
  const [provider, setProviderState] = useState<AiProvider>(() => getAiProvider());
  const [geminiKeyInput, setGeminiKeyInput] = useState<string>(() => getGeminiApiKey());
  const [deepSeekKeyInput, setDeepSeekKeyInput] = useState<string>(() => getDeepSeekApiKey());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setAiProvider(provider);
    setGeminiApiKey(geminiKeyInput);
    setDeepSeekApiKey(deepSeekKeyInput);
    onSaved(`AI settings saved. Active provider: ${provider === 'gemini' ? 'Gemini 2.0 Flash' : 'DeepSeek'}`);
    onClose();
  };

  const handleTestKey = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const activeKey = provider === 'gemini' ? geminiKeyInput : deepSeekKeyInput;
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airlineName: 'Test Airline',
          city: 'Test City',
          country: 'United States',
          keyword: 'test booking guide',
          tfn: '+1 (888) 794-3464',
          geminiApiKey: geminiKeyInput || undefined,
          apiKey: deepSeekKeyInput || undefined,
          blogType: 'airlines'
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setTestResult({
          ok: true,
          message: `Generation verified! Model used: ${data.provider || provider}`
        });
      } else {
        setTestResult({
          ok: false,
          message: data.error || 'Test generation failed. Check your API key.'
        });
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: err?.message || 'Connection test failed.'
      });
    } finally {
      setIsTesting(false);
    }
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
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">AI Engine Configuration</h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Choose your AI engine for generating high-ranking SEO blog content.
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

        {/* Provider Selector Tabs */}
        <div className="py-4 space-y-4">
          <div>
            <label className="block text-xs font-bold mb-2 uppercase tracking-wider opacity-60">Preferred Model Provider</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProviderState('gemini')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                  provider === 'gemini'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : isDarkMode ? 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>Gemini 2.0 Flash</span>
                  {provider === 'gemini' && <Check className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Fast, rich structuring & Google AI Studio</span>
              </button>

              <button
                type="button"
                onClick={() => setProviderState('deepseek')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                  provider === 'deepseek'
                    ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                    : isDarkMode ? 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs">
                  <span>DeepSeek V3 / Chat</span>
                  {provider === 'deepseek' && <Check className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>In-depth reasoning & conversational depth</span>
              </button>
            </div>
          </div>

          {/* Key Input based on chosen provider */}
          {provider === 'gemini' ? (
            <div>
              <label className="block text-xs font-bold mb-1 opacity-80">
                Gemini API Key
              </label>
              <input
                type="password"
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                placeholder="AIzaSy... (leave blank to use server environment key)"
                className={`w-full text-xs font-mono rounded-lg p-2.5 border outline-none transition ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500 focus:bg-white'
                }`}
              />
              <span className="text-[10px] text-slate-500 mt-1.5 block leading-relaxed">
                Get free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline font-bold">Google AI Studio</a>. Saved only in this browser session.
              </span>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold mb-1 opacity-80">
                DeepSeek API Key
              </label>
              <input
                type="password"
                value={deepSeekKeyInput}
                onChange={(e) => setDeepSeekKeyInput(e.target.value)}
                placeholder="sk-... (leave blank to use server environment key)"
                className={`w-full text-xs font-mono rounded-lg p-2.5 border outline-none transition ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-sky-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                }`}
              />
              <span className="text-[10px] text-slate-500 mt-1.5 block leading-relaxed">
                Get key from <a href="https://platform.deepseek.com/" target="_blank" rel="noreferrer" className="text-sky-500 hover:underline font-bold">DeepSeek Platform</a>. Saved only in this browser session.
              </span>
            </div>
          )}

          {/* Test Button & Result */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTesting}
              className={`w-full py-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                isDarkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing Connection...' : 'Test AI Connection'}</span>
            </button>

            {testResult && (
              <div className={`mt-2.5 p-3 rounded-lg border text-xs flex items-center gap-2.5 animate-in slide-in-from-top-1 ${
                testResult.ok 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              }`}>
                {testResult.ok ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span className="font-medium">{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`pt-4 border-t flex items-center justify-between ${
          isDarkMode ? 'border-slate-800' : 'border-slate-100'
        }`}>
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
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            Save AI Settings
          </button>
        </div>
      </div>
    </div>
  );
};
