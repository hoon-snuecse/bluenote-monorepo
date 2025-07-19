import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Disable ESLint during builds (fix later)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable type checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['localhost'],
  },
  
  
  // Optimize production builds
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Enable experimental features for better performance
  experimental: {
    // optimizeCss: true, // Disabled - causing CSS issues
    optimizePackageImports: [
      'lucide-react', 
      'recharts',
      '@bluenote/ui',
      'date-fns',
      '@prisma/client',
      'exceljs'
    ],
  },
  
  // Webpack configuration for optimizations
  webpack: (config, { isServer }) => {
    // Ensure proper module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './src'),
    };
    
    // Tree shaking optimizations
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@sentry/node': false,
        'encoding': false,
      };
    }

    // Module replacements for smaller bundles
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };

    // Fix for Prisma on Vercel
    if (isServer) {
      config.externals.push('_http_common');
    }

    return config;
  },
  
  // Headers for security and caching
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
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
      // Static assets caching
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Font files caching
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
