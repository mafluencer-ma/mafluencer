"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Wallet, Search, X, CheckCircle, XCircle, Clock,
  ArrowUpRight, ArrowDownLeft, AlertCircle, DollarSign,
  TrendingUp, RefreshCw,
} from "lucide-react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import PageHeader from "@/components/dashboard/page-header";
import EmptyState from "@/components/dashboard/empty-state";
import { cn, formatMAD } from "@/lib/utils";
import toast from "react-hot-toast";

type TxStatus = "PENDING" | "COMPLETED" | "FAILED";
type TxType   = "DEPOSIT" | "PAYOUT" | "COMMISSION" | "BOOST";

type Transaction = {
  id:            string;
  type:          TxType;
  amount:        number;
  currency:      string;
  status:        TxStatus;
  paymentMethod: string | null;
  createdAt:     string;
  fromUser:      { id: string; name: string | null; email: string; role: string } | null;
  toUser:        { id: string; name: string | null; email: string; role: string } | null;
};

type PStats = {
  pendingPayouts:      number;
  pendingPayoutAmount: number;
  totalDeposits:       number;
  totalPayouts:        number;
};

const STATUS_META: Record<TxStatus, { label: string; variant: "warning" | "success" | "error" }> = {
  PENDING:   { label: "En attente", variant: "warning" },
  COMPLETED: { label: "Complété",   variant: "success" },
  FAILED:    { label: "Échoué",     variant: "error"   },
};

