'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Shield, Star, Car, CalendarClock,
  CreditCard, Edit, Save, X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { fetchUserVehicles, fetchUserReservations, fetchTransactions } from '@/services/api';
import { Vehicle, Reservation, Transaction } from '@/types';

export default function ProfilePage() {
  const { currentUser } = useApp();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      Promise.all([
        fetchUserVehicles(currentUser.userID),
        fetchUserReservations(currentUser.userID),
        fetchTransactions(currentUser.userID),
      ]).then(([veh, res, txn]) => {
        setVehicles(veh);
        setReservations(res);
        setTransactions(txn);
        setLoading(false);
      });
    }
  }, [currentUser]);

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-2 border-[#00f0ff]/30 border-t-[#00f0ff] rounded-full animate-spin" />
      </div>
    );
  }

  const totalSpent = transactions.reduce((s, t) => s + (t.status === 'Cleared' ? t.amount : 0), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-3xl font-bold text-white mb-1">User Profile</h1>
      <p className="text-slate-400 mb-8">Account information and activity overview.</p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="glass-elevated rounded-2xl border border-white/[0.08] overflow-hidden">
            <div className="p-8 text-center border-b border-white/[0.06] bg-gradient-to-b from-[#00f0ff]/[0.05] to-transparent">
              <div className="w-20 h-20 rounded-full bg-dark-700 border-2 border-[#00f0ff]/30 flex items-center justify-center mx-auto mb-4">
                <User size={32} className="text-[#00f0ff]" />
              </div>
              <h2 className="text-xl font-bold text-white">{currentUser.name}</h2>
              <p className="text-sm text-slate-500 font-mono mt-1">ID: #{currentUser.userID}</p>
              {currentUser.tier && (
                <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20">
                  <Star size={12} />
                  {currentUser.tier} Tier
                </span>
              )}
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Email</p>
                  <p className="text-sm text-white">{currentUser.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Role</p>
                  <p className="text-sm text-white capitalize">{currentUser.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats + Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Vehicles', value: vehicles.length, icon: Car, color: 'text-[#00f0ff]' },
              { label: 'Bookings', value: reservations.length, icon: CalendarClock, color: 'text-emerald-400' },
              { label: 'Active', value: reservations.filter((r) => r.status === 'Active').length, icon: Star, color: 'text-amber-400' },
              { label: 'Total Spent', value: `Rp ${(totalSpent / 1000).toFixed(0)}K`, icon: CreditCard, color: 'text-purple-400' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-elevated rounded-xl border border-white/[0.08] p-5 card-hover"
              >
                <s.icon size={18} className={`${s.color} mb-3`} />
                <p className="text-2xl font-bold text-white font-mono">{s.value}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Recent Ledger */}
          <div className="glass-elevated rounded-2xl border border-white/[0.08] overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <CreditCard size={16} className="text-slate-500" />
                Recent Ledger
              </h3>
              <span className="text-xs text-slate-500 uppercase tracking-wider">View All</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['Transaction ID', 'Date & Time', 'Location', 'Amount', 'Status'].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.transactionID} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-6 py-3 text-sm font-mono text-slate-300">{t.transactionID}</td>
                      <td className="px-6 py-3 text-sm text-slate-400">
                        {new Date(t.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })},{' '}
                        {new Date(t.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-400">{t.location}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-white">
                        Rp {t.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`badge ${t.status === 'Cleared' ? 'badge-active' : t.status === 'Pending' ? 'badge-pending' : 'badge-expired'}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <div className="text-center py-12 text-slate-500">No transactions yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
