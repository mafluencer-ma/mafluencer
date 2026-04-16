"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ListChecks, PlusCircle, ChevronDown, ChevronUp,
  CheckCircle, Clock, Package, XCircle, ExternalLink,
  DollarSign, Calendar, Tag, AlertCircle, Eye,
} from "lucide-react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/dashboard/empty-state";
import PageHeader from "@/components/dashboard/page-header";
import { cn, formatMAD } from "@/lib/utils";
import toast from "react-hot-toast";

type MissionStatus = "PENDING" | "ACCEPTED" | "DELIVERED" | "PAID" | "REFUSED";
type MissionType = "POST" | "STORY" | "VIDEO" | "UGC";

type BrandMission = {
  id: string;
  creator: string;
  creatorAvatar: string;
  niche: string;
  title: string;
  brief: string;
  budget: number;
  type: MissionType;
  deadline: string;
  status: MissionStatus;
  deliverableUrl?: string;
  postedAt: string;
};

const MISSIONS: BrandMission[] = [
  { id: "b1", creator: "yassine_create", creatorAvatar: "YC", niche: "Humour", title: "Review Samsung Galaxy A35", brief: "Crée une vidéo de review authentique de 60–90 sec avec les 3 fonctionnalités clés.", budget: 1500, type: "VIDEO", deadline: "25 Avr 2025", status: "ACCEPTED", postedAt: "15 Avr 2025" },
  { id: "b2", creator: "sarabeauty",     creatorAvatar: "SB", niche: "Beauté", title: "Post sponsorisé offre Ramadan", brief: "Présente l'offre internet Inwi spéciale Ramadan, code promo INWI25.", budget: 800, type: "POST", deadline: "20 Avr 2025", status: "DELIVERED", deliverableUrl: "https://www.instagram.com/p/demo", postedAt: "12 Avr 2025" },
  { id: "b3", creator: "techmaroc",      creatorAvatar: "TM", niche: "Tech", title: "UGC tutoriel application", brief: "Tutoriel de 45 sec sur l'application mobile Marjane en conditions réelles.", budget: 2000, type: "UGC", deadline: "30 Avr 2025", status: "PENDING", postedAt: "14 Avr 2025" },
  { id: "b4", creator: "fatima_food",    creatorAvatar: "FF", niche: "Food", title: "Story haul printemps", brief: "3 à 5 stories montrant des articles coups de cœur du rayon printemps.", budget: 600, type: "STORY", deadline: "18 Avr 2025", status: "PAID", deliverableUrl: "https://www.instagram.com/stories/demo", postedAt: "8 Avr 2025" },
  { id: "b5", creator: "lifestyle_hind", creatorAvatar: "LH", niche: "Lifestyle", title: "Reel lifestyle été", brief: "Reel 30 sec présentant la nouvelle collection été avec ton style.", budget: 700, type: "POST", deadline: "5 Avr 2025", status: "REFUSED", postedAt: "28 Mar 2025" },
];

const STATUS_META: Record<MissionStatus, { label: string; variant: "warning" | "primary" | "success" | "error" | "default"; icon: typeof Clock }> = {
  PENDING:   { label: "En attente", variant: "warning", icon: Clock },
  ACCEPTED:  { label: "Acceptée",   variant: "primary", icon: CheckCircle },
  DELIVERED: { label: "Livrée",     variant: "success", icon: Package },
  PAID:      { label: "Payée",      variant: "success", icon: CheckCircle },
  REFUSED:   { label: "Refusée",    variant: "error",   icon: XCircle },
};

const TYPE_META: Record<MissionType, { label: string; emoji: string }> = {
  POST:  { label: "Post photo/vidéo", emoji: "📸" },
  STORY: { label: "Story",            emoji: "⏱️" },
  VIDEO: { label: "Vidéo longue",     emoji: "🎬" },
  UGC:   { label: "UGC",              emoji: "🎥" },
};

const TABS = ["Toutes", "En attente", "Actives", "À valider", "Terminées"] as const;
type Tab = typeof TABS[number];

