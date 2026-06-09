'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ParkingSquare, Zap, Accessibility, Car, CheckCircle2, AlertCircle } from 'lucide-react';
import { SlotCategory } from '@/types';
import { addParkingSlot } from '@/services/api';
import { useApp } from '@/context/AppContext';
import { clsx } from 'clsx';

interface AddSlotModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES: { value: SlotCategory; label: string; icon: React.ElementType; description: string; color: string; bg: string; border: string }[] = [
  {
    value: 'Standard',
    label: 'Standard',
    icon: Car,
    description: 'Regular parking for all vehicles',
    color: 'text-slate-300',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
  },
  {
    value: 'EV',
    label: 'EV Charging',
    icon: Zap,
    description: 'Electric vehicle with fast charger',
    color: 'text-[#00f0ff]',
    bg: 'bg-[#00f0ff]/10',
    border: 'border-[#00f0ff]/30',
  },
  {
    value: 'Disabled',
    label: 'Accessible',
    icon: Accessibility,
    description: 'Reserved for disabled/special access',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
];

// Slot code format examples per zone prefix
const ZONE_PREFIXES = ['AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH'];

export default function AddSlotModal({ onClose, onSuccess }: AddSlotModalProps) {
  const { addToast } = useApp();
  const [zonePrefix, setZonePrefix] = useState('AB');
  const [slotNumber, setSlotNumber] = useState('01');
  const [category, setCategory] = useState<SlotCategory>('Standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const slotCode = `${zonePrefix}${slotNumber.padStart(2, '0')}`;

  const handleNumberChange = (val: string) => {
    // Only allow numeric input, max 2 digits
    const num = val.replace(/\D/g, '').slice(0, 2);
    setSlotNumber(num || '01');
    setError('');
  };

  const handleSubmit = async () => {
    if (!slotNumber || parseInt(slotNumber, 10) < 1 || parseInt(slotNumber, 10) > 99) {
      setError('Slot number must be between 01 and 99.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await addParkingSlot(slotCode, category);
      addToast('success', 'Slot Added!', `Parking slot ${slotCode} (${category}) has been created.`);
      onSuccess();
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to add slot.';
      setError(msg);
      addToast('error', 'Failed to Add Slot', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(0,0,0,0.6)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="glass-elevated border border-white/[0.1] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/20 flex items-center justify-center">
                <ParkingSquare size={18} className="text-[#00f0ff]" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">New Parking Slot</h3>
                <p className="text-xs text-slate-500">Add a new slot to the parking system</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5">

            {/* Slot Code Builder */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
                Slot Code
              </label>
              <div className="flex items-center gap-3">
                {/* Zone Prefix Dropdown */}
                <div className="flex-1">
                  <label className="block text-[11px] text-slate-500 mb-1.5">Zone Prefix</label>
                  <select
                    value={zonePrefix}
                    onChange={(e) => setZonePrefix(e.target.value)}
                    className="input-field w-full px-3 py-2.5 rounded-lg text-sm appearance-none cursor-pointer"
                  >
                    {ZONE_PREFIXES.map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>

                {/* Divider */}
                <span className="text-slate-600 text-xl font-light mt-5">—</span>

                {/* Slot Number */}
                <div className="flex-1">
                  <label className="block text-[11px] text-slate-500 mb-1.5">Number (01–99)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={slotNumber}
                    onChange={(e) => handleNumberChange(e.target.value)}
                    maxLength={2}
                    placeholder="01"
                    className="input-field w-full px-3 py-2.5 rounded-lg text-sm font-mono text-center"
                  />
                </div>
              </div>

              {/* Live Preview */}
              <div className="mt-3 flex items-center justify-center">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <span className="text-slate-500 text-xs">Slot Code Preview:</span>
                  <span className="font-mono font-bold text-[#00f0ff] text-lg tracking-wider">{slotCode}</span>
                </div>
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
                Slot Category
              </label>
              <div className="space-y-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={clsx(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left',
                        isSelected
                          ? `${cat.bg} ${cat.border} ${cat.color}`
                          : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:border-white/[0.15] hover:text-slate-200'
                      )}
                    >
                      <div className={clsx(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                        isSelected ? cat.bg : 'bg-white/[0.04]'
                      )}>
                        <Icon size={16} className={isSelected ? cat.color : 'text-slate-500'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={clsx('text-sm font-semibold', isSelected ? cat.color : 'text-slate-300')}>
                          {cat.label}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{cat.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={16} className={cat.color} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
              >
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/[0.06] flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ParkingSquare size={15} />
                  Add Slot
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
