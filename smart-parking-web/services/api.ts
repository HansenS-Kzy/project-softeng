// ============================================================
// Smart Parking System — API Service Layer
// ============================================================
// ALL data fetching, authentication, and database mutations
// must happen through exported functions in this file.
// UI components should ONLY call these service functions.
//
// Connected to Supabase backend.
// DB Schema:
//   profiles:      id, full_name, role, email, phone_number
//   vehicles:      (linked to profiles via user_id)
//   parking_slots: id, slot_code, category, status
//   reservations:  id, user_id, vehicle_id, slot_id, created_at, expired_at, status
//   payments:      (linked to reservations)
// ============================================================

import { supabase } from '@/lib/supabaseClient';
import {
  Vehicle,
  Reservation,
  ParkingSlot,
  Transaction,
  User,
  SlotCategory
} from '@/types';

// ============================================================
// HELPERS — Map DB rows → App types
// ============================================================

function mapProfile(row: any): User {
  return {
    userID: row.id,
    name: row.full_name ?? '',
    email: row.email ?? '',
    role: row.role === 'admin' ? 'admin' : 'user',
    tier: 'Standard',
  };
}

function mapParkingSlot(row: any): ParkingSlot {
  return {
    slotID: row.id,
    coordinate: row.slot_code || 'UNNAMED',
    category: row.category || 'Standard',
    occupied: row.status !== 'available',
    zone: 'A',
    floor: 'Ground',
    hourlyRate: 5000,
  };
}

function mapReservation(row: any): Reservation {
  return {
    reservationID: row.id,
    userID: row.user_id,
    vehicleID: row.vehicle_id ?? '',
    slotID: row.slot_id,
    startTime: row.created_at,
    endTime: row.expired_at,
    status: mapReservationStatus(row.status),
    holdExpiresAt: row.expired_at,
  };
}

function mapReservationStatus(status: string): Reservation['status'] {
  switch (status?.toLowerCase()) {
    case 'active': return 'Active';
    case 'completed': return 'Completed';
    case 'expired': return 'Expired';
    case 'pending':
    default:
      return 'Pending';
  }
}

function mapVehicle(row: any): Vehicle {
  return {
    vehicleID: row.id,
    userID: row.user_id,
    vehicleType: row.vehicle_type ?? 'Sedan',
    fuelType: row.fuel_type ?? 'Petrol',
    licensePlate: row.plate_number ?? row.license_plate ?? 'NO PLATE',
    brand: row.brand ?? '',
    model: row.model ?? '',
    color: row.color ?? '',
  };
}

function mapTransaction(row: any): Transaction {
  return {
    transactionID: row.id,
    reservationID: row.reservation_id,
    userID: row.reservations?.user_id ?? row.user_id ?? '',
    amount: row.amount ?? 0,
    dateTime: row.created_at ?? new Date().toISOString(),
    location: row.location ?? '',
    status: row.status === 'Cleared' ? 'Cleared' : row.status === 'Failed' ? 'Failed' : 'Pending',
  };
}

// ============================================================
// AUTHENTICATION
// ============================================================

export async function login(email: string, password: string): Promise<User | null> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return profile ? mapProfile(profile) : null;
}

export async function signup(name: string, email: string, password: string, phone: string): Promise<User> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        phone_number: phone,
      }
    }
  });

  if (error || !data.user) throw new Error(error?.message ?? 'Sign up failed');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) throw new Error(profileError.message);
  return mapProfile(profile);
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile ? mapProfile(profile) : null;
}

// ============================================================
// USERS
// ============================================================

export async function fetchAllUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapProfile);
}

export async function fetchUserById(userID: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userID)
    .single();
  if (error || !data) return null;
  return mapProfile(data);
}

export async function updateUserRole(userID: string, newRole: 'admin' | 'user'): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userID)
    .select()
    .single();
  if (error || !data) return null;
  return mapProfile(data);
}

// ============================================================
// VEHICLES
// ============================================================

export async function fetchUserVehicles(userID: string): Promise<Vehicle[]> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userID)) return [];

  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('user_id', userID);
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapVehicle);
}

export async function fetchAllVehicles(): Promise<Vehicle[]> {
  const { data, error } = await supabase.from('vehicles').select('*');
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapVehicle);
}

