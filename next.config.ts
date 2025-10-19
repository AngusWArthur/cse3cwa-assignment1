import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce .next/standalone for the Docker image
  output: "standalone",

  // Optionally: do NOT fail production builds on ESLint warnings/errors.
  // If you prefer to FIX ESLint instead (see Step 2), you can remove this.
  eslint: { ignoreDuringBuilds: false },

  // Optional: if you deploy behind a plain file server, you can disable image optimization.
  // images: { unoptimized: true },
};

export default nextConfig;
