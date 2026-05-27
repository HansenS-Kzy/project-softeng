// ============================================================
// Smart Parking System — Type Definitions
// Based on Class Diagram specification
// ============================================================

export interface User {
  userID: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  tier?: 'Standard' | 'Premium';
}

export type VehicleType = 'Sedan' | 'SUV' | 'Motorcycle' | 'Truck';
export type FuelType = 'Petrol' | 'Electric' | 'Hybrid';

export interface Vehicle {
  vehicleID: string;
  userID: string;
  vehicleType: VehicleType;
  fuelType: FuelType;
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
}

export type SlotCategory = 'Standard' | 'EV' | 'Disabled';

export interface ParkingSlot {
  slotID: string;
  category: SlotCategory;
  occupied: boolean;
  coordinate: string;
  zone: string;
  floor: string;
  hourlyRate: number;
  chargerType?: string;
  connector?: string;
  dimensions?: string;
}

export type ReservationStatus = 'Pending' | 'Active' | 'Expired' | 'Completed';

export interface Reservation {
  reservationID: string;
  userID: string;
  vehicleID: string;
  slotID: string;
  startTime: string;
  endTime?: string;
  status: ReservationStatus;
  totalPrice?: number;
  holdExpiresAt?: string;
}

export interface Transaction {
  transactionID: string;
  reservationID: string;
  userID: string;
  amount: number;
  dateTime: string;
  location: string;
  status: 'Cleared' | 'Pending' | 'Failed';
}

// Toast notification type
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}
