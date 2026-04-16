"use client";

import { useState, useMemo } from "react";
import {
  Briefcase, Search, X, ChevronDown, ChevronUp,
  CheckCircle, Clock, Package, XCircle, DollarSign, TrendingUp,
} from "lucide-react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import PageHeader from "@/components/dashboard/page-header";
import EmptyState from "@/components/dashboard/empty-state";
import { cn, formatMAD } from "@/lib/utils";

type MissionStatus = "PENDING" | "ACCEPTED" | "DELIVERED" | "PAID" | "REFUSED";

type AdminMission = {
  id: string;
  brand: string;
  creator: string;
  title: string;
  type: string;
  budget: number;
  commission: number;
  status: MissionStatus;
  createdAt: string;
  deliveredAt?: string;
};

const MISSIONS: AdminMission[] = [
  { id: "m1",  brand: "Jumia Maroc",    creator: "yassine_create",  title: "Review Samsung Galaxy A35",     type: "VIDEO", budget: 1500, commission: 150,  status: "ACCEPTED",  createdAt: "15 Avr 2025" },
  { id: "m2",  brand: "Inwi",           creator: "sarabeauty",      title: "Post sponsorisé offre Ramadan", type: "POST",  budget: 800,  commission: 80,   status: "DELIVERED", createdAt: "12 Avr 2025", deliveredAt: "18 Avr 2025" },
  { id: "m3",  brand: "Marjane Market", creator: "techmaroc",       title: "UGC tutoriel application",      type: "UGC",   budget: 2000, commission: 200,  status: "PENDING",   createdAt: "14 Avr 2025" },
  { id: "m4",  brand: "Zara Beauty MA", creator: "fatima_food",     title: "Story haul printemps",          type: "STORY", budget: 600,  commission: 60,   status: "PAID",      createdAt: "8 Avr 2025",  deliveredAt: "14 Avr 2025" },
  { id: "m5",  brand: "Carrefour MA",   creator: "lifestyle_hind",  title: "Reel lifestyle été",            type: "POST",  budget: 700,  commission: 70,   status: "REFUSED",   createdAt: "28 Mar 2025" },
  { id: "m6",  brand: "Jumia Maroc",    creator: "sport_amine",     title: "Unboxing AirPods",              type: "VIDEO", budget: 1200, commission: 120,  status: "PAID",      createdAt: "20 Mar 2025", deliveredAt: "25 Mar 2025" },
  { id: "m7",  brand: "Inwi",           creator: "driss_gamer",     title: "Test gaming sur réseau 5G",     type: "VIDEO", budget: 950,  commission: 95,   status: "ACCEPTED",  createdAt: "10 Avr 2025" },
  { id: "m8",  brand: "Marjane Market", creator: "nora_alami",      title: "Haul épicerie semaine",         type: "STORY", budget: 400,  commission: 40,   status: "DELIVERED", createdAt: "5 Avr 2025",  deliveredAt: "10 Avr 2025" },
  { id: "m9",  brand: "Zara Beauty MA", creator: "rania_fassi",     title: "Tutoriel maquillage soirée",    type: "UGC",   budget: 1800, commission: 180,  status: "PENDING",   createdAt: "16 Avr 2025" },
  { id: "m10", brand: "Carrefour MA",   creator: "younes_comedy",   title: "Post food lifestyle",           type: "POST",  budget: 500,  commission: 50,   status: "PAID",      createdAt: "1 Mar 2025",  deliveredAt: "6 Mar 2025" },
];

const STATUS_META: Record<MissionStatus, { label: string; variant: "warning" | "primary" | "success" | "error" | "default"; icon: typeof Clock }> = {
  PENDING:   { label: "En attente", variant: "warning", icon: Clock },
  ACCEPTED:  { label: "Acceptée",   variant: "primary", icon: CheckCircle },
  DELIVERED: { label: "Livrée",     variant: "success", icon: Package },
  PAID:      { label: "Payée",      variant: "success", icon: CheckCircle },
  REFUSED:   { label: "Refusée",    variant: "error",   icon: XCircle },
};

