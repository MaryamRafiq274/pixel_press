/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "archiver",
      "@neplex/vectorizer",
      "pngquant-bin",
      "execa",
    ],
  },
};

export default nextConfig;