/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@bluenote/ui', '@bluenote/auth'],
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
}

module.exports = nextConfig