'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User, Cpu, ArrowRight, ShieldCheck } from 'lucide-react';
import { signup } from '@/services/api';
import { useApp } from '@/context/AppContext';

export default function SignupPage() {
  const router = useRouter();
  const { setCurrentUser, addToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await signup(name, email, password);
      setCurrentUser(user);
      addToast('success', 'Account Created', `Welcome to Metro Park, ${user.name}!`);
      router.push('/dashboard');
    } catch {
      addToast('error', 'Signup Failed', 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid-bg flex flex-col">
      {/* Top bar */}
      <header className="glass border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f0ff] to-[#0891b2] flex items-center justify-center">
            <Cpu size={15} className="text-[#0a0e17]" />
          </div>
          <span className="font-bold tracking-widest uppercase text-white text-sm">
            Metro<span className="text-[#00f0ff]"> Park</span>
          </span>
        </div>
        <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
          ← Back to Login
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass-elevated rounded-2xl border border-white/[0.08] overflow-hidden">
            {/* Header */}
            <div className="px-8 py-7 border-b border-white/[0.06] bg-gradient-to-r from-[#00f0ff]/[0.05] to-transparent">
              <h1 className="text-2xl font-bold text-white">Create Account</h1>
              <p className="text-slate-400 text-sm mt-1">
                Access the next generation of urban mobility.
              </p>
            </div>

            <form onSubmit={handleSignup} className="px-8 py-7 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    id="signup-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Commander Shepard"
                    className="input-field w-full pl-11 pr-4 py-3.5 rounded-xl text-sm"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    id="signup-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@metropark.sys"
                    className="input-field w-full pl-11 pr-4 py-3.5 rounded-xl text-sm"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    id="signup-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="input-field w-full pl-11 pr-12 py-3.5 rounded-xl text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="create-account-btn"
                disabled={isLoading}
                className="btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#0a0e17]/40 border-t-[#0a0e17] rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link href="/" className="text-[#00f0ff] hover:underline font-medium">
                  Login
                </Link>
              </p>
            </form>

            {/* Trust Badges */}
            <div className="px-8 pb-6 flex items-center justify-center gap-6">
              {[
                { icon: ShieldCheck, label: 'Encrypted' },
                { icon: ShieldCheck, label: 'ISO 27001' },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <b.icon size={12} />
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="glass border-t border-white/[0.06] px-8 py-4 flex items-center justify-between text-xs text-slate-600">
        <p>© 2024 Metro Park Urban Systems. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
