import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { T, I } from '../components/admin/theme';

export default function LoginPage() {
  const { login, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      // error displayed via context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] flex items-center justify-center p-4" style={{ background: T.mintFaint }}>
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: `linear-gradient(135deg, ${T.teal}, ${T.tealLight})`, boxShadow: `0 12px 32px ${T.glow}` }}>
            <span className="text-white text-3xl font-bold" style={{ fontFamily: 'DM Serif Display' }}>A</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: T.navy, fontFamily: 'DM Serif Display' }}>
            Dr. Akshath
          </h1>
          <p className="text-xs tracking-widest font-bold uppercase mt-0.5" style={{ color: T.tealLight }}>
            Admin Panel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: T.navy, opacity: 0.6 }}>
              Email
            </label>
            <div className="flex items-center gap-2 rounded-xl px-3 py-3 border focus-within:border-teal-400 transition-colors"
              style={{ border: `1.5px solid ${T.mint}` }}>
              <span style={{ color: T.tealLight }}><I n="user" s={16} /></span>
              <input
                type="email"
                autoComplete="email"
                placeholder="doctor@clinic.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: T.navy, fontFamily: 'Outfit' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: T.navy, opacity: 0.6 }}>
              Password
            </label>
            <div className="flex items-center gap-2 rounded-xl pl-3 pr-2 py-2.5 border focus-within:border-teal-400 transition-colors"
              style={{ border: `1.5px solid ${T.mint}` }}>
              <span className="flex-shrink-0" style={{ color: T.tealLight }}><I n="lock" s={16} /></span>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="flex-1 min-w-0 bg-transparent outline-none text-sm"
                style={{ color: T.navy, fontFamily: 'Outfit' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex-shrink-0 p-1.5 hover:bg-black/5 rounded-lg transition-colors"
                style={{ color: T.tealLight }}
              >
                <I n={showPassword ? "eyeOff" : "eye"} s={18} />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-100">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-sm mt-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${T.teal}, ${T.tealLight})`, boxShadow: `0 8px 24px ${T.glow}`, fontFamily: 'Outfit' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
