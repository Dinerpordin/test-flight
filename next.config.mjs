/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // appDir is enabled by default in Next.js 15
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.duffel.com',
      },
    ],
  },
};

export default nextConfig;
