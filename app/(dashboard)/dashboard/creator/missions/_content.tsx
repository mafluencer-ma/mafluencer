"use client";

import { useState } from "react";
import {
  Briefcase, Clock, CheckCircle, XCircle, Package,
  ChevronDown, ChevronUp, ExternalLink, AlertCircle,
  Calendar, DollarSign, Tag, Building2,
} from "lucide-react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/dashboard/empty-state";
import PageHeader from "@/components/dashboard/page-header";
import { cn, formatMAD } from "@/lib/utils";
import toast from "react-hot-toast";

type MissionStatus = "PENDING" | "ACCEPTED" | "DELIVERED" | "PAID" | "REFUSED";
type MissionType = "POST" | "STORY" | "VIDEO" | "UGC";

type Mission = {
  id: string;
  brand: string;
  brandLogo?: string;
  title: string;
  brief: string;
  budget: number;
  type: MissionType;
  deadline: string;
  status: MissionStatus;
  deliverableUrl?: string;
  requirements: string[];
  postedAt: string;
};

const MISSIONS: Mission[] = [
  {
    id: "m1",
    brand: "Jumia Maroc",
    title: "Review produit électronique",
    brief: "Crée une vidéo de review authentique d'un smartphone Samsung Galaxy A35. Mets en avant les 3 fonctionnalités principales et ton expérience personnelle. La vidéo doit faire entre 60 et 90 secondes.",
    budget: 1500,
    type: "VIDEO",
    deadline: "25 Avr 2025",
    status: "PENDING",
    requirements: ["Vidéo 60–90 sec", "Mentionner le modèle exact", "Lien dans la bio 48h", "Hashtag #JumiaMaroc"],
    postedAt: "15 Avr 2025",
  },
  {
    id: "m2",
    brand: "Inwi",
    title: "Post sponsorisé offre Ramadan",
    brief: "Présente l'offre internet Inwi spéciale Ramadan à tes abonnés. Le contenu doit être naturel et intégré à ton style habituel. Inclure le code promo INWI25.",
    budget: 800,
    type: "POST",
    deadline: "20 Avr 2025",
    status: "ACCEPTED",
    requirements: ["Photo ou Reel 30 sec max", "Code promo INWI25 visible", "Swipe up / lien story", "Tag @inwi_maroc"],
    postedAt: "12 Avr 2025",
  },
  {
    id: "m3",
    brand: "Marjane Market",
    title: "Story haul printemps",
    brief: "Partage ton expérience shopping de saison chez Marjane. Montre 3 à 5 articles coups de cœur avec leurs prix. Ton enthousiasme et l'authenticité sont clés.",
    budget: 600,
    type: "STORY",
    deadline: "18 Avr 2025",
    status: "DELIVERED",
    deliverableUrl: "https://www.instagram.com/stories/moncompte.ig/haul",
    requirements: ["3–5 stories minimum", "Prix des articles visibles", "Localisation Marjane", "Tag @marjane_officiel"],
    postedAt: "8 Avr 2025",
  },
  {
    id: "m4",
    brand: "Zara Beauty MA",
    title: "UGC tutoriel maquillage",
    brief: "Crée un tutoriel maquillage de 45 secondes utilisant exclusivement les produits Zara Beauty. Filmé en studio ou chez toi, style naturel. Les fichiers bruts seront livrés à la marque.",
    budget: 2000,
    type: "UGC",
    deadline: "10 Avr 2025",
    status: "PAID",
    deliverableUrl: "https://drive.google.com/file/ugc_zara",
    requirements: ["45 sec min", "Produits Zara Beauty uniquement", "Rendu fichier brut .mp4", "2 variations de format (16:9 et 9:16)"],
    postedAt: "1 Avr 2025",
  },
  {
    id: "m5",
    brand: "Carrefour MA",
    title: "Post food lifestyle",
    brief: "Présente ton expérience course alimentaire chez Carrefour. Focus sur la fraîcheur des produits et les promotions du mois. Style lifestyle naturel.",
    budget: 500,
    type: "POST",
    deadline: "5 Avr 2025",
    status: "REFUSED",
    requirements: ["Photo lifestyle en magasin", "Produits frais mis en avant", "Tag @carrefour_maroc"],
    postedAt: "28 Mar 2025",
  },
];

const STATUS_META: Record<MissionStatus, { label: string; variant: "default" | "warning" | "success" | "error" | "primary"; icon: typeof Clock }> = {
  PENDING:   { label: "En attente",  variant: "warning",  icon: Clock },
  ACCEPTED:  { label: "Acceptée",    variant: "primary",  icon: CheckCircle },
  DELIVERED: { label: "Livrée",      variant: "success",  icon: Package },
  PAID:      { label: "Payée",       variant: "success",  icon: CheckCircle },
  REFUSED:   { label: "Refusée",     variant: "error",    icon: XCircle },
};

