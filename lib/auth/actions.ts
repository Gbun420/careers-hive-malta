'use server'

import { createRouteHandlerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const supabase = createRouteHandlerClient()
  if (!supabase) return { error: 'Supabase client not initialized' }

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Redirect based on user role
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'employer') {
      redirect('/employer/dashboard')
    } else if (profile?.role === 'admin') {
      redirect('/admin/dashboard')
    } else {
      redirect('/jobseeker/dashboard')
    }
  }

  redirect('/')
}

export async function signUp(formData: FormData) {
  const supabase = createRouteHandlerClient()
  if (!supabase) return { error: 'Supabase client not initialized' }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string
  const role = formData.get('role') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        role,
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = createRouteHandlerClient()
  if (supabase) {
    await supabase.auth.signOut()
  }
  redirect('/')
}
