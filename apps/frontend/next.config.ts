import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backendPort = process.env.INTERNAL_API_PORT ?? "3000";

    return [
      {
        source: "/api/:path*",
        destination: `http://127.0.0.1:${backendPort}/:path*`,
      },
    ];
  },
};

export default nextConfig;
