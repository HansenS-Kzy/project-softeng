'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutGrid, Download, Plus, AlertTriangle, Zap,
  Activity, Eye, Camera, BarChart3, TrendingUp
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  fetchReservations, fetchParkingSlots,
  fetchAllUsers, fetchAllVehicles
} from '@/services/api';
import { Reservation, ParkingSlot, User as UserType, Vehicle } from '@/types';
import ReservationsTable from '@/components/admin/ReservationsTable';
import { clsx } from 'clsx';

export default function AdminPage() {
  const { addToast } = useApp();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [resData, slotData, userData, vehData] = await Promise.all([
        fetchReservations(),
        fetchParkingSlots(),
        fetchAllUsers(),
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
  }, []);

  const totalSlots = slots.length;
  const occupiedSlots = slots.filter((s) => s.occupied).length;
  const availableSlots = totalSlots - occupiedSlots;
  const occupancyPercent = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

  // System Alerts (mock)
  const alerts = [
    {
      id: 1,
      type: 'danger' as const,
      badge: 'B1',
      title: 'BAY C-04 · EV CHARGER FAULT',
      message: 'Power fluctuation detected. Unit isolated automatically.',
    },
    {
      id: 2,
      type: 'warning' as const,
      badge: '⚡',
      title: 'ZONE B · OVERSTAY DETECTED',
      message: '3 vehicles exceeded reservation limit by >30 mins.',
    },
    {
      id: 3,
      type: 'info' as const,
      badge: '📷',
      title: 'ENTRANCE SOUTH · CAMERA OFFLINE',
      message: 'Attempting automated reboot sequence...',
    },
  ];

  if (loading) {
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
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Control Center</h1>
          <p className="text-slate-400">Real-time occupancy analytics and reservation management.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary px-4 py-2.5 rounded-xl flex items-center gap-2">
            <Download size={16} />
            System Export
          </button>
          <button className="btn-primary px-4 py-2.5 rounded-xl flex items-center gap-2">
            <Plus size={16} />
            New Reservation
          </button>
        </div>
      </div>

      {/* Top Grid: Occupancy + Alerts */}
      <div className="grid lg:grid-cols-5 gap-6 mb-8">
        {/* Occupancy Panel */}
        <div className="lg:col-span-3 glass-elevated rounded-2xl border border-white/[0.08] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-white text-lg mb-1">Global Occupancy</h3>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-white font-mono">{occupancyPercent}%</span>
                <span className="text-sm text-emerald-400 flex items-center gap-1">
                  <TrendingUp size={14} />
                  +2% from 1hr
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-dark-700 border border-white/10 flex items-center justify-center">
              <BarChart3 size={18} className="text-slate-400" />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Total Slots', value: totalSlots.toLocaleString(), color: 'text-slate-300' },
              { label: 'Occupied', value: occupiedSlots.toLocaleString(), color: 'text-slate-300' },
              { label: 'Available', value: availableSlots.toString(), color: 'text-emerald-400', glow: true },
            ].map((s) => (
              <div
                key={s.label}
                className={clsx(
                  'glass rounded-xl px-4 py-3',
                  s.glow && 'border border-emerald-500/20'
                )}
              >
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">{s.label}</p>
                <p className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Capacity Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>0%</span>
              <span>Critical Capacity ({occupancyPercent}%)</span>
              <span>100%</span>
            </div>
            <div className="capacity-bar">
              <div
                className={clsx(
                  'capacity-fill',
                  occupancyPercent > 90
                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : occupancyPercent > 70
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                      : 'bg-gradient-to-r from-emerald-500 to-[#00f0ff]'
                )}
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="lg:col-span-2 glass-elevated rounded-2xl border border-white/[0.08] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" />
              System Alerts
            </h3>
            <span className="badge bg-red-500/20 text-red-400 border border-red-500/30">
              {alerts.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={clsx(
                  'glass rounded-xl p-4 border',
                  alert.type === 'danger'
                    ? 'border-red-500/20'
                    : alert.type === 'warning'
                      ? 'border-amber-500/20'
                      : 'border-white/[0.08]'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                    alert.type === 'danger'
                      ? 'bg-red-500/20 text-red-400'
                      : alert.type === 'warning'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-500/20 text-slate-400'
                  )}>
                    {alert.badge}
                  </div>
                  <div>
                    <p className={clsx(
                      'text-xs font-bold uppercase tracking-wider mb-1',
                      alert.type === 'danger'
                        ? 'text-red-400'
                        : alert.type === 'warning'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                    )}>
                      {alert.title}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">{alert.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <ReservationsTable
        reservations={reservations}
        users={users}
        vehicles={vehicles}
        slots={slots}
        onRefresh={loadData}
      />
    </motion.div>
  );
}
