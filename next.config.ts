import type { NextConfig } from "next";

/**
 * The Expo web build is served by Metro on its own origin, so its API calls are
 * cross-origin — the native app has no origin and is never subject to CORS, and
 * the browser app here is same-origin, so nothing else needs this.
 *
 * Development only. Override the origin if Metro is reached over the LAN rather
 * than loopback (`EXPO_WEB_ORIGIN=http://192.168.1.23:8081`).
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
