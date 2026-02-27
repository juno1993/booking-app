import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isOvernightProduct(category: string, openTime: string, closeTime: string): boolean {
  if (category === 'PENSION' || category === 'HOTEL') return true
  const [oh, om] = openTime.split(':').map(Number)
  const [ch, cm] = closeTime.split(':').map(Number)
  return oh * 60 + om >= ch * 60 + cm
}
