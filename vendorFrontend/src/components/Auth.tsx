import React, { useState } from 'react';
import { Lock, Mail, User, Briefcase, Key } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (token: string, user: any) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loading || setLoading(true);

    const baseUrl = 'http://localhost:5001';
    const endpoint = isLogin ? `${baseUrl}/api/auth/login` : `${baseUrl}/api/auth/register`;
    const payload = isLogin 
      ? { email, password }
      : { companyName, fullName, email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-screen w-screen h-screen flex items-center justify-center bg-[#ededed] p-4 font-sans select-none overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 size-96 rounded-full bg-neutral-200/50 filter blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 size-96 rounded-full bg-neutral-300/40 filter blur-3xl opacity-60 pointer-events-none" />

      <div className="relative w-full max-w-md bg-white border border-[#dedede] rounded-xl shadow-xl p-8 z-10 animate-fade-in backdrop-blur-xs">
        <div className="flex flex-col items-center mb-8">
          <div className="size-12 rounded-lg bg-black flex items-center justify-center text-white mb-3 shadow-md" title="VendorBridge Logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="8" width="6" height="8" rx="1.5" fill="white" />
              <rect x="16" y="8" width="6" height="8" rx="1.5" fill="white" />
              <rect x="8" y="11" width="8" height="2" fill="white" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-black">VendorBridge</h1>
          <p className="text-xs text-neutral-500 font-mono mt-1 uppercase tracking-wider">
            {isLogin ? 'Procurement & Vendor ERP' : 'Create Organization & Admin'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-neutral-400 mb-1">Company / Organization Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. KSV Corp"
                    className="w-full text-xs pl-9 pr-3 py-2 bg-[#f9f9f9] border border-[#dedede] rounded outline-none focus:border-black focus:bg-white transition-all text-black font-semibold"
                  />
                  <Briefcase className="absolute left-3 top-2.5 size-3.5 text-neutral-400" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-neutral-400 mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Shaban Haider"
                    className="w-full text-xs pl-9 pr-3 py-2 bg-[#f9f9f9] border border-[#dedede] rounded outline-none focus:border-black focus:bg-white transition-all text-black font-semibold"
                  />
                  <User className="absolute left-3 top-2.5 size-3.5 text-neutral-400" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase text-neutral-400 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@ksv.com"
                className="w-full text-xs pl-9 pr-3 py-2 bg-[#f9f9f9] border border-[#dedede] rounded outline-none focus:border-black focus:bg-white transition-all text-black font-semibold font-mono"
              />
              <Mail className="absolute left-3 top-2.5 size-3.5 text-neutral-400" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase text-neutral-400 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-2 bg-[#f9f9f9] border border-[#dedede] rounded outline-none focus:border-black focus:bg-white transition-all text-black font-semibold font-mono"
              />
              <Lock className="absolute left-3 top-2.5 size-3.5 text-neutral-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-black text-white hover:bg-neutral-800 rounded font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm mt-6 cursor-pointer"
          >
            {loading ? (
              <svg className="animate-spin size-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                <Key className="size-3.5" />
                <span>{isLogin ? 'Sign In To Portal' : 'Register Organization'}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-[#f0f0f0] text-center">
          <p className="text-xs text-neutral-500 font-medium">
            {isLogin ? "Need to register a new organization?" : "Already have an account?"}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="ml-1 text-black font-bold underline hover:text-neutral-600 transition-colors"
            >
              {isLogin ? 'Register Organization' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] font-mono text-neutral-400">
        © 2026 VendorBridge Procurement Systems LLC • Secured via JWT & SQLite
      </div>
    </div>
  );
}
