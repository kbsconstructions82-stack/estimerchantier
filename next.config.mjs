/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  // firebase-admin est une lib Node.js pure — ne pas la bundler côté client
  serverExternalPackages: ['firebase-admin'],
};

export default nextConfig;
