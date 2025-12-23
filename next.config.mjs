/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  experimental: {
    // Automatically optimize imports for these heavy libraries
    optimizePackageImports: ['lucide-react', 'date-fns', 'lodash'],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      // ✅ Add this block to allow UI Avatars
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
    // Aggressive caching for external images (1 year)
    minimumCacheTTL: 31536000,
  },

  // Production security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ];
  },

  // Preserving your specific cloud environment origin
  allowedDevOrigins: [
    "3000-firebase-mind-namo-users-1762736047019.cluster-cd3bsnf6r5bemwki2bxljme5as.cloudworkstations.dev",
    "3000-firebase-mind-namo-1764372366519.cluster-xpmcxs2fjnhg6xvn446ubtgpio.cloudworkstations.dev",
    "3002-firebase-mindnamo-1764927977998.cluster-isls3qj2gbd5qs4jkjqvhahfv6.cloudworkstations.dev"
  ],
};

export default nextConfig;