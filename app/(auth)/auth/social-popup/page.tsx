"use client";

// This page is opened inside a popup window.
// It immediately triggers the OAuth flow for the given provider.
// After auth, NextAuth redirects the popup to /auth/social-callback.

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SocialPopup() {
  const searchParams = useSearchParams();
  const provider     = searchParams.get("provider") as "tiktok" | "instagram" | null;

  useEffect(() => {
    if (!provider) return;
    // Small delay so the page renders before redirect
    const t = setTimeout(() => {
      signIn(provider, { callbackUrl: "/auth/social-callback" });
    }, 200);
    return () => clearTimeout(t);
  }, [provider]);

  const label = provider === "tiktok" ? "TikTok" : provider === "instagram" ? "Instagram" : "réseau social";

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center gap-4">
      {/* Spinner */}
      <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-indigo-500 animate-spin" />
      <p className="text-sm text-slate-400">Redirection vers {label}…</p>
    </div>
  );
}

export default function SocialPopupPage() {
  return (
    <Suspense>
      <SocialPopup />
    </Suspense>
  );
}
