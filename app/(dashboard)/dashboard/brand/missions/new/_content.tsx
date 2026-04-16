"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Briefcase, ArrowLeft, CheckCircle, User, FileText,
  DollarSign, Calendar, Tag, AlertCircle, ThumbsUp, ThumbsDown, Plus, X,
} from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import PageHeader from "@/components/dashboard/page-header";
import { cn, formatMAD } from "@/lib/utils";
import toast from "react-hot-toast";

const MISSION_TYPES = [
  { value: "POST",  label: "Post photo/vidéo courte", emoji: "📸", desc: "Reel, TikTok ou post statique" },
  { value: "STORY", label: "Story",                   emoji: "⏱️", desc: "1 à 5 stories séquentielles" },
  { value: "VIDEO", label: "Vidéo longue",             emoji: "🎬", desc: "YouTube, vidéo 60–180 sec" },
  { value: "UGC",   label: "UGC (fichier brut)",       emoji: "🎥", desc: "Contenu brut livré sans publication" },
];

// 3 steps: Type + Creator → Brief (do/don't + budget + deadline) → Review + Confirm
const STEPS = ["Type & Creator", "Brief & Budget", "Confirmation"] as const;
type Step = 0 | 1 | 2;

type Form = {
  creatorHandle: string;
  type: string;
  title: string;
  brief: string;
  dos: string[];
  donts: string[];
  budget: string;
  deadline: string;
};

