/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure proper handling of Supabase
  serverExternalPackages: ['@supabase/supabase-js'],
  // Optimize image delivery
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Add trailing slash for better compatibility
  trailingSlash: true,
  async redirects() {
    return [
      { source: "/Careers.mt", destination: "/", permanent: true },
      { source: "/careers.mt", destination: "/", permanent: true },
      { source: "/Careers.mt/", destination: "/", permanent: true },
      { source: "/careers.mt/", destination: "/", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
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