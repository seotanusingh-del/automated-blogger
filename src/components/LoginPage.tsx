import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, CheckCircle2, AlertCircle, Mail, Linkedin, Instagram } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  isDarkMode: boolean;
}

const ADMIN_USER = '8081368879';
const ADMIN_PASS = 'seo.8268';
const ADMIN_OTP = '6307500844';

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, isDarkMode }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username.trim() === ADMIN_USER && password.trim() === ADMIN_PASS) {
      setStep(2);
    } else {
      setError('Invalid username or password.');
    }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.trim() === ADMIN_OTP) {
      onLoginSuccess();
    } else {
      setError('Invalid verification code.');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between p-6 transition-colors font-sans ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      <div className="flex-1 flex items-center justify-center">
        <div className={`w-full max-w-sm p-8 rounded-2xl border shadow-xl transition-all ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          
          {/* Header */}
          <div className="text-center space-y-3 mb-6">
            <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Admin Authentication</h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Username & Password */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Username</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full p-2.5 text-xs rounded-lg border outline-none font-medium transition ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-sky-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full p-2.5 text-xs rounded-lg border outline-none font-medium transition ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-sky-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-500'
                  }`}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* STEP 2: 2-Step OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Security OTP</label>
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
                onClick={() => { setStep(1); setError(null); }}
                className="w-full text-center text-xs text-slate-500 hover:underline pt-1"
              >
                ← Back
              </button>
            </form>
          )}

          {/* Developer Attribution Inside Login Box */}
          <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 text-center space-y-2">
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Developed by Shashank Rajput
            </div>
            <div className="flex items-center justify-center gap-3">
              <a
                href="https://mail.google.com/mail/u/0/?fs=1&to=aws.shashanksingh@gmail.com&tf=cm"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-sky-600 transition"
                title="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/shashankrajputx/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 transition"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/shashankrajput.__/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 transition"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
