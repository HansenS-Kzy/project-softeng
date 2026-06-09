// ============================================================
// Smart Parking System — Mock Data
// This file provides mock data for UI development.
// Will be replaced by actual DB queries from Supabase.
// ============================================================

import {
  User,
  Vehicle,
  ParkingSlot,
  Reservation,
  Transaction,
} from '@/types';

// ---- Users ----
export const mockUsers: User[] = [
  {
    userID: 'USR-001',
    name: 'Terminal User 01',
    email: 'user01@metropark.sys',
    role: 'user',
    tier: 'Premium',
  },
  {
    userID: 'USR-002',
    name: 'Jane Smith',
    email: 'jane.smith@metropark.sys',
    role: 'user',
    tier: 'Standard',
  },
  {
    userID: 'ADM-001',
    name: 'Admin Controller',
    email: 'admin@metropark.sys',
    role: 'admin',
    tier: 'Premium',
  },
];

// ---- Vehicles ----
export const mockVehicles: Vehicle[] = [
  {
    vehicleID: 'VEH-001',
    userID: 'USR-001',
    vehicleType: 'Sedan',
    fuelType: 'Electric',
    licensePlate: 'SYS-0992',
    brand: 'Polestar',
    model: '2',
    color: 'Midnight Blue',
  },
  {
    vehicleID: 'VEH-002',
    userID: 'USR-001',
    vehicleType: 'SUV',
    fuelType: 'Petrol',
    licensePlate: 'SYS-1145',
    brand: 'BMW',
    model: 'X5',
    color: 'Silver',
  },
  {
    vehicleID: 'VEH-003',
    userID: 'USR-002',
    vehicleType: 'Sedan',
    fuelType: 'Hybrid',
    licensePlate: 'SYS-2201',
    brand: 'Toyota',
    model: 'Camry Hybrid',
    color: 'White',
  },
];

// ---- Parking Slots ----
// Grid: 6 columns x 5 rows = 30 slots
export const mockParkingSlots: ParkingSlot[] = [
  // Row 1 - Zone A (Standard)
  { slotID: 'A-01', category: 'Standard', occupied: true, coordinate: '1,1', zone: 'A', floor: 'Ground', hourlyRate: 5000, dimensions: '2.5m x 5m' },
  { slotID: 'A-02', category: 'Standard', occupied: false, coordinate: '1,2', zone: 'A', floor: 'Ground', hourlyRate: 5000, dimensions: '2.5m x 5m' },
  { slotID: 'A-03', category: 'Standard', occupied: true, coordinate: '1,3', zone: 'A', floor: 'Ground', hourlyRate: 5000, dimensions: '2.5m x 5m' },
  { slotID: 'A-04', category: 'Standard', occupied: false, coordinate: '1,4', zone: 'A', floor: 'Ground', hourlyRate: 5000, dimensions: '2.5m x 5m' },
  { slotID: 'A-05', category: 'Standard', occupied: false, coordinate: '1,5', zone: 'A', floor: 'Ground', hourlyRate: 5000, dimensions: '2.5m x 5m' },
  { slotID: 'A-06', category: 'Standard', occupied: true, coordinate: '1,6', zone: 'A', floor: 'Ground', hourlyRate: 5000, dimensions: '2.5m x 5m' },

  // Row 2 - Zone B (Standard + some occupied)
  { slotID: 'B-01', category: 'Standard', occupied: false, coordinate: '2,1', zone: 'B', floor: 'Ground', hourlyRate: 5000, dimensions: '2.5m x 5m' },
  { slotID: 'B-02', category: 'Standard', occupied: true, coordinate: '2,2', zone: 'B', floor: 'Ground', hourlyRate: 5000, dimensions: '2.5m x 5m' },
  { slotID: 'B-03', category: 'Standard', occupied: false, coordinate: '2,3', zone: 'B', floor: 'Ground', hourlyRate: 5000, dimensions: '2.5m x 5m' },
  { slotID: 'B-04', category: 'Standard', occupied: true, coordinate: '2,4', zone: 'B', floor: 'Ground', hourlyRate: 5000, dimensions: '2.5m x 5m' },
  { slotID: 'B-05', category: 'Standard', occupied: false, coordinate: '2,5', zone: 'B', floor: 'Ground', hourlyRate: 5000, dimensions: '2.5m x 5m' },
  { slotID: 'B-06', category: 'Standard', occupied: true, coordinate: '2,6', zone: 'B', floor: 'Ground', hourlyRate: 5000, dimensions: '2.5m x 5m' },

  // Row 3 - Zone C (Mixed Standard + Disabled)
  { slotID: 'C-01', category: 'Standard', occupied: true, coordinate: '3,1', zone: 'C', floor: 'Ground', hourlyRate: 5000, dimensions: '2.5m x 5m' },
  { slotID: 'C-02', category: 'Standard', occupied: false, coordinate: '3,2', zone: 'C', floor: 'Ground', hourlyRate: 5000, dimensions: '2.5m x 5m' },
  { slotID: 'C-03', category: 'Disabled', occupied: false, coordinate: '3,3', zone: 'C', floor: 'Ground', hourlyRate: 3000, dimensions: '3.0m x 5.5m' },
  { slotID: 'C-04', category: 'Disabled', occupied: true, coordinate: '3,4', zone: 'C', floor: 'Ground', hourlyRate: 3000, dimensions: '3.0m x 5.5m' },
  { slotID: 'C-05', category: 'Standard', occupied: false, coordinate: '3,5', zone: 'C', floor: 'Ground', hourlyRate: 5000, dimensions: '2.5m x 5m' },
  { slotID: 'C-06', category: 'Standard', occupied: true, coordinate: '3,6', zone: 'C', floor: 'Ground', hourlyRate: 5000, dimensions: '2.5m x 5m' },

  // Row 4 - Zone E (EV Charging)
  { slotID: 'E-01', category: 'EV', occupied: false, coordinate: '4,1', zone: 'E', floor: 'Ground', hourlyRate: 8000, chargerType: 'DC FAST 150kW', connector: 'CCS Combo', dimensions: '2.8m x 5.5m' },
  { slotID: 'E-02', category: 'EV', occupied: true, coordinate: '4,2', zone: 'E', floor: 'Ground', hourlyRate: 8000, chargerType: 'DC FAST 150kW', connector: 'CCS Combo', dimensions: '2.8m x 5.5m' },
  { slotID: 'E-03', category: 'EV', occupied: false, coordinate: '4,3', zone: 'E', floor: 'Ground', hourlyRate: 8000, chargerType: 'AC Level 2', connector: 'Type 2', dimensions: '2.8m x 5.5m' },
  { slotID: 'E-04', category: 'EV', occupied: false, coordinate: '4,4', zone: 'E', floor: 'Ground', hourlyRate: 8000, chargerType: 'AC Level 2', connector: 'Type 2', dimensions: '2.8m x 5.5m' },
  { slotID: 'E-05', category: 'EV', occupied: true, coordinate: '4,5', zone: 'E', floor: 'Ground', hourlyRate: 8000, chargerType: 'DC FAST 150kW', connector: 'CCS Combo', dimensions: '2.8m x 5.5m' },
  { slotID: 'E-06', category: 'EV', occupied: false, coordinate: '4,6', zone: 'E', floor: 'Ground', hourlyRate: 8000, chargerType: 'AC Level 2', connector: 'Type 2', dimensions: '2.8m x 5.5m' },

  // Row 5 - Zone F (Mixed)
  { slotID: 'F-01', category: 'Standard', occupied: false, coordinate: '5,1', zone: 'F', floor: '1st', hourlyRate: 4000, dimensions: '2.5m x 5m' },
  { slotID: 'F-02', category: 'Standard', occupied: true, coordinate: '5,2', zone: 'F', floor: '1st', hourlyRate: 4000, dimensions: '2.5m x 5m' },
  { slotID: 'F-03', category: 'EV', occupied: false, coordinate: '5,3', zone: 'F', floor: '1st', hourlyRate: 8000, chargerType: 'AC Level 2', connector: 'Type 2', dimensions: '2.8m x 5.5m' },
  { slotID: 'F-04', category: 'Disabled', occupied: false, coordinate: '5,4', zone: 'F', floor: '1st', hourlyRate: 3000, dimensions: '3.0m x 5.5m' },
  { slotID: 'F-05', category: 'Standard', occupied: true, coordinate: '5,5', zone: 'F', floor: '1st', hourlyRate: 4000, dimensions: '2.5m x 5m' },
  { slotID: 'F-06', category: 'Standard', occupied: false, coordinate: '5,6', zone: 'F', floor: '1st', hourlyRate: 4000, dimensions: '2.5m x 5m' },
];

