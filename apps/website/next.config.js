// eslint-disable-next-line @typescript-eslint/no-var-requires
const { env } = require("@fukumong/util");
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  async rewrites() {
    return [
      { source: "/", destination: "/music" },
      { source: "/api/:path*", destination: `${env("api_url")}:path*` },
    ];
  },
};

module.exports = nextConfig;
