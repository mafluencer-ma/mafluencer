"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  CheckCircle, Copy, Check, ArrowRight, Loader2,
  AlertCircle, X, Users, Sparkles,
} from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import toast from "react-hot-toast";

// ── Types ────────────────────────────────────────────────────────────────────

type Platform = "tiktok" | "instagram";

type ProfilePreview = {
  nickname?: string;
  avatar?:   string;
  bio?:      string;
  followers: number;
  following: number;
  posts:     number;
  handle:    string;
  platform:  Platform;
  verifyCode: string;
};

type Step = "platform" | "username" | "verify" | "success";

// ── Icon components ──────────────────────────────────────────────────────────

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("w-5 h-5", className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

// ── Main modal ───────────────────────────────────────────────────────────────

interface CreatorOnboardingModalProps {
  onComplete: () => void;
}

export default function CreatorOnboardingModal({ onComplete }: CreatorOnboardingModalProps) {
  const [step,     setStep]     = useState<Step>("platform");
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [username, setUsername] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [preview,  setPreview]  = useState<ProfilePreview | null>(null);
  const [copied,   setCopied]   = useState(false);
  const [skipping, setSkipping] = useState(false);

  // ── Step 1 → 2: choose platform ────────────────────────────────────────────
  function choosePlatform(p: Platform) {
    setPlatform(p);
    setStep("username");
    setError(null);
    setUsername("");
  }

  // ── Step 2 → 3: fetch profile preview + get verifyCode ─────────────────────
  async function handleStart() {
    const handle = username.replace("@", "").trim();
    if (!handle) { setError("Saisis ton nom d'utilisateur"); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/social/onboarding?action=start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, username: handle }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur serveur"); return; }
      setPreview({ ...data, handle, platform });
      setStep("verify");
    } catch {
      setError("Connexion impossible. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 3 → 4: check bio for verifyCode ───────────────────────────────────
  async function handleVerify() {
    if (!preview) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/social/onboarding?action=verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: preview.platform, username: preview.handle }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur serveur"); return; }
      setStep("success");
    } catch {
      setError("Connexion impossible. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  // ── Skip ────────────────────────────────────────────────────────────────────
  async function handleSkip() {
    setSkipping(true);
    try {
      await fetch(`/api/social/onboarding?action=skip`, { method: "POST" });
    } catch { /* ignore */ }
    onComplete();
  }

  // ── Copy code ───────────────────────────────────────────────────────────────
  const copyCode = useCallback(() => {
    if (!preview?.verifyCode) return;
    navigator.clipboard.writeText(preview.verifyCode).then(() => {
      setCopied(true);
      toast.success("Code copié !");
      setTimeout(() => setCopied(false), 2000);
    });
  }, [preview?.verifyCode]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-lg bg-[#0F172A] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
              <Sparkles size={18} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Connecte tes réseaux sociaux
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Étape {step === "platform" ? 1 : step === "username" ? 2 : step === "verify" ? 3 : 4} / 4
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full transition-all duration-500"
              style={{
                width:
                  step === "platform" ? "25%" :
                  step === "username" ? "50%" :
                  step === "verify"   ? "75%" : "100%",
              }}
            />
          </div>
        </div>

        <div className="p-6">

          {/* ── STEP 1: Choose platform ── */}
          {step === "platform" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Choisis ta plateforme principale pour vérifier ton compte créateur.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {/* TikTok */}
                <button
                  onClick={() => choosePlatform("tiktok")}
                  className="relative flex flex-col items-center gap-3 p-5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15] transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <TikTokIcon className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-200">TikTok</span>
                </button>

                {/* Instagram */}
                <button
                  onClick={() => choosePlatform("instagram")}
                  className="relative flex flex-col items-center gap-3 p-5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15] transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <InstagramIcon className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-200">Instagram</span>
                </button>
              </div>

              {/* Recommended note */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <Sparkles size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-300 leading-relaxed">
                  Connecte TikTok <strong>et</strong> Instagram depuis ton profil créateur après la vérification pour maximiser tes opportunités.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 2: Enter username ── */}
          {step === "username" && (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  platform === "tiktok"
                    ? "bg-black/60"
                    : "bg-gradient-to-br from-purple-600 to-pink-500"
                )}>
                  {platform === "tiktok"
                    ? <TikTokIcon className="text-white w-4 h-4" />
                    : <InstagramIcon className="text-white w-4 h-4" />}
                </div>
                <span className="text-sm font-medium text-slate-200 capitalize">{platform}</span>
                <button
                  onClick={() => { setStep("platform"); setError(null); }}
                  className="ml-auto text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Changer
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ton nom d&apos;utilisateur {platform === "tiktok" ? "TikTok" : "Instagram"}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm select-none">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(null); }}
                    onKeyDown={e => e.key === "Enter" && handleStart()}
                    placeholder={platform === "tiktok" ? "tonpseudo" : "tonpseudo"}
                    className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[12px] pl-8 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1.5">
                  Exemple : @{platform === "tiktok" ? "khalid.create" : "khalid.create"}
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}

              <button
                onClick={handleStart}
                disabled={loading || !username.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-sm font-semibold hover:from-indigo-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.01] shadow-lg shadow-indigo-500/20"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Recherche en cours…</>
                ) : (
                  <><ArrowRight size={16} /> Continuer</>
                )}
              </button>
            </div>
          )}

          {/* ── STEP 3: Verify ownership ── */}
          {step === "verify" && preview && (
            <div className="space-y-5">
              {/* Profile preview */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                  {preview.avatar ? (
                    <Image
                      src={preview.avatar}
                      alt={preview.nickname ?? preview.handle}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                      {(preview.nickname ?? preview.handle)[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-100 truncate">
                    {preview.nickname ?? `@${preview.handle}`}
                  </p>
                  <p className="text-xs text-slate-500 truncate">@{preview.handle}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Users size={11} />
                      {formatNumber(preview.followers)} abonnés
                    </span>
                  </div>
                </div>
                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
              </div>

              {/* Verify code */}
              <div>
                <p className="text-sm font-medium text-slate-300 mb-3">
                  Prouve que tu es le propriétaire de ce compte :
                </p>

                {/* Step instructions */}
                <ol className="space-y-2 mb-4">
                  {[
                    `Ouvre l'appli ${preview.platform === "tiktok" ? "TikTok" : "Instagram"}`,
                    "Va dans ton profil → Modifier le profil → Bio",
                    "Colle ce code dans ta bio :",
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                        {i + 1}
                      </span>
                      <span className="text-xs text-slate-400 leading-relaxed">{text}</span>
                    </li>
                  ))}
                </ol>

                {/* Code box */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                  <span className="flex-1 text-center font-mono font-bold text-2xl tracking-widest text-indigo-300 select-all">
                    {preview.verifyCode}
                  </span>
                  <button
                    onClick={copyCode}
                    className="p-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 transition-all"
                    title="Copier le code"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                <p className="text-xs text-slate-600 mt-2 text-center">
                  Code valable 30 minutes · Tu pourras le retirer après vérification
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300 leading-relaxed">{error}</p>
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-sm font-semibold hover:from-indigo-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.01] shadow-lg shadow-indigo-500/20"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Vérification en cours…</>
                ) : (
                  <><CheckCircle size={16} /> J&apos;ai ajouté le code — Vérifier maintenant</>
                )}
              </button>

              <button
                onClick={() => { setStep("username"); setError(null); }}
                className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-1"
              >
                ← Changer de compte
              </button>
            </div>
          )}

          {/* ── STEP 4: Success ── */}
          {step === "success" && preview && (
            <div className="space-y-5 text-center">
              {/* Animated badge */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-emerald-500/30 flex items-center justify-center animate-pulse">
                  <CheckCircle size={36} className="text-emerald-400" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-1">
                  Compte vérifié ! 🎉
                </h3>
                <p className="text-sm text-slate-400">
                  Ton compte {preview.platform === "tiktok" ? "TikTok" : "Instagram"}{" "}
                  <span className="font-semibold text-slate-200">@{preview.handle}</span> est maintenant lié à ton profil Mafluencer.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-100">{formatNumber(preview.followers)}</p>
                  <p className="text-xs text-slate-500">Abonnés</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-100">{formatNumber(preview.posts)}</p>
                  <p className="text-xs text-slate-500">Publications</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle size={14} className="text-emerald-400" />
                    <p className="text-sm font-bold text-emerald-400">Vérifié</p>
                  </div>
                  <p className="text-xs text-slate-500">Statut</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <X size={12} className="text-slate-600" />
                <span>Tu peux retirer le code de ta bio maintenant</span>
              </div>

              <button
                onClick={onComplete}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-sm font-semibold hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 hover:scale-[1.01] shadow-lg shadow-indigo-500/20"
              >
                <ArrowRight size={16} />
                Aller à mon dashboard
              </button>
            </div>
          )}

        </div>

        {/* Footer — skip link (visible on steps 1, 2, 3 only) */}
        {step !== "success" && (
          <div className="px-6 pb-5 text-center">
            <button
              onClick={handleSkip}
              disabled={skipping}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors disabled:opacity-50"
            >
              {skipping ? "Enregistrement…" : "Passer pour l'instant"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
