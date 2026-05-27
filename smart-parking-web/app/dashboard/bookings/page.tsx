'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarClock, Clock, MapPin, Car, CreditCard,
  ChevronRight, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { fetchUserReservations, fetchParkingSlots, fetchUserVehicles } from '@/services/api';
import { Reservation, ParkingSlot, Vehicle, ReservationStatus } from '@/types';
import HoldTimer from '@/components/dashboard/HoldTimer';
import PaymentCard from '@/components/payment/PaymentCard';
import { clsx } from 'clsx';

export default function BookingsPage() {
  const { currentUser, addToast } = useApp();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [tab, setTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    if (currentUser) {
      Promise.all([
        fetchUserReservations(currentUser.userID),
        fetchParkingSlots(),
        fetchUserVehicles(currentUser.userID),
      ]).then(([resData, slotData, vehData]) => {
        setReservations(resData);
        setSlots(slotData);
        setVehicles(vehData);
        setLoading(false);
      });
    }
  }, [currentUser]);

  const getSlot = (slotID: string) => slots.find((s) => s.slotID === slotID);
  const getVehicle = (vehicleID: string) => vehicles.find((v) => v.vehicleID === vehicleID);

  const activeReservations = reservations.filter((r) => r.status === 'Active' || r.status === 'Pending');
  const historyReservations = reservations.filter((r) => r.status === 'Completed' || r.status === 'Expired');

  const statusConfig: Record<ReservationStatus, { icon: React.ElementType; color: string; badgeClass: string }> = {
    Active: { icon: CheckCircle, color: 'text-emerald-400', badgeClass: 'badge badge-active' },
    Pending: { icon: Clock, color: 'text-amber-400', badgeClass: 'badge badge-pending' },
    Expired: { icon: XCircle, color: 'text-red-400', badgeClass: 'badge badge-expired' },
    Completed: { icon: CheckCircle, color: 'text-slate-400', badgeClass: 'badge badge-completed' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-2 border-[#00f0ff]/30 border-t-[#00f0ff] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">My Bookings</h1>
          <p className="text-slate-400">View active reservations, hold timers, and payment history.</p>
        </div>
      </div>

      {/* Main Grid: Bookings + Payment Side Panel */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Bookings List */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { key: 'active' as const, label: 'Active', count: activeReservations.length },
              { key: 'history' as const, label: 'History', count: historyReservations.length },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={clsx(
                  'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2',
                  tab === t.key
                    ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30'
                    : 'bg-white/[0.03] text-slate-400 border border-white/[0.08] hover:text-white'
                )}
              >
                {t.label}
                <span className={clsx(
                  'text-xs px-2 py-0.5 rounded-full font-mono',
                  tab === t.key ? 'bg-[#00f0ff]/20 text-[#00f0ff]' : 'bg-white/[0.06] text-slate-500'
                )}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Reservation Cards */}
          <div className="space-y-4">
            {(tab === 'active' ? activeReservations : historyReservations).map((r, i) => {
              const slot = getSlot(r.slotID);
              const vehicle = getVehicle(r.vehicleID);
              const config = statusConfig[r.status];
              const StatusIcon = config.icon;

              return (
                <motion.div
                  key={r.reservationID}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={clsx(
                    'glass-elevated rounded-2xl border overflow-hidden card-hover cursor-pointer',
                    selectedReservation?.reservationID === r.reservationID
                      ? 'border-[#00f0ff]/30'
                      : 'border-white/[0.08]'
                  )}
                  onClick={() => setSelectedReservation(r)}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-dark-700 border border-white/10 flex items-center justify-center">
                          <MapPin size={16} className="text-[#00f0ff]" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider">
                            {slot?.zone ? `Zone ${slot.zone} · ${slot.floor}` : 'Parking Bay'}
                          </p>
                          <p className="text-lg font-bold text-white tracking-wider">{r.slotID}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={config.badgeClass}>{r.status}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Vehicle</p>
                        <p className="text-sm text-white font-medium">
                          {vehicle ? `${vehicle.brand} ${vehicle.model}` : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Plate</p>
                        <p className="text-sm text-white font-mono">{vehicle?.licensePlate ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Start</p>
                        <p className="text-sm text-white">
                          {new Date(r.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Amount</p>
                        <p className="text-sm text-[#00f0ff] font-semibold">
                          {r.totalPrice ? `Rp ${r.totalPrice.toLocaleString('id-ID')}` : '—'}
                        </p>
                      </div>
                    </div>

                    {/* Hold Timer for active reservations */}
                    {r.status === 'Active' && r.holdExpiresAt && (
                      <HoldTimer
                        expiresAt={r.holdExpiresAt}
                        onExpire={() => addToast('warning', 'Hold Expired', `Reservation ${r.reservationID} has expired.`)}
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}

            {(tab === 'active' ? activeReservations : historyReservations).length === 0 && (
              <div className="text-center py-16 glass rounded-2xl border border-white/[0.08]">
                <CalendarClock size={40} className="mx-auto text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {tab === 'active' ? 'No Active Bookings' : 'No Booking History'}
                </h3>
                <p className="text-slate-500">
                  {tab === 'active' ? 'Reserve a parking slot from the map to get started.' : 'Your completed sessions will appear here.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Payment Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <CreditCard size={14} />
              Payment & QR
            </h3>
            {selectedReservation && getSlot(selectedReservation.slotID) ? (
              <PaymentCard
                reservation={selectedReservation}
                slot={getSlot(selectedReservation.slotID)!}
                onComplete={() => addToast('success', 'Session Complete', 'Thank you for parking with Metro Park!')}
              />
            ) : (
              <div className="glass rounded-2xl border border-white/[0.08] p-8 text-center">
                <CreditCard size={32} className="mx-auto text-slate-600 mb-3" />
                <p className="text-sm text-slate-500">Select a reservation to view payment details and generate a QR code.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
