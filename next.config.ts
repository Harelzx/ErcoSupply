import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow opening the dev server from a phone on the LAN (e.g. the /prototype
  // preview) — without this, Next 16 blocks its dev runtime cross-origin and
  // the page loads but never hydrates, so nothing is tappable.
  allowedDevOrigins: ['192.168.68.58'],
};

export default nextConfig;
