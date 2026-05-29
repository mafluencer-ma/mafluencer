import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["winston", "winston-daily-rotate-file"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.r2.dev" },
      // Google OAuth avatars
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      // Instagram profile pictures (Graph API & Facebook CDN)
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.instagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
      // TikTok profile pictures
      { protocol: "https", hostname: "**.tiktokcdn.com" },
      { protocol: "https", hostname: "**.tiktokcdn-us.com" },
    ],
  },
};

export default nextConfig;
