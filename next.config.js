/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Edge Runtime for Cloudflare
  experimental: {
    runtime: 'edge',
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  // Cloudflare Pages specific settings
  output: 'standalone',
  images: {
    unoptimized: true
  },
  // Add trailing slash for better compatibility
  trailingSlash: true,
}

module.exports = nextConfig