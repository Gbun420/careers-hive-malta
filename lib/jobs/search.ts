import { createRouteHandlerClient } from '@/lib/supabase/server'

export interface JobFilters {
  sector?: string
  location?: string
  experience?: string
  salaryMin?: number
  salaryMax?: number
  keywords?: string
}

export async function searchJobs(filters: JobFilters = {}) {
  const supabase = createRouteHandlerClient()
  if (!supabase) return []

  let query = supabase
    .from('jobs')
    .select(`
      *,
      employer:profiles!inner(full_name, role)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`)
  }

  if (filters.salaryMin) {
    query = query.gte('salary_min', filters.salaryMin)
  }

  if (filters.salaryMax) {
    query = query.lte('salary_max', filters.salaryMax)
  }

  if (filters.keywords) {
    query = query.or(`title.ilike.%${filters.keywords}%,description.ilike.%${filters.keywords}%`)
  }

  // Note: sector and experience_level columns were not found in schema, 
  // so they are omitted here to prevent errors.

  const { data, error } = await query

  if (error) {
    console.error(`Failed to search jobs: ${error.message}`)
    return []
  }

  return data
}

export async function getJobById(id: string) {
  const supabase = createRouteHandlerClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      employer:profiles!inner(id, role, created_at)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error(`Failed to get job: ${error.message}`)
    return null
  }

  return data
}
