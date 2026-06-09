'use client'

import { useState } from 'react'
import { registerVehicle } from './actions/vehicles'

export default function RegisterVehicleModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const formData = new FormData(e.currentTarget)
      await registerVehicle(formData)
      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* TOMBOL TRIGGER */}
      <button
        onClick={() => setOpen(true)}
        className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-5 rounded-lg text-sm transition-colors shadow-sm"
      >
        🚗 Daftarkan Mobil
      </button>

      {/* MODAL OVERLAY */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Daftarkan Kendaraan</h3>

            {success ? (
              <p className="text-green-600 font-semibold text-center py-4">✅ Kendaraan berhasil didaftarkan!</p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Nomor Plat</label>
                  <input
                    name="plate_number"
                    type="text"
                    placeholder="Contoh: B1234XYZ"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Tipe Kendaraan</label>
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

                {error && <p className="text-red-500 text-xs">{error}</p>}

                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
                  >
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOpen(false); setError('') }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg text-sm transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}