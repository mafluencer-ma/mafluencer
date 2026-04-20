"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CheckCircle, ArrowRight, Loader2, AlertCircle,
  Users, Sparkles, Clock,
} from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type Platform = "tiktok" | "instagram";

type SelectedPlatforms = { tiktok: boolean; instagram: boolean };

type ProfilePreview = {
  nickname?: string;
  avatar?:   string;
  bio?:      string;
  followers: number;
  posts:     number;
  handle:    string;
  platform:  Platform;
};

type Step = "platform" | "username" | "confirm" | "success";

// ── Platform icons ─────────────────────────────────────────────────────────────

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

function PlatformBadge({ platform, size = "md" }: { platform: Platform; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "w-7 h-7" : "w-10 h-10";
  const ic = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  if (platform === "tiktok") {
    return (
      <div className={cn(sz, "rounded-full bg-black flex items-center justify-center flex-shrink-0")}>
        <TikTokIcon className={cn(ic, "text-white")} />
      </div>
    );
  }
  return (
    <div className={cn(sz, "rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center flex-shrink-0")}>
      <InstagramIcon className={cn(ic, "text-white")} />
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function platformLabel(p: Platform) {
  return p === "tiktok" ? "TikTok" : "Instagram";
}

// ── Main modal ────────────────────────────────────────────────────────────────

interface CreatorOnboardingModalProps {
  onComplete: () => void;
}

export default function CreatorOnboardingModal({ onComplete }: CreatorOnboardingModalProps) {
  // ── selection (step 1) ──────────────────────────────────────────────────────
  const [selected, setSelected] = useState<SelectedPlatforms>({ tiktok: true, instagram: true });

  // ── flow state ──────────────────────────────────────────────────────────────
  const [step,    setStep]    = useState<Step>("platform");
  const [current, setCurrent] = useState<Platform>("tiktok"); // which platform we're adding now
  const [done,    setDone]    = useState<Platform[]>([]);      // platforms already confirmed

  // ── form state ──────────────────────────────────────────────────────────────
  const [username, setUsername] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [preview,  setPreview]  = useState<ProfilePreview | null>(null);
  const [skipping, setSkipping] = useState(false);

  // ── platforms in order ──────────────────────────────────────────────────────
  const platformQueue: Platform[] = (["tiktok", "instagram"] as Platform[]).filter(
    (p) => selected[p]
  );
  const totalPlatforms = platformQueue.length;
  const currentIndex   = platformQueue.indexOf(current) + 1; // 1-based

  // ── Step 1 → 2 ──────────────────────────────────────────────────────────────
  function startFlow() {
    if (!selected.tiktok && !selected.instagram) return;
    const first = selected.tiktok ? "tiktok" : "instagram";
    setCurrent(first);
    setUsername("");
    setPreview(null);
    setError(null);
    setStep("username");
  }

  // ── Step 2: fetch preview ────────────────────────────────────────────────────
  async function handlePreview() {
    const handle = username.replace("@", "").trim();
    if (!handle) { setError("Saisis ton nom d'utilisateur"); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/social/onboarding?action=preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: current, username: handle }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur serveur"); return; }
      setPreview({ ...data, handle, platform: current });
      setStep("confirm");
    } catch {
      setError("Connexion impossible. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 3: confirm ownership ─────────────────────────────────────────────────
  async function handleConfirm() {
    if (!preview) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/social/onboarding?action=confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: preview.platform, username: preview.handle }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur serveur"); return; }

      const newDone = [...done, preview.platform];
      setDone(newDone);

      // Check if there's a next platform to process
      const nextPlatform = platformQueue.find((p) => !newDone.includes(p));
      if (nextPlatform) {
        setCurrent(nextPlatform);
        setUsername("");
        setPreview(null);
        setError(null);
        setStep("username");
      } else {
        setStep("success");
      }
    } catch {
      setError("Connexion impossible. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  // ── Skip ──────────────────────────────────────────────────────────────────────
  async function handleSkip() {
    setSkipping(true);
    try {
      await fetch(`/api/social/onboarding?action=skip`, { method: "POST" });
    } catch { /* ignore */ }
    onComplete();
  }

  // ── Progress % ───────────────────────────────────────────────────────────────
  const progressPct =
    step === "platform" ? 20 :
    step === "username" ? (totalPlatforms === 2 ? (currentIndex === 1 ? 40 : 65) : 50) :
    step === "confirm"  ? (totalPlatforms === 2 ? (currentIndex === 1 ? 55 : 80) : 70) : 100;

  const stepLabel =
    step === "platform" ? "Choix des plateformes" :
    step === "username" ? (totalPlatforms > 1 ? `${platformLabel(current)} (${currentIndex}/${totalPlatforms})` : platformLabel(current)) :
    step === "confirm"  ? "Confirmation" : "Terminé";

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-lg bg-[#0F172A] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
              <Sparkles size={18} className="text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-slate-100">
                Connecte tes réseaux sociaux
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{stepLabel}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="p-6">

          {/* ════════════════════════════════════════════
              STEP 1 — Choose platforms
          ════════════════════════════════════════════ */}
          {step === "platform" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Sélectionne les plateformes à connecter à ton profil Mafluencer.
              </p>

              {/* Recommended shortcut */}
              <button
                onClick={() => {
                  setSelected({ tiktok: true, instagram: true });
                  startFlow();
                }}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-indigo-500/10 border-2 border-indigo-500/40 hover:border-indigo-500/70 hover:bg-indigo-500/15 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-black border-2 border-[#0F172A] flex items-center justify-center z-10">
                      <TikTokIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 border-2 border-[#0F172A] flex items-center justify-center">
                      <InstagramIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-indigo-200">Les deux</p>
                    <p className="text-xs text-indigo-400">TikTok + Instagram</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-indigo-500/30 text-indigo-300">
                  RECOMMANDÉ
                </span>
              </button>

              {/* Individual cards */}
              <div className="grid grid-cols-2 gap-3">
                {([
                  { p: "tiktok" as Platform, label: "TikTok",    color: "bg-black",                           icon: <TikTokIcon className="w-5 h-5 text-white" />    },
                  { p: "instagram" as Platform, label: "Instagram", color: "bg-gradient-to-br from-purple-600 to-pink-500", icon: <InstagramIcon className="w-5 h-5 text-white" /> },
                ]).map(({ p, label, color, icon }) => {
                  const active = selected[p];
                  return (
                    <button
                      key={p}
                      onClick={() => {
                        const next = { ...selected, [p]: !selected[p] };
                        setSelected(next);
                      }}
                      className={cn(
                        "relative flex flex-col items-center gap-3 p-5 rounded-xl border transition-all duration-200",
                        active
                          ? "border-indigo-500/50 bg-indigo-500/10"
                          : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15]"
                      )}
                    >
                      {/* Checkmark */}
                      <div className={cn(
                        "absolute top-2.5 right-2.5 w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                        active ? "border-indigo-400 bg-indigo-500" : "border-white/20 bg-transparent"
                      )}>
                        {active && <CheckCircle size={10} className="text-white" strokeWidth={3} />}
                      </div>
                      <div className={cn("w-11 h-11 rounded-full flex items-center justify-center", color)}>
                        {icon}
                      </div>
                      <span className={cn("text-sm font-medium", active ? "text-indigo-200" : "text-slate-300")}>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* CTA */}
              <button
                onClick={startFlow}
                disabled={!selected.tiktok && !selected.instagram}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-sm font-semibold hover:from-indigo-600 hover:to-pink-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.01] shadow-lg shadow-indigo-500/20"
              >
                <ArrowRight size={16} />
                Continuer
              </button>
            </div>
          )}

          {/* ════════════════════════════════════════════
              STEP 2 — Enter username
          ════════════════════════════════════════════ */}
          {step === "username" && (
            <div className="space-y-5">
              {/* Platform indicator + progress pills */}
              <div className="flex items-center gap-2">
                <PlatformBadge platform={current} size="sm" />
                <span className="text-sm font-medium text-slate-200">{platformLabel(current)}</span>
                {totalPlatforms > 1 && (
                  <div className="ml-auto flex gap-1.5">
                    {platformQueue.map((p, i) => (
                      <div
                        key={p}
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          done.includes(p)      ? "w-5 bg-emerald-500" :
                          p === current         ? "w-5 bg-indigo-400"  :
                          "w-3 bg-white/[0.15]",
                          i === 0 && ""
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ton nom d&apos;utilisateur {platformLabel(current)}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm select-none">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(null); }}
                    onKeyDown={e => e.key === "Enter" && handlePreview()}
                    placeholder="tonpseudo"
                    className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[12px] pl-8 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1.5">
                  Exemple : @khalid.creator (sans le @)
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}

              <button
                onClick={handlePreview}
                disabled={loading || !username.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-sm font-semibold hover:from-indigo-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.01] shadow-lg shadow-indigo-500/20"
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Recherche en cours…</>
                  : <><ArrowRight size={16} /> Rechercher</>
                }
              </button>

              <button
                onClick={() => { setStep("platform"); setError(null); setUsername(""); setPreview(null); }}
                className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-1"
              >
                ← Changer de plateforme
              </button>
            </div>
          )}

          {/* ════════════════════════════════════════════
              STEP 3 — Confirm profile
          ════════════════════════════════════════════ */}
          {step === "confirm" && preview && (
            <div className="space-y-5">
              <p className="text-sm text-slate-400">
                Nous avons trouvé ce profil. Est-ce bien ton compte ?
              </p>

              {/* Profile card */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-700 flex-shrink-0 ring-2 ring-white/[0.06]">
                    {preview.avatar ? (
                      <Image
                        src={preview.avatar}
                        alt={preview.nickname ?? preview.handle}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                        {(preview.nickname ?? preview.handle)[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <PlatformBadge platform={preview.platform} size="sm" />
                      <p className="text-base font-bold text-slate-100 truncate">
                        {preview.nickname ?? `@${preview.handle}`}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">@{preview.handle}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Users size={12} className="text-indigo-400" />
                        <span className="font-semibold text-slate-200">{formatNumber(preview.followers)}</span>
                        <span>abonnés</span>
                      </span>
                      {preview.posts > 0 && (
                        <span className="text-xs text-slate-500">
                          {formatNumber(preview.posts)} publications
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {preview.bio && (
                  <p className="text-xs text-slate-500 border-t border-white/[0.05] pt-3 leading-relaxed line-clamp-2">
                    {preview.bio}
                  </p>
                )}
              </div>

              {/* Admin review note */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Clock size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300 leading-relaxed">
                  Ton compte sera examiné par notre équipe dans les <strong>24h</strong>. Tu recevras une notification une fois vérifié.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}

              {/* Yes / No buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setStep("username"); setPreview(null); setError(null); setUsername(""); }}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-sm font-medium text-slate-300 transition-all duration-200"
                >
                  Non, changer
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-sm font-semibold hover:from-indigo-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.01] shadow-lg shadow-indigo-500/20"
                >
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" /> En cours…</>
                    : <><CheckCircle size={15} /> Oui, c&apos;est moi</>
                  }
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════
              STEP 4 — Success
          ════════════════════════════════════════════ */}
          {step === "success" && (
            <div className="space-y-5 text-center">
              {/* Badge */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border-2 border-emerald-500/40 flex items-center justify-center">
                  <CheckCircle size={36} className="text-emerald-400" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-1">
                  Compte{done.length > 1 ? "s" : ""} soumis pour vérification !
                </h3>
                <p className="text-sm text-slate-400">
                  Notre équipe va vérifier {done.length > 1 ? "tes comptes" : "ton compte"} dans les prochaines 24h.
                </p>
              </div>

              {/* Connected platforms */}
              <div className="space-y-2">
                {done.map((p) => (
                  <div
                    key={p}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                  >
                    <PlatformBadge platform={p} size="sm" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-slate-200">{platformLabel(p)}</p>
                      <p className="text-xs text-slate-500">En attente de vérification</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
                      <Clock size={10} />
                      <span>24h</span>
                    </div>
                  </div>
                ))}
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

        {/* Footer — skip */}
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
