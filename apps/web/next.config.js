/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  images: {
    unoptimized: true,
  },
  productionBrowserSourceMaps: true, // Enable source maps for production builds
};

module.exports = nextConfig;
