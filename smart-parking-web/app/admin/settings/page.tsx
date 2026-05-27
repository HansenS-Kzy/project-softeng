'use client';

import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">System Settings</h1>
          <p className="text-slate-400">Configure global parameters and hardware integrations.</p>
        </div>
      </div>
      
      <div className="glass-elevated rounded-2xl border border-white/[0.08] p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <Settings size={48} className="text-slate-500 mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2">Configuration</h2>
        <p className="text-slate-400 max-w-md">System configuration options are currently being initialized.</p>
      </div>
    </motion.div>
  );
}
