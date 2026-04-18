"use client";

import { useState, useEffect } from "react";
import { User, MapPin, Tag, Link2, DollarSign, Camera, CheckCircle, X } from "lucide-react";
import type { Session } from "next-auth";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import PageHeader from "@/components/dashboard/page-header";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const CITIES = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir", "Meknès", "Oujda", "Autre"];
const ALL_NICHES = ["Food", "Beauté", "Humour", "Lifestyle", "Tech", "Sport", "Voyage", "Mode", "Musique", "Gaming", "Business", "Education"];

type FormData = {
  bio: string; city: string; tiktokHandle: string; instagramHandle: string;
  niches: string[]; pricePerPost: string; pricePerStory: string; pricePerVideo: string;
};

export default function ProfileFormContent({ session }: { session: Session }) {
  const [form, setForm] = useState<FormData>({
    bio: "", city: "", tiktokHandle: "", instagramHandle: "",
    niches: [], pricePerPost: "", pricePerStory: "", pricePerVideo: "",
  });
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  // Load current profile
  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch("/api/me");
        const data = res.ok ? await res.json() : null;
        const p    = data?.creatorProfile;
        if (p) {
          setForm({
            bio:             p.bio              ?? "",
            city:            p.city             ?? "",
            tiktokHandle:    p.tiktokHandle     ?? "",
            instagramHandle: p.instagramHandle  ?? "",
            niches:          p.niches           ?? [],
            pricePerPost:    p.pricePerPost     != null ? String(p.pricePerPost)  : "",
            pricePerStory:   p.pricePerStory    != null ? String(p.pricePerStory) : "",
            pricePerVideo:   p.pricePerVideo    != null ? String(p.pricePerVideo) : "",
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setProfileLoaded(true);
      }
    }
    load();
  }, []);

  function toggle(niche: string) {
    setForm((f) => ({
      ...f,
      niches: f.niches.includes(niche)
        ? f.niches.filter((n) => n !== niche)
        : f.niches.length < 5
          ? [...f.niches, niche]
          : f.niches,
    }));
  }

  async function handleSave() {
    if (!form.bio.trim())          { toast.error("La bio ne peut pas être vide"); return; }
    if (form.niches.length === 0)  { toast.error("Sélectionne au moins une niche"); return; }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        bio:             form.bio,
        city:            form.city,
        niches:          form.niches,
        tiktokHandle:    form.tiktokHandle  || undefined,
        instagramHandle: form.instagramHandle || undefined,
      };
      if (form.pricePerPost  && Number(form.pricePerPost)  > 0) body.pricePerPost  = Number(form.pricePerPost);
      if (form.pricePerStory && Number(form.pricePerStory) > 0) body.pricePerStory = Number(form.pricePerStory);
      if (form.pricePerVideo && Number(form.pricePerVideo) > 0) body.pricePerVideo = Number(form.pricePerVideo);

      const res = await fetch("/api/me/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erreur"); return; }
      setSaved(true);
      toast.success("Profil mis à jour !");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  // Completion score (simple)
  const completionFields = [form.bio, form.city, form.niches.length > 0, form.tiktokHandle || form.instagramHandle, form.pricePerPost];
  const completionPct = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  const SECTIONS = [
    {
      id: "identity",
      title: "Identité",
      icon: User,
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar name={session.user?.name} src={session.user?.image} size="xl" />
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg hover:bg-indigo-600 transition-colors">
                <Camera size={12} className="text-white" />
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">{session.user?.name}</p>
              <p className="text-xs text-slate-600">{session.user?.email}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Bio <span className="text-slate-600">({form.bio.length}/200)</span></label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value.slice(0, 200) }))}
              rows={3}
              placeholder="Décris-toi en quelques mots..."
              className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[12px] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <MapPin size={13} className="text-slate-500" /> Ville
            </label>
            <div className="flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <button key={c} onClick={() => setForm((f) => ({ ...f, city: c }))}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    form.city === c
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "bg-slate-800/60 text-slate-500 border border-white/[0.08] hover:text-slate-300"
                  )}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "niches",
      title: "Niches & contenu",
      icon: Tag,
      content: (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-300 mb-1">Tes niches <span className="text-slate-600">({form.niches.length}/5 max)</span></p>
            <p className="text-xs text-slate-600 mb-3">Les niches aident les brands à te trouver</p>
            <div className="flex flex-wrap gap-2">
              {ALL_NICHES.map((n) => {
                const selected = form.niches.includes(n);
                const maxed    = !selected && form.niches.length >= 5;
                return (
                  <button key={n} onClick={() => toggle(n)} disabled={maxed}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      selected ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                        : maxed ? "bg-slate-800/40 text-slate-700 border border-white/5 cursor-not-allowed"
                        : "bg-slate-800/60 text-slate-500 border border-white/[0.08] hover:text-slate-300"
                    )}>
                    {n} {selected && "✓"}
                  </button>
                );
              })}
            </div>
          </div>
          {form.niches.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.08]">
              <span className="text-xs text-slate-600 mr-1">Sélectionnées :</span>
              {form.niches.map((n) => (
                <button key={n} onClick={() => toggle(n)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all">
                  {n} <X size={10} />
                </button>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "socials",
      title: "Réseaux sociaux",
      icon: Link2,
      content: (
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { key: "tiktokHandle" as const, label: "TikTok", emoji: "🎵" },
            { key: "instagramHandle" as const, label: "Instagram", emoji: "📸" },
          ].map(({ key, label, emoji }) => (
            <div key={key} className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300 flex items-center gap-1.5">
                <span className="text-base">{emoji}</span> {label}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">@</span>
                <input
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value.replace("@", "") }))}
                  placeholder="toncompte"
                  className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[12px] pl-8 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "pricing",
      title: "Tarifs missions",
      icon: DollarSign,
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-600">Ces tarifs sont affichés sur ton profil public. Tu peux toujours négocier case par case.</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { key: "pricePerPost"  as const, label: "Post photo/vidéo courte", emoji: "📸" },
              { key: "pricePerStory" as const, label: "Story / Reel",            emoji: "⏱️" },
              { key: "pricePerVideo" as const, label: "Vidéo longue / UGC",      emoji: "🎬" },
            ].map(({ key, label, emoji }) => (
              <div key={key} className="space-y-1.5">
                <label className="block text-xs text-slate-500 flex items-center gap-1">
                  <span>{emoji}</span> {label}
                </label>
                <div className="relative">
                  <input
                    type="number" value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder="0" min="0"
                    className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[12px] pl-4 pr-12 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">MAD</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Mon profil"
        subtitle="Complète ton profil pour attirer plus de missions"
        icon={User}
        action={
          <Button variant="primary" onClick={handleSave} loading={saving}>
            {saved ? <><CheckCircle size={15} /> Sauvegardé</> : "Sauvegarder"}
          </Button>
        }
      />

      {/* Profile completion bar */}
      <div className="glass rounded-[16px] p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-300">Complétion du profil</span>
          <span className="text-sm font-bold text-indigo-400">{completionPct}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
        </div>
        {completionPct < 100 && (
          <p className="text-xs text-slate-600 mt-2">Complète tous les champs pour atteindre 100%</p>
        )}
      </div>

      {/* Sections */}
      {!profileLoaded ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass rounded-[20px] p-6 animate-pulse">
            <div className="h-4 bg-slate-700/60 rounded w-32 mb-4" />
            <div className="h-16 bg-slate-700/40 rounded" />
          </div>
        ))
      ) : (
        SECTIONS.map(({ id, title, icon: Icon, content }) => (
          <div key={id} className="glass rounded-[20px] overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-white/[0.08] bg-slate-800/20">
              <div className="w-8 h-8 rounded-[8px] bg-indigo-500/10 flex items-center justify-center">
                <Icon size={15} className="text-indigo-400" />
              </div>
              <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
            </div>
            <div className="p-6">{content}</div>
          </div>
        ))
      )}

      <div className="flex justify-end gap-3 pb-4">
        <Button variant="primary" size="lg" onClick={handleSave} loading={saving}>
          {saved ? <><CheckCircle size={15} /> Modifications sauvegardées</> : "Sauvegarder les modifications"}
        </Button>
      </div>
    </div>
  );
}
