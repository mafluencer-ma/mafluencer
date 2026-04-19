"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Briefcase, Search, X, ChevronDown, ChevronUp,
  CheckCircle, Clock, Package, DollarSign, RefreshCw, AlertCircle,
} from "lucide-react";
import Badge from "@/components/ui/badge";
import PageHeader from "@/components/dashboard/page-header";
import EmptyState from "@/components/dashboard/empty-state";
import { cn, formatMAD } from "@/lib/utils";

type MissionStatus = "PENDING" | "ACCEPTED" | "DELIVERED" | "PAID";

type AdminMission = {
  id:          string;
  title:       string;
  brief:       string;
  budget:      number;
  commission:  number;
  type:        string;
  status:      MissionStatus;
  createdAt:   string;
  deliveryDate?: string | null;
  brand:    { name: string | null; email: string };
  creator:  { id: string; name: string | null };
  brandProfile?: { companyName: string } | null;
};

type Stats = {
  totalRevenue:    number;
  totalCommission: number;
};

const STATUS_META: Record<MissionStatus, { label: string; variant: "warning" | "primary" | "success" | "default"; icon: typeof Clock }> = {
  PENDING:   { label: "En attente", variant: "warning", icon: Clock },
  ACCEPTED:  { label: "Acceptée",   variant: "primary", icon: CheckCircle },
  DELIVERED: { label: "Livrée",     variant: "success", icon: Package },
  PAID:      { label: "Payée",      variant: "success", icon: CheckCircle },
};

const STATUS_TABS = ["Tous", "PENDING", "ACCEPTED", "DELIVERED", "PAID"] as const;
type StatusTab = typeof STATUS_TABS[number];

