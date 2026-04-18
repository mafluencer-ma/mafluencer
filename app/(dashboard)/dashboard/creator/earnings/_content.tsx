"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Wallet, ArrowUpRight, ArrowDownLeft, Clock,
  CheckCircle, XCircle, AlertCircle, TrendingUp, CreditCard, RefreshCw,
} from "lucide-react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/dashboard/empty-state";
import PageHeader from "@/components/dashboard/page-header";
import { cn, formatMAD } from "@/lib/utils";
import toast from "react-hot-toast";

type Transaction = {
  id:            string;
  type:          string;
  amount:        number;
  currency:      string;
  status:        string;
  paymentMethod: string | null;
  createdAt:     string;
  fromUserId:    string | null;
  toUserId:      string | null;
};

const TYPE_META: Record<string, { icon: typeof ArrowUpRight; color: string; bg: string; label: string }> = {
  DEPOSIT:    { icon: ArrowDownLeft, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Mission" },
  PAYOUT:     { icon: ArrowUpRight,  color: "text-blue-400",    bg: "bg-blue-500/10",    label: "Retrait" },
  COMMISSION: { icon: AlertCircle,   color: "text-slate-400",   bg: "bg-slate-500/10",   label: "Commission" },
};

const STATUS_META: Record<string, { label: string; icon: typeof CheckCircle; variant: "success" | "warning" | "error" | "default" }> = {
  COMPLETED: { label: "Complété",   icon: CheckCircle, variant: "success" },
  PENDING:   { label: "En attente", icon: Clock,       variant: "warning" },
  FAILED:    { label: "Échoué",     icon: XCircle,     variant: "error" },
};

const TABS = ["Toutes", "Dépôts", "Retraits"] as const;
type Tab = typeof TABS[number];

export default function EarningsContent() {
  const [tab,               setTab]               = useState<Tab>("Toutes");
  const [transactions,      setTransactions]      = useState<Transaction[]>([]);
  const [balance,           setBalance]           = useState(0);
  const [loading,           setLoading]           = useState(true);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount,    setWithdrawAmount]    = useState("");
  const [withdrawing,       setWithdrawing]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/me/transactions?limit=50");
      const data = res.ok ? await res.json() : null;
      setTransactions(data?.transactions ?? []);
      setBalance(data?.balance ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = transactions.filter((t) => {
    if (tab === "Dépôts")  return t.type === "DEPOSIT";
    if (tab === "Retraits") return t.type === "PAYOUT";
    return true;
  });

  const totalEarned    = transactions.filter((t) => t.type === "DEPOSIT"  && t.status === "COMPLETED").reduce((a, t) => a + t.amount, 0);
  const totalWithdrawn = transactions.filter((t) => t.type === "PAYOUT"   && t.status === "COMPLETED").reduce((a, t) => a + t.amount, 0);
  const pendingPayout  = transactions.filter((t) => t.type === "PAYOUT"   && t.status === "PENDING").reduce((a, t) => a + t.amount, 0);

  async function handleWithdraw() {
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) { toast.error("Montant invalide"); return; }
    if (amount > balance)       { toast.error("Solde insuffisant"); return; }
    if (amount < 200)           { toast.error("Retrait minimum : 200 MAD"); return; }
    setWithdrawing(true);
    try {
      const res = await fetch("/api/payments/withdraw", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ amount, bankAccount: "CIH Bank" }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erreur"); return; }
      toast.success(`Retrait de ${formatMAD(amount)} initié ! Traitement sous 48h.`);
      setWithdrawModalOpen(false);
      setWithdrawAmount("");
      load();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setWithdrawing(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Revenus"
        subtitle="Solde, historique des paiements et retraits"
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

      {/* Balance cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1 glass rounded-[20px] p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 to-cyan-500/5" />
          <div className="relative z-10">
            <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
              <Wallet size={12} /> Solde disponible
            </p>
            {loading ? (
              <div className="h-10 bg-slate-700/60 rounded w-32 animate-pulse mb-3" />
            ) : (
              <p className="text-4xl font-heading font-bold text-slate-100 mb-1">
                {balance.toLocaleString("fr-MA")}
                <span className="text-lg text-slate-500 ml-1">MAD</span>
              </p>
            )}
            {pendingPayout > 0 && (
              <p className="text-xs text-amber-400 mb-3">
                + {formatMAD(pendingPayout)} en attente
              </p>
            )}
            <Button variant="primary" className="mt-3 w-full" onClick={() => setWithdrawModalOpen(true)}>
              <ArrowUpRight size={15} /> Retirer des fonds
            </Button>
          </div>
        </div>

        {[
          { label: "Total gagné",  value: totalEarned,    icon: TrendingUp, color: "text-indigo-400", sub: "Toutes missions confondues" },
          { label: "Total retiré", value: totalWithdrawn, icon: CreditCard, color: "text-blue-400",   sub: "Vers ton compte bancaire" },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="glass rounded-[20px] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Icon size={15} className={color} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
            {loading ? (
              <div className="h-8 bg-slate-700/60 rounded w-28 animate-pulse" />
            ) : (
              <p className="text-2xl font-heading font-bold text-slate-100">
                {value.toLocaleString("fr-MA")} <span className="text-sm text-slate-500">MAD</span>
              </p>
            )}
            <p className="text-xs text-slate-700 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="glass rounded-[20px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <p className="text-sm font-semibold text-slate-300">Historique des transactions</p>
          <div className="flex gap-1 p-0.5 bg-slate-800/60 rounded-[10px]">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={cn(
                  "px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all",
                  tab === t ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500 hover:text-slate-300"
                )}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="divide-y divide-white/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="w-10 h-10 rounded-[10px] bg-slate-700/60 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-700/60 rounded w-32" />
                  <div className="h-2.5 bg-slate-700/40 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState emoji="💸" title="Aucune transaction" description="Les transactions apparaîtront ici" />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((t) => {
              const typeMeta   = TYPE_META[t.type]   ?? TYPE_META.DEPOSIT;
              const statusMeta = STATUS_META[t.status] ?? STATUS_META.COMPLETED;
              const Icon       = typeMeta.icon;
              const StatusIcon = statusMeta.icon;
              const isIncoming = t.toUserId !== null;

              return (
                <div key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors">
                  <div className={cn("w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0", typeMeta.bg)}>
                    <Icon size={16} className={typeMeta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{typeMeta.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-600">
                        {new Date(t.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "2-digit" })}
                      </span>
                      {t.paymentMethod && (
                        <>
                          <span className="text-slate-700">·</span>
                          <span className="text-xs text-slate-600 truncate">{t.paymentMethod}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={statusMeta.variant}>
                      <StatusIcon size={10} />
                      {statusMeta.label}
                    </Badge>
                    <span className={cn(
                      "text-sm font-bold tabular-nums",
                      isIncoming && t.type !== "COMMISSION" ? "text-emerald-400" : "text-slate-400"
                    )}>
                      {isIncoming && t.type !== "COMMISSION" ? "+" : "−"}{t.amount.toLocaleString("fr-MA")} MAD
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Withdraw modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setWithdrawModalOpen(false)} />
          <div className="relative glass rounded-[24px] p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-heading font-bold text-slate-100 mb-1">Retirer des fonds</h3>
            <p className="text-slate-500 text-sm mb-6">
              Solde disponible : <span className="text-slate-200 font-semibold">{formatMAD(balance)}</span>
            </p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Montant (min. 200 MAD)</label>
                <div className="relative">
                  <input
                    type="number" value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="500" min={200} max={balance}
                    className="w-full bg-slate-800/60 border border-white/[0.08] rounded-[12px] pl-4 pr-14 py-3 text-base text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">MAD</span>
                </div>
              </div>
              <div className="glass-sm rounded-[12px] p-4 space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Délai</span><span className="text-slate-300">1–2 jours ouvrables</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Frais</span><span className="text-emerald-400">Gratuit</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setWithdrawModalOpen(false)}>Annuler</Button>
              <Button variant="primary" className="flex-1" loading={withdrawing} onClick={handleWithdraw}>
                Confirmer le retrait
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
