/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true
  },
  webpack: (config, { dev, isServer }) => {
    // Disable caching in development to prevent permission issues
    if (dev) {
      config.cache = false;
    }
    return config;
  },
}

module.exports = nextConfig