export async function addVehicle(vehicle: Omit<Vehicle, 'vehicleID'>): Promise<Vehicle> {
  const { data, error } = await supabase
    .from('vehicles')
    .insert({
      user_id: vehicle.userID,
      plate_number: vehicle.licensePlate,
      vehicle_type: vehicle.fuelType === 'Electric' ? 'EV' : 'normal',
      fuel_type: vehicle.fuelType // <-- BARIS BARU: Sekarang kita kirim data Hybrid/Electric ke kolom baru!
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Add vehicle failed');

  return {
    vehicleID: data.id,
    userID: data.user_id,
    vehicleType: data.vehicle_type === 'EV' ? 'EV' : 'Sedan',
    fuelType: data.fuel_type ?? 'Petrol', // <-- Pastikan mengambil dari data.fuel_type
    licensePlate: data.plate_number ?? '',
    brand: 'N/A',
    model: 'N/A',
    color: 'N/A',
  };
}

export async function deleteVehicle(vehicleID: string): Promise<boolean> {
  const { error } = await supabase.from('vehicles').delete().eq('id', vehicleID);
  return !error;
}

// ============================================================
// PARKING SLOTS
// ============================================================

export async function fetchParkingSlots(): Promise<ParkingSlot[]> {
  const { data, error } = await supabase.from('parking_slots').select('*');
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapParkingSlot);
}

export async function fetchSlotById(slotID: string): Promise<ParkingSlot | null> {
  const { data, error } = await supabase
    .from('parking_slots')
    .select('*')
    .eq('id', slotID)
    .single();
  if (error || !data) return null;
  return mapParkingSlot(data);
}

export async function updateSlotStatus(slotID: string, occupied: boolean): Promise<ParkingSlot | null> {
  const newStatus = occupied ? 'booked' : 'available';
  const { data, error } = await supabase
    .from('parking_slots')
    .update({ status: newStatus })
    .eq('id', slotID)
    .select()
    .single();
  if (error || !data) return null;
  return mapParkingSlot(data);
}

export async function addParkingSlot(slotCode: string, category: SlotCategory): Promise<ParkingSlot> {
  const { data, error } = await supabase
    .from('parking_slots')
    .insert({
      slot_code: slotCode.toUpperCase(),
      category: category,
      status: 'available'
    })
    .select()
    .single();

  if (error || !data) {
    console.error("DETAIL ERROR ADD SLOT:", error);
    throw new Error(error?.message ?? 'Failed to add parking slot');
  }

  return mapParkingSlot(data);
}

// ============================================================
// RESERVATIONS
// ============================================================

export async function fetchReservations(): Promise<Reservation[]> {
  const { data, error } = await supabase.from('reservations').select('*');
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapReservation);
}

export async function fetchUserReservations(userID: string): Promise<Reservation[]> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userID)) return [];

  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('user_id', userID);
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapReservation);
}

export async function createReservation(
  data: Omit<Reservation, 'reservationID'>
): Promise<Reservation> {
  const expiredAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  // 1. Buat Reservasi
  const { data: row, error } = await supabase
    .from('reservations')
    .insert({
      user_id: data.userID,
      vehicle_id: data.vehicleID || null,
      slot_id: data.slotID,
      created_at: data.startTime,
      expired_at: data.endTime ?? expiredAt,
      status: 'pending',
    })
    .select()
    .single();

  if (error || !row) throw new Error(error?.message ?? 'Create reservation failed');

  // 2. KUNCI SLOT (Update status di tabel parking_slots)
  await supabase
    .from('parking_slots')
    .update({ status: 'booked' })
    .eq('id', data.slotID);

  return mapReservation(row);
}

export async function cancelReservation(reservationID: string): Promise<boolean> {
  // 1. Cari dulu slot_id dari reservasi ini
  const { data: resData } = await supabase
    .from('reservations')
    .select('slot_id')
    .eq('id', reservationID)
    .single();

  // 2. Update status reservasi jadi expired
  const { error } = await supabase
    .from('reservations')
    .update({ status: 'expired' })
    .eq('id', reservationID);

  // 3. BUKA KEMBALI SLOT JIKA KETEMU (Update status jadi available)
  if (resData?.slot_id && !error) {
    await supabase
      .from('parking_slots')
      .update({ status: 'available' })
      .eq('id', resData.slot_id);
  }

  return !error;
}

export async function validateReservation(reservationID: string): Promise<boolean> {
  // 1. Cari dulu slot_id dari reservasi ini
  const { data: resData } = await supabase
    .from('reservations')
    .select('slot_id')
    .eq('id', reservationID)
    .single();

  // 2. Update status reservasi jadi completed
  const { error } = await supabase
    .from('reservations')
    .update({ status: 'completed' })
    .eq('id', reservationID);

  // 3. BUKA KEMBALI SLOT (karena mobil dianggap sudah selesai parkir)
  if (resData?.slot_id && !error) {
    await supabase
      .from('parking_slots')
      .update({ status: 'available' })
      .eq('id', resData.slot_id);
  }

  return !error;
}
// ============================================================
// TRANSACTIONS / PAYMENTS
// ============================================================

export async function fetchTransactions(userID: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*, reservations!inner(user_id)')
    .eq('reservations.user_id', userID);
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapTransaction);
}

export async function processPayment(reservationID: string, amount: number): Promise<Transaction> {
  const { data: row, error } = await supabase
    .from('payments')
    .insert({
      reservation_id: reservationID,
      amount: amount,
      status: 'Cleared',
    })
    .select()
    .single();

  if (error || !row) {
    console.error("DETAIL ERROR PAYMENT:", error);
    throw new Error(error?.message ?? 'Payment failed');
  }

  return {
    transactionID: row.id,
    reservationID: row.reservation_id ?? '',
    userID: '',
    amount: row.amount ?? 0,
    dateTime: new Date().toISOString(),
    location: 'Metro Park',
    status: 'Cleared',
  };
}

// ============================================================
// CAR IDENTIFICATION / ELIGIBILITY
// ============================================================

export async function validateEVSlotEligibility(
  vehicleID: string,
  slotCategory: string
): Promise<{ eligible: boolean; reason?: string }> {
  if (slotCategory !== 'EV') return { eligible: true };

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', vehicleID)
    .single();

  if (!vehicle) return { eligible: false, reason: 'Vehicle not found' };

  if (vehicle.fuel_type !== 'Electric') {
    return {
      eligible: false,
      reason: `EV slots are exclusively for Electric vehicles. Your ${vehicle.brand} ${vehicle.model} uses ${vehicle.fuel_type} fuel.`,
    };
  }
  return { eligible: true };
}