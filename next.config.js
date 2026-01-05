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
  // Suppress process.version warnings in Edge Runtime
  webpack: (config, { isServer, nextRuntime }) => {
    if (isServer && nextRuntime === 'edge') {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig;