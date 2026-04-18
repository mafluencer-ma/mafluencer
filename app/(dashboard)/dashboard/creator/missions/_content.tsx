"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Briefcase, Clock, CheckCircle, XCircle, Package,
  ChevronDown, ChevronUp, ExternalLink, AlertCircle,
  Calendar, DollarSign, Tag, Building2, RefreshCw,
} from "lucide-react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/dashboard/empty-state";
import PageHeader from "@/components/dashboard/page-header";
import { cn, formatMAD } from "@/lib/utils";
import toast from "react-hot-toast";

type MissionStatus = "PENDING" | "ACCEPTED" | "DELIVERED" | "PAID" | "REFUSED";
type MissionType   = "POST" | "STORY" | "VIDEO" | "UGC";

type Mission = {
  id:          string;
  brand:       string;
  title:       string;
  brief:       string;
  budget:      number;
  type:        MissionType;
  deadline:    string;
  status:      MissionStatus;
  deliverableUrl?: string | null;
  postedAt:    string;
};

const STATUS_META: Record<MissionStatus, { label: string; variant: "default" | "warning" | "success" | "error" | "primary"; icon: typeof Clock }> = {
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

const TABS = ["Toutes", "En attente", "Actives", "Terminées"] as const;
type Tab = typeof TABS[number];

export default function MissionsContent() {
  const [tab,          setTab]          = useState<Tab>("Toutes");
  const [missions,     setMissions]     = useState<Mission[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [expanded,     setExpanded]     = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [deliverModal, setDeliverModal] = useState<string | null>(null);
  const [deliverUrl,   setDeliverUrl]   = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/missions?limit=50");
      const data = res.ok ? await res.json() : null;
      const raw: Array<{
        id: string; title: string; brief: string; budget: number; type: string;
        status: string; contentUrl: string | null; deliveryDate: string | null;
        createdAt: string; brand: { name: string } | null;
      }> = data?.missions ?? [];

      setMissions(raw.map((m) => ({
        id:             m.id,
        brand:          m.brand?.name ?? "Marque",
        title:          m.title,
        brief:          m.brief,
        budget:         m.budget,
        type:           m.type as MissionType,
        deadline:       m.deliveryDate
          ? new Date(m.deliveryDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "2-digit" })
          : "—",
        status:         m.status as MissionStatus,
        deliverableUrl: m.contentUrl,
        postedAt:       new Date(m.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "2-digit" }),
      })));
    } catch (e) {
      console.error(e);
      toast.error("Impossible de charger les missions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = missions.filter((m) => {
    if (tab === "En attente") return m.status === "PENDING";
    if (tab === "Actives")    return m.status === "ACCEPTED";
    if (tab === "Terminées")  return ["DELIVERED", "PAID", "REFUSED"].includes(m.status);
    return true;
  });

  const pendingCount = missions.filter((m) => m.status === "PENDING").length;

  async function handleAccept(id: string) {
    setActionLoading((l) => ({ ...l, [id]: true }));
    try {
      const res = await fetch(`/api/missions/${id}/accept`, { method: "POST" });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? "Erreur");
        return;
      }
      setMissions((ms) => ms.map((m) => m.id === id ? { ...m, status: "ACCEPTED" } : m));
      toast.success("Mission acceptée ! Le brief complet t'a été envoyé.");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setActionLoading((l) => ({ ...l, [id]: false }));
    }
  }

  async function handleRefuse(id: string) {
    setActionLoading((l) => ({ ...l, [`${id}_refuse`]: true }));
    try {
      const res = await fetch(`/api/missions/${id}/refuse`, { method: "POST" });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? "Erreur");
        return;
      }
      setMissions((ms) => ms.map((m) => m.id === id ? { ...m, status: "REFUSED" } : m));
      toast("Mission refusée.", { icon: "👋" });
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setActionLoading((l) => ({ ...l, [`${id}_refuse`]: false }));
    }
  }

  async function handleDeliver(id: string) {
    if (!deliverUrl.trim()) { toast.error("Colle le lien de ton contenu"); return; }
    setActionLoading((l) => ({ ...l, [`${id}_deliver`]: true }));
    try {
      const res = await fetch(`/api/missions/${id}/deliver`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ contentUrl: deliverUrl }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? "Erreur");
        return;
      }
      setMissions((ms) => ms.map((m) => m.id === id ? { ...m, status: "DELIVERED", deliverableUrl: deliverUrl } : m));
      setDeliverModal(null);
      setDeliverUrl("");
      toast.success("Livraison envoyée ! La marque va vérifier ton contenu.");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setActionLoading((l) => ({ ...l, [`${id}_deliver`]: false }));
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Missions"
        subtitle="Collaborations sponsorisées proposées par les marques"
        icon={Briefcase}
        action={
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Actualiser
          </button>
        }
      />

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "En attente", value: missions.filter(m => m.status === "PENDING").length,   color: "text-amber-400" },
          { label: "Actives",    value: missions.filter(m => m.status === "ACCEPTED").length,  color: "text-indigo-400" },
          { label: "Livrées",    value: missions.filter(m => m.status === "DELIVERED").length, color: "text-emerald-400" },
          { label: "Payées",     value: missions.filter(m => m.status === "PAID").length,      color: "text-cyan-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-[14px] p-4 text-center">
            <p className={cn("text-2xl font-heading font-bold", color)}>{loading ? "—" : value}</p>
            <p className="text-xs text-slate-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs + list */}
      <div className="glass rounded-[20px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
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

        {loading ? (
          <div className="divide-y divide-white/5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="w-10 h-10 rounded-[10px] bg-slate-700/60 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-700/60 rounded w-48" />
                  <div className="h-2.5 bg-slate-700/40 rounded w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState emoji="📭" title="Aucune mission ici" description="Les propositions des marques apparaîtront ici" />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((m) => {
              const statusMeta = STATUS_META[m.status];
              const typeMeta   = TYPE_META[m.type];
              const StatusIcon = statusMeta.icon;
              const isOpen     = expanded === m.id;
              const isDone     = ["DELIVERED", "PAID", "REFUSED"].includes(m.status);

              return (
                <div key={m.id} className={cn("transition-colors", isOpen ? "bg-white/[0.03]" : "hover:bg-white/[0.02]")}>
                  <button
                    className="w-full flex items-center gap-4 px-6 py-4 text-left"
                    onClick={() => setExpanded(isOpen ? null : m.id)}
                  >
                    <div className="w-10 h-10 rounded-[10px] bg-slate-700/60 flex items-center justify-center flex-shrink-0 text-lg">
                      <Building2 size={18} className="text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-200">{m.brand}</span>
                        <span className="text-slate-700">·</span>
                        <span className="text-xs text-slate-500">{typeMeta.emoji} {typeMeta.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{m.title}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-bold text-emerald-400 tabular-nums hidden sm:block">{formatMAD(m.budget)}</span>
                      <Badge variant={statusMeta.variant}><StatusIcon size={10} />{statusMeta.label}</Badge>
                      {isOpen ? <ChevronUp size={14} className="text-slate-600" /> : <ChevronDown size={14} className="text-slate-600" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 space-y-5">
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
                          <div><p className="text-slate-600">Type</p><p className="text-slate-200 font-semibold">{typeMeta.emoji} {typeMeta.label}</p></div>
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
                              className="text-xs text-indigo-400 hover:text-indigo-300 truncate block">
                              {m.deliverableUrl}
                            </a>
                          </div>
                        </div>
                      )}

                      {!isDone && (
                        <div className="flex gap-3 pt-1">
                          {m.status === "PENDING" && (
                            <>
                              <Button variant="secondary" size="sm" className="flex-1"
                                loading={actionLoading[`${m.id}_refuse`]}
                                onClick={() => handleRefuse(m.id)}>
                                <XCircle size={14} /> Refuser
                              </Button>
                              <Button variant="primary" size="sm" className="flex-1"
                                loading={actionLoading[m.id]}
                                onClick={() => handleAccept(m.id)}>
                                <CheckCircle size={14} /> Accepter la mission
                              </Button>
                            </>
                          )}
                          {m.status === "ACCEPTED" && (
                            <Button variant="primary" size="sm" className="w-full sm:w-auto"
                              onClick={() => { setDeliverModal(m.id); setDeliverUrl(""); }}>
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
            <p className="text-slate-500 text-sm mb-6">Colle le lien public de ton contenu publié.</p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Lien du contenu</label>
                <input
                  type="url"
                  value={deliverUrl}
                  onChange={(e) => setDeliverUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/@moncompte/video/..."
                  className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[12px] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                />
              </div>
              <div className="glass-sm rounded-[12px] p-3 flex items-start gap-2.5">
                <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500">Assure-toi que le contenu est public et conforme au brief avant de soumettre.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setDeliverModal(null)}>Annuler</Button>
              <Button variant="primary" className="flex-1"
                loading={actionLoading[`${deliverModal}_deliver`]}
                onClick={() => handleDeliver(deliverModal)}>
                <Package size={14} /> Envoyer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
