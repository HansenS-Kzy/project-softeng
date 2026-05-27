'use client';

import { useState } from 'react';
import { ParkingSlot, Vehicle } from '@/types';
import ParkingSlotCard from './ParkingSlotCard';
import ReservationModal from './ReservationModal';
import { LayoutGrid, Zap, Accessibility, Circle } from 'lucide-react';
import { clsx } from 'clsx';

type FilterType = 'All' | 'Standard' | 'EV' | 'Disabled';

interface MapVisualUIProps {
  slots: ParkingSlot[];
  vehicles: Vehicle[];
  onReservationSuccess?: (reservationID: string) => void;
}

export default function MapVisualUI({ slots, vehicles, onReservationSuccess }: MapVisualUIProps) {
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [filter, setFilter] = useState<FilterType>('All');

  const filteredSlots = filter === 'All' ? slots : slots.filter((s) => s.category === filter);

  const stats = {
    total: slots.length,
    available: slots.filter((s) => !s.occupied).length,
    occupied: slots.filter((s) => s.occupied).length,
    ev: slots.filter((s) => s.category === 'EV' && !s.occupied).length,
  };

  const filters: { label: string; value: FilterType; icon: React.ElementType; color: string }[] = [
    { label: 'All', value: 'All', icon: LayoutGrid, color: 'text-slate-400' },
    { label: 'Standard', value: 'Standard', icon: Circle, color: 'text-slate-400' },
    { label: 'EV Fast', value: 'EV', icon: Zap, color: 'text-[#00f0ff]' },
    { label: 'Access', value: 'Disabled', icon: Accessibility, color: 'text-blue-400' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Slots', value: stats.total, color: 'text-slate-300' },
          { label: 'Available', value: stats.available, color: 'text-emerald-400' },
          { label: 'Occupied', value: stats.occupied, color: 'text-red-400' },
          { label: 'EV Free', value: stats.ev, color: 'text-[#00f0ff]' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl px-4 py-3 text-center">
            <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all',
              filter === f.value
                ? 'bg-[#00f0ff]/10 border-[#00f0ff]/30 text-[#00f0ff]'
                : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-white'
            )}
          >
            <f.icon size={14} className={filter === f.value ? 'text-[#00f0ff]' : f.color} />
            {f.label}
          </button>
        ))}

        {/* Legend */}
        <div className="ml-auto hidden lg:flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-slate-600/50 border border-slate-500/40" />
            Standard
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#00f0ff]/10 border border-[#00f0ff]/40" />
            EV
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-500/10 border border-blue-500/40" />
            Disabled
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-500/10 border border-red-500/30" />
            Occupied
          </span>
        </div>
      </div>

      {/* Parking Grid */}
      <div className="grid-bg rounded-2xl border border-white/[0.06] p-6 flex-1">
        {/* Zone Labels */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Ground Floor · Parking Grid
          </h3>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {filteredSlots.map((slot, index) => (
            <ParkingSlotCard
              key={slot.slotID}
              slot={slot}
              index={index}
              onClick={setSelectedSlot}
            />
          ))}
        </div>

        {filteredSlots.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <p className="text-4xl mb-3">🚘</p>
            <p className="font-semibold">No slots found for this filter.</p>
          </div>
        )}
      </div>

      {/* Reservation Modal */}
      {selectedSlot && (
        <ReservationModal
          slot={selectedSlot}
          vehicles={vehicles}
          onClose={() => setSelectedSlot(null)}
          onSuccess={(id) => {
            setSelectedSlot(null);
            onReservationSuccess?.(id);
          }}
        />
      )}
    </div>
  );
}
