"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Clock, CheckCircle, AlertCircle, ExternalLink,
  Lightbulb, Flame, Upload, Link2, Loader2, RefreshCw,
  Hash, Trophy, X,
} from "lucide-react";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import CountdownTimer from "@/components/dashboard/countdown-timer";
import { cn, formatMAD } from "@/lib/utils";
import toast from "react-hot-toast";

// ── Types ─────────────────────────────────────────────────────────────────────

type Platform = "instagram" | "tiktok";
type ContentMode = "link" | "upload";

type Challenge = {
  id:              string;
  title:           string;
  category:        string;
  description:     string;
  brief?:          string | null;
  rules:           string;
  endDate:         Date;
  prizeAmount:     number | null;
  type:            string;
  hashtag?:        string | null;
  allowedPlatforms:string[];
  contentTypes:    string[];
  sponsor?:        string;
};

type VerifyState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok";     authorName: string }
  | { status: "error";  message: string };

type PlatformSubmission = {
  mode:            ContentMode;
  uploadedFileUrl: string | null;
  postUrl:         string;
  verify:          VerifyState;
};

type Step = "platform" | "content" | "caption" | "confirm" | "success";

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_GRADIENTS: Record<string, string> = {
  Humour: "from-orange-500 to-yellow-500", Food:      "from-green-500 to-emerald-500",
  Beauté: "from-pink-500 to-rose-500",     Lifestyle: "from-purple-500 to-indigo-500",
  Tech:   "from-blue-500 to-cyan-500",     Sport:     "from-red-500 to-orange-500",
  Mode:   "from-fuchsia-500 to-pink-500",  Gaming:    "from-violet-500 to-indigo-500",
  Voyage: "from-teal-500 to-cyan-500",
};

function TikTokIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.53V6.78a4.85 4.85 0 0 1-1.01-.09z" />
    </svg>
  );
}

function InstagramIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function PlatformIcon({ platform, size = 16, className = "" }: { platform: Platform; size?: number; className?: string }) {
  if (platform === "instagram") return <InstagramIcon size={size} className={className} />;
  return <TikTokIcon size={size} className={className} />;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ChallengeDetailClient({ challenge }: { challenge: Challenge }) {
  const allowed = (challenge.allowedPlatforms?.length ? challenge.allowedPlatforms : ["instagram", "tiktok"]) as Platform[];
  const catGrad = CATEGORY_GRADIENTS[challenge.category] ?? "from-indigo-500 to-pink-500";

  const [step, setStep]               = useState<Step>("platform");
  const [platforms, setPlatforms]     = useState<Platform[]>([allowed[0]]);
  const [activePlatform, setActivePlatform] = useState<Platform>(allowed[0]);
  const [caption, setCaption]         = useState("");
  const [agreedRules, setAgreedRules] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [successPlatforms, setSuccessPlatforms] = useState<Platform[]>([]);

  const [subs, setSubs] = useState<Record<Platform, PlatformSubmission>>({
    instagram: { mode: "link", uploadedFileUrl: null, postUrl: "", verify: { status: "idle" } },
    tiktok:    { mode: "link", uploadedFileUrl: null, postUrl: "", verify: { status: "idle" } },
  });

  // ── Upload state ────────────────────────────────────────────────────────────
  const [uploading, setUploading] = useState<Record<Platform, boolean>>({ instagram: false, tiktok: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  function updateSub(platform: Platform, patch: Partial<PlatformSubmission>) {
    setSubs((s) => ({ ...s, [platform]: { ...s[platform], ...patch } }));
  }

  // ── Verification ────────────────────────────────────────────────────────────
  const verifyPost = useCallback(async (platform: Platform, url: string) => {
    if (!url) return;
    updateSub(platform, { verify: { status: "loading" } });
    try {
      const res  = await fetch(`/api/challenges/${challenge.id}/verify-url`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, postUrl: url }),
      });
      const data = await res.json() as { ok?: boolean; authorName?: string; error?: string };

      if (data.ok) {
        updateSub(platform, { verify: { status: "ok", authorName: data.authorName! } });
      } else {
        updateSub(platform, { verify: { status: "error", message: data.error ?? "Vérification échouée" } });
      }
    } catch {
      updateSub(platform, { verify: { status: "error", message: "Erreur réseau" } });
    }
  }, [challenge.id]);

  // ── File upload to R2 ───────────────────────────────────────────────────────
  async function handleFileUpload(platform: Platform, file: File) {
    setUploading((u) => ({ ...u, [platform]: true }));
    try {
      const qRes = await fetch(
        `/api/upload?fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}&folder=challenges`
      );
      if (!qRes.ok) { toast.error("Erreur upload"); return; }

      const { uploadUrl, publicUrl } = await qRes.json() as { uploadUrl: string; publicUrl: string };

      const upRes = await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!upRes.ok) { toast.error("Échec de l'upload"); return; }

      updateSub(platform, { uploadedFileUrl: publicUrl });
      toast.success("Fichier uploadé !");
    } catch {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading((u) => ({ ...u, [platform]: false }));
    }
  }

  // ── Submit all platforms ────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!agreedRules) { toast.error("Accepte les règles du défi"); return; }
    setSubmitting(true);

    const results: Platform[] = [];
    const errors: string[] = [];

    for (const platform of platforms) {
      const sub = subs[platform];
      if (!sub.postUrl) { errors.push(`URL ${platform} manquante`); continue; }
      try {
        const res  = await fetch(`/api/challenges/${challenge.id}/submit`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform,
            postUrl:         sub.postUrl,
            uploadedFileUrl: sub.uploadedFileUrl,
            caption,
          }),
        });
        const data = await res.json() as { error?: string };
        if (!res.ok) {
          errors.push(data.error ?? `Erreur ${platform}`);
        } else {
          results.push(platform);
        }
      } catch {
        errors.push(`Erreur réseau (${platform})`);
      }
    }

    setSubmitting(false);
    if (results.length > 0) {
      setSuccessPlatforms(results);
      setStep("success");
      if (errors.length > 0) toast.error(errors.join(" · "));
    } else {
      errors.forEach((e) => toast.error(e));
    }
  }

  // ── Step: platform ──────────────────────────────────────────────────────────
  function canAdvanceFromPlatform() { return platforms.length > 0; }
  function canAdvanceFromContent() {
    return platforms.every((p) => {
      const sub = subs[p];
      return sub.postUrl.length > 0 && sub.verify.status === "ok";
    });
  }

  // ── Progress bar ────────────────────────────────────────────────────────────
  const PROGRESS: Record<Step, number> = {
    platform: allowed.length === 1 ? 0 : 15,
    content:  40,
    caption:  65,
    confirm:  85,
    success:  100,
  };

  const rules = challenge.rules
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-3xl space-y-6">
      {/* Back */}
      <Link href="/dashboard/creator/challenges" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors">
        <ArrowLeft size={15} /> Retour aux défis
      </Link>

      {/* Challenge header */}
      <div className="glass rounded-[20px] overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${catGrad}`} />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge variant="primary">{challenge.category}</Badge>
                {challenge.type === "SPONSORED" && <Badge variant="warning">Sponsorisé</Badge>}
                {challenge.hashtag && (
                  <span className="flex items-center gap-1 text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                    <Hash size={11} />#{challenge.hashtag}
                  </span>
                )}
                {allowed.map((p) => (
                  <span key={p} className={cn(
                    "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                    p === "instagram" ? "bg-pink-500/10 text-pink-400" : "bg-slate-700/60 text-slate-300"
                  )}>
                    <PlatformIcon platform={p} size={11} />{p === "instagram" ? "Instagram" : "TikTok"}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl font-heading font-bold text-slate-100">{challenge.title}</h1>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">{challenge.description}</p>
              {challenge.brief && (
                <p className="text-slate-400 text-sm mt-2 leading-relaxed border-l-2 border-indigo-500/40 pl-3">{challenge.brief}</p>
              )}
            </div>
            {challenge.prizeAmount && (
              <div className="flex-shrink-0 glass rounded-[14px] p-4 text-center border border-amber-500/20">
                <Trophy size={16} className="text-amber-400 mx-auto mb-1" />
                <p className="text-2xl font-heading font-bold text-amber-400">{formatMAD(challenge.prizeAmount)}</p>
                <p className="text-xs text-slate-600">à gagner</p>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-white/8 flex items-center gap-3">
            <Clock size={14} className="text-slate-600" />
            <span className="text-xs text-slate-600">Temps restant :</span>
            <CountdownTimer endDate={challenge.endDate} size="sm" />
          </div>
        </div>
      </div>

      {/* Rules */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass rounded-[16px] p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-4">
            <AlertCircle size={15} className="text-orange-400" /> Règles du défi
          </h3>
          <ul className="space-y-2">
            {rules.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                <span className="text-orange-400 font-bold flex-shrink-0">{i + 1}.</span>{r}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass rounded-[16px] p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-4">
            <Lightbulb size={15} className="text-amber-400" /> Tips pour performer
          </h3>
          <ul className="space-y-2 text-xs text-slate-500">
            <li className="flex items-start gap-2"><span className="text-amber-400">💡</span>Utilise le hashtag <span className="text-indigo-300">#{challenge.hashtag || "officiel"}</span> dans ta caption</li>
            <li className="flex items-start gap-2"><span className="text-amber-400">💡</span>Poste aux heures de pointe (18h–21h) pour plus d&apos;engagement</li>
            <li className="flex items-start gap-2"><span className="text-amber-400">💡</span>Un contenu authentique performe toujours mieux que le contenu trop produit</li>
            <li className="flex items-start gap-2"><span className="text-amber-400">💡</span>Réponds aux commentaires dans les premières heures pour booster l&apos;algo</li>
          </ul>
        </div>
      </div>

      {/* ── Wizard ── */}
      {step !== "success" ? (
        <div className="glass rounded-[20px] overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-slate-800">
            <div
              className={`h-full bg-gradient-to-r ${catGrad} transition-all duration-500`}
              style={{ width: `${PROGRESS[step]}%` }}
            />
          </div>

          <div className="p-6 sm:p-8">

            {/* ── Step: Platform ── */}
            {step === "platform" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-heading font-bold text-slate-100 mb-1">Choisis ta plateforme</h2>
                  <p className="text-slate-500 text-sm">Sur quelle(s) plateforme(s) vas-tu poster ton contenu ?</p>
                </div>

                <div className="grid gap-3">
                  {(["instagram", "tiktok"] as Platform[]).filter((p) => allowed.includes(p)).map((p) => {
                    const selected = platforms.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          setPlatforms((prev) =>
                            prev.includes(p)
                              ? prev.filter((x) => x !== p)
                              : [...prev, p]
                          );
                        }}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-[14px] border text-left transition-all",
                          selected
                            ? p === "instagram"
                              ? "bg-pink-500/10 border-pink-500/40"
                              : "bg-slate-700/40 border-slate-500/40"
                            : "bg-slate-800/40 border-white/8 hover:border-white/20"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0",
                          p === "instagram" ? "bg-gradient-to-br from-pink-500 to-orange-500" : "bg-slate-800"
                        )}>
                          <PlatformIcon platform={p} size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-200">
                            {p === "instagram" ? "Instagram" : "TikTok"}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {p === "instagram" ? "Reels, Posts, Stories" : "Vidéos TikTok"}
                          </p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                          selected ? "bg-indigo-500 border-indigo-500" : "border-slate-600"
                        )}>
                          {selected && <CheckCircle size={12} className="text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!canAdvanceFromPlatform()) { toast.error("Sélectionne au moins une plateforme"); return; }
                      setActivePlatform(platforms[0]);
                      setStep("content");
                    }}
                  >
                    Continuer <ArrowLeft size={14} className="rotate-180" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step: Content ── */}
            {step === "content" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-heading font-bold text-slate-100 mb-1">Soumets ton contenu</h2>
                  <p className="text-slate-500 text-sm">Upload ton contenu ou colle le lien d&apos;un post déjà publié.</p>
                </div>

                {/* Platform tabs if multiple selected */}
                {platforms.length > 1 && (
                  <div className="flex gap-2">
                    {platforms.map((p) => (
                      <button
                        key={p}
                        onClick={() => setActivePlatform(p)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                          activePlatform === p
                            ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300"
                            : "border-white/8 text-slate-500 hover:text-slate-300"
                        )}
                      >
                        <PlatformIcon platform={p} size={12} />
                        {p === "instagram" ? "Instagram" : "TikTok"}
                        {subs[p].verify.status === "ok" && <CheckCircle size={11} className="text-emerald-400" />}
                        {subs[p].verify.status === "error" && <X size={11} className="text-red-400" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* Content for active platform */}
                {platforms.map((platform) => (
                  <div key={platform} className={cn(activePlatform !== platform && "hidden")}>
                    {/* Mode toggle */}
                    <div className="flex gap-2 mb-4">
                      {(["link", "upload"] as ContentMode[]).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => updateSub(platform, { mode, verify: { status: "idle" } })}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-[10px] border text-sm transition-all",
                            subs[platform].mode === mode
                              ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-300"
                              : "border-white/8 text-slate-500 hover:text-slate-300"
                          )}
                        >
                          {mode === "link" ? <Link2 size={14} /> : <Upload size={14} />}
                          {mode === "link" ? "Coller un lien" : "Uploader le fichier"}
                        </button>
                      ))}
                    </div>

                    {/* Upload mode */}
                    {subs[platform].mode === "upload" && (
                      <div className="space-y-3">
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className={cn(
                            "border-2 border-dashed rounded-[14px] p-8 text-center cursor-pointer transition-all",
                            "border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5"
                          )}
                        >
                          {uploading[platform] ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 size={28} className="text-indigo-400 animate-spin" />
                              <p className="text-sm text-slate-500">Upload en cours…</p>
                            </div>
                          ) : subs[platform].uploadedFileUrl ? (
                            <div className="flex flex-col items-center gap-2">
                              <CheckCircle size={28} className="text-emerald-400" />
                              <p className="text-sm text-emerald-400 font-medium">Fichier uploadé !</p>
                              <a
                                href={subs[platform].uploadedFileUrl!}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                              >
                                Télécharger <ExternalLink size={11} />
                              </a>
                              <p className="text-xs text-slate-600 mt-1">Clique pour remplacer</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <Upload size={28} className="text-slate-600" />
                              <p className="text-sm text-slate-400">Glisse ton fichier ou clique pour choisir</p>
                              <p className="text-xs text-slate-600">MP4, MOV, JPG, PNG — max 500 MB</p>
                            </div>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(platform, file);
                          }}
                        />
                        {subs[platform].uploadedFileUrl && (
                          <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-[10px] text-xs text-slate-400">
                            <p className="font-medium text-slate-300 mb-1">Étape suivante :</p>
                            <p>Télécharge ton fichier → Poste-le sur {platform === "instagram" ? "Instagram" : "TikTok"} → Reviens coller le lien du post ci-dessous.</p>
                          </div>
                        )}
                        {subs[platform].uploadedFileUrl && (
                          <PostUrlInput
                            platform={platform}
                            value={subs[platform].postUrl}
                            onChange={(v) => { updateSub(platform, { postUrl: v, verify: { status: "idle" } }); }}
                            onVerify={() => verifyPost(platform, subs[platform].postUrl)}
                            verify={subs[platform].verify}
                          />
                        )}
                      </div>
                    )}

                    {/* Link mode */}
                    {subs[platform].mode === "link" && (
                      <PostUrlInput
                        platform={platform}
                        value={subs[platform].postUrl}
                        onChange={(v) => { updateSub(platform, { postUrl: v, verify: { status: "idle" } }); }}
                        onVerify={() => verifyPost(platform, subs[platform].postUrl)}
                        verify={subs[platform].verify}
                      />
                    )}
                  </div>
                ))}

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep(allowed.length === 1 ? "platform" : "platform")}>
                    <ArrowLeft size={14} /> Retour
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!canAdvanceFromContent()}
                    onClick={() => setStep("caption")}
                  >
                    Continuer <ArrowLeft size={14} className="rotate-180" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step: Caption ── */}
            {step === "caption" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-heading font-bold text-slate-100 mb-1">Caption & hashtags</h2>
                  <p className="text-slate-500 text-sm">Colle la caption exacte que tu as utilisée sur ton post.</p>
                </div>

                {challenge.hashtag && (
                  <div className="flex items-center gap-2 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-[10px]">
                    <Hash size={13} className="text-indigo-400 flex-shrink-0" />
                    <p className="text-xs text-slate-400">
                      Hashtag obligatoire : <span className="text-indigo-300 font-semibold">#{challenge.hashtag}</span>
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">
                    Caption <span className="text-slate-600 font-normal">({caption.length}/2200)</span>
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value.slice(0, 2200))}
                    rows={5}
                    placeholder={`Ex: Mon défi ${challenge.title} 🔥 #${challenge.hashtag ?? "Mafluencer"} @mafluencer.ma…`}
                    className="w-full bg-slate-800/60 border border-white/8 rounded-[12px] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep("content")}><ArrowLeft size={14} /> Retour</Button>
                  <Button variant="primary" onClick={() => setStep("confirm")}>
                    Continuer <ArrowLeft size={14} className="rotate-180" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step: Confirm ── */}
            {step === "confirm" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-heading font-bold text-slate-100 mb-1">Confirmation finale</h2>
                  <p className="text-slate-500 text-sm">Vérifie ta participation avant de soumettre.</p>
                </div>

                <div className="space-y-3">
                  {platforms.map((platform) => {
                    const sub = subs[platform];
                    const vok = sub.verify.status === "ok";
                    return (
                      <div key={platform} className="glass-sm rounded-[12px] p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <PlatformIcon platform={platform} size={14} className={platform === "instagram" ? "text-pink-400" : "text-slate-300"} />
                            <span className="text-sm font-medium text-slate-200">
                              {platform === "instagram" ? "Instagram" : "TikTok"}
                            </span>
                          </div>
                          <span className={cn(
                            "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                            vok ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                          )}>
                            {vok ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
                            {vok ? "Vérifié" : "En attente"}
                          </span>
                        </div>
                        <a href={sub.postUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 truncate">
                          {sub.postUrl} <ExternalLink size={10} />
                        </a>
                        {vok && sub.verify.status === "ok" && (
                          <p className="text-xs text-slate-600">Auteur : @{sub.verify.authorName}</p>
                        )}
                      </div>
                    );
                  })}

                  {caption && (
                    <div className="glass-sm rounded-[12px] p-4">
                      <p className="text-xs text-slate-600 mb-1">Caption</p>
                      <p className="text-sm text-slate-300 line-clamp-3">{caption}</p>
                    </div>
                  )}
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div
                    onClick={() => setAgreedRules((v) => !v)}
                    className={cn(
                      "w-5 h-5 rounded-[6px] border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                      agreedRules ? "bg-indigo-500 border-indigo-500" : "border-white/20 group-hover:border-indigo-500/50"
                    )}
                  >
                    {agreedRules && <CheckCircle size={12} className="text-white" />}
                  </div>
                  <span className="text-sm text-slate-400">
                    Je confirme que mon contenu respecte les règles du défi et a bien été publié avec les hashtags requis.
                  </span>
                </label>

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep("caption")}><ArrowLeft size={14} /> Retour</Button>
                  <Button variant="primary" loading={submitting} onClick={handleSubmit}>
                    <Flame size={15} /> Soumettre ma participation
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      ) : (
        /* ── Success ── */
        <div className="glass rounded-[20px] p-10 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle size={36} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-slate-100 mb-2">Participation soumise !</h2>
          <p className="text-slate-500 mb-4">
            Ta participation au défi <span className="text-slate-300 font-medium">{challenge.title}</span> a bien été enregistrée.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {successPlatforms.map((p) => (
              <span key={p} className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                p === "instagram" ? "bg-pink-500/10 text-pink-400" : "bg-slate-700/60 text-slate-300"
              )}>
                <CheckCircle size={12} />
                <PlatformIcon platform={p} size={12} />
                {p === "instagram" ? "Instagram" : "TikTok"} soumis
              </span>
            ))}
          </div>

          <p className="text-xs text-slate-600 mb-6">
            Tes métriques (vues, likes, commentaires) seront suivies automatiquement. Le score final est calculé à la fin du défi.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard/creator/challenges">
              <Button variant="secondary">Voir les autres défis</Button>
            </Link>
            <Link href="/dashboard/creator">
              <Button variant="primary">Dashboard</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PostUrlInput sub-component ────────────────────────────────────────────────

function PostUrlInput({
  platform, value, onChange, onVerify, verify,
}: {
  platform: Platform;
  value:    string;
  onChange: (v: string) => void;
  onVerify: () => void;
  verify:   VerifyState;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        Lien du post {platform === "instagram" ? "Instagram" : "TikTok"}
      </label>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            platform === "instagram"
              ? "https://www.instagram.com/p/…"
              : "https://www.tiktok.com/@toncompte/video/…"
          }
          className="flex-1 bg-slate-800/60 border border-white/8 rounded-[12px] px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
        />
        <button
          onClick={onVerify}
          disabled={!value || verify.status === "loading"}
          className={cn(
            "px-3 py-2.5 rounded-[12px] border text-xs font-medium flex items-center gap-1.5 transition-all flex-shrink-0",
            "border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          {verify.status === "loading" ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Vérifier
        </button>
      </div>

      {/* Verification status */}
      {verify.status === "ok" && (
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-[10px] px-3 py-2">
          <CheckCircle size={13} />
          Post vérifié · auteur @{verify.authorName}
        </div>
      )}
      {verify.status === "error" && (
        <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-[10px] px-3 py-2">
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
          {verify.message}
        </div>
      )}
      {verify.status === "loading" && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 size={13} className="animate-spin" /> Vérification en cours…
        </div>
      )}
    </div>
  );
}
