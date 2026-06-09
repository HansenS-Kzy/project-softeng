'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, RefreshCw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  fetchReservations,
  fetchParkingSlots,
  fetchAllUsers,
  fetchAllVehicles,
} from '@/services/api';
import { Reservation, ParkingSlot, User as UserType, Vehicle } from '@/types';
import ReservationsTable from '@/components/admin/ReservationsTable';
import AddSlotModal from '@/components/admin/AddSlotModal';

export default function AdminPage() {
  const { addToast } = useApp();

  // State untuk Data
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // State untuk Loading & Modal
  const [loading, setLoading] = useState(true);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);

  // Fungsi Fetch Semua Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [resData, slotData, userData, vehData] = await Promise.all([
        fetchReservations(),
        fetchParkingSlots(),
        fetchAllUsers(), // Tetap di-fetch agar nama user di tabel reservasi bisa muncul
        fetchAllVehicles(),
      ]);
      setReservations(resData);
      setSlots(slotData);
      setUsers(userData);
      setVehicles(vehData);
    } catch {
      addToast('error', 'Data Load Failed', 'Could not fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#00f0ff]/30 border-t-[#00f0ff] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading Control Center...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header Utama */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Control Center</h1>
          <p className="text-slate-400">Real-time occupancy analytics and system management.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} className="p-2.5 glass border border-white/[0.08] hover:bg-white/[0.05] rounded-xl text-slate-400 hover:text-white transition-colors">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowAddSlotModal(true)}
            className="btn-primary px-4 py-2.5 rounded-xl flex items-center gap-2"
          >
            <Plus size={16} />
            New Parking Slot
          </button>
        </div>
      </div>

      {/* SECTION 1: Active Reservations */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
          Active Reservations
        </h2>
        <ReservationsTable
          reservations={reservations}
          users={users}
          vehicles={vehicles}
          slots={slots}
          onRefresh={loadData}
        />
      </div>

      {/* Add Parking Slot Modal */}
      {showAddSlotModal && (
        <AddSlotModal
          onClose={() => setShowAddSlotModal(false)}
          onSuccess={() => {
            setShowAddSlotModal(false);
            loadData();
          }}
        />
      )}
    </motion.div>
  );
}