const TYPE_META: Record<MissionType, { label: string; emoji: string }> = {
  POST:  { label: "Post photo/vidéo", emoji: "📸" },
  STORY: { label: "Story",            emoji: "⏱️" },
  VIDEO: { label: "Vidéo longue",     emoji: "🎬" },
  UGC:   { label: "UGC",              emoji: "🎥" },
};

const TABS = ["Toutes", "En attente", "Actives", "Terminées"] as const;
type Tab = typeof TABS[number];

export default function MissionsContent() {
  const [tab, setTab] = useState<Tab>("Toutes");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [deliverModal, setDeliverModal] = useState<string | null>(null);
  const [deliverUrl, setDeliverUrl] = useState("");

  const filtered = MISSIONS.filter((m) => {
    if (tab === "En attente") return m.status === "PENDING";
    if (tab === "Actives")    return m.status === "ACCEPTED";
    if (tab === "Terminées")  return ["DELIVERED", "PAID", "REFUSED"].includes(m.status);
    return true;
  });

  const pendingCount = MISSIONS.filter((m) => m.status === "PENDING").length;

  async function handleAccept(id: string) {
    setLoading((l) => ({ ...l, [id]: true }));
    await new Promise((r) => setTimeout(r, 1000));
    setLoading((l) => ({ ...l, [id]: false }));
    toast.success("Mission acceptée ! Le brief complet t'a été envoyé par email.");
  }

  async function handleRefuse(id: string) {
    setLoading((l) => ({ ...l, [`${id}_refuse`]: true }));
    await new Promise((r) => setTimeout(r, 800));
    setLoading((l) => ({ ...l, [`${id}_refuse`]: false }));
    toast("Mission refusée.", { icon: "👋" });
  }

  async function handleDeliver(id: string) {
    if (!deliverUrl.trim()) { toast.error("Colle le lien de ton contenu"); return; }
    setLoading((l) => ({ ...l, [`${id}_deliver`]: true }));
    await new Promise((r) => setTimeout(r, 1200));
    setLoading((l) => ({ ...l, [`${id}_deliver`]: false }));
    setDeliverModal(null);
    setDeliverUrl("");
    toast.success("Livraison envoyée ! La marque va vérifier ton contenu.");
  }

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Missions"
        subtitle="Collaborations sponsorisées proposées par les marques"
        icon={Briefcase}
      />

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "En attente",  value: MISSIONS.filter(m => m.status === "PENDING").length,   color: "text-amber-400" },
          { label: "Actives",     value: MISSIONS.filter(m => m.status === "ACCEPTED").length,  color: "text-indigo-400" },
          { label: "Livrées",     value: MISSIONS.filter(m => m.status === "DELIVERED").length, color: "text-emerald-400" },
          { label: "Payées",      value: MISSIONS.filter(m => m.status === "PAID").length,      color: "text-cyan-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-[14px] p-4 text-center">
            <p className={cn("text-2xl font-heading font-bold", color)}>{value}</p>
            <p className="text-xs text-slate-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs + list */}
      <div className="glass rounded-[20px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <p className="text-sm font-semibold text-slate-300">
            Missions{pendingCount > 0 && <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">{pendingCount}</span>}
          </p>
          <div className="flex gap-1 p-0.5 bg-slate-800/60 rounded-[10px]">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all",
                  tab === t ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              emoji="📭"
              title="Aucune mission ici"
              description="Les propositions des marques apparaîtront ici"
            />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((m) => {
              const statusMeta = STATUS_META[m.status];
              const typeMeta = TYPE_META[m.type];
              const StatusIcon = statusMeta.icon;
              const isOpen = expanded === m.id;
              const isDone = ["DELIVERED", "PAID", "REFUSED"].includes(m.status);

              return (
                <div key={m.id} className={cn("transition-colors", isOpen ? "bg-white/3" : "hover:bg-white/2")}>
                  {/* Mission header row */}
                  <button
                    className="w-full flex items-center gap-4 px-6 py-4 text-left"
                    onClick={() => setExpanded(isOpen ? null : m.id)}
                  >
                    {/* Brand avatar */}
                    <div className="w-10 h-10 rounded-[10px] bg-slate-700/60 flex items-center justify-center flex-shrink-0 text-lg">
                      <Building2 size={18} className="text-slate-400" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-200">{m.brand}</span>
                        <span className="text-slate-700">·</span>
                        <span className="text-xs text-slate-500">{typeMeta.emoji} {typeMeta.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{m.title}</p>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-bold text-emerald-400 tabular-nums hidden sm:block">
                        {formatMAD(m.budget)}
                      </span>
                      <Badge variant={statusMeta.variant}>
                        <StatusIcon size={10} />
                        {statusMeta.label}
                      </Badge>
                      {isOpen ? <ChevronUp size={14} className="text-slate-600" /> : <ChevronDown size={14} className="text-slate-600" />}
                    </div>
                  </button>

                  {/* Expanded brief */}
                  {isOpen && (
                    <div className="px-6 pb-6 space-y-5">
                      <div className="grid sm:grid-cols-3 gap-3 text-xs">
                        <div className="glass-sm rounded-[10px] p-3 flex items-center gap-2">
                          <DollarSign size={13} className="text-emerald-400" />
                          <div>
                            <p className="text-slate-600">Budget</p>
                            <p className="text-slate-200 font-semibold">{formatMAD(m.budget)}</p>
                          </div>
                        </div>
                        <div className="glass-sm rounded-[10px] p-3 flex items-center gap-2">
                          <Calendar size={13} className="text-indigo-400" />
                          <div>
                            <p className="text-slate-600">Date limite</p>
                            <p className="text-slate-200 font-semibold">{m.deadline}</p>
                          </div>
                        </div>
                        <div className="glass-sm rounded-[10px] p-3 flex items-center gap-2">
                          <Tag size={13} className="text-pink-400" />
                          <div>
                            <p className="text-slate-600">Type</p>
                            <p className="text-slate-200 font-semibold">{typeMeta.emoji} {typeMeta.label}</p>
                          </div>
                        </div>
                      </div>

                      {/* Brief */}
                      <div className="glass-sm rounded-[12px] p-4">
                        <p className="text-xs font-semibold text-slate-400 mb-2">Brief</p>
                        <p className="text-sm text-slate-400 leading-relaxed">{m.brief}</p>
                      </div>

                      {/* Requirements */}
                      <div className="glass-sm rounded-[12px] p-4">
                        <p className="text-xs font-semibold text-slate-400 mb-3">Livrables attendus</p>
                        <ul className="space-y-1.5">
                          {m.requirements.map((r, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-slate-500">
                              <CheckCircle size={11} className="text-indigo-400 flex-shrink-0" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Delivered link */}
                      {m.deliverableUrl && (
                        <div className="glass-sm rounded-[12px] p-4 flex items-center gap-3">
                          <ExternalLink size={14} className="text-emerald-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-600">Contenu livré</p>
                            <a
                              href={m.deliverableUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-400 hover:text-indigo-300 truncate block"
                            >
                              {m.deliverableUrl}
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {!isDone && (
                        <div className="flex gap-3 pt-1">
                          {m.status === "PENDING" && (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="flex-1"
                                loading={loading[`${m.id}_refuse`]}
                                onClick={() => handleRefuse(m.id)}
                              >
                                <XCircle size={14} /> Refuser
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                className="flex-1"
                                loading={loading[m.id]}
                                onClick={() => handleAccept(m.id)}
                              >
                                <CheckCircle size={14} /> Accepter la mission
                              </Button>
                            </>
                          )}
                          {m.status === "ACCEPTED" && (
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full sm:w-auto"
                              onClick={() => { setDeliverModal(m.id); setDeliverUrl(""); }}
                            >
                              <Package size={14} /> Livrer le contenu
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deliver modal */}
      {deliverModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeliverModal(null)} />
          <div className="relative glass rounded-[24px] p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-heading font-bold text-slate-100 mb-1">Livrer le contenu</h3>
            <p className="text-slate-500 text-sm mb-6">
              Colle le lien public de ton contenu publié (TikTok, Instagram ou YouTube).
            </p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Lien du contenu</label>
                <div className="relative">
                  <input
                    type="url"
                    value={deliverUrl}
                    onChange={(e) => setDeliverUrl(e.target.value)}
                    placeholder="https://www.tiktok.com/@moncompte/video/..."
                    className="w-full bg-slate-800/60 border border-white/8 rounded-[12px] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>
              <div className="glass-sm rounded-[12px] p-3 flex items-start gap-2.5">
                <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500">
                  Assure-toi que le contenu est public et conforme aux livrables du brief avant de soumettre.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setDeliverModal(null)}>
                Annuler
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                loading={loading[`${deliverModal}_deliver`]}
                onClick={() => handleDeliver(deliverModal)}
              >
                <Package size={14} /> Envoyer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
