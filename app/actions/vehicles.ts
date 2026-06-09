'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function registerVehicle(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Tidak terautentikasi')

  const plate_number = (formData.get('plate_number') as string).toUpperCase().trim()
  const vehicle_type = formData.get('vehicle_type') as string

  const { error } = await supabase
    .from('vehicles')
    .insert([{ user_id: user.id, plate_number, vehicle_type }])

  if (error) throw new Error(error.message)

  revalidatePath('/')
  redirect('/')  // ← setelah simpan, balik ke halaman utama
}