'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Cpu, ArrowRight, ShieldCheck } from 'lucide-react';
import { login } from '@/services/api';
import { useApp } from '@/context/AppContext';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser, addToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(email, password);
      if (user) {
        setCurrentUser(user);

        // Pengecekan Role Pintar: Otomatis melempar ke halaman yang sesuai
        if (user.role === 'admin') {
          addToast('success', 'Admin Access Granted', `Welcome back, ${user.name}`);
          router.push('/admin');
        } else {
          addToast('success', 'Login Successful', `Welcome, ${user.name}`);
          router.push('/dashboard');
        }
      } else {
        addToast('error', 'Login Failed', 'Invalid email or password.');
      }
    } catch (error: any) {
      addToast('error', 'Login Failed', error?.message || 'Invalid credentials. Please try again.');
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
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          System Online
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Hero */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <div className="mb-8">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#00f0ff] bg-[#00f0ff]/10 px-4 py-1.5 rounded-full border border-[#00f0ff]/20">
                Next-Gen Parking Infrastructure
              </span>
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              Smart Parking<br />
              <span className="text-[#00f0ff] glow-neon-text">Control Center</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-10">
              Real-time occupancy monitoring, intelligent slot reservations, and EV charging management — all in one unified platform.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3">
              {['Real-time Monitoring', 'EV Charging', '30-min Hold System', 'QR Tap-Out'].map((f) => (
                <span
                  key={f}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700/60 border border-white/[0.08] text-sm text-slate-300"
                >
                  <ShieldCheck size={14} className="text-[#00f0ff]" />
                  {f}
                </span>
              ))}
            </div>

          </motion.div>

          {/* Right: Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass-elevated rounded-2xl border border-white/[0.08] overflow-hidden">
              {/* Form Header */}
              <div className="px-8 py-7 border-b border-white/[0.06] bg-gradient-to-r from-[#00f0ff]/[0.05] to-transparent">
                <h2 className="text-2xl font-bold text-white">LOGIN</h2>
              </div>

              <form onSubmit={handleLogin} className="px-8 py-7 space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@gmail.com"
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
                      id="password"
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

                {/* Login button yang sudah diubah */}
                <button
                  type="submit"
                  id="login-btn"
                  disabled={isLoading}
                  className="btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-[#0a0e17]/40 border-t-[#0a0e17] rounded-full animate-spin" />
                  ) : (
                    <>
                      SECURE LOGIN
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-slate-500 mt-4">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" className="text-[#00f0ff] hover:underline font-medium">
                    Sign Up →
                  </Link>
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-white/[0.06] px-8 py-4 flex items-center justify-between text-xs text-slate-600">
        <p>© 2026 Metro Park Urban Systems. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            System Status
          </span>
        </div>
      </footer>
    </div>
  );
}