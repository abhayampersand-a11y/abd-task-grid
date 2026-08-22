import type { MetadataRoute } from "next";

/**
 * Installed-app metadata. `icon-192`/`icon-512` are the mark on transparency —
 * `purpose: "any"` — while the maskable copy sits on an opaque plate inset to
 * the 80% safe circle, because Android crops maskable icons to its own shape.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TaskFlow Pro",
    short_name: "TaskFlow",
    description:
      "Break down silos and accelerate workflows. TaskFlow Pro provides the granular control and high-speed collaboration tools high-performance teams demand.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f39f6",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
