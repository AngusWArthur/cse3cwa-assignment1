// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce .next/standalone for the Docker image
  output: "standalone",

  // If you want builds to proceed even with ESLint issues, set this to true.
  // eslint: { ignoreDuringBuilds: true },

  // If you deploy behind a plain file server and don’t need Next Image optimization:
  // images: { unoptimized: true },
};

export default nextConfig;
