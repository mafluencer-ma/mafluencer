"use client";

import { useState } from "react";
import { User, MapPin, Tag, Link2, DollarSign, Camera, CheckCircle, Plus, X } from "lucide-react";
import type { Session } from "next-auth";
import Input from "@/components/ui/input";
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
    bio: "Creator de contenu lifestyle & humour 🎬 | Passionné par la culture marocaine",
    city: "Casablanca",
    tiktokHandle: "moncompte_tiktok",
    instagramHandle: "moncompte.ig",
    niches: ["Humour", "Lifestyle"],
    pricePerPost: "800",
    pricePerStory: "400",
    pricePerVideo: "2000",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [nicheInput, setNicheInput] = useState("");

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
    if (!form.bio.trim()) { toast.error("La bio ne peut pas être vide"); return; }
    if (form.niches.length === 0) { toast.error("Sélectionne au moins une niche"); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    toast.success("Profil mis à jour !");
    setTimeout(() => setSaved(false), 3000);
  }

  const SECTIONS = [
    {
      id: "identity",
      title: "Identité",
      icon: User,
      content: (
        <div className="space-y-4">
          {/* Avatar */}
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
              <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-1">
                Changer la photo
              </button>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">Bio <span className="text-slate-600">({form.bio.length}/200)</span></label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value.slice(0, 200) }))}
              rows={3}
              placeholder="Décris-toi en quelques mots..."
              className="w-full bg-slate-800/60 border border-white/8 rounded-[12px] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
            />
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <MapPin size={13} className="text-slate-500" /> Ville
            </label>
            <div className="flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm((f) => ({ ...f, city: c }))}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    form.city === c
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "bg-slate-800/60 text-slate-500 border border-white/8 hover:text-slate-300"
                  )}
                >
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
            <p className="text-sm font-medium text-slate-300 mb-1">
              Tes niches <span className="text-slate-600">({form.niches.length}/5 max)</span>
            </p>
            <p className="text-xs text-slate-600 mb-3">Les niches aident les brands à te trouver</p>
            <div className="flex flex-wrap gap-2">
              {ALL_NICHES.map((n) => {
                const selected = form.niches.includes(n);
                const maxed = !selected && form.niches.length >= 5;
                return (
                  <button
                    key={n}
                    onClick={() => toggle(n)}
                    disabled={maxed}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      selected
                        ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                        : maxed
                          ? "bg-slate-800/40 text-slate-700 border border-white/5 cursor-not-allowed"
                          : "bg-slate-800/60 text-slate-500 border border-white/8 hover:text-slate-300"
                    )}
                  >
                    {n} {selected && "✓"}
                  </button>
                );
              })}
            </div>
          </div>

          {form.niches.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/8">
              <span className="text-xs text-slate-600 mr-1">Sélectionnées :</span>
              {form.niches.map((n) => (
                <button
                  key={n}
                  onClick={() => toggle(n)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all"
                >
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
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <span className="text-base">🎵</span> TikTok
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">@</span>
              <input
                value={form.tiktokHandle}
                onChange={(e) => setForm((f) => ({ ...f, tiktokHandle: e.target.value.replace("@", "") }))}
                placeholder="toncompte"
                className="w-full bg-slate-800/60 border border-white/8 rounded-[12px] pl-8 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <span className="text-base">📸</span> Instagram
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">@</span>
              <input
                value={form.instagramHandle}
                onChange={(e) => setForm((f) => ({ ...f, instagramHandle: e.target.value.replace("@", "") }))}
                placeholder="toncompte"
                className="w-full bg-slate-800/60 border border-white/8 rounded-[12px] pl-8 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "pricing",
      title: "Tarifs missions",
      icon: DollarSign,
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Ces tarifs sont affichés sur ton profil public et servent de référence pour les brands. Tu peux toujours négocier case par case.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { key: "pricePerPost" as const, label: "Post photo/vidéo courte", emoji: "📸" },
              { key: "pricePerStory" as const, label: "Story / Reel", emoji: "⏱️" },
              { key: "pricePerVideo" as const, label: "Vidéo longue / UGC", emoji: "🎬" },
            ].map(({ key, label, emoji }) => (
              <div key={key} className="space-y-1.5">
                <label className="block text-xs text-slate-500 flex items-center gap-1">
                  <span>{emoji}</span> {label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder="0"
                    min="0"
                    className="w-full bg-slate-800/60 border border-white/8 rounded-[12px] pl-4 pr-12 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">MAD</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 bg-slate-800/40 rounded-[10px] p-3">
            💡 Les creators avec des tarifs clairs reçoivent 3x plus de demandes de missions
          </p>
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
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
          >
            {saved ? <><CheckCircle size={15} /> Sauvegardé</> : "Sauvegarder"}
          </Button>
        }
      />

      {/* Profile completion bar */}
      <div className="glass rounded-[16px] p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-300">Complétion du profil</span>
          <span className="text-sm font-bold text-indigo-400">72%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full" style={{ width: "72%" }} />
        </div>
        <p className="text-xs text-slate-600 mt-2">Ajoute des vidéos à ton portfolio pour atteindre 100%</p>
      </div>

      {/* Sections */}
      {SECTIONS.map(({ id, title, icon: Icon, content }) => (
        <div key={id} className="glass rounded-[20px] overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-white/8 bg-slate-800/20">
            <div className="w-8 h-8 rounded-[8px] bg-indigo-500/10 flex items-center justify-center">
              <Icon size={15} className="text-indigo-400" />
            </div>
            <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
          </div>
          <div className="p-6">{content}</div>
        </div>
      ))}

      {/* Save CTA */}
      <div className="flex justify-end gap-3 pb-4">
        <Button variant="secondary">Aperçu du profil public</Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          loading={saving}
        >
          {saved ? <><CheckCircle size={15} /> Modifications sauvegardées</> : "Sauvegarder les modifications"}
        </Button>
      </div>
    </div>
  );
}
