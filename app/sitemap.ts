import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site/url';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = SITE_URL;

    // Static routes
    const routes = ['', '/jobs', '/pricing', '/terms', '/privacy'].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Jobs from DB
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: jobs } = await supabase
            .from('jobs')
            .select('id, updated_at')
            .eq('is_active', true)
            .limit(100);

        const jobRoutes = (jobs || []).map((job) => ({
            url: `${baseUrl}/jobs/${job.id}`,
            lastModified: new Date(job.updated_at),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }));

        return [...routes, ...jobRoutes];
    } catch (error) {
        return routes;
    }
}
