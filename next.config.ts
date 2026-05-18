import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      /** Listing/move-out photo uploads send FormData through Server Actions (default limit is 1 MB). */
      bodySizeLimit: "6mb",
    },
  },
  images: {
    remotePatterns: [
      {
        // Supabase Storage - covers apartment-photos and moveout-photos buckets
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
