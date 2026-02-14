'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore, type UserProfile } from '@/store/user-store'
import type { User } from '@supabase/supabase-js'

export function useUser() {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { user: profile, setUser, clearUser } = useUserStore()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setSupabaseUser(user)

      if (user) {
        try {
          const res = await fetch('/api/user/me')
          if (res.ok) {
            const data: UserProfile = await res.json()
            setUser(data)
          }
        } catch {
          // 프로필 조회 실패 시 무시
        }
      } else {
        clearUser()
      }

      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSupabaseUser(session?.user ?? null)
        if (!session?.user) {
          clearUser()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { supabaseUser, profile, loading }
}
