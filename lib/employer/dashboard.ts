import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function getEmployerStats(userId: string) {
  const supabase = createRouteHandlerClient()
  if (!supabase) return { jobCount: 0, applicationCount: 0, featuredJobs: [] }

  // Get job count
  const { count: jobCount } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('employer_id', userId)

  // Get application count - using the employer_id column in applications table
  const { count: applicationCount } = await supabase
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('employer_id', userId)

  // Get featured job status
  const { data: featuredJobs } = await supabase
    .from('jobs')
    .select('id, title, featured_until')
    .eq('employer_id', userId)
    .not('featured_until', 'is', null)
    .gte('featured_until', new Date().toISOString())

  return {
    jobCount: jobCount || 0,
    applicationCount: applicationCount || 0,
    featuredJobs: featuredJobs || [],
  }
}

export async function getEmployerJobs(userId: string) {
  const supabase = createRouteHandlerClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      applications(count)
    `)
    .eq('employer_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(`Failed to get employer jobs: ${error.message}`)
    return []
  }

  return data
}
