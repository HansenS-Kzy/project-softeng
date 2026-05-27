'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Zap, Accessibility, Car, MapPin, Clock, CreditCard,
  ChevronRight, AlertTriangle, CheckCircle, Lock
} from 'lucide-react';
import { ParkingSlot, Vehicle } from '@/types';
import { validateEVSlotEligibility, createReservation } from '@/services/api';
import { useApp } from '@/context/AppContext';
import { clsx } from 'clsx';

interface ReservationModalProps {
  slot: ParkingSlot | null;
  vehicles: Vehicle[];
  onClose: () => void;
  onSuccess: (reservationID: string) => void;
}

export default function ReservationModal({
  slot,
  vehicles,
  onClose,
  onSuccess,
}: ReservationModalProps) {
  const { currentUser, addToast } = useApp();
  const [selectedVehicleID, setSelectedVehicleID] = useState<string>(vehicles[0]?.vehicleID ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');
  const [newReservationID, setNewReservationID] = useState('');

  if (!slot) return null;

  const selectedVehicle = vehicles.find((v) => v.vehicleID === selectedVehicleID);
  const hourlyRate = slot.hourlyRate.toLocaleString('id-ID');

  const getCategoryIcon = () => {
    switch (slot.category) {
      case 'EV': return <Zap size={20} className="text-[#00f0ff]" />;
      case 'Disabled': return <Accessibility size={20} className="text-blue-400" />;
      default: return <Car size={20} className="text-slate-400" />;
    }
  };

  const getCategoryColor = () => {
    switch (slot.category) {
      case 'EV': return '#00f0ff';
      case 'Disabled': return '#3b82f6';
      default: return '#64748b';
    }
  };

  const handleReserve = async () => {
    if (!currentUser || !selectedVehicle) return;
    setIsLoading(true);

    try {
      // Car Identification: check EV eligibility
      const check = await validateEVSlotEligibility(selectedVehicleID, slot.category);
      if (!check.eligible) {
        addToast('error', 'EV Slot Restricted', check.reason ?? 'Vehicle is not eligible for this slot.');
        setIsLoading(false);
        return;
      }

      if (step === 'select') {
        setStep('confirm');
        setIsLoading(false);
        return;
      }

      // Create reservation
      const reservation = await createReservation({
        userID: currentUser.userID,
        vehicleID: selectedVehicleID,
        slotID: slot.slotID,
        startTime: new Date().toISOString(),
        status: 'Pending',
        totalPrice: slot.hourlyRate,
      });

      setNewReservationID(reservation.reservationID);
      setStep('success');
      addToast('success', 'Reservation Created', `Slot ${slot.slotID} held for 30 minutes.`);
    } catch {
      addToast('error', 'Reservation Failed', 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative glass-elevated rounded-2xl w-full max-w-lg overflow-hidden"
          style={{ borderColor: `${getCategoryColor()}33` }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          {/* Header */}
          <div
            className="px-6 py-5 border-b border-white/[0.06] flex items-start justify-between"
            style={{ background: `${getCategoryColor()}08` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${getCategoryColor()}20`, border: `1px solid ${getCategoryColor()}40` }}
              >
                {getCategoryIcon()}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-0.5">
                  {slot.category === 'EV' ? 'EV Charging Bay' : slot.category === 'Disabled' ? 'Accessible Bay' : 'Standard Bay'}
                </p>
                <h2 className="text-2xl font-bold text-white tracking-wider">{slot.slotID}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Slot Reserved!</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Slot <strong className="text-white">{slot.slotID}</strong> is held for 30 minutes.
                </p>
                <div className="glass rounded-xl p-4 mb-6 text-left">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Reservation ID</span>
                    <span className="text-[#00f0ff] font-mono">{newReservationID}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Rate</span>
                    <span className="text-white font-semibold">Rp {hourlyRate}/hr</span>
                  </div>
                </div>
                <button
                  onClick={() => onSuccess(newReservationID)}
                  className="btn-primary w-full py-3 rounded-xl"
                >
                  View Booking &amp; Timer
                </button>
              </motion.div>
            ) : (
              <>
                {/* Slot Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="glass rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</p>
                    <p className="text-emerald-400 font-semibold">Available</p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Hourly Rate</p>
                    <p className="text-white font-semibold">Rp {hourlyRate}</p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Location</p>
                    <p className="text-white text-sm flex items-center gap-1">
                      <MapPin size={12} className="text-slate-500" />
                      Zone {slot.zone} · {slot.floor}
                    </p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Hold Duration</p>
                    <p className="text-white text-sm flex items-center gap-1">
                      <Clock size={12} className="text-slate-500" />
                      30 minutes
                    </p>
                  </div>
                  {slot.chargerType && (
                    <div className="glass rounded-xl p-4 col-span-2">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Charger</p>
                      <p className="text-[#00f0ff] font-mono text-sm">{slot.chargerType} · {slot.connector}</p>
                    </div>
                  )}
                </div>

                {/* EV Warning */}
                {slot.category === 'EV' && (
                  <div className="flex items-start gap-3 bg-[#00f0ff]/[0.05] border border-[#00f0ff]/20 rounded-xl p-4 mb-5">
                    <Zap size={16} className="text-[#00f0ff] mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      This is an <strong className="text-[#00f0ff]">EV Charging Bay</strong>. Only Electric vehicles are permitted. Non-EV reservations will be rejected.
                    </p>
                  </div>
                )}

                {/* Vehicle Selection */}
                {step === 'select' && (
                  <div className="mb-6">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 block">
                      Select Vehicle
                    </label>
                    <div className="flex flex-col gap-2">
                      {vehicles.map((v) => (
                        <button
                          key={v.vehicleID}
                          onClick={() => setSelectedVehicleID(v.vehicleID)}
                          className={clsx(
                            'flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all',
                            selectedVehicleID === v.vehicleID
                              ? 'border-[#00f0ff]/40 bg-[#00f0ff]/[0.06]'
                              : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Car size={16} className={selectedVehicleID === v.vehicleID ? 'text-[#00f0ff]' : 'text-slate-500'} />
                            <div>
                              <p className="text-sm font-semibold text-white">{v.brand} {v.model}</p>
                              <p className="text-xs text-slate-500">{v.licensePlate} · {v.fuelType}</p>
                            </div>
                          </div>
                          {v.fuelType === 'Electric' && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-1 rounded-full">
                              EV
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirm Step */}
                {step === 'confirm' && selectedVehicle && (
                  <div className="mb-6 glass rounded-xl p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Booking Summary</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Slot</span>
                        <span className="text-white font-mono">{slot.slotID}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Vehicle</span>
                        <span className="text-white">{selectedVehicle.brand} {selectedVehicle.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">License</span>
                        <span className="text-white font-mono">{selectedVehicle.licensePlate}</span>
                      </div>
                      <div className="border-t border-white/10 pt-2 flex justify-between">
                        <span className="text-slate-400">Hourly Rate</span>
                        <span className="text-[#00f0ff] font-bold">Rp {hourlyRate}/hr</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={handleReserve}
                  disabled={isLoading || !selectedVehicleID}
                  className={clsx(
                    'btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-[#0a0e17]/40 border-t-[#0a0e17] rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock size={16} />
                      {step === 'select' ? 'Continue to Confirm' : 'Confirm & Hold Slot'}
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
                {step === 'confirm' && (
                  <button
                    onClick={() => setStep('select')}
                    className="mt-2 w-full py-3 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    ← Back
                  </button>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
