import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
   
    minimumCacheTTL: 2678400, // 31 days
   
    imageSizes: [64, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.moneroget.com',
        port: '',
        pathname: '/api/multimedia/upload/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'moneroget.com',
          },
        ],
        destination: 'https://www.moneroget.com/:path*',
        permanent: true,
      },
      {
        source: '/cyberweb',
        destination: '/men',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
