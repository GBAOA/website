import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true, // Required for Netlify static export
  },
  output: "standalone", // Optimized for Netlify
  /**
   * Work around Node/Next strict server source-map parsing:
   * some dev chunks can emit an invalid sourceMapURL which triggers
   * "Invalid source map. Only conformant source maps can be used..."
   * Disabling server source maps removes the faulty mapping but does not
   * affect the app's runtime behavior.
   */
  experimental: {
    serverSourceMaps: false,
  },
};

export default nextConfig;
