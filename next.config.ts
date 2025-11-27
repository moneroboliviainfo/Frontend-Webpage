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
};

export default nextConfig;
