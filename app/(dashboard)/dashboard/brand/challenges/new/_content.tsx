"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Flame, ArrowLeft, CheckCircle, AlertCircle,
  Trophy, Tag, Calendar, DollarSign, Users, Hash,
} from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import PageHeader from "@/components/dashboard/page-header";
import { cn, formatMAD } from "@/lib/utils";
import toast from "react-hot-toast";

const CATEGORIES = ["Humour", "Food", "Beauté", "Lifestyle", "Tech", "Sport", "Mode", "Gaming", "Voyage"];

const CATEGORY_GRADIENTS: Record<string, string> = {
  Humour:    "from-orange-500 to-yellow-500",
  Food:      "from-green-500 to-emerald-500",
  Beauté:    "from-pink-500 to-rose-500",
  Lifestyle: "from-purple-500 to-indigo-500",
  Tech:      "from-blue-500 to-cyan-500",
  Sport:     "from-red-500 to-orange-500",
  Mode:      "from-fuchsia-500 to-pink-500",
  Gaming:    "from-violet-500 to-indigo-500",
  Voyage:    "from-teal-500 to-cyan-500",
};

const DURATION_OPTIONS = [
  { value: "3",  label: "3 jours",      sub: "Challenge express" },
  { value: "7",  label: "7 jours",      sub: "Durée standard" },
  { value: "14", label: "2 semaines",   sub: "Large audience" },
  { value: "30", label: "1 mois",       sub: "Challenge de fond" },
];

type Form = {
  title: string;
  category: string;
  description: string;
  hashtag: string;
  rules: string;
  prizeAmount: string;
  duration: string;
  maxParticipants: string;
};

type Step = 0 | 1 | 2 | 3;
const STEPS = ["Concept", "Règles & Hashtag", "Budget & durée", "Confirmation"] as const;

