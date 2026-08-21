/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "archiver",
      "@neplex/vectorizer",
    ],
  },
};

export default nextConfig;