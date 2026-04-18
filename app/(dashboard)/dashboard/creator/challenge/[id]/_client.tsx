"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft, Clock, Upload, CheckCircle, AlertCircle,
  ExternalLink, Lightbulb, Play, X, Flame,
} from "lucide-react";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import CountdownTimer from "@/components/dashboard/countdown-timer";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type Challenge = {
  id: string; title: string; category: string; description: string;
  rules: string[]; tips: string[]; endDate: Date;
  prizeAmount: number | null; type: string; sponsor?: string;
};

const STEPS = ["Vidéo", "Caption", "Vérification", "Soumis"] as const;
type Step = 0 | 1 | 2 | 3;

const CATEGORY_GRADIENTS: Record<string, string> = {
  Humour: "from-orange-500 to-yellow-500",
  Food: "from-green-500 to-emerald-500",
  Beauté: "from-pink-500 to-rose-500",
  Lifestyle: "from-purple-500 to-indigo-500",
  Tech: "from-blue-500 to-cyan-500",
  Sport: "from-red-500 to-orange-500",
};

export default function ChallengeDetailClient({ challenge }: { challenge: Challenge }) {
  const [step, setStep] = useState<Step>(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [agreedRules, setAgreedRules] = useState(false);
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState("");

  const catGrad = CATEGORY_GRADIENTS[challenge.category] ?? "from-indigo-500 to-pink-500";

  function validateUrl(url: string): boolean {
    return url.includes("tiktok.com") || url.includes("instagram.com") || url.includes("youtu");
  }

  function handleNext() {
    if (step === 0) {
      if (!videoUrl) { setUrlError("Le lien de ta vidéo est requis"); return; }
      if (!validateUrl(videoUrl)) { setUrlError("Lien TikTok, Instagram ou YouTube requis"); return; }
      setUrlError("");
    }
    if (step === 1 && !caption) { toast.error("Ajoute une caption pour ta vidéo"); return; }
    setStep((s) => (s + 1) as Step);
  }

  async function handleSubmit() {
    if (!agreedRules) { toast.error("Tu dois accepter les règles du défi"); return; }
    setLoading(true);
    try {
      const res  = await fetch(`/api/challenges/${challenge.id}/submit`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ videoUrl, caption }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erreur lors de la soumission"); return; }
      setStep(3);
      toast.success("Soumission envoyée avec succès !");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

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
                {challenge.sponsor && <span className="text-xs text-slate-600">par {challenge.sponsor}</span>}
              </div>
              <h1 className="text-2xl font-heading font-bold text-slate-100">{challenge.title}</h1>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">{challenge.description}</p>
            </div>
            {challenge.prizeAmount && (
              <div className="flex-shrink-0 glass rounded-[14px] p-4 text-center border border-amber-500/20">
                <p className="text-2xl font-heading font-bold text-amber-400">{challenge.prizeAmount}</p>
                <p className="text-xs text-slate-600">MAD à gagner</p>
              </div>
            )}
          </div>

          {/* Timer */}
          <div className="mt-5 pt-4 border-t border-white/8 flex items-center gap-3">
            <Clock size={14} className="text-slate-600" />
            <span className="text-xs text-slate-600">Temps restant :</span>
            <CountdownTimer endDate={challenge.endDate} size="sm" />
          </div>
        </div>
      </div>

      {/* Rules + Tips */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass rounded-[16px] p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-4">
            <AlertCircle size={15} className="text-orange-400" /> Règles du défi
          </h3>
          <ul className="space-y-2">
            {challenge.rules.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                <span className="text-orange-400 font-bold flex-shrink-0">{i + 1}.</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass rounded-[16px] p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-4">
            <Lightbulb size={15} className="text-amber-400" /> Tips pour performer
          </h3>
          <ul className="space-y-2">
            {challenge.tips.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                <span className="text-amber-400 flex-shrink-0 mt-0.5">💡</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Submission wizard ── */}
      {step < 3 ? (
        <div className="glass rounded-[20px] p-6 sm:p-8">
          {/* Progress steps */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.slice(0, 3).map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all",
                  i < step ? "bg-emerald-500 text-white" :
                  i === step ? `bg-gradient-to-br ${catGrad} text-white shadow-lg` :
                  "bg-slate-800 text-slate-600"
                )}>
                  {i < step ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className={cn(
                  "text-xs hidden sm:block",
                  i === step ? "text-slate-200 font-medium" : "text-slate-600"
                )}>{s}</span>
                {i < 2 && <div className={cn("flex-1 h-px", i < step ? "bg-emerald-500/40" : "bg-white/8")} />}
              </div>
            ))}
          </div>

          {/* Step 0 — Lien vidéo */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-heading font-bold text-slate-100 mb-1">Lien de ta vidéo</h2>
                <p className="text-slate-500 text-sm">Poste d'abord ta vidéo sur TikTok ou Instagram, puis colle le lien ici.</p>
              </div>
              <Input
                label="URL de la vidéo"
                placeholder="https://www.tiktok.com/@toncompte/video/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                error={urlError}
                leftIcon={<Play size={15} />}
              />
              {videoUrl && validateUrl(videoUrl) && (
                <div className="glass rounded-[12px] p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <Play size={16} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 truncate">Vidéo détectée</p>
                    <p className="text-xs text-slate-600 truncate">{videoUrl}</p>
                  </div>
                  <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={14} className="text-slate-500 hover:text-slate-300 transition-colors" />
                  </a>
                </div>
              )}
              <div className="flex justify-end pt-2">
                <Button variant="primary" onClick={handleNext}>
                  Continuer <ArrowLeft size={14} className="rotate-180" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 1 — Caption */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-heading font-bold text-slate-100 mb-1">Caption & hashtags</h2>
                <p className="text-slate-500 text-sm">Colle la caption que tu as utilisée sur ta vidéo. Vérifie que le hashtag obligatoire est bien présent.</p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Caption de ta vidéo</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  placeholder={`Ex: Mon défi ${challenge.title} 🎬 #MafluenceurRamadan #Creator...`}
                  className="w-full bg-slate-800/60 border border-white/8 rounded-[12px] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
                />
                <p className="text-xs text-slate-600">{caption.length} caractères</p>
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(0)}>
                  <ArrowLeft size={14} /> Retour
                </Button>
                <Button variant="primary" onClick={handleNext}>
                  Continuer <ArrowLeft size={14} className="rotate-180" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 — Vérification */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-heading font-bold text-slate-100 mb-1">Vérification finale</h2>
                <p className="text-slate-500 text-sm">Vérifie tes informations avant de soumettre.</p>
              </div>

              <div className="space-y-3">
                <div className="glass-sm rounded-[12px] p-4">
                  <p className="text-xs text-slate-600 mb-1">Lien vidéo</p>
                  <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 truncate">
                    {videoUrl} <ExternalLink size={12} />
                  </a>
                </div>
                <div className="glass-sm rounded-[12px] p-4">
                  <p className="text-xs text-slate-600 mb-1">Caption</p>
                  <p className="text-sm text-slate-300 line-clamp-3">{caption}</p>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className={cn(
                  "w-5 h-5 rounded-[6px] border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                  agreedRules ? "bg-indigo-500 border-indigo-500" : "border-white/20 group-hover:border-indigo-500/50"
                )}
                  onClick={() => setAgreedRules((v) => !v)}
                >
                  {agreedRules && <CheckCircle size={12} className="text-white" />}
                </div>
                <span className="text-sm text-slate-400">
                  Je confirme que ma vidéo respecte toutes les règles du défi et qu&apos;elle a bien été publiée avec les hashtags requis.
                </span>
              </label>

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft size={14} /> Retour
                </Button>
                <Button variant="primary" onClick={handleSubmit} loading={loading}>
                  <Flame size={15} /> Soumettre ma participation
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Success state */
        <div className="glass rounded-[20px] p-10 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle size={36} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-slate-100 mb-2">Soumission envoyée !</h2>
          <p className="text-slate-500 mb-6">
            Ta participation au défi <span className="text-slate-300 font-medium">{challenge.title}</span> a bien été enregistrée.
            Les votes de la communauté vont déterminer ton classement.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard/creator/challenges">
              <Button variant="secondary">Voir les autres défis</Button>
            </Link>
            <Link href="/dashboard/creator">
              <Button variant="primary">
                <ArrowLeft size={14} className="rotate-180" /> Dashboard
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