export default function NewChallengeContent() {
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<Form>({
    title: "", category: "Humour", description: "", hashtag: "",
    rules: "", prizeAmount: "", duration: "7", maxParticipants: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function set(k: keyof Form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function validateStep(): boolean {
    const errs: Partial<Record<keyof Form, string>> = {};
    if (step === 0) {
      if (!form.title.trim()) errs.title = "Titre requis";
      if (form.description.trim().length < 20) errs.description = "Description trop courte (min. 20 car.)";
    }
    if (step === 1) {
      if (!form.hashtag.trim()) errs.hashtag = "Hashtag requis";
      if (form.rules.trim().length < 10) errs.rules = "Décris au moins une règle";
    }
    if (step === 2) {
      if (!form.prizeAmount || Number(form.prizeAmount) < 500) errs.prizeAmount = "Prize pool minimum : 500 MAD";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (!validateStep()) return;
    setStep((s) => (s + 1) as Step);
  }

  async function handleSubmit() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    setSubmitted(true);
    toast.success("Défi sponsorisé créé ! Il sera visible après validation par Mafluencer.");
  }

  const catGrad = CATEGORY_GRADIENTS[form.category] ?? "from-indigo-500 to-pink-500";

  if (submitted) {
    return (
      <div className="max-w-3xl">
        <div className="glass rounded-[24px] overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${catGrad}`} />
          <div className="p-12 text-center space-y-5">
            <div className="w-20 h-20 mx-auto rounded-full bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
              <Flame size={36} className="text-indigo-400" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-slate-100">Défi créé !</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Ton défi <span className="text-slate-200 font-semibold">"{form.title}"</span> est en cours de validation. Il sera publié sous 24h.
            </p>
            <div className="glass-sm rounded-[14px] p-4 text-left space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between text-xs"><span className="text-slate-600">Catégorie</span><span className="text-slate-300">{form.category}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-600">Durée</span><span className="text-slate-300">{DURATION_OPTIONS.find(d => d.value === form.duration)?.label}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-600">Prize pool</span><span className="text-amber-400 font-semibold">{formatMAD(Number(form.prizeAmount))}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-600">Hashtag</span><span className="text-indigo-300">#{form.hashtag}</span></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/dashboard/brand">
                <Button variant="secondary">Dashboard</Button>
              </Link>
              <Link href="/dashboard/brand/challenges/new">
                <Button variant="primary" onClick={() => { setSubmitted(false); setStep(0); setForm({ title: "", category: "Humour", description: "", hashtag: "", rules: "", prizeAmount: "", duration: "7", maxParticipants: "" }); }}>
                  Créer un autre défi
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Créer un défi sponsorisé"
        subtitle="Lance un challenge de marque avec prize pool pour engager la communauté"
        icon={Flame}
      />

      {/* Step indicator */}
      <div className="glass rounded-[16px] p-4">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all",
                i < step  ? "bg-emerald-500 text-white" :
                i === step ? `bg-gradient-to-br ${catGrad} text-white shadow-lg` :
                "bg-slate-800 text-slate-600"
              )}>
                {i < step ? <CheckCircle size={13} /> : i + 1}
              </div>
              <span className={cn("text-xs hidden sm:block", i === step ? "text-slate-200 font-medium" : "text-slate-600")}>{s}</span>
              {i < STEPS.length - 1 && <div className={cn("flex-1 h-px", i < step ? "bg-emerald-500/40" : "bg-white/8")} />}
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-[20px] p-6 sm:p-8">
        {/* Step 0 — Concept */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-heading font-bold text-slate-100 mb-1">Concept du défi</h2>
              <p className="text-slate-500 text-sm">Décris l'idée centrale et la catégorie du challenge.</p>
            </div>

            <Input
              label="Titre du défi"
              placeholder="Ex: #MajestéMaroc — Montre ta majesté !"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              error={errors.title}
            />

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <Tag size={13} className="text-slate-500" /> Catégorie
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => {
                  const g = CATEGORY_GRADIENTS[c] ?? "from-indigo-500 to-pink-500";
                  return (
                    <button
                      key={c}
                      onClick={() => set("category", c)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                        form.category === c
                          ? `bg-gradient-to-r ${g} text-white border-transparent`
                          : "bg-slate-800/60 text-slate-500 border-white/8 hover:text-slate-300"
                      )}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">
                Description <span className="text-slate-600 font-normal">({form.description.length}/500)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value.slice(0, 500))}
                rows={4}
                placeholder="Décris le défi : qu'est-ce que les creators doivent faire, quel est le message..."
                className={cn(
                  "w-full bg-slate-800/60 border rounded-[12px] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none",
                  errors.description ? "border-red-500/50" : "border-white/8 focus:border-indigo-500/50"
                )}
              />
              {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={handleNext}>Continuer <ArrowLeft size={14} className="rotate-180" /></Button>
            </div>
          </div>
        )}

        {/* Step 1 — Rules & Hashtag */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-heading font-bold text-slate-100 mb-1">Règles et hashtag</h2>
              <p className="text-slate-500 text-sm">Définit les exigences de participation et le hashtag obligatoire.</p>
            </div>

            {/* Hashtag */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <Hash size={13} className="text-slate-500" /> Hashtag obligatoire
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">#</span>
                <input
                  value={form.hashtag}
                  onChange={(e) => set("hashtag", e.target.value.replace("#", "").replace(/\s/g, ""))}
                  placeholder="MaMarqueDéfi2025"
                  className={cn(
                    "w-full bg-slate-800/60 border rounded-[12px] pl-8 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all",
                    errors.hashtag ? "border-red-500/50" : "border-white/8 focus:border-indigo-500/50"
                  )}
                />
              </div>
              {errors.hashtag && <p className="text-xs text-red-400">{errors.hashtag}</p>}
            </div>

            {/* Rules */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Règles de participation</label>
              <textarea
                value={form.rules}
                onChange={(e) => set("rules", e.target.value)}
                rows={5}
                placeholder={"1. La vidéo doit durer entre 30 et 90 secondes\n2. Le hashtag #MaMarqueDéfi2025 doit être utilisé\n3. Mentionner @mamarque dans la caption\n4. Contenu original uniquement"}
                className={cn(
                  "w-full bg-slate-800/60 border rounded-[12px] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none",
                  errors.rules ? "border-red-500/50" : "border-white/8 focus:border-indigo-500/50"
                )}
              />
              {errors.rules && <p className="text-xs text-red-400">{errors.rules}</p>}
              <p className="text-xs text-slate-600">Une règle par ligne. Sois précis pour éviter les mauvaises soumissions.</p>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(0)}><ArrowLeft size={14} /> Retour</Button>
              <Button variant="primary" onClick={handleNext}>Continuer <ArrowLeft size={14} className="rotate-180" /></Button>
            </div>
          </div>
        )}

        {/* Step 2 — Budget & duration */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-heading font-bold text-slate-100 mb-1">Budget et durée</h2>
              <p className="text-slate-500 text-sm">Le prize pool attire plus de creators de qualité.</p>
            </div>

            {/* Prize pool */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <Trophy size={13} className="text-amber-400" /> Prize pool (MAD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={form.prizeAmount}
                  onChange={(e) => set("prizeAmount", e.target.value)}
                  placeholder="2000"
                  min="500"
                  className={cn(
                    "w-full bg-slate-800/60 border rounded-[12px] pl-4 pr-14 py-3 text-base text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all",
                    errors.prizeAmount ? "border-red-500/50" : "border-white/8 focus:border-indigo-500/50"
                  )}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">MAD</span>
              </div>
              {errors.prizeAmount && <p className="text-xs text-red-400">{errors.prizeAmount}</p>}
              {form.prizeAmount && Number(form.prizeAmount) >= 500 && (
                <p className="text-xs text-slate-600">
                  🥇 {formatMAD(Number(form.prizeAmount) * 0.5)} · 🥈 {formatMAD(Number(form.prizeAmount) * 0.3)} · 🥉 {formatMAD(Number(form.prizeAmount) * 0.2)}
                </p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-500" /> Durée du défi
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DURATION_OPTIONS.map(({ value, label, sub }) => (
                  <button
                    key={value}
                    onClick={() => set("duration", value)}
                    className={cn(
                      "p-3 rounded-[12px] border text-center transition-all",
                      form.duration === value
                        ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-300"
                        : "bg-slate-800/40 border-white/8 text-slate-400 hover:border-white/20"
                    )}
                  >
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Max participants (optional) */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <Users size={13} className="text-slate-500" /> Participants max <span className="text-slate-600 font-normal">(optionnel)</span>
              </label>
              <input
                type="number"
                value={form.maxParticipants}
                onChange={(e) => set("maxParticipants", e.target.value)}
                placeholder="Illimité"
                min="10"
                className="w-full bg-slate-800/60 border border-white/8 rounded-[12px] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            {/* Cost summary */}
            {form.prizeAmount && Number(form.prizeAmount) >= 500 && (
              <div className="glass-sm rounded-[12px] p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-400 mb-3">Récapitulatif du coût</p>
                <div className="flex justify-between text-xs text-slate-500"><span>Prize pool</span><span className="text-amber-400 font-semibold">{formatMAD(Number(form.prizeAmount))}</span></div>
                <div className="flex justify-between text-xs text-slate-500"><span>Frais de gestion Mafluencer (15%)</span><span className="text-slate-400">{formatMAD(Number(form.prizeAmount) * 0.15)}</span></div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 pt-1 border-t border-white/8"><span>Total débité</span><span className="text-slate-200">{formatMAD(Number(form.prizeAmount) * 1.15)}</span></div>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft size={14} /> Retour</Button>
              <Button variant="primary" onClick={handleNext}>Vérifier <ArrowLeft size={14} className="rotate-180" /></Button>
            </div>
          </div>
        )}

        {/* Step 3 — Confirmation */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-heading font-bold text-slate-100 mb-1">Confirmation finale</h2>
              <p className="text-slate-500 text-sm">Vérifie tous les détails de ton défi avant de le soumettre.</p>
            </div>

            {/* Preview card */}
            <div className="glass-sm rounded-[16px] overflow-hidden">
              <div className={`h-1.5 bg-gradient-to-r ${catGrad}`} />
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${catGrad} text-white mb-2`}>{form.category}</span>
                    <h3 className="text-base font-heading font-bold text-slate-100">{form.title || "—"}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{form.description}</p>
                  </div>
                  <div className="flex-shrink-0 text-center p-3 glass rounded-[10px] border border-amber-500/20">
                    <p className="text-lg font-heading font-bold text-amber-400">{form.prizeAmount ? Number(form.prizeAmount).toLocaleString("fr-MA") : "—"}</p>
                    <p className="text-[10px] text-slate-600">MAD à gagner</p>
                  </div>
                </div>
                <div className="flex gap-3 text-xs text-slate-600 pt-1 border-t border-white/8">
                  <span>#{form.hashtag || "—"}</span>
                  <span>·</span>
                  <span>{DURATION_OPTIONS.find(d => d.value === form.duration)?.label}</span>
                  {form.maxParticipants && <><span>·</span><span>max {form.maxParticipants} participants</span></>}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-[10px]">
              <AlertCircle size={13} className="text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500">
                En créant ce défi, <span className="text-slate-300 font-semibold">{form.prizeAmount ? formatMAD(Number(form.prizeAmount) * 1.15) : "le montant total"}</span> sera réservé sur ton solde. Le défi sera vérifié par l'équipe Mafluencer avant publication (sous 24h).
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(2)}><ArrowLeft size={14} /> Retour</Button>
              <Button variant="primary" loading={loading} onClick={handleSubmit}>
                <Flame size={14} /> Créer le défi
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
