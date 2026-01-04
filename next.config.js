/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure proper handling of Supabase
  serverExternalPackages: ['@supabase/supabase-js'],
  // Cloudflare Pages specific settings
  output: 'standalone',
  images: {
    unoptimized: true
  },
  // Add trailing slash for better compatibility
  trailingSlash: true,
}

module.exports = nextConfig;