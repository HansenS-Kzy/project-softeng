import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import BookingButton from "./BookingButton";
import ActiveBookingBanner from "./ActiveBookingBanner";
import RegisterVehicleModal from "./RegisterVehicleModal";

export default async function HomePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const userName = user?.user_metadata?.full_name || "Pengguna";

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  const waktuSekarang = new Date().toISOString();

  const { data: expiredBookings } = await supabase
    .from("reservations")
    .select("id, slot_id")
    .eq("status", "pending")
    .lt("expired_at", waktuSekarang);

  if (expiredBookings && expiredBookings.length > 0) {
    const expiredIds = expiredBookings.map((b) => b.id);
    const expiredSlotIds = expiredBookings.map((b) => b.slot_id);

    // Batalkan reservasi yang sudah lewat 10 menit
    await supabase.from("reservations").update({ status: "cancelled" }).in("id", expiredIds);
    
    // Kembalikan slot parkir jadi available
    await supabase.from("parking_slots").update({ status: "available" }).in("id", expiredSlotIds);
  }

  // Ambil reservasi aktif 
  const { data: myReservation } = await supabase
    .from("reservations")
    .select("*, parking_slots(slot_code)")
    .eq("user_id", user.id)
    .in("status", ["pending", "booked", "parked"])
    .maybeSingle();

  const hasActiveBooking = !!myReservation;
  const mySlotCode = (myReservation as any)?.parking_slots?.slot_code;
  const myStartTime = myReservation?.entry_time || myReservation?.created_at; 
  const myExpiredAt = myReservation?.expired_at;
  const myReservationId = myReservation?.id;
  const myStatus = myReservation?.status;

  const { data: slots } = await supabase
    .from("parking_slots")
    .select("*")
    .order("slot_code", { ascending: true });

  const signOut = async () => {
    "use server";
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    await supabase.auth.signOut();
    redirect("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <h1 className="text-xl font-bold text-blue-600">Aplikasi Booking Parkir</h1>
        <div className="flex items-center gap-4">
          <span className="font-medium text-gray-600 hidden md:block">
            Halo, {userName}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded text-sm transition-colors"
            >
              Keluar
            </button>
          </form>
        </div>
      </header>

      <main className="flex flex-col items-center mt-12 px-4 max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <p className="text-gray-600 text-xl">
            Selamat datang,{" "}
            <span className="font-bold text-blue-600">{userName}</span>!
          </p>
          {isAdmin && (
            <Link
              href="/admin"
              className="inline-block mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all"
            >
              ⚙️ Masuk ke Dashboard Admin
            </Link>
          )}
        </div>

        {/* Banner Dinamis */}
        {hasActiveBooking && mySlotCode && myStartTime && myReservationId && (
          <ActiveBookingBanner
            slotCode={mySlotCode}
            startTime={myStartTime}
            reservationId={myReservationId}
            expiredAt={myExpiredAt}
            status={myStatus}
          />
        )}

        <div className="w-full bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            🗺️ Denah Slot Parkir Kampus
          </h2>

          {slots && slots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {slots.map((slot) => {
                const isMyOwnSlot = myReservation?.slot_id === slot.id;

                return (
                  <div
                    key={slot.id}
                    className={`border rounded-xl p-4 text-center transition-all ${
                      isMyOwnSlot
                        ? "border-blue-400 bg-blue-50/60 ring-2 ring-blue-500/20"
                        : slot.status === "available"
                          ? "border-green-200 bg-green-50/50"
                          : "border-red-200 bg-red-50/50 opacity-75"
                    }`}
                  >
                    <p className="font-extrabold text-xl text-gray-800">
                      {slot.slot_code}
                    </p>
                    <p
                      className={`text-xs font-semibold mt-1 ${
                        isMyOwnSlot
                          ? "text-blue-600 font-bold"
                          : slot.status === "available"
                            ? "text-green-600"
                            : "text-red-600"
                      }`}
                    >
                      {isMyOwnSlot
                        ? "Pilihan Kamu"
                        : slot.status === "available"
                          ? "Kosong"
                          : "Terisi"}
                    </p>

                    {slot.status === "available" ? (
                      <BookingButton
                        slotId={slot.id}
                        disabled={hasActiveBooking}
                      />
                    ) : (
                      <button
                        disabled
                        className="w-full mt-3 bg-gray-200 text-gray-400 text-xs font-bold py-2 px-3 rounded-lg cursor-not-allowed"
                      >
                        {isMyOwnSlot ? "Sudah Kamu Amankan" : "Full Booked"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 italic text-center py-8">
              Belum ada slot parkir yang dibuka oleh Admin.
            </p>
          )}
        </div>
          {/* REGISTER KENDARAAN */}
        <div className="w-full mt-4 flex justify-start">
  <Link
    href="/vehicles/register"
    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-5 rounded-lg text-sm transition-colors shadow-sm"
  >
    🚗 Daftarkan Mobil
  </Link>
        </div>
      </main>
    </div>
  );
}
