import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce .next/standalone for slim Docker images
  output: "standalone",

  // Optional: disable telemetry in builds/CI
  telemetry: false,
};

export default nextConfig;
