"use client";

import { useEffect, useRef, useState } from "react";
import { Music, CheckCircle2, X, ExternalLink, AlertCircle } from "lucide-react";

// Inline SVG — lucide-react v1 removed the Instagram icon
function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

type Status = { loginProvider: string; tiktok: boolean; instagram: boolean };

function openPopup(url: string): Window | null {
  const w = 520, h = 680;
  const left = Math.round(window.screenX + (window.outerWidth  - w) / 2);
  const top  = Math.round(window.screenY + (window.outerHeight - h) / 2);
  return window.open(url, "social_connect", `width=${w},height=${h},left=${left},top=${top},toolbar=0,menubar=0`);
}

function SocialCard({
  provider,
  connected,
  required,
  onConnect,
  connecting,
}: {
  provider: "tiktok" | "instagram";
  connected: boolean;
  required: boolean;
  onConnect: () => void;
  connecting: boolean;
}) {
  const isTikTok = provider === "tiktok";

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
      connected
        ? "bg-emerald-500/[0.06] border-emerald-500/20"
        : required
        ? "bg-indigo-500/[0.06] border-indigo-500/20"
        : "bg-white/[0.03] border-white/[0.06]"
    }`}>
      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isTikTok ? "bg-black/60" : "bg-gradient-to-br from-purple-600 to-pink-500"
      }`}>
        {isTikTok
          ? <Music size={20} className="text-white" />
          : <InstagramIcon size={20} />}
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-200">{isTikTok ? "TikTok" : "Instagram"}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {connected
            ? "Compte vérifié"
            : required
            ? "Requis pour valider ton profil"
            : "Optionnel"}
        </p>
      </div>

      {/* Status / CTA */}
      {connected ? (
        <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
      ) : (
        <button
          onClick={onConnect}
          disabled={connecting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 hover:text-indigo-200 transition-all disabled:opacity-50 flex-shrink-0"
        >
          {connecting
            ? <span className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin" />
            : <ExternalLink size={12} />}
          {connecting ? "En cours…" : "Connecter"}
        </button>
      )}
    </div>
  );
}

export default function SocialVerifyBanner() {
  const [status,       setStatus]       = useState<Status | null>(null);
  const [dismissed,    setDismissed]    = useState(false);
  const [connecting,   setConnecting]   = useState<"tiktok" | "instagram" | null>(null);
  const [error,        setError]        = useState<string | null>(null);
  const popupRef = useRef<Window | null>(null);
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = async () => {
    try {
      const res  = await fetch("/api/creator/social-status");
      const data = await res.json() as Status;
      setStatus(data);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Listen for postMessage from the social-callback popup
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "social-auth-success") {
        setConnecting(null);
        setError(null);
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        fetchStatus();
      } else if (e.data?.type === "social-auth-error") {
        setConnecting(null);
        setError("La connexion a échoué, réessaie.");
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const connect = (provider: "tiktok" | "instagram") => {
    setConnecting(provider);
    setError(null);
    const url = provider === "tiktok"
      ? "/api/auth/tiktok/login"
      : "/api/auth/instagram/login";
    popupRef.current = openPopup(url);

    // Poll for popup closed (fallback if postMessage is missed)
    pollRef.current = setInterval(() => {
      if (popupRef.current?.closed) {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        setConnecting(null);
        fetchStatus();
      }
    }, 800);
  };

  // Cleanup on unmount
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  if (!status || dismissed) return null;

  const { loginProvider, tiktok, instagram } = status;
  const bothConnected = tiktok && instagram;
  if (bothConnected) return null;

  // Determine which platform is required based on login method
  const needsTiktok    = !tiktok    && (loginProvider === "instagram" || loginProvider === "google" || loginProvider === "email");
  const needsInstagram = !instagram && (loginProvider === "tiktok"    || loginProvider === "google" || loginProvider === "email");

  const isGoogleOrEmail = loginProvider === "google" || loginProvider === "email";
  const atLeastOneConnected = tiktok || instagram;

  // For Google/email: hide banner once at least one is connected
  if (isGoogleOrEmail && atLeastOneConnected) return null;

  return (
    <div className="mb-6 bg-[#1E293B]/60 border border-indigo-500/20 rounded-2xl p-5 relative">
      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-4 right-4 p-1 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.06] transition-all"
        aria-label="Fermer"
      >
        <X size={15} />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-4 pr-6">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertCircle size={15} className="text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200">
            {isGoogleOrEmail
              ? "Connecte au moins un réseau social"
              : loginProvider === "tiktok"
              ? "Vérifie ton Instagram"
              : "Vérifie ton TikTok"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            {isGoogleOrEmail
              ? "Les brands vérifient tes statistiques sociales avant de te contacter."
              : "Renforce ton profil creator en liant tes deux comptes."}
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 gap-3">
        {needsTiktok && (
          <SocialCard
            provider="tiktok"
            connected={tiktok}
            required={loginProvider !== "google" && loginProvider !== "email"}
            onConnect={() => connect("tiktok")}
            connecting={connecting === "tiktok"}
          />
        )}
        {needsInstagram && (
          <SocialCard
            provider="instagram"
            connected={instagram}
            required={loginProvider !== "google" && loginProvider !== "email"}
            onConnect={() => connect("instagram")}
            connecting={connecting === "instagram"}
          />
        )}
      </div>

      {error && (
        <p className="mt-3 text-xs text-red-400 flex items-center gap-1.5">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}