export default function BrandMissionsContent() {
  const [tab, setTab] = useState<Tab>("Toutes");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const filtered = MISSIONS.filter((m) => {
    if (tab === "En attente") return m.status === "PENDING";
    if (tab === "Actives")    return m.status === "ACCEPTED";
    if (tab === "À valider")  return m.status === "DELIVERED";
    if (tab === "Terminées")  return ["PAID", "REFUSED"].includes(m.status);
    return true;
  });

  const toValidateCount = MISSIONS.filter((m) => m.status === "DELIVERED").length;

  async function handleValidate(id: string) {
    setLoading((l) => ({ ...l, [id]: true }));
    await new Promise((r) => setTimeout(r, 1200));
    setLoading((l) => ({ ...l, [id]: false }));
    toast.success("Livraison validée ! Le paiement a été libéré au creator.");
  }

  async function handleReject(id: string) {
    setLoading((l) => ({ ...l, [`${id}_reject`]: true }));
    await new Promise((r) => setTimeout(r, 800));
    setLoading((l) => ({ ...l, [`${id}_reject`]: false }));
    toast("Livraison refusée. Le creator sera notifié.", { icon: "↩️" });
  }

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Mes missions"
        subtitle="Suis et gère toutes tes collaborations avec les creators"
        icon={ListChecks}
        action={
          <Link href="/dashboard/brand/missions/new">
            <Button variant="primary">
              <PlusCircle size={15} /> Nouvelle mission
            </Button>
          </Link>
        }
      />

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total",       value: MISSIONS.length,                                  color: "text-slate-300" },
          { label: "En attente", value: MISSIONS.filter(m => m.status === "PENDING").length,   color: "text-amber-400" },
          { label: "Actives",    value: MISSIONS.filter(m => m.status === "ACCEPTED").length,  color: "text-indigo-400" },
          { label: "À valider",  value: MISSIONS.filter(m => m.status === "DELIVERED").length, color: "text-emerald-400" },
          { label: "Payées",     value: MISSIONS.filter(m => m.status === "PAID").length,      color: "text-cyan-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-[14px] p-4 text-center">
            <p className={cn("text-2xl font-heading font-bold", color)}>{value}</p>
            <p className="text-xs text-slate-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Alert for deliveries to validate */}
      {toValidateCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/8 border border-emerald-500/20 rounded-[14px]">
          <Package size={16} className="text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-slate-300 flex-1">
            <span className="font-semibold text-emerald-400">{toValidateCount} livraison{toValidateCount > 1 ? "s" : ""}</span> en attente de validation — libère le paiement une fois le contenu vérifié.
          </p>
          <button onClick={() => setTab("À valider")} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium whitespace-nowrap">
            Voir →
          </button>
        </div>
      )}

      {/* Tabs + list */}
      <div className="glass rounded-[20px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <p className="text-sm font-semibold text-slate-300">Missions</p>
          <div className="flex gap-1 p-0.5 bg-slate-800/60 rounded-[10px] overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all whitespace-nowrap",
                  tab === t ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {t}{t === "À valider" && toValidateCount > 0 && <span className="ml-1 px-1 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">{toValidateCount}</span>}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              emoji="📭"
              title="Aucune mission ici"
              description="Crée ta première mission pour collaborer avec un creator"
              action={{ label: "Créer une mission", href: "/dashboard/brand/missions/new" }}
            />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((m) => {
              const statusMeta = STATUS_META[m.status];
              const typeMeta = TYPE_META[m.type];
              const StatusIcon = statusMeta.icon;
              const isOpen = expanded === m.id;
              const canValidate = m.status === "DELIVERED";

              return (
                <div key={m.id} className={cn("transition-colors", isOpen ? "bg-white/3" : "hover:bg-white/2")}>
                  <button
                    className="w-full flex items-center gap-4 px-6 py-4 text-left"
                    onClick={() => setExpanded(isOpen ? null : m.id)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-pink-500/30 flex items-center justify-center text-xs font-bold text-slate-200 flex-shrink-0">
                      {m.creatorAvatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-200">@{m.creator}</span>
                        <span className="text-slate-700">·</span>
                        <span className="text-xs text-slate-500">{typeMeta.emoji} {typeMeta.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{m.title}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-bold text-emerald-400 tabular-nums hidden sm:block">{formatMAD(m.budget)}</span>
                      <Badge variant={statusMeta.variant}>
                        <StatusIcon size={10} />
                        {statusMeta.label}
                      </Badge>
                      {isOpen ? <ChevronUp size={14} className="text-slate-600" /> : <ChevronDown size={14} className="text-slate-600" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 space-y-4">
                      <div className="grid sm:grid-cols-3 gap-3 text-xs">
                        <div className="glass-sm rounded-[10px] p-3 flex items-center gap-2">
                          <DollarSign size={13} className="text-emerald-400" />
                          <div><p className="text-slate-600">Budget</p><p className="text-slate-200 font-semibold">{formatMAD(m.budget)}</p></div>
                        </div>
                        <div className="glass-sm rounded-[10px] p-3 flex items-center gap-2">
                          <Calendar size={13} className="text-indigo-400" />
                          <div><p className="text-slate-600">Date limite</p><p className="text-slate-200 font-semibold">{m.deadline}</p></div>
                        </div>
                        <div className="glass-sm rounded-[10px] p-3 flex items-center gap-2">
                          <Tag size={13} className="text-pink-400" />
                          <div><p className="text-slate-600">Niche</p><p className="text-slate-200 font-semibold">{m.niche}</p></div>
                        </div>
                      </div>

                      <div className="glass-sm rounded-[12px] p-4">
                        <p className="text-xs font-semibold text-slate-400 mb-2">Brief</p>
                        <p className="text-sm text-slate-400 leading-relaxed">{m.brief}</p>
                      </div>

                      {m.deliverableUrl && (
                        <div className="glass-sm rounded-[12px] p-4 flex items-center gap-3">
                          <ExternalLink size={14} className="text-emerald-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-600">Contenu livré</p>
                            <a href={m.deliverableUrl} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-indigo-400 hover:text-indigo-300 truncate block">{m.deliverableUrl}</a>
                          </div>
                          <a href={m.deliverableUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm"><Eye size={13} /> Voir</Button>
                          </a>
                        </div>
                      )}

                      {/* Validation actions */}
                      {canValidate && (
                        <div className="space-y-3">
                          <div className="flex items-start gap-2.5 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-[10px]">
                            <AlertCircle size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-500">
                              Vérifie que le contenu est conforme au brief avant de valider. Le paiement de <span className="text-emerald-400 font-semibold">{formatMAD(m.budget * 0.9)}</span> sera libéré immédiatement.
                            </p>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="flex-1"
                              loading={loading[`${m.id}_reject`]}
                              onClick={() => handleReject(m.id)}
                            >
                              <XCircle size={14} /> Refuser la livraison
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              className="flex-1"
                              loading={loading[m.id]}
                              onClick={() => handleValidate(m.id)}
                            >
                              <CheckCircle size={14} /> Valider et payer
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Profile link */}
                      <div className="flex justify-end">
                        <Link href={`/creator/${m.creator}`} target="_blank">
                          <Button variant="ghost" size="sm">
                            <ExternalLink size={12} /> Voir le profil du creator
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
