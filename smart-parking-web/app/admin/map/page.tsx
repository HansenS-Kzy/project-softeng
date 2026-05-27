'use client';

import { motion } from 'framer-motion';
import { Map } from 'lucide-react';

export default function AdminMapPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Live Map</h1>
          <p className="text-slate-400">Monitor parking zones and slots in real-time.</p>
        </div>
      </div>
      
      <div className="glass-elevated rounded-2xl border border-white/[0.08] p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <Map size={48} className="text-slate-500 mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2">Live Map Module</h2>
        <p className="text-slate-400 max-w-md">The interactive live map is currently being configured and will be available soon.</p>
      </div>
    </motion.div>
  );
}
