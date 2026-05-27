'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle, XCircle, Edit, MoreVertical, ChevronDown,
  Circle, Search, Filter
} from 'lucide-react';
import { Reservation, User, Vehicle, ParkingSlot, ReservationStatus } from '@/types';
import { cancelReservation, validateReservation } from '@/services/api';
import { useApp } from '@/context/AppContext';
import HoldTimer from '@/components/dashboard/HoldTimer';
import { clsx } from 'clsx';

interface ReservationsTableProps {
  reservations: Reservation[];
  users: User[];
  vehicles: Vehicle[];
  slots: ParkingSlot[];
  onRefresh?: () => void;
}

export default function ReservationsTable({
  reservations,
  users,
  vehicles,
  slots,
  onRefresh,
}: ReservationsTableProps) {
  const { addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'All'>('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getUserName = (userID: string) =>
    users.find((u) => u.userID === userID)?.name ?? userID;

  const getVehicleInfo = (vehicleID: string) => {
    const v = vehicles.find((v) => v.vehicleID === vehicleID);
    return v ? `${v.brand} ${v.model}` : vehicleID;
  };

  const getSlotInfo = (slotID: string) => {
    const s = slots.find((s) => s.slotID === slotID);
    return s ? `${slotID} · Zone ${s.zone}` : slotID;
  };

  const filtered = reservations.filter((r) => {
    const matchSearch =
      searchTerm === '' ||
      r.reservationID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.slotID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUserName(r.userID).toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCancel = async (reservationID: string) => {
    setActionLoading(reservationID);
    try {
      await cancelReservation(reservationID);
      addToast('success', 'Reservation Cancelled', `${reservationID} has been cancelled.`);
      onRefresh?.();
    } catch {
      addToast('error', 'Action Failed', 'Could not cancel reservation.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleValidate = async (reservationID: string) => {
    setActionLoading(reservationID);
    try {
      await validateReservation(reservationID);
      addToast('success', 'Reservation Validated', `${reservationID} marked as Completed.`);
      onRefresh?.();
    } catch {
      addToast('error', 'Action Failed', 'Could not validate reservation.');
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadgeClass: Record<ReservationStatus, string> = {
    Active: 'badge badge-active',
    Pending: 'badge badge-pending',
    Expired: 'badge badge-expired',
    Completed: 'badge badge-completed',
  };

  return (
    <div className="glass-elevated rounded-2xl border border-white/[0.08] overflow-hidden">
      {/* Table Header / Filters */}
      <div className="px-6 py-5 border-b border-white/[0.06] flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="font-bold text-white text-lg">Active Reservations</h3>
          <p className="text-xs text-slate-500 mt-0.5">{filtered.length} records found</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search reservations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full pl-9 pr-4 py-2.5 rounded-lg text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | 'All')}
              className="input-field px-4 py-2.5 rounded-lg text-sm appearance-none pr-8 cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Expired">Expired</option>
              <option value="Completed">Completed</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Slot ID', 'User Identity', 'Vehicle', 'Status / Hold Time', 'Amount', 'Actions'].map(
                (col) => (
                  <th
                    key={col}
                    className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500"
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <motion.tr
                key={r.reservationID}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-mono font-bold text-[#00f0ff] text-sm">{r.slotID}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{getSlotInfo(r.slotID)}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-dark-600 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300">
                      {getUserName(r.userID)[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{getUserName(r.userID)}</p>
                      <p className="text-xs text-slate-500 font-mono">{r.userID}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-300">{getVehicleInfo(r.vehicleID)}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <span className={statusBadgeClass[r.status]}>{r.status}</span>
                    {r.holdExpiresAt && r.status === 'Active' && (
                      <HoldTimer expiresAt={r.holdExpiresAt} compact />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-white">
                    {r.totalPrice ? `Rp ${r.totalPrice.toLocaleString('id-ID')}` : '—'}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {r.status === 'Active' && (
                      <>
                        <button
                          onClick={() => handleValidate(r.reservationID)}
                          disabled={actionLoading === r.reservationID}
                          title="Validate"
                          className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleCancel(r.reservationID)}
                          disabled={actionLoading === r.reservationID}
                          title="Cancel"
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                    <button
                      title="Edit"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <Circle size={32} className="mx-auto mb-3 opacity-30" />
            <p>No reservations found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
