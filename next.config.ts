import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js it runs behind Hostinger's reverse proxy.
  // This makes it trust X-Forwarded-Proto / X-Forwarded-Host headers so that
  // generated URLs (OAuth redirects, absolute links) use https:// instead of http://.
  experimental: {
    trustHostHeader: true,
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      // Instagram profile pictures
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.instagram.com" },
    ],
  },
};

export default nextConfig;
