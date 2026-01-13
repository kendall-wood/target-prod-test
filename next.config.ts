import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'target.scene7.com',
        pathname: '/is/**',
      },
    ],
  },
};

export default nextConfig;
