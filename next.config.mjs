/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // Disables all ESLint errors during build
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'newback-production-a0cc.up.railway.app',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'newback-production-a0cc.up.railway.app',
        pathname: '/api/ecommerce/product-image/**',
      },
    ],
  },
};

export default nextConfig;
