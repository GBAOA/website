import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true, // Required for Netlify static export
  },
  output: 'standalone', // Optimized for Netlify
};

export default nextConfig;
