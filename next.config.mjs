/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/compress": [
        "./node_modules/pngquant-bin/vendor/**",
      ],
    },

    serverComponentsExternalPackages: [
      "archiver",
      "@neplex/vectorizer",
      "pngquant-bin",
      "execa",
    ],
  },
};

export default nextConfig;