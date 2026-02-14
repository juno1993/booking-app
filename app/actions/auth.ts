'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import type { LoginSchemaType, SignUpSchemaType } from '@/lib/validations/auth'

export async function signUp(data: SignUpSchemaType) {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { name: data.name },
    },
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  if (authData.user) {
    await prisma.user.create({
      data: {
        supabaseId: authData.user.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: 'CUSTOMER',
      },
    })
  }

  return { success: true }
}

export async function signIn(data: LoginSchemaType) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getCurrentUser() {
  const { getAuthUser } = await import('@/lib/auth')
  return getAuthUser()
}
