import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';

interface PasswordGateViewProps {
  brandName?: string;
  tagline?: string;
  onUnlock?: (password: string) => boolean | Promise<boolean>;
}

export const PasswordGateView: React.FC<PasswordGateViewProps> = ({
  brandName = 'Our Store',
  tagline,
  onUnlock
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError(false);

    try {
      if (onUnlock) {
        const success = await onUnlock(password);
        if (!success) setError(true);
      } else {
        // Fallback demo unlock
        if (password.length > 0) {
          sessionStorage.setItem('storefront_password_unlocked', 'true');
          window.location.reload();
        }
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-[var(--theme-border)] rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <Lock size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{brandName}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {tagline || 'This store is currently protected. Enter the password below to gain early access.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Storefront Password
            </label>
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Enter password..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-200 dark:border-red-900/30">
              <ShieldAlert size={14} className="shrink-0" />
              <span>Incorrect password. Please contact the store owner.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Enter Storefront'}
            <ArrowRight size={13} />
          </button>
        </form>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
          <p className="text-[11px] text-slate-400">
            Are you the store owner? Log in to your <a href="/admin" className="text-indigo-600 hover:underline">Admin Portal</a> to disable password protection in Online Store Settings.
          </p>
        </div>
      </div>
    </div>
  );
};

