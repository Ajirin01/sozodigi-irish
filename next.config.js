const withPWA = require("next-pwa")({
  dest: "public",
  disable: true, // disable next-pwa to prevent build hangs in Next.js 15
  register: true,
  skipWaiting: true,
});

const nextConfig = withPWA({
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Exclude browser-only packages from server bundle to prevent SSR crashes
  serverExternalPackages: ['socket.io-client'],
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  images: {
    domains: ["localhost", "127.0.0.1", "sozodigicare.com"],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
});

module.exports = nextConfig;
