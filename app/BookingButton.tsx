'use client'

import { bookParkingSlot } from '@/app/actions/reservation'

interface BookingButtonProps {
  slotId: string
  disabled?: boolean
}

export default function BookingButton({ slotId, disabled }: BookingButtonProps) {
  const handleClick = async () => {
    if (disabled) return
    
    const result = await bookParkingSlot(slotId)
    
    if (result?.error) {
      alert('❌ Gagal: ' + result.error)
    } else if (result?.success) {
      alert('✅ Sukses: ' + result.message)
    }
  }

  return (
    <button 
      onClick={handleClick} 
      disabled={disabled}
      className={`w-full mt-3 text-xs font-bold py-2 px-3 rounded-lg shadow-sm transition-colors ${
        disabled 
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-200' 
          : 'bg-blue-600 hover:bg-blue-500 text-white'
      }`}
    >
      {disabled ? 'Batas Booking Tercapai' : 'Booking Spot'}
    </button>
  )
}