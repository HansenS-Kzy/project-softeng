import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { registerVehicle } from "@/app/actions/vehicles";
import Link from "next/link";

export default async function RegisterVehiclePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-xl font-bold text-gray-800 mb-6">
          🚗 Daftarkan Kendaraan
        </h1>

        <form action={registerVehicle} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Nomor Plat
            </label>
            <input
              name="plate_number"
              type="text"
              placeholder="Contoh: B1234XYZ"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Tipe Kendaraan
            </label>
            <select
              name="vehicle_type"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- Pilih Tipe --</option>
              <option value="normal">Normal</option>
              <option value="electric">Electric</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg text-sm transition-colors mt-2"
          >
            Simpan Kendaraan
          </button>
        </form>

        <Link
          href="/"
          className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-4"
        >
          ← Kembali ke Halaman Utama
        </Link>
      </div>
    </div>
  );
}
