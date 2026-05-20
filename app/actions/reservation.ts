'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function bookParkingSlot(slotId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. IDENTIFIKASI PENGGUNA
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Kamu harus login terlebih dahulu!' }
  }

  // 2. CEK STATUS SLOT (Mencegah Double Booking)
  const { data: slot, error: slotError } = await supabase
    .from('parking_slots')
    .select('status')
    .eq('id', slotId)
    .single()

  if (slotError || !slot) {
    return { error: 'Lahan parkir tidak ditemukan.' }
  }

  if (slot.status !== 'available') {
    return { error: 'Maaf, slot ini baru saja dipesan orang lain!' }
  }

  // 3. PROSES UPDATE: Ubah status slot menjadi 'booked'
  const { error: updateError } = await supabase
    .from('parking_slots')
    .update({ status: 'booked' })
    .eq('id', slotId)

  if (updateError) {
    return { error: 'Gagal mengamankan lahan parkir.' }
  }

  // 4. PROSES CREATE: Buat catatan tiket reservasi
  const { data: reservation, error: reserveError } = await supabase
    .from('reservations')
    .insert({
      user_id: user.id,
      slot_id: slotId,
      status: 'pending_payment',
    })
    .select()
    .single()

  if (reserveError) {
    await supabase.from('parking_slots').update({ status: 'available' }).eq('id', slotId)
    return { error: 'Gagal membuat tiket reservasi.' }
  }

  // 5. REFRESH HALAMAN SEKETIKA
  revalidatePath('/') 
  
  return { success: true, message: 'Berhasil di-booking!', data: reservation }
}