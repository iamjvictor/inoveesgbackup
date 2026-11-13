import type { NextConfig } from "next";

const rawBackendUrl = (process.env.BACKEND_URL ?? "http://localhost:4000").trim().replace(/\/+$/, "");
const backendUrl = rawBackendUrl.endsWith("/api") ? rawBackendUrl.slice(0, -4) : rawBackendUrl;

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
