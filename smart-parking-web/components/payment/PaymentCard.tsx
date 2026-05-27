'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Download, CheckCircle, CreditCard, Clock, MapPin, Zap } from 'lucide-react';
import { Reservation, ParkingSlot } from '@/types';
import { processPayment } from '@/services/api';
import { useApp } from '@/context/AppContext';

interface PaymentCardProps {
  reservation: Reservation;
  slot: ParkingSlot;
  onComplete?: () => void;
}

export default function PaymentCard({ reservation, slot, onComplete }: PaymentCardProps) {
  const { addToast } = useApp();
  const [isPaid, setIsPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const startTime = new Date(reservation.startTime);
  const endTime = reservation.endTime ? new Date(reservation.endTime) : new Date();
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationHours = Math.max(0.5, durationMs / (1000 * 60 * 60));
  const totalPrice = Math.ceil(durationHours * slot.hourlyRate);

  const qrPayload = JSON.stringify({
    reservationID: reservation.reservationID,
    slotID: slot.slotID,
    amount: totalPrice,
    timestamp: new Date().toISOString(),
  });

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      await processPayment(reservation.reservationID, totalPrice);
      setIsPaid(true);
      setShowQR(true);
      addToast('success', 'Payment Successful', `Rp ${totalPrice.toLocaleString('id-ID')} processed.`);
      setTimeout(() => onComplete?.(), 3000);
    } catch {
      addToast('error', 'Payment Failed', 'Please try again or contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Payment Card */}
      <div className="glass-elevated rounded-2xl overflow-hidden border border-white/10">
        {/* Card Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#00f0ff]/10 to-transparent border-b border-white/[0.06]">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={16} className="text-[#00f0ff]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Parking Invoice
            </span>
          </div>
          <p className="font-mono text-sm text-slate-500">{reservation.reservationID}</p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <MapPin size={14} />
              Slot
            </div>
            <span className="font-mono font-bold text-white">{slot.slotID}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Clock size={14} />
              Duration
            </div>
            <span className="text-white font-semibold">
              {durationHours.toFixed(1)} hr{durationHours !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Zap size={14} />
              Rate
            </div>
            <span className="text-white">
              Rp {slot.hourlyRate.toLocaleString('id-ID')}/hr
            </span>
          </div>

          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold">Total Amount</span>
              <span className="text-2xl font-bold text-[#00f0ff] glow-neon-text">
                Rp {totalPrice.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        {(showQR || isPaid) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="border-t border-white/[0.06] p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 text-center mb-4">
              Tap-Out QR Code
            </p>
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.2)]">
                <QRCodeSVG
                  value={qrPayload}
                  size={200}
                  level="H"
                  imageSettings={{
                    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230a0e17'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E",
                    height: 30,
                    width: 30,
                    excavate: true,
                  }}
                />
              </div>
            </div>
            <p className="text-center text-xs text-slate-500 mt-4">
              Scan at the exit terminal to complete your session
            </p>
          </motion.div>
        )}

        {/* Action */}
        <div className="px-6 pb-6">
          {isPaid ? (
            <div className="flex items-center justify-center gap-2 py-4 text-emerald-400 font-semibold">
              <CheckCircle size={20} />
              Payment Confirmed
            </div>
          ) : (
            <button
              onClick={handlePayment}
              disabled={isLoading}
              className="btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#0a0e17]/40 border-t-[#0a0e17] rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard size={18} />
                  Process Payment
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
