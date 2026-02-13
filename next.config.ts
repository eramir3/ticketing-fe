import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // turbopack: {},
  // watchOptions: isDev ? { pollIntervalMs: 300 } : undefined,
};

export default nextConfig;
