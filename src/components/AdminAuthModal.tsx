import React, { useState, useEffect } from 'react';
import { X, Lock, KeyRound, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, UserCheck, LogOut } from 'lucide-react';
import { api } from '../utils/api.ts';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any | null;
  onLoginSuccess: (user: any) => void;
  onLogout: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [testingAccounts, setTestingAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadTestAccounts() {
      try {
        const accounts = await api.getTestingAccounts();
        setTestingAccounts(accounts);
      } catch (e) {
        console.error('Failed to load test accounts:', e);
      }
    }
    loadTestAccounts();
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await api.login(email, password);
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillAccount = (acc: any) => {
    setEmail(acc.email);
    setPassword(acc.password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden text-neutral-900 dark:text-neutral-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-semibold leading-tight">
                Staff & Operations Authentication
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Prisma Database RBAC Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          
          {currentUser ? (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
              <UserCheck className="w-10 h-10 text-emerald-500 mx-auto" />
              <div>
                <h3 className="text-lg font-serif font-bold text-neutral-900 dark:text-neutral-100">
                  Currently Signed In as {currentUser.name}
                </h3>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500 text-neutral-950">
                  {currentUser.role}
                </span>
                <p className="text-xs text-neutral-500 mt-1">{currentUser.email}</p>
              </div>

              <div className="pt-3 flex gap-3 justify-center">
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl text-xs font-medium bg-neutral-900 text-white dark:bg-amber-400 dark:text-neutral-950 font-bold"
                >
                  Enter Operations Console
                </button>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block mb-1">
                    Staff Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. admin@laura.com"
                    className="w-full text-xs p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-medium text-xs bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300 disabled:opacity-50 transition-colors shadow-sm font-bold flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Authenticating with Prisma...' : 'Sign In to Operations Panel'}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {/* Testing Admin Accounts Section */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    <span>1-Click Testing Admin Credentials</span>
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">Bcrypt verified</span>
                </div>

                <div className="space-y-2">
                  {testingAccounts.map(acc => (
                    <div
                      key={acc.email}
                      className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex items-center justify-between text-xs hover:border-amber-500/40 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100">{acc.role}</span>
                          <span className="text-[10px] font-mono text-neutral-500">{acc.email}</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{acc.name}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleFillAccount(acc)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-amber-400 hover:text-neutral-950 dark:hover:bg-amber-400 dark:hover:text-neutral-950 font-medium transition-colors shrink-0"
                      >
                        Auto-fill
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
