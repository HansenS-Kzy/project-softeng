'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function bookParkingSlot(slotId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Authorisasi
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Login Terlebih Dahulu' }
  }

  // Cek Booking User
  const { data: existingReservation } = await supabase
    .from('reservations')
    .select('id')
    .eq('user_id', user.id) 
    .in('status', ['pending', 'booked', 'parked'])
    .maybeSingle()

  if (existingReservation) {
    return { error: 'Kamu sudah memiliki aktivitas parkir aktif!' }
  }

  // 2. Cek atatus parkir
  const { data: slot, error: slotError } = await supabase
    .from('parking_slots')
    .select('status')
    .eq('id', slotId)
    .single()

  if (slotError || !slot || slot.status !== 'available') {
    return { error: 'Maaf, slot ini tidak tersedia atau baru dipesan!' }
  }

  // 3. Set Timer 10 menit
  const expiredTime = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // 4. Slot jadi Booked
  await supabase.from('parking_slots').update({ status: 'booked' }).eq('id', slotId)

  // 5. Reservasi
  const { data: reservation, error: reserveError } = await supabase
    .from('reservations')
    .insert({
      user_id: user.id,
      slot_id: slotId,
      status: 'pending',
      expired_at: expiredTime, // <-- Insert waktu hangus
    })
    .select()
    .single()

  if (reserveError) {
    console.error("GAGAL BIKIN TIKET:", reserveError)
    await supabase.from('parking_slots').update({ status: 'available' }).eq('id', slotId)
    return { error: 'Gagal membuat tiket reservasi.' }
  }

  revalidatePath('/') 
  return { success: true, message: 'Silakan lakukan pembayaran dalam 10 menit!', data: reservation }
}