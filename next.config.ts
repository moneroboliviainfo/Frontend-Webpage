import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
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
