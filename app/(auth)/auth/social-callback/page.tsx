"use client";

// This page is the OAuth callbackUrl inside the popup.
// Once NextAuth lands here the session is established.
// It posts a message to window.opener (the main tab) then closes itself.

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function SocialCallbackPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    const isPopup = Boolean(
      typeof window !== "undefined" && window.opener && !window.opener.closed
    );

    if (isPopup) {
      if (session) {
        window.opener.postMessage(
          { type: "social-auth-success" },
          window.location.origin
        );
      } else {
        window.opener.postMessage(
          { type: "social-auth-error" },
          window.location.origin
        );
      }
      window.close();
    } else {
      // Fallback: not in a popup — redirect directly
      window.location.replace("/dashboard/creator");
    }
  }, [session, status]);

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-indigo-500 animate-spin" />
      <p className="text-sm text-slate-400">Connexion en cours…</p>
    </div>
  );
}
