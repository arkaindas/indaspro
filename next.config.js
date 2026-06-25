const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'firestore-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24,
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
  fallbacks: {
    document: '/offline',
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