const STATUS_TABS = ["Tous", "PENDING", "ACCEPTED", "DELIVERED", "PAID", "REFUSED"] as const;
type StatusTab = typeof STATUS_TABS[number];

export default function AdminMissionsContent() {
  const [search, setSearch]       = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("Tous");
  const [expanded, setExpanded]   = useState<string | null>(null);

  const filtered = useMemo(() => MISSIONS.filter((m) => {
    const q = search.toLowerCase();
    if (q && !m.brand.toLowerCase().includes(q) && !m.creator.toLowerCase().includes(q) && !m.title.toLowerCase().includes(q)) return false;
    if (statusTab !== "Tous" && m.status !== statusTab) return false;
    return true;
  }), [search, statusTab]);

  const totalCommission  = MISSIONS.filter(m => m.status === "PAID").reduce((a, m) => a + m.commission, 0);
  const pendingCommission= MISSIONS.filter(m => ["DELIVERED", "ACCEPTED"].includes(m.status)).reduce((a, m) => a + m.commission, 0);
  const totalVolume      = MISSIONS.reduce((a, m) => a + m.budget, 0);

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Missions"
        subtitle="Toutes les missions de la plateforme"
        icon={Briefcase}
      />

      {/* Commission summary */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: "Total missions",        value: MISSIONS.length,             color: "text-slate-300",   suffix: "" },
          { label: "Volume total",          value: formatMAD(totalVolume),      color: "text-indigo-400",  suffix: "" },
          { label: "Commissions encaissées",value: formatMAD(totalCommission),  color: "text-emerald-400", suffix: "" },
          { label: "Commissions en attente",value: formatMAD(pendingCommission),color: "text-amber-400",   suffix: "" },
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
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Marque, creator, mission..." className="w-full bg-slate-800/60 border border-white/8 rounded-[10px] pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all" />
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
      {filtered.length === 0 ? (
        <EmptyState emoji="📋" title="Aucune mission" description="Modifie les filtres" />
      ) : (
        <div className="glass rounded-[20px] overflow-hidden">
          {/* Header */}
          <div className="hidden lg:grid grid-cols-[1.5fr_1fr_1fr_80px_1fr_80px_80px] gap-4 px-6 py-3 border-b border-white/8 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Mission</span><span>Marque</span><span>Creator</span><span>Type</span><span>Budget / Commission</span><span>Statut</span><span />
          </div>
          <div className="divide-y divide-white/5">
            {filtered.map((m) => {
              const meta   = STATUS_META[m.status];
              const Icon   = meta.icon;
              const isOpen = expanded === m.id;
              return (
                <div key={m.id} className={cn("transition-colors", isOpen ? "bg-white/3" : "hover:bg-white/2")}>
                  <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr_80px_1fr_80px_80px] gap-4 items-center px-6 py-4">
                    <p className="text-sm font-medium text-slate-200 truncate">{m.title}</p>
                    <p className="text-xs text-slate-400 truncate">{m.brand}</p>
                    <p className="text-xs text-indigo-400">@{m.creator}</p>
                    <span className="text-xs text-slate-500">{m.type}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-200">{formatMAD(m.budget)}</p>
                      <p className="text-xs text-emerald-400">+{formatMAD(m.commission)} comm.</p>
                    </div>
                    <Badge variant={meta.variant}><Icon size={10} />{meta.label}</Badge>
                    <button onClick={() => setExpanded(isOpen ? null : m.id)} className="text-slate-600 hover:text-slate-300 flex items-center justify-center">
                      {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                  {isOpen && (
                    <div className="px-6 pb-4 grid sm:grid-cols-3 gap-3 text-xs text-slate-600">
                      <span>Créée le : <span className="text-slate-400">{m.createdAt}</span></span>
                      {m.deliveredAt && <span>Livrée le : <span className="text-slate-400">{m.deliveredAt}</span></span>}
                      <span>Commission nette : <span className="text-emerald-400 font-semibold">{formatMAD(m.commission)}</span></span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Footer totals */}
          <div className="px-6 py-3 border-t border-white/8 flex items-center justify-between text-xs text-slate-600">
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
