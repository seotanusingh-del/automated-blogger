import React, { useState } from 'react';
import { Lock, CheckCircle2, AlertCircle, LogOut, Mail, Linkedin, Instagram } from 'lucide-react';

interface InactivityLockModalProps {
  isOpen: boolean;
  onUnlock: () => void;
  onFullLogout: () => void;
  isDarkMode: boolean;
}

const ADMIN_OTP = '6307500844';

export const InactivityLockModal: React.FC<InactivityLockModalProps> = ({
  isOpen,
  onUnlock,
  onFullLogout,
  isDarkMode
}) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim() === ADMIN_OTP) {
      setOtp('');
      setError(null);
      onUnlock();
    } else {
      setError('Invalid verification code.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className={`max-w-sm w-full p-6 rounded-2xl border shadow-2xl transition-all ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="text-center space-y-2 mb-5">
          <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold">Session Locked</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Security OTP
            </label>
            <input
              type="password"
              autoComplete="off"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={`w-full p-2.5 text-center text-sm tracking-widest font-mono rounded-lg border outline-none font-bold transition ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-sky-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-500'
              }`}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Verify OTP</span>
          </button>

          <button
            type="button"
            onClick={onFullLogout}
            className="w-full py-2 rounded-lg border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </form>

        {/* Developer Attribution */}
        <div className="pt-4 mt-5 border-t border-slate-200 dark:border-slate-800 text-center space-y-2">
          <div className="text-[11px] font-medium text-slate-500">
            Developed by Shashank Rajput
          </div>
          <div className="flex items-center justify-center gap-3">
            <a
              href="https://mail.google.com/mail/u/0/?fs=1&to=aws.shashanksingh@gmail.com&tf=cm"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-sky-600 transition"
              title="Email"
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://www.linkedin.com/in/shashankrajputx/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition"
              title="LinkedIn"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://www.instagram.com/shashankrajput.__/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 transition"
              title="Instagram"
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
