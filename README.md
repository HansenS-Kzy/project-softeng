# Metro Park - Parking System with Online Booking

## Overview
Metro Park is an online booking-based parking system designed to solve common parking issues, such as the difficulty of finding parking in crowded areas, the time wasted searching for empty slots, and the inefficiency of manual parking management. By allowing users to view available slots online and book a specific location in advance, the system significantly reduces wait times and parking uncertainty for drivers.

## Features
*   **Car Identification:** Conducts car data checks for vehicle and fuel type verification.
*   **Booking Systems and Hold Timer:** Holds a reserved parking spot for a maximum of 1 hour. If the user fails to check in (by scanning a QR code at the gate) within this timeframe, the booking is automatically forfeited to prevent "troll booking".
*   **Map & Grid Mapping Tools:** Displays parking locations visually using an interactive floor plan layout.
*   **Payment & QR Integration:** Utilizes a payment gateway that generates QR codes to handle parking transactions seamlessly.
*   **User Profile & Admin Management:** Supports account creation for client identification and provides a comprehensive Control Center for the admin side.
*   **State Management & Real-time Communication:** Ensures real-time synchronization of parking floor plan data from the client side to the server.
*   **UI/UX:** Delivers a smooth user flow from the initial booking process through to tap-out.

## Tech Stack
*   **Frontend:** Next.js framework, TypeScript programming language, and Tailwind CSS for design styling.
*   **Backend:** Next.js Server Actions and Route Handlers to manage bookings, users, and slot statuses.
*   **Database:** Supabase PostgreSQL to store user profiles, vehicles, parking slots, reservations, and transactions.

## System Architecture
The application is built using a **Layered Architecture** approach to ensure scalability and maintainability:
*   **Presentation Layer:** Utilizes Next.js (React) and Tailwind CSS to display the parking grid and timer interfaces.
*   **Application / Business Logic Layer:** Utilizes Next.js server actions and route handlers to manage booking limitations and calculate parking fees.
*   **Data Access Layer:** Uses Prisma client and Supabase server client as the communication bridge to the database.
*   **Database Layer:** Managed by Supabase PostgreSQL.

## Team Members (Kelompok - 2)
*   Herrick Fabian - 2802472930
*   Raymond Widjaja - 2802474406
*   Leonardo - 2802465912
*   Renjiro Wiroskid Angga - 2802522531
*   Hansen Sebastian - 2802482364
