'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, Zap, Fuel, Plus, Trash2, Palette,
  Hash, Shield, X, ChevronDown
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { fetchUserVehicles, addVehicle, deleteVehicle } from '@/services/api';
import { Vehicle, VehicleType, FuelType } from '@/types';
import { clsx } from 'clsx';

export default function VehiclesPage() {
  const { currentUser, addToast } = useApp();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add form
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [vType, setVType] = useState<VehicleType>('Sedan');
  const [fType, setFType] = useState<FuelType>('Petrol');
  const [color, setColor] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchUserVehicles(currentUser.userID).then((data) => {
        setVehicles(data);
        setLoading(false);
      });
    }
  }, [currentUser]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setAddLoading(true);
    try {
      const newVeh = await addVehicle({
        userID: currentUser.userID,
        brand,
        model,
        licensePlate: plate,
        vehicleType: vType,
        fuelType: fType,
        color,
      });
      setVehicles((prev) => [...prev, newVeh]);
      addToast('success', 'Vehicle Added', `${brand} ${model} registered successfully.`);
      setShowAddModal(false);
      setBrand(''); setModel(''); setPlate(''); setColor('');
    } catch {
      addToast('error', 'Failed', 'Could not add vehicle.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (vehicleID: string) => {
    try {
      await deleteVehicle(vehicleID);
      setVehicles((prev) => prev.filter((v) => v.vehicleID !== vehicleID));
      addToast('success', 'Vehicle Removed', 'Vehicle has been unregistered.');
    } catch {
      addToast('error', 'Failed', 'Could not delete vehicle.');
    }
  };

  const fuelIcon = (fuel: FuelType) => {
    switch (fuel) {
      case 'Electric': return <Zap size={14} className="text-[#00f0ff]" />;
      case 'Hybrid': return <Zap size={14} className="text-emerald-400" />;
      default: return <Fuel size={14} className="text-amber-400" />;
    }
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
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">My Vehicles</h1>
          <p className="text-slate-400">Manage your registered vehicles and fuel types.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary px-5 py-3 rounded-xl flex items-center gap-2"
        >
          <Plus size={18} />
          Add Vehicle
        </button>
      </div>

      {/* Vehicle Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vehicles.map((v, i) => (
          <motion.div
            key={v.vehicleID}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-elevated rounded-2xl border border-white/[0.08] overflow-hidden card-hover group"
          >
            {/* Card Header */}
            <div className={clsx(
              'px-6 py-4 border-b border-white/[0.06] flex items-center justify-between',
              v.fuelType === 'Electric' ? 'bg-[#00f0ff]/[0.05]' : 'bg-white/[0.02]'
            )}>
              <div className="flex items-center gap-2">
                {fuelIcon(v.fuelType)}
                <span className={clsx(
                  'text-xs font-bold uppercase tracking-widest',
                  v.fuelType === 'Electric' ? 'text-[#00f0ff]' : v.fuelType === 'Hybrid' ? 'text-emerald-400' : 'text-amber-400'
                )}>
                  {v.fuelType === 'Electric' ? 'EV Registered' : v.fuelType}
                </span>
              </div>
              <button
                onClick={() => handleDelete(v.vehicleID)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                title="Remove vehicle"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Card Body */}
            <div className="px-6 py-5">
              <h3 className="text-xl font-bold text-white mb-0.5">{v.brand} {v.model}</h3>
              <p className="text-sm text-slate-500 font-mono mb-4">Plate: {v.licensePlate}</p>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-400"><Car size={14} /> Type</span>
                  <span className="text-white">{v.vehicleType}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-400"><Palette size={14} /> Color</span>
                  <span className="text-white">{v.color}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-400"><Hash size={14} /> ID</span>
                  <span className="text-slate-500 font-mono text-xs">{v.vehicleID}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-20 glass rounded-2xl border border-white/[0.08]">
          <Car size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Vehicles Registered</h3>
          <p className="text-slate-500 mb-6">Add a vehicle to start booking parking slots.</p>
          <button onClick={() => setShowAddModal(true)} className="btn-primary px-6 py-3 rounded-xl">
            <Plus size={16} className="inline mr-2" />Add Vehicle
          </button>
        </div>
      )}

      {/* Add Vehicle Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <motion.div
              className="relative glass-elevated rounded-2xl border border-white/[0.08] w-full max-w-md overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Register New Vehicle</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06]">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Brand</label>
                    <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Tesla" className="input-field w-full px-4 py-3 rounded-xl text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Model</label>
                    <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model 3" className="input-field w-full px-4 py-3 rounded-xl text-sm" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">License Plate</label>
                  <input value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="SYS-1234" className="input-field w-full px-4 py-3 rounded-xl text-sm" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Vehicle Type</label>
                    <div className="relative">
                      <select value={vType} onChange={(e) => setVType(e.target.value as VehicleType)} className="input-field w-full px-4 py-3 rounded-xl text-sm appearance-none pr-8">
                        {['Sedan', 'SUV', 'Motorcycle', 'Truck'].map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Fuel Type</label>
                    <div className="relative">
                      <select value={fType} onChange={(e) => setFType(e.target.value as FuelType)} className="input-field w-full px-4 py-3 rounded-xl text-sm appearance-none pr-8">
                        {['Petrol', 'Electric', 'Hybrid'].map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Color</label>
                  <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Midnight Blue" className="input-field w-full px-4 py-3 rounded-xl text-sm" required />
                </div>
                <button type="submit" disabled={addLoading} className="btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                  {addLoading ? <div className="w-5 h-5 border-2 border-[#0a0e17]/40 border-t-[#0a0e17] rounded-full animate-spin" /> : <><Plus size={16} /> Register Vehicle</>}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
