'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, Plus, X, ChevronDown, Layers, CheckCircle2, AlertTriangle, RefreshCw, Lock, Unlock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { fetchParkingSlots, addParkingSlot, updateSlotStatus } from '@/services/api';
import { ParkingSlot, SlotCategory } from '@/types';
import { clsx } from 'clsx';

export default function AdminMapPage() {
  const { addToast } = useApp();
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [updatingSlotId, setUpdatingSlotId] = useState<string | null>(null);

  // Form State untuk menambah Slot Baru
  const [slotCode, setSlotCode] = useState('');
  const [category, setCategory] = useState<SlotCategory>('Standard');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const data = await fetchParkingSlots();
      setSlots(data);
    } catch {
      addToast('error', 'Failed', 'Could not load parking slots.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotCode.trim()) return;

    setIsSubmitting(true);
    try {
      const newSlot = await addParkingSlot(slotCode, category);
      setSlots((prev) => [...prev, newSlot]);
      addToast('success', 'Slot Created', `Parking slot ${slotCode.toUpperCase()} added to grid.`);
      setShowAddModal(false);
      setSlotCode('');
    } catch (error: any) {
      addToast('error', 'Creation Failed', error.message || 'Could not insert new slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // FUNGSI BARU: Mengunci/Membuka slot parkir secara manual
  const handleToggleLock = async (slot: ParkingSlot) => {
    setUpdatingSlotId(slot.slotID);
    const newOccupiedState = !slot.occupied;

    try {
      const updatedSlot = await updateSlotStatus(slot.slotID, newOccupiedState);
      if (updatedSlot) {
        setSlots((prev) =>
          prev.map((s) => s.slotID === slot.slotID ? { ...s, occupied: newOccupiedState } : s)
        );
        addToast(
          newOccupiedState ? 'warning' : 'success',
          'Status Changed',
          `Slot ${slot.coordinate} is now ${newOccupiedState ? 'LOCKED/BOOKED' : 'AVAILABLE'}.`
        );
      }
    } catch (error: any) {
      addToast('error', 'Update Failed', 'Could not change slot status.');
    } finally {
      setUpdatingSlotId(null);
    }
  };

  if (loading && slots.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-2 border-[#00f0ff]/30 border-t-[#00f0ff] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header View */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Live Map & Grid</h1>
          <p className="text-slate-400">Monitor occupancy and manage parking structures.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadSlots} className="p-2.5 glass border border-white/[0.08] hover:bg-white/[0.05] rounded-xl text-slate-400 hover:text-white transition-colors">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary px-5 py-3 rounded-xl flex items-center gap-2"
          >
            <Plus size={18} />
            Add Parking Slot
          </button>
        </div>
      </div>

      {/* Grid Denah Parkir Dinamis */}
      <div className="glass-elevated rounded-2xl border border-white/[0.08] p-8">
        <div className="flex items-center gap-2 text-white font-bold mb-6 text-sm tracking-wide uppercase">
          <Layers size={16} className="text-[#00f0ff]" />
          Ground Floor · Dynamic Layout
        </div>

        {slots.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No slots built yet. Click "Add Parking Slot" to construct the grid.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {slots.map((slot) => (
              <div
                key={slot.coordinate}
                className={clsx(
                  "p-5 rounded-xl border flex flex-col items-center justify-center text-center transition-all relative overflow-hidden group",
                  slot.occupied
                    ? "bg-red-500/[0.04] border-red-500/20 text-red-400"
                    : "bg-emerald-500/[0.04] border-emerald-500/20 text-emerald-400"
                )}
              >
                {/* Kode Kordinat Slot Terbaca Sesuai slot_code */}
                <span className="font-mono font-bold text-lg block text-white mb-1">
                  {slot.coordinate}
                </span>

                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">
                  {slot.category}
                </span>

                {/* Indikator Status Ketersediaan */}
                <div className="mt-3 flex items-center gap-1 text-xs">
                  {slot.occupied ? (
                    <>
                      <AlertTriangle size={12} className="text-red-500" />
                      <span className="text-red-500/80 font-medium">Occupied</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      <span className="text-emerald-400/80 font-medium">Available</span>
                    </>
                  )}
                </div>

                {/* Tombol LOCK / UNLOCK Rahasia (Muncul saat Hover) */}
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                  <button
                    onClick={() => handleToggleLock(slot)}
                    disabled={updatingSlotId === slot.slotID}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all",
                      slot.occupied
                        ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 border border-emerald-500/30"
                        : "bg-red-500/20 text-red-400 hover:bg-red-500/40 border border-red-500/30"
                    )}
                  >
                    {updatingSlotId === slot.slotID ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : slot.occupied ? (
                      <><Unlock size={14} /> Unlock</>
                    ) : (
                      <><Lock size={14} /> Lock</>
                    )}
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Penambahan Slot Baru Khusus Admin */}
      <AnimatePresence>
        {/* ... (Kode Modal Add Slot tidak ada yang berubah, persis seperti milikmu) ... */}
        {showAddModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <motion.div
              className="relative glass-elevated rounded-2xl border border-white/[0.08] w-full max-w-sm overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Construct New Slot</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06]">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateSlot} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Slot Code / Name</label>
                  <input
                    type="text"
                    value={slotCode}
                    onChange={(e) => setSlotCode(e.target.value)}
                    placeholder="e.g., B-102"
                    className="input-field w-full px-4 py-3 rounded-xl text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Category</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as SlotCategory)}
                      className="input-field w-full px-4 py-3 rounded-xl text-sm appearance-none pr-8"
                    >
                      {['Standard', 'EV', 'Disabled'].map((cat) => (
                        <option key={cat} value={cat}>{cat} Slot</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-[#0a0e17]/40 border-t-[#0a0e17] rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus size={16} /> Deploy Slot
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}