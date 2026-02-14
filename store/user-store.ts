import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { UserRole } from '@prisma/client'

export interface UserProfile {
  id: string
  supabaseId: string
  email: string
  name?: string | null
  phone?: string | null
  role: UserRole
}

interface UserState {
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void
  clearUser: () => void
  isAdmin: () => boolean
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        setUser: (user) => set({ user }),
        clearUser: () => set({ user: null }),
        isAdmin: () => get().user?.role === 'ADMIN',
      }),
      {
        name: 'user-storage',
      }
    )
  )
)
