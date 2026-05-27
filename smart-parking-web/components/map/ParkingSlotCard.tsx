'use client';

import { ParkingSlot } from '@/types';
import { Car, Zap, Accessibility, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface ParkingSlotCardProps {
  slot: ParkingSlot;
  onClick: (slot: ParkingSlot) => void;
  index: number;
}

export default function ParkingSlotCard({ slot, onClick, index }: ParkingSlotCardProps) {
  const getCategoryIcon = () => {
    switch (slot.category) {
      case 'EV':
        return <Zap size={18} className="text-[#00f0ff]" />;
      case 'Disabled':
        return <Accessibility size={18} className="text-blue-400" />;
      default:
        return <Car size={18} className="text-slate-400" />;
    }
  };

  const getSlotClass = () => {
    if (slot.occupied) return 'slot-occupied';
    switch (slot.category) {
      case 'EV':
        return 'slot-ev';
      case 'Disabled':
        return 'slot-disabled';
      default:
        return 'slot-standard';
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      onClick={() => !slot.occupied && onClick(slot)}
      disabled={slot.occupied}
      className={clsx(
        'slot-card rounded-xl p-4 flex flex-col items-center justify-center gap-2 min-h-[100px] relative',
        getSlotClass()
      )}
    >
      {/* Category icon */}
      <div className="relative">
        {getCategoryIcon()}
        {slot.occupied && (
          <Lock
            size={10}
            className="absolute -top-1 -right-2 text-red-400"
          />
        )}
      </div>

      {/* Slot ID */}
      <span
        className={clsx(
          'font-mono text-sm font-bold tracking-wider',
          slot.occupied
            ? 'text-red-400/60'
            : slot.category === 'EV'
              ? 'text-[#00f0ff]'
              : slot.category === 'Disabled'
                ? 'text-blue-400'
                : 'text-slate-300'
        )}
      >
        {slot.slotID}
      </span>

      {/* Status indicator */}
      <div
        className={clsx(
          'w-2 h-2 rounded-full',
          slot.occupied ? 'bg-red-500' : 'bg-emerald-500'
        )}
      />

      {/* EV neon glow effect */}
      {slot.category === 'EV' && !slot.occupied && (
        <div className="absolute inset-0 rounded-xl bg-[#00f0ff]/[0.03] pointer-events-none" />
      )}
    </motion.button>
  );
}
