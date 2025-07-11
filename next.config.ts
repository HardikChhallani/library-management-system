import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true // This will ignore ESLint errors during build
  }
};

export default nextConfig;