// ---- Reservations ----
export const mockReservations: Reservation[] = [
  {
    reservationID: 'RES-001',
    userID: 'USR-001',
    vehicleID: 'VEH-001',
    slotID: 'A-01',
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    status: 'Active',
    totalPrice: 15000,
    holdExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  },
  {
    reservationID: 'RES-002',
    userID: 'USR-002',
    vehicleID: 'VEH-003',
    slotID: 'B-04',
    startTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'Active',
    totalPrice: 5000,
    holdExpiresAt: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
  },
  {
    reservationID: 'RES-003',
    userID: 'USR-001',
    vehicleID: 'VEH-002',
    slotID: 'C-01',
    startTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'Completed',
    totalPrice: 15000,
  },
  {
    reservationID: 'RES-004',
    userID: 'USR-002',
    vehicleID: 'VEH-003',
    slotID: 'E-02',
    startTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    status: 'Expired',
    totalPrice: 16000,
  },
  {
    reservationID: 'RES-005',
    userID: 'USR-001',
    vehicleID: 'VEH-001',
    slotID: 'E-05',
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'Active',
    totalPrice: 8000,
    holdExpiresAt: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
  },
];

// ---- Transactions ----
export const mockTransactions: Transaction[] = [
  {
    transactionID: 'TX-992-B',
    reservationID: 'RES-003',
    userID: 'USR-001',
    amount: 15000,
    dateTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    location: 'Central Terminal, Zone C',
    status: 'Cleared',
  },
  {
    transactionID: 'TX-988-A',
    reservationID: 'RES-004',
    userID: 'USR-002',
    amount: 16000,
    dateTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    location: 'North Wing, EV Bay 4',
    status: 'Cleared',
  },
  {
    transactionID: 'TX-985-C',
    reservationID: 'RES-001',
    userID: 'USR-001',
    amount: 5000,
    dateTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    location: 'Zone A, Bay 01',
    status: 'Pending',
  },
];

// Current logged-in user (for demo purposes)
export const mockCurrentUser: User = mockUsers[0];
export const mockCurrentUserVehicles: Vehicle[] = mockVehicles.filter(
  (v) => v.userID === 'USR-001'
);
