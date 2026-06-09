'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, Wifi } from 'lucide-react';
import MapVisualUI from '@/components/map/MapVisualUI';
import { fetchParkingSlots, fetchUserVehicles } from '@/services/api';
import { useApp } from '@/context/AppContext';
import { ParkingSlot, Vehicle } from '@/types';

export default function DashboardPage() {
  const { currentUser } = useApp();
  const router = useRouter();
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [slotsData, vehiclesData] = await Promise.all([
          fetchParkingSlots(),
          currentUser ? fetchUserVehicles(currentUser.userID) : Promise.resolve([]),
        ]);
        setSlots(slotsData);
        setVehicles(vehiclesData);
      } catch (err) {
        console.error('Failed to load parking data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentUser]);

  const handleReservationSuccess = (reservationID: string) => {
    router.push('/dashboard/bookings');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#00f0ff]/30 border-t-[#00f0ff] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading parking grid...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Parking Grid</h1>
          <p className="text-slate-400">
            Real-time bay availability and slot reservation interface.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/[0.08]">
          <Wifi size={14} className="text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Live Sync
          </span>
        </div>
      </div>

      <MapVisualUI
        slots={slots}
        vehicles={vehicles}
        onReservationSuccess={handleReservationSuccess}
      />
    </motion.div>
  );
}
