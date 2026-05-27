// ============================================================
// Smart Parking System — API Service Layer
// ============================================================
// ALL data fetching, authentication, and database mutations
// must happen through exported functions in this file.
// UI components should ONLY call these service functions.
// ============================================================

import {
  User,
  Vehicle,
  ParkingSlot,
  Reservation,
  Transaction,
} from '@/types';

import {
  mockUsers,
  mockVehicles,
  mockParkingSlots,
  mockReservations,
  mockTransactions,
  mockCurrentUser,
  mockCurrentUserVehicles,
} from './mockData';

// ---- Simulate async delay ----
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================
// AUTHENTICATION
// ============================================================

// @TODO-BACKEND: Replace this mock with actual API/Supabase call
export async function login(email: string, password: string): Promise<User | null> {
  await delay(800);
  const user = mockUsers.find((u) => u.email === email);
  if (user) return user;
  // Default: return first user for demo
  return mockCurrentUser;
}

// @TODO-BACKEND: Replace this mock with actual API/Supabase call
export async function signup(name: string, email: string, password: string): Promise<User> {
  await delay(800);
  return {
    userID: `USR-${Date.now()}`,
    name,
    email,
    role: 'user',
    tier: 'Standard',
  };
}

// @TODO-BACKEND: Replace this mock with actual API/Supabase call
export async function logout(): Promise<void> {
  await delay(300);
}

// @TODO-BACKEND: Replace this mock with actual API/Supabase call
export async function getCurrentUser(): Promise<User | null> {
  await delay(300);
  return mockCurrentUser;
}

// ============================================================
// USERS
// ============================================================

// @TODO-BACKEND: Replace this mock with actual API/Supabase call
export async function fetchAllUsers(): Promise<User[]> {
  await delay(500);
  return mockUsers;
}

// @TODO-BACKEND: Replace this mock with actual API/Supabase call
export async function fetchUserById(userID: string): Promise<User | null> {
  await delay(300);
  return mockUsers.find((u) => u.userID === userID) || null;
}

// ============================================================
// VEHICLES
// ============================================================

// @TODO-BACKEND: Replace this mock with actual API/Supabase call
export async function fetchUserVehicles(userID: string): Promise<Vehicle[]> {
  await delay(500);
  return mockVehicles.filter((v) => v.userID === userID);
}

// @TODO-BACKEND: Replace this mock with actual API/Supabase call
export async function fetchAllVehicles(): Promise<Vehicle[]> {
  await delay(500);
  return mockVehicles;
}

// @TODO-BACKEND: Replace this mock with actual API/Supabase call
export async function addVehicle(vehicle: Omit<Vehicle, 'vehicleID'>): Promise<Vehicle> {
  await delay(500);
  return {
    ...vehicle,
    vehicleID: `VEH-${Date.now()}`,
  };
}

// @TODO-BACKEND: Replace this mock with actual API/Supabase call
export async function deleteVehicle(vehicleID: string): Promise<boolean> {
  await delay(500);
  return true;
}

// ============================================================
// PARKING SLOTS
// ============================================================

// @TODO-BACKEND: Replace this mock with actual API/Supabase call
export async function fetchParkingSlots(): Promise<ParkingSlot[]> {
  await delay(500);
  return mockParkingSlots;
}

// @TODO-BACKEND: Replace this mock with actual API/Supabase call
export async function fetchSlotById(slotID: string): Promise<ParkingSlot | null> {
  await delay(300);
  return mockParkingSlots.find((s) => s.slotID === slotID) || null;
}

// @TODO-BACKEND: Replace this mock with actual API/Supabase call
export async function updateSlotStatus(
  slotID: string,
  occupied: boolean
): Promise<ParkingSlot | null> {
  await delay(300);
  const slot = mockParkingSlots.find((s) => s.slotID === slotID);
  if (slot) {
    slot.occupied = occupied;
    return slot;
  }
  return null;
}

// ============================================================
// RESERVATIONS
// ============================================================

// @TODO-BACKEND: Replace this mock with actual API/Supabase call
export async function fetchReservations(): Promise<Reservation[]> {
  await delay(500);
  return mockReservations;
}

// @TODO-BACKEND: Replace this mock with actual API/Supabase call
export async function fetchUserReservations(userID: string): Promise<Reservation[]> {
  await delay(500);
  return mockReservations.filter((r) => r.userID === userID);
}

// @TODO-BACKEND: Replace this mock with actual API/Supabase call
export async function createReservation(
  data: Omit<Reservation, 'reservationID'>
): Promise<Reservation> {
  await delay(800);
  const newReservation: Reservation = {
    ...data,
    reservationID: `RES-${Date.now()}`,
    holdExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
  mockReservations.push(newReservation);
  return newReservation;
}

// @TODO-BACKEND: Replace this mock with actual API/Supabase call
export async function cancelReservation(reservationID: string): Promise<boolean> {
  await delay(500);
  const reservation = mockReservations.find((r) => r.reservationID === reservationID);
  if (reservation) {
    reservation.status = 'Expired';
    return true;
  }
  return false;
}

// @TODO-BACKEND: Replace this mock with actual API/Supabase call
export async function validateReservation(reservationID: string): Promise<boolean> {
  await delay(500);
  const reservation = mockReservations.find((r) => r.reservationID === reservationID);
  if (reservation) {
    reservation.status = 'Completed';
    return true;
  }
  return false;
}

// ============================================================
// TRANSACTIONS / PAYMENTS
// ============================================================

// @TODO-BACKEND: Replace this mock with actual API/Supabase call
export async function fetchTransactions(userID: string): Promise<Transaction[]> {
  await delay(500);
  return mockTransactions.filter((t) => t.userID === userID);
}

// @TODO-BACKEND: Replace this mock with actual API/Supabase call
export async function processPayment(
  reservationID: string,
  amount: number
): Promise<Transaction> {
  await delay(1000);
  return {
    transactionID: `TX-${Date.now()}`,
    reservationID,
    userID: mockCurrentUser.userID,
    amount,
    dateTime: new Date().toISOString(),
    location: 'Metro Park Terminal',
    status: 'Cleared',
  };
}

// ============================================================
// CAR IDENTIFICATION LOGIC
// ============================================================

// @TODO-BACKEND: Replace this mock with actual API/Supabase call
export async function validateEVSlotEligibility(
  vehicleID: string,
  slotCategory: string
): Promise<{ eligible: boolean; reason?: string }> {
  await delay(200);
  if (slotCategory !== 'EV') return { eligible: true };

  const vehicle = mockVehicles.find((v) => v.vehicleID === vehicleID);
  if (!vehicle) return { eligible: false, reason: 'Vehicle not found' };

  if (vehicle.fuelType !== 'Electric') {
    return {
      eligible: false,
      reason: `EV slots are exclusively for Electric vehicles. Your ${vehicle.brand} ${vehicle.model} uses ${vehicle.fuelType} fuel.`,
    };
  }
  return { eligible: true };
}