export default function AdminMissionsContent() {
  const [missions,   setMissions]   = useState<AdminMission[]>([]);
  const [stats,      setStats]      = useState<Stats | null>(null);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [search,     setSearch]     = useState("");
  const [statusTab,  setStatusTab]  = useState<StatusTab>("Tous");
  const [expanded,   setExpanded]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (statusTab !== "Tous") params.set("status", statusTab);

      const res  = await fetch(`/api/admin/missions?${params}`);
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json() as {
        missions: Array<{
          id: string; title: string; brief: string; budget: number;
          type: string; status: string; createdAt: string; deliveryDate?: string | null;
          commission: number;
          brand:   { name: string | null; email: string; brandProfile?: { companyName: string } | null };
          creator: { id: string; name: string | null };
        }>;
        stats:      Stats;
        pagination: { total: number };
      };

      setMissions(data.missions.map((m) => ({
        id:          m.id,
        title:       m.title,
        brief:       m.brief,
        budget:      m.budget,
        commission:  m.commission,
        type:        m.type,
        status:      m.status as MissionStatus,
        createdAt:   new Date(m.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "2-digit" }),
        deliveryDate: m.deliveryDate ? new Date(m.deliveryDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : null,
        brand:        { name: m.brand.name, email: m.brand.email },
        creator:      m.creator,
        brandProfile: m.brand.brandProfile,
      })));
      setStats(data.stats);
      setTotal(data.pagination.total);
    } catch (e) {
      setError("Impossible de charger les missions.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statusTab]);

  useEffect(() => { load(); }, [load]);

  const filtered = missions.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const brandName = m.brandProfile?.companyName ?? m.brand.name ?? m.brand.email;
    return (
      m.title.toLowerCase().includes(q) ||
      brandName.toLowerCase().includes(q) ||
      (m.creator.name ?? "").toLowerCase().includes(q)
    );
  });

  const totalCommission  = missions.filter(m => m.status === "PAID").reduce((a, m) => a + m.commission, 0);
  const pendingCommission = missions.filter(m => ["DELIVERED", "ACCEPTED"].includes(m.status)).reduce((a, m) => a + m.commission, 0);
  const totalVolume       = missions.reduce((a, m) => a + m.budget, 0);

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Missions"
        subtitle={loading ? "Chargement..." : `${total} missions au total`}
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

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-[14px] bg-red-500/10 border border-red-500/20">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Commission summary */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: "Total missions",         value: loading ? "…" : String(total),              color: "text-slate-300"   },
          { label: "Volume total",           value: loading ? "…" : formatMAD(totalVolume),     color: "text-indigo-400"  },
          { label: "Commissions encaissées", value: loading ? "…" : formatMAD(totalCommission), color: "text-emerald-400" },
          { label: "Commissions en attente", value: loading ? "…" : formatMAD(pendingCommission), color: "text-amber-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-[16px] p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={14} className={color} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
            <p className={cn("text-xl font-heading font-bold", color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass rounded-[16px] p-4 space-y-3">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Marque, creator, mission..."
              className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[10px] pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"><X size={13} /></button>}
          </div>
          <div className="flex gap-1 p-0.5 bg-slate-800/60 rounded-[10px] overflow-x-auto">
            {STATUS_TABS.map((t) => (
              <button key={t} onClick={() => setStatusTab(t)} className={cn(
                "px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all whitespace-nowrap",
                statusTab === t ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500 hover:text-slate-300"
              )}>
                {t === "Tous" ? "Tous" : STATUS_META[t as MissionStatus].label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-600"><span className="text-slate-300">{filtered.length}</span> mission{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Table */}
      {loading ? (
        <div className="glass rounded-[20px] overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-white/5 animate-pulse">
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-700/60 rounded w-48" />
                <div className="h-2.5 bg-slate-700/40 rounded w-64" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState emoji="📋" title="Aucune mission" description="Modifie les filtres" />
      ) : (
        <div className="glass rounded-[20px] overflow-hidden">
          {/* Header */}
          <div className="hidden lg:grid grid-cols-[1.5fr_1fr_1fr_80px_1fr_80px_40px] gap-4 px-6 py-3 border-b border-white/[0.06] text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Mission</span><span>Marque</span><span>Creator</span><span>Type</span><span>Budget / Commission</span><span>Statut</span><span />
          </div>
          <div className="divide-y divide-white/5">
            {filtered.map((m) => {
              const meta    = STATUS_META[m.status] ?? STATUS_META.PENDING;
              const Icon    = meta.icon;
              const isOpen  = expanded === m.id;
              const brand   = m.brandProfile?.companyName ?? m.brand.name ?? m.brand.email;
              return (
                <div key={m.id} className={cn("transition-colors", isOpen ? "bg-white/[0.02]" : "hover:bg-white/[0.01]")}>
                  <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr_80px_1fr_80px_40px] gap-4 items-center px-6 py-4">
                    <p className="text-sm font-medium text-slate-200 truncate">{m.title}</p>
                    <p className="text-xs text-slate-400 truncate">{brand}</p>
                    <p className="text-xs text-indigo-400">{m.creator.name ?? "—"}</p>
                    <span className="text-xs text-slate-500">{m.type}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-200">{formatMAD(m.budget)}</p>
                      <p className="text-xs text-emerald-400">+{formatMAD(m.commission)} comm.</p>
                    </div>
                    <Badge variant={meta.variant}><Icon size={10} className="inline mr-0.5" />{meta.label}</Badge>
                    <button onClick={() => setExpanded(isOpen ? null : m.id)} className="text-slate-600 hover:text-slate-300 flex items-center justify-center">
                      {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                  {isOpen && (
                    <div className="px-6 pb-4 grid sm:grid-cols-3 gap-3 text-xs text-slate-600 border-t border-white/[0.04] pt-3">
                      <span>Créée le : <span className="text-slate-400">{m.createdAt}</span></span>
                      {m.deliveryDate && <span>Livraison prévue : <span className="text-slate-400">{m.deliveryDate}</span></span>}
                      <span>Commission : <span className="text-emerald-400 font-semibold">{formatMAD(m.commission)}</span></span>
                      {m.brief && <div className="sm:col-span-3 mt-1"><span className="text-slate-500">Brief : </span>{m.brief.slice(0, 200)}{m.brief.length > 200 ? "…" : ""}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Footer totals */}
          <div className="px-6 py-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-600">
            <span>{filtered.length} missions affichées</span>
            <span>
              Volume filtré : <span className="text-slate-300 font-semibold">{formatMAD(filtered.reduce((a, m) => a + m.budget, 0))}</span>
              {" · "}
              Commissions : <span className="text-emerald-400 font-semibold">{formatMAD(filtered.reduce((a, m) => a + m.commission, 0))}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