const TYPE_META: Record<TxType, { label: string; icon: typeof ArrowUpRight; color: string; bg: string }> = {
  DEPOSIT:    { label: "Recharge",   icon: ArrowDownLeft, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  PAYOUT:     { label: "Retrait",    icon: ArrowUpRight,  color: "text-indigo-400",  bg: "bg-indigo-500/10"  },
  COMMISSION: { label: "Commission", icon: DollarSign,    color: "text-pink-400",    bg: "bg-pink-500/10"    },
  BOOST:      { label: "Boost",      icon: TrendingUp,    color: "text-amber-400",   bg: "bg-amber-500/10"   },
};

const TABS = ["Tous", "En attente", "Complétés", "Échoués"] as const;
type Tab = typeof TABS[number];

export default function AdminPaymentsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pStats,       setPStats]       = useState<PStats | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [search,       setSearch]       = useState("");
  const [tab,          setTab]          = useState<Tab>("Tous");
  const [rejectModal,  setRejectModal]  = useState<string | null>(null);
  const [rejectNote,   setRejectNote]   = useState("");
  const [loadingId,    setLoadingId]    = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (tab === "En attente")  params.set("status", "PENDING");
      if (tab === "Complétés")   params.set("status", "COMPLETED");
      if (tab === "Échoués")     params.set("status", "FAILED");

      const res  = await fetch(`/api/admin/payments?${params}`);
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json() as { transactions: Transaction[]; stats: PStats };
      setTransactions(data.transactions);
      setPStats(data.stats);
    } catch (e) {
      setError("Impossible de charger les transactions.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const filtered = transactions.filter((t) => {
    if (!search) return true;
    const q    = search.toLowerCase();
    const name = t.fromUser?.name ?? t.fromUser?.email ?? t.toUser?.name ?? t.toUser?.email ?? "";
    return name.toLowerCase().includes(q) || (t.paymentMethod ?? "").toLowerCase().includes(q);
  });

  async function markPaid(id: string) {
    setLoadingId(id);
    try {
      const res  = await fetch(`/api/admin/payments/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "PAID" }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erreur"); return; }
      setTransactions((ts) => ts.map((t) => t.id === id ? { ...t, status: "COMPLETED" } : t));
      setPStats((s) => s ? { ...s, pendingPayouts: s.pendingPayouts - 1 } : s);
      toast.success("Retrait marqué comme payé ✓");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoadingId(null);
    }
  }

  async function rejectPayment(id: string) {
    setLoadingId(id);
    try {
      const res  = await fetch(`/api/admin/payments/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "REJECTED", note: rejectNote || "Refusé par admin" }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erreur"); return; }
      setTransactions((ts) => ts.map((t) => t.id === id ? { ...t, status: "FAILED" } : t));
      setPStats((s) => s ? { ...s, pendingPayouts: s.pendingPayouts - 1 } : s);
      setRejectModal(null);
      setRejectNote("");
      toast("Retrait rejeté.", { icon: "↩️" });
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Paiements"
        subtitle="Gestion des retraits creators et recharges brands"
        icon={Wallet}
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

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Retraits en attente",  value: loading ? "…" : String(pStats?.pendingPayouts ?? 0),         sub: pStats ? formatMAD(pStats.pendingPayoutAmount) : "—",    color: "text-amber-400",   icon: Clock         },
          { label: "Total versé creators", value: loading ? "…" : formatMAD(pStats?.totalPayouts   ?? 0),      sub: "Retraits validés",                                      color: "text-indigo-400",  icon: ArrowUpRight  },
          { label: "Dépôts brands",        value: loading ? "…" : formatMAD(pStats?.totalDeposits  ?? 0),      sub: "Soldes rechargés",                                      color: "text-emerald-400", icon: ArrowDownLeft },
          { label: "Total transactions",   value: loading ? "…" : String(transactions.length),                 sub: "Sur la période",                                        color: "text-pink-400",    icon: TrendingUp    },
        ].map(({ label, value, sub, color, icon: Icon }) => (
          <div key={label} className="glass rounded-[16px] p-5">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={color} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
            <p className={cn("text-xl font-heading font-bold", color)}>{value}</p>
            <p className="text-xs text-slate-700 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Pending alert */}
      {(pStats?.pendingPayouts ?? 0) > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/[0.08] border border-amber-500/20 rounded-[14px]">
          <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
          <p className="text-sm text-slate-300 flex-1">
            <span className="font-semibold text-amber-400">{pStats?.pendingPayouts} demande{(pStats?.pendingPayouts ?? 0) > 1 ? "s" : ""} de retrait</span> pour <span className="text-amber-400 font-semibold">{formatMAD(pStats?.pendingPayoutAmount ?? 0)}</span> en attente.
          </p>
          <button onClick={() => setTab("En attente")} className="text-xs text-amber-400 hover:text-amber-300 font-medium whitespace-nowrap">
            Traiter →
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="glass rounded-[16px] p-4 space-y-3">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Creator, marque, méthode..."
              className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[10px] pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"><X size={13} /></button>}
          </div>
          <div className="flex gap-1 p-0.5 bg-slate-800/60 rounded-[10px]">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={cn(
                "px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all whitespace-nowrap",
                tab === t ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500 hover:text-slate-300"
              )}>
                {t}
                {t === "En attente" && (pStats?.pendingPayouts ?? 0) > 0 && (
                  <span className="ml-1 px-1 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px]">{pStats?.pendingPayouts}</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-600"><span className="text-slate-300">{filtered.length}</span> transaction{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Table */}
      {loading ? (
        <div className="glass rounded-[20px] overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-white/5 animate-pulse">
              <div className="w-9 h-9 rounded-[8px] bg-slate-700/60 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-700/60 rounded w-40" />
                <div className="h-2.5 bg-slate-700/40 rounded w-56" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState emoji="💸" title="Aucune transaction" description="Modifie les filtres" />
      ) : (
        <div className="glass rounded-[20px] overflow-hidden">
          <div className="hidden lg:grid grid-cols-[40px_1.5fr_1fr_1fr_80px_1fr_1fr_140px] gap-4 px-6 py-3 border-b border-white/[0.06] text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span /><span>Utilisateur</span><span>Type</span><span>Méthode</span><span>Montant</span><span>Statut</span><span>Date</span><span>Actions</span>
          </div>
          <div className="divide-y divide-white/5">
            {filtered.map((t) => {
              const typeMeta   = TYPE_META[t.type] ?? TYPE_META.DEPOSIT;
              const statusMeta = STATUS_META[t.status];
              const TIcon      = typeMeta.icon;
              const isPending  = t.status === "PENDING";
              const user       = t.fromUser ?? t.toUser;
              return (
                <div key={t.id} className="grid grid-cols-1 lg:grid-cols-[40px_1.5fr_1fr_1fr_80px_1fr_1fr_140px] gap-4 items-center px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className={cn("w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0", typeMeta.bg)}>
                    <TIcon size={14} className={typeMeta.color} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{user?.name ?? user?.email ?? "—"}</p>
                    <p className="text-xs text-slate-600">{user?.role ?? "—"} · {user?.email}</p>
                  </div>
                  <p className="text-xs text-slate-500">{typeMeta.label}</p>
                  <p className="text-xs text-slate-500 truncate">{t.paymentMethod ?? "—"}</p>
                  <p className="text-sm font-bold text-slate-200 tabular-nums">{formatMAD(t.amount)}</p>
                  <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                  <p className="text-xs text-slate-500">
                    {new Date(t.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "2-digit" })}
                  </p>
                  <div className="flex gap-2">
                    {isPending && t.type === "PAYOUT" && (
                      <>
                        <Button variant="primary" size="sm" loading={loadingId === t.id} onClick={() => markPaid(t.id)}>
                          <CheckCircle size={12} /> Payer
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => { setRejectModal(t.id); setRejectNote(""); }}>
                          <XCircle size={12} />
                        </Button>
                      </>
                    )}
                    {isPending && t.type === "DEPOSIT" && (
                      <Button variant="primary" size="sm" loading={loadingId === t.id} onClick={() => markPaid(t.id)}>
                        <CheckCircle size={12} /> Valider
                      </Button>
                    )}
                    {!isPending && <span className="text-xs text-slate-700 italic">—</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-6 py-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-600">
            <span>{filtered.length} transactions</span>
            <span>Total : <span className="text-slate-300 font-semibold">{formatMAD(filtered.reduce((a, t) => a + t.amount, 0))}</span></span>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRejectModal(null)} />
          <div className="relative glass rounded-[24px] p-7 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-heading font-bold text-slate-100 mb-1">Rejeter la demande</h3>
            <p className="text-slate-500 text-sm mb-5">Ajoute une raison (visible par le creator).</p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              placeholder="Ex: IBAN incorrect, pièce justificative manquante..."
              className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[12px] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-500/40 transition-all resize-none mb-4"
            />
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setRejectModal(null)}>Annuler</Button>
              <Button variant="danger" className="flex-1" loading={loadingId === rejectModal} onClick={() => rejectPayment(rejectModal)}>
                <XCircle size={13} /> Rejeter
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