export default function NewMissionContent() {
  const searchParams = useSearchParams();
  const prefillCreator = searchParams.get("creator") ?? "";

  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<Form>({
    creatorHandle: prefillCreator,
    type: "POST",
    title: "",
    brief: "",
    dos: [""],
    donts: [""],
    budget: "",
    deadline: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form | "dos" | "donts", string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function updateListItem(list: "dos" | "donts", index: number, value: string) {
    setForm((f) => {
      const next = [...f[list]];
      next[index] = value;
      return { ...f, [list]: next };
    });
  }

  function addListItem(list: "dos" | "donts") {
    setForm((f) => ({ ...f, [list]: [...f[list], ""] }));
  }

  function removeListItem(list: "dos" | "donts", index: number) {
    setForm((f) => {
      const next = f[list].filter((_, i) => i !== index);
      return { ...f, [list]: next.length ? next : [""] };
    });
  }

  function validateStep(): boolean {
    const errs: typeof errors = {};
    if (step === 0) {
      if (!form.creatorHandle.trim()) errs.creatorHandle = "Handle du creator requis";
    }
    if (step === 1) {
      if (!form.title.trim()) errs.title = "Titre requis";
      if (form.brief.trim().length < 30) errs.brief = "Brief trop court (min. 30 caractères)";
      if (!form.budget || Number(form.budget) < 100) errs.budget = "Budget minimum : 100 MAD";
      if (!form.deadline) errs.deadline = "Date limite requise";
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
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
    toast.success("Mission créée et envoyée au creator !");
  }

  function resetForm() {
    setSubmitted(false);
    setStep(0);
    setForm({ creatorHandle: "", type: "POST", title: "", brief: "", dos: [""], donts: [""], budget: "", deadline: "" });
  }

  const selectedType = MISSION_TYPES.find((t) => t.value === form.type);

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="max-w-3xl">
        <div className="glass rounded-[24px] p-12 text-center space-y-5">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle size={36} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-slate-100">Mission envoyée !</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Ta proposition a été envoyée à <span className="text-slate-200 font-semibold">@{form.creatorHandle}</span>.
            Le creator a 48h pour accepter ou refuser.
          </p>
          <div className="glass-sm rounded-[14px] p-4 text-left space-y-2 max-w-sm mx-auto">
            <div className="flex justify-between text-xs"><span className="text-slate-600">Creator</span><span className="text-slate-300">@{form.creatorHandle}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-600">Type</span><span className="text-slate-300">{selectedType?.emoji} {selectedType?.label}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-600">Mission</span><span className="text-slate-300 truncate max-w-[160px]">{form.title}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-600">Budget</span><span className="text-emerald-400 font-semibold">{formatMAD(Number(form.budget))}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-600">Deadline</span><span className="text-slate-300">{form.deadline}</span></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/dashboard/brand/missions"><Button variant="secondary">Voir mes missions</Button></Link>
            <Button variant="primary" onClick={resetForm}>Créer une autre mission</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Créer une mission"
        subtitle="Propose une collaboration sponsorisée à un creator"
        icon={Briefcase}
      />

      {/* Step indicator */}
      <div className="glass rounded-[16px] p-4">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all",
                i < step  ? "bg-emerald-500 text-white" :
                i === step ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" :
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

        {/* ── Step 0 — Type + Creator ─────────────────────────────────────── */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-heading font-bold text-slate-100 mb-1">Type de contenu & creator</h2>
              <p className="text-slate-500 text-sm">Choisis d'abord ce que tu veux créer, puis le creator ciblé.</p>
            </div>

            {/* Mission type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <Tag size={13} className="text-slate-500" /> Type de contenu
              </label>
              <div className="grid sm:grid-cols-2 gap-2">
                {MISSION_TYPES.map(({ value, label, emoji, desc }) => (
                  <button
                    key={value}
                    onClick={() => set("type", value)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-[12px] border text-left transition-all",
                      form.type === value
                        ? "bg-indigo-500/10 border-indigo-500/40"
                        : "bg-slate-800/40 border-white/8 hover:border-white/20"
                    )}
                  >
                    <span className="text-xl flex-shrink-0">{emoji}</span>
                    <div className="flex-1">
                      <p className={cn("text-xs font-semibold", form.type === value ? "text-indigo-300" : "text-slate-300")}>{label}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">{desc}</p>
                    </div>
                    {form.type === value && <CheckCircle size={14} className="flex-shrink-0 text-indigo-400 mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Creator */}
            <div className="space-y-3">
              <Input
                label="Handle du creator"
                placeholder="yassine_create"
                value={form.creatorHandle}
                onChange={(e) => set("creatorHandle", e.target.value.replace("@", ""))}
                error={errors.creatorHandle}
                leftIcon={<User size={14} />}
                hint="Sans le @"
              />
              {form.creatorHandle && (
                <div className="glass-sm rounded-[12px] p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {form.creatorHandle.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">@{form.creatorHandle}</p>
                    <p className="text-xs text-slate-600">Profil Mafluencer</p>
                  </div>
                  <Link href={`/creator/${form.creatorHandle}`} target="_blank">
                    <Button variant="ghost" size="sm">Voir le profil</Button>
                  </Link>
                </div>
              )}
              <p className="text-xs text-slate-600">
                Pas encore de creator en tête ?{" "}
                <Link href="/dashboard/brand/discover" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  Parcours le leaderboard →
                </Link>
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={handleNext}>
                Continuer <ArrowLeft size={14} className="rotate-180" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 1 — Brief + Do/Don't + Budget + Deadline ──────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-heading font-bold text-slate-100 mb-1">Brief, budget & délai</h2>
              <p className="text-slate-500 text-sm">Un brief détaillé réduit les allers-retours et améliore la qualité du rendu.</p>
            </div>

            {/* Title */}
            <Input
              label="Titre de la mission"
              placeholder="Ex: Review Samsung Galaxy A35 — Mets en avant les 3 fonctionnalités clés"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              error={errors.title}
            />

            {/* Brief */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <FileText size={13} className="text-slate-500" /> Description de la mission
                <span className="text-slate-600 font-normal ml-auto">({form.brief.length}/1000)</span>
              </label>
              <textarea
                value={form.brief}
                onChange={(e) => set("brief", e.target.value.slice(0, 1000))}
                rows={4}
                placeholder="Décris les objectifs, le message clé, le ton souhaité, les points à couvrir dans le contenu..."
                className={cn(
                  "w-full bg-slate-800/60 border rounded-[12px] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none",
                  errors.brief ? "border-red-500/50" : "border-white/8 focus:border-indigo-500/50"
                )}
              />
              {errors.brief && <p className="text-xs text-red-400">{errors.brief}</p>}
            </div>

            {/* Do / Don't */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* DOs */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium text-emerald-400">
                  <ThumbsUp size={13} /> À faire (Do's)
                </label>
                <div className="space-y-2">
                  {form.dos.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-emerald-500 text-xs font-bold flex-shrink-0">✓</span>
                      <input
                        value={item}
                        onChange={(e) => updateListItem("dos", i, e.target.value)}
                        placeholder={`Ex: Mentionner le code promo`}
                        className="flex-1 bg-slate-800/60 border border-white/8 rounded-[10px] px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/40 transition-all"
                      />
                      {form.dos.length > 1 && (
                        <button onClick={() => removeListItem("dos", i)} className="text-slate-600 hover:text-slate-400 flex-shrink-0">
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {form.dos.length < 6 && (
                  <button
                    onClick={() => addListItem("dos")}
                    className="flex items-center gap-1 text-xs text-slate-600 hover:text-emerald-400 transition-colors"
                  >
                    <Plus size={11} /> Ajouter
                  </button>
                )}
              </div>

              {/* DON'Ts */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium text-red-400">
                  <ThumbsDown size={13} /> À éviter (Don'ts)
                </label>
                <div className="space-y-2">
                  {form.donts.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-red-500 text-xs font-bold flex-shrink-0">✕</span>
                      <input
                        value={item}
                        onChange={(e) => updateListItem("donts", i, e.target.value)}
                        placeholder={`Ex: Ne pas mentionner la concurrence`}
                        className="flex-1 bg-slate-800/60 border border-white/8 rounded-[10px] px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-red-500/30 transition-all"
                      />
                      {form.donts.length > 1 && (
                        <button onClick={() => removeListItem("donts", i)} className="text-slate-600 hover:text-slate-400 flex-shrink-0">
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {form.donts.length < 6 && (
                  <button
                    onClick={() => addListItem("donts")}
                    className="flex items-center gap-1 text-xs text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <Plus size={11} /> Ajouter
                  </button>
                )}
              </div>
            </div>

            {/* Budget + Deadline row */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Budget */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <DollarSign size={13} className="text-slate-500" /> Budget (MAD)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.budget}
                    onChange={(e) => set("budget", e.target.value)}
                    placeholder="1500"
                    min="100"
                    className={cn(
                      "w-full bg-slate-800/60 border rounded-[12px] pl-4 pr-14 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all",
                      errors.budget ? "border-red-500/50" : "border-white/8 focus:border-indigo-500/50"
                    )}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">MAD</span>
                </div>
                {errors.budget
                  ? <p className="text-xs text-red-400">{errors.budget}</p>
                  : <p className="text-xs text-slate-600">Creator reçoit {form.budget && Number(form.budget) >= 100 ? formatMAD(Number(form.budget) * 0.9) : "90%"} (–10% commission)</p>
                }
              </div>

              {/* Deadline */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300 flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-500" /> Date limite
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => set("deadline", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className={cn(
                    "w-full bg-slate-800/60 border rounded-[12px] px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all",
                    errors.deadline ? "border-red-500/50" : "border-white/8 focus:border-indigo-500/50"
                  )}
                />
                {errors.deadline && <p className="text-xs text-red-400">{errors.deadline}</p>}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(0)}><ArrowLeft size={14} /> Retour</Button>
              <Button variant="primary" onClick={handleNext}>Review <ArrowLeft size={14} className="rotate-180" /></Button>
            </div>
          </div>
        )}

        {/* ── Step 2 — Review + Confirm ───────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-heading font-bold text-slate-100 mb-1">Vérification finale</h2>
              <p className="text-slate-500 text-sm">Relis le brief avant d'envoyer la proposition au creator.</p>
            </div>

            {/* Creator + Type */}
            <div className="glass-sm rounded-[12px] p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {form.creatorHandle.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-200">@{form.creatorHandle}</p>
                <p className="text-xs text-slate-600">{selectedType?.emoji} {selectedType?.label}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-emerald-400">{formatMAD(Number(form.budget))}</p>
                <p className="text-xs text-slate-600">{form.deadline}</p>
              </div>
            </div>

            {/* Mission details */}
            <div className="glass-sm rounded-[12px] p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-400">Mission</p>
              <p className="text-sm font-medium text-slate-200">{form.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-4">{form.brief}</p>
            </div>

            {/* Do / Don't review */}
            {(form.dos.some(d => d.trim()) || form.donts.some(d => d.trim())) && (
              <div className="grid sm:grid-cols-2 gap-3">
                {form.dos.some(d => d.trim()) && (
                  <div className="glass-sm rounded-[12px] p-4">
                    <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1"><ThumbsUp size={11} /> À faire</p>
                    <ul className="space-y-1">
                      {form.dos.filter(d => d.trim()).map((d, i) => (
                        <li key={i} className="text-xs text-slate-500 flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>{d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {form.donts.some(d => d.trim()) && (
                  <div className="glass-sm rounded-[12px] p-4">
                    <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1"><ThumbsDown size={11} /> À éviter</p>
                    <ul className="space-y-1">
                      {form.donts.filter(d => d.trim()).map((d, i) => (
                        <li key={i} className="text-xs text-slate-500 flex items-start gap-1.5">
                          <span className="text-red-500 font-bold flex-shrink-0">✕</span>{d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Financial summary */}
            <div className="glass-sm rounded-[12px] p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-400 mb-3">Récapitulatif financier</p>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Budget brut</span><span className="text-slate-300">{formatMAD(Number(form.budget))}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Commission Mafluencer (10%)</span><span className="text-slate-400">−{formatMAD(Number(form.budget) * 0.1)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold pt-1 border-t border-white/8">
                <span className="text-slate-300">Creator reçoit</span><span className="text-emerald-400">{formatMAD(Number(form.budget) * 0.9)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-amber-500/5 border border-amber-500/20 rounded-[10px]">
              <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500">
                En envoyant cette mission, <span className="text-amber-400 font-semibold">{formatMAD(Number(form.budget))}</span> seront réservés sur ton solde. Le montant est libéré uniquement après validation de la livraison.
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft size={14} /> Retour</Button>
              <Button variant="primary" loading={loading} onClick={handleSubmit}>
                <Briefcase size={14} /> Envoyer la mission
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
