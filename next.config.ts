import type { NextConfig } from "next";

/**
 * The Expo web build is served by Metro on its own origin, so its API calls are
 * cross-origin — the native app has no origin and is never subject to CORS, and
 * the browser app here is same-origin, so nothing else needs this.
 *
 * Development only. The origin depends on how Metro is reached: loopback from
 * this machine, a LAN IP from a phone's browser. Override for the latter:
 * `EXPO_WEB_ORIGIN=http://172.20.10.8:8081 pnpm dev --hostname 0.0.0.0`
 */
const EXPO_WEB_ORIGIN = process.env.EXPO_WEB_ORIGIN ?? "http://localhost:8081";

const nextConfig: NextConfig = {
  async headers() {
    if (process.env.NODE_ENV !== "development") return [];

    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: EXPO_WEB_ORIGIN },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PATCH, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          { key: "Vary", value: "Origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
